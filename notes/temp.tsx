"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useParams } from "next/navigation";
import PlayersEntryForm from "../../playersForm/playersForm";
import {
  brktType,
  dataOneTmntType,
  tmntActions,
  tmntFullType,
  tmntFormDataType,
} from "@/lib/types/types";
import {
  brktsColNameEnd,
  entryFeeColName,
  entryNumBrktsColName,
  feeColNameEnd,
  playerEntryData,
} from "../../playersForm/createColumns";
import { BracketList } from "@/components/brackets/bracketListClass";
import usePreventUnload from "@/components/preventUnload/preventUnload";
import { defaultBrktGames, defaultPlayersPerMatch } from "@/lib/db/initVals";
import { getTmntFullDataError, getTmntFullDataLoadStatus } from "@/redux/features/tmntFullData/tmntFullDataSlice";

/* --------------------------------------------------------------------
  Helper: buildBrktsList
  - creates a new BracketList per bracket, optionally seeded with previous
    bracket data (prev?.brackets) so BracketList implementations that rely
    on previous structure can keep it.
-------------------------------------------------------------------- */
function buildBrktsList(
  brkts: brktType[] = [],
  rows: (typeof playerEntryData)[] = [],
  prevAllBrktsList?: Record<string, BracketList>
): Record<string, BracketList> {
  const res: Record<string, BracketList> = {};
  brkts.forEach((brkt) => {
    const prev = prevAllBrktsList?.[brkt.id];
    // Pass prev?.brackets if your constructor supports restoring bracket state
    const brktList = new BracketList(
      brkt.id,
      defaultPlayersPerMatch,
      defaultBrktGames,
      prev?.brackets
    );
    brktList.calcTotalBrkts(rows);
    res[brkt.id] = brktList;
  });
  return res;
}

/* --------------------------------------------------------------------
  populateRows stays the same (you provided it earlier)
-------------------------------------------------------------------- */
const populateRows = (tmntFullData: tmntFullType) => {
  const pRows: (typeof playerEntryData)[] = [];
  // ... your existing logic
  return pRows;
};

