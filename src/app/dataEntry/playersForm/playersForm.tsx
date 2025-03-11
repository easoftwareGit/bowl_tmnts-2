"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { 
  allDataOneTmntType,
  allEntriesOneSquadType,  
  dataOneTmntType,
  putManyEntriesReturnType,  
} from "@/lib/types/types";
import {
  DataGrid,
  GridAlignment,
  GridColumnGroupingModel,
  GridEventListener,
  GridRowModel,
  GridRowModesModel,
  GridRowSelectionModel,
  GridRowsProp,
} from "@mui/x-data-grid";
import {
  playerEntryData,
  createDivEntryColumns,
  entryFeeColName,
  divEntryHdcpColName,
  createPotEntryColumns,
  createBrktEntryColumns,
  entryNumBrktsColName,
  createElimEntryColumns,
  feeTotalColumn,
  createPlayerEntryColumns,
} from "./createColumns";
import { currencyFormatter } from "@/lib/currency/formatValue";
import { btDbUuid } from "@/lib/uuid";
import ModalConfirm, { delConfTitle, cancelConfTitle } from "@/components/modal/confirmModal";
import ModalErrorMsg from "@/components/modal/errorModal";
import { initModalObj } from "@/components/modal/modalObjType";
import { errInfoType, findNextError, getRowPlayerName } from "./rowInfo";
import { useRouter } from "next/navigation"
import { getOneSquadEntriesSaveStatus, getOneSquadEntriesUpdatedInfo, SaveOneSquadEntries, updateBrktEntries, updateDivEntries, updateElimEntries, updatePlayers, updatePotEntries } from "@/redux/features/allEntriesOneSquad/allEntriesOneSquadSlice";
import WaitModal from "@/components/modal/waitModal";
import { getTotalUpdated, updateAllEntries } from "@/lib/db/tmntEntries/dbTmntEntries";
import "./grid.css";
import { cloneDeep } from "lodash";
import { PayloadAction, unwrapResult } from "@reduxjs/toolkit";

// full tmnt
// http://localhost:3000/dataEntry/runTmnt/tmt_d237a388a8fc4641a2e37233f1d6bebd
// http://localhost:3000/dataEntry/editPlayers/tmt_d237a388a8fc4641a2e37233f1d6bebd
// squadId: "sqd_8e4266e1174642c7a1bcec47a50f275f"
//
// new years eve 
// http://localhost:3000/dataEntry/runTmnt/tmt_fe8ac53dad0f400abe6354210a8f4cd1
// http://localhost:3000/dataEntry/editPlayers/tmt_fe8ac53dad0f400abe6354210a8f4cd1
// eventId: "evt_9a58f0a486cb4e6c92ca3348702b1a62"
// squadId: "sqd_3397da1adc014cf58c44e07c19914f71"


declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
  }
}

interface ChildProps {
  rows: (typeof playerEntryData)[];
  setRows: (rows: (typeof playerEntryData)[]) => void;
}

