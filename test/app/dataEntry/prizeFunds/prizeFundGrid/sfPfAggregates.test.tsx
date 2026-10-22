import React from "react";
import { render, screen } from "@testing-library/react";
import {
  createPfDiffAggregates,
  createPfTotalAggregates,
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/sfPfAggregates";
import {
  pfEntryAmountColName,
  pfEntryPercentColName,
  pfEntryPositionColName,
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/sfCreatePfColumns";
import type { prizeFundEntryRow } from "@/lib/types/types";

/*
 * next/image is replaced by a plain <img> so the check / X icons can be
 * queried by role and alt text without Next's image loader.
 */
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    title,
    width,
    height,
    className,
  }: {
    src: string;
    alt: string;
    title?: string;
    width?: number;
    height?: number;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      title={title}
      width={width}
      height={height}
      className={className}
    />
  ),
}));

const goodSumAlt = "Amounts equal the prize fund";
const badSumAlt = "Amounts do not equal the prize fund";

const queryCheck = () => screen.queryByRole("img", { name: goodSumAlt });
const queryX = () => screen.queryByRole("img", { name: badSumAlt });

const makeRow = (position: number, amount: number): prizeFundEntryRow => ({
  id: `dpf_${String(position).padStart(32, "0")}`,
  parent_id: "div_00000000000000000000000000000001",
  position,
  amount,
  percentage: 0,
});

/** 100 + 50 = 150 */
const rows: prizeFundEntryRow[] = [makeRow(1, 100), makeRow(2, 50)];

/*************************
 * createPfTotalAggregates *
 *************************/

describe("createPfTotalAggregates", () => {
  it("creates the position, amount and percent aggregates", () => {
    const result = createPfTotalAggregates();

    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      field: pfEntryPositionColName,
      type: "Custom",
    });
    expect(result[1]).toMatchObject({
      field: pfEntryAmountColName,
      type: "Sum",
      format: "C2",
    });
    expect(result[2]).toMatchObject({
      field: pfEntryPercentColName,
      type: "Sum",
      format: "P2",
    });
  });

  it("gives the position column an empty custom value", () => {
    const result = createPfTotalAggregates();

    expect(result[0].customAggregate?.(rows)).toBe("");
  });

  it("renders Total in the position footer", () => {
    const result = createPfTotalAggregates();

    render(<>{result[0].footerTemplate?.({})}</>);

    expect(screen.getByText("Total")).toBeInTheDocument();
  });

  it("renders the Sum value in the amount and percent footers", () => {
    const result = createPfTotalAggregates();

    render(
      <>
        {result[1].footerTemplate?.({ Sum: "$150.00" })}
        {result[2].footerTemplate?.({ Sum: "75.00%" })}
      </>,
    );

    expect(screen.getByText("$150.00")).toBeInTheDocument();
    expect(screen.getByText("75.00%")).toBeInTheDocument();
  });

  it("renders 0 when Sum is missing", () => {
    const result = createPfTotalAggregates();

    render(<>{result[1].footerTemplate?.({})}</>);

    expect(screen.getByText("0")).toBeInTheDocument();
  });
});

/*************************
 * createPfDiffAggregates *
 *************************/

