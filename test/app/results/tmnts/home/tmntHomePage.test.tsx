import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useParams } from "next/navigation";
import TmntHomePage from "@/app/results/tmnt/[tmntId]/home/page";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import { getMonthDayYear } from "@/lib/dateTools";
import { localConfig } from "@/lib/currency/const";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { tmntFullType } from "@/lib/types/types";
import {
  mockTmntFullData,
  tmntId,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

/*************************/
/* mocks for dependencies */
/*************************/
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("@/hooks/useTmntFullData", () => ({
  useTmntFullData: jest.fn(),
}));

jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,
  default: ({ show, message }: { show: boolean; message: string }) =>
    show ? <div data-testid="wait-modal">{message}</div> : null,
}));

jest.mock("@/app/results/tmntHeader/tmntHomeHeader", () => ({
  __esModule: true,
  default: jest.fn(
    ({ selectedTmntPageBtn }: { selectedTmntPageBtn: string }) => (
      <div data-testid="tmnt-header">{selectedTmntPageBtn}</div>
    )
  ),
}));

const mockedUseParams = useParams as jest.Mock;
const mockedUseTmntFullData = useTmntFullData as jest.Mock;
const mockedHeader = TmntHomeHeader as unknown as jest.Mock;

/***********/
/* helpers */
/***********/
const retryMock = jest.fn();

type HookState = {
  data?: tmntFullType | null;
  hasData?: boolean;
  failed?: boolean;
  error?: string | null;
};

const setHook = ({
  data = mockTmntFullData,
  hasData = true,
  failed = false,
  error = null,
}: HookState = {}) => {
  mockedUseTmntFullData.mockReturnValue({
    data,
    hasData,
    failed,
    error,
    retry: retryMock,
  });
};

const withTmnt = (
  tmntOverrides: Partial<tmntFullType["tmnt"]>
): tmntFullType => ({
  ...mockTmntFullData,
  tmnt: { ...mockTmntFullData.tmnt, ...tmntOverrides },
});

const { bowl } = mockTmntFullData.tmnt;
const tmntName = mockTmntFullData.tmnt.tmnt_name;

