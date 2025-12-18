import React from "react"; 
import { render, screen } from "@testing-library/react"; 
import "@testing-library/jest-dom"; 
import { Provider, useDispatch } from "react-redux"; 
// Insert this mock BEFORE importing from react-redux anywhere else
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));
import type { Dispatch } from "redux";
import userEvent from "@testing-library/user-event"; 
import { configureStore } from "@reduxjs/toolkit"; 
import { useRouter } from "next/navigation"; 
import tmntFullDataReducer, { saveTmntFullData } from "@/redux/features/tmntFullData/tmntFullDataSlice"; 
import bowlsReducer from "@/redux/features/bowls/bowlsSlice"; 
import TmntDataForm from "@/app/dataEntry/tmntForm/tmntForm"; 
import { bowlType, ioDataError, tmntActions, tmntFormDataType } from "@/lib/types/types"; 
import { getBlankTmntFullData } from "@/app/dataEntry/tmntForm/tmntTools"; 
import { mockBowl, mockTmntFullData } from "../../../mocks/tmnts/tmntFulldata/mockTmntFullData"; 
import { ioStatusType } from "@/redux/statusTypes"; 

const makeStore = (bowls: bowlType[] = []) =>
  configureStore({
    reducer: {
      tmntFullData: tmntFullDataReducer,
      bowls: bowlsReducer,
    },    
    preloadedState: {
      bowls: {
        bowls,
        loadStatus: "idle" as ioStatusType,
        saveStatus: "idle" as ioStatusType,
        error: "",
      },
      tmntFullData: {
        tmntFullData: getBlankTmntFullData(),
        loadStatus: "idle" as ioStatusType,
        saveStatus: "idle" as ioStatusType,
        error: "",
        ioError: ioDataError.None,
      },
    },
  });
  
// Mock useRouter:
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => ({
  __esModule: true,
  ...jest.requireActual("@/redux/features/tmntFullData/tmntFullDataSlice"),
  saveTmntFullData: jest.fn(),
}));

jest.mock("react-bootstrap/Modal", () => {
  const MockModal = ({ show, children }: { show: boolean; children: React.ReactNode }) => {
    return show ? <div role="dialog">{children}</div> : null;
  };
  const Header = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  Header.displayName = "MockModalHeader";

  const Title = ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>;
  Title.displayName = "MockModalTitle";

  const Body = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  Body.displayName = "MockModalBody";

  const Footer = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  Footer.displayName = "MockModalFooter";

  MockModal.Header = Header;
  MockModal.Title = Title;
  MockModal.Body = Body;
  MockModal.Footer = Footer;

  MockModal.displayName = "MockModal";

  return MockModal;
});

const tmntProps: tmntFormDataType = { 
  tmntFullData: mockTmntFullData, 
  tmntAction: tmntActions.New, 
} 

