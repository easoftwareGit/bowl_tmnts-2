"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
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
  getOneSquadEntriesError,
  getOneSquadEntriesLoadStatus,
  SaveOneSquadEntries,
  selectOneSquadEntries,
} from "@/redux/features/allEntriesOneSquad/allEntriesOneSquadSlice";
import {  
  divEntryHdcpColName,
  entryFeeColName,
  entryNumBrktsColName,
  feeColNameEnd,
  playerEntryData,
  timeStampColName,  
} from "../../playersForm/createColumns";
import { getBrktOrElimName } from "@/lib/getName";
import { Tab, Tabs } from "react-bootstrap";
import { BracketList } from "@/components/brackets/bracketList";
import BracketGrid, { BGDataType } from "@/components/brackets/bracketGrid";
import { cloneDeep } from "lodash";
import usePreventUnload from "@/components/preventUnload/preventUnload";
import WaitModal from "@/components/modal/waitModal";

import "./editPlayers.css";
import { defaultBrktGames, defaultPlayersPerMatch } from "@/lib/db/initVals";

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
      pRow[entryFeeColName(divEntry.div_id)] = divEntry.fee + ''; // as a string
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
  let squadId = "";

  const dispatch = useDispatch<AppDispatch>();

  const [rows, setRows] = useState<(typeof playerEntryData)[]>([]);
  const [origRows, setOrigRows] = useState<(typeof playerEntryData)[]>([]);

  interface entriesCountType {
    [key: string]: number;
  }
  const entriesCountObj: entriesCountType = {};
  const [entriesCount, setEntriesCount] =
    useState<typeof entriesCountObj>(entriesCountObj);
  const [priorCount, setPriorCount] =
    useState<typeof entriesCountObj>(entriesCountObj);  
  
  interface brktListType {
    [key: string]: BracketList;
  }
  const emptyBrktsList: brktListType = useMemo(() => ({}), []);
  const [allBrktsList, setAllBrktsList] = useState<brktListType>(emptyBrktsList);

  interface BGDataListType {
    [key: string]: BGDataType;    
  }
  const emptyBGDataList: BGDataListType = useMemo(() => ({}), []);
  const [BGDataList, setBGDataList] = useState<BGDataListType>(emptyBGDataList);

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
  
  squadId = playerFormTmnt?.curData?.squads[0]?.id || "";

  useEffect(() => {
    dispatch(fetchOneSquadEntries(squadId));    
  }, [squadId, dispatch]);

  // useEffect(() => {
  //   dispatch(fetchOneSquadEntries(playerFormTmnt?.curData));    
  // }, [playerFormTmnt?.curData, dispatch]);

  const entriesLoadStatus = useSelector(getOneSquadEntriesLoadStatus);
  const entriesError = useSelector(getOneSquadEntriesError);    
  const dataEntriesOneSquad = useSelector(selectOneSquadEntries) as allEntriesOneSquadType;

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
  //         for1ByeValues: [],
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
      let initCount: entriesCountType = {};
      let initPriorCount: entriesCountType = {};
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
        }
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
    const setBrktsObjs = (brkts: brktType[]) => {
      const initBrktsList = cloneDeep(emptyBrktsList)
      const initBrktGridData = cloneDeep(emptyBGDataList)
      const playersPerMatch = 2; 
      brkts.forEach((brkt) => {    
        // right now only 2 players per match, 3 games in bracket
        // const playersPerMatch = Math.pow(brkt.players, 1 / brkt.games);        
        const brktList = new BracketList(brkt.id, playersPerMatch, brkt.games);
        initBrktsList[brkt.id] = brktList;
        const bgData: BGDataType = {          
          forFullValues: [],
          for1ByeValues: [],
        };   
        initBrktGridData[brkt.id] = (bgData);
      });      
      setAllBrktsList(initBrktsList);
      setBGDataList(initBrktGridData);
    } 
    
    setEntriesCountObj(playerFormTmnt.curData);
    setBrktsObjs(playerFormTmnt.curData.brkts);

    const currRows = populateRows(playersFormData.curData);
    setRows(currRows);   
    setOrigRows(currRows);
    // DO NOT INCLUDE emptyBrktsList, emptyBGDataList, setRow in array
    // emptyBrktsList and emptyBGDataList are constants, never change
    // setRow is a function
    // eslint-disable-next-line react-hooks/exhaustive-deps    
  }, [playersFormData.curData]); // DO NOT INCLUDE emptyBrktsList, emptyBGDataList, setRow in array


  useEffect(() => { 
    if (Object.keys(entriesCount).length === 0) return;
    const updatedCount = { ...entriesCount };    
    const updatedPriorCount = { ...priorCount };
    const updatedAllBrktsList = cloneDeep(emptyBrktsList);
    const updatedBGDataList = cloneDeep(emptyBGDataList);
    
    Object.keys(entriesCount).forEach((key) => {
      if (key.endsWith(feeColNameEnd)) { // fee count is number of non-zero rows
        const colCount = rows.filter(
          (row) => typeof !isNaN(row[key]) && Number(row[key]) > 0
        ).length;
        updatedCount[key] = colCount;        
      } else { // num brackts count is total of all rows
        updatedPriorCount[key] = updatedCount[key];
        const colTotal = rows.reduce(
          (total, row) => total + (isNaN(row[key]) ? 0 : row[key]),
          0
        );
        updatedCount[key] = colTotal;

        // get a filtered COPY of rows for each bracket
        const brktEntRows = rows.filter(row => row[key] > 0);
        const brktId = key.slice(0, -5); // remove '_name'        

        // create a new brktList for each bracket        
        const oneBrktList = new BracketList(brktId, defaultPlayersPerMatch, defaultBrktGames, allBrktsList[brktId].brackets);
        // populate the new brktList
        oneBrktList.rePopulateBrkts(brktEntRows);
        updatedAllBrktsList[brktId] = oneBrktList;        
        updatedBGDataList[brktId] = oneBrktList.brktCounts;
      }
    });    

    setAllBrktsList(updatedAllBrktsList);
    setBGDataList(updatedBGDataList);
    setEntriesCount(updatedCount);  
    setPriorCount(updatedPriorCount);
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
        <div className="container" id="divCounts" style={{ float: "left", width: 400 }}>
          <div className="row">
            <div className="col-9">
              <label htmlFor="inputDivNameCount" className="form-label">
                Divisions
              </label>
            </div>
            <div className="col-3 text-center">
              <label htmlFor="inputDivEntryCount" className="form-label">
                Entries
              </label>
            </div>          
          </div>
          {playerFormTmnt?.curData?.divs.map((div) => (
            <div className="row" key={div.id}>
              <div className="col-9">
                <input
                  type="text"
                  className="form-control"
                  id={`inputDivNameCount${div.id}`}
                  value={div.div_name}
                  disabled
                />
              </div>
              <div className="col-3">
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
    )
  }

  const PotCounts: React.FC = ({}) => {

    return (
      <>
        <div className="container" id="potCounts" style={{ float: "left", width: 400 }}>
          <div className="row">
            <div className="col-9">
              <label htmlFor="inputPotNameCount" className="form-label">
                Pots
              </label>
            </div>
            <div className="col-3 text-center">
              <label htmlFor="inputPotEntryCount" className="form-label">
                Entries
              </label>
            </div>          
          </div>
          {playerFormTmnt?.curData?.pots.map((pot) => (
            <div className="row" key={pot.id}>
              <div className="col-9">
                <input
                  type="text"
                  className="form-control"
                  id={`inputPotNameCount${pot.id}`}
                  value={pot.pot_type}
                  disabled
                />
              </div>
              <div className="col-3">
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
    )
  } 

  const BrktCounts: React.FC = ({}) => {

    return (
      <>
        <div className="container" id="brktCounts" style={{ float: "left", width: "100%"}}>
        {/* <div className="container" id="brktCounts" style={{ float: "left", width: 760 }}>           */}
          {playerFormTmnt?.curData?.brkts.map((brkt) => (
            <div key={brkt.id}>
              <div className="row">
                <div className="col-6">
                  <label className="form-label">
                    {getBrktOrElimName(brkt, playerFormTmnt?.curData?.divs)}
                  </label>
                </div>
                {/* <div className="col-6">
                  Brackets Here
                </div> */}
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <BracketGrid
                    brktGridData={BGDataList[brkt.id]}
                  />
                </div>
                {/* <div className="col-6">
                  <PopBracketsGrid
                    popBrkts={allBrktsList[brkt.id].allBrkts}
                    entryRows={rows}
                  />
                </div> */}
              </div>
            </div>              

            
            // <div key={brkt.id}>
            //   <div className="row">
            //     <label className="form-label">
            //       {getBrktOrElimName(brkt, playerFormTmnt?.curData?.divs)}
            //     </label>
            //   </div>
            //   <div className="row mb-3">
            //     <BracketGrid
            //       brktGridData={BGDataList[brkt.id]}
            //     />
            //   </div>
            // </div>              
          
          
          ))}          
        </div>
      </>
    )
  }

  const ElimCounts: React.FC = ({}) => {

    return (
      <>
        <div className="container" id="elimCounts" style={{ float: "left", width: 400 }}>
          <div className="row">
            <div className="col-9">
              <label htmlFor="inputElimNameCount" className="form-label">
                Elims
              </label>
            </div>
            <div className="col-3 text-center">
              <label htmlFor="inputElimEntryCount" className="form-label">
                Entries
              </label>
            </div>          
          </div>
          {playerFormTmnt?.curData?.elims.map((elim) => (
            <div className="row" key={elim.id}>
              <div className="col-9">
                <input
                  type="text"
                  className="form-control"
                  id={`inputElimNameCount${elim.id}`}
                  value={getBrktOrElimName(elim, playerFormTmnt?.curData?.divs)}
                  disabled
                />
              </div>
              <div className="col-3">
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
    )
  }

  const handleTabSelect = (key: string | null) => {
    if (key) {
      setTabKey(key);
    }
  };  

  return (
    <>
      <div>        
        {tmntLoadStatus === "loading" ||
        entriesLoadStatus === "loading" ||
        entriesLoadStatus === "pending" ? (
          <>            
            {tmntLoadStatus === "loading" ? (
              <WaitModal show={tmntLoadStatus === "loading"} message="Loading Tournament configuration..." />              
            ) : (
              <WaitModal show={entriesLoadStatus === "loading"} message="Loading Entries..." />              
            )}
          </>
        ) : null}

        {(tmntLoadStatus !== "loading" && tmntLoadStatus !== 'succeeded' && tmntError) ||
        (entriesLoadStatus !== "loading" && entriesLoadStatus !== 'succeeded' && entriesError) ? (
          <>
            <div>Tmnt Error: {tmntError}</div>
            <div>Entries Error: {entriesError}</div>
          </>
        ) : null}

        {tmntLoadStatus === "succeeded" && entriesLoadStatus === "succeeded" ? (
          <>
            <h2>Bowlers</h2>
            <PlayersEntryForm              
              rows={rows}
              setRows={setRows}
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
                {/* DataGrid component generates error message if tab not visible when rendered*/}
                { tabKey === "brkts" ? <BrktCounts /> : null }
                {/* <BrktCounts /> */}
              </Tab>
              <Tab key="elims" eventKey="elims" title="Elims">
                <ElimCounts />
              </Tab>
            </Tabs>
          </>
        ) : null}
      </div>
    </>
  );
}

export const exportedForTesting = {
  populateRows,
};