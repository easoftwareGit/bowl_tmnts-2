"use client";

import "@/lib/syncfusion-license";

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useParams } from "next/navigation";
import {
  fetchOneTmntGameResults,
  getOneTmntGameResultsError,
  getOneTmntGameResultsLoadStatus,
  getOneTmntGameResultsRequestedTmntId,
  getOneTmntGameResultsTmntId,
  selectOneTmntGameResults,
} from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import WaitModal from "@/components/modal/waitModal";
import {
  fetchTmntFullData,
  getTmntFullDataError,
  getTmntFullDataLoadStatus,
  getTmntFullDataRequestedTmntId,
  selectTmntFullData
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import { GameNum } from "@/lib/types/resultsTypes";
import { getBrktListRecords } from "@/redux/features/tmntFullData/brktListRecordsSelector";
import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
  Inject,
  Sort,
} from "@syncfusion/ej2-react-grids";
import { sfGridBorderWidth, sfRowHeight } from "@/lib/syncfusionTools";
import { createBracketColumns } from "./createBrktsColumns";
import "./bracketGames.css";
import { populatePlayerBrktRows } from "./populateBrktPlayerRows";

export type BrktGamesGridRow = {
  id: string;
  player_id: string;
  last_name: string;
  first_name: string;
  lane: number;
  in: number;
  cash: string;

  [key: GameNum]: number;  
};

const calcGridWidth = (columns: { width?: string }[]): number => {
  return columns.reduce((total, col) => {
    const width = Number.parseInt(col.width ?? "0", 10);
    return total + (Number.isNaN(width) ? 0 : width);
  }, 0) + sfGridBorderWidth; // + gridBorderWidth, removes bottom scrollbar
  // + sfGridScrollbarWidth if needed
};

const PlayerBrktsPage = () => {
  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const [squadId, setSquadId] = useState("");  

  const requestedTmntId = useSelector(getTmntFullDataRequestedTmntId);
  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
  const tmntError = useSelector(getTmntFullDataError);
  const tmntFullData = useSelector(selectTmntFullData);

  const requestedResultsTmntId = useSelector(getOneTmntGameResultsRequestedTmntId);
  const resultsLoadStatsus = useSelector(getOneTmntGameResultsLoadStatus);
  const resultsError = useSelector(getOneTmntGameResultsError);
  const resultsTmntId = useSelector(getOneTmntGameResultsTmntId);
  const tmntResults = useSelector(selectOneTmntGameResults);  
  
  const brktListRecords = useSelector(getBrktListRecords);

  // get tmnt data 
  useEffect(() => {
    const needsTmntData = tmntFullData.tmnt.id !== tmntId;

    const failedForThisTmnt =
      tmntLoadStatus === "failed" && requestedTmntId === tmntId;

    if (
      needsTmntData &&
      tmntLoadStatus !== "loading" &&
      !failedForThisTmnt
    ) {
      dispatch(fetchTmntFullData(tmntId));
    }
  }, [
    tmntId,
    tmntFullData.tmnt.id,
    tmntLoadStatus,
    requestedTmntId,
    dispatch,
  ]);

  // set initial squad id after tournament data is loaded
  useEffect(() => {
    if (
      squadId === "" &&
      tmntFullData.tmnt.id === tmntId &&
      tmntFullData.squads.length > 0
    ) {
      setSquadId(tmntFullData.squads[0].id);
    }
  }, [
    squadId,
    tmntId,
    tmntFullData.tmnt.id,
    tmntFullData.squads,
  ]);

  // get tmnt results 
  useEffect(() => {
    const needTmntGames = resultsTmntId !== tmntId;

    const failedForThisTmntGames =
      resultsLoadStatsus === "failed" && requestedResultsTmntId === tmntId;

    if (
      needTmntGames &&
      resultsLoadStatsus !== "loading" &&
      !failedForThisTmntGames
    ) {
      dispatch(fetchOneTmntGameResults(tmntId));
    }
  }, [
    tmntId,
    resultsTmntId,
    resultsLoadStatsus,    
    requestedResultsTmntId,
    dispatch
  ]);

  const rows = useMemo<BrktGamesGridRow[]>(
    () => populatePlayerBrktRows(tmntResults, brktListRecords),
    [tmntResults, brktListRecords]
  );

  /*********************************************/
  /* render loading/error until data is loaded */
  /*********************************************/  
  
  const hasTmntData =
    tmntFullData.tmnt.id !== "" &&
    tmntFullData.tmnt.id === tmntId;

  const hasTmntGamesData =
    resultsTmntId !== "" && resultsTmntId === tmntId;
  
  const failedForThisTmnt =
    tmntLoadStatus === "failed" &&
    requestedTmntId === tmntId;
  
  const failedForThisTmntGames =
    resultsLoadStatsus === "failed" &&
    requestedResultsTmntId === tmntId;
    
  if (!hasTmntData && failedForThisTmnt) {
    const errmsg = tmntError
      ? tmntError.includes("missing required child")
        ? `Tournament with id: ${tmntId} is missing data.`
        : `An error occurred while loading the tournament with id: ${tmntId}.`
      : `An error occurred while loading the tournament with id: ${tmntId}.`;
    return (
      <div className="text-center mt-5">
        <h4>Unable to load tournament</h4>

        <p>{errmsg}</p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => dispatch(fetchOneTmntGameResults(tmntId))}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasTmntGamesData && failedForThisTmntGames) {
    const errmsg = `An error occurred while loading games for tournament with id: ${tmntId}.`;
    return (
      <div className="text-center mt-5">
        <h4>Unable to load tournament</h4>

        <p>{errmsg}</p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => dispatch(fetchTmntFullData(tmntId))}
        >
          Retry
        </button>
      </div>
    );
  }

  const columns = createBracketColumns(tmntResults);
  const gridWidth = calcGridWidth(columns);

  return (
    <>
      <WaitModal show={resultsLoadStatsus === "loading"} message="Loading..." />
      {resultsLoadStatsus !== "loading" &&
        resultsLoadStatsus !== "succeeded" &&
        resultsError && (
          <div>
            Error: {resultsError} tmntLoadStatus: {resultsLoadStatsus}
          </div>
        )}
      
      <TmntHomeHeader
        tmntFullData={tmntFullData}
      />      

      {resultsLoadStatsus === "succeeded" && (
        <div className="text-center mb-2">
          <h4>Player Brackets</h4>
          <div
            data-testid="GamesOuterWrapper"
            className="brkt-games-grid-outer"
          >      
            <div
              data-testid="GamesInnerWrapper"
              className="brkt-games-grid-inner"
            >
              <GridComponent
                id="tmntPlayerBracketsGrid"
                dataSource={rows}
                allowPaging={false}
                allowSorting={true}
                gridLines="None"
                readOnly={true}
                rowHeight={sfRowHeight}
                width={gridWidth}
              >
                <ColumnsDirective>
                  {columns.map((col) => (
                    <ColumnDirective key={col.field} {...col} />
                  ))}
                </ColumnsDirective>
                
                <Inject services={[Sort]} />
              </GridComponent>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlayerBrktsPage;