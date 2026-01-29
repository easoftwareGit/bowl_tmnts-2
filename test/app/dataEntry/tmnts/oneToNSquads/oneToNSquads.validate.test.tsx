import userEvent from "@testing-library/user-event";
import { fireEvent, render, screen, within } from "@testing-library/react";
import OneToNSquads from "@/app/dataEntry/tmntForm/oneToNSquads";
import { validateSquads } from "@/app/dataEntry/tmntForm/oneToNSquads";
import { squadType, eventType, AcdnErrType } from "@/lib/types/types";
import { mockTmntFullData, squadId1, squadId2 } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { mockLanes, mockSquads } from "../../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { mockEvents } from "../../../../mocks/tmnts/singlesAndDoubles/mockEvents";
import { acdnErrClassName, noAcdnErr, objErrClassName } from "@/app/dataEntry/tmntForm/errors";
import {
  minGames,
  maxGames,
  minStartLane,
  maxStartLane,
  minLaneCount,
  maxLaneCount,
} from "@/lib/validation/validation";
import { dateTo_UTC_MMddyyyy, dateTo_yyyyMMdd, startOfDayFromString, todayStr } from "@/lib/dateTools";
import { addDays } from "date-fns";
import { cloneDeep } from "lodash";

// base mocks
const baseMockSquad: squadType = {
  ...mockTmntFullData.squads[0],
  // make sure all *_err and errClassName start blank
  event_id_err: "",
  squad_name_err: "",
  games_err: "",
  starting_lane_err: "",
  lane_count_err: "",
  squad_date_err: "",
  squad_time_err: "",
  errClassName: "",
};

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


const baseEvents: eventType[] = mockTmntFullData.events;
const tmntStartDateStr = mockTmntFullData.tmnt.start_date_str;
const tmntEndDateStr = mockTmntFullData.tmnt.end_date_str;

// min/max dates used in validation
const minDate = startOfDayFromString(tmntStartDateStr) as Date;
const maxDate = startOfDayFromString(tmntEndDateStr) as Date;

// helper to create fresh squad per test
const makeSquad = (overrides: Partial<squadType> = {}): squadType => ({
  ...baseMockSquad,
  ...overrides,
});