const PlayersEntryForm: React.FC<ChildProps> = ({   
  rows,
  setRows
}) => {

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  const playerFormTmnt = useSelector(
    (state: RootState) => state.allDataOneTmnt.tmntData
  ) as allDataOneTmntType;

  const dataEntriesOneSquad = useSelector(
    (state: RootState) => state.allEntriesOneSquad.entryData
  ) as allEntriesOneSquadType;

  const playersFormData: allEntriesOneSquadType = {
    origData: dataEntriesOneSquad?.origData,
    curData: dataEntriesOneSquad?.curData,
  };

  const entriesSaveStatus = useSelector(getOneSquadEntriesSaveStatus);
  const [saveCompleted, setSaveCompleted] = useState(false);      
  const [resultAction, setResultAction] = useState<PayloadAction<{ data: allEntriesOneSquadType; updatedInfo: putManyEntriesReturnType; }, string, { arg: { rows: { [key: string]: any; }[]; data: allEntriesOneSquadType; }; requestId: string; requestStatus: "fulfilled"; }, never> | null>(null);

  const [gridEditMode, setGridEditMode] = useState<"cell" | "row">("cell");
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const [selectedRowId, setSelectedRowId] = useState<string>("");

  const [confModalObj, setConfModalObj] = useState(initModalObj);
  const [errModalObj, setErrModalObj] = useState(initModalObj);

  interface entriesTotalsType {
    [key: string]: number;
  }
  const entriesTotalsObj: entriesTotalsType = {
    feeTotal: 0,
  };  
  const [entriesTotals, setEntriesTotals] =
    useState<typeof entriesTotalsObj>(entriesTotalsObj);
  
  const squadMinLane = playerFormTmnt?.curData?.lanes[0]?.lane_number;
  const squadMaxLane =
    playerFormTmnt?.curData?.lanes[playerFormTmnt?.curData?.lanes.length - 1]
      ?.lane_number;

  useEffect(() => {
    // creates the entriesTotals object 
    const addToEntriesTotalsObj = (tmntData: dataOneTmntType) => {            
      
      let initTotals = { ...entriesTotals };      
      tmntData.divs.forEach((div) => {
        const divFeeName = entryFeeColName(div.id);
        initTotals = {
          ...initTotals,
          [divFeeName]: 0,
        };
      });
      tmntData.pots.forEach((pot) => {
        const potFeeName = entryFeeColName(pot.id);
        initTotals = {
          ...initTotals,
          [potFeeName]: 0,
        };
      });
      tmntData.brkts.forEach((brkt) => {
        const brktFeeName = entryFeeColName(brkt.id);
        initTotals = {
          ...initTotals,
          [brktFeeName]: 0,
        };
        const brktNameCol = entryNumBrktsColName(brkt.id);        
      });
      tmntData.elims.forEach((elim) => {
        const elimFeeName = entryFeeColName(elim.id);
        initTotals = {
          ...initTotals,
          [elimFeeName]: 0,
        };
      });
      setEntriesTotals(initTotals);      
    };

    if (playerFormTmnt?.curData?.divs) {
      addToEntriesTotalsObj(playerFormTmnt?.curData);
    }            
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerFormTmnt.curData]); // DO NOT INCLUDE entriesTotals in array

  const playersColumns = createPlayerEntryColumns(
    playerFormTmnt?.curData?.divs,
    squadMaxLane,
    squadMinLane
  );
  const divsEntryCols = createDivEntryColumns(playerFormTmnt?.curData?.divs);
  const potsEntryCols = createPotEntryColumns(playerFormTmnt?.curData?.pots);
  const brktEntryCols = createBrktEntryColumns(
    playerFormTmnt?.curData?.brkts,
    playerFormTmnt?.curData?.divs
  );
  const elimEntryCols = createElimEntryColumns(
    playerFormTmnt?.curData?.elims,
    playerFormTmnt?.curData?.divs
  );
  const feeTotalCol = feeTotalColumn();
  const columns = playersColumns.concat(
    divsEntryCols,
    potsEntryCols,
    brktEntryCols,
    elimEntryCols,
    feeTotalCol
  );

  const createColummnGroupings = (): GridColumnGroupingModel => {
    const playersColGroup: GridColumnGroupingModel = [
      {
        groupId: "players",
        headerName: "Players",
        headerAlign: "center",
        headerClassName: "playersHeader",
        children: [
          {
            groupId: "totals",
            headerName: "Column Totals->",
            headerAlign: "right",
            headerClassName: "playersHeader",
            children: [              
              { field: "first_name" },
              { field: "last_name" },
              { field: "average" },
              { field: "lane" },
              { field: "position" },
              { field: "lanePos" },
            ],
          },
        ],
      },
    ];

    const createDivEntryGroup = (): GridColumnGroupingModel => {
      // create divs group
      const divsGroup: GridColumnGroupingModel = [
        {
          groupId: "divisions",
          headerName: "Divsions",
          headerAlign: "center",
          headerClassName: "divsHeader",
          children: [],
        },
      ];
      // add the fee totals
      playerFormTmnt?.curData?.divs.forEach((div) => {
        const totalGroupName = div.id + "_total";
        const divFeeName = entryFeeColName(div.id);
        const divFeeTotalChild = {
          groupId: totalGroupName,
          headerName: currencyFormatter.format(entriesTotals[divFeeName]),
          headerAlign: "right" as GridAlignment,
          headerClassName: "divsHeader",
          children: [{ field: divFeeName }],
        };
        divsGroup[0].children?.push(divFeeTotalChild);
        const hdcpChild = {
          groupId: divEntryHdcpColName(div.id),
          headerName: " ",
          headerClassName: "divsHeader",
          children: [{ field: divEntryHdcpColName(div.id) }],
        };
        divsGroup[0].children?.push(hdcpChild);
      });
      return divsGroup;
    };

    const createPotsEntryGroup = (): GridColumnGroupingModel => {
      // create pots group
      const potsGroup: GridColumnGroupingModel = [
        {
          groupId: "pots",
          headerName: "Pots",
          headerAlign: "center",
          headerClassName: "potsHeader",
          children: [],
        },
      ];
      // add the fee totals
      playerFormTmnt?.curData?.pots.forEach((pot) => {
        const totalGroupName = pot.id + "_total";
        const potFeeName = entryFeeColName(pot.id);
        const potFeeTotalChild = {
          groupId: totalGroupName,
          headerName: currencyFormatter.format(entriesTotals[potFeeName]),
          headerAlign: "right" as GridAlignment,
          headerClassName: "potsHeader",
          children: [{ field: potFeeName }],
        };
        potsGroup[0].children?.push(potFeeTotalChild);
      });
      return potsGroup;
    };

    const createBrktsEntryGroup = (): GridColumnGroupingModel => {
      // create brkts group
      const brktsGroup: GridColumnGroupingModel = [
        {
          groupId: "brkts",
          headerName: "Brackets",
          headerAlign: "center",
          headerClassName: "brktsHeader",
          children: [],
        },
      ];
      // add the fee totals
      playerFormTmnt?.curData?.brkts.forEach((brkt) => {
        const brktsColName = entryNumBrktsColName(brkt.id);
        const nameChild = {
          groupId: brktsColName,
          headerName: " ",
          headerClassName: "brktsHeader",
          children: [{ field: brktsColName }],
        };
        brktsGroup[0].children?.push(nameChild);

        const totalGroupName = brkt.id + "_total";
        const brktFeeName = entryFeeColName(brkt.id);
        const brktFeeTotalChild = {
          groupId: totalGroupName,
          headerName: currencyFormatter.format(entriesTotals[brktFeeName]),
          headerAlign: "right" as GridAlignment,
          headerClassName: "brktsHeader",
          children: [{ field: brktFeeName }],
        };
        brktsGroup[0].children?.push(brktFeeTotalChild);
      });
      return brktsGroup;
    };

    const createElimsEntryGroup = (): GridColumnGroupingModel => {
      // create elims group
      const elimsGroup: GridColumnGroupingModel = [
        {
          groupId: "elims",
          headerName: "Eliminators",
          headerAlign: "center",
          headerClassName: "elimsHeader",
          children: [],
        },
      ];
      // add the fee totals
      playerFormTmnt?.curData?.elims.forEach((elim) => {
        const totalGroupName = elim.id + "_total";
        const elimFeeName = entryFeeColName(elim.id);
        const elimFeeTotalChild = {
          groupId: totalGroupName,
          headerName: currencyFormatter.format(entriesTotals[elimFeeName]),
          headerAlign: "right" as GridAlignment,
          headerClassName: "elimsHeader",
          children: [{ field: elimFeeName }],
        };
        elimsGroup[0].children?.push(elimFeeTotalChild);
      });
      return elimsGroup;
    };

    const createTotalEntryGroup = (): GridColumnGroupingModel => {
      // create total group
      const totalGroup: GridColumnGroupingModel = [
        {
          groupId: "total",
          headerName: "Total",
          headerAlign: "center",
          headerClassName: "totalHeader",
          children: [
            {
              groupId: "playerTotal",
              headerName: currencyFormatter.format(entriesTotals.feeTotal),
              headerAlign: "right" as GridAlignment,
              headerClassName: "totalHeader",
              children: [{ field: "feeTotal" }],
            },
          ],
        },
      ];
      return totalGroup;
    };

    const divsColGroup = createDivEntryGroup();
    const potsColGroup = createPotsEntryGroup();
    const brktsColGroup = createBrktsEntryGroup();
    const elimsColGroup = createElimsEntryGroup();
    const totalColGroup = createTotalEntryGroup();

    return playersColGroup.concat(
      divsColGroup,
      potsColGroup,
      brktsColGroup,
      elimsColGroup,
      totalColGroup
    );
  };
  
  const columnGroupings = createColummnGroupings();

  useEffect(() => {
    const updatedTotals = { ...entriesTotals };
    let overAllTotal = 0;
    Object.keys(entriesTotals).forEach((key) => {
      if (key !== "feeTotal") { 
        const colTotal = rows.reduce(
          (total, row) => total + (isNaN(row[key]) ? 0 : Number(row[key])),
          0
        );
        overAllTotal += colTotal;
        updatedTotals[key] = colTotal;
      };
    });
    updatedTotals.feeTotal = overAllTotal;
    setEntriesTotals(updatedTotals);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]); // DO NOT INCLUDE entriesTotals in array
  
  // this useEffect is if Next did not update playerFormTmnt.curData
  useEffect(() => {
    const addToEntriesTotalsObj = (tmntData: dataOneTmntType) => {            
      // if (Object.keys(entriesTotals).length > 1) return;
      let initialTotals = { ...entriesTotals };
      tmntData.divs.forEach((div) => {
        const divFeeName = entryFeeColName(div.id);
        if (!Object.keys(initialTotals).includes(divFeeName)) {
          initialTotals = {
            ...initialTotals,
            [divFeeName]: 0,
          };          
        }
      });
      tmntData.pots.forEach((pot) => {
        const potFeeName = entryFeeColName(pot.id);
        if (!Object.keys(initialTotals).includes(potFeeName)) {
          initialTotals = {
            ...initialTotals,
            [potFeeName]: 0,
          };
        }
      });
      tmntData.brkts.forEach((brkt) => {
        const brktFeeName = entryFeeColName(brkt.id);
        if (!Object.keys(initialTotals).includes(brktFeeName)) {
          initialTotals = {
            ...initialTotals,
            [brktFeeName]: 0,
          };
        }
      });
      tmntData.elims.forEach((elim) => {
        const elimFeeName = entryFeeColName(elim.id);
        if (!Object.keys(initialTotals).includes(elimFeeName)) {
          initialTotals = {
            ...initialTotals,
            [elimFeeName]: 0,
          };
        }
      });

      // console.log('No params', initialTotals);

      setEntriesTotals(initialTotals);
    };

    if (playerFormTmnt?.curData?.divs) {
      addToEntriesTotalsObj(playerFormTmnt?.curData);
    }            
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // KEEP ARRAY EMPTY!

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    setGridEditMode("cell");
  };

  const handleCellEditStop: GridEventListener<"cellEditStop"> = (
    params,
    event
  ) => {  
  }  

  const handleRowSelectionModelChange = (
    rowSelectionModel: GridRowSelectionModel
  ) => {    
    // const values = Object.values(rowSelectionModel);
    if (rowSelectionModel.length > 0) {
      setSelectedRowId(rowSelectionModel[0] as string);
    } else {
      setSelectedRowId("");
    }
  };

  const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel, params: any) => {
    setGridEditMode("cell");

    let total = 0;
    Object.keys(entriesTotals).forEach((key) => {
      if (key !== "feeTotal") {
        total += isNaN(newRow[key]) ? 0 : Number(newRow[key]);
      }
    });
    const updatedRow = {
      ...newRow,
      feeTotal: total,
      // isNew: false,
    };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const confirmYes = () => {
    // if confirmed delete
    if (confModalObj.title === delConfTitle) { 
      const idToDel = confModalObj.id;
      setConfModalObj(initModalObj); // reset modal object (hides modal)

      // filter out deleted row
      setRows(rows.filter((row) => row.id !== selectedRowId));
      setSelectedRowId("");

    // if confirmed cancel
    } else if (confModalObj.title === cancelConfTitle) {      
      setConfModalObj(initModalObj);  // reset modal object (hides modal)      
      // go back to run tournament page
      router.push(`/dataEntry/runTmnt/${playerFormTmnt.curData.tmnt.id}`);
    }
  };

  const confirmNo = () => {
    setConfModalObj(initModalObj); // reset modal object (hides modal)
  };

  const canceledModalErr = () => {
    setErrModalObj(initModalObj); // reset modal object (hides modal)
  };

  const handleCancel = () => {
    if (rows.length === 0) {
      router.push(`/dataEntry/runTmnt/${playerFormTmnt.curData.tmnt.id}`);
      return;
    }    
    setConfModalObj({
      show: true,
      title: cancelConfTitle,
      message: `Do you want to cancel editing bowlers for this tournament?`,
      id: '0'
    }); // cancel done in confirmYes    
  }

  const handleDelete = () => {
    if (selectedRowId === "") {
      setErrModalObj({
        show: true,
        title: "No row selected",
        message: `Click on the row to delete before clicking the delete button.`,
        id: "none",
      });
    } else {
      if (!rows || rows.length === 0 || selectedRowId === "") return;
      const rowToDel = rows.find((row) => row.id === selectedRowId);
      if (!rowToDel) return;

      const toDelName: string = getRowPlayerName(rows, rowToDel);
      setConfModalObj({
        show: true,
        title: delConfTitle,
        message: `Do you want to delete: ${toDelName}?`,
        id: selectedRowId,
      }); // deletion done in confirmedDelete
    }
  };

  const handleAddClick = () => {
    setGridEditMode("cell");
    const id = btDbUuid("ply");
    const newRow: typeof playerEntryData = {
      id,
      // isNew: true,
      player_id: id,
      first_name: "",
      last_name: "",
      feeTotal: 0,
    };
    setRows([...rows, newRow]);
  };

  const handleFindErrorClick = () => {
    const errInfo: errInfoType = findNextError(rows, playerFormTmnt.curData);
    if (errInfo.msg !== "") {
      setErrModalObj({
        show: true,
        title: "Error in Entries",
        message: errInfo.msg,
        id: errInfo.id,
      });
    } else {
      setErrModalObj({
        show: true,
        title: "No Errors",
        message: "There are no errors in the entries",
        id: "none",
      });
    }
  };

  const handleSaveClick = async () => {
    const errInfo: errInfoType = findNextError(rows, playerFormTmnt.curData);
    if (errInfo.msg !== "") {
      setErrModalObj({
        show: true,
        title: "Cannot Save",
        message: errInfo.msg,
        id: errInfo.id,
      });
    } else {

      setSaveCompleted(false); // Reset state before dispatching
      const saveResultAction = await dispatch(SaveOneSquadEntries({ rows: rows, data: playersFormData }));      
      if (SaveOneSquadEntries.fulfilled.match(saveResultAction)) {        
        setResultAction(saveResultAction);
        setSaveCompleted(true);
      }
    }
  }

  const handleDebug1Click = () => {
    const newId = btDbUuid("ply");
    const newRow = cloneDeep(rows[0]);
    const addedRow: typeof playerEntryData = {
      ...newRow,
      id: newId,
      player_id: newId,
      first_name: 'Linda',
      last_name: 'Lindgren',
      average: 201,
      lane: 40,
      position: 'G',
    }
    setRows([...rows, addedRow]);    
  }

  useEffect(() => {
    if (saveCompleted && entriesSaveStatus === "succeeded" && resultAction) {
      const updatedInfo = (resultAction.payload as any).updatedInfo;
  
      if (updatedInfo) {
        const updatedPlayers = updateAllEntries(updatedInfo, playersFormData);
        if (!updatedPlayers) return;
        
        dispatch(updatePlayers(updatedPlayers.players));
        dispatch(updateDivEntries(updatedPlayers.divEntries));
        dispatch(updatePotEntries(updatedPlayers.potEntries));
        dispatch(updateBrktEntries(updatedPlayers.brktEntries));
        dispatch(updateElimEntries(updatedPlayers.elimEntries));
  
        const totalUpdates: number = getTotalUpdated(updatedInfo);
        if (totalUpdates >= 0) {
          router.push(`/dataEntry/runTmnt/${playerFormTmnt.curData.tmnt.id}`);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveCompleted, entriesSaveStatus]); // ok for just saveCompleted and entriesSaveStatus

  return (
    <>
      <div>
        <ModalConfirm
          show={confModalObj.show}
          title={confModalObj.title}
          message={confModalObj.message}
          onConfirm={confirmYes}
          onCancel={confirmNo}
        />
        <ModalErrorMsg
          show={errModalObj.show}
          title={errModalObj.title}
          message={errModalObj.message}
          onCancel={canceledModalErr}
        />
        <WaitModal show={entriesSaveStatus === 'saving' && !errModalObj.show} message="Saving..." />
        <div>
          <h5>Tournament: {playerFormTmnt?.curData?.tmnt.tmnt_name}</h5>
          <h6>Entries: {rows.length}</h6>
          <div className="d-flex gap-2 mb-2">
            {/* add button */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddClick}
            >
              <svg
                xmlns="/plus-circle.svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-plus-circle"
                viewBox="0 0 16 16"
                style={{ transform: "translateY(-2px)" }}
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"></path>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
              </svg>
              &ensp;Add
            </button>
            {/* delete button */}
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
            >
              <svg
                xmlns="/trash.svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-trash"
                viewBox="0 0 16 16"
                style={{ transform: "translateY(-2px)" }}
              >
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
              </svg>
              &ensp;Delete
            </button>
            {/* find next error button */}
            <button
              type="button"
              className="btn btn-warning"
              onClick={handleFindErrorClick}
            >
              <svg
                xmlns="/exclamation-diamond.svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-exclamation-diamond"
                viewBox="0 0 16 16"
                style={{ transform: "translateY(-2px)" }}
              >
                <path d="M6.95.435c.58-.58 1.52-.58 2.1 0l6.515 6.516c.58.58.58 1.519 0 2.098L9.05 15.565c-.58.58-1.519.58-2.098 0L.435 9.05a1.48 1.48 0 0 1 0-2.098zm1.4.7a.495.495 0 0 0-.7 0L1.134 7.65a.495.495 0 0 0 0 .7l6.516 6.516a.495.495 0 0 0 .7 0l6.516-6.516a.495.495 0 0 0 0-.7L8.35 1.134z" />
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z" />
              </svg>
              &ensp;Find Next Error
            </button>
            {/* save button */}
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSaveClick}
              title="Save bowlers. Must finalize BEFORE you can enter scores."
            >
              <svg
                xmlns="/save.svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-save"
                viewBox="0 0 16 16"
              >
                <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1z"/>
              </svg>
              &ensp;Save
            </button> 
            {/* cancel button */}
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleCancel}              
              title="Cancel. All changes will be lost."
            >
              <svg
                xmlns="/x-circle.svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-x-circle"
                viewBox="0 0 16 16"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
              </svg>              
              &ensp;Cancel
            </button>
            {/* debug button  */}
            {/* <button
              type="button"
              className="btn btn-info"
              onClick={handleDebug1Click}              
              title="Debug"
            >
              Debug 1
            </button> */}
          </div>
        </div>
        <div
          id="playerEntryGrid"
          style={{ height: 350, width: "100%", overflow: "auto", marginBottom: 10 }}
          tabIndex={90}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            editMode={gridEditMode}
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowSelectionModelChange={handleRowSelectionModelChange}
            onRowEditStop={handleRowEditStop}
            onCellEditStop={handleCellEditStop}            
            processRowUpdate={processRowUpdate}
            rowHeight={25}
            columnHeaderHeight={25}
            hideFooter
            columnGroupingModel={columnGroupings}
          />
        </div>
      </div>
    </>
  );
}

export default PlayersEntryForm;