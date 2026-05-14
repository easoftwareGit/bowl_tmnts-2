"use client";

import React, { useEffect, useRef, useState } from "react";
import "./reportOptions.css";

const reports = [
  "Brackets",
  "Bracket Summary",  
  "Lane Assignments",
  "Recaps - per Pair",
  "Recaps - per Team",
  "Standings",  
];

type ReportOptionsProps = {
  show: boolean;
  onClose: () => void;
};

const ReportOptions: React.FC<ReportOptionsProps> = ({
  show,
  onClose,
}) => {
  
  const [selectReport, setSelectReport] = useState(reports[0]);

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
    console.log("print report: ", selectReport);

    // pring logic goes here
    window.print();
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

            <select
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
            </select>
          </div>

          <button
            type="button"
            className="btn btn-success w-100"
            onClick={handlePrint}
          >
            Print
          </button>
        </div>
      )}
    </div>    
  );
}

export default ReportOptions;