/* --------------------------------------------------------------------
  Component
-------------------------------------------------------------------- */
export default function EditPlayersPage() {
  const params = useParams();
  const tmntId = params.tmntId as string;
  const dispatch = useDispatch<AppDispatch>();

  // state we want to keep mutable (passed to child / updated later)
  const [rows, setRows] = useState<(typeof playerEntryData)[]>([]);
  const [entriesCount, setEntriesCount] = useState<Record<string, number>>({});
  const [priorCount, setPriorCount] = useState<Record<string, number>>({});
  const [allBrktsList, setAllBrktsList] = useState<Record<string, BracketList>>({});
  const [gotRefunds, setGotRefunds] = useState<Record<string, boolean>>({});

  // snapshot of original rows for change detection (useRef -> no re-renders)
  const origRowsRef = useRef<(typeof playerEntryData)[]>([]);

  // guard so we only initialize state once when data first becomes available
  const initializedRef = useRef(false);

  // redux selectors
  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
  const tmntError = useSelector(getTmntFullDataError);
  const stateTmntFullData = useSelector((state: RootState) => state.tmntFullData.tmntFullData);

  // tmntFormData if you need it
  const tmntFormData: tmntFormDataType = {
    tmntFullData: stateTmntFullData,
    tmntAction: tmntActions.Run,
  };

  /* -----------------------
    Heavy initial computations — memoize them so they only run when
    stateTmntFullData changes.
  ------------------------ */
  const initialComputed = useMemo(() => {
    const entriesCountInit: Record<string, number> = {};
    const priorCountInit: Record<string, number> = {};

    if (!stateTmntFullData) {
      return {
        entriesCountInit,
        priorCountInit,
        curRows: [] as (typeof playerEntryData)[],
        allBrktsListInit: {} as Record<string, BracketList>,
        gotRefundsInit: {} as Record<string, boolean>,
      };
    }

    // build counts
    stateTmntFullData.divs.forEach((div) => {
      entriesCountInit[entryFeeColName(div.id)] = 0;
    });
    stateTmntFullData.pots.forEach((pot) => {
      entriesCountInit[entryFeeColName(pot.id)] = 0;
    });
    stateTmntFullData.brkts.forEach((brkt) => {
      const name = entryNumBrktsColName(brkt.id);
      entriesCountInit[name] = 0;
      priorCountInit[name] = -1;
    });
    stateTmntFullData.elims.forEach((elim) => {
      entriesCountInit[entryFeeColName(elim.id)] = 0;
    });

    // build rows (expensive)
    const curRows = populateRows(stateTmntFullData);

    // build bracket lists seeded by nothing (initial)
    const allBrktsListInit = buildBrktsList(stateTmntFullData.brkts, curRows);

    // gotRefunds for initial state
    const gotRefundsInit: Record<string, boolean> = {};
    Object.keys(allBrktsListInit).forEach((id) => {
      gotRefundsInit[id] = allBrktsListInit[id].playersWithRefunds;
    });

    return {
      entriesCountInit,
      priorCountInit,
      curRows,
      allBrktsListInit,
      gotRefundsInit,
    };
  }, [stateTmntFullData]);

  /* -----------------------
    Write memoized initial values into actual state *once* when the
    tournament data finishes loading. Guard with initializedRef to avoid
    overwriting user edits if Redux data updates later.
  ------------------------ */
  useEffect(() => {
    if (tmntLoadStatus !== "succeeded") return;
    if (initializedRef.current) return; // only run once

    const { entriesCountInit, priorCountInit, curRows, allBrktsListInit, gotRefundsInit } = initialComputed;

    setEntriesCount(entriesCountInit);
    setPriorCount(priorCountInit);
    setRows(curRows);
    origRowsRef.current = curRows; // baseline for change detection
    setAllBrktsList(allBrktsListInit);
    setGotRefunds(gotRefundsInit);

    initializedRef.current = true;
  }, [tmntLoadStatus, initialComputed]);

  /* -----------------------
    Your existing effect that reacts to rows changing. Use the same
    buildBrktsList helper to compute updated lists. Avoid cloneDeep.
  ------------------------ */
  useEffect(() => {
    if (Object.keys(entriesCount).length === 0) return; // not initialized yet

    // Copy counts for updates (you already overwrite them)
    const updatedCount = { ...entriesCount };
    const updatedPriorCount = { ...priorCount };

    // Compute updated bracket lists based on current rows
    const updatedAllBrktsList = buildBrktsList(stateTmntFullData.brkts, rows, allBrktsList);

    // Compute gotRefunds from new lists
    const updatedGotRefunds: Record<string, boolean> = {};
    Object.keys(updatedAllBrktsList).forEach((id) => {
      updatedGotRefunds[id] = updatedAllBrktsList[id].playersWithRefunds;
    });

    // Example: recompute counts (fee columns and bracket totals)
    Object.keys(entriesCount).forEach((key) => {
      if (key.endsWith(feeColNameEnd)) {
        const colCount = rows.filter((row) => !isNaN(Number(row[key])) && Number(row[key]) > 0).length;
        updatedCount[key] = colCount;
      } else {
        updatedPriorCount[key] = updatedCount[key];
        const colTotal = rows.reduce((total, row) => total + (isNaN(Number(row[key])) ? 0 : Number(row[key])), 0);
        updatedCount[key] = colTotal;
      }
    });

    // Write them once
    setAllBrktsList(updatedAllBrktsList);
    setEntriesCount(updatedCount);
    setPriorCount(updatedPriorCount);
    setGotRefunds(updatedGotRefunds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]); // keep only rows here to avoid loops

  /* -----------------------
    Change detection (useRef baseline + callback so you can pass it to hook)
  ------------------------ */
  const dataWasChanged = useCallback(() => {
    const orig = origRowsRef.current || [];
    if (rows.length !== orig.length) return true;
    for (let i = 0; i < rows.length; i++) {
      if (JSON.stringify(rows[i]) !== JSON.stringify(orig[i])) return true;
    }
    return false;
  }, [rows]);

  usePreventUnload(dataWasChanged);

  /* -----------------------
    render (unchanged)
  ------------------------ */
  return (
    <>
      <div>
        {tmntLoadStatus === "succeeded" && (
          <>
            <h2>Bowlers</h2>
            <PlayersEntryForm
              tmntFullData={tmntFormData?.tmntFullData}
              rows={rows}
              setRows={setRows}
              findCountError={() => ({ id: "", msg: "" } as any)}
            />
          </>
        )}
      </div>
    </>
  );
}
