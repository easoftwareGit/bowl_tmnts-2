import type {
  AggregateFooterProps,
  divPfEntryRow,
  syncFusionAggregateDef,
} from "@/lib/types/types";
import {
  divPfEntryAmountColName,
  divPfEntryPercentColName,
  divPfEntryPositionColName,
} from "./sfCreateDivPfColumns";
import "../prizeFundGrid.css";

const emptyCustomAggregate = () => "";

const footerTotalCustom = (_props: AggregateFooterProps) => <div>Total</div>;
const footerDiffCustom = (_props: AggregateFooterProps) => (
  <div>Difference</div>
);

function footerSum(props: AggregateFooterProps) {
  return <div>{props.Sum ?? 0}</div>;
}

/**
 * Create the total aggregates for the div prize fund grid
 *
 * @returns {syncFusionAggregateDef[]} - array of aggregates
 */
export const createDivPfTotalAggregates = (): syncFusionAggregateDef[] => {
  const fixedAggregate: syncFusionAggregateDef[] = [
    {
      field: divPfEntryPositionColName,
      type: "Custom",
      customAggregate: emptyCustomAggregate,
      footerTemplate: footerTotalCustom,
    },
  ];

  const amountAggregate: syncFusionAggregateDef[] = [
    {
      field: divPfEntryAmountColName,
      type: "Sum",
      format: "C2",
      footerTemplate: footerSum,
    },
  ];

  const percentAggregate: syncFusionAggregateDef[] = [
    {
      field: divPfEntryPercentColName,
      type: "Sum",
      format: "P2",
      footerTemplate: footerSum,
    },
  ];

  return [...fixedAggregate, ...amountAggregate, ...percentAggregate];
};

/**
 * Create the difference (totalPrizeFund - sum of position amounts) aggregates for the div prize fund grid
 *
 * @param {number} totalPrizeFund - the total amount of the prize fund
 * @returns {syncFusionAggregateDef[]} - array of aggregates
 */
export const createDivPfDiffAggregates = (
  totalPrizeFund: number,
): syncFusionAggregateDef[] => {
  // cuntom value is a string with $, %, or ,
  // remove $, %, and , and convert to number
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
   * Calculates the sum of the amount column
   *
   * @param {any} data - grid row data
   * @returns {number} - sum of the amount column
   */
  const totalAmount = (data: any): number => {
    // get rows from data array or object.result array or object.data array
    const rows = Array.isArray(data)
      ? data
      : (data?.result ?? data?.data ?? []);

    // sum the amounts
    return rows.reduce(
      (sum: number, row: divPfEntryRow) => sum + (row.amount ?? 0),
      0,
    );
  };

  const amountDifferenceAggregate = (data: any): number => {
    return totalPrizeFund - totalAmount(data);
  };

  const percentDifferenceAggregate = (data: any): number => {
    if (totalPrizeFund === 0) return 0;
    return (totalPrizeFund - totalAmount(data)) / totalPrizeFund;
  };

  /**
   * Returns a <div> with the custom value
   *
   * @param {AggregateFooterProps} props - aggregate footer props
   * @returns { ReactNode } - <div>...</div> section with custom value
   */
  const footerCustom = (props: AggregateFooterProps) => {
    const value = customValueToNumber(props.Custom);

    let className = "";
    if (value < 0) {
      className = "pf-negative";
    } else if (value > 0) {
      className = "pf-positive";
    }

    return <div className={className}>{props.Custom ?? 0}</div>;
  };

  return [
    {
      field: divPfEntryPositionColName,
      type: "Custom",
      customAggregate: () => "",
      footerTemplate: footerDiffCustom,
    },
    {
      field: divPfEntryAmountColName,
      type: "Custom",
      customAggregate: amountDifferenceAggregate,
      format: "C2",
      footerTemplate: footerCustom,
    },
    {
      field: divPfEntryPercentColName,
      type: "Custom",
      customAggregate: percentDifferenceAggregate,
      format: "P2",
      footerTemplate: footerCustom,
    },
  ];
};
