// test/app/results/tmnts/home/tmntHomePage.test.tsx
// tests src/app/results/tmnt/[tmntId]/home/page.tsx
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

/**************************/
/* mocks for dependencies */
/**************************/
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

const mockedUseParams = jest.mocked(useParams);
const mockedUseTmntFullData = jest.mocked(useTmntFullData);
const mockedHeader = jest.mocked(TmntHomeHeader);

/***********/
/* helpers */
/***********/
type HookResult = ReturnType<typeof useTmntFullData>;
type RetryFn = HookResult["retry"];

const retryMock = jest.fn<ReturnType<RetryFn>, Parameters<RetryFn>>();

// the hook always returns a tmntFullType (never null); before the tmnt is
// loaded it is a blank tmnt. The page does not read events until hasData.
const blankTmntData = (): tmntFullType => ({
  ...mockTmntFullData,
  tmnt: { ...mockTmntFullData.tmnt, id: "", tmnt_name: "" },
  events: [],
});

type HookState = {
  data?: tmntFullType;
  hasData?: boolean;
  failed?: boolean;
  error?: string;
};

const setHook = ({
  data = mockTmntFullData,
  hasData = true,
  failed = false,
  error,
}: HookState = {}) => {
  mockedUseTmntFullData.mockReturnValue({
    data,
    hasData,
    failed,
    error,
    retry: retryMock,
  });
};

const setLoading = () => {
  setHook({ data: blankTmntData(), hasData: false, failed: false });
};

const setFailed = (error?: string) => {
  setHook({ data: blankTmntData(), hasData: false, failed: true, error });
};

const withTmnt = (
  tmntOverrides: Partial<tmntFullType["tmnt"]>
): tmntFullType => ({
  ...mockTmntFullData,
  tmnt: { ...mockTmntFullData.tmnt, ...tmntOverrides },
});

const firstEvent = mockTmntFullData.events[0];
if (!firstEvent) {
  throw new Error("mockTmntFullData must have one event");
}

const { bowl } = mockTmntFullData.tmnt;
const tmntName = mockTmntFullData.tmnt.tmnt_name;
const startDateStr = mockTmntFullData.tmnt.start_date_str;
const genericErrMsg = `An error occurred while loading the tournament with id: ${tmntId}.`;
const missingDataMsg = `Tournament with id: ${tmntId} is missing data.`;

