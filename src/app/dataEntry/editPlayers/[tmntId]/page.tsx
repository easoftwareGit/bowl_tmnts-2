"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import PlayersEntryForm from "../../playersForm/playersForm";
import {
  brktType,  
  tmntActions,
  tmntFullType,
  tmntFormDataType,
} from "@/lib/types/types";
import {  
  divEntryHdcpColName,
  entryFeeColName,
  entryNumBrktsColName,
  feeColNameEnd,
  playerEntryData,
  timeStampColName,
} from "../../playersForm/createColumns";
import { getBrktOrElimName, getPotName } from "@/lib/getName";
import { OverlayTrigger, Tooltip, Tab, Tabs } from "react-bootstrap";
import { BracketList } from "@/components/brackets/bracketListClass";
import usePreventUnload from "@/components/preventUnload/preventUnload";
import WaitModal from "@/components/modal/waitModal";
import { defaultBrktGames, defaultPlayersPerMatch } from "@/lib/db/initVals";
import {
  errInfoType,
  getDivsPotsBrktsElimsCountErrMsg,
  getDivsPotsBrktsElimsCounts,
} from "../../playersForm/rowInfo";
import {
  getTmntFullDataError,
  getTmntFullDataLoadStatus,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";

// run tmnt:
// http://localhost:3000/dataEntry/runTmnt/tmt_d237a388a8fc4641a2e37233f1d6bebd

// edit bowlers:
// http://localhost:3000/dataEntry/editPlayers/tmt_d237a388a8fc4641a2e37233f1d6bebd

/**
 * builds brkts list map
 *
 * @param {brktType[]} brkts - array of brkts
 * @param {typeof playerEntryData[]} rows - array of playerEntryData, current data entry rows
 * @param {Record<string, BracketList>} prevAllBrktsList - prior brkts list
 * @returns {Record<string, BracketList>} - brkts list map
 */
const buildBrktList = (
  brkts: brktType[],
  rows: (typeof playerEntryData)[] = [],
  prevAllBrktsList?: Record<string, BracketList>
): Record<string, BracketList> => {
  const bList: Record<string, BracketList> = {};
  brkts.forEach((brkt) => {
    const prev = prevAllBrktsList?.[brkt.id]; // get prev brkt list for brkt if have it
    const brktList = new BracketList(
      brkt.id,
      defaultPlayersPerMatch,
      defaultBrktGames,
      prev?.brackets
    );
    brktList.calcTotalBrkts(rows);
    bList[brkt.id] = brktList;
  });
  return bList;
};

/**
 * populates rows for data entry grid
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {typeof playerEntryData[]} - array of playerEntryData
 */
const populateRows = (tmntFullData: tmntFullType) => {
  const pRows: (typeof playerEntryData)[] = [];
  // populate all players
  tmntFullData?.players?.forEach((player) => {
    const pRow: typeof playerEntryData = { ...playerEntryData };
    pRow.id = player.id;
    pRow.player_id = player.id;
    pRow.first_name = player.first_name;
    pRow.last_name = player.last_name;
    pRow.average = player.average;
    pRow.lane = player.lane;
    pRow.position = player.position;
    pRow.lanePos = player.lane + "-" + player.position;
    pRows.push(pRow);
  });
  // populate division fee(s) and hdcp(s)
  tmntFullData?.divEntries?.forEach((divEntry) => {
    // find player row
    const pRow = pRows.find(
      (row) => row.player_id === divEntry.player_id
    ) as typeof playerEntryData;
    // creates columns if not yet created or populates columns
    if (pRow) {
      pRow[entryFeeColName(divEntry.div_id)] = divEntry.fee + ""; // as a string
      pRow[divEntryHdcpColName(divEntry.div_id)] = divEntry.hdcp;
    }
  });
  // populate pot fees
  tmntFullData?.potEntries?.forEach((potEntry) => {
    const pRow = pRows.find(
      (row) => row.player_id === potEntry.player_id
    ) as typeof playerEntryData;
    if (pRow) {
      pRow[entryFeeColName(potEntry.pot_id)] = potEntry.fee;
    }
  });
  // populate bracket entries & fee(s)
  tmntFullData?.brktEntries?.forEach((brktEntry) => {
    const pRow = pRows.find(
      (row) => row.player_id === brktEntry.player_id
    ) as typeof playerEntryData;
    if (pRow) {
      pRow[entryNumBrktsColName(brktEntry.brkt_id)] = brktEntry.num_brackets;
      pRow[entryFeeColName(brktEntry.brkt_id)] = brktEntry.fee;
      pRow[timeStampColName(brktEntry.brkt_id)] = brktEntry.time_stamp;
    }
  });
  // populate elimination fee(s)
  tmntFullData?.elimEntries?.forEach((elimEntry) => {
    const pRow = pRows.find(
      (row) => row.player_id === elimEntry.player_id
    ) as typeof playerEntryData;
    if (pRow) {
      pRow[entryFeeColName(elimEntry.elim_id)] = elimEntry.fee;
    }
  });
  pRows.forEach((row) => {
    let feeTotal = 0;
    Object.keys(row).forEach((key) => {
      if (key.endsWith(feeColNameEnd)) {
        feeTotal += Number(row[key]);
      }
    });
    row.feeTotal = feeTotal;
  });
  return pRows;
};

export default function EditPlayersPage() {

  const [rows, setRows] = useState<(typeof playerEntryData)[]>([]);
  const [entriesCount, setEntriesCount] = useState<Record<string, number>>({});
  const [priorCount, setPriorCount] = useState<Record<string, number>>({});
  const [allBrktsList, setAllBrktsList] = useState<Record<string, BracketList>>(
    {}
  );
  const [gotRefunds, setGotRefunds] = useState<Record<string, boolean>>({});

  // get original rows for change detection (useRef -> no re-renders)
  const origRowsRef = useRef<(typeof playerEntryData)[]>([]);
  // so only initialize state once when data first becomes available
  const initializedRef = useRef(false);

  // redux selectors
  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
  const tmntError = useSelector(getTmntFullDataError);
  const stateTmntFullData = useSelector(
    (state: RootState) => state.tmntFullData.tmntFullData
  );
  const tmntFormData: tmntFormDataType = {
    tmntFullData: stateTmntFullData,
    tmntAction: tmntActions.Run,
  };

  const initValues = useMemo(() => {
    const entriesCountInit: Record<string, number> = {};
    const priorCountInit: Record<string, number> = {};
    if (!stateTmntFullData) {
      return {
        entriesCountInit,
        priorCountInit,
        currRows: [] as (typeof playerEntryData)[],
        allBrktsListInit: {} as Record<string, BracketList>,
        gotRefundsInit: {} as Record<string, boolean>,
      };
    }

    // init counts
    stateTmntFullData.divs.forEach((div) => {
      entriesCountInit[entryFeeColName(div.id)] = 0;
    });
    stateTmntFullData.pots.forEach((pot) => {
      entriesCountInit[entryFeeColName(pot.id)] = 0;
    });
    stateTmntFullData.brkts.forEach((brkt) => {
      const name = entryNumBrktsColName(brkt.id);
      entriesCountInit[name] = 0;
      priorCountInit[name] = -1;
    });
    stateTmntFullData.elims.forEach((elim) => {
      entriesCountInit[entryFeeColName(elim.id)] = 0;
    });

    // build rows - most of the work
    const curRows = populateRows(stateTmntFullData);
    /// build brkt lists
    const allBrktsListInit = buildBrktList(stateTmntFullData.brkts, curRows);
    // got refunds for initial stte
    const gotRefundsInit: Record<string, boolean> = {};
    Object.keys(allBrktsListInit).forEach((id) => {
      gotRefundsInit[id] = allBrktsListInit[id].playersWithRefunds;
    });

    return {
      entriesCountInit,
      priorCountInit,
      currRows: curRows,
      allBrktsListInit,
      gotRefundsInit,
    };
  }, [stateTmntFullData]);

  // write init values into state "once", when tmnt data finishes loading
  // guard with initializedRef to avoid overwriting user edits if redux data updates later
  useEffect(() => {
    if (tmntLoadStatus !== "succeeded") return;
    if (initializedRef.current) return; // run only once

    const {
      entriesCountInit,
      priorCountInit,
      currRows,
      allBrktsListInit,
      gotRefundsInit,
    } = initValues;
    setEntriesCount(entriesCountInit);
    setPriorCount(priorCountInit);
    setRows(currRows);
    origRowsRef.current = currRows;
    setAllBrktsList(allBrktsListInit);
    setGotRefunds(gotRefundsInit);

    initializedRef.current = true;
  }, [tmntLoadStatus, initValues]);

  const defaultTabKey = "divs";
  const [tabKey, setTabKey] = useState(defaultTabKey);

  // when grid data is changed
  useEffect(() => {
    if (Object.keys(entriesCount).length === 0) return;

    // Copy counts for updates
    const updatedCount = { ...entriesCount };
    const updatedPriorCount = { ...priorCount };

    // Compute updated bracket lists based on current rows
    const updatedAllBrktsList = buildBrktList(
      stateTmntFullData.brkts,
      rows,
      allBrktsList
    );

    // get gotRefunds from new lists
    const updatedGotRefunds: Record<string, boolean> = {};
    Object.keys(updatedAllBrktsList).forEach((id) => {
      updatedGotRefunds[id] = updatedAllBrktsList[id].playersWithRefunds;
    });

    // recalculate counts
    Object.keys(entriesCount).forEach((key) => {
      if (key.endsWith(feeColNameEnd)) {
        // fee count is number of non-zero rows
        const colCount = rows.filter(
          (row) => typeof !isNaN(row[key]) && Number(row[key]) > 0
        ).length;
        updatedCount[key] = colCount;
      } else {
        // num brackts count is total of all rows
        updatedPriorCount[key] = updatedCount[key];
        const colTotal = rows.reduce(
          (total, row) =>
            total + (isNaN(Number(row[key])) ? 0 : Number(row[key])),
          0
        );
        updatedCount[key] = colTotal;
      }
    });

    setAllBrktsList(updatedAllBrktsList);
    setEntriesCount(updatedCount);
    setPriorCount(updatedPriorCount);
    setGotRefunds(updatedGotRefunds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]); // DO NOT INCLUDE entriesCount or priorCount in array

  const dataWasChanged = useCallback(() => {
    const orig = origRowsRef.current || [];
    if (rows.length !== orig.length) return true;
    for (let i = 0; i < rows.length; i++) {
      if (JSON.stringify(rows[i]) !== JSON.stringify(orig[i])) return true;
    }
    return false;
  }, [rows]);  

  usePreventUnload(dataWasChanged);

  const DivCounts: React.FC = ({}) => {
    return (
      <>
        <div
          className="container"
          id="divCounts"
          style={{ float: "left", width: 400 }}
        >
          <div className="row g-2">
            <div className="col-10">
              <label htmlFor="inputDivNameCount" className="form-label">
                Name
              </label>
            </div>
            <div className="col-2 text-center">
              <label htmlFor="inputDivEntryCount" className="form-label">
                Entries
              </label>
            </div>
          </div>
          {/* {playerFormTmnt?.curData?.divs.map((div) => ( */}
          {tmntFormData?.tmntFullData?.divs.map((div) => (
            <div className="row g-2" key={div.id}>
              <div className="col-10">
                <input
                  type="text"
                  className="form-control"
                  id={`inputDivNameCount${div.id}`}
                  value={div.div_name}
                  disabled
                />
              </div>
              <div className="col-2">
                <input
                  type="text"
                  className="form-control"
                  id={`inputDivEntryCount${div.id}`}
                  value={entriesCount[entryFeeColName(div.id)]}
                  disabled
                  style={{ textAlign: "center" }}
                />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const PotCounts: React.FC = ({}) => {
    return (
      <>
        <div
          className="container"
          id="potCounts"
          style={{ float: "left", width: 400 }}
        >
          <div className="row g-2">
            <div className="col-10">
              <label htmlFor="inputPotNameCount" className="form-label">
                Name
              </label>
            </div>
            <div className="col-2 text-center">
              <label htmlFor="inputPotEntryCount" className="form-label">
                Entries
              </label>
            </div>
          </div>
          {/* {playerFormTmnt?.curData?.pots.map((pot) => ( */}
          {tmntFormData?.tmntFullData?.pots.map((pot) => (
            <div className="row g-2" key={pot.id}>
              <div className="col-10">
                <input
                  type="text"
                  className="form-control"
                  id={`inputPotNameCount${pot.id}`}
                  // value={pot.pot_type}
                  value={getPotName(pot, tmntFormData?.tmntFullData?.divs)}
                  disabled
                />
              </div>
              <div className="col-2">
                <input
                  type="text"
                  className="form-control"
                  id={`inputPotEntryCount${pot.id}`}
                  value={entriesCount[entryFeeColName(pot.id)]}
                  disabled
                  style={{ textAlign: "center" }}
                />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const BrktCounts: React.FC = ({}) => {
    const renderToolTip = (props: any) => (
      <Tooltip id="button-tooltip" {...props}>
        Some player(s) have refunds. Adding players to brackets may not fill all
        brackets but increase number of brackets needed.
      </Tooltip>
    );

    return (
      <>
        <div
          className="container"
          id="brktCounts"
          style={{ float: "left", width: 900 }}
        >
          <div className="row g-2">
            <div className="col-4">
              <label className="form-label">Name</label>
            </div>
            <div className="col-1 text-center">
              <label className="form-label">Players</label>
            </div>
            <div className="col-1 text-center">
              <label className="form-label">Full</label>
            </div>
            <div className="col-1 text-center">
              <label className="form-label">1 Bye</label>
            </div>
            <div className="col-1 text-center">
              <label className="form-label">Total</label>
            </div>
          </div>
          {tmntFormData?.tmntFullData?.brkts.map((brkt) => (
            <div key={brkt.id}>
              <div className="row g-2">
                <div className="col-4">
                  <div className="d-flex align-items-center">
                    <input
                      type="text"
                      className="form-control"
                      id={`inputBrktNameCount${brkt.id}`}
                      value={getBrktOrElimName(
                        brkt,
                        tmntFormData?.tmntFullData?.divs
                      )}
                      disabled
                    />
                    {gotRefunds[brkt.id] && (
                      <span className="ms-1 d-inline-flex align-items-center">
                        <OverlayTrigger
                          placement="right"
                          delay={{ show: 250, hide: 1000 }}
                          overlay={renderToolTip}
                        >
                          <span className="popup-help">&nbsp;*&nbsp;</span>
                        </OverlayTrigger>
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-1">
                  <input
                    type="text"
                    className="form-control"
                    id={`inputPlayersCount${brkt.id}`}
                    value={allBrktsList[brkt.id]?.brktEntries.length ?? 0}
                    disabled
                    style={{ textAlign: "center" }}
                  />
                </div>
                <div className="col-1">
                  <input
                    type="text"
                    className="form-control"
                    id={`inputFullCount${brkt.id}`}
                    value={allBrktsList[brkt.id]?.fullCount ?? 0}
                    disabled
                    style={{ textAlign: "center" }}
                  />
                </div>
                <div className="col-1">
                  <input
                    type="text"
                    className="form-control"
                    id={`inputOneByeCount${brkt.id}`}
                    value={allBrktsList[brkt.id]?.oneByeCount ?? 0}
                    disabled
                    style={{ textAlign: "center" }}
                  />
                </div>
                <div className="col-1">
                  <input
                    type="text"
                    className="form-control"
                    id={`inputTotalCount${brkt.id}`}
                    value={
                      (allBrktsList[brkt.id]?.fullCount ?? 0) +
                      (allBrktsList[brkt.id]?.oneByeCount ?? 0)
                    }
                    disabled
                    style={{ textAlign: "center" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const ElimCounts: React.FC = ({}) => {
    return (
      <>
        <div
          className="container"
          id="elimCounts"
          style={{ float: "left", width: 400 }}
        >
          <div className="row g-2">
            <div className="col-10">
              <label htmlFor="inputElimNameCount" className="form-label">
                Name
              </label>
            </div>
            <div className="col-2 text-center">
              <label htmlFor="inputElimEntryCount" className="form-label">
                Entries
              </label>
            </div>
          </div>
          {/* {playerFormTmnt?.curData?.elims.map((elim) => ( */}
          {tmntFormData?.tmntFullData?.elims.map((elim) => (
            <div className="row g-2" key={elim.id}>
              <div className="col-10">
                <input
                  type="text"
                  className="form-control"
                  id={`inputElimNameCount${elim.id}`}
                  value={getBrktOrElimName(
                    elim,
                    tmntFormData?.tmntFullData?.divs
                  )}
                  disabled
                />
              </div>
              <div className="col-2">
                <input
                  type="text"
                  className="form-control"
                  id={`inputElimEntryCount${elim.id}`}
                  value={entriesCount[entryFeeColName(elim.id)]}
                  disabled
                  style={{ textAlign: "center" }}
                />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  /**
   * find and return any count errors for divisions, pots, brackets, and eliminations.
   * must have at last 1 in each division, pot, and elimination.
   * must have (defaultBrktPlayers - 1) players in each bracket.
   *
   * @returns {errInfoType} - returns an object with id and msg properties.
   */
  const findCountError = (): errInfoType => {
    const errInfo: errInfoType = {
      id: "",
      msg: "",
    };

    const counts = getDivsPotsBrktsElimsCounts(entriesCount, allBrktsList);
    const errMsg = getDivsPotsBrktsElimsCountErrMsg(
      counts,
      tmntFormData?.tmntFullData
    );
    if (errMsg) {
      errInfo.id = "counts";
      errInfo.msg = errMsg;
    }

    return errInfo;
  };

  const handleTabSelect = (key: string | null) => {
    if (key) {
      setTabKey(key);
    }
  };

  return (
    <>
      <div>
        {tmntLoadStatus === "loading" && (
          <>
            <WaitModal
              show={tmntLoadStatus === "loading"}
              message="Loading Tournament configuration..."
            />
          </>
        )}

        {tmntLoadStatus !== "loading" &&
          tmntLoadStatus !== "succeeded" &&
          tmntError && (
            <>
              <div>Tmnt Error: {tmntError}</div>
            </>
          )}

        {tmntLoadStatus === "succeeded" && (
          <>
            <h2>Bowlers</h2>
            <PlayersEntryForm
              tmntFullData={tmntFormData?.tmntFullData}
              rows={rows}
              setRows={setRows}
              findCountError={findCountError}
            />
            <Tabs
              defaultActiveKey={defaultTabKey}
              id="entries-tabs"
              variant="pills"
              activeKey={tabKey}
              onSelect={handleTabSelect}
            >
              <Tab key="divs" eventKey="divs" title="Divisions">
                <DivCounts />
              </Tab>
              <Tab key="pots" eventKey="pots" title="Pots">
                <PotCounts />
              </Tab>
              <Tab key="brkts" eventKey="brkts" title="Brackets">
                <BrktCounts />
              </Tab>
              <Tab key="elims" eventKey="elims" title="Elims">
                <ElimCounts />
              </Tab>
            </Tabs>
          </>
        )}
      </div>
    </>
  );
}

// export const exportedForTesting = {
//   populateRows,
// };
