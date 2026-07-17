import React from "react";
import { render, screen } from "@testing-library/react";
import {
  createPotPfDiffAggregates,
  createPotPfTotalAggregates,
} from "@/app/dataEntry/prizeFunds/oldPotPfGrid/sfPotPfAggregates";
import {
  potPfEntryAmountColName,
  potPfEntryPercentColName,
  potPfEntryPositionColName,
} from "@/app/dataEntry/prizeFunds/oldPotPfGrid/sfCreatePotPfColumns";
import type { potPfEntryRow } from "@/lib/types/types";

jest.mock(
  "@/app/dataEntry/prizeFunds/prizeFundGrid.css",
  () => ({}),
);

describe("createPotPfTotalAggregates", () => {
  it("creates the expected total aggregate definitions", () => {
    const result = createPotPfTotalAggregates();

    expect(result).toHaveLength(3);

    expect(result[0]).toMatchObject({
      field: potPfEntryPositionColName,
      type: "Custom",
    });

    expect(result[1]).toMatchObject({
      field: potPfEntryAmountColName,
      type: "Sum",
      format: "C2",
    });

    expect(result[2]).toMatchObject({
      field: potPfEntryPercentColName,
      type: "Sum",
      format: "P2",
    });
  });

  it("renders Total in the position footer", () => {
    const result = createPotPfTotalAggregates();

    render(<>{result[0].footerTemplate?.({})}</>);

    expect(screen.getByText("Total")).toBeInTheDocument();
  });

  it("renders Sum value in amount and percent footers", () => {
    const result = createPotPfTotalAggregates();

    render(
      <>
        {result[1].footerTemplate?.({ Sum: 150 })}
        {result[2].footerTemplate?.({ Sum: 0.75 })}
      </>,
    );

    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("0.75")).toBeInTheDocument();
  });

  it("renders 0 when Sum is missing", () => {
    const result = createPotPfTotalAggregates();

    render(<>{result[1].footerTemplate?.({})}</>);

    expect(screen.getByText("0")).toBeInTheDocument();
  });
});

describe("createPotPfDiffAggregates", () => {
  const rows: potPfEntryRow[] = [
    {
      id: "dpf_00000000000000000000000000000001",
      pot_id: "pot_00000000000000000000000000000001",
      position: 1,
      amount: 100,
      percentage: 0.5,
    },
    {
      id: "dpf_00000000000000000000000000000002",
      pot_id: "pot_00000000000000000000000000000001",
      position: 2,
      amount: 50,
      percentage: 0.25,
    },
  ];

  it("creates the expected difference aggregate definitions", () => {
    const result = createPotPfDiffAggregates(200);

    expect(result).toHaveLength(3);

    expect(result[0]).toMatchObject({
      field: potPfEntryPositionColName,
      type: "Custom",
    });

    expect(result[1]).toMatchObject({
      field: potPfEntryAmountColName,
      type: "Custom",
      format: "C2",
    });

    expect(result[2]).toMatchObject({
      field: potPfEntryPercentColName,
      type: "Custom",
      format: "P2",
    });
  });

  it("renders Difference in the position footer", () => {
    const result = createPotPfDiffAggregates(200);

    render(<>{result[0].footerTemplate?.({})}</>);

    expect(screen.getByText("Difference")).toBeInTheDocument();
  });

  it("calculates amount difference from an array of rows", () => {
    const result = createPotPfDiffAggregates(200);

    expect(result[1].customAggregate?.(rows)).toBe(50);
  });

  it("calculates amount difference from a result object", () => {
    const result = createPotPfDiffAggregates(200);

    expect(result[1].customAggregate?.({ result: rows })).toBe(50);
  });

  it("calculates amount difference from a data object", () => {
    const result = createPotPfDiffAggregates(200);

    expect(result[1].customAggregate?.({ data: rows })).toBe(50);
  });

  it("calculates percent difference", () => {
    const result = createPotPfDiffAggregates(200);

    expect(result[2].customAggregate?.(rows)).toBe(0.25);
  });

  it("returns 0 percent difference when totalPrizeFund is 0", () => {
    const result = createPotPfDiffAggregates(0);

    expect(result[2].customAggregate?.(rows)).toBe(0);
  });

  it("treats missing amount values as 0", () => {
    const rowsWithMissingAmount = [
      {
        id: "dpf_00000000000000000000000000000001",
        pot_id: "pot_00000000000000000000000000000001",
        position: 1,
        amount: null,
        percentage: 0,
      },
    ];

    const result = createPotPfDiffAggregates(200);

    expect(result[1].customAggregate?.(rowsWithMissingAmount)).toBe(200);
  });

  it("renders positive custom footer with positive class", () => {
    const result = createPotPfDiffAggregates(200);

    render(<>{result[1].footerTemplate?.({ Custom: 50 })}</>);

    expect(screen.getByText("50")).toHaveClass("pf-positive");
  });

  it("renders negative custom footer with negative class", () => {
    const result = createPotPfDiffAggregates(200);

    render(<>{result[1].footerTemplate?.({ Custom: -25 })}</>);

    expect(screen.getByText("-25")).toHaveClass("pf-negative");
  });

  it("renders zero custom footer with no positive or negative class", () => {
    const result = createPotPfDiffAggregates(200);

    render(<>{result[1].footerTemplate?.({ Custom: 0 })}</>);

    expect(screen.getByText("0")).not.toHaveClass("pf-positive");
    expect(screen.getByText("0")).not.toHaveClass("pf-negative");
  });

});