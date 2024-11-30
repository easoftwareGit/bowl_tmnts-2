import React from "react";
import { fireEvent, render, screen } from '../../../test-utils'
import userEvent from "@testing-library/user-event";
import { allDataOneTmntType, tmntActions, tmntFormDataType } from "@/lib/types/types";
import { blankDataOneTmnt } from "@/lib/db/initVals";
import { dateTo_UTC_MMddyyyy, startOfDayFromString, startOfTodayUTC, todayStr } from "@/lib/dateTools";
import { RootState } from "@/redux/store";
import { mockStateBowls } from "../../../mocks/state/mockState";
import { ReduxProvider } from "@/redux/provider";
import TmntDataForm from "@/app/dataEntry/tmntForm/tmntForm";
import { mockSDBrkts, mockSDDivs, mockSDElims, mockSDEvents, mockSDLanes, mockSDPots, mockSDSquads, mockSDTmnt } from "../../../mocks/tmnts/singlesAndDoubles/mockSD";
import 'core-js/actual/structured-clone';

// run these tests with the server active
//    in the VS activity bar,
//      a) click on "Run and Debug" (Ctrl+Shift+D)
//      b) at the top of the window, click on the drop-down arrow
//      c) select "Node.js: debug server-side"
//      d) directly to the left of the drop down select, click the green play button
//         This will start the server in debug mode.


// Mock state for bowls
const mockState: Partial<RootState> = {
  bowls: {
    bowls: mockStateBowls,
    loadStatus: "idle",
    saveStatus: "idle",
    error: "",
  },  
}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn().mockImplementation((selector) => selector(mockState)),
}));
// Mock useRouter:
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      prefetch: () => null
    };
  }
}));

