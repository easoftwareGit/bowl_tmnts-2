import React, { act } from "react";
import { fireEvent, render, screen, waitForElementToBeRemoved, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OneToNEvents from "@/app/dataEntry/tmntForm/oneToNEvents";
import { mockEvents } from "../../../../mocks/tmnts/singlesAndDoubles/mockEvents";
import { mockSquads } from "../../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { localConfig } from "@/lib/currency/const";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { initEvent } from "@/lib/db/initVals";
import { cloneDeep } from "lodash";

const mockSetEvents = jest.fn();
const mockSetSquads = jest.fn();
const mockSetAcdnErr = jest.fn();

const mockOneToNEventsProps = {
  events: mockEvents,
  setEvents: mockSetEvents,
  squads: mockSquads,
  setSquads: mockSetSquads,
  setAcdnErr: mockSetAcdnErr,
  isDisabled: false,
};

// mock the modals
jest.mock("@/components/modal/confirmModal", () => ({
  __esModule: true,
  default: ({ show, title, message, onConfirm, onCancel }: any) =>
    show ? (
      <div data-testid="confirm-modal">
        <p>{title}</p>
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
  delConfTitle: "Delete Event",
}));

jest.mock("@/components/modal/errorModal", () => ({
  __esModule: true,
  default: ({ show, title, message, onCancel }: any) =>
    show ? (
      <div data-testid="error-modal">
        <p>{title}</p>
        <p>{message}</p>
        <button onClick={onCancel}>Close</button>
      </div>
    ) : null,
  cannotDeleteTitle: "Cannot Delete",
}));

const makeProps = (overrides: Partial<React.ComponentProps<typeof OneToNEvents>> = {}) => {
  const eventsCopy = cloneDeep(mockEvents);
  const squadsCopy = cloneDeep(mockSquads);

  return {
    events: eventsCopy,
    squads: squadsCopy,
    setEvents: jest.fn(),
    setSquads: jest.fn(),
    setAcdnErr: jest.fn(),
    isDisabled: false,
    ...overrides,
  } as React.ComponentProps<typeof OneToNEvents>;
};

describe("OneToNEvents - Interactions", () => { 

  describe("add event", () => {
    beforeAll(() => {
      mockEvents.push({
        ...initEvent,
        id: "3",
        sort_order: 3,
        event_name: "Trios",
        tab_title: "Trios",
      });
    });

    afterAll(() => {
      if (mockEvents.length === 3) mockEvents.pop();
    });

    it("test if added event has correct tab title", async () => {
      // ARRANGE
      const user = userEvent.setup();
      render(<OneToNEvents {...mockOneToNEventsProps} />);
      const addBtn = screen.getByText("Add");
      // ACT
      await user.click(addBtn);
      // ASSERT
      expect(mockOneToNEventsProps.setEvents).toHaveBeenCalled();

      // ACT
      const tabs = screen.getAllByRole("tab");
      // ASSERT
      expect(tabs).toHaveLength(3);
      expect(tabs[2]).toHaveTextContent("Trios");
      // // ARRANGE
      await user.click(tabs[2]);
      // ACT
      const eventNames = screen.getAllByRole("textbox", { name: /event name/i }) as HTMLInputElement[];
      await user.clear(eventNames[2])
      await user.type(eventNames[2], "Trios")
      expect(eventNames[2]).toHaveValue(mockEvents[2].event_name);      
    });
    it('enter team size', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<OneToNEvents {...mockOneToNEventsProps} />)
      const addBtn = screen.getByText("Add");
      await user.click(addBtn);
      const tabs = screen.getAllByRole('tab');
      await user.click(tabs[2]);
      // ACT
      const teamSizes = screen.getAllByRole('spinbutton', { name: /team size/i })
      await user.clear(teamSizes[2])
      await user.type(teamSizes[2], "3")
      // ASSERT
      expect(teamSizes[2]).toHaveValue(mockEvents[2].team_size);
    })
    it('enter games', async () => {
      const user = userEvent.setup()
      render(<OneToNEvents {...mockOneToNEventsProps} />)
      const addBtn = screen.getByText("Add");
      await user.click(addBtn);
      const tabs = screen.getAllByRole('tab');
      await user.click(tabs[2]);
      const games = screen.getAllByRole('spinbutton', { name: /event games/i }) as HTMLInputElement[];
      await user.clear(games[2])
      await user.type(games[2], "5")
      expect(games[2]).toHaveValue(mockEvents[2].games);
    })
    it('enter added money', async () => {
      const user = userEvent.setup()
      render(<OneToNEvents {...mockOneToNEventsProps} />)
      const addBtn = screen.getByText("Add");
      await user.click(addBtn);
      const tabs = screen.getAllByRole('tab');
      await user.click(tabs[2]);
      const addeds = screen.getAllByRole('textbox', { name: /added \$/i }) as HTMLInputElement[];
      await user.clear(addeds[2])
      await user.type(addeds[2], "250")      
      expect(addeds[2]).toHaveValue(
        formatValueSymbSep2Dec(mockEvents[2].added_money, localConfig)
      );
    })
    it('enter entry fee', async () => {
      const user = userEvent.setup()
      render(<OneToNEvents {...mockOneToNEventsProps} />)
      const addBtn = screen.getByText("Add");
      await user.click(addBtn);
      const tabs = screen.getAllByRole('tab');
      await user.click(tabs[2]);
      const fees = screen.getAllByRole('textbox', { name: /entry fee/i }) as HTMLInputElement[];
      await user.clear(fees[2])
      await user.type(fees[2], "150")
      expect(fees[2]).toHaveValue(
        formatValueSymbSep2Dec(mockEvents[2].entry_fee, localConfig)
      );
    })
    it('enter lineage', async () => {
      const user = userEvent.setup()
      render(<OneToNEvents {...mockOneToNEventsProps} />)
      const addBtn = screen.getByText("Add");
      await user.click(addBtn);
      const tabs = screen.getAllByRole('tab');
      await user.click(tabs[2]);
      const lineages = screen.getAllByRole('textbox', { name: /lineage/i }) as HTMLInputElement[];
      await user.clear(lineages[2])
      await user.type(lineages[2], "45")      
      expect(lineages[2]).toHaveValue(
        formatValueSymbSep2Dec(mockEvents[2].lineage, localConfig)
      );
    })
    it('enter prize fund', async () => {
      const user = userEvent.setup()
      render(<OneToNEvents {...mockOneToNEventsProps} />)
      const addBtn = screen.getByText("Add");
      await user.click(addBtn);
      const tabs = screen.getAllByRole('tab');
      await user.click(tabs[2]);
      const prizes = screen.getAllByRole('textbox', { name: /prize fund/i }) as HTMLInputElement[];
      await user.clear(prizes[2])
      await user.type(prizes[2], "95")
      expect(prizes[2]).toHaveValue(
        formatValueSymbSep2Dec(mockEvents[2].prize_fund, localConfig)
      );
    })
    it('enter other', async () => {
      const user = userEvent.setup()
      render(<OneToNEvents {...mockOneToNEventsProps} />)
      const addBtn = screen.getByText("Add");
      await user.click(addBtn);
      const tabs = screen.getAllByRole('tab');
      await user.click(tabs[2]);
      const others = screen.getAllByRole('textbox', { name: /other/i }) as HTMLInputElement[];
      await user.clear(others[2])
      await user.type(others[2], "4")
      expect(others[2]).toHaveValue(
        formatValueSymbSep2Dec(mockEvents[2].other, localConfig)
      );
    })
    it('enter expenses', async () => {
      const user = userEvent.setup()
      render(<OneToNEvents {...mockOneToNEventsProps} />)
      const addBtn = screen.getByText("Add");
      await user.click(addBtn);
      const tabs = screen.getAllByRole('tab');
      await user.click(tabs[2]);
      const expenses = screen.getAllByRole('textbox', { name: /expenses/i }) as HTMLInputElement[];
      await user.clear(expenses[2])
      await user.type(expenses[2], "6")
      expect(expenses[2]).toHaveValue(
        formatValueSymbSep2Dec(mockEvents[2].expenses, localConfig)
      );
    })
    it('test if LPOX is recalculated', async () => {
      const logSpy = jest.spyOn(global.console, 'log')
      const user = userEvent.setup()
      render(<OneToNEvents {...mockOneToNEventsProps} />)
      const addBtn = screen.getByText("Add");
      await user.click(addBtn);
      const tabs = screen.getAllByRole('tab');
      await user.click(tabs[2]);
      const fees = screen.getAllByRole('textbox', { name: /entry fee/i }) as HTMLInputElement[];      
      const lpoxs = screen.getAllByRole('textbox', { name: /L\+P\+O\+X/i }) as HTMLInputElement[];
      await user.clear(fees[2])
      await user.type(fees[2], "150");      
      const eventNames = screen.getAllByRole("textbox", { name: /event name/i }) as HTMLInputElement[];
      await user.click(eventNames[2]);
      expect(fees[2]).toHaveValue(
        formatValueSymbSep2Dec(mockEvents[2].entry_fee, localConfig)
      );    
      expect(lpoxs[2]).toHaveValue(
        formatValueSymbSep2Dec(mockEvents[2].lpox, localConfig)
      );      
      expect(lpoxs[2]).toHaveClass('form-control')
    })
    it('test if LPOX is correct', async () => {
      const user = userEvent.setup()
      render(<OneToNEvents {...mockOneToNEventsProps} />)
      const addBtn = screen.getByText("Add");
      await user.click(addBtn);
      const tabs = screen.getAllByRole('tab');
      await user.click(tabs[2]);
      const teamSizes = screen.getAllByRole('spinbutton', { name: /team size/i }) as HTMLInputElement[];      
      const games = screen.getAllByRole('spinbutton', { name: /event games/i }) as HTMLInputElement[];            
      const addeds = screen.getAllByRole('textbox', { name: /added \$/i }) as HTMLInputElement[];
      const fees = screen.getAllByRole('textbox', { name: /entry fee/i }) as HTMLInputElement[]; 
      const lineages = screen.getAllByRole('textbox', { name: /lineage/i }) as HTMLInputElement[];
      const prizes = screen.getAllByRole('textbox', { name: /prize fund/i }) as HTMLInputElement[];
      const others = screen.getAllByRole('textbox', { name: /other/i }) as HTMLInputElement[];
      const expenses = screen.getAllByRole('textbox', { name: /expenses/i }) as HTMLInputElement[];
      const lpoxs = screen.getAllByRole('textbox', { name: /L\+P\+O\+X/i }) as HTMLInputElement[];
      await user.type(teamSizes[2], "3")
      await user.type(games[2], "5")
      await user.type(addeds[2], "1000")
      await user.type(fees[2], "150")
      await user.type(lineages[2], "45")
      await user.type(prizes[2], "95")
      await user.type(others[2], "4")
      await user.type(expenses[2], "6")

      const eventNames = screen.getAllByRole("textbox", { name: /event name/i }) as HTMLInputElement[];      
      await user.click(eventNames[2]);

      // test lpox vs entry fee, to test if lpox calc is working
      expect(lpoxs[2]).toHaveValue(
        formatValueSymbSep2Dec(mockEvents[2].lpox, localConfig)
      );      
      expect(lpoxs[2]).toHaveClass('form-control')
    })
    it("add an event", async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<OneToNEvents {...mockOneToNEventsProps} />)
      const addBtn = screen.getByText("Add");
      // ACT
      await user.click(addBtn);
      // ASSERT
      expect(mockOneToNEventsProps.setEvents).toHaveBeenCalled();

      // ACT
      const tabs = screen.getAllByRole('tab');
      // ASSERT
      expect(tabs).toHaveLength(3)

      // ARRANGE                       
      const eventNames = screen.getAllByRole("textbox", { name: /event name/i }) as HTMLInputElement[];      
      const teamSizes = screen.getAllByRole('spinbutton', { name: /team size/i }) as HTMLInputElement[];      
      const games = screen.getAllByRole('spinbutton', { name: /event games/i }) as HTMLInputElement[];            
      const addeds = screen.getAllByRole('textbox', { name: /added \$/i }) as HTMLInputElement[];
      const fees = screen.getAllByRole('textbox', { name: /entry fee/i }) as HTMLInputElement[]; 
      const lineages = screen.getAllByRole('textbox', { name: /lineage/i }) as HTMLInputElement[];
      const prizes = screen.getAllByRole('textbox', { name: /prize fund/i }) as HTMLInputElement[];
      const others = screen.getAllByRole('textbox', { name: /other/i }) as HTMLInputElement[];
      const expenses = screen.getAllByRole('textbox', { name: /expenses/i }) as HTMLInputElement[];
      const lpoxs = screen.getAllByRole('textbox', { name: /L\+P\+O\+X/i }) as HTMLInputElement[];
      // ACT 
      await user.click(tabs[2]);
      expect(eventNames[2]).toHaveValue(mockEvents[2].event_name);
      expect(teamSizes[2].value as string).toBe(mockEvents[2].team_size.toString());      
      expect(games[2].value as string).toBe(mockEvents[2].games.toString());
      expect(addeds[2].value as string).toBe(formatValueSymbSep2Dec(mockEvents[2].added_money[0], localConfig));      
      expect(fees[2].value as string).toBe(formatValueSymbSep2Dec(mockEvents[2].entry_fee, localConfig));
      expect(lineages[2].value as string).toBe(formatValueSymbSep2Dec(mockEvents[2].lineage, localConfig));
      expect(prizes[2].value as string).toBe(formatValueSymbSep2Dec(mockEvents[2].prize_fund, localConfig));
      expect(others[2].value as string).toBe(formatValueSymbSep2Dec(mockEvents[2].other, localConfig));
      expect(expenses[2].value as string).toBe(formatValueSymbSep2Dec(mockEvents[2].expenses, localConfig));
      // test lpox vs entry fee, to test if lpox calc is working
      expect(lpoxs[2].value as string).toBe(formatValueSymbSep2Dec(mockEvents[2].entry_fee, localConfig));
      expect(lpoxs[2]).not.toHaveClass('is-invalid')      
    })
  });

  describe("delete event", () => {
    beforeAll(() => {
      mockEvents.push({
        ...initEvent,
        id: "3",
        sort_order: 3,
        event_name: "Trios",
        tab_title: "Trios",
      });
    });

    afterAll(() => {
      if (mockEvents.length === 3) mockEvents.pop();
    });

    it("delete event", async () => {
      // ARRANGE
      const user = userEvent.setup();
      render(<OneToNEvents {...mockOneToNEventsProps} />);
      // ACT
      const tabs = screen.getAllByRole("tab");
      // ARRANGE
      await user.click(tabs[2]);
      const delBtns = screen.getAllByText("Delete Event");
      // ASSERT
      expect(delBtns).toHaveLength(2);
      // ACT
      await user.click(delBtns[1]);
      // ASSERT
      expect(mockOneToNEventsProps.setEvents).toHaveBeenCalled();
    });
  });
  
  describe("setSquads sync when event.games changes", () => {
    it("updates squads.games for squads tied to the event when games changes within valid range", async () => {
      const user = userEvent.setup();
      const props = makeProps();

      // Make sure at least one squad belongs to the first event
      props.squads[0].event_id = props.events[0].id;

      const setSquads = jest.fn();
      props.setSquads = setSquads;

      render(<OneToNEvents {...props} />);

      const gamesInputs = screen.getAllByRole("spinbutton", {
        name: /event games/i,
      }) as HTMLInputElement[];
      
      // Simulate the user changing the value to "5"
      fireEvent.change(gamesInputs[0], { target: { value: "5" } });

      expect(setSquads).toHaveBeenCalled();      

      const [[updatedSquads]] = setSquads.mock.calls as any;
      const linkedSquad = updatedSquads.find(
        (s: any) => s.event_id === props.events[0].id
      );

      expect(linkedSquad).toBeDefined();
      expect(linkedSquad.games).toBe(5);
    });
  });

  describe("delete flow", () => {
    it("does not show Delete button when there is only one event (cannot delete last event)", () => {
      const props = makeProps({
        events: [cloneDeep(mockEvents[0])], // just one event
      });

      const setEvents = jest.fn();
      props.setEvents = setEvents;

      render(<OneToNEvents {...props} />);

      const delBtn = screen.queryByText("Delete Event");
      expect(delBtn).not.toBeInTheDocument();
      expect(setEvents).not.toHaveBeenCalled();
    });

    it("shows error modal and does not delete when event has squads", async () => {
      const user = userEvent.setup();
      const props = makeProps();

      // Make sure the second event has at least one squad
      props.squads[0].event_id = props.events[1].id;

      const setEvents = jest.fn();
      props.setEvents = setEvents;

      render(<OneToNEvents {...props} />);

      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[1]); // focus second event

      const delBtn = screen.getByText("Delete Event");
      await user.click(delBtn);

      const errorModal = await screen.findByTestId("error-modal");
      expect(errorModal).toBeInTheDocument();
      expect(within(errorModal).getByText("Cannot Delete")).toBeInTheDocument();

      // No delete was actually performed
      expect(setEvents).not.toHaveBeenCalled();
      // And we never showed the confirm modal
      expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
    });

    it("shows confirm modal and deletes event when confirmed", async () => {
      const user = userEvent.setup();
      const props = makeProps();

      // Make sure no squad is tied to the second event
      props.squads = props.squads.filter(
        (s) => s.event_id !== props.events[1].id
      );

      const setEvents = jest.fn();
      props.setEvents = setEvents;

      render(<OneToNEvents {...props} />);

      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[1]); // focus second event

      const delBtn = screen.getByText("Delete Event");
      await user.click(delBtn);

      const confirmModal = await screen.findByTestId("confirm-modal");
      const confirmButton = within(confirmModal).getByText("Confirm");
      await user.click(confirmButton);

      expect(setEvents).toHaveBeenCalled();

      const [[updatedEvents]] = setEvents.mock.calls as any;
      // One less event
      expect(updatedEvents).toHaveLength(props.events.length - 1);
      // And the deleted id is not present
      const deletedStillThere = updatedEvents.find(
        (e: any) => e.id === props.events[1].id
      );
      expect(deletedStillThere).toBeUndefined();
    });
  });

  describe("amount field edge cases", () => {
    it("clears non-numeric currency input and sets entry_fee to ''", async () => {
      const user = userEvent.setup();
      const props = makeProps();

      const setEvents = jest.fn();
      props.setEvents = setEvents;

      render(<OneToNEvents {...props} />);

      const feeInputs = screen.getAllByRole("textbox", {
        name: /entry fee/i,
      }) as HTMLInputElement[];

      await user.clear(feeInputs[0]);
      await user.type(feeInputs[0], "abc"); // non-numeric

      expect(setEvents).toHaveBeenCalled();

      const [[updatedEvents]] = setEvents.mock.calls as any;
      const ev0 = updatedEvents.find(
        (e: any) => e.id === props.events[0].id
      );

      expect(ev0.entry_fee).toBe(""); // sanitized to empty string
    });

    it("clears lpox_err when editing a fee component field (e.g. lineage)", async () => {
      const user = userEvent.setup();
      const props = makeProps();

      // seed an event with an lpox_err set
      props.events[0].lpox_err = "Entry Fee ≠ LPOX";
      const originalLineage = props.events[0].lineage;

      const setEvents = jest.fn();
      props.setEvents = setEvents;

      render(<OneToNEvents {...props} />);

      const lineageInputs = screen.getAllByRole("textbox", {
        name: /lineage/i,
      }) as HTMLInputElement[];

      await user.clear(lineageInputs[0]);
      await user.type(lineageInputs[0], "12");

      expect(setEvents).toHaveBeenCalled();

      // Look at the *last* call (final state)
      const lastCall = setEvents.mock.calls[setEvents.mock.calls.length - 1] as any;
      const [updatedEvents] = lastCall;
      const ev0 = updatedEvents.find(
        (e: any) => e.id === props.events[0].id
      );

      expect(ev0).toBeDefined();
      // don't care about the exact string, only that it changed:
      expect(ev0.lineage).not.toBe(originalLineage);
      // This is the real behavior under test:
      expect(ev0.lpox_err).toBe("");
    });

  });

  describe("handleBlur defaulting behavior", () => {
    it("defaults blank event_name back to 'Event {sort_order}' and tab_title", () => {
      const props = makeProps();
      const setEvents = jest.fn();
      props.setEvents = setEvents;

      render(<OneToNEvents {...props} />);

      const nameInputs = screen.getAllByRole("textbox", {
        name: /event name/i,
      }) as HTMLInputElement[];

      const firstNameInput = nameInputs[0];

      // Manually blank out the input's DOM value
      firstNameInput.value = "";

      // Trigger blur so handleBlur runs and sees value === ""
      fireEvent.blur(firstNameInput);

      expect(setEvents).toHaveBeenCalled();

      // Use the last call (the blur handler)
      const lastCall = setEvents.mock.calls[setEvents.mock.calls.length - 1] as any;
      const [updatedEvents] = lastCall;
      const ev0 = updatedEvents.find(
        (e: any) => e.id === props.events[0].id
      );

      expect(ev0).toBeDefined();
      expect(ev0.event_name).toBe(`Event ${ev0.sort_order}`);
      expect(ev0.tab_title).toBe(`Event ${ev0.sort_order}`);
    });
    
    it("defaults blank team_size back to 1 on blur", async () => {
      const user = userEvent.setup();
      const props = makeProps();
      const setEvents = jest.fn();
      props.setEvents = setEvents;

      render(<OneToNEvents {...props} />);

      const teamInputs = screen.getAllByRole("spinbutton", { name: /team size/i }) as HTMLInputElement[];

      teamInputs[0].value = "";
      fireEvent.blur(teamInputs[0]);

      expect(setEvents).toHaveBeenCalled();

      const lastCall = setEvents.mock.calls[setEvents.mock.calls.length - 1] as any;
      const [updatedEvents] = lastCall;
      const ev0 = updatedEvents.find(
        (e: any) => e.id === props.events[0].id
      );

      expect(ev0).toBeDefined();
      expect(ev0.team_size).toBe(1);
      expect(ev0.team_size_err).toBe("");
    });

    it("defaults blank games back to 3 on blur", async () => {
      const user = userEvent.setup();
      const props = makeProps();
      const setEvents = jest.fn();
      props.setEvents = setEvents;

      render(<OneToNEvents {...props} />);

      const gamesInputs = screen.getAllByRole("spinbutton", { name: /event games/i }) as HTMLInputElement[];

      gamesInputs[0].value = "";
      fireEvent.blur(gamesInputs[0]);      

      expect(setEvents).toHaveBeenCalled();

      const lastCall = setEvents.mock.calls[setEvents.mock.calls.length - 1] as any;
      const [updatedEvents] = lastCall;
      const ev0 = updatedEvents.find(
        (e: any) => e.id === props.events[0].id
      );

      expect(ev0).toBeDefined();
      expect(ev0.games).toBe(3);
      expect(ev0.games_err).toBe("");
    });
  });

})