describe("TmntHomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseParams.mockReturnValue({ tmntId });
    setHook();
  });

  describe("fixture sanity check", () => {
    it("mock data has at least one event", () => {
      expect(mockTmntFullData.events.length).toBeGreaterThan(0);
    });
  });

  describe("data loading", () => {
    it("requests the tournament data using the tmntId from the route params", () => {
      render(<TmntHomePage />);
      expect(mockedUseTmntFullData).toHaveBeenCalledWith(tmntId);
    });

    it("shows the wait modal with a loading message while data is loading", () => {
      setHook({ data: null, hasData: false, failed: false });
      render(<TmntHomePage />);

      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
      expect(screen.queryByText("Unable to load tournament")).not.toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("shows a generic error message when loading failed", () => {
      setHook({
        data: null,
        hasData: false,
        failed: true,
        error: "Network error",
      });
      render(<TmntHomePage />);

      expect(
        screen.getByRole("heading", { level: 4, name: "Unable to load tournament" })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          `An error occurred while loading the tournament with id: ${tmntId}.`
        )
      ).toBeInTheDocument();
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
    });

    it("shows the generic error message when failed but the error is null", () => {
      setHook({ data: null, hasData: false, failed: true, error: null });
      render(<TmntHomePage />);

      expect(
        screen.getByText(
          `An error occurred while loading the tournament with id: ${tmntId}.`
        )
      ).toBeInTheDocument();
    });

    it("shows the missing data message when the error mentions a missing required child", () => {
      setHook({
        data: null,
        hasData: false,
        failed: true,
        error: "Tournament has a missing required child: events",
      });
      render(<TmntHomePage />);

      expect(
        screen.getByText(`Tournament with id: ${tmntId} is missing data.`)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/An error occurred while loading/)
      ).not.toBeInTheDocument();
    });

    it("calls retry when the Retry button is clicked", () => {
      setHook({ data: null, hasData: false, failed: true, error: "boom" });
      render(<TmntHomePage />);

      fireEvent.click(screen.getByRole("button", { name: "Retry" }));
      expect(retryMock).toHaveBeenCalledTimes(1);
    });

    it("renders the page instead of the error when data exists even if failed is true", () => {
      setHook({ hasData: true, failed: true, error: "stale error" });
      render(<TmntHomePage />);

      expect(screen.queryByText("Unable to load tournament")).not.toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 4, name: `Welcome to ${tmntName}` })
      ).toBeInTheDocument();
    });
  });

  describe("header", () => {
    it("renders TmntHomeHeader with the tournament data and Home selected", () => {
      render(<TmntHomePage />);

      expect(screen.getByTestId("tmnt-header")).toHaveTextContent("Home");
      expect(mockedHeader).toHaveBeenCalled();
      const props = mockedHeader.mock.calls[0][0] as {
        tmntFullData: tmntFullType;
        selectedTmntPageBtn: string;
      };
      expect(props.tmntFullData).toBe(mockTmntFullData);
      expect(props.selectedTmntPageBtn).toBe("Home");
    });
  });

  describe("welcome content", () => {
    it("renders the welcome heading with the tournament name", () => {
      render(<TmntHomePage />);
      expect(
        screen.getByRole("heading", { level: 4, name: `Welcome to ${tmntName}` })
      ).toBeInTheDocument();
    });

    it("renders the host bowling center as a link that opens in a new tab", () => {
      render(<TmntHomePage />);

      const link = screen.getByRole("link", { name: bowl.bowl_name });
      expect(link).toHaveAttribute("href", bowl.url);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");

      expect(screen.getByText("Hosted by")).toHaveTextContent(
        `Hosted by ${bowl.bowl_name}`
      );
    });

    it("renders the bowl city and state", () => {
      render(<TmntHomePage />);
      expect(screen.getByText(`${bowl.city}, ${bowl.state}`)).toBeInTheDocument();
    });

    it("renders a single date when start and end dates match", () => {
      render(<TmntHomePage />);

      const dateStr = getMonthDayYear(mockTmntFullData.tmnt.start_date_str);
      expect(screen.getByText(dateStr)).toBeInTheDocument();
      expect(screen.queryByText(/ - .*\d{4}/)).not.toBeInTheDocument();
    });

    it("renders a date range when start and end dates differ", () => {
      setHook({ data: withTmnt({ end_date_str: "2025-09-03" }) });
      render(<TmntHomePage />);

      const start = getMonthDayYear("2025-09-01");
      const end = getMonthDayYear("2025-09-03");
      expect(screen.getByText(`${start} - ${end}`)).toBeInTheDocument();
    });

    it("renders the tournament name and formatted entry fee of the first event", () => {
      render(<TmntHomePage />);

      const expectedFee = formatValueSymbSep2Dec(
        mockTmntFullData.events[0].entry_fee,
        localConfig
      );
      expect(
        screen.getByText(`${tmntName} - ${expectedFee} entry`)
      ).toBeInTheDocument();
    });

    it("renders an empty entry fee when there are no events", () => {
      setHook({ data: { ...mockTmntFullData, events: [] } });
      render(<TmntHomePage />);

      // empty fee leaves a double space, which toHaveTextContent normalizes
      const line = screen.getByText((_, el) =>
        Boolean(
          el?.tagName === "DIV" &&
            el.className === "mb-2" &&
            el.textContent?.endsWith("entry")
        )
      );
      expect(line).toHaveTextContent(`${tmntName} - entry`);
    });

    it("renders the Contact Director link for this tournament", () => {
      render(<TmntHomePage />);
      expect(
        screen.getByRole("link", { name: "Contact Director" })
      ).toHaveAttribute("href", `/results/tmnt/${tmntId}/contact`);
    });
  });
});

