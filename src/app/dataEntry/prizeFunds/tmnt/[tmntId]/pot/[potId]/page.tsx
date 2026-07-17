"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { useParams, useRouter } from "next/navigation";
import {
  fetchPotPfs,
  getPotPfsError,
  getPotPfsLoadStatus,  
} from "@/redux/features/potPfs/potPfsSlice";
import type { prizeFundEntryRow } from "@/lib/types/types";
import WaitModal from "@/components/modal/waitModal";
import {
  fetchTmntFullData,
  getTmntFullDataError,
  getTmntFullDataLoadStatus,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import EaCurrencyInput from "@/components/currency/eaCurrencyInput";
import PotPrizeFundGrid from "@/app/dataEntry/prizeFunds/prizeFundGrid/pot/potPrizeFundGrid";
import type {
  PrizeFundGridHandle
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid";
import { populatePfRows } from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundRows";
import ModalConfirm from "@/components/modal/confirmModal";
import { initModalObj, modalObjectType } from "@/components/modal/modalObjType";
import { btDbUuid } from "@/lib/uuid";
import { getPotName } from "@/lib/getName";
import { potPfsToPrizeFunds } from "@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes";
import "../../../../prizeFund.css";
import { moneyNumber } from "@/lib/currency/convert";

export default function PotPrizeFundEntry() {
  const params = useParams();
  const tmntId = params.tmntId as string;
  const potId = params.potId as string;  

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const potPfsLoadStatus = useSelector(getPotPfsLoadStatus);
  const potPfsError = useSelector(getPotPfsError);
  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
  const tmntError = useSelector(getTmntFullDataError);

  const runTmntUrl = `/dataEntry/runTmnt/${tmntId}`;

  // so only initialize state once when data first becomes available
  // prevents the page from reinitializing state multiple times.
  // redux updates, rerenders, async fetches could overwrite user edits
  const initializedRef = useRef(false);

  const potPfs = useSelector((state: RootState) => state.potPfs.potPfs);
  const tmntData = useSelector(
    (state: RootState) => state.tmntFullData.tmntFullData,
  );
  const pot = tmntData?.pots?.find((pot) => pot.id === potId);
  
  const potName = getPotName(pot, tmntData?.divs || []); 
  const games = tmntData?.events[0]?.games || 0;
  const potEntryFees =
    tmntData.moneys.find(
      (money) =>        
        money.descrip === "ENTRIES" &&
        money.flow === "IN" &&
        money.pot_id === potId &&
        money.brkt_id === null &&
        money.elim_id === null,
    )?.amount ?? 0;
  const potPrizeFund =
    tmntData.moneys.find(
      (money) =>        
        money.descrip === "PRIZEFUND" &&
        money.flow === "OUT" &&
        money.pot_id === potId &&
        money.brkt_id === null &&
        money.elim_id === null,
    )?.amount ?? 0;
  const potExpenses =
    tmntData.moneys.find(
      (money) =>        
        money.descrip === "EXPENSES" &&
        money.flow === "OUT" &&
        money.pot_id === potId &&
        money.brkt_id === null &&
        money.elim_id === null,
    )?.amount ?? 0;

  const potEntries = tmntData?.potEntries?.filter((entry) => entry.pot_id === potId);
  const numPlayers = potEntries?.length || 0;

  const [rows, setRows] = useState<prizeFundEntryRow[]>([]);

  // get original rows for change detection (useRef -> no re-renders)
  const origRowsRef = useRef<prizeFundEntryRow[]>([]);
  
  const [cashers, setCashers] = useState(1);
  const [cashersErr, setCashersErr] = useState("");
  const [expenses, setExpenses] = useState(potExpenses);  
  const [expensesText, setExpensesText] = useState(potExpenses.toFixed(2));
  const [allGamesPrizeFund, setAllGamesPrizeFund] = useState(potEntryFees - potExpenses);
  const [expensesErr, setExpensesErr] = useState("");
  const [prizeFund, setPrizeFund] = useState(0);
  const [perGame, setPerGame] = useState(0);

  const [dataWasChanged, setDataWasChanged] = useState(false);
  const [gridDataWasChanged, setGridDataWasChanged] = useState(false);
  const [isNavigatingAfterSave, setIsNavigatingAfterSave] = useState(false);

  const [confModalObj, setConfModalObj] = useState<modalObjectType>(initModalObj);
  const lastCashersRef = useRef(1);
  const lastExpensesRef = useRef(0);

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
   * PotPrizeFundGrid forwards this ref to PrizeFundGrid. PrizeFundGrid then
   * uses useImperativeHandle to expose the methods defined by
   * PrizeFundGridHandle.
   */
  const prizeFundGridRef = useRef<PrizeFundGridHandle | null>(null);

  // Fetch potPfs
  useEffect(() => {
    if (!potId) return;
    dispatch(fetchPotPfs(potId));
  }, [potId, dispatch]);

  // Fetch tournament if missing
  useEffect(() => {
    if ((!tmntData || tmntData.tmnt.id !== tmntId) && tmntId) {
      dispatch(fetchTmntFullData(tmntId));
    }
  }, [tmntData, tmntId, dispatch]);

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
      potPfsLoadStatus !== "succeeded" ||
      !tmntData ||
      tmntData.tmnt.id !== tmntId
    )
      return;
    if (initializedRef.current) return; // run only once

    const calcPerGame = games > 0 ? potPrizeFund / games : 0;    
    const numCashers = potPfs.length;    
    const prizeFunds = potPfsToPrizeFunds(potPfs);
    const currentRows = populatePfRows(prizeFunds, potId, calcPerGame, numCashers);    

    setRows(currentRows);
    origRowsRef.current = currentRows;
    setCashers(numCashers);    
    setExpenses(potExpenses);
    setExpensesText(potExpenses.toFixed(2));
    setPrizeFund(potPrizeFund);
    setPerGame(calcPerGame);

    if (numCashers > 0) {
      lastCashersRef.current = numCashers;
    } else {
      lastCashersRef.current = 0;
    }
    if (potExpenses > 0) {
      lastExpensesRef.current = potExpenses;
    } else {
      lastExpensesRef.current = 0;
    }

    initializedRef.current = true;
  }, [
    potPfsLoadStatus,
    tmntData,    
    tmntId,
    potPfs,
    potId,
    potPrizeFund,
    potExpenses,
    games,
    setRows,
    setCashers,
    setExpenses,
    setExpensesText,
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
    const value = Number(confModalObj.id) 
    const currentRows = getCurrentPrizeFundRows();

    setDataWasChanged(true);
    setRows(currentRows.slice(0, value));
    setCashers(value);

    lastCashersRef.current = value;

    setConfModalObj(initModalObj); // reset modal object (hides modal)    
    return;
  };

  /**
   * Closes the remove-cashers confirmation modal without changing the rows.
   * 
   * @returns void
   */
  const confirmNo = (): void => {
    setConfModalObj(initModalObj); // reset modal object (hides modal)
  };

  const gotTmntData = tmntData.tmnt.id === tmntId;

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
   * @param value - Requested number of cashers.
   */
  const updateCashers = (value: number): void => {
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

      return;
    }

    if (value <= actualCashers) return;

    const currentRows = getCurrentPrizeFundRows();
    const numToAdd = value - currentRows.length;

    if (numToAdd <= 0) return;

    const updatedRows = currentRows.map((row) => ({ ...row }));
    let position = currentRows.length + 1;

    for (let i = 0; i < numToAdd; i++) {
      updatedRows.push({
        id: btDbUuid("ppf"),
        parent_id: potId,
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
  const applyEnteredCashers = (value: number): void => {    
    if (isNaN(value)) { 
      updateCashers(0);       
      return; 
    } 
    
    const safeValue = getSafeCashers(value); 
    if (safeValue !== lastCashersRef.current) { 
      updateCashers(safeValue);     
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
   * The grid is changed only when the value differs from the last applied
   * casher count.
   */  
  const handleCashersBlur = (e: React.FocusEvent<HTMLInputElement>) => {

    applyEnteredCashers(Number(e.target.value));
  }

  /**
   * Updates the controlled casher input while the user types.
   *
   * Only whole-number digits are accepted. Changing the input does not resize
   * the grid until the value is applied by blur or Enter.
   */  
  const handleCashersChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setDataWasChanged(true);

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

  /**********************
   * Expenses Handlers  *
   **********************/

  /** 
  * Restricts expenses to the valid range. 
  * 
  * The minimum expenses is 0. 
  * The maximum expenses is the potPrizeFund   
  * 
  * Values are truncated to two decimal places.
  * 
  * @param value - expenses entered by the user. 
  * @returns The expenses restricted to the valid range. 
  */ 
  const getSafeExpenses = (value: number): number => { 
    const maxExpenses = potPrizeFund <= 0 ? 0 : potPrizeFund; 
    const roundedValue = Math.trunc(value * 100) / 100;
    return Math.min(
      Math.max(roundedValue, 0), 
      maxExpenses,
    )
  };

  /** 
  * Applies expenses entered by the user. 
  * 
  * Both blur and Enter use this function so they apply the same minimum, 
  * maximum, and rounding to two decimal validation. 
  * 
  * @param value - expenses entered by the user. 
  */ 
  const applyEnteredExpenses = (value: number | null): void => {        
    if (value == null || Number.isNaN(value)) {
      setExpenses(0);
      setExpensesText("0.00");
      setAllGamesPrizeFund(potEntryFees);
      return;
    }

    const safeValue = getSafeExpenses(value);

    setExpenses(safeValue);
    setExpensesText(safeValue.toFixed(2));    
    lastExpensesRef.current = safeValue;    

    const allGamesPf = potEntryFees - safeValue;
    setAllGamesPrizeFund(allGamesPf);

    const newPerGame = (games > 0 ? allGamesPf / games : 0);

    console.log(newPerGame);
    
    setPerGame(newPerGame);    
  }

  const handleExpensesBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const enteredValue =
      expensesText === "" || expensesText === "."
        ? 0
        : Number(expensesText);

    applyEnteredExpenses(enteredValue);    
  }

  const handleExpensesChange = (e: React.ChangeEvent<HTMLInputElement>): void => {

    const formattedValue = e.target.value;
    const value = formattedValue
      .replace(/\$/g, "")
      .replace(/,/g, "")
      .trim()

    // Allow: 1234   1234.   1234.5   1234.56   .50
    // Reject: 12.3.4   12abc

    if (!/^\d*\.?\d*$/.test(value)) {
      return;
    }

    setDataWasChanged(true);
    setExpensesText(value);    
  };   

  /**
   * Returns to the Run Tournament page.
   * prompts the user if they have unsaved changes
   *
   * @return {*}  {void}
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

  // after save, if user tries to navigate away, 
  // don't want to show the unsaved changes prompt
  useEffect(() => {
    if (!isNavigatingAfterSave) return;
    if (dataWasChanged) return;
    if (!tmntId) return;

    router.push(runTmntUrl);
  }, [
    isNavigatingAfterSave,
    dataWasChanged,
    tmntId,      
    router,
    runTmntUrl
  ]);

  const isLoading =
    potPfsLoadStatus === "loading" ||
    (!tmntData && tmntLoadStatus === "loading");

  const canRender =
    potPfsLoadStatus === "succeeded" &&
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

      {potPfsLoadStatus !== "loading" &&
        potPfsLoadStatus !== "succeeded" &&
        potPfsError && <>Error: {potPfsError}</>}
      {tmntLoadStatus !== "loading" &&
        tmntLoadStatus !== "succeeded" &&
        tmntError && <>Error: {tmntLoadStatus}</>}      

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
                  <div className="col-5">Pot:</div>
                  <div className="col-7">{potName}</div>
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
                  value={potEntries?.length || 0}
                  disabled={true}
                />
              </div>
            </div>
            <div className="row g-3 mb-0">
              <div className="col-md-5">
                <label htmlFor="inputCashers" className="form-label">
                  Cashers
                </label>
              </div>
              <div className="col-md-4">
                <input
                  type="number"
                  inputMode="numeric"
                  id="inputCashers"
                  name="cashers"
                  step="1"
                  min="1"
                  max="999"
                  className="form-control text-end numeric-align"
                  value={cashers}
                  onBlur={handleCashersBlur}
                  onChange={handleCashersChange}
                  onKeyDown={handleCashersKeyDown}
                />
                <div className="text-danger" data-testid="dangerRation">
                  {cashersErr}
                </div>
              </div>
            </div>
            <div className="row g-3 mb-0">
              <div className="col-md-5">
                <label htmlFor="entryFees" className="form-label">
                  Entry Fees
                </label>
              </div>
              <div className="col-md-4">
                <EaCurrencyInput                  
                  id="entryFees"
                  name="entryFees"
                  className="form-control text-end money-align"
                  value={potEntryFees}
                  disabled={true}
                />
              </div>
            </div>
            <div className="row g-3 mb-0">
              <div className="col-md-5">
                <label htmlFor="expenses" className="form-label">
                  Expenses
                </label>
              </div>
              <div className="col-md-4">
                <EaCurrencyInput                                    
                  id="expenses"
                  name="expenses"
                  className="form-control text-end money-align"
                  value={expensesText}
                  onBlur={handleExpensesBlur}
                  onChange={handleExpensesChange}                  
                />
                <div className="text-danger" data-testid="dangerCashers">
                  {expensesErr}
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
                  value={allGamesPrizeFund}
                  disabled={true}
                />
              </div>
            </div>
            <div className="row g-3 mb-0">
              <div className="col-md-5">
                <label htmlFor="perGame" className="form-label">
                  Per Game
                </label>
              </div>
              <div className="col-md-4">
                <EaCurrencyInput
                  id="perGame"
                  name="perGame"
                  className="form-control text-end money-align"
                  value={perGame}
                  disabled={true}
                />
              </div>
            </div>
            <PotPrizeFundGrid
              ref={prizeFundGridRef}
              rows={rows}
              setRows={setRows}              
              totalPrizeFund={perGame}
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