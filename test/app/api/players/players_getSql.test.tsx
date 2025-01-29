import { playerType } from "@/lib/types/types";
import { mockPlayersToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { getDeleteManySQL, getInsertManySQL, getUpdateManySQL } from "@/app/api/players/many/getSql";

describe('getSql', () => {
  
  describe('getUpdateManySQL', () => { 
    it('should return valid update SQL', () => {
      const playersToUpdate = [
        {
          ...mockPlayersToPost[0],
          eType: 'u',
        },
        {
          ...mockPlayersToPost[1],
          eType: 'u',
        }
      ]
      const updateSQL = getUpdateManySQL(playersToUpdate as playerType[]);

      const expected =
        `UPDATE public."Player" SET ` + 
          `first_name = p2up.first, ` +
          `last_name = p2up.last, ` +
          `average = p2up.average, ` +
          `lane = p2up.lane, ` +
          `position = p2up.position ` +
        `FROM (VALUES ` +
          `('ply_01be0472be3d476ea1caa99dd05953fa', 'John', 'Doe', 220, 3, 'A'), ` +
          `('ply_02be0472be3d476ea1caa99dd05953fa', 'James', 'Bennett', 221, 3, 'B')` +
          `) AS p2up(id, first, last, average, lane, position) ` +
        `WHERE public."Player".id = p2up.id;`
  
      expect(updateSQL).toBe(expected);
    })
  })

  describe('getInsertManySQL', () => { 
    it('should return valid insert SQL', () => {
      const playersToInsert = [
        {
          ...mockPlayersToPost[0],
          eType: 'i',
        },
        {
          ...mockPlayersToPost[1],
          lane_err: 'u',
        }
      ]
      const insertSQL = getInsertManySQL(playersToInsert as playerType[]);
      const expected =  
        `INSERT INTO public."Player" (id, squad_id, first_name, last_name, average, lane, position) ` +
        `SELECT p2up.id, p2up.squad_id, p2up.first, p2up.last, p2up.average, p2up.lane, p2up.position ` +
        `FROM (VALUES ` +
          `('ply_01be0472be3d476ea1caa99dd05953fa', 'sqd_42be0f9d527e4081972ce8877190489d', 'John', 'Doe', 220, 3, 'A'), ` +
          `('ply_02be0472be3d476ea1caa99dd05953fa', 'sqd_42be0f9d527e4081972ce8877190489d', 'James', 'Bennett', 221, 3, 'B')` +
          `) AS p2up(id, squad_id, first, last, average, lane, position) ` +
        `WHERE NOT EXISTS (SELECT 1 FROM public."Player" WHERE id = p2up.id);`
                
      expect(insertSQL).toBe(expected);
    })
  })

  describe('getDeleteManySQL', () => { 
    it('should return valid delete SQL', () => {
      const playersToDelete = [
        {
          ...mockPlayersToPost[0],
          eType: 'd',
        },
        {
          ...mockPlayersToPost[1],
          eType: 'd',
        }
      ]
      const deleteSQL = getDeleteManySQL(playersToDelete as playerType[]);
      const expected = 
        `DELETE FROM public."Player" ` +
        `WHERE id IN ( ` +
          `'ply_01be0472be3d476ea1caa99dd05953fa', 'ply_02be0472be3d476ea1caa99dd05953fa'` + 
        `);`
                
      expect(deleteSQL).toBe(expected);
    })
  })

})