"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  fetchTmntFullData,
  getTmntFullDataLoadStatus,
  getTmntFullDataError,
  selectTmntFullData,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import ReportViewer from "./ReportViewer";
import { getReportDocument } from "./getReportDocument";

type Props = {
  tmntId: string;
  reportId: string;
};

export default function ReportDataContainer({ tmntId, reportId }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const tmntFullData = useSelector(selectTmntFullData);

  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
  const tmntError = useSelector(getTmntFullDataError);

  useEffect(() => {
    if (!tmntId) return;

    if (!tmntFullData || tmntFullData.tmnt.id !== tmntId) {
      dispatch(fetchTmntFullData(tmntId));
    }
  }, [tmntId, tmntFullData, dispatch]);

  if (tmntLoadStatus === "loading") {
    return <div>Loading report data...</div>;
  }

  if (tmntError) {
    return <div>Error loading report: {tmntError}</div>;
  }

  if (!tmntFullData || tmntFullData.tmnt.id !== tmntId) {
    return <div>No tournament data found.</div>;
  }

  const report = getReportDocument(reportId, tmntFullData);

  return <ReportViewer tmntId={tmntId} report={report} />;
}