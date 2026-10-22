"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { useParams, useRouter } from "next/navigation";
import {
  fetchPotPfs,
  getPotPfsError,
  getPotPfsLoadStatus,
  getPotPfsRequestedTmntId,
  selectPotPfs,
} from "@/redux/features/potPfs/potPfsSlice";
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
import { ptGame } from "@/lib/validation/constants";
import { truncateToTwoDecimals } from "@/lib/currency/convert";
import "../../../../prizeFund.css";

export default function PotPrizeFundEntry() {
  const params = useParams();
  const tmntId = params.tmntId as string;
  const potId = params.potId as string;

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const potPfsLoadStatus = useSelector(getPotPfsLoadStatus);
  const potPfsError = useSelector(getPotPfsError);
  const potPfsRequestedTmntId = useSelector(getPotPfsRequestedTmntId);

  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
  const tmntError = useSelector(getTmntFullDataError);

  const runTmntUrl = `/dataEntry/runTmnt/${tmntId}`;

  /**
   * Prevents Redux updates and rerenders from reinitializing the page
   * after the user has started editing.
   */
  const initializedRef = useRef(false);

  const allPotPfs = useSelector(selectPotPfs);
  const potPfs = useMemo(
    () => allPotPfs.filter((potPf) => potPf.pot_id === potId),
    [allPotPfs, potId],
  );

  const tmntData = useSelector(selectTmntFullData);
  const gotPotPfsData = potPfsRequestedTmntId === tmntId;
  const gotTmntData = tmntData?.tmnt?.id === tmntId;

  const pot = tmntData?.pots?.find((pot) => pot.id === potId);
  const potType = pot?.pot_type;
  const isGamePot = potType === ptGame;
  const potName = getPotName(pot, tmntData?.divs || []);

  const games = tmntData?.events?.[0]?.games ?? 0;

  const potEntryFees =
    tmntData?.moneys?.find(
      (money) =>
        money.descrip === "ENTRIES" &&
        money.flow === "IN" &&
        money.pot_id === potId &&
        money.brkt_id === null &&
        money.elim_id === null,
    )?.amount ?? 0;

  /**
   * Expenses money record for this pot. Used only when the pot has no
   * saved prize-fund rows yet (see initialExpenses).
   */
  const potExpenses =
    tmntData?.moneys?.find(
      (money) =>
        money.descrip === "EXPENSES" &&
        money.flow === "OUT" &&
        money.pot_id === potId &&
        money.brkt_id === null &&
        money.elim_id === null,
    )?.amount ?? 0;

  const totalFees = potEntryFees; // total fees this pot

  // sum the saved prize fund entries (per game for a game pot)
  const savedPrizesTotal = useMemo(
    () => potPfs.reduce((sum, potPf) => sum + (potPf.amount ?? 0), 0),
    [potPfs],
  );

  // a game pot's saved rows are for one game; scale to all games
  const savedAllGamesPrizes = isGamePot
    ? savedPrizesTotal * games
    : savedPrizesTotal;

  /**
   * Balances expenses so fees, expenses and payouts always add up.
   *
   * A game pot pays (prize fund / games) after every game. That per-game
   * amount is truncated to whole cents, and the cents lost to truncation
   * are moved into expenses. Afterwards:
   *
   *   fees = expenses + (perGame * games)   exactly
   *
   * Example: fees $100.00, expenses $0.00, 3 games
   *   per game  = $33.33
   *   prize fund = $33.33 * 3 = $99.99
   *   expenses   = $100.00 - $99.99 = $0.01
   *
   * Non-game pots pay the whole prize fund once, so nothing is moved.
   *
   * All math is done in integer cents to avoid floating-point drift.
   *
   * @param expenses - requested expenses (already within 0..fees)
   * @returns {{ expenses: number; prizeFund: number }} - balanced values
   */
  const balanceExpenses = (
    expenses: number,
  ): { expenses: number; prizeFund: number } => {
    const feesCents = Math.round(totalFees * 100);
    const expensesCents = Math.round(expenses * 100);
    const prizeFundCents = feesCents - expensesCents;

    if (!isGamePot || games <= 0) {
      return {
        expenses: expensesCents / 100,
        prizeFund: prizeFundCents / 100,
      };
    }

    const perGameCents = Math.floor(prizeFundCents / games);
    const balancedPrizeFundCents = perGameCents * games;

    return {
      expenses: (feesCents - balancedPrizeFundCents) / 100,
      prizeFund: balancedPrizeFundCents / 100,
    };
  };

  /**
   * Returns the prize fund for one game of a game pot.
   *
   * The prize fund is always balanced by balanceExpenses(), so it divides
   * evenly into whole cents; rounding only removes floating-point noise.
   *
   * @param allGamesPrizeFund - prize fund for all games
   * @returns {number} - per-game prize fund, or 0 if not a game pot
   */
  const calcPerGame = (allGamesPrizeFund: number): number =>
    isGamePot && games > 0
      ? Math.round((allGamesPrizeFund * 100) / games) / 100
      : 0;

  // Expenses when the page loads:
  // - saved rows: fees minus the saved payout (per-game rows * games)
  // - no saved rows yet: the pot's EXPENSES money record
  // Either way, balance them so the truncated cents land in expenses.
  const unbalancedInitialExpenses =
    potPfs.length > 0
      ? Math.max(totalFees - savedAllGamesPrizes, 0)
      : Math.min(Math.max(potExpenses, 0), Math.max(totalFees, 0));

  const {
    expenses: initialExpenses,
    prizeFund: initialPrizeFund,
  } = balanceExpenses(unbalancedInitialExpenses);

  const potEntries = tmntData?.potEntries?.filter(
    (entry) => entry.pot_id === potId,
  );
  const numPlayers = potEntries?.length || 0;

  const [rows, setRows] = useState<prizeFundEntryRow[]>([]);

  const [cashers, setCashers] = useState(1);
  const [cashersErr, setCashersErr] = useState("");
  const [expensesText, setExpensesText] = useState("0.00");
  const [totalPotPrizeFund, setTotalPotPrizeFund] = useState(0);

  // derived, so it is always in sync with totalPotPrizeFund
  const perGame = calcPerGame(totalPotPrizeFund);

  // a game pot's grid holds the prizes for one game
  const gridTotalPrizeFund = isGamePot ? perGame : totalPotPrizeFund;

  const [dataWasChanged, setDataWasChanged] = useState(false);
  const [gridDataWasChanged, setGridDataWasChanged] = useState(false);
  const [isNavigatingAfterSave, setIsNavigatingAfterSave] = useState(false);

  const [confModalObj, setConfModalObj] = useState<modalObjectType>(initModalObj);

  /**
   * Changing this key remounts PotPrizeFundGrid.
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
   * PotPrizeFundGrid forwards this ref to PrizeFundGrid. PrizeFundGrid then
   * uses useImperativeHandle to expose the methods defined by
   * PrizeFundGridHandle.
   */
  const prizeFundGridRef = useRef<PrizeFundGridHandle | null>(null);

  // Fetch potPfs
  useEffect(() => {
    if (!tmntId) return;
    dispatch(fetchPotPfs(tmntId));
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
   * - expenses and prize fund (per game is derived from the prize fund)
   * - refs containing the last applied and last saved values
   *
   * This initialization runs only once for this mounted page.
   */
  useEffect(() => {
    if (
      potPfsLoadStatus !== "succeeded" ||
      potPfsRequestedTmntId !== tmntId ||
      !gotTmntData
    ) {
      return;
    }
    if (initializedRef.current) return; // run only once

    const numCashers = potPfs.length;
    const prizeFunds = potPfsToPrizeFunds(potPfs);
    const initialGridTotal = isGamePot
      ? calcPerGame(initialPrizeFund)
      : initialPrizeFund;
    const currentRows = populatePfRows(
      prizeFunds,
      potId,
      initialGridTotal,
      numCashers,
    );

    setRows(currentRows);
    setCashers(numCashers);
    setExpensesText(initialExpenses.toFixed(2));
    setTotalPotPrizeFund(initialPrizeFund);

    lastCashersRef.current = numCashers;
    lastExpensesRef.current = initialExpenses;

    savedRowsRef.current = currentRows.map((row) => ({ ...row }));
    savedCashersRef.current = numCashers;
    savedExpensesRef.current = initialExpenses;

    initializedRef.current = true;
    // calcPerGame depends only on isGamePot and games, which are listed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    potPfsLoadStatus,
    potPfsRequestedTmntId,
    gotTmntData,
    tmntId,
    potPfs,
    potId,
    initialPrizeFund,
    initialExpenses,
    isGamePot,
    games,
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
    const button = target.closest('#potPfGrid [id$="undo_all"]');
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
   * Values are truncated to two decimal places.
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
   * For a game pot, the cents lost when the prize fund is split across
   * games are added to the entered expenses (see balanceExpenses), so the
   * Expenses input may show slightly more than was typed.
   *
   * Updates the prize fund. The per-game amount is derived from the prize
   * fund, so it updates automatically.
   *
   * @param {number | null} value - expenses entered by the user.
   */
  const applyEnteredExpenses = (value: number | null): void => {
    const safeValue =
      value == null || Number.isNaN(value) ? 0 : getSafeExpenses(value);

    const balanced = balanceExpenses(safeValue);

    setExpensesText(balanced.expenses.toFixed(2));
    setTotalPotPrizeFund(balanced.prizeFund);

    lastExpensesRef.current = balanced.expenses;
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

    // saved expenses are already balanced; this recomputes the matching
    // prize fund in integer cents
    const balanced = balanceExpenses(savedExpenses);

    setCashers(savedCashers);
    setExpensesText(balanced.expenses.toFixed(2));
    setTotalPotPrizeFund(balanced.prizeFund);

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
    potPfsLoadStatus === "loading" ||
    (!gotTmntData && tmntLoadStatus === "loading");

  const canRender =
    potPfsLoadStatus === "succeeded" &&
    gotPotPfsData &&
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
                  value={totalPotPrizeFund}
                  disabled={true}
                />
              </div>
            </div>
            {isGamePot && (
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
            )}
            {/*
              Records a mousedown on the grid's Cancel button so the
              Cashers/Expenses blur handlers can skip applying a typed value.
              Does not call preventDefault, so focus works normally.
            */}
            <div onMouseDownCapture={handleGridMouseDownCapture}>
              <PotPrizeFundGrid
                key={gridKey}
                ref={prizeFundGridRef}
                rows={rows}
                setRows={setRows}
                potId={potId}
                totalPrizeFund={gridTotalPrizeFund}
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
