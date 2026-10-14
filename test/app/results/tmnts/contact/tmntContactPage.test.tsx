import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useParams } from "next/navigation";
import TmntContactPage from "@/app/results/tmnt/[tmntId]/contact/page";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import { fetchUser } from "@/redux/features/user/userSlice";
import { tmntFullType } from "@/lib/types/types";
import {
  mockTmntFullData,
  tmntId,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

/*************************/
/* mocks for dependencies */
/*************************/
type MockUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

type MockState = {
  user: {
    user: MockUser;
    loadStatus: string;
    error: string | undefined;
    requestedUserId: string;
  };
};

let mockState: MockState;
const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state: MockState) => unknown) =>
    selector(mockState),
}));

// the page only uses the store module for types
jest.mock("@/redux/store", () => ({}));

jest.mock("@/redux/features/user/userSlice", () => ({
  fetchUser: jest.fn((id: string) => ({ type: "user/fetchUser", payload: id })),
  getUserError: (state: MockState) => state.user.error,
  getUserLoadStatus: (state: MockState) => state.user.loadStatus,
  getUserRequestId: (state: MockState) => state.user.requestedUserId,
}));

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
const mockedFetchUser = fetchUser as unknown as jest.Mock;
const mockedHeader = TmntHomeHeader as unknown as jest.Mock;

/***********/
/* helpers */
/***********/
const retryMock = jest.fn();
const directorId = mockTmntFullData.tmnt.user_id;

const directorUser: MockUser = {
  id: directorId,
  first_name: "Dana",
  last_name: "Director",
  email: "dana.director@example.com",
  phone: "555-123-4567",
};
const blankUser: MockUser = { ...directorUser, id: "" };
const otherUser: MockUser = { ...directorUser, id: "usr_otheruser0000000000000000000000" };

// the page reads tmntFullData.tmnt unconditionally, so the hook must always return an object
const blankTmntData = (): tmntFullType => ({
  ...mockTmntFullData,
  tmnt: { ...mockTmntFullData.tmnt, id: "" },
});

