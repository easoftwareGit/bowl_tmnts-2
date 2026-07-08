import type { divPfType } from "@/lib/types/types";
import { mockDivPfs } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";
import { divPfDataForPrisma } from "@/app/api/divPfs/divPfsDataForPrisma";

describe("divPfDataForPrisma", () => {
  const testDivPf: divPfType = cloneDeep(mockDivPfs[0]);  

  it("should return a div data object with the correct properties", () => {
    const result = divPfDataForPrisma(testDivPf);
    expect(result).toEqual({
      id: testDivPf.id,
      div_id: testDivPf.div_id,
      position: testDivPf.position,
      amount: testDivPf.amount,
    });
  });

  it("should return null if div is null", () => {
    const result = divPfDataForPrisma(null as any);
    expect(result).toBe(null);
  });
  it("should return null if div is not an object", () => {
    const result = divPfDataForPrisma('test' as any);
    expect(result).toBe(null);
  });

});