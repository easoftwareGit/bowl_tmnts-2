import { useEffect } from "react";
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

  const hasData = data.tmnt.id === tmntId;
  const failed =
    !hasData &&
    loadStatus === "failed" &&
    requestedTmntId === tmntId;

  useEffect(() => {
    if (!hasData && loadStatus !== "loading" && !failed) {
      dispatch(fetchTmntFullData(tmntId));
    }
  }, [dispatch, tmntId, hasData, loadStatus, failed]);

  return {
    data,
    hasData,
    failed,
    error,
    retry: () => dispatch(fetchTmntFullData(tmntId)),
  };
}