import type { divType } from "@/lib/types/types";
import { mockTmntFullData } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";
import { divDataForPrisma } from "@/app/api/divs/dataForPrisma";

describe("divDataForPrisma", () => {
  const testDiv: divType = cloneDeep(mockTmntFullData.divs[0]);

  it("should return a div data object with the correct properties", () => {
    const result = divDataForPrisma(testDiv);
    expect(result).toEqual({
      id: testDiv.id,
      tmnt_id: testDiv.tmnt_id,
      div_name: testDiv.div_name,
      hdcp_per: testDiv.hdcp_per,
      hdcp_from: testDiv.hdcp_from,
      int_hdcp: testDiv.int_hdcp,
      hdcp_for: testDiv.hdcp_for,
      sort_order: testDiv.sort_order,
    });
  });

  it("should return null if div is null", () => {
    const result = divDataForPrisma(null as any);
    expect(result).toBe(null);
  });
  it("should return null if div is not an object", () => {
    const result = divDataForPrisma('test' as any);
    expect(result).toBe(null);
  });

});