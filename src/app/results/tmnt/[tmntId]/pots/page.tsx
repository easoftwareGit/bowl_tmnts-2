"use client";

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
import TmntHomeHeader, { tmntPageBtnType } from "@/app/results/tmntHeader/tmntHomeHeader";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import { getPotShortName } from "@/lib/getName";
import { divType, potType } from "@/lib/types/types";
import { calcNumGames } from "@/components/tmnts/games";
import { buildPotResultsRows } from "../../../../../lib/results/pots/potResults";
import {
  fetchPotPfs,
  getPotPfsError,
  getPotPfsLoadStatus,
  getPotPfsRequestedTmntId,
  getPotPfsTmntId,
  selectPotPfs
} from "@/redux/features/potPfs/potPfsSlice";
import { ptGame, ptLastGame } from "@/lib/validation/constants";
import PotGames from "./potGames";
import PotLastGame from "./potLastGame";
import PotSeries from "./potsSeries";

type PotsHeaderProps = {
  pots: potType[];
  divs: divType[];
  selectedPotId: string;
  onSelect: (potId: string) => void;
};

const PotsHeader = ({
  pots,
  divs,
  selectedPotId,
  onSelect,
}: PotsHeaderProps) => {
  return (
    <div
      className="btn-group btn-group-sm"
      role="group"
      aria-label="Select pot"
    >
      {pots.map((pot) => (
        <button
          key={pot.id}
          type="button"
          className={`btn btn-outline-primary ${selectedPotId === pot.id ? "active" : ""}`}
          onClick={() => onSelect(pot.id)}
        >
          {getPotShortName(pot, divs)}
        </button>
      ))}
    </div>
  );
};

