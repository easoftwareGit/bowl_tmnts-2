import type { potPfType } from "@/lib/types/types";
import { mockPotPfs } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";
import { potPfDataForPrisma } from "@/app/api/potPfs/potPfsDataForPisma";

describe("potPfDataForPrisma", () => {
  const testPotPf: potPfType = cloneDeep(mockPotPfs[0]);  

  it("should return a div data object with the correct properties", () => {
    const result = potPfDataForPrisma(testPotPf);
    expect(result).toEqual({
      id: testPotPf.id,
      pot_id: testPotPf.pot_id,
      position: testPotPf.position,
      amount: testPotPf.amount,
    });
  });

  it("should return null if potPf is null", () => {
    const result = potPfDataForPrisma(null as any);
    expect(result).toBe(null);
  });
  it("should return null if potPf is not an object", () => {
    const result = potPfDataForPrisma('test' as any);
    expect(result).toBe(null);
  });

});