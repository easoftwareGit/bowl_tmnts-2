// test/app/results/tmnts/contact/tmntContactPage.test.tsx
// tests src/app/results/tmnt/[tmntId]/contact/page.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useParams } from "next/navigation";
import TmntContactPage from "@/app/results/tmnt/[tmntId]/contact/page";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import { fetchTmntDirector } from "@/redux/features/director/directorSlice";
import { tmntFullType } from "@/lib/types/types";
import {
  mockTmntFullData,
  tmntId,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

/**************************/
/* mocks for dependencies */
/**************************/
type MockDirector = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

type DirectorLoadStatus = "idle" | "loading" | "succeeded" | "failed";

type MockState = {
  tmntDirector: {
    tmntDirector: MockDirector;
    requestedTmntId: string;
    loadStatus: DirectorLoadStatus;
    error: string | undefined;
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

jest.mock("@/redux/features/director/directorSlice", () => ({
  fetchTmntDirector: jest.fn((id: string) => ({
    type: "tmntDirector/fetchTmntDirector",
    payload: id,
  })),
  selectTmntDirector: (state: MockState) => state.tmntDirector.tmntDirector,
  getTmntDirectorRequestId: (state: MockState) =>
    state.tmntDirector.requestedTmntId,
  getTmntDirectorLoadStatus: (state: MockState) =>
    state.tmntDirector.loadStatus,
  getTmntDirectorError: (state: MockState) => state.tmntDirector.error,
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

const mockedUseParams = jest.mocked(useParams);
const mockedUseTmntFullData = jest.mocked(useTmntFullData);
const mockedFetchTmntDirector = jest.mocked(fetchTmntDirector);
const mockedHeader = jest.mocked(TmntHomeHeader);

/***********/
/* helpers */
/***********/
type HookResult = ReturnType<typeof useTmntFullData>;
type RetryFn = HookResult["retry"];

const retryMock = jest.fn<ReturnType<RetryFn>, Parameters<RetryFn>>();
const otherTmntId = "tmt_differentid00000000000000000000";

const director: MockDirector = {
  first_name: "Dana",
  last_name: "Director",
  email: "dana.director@example.com",
  phone: "555-123-4567",
};
const otherDirector: MockDirector = {
  first_name: "Oscar",
  last_name: "Other",
  email: "oscar.other@example.com",
  phone: "555-987-6543",
};
const blankDirector: MockDirector = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
};

// the hook always returns a tmntFullType; while loading it is a blank tmnt
const blankTmntData = (): tmntFullType => ({
  ...mockTmntFullData,
  tmnt: { ...mockTmntFullData.tmnt, id: "", user_id: "" },
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

const setTmntLoading = () => {
  setHook({ data: blankTmntData(), hasData: false });
};

const setTmntFailed = (error?: string) => {
  setHook({ data: blankTmntData(), hasData: false, failed: true, error });
};

type DirectorStateOpts = {
  tmntDirector?: MockDirector;
  loadStatus?: DirectorLoadStatus;
  error?: string;
  requestedTmntId?: string;
};

// default: this tmnt's director is already loaded, so the page does not fetch
const setDirectorState = ({
  tmntDirector = director,
  loadStatus = "succeeded",
  error,
  requestedTmntId = tmntId,
}: DirectorStateOpts = {}) => {
  mockState = {
    tmntDirector: { tmntDirector, requestedTmntId, loadStatus, error },
  };
};

// nothing requested yet (first visit to any contact page)
const setDirectorIdle = () => {
  setDirectorState({
    tmntDirector: blankDirector,
    loadStatus: "idle",
    requestedTmntId: "",
  });
};

const fetchDirectorAction = (id: string) => ({
  type: "tmntDirector/fetchTmntDirector",
  payload: id,
});

type HeaderProps = Parameters<typeof TmntHomeHeader>[0];

const lastHeaderProps = (): HeaderProps => {
  const call = mockedHeader.mock.lastCall;
  if (!call) throw new Error("TmntHomeHeader was not rendered");
  return call[0];
};

describe("TmntContactPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseParams.mockReturnValue({ tmntId });
    setHook();
    setDirectorState();
  });

  describe("fixture sanity check", () => {
    it("mock tournament id matches tmntId and differs from otherTmntId", () => {
      expect(mockTmntFullData.tmnt.id).toBe(tmntId);
      expect(tmntId).not.toBe("");
      expect(tmntId).not.toBe(otherTmntId);
    });
  });

  describe("tournament loading", () => {
    it("requests the tournament data using the tmntId from the route params", () => {
      render(<TmntContactPage />);
      expect(mockedUseTmntFullData).toHaveBeenCalledWith(tmntId);
    });

    it("shows the wait modal while the tournament is loading", () => {
      setTmntLoading();
      render(<TmntContactPage />);

      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
      expect(screen.queryByText(/Unable to load/)).not.toBeInTheDocument();
    });

    it("fetches the director while the tournament is still loading", () => {
      setTmntLoading();
      setDirectorIdle();
      render(<TmntContactPage />);

      expect(mockedFetchTmntDirector).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(fetchDirectorAction(tmntId));
    });

    it("shows the wait modal, not the director error, while the tournament is loading", () => {
      setTmntLoading();
      setDirectorState({
        tmntDirector: blankDirector,
        loadStatus: "failed",
        error: "director failed",
      });
      render(<TmntContactPage />);

      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
      expect(
        screen.queryByText("Unable to load tournament director")
      ).not.toBeInTheDocument();
    });
  });

  describe("tournament error state", () => {
    it("shows a generic error message when loading failed", () => {
      setTmntFailed("Network error");
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

    it("shows the generic error message when failed but the error is undefined", () => {
      setTmntFailed(undefined);
      render(<TmntContactPage />);

      expect(
        screen.getByText(
          `An error occurred while loading the tournament with id: ${tmntId}.`
        )
      ).toBeInTheDocument();
    });

    it("shows the generic error message when failed and the error is an empty string", () => {
      setTmntFailed("");
      render(<TmntContactPage />);

      expect(
        screen.getByText(
          `An error occurred while loading the tournament with id: ${tmntId}.`
        )
      ).toBeInTheDocument();
    });

    it("shows the missing data message when the error mentions a missing required child", () => {
      setTmntFailed("Tournament has a missing required child: events");
      render(<TmntContactPage />);

      expect(
        screen.getByText(`Tournament with id: ${tmntId} is missing data.`)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/An error occurred while loading/)
      ).not.toBeInTheDocument();
    });

    it("shows the tournament error, not the director error, when both failed", () => {
      setTmntFailed("boom");
      setDirectorState({
        tmntDirector: blankDirector,
        loadStatus: "failed",
        error: "director failed",
      });
      render(<TmntContactPage />);

      expect(screen.getByText("Unable to load tournament")).toBeInTheDocument();
      expect(
        screen.queryByText("Unable to load tournament director")
      ).not.toBeInTheDocument();
    });

    it("calls the hook's retry (and does not dispatch) when Retry is clicked", () => {
      setTmntFailed("boom");
      render(<TmntContactPage />);

      fireEvent.click(screen.getByRole("button", { name: "Retry" }));
      expect(retryMock).toHaveBeenCalledTimes(1);
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("shows the contact info, not the error, when a refresh failed but data is still loaded", () => {
      setHook({ failed: true, error: "boom" });
      render(<TmntContactPage />);

      expect(screen.queryByText("Unable to load tournament")).not.toBeInTheDocument();
      expect(screen.getByTestId("tmnt-header")).toBeInTheDocument();
    });
  });

  describe("fetching the director", () => {
    it("fetches the director when nothing has been requested yet", () => {
      setDirectorIdle();
      render(<TmntContactPage />);

      expect(mockedFetchTmntDirector).toHaveBeenCalledTimes(1);
      expect(mockedFetchTmntDirector).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(fetchDirectorAction(tmntId));
    });

    it("fetches the director when the slice holds another tournament's director", () => {
      setDirectorState({
        tmntDirector: otherDirector,
        loadStatus: "succeeded",
        requestedTmntId: otherTmntId,
      });
      render(<TmntContactPage />);

      expect(mockedFetchTmntDirector).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it("fetches the director when another tournament's director is still loading", () => {
      setDirectorState({
        tmntDirector: blankDirector,
        loadStatus: "loading",
        requestedTmntId: otherTmntId,
      });
      render(<TmntContactPage />);

      expect(mockedFetchTmntDirector).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it("fetches the director when a previous failure was for another tournament", () => {
      setDirectorState({
        tmntDirector: blankDirector,
        loadStatus: "failed",
        requestedTmntId: otherTmntId,
      });
      render(<TmntContactPage />);

      expect(mockedFetchTmntDirector).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it("does not fetch when this tournament's director is already loaded", () => {
      render(<TmntContactPage />);

      expect(mockedFetchTmntDirector).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("does not fetch while this tournament's director is loading", () => {
      setDirectorState({ tmntDirector: blankDirector, loadStatus: "loading" });
      render(<TmntContactPage />);

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("does not fetch again automatically after this tournament's director failed", () => {
      setDirectorState({
        tmntDirector: blankDirector,
        loadStatus: "failed",
        error: "boom",
      });
      render(<TmntContactPage />);

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("does not fetch when the route has no tmntId", () => {
      mockedUseParams.mockReturnValue({});
      setDirectorIdle();
      render(<TmntContactPage />);

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("fetches only once across re-renders", () => {
      setDirectorIdle();
      const { rerender } = render(<TmntContactPage />);
      rerender(<TmntContactPage />);
      rerender(<TmntContactPage />);

      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it("shows the contact info after the director request succeeds, without fetching again", () => {
      setDirectorIdle();
      const { rerender } = render(<TmntContactPage />);
      expect(mockDispatch).toHaveBeenCalledTimes(1);

      setDirectorState({ tmntDirector: blankDirector, loadStatus: "loading" });
      rerender(<TmntContactPage />);
      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();

      setDirectorState();
      rerender(<TmntContactPage />);

      expect(
        screen.getByRole("heading", {
          level: 4,
          name: "Contact information for Tournament Director Dana Director",
        })
      ).toBeInTheDocument();
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it("fetches the new director when the route's tmntId changes", () => {
      const { rerender } = render(<TmntContactPage />);
      expect(mockDispatch).not.toHaveBeenCalled();

      mockedUseParams.mockReturnValue({ tmntId: otherTmntId });
      rerender(<TmntContactPage />);

      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(fetchDirectorAction(otherTmntId));
    });
  });

  describe("waiting for the director", () => {
    it("shows the wait modal while the director is loading", () => {
      setDirectorState({ tmntDirector: blankDirector, loadStatus: "loading" });
      render(<TmntContactPage />);

      expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
    });

    it("shows the wait modal before the first director request starts", () => {
      setDirectorIdle();
      render(<TmntContactPage />);

      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
    });

    it("shows the wait modal, not another tournament's director, while the slice holds that director", () => {
      setDirectorState({
        tmntDirector: otherDirector,
        loadStatus: "succeeded",
        requestedTmntId: otherTmntId,
      });
      render(<TmntContactPage />);

      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
      expect(
        screen.queryByText(/Contact information for Tournament Director/)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(otherDirector.email)).not.toBeInTheDocument();
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });
  });

  describe("director error state", () => {
    const setDirectorFailed = (error?: string) => {
      setDirectorState({
        tmntDirector: blankDirector,
        loadStatus: "failed",
        error,
      });
    };

    it("shows the director error message when the director failed to load", () => {
      setDirectorFailed("getTmntDirector failed: Request failed with status code 404");
      render(<TmntContactPage />);

      expect(
        screen.getByRole("heading", {
          level: 4,
          name: "Unable to load tournament director",
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText("getTmntDirector failed: Request failed with status code 404")
      ).toBeInTheDocument();
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
    });

    it("shows a default message when the director error is undefined", () => {
      setDirectorFailed(undefined);
      render(<TmntContactPage />);

      expect(
        screen.getByText("An error occurred while loading the tournament director.")
      ).toBeInTheDocument();
    });

    it("shows a default message when the director error is an empty string", () => {
      setDirectorFailed("");
      render(<TmntContactPage />);

      expect(
        screen.getByText("An error occurred while loading the tournament director.")
      ).toBeInTheDocument();
    });

    it("dispatches fetchTmntDirector for this tournament when Retry is clicked", () => {
      setDirectorFailed("boom");
      render(<TmntContactPage />);
      expect(mockDispatch).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "Retry" }));

      expect(mockedFetchTmntDirector).toHaveBeenCalledWith(tmntId);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(fetchDirectorAction(tmntId));
      expect(retryMock).not.toHaveBeenCalled();
    });

    it("does not show the director error when the failure was for another tournament", () => {
      setDirectorState({
        tmntDirector: blankDirector,
        loadStatus: "failed",
        requestedTmntId: otherTmntId,
        error: "some other error",
      });
      render(<TmntContactPage />);

      expect(
        screen.queryByText("Unable to load tournament director")
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
    });
  });

  describe("contact content", () => {
    it("renders the header with the tournament data and no selected button", () => {
      render(<TmntContactPage />);

      expect(screen.getByTestId("tmnt-header")).toHaveTextContent("None");
      const props = lastHeaderProps();
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
        screen.getByRole("link", { name: director.email })
      ).toHaveAttribute("href", `mailto:${director.email}`);
    });

    it("renders the director's phone number", () => {
      render(<TmntContactPage />);

      expect(screen.getByText("Phone:")).toBeInTheDocument();
      expect(screen.getByText(director.phone)).toBeInTheDocument();
    });

    it("does not render the wait modal, an error or a Retry button when everything is loaded", () => {
      render(<TmntContactPage />);

      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
      expect(screen.queryByText(/Unable to load/)).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    });
  });
});

// // test/app/results/tmnts/contact/tmntContactPage.test.tsx
// // tests src/app/results/tmnt/[tmntId]/contact/page.tsx
// import React from "react";
// import { render, screen, fireEvent } from "@testing-library/react";
// import { useParams } from "next/navigation";
// import TmntContactPage from "@/app/results/tmnt/[tmntId]/contact/page";
// import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
// import { useTmntFullData } from "@/hooks/useTmntFullData";
// import { fetchUser } from "@/redux/features/user/userSlice";
// import { tmntFullType } from "@/lib/types/types";
// import {
//   mockTmntFullData,
//   tmntId,
// } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// /**************************/
// /* mocks for dependencies */
// /**************************/
// type MockUser = {
//   id: string;
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone: string;
// };

// type UserLoadStatus = "idle" | "loading" | "succeeded" | "failed";

// type MockState = {
//   user: {
//     user: MockUser;
//     loadStatus: UserLoadStatus;
//     error: string | undefined;
//     requestedUserId: string;
//   };
// };

// let mockState: MockState;
// const mockDispatch = jest.fn();

// jest.mock("react-redux", () => ({
//   useDispatch: () => mockDispatch,
//   useSelector: (selector: (state: MockState) => unknown) =>
//     selector(mockState),
// }));

// // the page only uses the store module for types
// jest.mock("@/redux/store", () => ({}));

// jest.mock("@/redux/features/user/userSlice", () => ({
//   fetchUser: jest.fn((id: string) => ({ type: "user/fetchUser", payload: id })),
//   getUserError: (state: MockState) => state.user.error,
//   getUserLoadStatus: (state: MockState) => state.user.loadStatus,
//   getUserRequestId: (state: MockState) => state.user.requestedUserId,
// }));

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

// const mockedUseParams = jest.mocked(useParams);
// const mockedUseTmntFullData = jest.mocked(useTmntFullData);
// const mockedFetchUser = jest.mocked(fetchUser);
// const mockedHeader = jest.mocked(TmntHomeHeader);

// /***********/
// /* helpers */
// /***********/
// type HookResult = ReturnType<typeof useTmntFullData>;
// type RetryFn = HookResult["retry"];

// const retryMock = jest.fn<ReturnType<RetryFn>, Parameters<RetryFn>>();
// const directorId = mockTmntFullData.tmnt.user_id;
// const otherDirectorId = "usr_otherdirector0000000000000000000";
// const otherUserId = "usr_somebodyelse00000000000000000000";

// const directorUser: MockUser = {
//   id: directorId,
//   first_name: "Dana",
//   last_name: "Director",
//   email: "dana.director@example.com",
//   phone: "555-123-4567",
// };
// const blankUser: MockUser = {
//   id: "",
//   first_name: "",
//   last_name: "",
//   email: "",
//   phone: "",
// };
// const otherUser: MockUser = { ...directorUser, id: otherUserId };

// // the hook always returns a tmntFullType; while loading it is a blank tmnt
// const blankTmntData = (): tmntFullType => ({
//   ...mockTmntFullData,
//   tmnt: { ...mockTmntFullData.tmnt, id: "", user_id: "" },
// });

// // same tournament, but owned by a different director
// const otherDirectorTmntData = (): tmntFullType => ({
//   ...mockTmntFullData,
//   tmnt: { ...mockTmntFullData.tmnt, user_id: otherDirectorId },
// });

// type HookState = {
//   data?: tmntFullType;
//   hasData?: boolean;
//   failed?: boolean;
//   error?: string;
// };

// const setHook = ({
//   data = mockTmntFullData,
//   hasData = true,
//   failed = false,
//   error,
// }: HookState = {}) => {
//   mockedUseTmntFullData.mockReturnValue({
//     data,
//     hasData,
//     failed,
//     error,
//     retry: retryMock,
//   });
// };

// const setTmntLoading = () => {
//   setHook({ data: blankTmntData(), hasData: false });
// };

// const setTmntFailed = (error?: string) => {
//   setHook({ data: blankTmntData(), hasData: false, failed: true, error });
// };

// type UserStateOpts = {
//   user?: MockUser;
//   loadStatus?: UserLoadStatus;
//   error?: string;
//   requestedUserId?: string;
// };

// const setUserState = ({
//   user = directorUser,
//   loadStatus = "succeeded",
//   error,
//   requestedUserId = directorId,
// }: UserStateOpts = {}) => {
//   mockState = { user: { user, loadStatus, error, requestedUserId } };
// };

// const fetchUserAction = (id: string) => ({
//   type: "user/fetchUser",
//   payload: id,
// });

// type HeaderProps = Parameters<typeof TmntHomeHeader>[0];

// const lastHeaderProps = (): HeaderProps => {
//   const call = mockedHeader.mock.lastCall;
//   if (!call) throw new Error("TmntHomeHeader was not rendered");
//   return call[0];
// };

// describe("TmntContactPage", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//     mockedUseParams.mockReturnValue({ tmntId });
//     setHook();
//     setUserState();
//   });

//   describe("fixture sanity check", () => {
//     it("mock tournament has an id and a director user id", () => {
//       expect(mockTmntFullData.tmnt.id).toBe(tmntId);
//       expect(mockTmntFullData.tmnt.user_id).not.toBe("");
//       expect(mockTmntFullData.tmnt.user_id).not.toBe(otherDirectorId);
//     });
//   });

//   describe("tournament loading", () => {
//     it("requests the tournament data using the tmntId from the route params", () => {
//       render(<TmntContactPage />);
//       expect(mockedUseTmntFullData).toHaveBeenCalledWith(tmntId);
//     });

//     it("shows the wait modal while the tournament is loading", () => {
//       setTmntLoading();
//       render(<TmntContactPage />);

//       expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
//       expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
//       expect(screen.queryByText(/Unable to load/)).not.toBeInTheDocument();
//     });

//     it("does not fetch the director while the tournament is loading", () => {
//       setTmntLoading();
//       setUserState({ user: blankUser, loadStatus: "idle", requestedUserId: "" });
//       render(<TmntContactPage />);

//       expect(mockedFetchUser).not.toHaveBeenCalled();
//       expect(mockDispatch).not.toHaveBeenCalled();
//     });

//     it("does not fetch the director when the loaded tournament id does not match the route param", () => {
//       mockedUseParams.mockReturnValue({ tmntId: "tmt_differentid00000000000000000000" });
//       setUserState({ user: blankUser, loadStatus: "idle", requestedUserId: "" });
//       render(<TmntContactPage />);

//       expect(mockDispatch).not.toHaveBeenCalled();
//     });
//   });

//   describe("tournament error state", () => {
//     it("shows a generic error message when loading failed", () => {
//       setTmntFailed("Network error");
//       render(<TmntContactPage />);

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

//     it("shows the generic error message when failed but the error is undefined", () => {
//       setTmntFailed(undefined);
//       render(<TmntContactPage />);

//       expect(
//         screen.getByText(
//           `An error occurred while loading the tournament with id: ${tmntId}.`
//         )
//       ).toBeInTheDocument();
//     });

//     it("shows the generic error message when failed and the error is an empty string", () => {
//       setTmntFailed("");
//       render(<TmntContactPage />);

//       expect(
//         screen.getByText(
//           `An error occurred while loading the tournament with id: ${tmntId}.`
//         )
//       ).toBeInTheDocument();
//     });

//     it("shows the missing data message when the error mentions a missing required child", () => {
//       setTmntFailed("Tournament has a missing required child: events");
//       render(<TmntContactPage />);

//       expect(
//         screen.getByText(`Tournament with id: ${tmntId} is missing data.`)
//       ).toBeInTheDocument();
//       expect(
//         screen.queryByText(/An error occurred while loading/)
//       ).not.toBeInTheDocument();
//     });

//     it("calls the hook's retry (and does not dispatch) when Retry is clicked", () => {
//       setTmntFailed("boom");
//       render(<TmntContactPage />);

//       fireEvent.click(screen.getByRole("button", { name: "Retry" }));
//       expect(retryMock).toHaveBeenCalledTimes(1);
//       expect(mockDispatch).not.toHaveBeenCalled();
//     });

//     it("does not fetch the director when the tournament failed to load", () => {
//       setTmntFailed("boom");
//       setUserState({ user: blankUser, loadStatus: "idle", requestedUserId: "" });
//       render(<TmntContactPage />);

//       expect(mockDispatch).not.toHaveBeenCalled();
//     });

//     it("shows the contact info, not the error, when a refresh failed but data is still loaded", () => {
//       setHook({ failed: true, error: "boom" });
//       render(<TmntContactPage />);

//       expect(screen.queryByText("Unable to load tournament")).not.toBeInTheDocument();
//       expect(screen.getByTestId("tmnt-header")).toBeInTheDocument();
//     });
//   });

//   describe("fetching the director", () => {
//     it("fetches the director when no user is loaded", () => {
//       setUserState({ user: blankUser, loadStatus: "idle", requestedUserId: "" });
//       render(<TmntContactPage />);

//       expect(mockedFetchUser).toHaveBeenCalledTimes(1);
//       expect(mockedFetchUser).toHaveBeenCalledWith(directorId);
//       expect(mockDispatch).toHaveBeenCalledTimes(1);
//       expect(mockDispatch).toHaveBeenCalledWith(fetchUserAction(directorId));
//     });

//     it("fetches the director when the loaded user is not this tournament's director", () => {
//       setUserState({
//         user: otherUser,
//         loadStatus: "succeeded",
//         requestedUserId: otherUser.id,
//       });
//       render(<TmntContactPage />);

//       expect(mockedFetchUser).toHaveBeenCalledWith(directorId);
//       expect(mockDispatch).toHaveBeenCalledTimes(1);
//     });

//     it("does not fetch when the director is already loaded", () => {
//       render(<TmntContactPage />);

//       expect(mockedFetchUser).not.toHaveBeenCalled();
//       expect(mockDispatch).not.toHaveBeenCalled();
//     });

//     it("does not fetch while a user request is already loading", () => {
//       setUserState({ user: blankUser, loadStatus: "loading" });
//       render(<TmntContactPage />);

//       expect(mockDispatch).not.toHaveBeenCalled();
//     });

//     it("does not fetch again when the request for this director already failed", () => {
//       setUserState({
//         user: blankUser,
//         loadStatus: "failed",
//         requestedUserId: directorId,
//       });
//       render(<TmntContactPage />);

//       expect(mockDispatch).not.toHaveBeenCalled();
//     });

//     it("fetches the director when a previous failure was for a different user", () => {
//       setUserState({
//         user: blankUser,
//         loadStatus: "failed",
//         requestedUserId: otherUserId,
//       });
//       render(<TmntContactPage />);

//       expect(mockedFetchUser).toHaveBeenCalledWith(directorId);
//       expect(mockDispatch).toHaveBeenCalledTimes(1);
//     });

//     it("fetches only once across re-renders while the request has not started loading", () => {
//       setUserState({ user: blankUser, loadStatus: "idle", requestedUserId: "" });
//       const { rerender } = render(<TmntContactPage />);
//       rerender(<TmntContactPage />);
//       rerender(<TmntContactPage />);

//       expect(mockDispatch).toHaveBeenCalledTimes(1);
//     });

//     it("waits for the tournament, then fetches the director once it loads", () => {
//       setTmntLoading();
//       setUserState({ user: blankUser, loadStatus: "idle", requestedUserId: "" });
//       const { rerender } = render(<TmntContactPage />);
//       expect(mockDispatch).not.toHaveBeenCalled();

//       setHook();
//       rerender(<TmntContactPage />);

//       expect(mockDispatch).toHaveBeenCalledTimes(1);
//       expect(mockDispatch).toHaveBeenCalledWith(fetchUserAction(directorId));
//     });

//     it("shows the contact info after the director request succeeds, without fetching again", () => {
//       setUserState({ user: blankUser, loadStatus: "idle", requestedUserId: "" });
//       const { rerender } = render(<TmntContactPage />);
//       expect(mockDispatch).toHaveBeenCalledTimes(1);

//       setUserState({ user: blankUser, loadStatus: "loading", requestedUserId: directorId });
//       rerender(<TmntContactPage />);
//       expect(screen.getByTestId("wait-modal")).toBeInTheDocument();

//       setUserState();
//       rerender(<TmntContactPage />);

//       expect(
//         screen.getByRole("heading", {
//           level: 4,
//           name: "Contact information for Tournament Director Dana Director",
//         })
//       ).toBeInTheDocument();
//       expect(mockDispatch).toHaveBeenCalledTimes(1);
//     });

//     it("fetches the new director when the tournament's director changes", () => {
//       const { rerender } = render(<TmntContactPage />);
//       expect(mockDispatch).not.toHaveBeenCalled();

//       setHook({ data: otherDirectorTmntData() });
//       rerender(<TmntContactPage />);

//       expect(mockDispatch).toHaveBeenCalledTimes(1);
//       expect(mockDispatch).toHaveBeenCalledWith(fetchUserAction(otherDirectorId));
//     });
//   });

//   describe("waiting for the director", () => {
//     it("shows the wait modal while the director is loading", () => {
//       setUserState({ user: blankUser, loadStatus: "loading" });
//       render(<TmntContactPage />);

//       expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading...");
//       expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
//     });

//     it("shows the wait modal, not another user's contact info, while a different user is loaded", () => {
//       setUserState({ user: otherUser, loadStatus: "loading" });
//       render(<TmntContactPage />);

//       expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
//       expect(
//         screen.queryByText(/Contact information for Tournament Director/)
//       ).not.toBeInTheDocument();
//       expect(screen.queryByRole("link")).not.toBeInTheDocument();
//     });
//   });

//   describe("director error state", () => {
//     const setDirectorFailed = (error?: string) => {
//       setUserState({
//         user: blankUser,
//         loadStatus: "failed",
//         requestedUserId: directorId,
//         error,
//       });
//     };

//     it("shows the user error message when the director failed to load", () => {
//       setDirectorFailed("User service unavailable");
//       render(<TmntContactPage />);

//       expect(
//         screen.getByRole("heading", {
//           level: 4,
//           name: "Unable to load tournament director",
//         })
//       ).toBeInTheDocument();
//       expect(screen.getByText("User service unavailable")).toBeInTheDocument();
//       expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
//       expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
//     });

//     it("shows a default message when the user error is undefined", () => {
//       setDirectorFailed(undefined);
//       render(<TmntContactPage />);

//       expect(
//         screen.getByText("An error occurred while loading the tournament director.")
//       ).toBeInTheDocument();
//     });

//     it("shows a default message when the user error is an empty string", () => {
//       setDirectorFailed("");
//       render(<TmntContactPage />);

//       expect(
//         screen.getByText("An error occurred while loading the tournament director.")
//       ).toBeInTheDocument();
//     });

//     it("dispatches fetchUser for the director when Retry is clicked", () => {
//       setDirectorFailed("User service unavailable");
//       render(<TmntContactPage />);
//       expect(mockDispatch).not.toHaveBeenCalled();

//       fireEvent.click(screen.getByRole("button", { name: "Retry" }));

//       expect(mockedFetchUser).toHaveBeenCalledWith(directorId);
//       expect(mockDispatch).toHaveBeenCalledTimes(1);
//       expect(mockDispatch).toHaveBeenCalledWith(fetchUserAction(directorId));
//       expect(retryMock).not.toHaveBeenCalled();
//     });

//     it("does not show the director error when the failure was for a different user", () => {
//       setUserState({
//         user: blankUser,
//         loadStatus: "failed",
//         requestedUserId: otherUserId,
//         error: "some other error",
//       });
//       render(<TmntContactPage />);

//       expect(
//         screen.queryByText("Unable to load tournament director")
//       ).not.toBeInTheDocument();
//       expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
//     });

//     describe("director not found", () => {
//       const setDirectorNotFound = () => {
//         setUserState({
//           user: blankUser,
//           loadStatus: "succeeded",
//           requestedUserId: directorId,
//         });
//       };

//       it("shows a not found message when the request succeeded but returned no director", () => {
//         setDirectorNotFound();
//         render(<TmntContactPage />);

//         expect(
//           screen.getByRole("heading", {
//             level: 4,
//             name: "Unable to load tournament director",
//           })
//         ).toBeInTheDocument();
//         expect(
//           screen.getByText("The tournament director could not be found.")
//         ).toBeInTheDocument();
//         expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
//         expect(screen.queryByTestId("tmnt-header")).not.toBeInTheDocument();
//       });

//       it("makes one automatic request on mount when a previous request found no director", () => {
//         setDirectorNotFound();
//         render(<TmntContactPage />);

//         expect(mockDispatch).toHaveBeenCalledTimes(1);
//         expect(mockDispatch).toHaveBeenCalledWith(fetchUserAction(directorId));
//       });

//       it("does not show not found when the succeeded request was for a different user", () => {
//         setUserState({
//           user: blankUser,
//           loadStatus: "succeeded",
//           requestedUserId: otherUserId,
//         });
//         render(<TmntContactPage />);

//         expect(
//           screen.queryByText("The tournament director could not be found.")
//         ).not.toBeInTheDocument();
//         expect(screen.getByTestId("wait-modal")).toBeInTheDocument();
//       });

//       it("dispatches fetchUser again when Retry is clicked", () => {
//         setDirectorNotFound();
//         render(<TmntContactPage />);

//         // the effect already made the one automatic request on mount
//         mockDispatch.mockClear();
//         fireEvent.click(screen.getByRole("button", { name: "Retry" }));

//         expect(mockDispatch).toHaveBeenCalledTimes(1);
//         expect(mockDispatch).toHaveBeenCalledWith(fetchUserAction(directorId));
//       });
//     });
//   });

//   describe("contact content", () => {
//     it("renders the header with the tournament data and no selected button", () => {
//       render(<TmntContactPage />);

//       expect(screen.getByTestId("tmnt-header")).toHaveTextContent("None");
//       const props = lastHeaderProps();
//       expect(props.tmntFullData).toBe(mockTmntFullData);
//       expect(props.selectedTmntPageBtn).toBe("None");
//     });

//     it("renders the heading with the director's full name", () => {
//       render(<TmntContactPage />);

//       expect(
//         screen.getByRole("heading", {
//           level: 4,
//           name: "Contact information for Tournament Director Dana Director",
//         })
//       ).toBeInTheDocument();
//     });

//     it("renders the director's email as a mailto link", () => {
//       render(<TmntContactPage />);

//       expect(screen.getByText("Email:")).toBeInTheDocument();
//       expect(
//         screen.getByRole("link", { name: directorUser.email })
//       ).toHaveAttribute("href", `mailto:${directorUser.email}`);
//     });

//     it("renders the director's phone number", () => {
//       render(<TmntContactPage />);

//       expect(screen.getByText("Phone:")).toBeInTheDocument();
//       expect(screen.getByText(directorUser.phone)).toBeInTheDocument();
//     });

//     it("does not render the wait modal, an error or a Retry button when everything is loaded", () => {
//       render(<TmntContactPage />);

//       expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
//       expect(screen.queryByText(/Unable to load/)).not.toBeInTheDocument();
//       expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
//     });
//   });
// });

