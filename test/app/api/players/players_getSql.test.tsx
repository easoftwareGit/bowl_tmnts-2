import { tmntEntryPlayerType } from "@/lib/types/types";
import { mockPlayersToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { getDeleteManySQL, getInsertManySQL, getUpdateManySQL } from "@/app/api/players/many/getSql";
import { maxAverage, maxLaneCount } from "@/lib/validation/validation";

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
      const updateSQL = getUpdateManySQL(playersToUpdate as tmntEntryPlayerType[]);

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
    it('should return "" when player id is invalid', () => {
      const playersToUpdate = [
        {
          ...mockPlayersToPost[0],
          id: '<script>alert("XSS")</script>',
          eType: 'u',
        },
        {
          ...mockPlayersToPost[1],
          eType: 'u',
        }
      ]
      const updateSQL = getUpdateManySQL(playersToUpdate as tmntEntryPlayerType[]);        
      expect(updateSQL).toBe('');
    })
    it('should return sanitized SQL when player first name is sanitized', () => {
      const playersToUpdate = [
        {
          ...mockPlayersToPost[0],
          first_name: '<script>alert("XSS")</script>',
          eType: 'u',
        },
        {
          ...mockPlayersToPost[1],
          eType: 'u',
        }
      ]
      const updateSQL = getUpdateManySQL(playersToUpdate as tmntEntryPlayerType[]);        
      const expected =
        `UPDATE public."Player" SET ` + 
          `first_name = p2up.first, ` +
          `last_name = p2up.last, ` +
          `average = p2up.average, ` +
          `lane = p2up.lane, ` +
          `position = p2up.position ` +
        `FROM (VALUES ` +
          `('ply_01be0472be3d476ea1caa99dd05953fa', 'alertXSS', 'Doe', 220, 3, 'A'), ` +
          `('ply_02be0472be3d476ea1caa99dd05953fa', 'James', 'Bennett', 221, 3, 'B')` +
          `) AS p2up(id, first, last, average, lane, position) ` +
        `WHERE public."Player".id = p2up.id;`

      expect(updateSQL).toBe(expected);
    })
    it('should return sanitized SQL when player last name is sanitized', () => {
      const playersToUpdate = [
        {
          ...mockPlayersToPost[0],
          last_name: '<script>alert("XSS")</script>',
          eType: 'u',
        },
        {
          ...mockPlayersToPost[1],
          eType: 'u',
        }
      ]
      const updateSQL = getUpdateManySQL(playersToUpdate as tmntEntryPlayerType[]);        
      const expected =
        `UPDATE public."Player" SET ` + 
          `first_name = p2up.first, ` +
          `last_name = p2up.last, ` +
          `average = p2up.average, ` +
          `lane = p2up.lane, ` +
          `position = p2up.position ` +
        `FROM (VALUES ` +
          `('ply_01be0472be3d476ea1caa99dd05953fa', 'John', 'alertXSS', 220, 3, 'A'), ` +
          `('ply_02be0472be3d476ea1caa99dd05953fa', 'James', 'Bennett', 221, 3, 'B')` +
          `) AS p2up(id, first, last, average, lane, position) ` +
        `WHERE public."Player".id = p2up.id;`

      expect(updateSQL).toBe(expected);
    })
    it('should return "" when player average is too high', () => {
      const playersToUpdate = [
        {
          ...mockPlayersToPost[0],
          average: maxAverage + 1,
          eType: 'u',
        },
        {
          ...mockPlayersToPost[1],
          eType: 'u',
        }
      ]
      const updateSQL = getUpdateManySQL(playersToUpdate as tmntEntryPlayerType[]);        
      expect(updateSQL).toBe('');
    })
    it('should return "" when player average is too low', () => {
      const playersToUpdate = [
        {
          ...mockPlayersToPost[0],
          average: -1,
          eType: 'u',
        },
        {
          ...mockPlayersToPost[1],
          eType: 'u',
        }
      ]
      const updateSQL = getUpdateManySQL(playersToUpdate as tmntEntryPlayerType[]);        
      expect(updateSQL).toBe('');
    })
    it('should return "" when player lane is invalid', () => {
      const playersToUpdate = [
        {
          ...mockPlayersToPost[0],
          lane: -1,
          eType: 'u',
        },
        {
          ...mockPlayersToPost[1],
          eType: 'u',
        }
      ]
      const updateSQL = getUpdateManySQL(playersToUpdate as tmntEntryPlayerType[]);        
      expect(updateSQL).toBe('');
    })
    it('should return "" when player position is invalid', () => {
      const playersToUpdate = [
        {
          ...mockPlayersToPost[0],
          position: '<script>alert("XSS")</script>',
          eType: 'u',
        },
        {
          ...mockPlayersToPost[1],
          eType: 'u',
        }
      ]
      const updateSQL = getUpdateManySQL(playersToUpdate as tmntEntryPlayerType[]);        
      expect(updateSQL).toBe('');
    })
    it('should return "" when playerEntries is empty', () => {
      const playersToUpdate: tmntEntryPlayerType[] = []
      const updateSQL = getUpdateManySQL(playersToUpdate as tmntEntryPlayerType[]);        
      expect(updateSQL).toBe('');
    })
    it('should return "" when playerEntries is null', () => {
      const playersToUpdate = null;
      const updateSQL = getUpdateManySQL(playersToUpdate as any);        
      expect(updateSQL).toBe('');
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
      const insertSQL = getInsertManySQL(playersToInsert as tmntEntryPlayerType[]);
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
    it('should return "" when id is invalid', () => {
      const playersToInsert = [
        {
          ...mockPlayersToPost[0],
          id: "<script>alert('XSS')</script>",
          eType: 'i',
        },
        {
          ...mockPlayersToPost[1],
          lane_err: 'u',
        }
      ]
      const insertSQL = getInsertManySQL(playersToInsert as tmntEntryPlayerType[]);      
      expect(insertSQL).toBe('');
    })
    it('should return valid insert SQL with sanitized first and last name', () => {
      const playersToInsert = [
        {
          ...mockPlayersToPost[0],
          first_name: '<script>alert("XSS")</script>',
          last_name: '    abcdef***',
          eType: 'i',
        },
        {
          ...mockPlayersToPost[1],
          lane_err: 'u',
        }
      ]
      const insertSQL = getInsertManySQL(playersToInsert as tmntEntryPlayerType[]);
      const expected =  
        `INSERT INTO public."Player" (id, squad_id, first_name, last_name, average, lane, position) ` +
        `SELECT p2up.id, p2up.squad_id, p2up.first, p2up.last, p2up.average, p2up.lane, p2up.position ` +
        `FROM (VALUES ` +
          `('ply_01be0472be3d476ea1caa99dd05953fa', 'sqd_42be0f9d527e4081972ce8877190489d', 'alertXSS', 'abcdef', 220, 3, 'A'), ` +
          `('ply_02be0472be3d476ea1caa99dd05953fa', 'sqd_42be0f9d527e4081972ce8877190489d', 'James', 'Bennett', 221, 3, 'B')` +
          `) AS p2up(id, squad_id, first, last, average, lane, position) ` +
        `WHERE NOT EXISTS (SELECT 1 FROM public."Player" WHERE id = p2up.id);`
                
      expect(insertSQL).toBe(expected);
    })
    it('should return "" when average is too high', () => {
      const playersToInsert = [
        {
          ...mockPlayersToPost[0],
          average: maxAverage + 1,
          eType: 'i',
        },
        {
          ...mockPlayersToPost[1],
          lane_err: 'u',
        }
      ]
      const insertSQL = getInsertManySQL(playersToInsert as tmntEntryPlayerType[]);      
      expect(insertSQL).toBe('');
    })
    it('should return "" when average is too high', () => {
      const playersToInsert = [
        {
          ...mockPlayersToPost[0],
          average: -1,
          eType: 'i',
        },
        {
          ...mockPlayersToPost[1],
          lane_err: 'u',
        }
      ]
      const insertSQL = getInsertManySQL(playersToInsert as tmntEntryPlayerType[]);      
      expect(insertSQL).toBe('');
    })
    it('should return "" when lane is invalid', () => {
      const playersToInsert = [
        {
          ...mockPlayersToPost[0],
          lane: 'abc', 
          eType: 'i',
        },
        {
          ...mockPlayersToPost[1],
          lane_err: 'u',
        }
      ]
      const insertSQL = getInsertManySQL(playersToInsert as tmntEntryPlayerType[]);      
      expect(insertSQL).toBe('');
    })
    it('should return "" when position is invalid', () => {
      const playersToInsert = [
        {
          ...mockPlayersToPost[0],
          position: "<script>alert('XSS')</script>",
          eType: 'i',
        },
        {
          ...mockPlayersToPost[1],
          lane_err: 'u',
        }
      ]
      const insertSQL = getInsertManySQL(playersToInsert as tmntEntryPlayerType[]);      
      expect(insertSQL).toBe('');
    })
    it('should return "" when playerEntries is empty', () => {
      const playersToUpdate: tmntEntryPlayerType[] = []
      const updateSQL = getInsertManySQL(playersToUpdate as tmntEntryPlayerType[]);        
      expect(updateSQL).toBe('');
    })
    it('should return "" when playerEntries is null', () => {
      const playersToUpdate = null;
      const updateSQL = getInsertManySQL(playersToUpdate as any);        
      expect(updateSQL).toBe('');
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
      const deleteSQL = getDeleteManySQL(playersToDelete as tmntEntryPlayerType[]);
      const expected = 
        `DELETE FROM public."Player" ` +
        `WHERE id IN ( ` +
          `'ply_01be0472be3d476ea1caa99dd05953fa', 'ply_02be0472be3d476ea1caa99dd05953fa'` + 
        `);`
                
      expect(deleteSQL).toBe(expected);
    })
    it('should return "" when id is invalid', () => {
      const playersToDelete = [
        {
          ...mockPlayersToPost[0],
          id: '<script>alert("XSS")</script>',
          eType: 'd',
        },
        {
          ...mockPlayersToPost[1],
          eType: 'd',
        }
      ]
      const deleteSQL = getDeleteManySQL(playersToDelete as tmntEntryPlayerType[]);
      expect(deleteSQL).toBe('');
    })
    it('should return valid delete SQL when first_name and/or last_name is sanitized', () => {
      const playersToDelete = [
        {
          ...mockPlayersToPost[0],
          first_name: '<script>alert("XSS")</script>',
          eType: 'd',
        },
        {
          ...mockPlayersToPost[1],
          last_name: '    abcdef***',
          eType: 'd',
        }
      ]
      const deleteSQL = getDeleteManySQL(playersToDelete as tmntEntryPlayerType[]);
      const expected = 
        `DELETE FROM public."Player" ` +
        `WHERE id IN ( ` +
          `'ply_01be0472be3d476ea1caa99dd05953fa', 'ply_02be0472be3d476ea1caa99dd05953fa'` + 
        `);`
                
      expect(deleteSQL).toBe(expected);
    })
    it('should return "" when average is too high', () => {
      const playersToDelete = [
        {
          ...mockPlayersToPost[0],
          average: maxAverage + 1,
          eType: 'd',
        },
        {
          ...mockPlayersToPost[1],
          eType: 'd',
        }
      ]
      const deleteSQL = getDeleteManySQL(playersToDelete as tmntEntryPlayerType[]);
      expect(deleteSQL).toBe('');
    })
    it('should return "" when average is too low', () => {
      const playersToDelete = [
        {
          ...mockPlayersToPost[0],
          average: -1,
          eType: 'd',
        },
        {
          ...mockPlayersToPost[1],
          eType: 'd',
        }
      ]
      const deleteSQL = getDeleteManySQL(playersToDelete as tmntEntryPlayerType[]);
      expect(deleteSQL).toBe('');
    })
    it('should return "" when lane is invalid', () => {
      const playersToDelete = [
        {
          ...mockPlayersToPost[0],
          lane: maxLaneCount + 1,
          eType: 'd',
        },
        {
          ...mockPlayersToPost[1],
          eType: 'd',
        }
      ]
      const deleteSQL = getDeleteManySQL(playersToDelete as tmntEntryPlayerType[]);
      expect(deleteSQL).toBe('');
    })
    it('should return "" when position is invalid', () => {
      const playersToDelete = [
        {
          ...mockPlayersToPost[0],
          position: '<script>alert("XSS")</script>',
          eType: 'd',
        },
        {
          ...mockPlayersToPost[1],
          eType: 'd',
        }
      ]
      const deleteSQL = getDeleteManySQL(playersToDelete as tmntEntryPlayerType[]);
      expect(deleteSQL).toBe('');
    })
    it('should return "" when playerEntries is empty', () => {
      const playersToUpdate: tmntEntryPlayerType[] = []
      const updateSQL = getDeleteManySQL(playersToUpdate as tmntEntryPlayerType[]);        
      expect(updateSQL).toBe('');
    })
    it('should return "" when playerEntries is null', () => {
      const playersToUpdate = null;
      const updateSQL = getDeleteManySQL(playersToUpdate as any);        
      expect(updateSQL).toBe('');
    })

  })

})