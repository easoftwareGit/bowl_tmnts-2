import React, { type ReactElement, type ReactNode } from "react";
import type { brktType, divType, elimType, potType } from "@/lib/types/types";
import { createAggregates } from "@/app/dataEntry/playersForm/sfPlayerAggregates"; 
import {
  entryFeeColName,
  entryNumBrktsColName,
} from "@/app/dataEntry/playersForm/sfCreatePlayerColumns";

const getChildren = (node: ReactNode): ReactNode => {
  expect(React.isValidElement(node)).toBe(true);

  return (node as ReactElement<{ children: ReactNode }>).props.children;
};

describe("createAggregates", () => {
  const divs = [
    { id: "div_1" },
    { id: "div_2" },
  ] as divType[];

  const pots = [{ id: "pot_1" }] as potType[];

  const brkts = [
    { id: "brkt_1" },
    { id: "brkt_2" },
  ] as brktType[];

  const elims = [{ id: "elim_1" }] as elimType[];

  it("creates fixed aggregates first", () => {
    const aggregates = createAggregates(divs, pots, brkts, elims);

    expect(aggregates[0]).toMatchObject({
      field: "first_name",
      type: "Custom",
    });

    expect(aggregates[0].customAggregate?.({})).toBe("");
    expect(getChildren(aggregates[0].footerTemplate?.({}))).toBe("Totals:");

    expect(aggregates[1]).toMatchObject({
      field: "feeTotal",
      type: "Sum",
      format: "C2",
    });

    expect(getChildren(aggregates[1].footerTemplate?.({ Sum: 123 }))).toBe(123);
  });

  it("creates division fee aggregates", () => {
    const aggregates = createAggregates(divs, [], [], []);

    expect(aggregates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: entryFeeColName("div_1"),
          type: "Sum",
          format: "C2",
        }),
        expect.objectContaining({
          field: entryFeeColName("div_2"),
          type: "Sum",
          format: "C2",
        }),
      ])
    );
  });

  it("creates pot fee aggregates", () => {
    const aggregates = createAggregates([], pots, [], []);

    expect(aggregates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: entryFeeColName("pot_1"),
          type: "Sum",
          format: "C2",
        }),
      ])
    );
  });

  it("creates bracket count and bracket fee aggregates", () => {
    const aggregates = createAggregates([], [], brkts, []);

    expect(aggregates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: entryNumBrktsColName("brkt_1"),
          type: "Sum",
          format: "N",
        }),
        expect.objectContaining({
          field: entryFeeColName("brkt_1"),
          type: "Sum",
          format: "C2",
        }),
        expect.objectContaining({
          field: entryNumBrktsColName("brkt_2"),
          type: "Sum",
          format: "N",
        }),
        expect.objectContaining({
          field: entryFeeColName("brkt_2"),
          type: "Sum",
          format: "C2",
        }),
      ])
    );
  });

  it("creates eliminator fee aggregates", () => {
    const aggregates = createAggregates([], [], [], elims);

    expect(aggregates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: entryFeeColName("elim_1"),
          type: "Sum",
          format: "C2",
        }),
      ])
    );
  });

  it("returns aggregates in the expected order", () => {
    const aggregates = createAggregates(divs, pots, brkts, elims);

    const fields = aggregates.map((aggregate) => aggregate.field);

    expect(fields).toEqual([
      "first_name",
      "feeTotal",

      entryFeeColName("div_1"),
      entryFeeColName("div_2"),

      entryFeeColName("pot_1"),

      entryNumBrktsColName("brkt_1"),
      entryFeeColName("brkt_1"),
      entryNumBrktsColName("brkt_2"),
      entryFeeColName("brkt_2"),

      entryFeeColName("elim_1"),
    ]);
  });

  it("footer sum shows 0 when Sum is missing", () => {
    const aggregates = createAggregates([], [], [], []);

    expect(getChildren(aggregates[1].footerTemplate?.({}))).toBe(0);
  });
});