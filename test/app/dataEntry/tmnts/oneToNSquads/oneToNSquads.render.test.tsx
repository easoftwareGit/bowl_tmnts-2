import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OneToNSquads, { updatedLanes, validLanes } from "@/app/dataEntry/tmntForm/oneToNSquads";
import { mockLanes, mockSquads } from "../../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { mockEvents } from "../../../../mocks/tmnts/singlesAndDoubles/mockEvents";
import { initSquad } from "@/lib/db/initVals";
import { laneType, squadType } from "@/lib/types/types";
import { maxLaneCount, maxStartLane, minLaneCount, minStartLane } from "@/lib/validation/validation";
import { cloneDeep } from "lodash";

const mockSetSquads = jest.fn();
const mockSetLanes = jest.fn();
const mockSetAcdnErr = jest.fn();

const mockOneToNSquadsProps = {
  squads: mockSquads,
  setSquads: mockSetSquads,
  lanes: mockLanes,
  setLanes: mockSetLanes,
  events: mockEvents,
  setAcdnErr: mockSetAcdnErr,
  isDisabled: false,
};

describe("OneToNSquads - render", () => { 

  describe('validLanes(squad)', () => {

    it('valid lanes: initSquad', () => {      
      expect(validLanes(initSquad)).toBe(true);
    })
    it('valid lanes: mockSquads[0]', () => {      
      expect(validLanes(mockSquads[0])).toBe(true);
    })
    it('valid lanes: squad.starting_lane = minStartLane - 1', () => {
      const invalidSquad = {
        ...initSquad,
        starting_lane: minStartLane - 1
      }
      expect(validLanes(invalidSquad)).toBe(false);
    })
    it('valid lanes: squad.strarting_lane = maxStartLane + 1', () => {
      const invalidSquad = {
        ...initSquad,
        starting_lane: maxStartLane + 1
      }
      expect(validLanes(invalidSquad)).toBe(false);
    })
    it('valid lanes: squad.starting is even', () => {
      const invalidSquad = {
        ...initSquad,
        starting_lane: 2,
      }
      expect(validLanes(invalidSquad)).toBe(false);
    })
    it('valid lanes: squad.laneCount = minLaneCount - 1', () => {
      const invalidSquad = {
        ...initSquad,
        lane_count: minLaneCount - 1
      }
      expect(validLanes(invalidSquad)).toBe(false);
    })
    it('valid lanes: squad.laneCount = maxLaneCount + 1', () => {
      const invalidSquad = {
        ...initSquad,
        lane_count: maxLaneCount + 1
      }
      expect(validLanes(invalidSquad)).toBe(false);
    })
    it('valid lanes: squad.laneCount is odd', () => {
      const invalidSquad = {
        ...initSquad,
        lane_count: 9
      }
      expect(validLanes(invalidSquad)).toBe(false);
    })
  })

  describe('updatedLanes(lanes, squad', () => { 

    describe('updatedLanes - one squad', () => { 
      let testSquads: squadType[] = [];
      let testLanes: laneType[] = [];

      beforeEach(() => {
        testSquads = [
          {
            ...initSquad,
            starting_lane: 1,
            lane_count: 10
          }
        ];
        testLanes = [];        
      })

      it('updatedLanes - one squad - lanes length', () => {
        const updated = updatedLanes(testLanes, testSquads[0]);
        expect(updated).toHaveLength(testSquads[0].lane_count);      
      })
      it('updatedLanes - one squad - lanes values', () => {
        const updated = updatedLanes(testLanes, testSquads[0]);
        expect(updated[0].lane_number).toEqual(testSquads[0].starting_lane);
        expect(updated[testSquads[0].lane_count - 1].lane_number).toEqual(testSquads[0].starting_lane + testSquads[0].lane_count - 1);
        expect(updated[testSquads[0].lane_count - 1].lane_number).toEqual(10);
      })
      it('updatedLanes - one squad - change starting lane', () => {        
        testSquads[0].starting_lane = 5;
        const updated = updatedLanes(testLanes, testSquads[0]);
        expect(updated[0].lane_number).toEqual(testSquads[0].starting_lane);
        expect(updated[0].lane_number).toEqual(5);
        expect(updated[testSquads[0].lane_count - 1].lane_number).toEqual(testSquads[0].starting_lane + testSquads[0].lane_count - 1);
        expect(updated[testSquads[0].lane_count - 1].lane_number).toEqual(14);
      })
      it('updatedLanes - one squad - change lane count', () => {        
        testSquads[0].lane_count = 12;
        const updated = updatedLanes(testLanes, testSquads[0]);
        expect(updated[0].lane_number).toEqual(testSquads[0].starting_lane);
        expect(updated[0].lane_number).toEqual(1);
        expect(updated[testSquads[0].lane_count - 1].lane_number).toEqual(testSquads[0].starting_lane + testSquads[0].lane_count - 1);
        expect(updated[testSquads[0].lane_count - 1].lane_number).toEqual(12);
      })
      it('updatedLanes - one squad - no lanes', () => {
        testLanes = [];
        const updated = updatedLanes(testLanes, testSquads[0]);
        expect(updated).toHaveLength(10);
        expect(updated[0].lane_number).toEqual(1);
        expect(updated[9].lane_number).toEqual(10);
      })
    })
    
    describe('updatedLanes - two squads', () => { 
      let testSquads: squadType[] = [];
      let testLanes: laneType[] = [];
      beforeEach(() => {
        testSquads = [...mockSquads];  
        testLanes = [...mockLanes];
      })      

      it('updatedLanes - one squad - change starting lane on squad 1', () => {        
        testSquads[0].starting_lane = 5;
        const updated = updatedLanes(testLanes, testSquads[0]);
        expect(updated).toHaveLength(testSquads[0].lane_count + testSquads[1].lane_count);
        expect(updated).toHaveLength(30);
        // test lanes now have squad 2 lanes, then squad 1 lanes
        expect(updated[0].lane_number).toEqual(testSquads[1].starting_lane);
        expect(updated[0].lane_number).toEqual(1);
        expect(updated[testSquads[1].lane_count - 1].lane_number).toEqual(testSquads[1].starting_lane + testSquads[1].lane_count - 1);        
        expect(updated[testSquads[1].lane_count - 1].lane_number).toEqual(10);
        expect(updated[testSquads[1].lane_count].lane_number).toEqual(testSquads[0].starting_lane);
        expect(updated[testSquads[1].lane_count].lane_number).toEqual(5);
        expect(updated[updated.length - 1].lane_number).toEqual(testSquads[0].starting_lane + testSquads[0].lane_count - 1);
        expect(updated[updated.length-1].lane_number).toEqual(24);
      })
      it('updatedLanes - one squad - change starting lane on squad 1', () => { 
        testSquads[0].starting_lane = 1;
        testSquads[0].lane_count = 2;
        testSquads[0].starting_lane = 1;
        testSquads[0].lane_count = 2;
        testLanes = [
          {
            id: '1',
            lane_number: 1,
            squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',
            in_use: true,
          },
          {
            id: '2',
            lane_number: 2,
            squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',
            in_use: true,
          },
          {
            id: '3',
            lane_number: 1,
            squad_id: 'sqd_c14918f162ac4acfa3ade3fdf90f17b6',
            in_use: true,
          },
          {
            id: '4',
            lane_number: 2,
            squad_id: 'sqd_c14918f162ac4acfa3ade3fdf90f17b6',
            in_use: true,
          }
        ];
        testSquads[0].lane_count = 20;
        const updated = updatedLanes(testLanes, testSquads[0]);
        expect(updated).toHaveLength(22);
        expect(updated[0].lane_number).toEqual(1);
        expect(updated[1].lane_number).toEqual(2);
        expect(updated[2].lane_number).toEqual(1);
        expect(updated[3].lane_number).toEqual(2);
        expect(updated[updated.length - 1].lane_number).toEqual(20);
      })       
    })

  })

  describe('render just one squad', () => { 

    const mockSquad: squadType[] = [
      {
        ...mockSquads[0],
        squad_time: "",
      }
    ]
    const mockSquadProps = {
      squads: mockSquad,
      setSquads: mockSetSquads,
      lanes: mockLanes,
      setLanes: mockSetLanes,
      events: mockEvents,
      setAcdnErr: mockSetAcdnErr,
      isDisabled: false,
    };
    
    it('render number of squads', () => { 
      render(<OneToNSquads {...mockSquadProps} />);      
      const squadNum = screen.getByRole('textbox', { name: /# squads/i }) as HTMLInputElement;
      expect(squadNum).toBeInTheDocument();
      expect(squadNum).toHaveValue("1");
      expect(squadNum).toBeDisabled();
    })
    it('render squad names', () => {
      render(<OneToNSquads {...mockSquadProps} />);      
      const squadNames = screen.getAllByRole("textbox", { name: /squad name/i }) as HTMLInputElement[];
      expect(squadNames).toHaveLength(1);
      expect(squadNames[0]).toHaveValue(mockSquad[0].squad_name);
    })
    it('render the starting lane', () => { 
      render(<OneToNSquads {...mockSquadProps} />);      
      const startingLanes = screen.getAllByRole("spinbutton", { name: /starting lane/i }) as HTMLInputElement[];
      expect(startingLanes).toHaveLength(1);
      expect(startingLanes[0]).toHaveValue(mockSquad[0].starting_lane);
    })
    it('render the lane count', () => { 
      render(<OneToNSquads {...mockSquadProps} />);      
      const laneCounts = screen.getAllByRole("spinbutton", { name: /# of lanes/i }) as HTMLInputElement[];
      expect(laneCounts).toHaveLength(1);
      expect(laneCounts[0]).toHaveValue(mockSquad[0].lane_count);
    })
    it('render the squad date', () => { 
      render(<OneToNSquads {...mockSquadProps} />);            
      const squadDates = screen.getAllByLabelText(/date/i) as HTMLInputElement[];
      expect(squadDates).toHaveLength(1);
      expect(squadDates[0]).toHaveValue(mockSquad[0].squad_date_str);
    })
    it('render start times', () => { 
      render(<OneToNSquads {...mockSquadProps} />);      
      const squadTimes = screen.getAllByLabelText(/start time/i) as HTMLInputElement[];        
      expect(squadTimes).toHaveLength(1);
      expect(squadTimes[0]).toHaveValue(mockSquad[0].squad_time);
      expect(squadTimes[0]).toHaveValue('');
    })
    it("render the tabs", async () => {
      const user = userEvent.setup();
      render(<OneToNSquads {...mockSquadProps} />);
      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[0]); // focus on first tab
      expect(tabs).toHaveLength(1);
      expect(tabs[0]).toHaveTextContent(mockSquad[0].tab_title);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });
  })

  describe("render the component - 2 squads", () => {

    describe('render the 1st squad', () => { 
      
      it('render squads label', () => { 
        // ARRANGE
        // const user = userEvent.setup()
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        // ACT
        const eventLabel = screen.getByLabelText("# Squads");
        // ASSERT
        expect(eventLabel).toBeInTheDocument();
      })
      it('render number of squads', () => { 
        render(<OneToNSquads {...mockOneToNSquadsProps} />);        
        const squadNum = screen.getByRole('textbox', { name: /# squads/i }) as HTMLInputElement;
        expect(squadNum).toBeInTheDocument();
        expect(squadNum).toHaveValue('2');
        expect(squadNum).toBeDisabled();
      })
      it("render add button", () => {
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const addBtn = screen.getByRole("button", { name: /add/i });        
        expect(addBtn).toBeInTheDocument();
      });
      it('render squad name labels', () => { 
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const nameLabels = screen.getAllByText("Squad Name");
        expect(nameLabels).toHaveLength(2);
      })
      it('render squad names', () => {
        render(<OneToNSquads {...mockOneToNSquadsProps} />);        
        const squadNames = screen.getAllByRole("textbox", { name: /squad name/i }) as HTMLInputElement[];
        expect(squadNames).toHaveLength(2);
        expect(squadNames[0]).toHaveValue(mockSquads[0].squad_name);
      })
      it('DO NOT render event name errors', () => { 
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const squadNameErrs = screen.queryAllByTestId("dangerSquadName");
        expect(squadNameErrs).toHaveLength(2);
        expect(squadNameErrs[0]).toHaveTextContent("");
      })
      it('render squad games labels', () => { 
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const gameLabels = screen.getAllByText("Squad Games");
        expect(gameLabels).toHaveLength(2);
      })
      it('render squad games', () => {
        render(<OneToNSquads {...mockOneToNSquadsProps} />);        
        const squadGames = screen.getAllByRole("spinbutton", { name: /squad games/i }) as HTMLInputElement[];
        expect(squadGames).toHaveLength(2);
        expect(squadGames[0]).toHaveValue(mockSquads[0].games);
      })
      it('DO NOT render squad games errors', () => {
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const squadGameErrs = screen.queryAllByTestId("dangerSquadGames");
        expect(squadGameErrs).toHaveLength(2);
        expect(squadGameErrs[0]).toHaveTextContent("");
      })
      it('render squad events labels', () => { 
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const eventLabels = screen.getAllByText("Event");
        expect(eventLabels).toHaveLength(2);
      })
      it('render squad events', () => {
        render(<OneToNSquads {...mockOneToNSquadsProps} />);        
        const squadEvents = screen.getAllByRole("combobox", { name: /event/i }) as HTMLInputElement[];
        expect(squadEvents).toHaveLength(2);        
        expect(squadEvents[0]).toHaveValue(mockEvents[0].id);
      })
      it('DO NOT render squad events errors', () => {
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const squadEventErrs = screen.queryAllByTestId("dangerSquadEvent");
        expect(squadEventErrs).toHaveLength(2);
        expect(squadEventErrs[0]).toHaveTextContent("");
      })
      it('render the starting lane label', () => { 
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const startingLaneLabels = screen.getAllByText('Starting Lane');
        expect(startingLaneLabels).toHaveLength(2);
        expect(startingLaneLabels[0]).toBeInTheDocument();
      })
      it('render the starting lane', () => {
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const startingLanes = screen.getAllByRole("spinbutton", { name: /starting lane/i }) as HTMLInputElement[];
        expect(startingLanes).toHaveLength(2);
        expect(startingLanes[0]).toHaveValue(mockSquads[0].starting_lane);
      })
      it('DO NOT render starting lane errors', () => { 
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const startingLaneErrs = screen.queryAllByTestId("dangerStartingLane");
        expect(startingLaneErrs).toHaveLength(2);
        expect(startingLaneErrs[0]).toHaveTextContent("");
      })
      it('render the number of lanes label with space before help icon', () => { 
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const lanesLabels = screen.getAllByText(/# of lanes/i, { selector: "label" });
        expect(lanesLabels).toHaveLength(2);
        const label = lanesLabels[0] as HTMLLabelElement;
        const text = label.textContent ?? "";
        expect(text).toMatch(/# of Lanes\s+\?/i);
      })
      it('render the number of lanes help icon with surrounding spaces', () => { 
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const lanesLabels = screen.getAllByText(/# of lanes/i, { selector: "label" });
        expect(lanesLabels).toHaveLength(2);

        const label = lanesLabels[0] as HTMLLabelElement;
        const helpSpan = within(label).getByText("?", { selector: "span" });
        expect(helpSpan).toBeInTheDocument();
        expect(helpSpan).toHaveClass("popup-help");

        const text = helpSpan.textContent ?? "";
        // one or more spaces, then '?', then one or more spaces
        expect(text).toMatch(/^\s+\?\s+$/); 
      })
      it('render the # of lanes', () => {
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const numberOfLanes = screen.getAllByRole("spinbutton", { name: /# of lanes/i }) as HTMLInputElement[];
        expect(numberOfLanes).toHaveLength(2);
        expect(numberOfLanes[0]).toHaveValue(mockSquads[0].lane_count);
      })
      it('DO NOT render lane count errors', () => { 
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const numLanesErrs = screen.queryAllByTestId("dangerLaneCount");
        expect(numLanesErrs).toHaveLength(2);
        expect(numLanesErrs[0]).toHaveTextContent("");
      })
      it('render squad date labels', () => { 
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const dateLabels = screen.getAllByText("Date");
        expect(dateLabels).toHaveLength(2);
      })
      it('render squad dates', () => {
        render(<OneToNSquads {...mockOneToNSquadsProps} />);        
        const squadDates = screen.getAllByLabelText(/date/i) as HTMLInputElement[];
        expect(squadDates).toHaveLength(2);
        expect(squadDates[0]).toHaveValue(mockSquads[0].squad_date_str);
      })
      it('DO NOT render squad dates errors', () => {
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const squadDateErrs = screen.queryAllByTestId("dangerSquadDate");
        expect(squadDateErrs).toHaveLength(2);
        expect(squadDateErrs[0]).toHaveTextContent("");
      })
      it('render start time labels', () => {
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const timeLabels = screen.getAllByText("Start Time");
        expect(timeLabels).toHaveLength(2);
      })
      it('render start times', () => { 
        render(<OneToNSquads {...mockOneToNSquadsProps} />);        
        const squadTimes = screen.getAllByLabelText(/start time/i) as HTMLInputElement[];        
        expect(squadTimes).toHaveLength(2);
        expect(squadTimes[0]).toHaveValue(mockSquads[0].squad_time);
      })
      it('DO NOT render squad times errors', () => {
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const squadTimeErrs = screen.queryAllByTestId("dangerSquadTime");
        expect(squadTimeErrs).toHaveLength(2);
        expect(squadTimeErrs[0]).toHaveTextContent("");
      })
    })

    describe('render the 2nd squad', () => { 
      beforeAll(() => {
        mockSquads[1].event_id_err = 'test event error';
        mockSquads[1].squad_date_err = 'test date error';
        mockSquads[1].squad_time_err = 'test time error';
        mockSquads[1].games_err = 'test games error';
        mockSquads[1].squad_name_err = 'test name error';
        mockSquads[1].starting_lane_err = 'test starting lane error';
        mockSquads[1].lane_count_err = 'test lane count error';
      })
      afterAll(() => {
        mockSquads[1].event_id_err = '';
        mockSquads[1].squad_date_err = '';
        mockSquads[1].squad_time_err = '';
        mockSquads[1].games_err = '';
        mockSquads[1].squad_name_err = '';
        mockSquads[1].starting_lane_err = '';
        mockSquads[1].lane_count_err = '';
      })
      it("render the 2nd squad", async () => {
        // ARRANGE
        const user = userEvent.setup();
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        // ACT
        const tabs = screen.getAllByRole("tab");
        // ARRANGE
        expect(tabs).toHaveLength(2);
        // ARRANGE
        await user.click(tabs[1]);

        // ASSERT
        expect(tabs).toHaveLength(2);
        expect(tabs[0]).toHaveAttribute("aria-selected", "false"),
        expect(tabs[1]).toHaveAttribute("aria-selected", "true");
      });
      it("render delete button", async () => {
        const user = userEvent.setup();
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const tabs = screen.getAllByRole("tab");
        expect(tabs).toHaveLength(2);
        await user.click(tabs[1]);        
        const delBtn = screen.getByText("Delete Squad");
        expect(delBtn).toBeInTheDocument();
      });
      it('render squad names', async () => {
        const user = userEvent.setup();
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const squadNames = screen.getAllByRole("textbox", { name: /squad name/i }) as HTMLInputElement[];
        expect(squadNames).toHaveLength(2);
        expect(squadNames[1]).toHaveClass("is-invalid");
        expect(squadNames[1]).toHaveValue(mockSquads[1].squad_name);
      })
      it("render 2nd squad name errors", async () => {
        const user = userEvent.setup();
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const nameErrors = screen.queryAllByTestId("dangerSquadName");
        expect(nameErrors).toHaveLength(2);
        expect(nameErrors[1]).toHaveTextContent("test name error");
      });
      it('render squad games', async () => {
        const user = userEvent.setup();
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);        
        const squadGames = screen.getAllByRole("spinbutton", { name: /squad games/i }) as HTMLInputElement[];
        expect(squadGames).toHaveLength(2);
        expect(squadGames[1]).toHaveClass("is-invalid");
        expect(squadGames[1]).toHaveValue(mockSquads[1].games);
      })
      it("render 2nd squad game errors", async () => {
        const user = userEvent.setup();
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const nameErrors = screen.queryAllByTestId("dangerSquadGames");
        expect(nameErrors).toHaveLength(2);
        expect(nameErrors[1]).toHaveTextContent("test games error");
      });
      it('render squad events', async () => {
        const user = userEvent.setup();
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);        
        const squadEvents = screen.getAllByRole("combobox", { name: /event/i }) as HTMLInputElement[];
        expect(squadEvents).toHaveLength(2);
        expect(squadEvents[1]).toHaveClass("is-invalid");
        expect(squadEvents[1]).toHaveValue(mockEvents[1].id);
      })
      it("render 2nd squad event errors", async () => {
        const user = userEvent.setup();
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const eventErrors = screen.queryAllByTestId("dangerSquadEvent");
        expect(eventErrors).toHaveLength(2);
        expect(eventErrors[1]).toHaveTextContent("test event error");
      });
      it('render the 2nd squad starting lane', async () => {
        const user = userEvent.setup();
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);        
        const startingLanes = screen.getAllByRole("spinbutton", { name: /starting lane/i }) as HTMLInputElement[];
        expect(startingLanes).toHaveLength(2);
        expect(startingLanes[1]).toHaveClass("is-invalid");
        expect(startingLanes[1]).toHaveValue(mockSquads[1].starting_lane);
      })
      it("render 2nd squad starting lane error", async () => {
        const user = userEvent.setup();
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const staringLaneErrors = screen.queryAllByTestId("dangerStartingLane");
        expect(staringLaneErrors).toHaveLength(2);
        expect(staringLaneErrors[1]).toHaveTextContent("test starting lane error");
      });
      it('render 2nd squad lane count error', async () => {
        const user = userEvent.setup();
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const laneCountErrors = screen.queryAllByTestId("dangerLaneCount");
        expect(laneCountErrors).toHaveLength(2);
        expect(laneCountErrors[1]).toHaveTextContent("test lane count error");
      })
      it('render 2nd squad dates', async () => {
        const user = userEvent.setup();
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);        
        const squadDates = screen.getAllByLabelText(/date/i) as HTMLInputElement[];
        expect(squadDates).toHaveLength(2);
        expect(squadDates[1]).toHaveClass("is-invalid");
        expect(squadDates[1]).toHaveValue(mockSquads[1].squad_date_str);
      })
      it("render 2nd squad date errors", async () => {
        const user = userEvent.setup();
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const dateErrors = screen.queryAllByTestId("dangerSquadDate");
        expect(dateErrors).toHaveLength(2);
        expect(dateErrors[1]).toHaveTextContent("test date error");
      });
      it('render start times', async () => { 
        const user = userEvent.setup();
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);        
        const squadTimes = screen.getAllByLabelText(/start time/i) as HTMLInputElement[];        
        expect(squadTimes).toHaveLength(2);
        expect(squadTimes[1]).toHaveClass("is-invalid");
        expect(squadTimes[1]).toHaveValue(mockSquads[1].squad_time);
      })
      it("render 2nd squad date errors", async () => {
        const user = userEvent.setup();
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const timeErrors = screen.queryAllByTestId("dangerSquadTime");
        expect(timeErrors).toHaveLength(2);
        expect(timeErrors[1]).toHaveTextContent("test time error");
      });
    })

    describe('render the squads when isDiabled is true - inputs and buttons disabled', () => {
      const runTmntProps = cloneDeep(mockOneToNSquadsProps);
      runTmntProps.isDisabled = true;
      it('render number of squads', () => {
        render(<OneToNSquads {...runTmntProps} />);
        const squadNum = screen.getByRole('textbox', { name: /# squads/i }) as HTMLInputElement;
        expect(squadNum).toBeInTheDocument();
        expect(squadNum).toHaveValue('2');
        expect(squadNum).toBeDisabled();
      })
      it("render add button", () => {
        render(<OneToNSquads {...runTmntProps} />);
        const addBtn = screen.getByRole("button", { name: /add/i });
        expect(addBtn).toBeInTheDocument();
        expect(addBtn).toBeDisabled();
      });
      it("render delete button", () => {
        render(<OneToNSquads {...runTmntProps} />);
        const delBtn = screen.getByRole("button", { name: /delete/i });
        expect(delBtn).toBeInTheDocument();
        expect(delBtn).toBeDisabled();
      });
      it('render squad names', () => {
        render(<OneToNSquads {...runTmntProps} />);
        const squadNames = screen.getAllByRole("textbox", { name: /squad name/i }) as HTMLInputElement[];
        expect(squadNames).toHaveLength(2);
        expect(squadNames[0]).toBeDisabled();
        expect(squadNames[1]).toBeDisabled();
      })
      it('render squad games', () => {
        render(<OneToNSquads {...runTmntProps} />);
        const squadGames = screen.getAllByRole("spinbutton", { name: /squad games/i }) as HTMLInputElement[];
        expect(squadGames).toHaveLength(2);
        expect(squadGames[0]).toBeDisabled();
        expect(squadGames[1]).toBeDisabled();
      })
      it('render squad events', () => {
        render(<OneToNSquads {...runTmntProps} />);
        const squadEvents = screen.getAllByRole("combobox", { name: /event/i }) as HTMLInputElement[];
        expect(squadEvents).toHaveLength(2);
        expect(squadEvents[0]).toBeDisabled();
        expect(squadEvents[1]).toBeDisabled();
      })
      it('render the starting lane', () => {
        render(<OneToNSquads {...runTmntProps} />);
        const startingLanes = screen.getAllByRole("spinbutton", { name: /starting lane/i }) as HTMLInputElement[];
        expect(startingLanes).toHaveLength(2);
        expect(startingLanes[0]).toBeDisabled();
        expect(startingLanes[1]).toBeDisabled();
      })
      it('render the # of lanes', () => {
        render(<OneToNSquads {...runTmntProps} />);
        const numberOfLanes = screen.getAllByRole("spinbutton", { name: /# of lanes/i }) as HTMLInputElement[];
        expect(numberOfLanes).toHaveLength(2);
        expect(numberOfLanes[0]).toBeDisabled();
        expect(numberOfLanes[1]).toBeDisabled();
      })
      it('render squad dates', () => {
        render(<OneToNSquads {...runTmntProps} />);
        const squadDates = screen.getAllByLabelText(/date/i) as HTMLInputElement[];
        expect(squadDates).toHaveLength(2);
        expect(squadDates[0]).toBeDisabled();
        expect(squadDates[1]).toBeDisabled();
      })
      it('render start times', () => {
        render(<OneToNSquads {...runTmntProps} />);
        const squadTimes = screen.getAllByLabelText(/start time/i) as HTMLInputElement[];
        expect(squadTimes).toHaveLength(2);
        expect(squadTimes[0]).toBeDisabled();
        expect(squadTimes[1]).toBeDisabled();
      })

    })

  });

})