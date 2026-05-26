import React from "react";
import { render, screen } from "@testing-library/react";
import TmntResultsForm from "@/app/results/tmnt/[tmntId]/tmntResultsForm";
import type { TmntGameResult } from "@/lib/types/resultsTypes";

const mockGridComponent = jest.fn();
const mockColumnsDirective = jest.fn();
const mockColumnDirective = jest.fn();

jest.mock("@/lib/syncfusion-license", () => ({}));

jest.mock("@/app/results/tmnt/[tmntId]/createResultsColumns", () => ({
  calcNumGames: jest.fn(),
  createResultsColumns2: jest.fn(),
}));

jest.mock("@syncfusion/ej2-react-grids", () => ({
  GridComponent: (props: any) => {
    mockGridComponent(props);

    return (
      <div
        data-testid="GridComponentMock"
        className={props.className}
      >
        {props.children}
      </div>
    );
  },
  
  ColumnsDirective: (props: any) => {
    mockColumnsDirective(props);

    return (
      <div data-testid="ColumnsDirectiveMock">
        {props.children}
      </div>
    );
  },

  ColumnDirective: (props: any) => {
    mockColumnDirective(props);

    return (
      <div
        data-testid="ColumnDirectiveMock"
        data-field={props.field}
      />
    );
  },
}));

import {
  calcNumGames,
  createResultsColumns2,
} from "@/app/results/tmnt/[tmntId]/createResultsColumns";
import { TotalHdcpName } from "@/lib/validation/constants";

const mockCalcNumGames =
  calcNumGames as jest.MockedFunction<
    typeof calcNumGames
  >;

const mockCreateResultsColumns2 =
  createResultsColumns2 as jest.MockedFunction<
    typeof createResultsColumns2
  >;

