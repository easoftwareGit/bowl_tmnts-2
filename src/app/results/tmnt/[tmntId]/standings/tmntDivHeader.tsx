"use client";

import React from "react";
import type { divDataType } from "@/lib/types/types";

interface ChildProps {
  divs: divDataType[];
  selectedDivId: string;
  onSelectDiv: (divId: string) => void;
}

const TmntDivHeader: React.FC<ChildProps> = ({
  divs,
  selectedDivId,
  onSelectDiv,
}) => {
  return (
    <div className="d-flex justify-content-center mb-2">
      <div
        className="btn-group btn-group-sm"
        role="group"
        aria-label="Select division"
      >
        {divs.map((div) => {
          const isSelected = div.id === selectedDivId;
          return (
            <button
              key={div.id}
              type="button"
              className={`btn ${isSelected ? "btn-primary" : "btn-outline-primary"}`}
              aria-pressed={isSelected}
              onClick={() => onSelectDiv(div.id)}
            >
              {div.div_name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TmntDivHeader;