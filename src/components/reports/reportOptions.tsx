"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./reportOptions.css";

type ReportOption = {
  id: string;
  label: string;
};

const reports: ReportOption[] = [
  // { id: "brackets", label: "Brackets" },
  // { id: "bracketSummary", label: "Bracket Summary" },
  // { id: "laneAssignments", label: "Lane Assignments" },
  { id: "recapsPerPair", label: "Recaps - per Pair" },
  { id: "recapsPerTeam", label: "Recaps - per Team" },
  // { id: "standings", label: "Standings" },
];

type ReportOptionsProps = {
  show: boolean;
  tmntId: string;
  onClose: () => void;
};

const ReportOptions: React.FC<ReportOptionsProps> = ({
  show,
  tmntId,
  onClose,
}) => {
    
  const [selectedReportId, setSelectedReportId] = useState(reports[0].id);  

  const router = useRouter();

  // get the panel where this component is rendered
  const panelRef = useRef<HTMLDivElement | null>(null);

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }       
    } 

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    } 

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, onClose]);
    
  const handlePrint = (): void => {
    console.log("print report id: ", selectedReportId);

    router.push(`/reports/${tmntId}/${selectedReportId}`);
    // // pring logic goes here
    // // window.print();    
    // router.push(`/reports/${tmntId}`);
  }

  return (
    <div className="position-relative">
      {show && (
        <div
          ref={panelRef}
          className="reportOptions card shadow"
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="m-0">Reports</h5>
            <button
              type="button"
              className="btn-close btn-close-red"
              aria-label="Close"
              onClick={onClose}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Select Report
            </label>

            {/* <select
              className="form-select"
              value={selectReport}
              onChange={(e) => setSelectReport(e.target.value)}
            >
              {reports.map((report) => (
                <option
                  key={report}
                  value={report}
                >
                  {report}
                </option>
              ))}
            </select> */}
            <select
              className="form-select"
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
            >
              {reports.map((report) => (
                <option
                  key={report.id}
                  value={report.id}
                >
                  {report.label}
                </option>
              ))}
            </select>            
          </div>

          <button
            type="button"
            className="btn btn-info w-100"
            onClick={handlePrint}
          >
            Generate
          </button>
        </div>
      )}
    </div>    
  );
}

export default ReportOptions;