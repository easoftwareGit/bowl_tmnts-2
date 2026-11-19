// test/app/(private)/dataEntry/runTmnt/runTmnt.test.tsx
// Tests for src/app/(private)/dataEntry/runTmnt/[tmntId]/page.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { SquadStage } from "@prisma/client";
import { cloneDeep } from "lodash";
import tmntFullDataReducer, {
  fetchTmntFullData,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import RunTmntPage from "@/app/(private)/dataEntry/runTmnt/[tmntId]/page";
import { getSquadStage } from "@/app/(private)/dataEntry/tmntForm/tmntTools";
import { tmntFormParent } from "@/lib/enums/enums";
import type { tmntFormDataType, tmntFullType } from "@/lib/types/types";
import type { ioStatusType } from "@/redux/statusTypes";
import { mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// ---- mocks ----

const mockUseParams = jest.fn();
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useParams: () => mockUseParams(),
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// keep the real reducer and selectors; replace the fetch thunk with one
// that does nothing, so each test sets the store state itself
jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => ({
  __esModule: true,
  ...jest.requireActual("@/redux/features/tmntFullData/tmntFullDataSlice"),
  fetchTmntFullData: jest.fn(() => () => undefined),
}));
const mockFetch = fetchTmntFullData as unknown as jest.Mock;

jest.mock("@/app/(private)/dataEntry/tmntForm/tmntTools", () => ({
  __esModule: true,
  ...jest.requireActual("@/app/(private)/dataEntry/tmntForm/tmntTools"),
  getSquadStage: jest.fn(),
}));
const mockGetSquadStage = getSquadStage as jest.Mock;

// the form has its own tests; record the props it gets
const mockFormProps: { last?: { tmntProps: tmntFormDataType } } = {};
jest.mock("@/app/(private)/dataEntry/tmntForm/tmntForm", () => ({
  __esModule: true,
  default: (props: { tmntProps: tmntFormDataType }) => {
    mockFormProps.last = props;
    return <div data-testid="TmntDataFormMock" />;
  },
}));

jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,
  default: ({ show, message }: { show: boolean; message: string }) => (
    <div data-testid="WaitModalMock" data-show={String(!!show)}>
      {message}
    </div>
  ),
}));

jest.mock("@/components/modal/errorModal", () => ({
  __esModule: true,
  default: ({
    show,
    title,
    message,
    onCancel,
  }: {
    show: boolean;
    title: string;
    message: string;
    onCancel: () => void;
  }) =>
    show ? (
      <div role="dialog" aria-label={title}>
        <div>{message}</div>
        <button type="button" onClick={onCancel}>
          OK
        </button>
      </div>
    ) : null,
}));

// the option menus have their own tests; expose their props and onClose
type OptionsProps = { show: boolean; stage: SquadStage; onClose: () => void };
const mockOptionsProps: { prize?: OptionsProps & { fullTmntData: tmntFullType }; reports?: OptionsProps & { tmntId: string } } = {};
jest.mock("@/components/prizeFunds/prizeFundOptions", () => ({
  __esModule: true,
  default: (props: OptionsProps & { fullTmntData: tmntFullType }) => {
    mockOptionsProps.prize = props;
    return props.show ? (
      <button type="button" onClick={props.onClose}>
        Close prize funds
      </button>
    ) : null;
  },
}));
jest.mock("@/components/reports/reportOptions", () => ({
  __esModule: true,
  default: (props: OptionsProps & { tmntId: string }) => {
    mockOptionsProps.reports = props;
    return props.show ? (
      <button type="button" onClick={props.onClose}>
        Close reports
      </button>
    ) : null;
  },
}));

// ---- helpers ----

const tmntId = mockTmntFullData.tmnt.id;
const firstSquadId = mockTmntFullData.squads[0].id;

// starts from the slice's real initial state, so new slice fields are present
const makeStore = (
  loadStatus: ioStatusType,
  tmntFullData: tmntFullType = mockTmntFullData,
  error = "",
) => {
  const init = tmntFullDataReducer(undefined, { type: "@@test/init" });
  return configureStore({
    reducer: { tmntFullData: tmntFullDataReducer },
    preloadedState: {
      tmntFullData: { ...init, tmntFullData, loadStatus, error },
    },
  });
};