describe("TmntHomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseParams.mockReturnValue({ tmntId });
    setHook();
  });

  describe("fixture sanity check", () => {
    // a tmnt is never saved without an event, and only one event is allowed
    it("mock data is a one day tournament with a bowl and exactly one event", () => {
      expect(mockTmntFullData.events).toHaveLength(1);
      expect(mockTmntFullData.tmnt.start_date_str).toBe(
        mockTmntFullData.tmnt.end_date_str
      );
      expect(bowl.bowl_name).not.toBe("");
      expect(bowl.url).not.toBe("");
    });
  });

  describe("data loading", () => {
    it("requests the tournament data using the tmntId from the route params", () => {
      render(<TmntHomePage />);
      expect(mockedUseTmntFullData).toHaveBeenCalledWith(tmntId);
    });

    it("uses the route tmntId, not the loaded tmnt id, for the hook and the contact link", () => {
      const routeId = "tmt_routeid00000000000000000000000";
      mockedUseParams.mockReturnValue({ tmntId: routeId });
      render(<TmntHomePage />);

      expect(mockedUseTmntFullData).toHaveBeenCalledWith(routeId);
      expect(
        screen.getByRole("link", { name: "Contact Director" })
      ).toHaveAttribute("href", `/results/tmnt/${routeId}/contact`);
    });

    it("shows only the wait modal with a loading message while data is loading", () => {
      setLoading();
      render(<TmntHomePage />);

      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("does not render the header while loading", () => {
      setLoading();
      render(<TmntHomePage />);
      expect(mockedHeader).not.toHaveBeenCalled();
    });

    it("does not call retry while loading", () => {
      setLoading();
      render(<TmntHomePage />);
      expect(retryMock).not.toHaveBeenCalled();
    });

    it("does not show the wait modal once data is loaded", () => {
      render(<TmntHomePage />);
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("shows the error heading and the generic message when loading failed", () => {
      setFailed("Network error");
      render(<TmntHomePage />);

      expect(
        screen.getByRole("heading", { level: 4, name: "Unable to load tournament" })
      ).toBeInTheDocument();
      expect(screen.getByText(genericErrMsg)).toBeInTheDocument();
      expect(screen.queryByText(missingDataMsg)).not.toBeInTheDocument();
    });

    it("shows only the error, not the wait modal, header or welcome content", () => {
      setFailed("Network error");
      render(<TmntHomePage />);

      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
      expect(mockedHeader).not.toHaveBeenCalled();
      expect(screen.queryByText(/Welcome to/)).not.toBeInTheDocument();
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("shows the generic message when failed and there is no error text", () => {
      setFailed(undefined);
      render(<TmntHomePage />);
      expect(screen.getByText(genericErrMsg)).toBeInTheDocument();
    });

    it("shows the generic message when failed and the error text is empty", () => {
      setFailed("");
      render(<TmntHomePage />);
      expect(screen.getByText(genericErrMsg)).toBeInTheDocument();
    });

    it("shows the missing data message when the error mentions a missing required child", () => {
      setFailed("Tournament has a missing required child: events");
      render(<TmntHomePage />);

      expect(screen.getByText(missingDataMsg)).toBeInTheDocument();
      expect(
        screen.queryByText(/An error occurred while loading/)
      ).not.toBeInTheDocument();
    });

    it("uses the route tmntId in the error message", () => {
      const routeId = "tmt_routeid00000000000000000000000";
      mockedUseParams.mockReturnValue({ tmntId: routeId });
      setFailed("Network error");
      render(<TmntHomePage />);

      expect(
        screen.getByText(
          `An error occurred while loading the tournament with id: ${routeId}.`
        )
      ).toBeInTheDocument();
    });

    it("does not call retry until the Retry button is clicked", () => {
      setFailed("boom");
      render(<TmntHomePage />);
      expect(retryMock).not.toHaveBeenCalled();
    });

    it("calls retry with no arguments each time the Retry button is clicked", () => {
      setFailed("boom");
      render(<TmntHomePage />);

      const retryBtn = screen.getByRole("button", { name: "Retry" });
      expect(retryBtn).toHaveAttribute("type", "button");

      fireEvent.click(retryBtn);
      expect(retryMock).toHaveBeenCalledTimes(1);
      expect(retryMock).toHaveBeenCalledWith();

      fireEvent.click(retryBtn);
      expect(retryMock).toHaveBeenCalledTimes(2);
    });

    it("renders the page instead of the error when data exists even if failed is true", () => {
      setHook({ hasData: true, failed: true, error: "stale error" });
      render(<TmntHomePage />);

      expect(screen.queryByText("Unable to load tournament")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
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
      const props = mockedHeader.mock.lastCall?.[0];
      expect(props?.tmntFullData).toBe(mockTmntFullData);
      expect(props?.selectedTmntPageBtn).toBe("Home");
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

      // exact match: the date line holds only the one date, no range
      const start = getMonthDayYear(startDateStr);
      expect(screen.getByText(start)).toBeInTheDocument();
      expect(screen.queryByText(`${start} - ${start}`)).not.toBeInTheDocument();
    });

    it("renders a date range when start and end dates differ", () => {
      const endDateStr = "2025-09-03";
      setHook({ data: withTmnt({ end_date_str: endDateStr }) });
      render(<TmntHomePage />);

      const start = getMonthDayYear(startDateStr);
      const end = getMonthDayYear(endDateStr);
      expect(screen.getByText(`${start} - ${end}`)).toBeInTheDocument();
      expect(screen.queryByText(start)).not.toBeInTheDocument();
    });

    it("renders the tournament name and formatted entry fee of the event", () => {
      render(<TmntHomePage />);

      const expectedFee = formatValueSymbSep2Dec(firstEvent.entry_fee, localConfig);
      expect(
        screen.getByText(`${tmntName} - ${expectedFee} entry`)
      ).toBeInTheDocument();
    });

    it("formats an entry fee with cents", () => {
      setHook({
        data: {
          ...mockTmntFullData,
          events: [{ ...firstEvent, entry_fee: "85.5" }],
        },
      });
      render(<TmntHomePage />);

      const expectedFee = formatValueSymbSep2Dec("85.5", localConfig);
      expect(
        screen.getByText(`${tmntName} - ${expectedFee} entry`)
      ).toBeInTheDocument();
    });

    it("throws when the loaded tournament has no events", () => {
      // a tmnt is never saved without an event, so this is an impossible state
      setHook({ data: { ...mockTmntFullData, events: [] } });
      // React logs the render error; keep the test output clean
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);

      expect(() => render(<TmntHomePage />)).toThrow(
        `Tournament with id: ${tmntId} has no events.`
      );
      consoleErrorSpy.mockRestore();
    });

    it("renders the Contact Director link for this tournament", () => {
      render(<TmntHomePage />);
      expect(
        screen.getByRole("link", { name: "Contact Director" })
      ).toHaveAttribute("href", `/results/tmnt/${tmntId}/contact`);
    });

    it("renders exactly two links: the bowl site and Contact Director", () => {
      render(<TmntHomePage />);
      expect(screen.getAllByRole("link")).toHaveLength(2);
    });
  });
});


// // test/app/results/tmnts/home/tmntHomePage.test.tsx
// // tests src/app/results/tmnt/[tmntId]/home/page.tsx
// import React from "react";
// import { render, screen, fireEvent } from "@testing-library/react";
// import { useParams } from "next/navigation";
// import TmntHomePage from "@/app/results/tmnt/[tmntId]/home/page";
// import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
// import { useTmntFullData } from "@/hooks/useTmntFullData";
// import { getMonthDayYear } from "@/lib/dateTools";
// import { localConfig } from "@/lib/currency/const";
// import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
// import { tmntFullType } from "@/lib/types/types";
// import {
//   mockTmntFullData,
//   tmntId,
// } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// /*************************/
// /* mocks for dependencies */
// /*************************/
// jest.mock("next/navigation", () => ({
//   useParams: jest.fn(),
// }));

// jest.mock("@/hooks/useTmntFullData", () => ({
//   useTmntFullData: jest.fn(),
// }));

// jest.mock("@/components/modal/waitModal", () => ({
//   __esModule: true,
//   default: ({ show, message }: { show: boolean; message: string }) =>
//     show ? <div data-testid="wait-modal">{message}</div> : null,
// }));

// jest.mock("@/app/results/tmntHeader/tmntHomeHeader", () => ({
//   __esModule: true,
//   default: jest.fn(
//     ({ selectedTmntPageBtn }: { selectedTmntPageBtn: string }) => (
//       <div data-testid="tmnt-header">{selectedTmntPageBtn}</div>
//     )
//   ),
// }));

// const mockedUseParams = useParams as jest.Mock;
// const mockedUseTmntFullData = useTmntFullData as jest.Mock;
// const mockedHeader = TmntHomeHeader as unknown as jest.Mock;

// /***********/
// /* helpers */
// /***********/
// const retryMock = jest.fn();

// type HookState = {
//   data?: tmntFullType | null;
//   hasData?: boolean;
//   failed?: boolean;
//   error?: string | null;
// };

// const setHook = ({
//   data = mockTmntFullData,
//   hasData = true,
//   failed = false,
//   error = null,
// }: HookState = {}) => {
//   mockedUseTmntFullData.mockReturnValue({
//     data,
//     hasData,
//     failed,
//     error,
//     retry: retryMock,
//   });
// };

// const withTmnt = (
//   tmntOverrides: Partial<tmntFullType["tmnt"]>
// ): tmntFullType => ({
//   ...mockTmntFullData,
//   tmnt: { ...mockTmntFullData.tmnt, ...tmntOverrides },
// });

// const { bowl } = mockTmntFullData.tmnt;
// const tmntName = mockTmntFullData.tmnt.tmnt_name;

// describe("TmntHomePage", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//     mockedUseParams.mockReturnValue({ tmntId });
//     setHook();
//   });

//   describe("fixture sanity check", () => {
//     it("mock data has at least one event", () => {
//       expect(mockTmntFullData.events.length).toBeGreaterThan(0);
//     });
//   });

//   describe("data loading", () => {
//     it("requests the tournament data using the tmntId from the route params", () => {
//       render(<TmntHomePage />);
//       expect(mockedUseTmntFullData).toHaveBeenCalledWith(tmntId);
//     });

//     it("shows the wait modal with a loading message while data is loading", () => {
//       setHook({ data: null, hasData: false, failed: false });
//       render(<TmntHomePage />);

//       expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
//       expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
//       expect(screen.queryByText("Unable to load tournament")).not.toBeInTheDocument();
//     });
//   });

//   describe("error state", () => {
//     it("shows a generic error message when loading failed", () => {
//       setHook({
//         data: null,
//         hasData: false,
//         failed: true,
//         error: "Network error",
//       });
//       render(<TmntHomePage />);

//       expect(
//         screen.getByRole("heading", { level: 4, name: "Unable to load tournament" })
//       ).toBeInTheDocument();
//       expect(
//         screen.getByText(
//           `An error occurred while loading the tournament with id: ${tmntId}.`
//         )
//       ).toBeInTheDocument();
//       expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
//       expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
//     });

//     it("shows the generic error message when failed but the error is null", () => {
//       setHook({ data: null, hasData: false, failed: true, error: null });
//       render(<TmntHomePage />);

//       expect(
//         screen.getByText(
//           `An error occurred while loading the tournament with id: ${tmntId}.`
//         )
//       ).toBeInTheDocument();
//     });

//     it("shows the missing data message when the error mentions a missing required child", () => {
//       setHook({
//         data: null,
//         hasData: false,
//         failed: true,
//         error: "Tournament has a missing required child: events",
//       });
//       render(<TmntHomePage />);

//       expect(
//         screen.getByText(`Tournament with id: ${tmntId} is missing data.`)
//       ).toBeInTheDocument();
//       expect(
//         screen.queryByText(/An error occurred while loading/)
//       ).not.toBeInTheDocument();
//     });

//     it("calls retry when the Retry button is clicked", () => {
//       setHook({ data: null, hasData: false, failed: true, error: "boom" });
//       render(<TmntHomePage />);

//       fireEvent.click(screen.getByRole("button", { name: "Retry" }));
//       expect(retryMock).toHaveBeenCalledTimes(1);
//     });

//     it("renders the page instead of the error when data exists even if failed is true", () => {
//       setHook({ hasData: true, failed: true, error: "stale error" });
//       render(<TmntHomePage />);

//       expect(screen.queryByText("Unable to load tournament")).not.toBeInTheDocument();
//       expect(
//         screen.getByRole("heading", { level: 4, name: `Welcome to ${tmntName}` })
//       ).toBeInTheDocument();
//     });
//   });

//   describe("header", () => {
//     it("renders TmntHomeHeader with the tournament data and Home selected", () => {
//       render(<TmntHomePage />);

//       expect(screen.getByTestId("tmnt-header")).toHaveTextContent("Home");
//       expect(mockedHeader).toHaveBeenCalled();
//       const props = mockedHeader.mock.calls[0][0] as {
//         tmntFullData: tmntFullType;
//         selectedTmntPageBtn: string;
//       };
//       expect(props.tmntFullData).toBe(mockTmntFullData);
//       expect(props.selectedTmntPageBtn).toBe("Home");
//     });
//   });

//   describe("welcome content", () => {
//     it("renders the welcome heading with the tournament name", () => {
//       render(<TmntHomePage />);
//       expect(
//         screen.getByRole("heading", { level: 4, name: `Welcome to ${tmntName}` })
//       ).toBeInTheDocument();
//     });

//     it("renders the host bowling center as a link that opens in a new tab", () => {
//       render(<TmntHomePage />);

//       const link = screen.getByRole("link", { name: bowl.bowl_name });
//       expect(link).toHaveAttribute("href", bowl.url);
//       expect(link).toHaveAttribute("target", "_blank");
//       expect(link).toHaveAttribute("rel", "noopener noreferrer");

//       expect(screen.getByText("Hosted by")).toHaveTextContent(
//         `Hosted by ${bowl.bowl_name}`
//       );
//     });

//     it("renders the bowl city and state", () => {
//       render(<TmntHomePage />);
//       expect(screen.getByText(`${bowl.city}, ${bowl.state}`)).toBeInTheDocument();
//     });

//     it("renders a single date when start and end dates match", () => {
//       render(<TmntHomePage />);

//       const dateStr = getMonthDayYear(mockTmntFullData.tmnt.start_date_str);
//       expect(screen.getByText(dateStr)).toBeInTheDocument();
//       expect(screen.queryByText(/ - .*\d{4}/)).not.toBeInTheDocument();
//     });

//     it("renders a date range when start and end dates differ", () => {
//       setHook({ data: withTmnt({ end_date_str: "2025-09-03" }) });
//       render(<TmntHomePage />);

//       const start = getMonthDayYear("2025-09-01");
//       const end = getMonthDayYear("2025-09-03");
//       expect(screen.getByText(`${start} - ${end}`)).toBeInTheDocument();
//     });

//     it("renders the tournament name and formatted entry fee of the first event", () => {
//       render(<TmntHomePage />);

//       const expectedFee = formatValueSymbSep2Dec(
//         mockTmntFullData.events[0].entry_fee,
//         localConfig
//       );
//       expect(
//         screen.getByText(`${tmntName} - ${expectedFee} entry`)
//       ).toBeInTheDocument();
//     });

//     it("renders an empty entry fee when there are no events", () => {
//       setHook({ data: { ...mockTmntFullData, events: [] } });
//       render(<TmntHomePage />);

//       // empty fee leaves a double space, which toHaveTextContent normalizes
//       const line = screen.getByText((_, el) =>
//         Boolean(
//           el?.tagName === "DIV" &&
//             el.className === "mb-2" &&
//             el.textContent?.endsWith("entry")
//         )
//       );
//       expect(line).toHaveTextContent(`${tmntName} - entry`);
//     });

//     it("renders the Contact Director link for this tournament", () => {
//       render(<TmntHomePage />);
//       expect(
//         screen.getByRole("link", { name: "Contact Director" })
//       ).toHaveAttribute("href", `/results/tmnt/${tmntId}/contact`);
//     });
//   });
// });

