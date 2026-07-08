import React from "react";
import { render, screen } from "@testing-library/react";
import cloneDeep from "lodash/cloneDeep";
import { MoneyDescrip, MoneyFlow } from "@prisma/client";
import BalanceSheetReport from "@/app/reports/components/BalanceSheetReport";
import { blankTmntMoney } from "@/lib/db/initVals";
import {
  mockTmntFullData,
  eventId1,
  squadId1,
  divId1,
  potId1,
  brktId1,
  elimId1,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

jest.mock("@react-pdf/renderer", () => ({
  Document: ({
    children,
    title,
    onRender,
  }: {
    children: React.ReactNode;
    title?: string;
    onRender?: () => void;
  }) => {
    onRender?.();

    return (
      <div data-testid="pdf-document" data-title={title}>
        {children}
      </div>
    );
  },

  Page: ({
    children,
    size,
  }: {
    children: React.ReactNode;
    size?: string;
  }) => (
    <div data-testid="pdf-page" data-size={size}>
      {children}
    </div>
  ),

  Text: ({
    children,
    render,
  }: {
    children?: React.ReactNode;
    render?: (props: { pageNumber: number; totalPages: number }) => string;
  }) => (
    <span>
      {render ? render({ pageNumber: 1, totalPages: 1 }) : children}
    </span>
  ),

  View: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),

  StyleSheet: {
    create: <T,>(styles: T): T => styles,
  },
}));