// import React from "react";
// import "@testing-library/jest-dom";
// import { fireEvent, render, screen } from "@testing-library/react";
// import cloneDeep from "lodash/cloneDeep";
// import { useParams } from "next/navigation";
// import TmntHomePage from "@/app/results/tmnt/[tmntId]/home/page";
// import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
// import { useTmntFullData } from "@/hooks/useTmntFullData";
// import { getMonthDayYear } from "@/lib/dateTools";
// import { localConfig } from "@/lib/currency/const";
// import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
// import type { tmntFullType } from "@/lib/types/types";
// import {
//   mockTmntFullData,
//   tmntId,
// } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// jest.mock("next/navigation", () => ({
//   useParams: jest.fn(),
// }));

// jest.mock("@/hooks/useTmntFullData", () => ({
//   useTmntFullData: jest.fn(),
// }));

// // These tests verify which dates the page displays.
// // The date formatter's own tests should verify its formatting rules.
// jest.mock("@/lib/dateTools", () => ({
//   getMonthDayYear: jest.fn(),
// }));

// jest.mock("@/lib/currency/formatValue", () => ({
//   formatValueSymbSep2Dec: jest.fn(),
// }));

// jest.mock("@/components/modal/waitModal", () => ({
//   __esModule: true,
//   default: function MockWaitModal({
//     show,
//     message,
//   }: {
//     show: boolean;
//     message: string;
//   }) {
//     return show ? <div role="status">{message}</div> : null;
//   },
// }));

// jest.mock("@/app/results/tmntHeader/tmntHomeHeader", () => ({
//   __esModule: true,
//   default: jest.fn(function MockTmntHomeHeader() {
//     return <div data-testid="tmnt-home-header" />;
//   }),
// }));

// const mockedUseParams = jest.mocked(useParams);
// const mockedUseTmntFullData = jest.mocked(useTmntFullData);
// const mockedGetMonthDayYear = jest.mocked(getMonthDayYear);
// const mockedFormatEntryFee = jest.mocked(formatValueSymbSep2Dec);
// const mockedTmntHomeHeader = jest.mocked(TmntHomeHeader);

// type PageHookResult = Pick<
//   ReturnType<typeof useTmntFullData>,
//   "data" | "hasData" | "failed" | "error" | "retry"
// >;

// describe("TmntHomePage", () => {
//   let tournamentData: tmntFullType;
//   let hookResult: PageHookResult;

//   const retryTmnt = jest.fn();

//   const setHookResult = (
//     overrides: Partial<PageHookResult> = {},
//   ) => {
//     hookResult = { ...hookResult, ...overrides };

//     // Supply the fields this page consumes.
//     // Other fields returned by the hook are unused by this page.
//     mockedUseTmntFullData.mockReturnValue(
//       hookResult as ReturnType<typeof useTmntFullData>,
//     );
//   };

//   beforeEach(() => {
//     jest.clearAllMocks();

//     // Give each test its own copy of the shared mock data.
//     tournamentData = cloneDeep(mockTmntFullData);

//     retryTmnt.mockReset();
//     retryTmnt.mockResolvedValue(undefined);

//     mockedUseParams.mockReturnValue({ tmntId });

//     mockedGetMonthDayYear.mockReset();
//     mockedGetMonthDayYear.mockReturnValue("September 1, 2025");

//     mockedFormatEntryFee.mockReset();
//     mockedFormatEntryFee.mockReturnValue("$85.00");

//     hookResult = {
//       data: tournamentData,
//       hasData: true,
//       failed: false,
//       error: "",
//       retry: retryTmnt,
//     };

//     setHookResult();
//   });

//   it("passes the tournament ID from the route to useTmntFullData", () => {
//     render(<TmntHomePage />);

//     expect(mockedUseTmntFullData).toHaveBeenCalledWith(tmntId);
//   });

//   it("shows the loading modal when tournament data is not ready", () => {
//     setHookResult({ hasData: false });

//     render(<TmntHomePage />);

//     expect(screen.getByRole("status")).toHaveTextContent("Loading...");

//     expect(screen.queryByRole("heading")).not.toBeInTheDocument();

