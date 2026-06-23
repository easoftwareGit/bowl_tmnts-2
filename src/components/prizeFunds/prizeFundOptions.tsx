"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SquadStage } from "@prisma/client";
import { tmntFullType } from "@/lib/types/types";
import { getBrktOrElimName, getPotShortName } from "@/lib/getName";
// import "./prizeFundOptions.css";
import "../popupOptions.css";

type prizeFundOption = {
  id: string;
  label: string;
};

type prizeFundOptionsProps = {
  show: boolean;
  fullTmntData: tmntFullType;
  onClose: () => void;
  stage: SquadStage;
};

const PrizeFundOptions: React.FC<prizeFundOptionsProps> = ({
  show,
  fullTmntData,
  onClose,
  stage,
}) => {
    
  const tmntId = fullTmntData.tmnt.id;

  const prizeFunds: prizeFundOption[] = [];
  fullTmntData.events.forEach((event) => {
    prizeFunds.push({ id: event.id, label: `Event - ${event.event_name}` });
  })
  fullTmntData.pots.forEach((pot) => {
    prizeFunds.push({
      id: pot.id,
      label: `Pot - ${getPotShortName(pot, fullTmntData.divs)}`
    });
  })
  fullTmntData.elims.forEach((elim) => {
    prizeFunds.push({
      id: elim.id,
      label: `Elim - ${getBrktOrElimName(elim, fullTmntData.divs)}`
    });
  })
  
  const [selectedPrizeFundId, setSelectedPrizeFundId] = useState(prizeFunds[0].id);  

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
    
  const isPrizeFundEnabled = (prizeFundId: string): boolean => {
    if (prizeFundId.startsWith("evt")) {
      return stage === SquadStage.ENTRIES || stage === SquadStage.SCORES;
    } else if (prizeFundId.startsWith("pot")) {
      return stage === SquadStage.SCORES;
    } else if (prizeFundId.startsWith("elm")) {
      return stage === SquadStage.SCORES;
    } else {
      return false;
    }
  };

  const numPrizeFundsEnabled = (): number => {
    return prizeFunds.filter((report) => isPrizeFundEnabled(report.id)).length;
  };
  
  const handleEditClick = (): void => {
    if (!isPrizeFundEnabled(selectedPrizeFundId)) {
      return;
    }
    let url = `/prizeFunds/`;
    if (selectedPrizeFundId.startsWith("evt")) {
      url += `event/${selectedPrizeFundId}`;
    } else if (selectedPrizeFundId.startsWith("pot")) {
      url += `pot/${selectedPrizeFundId}`;
    } else if (selectedPrizeFundId.startsWith("elm")) {
      url += `elim/${selectedPrizeFundId}`;
    } else {
      return;
    }
    router.push(url);
  }

  const prizeFundsEnabled = numPrizeFundsEnabled() > 0;

  return (
    <div className="position-relative">
      {show && (
        <div
          ref={panelRef}
          className="popupOptions card shadow"
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="m-0">Prize Funds</h5>
            <button
              type="button"
              className="btn-close btn-close-red"
              aria-label="Close"
              onClick={onClose}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Select Prize Fund
            </label>
            <select
              className="form-select"
              value={selectedPrizeFundId}
              onChange={(e) => setSelectedPrizeFundId(e.target.value)}              
            >
              {prizeFunds.map((report) => (
                <option
                  key={report.id}
                  value={report.id}
                  disabled={!isPrizeFundEnabled(report.id)}
                >
                  {report.label}
                </option>
              ))}
            </select>            
          </div>
          <div
            title={ 
              prizeFundsEnabled
                ? undefined
                : "No prize funds enabled yet. Edit bowlers, then Valiadte & Save."
            }
          >
            <button
              type="button"
              className="btn btn-success w-100"
              onClick={handleEditClick}
              disabled={!prizeFundsEnabled}            
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>    
  );
}

export default PrizeFundOptions;