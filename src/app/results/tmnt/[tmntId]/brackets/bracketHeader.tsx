import React from "react";
import Link from "next/link";
import { tmntFullType } from "@/lib/types/types";

export type brktPageBtnType = "Brackets" | "Payouts" | "None";

type BracketHeaderProps = {
  tmntFullData: tmntFullType;
  selectedBrktPageBtn: brktPageBtnType;
};

const BracketHeader = ({
  tmntFullData,
  selectedBrktPageBtn,
}: BracketHeaderProps) => {
  const tmntId = tmntFullData.tmnt.id;

  return (
    <div
      className="mb-2 text-center"
      data-testid="bracket-header"
    >
      <nav
        aria-label="Bracket navigation"
        className="d-flex justify-content-center align-items-center gap-2 flex-wrap"
      >
        <div
          className="btn-group btn-group-sm"
          role="group"
          aria-label="Select bracket"
        >
          <Link
            href={`/results/tmnt/${tmntId}/brackets`}
            className={`btn btn-outline-primary ${selectedBrktPageBtn === "Brackets" ? "active" : ""}`}
          >
            Brackets
          </Link>
          <Link
            href={`/results/tmnt/${tmntId}/brackets/payouts`}
            className={`btn btn-outline-primary ${selectedBrktPageBtn === "Payouts" ? "active" : ""}`}
          >
            Payouts
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default BracketHeader;