describe("createPfDiffAggregates", () => {
  it("creates the position, amount and percent aggregates", () => {
    const result = createPfDiffAggregates(() => 200);

    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      field: pfEntryPositionColName,
      type: "Custom",
    });
    // No format: the position column's value is used, not displayed.
    expect(result[0].format).toBeUndefined();
    expect(result[1]).toMatchObject({
      field: pfEntryAmountColName,
      type: "Custom",
      format: "C2",
    });
    expect(result[2]).toMatchObject({
      field: pfEntryPercentColName,
      type: "Custom",
      format: "P2",
    });
  });

  /**********************
   * Amount difference  *
   **********************/

  describe("amount difference", () => {
    it("calculates total prize fund minus the sum of the amounts", () => {
      const result = createPfDiffAggregates(() => 200);

      expect(result[1].customAggregate?.(rows)).toBe(50);
    });

    it("reads rows from a result object", () => {
      const result = createPfDiffAggregates(() => 200);

      expect(result[1].customAggregate?.({ result: rows })).toBe(50);
    });

    it("reads rows from a data object", () => {
      const result = createPfDiffAggregates(() => 200);

      expect(result[1].customAggregate?.({ data: rows })).toBe(50);
    });

    it("treats an unknown data shape as no rows", () => {
      const result = createPfDiffAggregates(() => 200);

      expect(result[1].customAggregate?.({ unexpected: true })).toBe(200);
    });

    it("treats missing amounts as 0", () => {
      const result = createPfDiffAggregates(() => 200);

      expect(
        result[1].customAggregate?.([{ ...rows[0], amount: null }]),
      ).toBe(200);
    });

    it("is negative when the amounts exceed the prize fund", () => {
      const result = createPfDiffAggregates(() => 120);

      expect(result[1].customAggregate?.(rows)).toBe(-30);
    });

    it("uses the latest total prize fund returned by the callback", () => {
      let totalPrizeFund = 200;
      const result = createPfDiffAggregates(() => totalPrizeFund);

      expect(result[1].customAggregate?.(rows)).toBe(50);

      totalPrizeFund = 250;

      expect(result[1].customAggregate?.(rows)).toBe(100);
    });
  });

  /***********************
   * Percent difference  *
   ***********************/

  describe("percent difference", () => {
    it("calculates the unallocated share of the prize fund", () => {
      const result = createPfDiffAggregates(() => 200);

      expect(result[2].customAggregate?.(rows)).toBe(0.25);
    });

    it("returns 0 when the total prize fund is 0", () => {
      const result = createPfDiffAggregates(() => 0);

      expect(result[2].customAggregate?.(rows)).toBe(0);
    });

    it("uses the latest total prize fund returned by the callback", () => {
      let totalPrizeFund = 200;
      const result = createPfDiffAggregates(() => totalPrizeFund);

      expect(result[2].customAggregate?.(rows)).toBe(0.25);

      totalPrizeFund = 250;

      expect(result[2].customAggregate?.(rows)).toBe(0.4);
    });
  });

  /*********************************
   * Position column: check / X    *
   *********************************/

  describe("position column", () => {
    it("calculates the same dollar difference as the amount column", () => {
      const result = createPfDiffAggregates(() => 200);

      expect(result[0].customAggregate?.(rows)).toBe(50);
      expect(result[0].customAggregate?.(rows)).toBe(
        result[1].customAggregate?.(rows),
      );
    });

    it("uses the latest total prize fund returned by the callback", () => {
      let totalPrizeFund = 200;
      const result = createPfDiffAggregates(() => totalPrizeFund);

      totalPrizeFund = 150;

      expect(result[0].customAggregate?.(rows)).toBe(0);
    });

    it("renders Difference with a check when the difference is 0", () => {
      const result = createPfDiffAggregates(() => 150);

      render(<>{result[0].footerTemplate?.({ Custom: 0 })}</>);

      expect(screen.getByText("Difference")).toBeInTheDocument();
      expect(queryCheck()).toBeInTheDocument();
      expect(queryX()).not.toBeInTheDocument();
    });

    it("shows the check image and tooltip", () => {
      const result = createPfDiffAggregates(() => 150);

      render(<>{result[0].footerTemplate?.({ Custom: 0 })}</>);

      expect(queryCheck()).toHaveAttribute(
        "src",
        "/check-circle-fill-success.svg",
      );
      expect(queryCheck()).toHaveAttribute("title", goodSumAlt);
    });

    it("renders Difference with an X when the difference is not 0", () => {
      const result = createPfDiffAggregates(() => 200);

      render(<>{result[0].footerTemplate?.({ Custom: 50 })}</>);

      expect(screen.getByText("Difference")).toBeInTheDocument();
      expect(queryX()).toBeInTheDocument();
      expect(queryCheck()).not.toBeInTheDocument();
    });

    it("shows the X image and tooltip", () => {
      const result = createPfDiffAggregates(() => 200);

      render(<>{result[0].footerTemplate?.({ Custom: 50 })}</>);

      expect(queryX()).toHaveAttribute("src", "/x-circle-fill-danger.svg");
      expect(queryX()).toHaveAttribute("title", badSumAlt);
    });

    it.each([
      ["a missing value", undefined],
      ["formatted zero", "$0.00"],
      ["string zero", "0"],
      ["negative zero", -0],
      ["less than a cent over", 0.009],
      ["less than a cent under", -0.004],
    ])("shows the check for %s", (_label, custom) => {
      const result = createPfDiffAggregates(() => 150);

      render(<>{result[0].footerTemplate?.({ Custom: custom })}</>);

      expect(queryCheck()).toBeInTheDocument();
    });

    it.each([
      ["one cent left over", 0.01],
      ["one cent too much", -0.01],
      ["a formatted positive amount", "$1,234.50"],
      ["a formatted negative amount", "-$25.00"],
      ["a negative number", -30],
    ])("shows the X for %s", (_label, custom) => {
      const result = createPfDiffAggregates(() => 150);

      render(<>{result[0].footerTemplate?.({ Custom: custom })}</>);

      expect(queryX()).toBeInTheDocument();
    });

    it("shows the check when floating-point addition leaves a tiny remainder", () => {
      // 0.1 + 0.2 = 0.30000000000000004
      const noisyRows = [makeRow(1, 0.1), makeRow(2, 0.2)];
      const result = createPfDiffAggregates(() => 0.3);

      const difference = result[0].customAggregate?.(noisyRows) as number;
      expect(difference).not.toBe(0);

      render(<>{result[0].footerTemplate?.({ Custom: difference })}</>);

      expect(queryCheck()).toBeInTheDocument();
    });
  });

  /****************************
   * Amount / percent footers *
   ****************************/

  describe("amount and percent footers", () => {
    it("renders a positive difference in green", () => {
      const result = createPfDiffAggregates(() => 200);

      render(<>{result[1].footerTemplate?.({ Custom: 50 })}</>);

      expect(screen.getByText("50")).toHaveClass("text-success");
    });

    it("renders a negative difference in red", () => {
      const result = createPfDiffAggregates(() => 200);

      render(<>{result[1].footerTemplate?.({ Custom: -25 })}</>);

      expect(screen.getByText("-25")).toHaveClass("text-danger");
    });

    it("renders a zero difference without color", () => {
      const result = createPfDiffAggregates(() => 200);

      render(<>{result[1].footerTemplate?.({ Custom: 0 })}</>);

      expect(screen.getByText("0")).not.toHaveClass("text-success");
      expect(screen.getByText("0")).not.toHaveClass("text-danger");
    });

    it("colors formatted values by their sign", () => {
      const result = createPfDiffAggregates(() => 200);

      render(
        <>
          {result[1].footerTemplate?.({ Custom: "$1,250.00" })}
          {result[1].footerTemplate?.({ Custom: "-$25.00" })}
          {result[2].footerTemplate?.({ Custom: "12.50%" })}
        </>,
      );

      expect(screen.getByText("$1,250.00")).toHaveClass("text-success");
      expect(screen.getByText("-$25.00")).toHaveClass("text-danger");
      expect(screen.getByText("12.50%")).toHaveClass("text-success");
    });

    it("renders 0 without color when the value is missing", () => {
      const result = createPfDiffAggregates(() => 200);

      render(<>{result[2].footerTemplate?.({})}</>);

      expect(screen.getByText("0")).not.toHaveClass("text-success");
      expect(screen.getByText("0")).not.toHaveClass("text-danger");
    });
  });
});


