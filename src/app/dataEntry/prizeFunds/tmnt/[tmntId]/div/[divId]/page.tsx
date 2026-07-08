"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { useParams, useRouter } from "next/navigation";
import {
  fetchDivPfs,
  getDivPfsError,
  getDivPfsLoadStatus,  
} from "@/redux/features/divPfs/divPfsSlice";
import type { divPfEntryRow } from "@/lib/types/types";
import WaitModal from "@/components/modal/waitModal";
import {
  fetchTmntFullData,
  getTmntFullDataError,
  getTmntFullDataLoadStatus,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import EaCurrencyInput from "@/components/currency/eaCurrencyInput";
import "./divPf.css";
import DivPrizeFundGrid from "../../../../divPfGrid/divPfGrid";
import { populateDivPfRows } from "../../../../divPfGrid/divPfRows";
import ModalConfirm from "@/components/modal/confirmModal";
import { initModalObj, modalObjectType } from "@/components/modal/modalObjType";
import { btDbUuid } from "@/lib/uuid";
import { defaultRatio } from "@/lib/validation/constants";

// http://localhost:3000/dataEntry/prizeFunds/tmnt/tmt_d237a388a8fc4641a2e37233f1d6bebd/div/div_99a3cae28786485bb7a036935f0f6a0a

export default function PrizeFundEntry() {
  const params = useParams();
  const tmntId = params.tmntId as string;
  const divId = params.divId as string;

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const divPfsLoadStatus = useSelector(getDivPfsLoadStatus);
  const divPfsError = useSelector(getDivPfsError);
  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
  const tmntError = useSelector(getTmntFullDataError);

  const runTmntUrl = `/dataEntry/runTmnt/${tmntId}`;
  const handleBack = (): void => {
    if (dataWasChanged || gridDataWasChanged) {
      const ok = window.confirm(
        "You have unsaved changes. Leave this page?",
      );

      if (!ok) {
        return;
      }
    }

    router.push(runTmntUrl);
  };  

  // so only initialize state once when data first becomes available
  // prevents the page from reinitializing state multiple times.
  // redux updates, rerenders, async fetches could overwrite user edits
  const initializedRef = useRef(false);

  const divPfs = useSelector((state: RootState) => state.divPfs.divPfs);
  const tmntData = useSelector(
    (state: RootState) => state.tmntFullData.tmntFullData,
  );

  const [rows, setRows] = useState<divPfEntryRow[]>([]);

  // get original rows for change detection (useRef -> no re-renders)
  const origRowsRef = useRef<divPfEntryRow[]>([]);
  
  const [ratio, setRatio] = useState(defaultRatio);
  const [ratioText, setRatioText] = useState(defaultRatio.toFixed(2));
  const [ratioErr, setRatioErr] = useState("");
  const [calcCashers, setCalcCashers] = useState(0);
  const [calcCashersErr, setCalcCashersErr] = useState(""); 
  const [cashers, setCashers] = useState(1);
  const [cashersErr, setCashersErr] = useState("");

  const [dataWasChanged, setDataWasChanged] = useState(false);
  const [gridDataWasChanged, setGridDataWasChanged] = useState(false);
  const [isNavigatingAfterSave, setIsNavigatingAfterSave] = useState(false);

  const [confModalObj, setConfModalObj] = useState<modalObjectType>(initModalObj);

  let lastRatioRef = useRef(defaultRatio);
  let lastCashersRef = useRef(1);

  // Fetch divPfs
  useEffect(() => {
    if (!divId) return;
    dispatch(fetchDivPfs(divId));
  }, [divId, dispatch]);

  // Fetch tournament if missing
  useEffect(() => {
    if ((!tmntData || tmntData.tmnt.id !== tmntId) && tmntId) {
      dispatch(fetchTmntFullData(tmntId));
    }
  }, [tmntData, tmntId, dispatch]);

  const divName = tmntData?.divs.find((div) => div.id === divId)?.div_name;

  const divPrizeFund =
    tmntData.moneys.find(
      (money) =>
        money.div_id === divId &&
        money.descrip === "PRIZEFUND" &&
        money.flow === "OUT" &&
        money.pot_id === null &&
        money.brkt_id === null &&
        money.elim_id === null,
    )?.amount ?? 0;

  const numPlayers = tmntData?.players?.length || 0;

  /******************
   * modal Handlers *
   ******************/

  /**
   * runs when the user clicks yes in the confirm modal
   * does all the actions when the user clicks yes
   *  - cancel
   *  - cancel and close
   *
   * @return {Promise<void>}
   */
  const confirmYes = async (): Promise<void> => {
    // id will be an integer as a string, and is the new number of cashers
    const value = Number(confModalObj.id) 
    setDataWasChanged(true);
    const numToRemove = rows.length - value;
    if (numToRemove > 0) {      
      setRows(rows.slice(0, rows.length - numToRemove));
    }
    setCashers(value);
    lastRatioRef.current = ratio;    
    lastCashersRef.current = value;
    setConfModalObj(initModalObj); // reset modal object (hides modal)    
    return;
  };

  const confirmNo = (): void => {
    setConfModalObj(initModalObj); // reset modal object (hides modal)
  };

  // write init values into state "once", when tmnt data finishes loading
  // guard with initializedRef to avoid overwriting user edits if redux data updates later
  useEffect(() => {
    if (
      divPfsLoadStatus !== "succeeded" ||
      !tmntData ||
      tmntData.tmnt.id !== tmntId
    )
      return;
    if (initializedRef.current) return; // run only once

    const numCashers = divPfs.length;
    const currentRows = populateDivPfRows(divPfs, divId, divPrizeFund, numCashers);

    setRows(currentRows);
    origRowsRef.current = currentRows;
    setCashers(numCashers);    

    if (numCashers > 0) {
      const currentRatio = numPlayers / numCashers;
      setRatio(currentRatio);
      lastRatioRef.current = currentRatio;      
      setRatioText(currentRatio.toFixed(2));   
      lastCashersRef.current = numCashers;
    } else {
      setRatio(0);
      lastRatioRef.current = 0;
      setRatioText("0.00");      
      lastCashersRef.current = 0;
    }

    initializedRef.current = true;
  }, [
    divPfsLoadStatus,
    tmntData,
    tmntId,
    divPfs,
    divId,
    divPrizeFund,
    numPlayers,
    setRows,
    setCashers,
    setRatio,
  ]);

  const gotTmntData = tmntData.tmnt.id === tmntId;

  /**
   * sets the number of cashers
   *
   * @param {number} value
   */
  const doSetCashers = (value: number) => {
    const actualCashers = rows.length;
    if (value < actualCashers) { 
      const lastCashers = lastCashersRef.current;
      // const removeCount = lastCashersRef.current - value;
      const removeCount = lastCashers - value;
      setConfModalObj({
        show: true,
        id: value + "",
        title: 'Remove Cashers',
        message: `Do you want to remove ${removeCount} cashers? Going from ${lastCashers} cashers to ${value} cashers.`,
        // message: `Do you want to remove ${removeCount} cashers? Going from ${lastCashersRef.current} cashers to ${value} cashers.`,
      });
    } else if (value > actualCashers) {
      setDataWasChanged(true);

      const numToAdd = value - lastCashersRef.current;
      let position = rows.length + 1;
      let toAdd: divPfEntryRow[] = [];
      for (let i = 0; i < numToAdd; i++) {
        toAdd.push({
          id: btDbUuid('dpf'),
          div_id: divId,
          position: position,
          amount: 0,
          percentage: 0
        })
        position++;
      }
      setRows(rows.concat(toAdd));
      setCashers(value);        
      lastCashersRef.current = value;
    }
  }
  
  /**
   * sets the ratio of players to cashers
   *
   * @param {number} value
   */
  const applyRatio = (value: number): void => {    

    if (isNaN(value)) {
      setRatio(0);
      setRatioText("0.00");
      setCalcCashers(0);
      doSetCashers(0);
      lastRatioRef.current = 0;
    } else {
      setRatio(value);
      setRatioText(value.toFixed(2));
      setCalcCashers(value > 0 ? numPlayers / value : 0);
      doSetCashers(value > 0 ? Math.floor(numPlayers / value) : 0);
      lastRatioRef.current = value;
    }
  };

  /******************
   * input Handlers *
   ******************/

  const handleRatioBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (isNaN(value)) { 
      applyRatio(0);
    } else {          
      if (value !== lastRatioRef.current) {
        applyRatio(value);
      } else { 
        setRatioText(value.toFixed(2));
      }
    }
  }

  const handleRatioChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setDataWasChanged(true);

    const text = e.target.value;

    // allow only digits and one decimal point
    if (!/^\d*\.?\d*$/.test(text)) {
      return;
    }

    setRatioText(text);
    const value = Number(text);    
    setRatio(isNaN(value) ? 0 : value);
  };  

  const handleRatioKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key !== "Enter") {
      return;
    }    
    const value = Number(e.currentTarget.value);
    if (isNaN(value)) {
      applyRatio(0);
    } else if (value !== lastRatioRef.current) {
      applyRatio(value);
    }    
  };

  const updateRatioFromCashers = (value: number): void => {
    if (isNaN(value)) {
      setRatio(0);
      setRatioText("0.00");
      setCalcCashers(0);
    } else {
      const newRatio = value > 0 ? numPlayers / value : 0;
      setRatio(newRatio);
      setRatioText(newRatio.toFixed(2));
      setCalcCashers(newRatio > 0 ? numPlayers / newRatio : 0);
    }
  }

  const handleCashersBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (isNaN(value)) {
      doSetCashers(0);
      updateRatioFromCashers(0);
    } else if (value !== lastCashersRef.current) {
      doSetCashers(value);
      updateRatioFromCashers(value);
    }
  }

  const handleCashersChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setDataWasChanged(true);

    const value = e.target.value;

    if (value === "") {
      setCashers(0);
      return;
    }
    
    // Only allow digits
    if (!/^\d+$/.test(value)) {
      return;
    }

    setCashers(Number(value));
  };  

  const handleCashersKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (e.key === "Enter") {
      doSetCashers(Number(e.currentTarget.value));
      updateRatioFromCashers(Number(e.currentTarget.value));
    }
  };

  useUnsavedChangesGuard((dataWasChanged || gridDataWasChanged) && !isNavigatingAfterSave);

  // after save, if user tries to navigate away, don't want to show the unsaved changes prompt
  useEffect(() => {
    if (!isNavigatingAfterSave) return;
    if (dataWasChanged) return;
    if (!tmntId) return;

    router.push(runTmntUrl);
  }, [isNavigatingAfterSave, dataWasChanged, tmntId, router, runTmntUrl]);

  const isLoading =
    divPfsLoadStatus === "loading" ||
    (!tmntData && tmntLoadStatus === "loading");

  const canRender =
    divPfsLoadStatus === "succeeded" &&
    tmntLoadStatus === "succeeded" &&
    gotTmntData;
  
  return (
    <>
      <WaitModal show={isLoading} message="Loading..." />      

      <ModalConfirm
        show={confModalObj.show}
        title={confModalObj.title}
        message={confModalObj.message}
        onConfirm={confirmYes}
        onCancel={confirmNo}
      />            

      {divPfsLoadStatus !== "loading" &&
        divPfsLoadStatus !== "succeeded" &&
        divPfsError && <>Error: {divPfsError}</>}
      {tmntLoadStatus !== "loading" &&
        tmntLoadStatus !== "succeeded" &&
        tmntError && <>Error: {tmntLoadStatus}</>}
      {canRender && (
        <div className="container">
          <div className="divPfForm">
            <div className="justify-content-left">
              <div className="row">
                <h2>Prize Fund</h2>
              </div>          
              <h5>
                <div className="row">
                  <div className="col-5">Tournament:</div>
                  <div className="col-7">
                    {tmntData.tmnt.tmnt_name}
                  </div>
                </div>
                <div className="row">
                  <div className="col-5">Division:</div>
                  <div className="col-7">{divName}</div>
                </div>
              </h5>
            </div>
            <div className="row g-3 mb-0">
              <div className="col-md-5">
                <label htmlFor="inputPlayers" className="form-label">
                  Players
                </label>
              </div>
              <div className="col-md-4">
                <input
                  type="number"                
                  id="inputPlayers"
                  name="players"
                  className="form-control text-end numeric-align"
                  value={tmntData?.players?.length}
                  disabled={true}
                />
              </div>
            </div>
            <div className="row g-3 mb-0">
              <div className="col-md-5">
                <label htmlFor="inputRatio" className="form-label">
                  Cash Ratio. 1 in
                </label>
              </div>
              <div className="col-md-4">
                <input
                  type="number"
                  inputMode="numeric"
                  id="inputRatio"
                  name="ratio"
                  step="1"
                  min="1"
                  max="999"
                  className="form-control text-end"
                  value={ratioText}
                  onBlur={handleRatioBlur}
                  onChange={handleRatioChange}
                  onKeyDown={handleRatioKeyDown}
                />
                <div className="text-danger" data-testid="dangerRation">
                  {ratioErr}
                </div>
              </div>
            </div>
            <div className="row g-3 mb-0">
              <div className="col-md-5">
                <label htmlFor="calcCashers" className="form-label">
                  Calculated Cashers
                </label>
              </div>
              <div className="col-md-4">
                <input
                  type="number"
                  id="calcCashers"
                  name="calcCashers"
                  className="form-control text-end"
                  value={calcCashers.toFixed(2)}
                  disabled={true}
                />
                <div className="text-danger" data-testid="dangerCalcCashers">
                  {calcCashersErr}
                </div>
              </div>
            </div>
            <div className="row g-3 mb-0">
              <div className="col-md-5">
                <label htmlFor="cashers" className="form-label">
                  Cashers
                </label>
              </div>
              <div className="col-md-4">
                <input
                  type="number"
                  inputMode="numeric"
                  id="cashers"
                  name="cashers"
                  className="form-control text-end numeric-align"
                  step="1"
                  min="1"
                  max={numPlayers === 0 ? 1 : numPlayers}
                  value={cashers}
                  onBlur={handleCashersBlur}
                  onChange={handleCashersChange}
                  onKeyDown={handleCashersKeyDown}
                />
                <div className="text-danger" data-testid="dangerCashers">
                  {cashersErr}
                </div>
              </div>
            </div>
            <div className="row g-3 mb-0">
              <div className="col-md-5">
                <label htmlFor="prizeFund" className="form-label">
                  Prize Fund
                </label>
              </div>
              <div className="col-md-4">
                <EaCurrencyInput
                  id="prizeFund"
                  name="prizeFund"
                  className="form-control text-end money-align"
                  value={divPrizeFund}
                  disabled={true}
                />
                <div className="text-danger" data-testid="dangerCalcCashers">
                  {calcCashersErr}
                </div>
              </div>
            </div>
            <DivPrizeFundGrid
              rows={rows}
              setRows={setRows}              
              totalPrizeFund={divPrizeFund}
              enableEditing={true}
              gridDataWasChanged={gridDataWasChanged}
              onGridDataChanged={() => setGridDataWasChanged(true)}
              onGridDataReset={() => setGridDataWasChanged(false)}
              onNavigateAfterSave={() => setIsNavigatingAfterSave(true)}
              onBack={handleBack}
              onSaveComplete={(savedRows) => {
                setRows(savedRows);
                origRowsRef.current = savedRows.map((row) => ({ ...row }));
                setDataWasChanged(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
