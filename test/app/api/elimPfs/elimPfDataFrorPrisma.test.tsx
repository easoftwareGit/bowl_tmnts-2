import type { elimPfType } from "@/lib/types/types";
import { mockElimPfs } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";
import { elimPfDataForPrisma } from "@/app/api/elimPfs/elimPfsDataForPisma";

describe("elimPfDataForPrisma", () => {
  const testElimPf: elimPfType = cloneDeep(mockElimPfs[0]);  

  it("should return a div data object with the correct properties", () => {
    const result = elimPfDataForPrisma(testElimPf);
    expect(result).toEqual({
      id: testElimPf.id,
      elim_id: testElimPf.elim_id,
      position: testElimPf.position,
      amount: testElimPf.amount,
    });
  });

  it("should return null if elimPf is null", () => {
    const result = elimPfDataForPrisma(null as any);
    expect(result).toBe(null);
  });
  it("should return null if elimPf is not an object", () => {
    const result = elimPfDataForPrisma('test' as any);
    expect(result).toBe(null);
  });

});