//     expect(
//       screen.queryByRole("button", { name: "Retry" }),
//     ).not.toBeInTheDocument();

//     expect(mockedTmntHomeHeader).not.toHaveBeenCalled();
//     expect(mockedGetMonthDayYear).not.toHaveBeenCalled();
//     expect(mockedFormatEntryFee).not.toHaveBeenCalled();
//   });

//   it("shows the missing-data message when a required child is missing", () => {
//     setHookResult({
//       hasData: false,
//       failed: true,
//       error: "Tournament is missing required child: events",
//     });

//     render(<TmntHomePage />);

//     expect(
//       screen.getByRole("heading", {
//         name: "Unable to load tournament",
//       }),
//     ).toBeInTheDocument();

//     expect(
//       screen.getByText(
//         `Tournament with id: ${tmntId} is missing data.`,
//       ),
//     ).toBeInTheDocument();

//     expect(
//       screen.getByRole("button", { name: "Retry" }),
//     ).toBeInTheDocument();

//     expect(screen.queryByRole("status")).not.toBeInTheDocument();
//     expect(mockedTmntHomeHeader).not.toHaveBeenCalled();
//   });

//   it.each(["Network error", ""])(
//     "shows the generic error message when the hook error is %j",
//     (error) => {
//       setHookResult({
//         hasData: false,
//         failed: true,
//         error,
//       });

//       render(<TmntHomePage />);

//       expect(
//         screen.getByRole("heading", {
//           name: "Unable to load tournament",
//         }),
//       ).toBeInTheDocument();

//       expect(
//         screen.getByText(
//           `An error occurred while loading the tournament with id: ${tmntId}.`,
//         ),
//       ).toBeInTheDocument();

//       expect(
//         screen.getByRole("button", { name: "Retry" }),
//       ).toBeInTheDocument();

//       expect(screen.queryByRole("status")).not.toBeInTheDocument();
//       expect(mockedTmntHomeHeader).not.toHaveBeenCalled();
//     },
//   );

//   it("calls retryTmnt when the Retry button is clicked", () => {
//     setHookResult({
//       hasData: false,
//       failed: true,
//       error: "Network error",
//     });

//     render(<TmntHomePage />);

//     expect(retryTmnt).not.toHaveBeenCalled();

//     fireEvent.click(screen.getByRole("button", { name: "Retry" }));

//     expect(retryTmnt).toHaveBeenCalledTimes(1);
//   });

//   it("renders the welcome heading and passes tournament data to the header", () => {
//     render(<TmntHomePage />);

//     expect(
//       screen.getByRole("heading", {
//         name: `Welcome to ${tournamentData.tmnt.tmnt_name}`,
//       }),
//     ).toBeInTheDocument();

//     expect(
//       screen.getByTestId("tmnt-home-header"),
//     ).toBeInTheDocument();

//     // Inspect the props directly to avoid depending on React's
//     // additional arguments when it calls a function component.
//     expect(mockedTmntHomeHeader.mock.calls[0][0]).toEqual({
//       tmntFullData: tournamentData,
//     });

//     expect(screen.queryByRole("status")).not.toBeInTheDocument();

//     expect(
//       screen.queryByRole("button", { name: "Retry" }),
//     ).not.toBeInTheDocument();
//   });

//   it("renders the host link and bowling center location", () => {
//     render(<TmntHomePage />);

//     const bowl = tournamentData.tmnt.bowl;
//     const hostLink = screen.getByRole("link", {
//       name: bowl.bowl_name,
//     });

//     expect(hostLink).toHaveAttribute("href", bowl.url);
//     expect(hostLink).toHaveAttribute("target", "_blank");
//     expect(hostLink).toHaveAttribute("rel", "noopener noreferrer");

//     expect(screen.getByText("Hosted by")).toBeInTheDocument();

//     expect(
//       screen.getByText(`${bowl.city}, ${bowl.state}`),
//     ).toBeInTheDocument();
//   });
    
