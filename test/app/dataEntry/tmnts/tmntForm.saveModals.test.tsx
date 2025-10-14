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
  useRouter() { 
    return { 
      push: jest.fn(), 
      prefetch: jest.fn(), 
    }; 
  }, 
})); 

jest.mock("../../../../src/redux/features/tmntFullData/tmntFullDataSlice", () => ({
  __esModule: true,
  ...jest.requireActual("../../../../src/redux/features/tmntFullData/tmntFullDataSlice"),
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

const flush = () => new Promise<void>((r) => setTimeout(r, 0));

describe('TmntDataForm - Save Modals', () => {   
  
  describe('save modals', () => {       
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

      await screen.findByRole('dialog', undefined, { timeout: 1500 });

      expect(screen.getByText("Tournament Saved")).toBeInTheDocument();
      expect(
        screen.getByText(`Tournament: ${mockTmntFullData.tmnt.tmnt_name} saved.`)
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /ok/i })).toBeInTheDocument();
    });
  });  
});