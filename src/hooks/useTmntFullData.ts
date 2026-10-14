import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import {
  fetchTmntFullData,
  getTmntFullDataError,
  getTmntFullDataLoadStatus,
  getTmntFullDataRequestedTmntId,
  selectTmntFullData,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";

/**
 * Fetches full tournament data when it is not already loaded.
 * 
 * @param {string} tmntId - id of tmnt to fetch 
 */
  export function useTmntFullData(tmntId: string) {
    const dispatch = useDispatch<AppDispatch>();

    const data = useSelector(selectTmntFullData);
    const loadStatus = useSelector(getTmntFullDataLoadStatus);
    const requestedTmntId = useSelector(getTmntFullDataRequestedTmntId);
    const error = useSelector(getTmntFullDataError);

    // the blank initial tournament has id "", so an empty tmntId must not count as loaded
    const hasId = tmntId !== "";
    const hasData = hasId && data.tmnt.id === tmntId;
    const failed =
      hasId &&
      !hasData &&
      loadStatus === "failed" &&
      requestedTmntId === tmntId;

    useEffect(() => {
      if (hasId && !hasData && loadStatus !== "loading" && !failed) {
        dispatch(fetchTmntFullData(tmntId));
      }
    }, [dispatch, tmntId, hasId, hasData, loadStatus, failed]);

    const retry = useCallback(
      () => dispatch(fetchTmntFullData(tmntId)),
      [dispatch, tmntId]
    );

    return { data, hasData, failed, error, retry };
  }