describe('TmntDataForm - Save Modals', () => {   
  
  describe('save modal - success', () => {
    beforeEach(() => {        
      jest.clearAllMocks();

      (useDispatch as unknown as jest.Mock).mockReturnValue(
        jest.fn(() => ({ unwrap: () => Promise.resolve() })) as unknown as Dispatch
      );

      (saveTmntFullData as unknown as jest.Mock).mockImplementation(() => ({
        unwrap: () => Promise.resolve(),
      }));

    });

    it('show success modal when save is successful', async () => { 

      const store = makeStore([mockBowl]);       
      render( 
        <Provider store={store}> 
          <TmntDataForm tmntProps={tmntProps} /> 
        </Provider> 
      ); 

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      // Simulate save click
      const user = userEvent.setup(); 
      const saveBtn = screen.getByText("Save Tournament"); 
      saveBtn.focus(); // needed to focus the button 	
      await user.click(saveBtn);
      
      await screen.findByRole('dialog', undefined);
      expect(screen.getByText("Tournament Saved")).toBeInTheDocument();
      expect(
        screen.getByText(`Tournament: ${mockTmntFullData.tmnt.tmnt_name} saved.`)
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /ok/i })).toBeInTheDocument();
    });
  });  

  describe('save modal - error cases', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      (useDispatch as unknown as jest.Mock).mockReturnValue(
        jest.fn((thunkAction: any) => thunkAction) as unknown as Dispatch
      );
    });

    it('shows correct modal message when errorType = Tmnt', async () => {
      (saveTmntFullData as unknown as jest.Mock).mockImplementation(() => ({
        unwrap: () => Promise.reject({ errorType: ioDataError.Tmnt }),
      }));

      const store = makeStore([mockBowl]);
      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>
      );

      const user = userEvent.setup();
      const saveBtn = screen.getByText("Save Tournament");
      saveBtn.focus();
      await user.click(saveBtn);
      
      await screen.findByRole('dialog', undefined);
      expect(screen.getByText("Cannot Save")).toBeInTheDocument();
      expect(
        screen.getByText(`Cannot save Tournament "${mockTmntFullData.tmnt.tmnt_name}".`)
      ).toBeInTheDocument();
    });    
    it('shows correct modal message when errorType = Events', async () => {
      (saveTmntFullData as unknown as jest.Mock).mockImplementation(() => ({
        unwrap: () => Promise.reject({ errorType: ioDataError.Events }),
      }));

      const store = makeStore([mockBowl]);
      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>
      );

      const user = userEvent.setup();
      const saveBtn = screen.getByText("Save Tournament");
      saveBtn.focus();
      await user.click(saveBtn);

      await screen.findByRole('dialog', undefined);
      expect(screen.getByText("Cannot Save")).toBeInTheDocument();
      expect(screen.getByText(`Cannot save Events.`)).toBeInTheDocument();
    });    
    it('shows correct modal message when errorType = Divs', async () => {
      (saveTmntFullData as unknown as jest.Mock).mockImplementation(() => ({
        unwrap: () => Promise.reject({ errorType: ioDataError.Divs }),
      }));

      const store = makeStore([mockBowl]);
      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>
      );

      const user = userEvent.setup();
      const saveBtn = screen.getByText("Save Tournament");
      saveBtn.focus();
      await user.click(saveBtn);

      await screen.findByRole('dialog', undefined);
      expect(screen.getByText("Cannot Save")).toBeInTheDocument();
      expect(screen.getByText(`Cannot save Divisions.`)).toBeInTheDocument();
    });    
    it('shows correct modal message when errorType = Squads', async () => {
      (saveTmntFullData as unknown as jest.Mock).mockImplementation(() => ({
        unwrap: () => Promise.reject({ errorType: ioDataError.Squads }),
      }));

      const store = makeStore([mockBowl]);
      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>
      );

      const user = userEvent.setup();
      const saveBtn = screen.getByText("Save Tournament");
      saveBtn.focus();
      await user.click(saveBtn);

      await screen.findByRole('dialog', undefined);
      expect(screen.getByText("Cannot Save")).toBeInTheDocument();
      expect(screen.getByText(`Cannot save Squads.`)).toBeInTheDocument();
    });    
    it('shows correct modal message when errorType = Lanes', async () => {
      (saveTmntFullData as unknown as jest.Mock).mockImplementation(() => ({
        unwrap: () => Promise.reject({ errorType: ioDataError.Lanes }),
      }));

      const store = makeStore([mockBowl]);
      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>
      );

      const user = userEvent.setup();
      const saveBtn = screen.getByText("Save Tournament");
      saveBtn.focus();
      await user.click(saveBtn);

      await screen.findByRole('dialog', undefined);
      expect(screen.getByText("Cannot Save")).toBeInTheDocument();
      expect(
        screen.getByText(`Cannot save Lanes.`)
      ).toBeInTheDocument();
    });
    it('shows correct modal message when errorType = Pots', async () => {
      (saveTmntFullData as unknown as jest.Mock).mockImplementation(() => ({
        unwrap: () => Promise.reject({ errorType: ioDataError.Pots }),
      }));

      const store = makeStore([mockBowl]);
      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>
      );

      const user = userEvent.setup();
      const saveBtn = screen.getByText("Save Tournament");
      saveBtn.focus();
      await user.click(saveBtn);

      await screen.findByRole('dialog', undefined);
      expect(screen.getByText("Cannot Save")).toBeInTheDocument();
      expect(screen.getByText(`Cannot save Pots.`)).toBeInTheDocument();
    });
    it('shows correct modal message when errorType = Brkts', async () => {
      (saveTmntFullData as unknown as jest.Mock).mockImplementation(() => ({
        unwrap: () => Promise.reject({ errorType: ioDataError.Brkts }),
      }));

      const store = makeStore([mockBowl]);
      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>
      );

      const user = userEvent.setup();
      const saveBtn = screen.getByText("Save Tournament");
      saveBtn.focus();
      await user.click(saveBtn);

      await screen.findByRole('dialog', undefined);
      expect(screen.getByText("Cannot Save")).toBeInTheDocument();
      expect(
        screen.getByText(`Cannot save Brackets.`)
      ).toBeInTheDocument();
    });
    it('shows correct modal message when errorType = Elims', async () => {
      (saveTmntFullData as unknown as jest.Mock).mockImplementation(() => ({
        unwrap: () => Promise.reject({ errorType: ioDataError.Elims }),
      }));

      const store = makeStore([mockBowl]);
      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>
      );

      const user = userEvent.setup();
      const saveBtn = screen.getByText("Save Tournament");
      saveBtn.focus();
      await user.click(saveBtn);

      await screen.findByRole('dialog', undefined);
      expect(screen.getByText("Cannot Save")).toBeInTheDocument();
      expect(screen.getByText(`Cannot save Eliminators.`)).toBeInTheDocument();
    });    

    it('shows "Unknown error saving Tournament." when errorType is undefined', async () => {
      (saveTmntFullData as unknown as jest.Mock).mockImplementation(() => ({
        unwrap: () => Promise.reject({}),
      }));

      const store = makeStore([mockBowl]);
      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>
      );

      const user = userEvent.setup();
      const saveBtn = screen.getByText("Save Tournament");
      saveBtn.focus();
      await user.click(saveBtn);

      await screen.findByRole('dialog', undefined);
      expect(screen.getByText("Cannot Save")).toBeInTheDocument();
      expect(screen.getByText("Unknown error saving Tournament.")).toBeInTheDocument();
    });
  });

  describe('TmntDataForm - confirm Modal', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('shows confirm modal when Cancel is clicked', async () => {
      const store = makeStore([mockBowl]);
      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>
      );

      const user = userEvent.setup();
      const cancelBtn = screen.getByText("Cancel");

      // The modal should not appear before clicking
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      await user.click(cancelBtn);

      // The confirm modal should now appear
      const modal = await screen.findByRole("dialog");
      expect(modal).toBeInTheDocument();
      expect(
        screen.getByText("Cancel New Tournament")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Do you want to cancel entering new tournament?")
      ).toBeInTheDocument();
    });

    it('calls confirmedCancel when user confirms cancel', async () => {
      const mockPush = jest.fn();

      // Redefine router behavior for this test
      (useRouter as jest.Mock).mockReturnValue({
        push: mockPush,
        prefetch: jest.fn(),
      });

      const store = makeStore([mockBowl]);
      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>
      );

      const user = userEvent.setup();
      await user.click(screen.getByText("Cancel"));

      // Modal appears
      await screen.findByRole("dialog");
      expect(screen.getByText("Cancel New Tournament")).toBeInTheDocument();

      // Simulate clicking confirm button
      const yesBtn = screen.getByRole("button", { name: /yes/i });
      await user.click(yesBtn);

      // Wait for updates
      await new Promise((r) => setTimeout(r, 0));

      // Verify router navigation
      expect(mockPush).toHaveBeenCalledWith("/user/tmnts");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it('hides confirm modal when user clicks No', async () => {
      const mockPush = jest.fn();

      // Redefine router behavior for this test
      (useRouter as jest.Mock).mockReturnValue({
        push: mockPush,
        prefetch: jest.fn(),
      });

      const store = makeStore([mockBowl]);
      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>
      );

      const user = userEvent.setup();
      await user.click(screen.getByText("Cancel"));

      // Confirm modal should appear
      await screen.findByRole("dialog");
      expect(screen.getByText("Cancel New Tournament")).toBeInTheDocument();

      // Simulate clicking "No" button
      const noBtn = screen.getByRole("button", { name: /no/i });
      await user.click(noBtn);

      // Wait for state updates to complete
      await new Promise((r) => setTimeout(r, 0));

      // The confirm modal should close
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      // No navigation should occur
      expect(mockPush).not.toHaveBeenCalled();
    });    

  });

  describe('TmntDataForm - WaitModal', () => {
    it('shows WaitModal when saveStatus is "saving" and hides when complete', async () => {
      // First render: state = saving → WaitModal visible
      const storeSaving = configureStore({
        reducer: {
          tmntFullData: tmntFullDataReducer,
          bowls: bowlsReducer,
        },
        preloadedState: {
          bowls: {
            bowls: [mockBowl],
            loadStatus: "idle" as ioStatusType,
            saveStatus: "idle" as ioStatusType,
            error: "",
          },
          tmntFullData: {
            tmntFullData: mockTmntFullData,
            loadStatus: "idle" as ioStatusType, // important
            saveStatus: "saving" as ioStatusType,
            error: "",
            ioError: ioDataError.None,
          },
        },
      });

      // use storeSaving, not makeStore
      const { rerender } = render(
        <Provider store={storeSaving}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>
      );

      // WaitModal should be visible
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Saving...")).toBeInTheDocument();

      // Re-render: state = idle → WaitModal hidden
      const storeIdle = configureStore({
        reducer: {
          tmntFullData: tmntFullDataReducer,
          bowls: bowlsReducer,
        },
        preloadedState: {
          bowls: {
            bowls: [mockBowl],
            loadStatus: "idle" as ioStatusType,
            saveStatus: "idle" as ioStatusType,
            error: "",
          },
          tmntFullData: {
            tmntFullData: mockTmntFullData,
            loadStatus: "idle" as ioStatusType,
            saveStatus: "success" as ioStatusType,
            error: "",
            ioError: ioDataError.None,
          },
        },
      });

      // use storeIdle, not makeStore or storeSaving
      rerender(
        <Provider store={storeIdle}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>
      );

      // WaitModal should disappear
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

});