type HookState = {
  data?: tmntFullType;
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

type UserStateOpts = {
  user?: MockUser;
  loadStatus?: string;
  error?: string | undefined;
  requestedUserId?: string;
};

const setUserState = ({
  user = directorUser,
  loadStatus = "succeeded",
  error = "",
  requestedUserId = directorId,
}: UserStateOpts = {}) => {
  mockState = { user: { user, loadStatus, error, requestedUserId } };
};

describe("TmntContactPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseParams.mockReturnValue({ tmntId });
    setHook();
    setUserState();
  });

  describe("fixture sanity check", () => {
    it("mock tournament has an id and a director user id", () => {
      expect(mockTmntFullData.tmnt.id).toBe(tmntId);
      expect(mockTmntFullData.tmnt.user_id).not.toBe("");
    });
  });

  describe("tournament data loading", () => {
    it("requests the tournament data using the tmntId from the route params", () => {
      render(<TmntContactPage />);
      expect(mockedUseTmntFullData).toHaveBeenCalledWith(tmntId);
    });

    it("shows the wait modal while the tournament is loading", () => {
      setHook({ data: blankTmntData(), hasData: false });
      render(<TmntContactPage />);

      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
      expect(screen.queryByText("Unable to load tournament")).not.toBeInTheDocument();
    });

    it("does not fetch the director while the tournament is loading", () => {
      setHook({ data: blankTmntData(), hasData: false });
      setUserState({ user: blankUser, loadStatus: "idle" });
      render(<TmntContactPage />);

      expect(mockedFetchUser).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("does not throw or fetch the director when the hook returns no data while loading", () => {
      mockedUseTmntFullData.mockReturnValue({
        data: undefined,
        hasData: false,
        failed: false,
        error: null,
        retry: retryMock,
      });
      setUserState({ user: blankUser, loadStatus: "idle" });

      expect(() => render(<TmntContactPage />)).not.toThrow();
      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
      expect(mockDispatch).not.toHaveBeenCalled();
    });    
  });

  describe("tournament loading and error", () => {
    it("does not throw when the hook returns no data while loading", () => {
      mockedUseTmntFullData.mockReturnValue({
        data: undefined,
        hasData: false,
        failed: false,
        error: null,
        retry: retryMock,
      });

      expect(() => render(<TmntContactPage />)).not.toThrow()
      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
    });

    it("shows the tournament error when the hook returns no data and failed", () => {
      mockedUseTmntFullData.mockReturnValue({
        data: undefined,
        hasData: false,
        failed: true,
        error: "boom",
        retry: retryMock,
      });

      render(<TmntContactPage />);

      expect(
        screen.getByRole("heading", { level: 4, name: "Unable to load tournament" })
      ).toBeInTheDocument();
    });    
  });

  describe("tournament error state", () => {
    it("shows a generic error message when loading failed", () => {
      setHook({
        data: blankTmntData(),
        hasData: false,
        failed: true,
        error: "Network error",
      });
      render(<TmntContactPage />);

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
      setHook({ data: blankTmntData(), hasData: false, failed: true, error: null });
      render(<TmntContactPage />);

      expect(
        screen.getByText(
          `An error occurred while loading the tournament with id: ${tmntId}.`
        )
      ).toBeInTheDocument();
    });

    it("shows the missing data message when the error mentions a missing required child", () => {
      setHook({
        data: blankTmntData(),
        hasData: false,
        failed: true,
        error: "Tournament has a missing required child: events",
      });
      render(<TmntContactPage />);

      expect(
        screen.getByText(`Tournament with id: ${tmntId} is missing data.`)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/An error occurred while loading/)
      ).not.toBeInTheDocument();
    });

    it("calls retry when the Retry button is clicked", () => {
      setHook({ data: blankTmntData(), hasData: false, failed: true, error: "boom" });
      render(<TmntContactPage />);

      fireEvent.click(screen.getByRole("button", { name: "Retry" }));
      expect(retryMock).toHaveBeenCalledTimes(1);
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("does not fetch the director when the tournament failed to load", () => {
      setHook({ data: blankTmntData(), hasData: false, failed: true, error: "boom" });
      setUserState({ user: blankUser, loadStatus: "idle" });
      render(<TmntContactPage />);

      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe("fetching the director", () => {
    it("fetches the director when no user is loaded", () => {
      setUserState({ user: blankUser, loadStatus: "idle" });
      render(<TmntContactPage />);

      expect(mockedFetchUser).toHaveBeenCalledTimes(1);
      expect(mockedFetchUser).toHaveBeenCalledWith(directorId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "user/fetchUser",
        payload: directorId,
      });
    });

    it("fetches the director when the loaded user is not this tournament's director", () => {
      setUserState({
        user: otherUser,
        loadStatus: "succeeded",
        requestedUserId: otherUser.id,
      });      
      render(<TmntContactPage />);

      expect(mockedFetchUser).toHaveBeenCalledWith(directorId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it("does not fetch when the director is already loaded", () => {
      render(<TmntContactPage />);

      expect(mockedFetchUser).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("does not fetch while a user request is already loading", () => {
      setUserState({ user: blankUser, loadStatus: "loading" });
      render(<TmntContactPage />);

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("does not fetch again when the request for this director already failed", () => {
      setUserState({
        user: blankUser,
        loadStatus: "failed",
        requestedUserId: directorId,
      });
      render(<TmntContactPage />);

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("fetches the director when a previous failure was for a different user", () => {
      setUserState({
        user: blankUser,
        loadStatus: "failed",
        requestedUserId: "usr_somebodyelse00000000000000000000",
      });
      render(<TmntContactPage />);

      expect(mockedFetchUser).toHaveBeenCalledWith(directorId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it("does not fetch when the loaded tournament id does not match the route param", () => {
      mockedUseParams.mockReturnValue({ tmntId: "tmt_differentid00000000000000000000" });
      setUserState({ user: blankUser, loadStatus: "idle" });
      render(<TmntContactPage />);

      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe("waiting for the director", () => {
    it("shows the wait modal while the director is loading", () => {
      setUserState({ user: blankUser, loadStatus: "loading" });
      render(<TmntContactPage />);

      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
    });

    it("shows the wait modal when a different user is loaded", () => {
      setUserState({ user: otherUser, loadStatus: "loading" });
      render(<TmntContactPage />);

      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
      expect(
        screen.queryByText(/Contact information for Tournament Director/)
      ).not.toBeInTheDocument();
    });
  });

  describe("director error state", () => {
    const setDirectorFailed = (error: string | undefined) =>
      setUserState({
        user: blankUser,
        loadStatus: "failed",
        requestedUserId: directorId,
        error,
      });

    it("shows the user error message when the director failed to load", () => {
      setDirectorFailed("User service unavailable");
      render(<TmntContactPage />);

      expect(
        screen.getByRole("heading", {
          level: 4,
          name: "Unable to load tournament director",
        })
      ).toBeInTheDocument();
      expect(screen.getByText("User service unavailable")).toBeInTheDocument();
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
    });

    it("shows a default message when the user error is undefined", () => {
      setDirectorFailed(undefined);
      render(<TmntContactPage />);

      expect(
        screen.getByText("An error occurred while loading the tournament director.")
      ).toBeInTheDocument();
    });

    it("shows a default message when the user error is an empty string", () => {
      setDirectorFailed("");
      render(<TmntContactPage />);

      expect(
        screen.getByText("An error occurred while loading the tournament director.")
      ).toBeInTheDocument();
    });
        
    it("dispatches fetchUser for the director when Retry is clicked", () => {
      setDirectorFailed("User service unavailable");
      render(<TmntContactPage />);
      expect(mockDispatch).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "Retry" }));

      expect(mockedFetchUser).toHaveBeenCalledWith(directorId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "user/fetchUser",
        payload: directorId,
      });
      expect(retryMock).not.toHaveBeenCalled();
    });

    it("does not show the director error when the failure was for a different user", () => {
      setUserState({
        user: blankUser,
        loadStatus: "failed",
        requestedUserId: "usr_somebodyelse00000000000000000000",
        error: "some other error",
      });
      render(<TmntContactPage />);

      expect(
        screen.queryByText("Unable to load tournament director")
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
    });
    
    describe("director not found", () => {
      const setDirectorNotFound = () =>
        setUserState({
          user: blankUser,
          loadStatus: "succeeded",
          requestedUserId: directorId,
          error: "",
        });

      it("shows a not found message when the request succeeded but returned no director", () => {
        setDirectorNotFound();
        render(<TmntContactPage />);

        expect(
          screen.getByRole("heading", {
            level: 4,
            name: "Unable to load tournament director",
          })
        ).toBeInTheDocument();
        expect(
          screen.getByText("The tournament director could not be found.")
        ).toBeInTheDocument();
        expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
        expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
      });

      it("does not show not found when the succeeded request was for a different user", () => {
        setUserState({
          user: blankUser,
          loadStatus: "succeeded",
          requestedUserId: "usr_somebodyelse00000000000000000000",
        });
        render(<TmntContactPage />);

        expect(
          screen.queryByText("The tournament director could not be found.")
        ).not.toBeInTheDocument();
      });

      it("dispatches fetchUser again when Retry is clicked", () => {
        setDirectorNotFound();
        render(<TmntContactPage />);

        // the effect already made the one automatic request on mount
        mockDispatch.mockClear();
        fireEvent.click(screen.getByRole("button", { name: "Retry" }));

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith({
          type: "user/fetchUser",
          payload: directorId,
        });
      });
    });

  });

  describe("contact content", () => {
    it("renders the header with the tournament data and no selected button", () => {
      render(<TmntContactPage />);

      expect(screen.getByTestId("tmnt-header")).toHaveTextContent("None");
      const props = mockedHeader.mock.calls[0][0] as {
        tmntFullData: tmntFullType;
        selectedTmntPageBtn: string;
      };
      expect(props.tmntFullData).toBe(mockTmntFullData);
      expect(props.selectedTmntPageBtn).toBe("None");
    });

    it("renders the heading with the director's full name", () => {
      render(<TmntContactPage />);

      expect(
        screen.getByRole("heading", {
          level: 4,
          name: "Contact information for Tournament Director Dana Director",
        })
      ).toBeInTheDocument();
    });

    it("renders the director's email as a mailto link", () => {
      render(<TmntContactPage />);

      expect(screen.getByText("Email:")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: directorUser.email })
      ).toHaveAttribute("href", `mailto:${directorUser.email}`);
    });

    it("renders the director's phone number", () => {
      render(<TmntContactPage />);

      expect(screen.getByText("Phone:")).toBeInTheDocument();
      expect(screen.getByText(directorUser.phone)).toBeInTheDocument();
    });

    it("does not render the wait modal or an error when everything is loaded", () => {
      render(<TmntContactPage />);

      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByText(/Unable to load/)).not.toBeInTheDocument();
    });
  });
});
