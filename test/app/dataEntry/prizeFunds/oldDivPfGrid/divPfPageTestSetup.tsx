import { render } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import {  
  fetchDivPfs,
  getDivPfsError,
  getDivPfsLoadStatus,
} from "@/redux/features/divPfs/divPfsSlice";
import {  
  fetchTmntFullData,
  getTmntFullDataError,
  getTmntFullDataLoadStatus,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { divPfEntryRow } from "@/lib/types/types";
import DivPrizeFundEntry from "@/app/dataEntry/prizeFunds/tmnt/[tmntId]/div/[divId]/page";
import { populateDivPfRows } from "@/app/dataEntry/prizeFunds/oldDivPfGrid/divPfRows";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { btDbUuid } from "@/lib/uuid";
import { tmntId, divId1, mockDivPfs, mockDivPrizeFund, mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData"

export const push = jest.fn();
export const dispatch = jest.fn();

export const setup = () => {
  render(<DivPrizeFundEntry />);
};

export const mockRows: divPfEntryRow[] = [
  {
    id: mockDivPfs[0].id,
    div_id: mockDivPfs[0].div_id,
    position: 1,
    amount: mockDivPfs[0].amount!,
    percentage: mockDivPfs[0].amount! / mockDivPrizeFund,
  },
  {
    id: mockDivPfs[1].id,
    div_id: mockDivPfs[1].div_id,
    position: 2,
    amount: mockDivPfs[1].amount!,
    percentage: mockDivPfs[1].amount! / mockDivPrizeFund,
  },
  {
    id: mockDivPfs[2].id,
    div_id: mockDivPfs[2].div_id,
    position: 3,
    amount: mockDivPfs[2].amount!,
    percentage: mockDivPfs[2].amount! / mockDivPrizeFund,
  },
  {
    id: mockDivPfs[3].id,
    div_id: mockDivPfs[3].div_id,
    position: 4,
    amount: mockDivPfs[3].amount!,
    percentage: mockDivPfs[3].amount! / mockDivPrizeFund,
  },
  {
    id: mockDivPfs[4].id,
    div_id: mockDivPfs[4].div_id,
    position: 5,
    amount: mockDivPfs[4].amount!,
    percentage: mockDivPfs[4].amount! / mockDivPrizeFund,
  },
  {
    id: mockDivPfs[5].id,
    div_id: mockDivPfs[5].div_id,
    position: 6,
    amount: mockDivPfs[5].amount!,
    percentage: mockDivPfs[5].amount! / mockDivPrizeFund,
  },
];

export const mockUseDispatch = jest.mocked(useDispatch);
export const mockUseSelector = jest.mocked(useSelector);
export const mockUseParams = jest.mocked(useParams);
export const mockUseRouter = jest.mocked(useRouter);

export const mockFetchDivPfs = jest.mocked(fetchDivPfs);
export const mockFetchTmntFullData = jest.mocked(fetchTmntFullData);

export const mockPopulateDivPfRows = jest.mocked(populateDivPfRows);
export const mockUseUnsavedChangesGuard = jest.mocked(useUnsavedChangesGuard);
export const mockBtDbUuid = jest.mocked(btDbUuid);

export const mockGridCallbacks = {
  onGridDataChanged: null as (() => void) | null,
  onGridDataReset: null as (() => void) | null,
  onNavigateAfterSave: null as (() => void) | null,
  onBack: null as (() => void) | null,
  onSaveComplete: null as ((savedRows: divPfEntryRow[]) => void) | null,
};

export const standardBeforeEach = () => {
  jest.clearAllMocks();

  mockGridCallbacks.onGridDataChanged = null;
  mockGridCallbacks.onGridDataReset = null;
  mockGridCallbacks.onNavigateAfterSave = null;
  mockGridCallbacks.onBack = null;
  mockGridCallbacks.onSaveComplete = null;

  mockUseParams.mockReturnValue({
    tmntId,
    divId: divId1,
  });

  mockUseRouter.mockReturnValue({
    push,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  });

  dispatch.mockReturnValue({
    unwrap: jest.fn().mockResolvedValue([]),
  });

  mockUseDispatch.mockReturnValue(dispatch);

  mockFetchDivPfs.mockReturnValue("fetchDivPfsThunk" as never);
  mockFetchTmntFullData.mockReturnValue("fetchTmntFullDataThunk" as never);

  mockPopulateDivPfRows.mockReturnValue(mockRows);
  mockUseUnsavedChangesGuard.mockReturnValue(undefined);

  mockBtDbUuid.mockReturnValue(
    "dpf_99999999999999999999999999999999",
  );

  mockUseSelector.mockImplementation((selector) => {
    if (selector === getDivPfsLoadStatus) return "succeeded";
    if (selector === getDivPfsError) return null;
    if (selector === getTmntFullDataLoadStatus) return "succeeded";
    if (selector === getTmntFullDataError) return null;

    return selector({
      divPfs: { divPfs: mockDivPfs },
      tmntFullData: { tmntFullData: mockTmntFullData },
    });
  });
};