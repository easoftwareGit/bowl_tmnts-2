import React, { act }  from "react";
import { fireEvent, render, screen, waitForElementToBeRemoved, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OneToNSquads from "@/app/dataEntry/tmntForm/oneToNSquads";
import { mockLanes, mockSquads } from "../../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { mockEvents } from "../../../../mocks/tmnts/singlesAndDoubles/mockEvents";
import { initSquad } from "@/lib/db/initVals";
import type { laneType, squadType } from "@/lib/types/types";
import { cloneDeep } from "lodash";
import { noAcdnErr } from "@/app/dataEntry/tmntForm/errors";

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

describe("OneToNSquads - interactions", () => { 

  describe("render the component - 2 squads", () => {

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

    describe('render the tabs', () => {
      it("render the tabs", async () => {
        const user = userEvent.setup();
        render(<OneToNSquads {...mockOneToNSquadsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[0]); // focus on first tab
        expect(tabs[0]).toHaveTextContent(mockEvents[0].tab_title);
        expect(tabs[0]).toHaveAttribute("aria-selected", "true");
        expect(tabs[1]).toHaveTextContent(mockEvents[1].tab_title);
        expect(tabs[1]).toHaveAttribute("aria-selected", "false");
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

    describe('render the popup-help text', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      })
      afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
      })
      it("only shows the # of Lanes tooltip while the help icon is hovered", async () => {
        const tooltipRegex = /Number of lanes used in the squad/i;

        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        render(<OneToNSquads {...mockOneToNSquadsProps} />);

        // 1) BEFORE HOVER – tooltip is NOT in the document
        expect(screen.queryByText(tooltipRegex)).not.toBeInTheDocument();

        const lanesLabels = screen.getAllByText(/# of Lanes/i, { selector: "label" });
        expect(lanesLabels).toHaveLength(2);
        const label = lanesLabels[0] as HTMLLabelElement;
        const helpSpan = within(label).getByText("?", { selector: "span" });

        // 2) HOVER OVER help icon
        await user.hover(helpSpan);
        act(() => {
          jest.advanceTimersByTime(300); // > 250ms show delay
        });

        const tooltip = await screen.findByText(tooltipRegex);
        expect(tooltip).toBeInTheDocument();

        // 3) UNHOVER – tooltip disappears after hide delay (1000ms)
        await user.unhover(helpSpan);
        act(() => {
          jest.advanceTimersByTime(1000); // > 250ms show delay
        });
        await waitForElementToBeRemoved(() => screen.queryByText(tooltipRegex));
      });
    });

  });

  describe('render the tabs', () => {
    it("render the tabs", async () => {
      const user = userEvent.setup();
      render(<OneToNSquads {...mockOneToNSquadsProps} />);
      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[0]); // focus on first tab
      expect(tabs[0]).toHaveTextContent(mockEvents[0].tab_title);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      expect(tabs[1]).toHaveTextContent(mockEvents[1].tab_title);
      expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    });      
  })

  describe('render the popup-help text', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    })
    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    })
    it("only shows the # of Lanes tooltip while the help icon is hovered", async () => {
      const tooltipRegex = /Number of lanes used in the squad/i;

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<OneToNSquads {...mockOneToNSquadsProps} />);

      // 1) BEFORE HOVER – tooltip is NOT in the document
      expect(screen.queryByText(tooltipRegex)).not.toBeInTheDocument();

      const lanesLabels = screen.getAllByText(/# of Lanes/i, { selector: "label" });
      expect(lanesLabels).toHaveLength(2);
      const label = lanesLabels[0] as HTMLLabelElement;
      const helpSpan = within(label).getByText("?", { selector: "span" });

      // 2) HOVER OVER help icon
      await user.hover(helpSpan);
      act(() => {
        jest.advanceTimersByTime(300); // > 250ms show delay
      });

      const tooltip = await screen.findByText(tooltipRegex);
      expect(tooltip).toBeInTheDocument();

      // 3) UNHOVER – tooltip disappears after hide delay (1000ms)
      await user.unhover(helpSpan);
      act(() => {
        jest.advanceTimersByTime(1000); // > 250ms show delay
      });
      await waitForElementToBeRemoved(() => screen.queryByText(tooltipRegex));
    });
  });

  describe("add squad", () => {
    it("test if added event has correct tab title", async () => {
      const toAddProps = cloneDeep(mockOneToNSquadsProps);
      const mockSquadsForAdd = cloneDeep(mockSquads);  
      mockSquadsForAdd.push({
        ...initSquad,
        id: "3",
        sort_order: 3,
        squad_name: "Trios",
        tab_title: "Trios",
        event_id: 'evt_6ff6774e94884658be5bdebc68a6aa7c',
      });
      toAddProps.squads = mockSquadsForAdd;

      // ARRANGE
      const user = userEvent.setup();
      render(<OneToNSquads {...toAddProps} />);
      const addBtn = screen.getByText("Add");
      // ACT
      await user.click(addBtn);
      // ASSERT
      expect(toAddProps.setSquads).toHaveBeenCalled();

      // ACT
      const tabs = screen.getAllByRole("tab");
      // ASSERT
      expect(tabs.length).toBe(3);
      expect(tabs[2]).toHaveTextContent("Trios");

      // ARRANGE
      const squadNames = screen.getAllByRole("textbox", { name: /squad name/i }) as HTMLInputElement[];
      const squadGames = screen.getAllByRole("spinbutton", { name: /squad games/i }) as HTMLInputElement[];
      const squadEvents = screen.getAllByRole("combobox", { name: /event/i }) as HTMLInputElement[];
      const startingLanes = screen.getAllByRole("spinbutton", { name: /starting lane/i }) as HTMLInputElement[];
      const squadLanes = screen.getAllByRole("spinbutton", { name: /# of lanes/i }) as HTMLInputElement[];
      const squadDates = screen.getAllByLabelText(/date/i) as HTMLInputElement[];
      const squadTimes = screen.getAllByLabelText(/time/i) as HTMLInputElement[];

      // ASSERT
      expect(mockSquadsForAdd).toHaveLength(3);
      expect(squadNames[2]).toHaveValue(mockSquadsForAdd[2].squad_name);
      expect(squadGames[2]).toHaveValue(mockSquadsForAdd[2].games);
      expect(squadEvents[2]).toHaveValue(mockSquadsForAdd[2].event_id);
      expect(startingLanes[2]).toHaveValue(mockSquadsForAdd[2].starting_lane);
      expect(squadLanes[2]).toHaveValue(mockSquadsForAdd[2].lane_count);
      expect(squadDates[2].value as string).toBe(mockSquadsForAdd[2].squad_date_str);
      expect(squadTimes[2].value).toBe(mockSquadsForAdd[2].squad_time);
    });

    it("Add Squad calls setSquads with a new squad having correct defaults", async () => {
      const toAddProps = cloneDeep(mockOneToNSquadsProps);
      const mockSquadsForAdd = cloneDeep(mockSquads);  
      toAddProps.squads = mockSquadsForAdd;

      const user = userEvent.setup();
      const setSquads = jest.fn();

      render(
        <OneToNSquads
          {...toAddProps}
          setSquads={setSquads}
        />
      );

      const addBtn = screen.getByText("Add");
      await user.click(addBtn);

      expect(setSquads).toHaveBeenCalled();
      const [updatedSquads] = setSquads.mock.calls.at(-1) as [squadType[]];

      expect(updatedSquads).toHaveLength(mockSquads.length + 1);
      const newSquad = updatedSquads[updatedSquads.length - 1];
      expect(newSquad.squad_name).toBe("Squad 3"); // default 3rd squad name      
    });    
  })

  describe('delete squad', () => { 

    it('delete squad', async () => { 
      const user = userEvent.setup();

      const toDelProps = cloneDeep(mockOneToNSquadsProps);
      const localSquads = cloneDeep(mockSquads);  
      const squadToDeleteId = "3";
      localSquads.push({
        ...initSquad,
        id: squadToDeleteId,
        sort_order: 3,
        squad_name: "Trios",
        tab_title: "Trios",
        event_id: 'evt_6ff6774e94884658be5bdebc68a6aa7c',
      });
      toDelProps.squads = localSquads;           
      const localSetSquads = jest.fn();
      
      const props = {
        ...toDelProps,
        setSquads: localSetSquads
      }
      render(<OneToNSquads{...props} />);      
      
      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);
      // go to the 3rd tab - last squad - trios
      await user.click(tabs[2]);

      const delBtns = screen.getAllByText("Delete Squad");      
      expect(delBtns.length).toBe(2);

      // click the 2nd delete button - one for trios squad
      await user.click(delBtns[1]);

      // This should open the confirm modal (ModalConfirm)
      const dialog = await screen.findByRole("dialog");

      // Inside the dialog, click the [yes] button      
      const yesBtn = within(dialog).getByRole("button", { name: /yes/i });
      await user.click(yesBtn);

      // Now the component should have called setSquads with the filtered array
      expect(localSetSquads).toHaveBeenCalledTimes(1);
      const [updatedSquads] = localSetSquads.mock.calls[0] as [typeof localSquads];
      
      // The squad should be deleted
      expect(updatedSquads).toHaveLength(localSquads.length - 1);
      expect(updatedSquads.some((s) => s.id === squadToDeleteId)).toBe(false);
    })

    it('delete squad - lanes updated', async () => { 
      const user = userEvent.setup();

      const toDelProps = cloneDeep(mockOneToNSquadsProps);
      const localSquads = cloneDeep(mockSquads);  
      const squadToDeleteId = "3";
      localSquads.push({
        ...initSquad,
        id: squadToDeleteId,
        sort_order: 3,
        starting_lane: 31,
        lane_count: 4,
        squad_name: "Trios",
        tab_title: "Trios",
        event_id: 'evt_6ff6774e94884658be5bdebc68a6aa7c',
      });
      const localLanes = cloneDeep(mockLanes);
      localLanes.push(
        {
          id: "31",
          lane_number: 31,
          squad_id: squadToDeleteId,
          in_use: true,
        },
        {
          id: "32",
          lane_number: 32,
          squad_id: squadToDeleteId,
          in_use: true,
        },
        {
          id: "33",
          lane_number: 33,
          squad_id: squadToDeleteId,
          in_use: true,
        },
        {
          id: "34",
          lane_number: 34,
          squad_id: squadToDeleteId,
          in_use: true,
        }
      )
      toDelProps.squads = localSquads;     
      toDelProps.lanes = localLanes;
      const localSetSquads = jest.fn();
      const localSetLanes = jest.fn();
      
      const props = {
        ...toDelProps,
        setSquads: localSetSquads,
        setLanes: localSetLanes
      }
      render(<OneToNSquads{...props} />);      
      
      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);
      // go to the 3rd tab - last squad - trios
      await user.click(tabs[2]);

      const delBtns = screen.getAllByText("Delete Squad");      
      expect(delBtns.length).toBe(2);

      // click the 2nd delete button - one for trios squad
      await user.click(delBtns[1]);

      // This should open the confirm modal (ModalConfirm)
      const dialog = await screen.findByRole("dialog");

      // Inside the dialog, click the [yes] button      
      const yesBtn = within(dialog).getByRole("button", { name: /yes/i });
      await user.click(yesBtn);

      // Now the component should have called setLanes with the filtered array
      expect(localSetLanes).toHaveBeenCalledTimes(1);
      const [updatedLanes] = localSetLanes.mock.calls[0] as [typeof localLanes];
      
      // The squad lanes should be deleted
      expect(updatedLanes).toHaveLength(localLanes.length - 4); // deleted 4 lanes
      expect(updatedLanes.some((sl) => sl.squad_id === squadToDeleteId)).toBe(false);
    })
    
    it("deleting down to a single squad clears 'Time is required' and accordion error", async () => {
      const user = userEvent.setup();

      const s1 = { ...mockSquads[0], squad_time_err: "" };
      const s2 = { ...mockSquads[1], squad_time_err: "Time is required" };

      const localSquads = [s1, s2];
      const setSquads = jest.fn();
      const setAcdnErr = jest.fn();

      render(
        <OneToNSquads
          {...mockOneToNSquadsProps}
          squads={localSquads}
          setSquads={setSquads}
          setAcdnErr={setAcdnErr}
        />
      );

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(2);
      await user.click(tabs[1]);      // select 2nd squad

      const delBtns = screen.getAllByText("Delete Squad");
      expect(delBtns.length).toBe(1); // only 1 delete button, 1st squad no delete button
      await user.click(delBtns[0]);

      const dialog = await screen.findByRole("dialog");
      const yesBtn = within(dialog).getByRole("button", { name: /yes/i });
      await user.click(yesBtn);

      // Last call to setSquads should contain a single squad with cleared time_err
      const [updatedSquads] = setSquads.mock.calls.at(-1) as [squadType[]];
      expect(updatedSquads).toHaveLength(1);
      expect(updatedSquads[0].squad_time_err).toBe("");

      // And accordion error should be cleared
      const lastAcdnCall = setAcdnErr.mock.calls.at(-1)?.[0];
      expect(lastAcdnCall).toEqual(noAcdnErr);
    });

    it("clicking 'No' in delete confirm does not call setSquads or setLanes", async () => {
      const user = userEvent.setup();
      const setSquads = jest.fn();
      const setLanes = jest.fn();

      const localSquads = cloneDeep(mockSquads);
      localSquads.push({
        ...initSquad,
        id: "3",
        sort_order: 3,
        squad_name: "Trios",
        tab_title: "Trios",
        event_id: mockEvents[0].id,
      });

      render(
        <OneToNSquads
          {...mockOneToNSquadsProps}
          squads={localSquads}
          setSquads={setSquads}
          setLanes={setLanes}
        />
      );

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);
      await user.click(tabs[2]);

      const delBtns = screen.getAllByText("Delete Squad");
      await user.click(delBtns[1]);

      const dialog = await screen.findByRole("dialog");
      const noBtn = within(dialog).getByRole("button", { name: /no/i });
      await user.click(noBtn);

      expect(setSquads).not.toHaveBeenCalled();
      expect(setLanes).not.toHaveBeenCalled();
    });

  })

  describe('editing fields - clears errors', () => { 
    it("editing squad name updates squads and clears squad_name_err", async () => {
      const user = userEvent.setup();
      const localSquads = cloneDeep(mockSquads);
      localSquads[0].squad_name_err = "Squad Name is required";

      const setSquads = jest.fn();
      render(
        <OneToNSquads
          {...mockOneToNSquadsProps}
          squads={localSquads}
          setSquads={setSquads}
        />
      );

      const nameInputs = screen.getAllByRole("textbox", { name: /squad name/i });
      fireEvent.change(nameInputs[0], { target: { value: "New Name" } });

      expect(setSquads).toHaveBeenCalled();
      const [updatedSquads] = setSquads.mock.calls.at(-1) as [squadType[]];

      const sq0 = updatedSquads[0];
      expect(sq0.squad_name).toBe("New Name");
      expect(sq0.squad_name_err).toBe(""); // assuming the component clears it
    });   

    it("editing squad games updates squads and clears games_err", async () => {
      const user = userEvent.setup();
      const localSquads = cloneDeep(mockSquads);
      localSquads[0].games_err = "Squad Games cannot be more than 6";

      const setSquads = jest.fn();
      render(
        <OneToNSquads
          {...mockOneToNSquadsProps}
          squads={localSquads}
          setSquads={setSquads}
        />
      );

      const gamesInput = screen.getAllByRole("spinbutton", { name: /squad games/i });
      fireEvent.change(gamesInput[0], { target: { value: 6 } });

      expect(setSquads).toHaveBeenCalled();
      const [updatedSquads] = setSquads.mock.calls.at(-1) as [squadType[]];

      const sq0 = updatedSquads[0];
      expect(sq0.games).toBe(6);
      expect(sq0.games_err).toBe(""); // assuming the component clears it
    });   

    it("editing squad staring lane updates squads and clears starting_lane_err", async () => {
      const user = userEvent.setup();
      const localSquads = cloneDeep(mockSquads);
      localSquads[0].starting_lane_err = "Starting lane cannot be even";

      const setSquads = jest.fn();
      render(
        <OneToNSquads
          {...mockOneToNSquadsProps}
          squads={localSquads}
          setSquads={setSquads}
        />
      );

      const startLaneInput = screen.getAllByRole("spinbutton", { name: /starting lane/i });
      fireEvent.change(startLaneInput[0], { target: { value: 15 } });

      expect(setSquads).toHaveBeenCalled();
      const [updatedSquads] = setSquads.mock.calls.at(-1) as [squadType[]];

      const sq0 = updatedSquads[0];
      expect(sq0.starting_lane).toBe(15);
      expect(sq0.starting_lane_err).toBe(""); // assuming the component clears it
    });   

    it("editing squad # of lanes updates squads and clears lane_count_err", async () => {
      const user = userEvent.setup();
      const localSquads = cloneDeep(mockSquads);
      localSquads[0].lane_count_err = "Number of Lanes cannot be odd";

      const setSquads = jest.fn();
      render(
        <OneToNSquads
          {...mockOneToNSquadsProps}
          squads={localSquads}
          setSquads={setSquads}
        />
      );

      const lanesInput = screen.getAllByRole("spinbutton", { name: /of lanes/i });
      expect(lanesInput).toHaveLength(2);
      expect(lanesInput[0]).toBeEnabled();
      
      fireEvent.input(lanesInput[0], { target: { value: "16" } });

      expect(setSquads).toHaveBeenCalled();
      const [updatedSquads] = setSquads.mock.calls.at(-1) as [squadType[]];

      const sq0 = updatedSquads[0];
      expect(sq0.lane_count).toBe(16);
      expect(sq0.lane_count_err).toBe(""); // assuming the component clears it
    });   

    it("changing squad event updates squads and clears event_id_err", async () => {
      const user = userEvent.setup();
      const localSquads = cloneDeep(mockSquads);

      // seed an error on the first squad
      localSquads[0].event_id_err = "Event is required";

      const setSquads = jest.fn();
      render(
        <OneToNSquads
          {...mockOneToNSquadsProps}
          squads={localSquads}
          setSquads={setSquads}
        />
      );
      
      const eventSelects = screen.getAllByRole("combobox", { name: /event/i }) as HTMLSelectElement[];
      expect(eventSelects).toHaveLength(2); 
      
      const select = eventSelects[0];
      const newEventId = mockEvents[1].id;
      fireEvent.change(select, { target: { value: newEventId } });      

      expect(setSquads).toHaveBeenCalled();
      const [updatedSquads] = setSquads.mock.calls.at(-1) as [squadType[]];

      const sq0 = updatedSquads[0];
      expect(sq0.event_id).toBe(mockEvents[1].id);
      expect(sq0.event_id_err).toBe(""); // cleared
    });    

    it("editing squad date updates squads and clears squad_date_err", async () => {
      const user = userEvent.setup();
      const localSquads = cloneDeep(mockSquads);

      localSquads[0].squad_date_err = "Date is required";

      const setSquads = jest.fn();
      render(
        <OneToNSquads
          {...mockOneToNSquadsProps}
          squads={localSquads}
          setSquads={setSquads}
        />
      );
      
      const dateInputs = screen.getAllByLabelText(/date/i) as HTMLInputElement[];
      expect(dateInputs).toHaveLength(2);

      // pick a valid date string in the same format as squad_date_str
      const newDate = "2025-01-15";
      
      fireEvent.change(dateInputs[0], { target: { value: newDate } });

      expect(setSquads).toHaveBeenCalled();
      const [updatedSquads] = setSquads.mock.calls.at(-1) as [squadType[]];

      const sq0 = updatedSquads[0];
      expect(sq0.squad_date_str).toBe(newDate);
      expect(sq0.squad_date_err).toBe(""); // cleared
    });

    it("editing squad start time updates squads and clears squad_time_err", async () => {
      const user = userEvent.setup();
      const localSquads = cloneDeep(mockSquads);

      localSquads[0].squad_time_err = "Time is required";

      const setSquads = jest.fn();
      render(
        <OneToNSquads
          {...mockOneToNSquadsProps}
          squads={localSquads}
          setSquads={setSquads}
        />
      );
      
      const timeInputs = screen.getAllByLabelText(/start time/i) as HTMLInputElement[];
      expect(timeInputs).toHaveLength(2);
      const newTime = "09:30";

      fireEvent.change(timeInputs[0], { target: { value: newTime } });

      expect(setSquads).toHaveBeenCalled();
      const [updatedSquads] = setSquads.mock.calls.at(-1) as [squadType[]];

      const sq0 = updatedSquads[0];
      expect(sq0.squad_time).toBe(newTime);
      expect(sq0.squad_time_err).toBe(""); // cleared
    });

  })

  describe('starting lane and lane count', () => { 
    it("changing starting lane for squad 1 recomputes lanes via setLanes", async () => {
      const user = userEvent.setup();
      const localSquads = cloneDeep(mockSquads);
      
      // const setSquads = jest.fn();
      const setLanes = jest.fn();
      render(
        <OneToNSquads
          {...mockOneToNSquadsProps}
          squads={localSquads}
          setLanes={setLanes}
        />
      );

      const startLaneInput = screen.getAllByRole("spinbutton", { name: /starting lane/i });
      fireEvent.change(startLaneInput[0], { target: { value: 15 } });

      expect(setLanes).toHaveBeenCalled();
      
      const [updatedLanesParam] = setLanes.mock.calls.at(-1) as [laneType[]];
      // items 0-9 from other squad, so 10th should be 15
      expect(updatedLanesParam[10].lane_number).toBe(15);
    }); 
    
    it("invalid starting lane calls clearLanes and removes lanes for that squad", () => {
      const setLanes = jest.fn();

      // make starting_lane invalid (even)
      const localSquads = cloneDeep(mockSquads);
      render(
        <OneToNSquads
          {...mockOneToNSquadsProps}
          squads={localSquads}
          setLanes={setLanes}
        />
      );

      const startLaneInputs = screen.getAllByRole("spinbutton", { name: /starting lane/i });
      fireEvent.change(startLaneInputs[0], { target: { value: "2" } }); // even → invalid

      expect(setLanes).toHaveBeenCalled();

      const [updatedLanes] = setLanes.mock.calls.at(-1) as [laneType[]];
      // no lane should have squad_id of the first squad anymore
      const firstId = localSquads[0].id;
      expect(updatedLanes.some((l) => l.squad_id === firstId)).toBe(false);
    });

    it("changing lane count for squad 1 recomputes lanes via setLanes", async () => {
      const user = userEvent.setup();
      const setLanes = jest.fn();

      render(
        <OneToNSquads
          {...mockOneToNSquadsProps}
          setLanes={setLanes}
        />
      );

      const laneCounts = screen.getAllByRole("spinbutton", { name: /of lanes/i });
      fireEvent.change(laneCounts[0], { target: { value: "16" } });

      expect(setLanes).toHaveBeenCalled();

      const [updatedLanesParam] = setLanes.mock.calls.at(-1) as [laneType[]];      
      // 10 items from other squad, so now there should be 26
      expect(updatedLanesParam).toHaveLength(26);      
    });    

    it("invalid # of lanes calls clearLanes and removes lanes for that squad", () => {
      const setLanes = jest.fn();

      // make starting_lane invalid (even)
      const localSquads = cloneDeep(mockSquads);
      render(
        <OneToNSquads
          {...mockOneToNSquadsProps}
          squads={localSquads}
          setLanes={setLanes}
        />
      );

      const laneCounts = screen.getAllByRole("spinbutton", { name: /of lanes/i });
      fireEvent.change(laneCounts[0], { target: { value: "11" } }); // odd → invalid

      expect(setLanes).toHaveBeenCalled();

      const [updatedLanes] = setLanes.mock.calls.at(-1) as [laneType[]];
      // no lane should have squad_id of the first squad anymore
      const firstId = localSquads[0].id;
      expect(updatedLanes.some((l) => l.squad_id === firstId)).toBe(false);
    });


  })

  describe('isDisabled = true', () => { 
    it("when isDisabled is true, editing fields does not call setSquads or setLanes", async () => {
      const user = userEvent.setup();
      const setSquads = jest.fn();
      const setLanes = jest.fn();

      const runTmntProps = {
        ...mockOneToNSquadsProps,
        isDisabled: true,
        setSquads,
        setLanes,
      };

      render(<OneToNSquads {...runTmntProps} />);

      const nameInputs = screen.getAllByRole("textbox", { name: /squad name/i }) as HTMLInputElement[];
      expect(nameInputs[0]).toBeDisabled();

      // Try anyway – should not trigger handlers
      await user.click(nameInputs[0]); // no-op but safe
      // if you want to be explicit, skip typing here because disabled elements won't take typing

      expect(setSquads).not.toHaveBeenCalled();
      expect(setLanes).not.toHaveBeenCalled();
    });
  })

})