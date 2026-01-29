import {
  getAcdnErrMsg,
  getBrktErrMsg,
  getElimErrMsg,
  isDuplicateDateTime,
  isDuplicateDivName,
  isDuplicateEventName,
  isDuplicateSquadName,
} from "@/app/dataEntry/tmntForm/errors";
import { mockEvents } from "../../../mocks/tmnts/singlesAndDoubles/mockEvents";
import {
  initBrkt,
  initDiv,
  initElim,
  initEvent,
  initSquad,
} from "@/lib/db/initVals";
import { mockDivs } from "../../../mocks/tmnts/twoDivs/mockDivs";
import { mockSquads } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { startOfDayFromString, todayStr } from "@/lib/dateTools";
import { startOfToday } from "date-fns";

describe('tmntDataForm - errors', () => {

  describe("getAcdnErrMsg", () => {
    // Returns formatted error message for valid object name and error message
    it("should return formatted error message when given valid object name and error message", () => {
      const objName = "Database";
      const objErrMsg = "Connection failed";
      const result = getAcdnErrMsg(objName, objErrMsg);
      expect(result).toBe(": Error in Database - Connection failed");
    });

    // Handles empty object name
    it("should return formatted error message when object name is empty", () => {
      const objName = "";
      const objErrMsg = "Connection failed";
      const result = getAcdnErrMsg(objName, objErrMsg);
      expect(result).toBe(": Error in  - Connection failed");
    });

    // Handles typical object names and error messages correctly
    it("should return formatted error message when given valid object name and error message", () => {
      const objName = "Database";
      const objErrMsg = "Connection failed";
      const result = getAcdnErrMsg(objName, objErrMsg);
      expect(result).toBe(": Error in Database - Connection failed");
    });

    // Works with standard string inputs
    it("should return formatted error message when given valid object name and error message", () => {
      const objName = "Database";
      const objErrMsg = "Connection failed";
      const result = getAcdnErrMsg(objName, objErrMsg);
      expect(result).toBe(": Error in Database - Connection failed");
    });
  });

  describe("isDuplicateEventName", () => {
    const arrOfEvents = [...mockEvents];

    // returns false for unique event names
    it("should return false for unique event names", () => {
      const testEvent = {
        ...initEvent,
        id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
        sort_order: 3,
        event_name: "Test Event",
      };
      const result = isDuplicateEventName(arrOfEvents, testEvent);
      expect(result).toBe(false);
    });

    // returns false for same event name but sort order matches
    it("should return false for same event name but sort order matches", () => {
      const testEvent = {
        ...initEvent,
        id: "evt_6ff6774e94884658be5bdebc68a6aa7c",
        sort_order: 1,
        event_name: "Singles",
      };
      const result = isDuplicateEventName(arrOfEvents, testEvent);
      expect(result).toBe(false);
    });

    // returns true for duplicate event names with different IDs
    it("should return true for duplicate event names with different IDs", () => {
      const testEvent = {
        ...initEvent,
        id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
        sort_order: 3,
      };
      const result = isDuplicateEventName(arrOfEvents, testEvent);
      expect(result).toBe(true);
    });

    // returns true for duplicate event names regardless of case
    it("should return true for duplicate event names regardless of case", () => {
      const testEvent = {
        ...initEvent,
        id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
        sort_order: 3,
        event_name: "singles",
      };
      const result = isDuplicateEventName(arrOfEvents, testEvent);
      expect(result).toBe(true);
    });

    // handles event names with leading/trailing spaces
    it("should return true for duplicate event names with leading/trailing spaces", () => {
      const arrOfTestEvents = [...mockEvents];
      arrOfTestEvents[0].event_name = "Singles ";
      const testEvent = {
        ...initEvent,
        id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
        sort_order: 3,
        event_name: " Singles",
      };
      const result = isDuplicateEventName(arrOfTestEvents, testEvent);
      expect(result).toBe(true);
    });
  });

  describe("isDuplicateDivName", () => {
    const arrOfDivs = [...mockDivs];

    // returns false for unique div names
    it("should return false for unique div names", () => {
      const testDiv = {
        ...initDiv,
        id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 3,
        div_name: "Test Div",
      };
      const result = isDuplicateDivName(arrOfDivs, testDiv);
      expect(result).toBe(false);
    });

    // returns false for same div name but sort order matches
    it("should return false for same div name but sort order matches", () => {
      const testDiv = {
        ...initDiv,
        id: "div_578834e04e5e4885bbae79229d8b96e8",
        sort_order: 1,
        div_name: "Scratch",
      };
      const result = isDuplicateDivName(arrOfDivs, testDiv);
      expect(result).toBe(false);
    });

    // returns true for duplicate div names with different IDs
    it("should return true for duplicate div names with different IDs", () => {
      const testDiv = {
        ...initDiv,
        id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 3,
        div_name: "Scratch",
      };
      const result = isDuplicateDivName(arrOfDivs, testDiv);
      expect(result).toBe(true);
    });

    // returns true for duplicate div names regardless of case
    it("should return true for duplicate div names regardless of case", () => {
      const testDiv = {
        ...initDiv,
        id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 3,
        div_name: "scratch",
      };
      const result = isDuplicateDivName(arrOfDivs, testDiv);
      expect(result).toBe(true);
    });

    // handles div names with leading/trailing spaces
    it("should return true for duplicate div names with leading/trailing spaces", () => {
      const arrOfTestDivs = [...mockDivs];
      arrOfTestDivs[0].div_name = "Scratch ";
      const testDiv = {
        ...initDiv,
        id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 3,
        div_name: " Scratch",
      };
      const result = isDuplicateDivName(arrOfTestDivs, testDiv);
      expect(result).toBe(true);
    });
  });

  describe("isDuplicateSquadName", () => {
    const arrOfSquads = [...mockSquads];

    // returns false for unique squad names
    it("should return false for unique squad names", () => {
      const testSquad = {
        ...initSquad,
        id: "sqd_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 3,
        squad_name: "Test Squad",      
      };
      const result = isDuplicateSquadName(arrOfSquads, testSquad);
      expect(result).toBe(false);
    });

    // returns false for same squad name but sort order matches
    it("should return false for same squad name but sort order matches", () => {
      const testSquad = {
        ...initSquad,
        id: "sqd_e214ede16c5c46a4950e9a48bfeef61a",
        sort_order: 1,
        event_name: "Singles",
      };
      const result = isDuplicateSquadName(arrOfSquads, testSquad);
      expect(result).toBe(false);
    });

    // returns true for duplicate squad names with different IDs
    it("should return true for duplicate squad names with different IDs", () => {
      const testSquad = {
        ...initSquad,
        id: "sqd_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 3,
        squad_name: "Singles",      
      };
      const result = isDuplicateSquadName(arrOfSquads, testSquad);
      expect(result).toBe(true);
    });

    // returns true for duplicate squad names regardless of case
    it("should return true for duplicate squad names regardless of case", () => {
      const testSquad = {
        ...initSquad,
        id: "sqd_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 3,
        squad_name: "singles",
      };
      const result = isDuplicateSquadName(arrOfSquads, testSquad);
      expect(result).toBe(true);
    });

    // handles squad names with leading/trailing spaces
    it("should return true for duplicate squad names with leading/trailing spaces", () => {
      const arrOfTestSquads = [...mockSquads];
      arrOfTestSquads[0].squad_name = "Singles ";
      const testSquad = {
        ...initSquad,
        id: "sqd_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 3,
        squad_name: " Singles",
      };
      const result = isDuplicateSquadName(arrOfTestSquads, testSquad);
      expect(result).toBe(true);
    });
  });

  describe("getElimErrMsg", () => {
    // returns fee_err when fee_err is present
    it("should return fee_err when fee_err is present", () => {
      const elim = {
        ...initElim,
        fee_err: "Fee error",
      };
      const result = getElimErrMsg(elim);
      expect(result).toBe("Fee error");
    });

    // returns fee_err when all error fields are present
    it("should return fee_err when all error fields are present", () => {
      const elim = {
        ...initElim,
        fee_err: "Fee error",
        games_err: "Games error",
        start_err: "Start error",
      };
      const result = getElimErrMsg(elim);
      expect(result).toBe("Fee error");
    });

    // returns games_err when games_err is present and fee_err is absent
    it("should return games_err when games_err is present and fee_err is absent", () => {
      const elim = {
        ...initElim,
        games_err: "Games error",
      };
      const result = getElimErrMsg(elim);
      expect(result).toBe("Games error");
    });

    // returns start_err when start_err is present and both fee_err and games_err are absent
    it("should return start_err when start_err is present and both fee_err and games_err are absent", () => {
      const elim = {
        ...initElim,
        start_err: "Start error",
      };
      const result = getElimErrMsg(elim);
      expect(result).toBe("Start error");
    });

    // returns an empty string when all error fields are absent
    it("should return empty string when all error fields are absent", () => {
      const elim = {
        ...initElim,
      };
      const result = getElimErrMsg(elim);
      expect(result).toBe("");
    });
  });

  describe("getBrktErrMsg", () => {
    // Returns fee_err when brkt.fee_err is present
    it("should return fee_err when brkt.fee_err is present", () => {
      const brkt = {
        ...initBrkt,
        fee_err: "Fee error",
      };
      const result = getBrktErrMsg(brkt);
      expect(result).toBe("Fee error");
    });

    // Returns first_err when brkt.first_err is present
    it("should return first_err when brkt.first_err is present", () => {
      const brkt = {
        ...initBrkt,
        first_err: "First error",
      };
      const result = getBrktErrMsg(brkt);
      expect(result).toBe("First error");
    });

    // Returns fsa_err when brkt.fsa_err is present
    it("should return fsa_err when brkt.fsa_err is present", () => {
      const brkt = {
        ...initBrkt,
        fsa_err: "FSA error",
      };
      const result = getBrktErrMsg(brkt);
      expect(result).toBe("FSA error");
    });

    // Returns games_err when brkt.games_err is present
    it("should return games_err when brkt.games_err is present", () => {
      const brkt = {
        ...initBrkt,
        games_err: "Games error",
      };
      const result = getBrktErrMsg(brkt);
      expect(result).toBe("Games error");
    });

    // Returns players_err when brkt.players_err is present
    it("should return players_err when brkt.players_err is present", () => {
      const brkt = {
        ...initBrkt,
        players_err: "Players error",
      };
      const result = getBrktErrMsg(brkt);
      expect(result).toBe("Players error");
    });

    // Returns second_err when brkt.second_err is present
    it("should return second_err when brkt.second_err is present", () => {
      const brkt = {
        ...initBrkt,
        second_err: "Second error",
      };
      const result = getBrktErrMsg(brkt);
      expect(result).toBe("Second error");
    });

    // Returns start_err when brkt.start_err is present
    it("should return start_err when brkt.start_err is present", () => {
      const brkt = {
        ...initBrkt,
        start_err: "Start error",
      };
      const result = getBrktErrMsg(brkt);
      expect(result).toBe("Start error");
    });

    // Returns an empty string when no errors are present
    it("should return empty string when no errors are present", () => {
      const brkt = {
        ...initBrkt,
      };
      const result = getBrktErrMsg(brkt);
      expect(result).toBe("");
    });

    // Returns fee_err when multiple errors are present and fee_err exists
    it("should return fee_err when both fee_err and games_err are present", () => {
      const brkt = {
        ...initBrkt,
        fee_err: "Fee error",
        games_err: "Games error",
      };
      const result = getBrktErrMsg(brkt);
      expect(result).toBe("Fee error");
    });

    // Returns first_err when first_err and players_err are present, but no fee_err
    it("should return first_err when first_err and players_err are present and fee_err is absent", () => {
      const brkt = {
        ...initBrkt,
        first_err: "First error",
        players_err: "Players error",
      };
      const result = getBrktErrMsg(brkt);
      expect(result).toBe("First error");
    });
    
  });

  describe('isDuplicateDateTime', () => {
    const arrOfSquads = [...mockSquads];

    // Returns true when a duplicate date and time is found in the array
    it('should return true when a duplicate date and time is found in the array', () => {
      const squad = {
        ...initSquad,
        sort_order: 3,  
        squad_date: startOfToday(),
        squad_date_str: todayStr,
        squad_time: '10:00',
      } 
      const result = isDuplicateDateTime(arrOfSquads, squad);
      expect(result).toBe(true);
    });

    // Returns false when no duplicate date and time is found in the array
    it('should return false when no duplicate date and time is found in the array', () => {    
      const squad = {
        ...initSquad,
        sort_order: 3,  
        squad_date: startOfDayFromString('2023-10-01') as Date, 
        squad_date_str: '2023-10-01',
        squad_time: '11:00',
      } 
      const result = isDuplicateDateTime(arrOfSquads, squad);
      expect(result).toBe(false);
    });

      // Returns false when no sort order is matched, even if the date and time is the same
      it('should return false when no duplicate date and time is found in the array', () => {    
        const squad = {
          ...initSquad,
          sort_order: 1,  
          squad_date: startOfToday(),
          squad_date_str: todayStr,
          squad_time: '10:00',
        } 
        const result = isDuplicateDateTime(arrOfSquads, squad);
        expect(result).toBe(false);
      });
    
  });  
});


