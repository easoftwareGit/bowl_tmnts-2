import React, { act } from "react";
import { render, screen, waitForElementToBeRemoved, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OneToNEvents from "@/app/dataEntry/tmntForm/oneToNEvents";
import { mockEvents } from "../../../mocks/tmnts/singlesAndDoubles/mockEvents";
import { mockSquads } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { localConfig } from "@/lib/currency/const";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { initEvent } from "@/lib/db/initVals";
import { tmntActions } from "@/lib/types/types";
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
  tmntAction: tmntActions.New
};

describe("OneToNEvents - Component", () => {

  describe("render the component", () => {
    
    describe("render the 1st event", () => {
      it("render events label", () => {
        // ARRANGE
        // const user = userEvent.setup()
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        // ACT
        const eventLabel = screen.getByText("# Events");
        // ASSERT
        expect(eventLabel).toBeInTheDocument();
      });
      it("render number of events", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const eventNum = screen.getByRole('textbox', { name: /# events/i }) as HTMLInputElement;
        expect(eventNum).toBeInTheDocument();
        expect(eventNum).toHaveValue("2");
        expect(eventNum).toBeDisabled();
      });
      it("render add button", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const addBtn = screen.getByRole("button", { name: /add/i });
        expect(addBtn).toBeInTheDocument();
      });
      it("render event name labels", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const nameLabels = screen.getAllByText("Event Name");
        expect(nameLabels).toHaveLength(2);
      });
      it("render event names", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const eventNames = screen.getAllByRole("textbox", { name: /event name/i }) as HTMLInputElement[];
        expect(eventNames).toHaveLength(2);
        expect(eventNames[0]).toHaveValue(mockEvents[0].event_name);
      });
      it("DO NOT render event name errors", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const nameErrors = screen.queryAllByTestId("dangerEventName");        
        expect(nameErrors).toHaveLength(2);
        expect(nameErrors[0]).toHaveTextContent("");
      });
      it("render team size labels with space before help icon", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const teamLabels = screen.getAllByText(/team size/i, { selector: "label" });        
        expect(teamLabels).toHaveLength(2);
        const label = teamLabels[0] as HTMLLabelElement;
        const text = label.textContent ?? "";
        expect(text).toMatch(/^Team Size\s+\?/);
      });
      it('render team size help icon with surrounding spaces', () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const helpLables = screen.getAllByText(/team size/i, { selector: "label" });
        expect(helpLables).toHaveLength(2);

        const label = helpLables[0] as HTMLLabelElement;
        const helpSpan = within(label).getByText("?", { selector: "span" });
        expect(helpSpan).toBeInTheDocument();
        expect(helpSpan).toHaveClass("popup-help");

        const text = helpSpan.textContent ?? "";
        // one or more spaces, then '?', then one or more spaces
        expect(text).toMatch(/^\s+\?\s+$/); 
      });
      it("render team sizes", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const teamSizes = screen.getAllByRole('spinbutton', { name: /team size/i })
        expect(teamSizes).toHaveLength(2);
        expect(teamSizes[0]).toHaveValue(mockEvents[0].team_size);
      });
      it("DO NOT render team size errors", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const teamErrors = screen.queryAllByTestId("dangerTeamSize");
        expect(teamErrors).toHaveLength(2);
        expect(teamErrors[0]).toHaveTextContent("");
      });
      it("render event games labels", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const gamesLabels = screen.getAllByText("Event Games");
        expect(gamesLabels).toHaveLength(2);
      });
      it("render event games", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);        
        const games = screen.getAllByRole('spinbutton', { name: /event games/i })
        expect(games).toHaveLength(2);
        expect(games[0]).toHaveValue(mockEvents[0].games);
      });
      it("DO NOT render games errors", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const gameErrors = screen.queryAllByTestId("dangerEventGames");
        expect(gameErrors).toHaveLength(2);
        expect(gameErrors[0]).toHaveTextContent("");
      });
      it("render added labels with space before help icon", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const addedLabels = screen.getAllByText(/added \$/i, { selector: "label" });        
        expect(addedLabels).toHaveLength(2);
        const label = addedLabels[0] as HTMLLabelElement;
        const text = label.textContent ?? "";
        expect(text).toMatch(/^Added \$\s+\?/);
      });
      it('renders added help icon with surrounding spaces', () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const helpLables = screen.getAllByText(/added/i, { selector: "label" });
        expect(helpLables).toHaveLength(2);

        const label = helpLables[0] as HTMLLabelElement;
        const helpSpan = within(label).getByText("?", { selector: "span" });
        expect(helpSpan).toBeInTheDocument();
        expect(helpSpan).toHaveClass("popup-help");

        const text = helpSpan.textContent ?? "";
        // one or more spaces, then '?', then one or more spaces
        expect(text).toMatch(/^\s+\?\s+$/); 
      });
      it("render added values", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const addeds = screen.getAllByRole('textbox', { name: /added \$/i }) as HTMLInputElement[];
        expect(addeds).toHaveLength(2);
        expect(addeds[0]).toHaveValue(
          formatValueSymbSep2Dec(mockEvents[0].added_money, localConfig)
        );
      });
      it("DO NOT render added errors", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const addedErrors = screen.queryAllByTestId("dangerEventAddedMoney");
        expect(addedErrors).toHaveLength(2);
        expect(addedErrors[0]).toHaveTextContent("");
      });
      it("render fee labels", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const feeLabels = screen.getAllByText("Entry Fee");
        expect(feeLabels).toHaveLength(2);
      });
      it("render fee values", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const fees = screen.getAllByRole('textbox', { name: /entry fee/i }) as HTMLInputElement[];
        expect(fees).toHaveLength(2);
        expect(fees[0]).toHaveValue(
          formatValueSymbSep2Dec(mockEvents[0].entry_fee, localConfig)
        );
      });
      it("DO NOT render fee errors", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const feeErrors = screen.queryAllByTestId("dangerEventEntryFee");
        expect(feeErrors).toHaveLength(2);
        expect(feeErrors[0]).toHaveTextContent("");
      });
      it("render lineage labels", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const lineageLabels = screen.getAllByText("Lineage");
        expect(lineageLabels).toHaveLength(2);
      });
      it("render lineage values", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const lineages = screen.getAllByRole('textbox', { name: /lineage/i }) as HTMLInputElement[];
        expect(lineages).toHaveLength(2);
        expect(lineages[0]).toHaveValue(
          formatValueSymbSep2Dec(mockEvents[0].lineage, localConfig)
        );
      });
      it("DO NOT render lineage errors", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const lineageErrors = screen.queryAllByTestId("dangerEventLineage");
        expect(lineageErrors).toHaveLength(2);
        expect(lineageErrors[0]).toHaveTextContent("");
      });
      it("render the prize fund labels", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const pfLabels = screen.getAllByText("Prize Fund");
        expect(pfLabels).toHaveLength(2);
      });
      it("render the prize fund values", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const prizes = screen.getAllByRole('textbox', { name: /prize fund/i }) as HTMLInputElement[];
        expect(prizes).toHaveLength(2);
        expect(prizes[0]).toHaveValue(
          formatValueSymbSep2Dec(mockEvents[0].prize_fund, localConfig)
        );
      });
      it("DO NOT render prize fund errors", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const prizeErrors = screen.queryAllByTestId("dangerEventPrizeFund");
        expect(prizeErrors).toHaveLength(2);
        expect(prizeErrors[0]).toHaveTextContent("");
      });
      it("render the other labels", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const otherLabels = screen.getAllByText("Other");
        expect(otherLabels).toHaveLength(2);
      });
      it("render the other values", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const others = screen.getAllByRole('textbox', { name: /other/i }) as HTMLInputElement[];
        expect(others).toHaveLength(2);
        expect(others[0]).toHaveValue("$0.00");
      });
      it("DO NOT render other errors", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const otherErrors = screen.queryAllByTestId("dangerEventOther");
        expect(otherErrors).toHaveLength(2);
        expect(otherErrors[0]).toHaveTextContent("");
      });
      it("render the expense labels", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const extraLabels = screen.getAllByText("Expenses");
        expect(extraLabels).toHaveLength(2);
      });
      it("render the expense values", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const expenses = screen.getAllByRole('textbox', { name: /expenses/i }) as HTMLInputElement[];
        expect(expenses).toHaveLength(2);
        expect(expenses[0]).toHaveValue(
          formatValueSymbSep2Dec(mockEvents[0].expenses, localConfig)
        );
      });
      it("DO NOT render expense errors", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const expenseErrors = screen.queryAllByTestId("dangerEventExpenses");
        expect(expenseErrors).toHaveLength(2);
        expect(expenseErrors[0]).toHaveTextContent("");
      });
      it("render the LPOX labels with space before help icon", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const lpoxLabels = screen.getAllByText(/L\+P\+O\+X/i, { selector: "label" });
        expect(lpoxLabels).toHaveLength(2);
        const label = lpoxLabels[0];
        const text = label.textContent ?? "";        
        expect(text).toMatch(/^L\+P\+O\+X\s+\?/);
      });
      it('renders LPOX help icon with surrounding spaces', () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const helpLables = screen.getAllByText(/L\+P\+O\+X/i, { selector: "label" });
        expect(helpLables).toHaveLength(2);

        const label = helpLables[0] as HTMLLabelElement;
        const helpSpan = within(label).getByText("?", { selector: "span" });
        expect(helpSpan).toBeInTheDocument();
        expect(helpSpan).toHaveClass("popup-help");

        const text = helpSpan.textContent ?? "";
        // one or more spaces, then '?', then one or more spaces
        expect(text).toMatch(/^\s+\?\s+$/); 
      });
      it("render the LPOX values", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const lpoxs = screen.getAllByRole('textbox', { name: /L\+P\+O\+X/i }) as HTMLInputElement[];
        expect(lpoxs).toHaveLength(2);
        expect(lpoxs[0]).toBeDisabled();
        expect(lpoxs[0]).toHaveClass("is-valid");
        expect(lpoxs[0]).toHaveValue(
          formatValueSymbSep2Dec(mockEvents[0].lpox, localConfig)
        );
      });
      it("DO NOT render LPOX errors", () => {
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const lpoxErrors = screen.queryAllByTestId("dangerEventLpox");
        expect(lpoxErrors).toHaveLength(2);
        expect(lpoxErrors[0]).toHaveTextContent("");
      });
    });

    describe("render the 2nd event", () => {
      beforeAll(() => {
        mockEvents[1].event_name_err = "test event name error";        
        mockEvents[1].team_size_err = "test team size error";
        mockEvents[1].games_err = "test games error";
        mockEvents[1].entry_fee_err = "test entry fee error";
        mockEvents[1].lineage_err = "test lineage error";
        mockEvents[1].prize_fund_err = "test prize fund error";
        mockEvents[1].other_err = "test other error";
        mockEvents[1].expenses_err = "test expenses error";
        mockEvents[1].added_money_err = "test added money error";
        mockEvents[1].lpox_valid = 'is-invalid';
        mockEvents[1].lpox_err = "test lpox error";
      })
      afterAll(() => {
        mockEvents[1].event_name_err = '';
        mockEvents[1].team_size_err = '';
        mockEvents[1].games_err = '';
        mockEvents[1].entry_fee_err = '';
        mockEvents[1].lineage_err = '';
        mockEvents[1].prize_fund_err = '';
        mockEvents[1].other_err = '';
        mockEvents[1].expenses_err = '';
        mockEvents[1].added_money_err = '';
        mockEvents[1].lpox_valid = '';
        mockEvents[1].lpox_err = '';
      })

      it("render the 2nd event", async () => {
        // ARRANGE
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        // ACT
        const tabs = screen.getAllByRole("tab");
        // ASSERT
        expect(tabs).toHaveLength(2);
        // ARRANGE
        await user.click(tabs[1]);

        // ASSERT
        expect(tabs[0]).toHaveAttribute("aria-selected", "false"),
        expect(tabs[1]).toHaveAttribute("aria-selected", "true");
      });
      it("render the delete button", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const delBtn = screen.getByText("Delete Event");
        expect(delBtn).toBeInTheDocument();
      });
      it("render the 2nd event name", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const eventNames = screen.getAllByRole("textbox", { name: /event name/i }) as HTMLInputElement[];
        expect(eventNames).toHaveLength(2);
        expect(eventNames[1]).toHaveClass("is-invalid");
        expect(eventNames[1]).toHaveValue(mockEvents[1].event_name);
      });
      it("render 2nd event name error", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const nameErrors = screen.queryAllByTestId("dangerEventName");
        expect(nameErrors).toHaveLength(2);
        expect(nameErrors[1]).toHaveTextContent("test event name error");
      });
      it("render the 2nd team size", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const teamSizes = screen.getAllByRole('spinbutton', { name: /team size/i })
        expect(teamSizes[1]).toHaveClass("is-invalid");
        expect(teamSizes[1]).toHaveValue(mockEvents[1].team_size);
      });
      it("render 2nd team size error", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const nameErrors = screen.queryAllByTestId("dangerTeamSize");
        expect(nameErrors).toHaveLength(2);
        expect(nameErrors[1]).toHaveTextContent("test team size error");
      });
      it("render the 2nd games", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const games = screen.getAllByRole('spinbutton', { name: /event games/i })
        expect(games[1]).toHaveClass("is-invalid");
        expect(games[1]).toHaveValue(mockEvents[1].games);
      });
      it("render 2nd games error", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const nameErrors = screen.queryAllByTestId("dangerEventGames");
        expect(nameErrors).toHaveLength(2);
        expect(nameErrors[1]).toHaveTextContent("test games error");
      });
      it("render the 2nd added money", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const addeds = screen.getAllByRole('textbox', { name: /added \$/i }) as HTMLInputElement[];
        expect(addeds[1]).toHaveClass("is-invalid");
        expect(addeds[1]).toHaveValue(
          formatValueSymbSep2Dec(mockEvents[1].added_money, localConfig)
        );
      });
      it("render 2nd added money error", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const nameErrors = screen.queryAllByTestId("dangerEventAddedMoney");
        expect(nameErrors).toHaveLength(2);
        expect(nameErrors[1]).toHaveTextContent("test added money error");
      });
      it("render the 2nd entry fee", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const fees = screen.getAllByRole('textbox', { name: /entry fee/i }) as HTMLInputElement[];
        expect(fees[1]).toHaveClass("is-invalid");
        expect(fees[1]).toHaveValue(
          formatValueSymbSep2Dec(mockEvents[1].entry_fee, localConfig)
        );
      });
      it("render 2nd entry fee error", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const nameErrors = screen.queryAllByTestId("dangerEventEntryFee");
        expect(nameErrors).toHaveLength(2);
        expect(nameErrors[1]).toHaveTextContent("test entry fee error");
      });
      it("render the 2nd lineage", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const lineages = screen.getAllByRole('textbox', { name: /lineage/i }) as HTMLInputElement[];
        expect(lineages[1]).toHaveClass("is-invalid");
        expect(lineages[1]).toHaveValue(
          formatValueSymbSep2Dec(mockEvents[1].lineage, localConfig)
        );
      });
      it("render 2nd lineage error", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const nameErrors = screen.queryAllByTestId("dangerEventLineage");
        expect(nameErrors).toHaveLength(2);
        expect(nameErrors[1]).toHaveTextContent("test lineage error");
      });
      it("render the 2nd prize fund", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const prizes = screen.getAllByRole('textbox', { name: /prize fund/i }) as HTMLInputElement[];
        expect(prizes[1]).toHaveClass("is-invalid");
        expect(prizes[1]).toHaveValue(
          formatValueSymbSep2Dec(mockEvents[1].prize_fund, localConfig)
        );
      });
      it("render 2nd prize fund error", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const nameErrors = screen.queryAllByTestId("dangerEventPrizeFund");
        expect(nameErrors).toHaveLength(2);
        expect(nameErrors[1]).toHaveTextContent("test prize fund error");
      });
      it("render the 2nd other value", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const others = screen.getAllByRole('textbox', { name: /other/i }) as HTMLInputElement[];
        expect(others[1]).toHaveClass("is-invalid");
        expect(others[1]).toHaveValue(
          formatValueSymbSep2Dec(mockEvents[1].other, localConfig)
        );
      });
      it("render 2nd other error", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const nameErrors = screen.queryAllByTestId("dangerEventOther");
        expect(nameErrors).toHaveLength(2);
        expect(nameErrors[1]).toHaveTextContent("test other error");
      });
      it("render the 2nd expenses", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const expenses = screen.getAllByRole('textbox', { name: /expenses/i }) as HTMLInputElement[];
        expect(expenses[1]).toHaveClass("is-invalid");
        expect(expenses[1]).toHaveValue(
          formatValueSymbSep2Dec(mockEvents[1].expenses, localConfig)
        );
      });
      it("render 2nd expenses error", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const nameErrors = screen.queryAllByTestId("dangerEventExpenses");
        expect(nameErrors).toHaveLength(2);
        expect(nameErrors[1]).toHaveTextContent("test expenses error");
      });
      it("render the 2nd LPOX", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const lpoxs = screen.getAllByRole('textbox', { name: /L\+P\+O\+X/i }) as HTMLInputElement[];
        expect(lpoxs[1]).toHaveValue(
          formatValueSymbSep2Dec(mockEvents[1].lpox, localConfig)
        );
        expect(lpoxs[1]).toHaveClass("is-invalid");
        expect(lpoxs[1]).toBeDisabled();        
      });
      it("render 2nd lpox error", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const nameErrors = screen.queryAllByTestId("dangerEventLpox");
        expect(nameErrors).toHaveLength(2);
        expect(nameErrors[1]).toHaveTextContent("test lpox error");
      });
    });

    describe("render tabs for each event", () => {
      it("render the tabs", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...mockOneToNEventsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[0]); // focus on first tab
        expect(tabs).toHaveLength(2);
        expect(tabs[0]).toHaveTextContent(mockEvents[0].tab_title);
        expect(tabs[0]).toHaveAttribute("aria-selected", "true");
        expect(tabs[1]).toHaveTextContent(mockEvents[1].tab_title);
        expect(tabs[1]).toHaveAttribute("aria-selected", "false");
      });
    })

    describe('render the events when tmntAction is Run - inputs and buttons disabled', () => {
      const runTmntProps = cloneDeep(mockOneToNEventsProps);      
      runTmntProps.tmntAction = tmntActions.Run;
      it("render number of events", () => {
        render(<OneToNEvents {...runTmntProps} />);
        const eventNum = screen.getByRole('textbox', { name: /# events/i }) as HTMLInputElement;
        expect(eventNum).toBeInTheDocument();
        expect(eventNum).toHaveValue("2");
        expect(eventNum).toBeDisabled();
      });
      it("render add button", () => {
        render(<OneToNEvents {...runTmntProps} />);
        const addBtn = screen.getByRole("button", { name: /add/i });
        expect(addBtn).toBeInTheDocument();
        expect(addBtn).toBeDisabled();
      });
      it("render event names", () => {
        render(<OneToNEvents {...runTmntProps} />);
        const eventNames = screen.getAllByRole("textbox", { name: /event name/i }) as HTMLInputElement[];
        expect(eventNames).toHaveLength(2);
        expect(eventNames[0]).toBeDisabled();
        expect(eventNames[1]).toBeDisabled();
      });
      it("render team sizes", () => {
        render(<OneToNEvents {...runTmntProps} />);
        const teamSizes = screen.getAllByRole('spinbutton', { name: /team size/i })
        expect(teamSizes).toHaveLength(2);
        expect(teamSizes[0]).toBeDisabled();
        expect(teamSizes[1]).toBeDisabled();
      });
      it("render event games", () => {
        render(<OneToNEvents {...runTmntProps} />);        
        const games = screen.getAllByRole('spinbutton', { name: /event games/i })
        expect(games).toHaveLength(2);
        expect(games[0]).toBeDisabled();
        expect(games[1]).toBeDisabled();
      });
      it("render added values", () => {
        render(<OneToNEvents {...runTmntProps} />);
        const addeds = screen.getAllByRole('textbox', { name: /added \$/i }) as HTMLInputElement[];
        expect(addeds).toHaveLength(2);
        expect(addeds[0]).toBeDisabled();
        expect(addeds[1]).toBeDisabled();
      });
      it("render fee values", () => {
        render(<OneToNEvents {...runTmntProps} />);
        const fees = screen.getAllByRole('textbox', { name: /entry fee/i }) as HTMLInputElement[];
        expect(fees).toHaveLength(2);
        expect(fees[0]).toBeDefined();
        expect(fees[0]).toBeDisabled();
      });
      it("render lineage values", () => {
        render(<OneToNEvents {...runTmntProps} />);
        const lineages = screen.getAllByRole('textbox', { name: /lineage/i }) as HTMLInputElement[];
        expect(lineages).toHaveLength(2);
        expect(lineages[0]).toBeDisabled();
        expect(lineages[1]).toBeDisabled();
      });
      it("render the prize fund values", () => {
        render(<OneToNEvents {...runTmntProps} />);
        const prizes = screen.getAllByRole('textbox', { name: /prize fund/i }) as HTMLInputElement[];
        expect(prizes).toHaveLength(2);
        expect(prizes[0]).toBeDisabled();
        expect(prizes[1]).toBeDisabled();
      });
      it("render the other values", () => {
        render(<OneToNEvents {...runTmntProps} />);
        const others = screen.getAllByRole('textbox', { name: /other/i }) as HTMLInputElement[];
        expect(others).toHaveLength(2);
        expect(others[0]).toBeDisabled();
        expect(others[1]).toBeDisabled();
      });
      it("render the expense values", () => {
        render(<OneToNEvents {...runTmntProps} />);
        const expenses = screen.getAllByRole('textbox', { name: /expenses/i }) as HTMLInputElement[];
        expect(expenses).toHaveLength(2);
        expect(expenses[0]).toBeDisabled();
        expect(expenses[1]).toBeDisabled();
      });
      it("render the delete button", async () => {
        const user = userEvent.setup();
        render(<OneToNEvents {...runTmntProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const delBtn = screen.getByText("Delete Event");
        expect(delBtn).toBeInTheDocument();
        expect(delBtn).toBeDisabled();
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
      it("only shows the Team Size tooltip while the help icon is hovered", async () => {
        const tooltipRegex = /Singles = 1, Doubles = 2\.\.\./i;

        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        render(<OneToNEvents {...mockOneToNEventsProps} />);

        // 1) BEFORE HOVER – tooltip is NOT in the document
        expect(screen.queryByText(tooltipRegex)).not.toBeInTheDocument();

        const teamLabels = screen.getAllByText(/team size/i, { selector: "label" });
        expect(teamLabels).toHaveLength(2);
        const label = teamLabels[0] as HTMLLabelElement;
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
      it("only shows the Added $ tooltip while the help icon is hovered", async () => {
        const tooltipRegex = /Total Prize Fund = Added \$ \+ \(Entry Prize Fund \* Number of Entries\)/i;

        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        render(<OneToNEvents {...mockOneToNEventsProps} />);

        // 1) BEFORE HOVER – tooltip is NOT in the document
        expect(screen.queryByText(tooltipRegex)).not.toBeInTheDocument();

        const addedLabels = screen.getAllByText(/added \$/i, { selector: "label" });
        expect(addedLabels).toHaveLength(2);
        const label = addedLabels[0] as HTMLLabelElement;
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
      it("only shows the LPOX tooltip while the help icon is hovered", async () => {
        const tooltipRegex = /Lineage \+ Prize Fund \+ Other \+ eXpeses must equal Entry Fee/i;

        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        render(<OneToNEvents {...mockOneToNEventsProps} />);

        // 1) BEFORE HOVER – tooltip is NOT in the document
        expect(screen.queryByText(tooltipRegex)).not.toBeInTheDocument();

        const addedLabels = screen.getAllByText(/L\+P\+O\+X/i, { selector: "label" });
        expect(addedLabels).toHaveLength(2);
        const label = addedLabels[0] as HTMLLabelElement;
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
    })
  });

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

  describe("show lpox valid as not set", () => {
    beforeAll(() => {
      mockEvents.push({
        ...initEvent,
        id: "3",
        sort_order: 3,
        event_name: "Trios",
        tab_title: "Trios",
        lpox_valid: "",
      });
    });

    afterAll(() => {
      if (mockEvents.length === 3) mockEvents.pop();
    });

    it("set lpox as valid", async () => {
      // ARRANGE
      const user = userEvent.setup();
      render(<OneToNEvents {...mockOneToNEventsProps} />);
      // ACT
      const tabs = screen.getAllByRole("tab");
      // ARRANGE
      await user.click(tabs[2]);
      const lpoxs = screen.getAllByRole('textbox', { name: /L\+P\+O\+X/i }) as HTMLInputElement[];
      expect(lpoxs).toHaveLength(3);
      expect(lpoxs[2]).not.toHaveClass("is-valid");
      expect(lpoxs[2]).not.toHaveClass("is-invalid");
    });
  });

  describe("show lpox valid as invalid", () => {
    beforeAll(() => {
      mockEvents.push({
        ...initEvent,
        id: "3",
        sort_order: 3,
        event_name: "Trios",
        tab_title: "Trios",
        lpox_valid: "is-invalid",
      });
    });

    afterAll(() => {
      if (mockEvents.length === 3) mockEvents.pop();
    });

    it("set lpox as in-invalid", async () => {
      // ARRANGE
      const user = userEvent.setup();
      render(<OneToNEvents {...mockOneToNEventsProps} />);
      // ACT
      const tabs = screen.getAllByRole("tab");
      // ARRANGE
      await user.click(tabs[2]);
      const lpoxs = screen.getAllByRole('textbox', { name: /L\+P\+O\+X/i }) as HTMLInputElement[];      
      expect(lpoxs).toHaveLength(3);
      expect(lpoxs[2]).toHaveClass("is-invalid");
    });
  });
});