describe("TmntResultsForm", () => {
  const mockColumns = [
    {
      field: "full_name",
      headerText: "Player",
      width: "150",
    },
    {
      field: "Game 1",
      headerText: "Game 1",
      width: "90",
    },
    {
      field: "Game 2",
      headerText: "Game 2",
      width: "90",
    },
    {
      field: "total",
      headerText: "Total",
      width: "90",
    },
  ];

  const mockResults: TmntGameResult[] = [
    {
      player_id: "player1",
      div_id: "div1",
      div_name: "Scratch",
      sort_order: 1,
      tmnt_name: "Mock Tournament",
      start_date: "2025-09-01",

      full_name: "John Doe",
      average: 220,
      hdcp: 10,
      total: 400,

      "total + Hdcp": 420,

      "Game 1": 200,
      "Game 1 + Hdcp": 210,

      "Game 2": 200,
      "Game 2 + Hdcp": 210,
    },
    {
      player_id: "player2",
      div_id: "div2",
      div_name: "HDCP",
      sort_order: 2,
      tmnt_name: "Mock Tournament",
      start_date: "2025-09-01",

      full_name: "Jane Doe",
      average: 210,
      hdcp: 20,
      total: 390,

      "total + Hdcp": 430,

      "Game 1": 195,
      "Game 1 + Hdcp": 215,

      "Game 2": 195,
      "Game 2 + Hdcp": 215,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockCalcNumGames.mockReturnValue(2);

    mockCreateResultsColumns2.mockReturnValue(
      mockColumns as any
    );
  });

  describe("render", () => {
    it("renders the GridComponent", () => {
      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={mockResults}
        />
      );

      expect(
        screen.getByTestId("GridComponentMock")
      ).toBeInTheDocument();
    });

    it("renders the ColumnsDirective", () => {
      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={mockResults}
        />
      );

      expect(
        screen.getByTestId("ColumnsDirectiveMock")
      ).toBeInTheDocument();
    });

    it("renders one ColumnDirective for each column", () => {
      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={mockResults}
        />
      );

      const cols = screen.getAllByTestId(
        "ColumnDirectiveMock"
      );

      expect(cols).toHaveLength(4);
    });

    it("passes the correct field props to ColumnDirective", () => {
      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={mockResults}
        />
      );

      const cols = screen.getAllByTestId(
        "ColumnDirectiveMock"
      );

      expect(cols[0]).toHaveAttribute(
        "data-field",
        "full_name"
      );

      expect(cols[1]).toHaveAttribute(
        "data-field",
        "Game 1"
      );

      expect(cols[2]).toHaveAttribute(
        "data-field",
        "Game 2"
      );

      expect(cols[3]).toHaveAttribute(
        "data-field",
        "total"
      );
    });
  });

  describe("division filtering", () => {
    it("filters rows by division id", () => {
      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={mockResults}
        />
      );

      expect(
        mockCreateResultsColumns2
      ).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            player_id: "player1",
            div_id: "div1",
          }),
        ],
        10
      );
    });

    it("passes empty results when no division matches", () => {
      render(
        <TmntResultsForm
          divid="missing"
          tmntResults={mockResults}
        />
      );

      expect(
        mockCreateResultsColumns2
      ).toHaveBeenCalledWith([], 0);
    });
  });

  describe("maxHdcp calculation", () => {
    it("calculates the maximum handicap", () => {
      const hdcpResults: TmntGameResult[] = [
        {
          ...mockResults[0],
          hdcp: 5,
        },
        {
          ...mockResults[1],
          div_id: "div1",
          hdcp: 25,
        },
      ];

      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={hdcpResults}
        />
      );

      expect(
        mockCreateResultsColumns2
      ).toHaveBeenCalledWith(
        expect.any(Array),
        25
      );
    });

    it("uses 0 maxHdcp when there are no rows", () => {
      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={[]}
        />
      );

      expect(
        mockCreateResultsColumns2
      ).toHaveBeenCalledWith([], 0);
    });
  });

  describe("populateRows", () => {
    it("passes populated rows to GridComponent", () => {
      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={mockResults}
        />
      );

      const gridProps =
        mockGridComponent.mock.calls[0][0];

      expect(gridProps.dataSource).toEqual([
        {
          id: "player1",
          player_id: "player1",
          full_name: "John Doe",
          average: 220,
          hdcp: 10,
          total: 400,
          total_hdcp: 0,
          total_plus_total_hdcp: 420,

          "Game 1": 200,
          "Game 1 + Hdcp": 210,

          "Game 2": 200,
          "Game 2 + Hdcp": 210,
        },
      ]);
    });

    it("defaults missing game values to 0", () => {
      const missingGameResults: TmntGameResult[] = [
        {
          ...mockResults[0],

          "Game 2": undefined as never,
          "Game 2 + Hdcp": undefined as never,
        },
      ];

      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={missingGameResults}
        />
      );

      const gridProps =
        mockGridComponent.mock.calls[0][0];

      expect(gridProps.dataSource).toEqual([
        expect.objectContaining({
          "Game 1": 200,
          "Game 1 + Hdcp": 210,

          "Game 2": 0,
          "Game 2 + Hdcp": 0,
        }),
      ]);
    });

    it("defaults total_plus_total_hdcp to 0 when missing", () => {
      const noTotalHdcpResults: TmntGameResult[] = [
        {
          ...mockResults[0],

          "total + Hdcp": undefined,
        },
      ];

      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={noTotalHdcpResults}
        />
      );

      const gridProps =
        mockGridComponent.mock.calls[0][0];

      expect(gridProps.dataSource).toEqual([
        expect.objectContaining({
          total_plus_total_hdcp: 0,
        }),
      ]);
    });

    it("calculates total_hdcp as 0 when hdcp is non-zero", () => {
      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={mockResults}
        />
      );

      const gridProps =
        mockGridComponent.mock.calls[0][0];

      expect(gridProps.dataSource[0])
        .toHaveProperty(TotalHdcpName, 0);
    });

    it("calculates total_hdcp when hdcp is zero", () => {
      const zeroHdcpResults: TmntGameResult[] = [
        {
          ...mockResults[0],
          hdcp: 0,
        },
      ];

      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={zeroHdcpResults}
        />
      );

      const gridProps =
        mockGridComponent.mock.calls[0][0];

      expect(gridProps.dataSource[0])
        .toHaveProperty(TotalHdcpName, 0);
    });
  });

  describe("GridComponent props", () => {
    it("passes the correct id", () => {
      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={mockResults}
        />
      );

      const gridProps =
        mockGridComponent.mock.calls[0][0];

      expect(gridProps.id).toBe(
        "tmntResultsGrid"
      );
    });

    it("enables resizing", () => {
      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={mockResults}
        />
      );

      const gridProps =
        mockGridComponent.mock.calls[0][0];

      expect(
        gridProps.allowResizing
      ).toBe(true);
    });

    it("calculates the grid width correctly", () => {
      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={mockResults}
        />
      );

      const gridProps =
        mockGridComponent.mock.calls[0][0];

      // 150 + 90 + 90 + 90 + 2 border
      expect(gridProps.width).toBe(422);
    });

    it("ignores invalid widths", () => {
      mockCreateResultsColumns2.mockReturnValue([
        {
          field: "full_name",
          width: "150",
        },
        {
          field: "Game 1",
          width: "bad",
        },
        {
          field: "total",
        },
      ] as any);

      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={mockResults}
        />
      );

      const gridProps =
        mockGridComponent.mock.calls[0][0];

      // 150 + 0 + 0 + 2
      expect(gridProps.width).toBe(152);
    });
  });

  describe("calcNumGames", () => {
    it("calls calcNumGames with filtered division rows", () => {
      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={mockResults}
        />
      );

      expect(
        mockCalcNumGames
      ).toHaveBeenCalledWith([
        expect.objectContaining({
          div_id: "div1",
        }),
      ]);
    });

    it("supports zero games", () => {
      mockCalcNumGames.mockReturnValue(0);

      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={mockResults}
        />
      );

      const gridProps =
        mockGridComponent.mock.calls[0][0];

      expect(gridProps.dataSource).toEqual([
        {
          id: "player1",
          player_id: "player1",
          full_name: "John Doe",
          average: 220,
          hdcp: 10,
          total: 400,
          total_hdcp: 0,
          total_plus_total_hdcp: 420,
        },
      ]);
    });
  });

  describe("wrapper divs", () => {
    it("renders the outer wrapper", () => {
      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={mockResults}
        />
      );

      expect(
        screen.getByTestId("ResultsOuterWrapper")
      ).toHaveClass("tmnt-results-grid-outer");
    });

    it("renders the inner wrapper", () => {
      render(
        <TmntResultsForm
          divid="div1"
          tmntResults={mockResults}
        />
      );

      expect(
        screen.getByTestId("ResultsInnerWrapper")
      ).toHaveClass("tmnt-results-grid-inner");
    });
  });  

});