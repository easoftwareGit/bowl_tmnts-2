import React from "react";
import Link from "next/link";
import { tmntFullType } from "@/lib/types/types";
import { getMonthDayYear } from "@/lib/dateTools";

type TmntHomeHeaderProps = {
  tmntFullData: tmntFullType;
};

const TmntHomeHeader = ({
  tmntFullData,
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
        className="d-flex justify-content-center gap-2 flex-wrap"
      >
        <Link
          href={`/results/tmnt/${tmntId}/home`}
          className="btn btn-primary"
        >
          Home
        </Link>
        <Link
          href={`/results/tmnt/${tmntId}/players`}
          className="btn btn-primary"
        >
          Players
        </Link>

        <Link
          href={`/results/tmnt/${tmntId}/standings`}
          className="btn btn-primary"
        >
          Standings
        </Link>

        {hasBrackets && (
          <Link
            href={`/results/tmnt/${tmntId}/brackets`}
            className="btn btn-primary"
          >
            Brackets
          </Link>
        )}

        {hasPots && (
          <Link
            href={`/results/tmnt/${tmntId}/pots`}
            className="btn btn-primary"
          >
            Pots
          </Link>
        )}

        {hasElims && (
          <Link
            href={`/results/tmnt/${tmntId}/elims`}
            className="btn btn-primary"
          >
            Elims
          </Link>
        )}
      </nav>
    </div>
  );
};

export default TmntHomeHeader;