describe('TmntDataPage - Squads Component', () => { 

  const tmntProps: tmntFormDataType = {
    origData: blankDataOneTmnt(),
    curData: {
      tmnt: mockSDTmnt,
      events: mockSDEvents,
      divs: mockSDDivs,
      squads: mockSDSquads,
      lanes: mockSDLanes,
      pots: mockSDPots,
      brkts: mockSDBrkts,
      elims: mockSDElims,
    },
    tmntAction: tmntActions.Edit
  };   

  describe('click on the squads accordian', () => { 
    it('find and open the squads accordian', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      expect(acdns).toHaveLength(1);
      await user.click(acdns[0]);
    })
    it('render the squads tab', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const squadsTabs = await screen.findAllByRole('tab', { name: /a squad/i }) as HTMLElement[];
      expect(squadsTabs[0]).toBeVisible();
    })
    it('edit the squad name', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const squadsNames = screen.getAllByRole("textbox", { name: /squad name/i }) as HTMLInputElement[];
      expect(squadsNames).toHaveLength(2);
      expect(squadsNames[0]).toHaveValue("A Squad");
      await user.click(squadsNames[0]);
      await user.clear(squadsNames[0]);
      expect(squadsNames[0]).toHaveValue("");
      await user.type(squadsNames[0], "Testing");
      expect(squadsNames[0]).toHaveValue("Testing");
      const squadsTabs = await screen.findAllByRole('tab', { name: /testing/i }) as HTMLElement[];
      expect(squadsTabs[0]).toBeInTheDocument();
      expect(squadsTabs).toHaveLength(2);
    })
    // #squads, squad games, event, Date, Start Date renders in oneToNDivs.test.tsx
  })

  describe('render multiple squads', () => {
    it('render multiple squad tabs', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const aTabs = await screen.findAllByRole('tab', { name: /a squad/i })
      const bTabs = await screen.findAllByRole('tab', { name: /b squad/i })       
      // [0] - squads, [1] - lanes
      expect(aTabs).toHaveLength(2);
      expect(aTabs[0]).toBeInTheDocument();
      // [0] - squads, [1] - lanes
      expect(bTabs).toHaveLength(2);
      expect(bTabs[0]).toBeInTheDocument();
    })
  })

  describe('reset the squad name to "Squad 1" for first squad when squad name is cleared', () => { 
    it('reset the squad name to "Squad 1" for first squad when squad name is cleared', async () => { 
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const aTabs = await screen.findAllByRole('tab', { name: /a squad/i })
      // [0] - squads, [1] - lanes
      expect(aTabs).toHaveLength(2);
      const bTabs = await screen.findAllByRole('tab', { name: /b squad/i })       
      // [0] - squads, [1] - lanes
      expect(bTabs).toHaveLength(2);
      const squadNames = screen.getAllByRole("textbox", { name: /squad name/i }) as HTMLInputElement[];
      expect(squadNames).toHaveLength(2);
      const squadGames = screen.getAllByRole('spinbutton', { name: /squad games/i }) as HTMLInputElement[];
      expect(squadGames).toHaveLength(2);

      await user.clear(squadNames[0]);
      expect(aTabs[0]).toHaveTextContent('');

      // click will cause event name to be reset to "Squad 1" (sort order is 1)
      await user.click(squadGames[0]);

      const squadNameErrors = await screen.findAllByTestId('dangerSquadName');
      expect(squadNameErrors).toHaveLength(2);
      expect(squadNameErrors[0]).toHaveTextContent("");
      expect(squadNames[0]).toHaveValue("Squad 1");
      expect(aTabs[0]).toHaveTextContent('Squad 1');
    })
  })

  describe('changing the squad name changed the squad tab title', () => {
    it('changing the squad name changed the squad tab title', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const squadNames = screen.getAllByRole("textbox", { name: /squad name/i }) as HTMLInputElement[];
      const squadTabs = await screen.findAllByRole('tab', { name: /a squad/i }) as HTMLElement[];      
      // [0] - squads, [1] - lanes
      expect(squadNames).toHaveLength(2);
      expect(squadNames[0]).toHaveValue("A Squad");
      await user.click(squadNames[0]);
      await user.clear(squadNames[0]);
      expect(squadNames[0]).toHaveValue("");
      await user.type(squadNames[0], "Testing");
      expect(squadNames[0]).toHaveValue("Testing");
      expect(squadTabs[0]).toHaveTextContent("Testing");
      expect(squadTabs[1]).toHaveTextContent("Testing");
    })
  })

  describe('render the squad name errors', () => {
    it('redner duplicate event name error', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)

      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const aTabs = await screen.findAllByRole('tab', { name: /a squad/i })
      const bTabs = await screen.findAllByRole('tab', { name: /b squad/i })
      expect(aTabs).toHaveLength(2);
      expect(bTabs).toHaveLength(2);
      expect(aTabs[0]).toBeInTheDocument();
      expect(bTabs[0]).toBeInTheDocument();
      await user.click(bTabs[0])
      const squadNames = screen.getAllByRole("textbox", { name: /squad name/i }) as HTMLInputElement[];
      expect(squadNames).toHaveLength(2);
      await user.click(bTabs[0]);
      await user.click(squadNames[1]);
      await user.clear(squadNames[1]);
      await user.type(squadNames[1], 'A Squad')
      expect(squadNames[0]).toHaveValue("A Squad");
      expect(squadNames[1]).toHaveValue("A Squad");
      // click will cause invalid data errors to show
      await user.click(saveBtn);
      const squadNameErrors = await screen.findAllByTestId('dangerSquadName');
      expect(squadNameErrors[0]).toHaveTextContent("");
      expect(squadNameErrors[1]).toHaveTextContent("has already been used");
      expect(acdns[0]).toHaveTextContent("has already been used");
      expect(aTabs[0]).not.toHaveClass('objError');
      expect(bTabs[0]).toHaveClass('objError');
    })
    it('clear the squad name error', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)

      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const aTabs = await screen.findAllByRole('tab', { name: /a squad/i })
      const bTabs = await screen.findAllByRole('tab', { name: /b squad/i })
      expect(aTabs).toHaveLength(2);
      expect(bTabs).toHaveLength(2);
      expect(aTabs[0]).toBeInTheDocument();
      expect(bTabs[0]).toBeInTheDocument();
      await user.click(bTabs[0])
      const squadNames = screen.getAllByRole("textbox", { name: /squad name/i }) as HTMLInputElement[];
      expect(squadNames).toHaveLength(2);
      await user.click(bTabs[0]);
      await user.click(squadNames[1]);
      await user.clear(squadNames[1]);
      await user.type(squadNames[1], 'A Squad')
      expect(squadNames[0]).toHaveValue("A Squad");
      expect(squadNames[1]).toHaveValue("A Squad");
      // click will cause invalid data errors to show
      await user.click(saveBtn);
      const squadNameErrors = await screen.findAllByTestId('dangerSquadName');
      expect(squadNameErrors[0]).toHaveTextContent("");
      expect(squadNameErrors[1]).toHaveTextContent("has already been used");
      expect(acdns[0]).toHaveTextContent("has already been used");
      expect(aTabs[0]).not.toHaveClass('objError');
      expect(bTabs[0]).toHaveClass('objError');

      await user.clear(squadNames[1]);
      await user.type(squadNames[1], 'Testing');
      expect(squadNameErrors[1]).toHaveTextContent("");
      expect(bTabs[1]).not.toHaveClass('objError');
      expect(bTabs[1]).toHaveTextContent('Testing');
      expect(acdns[0]).not.toHaveTextContent(": Error in Squads - Squad Name is required");
      expect(acdns[0]).toHaveTextContent("Squads");
    })
  })

  describe('render the squad game errors', () => {
    it('render the less than min squad game error', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const squadGames = screen.getAllByRole('spinbutton', { name: /squad games/i }) as HTMLInputElement[];
      expect(squadGames).toHaveLength(2);
      // enter less than min value
      await user.clear(squadGames[0]);
      await user.type(squadGames[0], '0');
      // should show error
      await user.click(saveBtn);
      expect(squadGames[0]).toHaveValue(0);
      const gamesErrors = await screen.findAllByTestId('dangerSquadGames');
      expect(gamesErrors[0]).toHaveTextContent("Games cannot be less than");
      expect(acdns[0]).toHaveTextContent("Games cannot be less than");
      const squadTabs = await screen.findAllByRole('tab', { name: /a squad/i }) as HTMLElement[];
      expect(squadTabs[0]).toHaveClass('objError');
    })
    it('render the more than max squad game error', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const squadGames = screen.getAllByRole('spinbutton', { name: /squad games/i }) as HTMLInputElement[];
      // enter less than min value
      await user.clear(squadGames[0]);
      await user.type(squadGames[0], '9');
      // should show error
      await user.click(saveBtn);
      expect(squadGames[0]).toHaveValue(9);
      const gamesErrors = await screen.findAllByTestId('dangerSquadGames');
      expect(gamesErrors[0]).toHaveTextContent("Games cannot be more than");
      expect(acdns[0]).toHaveTextContent("Games cannot be more than");
      const squadTabs = await screen.findAllByRole('tab', { name: /a squad/i }) as HTMLElement[];
      expect(squadTabs[0]).toHaveClass('objError');
    })
    it('max squad games is event games', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const eventAcnds = await screen.findAllByRole('button', { name: /events/i });
      const squadAcdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(eventAcnds[0]);
      const eventGames = screen.getAllByRole('spinbutton', { name: /event games/i }) as HTMLInputElement[];
      await user.clear(eventGames[0]);
      await user.type(eventGames[0], '7');
      expect(eventGames[0]).toHaveValue(7);
      await user.click(squadAcdns[0]);
      const squadGames = screen.getAllByRole('spinbutton', { name: /squad games/i }) as HTMLInputElement[];
      // enter less than min value
      await user.clear(squadGames[0]);
      await user.type(squadGames[0], '8');
      // should show error
      await user.click(saveBtn);
      expect(squadGames[0]).toHaveValue(8);
      const gamesErrors = await screen.findAllByTestId('dangerSquadGames');
      expect(gamesErrors[0]).toHaveTextContent("Games cannot be more than 7");
      expect(squadAcdns[0]).toHaveTextContent("Games cannot be more than 7");
      const squadTabs = await screen.findAllByRole('tab', { name: /a squad/i }) as HTMLElement[];
      expect(squadTabs[0]).toHaveClass('objError');
    })
    it('clear the squad game error', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const squadGames = screen.getAllByRole('spinbutton', { name: /squad games/i }) as HTMLInputElement[];
      // enter less than min value
      await user.clear(squadGames[0]);
      await user.type(squadGames[0], '0');
      // should show error
      await user.click(saveBtn);
      expect(squadGames[0]).toHaveValue(0);
      const gamesErrors = await screen.findAllByTestId('dangerSquadGames');
      expect(gamesErrors[0]).toHaveTextContent("Games cannot be less than");
      expect(acdns[0]).toHaveTextContent("Games cannot be less than");
      const squadTabs = await screen.findAllByRole('tab', { name: /a squad/i }) as HTMLElement[];
      expect(squadTabs[0]).toHaveClass('objError');
      await user.clear(squadGames[0]);
      await user.type(squadGames[0], '6');
      expect(gamesErrors[0]).toHaveTextContent("");
      expect(acdns[0]).not.toHaveTextContent("Games cannot be less than");
      expect(squadTabs[0]).not.toHaveClass('objError');
    })
  })

  describe('render the squad starting lane errors', () => {
    it('render the less than min squad starting lane error', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const startingLanes = screen.getAllByRole('spinbutton', { name: /starting lane/i }) as HTMLInputElement[];
      expect(startingLanes).toHaveLength(2);
      // enter less than min value
      await user.clear(startingLanes[0]);
      // should show error
      await user.click(saveBtn);
      expect(startingLanes[0]).toHaveValue(0);
      const gamesErrors = await screen.findAllByTestId('dangerStartingLane');
      expect(gamesErrors[0]).toHaveTextContent("Starting Lane cannot be less than");
      expect(acdns[0]).toHaveTextContent("Starting Lane cannot be less than");
      const squadTabs = await screen.findAllByRole('tab', { name: /a squad/i }) as HTMLElement[];
      expect(squadTabs[0]).toHaveClass('objError');
    })
    it('render the more than max squad starting lane error', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const startingLanes = screen.getAllByRole('spinbutton', { name: /starting lane/i }) as HTMLInputElement[];
      // enter less than min value
      await user.clear(startingLanes[0]);
      await user.type(startingLanes[0], '234');
      // should show error
      await user.click(saveBtn);
      expect(startingLanes[0]).toHaveValue(234);
      const gamesErrors = await screen.findAllByTestId('dangerStartingLane');
      expect(gamesErrors[0]).toHaveTextContent("Starting Lane cannot be more than");
      expect(acdns[0]).toHaveTextContent("Starting Lane cannot be more than");
      const squadTabs = await screen.findAllByRole('tab', { name: /a squad/i }) as HTMLElement[];
      expect(squadTabs[0]).toHaveClass('objError');
    })
    it('render the even starting lane error', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const startingLanes = screen.getAllByRole('spinbutton', { name: /starting lane/i }) as HTMLInputElement[];
      // enter less than min value
      await user.clear(startingLanes[0]);
      await user.type(startingLanes[0], '2');
      // should show error
      await user.click(saveBtn);
      expect(startingLanes[0]).toHaveValue(2);
      const gamesErrors = await screen.findAllByTestId('dangerStartingLane');
      expect(gamesErrors[0]).toHaveTextContent("Starting Lane cannot be even");
      expect(acdns[0]).toHaveTextContent("Starting Lane cannot be even");
      const squadTabs = await screen.findAllByRole('tab', { name: /a squad/i }) as HTMLElement[];
      expect(squadTabs[0]).toHaveClass('objError');
    })
    it('enter "-3" as the squad starting lane, no error, "-" converted to "0"', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const startingLanes = screen.getAllByRole('spinbutton', { name: /starting lane/i }) as HTMLInputElement[];
      // enter less than min value
      await user.clear(startingLanes[0]);
      await user.type(startingLanes[0], '-3');
      // should show error
      await user.click(saveBtn);
      expect(startingLanes[0]).toHaveValue(3);
      const gamesErrors = await screen.findAllByTestId('dangerStartingLane');
      expect(gamesErrors[0]).toHaveTextContent("");
      expect(acdns[0]).not.toHaveTextContent("Starting Lane cannot be less than");
      const squadTabs = await screen.findAllByRole('tab', { name: /a squad/i }) as HTMLElement[];
      expect(squadTabs[0]).not.toHaveClass('objError');
    })
    it('clear the squad starting lane error', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const startingLanes = screen.getAllByRole('spinbutton', { name: /starting lane/i }) as HTMLInputElement[];
      // enter less than min value
      await user.clear(startingLanes[0]);
      // should show error
      await user.click(saveBtn);
      expect(startingLanes[0]).toHaveValue(0);
      const gamesErrors = await screen.findAllByTestId('dangerStartingLane');
      expect(gamesErrors[0]).toHaveTextContent("Starting Lane cannot be less than");
      expect(acdns[0]).toHaveTextContent("Starting Lane cannot be less than");
      const squadTabs = await screen.findAllByRole('tab', { name: /a squad/i }) as HTMLElement[];
      expect(squadTabs[0]).toHaveClass('objError');
      await user.clear(startingLanes[0]);
      await user.type(startingLanes[0], '1');
      expect(gamesErrors[0]).toHaveTextContent("");
      expect(acdns[0]).not.toHaveTextContent("Starting Lane cannot be less than");
      expect(squadTabs[0]).not.toHaveClass('objError');
    })
    it('render the odd number of lanes error', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const numLanes = screen.getAllByRole('spinbutton', { name: /# of lanes/i }) as HTMLInputElement[];
      expect(numLanes).toHaveLength(2);
      // enter less than min value
      await user.clear(numLanes[0]);
      await user.type(numLanes[0], '9');
      // should show error
      await user.click(saveBtn);
      expect(numLanes[0]).toHaveValue(9);
      const numLanesErrs = await screen.findAllByTestId('dangerLaneCount');
      expect(numLanesErrs[0]).toHaveTextContent("Number of Lanes cannot be odd");
      expect(acdns[0]).toHaveTextContent("Number of Lanes cannot be odd");
      const squadTabs = await screen.findAllByRole('tab', { name: /a squad/i }) as HTMLElement[];
      expect(squadTabs[0]).toHaveClass('objError');
    })
  })

  describe('render the squad # of lanes errors', () => {
    it('render the less than min squad starting lane error', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const numLanes = screen.getAllByRole('spinbutton', { name: /# of lanes/i }) as HTMLInputElement[];
      // enter less than min value
      await user.clear(numLanes[0]);
      // should show error
      await user.click(saveBtn);
      expect(numLanes[0]).toHaveValue(0);
      const numLanesErrs = await screen.findAllByTestId('dangerLaneCount');
      expect(numLanesErrs[0]).toHaveTextContent("Number of Lanes cannot be less than");
      expect(acdns[0]).toHaveTextContent("Number of Lanes cannot be less than");
      const squadTabs = await screen.findAllByRole('tab', { name: /a squad/i }) as HTMLElement[];
      expect(squadTabs[0]).toHaveClass('objError');
    })
    it('render the more than max squad starting lane error', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const numLanes = screen.getAllByRole('spinbutton', { name: /# of lanes/i }) as HTMLInputElement[];
      // enter more than max value
      await user.clear(numLanes[0]);
      await user.type(numLanes[0], '234');
      // should show error
      await user.click(saveBtn);
      expect(numLanes[0]).toHaveValue(234);
      const numLanesErrs = await screen.findAllByTestId('dangerLaneCount');
      expect(numLanesErrs[0]).toHaveTextContent("Number of Lanes cannot be more than");
      expect(acdns[0]).toHaveTextContent("Number of Lanes cannot be more than");
      const squadTabs = await screen.findAllByRole('tab', { name: /a squad/i }) as HTMLElement[];
      expect(squadTabs[0]).toHaveClass('objError');
    })
    it('enter an odd numbner of lanes', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const numLanes = screen.getAllByRole('spinbutton', { name: /# of lanes/i }) as HTMLInputElement[];
      // enter more than max value
      await user.clear(numLanes[0]);
      await user.type(numLanes[0], '9');
      // should show error
      await user.click(saveBtn);
      expect(numLanes[0]).toHaveValue(9);
      const numLanesErrs = await screen.findAllByTestId('dangerLaneCount');
      expect(numLanesErrs[0]).toHaveTextContent("Number of Lanes cannot be odd");
      expect(acdns[0]).toHaveTextContent("Number of Lanes cannot be odd");
      const squadTabs = await screen.findAllByRole('tab', { name: /a squad/i }) as HTMLElement[];
      expect(squadTabs[0]).toHaveClass('objError');
    })
    it('enter "-8" as the number of lanes, no error, "-" converted to "0"', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const numLanes = screen.getAllByRole('spinbutton', { name: /# of lanes/i }) as HTMLInputElement[];
      // enter less than min value
      await user.clear(numLanes[0]);
      await user.type(numLanes[0], '-8');
      await user.click(saveBtn);
      expect(numLanes[0]).toHaveValue(8);
      const numLanesErrs = await screen.findAllByTestId('dangerLaneCount');
      expect(numLanesErrs[0]).toHaveTextContent("");
      expect(acdns[0]).not.toHaveTextContent("Number of Lanes cannot be less than");
      const squadTabs = await screen.findAllByRole('tab', { name: /a squad/i }) as HTMLElement[];
      expect(squadTabs[0]).not.toHaveClass('objError');
    })
    it('clear the number of lanes error', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const numLanes = screen.getAllByRole('spinbutton', { name: /# of lanes/i }) as HTMLInputElement[];
      // enter more than max value
      await user.clear(numLanes[0]);
      await user.type(numLanes[0], '234');
      // should show error
      await user.click(saveBtn);
      expect(numLanes[0]).toHaveValue(234);
      const numLanesErrs = await screen.findAllByTestId('dangerLaneCount');
      expect(numLanesErrs[0]).toHaveTextContent("Number of Lanes cannot be more than");
      expect(acdns[0]).toHaveTextContent("Number of Lanes cannot be more than");
      const squadTabs = await screen.findAllByRole('tab', { name: /a squad/i }) as HTMLElement[];
      expect(squadTabs[0]).toHaveClass('objError');
      // clear or type will cler the error
      await user.clear(numLanes[0]);
      await user.type(numLanes[0], '24');
      expect(numLanesErrs[0]).toHaveTextContent("");
      expect(acdns[0]).not.toHaveTextContent("Number of Lanes cannot be more than");
      expect(squadTabs[0]).not.toHaveClass('objError');
    })
  })

  describe('render the squad date day error', () => {
    const testTmnt = structuredClone(tmntProps)

    afterEach(() => {      
      testTmnt.curData.squads[0].squad_date_str = todayStr;      
      testTmnt.curData.squads[1].squad_date_str = todayStr;
    })

    it('render the less than min date error', async () => {
      // create error values      
      testTmnt.curData.squads[0].squad_date_str = '2000-01-01';

      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={testTmnt} /></ReduxProvider>)

      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const squadDates = screen.getAllByTestId('squadDate') as HTMLInputElement[];
      expect(squadDates[0]).toHaveValue('2000-01-01');
      // should show error
      await user.click(saveBtn);
      const dateErrors = await screen.findAllByTestId('dangerSquadDate') as HTMLElement[];
      expect(dateErrors[0]).toHaveTextContent("Earliest date is");
      expect(acdns[0]).toHaveTextContent("Earliest date is");
      const aTabs = await screen.findAllByRole('tab', { name: /a squad/i })
      expect(aTabs[0]).toHaveClass('objError');
    })
    it('render the more than max date error', async () => {
      // create error values      
      testTmnt.curData.squads[1].squad_date_str = '3000-01-01';      

      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={testTmnt} /></ReduxProvider>)

      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      const bTabs = await screen.findAllByRole('tab', { name: /b squad/i })
      await user.click(acdns[0]);
      await user.click(bTabs[0]);
      const squadDates = screen.getAllByTestId('squadDate') as HTMLInputElement[];
      expect(squadDates[1]).toHaveValue('3000-01-01');
      // should show error
      await user.click(saveBtn);
      const dateErrors = await screen.findAllByTestId('dangerSquadDate') as HTMLElement[];
      expect(dateErrors[1]).toHaveTextContent("Latest date is");
      expect(acdns[0]).toHaveTextContent("Latest date is");
      expect(bTabs[0]).toHaveClass('objError');
    })
    it('clear the date error', async () => {
      // create error values      
      testTmnt.curData.squads[1].squad_date_str = '3000-01-01';      

      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={testTmnt} /></ReduxProvider>)

      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      const bTabs = await screen.findAllByRole('tab', { name: /b squad/i })
      await user.click(acdns[0]);
      await user.click(bTabs[0]);
      const squadDates = screen.getAllByTestId('squadDate') as HTMLInputElement[];
      expect(squadDates[1]).toHaveValue('3000-01-01');
      // should show error
      await user.click(saveBtn);
      const dateErrors = await screen.findAllByTestId('dangerSquadDate') as HTMLElement[];
      expect(dateErrors[1]).toHaveTextContent("Latest date is");
      expect(acdns[0]).toHaveTextContent("Latest date is");
      expect(bTabs[0]).toHaveClass('objError');
      await user.click(squadDates[1]);
      // clear or fireEvent will clear the error
      // use fireEvent to simulate user input for date inputs, not user type 
      fireEvent.change(squadDates[1], { target: { value: todayStr } });
      // await user.type(squadDates[1], '4');      
      expect(dateErrors[1]).toHaveTextContent("");
      expect(acdns[0]).not.toHaveTextContent("Latest date is");
      expect(bTabs[0]).not.toHaveClass('objError');
    })
  })

  describe('render the squad time error', () => {
    const testTmnt = structuredClone(tmntProps)

    afterAll(() => {
      testTmnt.curData.squads[0].squad_time = '10:00';
      testTmnt.curData.squads[1].squad_time = '12:30';
    })

    it('render the no time error', async () => {
      // for multiple squads, each squad must have a time
      testTmnt.curData.squads[0].squad_time = '';

      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={testTmnt} /></ReduxProvider>)

      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const squadTimes = screen.getAllByLabelText(/start time/i) as HTMLInputElement[];
      expect(squadTimes[0]).toHaveValue('');
      // should show error
      await user.click(saveBtn);
      const timeErrors = await screen.findAllByTestId('dangerSquadTime') as HTMLElement[];
      expect(timeErrors[0]).toHaveTextContent("Time is required");
      expect(acdns[0]).toHaveTextContent("Time is required");
      const aTabs = await screen.findAllByRole('tab', { name: /a squad/i })
      expect(aTabs[0]).toHaveClass('objError');
    })
    it('render the duplicate date/time error', async () => {
      // set same time in squad 1 as squad 2      
      testTmnt.curData.squads[0].squad_time = '12:30';
      testTmnt.curData.squads[1].squad_time = '12:30';
      
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={testTmnt} /></ReduxProvider>)

      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      const bTabs = await screen.findAllByRole('tab', { name: /b squad/i })
      await user.click(acdns[0]);
      const squadTimes = screen.getAllByLabelText(/start time/i) as HTMLInputElement[];
      expect(squadTimes[0]).toHaveValue('12:30');
      expect(squadTimes[1]).toHaveValue('12:30');
      const squadDates = screen.getAllByTestId('squadDate') as HTMLInputElement[];
      expect(squadDates[0]).toHaveValue(todayStr);
      expect(squadDates[1]).toHaveValue(todayStr);
      // should show error
      await user.click(saveBtn);
      const timeErrors = await screen.findAllByTestId('dangerSquadTime') as HTMLElement[];
      const dateErr = testTmnt.curData.squads[1].squad_date_str;
      const timeErr = `${dateErr} - ${testTmnt.curData.squads[1].squad_time} has already been used.`;
      expect(timeErrors[1]).toHaveTextContent(timeErr);
      expect(acdns[0]).toHaveTextContent(timeErr);
      expect(bTabs[0]).toHaveClass('objError');
    })
    it('clear the time error', async () => {
      // for multiple squads, each squad must have a time
      testTmnt.curData.squads[0].squad_time = '';

      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={testTmnt} /></ReduxProvider>)

      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const squadTimes = screen.getAllByLabelText(/start time/i) as HTMLInputElement[];
      expect(squadTimes[0]).toHaveValue('');
      // should show error
      await user.click(saveBtn);
      const timeErrors = await screen.findAllByTestId('dangerSquadTime') as HTMLElement[];
      expect(timeErrors[0]).toHaveTextContent("Time is required");
      expect(acdns[0]).toHaveTextContent("Time is required");
      const aTabs = await screen.findAllByRole('tab', { name: /a squad/i })
      expect(aTabs[0]).toHaveClass('objError');
      await user.click(squadTimes[0]);
      // clear/type will clear the error
      await user.clear(squadTimes[0]);
      await user.type(squadTimes[0], '1230P');
      expect(timeErrors[0]).toHaveTextContent("");
      expect(acdns[0]).not.toHaveTextContent("Time is required");
      expect(aTabs[1]).not.toHaveClass('objError');
    })
  })

  describe('render multiple errors', () => {
    const testTmnt = structuredClone(tmntProps)

    it('render multiple errors', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={testTmnt} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const aTabs = await screen.findAllByRole('tab', { name: /a squad/i }) as HTMLElement[];
      const startingLanes = screen.getAllByRole("spinbutton", { name: /starting lane/i }) as HTMLInputElement[];
      const numberOfLanes = screen.getAllByRole("spinbutton", { name: /# of lanes/i }) as HTMLInputElement[];
      
      await user.click(startingLanes[0]);
      await user.clear(startingLanes[0]);
      await user.type(startingLanes[0], '222');

      await user.click(numberOfLanes[0]);
      await user.clear(numberOfLanes[0]); 
      await user.type(numberOfLanes[0], '0');

      // should show error
      await user.click(saveBtn);
          
      expect(startingLanes[0]).toHaveValue(222);
      const startingLaneErrs = screen.queryAllByTestId("dangerStartingLane");      
      expect(startingLaneErrs[0]).toHaveTextContent("Starting Lane cannot be more than 199");
      expect(acdns[0]).toHaveTextContent("Squads - 2: Error in A Squad - Starting Lane cannot be more than 199");
      expect(aTabs[0]).toHaveClass('objError');
      
      expect(numberOfLanes[0]).toHaveValue(0);
      const numLanesErrors = await screen.findAllByTestId('dangerLaneCount');
      expect(numLanesErrors[0]).toHaveTextContent("Number of Lanes cannot be less than 2");
    })
    it('render multiple errors, clear first error, show 2nd in acdn', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={testTmnt} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const aTabs = await screen.findAllByRole('tab', { name: /a squad/i }) as HTMLElement[];
      const startingLanes = screen.getAllByRole("spinbutton", { name: /starting lane/i }) as HTMLInputElement[];
      const numberOfLanes = screen.getAllByRole("spinbutton", { name: /# of lanes/i }) as HTMLInputElement[];
      
      await user.click(startingLanes[0]);
      await user.clear(startingLanes[0]);
      await user.type(startingLanes[0], '222');

      await user.click(numberOfLanes[0]);
      await user.clear(numberOfLanes[0]); 
      await user.type(numberOfLanes[0], '0');

      // should show error
      await user.click(saveBtn);
          
      expect(startingLanes[0]).toHaveValue(222);
      const startingLaneErrs = screen.queryAllByTestId("dangerStartingLane");      
      expect(startingLaneErrs[0]).toHaveTextContent("Starting Lane cannot be more than 199");
      expect(acdns[0]).toHaveTextContent("Squads - 2: Error in A Squad - Starting Lane cannot be more than 199");
      expect(aTabs[0]).toHaveClass('objError');
      
      expect(numberOfLanes[0]).toHaveValue(0);
      const numLanesErrors = await screen.findAllByTestId('dangerLaneCount');
      expect(numLanesErrors[0]).toHaveTextContent("Number of Lanes cannot be less than 2");

      await user.click(startingLanes[0]);
      await user.clear(startingLanes[0]);
      await user.type(startingLanes[0], '1');

      expect(startingLaneErrs[0]).toHaveTextContent("");
      expect(acdns[0]).toHaveTextContent("Squads - 2: Error in A Squad - Number of Lanes cannot be less than 2");
    })
  })

  describe('show accordian error for next squad', () => {
    const testTmnt = structuredClone(tmntProps)

    beforeEach(() => {
      testTmnt.curData.squads[0].games = 0;
      testTmnt.curData.squads[1].squad_date_str = '3000-01-01'
    })

    afterEach(() => {
      testTmnt.curData.squads[0].games = 3;
      testTmnt.curData.squads[1].squad_date_str = todayStr
    })

    it('render multiple errors', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={testTmnt} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const aTabs = await screen.findAllByRole('tab', { name: /a squad/i })
      const bTabs = await screen.findAllByRole('tab', { name: /b squad/i })
      await user.click(saveBtn);
      
      const gamesErrors = screen.getAllByTestId('dangerSquadGames') as HTMLElement[];
      expect(gamesErrors[0]).toHaveTextContent("Games cannot be less than");
      expect(acdns[0]).toHaveTextContent("Games cannot be less than");
      expect(aTabs[0]).toHaveClass('objError');
  
      const dateErrors = await screen.findAllByTestId('dangerSquadDate') as HTMLElement[];
      expect(dateErrors[1]).toHaveTextContent("Latest date is");
      expect(bTabs[0]).toHaveClass('objError');
    })
    it('render multiple errors, clear first error, show 2nd error', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={testTmnt} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const aTabs = await screen.findAllByRole('tab', { name: /a squad/i })
      const bTabs = await screen.findAllByRole('tab', { name: /b squad/i })
      await user.click(saveBtn);

      const squadGames = screen.getAllByRole('spinbutton', { name: /squad games/i }) as HTMLInputElement[];
      expect(squadGames[0]).toHaveValue(0);
      const gamesErrors = screen.getAllByTestId('dangerSquadGames') as HTMLElement[];
      expect(gamesErrors[0]).toHaveTextContent("Games cannot be less than");
      expect(acdns[0]).toHaveTextContent("Games cannot be less than");
      expect(aTabs[0]).toHaveClass('objError');
  
      const dateErrors = await screen.findAllByTestId('dangerSquadDate') as HTMLElement[];
      expect(dateErrors[1]).toHaveTextContent("Latest date is");
      expect(bTabs[0]).toHaveClass('objError');

      await user.click(aTabs[0]);
      await user.clear(squadGames[0]);
      await user.click(squadGames[0]);
      await user.type(squadGames[0], '3');

      expect(aTabs[0]).not.toHaveClass('objError');
      expect(acdns[0]).toHaveTextContent("Latest date is");
    })
  })

  describe('add squad', () => { 
    it('add squad', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const numEvents = screen.getByLabelText('# Squads');
      const addButton = screen.getByTestId('squadAdd');      
      expect(numEvents).toHaveValue("2");
      await user.click(addButton);
    })
  })

  describe('delete squad', () => { 
    it('delete squad confirmation', async () => { 
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole('button', { name: /squads/i });
      await user.click(acdns[0]);
      const bTabs = await screen.findAllByRole('tab', { name: /b squad/i }) as HTMLElement[];
      // doubles tabs in events and squads, 
      // doublesTabs[0]: events, doublesTabs[1]: squads
      await user.click(bTabs[1]);
      const delBtn = await screen.findByRole('button', { name: /delete event/i });      
      await user.click(delBtn);
      const okBtn = await screen.findByRole('button', { name: /ok/i });
      expect(okBtn).toBeInTheDocument();   
      // const cancelBtn = await screen.findByRole('button', { name: /cancel/i });
      // const cancelBtn = screen.queryByRole('button', { name: /cancel/i });
      // expect(cancelBtn).toBeInTheDocument();   
      // const confirmDelete = screen.getByText('Confirm Delete')
      // expect(confirmDelete).toBeInTheDocument();  
    })
  })

})