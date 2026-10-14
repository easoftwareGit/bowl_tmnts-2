import React from "react";
import Link from "next/link";
import { tmntFullType } from "@/lib/types/types";
import { getMonthDayYear } from "@/lib/dateTools";

export type tmntPageBtnType = 
  | "Home" 
  | "Players"
  | "Standings"
  | "Pots"
  | "Brackets"
  | "Elims"
  | "None";

type TmntHomeHeaderProps = {
  tmntFullData: tmntFullType;
  selectedTmntPageBtn: tmntPageBtnType;
};

const TmntHomeHeader = ({
  tmntFullData,
  selectedTmntPageBtn,
}: TmntHomeHeaderProps) => {

  const tmntId = tmntFullData.tmnt.id;
  const dateStr =
    tmntFullData?.tmnt.start_date_str ===
    tmntFullData?.tmnt.end_date_str
      ? getMonthDayYear(tmntFullData.tmnt.start_date_str)
      : getMonthDayYear(tmntFullData.tmnt.start_date_str) +
        " - " +
      getMonthDayYear(tmntFullData.tmnt.end_date_str);  
  const hasPots = tmntFullData.pots.length > 0;
  const hasBrackets = tmntFullData.brkts.length > 0;
  const hasElims = tmntFullData.elims.length > 0;

  const seperator = (tmntFullData.tmnt.tmnt_name !== "" && dateStr !== "") ? ": " : "";
  const tmntNameAndDate = tmntFullData.tmnt.tmnt_name + seperator + dateStr;

  return (
    <div className="mb-2">
      <h3 className="text-center mb-3">
        {tmntNameAndDate}
      </h3>

      <nav
        aria-label="Tournament navigation"
        className="d-flex justify-content-center align-items-center gap-2 flex-wrap"
      >
        <div
          className="btn-group btn-group"
          role="group"
          aria-label="Select bracket"
        >        
          <Link
            href={`/results/tmnt/${tmntId}/home`}            
            className={`btn btn-outline-primary ${selectedTmntPageBtn === "Home" ? "active" : ""}`}
          >
            Home
          </Link>

          <Link
            href={`/results/tmnt/${tmntId}/players`}            
            className={`btn btn-outline-primary ${selectedTmntPageBtn === "Players" ? "active" : ""}`}
          >
            Players
          </Link>
          
          <Link
            href={`/results/tmnt/${tmntId}/standings`}            
            className={`btn btn-outline-primary ${selectedTmntPageBtn === "Standings" ? "active" : ""}`}
          >
            Standings
          </Link>

          {hasBrackets && (
            <Link
              href={`/results/tmnt/${tmntId}/brackets`}              
              className={`btn btn-outline-primary ${selectedTmntPageBtn === "Brackets" ? "active" : ""}`}
            >
              Brackets
            </Link>
          )}

          {hasPots && (
            <Link
              href={`/results/tmnt/${tmntId}/pots`}              
              className={`btn btn-outline-primary ${selectedTmntPageBtn === "Pots" ? "active" : ""}`}
            >
              Pots
            </Link>
          )}

          {hasElims && (
            <Link
              href={`/results/tmnt/${tmntId}/elims`}              
              className={`btn btn-outline-primary ${selectedTmntPageBtn === "Elims" ? "active" : ""}`}
            >
              Elims
            </Link>
          )}
        </div>          
      </nav>
    </div>
  );
};

export default TmntHomeHeader;