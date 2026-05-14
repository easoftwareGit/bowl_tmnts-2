import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import DivResultsPage from "@/app/results/tmnt/[tmntId]/page";

import type { TmntGameResult } from "@/lib/types/resultsTypes";

import { divId1, divId2 } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";

const mockDispatch = jest.fn();

const mockUseSelector = jest.fn();

const mockFetchOneTmntGameResults = jest.fn(
  (tmntId: string) => ({
    type: "fetchOneTmntGameResults",
    payload: tmntId,
  })
);

jest.mock("@/lib/syncfusion-license", () => ({}));

jest.mock("next/navigation", () => ({
  useParams: jest.fn(() => ({
    tmntId: "tmt_test_123",
  })),
}));

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(() => mockDispatch),
  useSelector: (selector: unknown) =>
    mockUseSelector(selector),
}));

jest.mock(
  "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice",
  () => ({
    fetchOneTmntGameResults: (
      tmntId: string
    ) => mockFetchOneTmntGameResults(tmntId),

    getOneTmntGameResultsLoadStatus: "loadStatusSelector",

    getOneTmntGameResultsError: "errorSelector",

    selectOneTmntGameResults:
      "resultsSelector",
  })
);

jest.mock(
  "@/components/modal/waitModal",
  () => ({
    __esModule: true,

    default: ({
      show,
      message,
    }: {
      show: boolean;
      message: string;
    }) => (
      <div
        data-testid="WaitModalMock"
        data-show={show}
      >
        {message}
      </div>
    ),
  })
);

jest.mock(
  "@/app/results/tmnt/[tmntId]/tmntResultsForm",
  () => ({
    __esModule: true,

    default: ({
      divid,
      tmntResults,
    }: {
      divid: string;
      tmntResults: TmntGameResult[];
    }) => (
      <div
        data-testid="TmntResultsFormMock"
        data-divid={divid}
        data-count={tmntResults.length}
      />
    ),
  })
);

jest.mock("react-bootstrap", () => ({
  Tabs: ({
    children,
    activeKey,
    onSelect,
  }: any) => (
    <div
      data-testid="TabsMock"
      data-activekey={activeKey}
    >
      <button
        onClick={() => onSelect?.("div2")}
      >
        Select Div2
      </button>

      <button
        onClick={() => onSelect?.(null)}
      >
        Select Null
      </button>

      {children}
    </div>
  ),

  Tab: ({
    children,
    title,
    eventKey,
  }: any) => (
    <div
      data-testid="TabMock"
      data-title={title}
      data-eventkey={eventKey}
    >
      {children}
    </div>
  ),
}));

const mockResults: TmntGameResult[] = [
  {
    player_id: "player1",

    div_id: divId1,
    div_name: "Scratch",

    sort_order: 2,

    tmnt_name: "Mock Tournament",

    start_date:
      "2025-09-01T00:00:00.000Z",

    full_name: "John Doe",

    average: 220,

    hdcp: 0,

    total: 1200,

    "total + Hdcp": 1200,

    "Game 1": 200,
    "Game 1 + Hdcp": 200,

    "Game 2": 201,
    "Game 2 + Hdcp": 201,
  },

  {
    player_id: "player2",

    div_id: divId2,
    div_name: "HDCP",

    sort_order: 1,

    tmnt_name: "Mock Tournament",

    start_date:
      "2025-09-01T00:00:00.000Z",

    full_name: "Jane Doe",

    average: 210,

    hdcp: 20,

    total: 1180,

    "total + Hdcp": 1300,

    "Game 1": 190,
    "Game 1 + Hdcp": 210,

    "Game 2": 195,
    "Game 2 + Hdcp": 215,
  },
];

