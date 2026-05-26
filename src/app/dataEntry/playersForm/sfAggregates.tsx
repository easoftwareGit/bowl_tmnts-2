import type { ReactNode } from "react";
import type { brktType, divType, elimType, potType } from "@/lib/types/types";
import {
  entryFeeColName,
  entryNumBrktsColName,
} from "./sfCreatePlayerColumns";

type AggregateFooterProps = Partial<{
  Sum: number;
  Average: number;
  Min: number;
  Max: number;
  Count: number;
}>;

export type syncFusionAggregateDef = {
  field: string;
  type: "Sum" | "Average" | "Min" | "Max" | "Custom";
  format?: string;
  customAggregate?: (props: AggregateFooterProps) => string;
  footerTemplate?: (props: AggregateFooterProps) => ReactNode;
};

const emptyCustomAggregate = () => "";

const footerCustom = (_props: AggregateFooterProps) => <div>Totals:</div>;

function footerSum(props: AggregateFooterProps) {
  return <div>{props.Sum ?? 0}</div>;
}

/**
 * Create the aggregates for the syncfusion grid
 * 
 * @param {divType[]} divs - array of divs
 * @param {potType[]} pots - array of pots
 * @param {brktType[]} brkts - array of brkts
 * @param {elimType[]} elims - array of elims
 * @returns {syncFusionAggregateDef[]} - array of aggregates for the grid
 */
export const createAggregates = (
  divs: divType[],
  pots: potType[],
  brkts: brktType[],
  elims: elimType[]
): syncFusionAggregateDef[] => {
  const fixedAggregates: syncFusionAggregateDef[] = [
    {
      field: "first_name",
      type: "Custom",
      customAggregate: emptyCustomAggregate,
      footerTemplate: footerCustom,
    },
    {
      field: "feeTotal",
      type: "Sum",
      format: "C2",
      footerTemplate: footerSum,
    },
  ];

  const divAggregates = divs.map((div) => ({
    field: entryFeeColName(div.id),
    type: "Sum" as const,
    format: "C2",
    footerTemplate: footerSum,
  }));

  const potAggregates = pots.map((pot) => ({
    field: entryFeeColName(pot.id),
    type: "Sum" as const,
    format: "C2",
    footerTemplate: footerSum,
  }));

  const brktAggregates = brkts.flatMap((brkt) => [
    {
      field: entryNumBrktsColName(brkt.id),
      type: "Sum" as const,
      format: "N",
      footerTemplate: footerSum,
    },
    {
      field: entryFeeColName(brkt.id),
      type: "Sum" as const,
      format: "C2",
      footerTemplate: footerSum,
    },
  ]);

  const elimAggregates = elims.map((elim) => ({
    field: entryFeeColName(elim.id),
    type: "Sum" as const,
    format: "C2",
    footerTemplate: footerSum,
  }));

  return [
    ...fixedAggregates,
    ...divAggregates,
    ...potAggregates,
    ...brktAggregates,
    ...elimAggregates,
  ];
};