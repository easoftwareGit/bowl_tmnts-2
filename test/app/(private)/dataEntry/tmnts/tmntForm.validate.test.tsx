// test/app/(private)/dataEntry/tmnts/tmntForm.validate.test.tsx
// Tests for src/app/(private)/dataEntry/tmntForm/tmntForm.tsx: how a failing
// section validator shows its error in that section's accordion header.
//
// The rest of validation (required fields, date order, a failing section
// blocking the save, every section being validated) is tested in
// tmntForm.interactions.test.tsx.
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import { SquadStage } from "@prisma/client";
import tmntFullDataReducer, {
  saveTmntFullData,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import bowlsReducer from "@/redux/features/bowls/bowlsSlice";
import TmntDataForm from "@/app/(private)/dataEntry/tmntForm/tmntForm";
import { acdnErrClassName } from "@/app/(private)/dataEntry/tmntForm/errors";
import type { tmntFormDataType } from "@/lib/types/types";
import { tmntFormParent } from "@/lib/enums/enums";
import { validateEvents } from "@/app/(private)/dataEntry/tmntForm/oneToNEvents";
import { validateDivs } from "@/app/(private)/dataEntry/tmntForm/oneToNDivs";
import { validateSquads } from "@/app/(private)/dataEntry/tmntForm/oneToNSquads";
import { validatePots } from "@/app/(private)/dataEntry/tmntForm/zeroToNPots";
import { validateBrkts } from "@/app/(private)/dataEntry/tmntForm/zeroToNBrkts";
import { validateElims } from "@/app/(private)/dataEntry/tmntForm/zeroToNElims";
import {
  mockBowl,
  mockTmntFullData,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// ---- mocks ----

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// child sections: stubs; their validators are set per test.
// The paths must match the real files, now under (private).
jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNEvents", () => ({
  __esModule: true,
  default: () => <div>MockEvents</div>,
  validateEvents: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNDivs", () => ({
  __esModule: true,
  default: () => <div>MockDivs</div>,
  validateDivs: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNSquads", () => ({
  __esModule: true,
  default: () => <div>MockSquads</div>,
  validateSquads: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNLanes", () => ({
  __esModule: true,
  default: () => <div>MockLanes</div>,
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/zeroToNPots", () => ({
  __esModule: true,
  default: () => <div>MockPots</div>,
  validatePots: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/zeroToNBrkts", () => ({
  __esModule: true,
  default: () => <div>MockBrkts</div>,
  validateBrkts: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/zeroToNElims", () => ({
  __esModule: true,
  default: () => <div>MockElims</div>,
  validateElims: jest.fn(),
}));

// modals are not part of these tests
jest.mock("@/components/modal/confirmModal", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("@/components/modal/errorModal", () => ({
  __esModule: true,
  cannotSaveTitle: "Cannot Save",
  default: () => null,
}));
jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,
  default: () => null,
}));

// redux: keep the real reducer, replace the save thunk
jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => ({
  __esModule: true,
  ...jest.requireActual("@/redux/features/tmntFullData/tmntFullDataSlice"),
  saveTmntFullData: jest.fn(),
}));
const mockSave = saveTmntFullData as unknown as jest.Mock;

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
const makeStore = () => {
  const initAction = { type: "@@test/init" };
  const tmntFullDataInit = tmntFullDataReducer(undefined, initAction);
  const bowlsInit = bowlsReducer(undefined, initAction);

  return configureStore({
    reducer: {
      tmntFullData: tmntFullDataReducer,
      bowls: bowlsReducer,
    },
    preloadedState: {
      bowls: { ...bowlsInit, bowls: [mockBowl] },
      tmntFullData: tmntFullDataInit,
    },
  });
};

const tmntProps: tmntFormDataType = {
  tmntFullData: mockTmntFullData,
  stage: SquadStage.DEFINE,
  parentForm: tmntFormParent.NEW,
};

const renderForm = () => {
  const user = userEvent.setup();
  render(
    <Provider store={makeStore()}>
      <TmntDataForm tmntProps={tmntProps} markPendingChanges={jest.fn()} />
    </Provider>,
  );
  return { user };
};

// handleSave only runs when the Save button itself has focus
const clickSave = async (user: ReturnType<typeof userEvent.setup>) => {
  const saveBtn = screen.getByRole("button", { name: /save tournament/i });
  saveBtn.focus();
  await user.click(saveBtn);
};

