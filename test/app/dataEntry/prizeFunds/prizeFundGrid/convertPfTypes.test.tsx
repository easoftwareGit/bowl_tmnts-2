import type {
  divPfEntryRow,
  divPfType,
  elimPfEntryRow,
  elimPfType,
  potPfEntryRow,
  potPfType,
  prizeFundEntryRow,
  prizeFundType,
} from "@/lib/types/types";
import {
  divPfEntryRowToPrizeFundEntryRow,
  divPfEntryRowsToPrizeFundEntryRows,
  divPfToPrizeFund,
  divPfsToPrizeFunds,
  elimPfEntryRowToPrizeFundEntryRow,
  elimPfEntryRowsToPrizeFundEntryRows,
  elimPfToPrizeFund,
  elimPfsToPrizeFunds,
  pfEntryRowToDivPfEntryRow,
  pfEntryRowToElimPfEntryRow,
  pfEntryRowToPotPfEntryRow,
  pfEntryRowsToDivPfEntryRows,
  pfEntryRowsToElimPfEntryRows,
  pfEntryRowsToPotPfEntryRows,
  potPfEntryRowToPrizeFundEntryRow,
  potPfEntryRowsToPrizeFundEntryRows,
  potPfToPrizeFund,
  potPfsToPrizeFunds,
  prizeFundEntryRowToDivPfEntryRow,
  prizeFundEntryRowToElimPfEntryRow,
  prizeFundEntryRowToPotPfEntryRow,
  prizeFundEntryRowsToDivPfEntryRows,
  prizeFundEntryRowsToElimPfEntryRows,
  prizeFundEntryRowsToPotPfEntryRows,
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/convertPfTypes";
import { cloneDeep } from "lodash";

describe("convertPfTypes", () => {

  /*************
   * divisions *
   *************/

  describe("divPfToPrizeFund", () => {
    it("converts a division prize fund to a generic prize fund", () => {
      const divPf: divPfType = {
        id: "dpf_1",
        div_id: "div_1",
        position: 1,
        amount: 500,
      };

      const expected: prizeFundType = {
        id: "dpf_1",
        parent_id: "div_1",
        position: 1,
        amount: 500,
      };

      expect(divPfToPrizeFund(divPf)).toEqual(expected);
    });

    it("preserves null position and amount values", () => {
      const divPf: divPfType = {
        id: "dpf_1",
        div_id: "div_1",
        position: null,
        amount: null,
      };

      expect(divPfToPrizeFund(divPf)).toEqual({
        id: "dpf_1",
        parent_id: "div_1",
        position: null,
        amount: null,
      });
    });
  });

  describe("divPfsToPrizeFunds", () => {
    it("converts an array of division prize funds", () => {
      const divPfs: divPfType[] = [
        {
          id: "dpf_1",
          div_id: "div_1",
          position: 1,
          amount: 500,
        },
        {
          id: "dpf_2",
          div_id: "div_1",
          position: 2,
          amount: 300,
        },
      ];

      expect(divPfsToPrizeFunds(divPfs)).toEqual([
        {
          id: "dpf_1",
          parent_id: "div_1",
          position: 1,
          amount: 500,
        },
        {
          id: "dpf_2",
          parent_id: "div_1",
          position: 2,
          amount: 300,
        },
      ]);
    });

    it("returns an empty array when given an empty array", () => {
      expect(divPfsToPrizeFunds([])).toEqual([]);
    });

    it("does not modify the original division prize-fund array", () => {
      const divPfs: divPfType[] = [
        {
          id: "dpf_1",
          div_id: "div_1",
          position: 1,
          amount: 500,
        },
      ];

      const original = cloneDeep(divPfs);

      divPfsToPrizeFunds(divPfs);

      expect(divPfs).toEqual(original);
    });
  });

  describe("pfEntryRowToDivPfEntryRow", () => {
    it("converts a generic entry row to a division entry row", () => {
      const pfRow: prizeFundEntryRow = {
        id: "dpf_1",
        parent_id: "div_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      };

      const expected: divPfEntryRow = {
        id: "dpf_1",
        div_id: "div_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      };

      expect(pfEntryRowToDivPfEntryRow(pfRow)).toEqual(expected);
    });
  });

  describe("pfEntryRowsToDivPfEntryRows", () => {
    it("converts generic entry rows to division entry rows", () => {
      const pfRows: prizeFundEntryRow[] = [
        {
          id: "dpf_1",
          parent_id: "div_1",
          position: 1,
          amount: 500,
          percentage: 62.5,
        },
        {
          id: "dpf_2",
          parent_id: "div_1",
          position: 2,
          amount: 300,
          percentage: 37.5,
        },
      ];

      expect(pfEntryRowsToDivPfEntryRows(pfRows)).toEqual([
        {
          id: "dpf_1",
          div_id: "div_1",
          position: 1,
          amount: 500,
          percentage: 62.5,
        },
        {
          id: "dpf_2",
          div_id: "div_1",
          position: 2,
          amount: 300,
          percentage: 37.5,
        },
      ]);
    });

    it("returns an empty array when given an empty array", () => {
      expect(pfEntryRowsToDivPfEntryRows([])).toEqual([]);
    });
  });

  describe("divPfEntryRowToPrizeFundEntryRow", () => {
    it("converts a division entry row to a generic entry row", () => {
      const divPfRow: divPfEntryRow = {
        id: "dpf_1",
        div_id: "div_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      };

      const expected: prizeFundEntryRow = {
        id: "dpf_1",
        parent_id: "div_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      };

      expect(divPfEntryRowToPrizeFundEntryRow(divPfRow)).toEqual(expected);
    });
  });

  describe("divPfEntryRowsToPrizeFundEntryRows", () => {
    it("converts division entry rows to generic entry rows", () => {
      const divPfRows: divPfEntryRow[] = [
        {
          id: "dpf_1",
          div_id: "div_1",
          position: 1,
          amount: 500,
          percentage: 62.5,
        },
        {
          id: "dpf_2",
          div_id: "div_1",
          position: 2,
          amount: 300,
          percentage: 37.5,
        },
      ];

      expect(divPfEntryRowsToPrizeFundEntryRows(divPfRows)).toEqual([
        {
          id: "dpf_1",
          parent_id: "div_1",
          position: 1,
          amount: 500,
          percentage: 62.5,
        },
        {
          id: "dpf_2",
          parent_id: "div_1",
          position: 2,
          amount: 300,
          percentage: 37.5,
        },
      ]);
    });

    it("returns an empty array when given an empty array", () => {
      expect(divPfEntryRowsToPrizeFundEntryRows([])).toEqual([]);
    });
  });

  describe("prizeFundEntryRowToDivPfEntryRow", () => {
    it("converts a generic entry row to a division entry row", () => {
      const pfRow: prizeFundEntryRow = {
        id: "dpf_1",
        parent_id: "div_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      };

      expect(prizeFundEntryRowToDivPfEntryRow(pfRow)).toEqual({
        id: "dpf_1",
        div_id: "div_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      });
    });
  });

  describe("prizeFundEntryRowsToDivPfEntryRows", () => {
    it("converts generic entry rows to division entry rows", () => {
      const pfRows: prizeFundEntryRow[] = [
        {
          id: "dpf_1",
          parent_id: "div_1",
          position: 1,
          amount: 500,
          percentage: 62.5,
        },
        {
          id: "dpf_2",
          parent_id: "div_1",
          position: 2,
          amount: 300,
          percentage: 37.5,
        },
      ];

      expect(prizeFundEntryRowsToDivPfEntryRows(pfRows)).toEqual([
        {
          id: "dpf_1",
          div_id: "div_1",
          position: 1,
          amount: 500,
          percentage: 62.5,
        },
        {
          id: "dpf_2",
          div_id: "div_1",
          position: 2,
          amount: 300,
          percentage: 37.5,
        },
      ]);
    });

    it("returns an empty array when given an empty array", () => {
      expect(prizeFundEntryRowsToDivPfEntryRows([])).toEqual([]);
    });
  });

  /********
   * pots *
   ********/

  describe("potPfToPrizeFund", () => {
    it("converts a pot prize fund to a generic prize fund", () => {
      const potPf: potPfType = {
        id: "ppf_1",
        pot_id: "pot_1",
        position: 1,
        amount: 500,
      };

      const expected: prizeFundType = {
        id: "ppf_1",
        parent_id: "pot_1",
        position: 1,
        amount: 500,
      };

      expect(potPfToPrizeFund(potPf)).toEqual(expected);
    });

    it("preserves null position and amount values", () => {
      const potPf: potPfType = {
        id: "ppf_1",
        pot_id: "pot_1",
        position: null,
        amount: null,
      };

      expect(potPfToPrizeFund(potPf)).toEqual({
        id: "ppf_1",
        parent_id: "pot_1",
        position: null,
        amount: null,
      });
    });
  });

  describe("potPfsToPrizeFunds", () => {
    it("converts an array of pot prize funds", () => {
      const potPfs: potPfType[] = [
        {
          id: "ppf_1",
          pot_id: "pot_1",
          position: 1,
          amount: 500,
        },
        {
          id: "ppf_2",
          pot_id: "pot_1",
          position: 2,
          amount: 300,
        },
      ];

      expect(potPfsToPrizeFunds(potPfs)).toEqual([
        {
          id: "ppf_1",
          parent_id: "pot_1",
          position: 1,
          amount: 500,
        },
        {
          id: "ppf_2",
          parent_id: "pot_1",
          position: 2,
          amount: 300,
        },
      ]);
    });

    it("returns an empty array when given an empty array", () => {
      expect(potPfsToPrizeFunds([])).toEqual([]);
    });

    it("does not modify the original pot prize-fund array", () => {
      const potPfs: potPfType[] = [
        {
          id: "ppf_1",
          pot_id: "pot_1",
          position: 1,
          amount: 500,
        },
      ];

      const original = cloneDeep(potPfs);

      potPfsToPrizeFunds(potPfs);

      expect(potPfs).toEqual(original);
    });
  });

  describe("pfEntryRowToPotPfEntryRow", () => {
    it("converts a generic entry row to a pot entry row", () => {
      const pfRow: prizeFundEntryRow = {
        id: "ppf_1",
        parent_id: "pot_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      };

      const expected: potPfEntryRow = {
        id: "ppf_1",
        pot_id: "pot_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      };

      expect(pfEntryRowToPotPfEntryRow(pfRow)).toEqual(expected);
    });
  });

  describe("pfEntryRowsToPotPfEntryRows", () => {
    it("converts generic entry rows to pot entry rows", () => {
      const pfRows: prizeFundEntryRow[] = [
        {
          id: "ppf_1",
          parent_id: "pot_1",
          position: 1,
          amount: 500,
          percentage: 62.5,
        },
        {
          id: "ppf_2",
          parent_id: "pot_1",
          position: 2,
          amount: 300,
          percentage: 37.5,
        },
      ];

      expect(pfEntryRowsToPotPfEntryRows(pfRows)).toEqual([
        {
          id: "ppf_1",
          pot_id: "pot_1",
          position: 1,
          amount: 500,
          percentage: 62.5,
        },
        {
          id: "ppf_2",
          pot_id: "pot_1",
          position: 2,
          amount: 300,
          percentage: 37.5,
        },
      ]);
    });

    it("returns an empty array when given an empty array", () => {
      expect(pfEntryRowsToPotPfEntryRows([])).toEqual([]);
    });
  });

  describe("potPfEntryRowToPrizeFundEntryRow", () => {
    it("converts a pot entry row to a generic entry row", () => {
      const potPfRow: potPfEntryRow = {
        id: "ppf_1",
        pot_id: "pot_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      };

      const expected: prizeFundEntryRow = {
        id: "ppf_1",
        parent_id: "pot_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      };

      expect(potPfEntryRowToPrizeFundEntryRow(potPfRow)).toEqual(expected);
    });
  });

  describe("potPfEntryRowsToPrizeFundEntryRows", () => {
    it("converts pot entry rows to generic entry rows", () => {
      const potPfRows: potPfEntryRow[] = [
        {
          id: "ppf_1",
          pot_id: "pot_1",
          position: 1,
          amount: 500,
          percentage: 62.5,
        },
        {
          id: "ppf_2",
          pot_id: "pot_1",
          position: 2,
          amount: 300,
          percentage: 37.5,
        },
      ];

      expect(potPfEntryRowsToPrizeFundEntryRows(potPfRows)).toEqual([
        {
          id: "ppf_1",
          parent_id: "pot_1",
          position: 1,
          amount: 500,
          percentage: 62.5,
        },
        {
          id: "ppf_2",
          parent_id: "pot_1",
          position: 2,
          amount: 300,
          percentage: 37.5,
        },
      ]);
    });

    it("returns an empty array when given an empty array", () => {
      expect(potPfEntryRowsToPrizeFundEntryRows([])).toEqual([]);
    });
  });

  describe("prizeFundEntryRowToPotPfEntryRow", () => {
    it("converts a generic entry row to a pot entry row", () => {
      const pfRow: prizeFundEntryRow = {
        id: "ppf_1",
        parent_id: "pot_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      };

      expect(prizeFundEntryRowToPotPfEntryRow(pfRow)).toEqual({
        id: "ppf_1",
        pot_id: "pot_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      });
    });
  });

  describe("prizeFundEntryRowsToPotPfEntryRows", () => {
    it("converts generic entry rows to pot entry rows", () => {
      const pfRows: prizeFundEntryRow[] = [
        {
          id: "ppf_1",
          parent_id: "pot_1",
          position: 1,
          amount: 500,
          percentage: 62.5,
        },
        {
          id: "ppf_2",
          parent_id: "pot_1",
          position: 2,
          amount: 300,
          percentage: 37.5,
        },
      ];

      expect(prizeFundEntryRowsToPotPfEntryRows(pfRows)).toEqual([
        {
          id: "ppf_1",
          pot_id: "pot_1",
          position: 1,
          amount: 500,
          percentage: 62.5,
        },
        {
          id: "ppf_2",
          pot_id: "pot_1",
          position: 2,
          amount: 300,
          percentage: 37.5,
        },
      ]);
    });

    it("returns an empty array when given an empty array", () => {
      expect(prizeFundEntryRowsToPotPfEntryRows([])).toEqual([]);
    });
  });

  /***************
   * eliminators *
   ***************/

  describe("elimPfToPrizeFund", () => {
    it("converts an eliminator prize fund to a generic prize fund", () => {
      const elimPf: elimPfType = {
        id: "epf_1",
        elim_id: "elm_1",
        position: 1,
        amount: 500,
      };

      const expected: prizeFundType = {
        id: "epf_1",
        parent_id: "elm_1",
        position: 1,
        amount: 500,
      };

      expect(elimPfToPrizeFund(elimPf)).toEqual(expected);
    });

    it("preserves null position and amount values", () => {
      const elimPf: elimPfType = {
        id: "epf_1",
        elim_id: "elm_1",
        position: null,
        amount: null,
      };

      expect(elimPfToPrizeFund(elimPf)).toEqual({
        id: "epf_1",
        parent_id: "elm_1",
        position: null,
        amount: null,
      });
    });
  });

  describe("elimPfsToPrizeFunds", () => {
    it("converts an array of eliminator prize funds", () => {
      const elimPfs: elimPfType[] = [
        {
          id: "epf_1",
          elim_id: "elm_1",
          position: 1,
          amount: 500,
        },
        {
          id: "epf_2",
          elim_id: "elm_1",
          position: 2,
          amount: 300,
        },
      ];

      expect(elimPfsToPrizeFunds(elimPfs)).toEqual([
        {
          id: "epf_1",
          parent_id: "elm_1",
          position: 1,
          amount: 500,
        },
        {
          id: "epf_2",
          parent_id: "elm_1",
          position: 2,
          amount: 300,
        },
      ]);
    });

    it("returns an empty array when given an empty array", () => {
      expect(elimPfsToPrizeFunds([])).toEqual([]);
    });

    it("does not modify the original eliminator prize-fund array", () => {
      const elimPfs: elimPfType[] = [
        {
          id: "epf_1",
          elim_id: "elm_1",
          position: 1,
          amount: 500,
        },
      ];

      const original = cloneDeep(elimPfs);

      elimPfsToPrizeFunds(elimPfs);

      expect(elimPfs).toEqual(original);
    });
  });

  describe("pfEntryRowToElimPfEntryRow", () => {
    it("converts a generic entry row to an eliminator entry row", () => {
      const pfRow: prizeFundEntryRow = {
        id: "epf_1",
        parent_id: "elm_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      };

      const expected: elimPfEntryRow = {
        id: "epf_1",
        elim_id: "elm_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      };

      expect(pfEntryRowToElimPfEntryRow(pfRow)).toEqual(expected);
    });
  });

  describe("pfEntryRowsToElimPfEntryRows", () => {
    it("converts generic entry rows to eliminator entry rows", () => {
      const pfRows: prizeFundEntryRow[] = [
        {
          id: "epf_1",
          parent_id: "elm_1",
          position: 1,
          amount: 500,
          percentage: 62.5,
        },
        {
          id: "epf_2",
          parent_id: "elm_1",
          position: 2,
          amount: 300,
          percentage: 37.5,
        },
      ];

      expect(pfEntryRowsToElimPfEntryRows(pfRows)).toEqual([
        {
          id: "epf_1",
          elim_id: "elm_1",
          position: 1,
          amount: 500,
          percentage: 62.5,
        },
        {
          id: "epf_2",
          elim_id: "elm_1",
          position: 2,
          amount: 300,
          percentage: 37.5,
        },
      ]);
    });

    it("returns an empty array when given an empty array", () => {
      expect(pfEntryRowsToElimPfEntryRows([])).toEqual([]);
    });
  });

  describe("elimPfEntryRowToPrizeFundEntryRow", () => {
    it("converts an eliminator entry row to a generic entry row", () => {
      const elimPfRow: elimPfEntryRow = {
        id: "epf_1",
        elim_id: "elm_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      };

      const expected: prizeFundEntryRow = {
        id: "epf_1",
        parent_id: "elm_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      };

      expect(elimPfEntryRowToPrizeFundEntryRow(elimPfRow)).toEqual(expected);
    });
  });

  describe("elimPfEntryRowsToPrizeFundEntryRows", () => {
    it("converts eliminator entry rows to generic entry rows", () => {
      const elimPfRows: elimPfEntryRow[] = [
        {
          id: "epf_1",
          elim_id: "elm_1",
          position: 1,
          amount: 500,
          percentage: 62.5,
        },
        {
          id: "epf_2",
          elim_id: "elm_1",
          position: 2,
          amount: 300,
          percentage: 37.5,
        },
      ];

      expect(elimPfEntryRowsToPrizeFundEntryRows(elimPfRows)).toEqual([
        {
          id: "epf_1",
          parent_id: "elm_1",
          position: 1,
          amount: 500,
          percentage: 62.5,
        },
        {
          id: "epf_2",
          parent_id: "elm_1",
          position: 2,
          amount: 300,
          percentage: 37.5,
        },
      ]);
    });

    it("returns an empty array when given an empty array", () => {
      expect(elimPfEntryRowsToPrizeFundEntryRows([])).toEqual([]);
    });
  });

  describe("prizeFundEntryRowToElimPfEntryRow", () => {
    it("converts a generic entry row to an eliminator entry row", () => {
      const pfRow: prizeFundEntryRow = {
        id: "epf_1",
        parent_id: "elm_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      };

      expect(prizeFundEntryRowToElimPfEntryRow(pfRow)).toEqual({
        id: "epf_1",
        elim_id: "elm_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      });
    });
  });

  describe("prizeFundEntryRowsToElimPfEntryRows", () => {
    it("converts generic entry rows to eliminator entry rows", () => {
      const pfRows: prizeFundEntryRow[] = [
        {
          id: "epf_1",
          parent_id: "elm_1",
          position: 1,
          amount: 500,
          percentage: 62.5,
        },
        {
          id: "epf_2",
          parent_id: "elm_1",
          position: 2,
          amount: 300,
          percentage: 37.5,
        },
      ];

      expect(prizeFundEntryRowsToElimPfEntryRows(pfRows)).toEqual([
        {
          id: "epf_1",
          elim_id: "elm_1",
          position: 1,
          amount: 500,
          percentage: 62.5,
        },
        {
          id: "epf_2",
          elim_id: "elm_1",
          position: 2,
          amount: 300,
          percentage: 37.5,
        },
      ]);
    });

    it("returns an empty array when given an empty array", () => {
      expect(prizeFundEntryRowsToElimPfEntryRows([])).toEqual([]);
    });
  });

  /*********************
   * round-trip checks *
   *********************/

  describe("round-trip conversions", () => {
    it("preserves a division entry row after converting to generic and back", () => {
      const original: divPfEntryRow = {
        id: "dpf_1",
        div_id: "div_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      };

      const generic = divPfEntryRowToPrizeFundEntryRow(original);
      const result = pfEntryRowToDivPfEntryRow(generic);

      expect(result).toEqual(original);
    });

    it("preserves a pot entry row after converting to generic and back", () => {
      const original: potPfEntryRow = {
        id: "ppf_1",
        pot_id: "pot_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      };

      const generic = potPfEntryRowToPrizeFundEntryRow(original);
      const result = pfEntryRowToPotPfEntryRow(generic);

      expect(result).toEqual(original);
    });

    it("preserves an eliminator entry row after converting to generic and back", () => {
      const original: elimPfEntryRow = {
        id: "epf_1",
        elim_id: "elm_1",
        position: 1,
        amount: 500,
        percentage: 62.5,
      };

      const generic = elimPfEntryRowToPrizeFundEntryRow(original);
      const result = pfEntryRowToElimPfEntryRow(generic);

      expect(result).toEqual(original);
    });

  });
});