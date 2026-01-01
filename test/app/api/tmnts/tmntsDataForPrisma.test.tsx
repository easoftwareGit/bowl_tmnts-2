import { mockTmntFullData } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { tmntDataForPrisma, tmntFullDataForPrisma } from "@/app/api/tmnts/dataForPrisma";
import { cloneDeep } from "lodash";

describe('tmntDataForPrisma', () => {
  const mockStartDate = new Date("2025-09-01T07:00:00.000Z");
  const mockEndDate = new Date("2025-09-01T07:00:00.000Z");
 
  describe('tmntDataForPrisma()', () => {
    const testTmnt = mockTmntFullData.tmnt;
    
    it("should convert tmnt data to prisma types", () => {
      const result = tmntDataForPrisma(testTmnt);
      expect(result).not.toBeNull();
      expect(result).toEqual({
        id: testTmnt.id,
        tmnt_name: testTmnt.tmnt_name,
        start_date: mockStartDate,
        end_date: mockEndDate,
        user_id: testTmnt.user_id,
        bowl_id: testTmnt.bowl_id
      });
    });
    it('should return null if tmnt data is null', () => {
      const result = tmntDataForPrisma(null as any);
      expect(result).toBeNull();
    }); 
    it('should return null if start date is invalid', () => {
      const testTmntInvalid = cloneDeep(testTmnt);
      testTmntInvalid.start_date_str = 'invalid date';
      const result = tmntDataForPrisma(testTmntInvalid);
      expect(result).toBeNull();
    });
    it('should return null if end date is invalid', () => {
      const testTmntInvalid = cloneDeep(testTmnt);
      testTmntInvalid.end_date_str = '2025-30-40';
      const result = tmntDataForPrisma(testTmntInvalid);
      expect(result).toBeNull();
    });
  });
  
  describe('tmntFullDataForPrisma()', () => {
    const result = tmntFullDataForPrisma(mockTmntFullData);
    expect(result).not.toBeNull();
    if (result === null) {
      expect(true).toBeFalsy();
      return;
    }
    expect(result.tmntData).toMatchObject({
      id: mockTmntFullData.tmnt.id,
      tmnt_name: mockTmntFullData.tmnt.tmnt_name,
      start_date: mockStartDate,
      end_date: mockEndDate,
      user_id: mockTmntFullData.tmnt.user_id,
      bowl_id: mockTmntFullData.tmnt.bowl_id
    });
    expect(result.eventsData.length).toBe(mockTmntFullData.events.length);
    expect(result.eventsData[0]).toMatchObject({
      id: mockTmntFullData.events[0].id,
      tmnt_id: mockTmntFullData.events[0].tmnt_id,
      event_name: mockTmntFullData.events[0].event_name,
      team_size: mockTmntFullData.events[0].team_size,
      games: mockTmntFullData.events[0].games,
      entry_fee: mockTmntFullData.events[0].entry_fee,
      lineage: mockTmntFullData.events[0].lineage,
      prize_fund: mockTmntFullData.events[0].prize_fund,
      other: mockTmntFullData.events[0].other,
      expenses: mockTmntFullData.events[0].expenses,
      added_money: mockTmntFullData.events[0].added_money,
      sort_order: mockTmntFullData.events[0].sort_order
    });
    expect(result.squadsData.length).toBe(mockTmntFullData.squads.length);
    expect(result.squadsData[0]).toMatchObject({
      id: mockTmntFullData.squads[0].id,
      event_id: mockTmntFullData.squads[0].event_id,
      squad_name: mockTmntFullData.squads[0].squad_name,
      games: mockTmntFullData.squads[0].games,
      lane_count: mockTmntFullData.squads[0].lane_count,
      starting_lane: mockTmntFullData.squads[0].starting_lane,
      squad_date: mockStartDate,
      squad_time: null,
      sort_order: mockTmntFullData.squads[0].sort_order,
    });
    expect(result.lanesData.length).toBe(mockTmntFullData.lanes.length);
    for (let i = 0; i < mockTmntFullData.lanes.length; i++) {
      expect(result.lanesData[i]).toMatchObject({
        id: mockTmntFullData.lanes[i].id,        
        lane_number: mockTmntFullData.lanes[i].lane_number,
        squad_id: mockTmntFullData.lanes[i].squad_id,
        in_use: mockTmntFullData.lanes[i].in_use,
      });
    };
    expect(result.brktEntriesData.length).toBe(4);
    expect(result.brktSeedsData.length).toBe(8);
    expect(result.brktsData.length).toBe(2);
    expect(result.divEntriesData.length).toBe(4);
    expect(result.elimEntriesData.length).toBe(4);
    expect(result.elimsData.length).toBe(2);
    expect(result.oneBrktsData.length).toBe(2);
    expect(result.playersData.length).toBe(4);
    expect(result.potEntriesData.length).toBe(4);
    expect(result.potsData.length).toBe(2);            
  });

})