// import React from "react";
// import { render, screen } from "@testing-library/react";
// import {
//   createPfDiffAggregates,
//   createPfTotalAggregates,
// } from "@/app/dataEntry/prizeFunds/prizeFundGrid/sfPfAggregates";
// import {
//   pfEntryAmountColName,
//   pfEntryPercentColName,
//   pfEntryPositionColName,
// } from "@/app/dataEntry/prizeFunds/prizeFundGrid/sfCreatePfColumns";
// import type { prizeFundEntryRow } from "@/lib/types/types";

// jest.mock(
//   "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundGrid.css",
//   () => ({}),
// );

// describe("createPfTotalAggregates", () => {
//   it("creates the expected total aggregate definitions", () => {
//     const result = createPfTotalAggregates();

//     expect(result).toHaveLength(3);

//     expect(result[0]).toMatchObject({
//       field: pfEntryPositionColName,
//       type: "Custom",
//     });

//     expect(result[1]).toMatchObject({
//       field: pfEntryAmountColName,
//       type: "Sum",
//       format: "C2",
//     });

//     expect(result[2]).toMatchObject({
//       field: pfEntryPercentColName,
//       type: "Sum",
//       format: "P2",
//     });
//   });

//   it("renders Total in the position footer", () => {
//     const result = createPfTotalAggregates();

//     render(<>{result[0].footerTemplate?.({})}</>);

//     expect(screen.getByText("Total")).toBeInTheDocument();
//   });

//   it("renders Sum value in amount and percent footers", () => {
//     const result = createPfTotalAggregates();

//     render(
//       <>
//         {result[1].footerTemplate?.({ Sum: 150 })}
//         {result[2].footerTemplate?.({ Sum: 0.75 })}
//       </>,
//     );

//     expect(screen.getByText("150")).toBeInTheDocument();
//     expect(screen.getByText("0.75")).toBeInTheDocument();
//   });

//   it("renders 0 when Sum is missing", () => {
//     const result = createPfTotalAggregates();

//     render(<>{result[1].footerTemplate?.({})}</>);

//     expect(screen.getByText("0")).toBeInTheDocument();
//   });
// });

