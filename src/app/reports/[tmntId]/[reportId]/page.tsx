"use client";

import { useParams } from "next/navigation";
import ReportDataContainer from "../../components/ReportDataContainer";

export default function ReportPage() {
  const params = useParams();

  const tmntId = params.tmntId as string;
  const reportId = params.reportId as string;

  return (
    <ReportDataContainer
      tmntId={tmntId}
      reportId={reportId}
    />
  );
}