describe("BalanceSheetReport", () => {
  it("renders the no data document when tournament money data is empty", () => {
    const reportData = cloneDeep(mockTmntFullData);
    reportData.moneys = [];

    render(<BalanceSheetReport tmntFullData={reportData} />);

    expect(screen.getByText("No tournament data found.")).toBeInTheDocument();
  });

  it("calls onRender", () => {
    const onRender = jest.fn();

    render(
      <BalanceSheetReport
        tmntFullData={mockTmntFullData}
        onRender={onRender}
      />,
    );

    expect(onRender).toHaveBeenCalled();
  });

  it("renders the report title, tournament name, date, and page number", () => {
    render(<BalanceSheetReport tmntFullData={mockTmntFullData} />);

    expect(screen.getByText(/Mock Tournament/i)).toBeInTheDocument();
    expect(screen.getByText(/09\/01\/2025/i)).toBeInTheDocument();
    expect(screen.getByText("Balance Sheet")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
  });

  it("renders the column headings", () => {
    render(<BalanceSheetReport tmntFullData={mockTmntFullData} />);

    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
  });

  it("renders the In Flows group", () => {
    render(<BalanceSheetReport tmntFullData={mockTmntFullData} />);

    expect(screen.getByText("In Flows")).toBeInTheDocument();
  });

  it("renders In Flows descriptions", () => {
    render(<BalanceSheetReport tmntFullData={mockTmntFullData} />);

    expect(screen.getByText("Added Money")).toBeInTheDocument();
    expect(screen.getAllByText("Entries").length).toBeGreaterThan(0);
  });

  it("renders division sources for division money", () => {
    render(<BalanceSheetReport tmntFullData={mockTmntFullData} />);

    // 1 scratch division im mock data, it appears twice in the report
    expect(screen.getAllByText("Division: Scratch")).toHaveLength(2);
  });  

  it("renders a pot source for pot entry money", () => {
    render(<BalanceSheetReport tmntFullData={mockTmntFullData} />);

    expect(screen.getByText("Pot: Scratch: Game")).toBeInTheDocument();
  });

  it("renders bracket sources for bracket entry money", () => {
    render(<BalanceSheetReport tmntFullData={mockTmntFullData} />);

    expect(screen.getAllByText(/Bracket: Scratch/i).length).toBeGreaterThan(0);
  });

  it("renders eliminator sources for eliminator entry money", () => {
    render(<BalanceSheetReport tmntFullData={mockTmntFullData} />);

    expect(
      screen.getAllByText(/Eliminator: Scratch/i).length,
    ).toBeGreaterThan(0);
  });

  it("renders the Out Flows group", () => {
    render(<BalanceSheetReport tmntFullData={mockTmntFullData} />);

    expect(screen.getByText("Out Flows")).toBeInTheDocument();
  });

  it("renders prize fund Out Flows rows", () => {
    render(<BalanceSheetReport tmntFullData={mockTmntFullData} />);

    expect(screen.getByText("Prize Fund")).toBeInTheDocument();
  });

  it("renders the Expenses group when expense rows exist", () => {
    const reportData = cloneDeep(mockTmntFullData);

    reportData.moneys.push({
      ...blankTmntMoney,
      id: "mon_test_expense_00000000000000000001",
      event_id: eventId1,
      squad_id: squadId1,
      div_id: divId1,
      descrip: MoneyDescrip.EXPENSES,
      flow: MoneyFlow.OUT,
      amount: 25,
      sort_order: 99,
    });

    render(<BalanceSheetReport tmntFullData={reportData} />);

    expect(
      screen.getByText("Expenses excluding Lineage and Other"),
    ).toBeInTheDocument();

    expect(screen.getAllByText("Expenses")).toHaveLength(2);
  });  

  it("renders total amounts", () => {
    render(<BalanceSheetReport tmntFullData={mockTmntFullData} />);

    expect(screen.getByText("$620.00")).toBeInTheDocument();
    expect(screen.getAllByText("$1,575.00").length).toBeGreaterThan(0);
  });

  it("sorts money rows by sort_order", () => {
    const reportData = cloneDeep(mockTmntFullData);

    reportData.moneys = [
      {
        ...blankTmntMoney,
        id: "mon_sort_003",
        event_id: eventId1,
        squad_id: squadId1,
        div_id: divId1,
        descrip: MoneyDescrip.ENTRIES,
        flow: MoneyFlow.IN,
        amount: 30,
        sort_order: 3,
      },
      {
        ...blankTmntMoney,
        id: "mon_sort_001",
        event_id: eventId1,
        squad_id: squadId1,
        div_id: divId1,
        descrip: MoneyDescrip.ADDED,
        flow: MoneyFlow.IN,
        amount: 10,
        sort_order: 1,
      },
      {
        ...blankTmntMoney,
        id: "mon_sort_002",
        event_id: eventId1,
        squad_id: squadId1,
        div_id: divId1,
        descrip: MoneyDescrip.ENTRIES,
        flow: MoneyFlow.IN,
        amount: 20,
        sort_order: 2,
        pot_id: potId1,
      },
      {
        ...blankTmntMoney,
        id: "mon_sort_004",
        event_id: eventId1,
        squad_id: squadId1,
        div_id: divId1,
        descrip: MoneyDescrip.PRIZEFUND,
        flow: MoneyFlow.OUT,
        amount: 60,
        sort_order: 4,
      },
    ];

    render(<BalanceSheetReport tmntFullData={reportData} />);

    const text = screen.getByTestId("pdf-document").textContent ?? "";

    expect(text.indexOf("Added Money")).toBeLessThan(
      text.indexOf("Pot: Scratch: Game"),
    );
  });

  it("creates multiple pages when report groups exceed one page", () => {
    const reportData = cloneDeep(mockTmntFullData);

    for (let i = 0; i < 50; i++) {
      reportData.moneys.push({
        ...blankTmntMoney,
        id: `mon_extra_${i.toString().padStart(2, "0")}`,
        event_id: eventId1,
        squad_id: squadId1,
        div_id: divId1,
        descrip: MoneyDescrip.PRIZEFUND,
        flow: MoneyFlow.OUT,
        amount: 10,
        sort_order: 100 + i,
        brkt_id: i % 2 === 0 ? brktId1 : null,
        elim_id: i % 2 === 1 ? elimId1 : null,
      });
    }

    render(<BalanceSheetReport tmntFullData={reportData} />);

    expect(screen.getAllByTestId("pdf-page").length).toBeGreaterThan(1);
  });
});