import Image from "next/image";
import { truncateToTwoDecimals } from "@/lib/currency/convert";
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

const imageWidth = 16;
const imageHeight = 16;

const emptyCustomAggregate = () => "";

/**
 * Converts a (possibly formatted) aggregate value into a number.
 *
 * Syncfusion may pass Custom/Sum values already formatted, e.g. "$1,234.00"
 * or "12.50%", so currency symbols, commas and percent signs are removed.
 * 
 * @param {number | string | null | undefined} value - value to convert
 * @returns {number} - number, or 0 if the value is null or undefined
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

const footerTotalCustom = (_props: AggregateFooterProps) => <div>Total</div>;

/**
 * Footer for the position column of the difference row.
 *
 * props.Custom is the dollar difference (total prize fund - sum of amounts),
 * supplied by the position column's customAggregate. A check is shown when
 * the amounts add up to the total prize fund, otherwise an X.
 */
const footerDiffCustom = (props: AggregateFooterProps) => {
  // truncateToTwoDecimals removes floating-point noise such as 0.0000000001.
  const sumMatchesTotal =
    truncateToTwoDecimals(customValueToNumber(props.Custom)) === 0;

  return (
    <div>
      Difference
      {sumMatchesTotal ? (
        <Image
          src="/check-circle-fill-success.svg"
          alt="Amounts equal the prize fund"
          title="Amounts equal the prize fund"
          width={imageWidth}
          height={imageHeight}
          className="ms-1 align-text-bottom"
        />
      ) : (
        <Image
          src="/x-circle-fill-danger.svg"
          alt="Amounts do not equal the prize fund"
          title="Amounts do not equal the prize fund"
          width={imageWidth}
          height={imageHeight}
          className="ms-1 align-text-bottom"
        />
      )}
    </div>
  );
};

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

    return totalPrizeFund - totalAmount(data);
  };

  /**
   * Calculates the unallocated percentage.
   * 
   * @param {unknown} data - Row data
   * @returns {number} - unallocated percentage
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
      // className = "pf-negative";
      className = "text-danger";
    } else if (value > 0) {
      // className = "pf-positive";
      className = "text-success";
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
      // Same dollar difference as the amount column; footerDiffCustom uses
      // it to choose the check or the X. No format, so it is not displayed.
      customAggregate: amountDifferenceAggregate,
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