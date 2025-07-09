"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useParams } from "next/navigation";
import PlayersEntryForm from "../../playersForm/playersForm";
import {
  fetchOneTmnt,
  getOneTmntError,
  getOneTmntLoadStatus,
  selectOneTmnt,
} from "@/redux/features/allDataOneTmnt/allDataOneTmntSlice";
import {
  allDataOneTmntType,
  allEntriesOneSquadType,
  brktType,
  dataOneSquadEntriesType,
  dataOneTmntType,  
} from "@/lib/types/types";
import {
  fetchOneSquadEntries,
  fetchOneSquadEntries2,
  getOneSquadEntriesError,
  getOneSquadEntriesLoadStatus,
  SaveOneSquadEntries,
  selectOneSquadEntries,
} from "@/redux/features/allEntriesOneSquad/allEntriesOneSquadSlice";
import {
  brktsColNameEnd,
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
import { cloneDeep } from "lodash";
import usePreventUnload from "@/components/preventUnload/preventUnload";
import WaitModal from "@/components/modal/waitModal";
import { defaultBrktGames, defaultPlayersPerMatch } from "@/lib/db/initVals";
import { errInfoType, getDivsPotsBrktsElimsCountErrMsg, getDivsPotsBrktsElimsCounts } from "../../playersForm/rowInfo";
import "./editPlayers.css";

// run tmnt:
// http://localhost:3000/dataEntry/runTmnt/tmt_d237a388a8fc4641a2e37233f1d6bebd

// edit bowlers:
// http://localhost:3000/dataEntry/editPlayers/tmt_d237a388a8fc4641a2e37233f1d6bebd

const populateRows = (formData: dataOneSquadEntriesType) => {
  const pRows: (typeof playerEntryData)[] = [];
  // populate all players
  formData?.players?.forEach((player) => {
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
  formData?.divEntries?.forEach((divEntry) => {
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
  formData?.potEntries?.forEach((potEntry) => {
    const pRow = pRows.find(
      (row) => row.player_id === potEntry.player_id
    ) as typeof playerEntryData;
    if (pRow) {
      pRow[entryFeeColName(potEntry.pot_id)] = potEntry.fee;
    }
  });
  // populate bracket entries & fee(s)
  formData?.brktEntries?.forEach((brktEntry) => {
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
  formData?.elimEntries?.forEach((elimEntry) => {
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
  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const [rows, setRows] = useState<(typeof playerEntryData)[]>([]);
  const [origRows, setOrigRows] = useState<(typeof playerEntryData)[]>([]);

  const [entriesCount, setEntriesCount] = useState<Record<string, number>>({});
  const [priorCount, setPriorCount] = useState<Record<string, number>>({});

  const emptyBrktsList: Record<string, BracketList> = useMemo(() => ({}), []);
  const [allBrktsList, setAllBrktsList] =
    useState<Record<string, BracketList>>(emptyBrktsList);

  const emptyGotRefunds: Record<string, boolean> = useMemo(() => ({}), []);
  const [gotRefunds, setGotRefunds] =
    useState<Record<string, boolean>>(emptyGotRefunds);

  const defaultTabKey = "divs";
  const [tabKey, setTabKey] = useState(defaultTabKey);

  useEffect(() => {
    dispatch(fetchOneTmnt(tmntId));
  }, [tmntId, dispatch]);

  const tmntLoadStatus = useSelector(getOneTmntLoadStatus);
  const tmntError = useSelector(getOneTmntError);
  const dataOneTmnt = useSelector(selectOneTmnt) as allDataOneTmntType;

  const playerFormTmnt = {
    origData: dataOneTmnt.origData,
    curData: dataOneTmnt.curData,
  } as allDataOneTmntType;

  useEffect(() => {
    dispatch(fetchOneSquadEntries2(playerFormTmnt?.curData));
  }, [playerFormTmnt?.curData, dispatch]);

  const entriesLoadStatus = useSelector(getOneSquadEntriesLoadStatus);
  const entriesError = useSelector(getOneSquadEntriesError);
  const dataEntriesOneSquad = useSelector(
    selectOneSquadEntries
  ) as allEntriesOneSquadType;

  const playersFormData: allEntriesOneSquadType = {
    origData: dataEntriesOneSquad?.origData,
    curData: dataEntriesOneSquad?.curData,
  };

  // useEffect(() => {
  //   // sets entriesCountObj and priorCount
  //   const setEntriesCountObj = (tmntData: dataOneTmntType) => {
  //     let initCount: entriesCountType = {};
  //     let initPriorCount: entriesCountType = {};
  //     tmntData.divs.forEach((div) => {
  //       const divFeeName = entryFeeColName(div.id);
  //       initCount = {
  //         ...initCount,
  //         [divFeeName]: 0,
  //       };
  //     });
  //     tmntData.pots.forEach((pot) => {
  //       const potFeeName = entryFeeColName(pot.id);
  //       initCount = {
  //         ...initCount,
  //         [potFeeName]: 0,
  //       };
  //     });
  //     tmntData.brkts.forEach((brkt) => {
  //       const numBrktsName = entryNumBrktsColName(brkt.id);
  //       initCount = {
  //         ...initCount,
  //         [numBrktsName]: 0,
  //       };
  //       initPriorCount = {
  //         ...initPriorCount,
  //         [numBrktsName]: -1,
  //       }
  //     });
  //     tmntData.elims.forEach((elim) => {
  //       const elimFeeName = entryFeeColName(elim.id);
  //       initCount = {
  //         ...initCount,
  //         [elimFeeName]: 0,
  //       };
  //     });
  //     setEntriesCount(initCount);
  //   };
  //   // sets brktsList
  //   const setBrktsObjs = (brkts: brktType[]) => {
  //     const initBrktsList = cloneDeep(emptyBrktsList)
  //     const initBrktGridData = cloneDeep(emptyBGDataList)
  //     const playersPerMatch = 2;
  //     brkts.forEach((brkt) => {
  //       // right now only 2 players per match, 3 games in bracket
  //       // const playersPerMatch = Math.pow(brkt.players, 1 / brkt.games);
  //       const brktList = new BracketList(brkt.id, playersPerMatch, brkt.games);
  //       initBrktsList[brkt.id] = brktList;
  //       const bgData: BGDataType = {
  //         forFullValues: [],
  //         forOneByeValues: [],
  //       };
  //       initBrktGridData[brkt.id] = (bgData);
  //     });
  //     setAllBrktsList(initBrktsList);
  //     setBGDataList(initBrktGridData);
  //   }

  //   setEntriesCountObj(playerFormTmnt.curData);
  //   setBrktsObjs(playerFormTmnt.curData.brkts);
  // }, [emptyBGDataList, emptyBrktsList, playerFormTmnt.curData]);

  // useEffect(() => {
  //   const currRows = populateRows(playersFormData.curData);
  //   setRows(currRows);
  //   setOrigRows(currRows);
  // }, [playersFormData.curData]); // DO NOT INCLUDE setRow in array
  
  useEffect(() => {
    // sets entriesCountObj and priorCount
    const setEntriesCountObj = (tmntData: dataOneTmntType) => {
      // let initCount: entriesCountType = {};
      // let initPriorCount: entriesCountType = {};
      let initCount: Record<string, number> = {};
      let initPriorCount: Record<string, number> = {};
      tmntData.divs.forEach((div) => {
        const divFeeName = entryFeeColName(div.id);
        initCount = {
          ...initCount,
          [divFeeName]: 0,
        };
      });
      tmntData.pots.forEach((pot) => {
        const potFeeName = entryFeeColName(pot.id);
        initCount = {
          ...initCount,
          [potFeeName]: 0,
        };
      });
      tmntData.brkts.forEach((brkt) => {
        const numBrktsName = entryNumBrktsColName(brkt.id);
        initCount = {
          ...initCount,
          [numBrktsName]: 0,
        };
        initPriorCount = {
          ...initPriorCount,
          [numBrktsName]: -1,
        };
      });
      tmntData.elims.forEach((elim) => {
        const elimFeeName = entryFeeColName(elim.id);
        initCount = {
          ...initCount,
          [elimFeeName]: 0,
        };
      });
      setEntriesCount(initCount);
    };
    // sets brktsList
    const setBrktsObjs = (
      brkts: brktType[],
      curRows: (typeof playerEntryData)[]
    ) => {
      const initBrktsList = cloneDeep(emptyBrktsList);
      // const initBrktGridData = cloneDeep(emptyBGDataList);
      const playersPerMatch = defaultPlayersPerMatch;
      brkts.forEach((brkt) => {
        // right now only 2 players per match, 3 games in bracket
        // const playersPerMatch = Math.pow(brkt.players, 1 / brkt.games);
        const brktList = new BracketList(brkt.id, playersPerMatch, brkt.games);

        brktList.calcTotalBrkts(curRows);

        initBrktsList[brkt.id] = brktList;
      });
      setAllBrktsList(initBrktsList);
    };

    setEntriesCountObj(playerFormTmnt.curData);

    const curRows = populateRows(playersFormData.curData);

    setBrktsObjs(playerFormTmnt.curData.brkts, curRows);
    setRows(curRows);
    setOrigRows(curRows);
    // DO NOT INCLUDE emptyBrktsList, emptyBGDataList, setRow in array
    // emptyBrktsList and emptyBGDataList are constants, never change
    // setRow is a function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playersFormData.curData]); // DO NOT INCLUDE emptyBrktsList, emptyBGDataList, setRow in array

  // when grid data is changed
  useEffect(() => {
    if (Object.keys(entriesCount).length === 0) return;
    const updatedCount = { ...entriesCount };
    const updatedPriorCount = { ...priorCount };
    const updatedAllBrktsList = cloneDeep(emptyBrktsList);
    const updatedGotRefunds = cloneDeep(emptyGotRefunds);

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
          (total, row) => total + (isNaN(row[key]) ? 0 : row[key]),
          0
        );
        updatedCount[key] = colTotal;

        // get a filtered COPY of rows for each bracket
        const brktEntRows = rows.filter((row) => row[key] > 0);
        const sliceLength = brktsColNameEnd.length * -1; // * -1 to remove from end
        const brktId = key.slice(0, sliceLength); // remove '_brkts'

        // create a new brktList for each bracket
        const oneBrktList = new BracketList(
          brktId,
          defaultPlayersPerMatch,
          defaultBrktGames,
          allBrktsList[brktId].brackets
        );
        // populate the new brktList
        oneBrktList.calcTotalBrkts(brktEntRows);
        updatedAllBrktsList[brktId] = oneBrktList;        
        updatedGotRefunds[brktId] = oneBrktList.playersWithRefunds;
      }
    });

    setAllBrktsList(updatedAllBrktsList);
    setEntriesCount(updatedCount);
    setPriorCount(updatedPriorCount);
    setGotRefunds(updatedGotRefunds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]); // DO NOT INCLUDE entriesCount or priorCount in array

  const dataWasChanged = (): boolean => {
    if (rows.length !== origRows.length) return true;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const origRow = origRows[i];
      if (JSON.stringify(row) !== JSON.stringify(origRow)) {
        return true;
      }
    }
    return false;
  };

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
          {playerFormTmnt?.curData?.divs.map((div) => (
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

  const PotCounts: React.FC = ({ }) => {

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
          {playerFormTmnt?.curData?.pots.map((pot) => (
            <div className="row g-2" key={pot.id}>
              <div className="col-10">
                <input
                  type="text"
                  className="form-control"
                  id={`inputPotNameCount${pot.id}`}
                  // value={pot.pot_type}
                  value={getPotName(pot, playerFormTmnt?.curData?.divs)}
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
          {playerFormTmnt?.curData?.brkts.map((brkt) => (
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
                        playerFormTmnt?.curData?.divs
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
                    value={allBrktsList[brkt.id]?.brktEntries.length}
                    disabled
                    style={{ textAlign: "center" }}
                  />
                </div>
                <div className="col-1">
                  <input
                    type="text"
                    className="form-control"
                    id={`inputFullCount${brkt.id}`}
                    value={allBrktsList[brkt.id]?.fullCount}
                    disabled
                    style={{ textAlign: "center" }}
                  />
                </div>
                <div className="col-1">
                  <input
                    type="text"
                    className="form-control"
                    id={`inputOneByeCount${brkt.id}`}
                    value={allBrktsList[brkt.id]?.oneByeCount}
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
                      allBrktsList[brkt.id]?.fullCount +
                      allBrktsList[brkt.id]?.oneByeCount
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
          {playerFormTmnt?.curData?.elims.map((elim) => (
            <div className="row g-2" key={elim.id}>
              <div className="col-10">
                <input
                  type="text"
                  className="form-control"
                  id={`inputElimNameCount${elim.id}`}
                  value={getBrktOrElimName(elim, playerFormTmnt?.curData?.divs)}
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
    const errMsg = getDivsPotsBrktsElimsCountErrMsg(counts, playerFormTmnt);
    if (errMsg) {
      errInfo.id = 'counts';
      errInfo.msg = errMsg;
    }

    return errInfo
  }

  const randomizeBrkts = () => { 
    
  }

  const handleTabSelect = (key: string | null) => {
    if (key) {
      setTabKey(key);
    }
  };

  return (
    <>
      <div>
        {(tmntLoadStatus === "loading" ||
          entriesLoadStatus === "loading" ||
          entriesLoadStatus === "pending") && (
          <>
            {tmntLoadStatus === "loading" ? (
              <WaitModal
                show={tmntLoadStatus === "loading"}
                message="Loading Tournament configuration..."
              />
            ) : (
              <WaitModal
                show={entriesLoadStatus === "loading"}
                message="Loading Entries..."
              />
            )}
          </>
        )}

        {((tmntLoadStatus !== "loading" &&
          tmntLoadStatus !== "succeeded" &&
          tmntError) ||
          (entriesLoadStatus !== "loading" &&
            entriesLoadStatus !== "succeeded" &&
            entriesError)) && (
          <>
            <div>Tmnt Error: {tmntError}</div>
            <div>Entries Error: {entriesError}</div>
          </>
        )}

        {tmntLoadStatus === "succeeded" &&
          entriesLoadStatus === "succeeded" && (
            <>
              <h2>Bowlers</h2>
              <PlayersEntryForm
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
