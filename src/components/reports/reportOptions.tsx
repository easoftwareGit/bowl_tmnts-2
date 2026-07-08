"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SquadStage } from "@prisma/client";
// import "./reportOptions.css";
import "../popupOptions.css";

type reportOption = {
  id: string;
  label: string;
};

const reports: reportOption[] = [    
  // { id: "bracketSummary", label: "Bracket Summary" },
  // { id: "laneAssignments", label: "Lane Assignments" },
  { id: "recapsPerPair", label: "Recaps - per Pair" },
  { id: "recapsPerTeam", label: "Recaps - per Team" },
  { id: "scoreGrid", label: "Scores Grid" },
  { id: "balanceSheet", label: "Balance Sheet" },
  // { id: "standings", label: "Standings" },
];

type ReportOptionsProps = {
  show: boolean;
  tmntId: string;
  onClose: () => void;
  stage: SquadStage;
};

const ReportOptions: React.FC<ReportOptionsProps> = ({
  show,
  tmntId,
  onClose,
  stage,
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
    
  const isReportEnabled = (reportId: string): boolean => {    
    switch (reportId) {
      case "recapsPerPair":
      case "recapsPerTeam":
      case "balanceSheet":
        return stage === SquadStage.ENTRIES || stage === SquadStage.SCORES;
      
      case "scoreGrid":
        return stage === SquadStage.SCORES;        

      default:
        return false;
    }
  };

  const numReportsEnabled = (): number => {
    return reports.filter((report) => isReportEnabled(report.id)).length;
  };
  
  const handlePrint = (): void => {
    if (!isReportEnabled(selectedReportId)) {
      return;
    }
    router.push(`/reports/${tmntId}/${selectedReportId}`);
  }

  const reportsEnabled = numReportsEnabled() > 0;

  return (
    <div className="position-relative">
      {show && (
        <div
          ref={panelRef}
          className="popupOptions card shadow"
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
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}              
            >
              {reports.map((report) => (
                <option
                  key={report.id}
                  value={report.id}
                  disabled={!isReportEnabled(report.id)}
                >
                  {report.label}
                </option>
              ))}
            </select>            
          </div>
          <div
            title={ 
              reportsEnabled
                ? undefined
                : "No reports enabled yet. Edit bowlers, then Valiadte & Save."
            }
          >
            <button
              type="button"
              className="btn btn-info w-100"
              onClick={handlePrint}
              disabled={!reportsEnabled}            
            >
              Generate
            </button>
          </div>
        </div>
      )}
    </div>    
  );
}

export default ReportOptions;