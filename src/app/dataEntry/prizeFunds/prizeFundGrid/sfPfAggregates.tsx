import type {
  AggregateFooterProps,
  prizeFundEntryRow,
  syncFusionAggregateDef,
} from "@/lib/types/types";
import {
  pfEntryAmountColName,
  pfEntryPercentColName,
  pfEntryPositionColName,
} from "./sfCreatePfColumns";
import "../prizeFundGrid/prizeFundGrid.css";

const emptyCustomAggregate = () => "";

const footerTotalCustom = (_props: AggregateFooterProps) => <div>Total</div>;
const footerDiffCustom = (_props: AggregateFooterProps) => (
  <div>Difference</div>
);

function footerSum(props: AggregateFooterProps) {
  return <div>{props.Sum ?? 0}</div>;
}

/**
 * Create the total aggregates for the prize fund grid
 *
 * @returns {syncFusionAggregateDef[]} - array of aggregates
 */
export const createPfTotalAggregates = (): syncFusionAggregateDef[] => {
  const fixedAggregate: syncFusionAggregateDef[] = [
    {
      field: pfEntryPositionColName,
      type: "Custom",
      customAggregate: emptyCustomAggregate,
      footerTemplate: footerTotalCustom,
    },
  ];

  const amountAggregate: syncFusionAggregateDef[] = [
    {
      field: pfEntryAmountColName,
      type: "Sum",
      format: "C2",
      footerTemplate: footerSum,
    },
  ];

  const percentAggregate: syncFusionAggregateDef[] = [
    {
      field: pfEntryPercentColName,
      type: "Sum",
      format: "P2",
      footerTemplate: footerSum,
    },
  ];

  return [...fixedAggregate, ...amountAggregate, ...percentAggregate];
};

/**
 * Creates the difference aggregates for the prize fund grid.
 *
 * The total prize fund is retrieved through a callback because Syncfusion
 * may retain the custom aggregate function created during the grid's first
 * render. The callback allows that retained function to retrieve the latest
 * total prize fund.
 *
 * @param getTotalPrizeFund - Returns the current total prize fund.
 * @returns Array of aggregate definitions.
 */
export const createPfDiffAggregates = (
  getTotalPrizeFund: () => number,
): syncFusionAggregateDef[] => {
  /**
   * Converts a formatted aggregate value into a number.
   */
  const customValueToNumber = (
    value: number | string | null | undefined,
  ): number => {
    if (value == null) return 0;

    if (typeof value === "number") {
      return value;
    }

    const cleaned = value
      .replace(/\$/g, "")
      .replace(/,/g, "")
      .replace(/%/g, "");

    const num = Number(cleaned);

    return Number.isFinite(num) ? num : 0;
  };

  /**
   * Calculates the sum of the amount column.
   */
  const totalAmount = (data: unknown): number => {
    const aggregateData = data as {
      result?: prizeFundEntryRow[];
      data?: prizeFundEntryRow[];
    };

    const rows: prizeFundEntryRow[] = Array.isArray(data)
      ? (data as prizeFundEntryRow[])
      : aggregateData?.result ?? aggregateData?.data ?? [];

    return rows.reduce(
      (sum, row) => sum + (Number(row.amount) || 0),
      0,
    );
  };

  /**
   * Calculates the unallocated dollar amount.
   */
  const amountDifferenceAggregate = (data: unknown): number => {
    const totalPrizeFund = getTotalPrizeFund();

console.log("aggregate total =", getTotalPrizeFund());

    return totalPrizeFund - totalAmount(data);
  };

  /**
   * Calculates the unallocated percentage.
   */
  const percentDifferenceAggregate = (data: unknown): number => {
    const totalPrizeFund = getTotalPrizeFund();

    if (totalPrizeFund === 0) {
      return 0;
    }

    return (
      (totalPrizeFund - totalAmount(data)) /
      totalPrizeFund
    );
  };

  /**
   * Displays the custom aggregate value with positive or negative styling.
   */
  const footerCustom = (props: AggregateFooterProps) => {
    const value = customValueToNumber(props.Custom);

    let className = "";

    if (value < 0) {
      className = "pf-negative";
    } else if (value > 0) {
      className = "pf-positive";
    }

    return (
      <div className={className}>
        {props.Custom ?? 0}
      </div>
    );
  };

  return [
    {
      field: pfEntryPositionColName,
      type: "Custom",
      customAggregate: () => "",
      footerTemplate: footerDiffCustom,
    },
    {
      field: pfEntryAmountColName,
      type: "Custom",
      customAggregate: amountDifferenceAggregate,
      format: "C2",
      footerTemplate: footerCustom,
    },
    {
      field: pfEntryPercentColName,
      type: "Custom",
      customAggregate: percentDifferenceAggregate,
      format: "P2",
      footerTemplate: footerCustom,
    },
  ];
};
