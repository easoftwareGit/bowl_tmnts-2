"use client";

import React from "react";
import { render, screen } from "@testing-library/react";
import DivPrizeFundGrid from "@/app/dataEntry/prizeFunds/divPfGrid/divPfGrid";
import type {
  divPfEntryRow,
  syncfusionColumnDef,
  syncFusionAggregateDef,
} from "@/lib/types/types";
import { useDispatch, useSelector } from "react-redux";
import {
  createDivPfColumns,
} from "@/app/dataEntry/prizeFunds/divPfGrid/sfCreateDivPfColumns";
import {
  createDivPfTotalAggregates,
  createDivPfDiffAggregates,
} from "@/app/dataEntry/prizeFunds/divPfGrid/sfDivPfAggregates";

jest.mock("@/lib/syncfusion-license", () => ({}));

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock(
  "@/app/dataEntry/prizeFunds/divPfGrid/sfCreateDivPfColumns",
  () => ({
    createDivPfColumns: jest.fn(),
  }),
);

jest.mock(
  "@/app/dataEntry/prizeFunds/divPfGrid/sfDivPfAggregates",
  () => ({
    createDivPfTotalAggregates: jest.fn(),
    createDivPfDiffAggregates: jest.fn(),
  }),
);

jest.mock("@/redux/features/divPfs/divPfsSlice", () => ({
  getDivPfsSaveStatus: jest.fn(),
  saveDivPfs: jest.fn(),
}));

jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,
  default: ({
    show,
    message,
  }: {
    show: boolean;
    message: string;
  }) =>
    show ? (
      <div data-testid="wait-modal">{message}</div>
    ) : null,
}));

jest.mock("@/components/modal/confirmModal", () => ({
  __esModule: true,
  cancelConfTitle: "Confirm Cancel",
  default: ({ show }: { show: boolean }) =>
    show ? <div data-testid="confirm-modal" /> : null,
}));

jest.mock("@/components/modal/errorModal", () => ({
  __esModule: true,
  default: ({ show }: { show: boolean }) =>
    show ? <div data-testid="error-modal" /> : null,
}));

let latestGridProps: Record<string, unknown> = {};

const gridApi = {
  toolbarModule: {
    enableItems: jest.fn(),
  },
};

jest.mock("@syncfusion/ej2-react-grids", () => {
  const React = require("react");

  function MockGrid(
    props: Record<string, unknown> & {
      children: React.ReactNode;
    },
    ref: React.ForwardedRef<unknown>,
  ) {
    latestGridProps = props;

    // React.useImperativeHandle(ref, () => ({}));
    React.useImperativeHandle(ref, () => gridApi);

    return (
      <div data-testid="div-pf-grid">
        {props.children}
      </div>
    );
  }

  const GridComponent = React.forwardRef(MockGrid);
  GridComponent.displayName = "MockGrid";

  return {
    GridComponent,

    ColumnsDirective: ({
      children,
    }: {
      children: React.ReactNode;
    }) => <>{children}</>,

    ColumnDirective: () => (
      <div data-testid="column-directive" />
    ),

    AggregatesDirective: ({
      children,
    }: {
      children: React.ReactNode;
    }) => <>{children}</>,

    AggregateDirective: ({
      children,
    }: {
      children: React.ReactNode;
    }) => <>{children}</>,

    AggregateColumnsDirective: ({
      children,
    }: {
      children: React.ReactNode;
    }) => <>{children}</>,

    AggregateColumnDirective: () => (
      <div data-testid="aggregate-column" />
    ),

    Inject: () => (
      <div data-testid="inject" />
    ),

    Aggregate: jest.fn(),
    Edit: jest.fn(),
    Toolbar: jest.fn(),
  };
});

const mockDispatch = jest.mocked(useDispatch);
const mockSelector = jest.mocked(useSelector);

const mockCreateColumns = jest.mocked(createDivPfColumns);
const mockCreateTotals = jest.mocked(createDivPfTotalAggregates);
const mockCreateDiffs = jest.mocked(createDivPfDiffAggregates);

const rows: divPfEntryRow[] = [
  {
    id: "1",
    div_id: "div1",
    position: 1,
    amount: 100,
    percentage: 0.5,
  },
  {
    id: "2",
    div_id: "div1",
    position: 2,
    amount: 100,
    percentage: 0.5,
  },
];

const columns: syncfusionColumnDef[] = [
  {
    field: "position",
    headerText: "Pos",
  },
  {
    field: "amount",
    headerText: "Amount",
  },
  {
    field: "percentage",
    headerText: "Percent",
  },
];

const aggregates: syncFusionAggregateDef[] = [
  {
    field: "amount",
    type: "Sum",
  },
];

const setup = () => {
  render(
    <DivPrizeFundGrid
      rows={rows}
      setRows={jest.fn()}
      totalPrizeFund={200}
      gridDataWasChanged={false}
      onGridDataChanged={jest.fn()}
      onGridDataReset={jest.fn()}
      onBack={jest.fn()}
    />,
  );
};

describe("DivPrizeFundGrid render", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    latestGridProps = {};
    gridApi.toolbarModule.enableItems.mockClear();

    mockDispatch.mockReturnValue(jest.fn());
    mockSelector.mockReturnValue("idle");

    mockCreateColumns.mockReturnValue(columns);
    mockCreateTotals.mockReturnValue(aggregates);
    mockCreateDiffs.mockReturnValue(aggregates);
  });

  it("renders the grid", () => {
    setup();

    expect(
      screen.getByTestId("div-pf-grid"),
    ).toBeInTheDocument();
  });

  it("creates the columns", () => {
    setup();

    expect(mockCreateColumns).toHaveBeenCalledTimes(1);
  });

  it("creates the total aggregates", () => {
    setup();

    expect(mockCreateTotals).toHaveBeenCalledTimes(1);
  });

  it("creates the difference aggregates", () => {
    setup();

    expect(mockCreateDiffs).toHaveBeenCalledWith(200);
  });

  it("renders one ColumnDirective per column", () => {
    setup();

    expect(
      screen.getAllByTestId("column-directive"),
    ).toHaveLength(columns.length);
  });

  it("renders one AggregateColumnDirective per aggregate", () => {
    setup();

    expect(
      screen.getAllByTestId("aggregate-column"),
    ).toHaveLength(
      aggregates.length * 2,
    );
  });

  it("renders the Inject component", () => {
    setup();

    expect(
      screen.getByTestId("inject"),
    ).toBeInTheDocument();
  });

  it("passes expected GridComponent props", () => {
    setup();

    expect(latestGridProps.id).toBe("divPfGrid");
    expect(latestGridProps.width).toBe("450");
    expect(latestGridProps.height).toBe("350");
    expect(latestGridProps.allowSelection).toBe(true);
    expect(latestGridProps.allowSorting).toBe(false);
    expect(latestGridProps.enableStickyHeader).toBe(true);
    expect(latestGridProps.gridLines).toBe("Both");
  });

  it("does not show the wait modal when idle", () => {
    setup();

    expect(
      screen.queryByTestId("wait-modal"),
    ).not.toBeInTheDocument();
  });

  it("shows the wait modal when saving", () => {
    mockSelector.mockReturnValue("saving");

    setup();

    expect(
      screen.getByTestId("wait-modal"),
    ).toHaveTextContent("Saving...");
  });

  it("does not show the confirm modal initially", () => {
    setup();

    expect(
      screen.queryByTestId("confirm-modal"),
    ).not.toBeInTheDocument();
  });

  it("does not show the error modal initially", () => {
    setup();

    expect(
      screen.queryByTestId("error-modal"),
    ).not.toBeInTheDocument();
  });
});