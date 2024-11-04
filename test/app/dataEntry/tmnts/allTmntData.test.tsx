import { render, screen } from '@testing-library/react';
import { ReduxProvider } from '@/redux/provider';
import userEvent from '@testing-library/user-event';
import TmntDataForm from '@/app/dataEntry/tmntForm/tmntForm';
import { allDataOneTmntType } from '@/lib/types/types';
import { mockTmnt, mockEvents, mockDivs, mockSquads, mockLanes, mockPots, mockBrkts, mockElims } from '../../../mocks/tmnts/newTmnt/mockNewTmnt';
import { dateTo_UTC_yyyyMMdd, startOfTodayUTC } from '@/lib/dateTools';
import { IntlConfig } from '@/lib/currency/components/CurrencyInputProps';
import { getLocaleConfig } from '@/lib/currency/components/utils';
import { formatValuePercent2Dec, formatValueSymbSep2Dec } from '@/lib/currency/formatValue';
import { deleteAllTmntElims, getAllElimsForTmnt } from '@/lib/db/elims/elimsAxios';
import { deleteAllTmntBrkts, getAllBrktsForTmnt } from '@/lib/db/brkts/brktsAxios';
import { deleteAllTmntPots, getAllPotsForTmnt } from '@/lib/db/pots/potsAxios';
import { deleteAllTmntLanes, getAllLanesForTmnt } from '@/lib/db/lanes/lanesAxios';
import { deleteAllTmntSquads, getAllSquadsForTmnt } from '@/lib/db/squads/squadsAxios';
import { deleteAllTmntDivs, getAllDivsForTmnt } from '@/lib/db/divs/divsAxios';
import { deleteAllTmntEvents, getAllEventsForTmnt } from '@/lib/db/events/eventsAxios';
import { deleteTmnt, getTmnt } from '@/lib/db/tmnts/tmntsAxios';
import { compareAsc } from 'date-fns';
import { blankDataOneTmnt } from '@/lib/db/initVals';
import { RootState } from '@/redux/store';
import { mockStateBowls } from '../../../mocks/state/mockState';

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

