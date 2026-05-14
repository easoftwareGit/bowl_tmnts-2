import { render, screen, fireEvent } from "@testing-library/react";
import TmntResultsPage from "@/app/results/page";
import { useDispatch, useSelector } from "react-redux";
import { clearTmnts, fetchTmnts } from "@/redux/features/tmnts/tmntsSlice";
import { fetchTmntYears } from "@/redux/features/tmnts/yearsSlice";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("@/redux/features/tmnts/tmntsSlice", () => ({
  clearTmnts: jest.fn(),
  fetchTmnts: jest.fn(),
}));

jest.mock("@/redux/features/tmnts/yearsSlice", () => ({
  fetchTmntYears: jest.fn(),
}));

jest.mock("@/lib/dateTools", () => ({
  todayYearStr: "2026",
}));

const mockTmntsList = jest.fn();

jest.mock("@/components/tmnts/tmntsList", () => {
  return function MockTmntsList(props: any) {
    mockTmntsList(props);

    return (
      <div data-testid="TmntsListMock">
        <div data-testid="years">{JSON.stringify(props.years)}</div>
        <div data-testid="tmnts">{JSON.stringify(props.tmnts)}</div>
        <div data-testid="showResults">{String(props.showResults)}</div>

        <button
          type="button"
          onClick={() => props.onYearChange("2025")}
        >
          Change Year
        </button>
      </div>
    );
  };
});

describe("TmntResultsPage", () => {
  const mockDispatch = jest.fn();

  const mockYears = [
    { year: "2026" },
    { year: "2025" },
  ];

  const mockTmnts = [
    {
      id: "tmnt1",
      tmnt_name: "Tournament One",
      start_date: "2026-01-01",
    },
    {
      id: "tmnt2",
      tmnt_name: "Tournament Two",
      start_date: "2026-02-01",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);

    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        tmnts: {
          tmnts: mockTmnts,
        },
        tmntYears: {
          data: mockYears,
        },
      }),
    );

    // (clearTmnts as jest.Mock).mockReturnValue({
    //   type: "tmnts/clearTmnts",
    // });

    // (fetchTmnts as unknown as jest.Mock).mockImplementation((year: string) => ({
    //   type: "tmnts/fetchTmnts",
    //   payload: year,
    // }));

    // (fetchTmntYears as unknown as jest.Mock).mockReturnValue({
    //   type: "tmntYears/fetchTmntYears",
    // });

    (clearTmnts as unknown as jest.Mock).mockReturnValue({
      type: "tmnts/clearTmnts",
    });

    (fetchTmnts as unknown as jest.Mock).mockImplementation((year: string) => ({
      type: "tmnts/fetchTmnts",
      payload: year,
    }));

    (fetchTmntYears as unknown as jest.Mock).mockReturnValue({
      type: "tmntYears/fetchTmntYears",
    });    
  });

  it("renders the page title", () => {
    render(<TmntResultsPage />);

    expect(
      screen.getByRole("heading", {
        name: "Tournament Results",
      }),
    ).toBeInTheDocument();
  });

  it("renders TmntsList", () => {
    render(<TmntResultsPage />);

    expect(screen.getByTestId("TmntsListMock")).toBeInTheDocument();
  });

  it("dispatches clearTmnts when the page loads", () => {
    render(<TmntResultsPage />);

    expect(clearTmnts).toHaveBeenCalledTimes(1);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "tmnts/clearTmnts",
    });
  });

  it("dispatches fetchTmnts with the current year when the page loads", () => {
    render(<TmntResultsPage />);

    expect(fetchTmnts).toHaveBeenCalledWith("2026");

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "tmnts/fetchTmnts",
      payload: "2026",
    });
  });

  it("dispatches fetchTmntYears when the page loads", () => {
    render(<TmntResultsPage />);

    expect(fetchTmntYears).toHaveBeenCalledTimes(1);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "tmntYears/fetchTmntYears",
    });
  });

  it("passes years from Redux state to TmntsList", () => {
    render(<TmntResultsPage />);

    expect(mockTmntsList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        years: mockYears,
      }),
    );
  });

  it("passes tournaments from Redux state to TmntsList", () => {
    render(<TmntResultsPage />);

    expect(mockTmntsList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tmnts: mockTmnts,
      }),
    );
  });

  it("passes showResults true to TmntsList", () => {
    render(<TmntResultsPage />);

    expect(mockTmntsList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        showResults: true,
      }),
    );
  });

  it("passes onYearChange function to TmntsList", () => {
    render(<TmntResultsPage />);

    expect(mockTmntsList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        onYearChange: expect.any(Function),
      }),
    );
  });

  it("dispatches fetchTmnts again when year changes", () => {
    render(<TmntResultsPage />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Change Year",
      }),
    );

    expect(fetchTmnts).toHaveBeenCalledWith("2026");
    expect(fetchTmnts).toHaveBeenCalledWith("2025");

    expect(fetchTmnts).toHaveBeenCalledTimes(2);
  });

  it("does not dispatch clearTmnts again when year changes", () => {
    render(<TmntResultsPage />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Change Year",
      }),
    );

    expect(clearTmnts).toHaveBeenCalledTimes(1);
  });

  it("does not dispatch fetchTmntYears again when year changes", () => {
    render(<TmntResultsPage />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Change Year",
      }),
    );

    expect(fetchTmntYears).toHaveBeenCalledTimes(1);
  });
});