//   it("renders one formatted date for a single-day tournament", () => {
//     render(<TmntHomePage />);

//     expect(
//       screen.getByText("September 1, 2025"),
//     ).toBeInTheDocument();

//     expect(mockedGetMonthDayYear).toHaveBeenCalledTimes(1);

//     expect(mockedGetMonthDayYear).toHaveBeenCalledWith(
//       tournamentData.tmnt.start_date_str,
//     );
//   });

//   it("renders both formatted dates for a multi-day tournament", () => {
//     tournamentData.tmnt.end_date_str = "2025-09-03";

//     mockedGetMonthDayYear.mockImplementation((date) =>
//       date === "2025-09-01"
//         ? "September 1, 2025"
//         : "September 3, 2025",
//     );

//     render(<TmntHomePage />);

//     expect(
//       screen.getByText(
//         "September 1, 2025 - September 3, 2025",
//       ),
//     ).toBeInTheDocument();

//     expect(mockedGetMonthDayYear).toHaveBeenCalledTimes(2);

//     expect(mockedGetMonthDayYear).toHaveBeenNthCalledWith(
//       1,
//       "2025-09-01",
//     );

//     expect(mockedGetMonthDayYear).toHaveBeenNthCalledWith(
//       2,
//       "2025-09-03",
//     );
//   });

//   it("formats and displays the first event's entry fee", () => {
//     // Add another event with a different fee to verify that
//     // the home page uses the first event's fee.
//     tournamentData.events.push({
//       ...tournamentData.events[0],
//       id: "evt_012310c8493f4a218d2e2b045442974b",
//       entry_fee: "150",
//     });

//     render(<TmntHomePage />);

//     expect(mockedFormatEntryFee).toHaveBeenCalledTimes(1);

//     expect(mockedFormatEntryFee).toHaveBeenCalledWith(
//       "85",
//       localConfig,
//     );

//     expect(
//       screen.getByText(
//         `${tournamentData.tmnt.tmnt_name} - $85.00 entry`,
//       ),
//     ).toBeInTheDocument();
//   });

//   it("renders successfully without events and leaves the entry fee blank", () => {
//     tournamentData.events = [];

//     render(<TmntHomePage />);

//     // Testing Library normalizes the extra space caused
//     // by the empty entry fee.
//     expect(
//       screen.getByText(
//         `${tournamentData.tmnt.tmnt_name} - entry`,
//       ),
//     ).toBeInTheDocument();

//     expect(mockedFormatEntryFee).not.toHaveBeenCalled();
//   });

//   it("links to the contact page for the tournament in the route", () => {
//     render(<TmntHomePage />);

//     expect(
//       screen.getByRole("link", { name: "Contact Director" }),
//     ).toHaveAttribute(
//       "href",
//       `/results/tmnt/${tmntId}/contact`,
//     );
//   });

//   it("shows tournament data when hasData is true even if failed is also true", () => {
//     setHookResult({
//       failed: true,
//       error: "Network error",
//     });

//     render(<TmntHomePage />);

//     expect(
//       screen.getByRole("heading", {
//         name: `Welcome to ${tournamentData.tmnt.tmnt_name}`,
//       }),
//     ).toBeInTheDocument();

//     expect(
//       screen.queryByText("Unable to load tournament"),
//     ).not.toBeInTheDocument();

//     expect(screen.queryByRole("status")).not.toBeInTheDocument();
//   });

//   it("replaces the loading modal when tournament data becomes ready", () => {
//     setHookResult({ hasData: false });

//     const { rerender } = render(<TmntHomePage />);

//     expect(screen.getByRole("status")).toHaveTextContent("Loading...");

//     setHookResult({ hasData: true });

//     rerender(<TmntHomePage />);

//     expect(screen.queryByRole("status")).not.toBeInTheDocument();

//     expect(
//       screen.getByRole("heading", {
//         name: `Welcome to ${tournamentData.tmnt.tmnt_name}`,
//       }),
//     ).toBeInTheDocument();
//   });
// });

