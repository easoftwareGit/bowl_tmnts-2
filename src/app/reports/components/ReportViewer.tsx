"use client";

import React, { useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { useRouter } from "next/navigation";
import type { ReportDocument } from "./getReportDocument";
import WaitModal from "@/components/modal/waitModal";

type Props = {
  tmntId: string;
  report: ReportDocument;
};

export default function ReportViewer({ tmntId, report }: Props) {
  const router = useRouter();
  const [pdfLoading, setPdfLoading] = useState(true);

  const reportDocument = React.cloneElement(
    report.document,
    {
      onRender: () => {
        setPdfLoading(false);
      },
    },
  );

  return (
    <>
      <WaitModal
        show={pdfLoading}
        message="Loading report..."
      />
      
      <div className="container mt-4">
        <button
          type="button"
          className="btn btn-primary mb-3"
          onClick={() => router.push(`/dataEntry/runTmnt/${tmntId}`)}
        >
          Back to Run Tournament
        </button>

        <h2>{report.title}</h2>

        <PDFViewer style={{ width: "100%", height: "800px" }}>
          {/* {report.document} */}
          {reportDocument}
        </PDFViewer>
      </div>
    </>
  );
}