describe("DivResultsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initial render", () => {
    it("dispatches fetchOneTmntGameResults on mount", () => {
      mockUseSelector
        .mockReturnValueOnce("idle")
        .mockReturnValueOnce(null)
        .mockReturnValueOnce([]);

      render(<DivResultsPage />);

      expect(
        mockFetchOneTmntGameResults
      ).toHaveBeenCalledWith(
        "tmt_test_123"
      );

      expect(mockDispatch)
        .toHaveBeenCalledWith({
          type: "fetchOneTmntGameResults",
          payload: "tmt_test_123",
        });
    });
  });

  describe("loading state", () => {
    it("shows the WaitModal while loading", () => {
      mockUseSelector
        .mockReturnValueOnce("loading")
        .mockReturnValueOnce(null)
        .mockReturnValueOnce([]);

      render(<DivResultsPage />);

      expect(
        screen.getByTestId("WaitModalMock")
      ).toHaveAttribute(
        "data-show",
        "true"
      );

      expect(
        screen.getByText("Loading...")
      ).toBeInTheDocument();
    });

    it("does not render results while loading", () => {
      mockUseSelector
        .mockReturnValueOnce("loading")
        .mockReturnValueOnce(null)
        .mockReturnValueOnce([]);

      render(<DivResultsPage />);

      expect(
        screen.queryByTestId("TabsMock")
      ).not.toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("renders the error message", () => {
      mockUseSelector
        .mockReturnValueOnce("failed")
        .mockReturnValueOnce("DB down")
        .mockReturnValueOnce([]);

      render(<DivResultsPage />);

      expect(
        screen.getByText(
          /Error: DB down tmntLoadStatus: failed/i
        )
      ).toBeInTheDocument();
    });

    it("does not render tabs on error", () => {
      mockUseSelector
        .mockReturnValueOnce("failed")
        .mockReturnValueOnce("DB down")
        .mockReturnValueOnce([]);

      render(<DivResultsPage />);

      expect(
        screen.queryByTestId("TabsMock")
      ).not.toBeInTheDocument();
    });
  });

  describe("success state", () => {
    beforeEach(() => {
      mockUseSelector.mockImplementation((selector) => {
        if (selector === "loadStatusSelector") {
          return "succeeded";
        }

        if (selector === "errorSelector") {
          return null;
        }

        if (selector === "resultsSelector") {
          return mockResults;
        }

        return undefined;
      });
    });

    it("renders the tournament name", async () => {
      render(<DivResultsPage />);

      await waitFor(() => {
        expect(
          screen.getByText(
            /Results for: Mock Tournament/i
          )
        ).toBeInTheDocument();
      });
    });

    it("renders the formatted tournament date", async () => {
      render(<DivResultsPage />);

      await waitFor(() => {
        expect(
          screen.getByText(
            /Sep 01, 2025/i
          )
        ).toBeInTheDocument();
      });
    });

    it("renders the Tabs component", async () => {
      render(<DivResultsPage />);

      await waitFor(() => {
        expect(
          screen.getByTestId(
            "TabsMock"
          )
        ).toBeInTheDocument();
      });
    });

    it("renders one tab per division", async () => {
      render(<DivResultsPage />);

      await waitFor(() => {
        const tabs =
          screen.getAllByTestId(
            "TabMock"
          );

        expect(tabs).toHaveLength(2);
      });
    });

    it("renders tabs sorted by sort_order", async () => {
      render(<DivResultsPage />);

      await waitFor(() => {
        expect(screen.getAllByTestId("TabMock")).toHaveLength(2);
      });

      const tabs = screen.getAllByTestId("TabMock");

      expect(tabs[0]).toHaveAttribute("data-title", "HDCP");
      expect(tabs[1]).toHaveAttribute("data-title", "Scratch");
    });    

    it("renders TmntResultsForm for each division", async () => {
      render(<DivResultsPage />);

      await waitFor(() => {
        const forms =
          screen.getAllByTestId(
            "TmntResultsFormMock"
          );

        expect(forms).toHaveLength(2);
      });
    });

    it("passes the correct divid props to TmntResultsForm", async () => {
      render(<DivResultsPage />);

      await waitFor(() => {
        expect(screen.getAllByTestId("TmntResultsFormMock")).toHaveLength(2);
      });

      const forms = screen.getAllByTestId("TmntResultsFormMock");

      expect(forms[0]).toHaveAttribute("data-divid", divId2);
      expect(forms[1]).toHaveAttribute("data-divid", divId1);
    });

    it("passes tmntResults to TmntResultsForm", async () => {
      render(<DivResultsPage />);

      await waitFor(() => {
        const forms =
          screen.getAllByTestId(
            "TmntResultsFormMock"
          );

        forms.forEach((form) => {
          expect(form)
            .toHaveAttribute(
              "data-count",
              "2"
            );
        });
      });
    });

    it("sets the default active tab to the first sorted division", async () => {
      render(<DivResultsPage />);

      await waitFor(() => {
        expect(
          screen.getByTestId(
            "TabsMock"
          )
        ).toHaveAttribute(
          "data-activekey",
          divId2
        );
      });
    });

    it("changes the active tab when onSelect is called", async () => {
      render(<DivResultsPage />);

      await waitFor(() => {
        expect(
          screen.getByTestId(
            "TabsMock"
          )
        ).toHaveAttribute(
          "data-activekey",
          divId2
        );
      });

      fireEvent.click(
        screen.getByText(
          "Select Div2"
        )
      );

      await waitFor(() => {
        expect(
          screen.getByTestId(
            "TabsMock"
          )
        ).toHaveAttribute(
          "data-activekey",
          "div2"
        );
      });
    });
  });

  describe("empty results", () => {

    beforeEach(() => {
      mockUseSelector.mockImplementation((selector) => {
        if (selector === "loadStatusSelector") {
          return "loading";
        }

        if (selector === "errorSelector") {
          return null;
        }

        if (selector === "resultsSelector") {
          return [];
        }

        return undefined;
      });
      
    });
    it("does not render tabs when results are empty", () => {
      render(<DivResultsPage />);

      expect(
        screen.queryByTestId(
          "TabsMock"
        )
      ).not.toBeInTheDocument();
    });

    it("does not render a tournament name when results are empty", () => {
      render(<DivResultsPage />);

      expect(
        screen.queryByText(
          /Results for:/i
        )
      ).not.toBeInTheDocument();
    });
  });

  describe("handleTabSelect", () => {
    it("does not crash when null is passed to onSelect", async () => {
      mockUseSelector.mockImplementation((selector) => {
        if (selector === "loadStatusSelector") {
          return "succeeded";
        }

        if (selector === "errorSelector") {
          return null;
        }

        if (selector === "resultsSelector") {
          return mockResults;
        }

        return undefined;
      });

      render(<DivResultsPage />);

      const tabs = await screen.findByTestId("TabsMock");

      fireEvent.click(
        screen.getByText("Select Null")
      );

      expect(tabs).toBeInTheDocument();
    });    
  });
});