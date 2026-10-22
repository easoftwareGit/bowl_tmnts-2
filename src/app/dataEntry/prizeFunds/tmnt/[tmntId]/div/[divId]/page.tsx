"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { useParams, useRouter } from "next/navigation";
import {
  fetchDivPfs,
  getDivPfsError,
  getDivPfsLoadStatus,
  selectDivPfs,
  getDivPfsRequestedTmntId,
} from "@/redux/features/divPfs/divPfsSlice";
import type { prizeFundEntryRow } from "@/lib/types/types";
import WaitModal from "@/components/modal/waitModal";
import {
  fetchTmntFullData,
  getTmntFullDataError,
  getTmntFullDataLoadStatus,
  selectTmntFullData,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import EaCurrencyInput from "@/components/currency/eaCurrencyInput";
import DivPrizeFundGrid from "@/app/dataEntry/prizeFunds/prizeFundGrid/div/divPrizeFundGrid";
import type {
  PrizeFundGridHandle
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid";
import { populatePfRows } from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundRows";
import ModalConfirm from "@/components/modal/confirmModal";
import { initModalObj, modalObjectType } from "@/components/modal/modalObjType";
import { btDbUuid } from "@/lib/uuid";
import { defaultRatio } from "@/lib/validation/constants";
import { divPfsToPrizeFunds } from "@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes";
import "../../../../prizeFund.css";

// http://localhost:3000/dataEntry/prizeFunds/tmnt/tmt_d237a388a8fc4641a2e37233f1d6bebd/div/div_99a3cae28786485bb7a036935f0f6a0a

export default function DivPrizeFundEntry() {
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

  /**
   * Prevents Redux updates and rerenders from reinitializing the page
   * after the user has started editing.
   */
  const initializedRef = useRef(false);
  
  const allDivPfs = useSelector(selectDivPfs);
  const divPfsRequestedTmntId = useSelector(getDivPfsRequestedTmntId);
  const divPfs = useMemo(
    () => allDivPfs.filter((divPf) => divPf.div_id === divId),
    [allDivPfs, divId],
  );

  const tmntData = useSelector(selectTmntFullData);
  const gotTmntData = tmntData.tmnt.id === tmntId;

  const divName = tmntData.divs.find((div) => div.id === divId)?.div_name;
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

  const numPlayers = tmntData.players.length;

  const [rows, setRows] = useState<prizeFundEntryRow[]>([]);

  const [ratio, setRatio] = useState(defaultRatio);
  const [ratioText, setRatioText] = useState(defaultRatio.toFixed(2));
  const [ratioErr, setRatioErr] = useState("");
  const [calcCashers, setCalcCashers] = useState(0);  
  const [cashers, setCashers] = useState(1);
  const [cashersErr, setCashersErr] = useState("");

  const [dataWasChanged, setDataWasChanged] = useState(false);
  const [gridDataWasChanged, setGridDataWasChanged] = useState(false);
  const [isNavigatingAfterSave, setIsNavigatingAfterSave] = useState(false);

  const [confModalObj, setConfModalObj] = useState<modalObjectType>(initModalObj);

  /**
   * Changing this key remounts DivPrizeFundGrid.
   *
   * Cancel uses it to rebuild the Syncfusion grid from the saved rows.
   * Syncfusion does not reliably rebind a new dataSource while
   * batchCancel() is refreshing the grid, so rows added or removed by
   * changing cashers/ratio would otherwise remain.
   */
  const [gridKey, setGridKey] = useState(0);

  const lastRatioRef = useRef(defaultRatio);
  const lastCashersRef = useRef(1);

  /**
   * Last saved (or initially loaded) state. Cancel restores these.
   * Unlike lastRatioRef/lastCashersRef, these change only on load and save.
   */
  const savedRowsRef = useRef<prizeFundEntryRow[]>([]);
  const savedRatioRef = useRef(defaultRatio);
  const savedCashersRef = useRef(1);  

  /**
   * Ref to the public methods exposed by PrizeFundGrid.
   *
   * The Syncfusion grid keeps unsaved batch edits internally. Therefore,
   * the page's rows state may not contain the most recent cell edits.
   *
   * Before adding or removing cashers, the page calls
   * prizeFundGridRef.current.getCurrentRows() to retrieve the rows currently
   * shown in the grid, including unsaved batch edits.
   *
   * DivPrizeFundGrid forwards this ref to PrizeFundGrid. PrizeFundGrid then
   * uses useImperativeHandle to expose the methods defined by
   * PrizeFundGridHandle.
   */
  const prizeFundGridRef = useRef<PrizeFundGridHandle | null>(null);

  // Fetch divPfs
  useEffect(() => {
    if (!tmntId) return;
    dispatch(fetchDivPfs(tmntId));
  }, [tmntId, dispatch]);

  // Fetch tournament if missing
  useEffect(() => {
    if (tmntId && !gotTmntData) {
      dispatch(fetchTmntFullData(tmntId));
    }
  }, [tmntId, dispatch, gotTmntData]);

  /**
   * Initializes the editable page state after the required Redux data loads.
   *
   * initializedRef prevents later Redux updates or rerenders from replacing
   * the user's in-progress edits with the original database rows.
   *
   * The effect initializes:
   * - prize-fund rows
   * - number of cashers
   * - player-to-casher ratio
   * - calculated cashers
   * - refs containing the last applied ratio and casher count
   *
   * This initialization runs only once for this mounted page.
   */
  useEffect(() => {
    if (
      divPfsLoadStatus !== "succeeded" ||
      divPfsRequestedTmntId !== tmntId ||
      !gotTmntData
    )
      return;
    if (initializedRef.current) return; // run only once

    const numCashers = divPfs.length;    
    const prizeFunds = divPfsToPrizeFunds(divPfs);
    const currentRows = populatePfRows(prizeFunds, divId, divPrizeFund, numCashers);    

    setRows(currentRows);    
    setCashers(numCashers);    

    if (numCashers > 0) {
      const currentRatio = numPlayers / numCashers;
      setRatio(currentRatio);
      lastRatioRef.current = currentRatio;      
      setRatioText(currentRatio.toFixed(2));   
      setCalcCashers(numCashers);
      lastCashersRef.current = numCashers;
    } else {
      setRatio(0);
      lastRatioRef.current = 0;
      setRatioText("0.00");      
      setCalcCashers(0);
      lastCashersRef.current = 0;
    }

    savedRowsRef.current = currentRows.map((row) => ({ ...row }));
    savedCashersRef.current = numCashers;
    savedRatioRef.current = numCashers > 0 ? numPlayers / numCashers : 0;    

    initializedRef.current = true;
  }, [
    divPfsLoadStatus,
    divPfsRequestedTmntId,
    gotTmntData,
    tmntId,
    divPfs,
    divId,
    divPrizeFund,
    numPlayers,
    setRows,
    setCashers,
    setCalcCashers,
    setRatio,
  ]);

  /**
   * Returns the rows currently displayed by the grid.
   *
   * While the user is batch editing, Syncfusion stores pending edits inside
   * the grid. Those edits may not yet exist in the page's rows state.
   *
   * If the grid ref is available, getCurrentRows() returns the displayed rows
   * with pending batch edits merged in. The rows state is used only as a
   * fallback before the grid ref is available.
   *
   * @returns Current prize-fund rows, including unsaved grid edits.
   */
  const getCurrentPrizeFundRows = (): prizeFundEntryRow[] => {
    return prizeFundGridRef.current?.getCurrentRows() ??
      rows.map((row) => ({ ...row }));
  };

  /**
   * True from the moment the grid's Cancel button is pressed until the
   * current event finishes. Set by handleGridMouseDownCapture.
   *
   * Safari does not focus buttons on click, so blur's relatedTarget is null
   * there. Recording the mousedown works in every browser because mousedown
   * fires before the input's blur.
   */
  const gridCancelPressedRef = useRef(false);

  /**
   * Returns true if the element is (or is inside) the grid's enabled
   * Cancel toolbar button.
   *
   * @param target - Element from a mouse or focus event.
   * @returns true for an enabled Cancel button.
   */
  const isGridCancelButton = (target: EventTarget | null): boolean => {
    if (!(target instanceof Element)) return false;
    const button = target.closest('#divPfGrid [id$="undo_all"]');
    return button !== null && button.getAttribute("aria-disabled") !== "true";
  };

  /**
   * Records a mousedown on the grid's Cancel button before the
   * Ratio/Cashers input blurs.
   *
   * The flag is cleared after the current event finishes, so it only
   * affects the blur caused by this mousedown.
   */
  const handleGridMouseDownCapture = (
    e: React.MouseEvent<HTMLDivElement>,
  ): void => {
    if (!isGridCancelButton(e.target)) return;

    gridCancelPressedRef.current = true;
    setTimeout(() => {
      gridCancelPressedRef.current = false;
    }, 0);
  };

  /**
   * Returns true when the current blur was caused by clicking the grid's
   * Cancel button.
   *
   * @param relatedTarget - e.relatedTarget from the blur event.
   * @returns true if the user is moving to the grid's Cancel button.
   */
  const isFocusMovingToGridCancel = (
    relatedTarget: EventTarget | null,
  ): boolean =>
    gridCancelPressedRef.current || isGridCancelButton(relatedTarget);

  /******************
   * modal Handlers *
   ******************/

  /**
   * Confirms a reduction in the number of cashers.
   *
   * The modal id contains the requested number of cashers.
   *
   * Before removing rows, getCurrentPrizeFundRows() retrieves the rows
   * currently shown in Syncfusion, including unsaved batch edits. This
   * prevents edited amounts from being replaced by the original React rows.
   *
   * @returns void
   */
  const confirmYes = async (): Promise<void> => {
    const value = Number(confModalObj.id);    
    const currentRows = getCurrentPrizeFundRows();

    setDataWasChanged(true);
    setRows(currentRows.slice(0, value));
    setCashers(value);

    lastCashersRef.current = value;
    lastRatioRef.current = ratio;

    setConfModalObj(initModalObj);  // reset modal object (hides modal)    
  };

  /**
   * Closes the remove-cashers confirmation modal without changing the rows.
   * 
   * @returns void
   */
  const confirmNo = (): void => {
    const appliedRatio = lastRatioRef.current;

    setRatio(appliedRatio);
    setRatioText(appliedRatio.toFixed(2));
    setCalcCashers(appliedRatio > 0 ? numPlayers / appliedRatio : 0);
    setCashers(lastCashersRef.current);

    setRatioErr("");
    setCashersErr("");
    
    setConfModalObj(initModalObj); // hides modal
  };

  /**
   * Applies a requested number of cashers to the prize-fund grid.
   *
   * When reducing the number of cashers, the function opens a confirmation
   * modal before removing rows.
   *
   * When increasing the number of cashers, it first retrieves the grid's
   * current rows, including unsaved batch edits, and then appends new rows.
   * This preserves amounts already edited by the user.
   *
   * @param {number} value - Requested number of cashers.
   * @returns {boolean} - whether the number of cashers has changed. 
   */
  const updateCashers = (value: number): boolean  => {
    const actualCashers = rows.length;

    if (value < actualCashers) {
      const removeCount = actualCashers - value;

      setConfModalObj({
        show: true,
        id: String(value),
        title: "Remove Cashers",
        message:
          `Do you want to remove ${removeCount} cashers? ` +
          `Going from ${actualCashers} cashers to ${value} cashers.`,
      });

      return false; // pending confirmation
    }

    if (value === actualCashers) return true; // nothing to change    

    const currentRows = getCurrentPrizeFundRows();
    const numToAdd = value - currentRows.length;

    if (numToAdd <= 0) return true; // nothing to add    

    const updatedRows = currentRows.map((row) => ({ ...row }));
    let position = currentRows.length + 1;

    for (let i = 0; i < numToAdd; i++) {
      updatedRows.push({
        id: btDbUuid("dpf"),
        parent_id: divId,
        position,
        amount: 0,
        percentage: 0,
      });

      position++;
    }

    setDataWasChanged(true);
    setRows(updatedRows);
    setCashers(value);

    lastCashersRef.current = value;
    return true;
  };
  
  /******************
   * Ratio Handlers *
   ******************/

  /**
   * Applies a player-to-casher ratio.
   *
   * The ratio determines the requested number of cashers:
   *
   *   cashers = floor(number of players / ratio)
   *
   * updateCashers() then adds rows immediately or asks for confirmation
   * before removing rows.
   *
   * @param value - New player-to-casher ratio.
   */
  const applyRatio = (value: number): void => {    

    const newRatio = isNaN(value) ? 0 : value;

    setRatio(newRatio);
    setRatioText(newRatio.toFixed(2));
    setCalcCashers(newRatio > 0 ? numPlayers / newRatio : 0);

    const applied = updateCashers(
      newRatio > 0 ? Math.floor(numPlayers / newRatio) : 0,
    );

    // When a reduction is pending, confirmYes updates the ref.
    if (applied) {
      lastRatioRef.current = newRatio;
    }
  };

  /**
   * Recalculates the player-to-casher ratio from a casher count.
   *
   * @param {number} value - New casher count
   * @returns {number} - New player-to-casher ratio
   */
  const updateRatioFromCashers = (value: number): number => {
    const newRatio = !isNaN(value) && value > 0 ? numPlayers / value : 0;

    setRatio(newRatio);
    setRatioText(newRatio.toFixed(2));
    setCalcCashers(newRatio > 0 ? numPlayers / newRatio : 0);

    return newRatio;
  }  

  /**
   * Compares two ratios at the precision shown in the input (2 decimals).
   * 
   * @param a - First ratio to compare.
   * @param b - Second ratio to compare.
   * @returns True if the ratios are numerically equal.
   */
  const isSameRatio = (a: number, b: number): boolean =>
    a.toFixed(2) === b.toFixed(2);

  /** 
   * Restricts a ratio to the valid range. 
   * 
   * The minimum ratio is 1. 
   * The maximum ratio is the number of players, unless there are zero or one 
   * players, in which case the maximum remains 1. 
   * 
   * @param value - Ratio value entered by the user. 
   * @returns The ratio restricted to the valid range. 
   */
  const getSafeRatio = (value: number): number => {
    const maxRatio =
      numPlayers <= 1
        ? 1
        : numPlayers;
    return Math.min(
      Math.max(value, 1),
      maxRatio,
    );
  };

  /** 
  * Applies a ratio entered by the user. 
  * 
  * Both blur and Enter use this function so they apply the same minimum and 
  * maximum validation. 
  * 
  * @param value - Ratio value entered by the user. 
  */ 
  const applyEnteredRatio = (value: number): void => {
    if (isSameRatio(value, lastRatioRef.current)) {
      setRatioText(lastRatioRef.current.toFixed(2));
      setRatioErr("");
      return;
    }

    const safeValue = getSafeRatio(isNaN(value) ? 0 : value);
    setRatioErr(
      safeValue !== value
        ? `Ratio must be between 1 and ${numPlayers <= 1 ? 1 : numPlayers}`
        : "",
    );

    if (!isSameRatio(safeValue, lastRatioRef.current)) {
      applyRatio(safeValue);
    } else {
      setRatioText(safeValue.toFixed(2));
    }
  };

  /**
   * Applies the ratio when the ratio input loses focus.
   *
   * If focus is moving to the grid's Cancel button, the typed value is
   * discarded and the input shows the last applied ratio. The user is
   * cancelling, so there is nothing to apply.
   */
  const handleRatioBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    if (isFocusMovingToGridCancel(e.relatedTarget)) {
      const appliedRatio = lastRatioRef.current;
      setRatio(appliedRatio);
      setRatioText(appliedRatio.toFixed(2));
      setRatioErr("");
      return;
    }

    applyEnteredRatio(Number(e.target.value));
  };

  /**
   * Updates the controlled ratio input while the user types.
   *
   * Only digits and one decimal point are accepted. Changing the text does
   * not resize the grid until the value is applied by blur or Enter.
   */
  const handleRatioChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setDataWasChanged(true);    
    setRatioErr("");
    
    const text = e.target.value;

    // allow only digits and one decimal point
    if (!/^\d*\.?\d*$/.test(text)) {
      return;
    }

    setRatioText(text);
    const value = Number(text);    
    setRatio(isNaN(value) ? 0 : value);
  };  

  /**
   * Applies the ratio when the user presses Enter.
   */  
  const handleRatioKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key !== "Enter") {
      return;
    }    
    applyEnteredRatio(Number(e.currentTarget.value),);    
  };
  
  /********************
   * Casher Handlers  *
   ********************/

  /** 
  * Restricts a casher count to the valid range. 
  * 
  * The minimum number of cashers is 1. 
  * The maximum number of cashers is the number of players, unless there are 
  * zero or one players, in which case the maximum remains 1. 
  * 
  * Decimal values are truncated because the casher count must be a whole 
  * number. 
  * 
  * @param value - Casher count entered by the user. 
  * @returns The casher count restricted to the valid range. 
  */ 
  const getSafeCashers = (value: number): number => { 
    const maxCashers = numPlayers <= 1 ? 1 : numPlayers; 
    const wholeNumberValue = Math.trunc(value); 
    return Math.min( 
      Math.max(wholeNumberValue, 1), 
      maxCashers, 
    ); 
  };

  /** 
  * Applies a casher count entered by the user. 
  * 
  * Both blur and Enter use this function so they apply the same minimum, 
  * maximum, and whole-number validation. 
  * 
  * When the safe value decreases the number of cashers, updateCashers() 
  * opens the confirmation modal. The rows are not removed until the user 
  * confirms the change. 
  * 
  * @param value - Casher count entered by the user. 
  */ 
  const applyEnteredCashers = ( value: number ): void => { 
   
    if (value === lastCashersRef.current) return; 
    
    const safeValue = getSafeCashers(isNaN(value) ? 0 : value); 
    setCashersErr(
      safeValue !== value
        ? `Cashers must be a whole number between 1 and ${numPlayers <= 1 ? 1 : numPlayers}`
        : "",
    );    
    if (safeValue !== lastCashersRef.current) { 
      const applied = updateCashers(safeValue);
      const newRatio = updateRatioFromCashers(safeValue);

      if (applied) {
        lastRatioRef.current = newRatio;
      }
    } else { 
      /* 
      * Restore the controlled input when the entered value is outside the 
      * valid range but resolves to the casher count already applied. 
      * 
      * Example: the current casher count is 1 and the user enters 0. 
      */ 
      setCashers(safeValue); 
    } 
  }
  
  /**
   * Applies the casher count when the input loses focus.
   *
   * If focus is moving to the grid's Cancel button, the typed value is
   * discarded and the input shows the last applied casher count.
   */
  const handleCashersBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    if (isFocusMovingToGridCancel(e.relatedTarget)) {
      setCashers(lastCashersRef.current);
      setCashersErr("");
      return;
    }

    applyEnteredCashers(Number(e.target.value));
  };

  /**
   * Updates the controlled casher input while the user types.
   *
   * Only whole-number digits are accepted. Changing the input does not resize
   * the grid until the value is applied by blur or Enter.
   */  
  const handleCashersChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setDataWasChanged(true);
    setCashersErr("");

    const text = e.target.value;
    if (text === "") {
      setCashers(0);
      return;
    }

    // allow only digits
    if (!/^\d+$/.test(text)) {
      return;
    }

    setCashers(Number(text));
  };  

  /**
   * Applies the casher count when the user presses Enter.
   */  
  const handleCashersKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (e.key !== "Enter") {
      return;
    }

    applyEnteredCashers(Number(e.currentTarget.value));
  };

  /**
   * Restores the page inputs and grid rows to the last saved state.
   *
   * Called by PrizeFundGrid after the user confirms Cancel.
   * The grid's batchCancel() reverts only cell edits. Rows added or removed
   * by changing cashers/ratio must be restored here.
   */
  const handleGridCancel = (): void => {
    const savedRatio = savedRatioRef.current;
    const savedCashers = savedCashersRef.current;

    setRows(savedRowsRef.current.map((row) => ({ ...row })));
    setGridKey((key) => key + 1);   // remount the grid with the saved rows

    setRatio(savedRatio);
    setRatioText(savedRatio.toFixed(2));
    setCalcCashers(savedRatio > 0 ? numPlayers / savedRatio : 0);
    setCashers(savedCashers);

    lastRatioRef.current = savedRatio;
    lastCashersRef.current = savedCashers;

    setRatioErr("");
    setCashersErr("");
    setDataWasChanged(false);
  };

  /**
   * Returns to the Run Tournament page.
   *
   * The user must confirm navigation when either the page inputs or the
   * Syncfusion grid contain unsaved changes.
   */
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

  useUnsavedChangesGuard((dataWasChanged || gridDataWasChanged) && !isNavigatingAfterSave);

  /**
   * Navigates to the Run Tournament page after Save and Close completes.
   *
   * isNavigatingAfterSave disables the unsaved-changes guard so the completed
   * save does not cause an unnecessary navigation warning.
   */
  useEffect(() => {
    if (!isNavigatingAfterSave) return;
    if (dataWasChanged) return;
    if (!tmntId) return;

    router.push(runTmntUrl);
  }, [isNavigatingAfterSave, dataWasChanged, tmntId, router, runTmntUrl]);

  const isLoading =
    divPfsLoadStatus === "loading" ||
    (!gotTmntData && tmntLoadStatus === "loading");

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
        tmntError && <>Error: {tmntError}</>}
      {canRender && (
        <div className="container">
          <div className="prizeFundForm">
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
                  value={numPlayers}
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
                <div className="text-danger" data-testid="dangerRatio">
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
              </div>
            </div>
            {/*
              Records a mousedown on the grid's Cancel button so the
              Ratio/Cashers blur handlers can skip applying a typed value.
              Does not call preventDefault, so focus works normally.
            */}
            <div onMouseDownCapture={handleGridMouseDownCapture}>
              <DivPrizeFundGrid
                key={gridKey}
                ref={prizeFundGridRef}
                rows={rows}
                setRows={setRows}
                divId={divId}
                totalPrizeFund={divPrizeFund}
                enableEditing={true}
                gridDataWasChanged={dataWasChanged || gridDataWasChanged}
                onGridDataChanged={() => setGridDataWasChanged(true)}
                onGridDataReset={() => setGridDataWasChanged(false)}
                onNavigateAfterSave={() => setIsNavigatingAfterSave(true)}
                onBack={handleBack}
                onCancel={handleGridCancel}
                onSaveComplete={(savedRows) => {
                  savedRowsRef.current = savedRows.map((row) => ({ ...row }));
                  savedCashersRef.current = savedRows.length;
                  savedRatioRef.current = lastRatioRef.current;

                  setRows(savedRows);
                  setDataWasChanged(false);
                  setGridDataWasChanged(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
