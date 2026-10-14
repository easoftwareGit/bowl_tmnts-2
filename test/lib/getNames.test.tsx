import {
  getPotName,
  getBrktOrElimName,
  exportedForTesting,
  getDivName,  
  getPotShortName,
  getPlayerName,
  fullName,
  lastFirst
} from "@/lib/getName";
import {
  mockDivs,
  mockPots,
  mockBrkts,
  mockElims,  
} from "../mocks/tmnts/twoDivs/mockDivs";
import {
  mockTmntFullData,
  playerId1,
  playerId2,
  playerId5,
  playerId9,
  tmntId,
} from "../mocks/tmnts/tmntFullData/mockTmntFullData";
import { initDivs } from "@/lib/db/initVals";
import { cloneDeep } from "lodash";
import { ptSeries } from "@/lib/validation/constants";

const { findDiv } = exportedForTesting;

describe("getName functions", () => {

  describe('findDiv', () => {
    it("finds the correct div", () => {
      const foundDiv = findDiv(mockPots[1].div_id, mockDivs);
      expect(foundDiv?.div_name).toBe("Scratch");
    });

    it("returns undefined if the div is not found", () => {
      const foundDiv = findDiv("div_123", mockDivs);
      expect(foundDiv).toBeUndefined();
    });

    it("returns undefined if the divs array is empty", () => {
      const foundDiv = findDiv(mockPots[1].div_id, []);
      expect(foundDiv).toBeUndefined();
    });
  });

  describe('getDivName', () => {
    it("getDivName returns the correct name", () => {
      const divName = getDivName(mockPots[1].div_id, mockDivs);
      expect(divName).toBe("Scratch");
    });    
    it("getDivName returns an empty string if the div is not found", () => {
      const divName = getDivName("div_123", mockDivs);
      expect(divName).toBe("");
    });
    it("getDivName returns an empty string if the divs array is empty", () => {
      const divName = getDivName(mockPots[1].div_id, []);
      expect(divName).toBe("");
    }); 
  })

  describe('getPotName', () => {
    it("getPotName returns the correct name", () => {
      const potName = getPotName(mockPots[1], mockDivs);
      expect(potName).toBe("Scratch: Last Game");
    });
    
    it("getPotName returns an empty string if the pot is not found", () => {
      const testPot = {
        ...mockPots[1],
        div_id: "div_123"
      };
      const potName = getPotName(testPot, mockDivs);
      expect(potName).toBe("");
    });

    it("getPotName returns an empty string if the divs array is empty", () => {
      const potName = getPotName(mockPots[1], []);
      expect(potName).toBe("");
    }); 

    it("getPotName returns an empty string if pot is undefined", () => {
      const potName = getPotName(undefined, mockDivs);
      expect(potName).toBe("");
    }); 

    it("getPotName returns an empty string if pot is null", () => {
      const potName = getPotName(undefined, mockDivs);
      expect(potName).toBe("");
    }); 

  })

  describe('getPotShortName', () => {
    it("getPotName returns the correct short name for Game", () => {
      const potName = getPotShortName(mockPots[0], mockDivs);
      expect(potName).toBe("Scratch: Gm");
    });    
    it("getPotName returns the correct short name for Last Game", () => {
      const potName = getPotShortName(mockPots[1], mockDivs);
      expect(potName).toBe("Scratch: LG");
    });    
    it("getPotName returns the correct short name for series", () => {
      const testPots = cloneDeep(mockPots);
      testPots[1].pot_type = ptSeries; // Change pot type to Series
      const potName = getPotShortName(testPots[1], mockDivs);
      expect(potName).toBe("Scratch: Sr");
    });    
    it("getPotName returns an empty string if the pot is not found", () => {
      const testPot = {
        ...mockPots[1],
        div_id: "div_123"
      };
      const potName = getPotShortName(testPot, mockDivs);
      expect(potName).toBe("");
    });
    it("getPotName returns an empty string if the divs array is empty", () => {
      const potName = getPotShortName(mockPots[1], []);
      expect(potName).toBe("");
    }); 
  })

  describe('getBrktOrElimName', () => {
    it("getBrktOrElimName returns the correct name for Bracket", () => {
      const brktName = getBrktOrElimName(mockBrkts[1], mockDivs);
      expect(brktName).toBe("Scratch: 4-6");
    });

    it("getBrktOrElimName returns the correct name for Elimination", () => {
      const elimName = getBrktOrElimName(mockElims[1], mockDivs);
      expect(elimName).toBe("Scratch: 4-6");
    });

    it("getBrktOrElimName returns an blank string if the div id is not found", () => {
      const brktName = getBrktOrElimName(mockBrkts[1], initDivs);
      expect(brktName).toBe("");
    });

    it("getBrktOrElimName returns an blank string if the array to search is empty", () => {
      const brktName = getBrktOrElimName(mockBrkts[1], []);
      expect(brktName).toBe("");
    });

    it("getBrktOrElimName returns an blank string if the array to search is empty", () => {
      const brktName = getBrktOrElimName(mockBrkts[1], null as any);
      expect(brktName).toBe("");
    });
    it("getBrktOrElimName returns an blank string if the array to search is empty", () => {
      const brktName = getBrktOrElimName(null as any, mockDivs);
      expect(brktName).toBe("");
    });
    it("getBrktOrElimName returns an blank string if the div_id is blank", () => {
      const noDivId = {
        ...mockBrkts[1],
        div_id: ""
      }
      const brktName = getBrktOrElimName(noDivId, mockDivs);
      expect(brktName).toBe("");
    });
  });

  describe('lastFirst', () => {
    it('should concatenate last and first name with a comma and space between when both names provided', () => {
      const result = lastFirst('John', 'Smith');
      expect(result).toBe('Smith, John');
    });
    it('should return only last name when first name is whitespace', () => {
      const result = lastFirst('   ', 'Smith');
      expect(result).toBe('Smith');
    });
    it('should return only first name when last name is empty', () => {
      const result = lastFirst('John', '');
      expect(result).toBe('John');
    });
    it('should return empty string when both first and last names are empty', () => {
      const result = lastFirst('', '');
      expect(result).toBe('');
    });
    it('should return only last name when first name is empty', () => {
      const result = lastFirst('', 'Doe');
      expect(result).toBe('Doe');
    });
    it('should preserve case sensitivity when both first and last names are provided', () => {
      const result = lastFirst('John', 'DOE');
      expect(result).toBe('DOE, John');
    });
    it('should trim extra spaces between first and last name', () => {
      const result = lastFirst('  John  ', '  Smith  ');
      expect(result).toBe('Smith, John');
    });
    it('should return an empty string when both first and last names are null or undefined', () => {
      const result = lastFirst(null as any, undefined as any);
      expect(result).toBe('');
      const result2 = lastFirst(undefined as any, null as any);
      expect(result2).toBe('');
    });
  });

  describe('fullName', () => {
    it('should concatenate first and last name with space between when both names provided', () => {
      const result = fullName('John', 'Smith');
      expect(result).toBe('John Smith');
    });
    it('should return only last name when first name is whitespace', () => {
      const result = fullName('   ', 'Smith');
      expect(result).toBe('Smith');
    });
    it('should return only first name when last name is empty', () => {
      const result = fullName('John', '');
      expect(result).toBe('John');
    });
    it('should return empty string when both first and last names are empty', () => {
      const result = fullName('', '');
      expect(result).toBe('');
    });
    it('should return only last name when first name is empty', () => {
      const result = fullName('', 'Doe');
      expect(result).toBe('Doe');
    });
    it('should preserve case sensitivity when both first and last names are provided', () => {
      const result = fullName('John', 'DOE');
      expect(result).toBe('John DOE');
    });
    it('should trim extra spaces between first and last name', () => {
      const result = fullName('  John  ', '  Smith  ');
      expect(result).toBe('John Smith');
    });
    it('should return an empty string when both first and last names are null or undefined', () => {
      const result = fullName(null as any, undefined as any);
      expect(result).toBe('');
      const result2 = fullName(undefined as any, null as any);
      expect(result2).toBe('');
    });
  });

  describe('getPlayerName', () => {
    const players = mockTmntFullData.players;

    describe('firstLast = true (default)', () => {
      it('returns "first last" by default', () => {
        expect(getPlayerName(players, playerId1)).toBe('John Doe');
      });
      it('returns "first last" when firstLast is explicitly true', () => {
        expect(getPlayerName(players, playerId2, true)).toBe('Jane Doe');
      });
      it('returns the correct name for a different player', () => {
        expect(getPlayerName(players, playerId5)).toBe('Tom Smith');
      });
    });

    describe('firstLast = false', () => {
      it('returns "last, first"', () => {
        expect(getPlayerName(players, playerId1, false)).toBe('Doe, John');
      });
      it('returns "last, first" for a different player', () => {
        expect(getPlayerName(players, playerId5, false)).toBe('Smith, Tom');
      });
    });

    describe('missing name parts', () => {
      it('returns only the last name when first name is blank (firstLast true)', () => {
        const testPlayers = cloneDeep(players);
        testPlayers[0].first_name = '';
        expect(getPlayerName(testPlayers, playerId1, true)).toBe('Doe');
      });
      it('returns only the last name when first name is blank (firstLast false)', () => {
        const testPlayers = cloneDeep(players);
        testPlayers[0].first_name = '   ';
        expect(getPlayerName(testPlayers, playerId1, false)).toBe('Doe');
      });
      it('returns only the first name when last name is blank (firstLast true)', () => {
        const testPlayers = cloneDeep(players);
        testPlayers[0].last_name = '';
        expect(getPlayerName(testPlayers, playerId1, true)).toBe('John');
      });
      it('returns only the first name when last name is blank (firstLast false)', () => {
        const testPlayers = cloneDeep(players);
        testPlayers[0].last_name = '';
        expect(getPlayerName(testPlayers, playerId1, false)).toBe('John');
      });
      it('returns an empty string when both names are blank', () => {
        const testPlayers = cloneDeep(players);
        testPlayers[0].first_name = '';
        testPlayers[0].last_name = '';
        expect(getPlayerName(testPlayers, playerId1, true)).toBe('');
        expect(getPlayerName(testPlayers, playerId1, false)).toBe('');
      });
    });

    describe('invalid input', () => {
      it('returns an empty string when the player id is not found', () => {
        // valid id format, but not in the 8 mock players
        expect(getPlayerName(players, playerId9)).toBe('');
      });
      it('returns an empty string when the player id is blank', () => {
        expect(getPlayerName(players, '')).toBe('');
      });
      it('returns an empty string when the player id is not a valid id', () => {
        expect(getPlayerName(players, 'abc')).toBe('');
        expect(getPlayerName(players, 'ply_123')).toBe('');
      });
      it('returns an empty string when the id has the wrong prefix', () => {
        expect(getPlayerName(players, tmntId)).toBe('');
      });
      it('returns an empty string when the id is null or undefined', () => {
        expect(getPlayerName(players, null as any)).toBe('');
        expect(getPlayerName(players, undefined as any)).toBe('');
      });
      it('returns an empty string when the players array is empty', () => {
        expect(getPlayerName([], playerId1)).toBe('');
      });
      it('returns an empty string when players is null or undefined', () => {
        expect(getPlayerName(null as any, playerId1)).toBe('');
        expect(getPlayerName(undefined as any, playerId1)).toBe('');
      });
      it('returns an empty string when players is not an array', () => {
        expect(getPlayerName({} as any, playerId1)).toBe('');
        expect(getPlayerName('players' as any, playerId1)).toBe('');
      });
    });
  });

});