const PotsPage = () => {
  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();  

  const requestedResultsTmntId = useSelector(
    getOneTmntGameResultsRequestedTmntId,
  );
  const resultsLoadStatus = useSelector(getOneTmntGameResultsLoadStatus);
  const resultsError = useSelector(getOneTmntGameResultsError);
  const resultsTmntId = useSelector(getOneTmntGameResultsTmntId);
  const tmntResults = useSelector(selectOneTmntGameResults);

  const requestedPrizesTmntId = useSelector(getPotPfsRequestedTmntId);
  const prizesTmntId = useSelector(getPotPfsTmntId);
  const prizesLoadStatus = useSelector(getPotPfsLoadStatus);
  const prizesError = useSelector(getPotPfsError);    
  const potPfs = useSelector(selectPotPfs);  

  const [mounted, setMounted] = useState(false);
  
  const [selectedPotId, setSelectedPotId] = useState("");

  const tmntPageBtn: tmntPageBtnType = "Pots";  

  useEffect(() => {
    setMounted(true);
  }, []);

  /*****************/
  /* get tmnt data */
  /*****************/
  const {
    data: tmntFullData,
    hasData: hasTmntData,
    failed: failedForThisTmnt,
    error: tmntError,
    retry: retryTmnt,
  } = useTmntFullData(tmntId);

  // get tmnt results
  useEffect(() => {
    const needTmntGames = resultsTmntId !== tmntId;

    const failedForThisTmntGames =
      resultsLoadStatus === "failed" && requestedResultsTmntId === tmntId;

    if (
      needTmntGames &&
      resultsLoadStatus !== "loading" &&
      !failedForThisTmntGames
    ) {
      dispatch(fetchOneTmntGameResults(tmntId));
    }
  }, [
    tmntId,
    resultsTmntId,
    resultsLoadStatus,
    requestedResultsTmntId,
    dispatch,
  ]);

  // get pot prizes
  useEffect(() => {
    const needsPotPrizes = prizesTmntId !== tmntId;

    const failedForThisTmntPrizes =
      prizesLoadStatus === "failed" && requestedPrizesTmntId === tmntId;

    if (
      needsPotPrizes &&
      prizesLoadStatus !== "loading" &&
      !failedForThisTmntPrizes
    ) {
      dispatch(fetchPotPfs(tmntId));
    }
  }, [
    prizesTmntId,
    tmntId,
    requestedPrizesTmntId,
    prizesLoadStatus,    
    dispatch
  ]);

  const hasTmntGamesData = resultsTmntId !== "" && resultsTmntId === tmntId;

  /*****************************************/
  /* build all rows once, when data loads  */
  /*****************************************/

  const numGames = useMemo(() => {
    if (!hasTmntData || !hasTmntGamesData) return 0;
    return calcNumGames(tmntResults);
  }, [
    hasTmntData,
    hasTmntGamesData,
    tmntResults
  ]); 

  const potResultsRows = useMemo(() => {
    if (!hasTmntData || !hasTmntGamesData) return [];    
    return buildPotResultsRows(tmntResults, numGames);
  }, [
    hasTmntData,
    hasTmntGamesData,
    numGames,
    tmntResults,
  ]);

  /********************************************/
  /* active pot: user's choice, else first pot */
  /********************************************/

  // recalculated when selectedPotId changes, re-renders
  const pots = tmntFullData.pots;
  const activePotId = pots.some((p) => p.id === selectedPotId)
    ? selectedPotId
    : (pots[0]?.id ?? "");
  const activePot = pots.find((p) => p.id === activePotId);

  /*********************************************/
  /* render loading/error until data is loaded */
  /*********************************************/

  const hasPrizesData =
    prizesTmntId !== "" &&
    prizesTmntId === tmntId;

  const failedForThisTmntGames =
    resultsLoadStatus === "failed" && requestedResultsTmntId === tmntId;
  
  const failedForThisTmntPrizes =
    prizesLoadStatus === "failed" &&
    requestedPrizesTmntId === tmntId;      

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
          onClick={() => {
            void retryTmnt();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasTmntData) {
    return <WaitModal show={mounted} message="Loading..." />;
  }

  // a tournament with no pots has nothing to show, so no results are needed
  if (tmntFullData.pots.length === 0) {
    return (
      <>
        <TmntHomeHeader tmntFullData={tmntFullData} selectedTmntPageBtn={tmntPageBtn} />
        <p className="text-center mt-3">
          No pots are available for this tournament.
        </p>
      </>
    );
  }

  if (!hasTmntGamesData && failedForThisTmntGames) {
    const errmsg =
      resultsError ||
      `An error occurred while loading games for tournament with id: ${tmntId}.`;

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

  if (!hasTmntGamesData) {
    return <WaitModal show={mounted} message="Loading..." />;
  }

  if (!hasPrizesData && failedForThisTmntPrizes) {
    const errmsg =
      prizesError ||
      `An error occurred while loading prizes for tournament with id: ${tmntId}.`;
    
    return (
      <div className="text-center mt-5">
        <h4>Unable to load tournament prizes</h4>
        <p>{errmsg}</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => dispatch(fetchPotPfs(tmntId))}
        >
          Retry
        </button>
      </div>
    );
  }  

  if (!hasPrizesData) {
    return <WaitModal show={mounted} message="Loading..." />;
  }

  return (
    <>
      <TmntHomeHeader tmntFullData={tmntFullData} selectedTmntPageBtn={tmntPageBtn} />

      <div className="text-center mb-2">        

        {activePot && (
          <>          
            <PotsHeader
              pots={tmntFullData.pots}
              divs={tmntFullData.divs}
              selectedPotId={activePotId}
              onSelect={setSelectedPotId}
            />
            {activePot.pot_type === ptGame
              ? (
                <PotGames
                  pot_id={activePotId}                  
                  tmntFullData={tmntFullData}
                  potResultsRows={potResultsRows}
                  potPfs={potPfs}
                  numGames={numGames}
                />               
              ) : (
                activePot.pot_type === ptLastGame 
                ? (
                  <PotLastGame
                    pot_id={activePotId}                  
                    tmntFullData={tmntFullData}
                    potResultsRows={potResultsRows}
                    potPfs={potPfs}
                    numGames={numGames}
                  />
                ) : (
                  <PotSeries
                    pot_id={activePotId}                  
                    tmntFullData={tmntFullData}
                    tmntResults={tmntResults}
                    potPfs={potPfs}
                    numGames={numGames}
                  />
                )
              )
            }
          </>
        )}
      </div>
    </>
  );
};

export default PotsPage;
