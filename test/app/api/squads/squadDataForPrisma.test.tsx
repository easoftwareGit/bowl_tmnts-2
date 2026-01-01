import { squadType } from "@/lib/types/types";
import { mockTmntFullData } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";
import { squadDataForPrisma } from "@/app/api/squads/dataForPrisma";

describe('squadDataForPrisma function', () => {
  const testSquad: squadType = cloneDeep(mockTmntFullData.squads[0]);
  const mockSquadDate = new Date("2025-09-01T07:00:00.000Z");
  it('should return a valid squad data for prisma', () => {
    const result = squadDataForPrisma(testSquad);      
    expect(result).toEqual({
      id: testSquad.id,
      event_id: testSquad.event_id,
      squad_name: testSquad.squad_name,
      games: testSquad.games,
      starting_lane: testSquad.starting_lane,
      lane_count: testSquad.lane_count,
      squad_date: mockSquadDate,
      squad_time: null,
      finalized: false,
      sort_order: 1
    });
  });
  it('should return null if tmnt data is null', () => {
    const result = squadDataForPrisma(null as any);
    expect(result).toBeNull();
  }); 
  it('should return null if start date is invalid', () => {
    const invalidSquad = {
      ...testSquad,
      squad_date_str: 'invalid date'
    }
    const result = squadDataForPrisma(invalidSquad);
    expect(result).toBeNull();
  });
})
