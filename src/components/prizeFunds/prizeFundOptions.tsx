"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SquadStage } from "@prisma/client";
import { tmntFullType } from "@/lib/types/types";
import { getBrktOrElimName, getPotShortName } from "@/lib/getName";
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

  const prizeFunds: prizeFundOption[] = [];
  fullTmntData.divs.forEach((div) => {
    prizeFunds.push({ id: div.id, label: `Division - ${div.div_name}` });
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

  const isPrizeFundEnabled = (): boolean => {

    return stage === SquadStage.SCORES || stage === SquadStage.FINISHED;
  };

  // const isPrizeFundEnabled = (prizeFundId: string): boolean => {

  //   if (prizeFundId.startsWith("div")) {
  //     // return stage === SquadStage.ENTRIES || stage === SquadStage.SCORES;
  //     return stage === SquadStage.SCORES;
  //   } else if (prizeFundId.startsWith("pot")) {
  //     return stage === SquadStage.SCORES;
  //   } else if (prizeFundId.startsWith("elm")) {
  //     return stage === SquadStage.SCORES;
  //   } else {
  //     return false;
  //   }
  // };

  // const numPrizeFundsEnabled = (): number => {
  //   return prizeFunds.filter((report) => isPrizeFundEnabled(report.id)).length;
  // };
  
  const handleEditClick = (): void => {
    if (!isPrizeFundEnabled()) {
      return;
    }
    // if (!isPrizeFundEnabled(selectedPrizeFundId)) {
    //   return;
    // }
    let url = `/dataEntry/prizeFunds/tmnt/${fullTmntData.tmnt.id}/`;
    if (selectedPrizeFundId.startsWith("div")) {
      url += `div/${selectedPrizeFundId}`;
    } else if (selectedPrizeFundId.startsWith("pot")) {
      url += `pot/${selectedPrizeFundId}`;
    } else if (selectedPrizeFundId.startsWith("elm")) {
      url += `elim/${selectedPrizeFundId}`;
    } else {
      return;
    }
    router.push(url);
  }

  const prizeFundsEnabled = isPrizeFundEnabled();
  // const prizeFundsEnabled = numPrizeFundsEnabled() > 0;

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

          {prizeFundsEnabled ? (
            <div>
              <div className="mb-3">
                <label className="form-label">
                  Select Prize Fund
                </label>
                <select
                  className="form-select"
                  value={selectedPrizeFundId}
                  onChange={(e) => setSelectedPrizeFundId(e.target.value)}              
                >
                  {prizeFunds.map((prizeFund) => (
                    <option
                      key={prizeFund.id}
                      value={prizeFund.id}
                      // disabled={!isPrizeFundEnabled(prizeFund.id)}
                    >
                      {prizeFund.label}
                    </option>
                  ))}
                </select>                           
              </div>
              <div>
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
          ) : (
            <div>
              <div>
                <label className="form-label">                  
                    Prize Funds not enabled yet.
                  </label>
              </div>
              <div>
                <label className="form-label">                  
                  Edit bowlers, then Valiadte & Save.
                </label>
              </div>
              <button
                type="button"
                className="btn btn-success w-100"
                onClick={onClose}
              >
                Continue
              </button>
            </div>
          )}          
        </div>
      )}
    </div>    
  );
}

export default PrizeFundOptions;