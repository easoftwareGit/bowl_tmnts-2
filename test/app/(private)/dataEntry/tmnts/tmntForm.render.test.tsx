// test/app/(private)/dataEntry/tmnts/tmntForm.render.test.tsx
// Tests for src/app/(private)/dataEntry/tmntForm/tmntForm.tsx: what the form
// shows when it first opens, for each mode (NEW / EDIT / RUN and stage).
// Typing, saving and cancelling are in tmntForm.interactions.test.tsx;
// the real modals are in tmntForm.modals.test.tsx.
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { SquadStage } from "@prisma/client";
import { cloneDeep } from "lodash";
import tmntFullDataReducer from "@/redux/features/tmntFullData/tmntFullDataSlice";
import bowlsReducer from "@/redux/features/bowls/bowlsSlice";
import TmntDataForm from "@/app/(private)/dataEntry/tmntForm/tmntForm";
import type { bowlType, tmntFormDataType } from "@/lib/types/types";
import { tmntFormParent } from "@/lib/enums/enums";
import {
  mockBowl,
  mockTmntFullData,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { ioStatusType } from "@/redux/statusTypes";

// ---- mocks ----

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      prefetch: jest.fn(),
    };
  },
}));

// The last props each child section received, keyed by section.
// Read only at render time, so it is initialized by then.
const mockChildProps: Record<string, Record<string, unknown>> = {};

// child sections: record their props, render a stub.
// The paths must match the real files, now under (private).
jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNEvents", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockChildProps.events = props;
    return <div>MockEvents</div>;
  },
  validateEvents: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNDivs", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockChildProps.divs = props;
    return <div>MockDivs</div>;
  },
  validateDivs: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNSquads", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockChildProps.squads = props;
    return <div>MockSquads</div>;
  },
  validateSquads: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNLanes", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockChildProps.lanes = props;
    return <div>MockLanes</div>;
  },
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/zeroToNPots", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockChildProps.pots = props;
    return <div>MockPots</div>;
  },
  validatePots: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/zeroToNBrkts", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockChildProps.brkts = props;
    return <div>MockBrkts</div>;
  },
  validateBrkts: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/zeroToNElims", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockChildProps.elims = props;
    return <div>MockElims</div>;
  },
  validateElims: jest.fn(),
}));

// modals: expose show/title/message as attributes
jest.mock("@/components/modal/confirmModal", () => ({
  __esModule: true,
  default: ({ show }: { show: boolean }) => (
    <div data-testid="ModalConfirmMock" data-show={String(!!show)} />
  ),
}));
jest.mock("@/components/modal/errorModal", () => ({
  __esModule: true,
  cannotSaveTitle: "Cannot Save",
  default: ({ show }: { show: boolean }) => (
    <div data-testid="ModalErrorMsgMock" data-show={String(!!show)} />
  ),
}));
jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,
  default: ({ show, message }: { show: boolean; message: string }) => (
    <div data-testid="WaitModalMock" data-show={String(!!show)}>
      {message}
    </div>
  ),
}));

jest.mock("@/lib/db/stages/dbStages", () => ({
  __esModule: true,
  postInitialStageForSquad: jest.fn(),
}));

// react-bootstrap Accordion: Header is a plain <button>, Body always renders
jest.mock("react-bootstrap", () => {
  const actual = jest.requireActual("react-bootstrap");

  const AccordionItemMock = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="AccordionItemMock">{children}</div>
  );

  const AccordionMock = Object.assign(
    ({ children }: { children: React.ReactNode }) => (
      <div data-testid="AccordionMock">{children}</div>
    ),
    {
      Header: ({
        children,
        className,
        "data-testid": testId,
      }: {
        children: React.ReactNode;
        className?: string;
        "data-testid"?: string;
      }) => (
        <button type="button" data-testid={testId} className={className}>
          {children}
        </button>
      ),
      Body: ({
        children,
        className,
        "data-testid": testId,
      }: {
        children: React.ReactNode;
        className?: string;
        "data-testid"?: string;
      }) => (
        <div data-testid={testId} className={className}>
          {children}
        </div>
      ),
    },
  );

  return {
    __esModule: true,
    ...actual,
    Accordion: AccordionMock,
    AccordionItem: AccordionItemMock,
  };
});

// ---- helpers ----

// starts from each slice's real initial state, so new slice fields are present
const makeStore = (
  bowls: bowlType[] = [mockBowl],
  saveStatus: ioStatusType = "idle" as ioStatusType,
) => {
  const initAction = { type: "@@test/init" };
  const tmntFullDataInit = tmntFullDataReducer(undefined, initAction);
  const bowlsInit = bowlsReducer(undefined, initAction);

  return configureStore({
    reducer: {
      tmntFullData: tmntFullDataReducer,
      bowls: bowlsReducer,
    },
    preloadedState: {
      bowls: { ...bowlsInit, bowls },
      tmntFullData: { ...tmntFullDataInit, saveStatus },
    },
  });
};

