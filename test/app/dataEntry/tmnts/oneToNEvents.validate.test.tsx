import { validateEvents } from "@/app/dataEntry/tmntForm/oneToNEvents";
import { eventType, AcdnErrType } from "@/lib/types/types";
import { eventId1, eventId2, mockTmntFullData } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { acdnErrClassName, noAcdnErr, objErrClassName } from "@/app/dataEntry/tmntForm/errors";
import { maxGames, maxTeamSize } from "@/lib/validation";

const baseMockEvent: eventType = {
  ...mockTmntFullData.events[0],
}

// used to create a brand-new event object for each test
const makeEvent = (overrides: Partial<eventType> = {}): eventType => ({
  ...baseMockEvent,
  ...overrides,
});

describe("validate Events", () => {
  it("returns true and clears Acdn error when all events are valid", () => {
    // create valid events array with one event
    const events: eventType[] = [makeEvent()];
    // create new clean mock functions
    const setEvents = jest.fn() as jest.Mock<void, [eventType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateEvents(events, setEvents, setAcdnErr);

    expect(result).toBe(true);
    expect(setEvents).toHaveBeenCalledTimes(1);

    const updatedEvents = setEvents.mock.calls[0][0] as eventType[];
    const ev = updatedEvents[0];

    // All field errors should still be blank
    expect(ev.event_name_err).toBe("");
    expect(ev.team_size_err).toBe("");
    expect(ev.games_err).toBe("");
    expect(ev.added_money_err).toBe("");
    expect(ev.entry_fee_err).toBe("");
    expect(ev.lineage_err).toBe("");
    expect(ev.prize_fund_err).toBe("");
    expect(ev.other_err).toBe("");
    expect(ev.expenses_err).toBe("");
    expect(ev.lpox_err).toBe("");
    expect(ev.errClassName).toBe("");

    // Acdn error cleared
    expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
  });
  it("sets required Event Name error and AcdnErr when event_name is blank", () => {
    // create invalid events array with one event
    const events: eventType[] = [
      makeEvent({
        event_name: " ", // invalid
        tab_title: "",
      }),
    ];
    const setEvents = jest.fn() as jest.Mock<void, [eventType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateEvents(events, setEvents, setAcdnErr);

    expect(result).toBe(false);
    expect(setEvents).toHaveBeenCalledTimes(1);

    const updatedEvents = setEvents.mock.calls[0][0] as eventType[];
    const ev = updatedEvents[0];

    expect(ev.event_name_err).toBe("Event Name is required");
    expect(ev.errClassName).toBe(objErrClassName);

    expect(setAcdnErr).toHaveBeenCalledWith({
      errClassName: acdnErrClassName,
      message: expect.stringContaining("Event Name is required"),
    });
  });  
  it("sets duplicate name error when two events share the same name", () => {
    const baseName = "Doubles";
    // create invalid events array with two events with the same event name
    const e1 = makeEvent({ id: eventId1, event_name: baseName });
    const e2 = makeEvent({ id: eventId2, event_name: baseName, sort_order: e1.sort_order + 1 });

    const events: eventType[] = [e1, e2];
    const setEvents = jest.fn() as jest.Mock<void, [eventType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateEvents(events, setEvents, setAcdnErr);

    expect(result).toBe(false);
    expect(setEvents).toHaveBeenCalledTimes(1);

    const updatedEvents = setEvents.mock.calls[0][0] as eventType[];
    const dupEvent = updatedEvents.find((e) => e.id === eventId2)!;

    expect(dupEvent.event_name_err).toMatch(/already been used/i);
    expect(dupEvent.errClassName).toBe(objErrClassName);

    expect(setAcdnErr).toHaveBeenCalledWith({
      errClassName: acdnErrClassName,
      message: expect.stringContaining(baseName),
    });
  });
  it("clears event_name_err, errClassName and AcdnErr when a previously blank name is now valid", () => {
    // simulate an event that *used* to be invalid but now has a valid name
    const events: eventType[] = [
      makeEvent({
        event_name: "Singles",                    // now valid
        tab_title: "Singles",
        event_name_err: "Event Name is required", // stale error from previous run
        errClassName: objErrClassName,            // stale red highlight
      }),
    ];

    const setEvents = jest.fn() as jest.Mock<void, [eventType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateEvents(events, setEvents, setAcdnErr);

    expect(result).toBe(true);
    expect(setEvents).toHaveBeenCalledTimes(1);

    const updatedEvents = setEvents.mock.calls[0][0] as eventType[];
    const ev = updatedEvents[0];

    // error & highlight cleared
    expect(ev.event_name_err).toBe("");
    expect(ev.errClassName).toBe("");

    // and since there are no errors at all, AcdnErr is cleared
    expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
  });  
  it("sets number field errors when all number values are less than the minimum", () => {
    // create invalid events array with all number fields < 1    
    const events: eventType[] = [
      makeEvent({
        team_size: 0,
        games: 0,
      }),
    ];

    const setEvents = jest.fn() as jest.Mock<void, [eventType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateEvents(events, setEvents, setAcdnErr);

    expect(result).toBe(false);
    expect(setEvents).toHaveBeenCalledTimes(1);

    const updatedEvents = setEvents.mock.calls[0][0] as eventType[];
    const ev = updatedEvents[0];

    // every number field should show a "< min value" error
    expect(ev.team_size_err).toMatch(/cannot be less than/i);
    expect(ev.games_err).toMatch(/cannot be less than/i);

    // and since there are errors, AcdnErr is set
    expect(setAcdnErr).toHaveBeenCalledWith({
      errClassName: acdnErrClassName,
      message: expect.stringContaining("cannot be less than"), 
    });    
  });    
  it("sets money field errors when all money values are less than the minimum", () => {
    // create invalid events array with all money fields < 0
    const underMin = "-1";
    const events: eventType[] = [
      makeEvent({
        added_money: underMin,
        entry_fee: underMin,
        lineage: underMin,
        prize_fund: underMin,
        other: underMin,
        expenses: underMin,
        lpox: "0", // lpox is calculated; setting it won't matter for this test
      }),
    ];

    const setEvents = jest.fn() as jest.Mock<void, [eventType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateEvents(events, setEvents, setAcdnErr);

    expect(result).toBe(false);
    expect(setEvents).toHaveBeenCalledTimes(1);

    const updatedEvents = setEvents.mock.calls[0][0] as eventType[];
    const ev = updatedEvents[0];

    // every money field should show a "< min value" error
    expect(ev.added_money_err).toMatch(/cannot be less than/i);
    expect(ev.entry_fee_err).toMatch(/cannot be less than/i);
    expect(ev.lineage_err).toMatch(/cannot be less than/i);
    expect(ev.prize_fund_err).toMatch(/cannot be less than/i);
    expect(ev.other_err).toMatch(/cannot be less than/i);
    expect(ev.expenses_err).toMatch(/cannot be less than/i);

    // and since there are errors, AcdnErr is set
    expect(setAcdnErr).toHaveBeenCalledWith({
      errClassName: acdnErrClassName,
      message: expect.stringContaining("cannot be less than"), 
    });    

    // lpox_err may or may not be set depending on your LP+O+X logic,
    // so we DO NOT assert lpox_err here.
  });  
  it("sets number field errors when all number values are greater than the maximum", () => {
    // every number value is too large    
    const events: eventType[] = [
      makeEvent({
        team_size: maxTeamSize + 1,
        games: maxGames + 1,
      }),
    ];

    const setEvents = jest.fn() as jest.Mock<void, [eventType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateEvents(events, setEvents, setAcdnErr);

    expect(result).toBe(false);
    expect(setEvents).toHaveBeenCalledTimes(1);

    const updatedEvents = setEvents.mock.calls[0][0] as eventType[];
    const ev = updatedEvents[0];

    // every money field should show a "> max value" error
    expect(ev.team_size_err).toMatch(/cannot be more than/i);
    expect(ev.games_err).toMatch(/cannot be more than/i);
  });  
  it("sets money field errors when all money values are greater than the maximum", () => {
    // every money value is too large
    const overMax = "9999999";
    const events: eventType[] = [
      makeEvent({
        added_money: overMax,
        entry_fee: overMax,
        lineage: overMax,
        prize_fund: overMax,
        other: overMax,
        expenses: overMax,
        lpox: overMax, // lpox is recalculated, won't matter
      }),
    ];

    const setEvents = jest.fn() as jest.Mock<void, [eventType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateEvents(events, setEvents, setAcdnErr);

    expect(result).toBe(false);
    expect(setEvents).toHaveBeenCalledTimes(1);

    const updatedEvents = setEvents.mock.calls[0][0] as eventType[];
    const ev = updatedEvents[0];

    // every money field should show a "> max value" error
    expect(ev.added_money_err).toMatch(/cannot be more than/i);
    expect(ev.entry_fee_err).toMatch(/cannot be more than/i);
    expect(ev.lineage_err).toMatch(/cannot be more than/i);
    expect(ev.prize_fund_err).toMatch(/cannot be more than/i);
    expect(ev.other_err).toMatch(/cannot be more than/i);
    expect(ev.expenses_err).toMatch(/cannot be more than/i);

    // lpox_err: does NOT need to be checked because it is not part of the min/max group
  });  
  it("clears text field errors and errClassName when text values are valid", () => {
    // use valid text values, but keep old errors + highlight to simulate “after user fixes it”
    const events: eventType[] = [
      makeEvent({
        event_name: "Valid Event",  // valid        

        // stale errors from previous invalid state:
        event_name_err: "Event Name cannot be blank",        
        errClassName: objErrClassName,
      }),
    ];

    const setEvents = jest.fn() as jest.Mock<void, [eventType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateEvents(events, setEvents, setAcdnErr);

    expect(result).toBe(true);

    const updatedEvents = setEvents.mock.calls[0][0] as eventType[];
    const ev = updatedEvents[0];

    // all text field errors should now be cleared
    expect(ev.event_name_err).toBe("");    

    // and the “red highlight” flag is cleared
    expect(ev.errClassName).toBe("");

    // no accordion error because everything is valid
    expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
  });
  it("clears number field errors and errClassName when amounts are corrected into valid range", () => {
    // use valid amounts, but keep old errors + highlight to simulate “after user fixes it”
    const events: eventType[] = [
      makeEvent({
        team_size: 2,         // valid
        games: 6,             // valid

        // stale errors from previous invalid state:
        team_size_err: "Team size cannot be less than 1",
        games_err: "Games cannot be more than 999",
        errClassName: objErrClassName,
      }),
    ];

    const setEvents = jest.fn() as jest.Mock<void, [eventType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateEvents(events, setEvents, setAcdnErr);

    expect(result).toBe(true);

    const updatedEvents = setEvents.mock.calls[0][0] as eventType[];
    const ev = updatedEvents[0];

    // all number field errors should now be cleared
    expect(ev.team_size_err).toBe("");
    expect(ev.games_err).toBe("");

    // and the “red highlight” flag is cleared
    expect(ev.errClassName).toBe("");

    // no accordion error because everything is valid
    expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
  });
  it("clears money field errors and errClassName when amounts are corrected into valid range", () => {
    // use valid amounts, but keep old errors + highlight to simulate “after user fixes it”
    const events: eventType[] = [
      makeEvent({
        added_money: "0",         // valid
        entry_fee: "85",          // valid
        lineage: "21",            // valid
        prize_fund: "57",         // valid
        other: "2",               // valid
        expenses: "5",            // valid
        lpox: "85",               // valid

        // stale errors from previous invalid state:
        added_money_err: "Added $ cannot be less than 0",
        entry_fee_err: "Entry Fee cannot be more than 999999",
        lineage_err: "Lineage cannot be less than 0",
        prize_fund_err: "Prize Fund cannot be less than 0",        
        other_err: "Other cannot be less than 0",
        expenses_err: "Expenses cannot be less than 0",
        lpox_err: "LPOX cannot be less than 0",
        errClassName: objErrClassName,
      }),
    ];

    const setEvents = jest.fn() as jest.Mock<void, [eventType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateEvents(events, setEvents, setAcdnErr);

    expect(result).toBe(true);

    const updatedEvents = setEvents.mock.calls[0][0] as eventType[];
    const ev = updatedEvents[0];

    // all money field errors should now be cleared
    expect(ev.added_money_err).toBe("");
    expect(ev.entry_fee_err).toBe("");
    expect(ev.lineage_err).toBe("");
    expect(ev.prize_fund_err).toBe("");
    expect(ev.other_err).toBe("");
    expect(ev.expenses_err).toBe("");
    expect(ev.lpox_err).toBe("");

    // and the “red highlight” flag is cleared
    expect(ev.errClassName).toBe("");

    // no accordion error because everything is valid
    expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
  });
  it("sets lpox error when Entry Fee ≠ LPOX", () => {
    // create invalid events array with one event
    const events: eventType[] = [
      makeEvent({
        entry_fee: "20",
        // LPOX is supposed to be sum of the parts; use a mismatched value.
        lpox: "19",
      }),
    ];
    const setEvents = jest.fn() as jest.Mock<void, [eventType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateEvents(events, setEvents, setAcdnErr);

    expect(result).toBe(false);

    const updatedEvents = setEvents.mock.calls[0][0] as eventType[];
    const ev = updatedEvents[0];

    expect(ev.lpox_err).toBe("Entry Fee ≠ LPOX");
    expect(ev.errClassName).toBe(objErrClassName);
  });
});