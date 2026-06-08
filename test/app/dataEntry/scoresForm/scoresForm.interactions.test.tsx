import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// these are needed for the form and before the form is imported
jest.mock("@/lib/syncfusion-license", () => ({}));

jest.mock("react-redux");
jest.mock("next/navigation");

import ScoresEntryForm from "@/app/dataEntry/scoresForm/scoresForm";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

const mockPush = jest.fn();
const mockDispatch = jest.fn();

const mockUseDispatch = jest.mocked(useDispatch);
const mockUseSelector = jest.mocked(useSelector);
const mockUseRouter = jest.mocked(useRouter);

mockUseRouter.mockReturnValue({
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
});

mockUseDispatch.mockReturnValue(mockDispatch);

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
    plusMinus: "+0",
  },
  {
    id: "ply_4",
    first_name: "Jill",
    last_name: "Doe",
    game_1: 190,
    game_2: 185,
    total: 375,
    plusMinus: "-25",
  },
];

let capturedGridProps: any;

jest.mock("@syncfusion/ej2-react-grids", () => {
  const React = require("react");

  const MockGridComponent = React.forwardRef(
    (props: any, ref: any) => {
      capturedGridProps = props;

      React.useImperativeHandle(ref, () => ({
        editModule: {
          batchSave: jest.fn(),
          batchCancel: jest.fn(),
        },
        clearSelection: jest.fn(),
        toolbarModule: {
          enableItems: jest.fn(),
        },
        getCurrentViewRecords: jest.fn(() => props.dataSource),
        getColumns: jest.fn(() => [
          { field: "game_1" },
        ]),
        selectCell: jest.fn(),
        editCell: jest.fn(),
        saveCell: jest.fn(),
        setCellValue: jest.fn(),
      }));

      return (
        <div>
          <button onClick={() => props.toolbarClick({ item: { id: "back" } })}>
            Back
          </button>

          <button onClick={() => props.toolbarClick({ item: { id: "undo_all" } })}>
            Cancel
          </button>

          <button onClick={() => props.toolbarClick({ item: { id: "save" } })}>
            Save
          </button>

          <button onClick={() => props.toolbarClick({ item: { id: "done" } })}>
            Save and Close
          </button>
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

jest.mock(
  "@/app/dataEntry/scoresForm/sfCreateScoreColumns",
  () => ({
    createScoreColumns: jest.fn(() => []),
    scoreEntryIdColName: "id",
    scoreEntryPlusMinusColName: "plusMinus",
    scoreEntryTotalColName: "total",
  }),
);

jest.mock(
  "@/redux/features/gamesForSquad/gamesForSquadSlice",
  () => ({
    getGamesForSquadLoadStatus: () => "idle",
    getGamesForSquadSaveStatus: () => "idle",
    updateGamesForSquad: jest.fn(),
  }),
);

jest.mock(
  "@/app/dataEntry/scoresForm/scoreRows",
  () => ({
    extractGameScores: jest.fn(() => []),
  }),
);

jest.mock(
  "@/components/modal/waitModal",
  () => ({
    __esModule: true,
    default: () => null,
  }),
);

jest.mock(
  "@/components/modal/confirmModal",
  () => {
    return {
      __esModule: true,

      cancelConfTitle: "Confirm",

      default: ({
        show,
        title,
        message,
        onConfirm,
        onCancel,
      }: any) =>
          show ? (
            <div role="dialog" aria-label="confirm">
              <div>{title}</div>
              <div>{message}</div>

              <button onClick={onConfirm}>
                Yes
              </button>

              <button onClick={onCancel}>
                No
              </button>
            </div>
          ) : null,
    };
  },
);

const setupSelectors = () => {
  mockUseSelector.mockImplementation((selector: any) => {
    const state = {
      tmntFullData: {
        tmntFullData: mockTmntFullData,
      },
      gamesForSquad: {
        games: [],
      },
    };

    return selector(state);
  });
};

const renderComponent = (
  dataWasChanged = false,
) => {
  setupSelectors();

  return render(
    <ScoresEntryForm
      rows={mockRows}
      setRows={jest.fn()}
      dataWasChanged={dataWasChanged}
      onDataChanged={jest.fn()}
      onDataReset={jest.fn()}
      onNavigateAfterSave={jest.fn()}
      onSaveComplete={jest.fn()}
    />,
  );
};

describe("ScoresEntryForm interactions", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders tournament heading", () => {
    renderComponent();

    expect(
      screen.getByText(
        /test tournament/i,
      ),
    ).toBeInTheDocument();
  });

  it("navigates immediately when Back clicked and no changes exist", async () => {
    const user = userEvent.setup();

    renderComponent(false);

    await user.click(
      screen.getByRole("button", {
        name: /back/i,
      }),
    );

    expect(mockPush).toHaveBeenCalledWith(
      "/dataEntry/runTmnt/tmt_123",
    );
  });

  it("shows confirmation dialog when Back clicked and changes exist", async () => {
    const user = userEvent.setup();

    renderComponent(true);

    await user.click(
      screen.getByRole("button", {
        name: /back/i,
      }),
    );

    expect(
      screen.getByRole("dialog"),
    ).toBeInTheDocument();
  });

  it("navigates when Back confirmation Yes clicked", async () => {
    const user = userEvent.setup();

    renderComponent(true);

    await user.click(
      screen.getByRole("button", {
        name: /back/i,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /yes/i,
      }),
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        "/dataEntry/runTmnt/tmt_123",
      );
    });
  });

  it("does not navigate when Back confirmation No clicked", async () => {
    const user = userEvent.setup();

    renderComponent(true);

    await user.click(
      screen.getByRole("button", {
        name: /back/i,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /no/i,
      }),
    );

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows confirmation dialog when Cancel clicked", async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(
      screen.getByRole("button", {
        name: /cancel/i,
      }),
    );

    expect(
      screen.getByRole("dialog"),
    ).toBeInTheDocument();
  });

  it("closes confirmation dialog when Cancel No clicked", async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(
      screen.getByRole("button", {
        name: /cancel/i,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /no/i,
      }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog"),
      ).not.toBeInTheDocument();
    });
  });

  it("recalculates total and plus/minus when a score cell is saved", () => {
    const onDataChanged = jest.fn();

    // const rows = [
    //   {
    //     id: "ply_1",
    //     first_name: "John",
    //     last_name: "Smith",
    //     game_1: 220,
    //     game_2: 210,
    //     total: 0,
    //     plusMinus: "",
    //   },
    //   {
    //     id: "ply_2",
    //     first_name: "Jane",
    //     last_name: "Smith",
    //     game_1: 195,
    //     game_2: 210,
    //     total: 0,
    //     plusMinus: "",
    //   },
    //   {
    //     id: "ply_3",
    //     first_name: "Joe",
    //     last_name: "Doe",
    //     game_1: 190,
    //     game_2: 210,
    //     total: 0,
    //     plusMinus: "",
    //   },
    //   {
    //     id: "ply_4",
    //     first_name: "Jill",
    //     last_name: "Doe",
    //     game_1: 190,
    //     game_2: 185,
    //     total: 0,
    //     plusMinus: "",
    //   },
    // ];

    setupSelectors();

    render(
      <ScoresEntryForm
        rows={mockRows}
        setRows={jest.fn()}
        dataWasChanged={false}
        onDataChanged={onDataChanged}
        onDataReset={jest.fn()}
        onNavigateAfterSave={jest.fn()}
        onSaveComplete={jest.fn()}
      />,
    );

    const testCases = [
      {
        row: mockRows[0],
        expectedTotal: 430,
        expectedPlusMinus: "+30",
      },
      {
        row: mockRows[1],
        expectedTotal: 405,
        expectedPlusMinus: "+5",
      },
      {
        row: mockRows[2],
        expectedTotal: 400,
        expectedPlusMinus: "0",
      },
      {
        row: mockRows[3],
        expectedTotal: 375,
        expectedPlusMinus: "-25",
      },
    ];

    testCases.forEach((testCase) => {
      capturedGridProps.cellSaved({
        rowData: testCase.row,
        columnName: "game_2",
        value: testCase.row.game_2,
      });

      expect(testCase.row.total).toBe(testCase.expectedTotal);
      expect(testCase.row.plusMinus).toBe(testCase.expectedPlusMinus);
    });

    expect(onDataChanged).toHaveBeenCalledTimes(4);
  });

});