const tmntProps: tmntFormDataType = {
  tmntFullData: mockTmntFullData,
  stage: SquadStage.DEFINE,
  parentForm: tmntFormParent.NEW,
};

const renderForm = (
  overrides: Partial<tmntFormDataType> = {},
  store = makeStore(),
) =>
  render(
    <Provider store={store}>
      <TmntDataForm tmntProps={{ ...tmntProps, ...overrides }} />
    </Provider>,
  );

const nameInput = () => screen.getByLabelText(/tournament name/i);
const bowlSelect = () => screen.getByTestId("inputBowlName") as HTMLSelectElement;
const startDate = () => screen.getByLabelText(/start date/i);
const endDate = () => screen.getByLabelText(/end date/i);
const queryCantEdit = () =>
  screen.queryByText("Tournament has entries. Cannot be edited.");

const sections = ["events", "divs", "squads", "lanes", "pots", "brkts", "elims"];

beforeEach(() => {
  jest.clearAllMocks();
  for (const key of Object.keys(mockChildProps)) delete mockChildProps[key];
});

// ---- tests ----

describe("tmntDataForm - render", () => {
  describe("modals", () => {
    it("renders all three modals, hidden by default", () => {
      renderForm();

      expect(screen.getByTestId("ModalConfirmMock")).toHaveAttribute("data-show", "false");
      expect(screen.getByTestId("ModalErrorMsgMock")).toHaveAttribute("data-show", "false");
      expect(screen.getByTestId("WaitModalMock")).toHaveAttribute("data-show", "false");
    });

    it("shows the wait modal when the store is already saving", () => {
      renderForm({}, makeStore([mockBowl], "saving" as ioStatusType));

      expect(screen.getByTestId("WaitModalMock")).toHaveAttribute("data-show", "true");
      expect(screen.getByTestId("WaitModalMock")).toHaveTextContent("Saving...");
    });
  });

  describe("tournament info", () => {
    it("fills the inputs from the tournament data", () => {
      renderForm();

      expect(nameInput()).toHaveValue(mockTmntFullData.tmnt.tmnt_name);
      expect(startDate()).toHaveValue(mockTmntFullData.tmnt.start_date_str);
      expect(endDate()).toHaveValue(mockTmntFullData.tmnt.end_date_str);
      expect(bowlSelect()).toHaveValue(mockTmntFullData.tmnt.bowl_id);
    });

    it("starts with no field errors", () => {
      renderForm();

      for (const id of [
        "dangerTmntName",
        "dangerBowlName",
        "dangerStartDate",
        "dangerEndDate",
      ]) {
        expect(screen.getByTestId(id)).toBeEmptyDOMElement();
      }
      expect(nameInput()).not.toHaveClass("is-invalid");
      expect(bowlSelect()).not.toHaveClass("is-invalid");
    });

    it("renders a bowl option for each bowl in the store, after a disabled 'Choose...'", () => {
      const bowls: bowlType[] = [
        mockBowl,
        {
          ...mockBowl,
          id: "bwl_2",
          bowl_name: "Second Bowl",
          city: "Austin",
          state: "TX",
        },
      ];
      renderForm({}, makeStore(bowls));

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent("Choose...");
      expect(options[0]).toBeDisabled();
      expect(
        screen.getByRole("option", {
          name: `${mockBowl.bowl_name} - ${mockBowl.city}, ${mockBowl.state}`,
        }),
      ).toHaveValue(mockBowl.id);
      expect(
        screen.getByRole("option", { name: "Second Bowl - Austin, TX" }),
      ).toHaveValue("bwl_2");
    });

    it("shows 'Choose...' when the tournament has no bowl yet", () => {
      const data = cloneDeep(mockTmntFullData);
      data.tmnt.bowl_id = "";
      renderForm({ tmntFullData: data });

      expect(bowlSelect()).toHaveValue("Choose...");
    });

    it("renders only 'Choose...' when the store has no bowls", () => {
      renderForm({}, makeStore([]));

      expect(screen.getAllByRole("option")).toHaveLength(1);
    });
  });

  describe("sections", () => {
    it("renders accordion headers with counts from the tournament data", () => {
      renderForm();

      expect(screen.getByTestId("eventsAcdnHeader")).toHaveTextContent(
        `Events - ${mockTmntFullData.events.length}`,
      );
      expect(screen.getByTestId("divsAcdnHeader")).toHaveTextContent(
        `Divisions - ${mockTmntFullData.divs.length}`,
      );
      expect(screen.getByTestId("squadsAcdnHeader")).toHaveTextContent(
        `Squads - ${mockTmntFullData.squads.length}`,
      );
      expect(screen.getByTestId("potsAcdnHeader")).toHaveTextContent(
        `Pots - ${mockTmntFullData.pots.length}`,
      );
      expect(screen.getByTestId("brktsAcdnHeader")).toHaveTextContent(
        `Brackets - ${mockTmntFullData.brkts.length}`,
      );
      expect(screen.getByTestId("elimsAcdnHeader")).toHaveTextContent(
        `Eliminators - ${mockTmntFullData.elims.length}`,
      );
      expect(
        screen.getByText(
          `Lanes - ${mockTmntFullData.squads.map((s) => s.lane_count).join(", ")}`,
        ),
      ).toBeInTheDocument();
    });

    it("renders every child section", () => {
      renderForm();

      for (const text of [
        "MockEvents",
        "MockDivs",
        "MockSquads",
        "MockLanes",
        "MockPots",
        "MockBrkts",
        "MockElims",
      ]) {
        expect(screen.getByText(text)).toBeInTheDocument();
      }
    });

    it("passes the tournament data to the child sections", () => {
      renderForm();

      expect(mockChildProps.events.events).toEqual(mockTmntFullData.events);
      expect(mockChildProps.divs.divs).toEqual(mockTmntFullData.divs);
      expect(mockChildProps.squads.squads).toEqual(mockTmntFullData.squads);
      expect(mockChildProps.lanes.lanes).toEqual(mockTmntFullData.lanes);
      expect(mockChildProps.pots.pots).toEqual(mockTmntFullData.pots);
      expect(mockChildProps.brkts.brkts).toEqual(mockTmntFullData.brkts);
      expect(mockChildProps.elims.elims).toEqual(mockTmntFullData.elims);
    });
  });

  // Every combination of parent form and stage the form handles.
  //   editable: inputs, Save and the child sections are enabled
  //   buttons:  Save and Cancel are shown
  //   warning:  "Tournament has entries. Cannot be edited." is shown
  describe.each([
    // label,                    parentForm,          stage,              editable, buttons, warning
    ["NEW, stage DEFINE",       tmntFormParent.NEW,  SquadStage.DEFINE,  true,  true,  false],
    ["NEW, stage ENTRIES",      tmntFormParent.NEW,  SquadStage.ENTRIES, false, true,  false],
    ["EDIT, stage DEFINE",      tmntFormParent.EDIT, SquadStage.DEFINE,  true,  true,  false],
    ["EDIT, stage ENTRIES",     tmntFormParent.EDIT, SquadStage.ENTRIES, false, true,  true],
    ["RUN, stage DEFINE",       tmntFormParent.RUN,  SquadStage.DEFINE,  false, false, false],
    ["RUN, stage ENTRIES",      tmntFormParent.RUN,  SquadStage.ENTRIES, false, false, false],
  ])("mode: %s", (_label, parentForm, stage, editable, buttons, warning) => {
    const renderMode = () => renderForm({ parentForm, stage });
    const inputs = () => [nameInput(), bowlSelect(), startDate(), endDate()];

    // the `if`s below choose WHICH tests exist for this mode;
    // no test has an `if` around its expects

    if (editable) {
      it("inputs are enabled", () => {
        renderMode();
        for (const input of inputs()) expect(input).toBeEnabled();
      });
    } else {
      it("inputs are disabled", () => {
        renderMode();
        for (const input of inputs()) expect(input).toBeDisabled();
      });
    }

    it(`passes isDisabled = ${!editable} to every child section`, () => {
      renderMode();
      for (const section of sections) {
        expect(mockChildProps[section].isDisabled).toBe(!editable);
      }
    });

    if (buttons && editable) {
      it("shows Save (enabled) and Cancel (enabled)", () => {
        renderMode();
        expect(screen.getByRole("button", { name: /save tournament/i })).toBeEnabled();
        expect(screen.getByRole("button", { name: /^cancel$/i })).toBeEnabled();
      });
    } else if (buttons) {
      it("shows Save (disabled) and Cancel (enabled, so the user can leave)", () => {
        renderMode();
        expect(screen.getByRole("button", { name: /save tournament/i })).toBeDisabled();
        expect(screen.getByRole("button", { name: /^cancel$/i })).toBeEnabled();
      });
    } else {
      it("does not show Save or Cancel", () => {
        renderMode();
        expect(
          screen.queryByRole("button", { name: /save tournament/i }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: /^cancel$/i }),
        ).not.toBeInTheDocument();
      });
    }

    if (warning) {
      it("shows the 'cannot be edited' warning", () => {
        renderMode();
        expect(queryCantEdit()).toBeInTheDocument();
      });
    } else {
      it("does not show the 'cannot be edited' warning", () => {
        renderMode();
        expect(queryCantEdit()).not.toBeInTheDocument();
      });
    }
  });
});