// One row per section. setAcdnErrArg is where the form passes that
// section's accordion-error setter in the validator's arguments:
//   validateEvents(events, setEvents, setAcdnErr)
//   validateDivs(divs, setDivs, setAcdnErr)
//   validateSquads(squads, setSquads, events, setAcdnErr, minDate, maxDate)
//   validatePots(pots, setPots, divs, setAcdnErr)
//   validateBrkts(brkts, setBrkts, divs, maxStartGame, setAcdnErr)
//   validateElims(elims, setElims, divs, squadGames, setAcdnErr)
type SectionRow = {
  name: string;
  validator: jest.Mock;
  setAcdnErrArg: number;
  headerTestId: string;
  headerLabel: RegExp;
  message: string;
};

const sections: SectionRow[] = [
  {
    name: "Events",
    validator: validateEvents as jest.Mock,
    setAcdnErrArg: 2,
    headerTestId: "eventsAcdnHeader",
    headerLabel: /events -/i,
    message: " - Entry Fee cannot be more than $999,999.00",
  },
  {
    name: "Divisions",
    validator: validateDivs as jest.Mock,
    setAcdnErrArg: 2,
    headerTestId: "divsAcdnHeader",
    headerLabel: /divisions -/i,
    message: " - Hdcp % cannot be more than 125%",
  },
  {
    name: "Squads",
    validator: validateSquads as jest.Mock,
    setAcdnErrArg: 3,
    headerTestId: "squadsAcdnHeader",
    headerLabel: /squads -/i,
    message: " - Squad Games cannot be more than 6",
  },
  {
    name: "Pots",
    validator: validatePots as jest.Mock,
    setAcdnErrArg: 3,
    headerTestId: "potsAcdnHeader",
    headerLabel: /pots -/i,
    message: " - Pot Scratch: Fee cannot be less than $1.00",
  },
  {
    name: "Brackets",
    validator: validateBrkts as jest.Mock,
    setAcdnErrArg: 4,
    headerTestId: "brktsAcdnHeader",
    headerLabel: /brackets -/i,
    message: " - Bracket Fee cannot be less than $1.00",
  },
  {
    name: "Eliminators",
    validator: validateElims as jest.Mock,
    setAcdnErrArg: 4,
    headerTestId: "elimsAcdnHeader",
    headerLabel: /eliminators -/i,
    message: " - Eliminator Fee cannot be less than $1.00",
  },
];

// makes a section's validator fail and set its accordion error, the way
// the real validators do
const failWithAcdnErr = (row: SectionRow) => {
  row.validator.mockImplementation((...args: unknown[]) => {
    const setAcdnErr = args[row.setAcdnErrArg] as (err: {
      errClassName: string;
      message: string;
    }) => void;
    setAcdnErr({ errClassName: acdnErrClassName, message: row.message });
    return false;
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  // every section passes unless a test says otherwise
  for (const row of sections) row.validator.mockReturnValue(true);
});

// ---- tests ----

describe("TmntDataForm - validate (accordion header errors)", () => {
  it("shows no header errors before Save is clicked", () => {
    renderForm();

    for (const row of sections) {
      expect(screen.getByTestId(row.headerTestId)).not.toHaveClass(
        acdnErrClassName,
      );
    }
  });

  describe.each(sections)("when $name fails", (row) => {
    it("shows the error message and class in its header", async () => {
      failWithAcdnErr(row);
      const { user } = renderForm();

      await clickSave(user);

      const header = await screen.findByTestId(row.headerTestId);
      expect(header).toHaveTextContent(row.headerLabel);
      expect(header).toHaveTextContent(row.message.trim());
      expect(header).toHaveClass(acdnErrClassName);
    });

    it("leaves the other section headers without errors", async () => {
      failWithAcdnErr(row);
      const { user } = renderForm();

      await clickSave(user);
      await screen.findByText(row.message.trim(), { exact: false });

      for (const other of sections.filter((s) => s !== row)) {
        expect(screen.getByTestId(other.headerTestId)).not.toHaveClass(
          acdnErrClassName,
        );
      }
    });

    it("does not save", async () => {
      failWithAcdnErr(row);
      const { user } = renderForm();

      await clickSave(user);
      await screen.findByText(row.message.trim(), { exact: false });

      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  // every section is validated, so the user sees all the problems at once
  it("shows errors in every failing header at the same time", async () => {
    const [events, , , pots, , elims] = sections;
    failWithAcdnErr(events);
    failWithAcdnErr(pots);
    failWithAcdnErr(elims);
    const { user } = renderForm();

    await clickSave(user);

    for (const row of [events, pots, elims]) {
      const header = await screen.findByTestId(row.headerTestId);
      expect(header).toHaveClass(acdnErrClassName);
      expect(header).toHaveTextContent(row.message.trim());
    }
    expect(screen.getByTestId("divsAcdnHeader")).not.toHaveClass(acdnErrClassName);
    expect(mockSave).not.toHaveBeenCalled();
  });
});