// describe("createPfDiffAggregates", () => {
//   const rows: prizeFundEntryRow[] = [
//     {
//       id: "dpf_00000000000000000000000000000001",
//       parent_id: "div_00000000000000000000000000000001",
//       position: 1,
//       amount: 100,
//       percentage: 0.5,
//     },
//     {
//       id: "dpf_00000000000000000000000000000002",
//       parent_id: "div_00000000000000000000000000000001",
//       position: 2,
//       amount: 50,
//       percentage: 0.25,
//     },
//   ];

//   it("creates the expected difference aggregate definitions", () => {
//     const result = createPfDiffAggregates(() => 200);

//     expect(result).toHaveLength(3);

//     expect(result[0]).toMatchObject({
//       field: pfEntryPositionColName,
//       type: "Custom",
//     });

//     expect(result[1]).toMatchObject({
//       field: pfEntryAmountColName,
//       type: "Custom",
//       format: "C2",
//     });

//     expect(result[2]).toMatchObject({
//       field: pfEntryPercentColName,
//       type: "Custom",
//       format: "P2",
//     });
//   });

//   it("renders Difference in the position footer", () => {
//     const result = createPfDiffAggregates(() => 200);

//     render(<>{result[0].footerTemplate?.({})}</>);

//     expect(screen.getByText("Difference")).toBeInTheDocument();
//   });

//   it("calculates amount difference from an array of rows", () => {
//     const result = createPfDiffAggregates(() => 200);

//     expect(result[1].customAggregate?.(rows)).toBe(50);
//   });

//   it("calculates amount difference from a result object", () => {
//     const result = createPfDiffAggregates(() => 200);

//     expect(result[1].customAggregate?.({ result: rows })).toBe(50);
//   });

//   it("calculates amount difference from a data object", () => {
//     const result = createPfDiffAggregates(() => 200);

//     expect(result[1].customAggregate?.({ data: rows })).toBe(50);
//   });

//   it("calculates percent difference", () => {
//     const result = createPfDiffAggregates(() => 200);

//     expect(result[2].customAggregate?.(rows)).toBe(0.25);
//   });

//   it("returns 0 percent difference when totalPrizeFund is 0", () => {
//     const result = createPfDiffAggregates(() => 0);

//     expect(result[2].customAggregate?.(rows)).toBe(0);
//   });

//   it("treats missing amount values as 0", () => {
//     const rowsWithMissingAmount = [
//       {
//         id: "dpf_00000000000000000000000000000001",
//         div_id: "div_00000000000000000000000000000001",
//         position: 1,
//         amount: null,
//         percentage: 0,
//       },
//     ];

//     const result = createPfDiffAggregates(() => 200);

//     expect(result[1].customAggregate?.(rowsWithMissingAmount)).toBe(200);
//   });

//   it("renders positive custom footer with positive class", () => {
//     const result = createPfDiffAggregates(() => 200);

//     render(<>{result[1].footerTemplate?.({ Custom: 50 })}</>);

//     expect(screen.getByText("50")).toHaveClass("pf-positive");
//   });

//   it("renders negative custom footer with negative class", () => {
//     const result = createPfDiffAggregates(() => 200);

//     render(<>{result[1].footerTemplate?.({ Custom: -25 })}</>);

//     expect(screen.getByText("-25")).toHaveClass("pf-negative");
//   });

//   it("renders zero custom footer with no positive or negative class", () => {
//     const result = createPfDiffAggregates(() => 200);

//     render(<>{result[1].footerTemplate?.({ Custom: 0 })}</>);

//     expect(screen.getByText("0")).not.toHaveClass("pf-positive");
//     expect(screen.getByText("0")).not.toHaveClass("pf-negative");
//   });

//   it("uses the latest total prize fund returned by the callback", () => {
//     let totalPrizeFund = 200;

//     const result = createPfDiffAggregates(
//       () => totalPrizeFund,
//     );

//     expect(result[1].customAggregate?.(rows)).toBe(50);

//     totalPrizeFund = 250;

//     expect(result[1].customAggregate?.(rows)).toBe(100);
//   });

//   it("uses the latest total prize fund when calculating percent difference", () => {
//     let totalPrizeFund = 200;

//     const result = createPfDiffAggregates(
//       () => totalPrizeFund,
//     );

//     expect(result[2].customAggregate?.(rows)).toBe(0.25);

//     totalPrizeFund = 250;

//     expect(result[2].customAggregate?.(rows)).toBe(0.4);
//   });

//   it("treats an unknown aggregate data shape as an empty row set", () => {
//     const result = createPfDiffAggregates(() => 200);

//     expect(
//       result[1].customAggregate?.({ unexpected: true }),
//     ).toBe(200);
//   });

// });

