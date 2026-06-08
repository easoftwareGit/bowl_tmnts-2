import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/syncfusion-license", () => ({}));

jest.mock("react-redux");
jest.mock("next/navigation");

import ScoresEntryForm from "@/app/dataEntry/scoresForm/scoresForm";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

const mockUseDispatch = jest.mocked(useDispatch);
const mockUseSelector = jest.mocked(useSelector);
const mockUseRouter = jest.mocked(useRouter);

const mockDispatch = jest.fn();

let capturedGridProps: any;

const mockCreateScoreColumns = jest.fn(() => []);

let mockLoadStatus = "idle";
let mockSaveStatus = "idle";

jest.mock(
  "@/app/dataEntry/scoresForm/sfCreateScoreColumns",
  () => ({
    createScoreColumns: () => mockCreateScoreColumns(),
    scoreEntryIdColName: "id",
    scoreEntryPlusMinusColName: "plusMinus",
    scoreEntryTotalColName: "total",
  }),
);

jest.mock(
  "@/redux/features/gamesForSquad/gamesForSquadSlice",
  () => ({
    getGamesForSquadLoadStatus: () => mockLoadStatus,
    getGamesForSquadSaveStatus: () => mockSaveStatus,
    updateGamesForSquad: jest.fn(),
  }),
);

jest.mock(
  "@/components/modal/waitModal",
  () => ({
    __esModule: true,
    default: ({ show, message }: any) =>
      show ? <div>{message}</div> : null,
  }),
);

jest.mock(
  "@/components/modal/confirmModal",
  () => ({
    __esModule: true,
    cancelConfTitle: "Confirm",
    default: ({ show }: any) =>
      show ? <div>Confirm Dialog</div> : null,
  }),
);

jest.mock("@syncfusion/ej2-react-grids", () => {
  const React = require("react");

  const MockGridComponent = React.forwardRef(
    (props: any, ref: any) => {
      capturedGridProps = props;

      React.useImperativeHandle(ref, () => ({
        toolbarModule: {
          enableItems: jest.fn(),
        },
      }));

      return (
        <div data-testid="scores-grid">
          GridComponent
        </div>
      );
    },
  );

  MockGridComponent.displayName = "MockGridComponent";

  return {
    GridComponent: MockGridComponent,
    ColumnsDirective: ({ children }: any) => <>{children}</>,
    ColumnDirective: () => null,
    Inject: () => null,
    Edit: jest.fn(),
    Toolbar: jest.fn(),
  };
});

const mockTmntFullData = {
  tmnt: {
    id: "tmt_123",
    tmnt_name: "Test Tournament",
  },
  squads: [
    {
      id: "sqd_123",
    },
  ],
};

const mockRows = [
  {
    id: "ply_1",
    first_name: "John",
    last_name: "Smith",
    game_1: 220,
    game_2: 210,
    total: 430,
    plusMinus: "+30",
  },
  {
    id: "ply_2",
    first_name: "Jane",
    last_name: "Smith",
    game_1: 195,
    game_2: 210,
    total: 405,
    plusMinus: "+5",
  },
  {
    id: "ply_3",
    first_name: "Joe",
    last_name: "Doe",
    game_1: 190,
    game_2: 210,
    total: 400,
    plusMinus: "0",
  },
];

const setupSelectors = () => {
  mockUseSelector.mockImplementation(
    (selector: any) => {
      const state = {
        tmntFullData: {
          tmntFullData: mockTmntFullData,
        },
        gamesForSquad: {
          games: [],
        },
      };

      return selector(state);
    },
  );
};

const renderComponent = (
  enableEditing = true,
) => {
  setupSelectors();

  return render(
    <ScoresEntryForm
      rows={mockRows}
      setRows={jest.fn()}
      enableEditing={enableEditing}
      dataWasChanged={false}
      onDataChanged={jest.fn()}
      onDataReset={jest.fn()}
      onNavigateAfterSave={jest.fn()}
      onSaveComplete={jest.fn()}
    />,
  );
};

describe("ScoresEntryForm render", () => {

  beforeEach(() => {
    jest.clearAllMocks();

    mockLoadStatus = "idle";
    mockSaveStatus = "idle";

    mockUseDispatch.mockReturnValue(mockDispatch);

    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    });
  });

  it("renders tournament name", () => {
    renderComponent();

    expect(
      screen.getByText(
        /test tournament/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders player count", () => {
    renderComponent();

    expect(
      screen.getByText("Players: 3"),
    ).toBeInTheDocument();
  });

  it("renders the grid", () => {
    renderComponent();

    expect(
      screen.getByTestId("scores-grid"),
    ).toBeInTheDocument();
  });

  it("passes rows to the grid datasource", () => {
    renderComponent();

    expect(
      capturedGridProps.dataSource,
    ).toHaveLength(3);
  });

  it("creates score columns", () => {
    renderComponent();

    expect(
      mockCreateScoreColumns,
    ).toHaveBeenCalled();
  });

  it("enables editing by default", () => {
    renderComponent();

    expect(
      capturedGridProps.editSettings.allowEditing,
    ).toBe(true);
  });

  it("disables editing when enableEditing is false", () => {
    renderComponent(false);

    expect(
      capturedGridProps.editSettings.allowEditing,
    ).toBe(false);
  });

  it("shows loading modal", () => {
    mockLoadStatus = "loading";

    renderComponent();

    expect(
      screen.getByText("Loading..."),
    ).toBeInTheDocument();
  });

  it("shows saving modal", () => {
    mockSaveStatus = "saving";

    renderComponent();

    expect(
      screen.getByText("Saving..."),
    ).toBeInTheDocument();
  });

});