const renderPage = (store = makeStore("succeeded" as ioStatusType)) => {
  const user = userEvent.setup();
  render(
    <Provider store={store}>
      <RunTmntPage />
    </Provider>,
  );
  return { user };
};

// renders a loaded tournament and waits until the page content is shown
const renderLoaded = async (stage: SquadStage = SquadStage.DEFINE) => {
  mockGetSquadStage.mockResolvedValue(stage);
  const { user } = renderPage();
  await screen.findByRole("heading", { level: 2, name: /^run tournament$/i });
  return { user };
};

const waitModal = () => screen.getByTestId("WaitModalMock");
const queryHeading = () =>
  screen.queryByRole("heading", { level: 2, name: /^run tournament$/i });

beforeEach(() => {
  jest.clearAllMocks();
  delete mockFormProps.last;
  delete mockOptionsProps.prize;
  delete mockOptionsProps.reports;
  mockUseParams.mockReturnValue({ tmntId });
  mockGetSquadStage.mockResolvedValue(SquadStage.DEFINE);
});

// ---- tests ----

describe("RunTmntPage", () => {
  describe("fetching", () => {
    it("fetches the tournament from the URL id on mount", () => {
      renderPage();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(tmntId);
    });

    it("does not fetch when the URL has no tournament id", () => {
      mockUseParams.mockReturnValue({});
      renderPage();

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("loading and errors", () => {
    it("shows the wait modal and no page content while loading", () => {
      renderPage(makeStore("loading" as ioStatusType));

      expect(waitModal()).toHaveAttribute("data-show", "true");
      expect(waitModal()).toHaveTextContent("Loading...");
      expect(queryHeading()).not.toBeInTheDocument();
      expect(mockGetSquadStage).not.toHaveBeenCalled();
    });

    it("keeps the wait modal up until the stage is read", async () => {
      let finishStage: (s: SquadStage) => void = () => {};
      mockGetSquadStage.mockReturnValue(
        new Promise((res) => {
          finishStage = res;
        }),
      );
      renderPage();

      expect(waitModal()).toHaveAttribute("data-show", "true");
      expect(queryHeading()).not.toBeInTheDocument();

      finishStage(SquadStage.DEFINE);

      expect(
        await screen.findByRole("heading", { name: /^run tournament$/i }),
      ).toBeInTheDocument();
      expect(waitModal()).toHaveAttribute("data-show", "false");
    });

    it("shows the error, with no wait modal, when loading fails", () => {
      renderPage(
        makeStore("failed" as ioStatusType, mockTmntFullData, "Tournament not found"),
      );

      expect(screen.getByRole("alert")).toHaveTextContent("Tournament not found");
      expect(waitModal()).toHaveAttribute("data-show", "false");
      expect(queryHeading()).not.toBeInTheDocument();
    });

    it("shows a generic error when loading fails without a message", () => {
      renderPage(makeStore("failed" as ioStatusType));

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Could not load the tournament.",
      );
    });

    it("shows a stage error, and hides the wait modal, when the stage can't be read", async () => {
      mockGetSquadStage.mockRejectedValue(new Error("db down"));
      renderPage();

      expect(await screen.findByText("Stage error: db down")).toBeInTheDocument();
      expect(waitModal()).toHaveAttribute("data-show", "false");
      expect(mockFormProps.last?.tmntProps.stage).toBe(SquadStage.ERROR);
    });

    it("shows 'Tournament has no squad' without reading a stage", async () => {
      const noSquads = cloneDeep(mockTmntFullData);
      noSquads.squads = [];
      renderPage(makeStore("succeeded" as ioStatusType, noSquads));

      expect(
        await screen.findByText("Stage error: Tournament has no squad"),
      ).toBeInTheDocument();
      expect(mockGetSquadStage).not.toHaveBeenCalled();
      expect(waitModal()).toHaveAttribute("data-show", "false");
    });

    // the store keeps the last tournament loaded; opening a different one
    // must not show the old one while the new one loads
    it("shows nothing from a different tournament left in the store", () => {
      const otherTmnt = cloneDeep(mockTmntFullData);
      otherTmnt.tmnt.id = "tmt_00000000000000000000000000000000";
      renderPage(makeStore("succeeded" as ioStatusType, otherTmnt));

      expect(queryHeading()).not.toBeInTheDocument();
      expect(screen.queryByTestId("TmntDataFormMock")).not.toBeInTheDocument();
      expect(mockGetSquadStage).not.toHaveBeenCalled();
    });
  });

  describe("when loaded", () => {
    it("reads the stage of the first squad", async () => {
      await renderLoaded();

      expect(mockGetSquadStage).toHaveBeenCalledWith(firstSquadId);
    });

    it("passes the tournament, its stage and RUN to the form", async () => {
      await renderLoaded(SquadStage.ENTRIES);

      expect(mockFormProps.last?.tmntProps).toEqual({
        tmntFullData: mockTmntFullData,
        stage: SquadStage.ENTRIES,
        parentForm: tmntFormParent.RUN,
      });
    });

    it("renders the Back to list link and the action buttons", async () => {
      await renderLoaded();

      expect(screen.getByRole("link", { name: /back to list/i })).toHaveAttribute(
        "href",
        "/user/tmnts",
      );
      for (const name of [/^edit bowlers$/i, /^enter scores$/i, /^prize funds$/i, /^reports$/i]) {
        expect(screen.getByRole("button", { name })).toBeEnabled();
      }
      expect(screen.getByRole("button", { name: /^finalize$/i })).toBeDisabled();
    });

    it("passes the stage to the prize fund and report menus", async () => {
      await renderLoaded(SquadStage.SCORES);

      expect(mockOptionsProps.prize?.stage).toBe(SquadStage.SCORES);
      expect(mockOptionsProps.prize?.fullTmntData).toEqual(mockTmntFullData);
      expect(mockOptionsProps.reports?.stage).toBe(SquadStage.SCORES);
      expect(mockOptionsProps.reports?.tmntId).toBe(tmntId);
    });
  });

  describe("Edit Bowlers", () => {
    it.each([SquadStage.DEFINE, SquadStage.ENTRIES, SquadStage.SCORES])(
      "goes to the edit players page (stage %s)",
      async (stage) => {
        const { user } = await renderLoaded(stage);

        await user.click(screen.getByRole("button", { name: /^edit bowlers$/i }));

        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith(`/dataEntry/editPlayers/${tmntId}`);
      },
    );
  });

  describe("Enter Scores", () => {
    it("goes to the scores page for the first squad when the stage is SCORES", async () => {
      const { user } = await renderLoaded(SquadStage.SCORES);

      await user.click(screen.getByRole("button", { name: /^enter scores$/i }));

      expect(mockPush).toHaveBeenCalledWith(`/dataEntry/scores/${firstSquadId}`);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it.each([SquadStage.DEFINE, SquadStage.ENTRIES, SquadStage.ERROR])(
      "shows an error and stays when the stage is %s",
      async (stage) => {
        const { user } = await renderLoaded(stage);

        await user.click(screen.getByRole("button", { name: /^enter scores$/i }));

        expect(
          screen.getByRole("dialog", { name: "Enter Scores Error" }),
        ).toHaveTextContent(/cannot enter scores until stage is validated/i);
        expect(mockPush).not.toHaveBeenCalled();
      },
    );

    it("closes the error when OK is clicked", async () => {
      const { user } = await renderLoaded(SquadStage.ENTRIES);

      await user.click(screen.getByRole("button", { name: /^enter scores$/i }));
      await user.click(screen.getByRole("button", { name: /^ok$/i }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("option menus", () => {
    it("opens and closes the prize fund menu", async () => {
      const { user } = await renderLoaded();
      expect(mockOptionsProps.prize?.show).toBe(false);

      await user.click(screen.getByRole("button", { name: /^prize funds$/i }));
      expect(mockOptionsProps.prize?.show).toBe(true);

      await user.click(screen.getByRole("button", { name: "Close prize funds" }));
      expect(mockOptionsProps.prize?.show).toBe(false);
    });

    it("opens and closes the reports menu", async () => {
      const { user } = await renderLoaded();
      expect(mockOptionsProps.reports?.show).toBe(false);

      await user.click(screen.getByRole("button", { name: /^reports$/i }));
      expect(mockOptionsProps.reports?.show).toBe(true);

      await user.click(screen.getByRole("button", { name: "Close reports" }));
      expect(mockOptionsProps.reports?.show).toBe(false);
    });
  });
});

// "use client";
// import React, { useEffect, useMemo, useState } from "react";
// import TmntDataForm from "@/app/(private)/dataEntry/tmntForm/tmntForm";
// import { useParams, useRouter } from "next/navigation";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch } from "@/redux/store";
// import type { tmntFormDataType } from "@/lib/types/types";
// import { tmntFormParent } from "@/lib/enums/enums";
// import Link from "next/link";
// import WaitModal from "@/components/modal/waitModal";
// import ErrorModalMsg from "@/components/modal/errorModal";
// import { initModalObj } from "@/components/modal/modalObjType";
// import {
//   fetchTmntFullData,
//   getTmntFullDataError,
//   getTmntFullDataLoadStatus,
//   selectTmntFullData,
// } from "@/redux/features/tmntFullData/tmntFullDataSlice";
// import { getSquadStage } from "@/app/(private)/dataEntry/tmntForm/tmntTools";
// import { SquadStage } from "@prisma/client";
// import PrizeFundOptions from "@/components/prizeFunds/prizeFundOptions";
// import ReportOptions from "@/components/reports/reportOptions";

// // http://localhost:3000/dataEntry/runTmnt/tmt_d237a388a8fc4641a2e37233f1d6bebd

// const RunTmntPage = () => {
//   const params = useParams();
//   const router = useRouter();
//   const tmntId = params.tmntId as string;

//   const dispatch = useDispatch<AppDispatch>();

//   const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
//   const tmntError = useSelector(getTmntFullDataError);
//   const stateTmntFullData = useSelector(selectTmntFullData);

//   // the store keeps the last tournament loaded; only use it if it's this one
//   const isLoaded =
//     tmntLoadStatus === "succeeded" && stateTmntFullData.tmnt.id === tmntId;

//   const [stage, setStage] = useState<SquadStage | null>(null);
//   const [stageError, setStageError] = useState<string | null>(null);
//   const [errModalObj, setErrModalObj] = useState(initModalObj);
//   const [showPrizeFundOptions, setShowPrizeFundOptions] = useState(false);
//   const [showReportOptions, setShowReportOptions] = useState(false);

//   useEffect(() => {
//     if (!tmntId) return;
//     dispatch(fetchTmntFullData(tmntId));
//   }, [tmntId, dispatch]);

//   // NOTE: Squad stage is intentionally *not* stored in Redux.
//   // always read it directly from the DB via getSquadStage to avoid stale stage
//   // values when other processes update the stage.
//   useEffect(() => {
//     if (!isLoaded) {
//       setStage(null);
//       setStageError(null);
//       return;
//     }

//     const firstSquadId = stateTmntFullData.squads[0]?.id;
//     if (!firstSquadId) {
//       setStageError("Tournament has no squad");
//       setStage(SquadStage.ERROR);
//       return;
//     }

//     // cleanup required when async may outlive the component
//     let cancelled = false;

//     (async () => {
//       try {
//         const s = await getSquadStage(firstSquadId);
//         if (!cancelled) {
//           setStage(s);
//           setStageError(null);
//         }
//       } catch (err) {
//         if (!cancelled) {
//           setStage(SquadStage.ERROR);
//           setStageError(
//             err instanceof Error ? err.message : "Failed to load squad stage"
//           );
//         }
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [isLoaded, stateTmntFullData]);

//   // null until the tournament and its stage are both loaded
//   const tmntFormData = useMemo<tmntFormDataType | null>(() => {
//     if (!isLoaded || stage === null) return null;
//     return {
//       tmntFullData: stateTmntFullData,
//       stage,
//       parentForm: tmntFormParent.RUN,
//     };
//   }, [isLoaded, stage, stateTmntFullData]);

//   const showLoading =
//     tmntLoadStatus === "loading" || (isLoaded && stage === null);
//   const showError = tmntLoadStatus === "failed";

//   const canceledModalErr = () => {
//     setErrModalObj(initModalObj); // reset modal object (hides modal)
//   };

//   const handleEditBowlersClick = () => {
//     router.push(`/dataEntry/editPlayers/${tmntId}`);
//   };

//   const handleEnterScoresClick = () => {
//     const squadId = stateTmntFullData.squads[0]?.id; // only 1 squad at this point
//     if (!squadId || stage !== SquadStage.SCORES) {
//       setErrModalObj({
//         show: true,
//         title: "Enter Scores Error",
//         message:
//           'Cannot enter scores until stage is Validated. Click the "Validate and Save" button when editing bowlers.',
//         id: squadId ?? initModalObj.id,
//       });
//       return;
//     }
//     router.push(`/dataEntry/scores/${squadId}`);
//   };

//   return (
//     <>
//       <WaitModal show={showLoading} message="Loading..." />
//       <ErrorModalMsg
//         show={errModalObj.show}
//         title={errModalObj.title}
//         message={errModalObj.message}
//         onCancel={canceledModalErr}
//       />
//       {showError && (
//         <div className="alert alert-danger" role="alert">
//           Could not load the tournament.{tmntError ? ` ${tmntError}` : ""}
//         </div>
//       )}
//       {tmntFormData && stage !== null && (
//         <div className="d-flex flex-column justify-content-center align-items-center">
//           <div className="shadow p-3 m-3 rounded-3 container">
//             {stageError && (
//               <div className="text-danger mb-2">
//                 Stage error: {stageError}
//               </div>
//             )}
//             <div className="row g-3">
//               <div className="col-6">
//                 <h2 className="mb-3">Run Tournament</h2>
//               </div>
//               <div className="col-4">
//                 <Link className="btn btn-primary" href="/user/tmnts">
//                   Back to list
//                 </Link>
//               </div>
//             </div>
//             <div className="row g-3 mb-2">
//               <div className="col-2">
//                 <button
//                   type="button"
//                   className="btn btn-primary"
//                   onClick={handleEditBowlersClick}
//                 >
//                   Edit Bowlers
//                 </button>
//               </div>
//               <div className="col-2">
//                 <button
//                   type="button"
//                   className="btn btn-primary"
//                   onClick={handleEnterScoresClick}
//                 >
//                   Enter Scores
//                 </button>
//               </div>
//               <div className="col-2 d-grid gap-2">
//                 <div className="position-relative">
//                   <button
//                     type="button"
//                     className="btn btn-success h-100 w-100"
//                     onClick={() => setShowPrizeFundOptions(true)}
//                   >
//                     Prize Funds
//                   </button>
//                   <PrizeFundOptions
//                     show={showPrizeFundOptions}
//                     fullTmntData={stateTmntFullData}
//                     onClose={() => setShowPrizeFundOptions(false)}
//                     stage={stage}
//                   />
//                 </div>
//               </div>
//               <div className="col-2 d-grid gap-2">
//                 <div className="position-relative">
//                   <button
//                     type="button"
//                     className="btn btn-info h-100 w-100"
//                     onClick={() => setShowReportOptions(true)}
//                   >
//                     Reports
//                   </button>
//                   <ReportOptions
//                     show={showReportOptions}
//                     tmntId={tmntId}
//                     onClose={() => setShowReportOptions(false)}
//                     stage={stage}
//                   />
//                 </div>
//               </div>
//               <div className="col-2 d-grid gap-2">
//                 {/* not built yet */}
//                 <button
//                   type="button"
//                   className="btn btn-block btn-dark"
//                   disabled
//                   title="Coming soon"
//                 >
//                   Finalize
//                 </button>
//               </div>
//             </div>
//             {/* RUN mode: the form is read only, so no markPendingChanges */}
//             <TmntDataForm tmntProps={tmntFormData} />
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default RunTmntPage;

