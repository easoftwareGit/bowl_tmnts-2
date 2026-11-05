"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { clearTmnts, fetchTmnts } from "@/redux/features/tmnts/tmntsSlice";
import { fetchTmntYears } from "@/redux/features/tmnts/yearsSlice";
import type { YearObj, tmntsListType } from "@/lib/types/types";
import TmntsList from "@/components/tmnts/tmntsList";
import WaitModal from "@/components/modal/waitModal";
import { todayYearStr } from "@/lib/dateTools";

/**
 * Returns the year to show. That is the selected year when it is in the
 * list of years with tournaments, or when there are no years. Otherwise it
 * is the newest year in the list, for example in early January before any
 * tournaments are entered for the new year.
 *
 * @param {YearObj[]} years - years that have tournaments
 * @param {string} selectedYear - the year picked, or the current year
 * @returns {string} the year to load and show
 */
function getShownYear(years: YearObj[], selectedYear: string): string {
  if (years.length === 0 || years.some((y) => y.year === selectedYear)) {
    return selectedYear;
  }
  return years.reduce(
    (newest, y) => (y.year > newest ? y.year : newest),
    "",
  );
}

export default function TmntResultsPage() {
  const dispatch = useDispatch<AppDispatch>();

  const [tmntYear, setTmntYear] = useState(todayYearStr);

  const stateTmnts = useSelector((state: RootState) => state.tmnts);
  const tmnts: tmntsListType[] = stateTmnts.tmnts;

  const stateYears = useSelector((state: RootState) => state.tmntYears);
  const years: YearObj[] = stateYears.data;

  const loadFailed =
    stateTmnts.status === "failed" || stateYears.status === "failed";

  const isLoading =
    !loadFailed &&
    (stateTmnts.status === "idle" ||
      stateTmnts.status === "loading" ||
      stateYears.status === "idle" ||
      stateYears.status === "loading");

  const yearsLoaded = stateYears.status === "succeeded";
  const shownYear = getShownYear(years, tmntYear);

  const pageReady =
    stateTmnts.status === "succeeded" && stateYears.status === "succeeded";

  useEffect(() => {
    dispatch(clearTmnts());
    dispatch(fetchTmntYears());
  }, [dispatch]);

  useEffect(() => {
    // Wait for the years, so the year loaded is one that has tournaments.
    if (!yearsLoaded) return;
    // Load tournaments for the shown year.
    dispatch(fetchTmnts(shownYear));
  }, [yearsLoaded, shownYear, dispatch]);

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
          <h1 className="d-flex justify-content-center">Tournament Results</h1>

          <TmntsList
            years={years}
            tmnts={tmnts}
            tmntYear={shownYear}
            showResults={true}
            onYearChange={yearChanged}
          />
        </div>
      )}
    </>
  );
}
