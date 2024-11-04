import { getPotName, getBrktOrElimName, exportedForTesting, getDivName } from "@/lib/getName";
import {
  mockDivs,
  mockPots,
  mockBrkts,
  mockElims,  
} from "../mocks/tmnts/twoDivs/mockDivs";
import { initDivs } from "@/lib/db/initVals";

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
      expect(potName).toBe("Game - Scratch");
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
  })

  describe('getBrktOrElimName', () => {
    it("getBrktOrElimName returns the correct name for Bracket", () => {
      const brktName = getBrktOrElimName(mockBrkts[1], mockDivs);
      expect(brktName).toBe("Scratch: 1-3");
    });

    it("getBrktOrElimName returns the correct name for Elimination", () => {
      const elimName = getBrktOrElimName(mockElims[1], mockDivs);
      expect(elimName).toBe("Scratch: 1-3");
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

});