describe('Render Tmnt data', () => {

  const tmntProps: allDataOneTmntType = {
    origData: blankDataOneTmnt(),
    curData: {
      tmnt: mockTmnt,
      events: mockEvents,
      divs: mockDivs,
      squads: mockSquads,
      lanes: mockLanes,
      pots: mockPots,
      brkts: mockBrkts,
      elims: mockElims,
    }
  };   

  const ic: IntlConfig = {
    // locale: window.navigator.language,
    locale: 'en-US'
  };  
  const localConfig = getLocaleConfig(ic);
  localConfig.prefix = "$";  

  describe('render Tournament form', () => {   

    describe('render Tournament data', () => { 
    
      it('render tournament items', async () => {
        render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
        const tmntNameInput = screen.getByRole('textbox', { name: /tournament name/i }) as HTMLInputElement;
        expect(tmntNameInput).toBeInTheDocument();
        expect(tmntNameInput).toHaveValue(mockTmnt.tmnt_name);

        const bowlSelect = screen.getByRole('combobox', { name: /bowl name/i }) as HTMLInputElement;
        expect(bowlSelect).toBeInTheDocument();
        expect(bowlSelect).toHaveValue(mockTmnt.bowl_id);

        const startDateInput = screen.getByTestId('inputStartDate') as HTMLInputElement;
        expect(startDateInput).toBeInTheDocument();   
        expect(startDateInput.value).toBe(dateTo_UTC_yyyyMMdd(startOfTodayUTC()));

        const endDateInput = screen.getByTestId('inputEndDate') as HTMLInputElement;
        expect(endDateInput).toBeInTheDocument();      
        expect(endDateInput.value).toBe(dateTo_UTC_yyyyMMdd(startOfTodayUTC()));

        const saveBtn = screen.getByRole('button', { name: /save tournament/i });
        expect(saveBtn).toBeInTheDocument();
      })

    })

    describe('render Events data', () => { 

      it('render events items', async () => { 
        const user = userEvent.setup()
        render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
        const acdns = await screen.findAllByRole('button', { name: /events/i });
        await user.click(acdns[0]);

        const eventTab = await screen.findByRole('tab', { name: /singles/i })
        expect(eventTab).toBeVisible();

        const eventNames = screen.getAllByRole("textbox", { name: /event name/i }) as HTMLInputElement[];
        expect(eventNames).toHaveLength(1);
        expect(eventNames[0]).toHaveValue(mockEvents[0].event_name);

        const teamSizes = screen.getAllByRole('spinbutton', { name: /team size/i }) as HTMLInputElement[];
        expect(teamSizes).toHaveLength(1);
        expect(teamSizes[0]).toHaveValue(mockEvents[0].team_size);

        const eventGames = screen.getAllByRole("spinbutton", { name: /event games/i }) as HTMLInputElement[];
        expect(eventGames).toHaveLength(1);
        expect(eventGames[0]).toHaveValue(mockEvents[0].games);

        const addeds = screen.getAllByRole('textbox', { name: /added \$/i }) as HTMLInputElement[];
        expect(addeds).toHaveLength(1);    
        expect(addeds[0]).toHaveValue(formatValueSymbSep2Dec(mockEvents[0].added_money, localConfig));

        const entryFees = screen.getAllByRole('textbox', { name: /entry fee/i }) as HTMLInputElement[];
        expect(entryFees).toHaveLength(1);
        expect(entryFees[0]).toHaveValue(formatValueSymbSep2Dec(mockEvents[0].entry_fee, localConfig));

        const lineages = screen.getAllByRole('textbox', { name: /lineage/i }) as HTMLInputElement[];
        expect(lineages).toHaveLength(1);
        expect(lineages[0]).toHaveValue(formatValueSymbSep2Dec(mockEvents[0].lineage, localConfig));

        const prizes = screen.getAllByRole('textbox', { name: /prize fund/i }) as HTMLInputElement[];
        expect(prizes).toHaveLength(1);
        expect(prizes[0]).toHaveValue(formatValueSymbSep2Dec(mockEvents[0].prize_fund, localConfig));

        const others = screen.getAllByRole('textbox', { name: /other/i }) as HTMLInputElement[];
        expect(others).toHaveLength(1);
        expect(others[0]).toHaveValue(formatValueSymbSep2Dec(mockEvents[0].other, localConfig));

        const expenses = screen.getAllByRole('textbox', { name: /expenses/i }) as HTMLInputElement[];
        expect(expenses).toHaveLength(1);
        expect(expenses[0]).toHaveValue(formatValueSymbSep2Dec(mockEvents[0].expenses, localConfig));

        const lpoxs = screen.getAllByRole('textbox', { name: /L\+P\+O\+X/i }) as HTMLInputElement[];
        expect(lpoxs).toHaveLength(1);
        expect(lpoxs[0]).toHaveValue(formatValueSymbSep2Dec(mockEvents[0].lpox, localConfig));
      })

    })

    describe('render Divisions data', () => {
      
      it('render divs items', async () => { 
        const user = userEvent.setup()
        render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
        const acdns = await screen.findAllByRole('button', { name: /divisions/i });
        await user.click(acdns[0]);

        const scratchTabs = await screen.findAllByRole('tab', { name: /scratch/i })
        expect(scratchTabs).toHaveLength(6);
        // [0] - scratch div, [1] - pots, [2,3] - brkts, [4,5] - elims
        expect(scratchTabs[0]).toBeVisible();
        const hdcpTabs = await screen.findAllByRole('tab', { name: /handicap/i })
        expect(hdcpTabs).toHaveLength(6);
        // [0] - scratch div, [1] - pots, [2,3] - brkts, [4,5] - elims
        expect(hdcpTabs[0]).toBeVisible();

        const divNames = screen.getAllByRole("textbox", { name: /div name/i }) as HTMLInputElement[];
        expect(divNames).toHaveLength(2);
        expect(divNames[0]).toHaveValue(mockDivs[0].div_name);
        expect(divNames[1]).toHaveValue(mockDivs[1].div_name);

        const hdcpPers = screen.getAllByRole("textbox", { name: /hdcp %/i });
        expect(hdcpPers).toHaveLength(2);
        expect(hdcpPers[0]).toHaveValue(formatValuePercent2Dec(mockDivs[0].hdcp_per));
        expect(hdcpPers[1]).toHaveValue(formatValuePercent2Dec(mockDivs[1].hdcp_per));

        const hdcpFroms = screen.getAllByRole("spinbutton", { name: /hdcp from/i });
        expect(hdcpFroms).toHaveLength(2);
        expect(hdcpFroms[0]).toHaveValue(mockDivs[0].hdcp_from);
        expect(hdcpFroms[1]).toHaveValue(mockDivs[1].hdcp_from);

        const intHdcps = screen.getAllByRole('checkbox', { name: /integer hdcp/i });
        expect(intHdcps).toHaveLength(2);
        expect(intHdcps[0]).toBeChecked();
        expect(intHdcps[0]).toBeDisabled();
        expect(intHdcps[1]).toBeChecked();

        const hdcpForGames = screen.getAllByRole('radio', { name: /game/i }) as HTMLInputElement[];
        expect(hdcpForGames).toHaveLength(4);
        // [0,1] - divs, [2,3] - pots
        expect(hdcpForGames[0]).toBeDisabled();
        expect(hdcpForGames[0]).toBeChecked();
        expect(hdcpForGames[1]).toBeEnabled();
        expect(hdcpForGames[1]).toBeChecked();

        const hdcpForSeries = screen.getAllByRole('radio', { name: /series/i }) as HTMLInputElement[];
        expect(hdcpForSeries).toHaveLength(3);
        // [0,1] - divs, [2] - pots
        expect(hdcpForSeries[0]).toBeDisabled();
        expect(hdcpForSeries[0]).not.toBeChecked();
        expect(hdcpForSeries[1]).toBeEnabled();
        expect(hdcpForSeries[1]).not.toBeChecked();

      })  
      
    })

    describe('render Squads data', () => {

      it('render squad items', async () => {
        const user = userEvent.setup()
        render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
        const acdns = await screen.findAllByRole('button', { name: /squads/i });
        await user.click(acdns[0]);

        const squadTabs = await screen.findAllByRole('tab', { name: /squad 1/i })
        expect(squadTabs).toHaveLength(2);
        // [0] - suqads, [1] - lanes  

        const squadNames = screen.getAllByRole("textbox", { name: /squad name/i }) as HTMLInputElement[];
        expect(squadNames).toHaveLength(1);
        expect(squadNames[0]).toHaveValue(mockSquads[0].squad_name);

        const squadGames = screen.getAllByRole("spinbutton", { name: /squad games/i }) as HTMLInputElement[];
        expect(squadGames).toHaveLength(1);
        expect(squadGames[0]).toHaveValue(mockSquads[0].games);

        const squadEvents = screen.getAllByRole("combobox", { name: /event/i }) as HTMLInputElement[];
        expect(squadEvents).toHaveLength(1);        
        expect(squadEvents[0]).toHaveValue(mockSquads[0].event_id);

        const startingLanes = screen.getAllByRole("spinbutton", { name: /starting lane/i }) as HTMLInputElement[];
        expect(startingLanes).toHaveLength(1);
        expect(startingLanes[0]).toHaveValue(mockSquads[0].starting_lane);

        const numberOfLanes = screen.getAllByRole("spinbutton", { name: /# of lanes/i }) as HTMLInputElement[];
        expect(numberOfLanes).toHaveLength(1);
        expect(numberOfLanes[0]).toHaveValue(mockSquads[0].lane_count);
      
        const squadDates = screen.getAllByLabelText(/date/i) as HTMLInputElement[];
        expect(squadDates).toHaveLength(3);
        // [0,1] - events, [2] - squads
        expect(squadDates[2].value).toBe(dateTo_UTC_yyyyMMdd(mockSquads[0].squad_date));    

        const squadTimes = screen.getAllByLabelText(/start time/i) as HTMLInputElement[];        
        expect(squadTimes).toHaveLength(1);
        if (mockSquads[0].squad_time) {
          expect(squadTimes[0]).toHaveValue(mockSquads[0].squad_time);  
        } else {
          expect(squadTimes[0]).toHaveValue('');
        }    
      })

    })

    describe('render Lanes data', () => {

      it('render lanes items', async () => {
        const user = userEvent.setup()
        render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
        const acdns = await screen.findAllByRole('button', { name: /lanes/i });
        await user.click(acdns[0]);

        const tableCells = screen.getAllByRole('cell');  
        expect(tableCells).toHaveLength(12);
        expect(tableCells[0]).toHaveTextContent(`${mockLanes[0].lane_number} - ${mockLanes[1].lane_number}`); 
        expect(tableCells[2]).toHaveTextContent(`${mockLanes[2].lane_number} - ${mockLanes[3].lane_number}`); 
        expect(tableCells[4]).toHaveTextContent(`${mockLanes[4].lane_number} - ${mockLanes[5].lane_number}`); 
        expect(tableCells[6]).toHaveTextContent(`${mockLanes[6].lane_number} - ${mockLanes[7].lane_number}`); 
        expect(tableCells[8]).toHaveTextContent(`${mockLanes[8].lane_number} - ${mockLanes[9].lane_number}`); 
        expect(tableCells[10]).toHaveTextContent(`${mockLanes[10].lane_number} - ${mockLanes[11].lane_number}`); 
        
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(8);
        // [0,1] - divs, [2-7] - lanes        
        expect(checkboxes[2]).toBeChecked();
        expect(checkboxes[3]).toBeChecked();
        expect(checkboxes[4]).toBeChecked();
        expect(checkboxes[5]).toBeChecked();
        expect(checkboxes[6]).toBeChecked();
        expect(checkboxes[7]).toBeChecked();

        const squadTabs = await screen.findAllByRole('tab', { name: /squad 1/i })        
        expect(squadTabs).toHaveLength(2);        
        // [0] - suqads, [1] - lanes 
      })

    })

    describe('render the Pots data', () => { 

      it('render pots items', async () => {
        const user = userEvent.setup()
        render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
        const acdns = await screen.findAllByRole('button', { name: /pots/i });
        await user.click(acdns[0]);

        const scratchTabs = await screen.findAllByRole('tab', { name: /game - scratch/i })
        expect(scratchTabs).toHaveLength(1);
        expect(scratchTabs[0]).toBeVisible();
        const hdcpTabs = await screen.findAllByRole('tab', { name: /game - handicap/i })
        expect(hdcpTabs).toHaveLength(1);
        expect(hdcpTabs[0]).toBeVisible();

        const games = screen.getAllByRole('radio', { name: /game/i }) as HTMLInputElement[];
        expect(games).toHaveLength(4);
        // [0,1] - divs, [2,3] - pots (create pot: game and last game)
        expect(games[2]).toBeEnabled();
        expect(games[2]).not.toBeChecked();
        expect(games[3]).toBeEnabled();
        expect(games[3]).not.toBeChecked();

        const series = screen.getAllByRole('radio', { name: /series/i }) as HTMLInputElement[];
        expect(series).toHaveLength(3);
        // [0,1] - divs, [2] - pots
        expect(series[2]).toBeEnabled();
        expect(series[2]).not.toBeChecked();

        const scratchRadio = screen.getAllByRole('radio', { name: /scratch/i }) as HTMLInputElement[];
        expect(scratchRadio).toHaveLength(3);
        // [0] - pots, [1] - brkts, [2] - elims
        expect(scratchRadio[0]).toBeEnabled();
        expect(scratchRadio[0]).not.toBeChecked();

        const hdcpRadio = screen.getAllByRole('radio', { name: /handicap/i }) as HTMLInputElement[];
        expect(hdcpRadio).toHaveLength(3);
        // [0] - pots, [1] - brkts, [2] - elims
        expect(hdcpRadio[0]).toBeEnabled();
        expect(hdcpRadio[0]).not.toBeChecked();

        const feeValues = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
        expect(feeValues).toHaveLength(14);
        // [0] - event, [1-3] - pots, [4-8] - brkts, [9-13] - elims
        expect(feeValues[1]).toHaveValue('');
        expect(feeValues[2]).toHaveValue(formatValueSymbSep2Dec(mockPots[0].fee, localConfig));
        expect(feeValues[3]).toHaveValue(formatValueSymbSep2Dec(mockPots[1].fee, localConfig)); 

        const potTypeValues = screen.getAllByRole('textbox', { name: /pot type/i }) as HTMLInputElement[];
        expect(potTypeValues).toHaveLength(mockPots.length);        
        expect(potTypeValues[0]).toHaveValue(mockPots[0].pot_type);
        expect(potTypeValues[1]).toHaveValue(mockPots[1].pot_type);

        const divValues = screen.getAllByRole('textbox', { name: /division/i }) as HTMLInputElement[];
        expect(divValues).toHaveLength(11);
        // [0] - divs, [1,2] - pots, [3-6] - brkts, [7-11] - elims
        expect(divValues[1]).toHaveValue(mockDivs[0].div_name); // yes, use mockDivs[0]
        expect(divValues[2]).toHaveValue(mockDivs[1].div_name); // yes, use mockDivs[1]
      })

    })

    describe('render the Brackets data', () => {

      it('render brkts items', async () => {
        const user = userEvent.setup()
        render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
        const acdns = await screen.findAllByRole('button', { name: /brackets/i });
        await user.click(acdns[0]);

        const scratchRadio = screen.getAllByRole('radio', { name: /scratch/i }) as HTMLInputElement[];
        expect(scratchRadio).toHaveLength(3);
        // [0] - pots, [1] - brkts, [2] - elims
        expect(scratchRadio[1]).toBeEnabled();
        expect(scratchRadio[1]).not.toBeChecked();

        const hdcpRadio = screen.getAllByRole('radio', { name: /handicap/i }) as HTMLInputElement[];
        expect(hdcpRadio).toHaveLength(3);
        // [0] - pots, [1] - brkts, [2] - elims
        expect(hdcpRadio[1]).toBeEnabled();
        expect(hdcpRadio[1]).not.toBeChecked();
      
        const feeValues = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
        expect(feeValues).toHaveLength(14);
        // [0] - event, [1-3] - pots, [4-8] - brkts, [9-13] - elims
        expect(feeValues[4]).toHaveValue('');
        expect(feeValues[5]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[0].fee, localConfig));
        expect(feeValues[6]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[1].fee, localConfig)); 
        expect(feeValues[7]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[2].fee, localConfig));
        expect(feeValues[8]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[3].fee, localConfig)); 
        
        const startInputs = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];              
        expect(startInputs).toHaveLength(11);
        // [0] - squad, [1-5] - brkts, [6-10] - elims
        expect(startInputs[1]).toHaveValue(1);
        expect(startInputs[2]).toHaveValue(mockBrkts[0].start);
        expect(startInputs[3]).toHaveValue(mockBrkts[1].start);
        expect(startInputs[4]).toHaveValue(mockBrkts[2].start);
        expect(startInputs[5]).toHaveValue(mockBrkts[3].start);
        
        const gamesInputs = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];
        expect(gamesInputs).toHaveLength(12);
        // [0] - event, [1] - squad, [2-6] - brkts, [7-11] - elims
        expect(gamesInputs[2]).toHaveValue(3);
        expect(gamesInputs[3]).toHaveValue(mockBrkts[0].games);
        expect(gamesInputs[4]).toHaveValue(mockBrkts[1].games);
        expect(gamesInputs[5]).toHaveValue(mockBrkts[2].games);
        expect(gamesInputs[6]).toHaveValue(mockBrkts[3].games);
        
        const playersValues = screen.getAllByRole('spinbutton', { name: /players/i }) as HTMLInputElement[];        
        expect(playersValues).toHaveLength(5);
        expect(playersValues[0]).toHaveValue(8);      
        expect(playersValues[1]).toHaveValue(mockBrkts[1].players);
        expect(playersValues[2]).toHaveValue(mockBrkts[2].players);
        expect(playersValues[3]).toHaveValue(mockBrkts[3].players);
        expect(playersValues[4]).toHaveValue(mockBrkts[0].players);

        const firstValues = screen.getAllByRole('textbox', { name: /first/i }) as HTMLInputElement[];
        expect(firstValues).toHaveLength(5);
        expect(firstValues[0]).toHaveValue('');    
        expect(firstValues[1]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[0].first, localConfig));
        expect(firstValues[2]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[1].first, localConfig)); 
        expect(firstValues[3]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[2].first, localConfig));
        expect(firstValues[4]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[3].first, localConfig)); 
        
        const secondValues = screen.getAllByRole('textbox', { name: /second/i }) as HTMLInputElement[];
        expect(secondValues).toHaveLength(5);
        expect(secondValues[0]).toHaveValue('');    
        expect(secondValues[1]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[0].second, localConfig));
        expect(secondValues[2]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[1].second, localConfig)); 
        expect(secondValues[3]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[2].second, localConfig));
        expect(secondValues[4]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[3].second, localConfig)); 

        const adminValues = screen.getAllByRole('textbox', { name: /admin/i }) as HTMLInputElement[];
        expect(adminValues).toHaveLength(5);
        expect(adminValues[0]).toHaveValue('');    
        expect(adminValues[1]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[0].admin, localConfig));
        expect(adminValues[2]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[1].admin, localConfig)); 
        expect(adminValues[3]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[2].admin, localConfig));
        expect(adminValues[4]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[3].admin, localConfig)); 
        
        const fsaValues = screen.getAllByRole('textbox', { name: /F\+S\+A/i }) as HTMLInputElement[];        
        expect(fsaValues).toHaveLength(5);
        expect(fsaValues[0]).toHaveValue('');    
        expect(fsaValues[1]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[0].fsa, localConfig));
        expect(fsaValues[2]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[1].fsa, localConfig)); 
        expect(fsaValues[3]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[2].fsa, localConfig));
        expect(fsaValues[4]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[3].fsa, localConfig)); 

      })

    })

    describe('render the Eliminators data', () => {

      it('render elims items', async () => {
        const user = userEvent.setup()
        render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
        const acdns = await screen.findAllByRole('button', { name: /eliminators/i });
        await user.click(acdns[0]);

        const scratchRadio = screen.getAllByRole('radio', { name: /scratch/i }) as HTMLInputElement[];
        expect(scratchRadio).toHaveLength(3);
        // [0] - pots, [1] - brkts, [2] - elims
        expect(scratchRadio[2]).toBeEnabled();
        expect(scratchRadio[2]).not.toBeChecked();

        const hdcpRadio = screen.getAllByRole('radio', { name: /handicap/i }) as HTMLInputElement[];
        expect(hdcpRadio).toHaveLength(3);
        // [0] - pots, [1] - brkts, [2] - elims
        expect(hdcpRadio[2]).toBeEnabled();
        expect(hdcpRadio[2]).not.toBeChecked();
      
        const feeValues = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
        expect(feeValues).toHaveLength(14);
        // [0] - event, [1-3] - pots, [4-8] - brkts, [9-13] - elims
        expect(feeValues[9]).toHaveValue('');
        expect(feeValues[10]).toHaveValue(formatValueSymbSep2Dec(mockElims[0].fee, localConfig));
        expect(feeValues[11]).toHaveValue(formatValueSymbSep2Dec(mockElims[1].fee, localConfig));
        expect(feeValues[12]).toHaveValue(formatValueSymbSep2Dec(mockElims[2].fee, localConfig));
        expect(feeValues[13]).toHaveValue(formatValueSymbSep2Dec(mockElims[3].fee, localConfig));
        
        const startInputs = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];
        expect(startInputs).toHaveLength(11);
        // [0] - squad, [1-5] - brkts, [6-10] - elims
        expect(startInputs[6]).toHaveValue(1);
        expect(startInputs[7]).toHaveValue(mockElims[0].start);
        expect(startInputs[8]).toHaveValue(mockElims[1].start);
        expect(startInputs[9]).toHaveValue(mockElims[2].start);
        expect(startInputs[10]).toHaveValue(mockElims[3].start);
        
        const gamesInputs = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];
        expect(gamesInputs).toHaveLength(12);
        // [0] - event, [1] - squad, [2-6] - brkts, [7-11] - elims
        expect(gamesInputs[7]).toHaveValue(3);
        expect(gamesInputs[8]).toHaveValue(mockElims[0].games);
        expect(gamesInputs[9]).toHaveValue(mockElims[1].games);
        expect(gamesInputs[10]).toHaveValue(mockElims[2].games);
        expect(gamesInputs[11]).toHaveValue(mockElims[3].games);

      })

    })

  })
 
})