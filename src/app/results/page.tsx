"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  clearTmnts,
  fetchTmnts,
} from "@/redux/features/tmnts/tmntsSlice";
import { fetchTmntYears } from "@/redux/features/tmnts/yearsSlice";
import type {
  YearObj,
  tmntsListType,
} from "../../lib/types/types";
import TmntsList from "@/components/tmnts/tmntsList";
import WaitModal from "@/components/modal/waitModal";
import { todayYearStr } from "@/lib/dateTools";

export default function TmntResultsPage() {
  const dispatch = useDispatch<AppDispatch>();

  const [tmntYear, setTmntYear] = useState(todayYearStr);

  const stateTmnts = useSelector(
    (state: RootState) => state.tmnts,
  );
  const tmnts: tmntsListType[] = stateTmnts.tmnts;

  const stateYears = useSelector(
    (state: RootState) => state.tmntYears,
  );
  const years: YearObj[] = stateYears.data;

  /*
   * The page is ready only after both the tournament list
   * and tournament years have successfully loaded.
   */
  const isLoading =
    stateTmnts.status === "idle" ||
    stateTmnts.status === "loading" ||
    stateYears.status === "idle" ||
    stateYears.status === "loading";

  const loadFailed =
    stateTmnts.status === "failed" ||
    stateYears.status === "failed";

  const pageReady =
    stateTmnts.status === "succeeded" &&
    stateYears.status === "succeeded";

  useEffect(() => {
    // Clear tournaments when the page loads.
    dispatch(clearTmnts());

    // Load the available tournament years.
    dispatch(fetchTmntYears());
  }, [dispatch]);

  useEffect(() => {
    // Load tournaments for the selected year.
    dispatch(fetchTmnts(tmntYear));
  }, [tmntYear, dispatch]);

  function yearChanged(year: string): void {
    setTmntYear(year);
  }

  return (
    <>
      <WaitModal show={isLoading} message="Loading..." />

      {loadFailed && (
        <div className="alert alert-danger">
          Unable to load tournament results.
        </div>
      )}

      {pageReady && (
        <div>
          <h1 className="d-flex justify-content-center">
            Tournament Results
          </h1>

          <TmntsList
            years={years}
            tmnts={tmnts}
            tmntYear={tmntYear}
            showResults={true}
            onYearChange={yearChanged}
          />
        </div>
      )}
    </>
  );  
}
