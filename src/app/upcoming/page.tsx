"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import {
  clearTmnts,
  fetchTmnts,
  selectTmnts,
  getTmntsYear,
  getTmntsRequestedYear,
  getTmntsStatus,
  getTmntsError,
} from "@/redux/features/tmnts/tmntsSlice";
import type { YearObj } from "@/lib/types/types";
import TmntsList from "@/components/tmnts/tmntsList";
import WaitModal from "@/components/modal/waitModal";

const yearsArr: YearObj[] = [];

// no year picker on this page, so year changes are ignored
function yearChanged(): void {}

export default function TmntUpcomingPage() {
  const dispatch = useDispatch<AppDispatch>();

  // '' = no year filter, fetch upcoming tournaments
  const tmntYear = "";

  useEffect(() => {
    // Clear tournaments left in the store from another page
    dispatch(clearTmnts());
    // No abort() cleanup needed: the tmnts slice ignores stale responses
    // (fulfilled/rejected only apply when they match requestedYear).
    dispatch(fetchTmnts(tmntYear));
  }, [dispatch, tmntYear]);

  const tmnts = useSelector(selectTmnts);
  const year = useSelector(getTmntsYear);
  const requestedYear = useSelector(getTmntsRequestedYear);
  const tmntStatus = useSelector(getTmntsStatus);
  const tmntError = useSelector(getTmntsError);

  // Only trust data/errors that belong to THIS page's request. On the first
  // render the store may still hold another page's results or error, because
  // clearTmnts runs in the effect, after the first render.
  const showError = tmntStatus === "failed" && requestedYear === tmntYear;
  const showTmnts = tmntStatus === "succeeded" && year === tmntYear;
  // Anything else (idle before the fetch starts, loading, or another page's
  // leftover data) means this page's tmnts are on the way, so show the wait
  // modal instead of a blank page.
  const showLoading = !showError && !showTmnts;

  const retry = () => {
    dispatch(fetchTmnts(tmntYear));
  };

  return (
    <>
      <WaitModal show={showLoading} message="Loading..." />
      <div>
        <h1 className="d-flex justify-content-center">Upcoming Tournaments</h1>
        {showError && (
          <div className="alert alert-danger" role="alert">
            <p className="mb-2">
              We couldn&apos;t load the upcoming tournaments. Please check your
              connection and try again.
            </p>
            {/* raw error text can expose database details, so only show it
                while developing */}
            {process.env.NODE_ENV === "development" && tmntError && (
              <p className="mb-2 small">Details: {tmntError}</p>
            )}
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={retry}
            >
              Try again
            </button>
          </div>
        )}
        {showTmnts && (
          <TmntsList
            years={yearsArr}
            tmnts={tmnts}
            showResults={false}
            tmntYear={tmntYear}
            onYearChange={yearChanged}
          />
        )}
      </div>
    </>
  );
}
