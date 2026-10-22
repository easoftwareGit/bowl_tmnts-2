"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { useParams, useRouter } from "next/navigation";
import {
  fetchElimPfs,
  getElimPfsError,
  getElimPfsLoadStatus,
  getElimPfsRequestedTmntId,
  selectElimPfs,
} from "@/redux/features/elimPfs/elimPfsSlice";
import type { elimType, prizeFundEntryRow } from "@/lib/types/types";
import WaitModal from "@/components/modal/waitModal";
import {
  fetchTmntFullData,
  getTmntFullDataError,
  getTmntFullDataLoadStatus,
  selectTmntFullData,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import EaCurrencyInput from "@/components/currency/eaCurrencyInput";
import ElimPrizeFundGrid from "@/app/dataEntry/prizeFunds/prizeFundGrid/elim/elimPrizeFundGrid";
import type {
  PrizeFundGridHandle
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid";
import { populatePfRows } from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundRows";
import ModalConfirm from "@/components/modal/confirmModal";
import { initModalObj, modalObjectType } from "@/components/modal/modalObjType";
import { btDbUuid } from "@/lib/uuid";
import { getBrktOrElimName } from "@/lib/getName";
import { elimPfsToPrizeFunds } from "@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes";
import { truncateToTwoDecimals } from "@/lib/currency/convert";
import "../../../../prizeFund.css";

export default function ElimPrizeFundEntry() {
  const params = useParams();
  const tmntId = params.tmntId as string;
  const elimId = params.elimId as string;

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const elimPfsLoadStatus = useSelector(getElimPfsLoadStatus);
  const elimPfsError = useSelector(getElimPfsError);
  const elimPfsRequestedTmntId = useSelector(getElimPfsRequestedTmntId);

  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
  const tmntError = useSelector(getTmntFullDataError);

  const runTmntUrl = `/dataEntry/runTmnt/${tmntId}`;

  /**
   * Prevents Redux updates and rerenders from reinitializing the page
   * after the user has started editing.
   */
  const initializedRef = useRef(false);

  const allElimPfs = useSelector(selectElimPfs);
  const elimPfs = useMemo(
    () => allElimPfs.filter((elimPf) => elimPf.elim_id === elimId),
    [allElimPfs, elimId],
  );

  const tmntData = useSelector(selectTmntFullData);
  const gotElimPfsData = elimPfsRequestedTmntId === tmntId;
  const gotTmntData = tmntData?.tmnt?.id === tmntId;

  const elim = tmntData?.elims?.find((elim) => elim.id === elimId);
  const elimName = getBrktOrElimName(elim as elimType, tmntData?.divs || []);
  const elimEntryFees =
    tmntData?.moneys?.find(
      (money) =>
        money.descrip === "ENTRIES" &&
        money.flow === "IN" &&
        money.pot_id === null &&
        money.brkt_id === null &&
        money.elim_id === elimId,
    )?.amount ?? 0;

  const totalFees = elimEntryFees; // total fees this eliminator

  // sum the prize fund entries
  const savedPrizesTotal = useMemo(
    () => elimPfs.reduce((sum, elimPf) => sum + (elimPf.amount ?? 0), 0),
    [elimPfs],
  );

  // calc the expenses (totalFees - savedPrizesTotal)
  const initialExpenses =
    elimPfs.length > 0
      ? Math.max(Math.round((totalFees - savedPrizesTotal) * 100) / 100, 0)
      : 0;

  // Prize fund when the page loads: total fees minus recovered expenses.
  const initialPrizeFund = totalFees - initialExpenses;

  const elimEntries = tmntData?.elimEntries?.filter(
    (entry) => entry.elim_id === elimId,
  );
  const numPlayers = elimEntries?.length || 0;

  const [rows, setRows] = useState<prizeFundEntryRow[]>([]);

  const [cashers, setCashers] = useState(1);
  const [cashersErr, setCashersErr] = useState("");
  const [expensesText, setExpensesText] = useState("0.00");
  const [totalElimPrizeFund, setTotalElimPrizeFund] = useState(0);

  const [dataWasChanged, setDataWasChanged] = useState(false);
  const [gridDataWasChanged, setGridDataWasChanged] = useState(false);
  const [isNavigatingAfterSave, setIsNavigatingAfterSave] = useState(false);

  const [confModalObj, setConfModalObj] = useState<modalObjectType>(initModalObj);

  /**
   * Changing this key remounts ElimPrizeFundGrid.
   *
   * Cancel uses it to rebuild the Syncfusion grid from the saved rows.
   * Syncfusion does not reliably rebind a new dataSource while
   * batchCancel() is refreshing the grid, so rows added or removed by
   * changing cashers would otherwise remain.
   */
  const [gridKey, setGridKey] = useState(0);

  /** Last casher count applied to the grid. */
  const lastCashersRef = useRef(1);

  /** Last expenses value applied to the prize fund. */
  const lastExpensesRef = useRef(0);

  /**
   * Last saved (or initially loaded) state. Cancel restores these.
   * Unlike lastCashersRef/lastExpensesRef, these change only on load and save.
   */
  const savedRowsRef = useRef<prizeFundEntryRow[]>([]);
  const savedCashersRef = useRef(1);
  const savedExpensesRef = useRef(0);

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
   * ElimPrizeFundGrid forwards this ref to PrizeFundGrid. PrizeFundGrid then
   * uses useImperativeHandle to expose the methods defined by
   * PrizeFundGridHandle.
   */
  const prizeFundGridRef = useRef<PrizeFundGridHandle | null>(null);

  // Fetch elimPfs
  useEffect(() => {
    if (!tmntId) return;
    dispatch(fetchElimPfs(tmntId));
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
   * - expenses and prize fund
   * - refs containing the last applied and last saved values
   *
   * This initialization runs only once for this mounted page.
   */
  useEffect(() => {
    if (
      elimPfsLoadStatus !== "succeeded" ||
      elimPfsRequestedTmntId !== tmntId ||
      !gotTmntData
    ) {
      return;
    }
    if (initializedRef.current) return; // run only once

    const numCashers = elimPfs.length;
    const prizeFunds = elimPfsToPrizeFunds(elimPfs);
    const currentRows = populatePfRows(
      prizeFunds,
      elimId,
      initialPrizeFund,
      numCashers,
    );

    setRows(currentRows);
    setCashers(numCashers);
    setExpensesText(initialExpenses.toFixed(2));
    setTotalElimPrizeFund(initialPrizeFund);

    lastCashersRef.current = numCashers;
    lastExpensesRef.current = initialExpenses;

    savedRowsRef.current = currentRows.map((row) => ({ ...row }));
    savedCashersRef.current = numCashers;
    savedExpensesRef.current = initialExpenses;

    initializedRef.current = true;
  }, [
    elimPfsLoadStatus,
    elimPfsRequestedTmntId,
    gotTmntData,
    tmntId,
    elimPfs,
    elimId,
    initialPrizeFund,
    initialExpenses,
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
    const button = target.closest('#elimPfGrid [id$="undo_all"]');
    return button !== null && button.getAttribute("aria-disabled") !== "true";
  };

  /**
   * Records a mousedown on the grid's Cancel button before the
   * Cashers/Expenses input blurs.
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

    setConfModalObj(initModalObj); // reset modal object (hides modal)
  };

  /**
   * Closes the remove-cashers confirmation modal without changing the rows,
   * and restores the input to the casher count currently applied to the grid.
   *
   * @returns void
   */
  const confirmNo = (): void => {
    setCashers(lastCashersRef.current);
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

      return; // pending confirmation
    }

    if (value === actualCashers) return; // nothing to change

    const currentRows = getCurrentPrizeFundRows();
    const numToAdd = value - currentRows.length;

    if (numToAdd <= 0) return; // nothing to add

    const updatedRows = currentRows.map((row) => ({ ...row }));
    let position = currentRows.length + 1;

    for (let i = 0; i < numToAdd; i++) {
      updatedRows.push({
        id: btDbUuid("epf"),
        parent_id: elimId,
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
   * @returns {number} - The casher count restricted to the valid range.
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
    /*
     * An unparseable value (e.g. a browser that reports "" for
     * invalid number input) leaves the grid unchanged and restores
     * the last applied casher count in the input.
     */
    if (Number.isNaN(value)) {
      setCashers(lastCashersRef.current);
      setCashersErr("");
      return;
    }

    if (value === lastCashersRef.current) return;

    const safeValue = getSafeCashers(value);
    setCashersErr(
      safeValue !== value
        ? `Cashers must be a whole number between 1 and ${numPlayers <= 1 ? 1 : numPlayers}`
        : "",
    );

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
  };

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

  /**********************
   * Expenses Handlers  *
   **********************/

  /**
   * Restricts expenses to the valid range.
   *
   * The minimum expenses is 0.
   * The maximum expenses is the total fees, so the prize fund
   * (total fees - expenses) can never be negative.
   *
   * Values are rounded to two decimal places.
   *
   * @param value - expenses entered by the user.
   * @returns {number} - The expenses restricted to the valid range.
   */
  const getSafeExpenses = (value: number): number => {
    const maxExpenses = Math.max(totalFees, 0);
    const roundedValue = truncateToTwoDecimals(value);
    return Math.min(
      Math.max(roundedValue, 0),
      maxExpenses,
    );
  };

  /**
   * Applies expenses entered by the user.
   *
   * Both blur and Enter use this function so they apply the same minimum,
   * maximum, and rounding to two decimal validation.
   *
   * @param {number | null} value - expenses entered by the user.
   */
  const applyEnteredExpenses = (value: number | null): void => {
    const safeValue =
      value == null || Number.isNaN(value) ? 0 : getSafeExpenses(value);

    setExpensesText(safeValue.toFixed(2));
    setTotalElimPrizeFund(totalFees - safeValue);

    lastExpensesRef.current = safeValue;
  };

  /**
   * Applies the expenses when the input loses focus.
   *
   * If focus is moving to the grid's Cancel button, the typed value is
   * discarded and the input shows the last applied expenses.
   */
  const handleExpensesBlur = (e?: React.FocusEvent<HTMLInputElement>): void => {
    if (isFocusMovingToGridCancel(e?.relatedTarget ?? null)) {
      setExpensesText(lastExpensesRef.current.toFixed(2));
      return;
    }

    const enteredValue =
      expensesText === "" || expensesText === "."
        ? 0
        : Number(expensesText);

    applyEnteredExpenses(enteredValue);
  };

  /**
   * Updates the controlled expenses input while the user types.
   *
   * Changing the text does not change the prize fund until the value is
   * applied by blur.
   */
  const handleExpensesChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
      .replace(/\$/g, "")
      .replace(/,/g, "")
      .trim();

    // Allow: 1234   1234.   1234.5   1234.56   .50
    // Reject: 12.3.4   12abc
    if (!/^\d*\.?\d*$/.test(value)) {
      return;
    }

    setDataWasChanged(true);
    setExpensesText(value);
  };

  /**
   * Restores the page inputs and grid rows to the last saved state.
   *
   * Called by PrizeFundGrid after the user confirms Cancel.
   * The grid's batchCancel() reverts only cell edits. Rows added or removed
   * by changing cashers, and changes to expenses, must be restored here.
   */
  const handleGridCancel = (): void => {
    const savedCashers = savedCashersRef.current;
    const savedExpenses = savedExpensesRef.current;

    setRows(savedRowsRef.current.map((row) => ({ ...row })));
    setGridKey((key) => key + 1); // remount the grid with the saved rows

    setCashers(savedCashers);
    setExpensesText(savedExpenses.toFixed(2));
    setTotalElimPrizeFund(totalFees - savedExpenses);

    lastCashersRef.current = savedCashers;
    lastExpensesRef.current = savedExpenses;

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
    elimPfsLoadStatus === "loading" ||
    (!gotTmntData && tmntLoadStatus === "loading");

  const canRender =
    elimPfsLoadStatus === "succeeded" &&
    gotElimPfsData &&
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

      {elimPfsLoadStatus !== "loading" &&
        elimPfsLoadStatus !== "succeeded" &&
        elimPfsError && <>Error: {elimPfsError}</>}
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
                  <div className="col-5">Eliminator:</div>
                  <div className="col-7">{elimName}</div>
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
                  max={numPlayers === 0 ? 1 : numPlayers}
                  className="form-control text-end numeric-align"
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
                <label htmlFor="entryFees" className="form-label">
                  Entry Fees
                </label>
              </div>
              <div className="col-md-4">
                <EaCurrencyInput
                  id="entryFees"
                  name="entryFees"
                  className="form-control text-end money-align"
                  value={elimEntryFees}
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
                  value={totalElimPrizeFund}
                  disabled={true}
                />
              </div>
            </div>
            {/*
              Records a mousedown on the grid's Cancel button so the
              Cashers/Expenses blur handlers can skip applying a typed value.
              Does not call preventDefault, so focus works normally.
            */}
            <div onMouseDownCapture={handleGridMouseDownCapture}>
              <ElimPrizeFundGrid
                key={gridKey}
                ref={prizeFundGridRef}
                rows={rows}
                setRows={setRows}
                elimId={elimId}
                totalPrizeFund={totalElimPrizeFund}
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
                  savedExpensesRef.current = lastExpensesRef.current;

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