describe("OneToNSquads - validate", () => {

  describe('validateSquads', () => { 

    it("returns true and clears Acdn error when all squads are valid", () => {
      const squads: squadType[] = [makeSquad()];

      const setSquads = jest.fn() as jest.Mock<void, [squadType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateSquads(
        squads,
        setSquads,
        baseEvents,
        setAcdnErr,
        minDate,
        maxDate
      );

      expect(result).toBe(true);
      expect(setSquads).toHaveBeenCalledTimes(1);

      const updatedSquads = setSquads.mock.calls[0][0] as squadType[];
      const sq = updatedSquads[0];

      expect(sq.event_id_err).toBe("");
      expect(sq.squad_name_err).toBe("");
      expect(sq.games_err).toBe("");
      expect(sq.starting_lane_err).toBe("");
      expect(sq.lane_count_err).toBe("");
      expect(sq.squad_date_err).toBe("");
      expect(sq.squad_time_err).toBe("");
      expect(sq.errClassName).toBe("");

      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });
    it("sets required Squad Name error and AcdnErr when squad_name is blank", () => {
      const squads: squadType[] = [
        makeSquad({
          squad_name: " ",
          tab_title: "",
        }),
      ];

      const setSquads = jest.fn() as jest.Mock<void, [squadType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateSquads(
        squads,
        setSquads,
        baseEvents,
        setAcdnErr,
        minDate,
        maxDate
      );

      expect(result).toBe(false);
      expect(setSquads).toHaveBeenCalledTimes(1);

      const updatedSquads = setSquads.mock.calls[0][0] as squadType[];
      const sq = updatedSquads[0];

      expect(sq.squad_name_err).toBe("Squad Name is required");
      expect(sq.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith({
        errClassName: acdnErrClassName,
        message: expect.stringContaining("Squad Name is required"),
      });
    });
    it("sets duplicate squad name error when two squads share the same name", () => {
      const name = "Morning Squad";

      const s1 = makeSquad({ id: squadId1, squad_name: name });
      const s2 = makeSquad({ id: squadId2, squad_name: name });

      const squads: squadType[] = [s1, s2];

      const setSquads = jest.fn() as jest.Mock<void, [squadType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateSquads(
        squads,
        setSquads,
        baseEvents,
        setAcdnErr,
        minDate,
        maxDate
      );
      expect(result).toBe(false);

      const updatedSquads = setSquads.mock.calls[0][0] as squadType[];
      const dup = updatedSquads.find((s) => s.id === squadId2)!;

      expect(dup.squad_name_err).toMatch(/already been used/i);
      expect(dup.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith({
        errClassName: acdnErrClassName,
        message: expect.stringContaining(name),
      });
    });
    it("sets number field errors when games, starting lane, and lane count are out of range", () => {
      const squads: squadType[] = [
        makeSquad({
          games: minGames - 1,
          starting_lane: 0,         // < 1
          lane_count: 1,            // < minLaneCount and odd
        }),
      ];

      const setSquads = jest.fn() as jest.Mock<void, [squadType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateSquads(
        squads,
        setSquads,
        baseEvents,
        setAcdnErr,
        minDate,
        maxDate
      );

      expect(result).toBe(false);

      const updatedSquads = setSquads.mock.calls[0][0] as squadType[];
      const sq = updatedSquads[0];

      expect(sq.games_err).toMatch(/cannot be less than/i);
      expect(sq.starting_lane_err).toMatch(/cannot be less than 1/i);
      expect(sq.lane_count_err).toMatch(/cannot be less than/i);
    });
    it("sets starting lane and lane count errors when above max or wrong parity", () => {
      const squads: squadType[] = [
        makeSquad({
          games: maxGames + 1,
          starting_lane: maxStartLane + 1,
          lane_count: maxLaneCount + 2,   
        }),
      ];

      const setSquads = jest.fn() as jest.Mock<void, [squadType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateSquads(
        squads,
        setSquads,
        baseEvents,
        setAcdnErr,
        minDate,
        maxDate
      );

      expect(result).toBe(false);

      const updatedSquads = setSquads.mock.calls[0][0] as squadType[];
      const sq = updatedSquads[0];

      expect(sq.games_err).toMatch(/cannot be more than/i);
      expect(sq.starting_lane_err).toMatch(/cannot be more than/i);
      expect(sq.lane_count_err).toMatch(/cannot be more than/i);
    });
    it("sets games, starting lane and lane count errors when above max", () => {
      const squads: squadType[] = [
        makeSquad({
          games: maxGames + 1,
          starting_lane: maxStartLane + 1,
          lane_count: maxLaneCount + 2,   
        }),
      ];

      const setSquads = jest.fn() as jest.Mock<void, [squadType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateSquads(
        squads,
        setSquads,
        baseEvents,
        setAcdnErr,
        minDate,
        maxDate
      );

      expect(result).toBe(false);

      const updatedSquads = setSquads.mock.calls[0][0] as squadType[];
      const sq = updatedSquads[0];

      expect(sq.games_err).toMatch(/cannot be more than/i);
      expect(sq.starting_lane_err).toMatch(/cannot be more than/i);
      expect(sq.lane_count_err).toMatch(/cannot be more than/i);
    });
    it("sets lane count errors when lanes count is odd ", () => {
      const squads: squadType[] = [
        makeSquad({
          lane_count: minLaneCount + 1,  // odd
        }),
      ];

      const setSquads = jest.fn() as jest.Mock<void, [squadType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateSquads(
        squads,
        setSquads,
        baseEvents,
        setAcdnErr,
        minDate,
        maxDate
      );

      expect(result).toBe(false);

      const updatedSquads = setSquads.mock.calls[0][0] as squadType[];
      const sq = updatedSquads[0];

      expect(sq.lane_count_err).toMatch(/cannot be odd/i);
    });
    it("sets date errors when date is missing", () => {
      const squads: squadType[] = [
        makeSquad({
          squad_date_str: "", // missing date
        }),
      ];

      const setSquads = jest.fn() as jest.Mock<void, [squadType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateSquads(
        squads,
        setSquads,
        baseEvents,
        setAcdnErr,
        minDate,
        maxDate
      );

      expect(result).toBe(false);

      const updatedSquads = setSquads.mock.calls[0][0] as squadType[];
      const sq = updatedSquads[0];

      expect(sq.squad_date_err).toBe("Date is required");
      expect(sq.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith({
        errClassName: acdnErrClassName,
        message: expect.stringContaining("Date is required"),
      });
    });
    it("sets date errors when date is before tournament start date", () => {
      const minDateStr = dateTo_UTC_MMddyyyy(minDate);
      const invalidDate = dateTo_yyyyMMdd(addDays(minDate, -1));
      const squads: squadType[] = [
        makeSquad({
          squad_date_str: invalidDate,
        }),
      ];

      const setSquads = jest.fn() as jest.Mock<void, [squadType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateSquads(
        squads,
        setSquads,
        baseEvents,
        setAcdnErr,
        minDate,
        maxDate
      );

      expect(result).toBe(false);

      const updatedSquads = setSquads.mock.calls[0][0] as squadType[];
      const sq = updatedSquads[0];

      expect(sq.squad_date_err).toBe("Earliest date is " + minDateStr);
      expect(sq.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith({
        errClassName: acdnErrClassName,
        message: expect.stringContaining("Earliest date is"),
      });
    });
    it("sets date errors when date is after tournament start date", () => {
      const maxDateStr = dateTo_UTC_MMddyyyy(maxDate);
      const invalidDate = dateTo_yyyyMMdd(addDays(minDate, +1));
      const squads: squadType[] = [
        makeSquad({
          squad_date_str: invalidDate, 
        }),
      ];

      const setSquads = jest.fn() as jest.Mock<void, [squadType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateSquads(
        squads,
        setSquads,
        baseEvents,
        setAcdnErr,
        minDate,
        maxDate
      );

      expect(result).toBe(false);

      const updatedSquads = setSquads.mock.calls[0][0] as squadType[];
      const sq = updatedSquads[0];

      expect(sq.squad_date_err).toBe("Latest date is " + maxDateStr);
      expect(sq.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith({
        errClassName: acdnErrClassName,
        message: expect.stringContaining("Latest date is"),
      });
    });
    it("does not require time when there is only one squad", () => {
      const squads: squadType[] = [
        makeSquad({
          squad_time: "", // optional when only one squad
        }),
      ];

      const setSquads = jest.fn() as jest.Mock<void, [squadType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateSquads(
        squads,
        setSquads,
        baseEvents,
        setAcdnErr,
        minDate,
        maxDate
      );

      expect(result).toBe(true);

      const updatedSquads = setSquads.mock.calls[0][0] as squadType[];
      const sq = updatedSquads[0];

      expect(sq.squad_time_err).toBe("");
      expect(sq.errClassName).toBe("");

      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });
    it("requires time when there is more than one squad", () => {
      const date = baseMockSquad.squad_date_str;

      const s1 = makeSquad({
        id: squadId1,
        squad_name: "Squad 1",
        squad_date_str: date,
        squad_time: "09:00",
      });

      const s2 = makeSquad({
        id: squadId2,
        squad_name: "Squad 2",
        squad_date_str: date,
        squad_time: "", // missing → should be error
      });

      const squads: squadType[] = [s1, s2];

      const setSquads = jest.fn() as jest.Mock<void, [squadType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateSquads(
        squads,
        setSquads,
        baseEvents,
        setAcdnErr,
        minDate,
        maxDate
      );

      expect(result).toBe(false);

      const updatedSquads = setSquads.mock.calls[0][0] as squadType[];
      const sq2 = updatedSquads.find((s) => s.id === squadId2)!;

      expect(sq2.squad_time_err).toBe("Time is required");
      expect(sq2.errClassName).toBe(objErrClassName);
    });
    it("sets duplicate date/time error when two squads share the same date and time", () => {
      const date = baseMockSquad.squad_date_str;
      const time = baseMockSquad.squad_time || "09:00";

      const s1 = makeSquad({
        id: squadId1,
        squad_name: "Squad 1",
        squad_date_str: date,
        squad_time: time,
      });

      const s2 = makeSquad({
        id: squadId2,
        squad_name: "Squad 2",
        squad_date_str: date, // duplicate date
        squad_time: time,     // duplicate time
        sort_order: s1.sort_order + 1,
      });

      const squads: squadType[] = [s1, s2];

      const setSquads = jest.fn() as jest.Mock<void, [squadType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateSquads(
        squads,
        setSquads,
        baseEvents,
        setAcdnErr,
        minDate,
        maxDate
      );

      expect(result).toBe(false);

      const updatedSquads = setSquads.mock.calls[0][0] as squadType[];
      const sq2 = updatedSquads.find((s) => s.id === squadId2)!;

      expect(sq2.squad_time_err).toMatch(/has already been used\./i);
      expect(sq2.errClassName).toBe(objErrClassName);
    });
    it("sets 'Event not found' when squad.event_id does not match any event", () => {
      const squads = [
        makeSquad({
          event_id: "nonexistent_event",
        }),
      ];

      const setSquads = jest.fn() as jest.Mock<void, [squadType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateSquads(
        squads,
        setSquads,
        baseEvents,
        setAcdnErr,
        minDate,
        maxDate
      );

      expect(result).toBe(false);

      const updatedSquads = setSquads.mock.calls[0][0] as squadType[];
      const sq = updatedSquads[0];

      expect(sq.event_id_err).toBe("Event not found");
      expect(setAcdnErr).toHaveBeenCalledWith({
        errClassName: acdnErrClassName,
        message: expect.stringContaining("Event not found"),
      });
    });
    it("sets 'Event not found' when squad.event_id does not match any event", () => {
      const squads = [
        makeSquad({
          event_id: "nonexistent_event",
        }),
      ];

      const setSquads = jest.fn() as jest.Mock<void, [squadType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateSquads(
        squads,
        setSquads,
        baseEvents,
        setAcdnErr,
        minDate,
        maxDate
      );

      expect(result).toBe(false);

      const updatedSquads = setSquads.mock.calls[0][0] as squadType[];
      const sq = updatedSquads[0];

      expect(sq.event_id_err).toBe("Event not found");
      expect(setAcdnErr).toHaveBeenCalledWith({
        errClassName: acdnErrClassName,
        message: expect.stringContaining("Event not found"),
      });
    });

  })

  describe('clear squad errors and errClassName', () => { 

    it("clears squad errors and errClassName when values are corrected into valid range", () => {
      const squads: squadType[] = [
        makeSquad({
          squad_name: "Corrected",
          games: minGames,
          starting_lane: minStartLane,
          lane_count: minLaneCount,
          squad_date_str: tmntStartDateStr,
          squad_time: "09:00",

          // stale errors from previous invalid state:
          squad_name_err: "Squad Name is required",
          games_err: "Squad Games cannot be less than " + minGames,
          starting_lane_err: "Starting Lane cannot be less than 1",
          lane_count_err: "Number of Lanes cannot be less than 2",
          squad_date_err: "Date is required",
          squad_time_err: "Time is required",
          errClassName: objErrClassName,
        }),
      ];

      const setSquads = jest.fn() as jest.Mock<void, [squadType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validateSquads(
        squads,
        setSquads,
        baseEvents,
        setAcdnErr,
        minDate,
        maxDate
      );

      expect(result).toBe(true);

      const updatedSquads = setSquads.mock.calls[0][0] as squadType[];
      const sq = updatedSquads[0];

      expect(sq.squad_name_err).toBe("");
      expect(sq.games_err).toBe("");
      expect(sq.starting_lane_err).toBe("");
      expect(sq.lane_count_err).toBe("");
      expect(sq.squad_date_err).toBe("");
      expect(sq.squad_time_err).toBe("");
      expect(sq.errClassName).toBe("");

      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });

    it("onBlur with blank name resets squad_name, tab_title and clears squad_name_err", () => {
      const localSquads = cloneDeep(mockSquads);

      // Seed the squad into a non-default state
      localSquads[0].squad_name = "Something";
      localSquads[0].tab_title = "Something";
      localSquads[0].squad_name_err = "Old error";

      const setSquads = jest.fn();

      render(
        <OneToNSquads
          {...mockOneToNSquadsProps}
          squads={localSquads}
          setSquads={setSquads}
        />
      );

      const nameInputs = screen.getAllByRole("textbox", { name: /squad name/i }) as HTMLInputElement[];
      const input = nameInputs[0];

      // Bypass handleInputChange, drive handleBlur directly
      fireEvent.blur(input, {
        target: { name: "name", value: "" },
      } as any);

      expect(setSquads).toHaveBeenCalled();

      const [updatedSquads] = setSquads.mock.calls.at(-1) as [squadType[]];
      const sq0 = updatedSquads[0];

      // Default naming behavior
      const expectedName = `Squad ${sq0.sort_order}`;

      expect(sq0.squad_name).toBe(expectedName);
      expect(sq0.tab_title).toBe(expectedName);

      // Error should be cleared
      expect(sq0.squad_name_err).toBe("");
    });    

    it("onBlur with blank games resets to default and clears games_err", () => {
      const localSquads = cloneDeep(mockSquads);
      localSquads[0].games = 7;
      localSquads[0].games_err = "Old games error";

      const setSquads = jest.fn();

      render(
        <OneToNSquads
          {...mockOneToNSquadsProps}
          squads={localSquads}
          setSquads={setSquads}
        />
      );

      const gamesInputs = screen.getAllByRole("spinbutton", { name: /squad games/i }) as HTMLInputElement[];
      const firstGamesInput = gamesInputs[0];

      // Directly fire blur with a blank value, skipping handleInputChange
      fireEvent.blur(firstGamesInput, {
        target: { name: "games", value: "" },
      } as any);

      expect(setSquads).toHaveBeenCalled();
      const [updatedSquads] = setSquads.mock.calls.at(-1) as [squadType[]];
      const sq0 = updatedSquads[0];

      expect(sq0.games).toBe(3);          // default is 3 in handleBlur
      expect(sq0.games_err).toBe("");     // cleared
    });

    it("onBlur with blank starting_lane resets to default and clears starting_lane_err", () => {
      const localSquads = cloneDeep(mockSquads);
      localSquads[0].starting_lane = 7;
      localSquads[0].starting_lane_err = "Old starting lane error";

      const setSquads = jest.fn();

      render(
        <OneToNSquads
          {...mockOneToNSquadsProps}
          squads={localSquads}
          setSquads={setSquads}
        />
      );

      const startLaneInputs = screen.getAllByRole("spinbutton", { name: /starting lane/i }) as HTMLInputElement[];
      const firstStartLaneInput = startLaneInputs[0];

      // Directly fire blur with a blank value, skipping handleInputChange
      fireEvent.blur(firstStartLaneInput, {
        target: { name: "starting_lane", value: "" },
      } as any);

      expect(setSquads).toHaveBeenCalled();
      const [updatedSquads] = setSquads.mock.calls.at(-1) as [squadType[]];
      const sq0 = updatedSquads[0];

      expect(sq0.starting_lane).toBe(1);          // default ia 1 in handleBlur
      expect(sq0.starting_lane_err).toBe("");     // cleared
    });

    it("onBlur with blank lane_count resets to default and clears lane_count_err", () => {
      const localSquads = cloneDeep(mockSquads);
      localSquads[0].lane_count = 10;
      localSquads[0].lane_count_err = "Old starting lane count error";

      const setSquads = jest.fn();

      render(
        <OneToNSquads
          {...mockOneToNSquadsProps}
          squads={localSquads}
          setSquads={setSquads}
        />
      );

      const laneCountInputs = screen.getAllByRole("spinbutton", { name: /of lanes/i }) as HTMLInputElement[];
      const firstLaneCountInput = laneCountInputs[0];

      // Directly fire blur with a blank value, skipping handleInputChange
      fireEvent.blur(firstLaneCountInput, {
        target: { name: "lane_count", value: "" },
      } as any);

      expect(setSquads).toHaveBeenCalled();
      const [updatedSquads] = setSquads.mock.calls.at(-1) as [squadType[]];
      const sq0 = updatedSquads[0];

      expect(sq0.lane_count).toBe(2);          // default is 2 in handleBlur
      expect(sq0.lane_count_err).toBe("");     // cleared
    });

    it("onBlur with blank squad_date_str resets to default and clears squad_date_err", () => {
      const localSquads = cloneDeep(mockSquads);
      localSquads[0].squad_date_str = "2023-01-01";
      localSquads[0].squad_date_err = "Old squad date error";

      const setSquads = jest.fn();

      render(
        <OneToNSquads
          {...mockOneToNSquadsProps}
          squads={localSquads}
          setSquads={setSquads}
        />
      );
      const dateInputs = screen.getAllByLabelText(/date/i) as HTMLInputElement[];
      const firstDateInput = dateInputs[0];

      // Directly fire blur with a blank value, skipping handleInputChange
      fireEvent.blur(firstDateInput, {
        target: { name: "squad_date_str", value: "" },
      } as any);

      expect(setSquads).toHaveBeenCalled();
      const [updatedSquads] = setSquads.mock.calls.at(-1) as [squadType[]];
      const sq0 = updatedSquads[0];

      expect(sq0.squad_date_str).toBe(todayStr);  // default in handleBlur
      expect(sq0.squad_date_err).toBe("");        // cleared
    });

    it("onBlur with blank squad_time resets to default and clears squad_time_err", () => {
      const localSquads = cloneDeep(mockSquads);
      localSquads[0].squad_time = "11:45 PM";
      localSquads[0].squad_date_err = "Old squad time error";

      const setSquads = jest.fn();

      render(
        <OneToNSquads
          {...mockOneToNSquadsProps}
          squads={localSquads}
          setSquads={setSquads}
        />
      );
      const timeInputs = screen.getAllByLabelText(/start time/i) as HTMLInputElement[];              
      const firstTimeInput = timeInputs[0];

      // Directly fire blur with a blank value, skipping handleInputChange
      fireEvent.blur(firstTimeInput, {
        target: { name: "squad_time", value: "" },
      } as any);

      expect(setSquads).toHaveBeenCalled();
      const [updatedSquads] = setSquads.mock.calls.at(-1) as [squadType[]];
      const sq0 = updatedSquads[0];

      expect(sq0.squad_time).toBe("");        // default in handleBlur
      expect(sq0.squad_time_err).toBe("");    // cleared
    });

  })

});
