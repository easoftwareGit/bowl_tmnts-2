import React from 'react';
import { render, screen } from '@testing-library/react';
import LanesList, { getLanesFromPairs, lanesNotThisSquad, lanesThisSquad, pairsOfLanes } from '@/components/tmnts/lanesList';
import { mockLanes, mockPairs } from '../../../mocks/tmnts/newTmnt/mockNewTmnt';
import { laneType, pairsOfLanesType } from '@/lib/types/types';
import 'core-js/actual/structured-clone';

describe('LanesList - Component', () => { 

  const lanes2Squads = [...mockLanes];
  lanes2Squads.push({
    ...mockLanes[0],
    id: "lan_abc1c5cc04f6463d89f24e6e19a12613",
    lane_number: 13,
    squad_id: 'sqd_abcdce5f80164830830a7157eb093396',
    in_use: true
  })
  lanes2Squads.push({
    ...mockLanes[0],
    id: "lan_abc1c5cc04f6463d89f24e6e19a12614",
    lane_number: 14,
    squad_id: 'sqd_abcdce5f80164830830a7157eb093396',
    in_use: true
  })
  lanes2Squads.push({
    ...mockLanes[0],
    id: "lan_abc1c5cc04f6463d89f24e6e19a12615",
    lane_number: 15,
    squad_id: 'sqd_abcdce5f80164830830a7157eb093396',
    in_use: true
  })
  lanes2Squads.push({
    ...mockLanes[0],
    id: "lan_abc1c5cc04f6463d89f24e6e19a12616",
    lane_number: 16,
    squad_id: 'sqd_abcdce5f80164830830a7157eb093396',
    in_use: true
  })

  const squad1Id = mockLanes[0].squad_id
  const squad2Id = 'sqd_abcdce5f80164830830a7157eb093396'  
  const notFoundSquadId = "sqd_01234567890123456789012345678901";

  const mockSetLanes = jest.fn();

  describe('get the array of pairs of lanes', () => { 
    it('return an empty array when passed an empty array', () => { 
      const emptyLanes: laneType[] = [];
      const pairs = pairsOfLanes(mockLanes[0].squad_id, emptyLanes)
      expect(pairs).toHaveLength(0)
    })
    it('return an empty array when passed an array with an odd length (not even length)', () => { 
      const oneLane: laneType[] = [
        {
          id: "lan_abc1c5cc04f6463d89f24e6e19a12601",
          lane_number: 1,
          squad_id: squad2Id,
          in_use: true
        }
      ];
      const pairs = pairsOfLanes(squad2Id, oneLane)
      expect(pairs).toHaveLength(0)
    })
    it('should get the array of pairs of lanes for 1st squad', () => { 
      const pairs = pairsOfLanes(mockLanes[0].squad_id, mockLanes)
      expect(pairs).toHaveLength(6) // lanes 1 to 12, 6 pairs
    })
    it('should get the array of pairs of lanes for 2nd squad', () => { 
      const pairs = pairsOfLanes(squad2Id, lanes2Squads)
      expect(pairs).toHaveLength(2) // lanes 13 to 16, 2 pairs
    })
    it('should get the array of pairs of lanes', () => {
      const pairs = pairsOfLanes(mockLanes[0].squad_id, mockLanes)
      expect(pairs[0].left_lane).toEqual(mockLanes[0].lane_number)
      expect(pairs[0].right_lane).toEqual(mockLanes[1].lane_number)
      expect(pairs[0].left_id).toEqual(mockLanes[0].id)
      expect(pairs[0].right_id).toEqual(mockLanes[1].id)
      expect(pairs[0].in_use).toEqual(true)
    })
  })

  describe('lanesThisSquad() function ', () => { 
    it('should get the lanes for squad 1', () => { 
      const squad1Lanes = lanesThisSquad(mockLanes[0].squad_id, mockLanes)
      expect(squad1Lanes).toHaveLength(12)
    })    
    it('should return lanes matching the given squad_id', () => {
      const result = lanesThisSquad(squad2Id, lanes2Squads);
      expect(result.length).toEqual(4);
      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toEqual(lanes2Squads[i+12]);
      }
    });    
    it('should return an empty array when lanes array is empty', () => {
      const result = lanesThisSquad('sqd_abcdce5f80164830830a7157eb093396', []);
      expect(result).toEqual([]);
    });
    it('should return an empty array when no lanes match the given squad_id', () => {
      const result = lanesThisSquad('sqd_abcdce5f80164830830a7157eb093396', mockLanes);
      expect(result).toEqual([]);
    });
    it('should return an empty array when lanes input is null', () => {
      const result = lanesThisSquad('squad1', null as unknown as laneType[]);
      expect(result).toEqual([]);
    });
    it('should return an empty array when squad_id is null', () => {
      const result = lanesThisSquad(null as unknown as string, mockLanes);
      expect(result).toEqual([]);
    });
    it('should maintain the order of lanes in the returned array including all lanes', () => {
      const result = lanesThisSquad(mockLanes[0].squad_id, mockLanes);
      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toEqual(mockLanes[i]);
      }
    });
  })

  describe('lanesNotThisSquad() function', () => {

    it('should filter out lanes with matching squad_id', () => {
      const result = lanesNotThisSquad(squad1Id, lanes2Squads);
      expect(result.length).toEqual(4);
      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toEqual(lanes2Squads[i + 12]);
      }      
    });
    it('should return an empty array when lanes input is null or undefined', () => {
      expect(lanesNotThisSquad(squad1Id, null as unknown as laneType[])).toEqual([]);
      expect(lanesNotThisSquad(squad1Id, undefined as unknown as laneType[])).toEqual([]);
    });
    it('should return all lanes when no lane has matching squad_id', () => {
      const result = lanesNotThisSquad(notFoundSquadId, lanes2Squads);
      expect(result.length).toEqual(lanes2Squads.length);
      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toEqual(lanes2Squads[i]);
      }
    });
    it('should return empty array when input lanes array is empty', () => {
      const lanes: laneType[] = [];
      const result = lanesNotThisSquad(squad1Id, lanes);
      expect(result).toEqual([]);
    });
    it('should return empty array when no lanes are provided', () => {
      const result = lanesNotThisSquad(squad1Id, []);
      expect(result).toEqual([]);
    });
    it('should filter out lanes with matching squad_id when multiple lanes with different squad_ids are present', () => {
      const result = lanesNotThisSquad(squad2Id, lanes2Squads);
      expect(result.length).toEqual(12);      
      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toEqual(lanes2Squads[i]);
      }
    });
    it('should return an empty array when squadId is an empty string', () => {
      const result = lanesNotThisSquad('', lanes2Squads);
      expect(result).toEqual([]);
    });
    it('should maintain order of lanes in the output', () => {
      const result = lanesNotThisSquad(squad2Id, lanes2Squads);
      expect(result.length).toEqual(12);
      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toEqual(lanes2Squads[i]);
      }
    });
  });

  describe('pairsOfLanes() function', () => { 
    it('should get the pairs of lanes for squad 1', () => {
      const pairs = pairsOfLanes(squad1Id, mockLanes)
      expect(pairs).toHaveLength(6)
      expect(pairs[0].left_lane).toEqual(1)
      expect(pairs[0].right_lane).toEqual(2)
      expect(pairs[1].left_lane).toEqual(3)
      expect(pairs[1].right_lane).toEqual(4)
      expect(pairs[5].left_lane).toEqual(11)      
      expect(pairs[5].right_lane).toEqual(12)
    })
    it('should get the pairs of lanes for squad 2', () => {
      const pairs = pairsOfLanes(squad2Id, lanes2Squads)
      expect(pairs).toHaveLength(2)
      expect(pairs[0].left_lane).toEqual(13)
      expect(pairs[0].right_lane).toEqual(14)
      expect(pairs[1].left_lane).toEqual(15)
      expect(pairs[1].right_lane).toEqual(16)
    })
    it('should return pairs of lanes when the number of lanes is even', () => {
      const result = pairsOfLanes(squad1Id, mockLanes);
      expect(result.length).toEqual(6);
    });
    it('should return an empty array when the number of lanes is odd', () => {
      const invalidLanes = [...mockLanes];
      invalidLanes.push({
        ...mockLanes[0],
        id: "lan_abc1c5cc04f6463d89f24e6e19a12613",
        lane_number: 13,        
        in_use: true
      })
      const result = pairsOfLanes(squad1Id, invalidLanes);
      expect(result).toEqual([]);
    });
    it('should pair lanes sequentially when the number of lanes is even', () => {
      const result = pairsOfLanes(squad2Id, lanes2Squads);
      expect(result).toEqual([
        {
          left_id: lanes2Squads[12].id,
          left_lane: lanes2Squads[12].lane_number,
          right_id: lanes2Squads[13].id,
          right_lane: lanes2Squads[13].lane_number,
          in_use: true
        },
        {
          left_id: lanes2Squads[14].id,
          left_lane: lanes2Squads[14].lane_number,
          right_id: lanes2Squads[15].id,
          right_lane: lanes2Squads[15].lane_number,
          in_use: true
        }
      ]);
    });
    it("should set 'in_use' to true for all pairs by default", () => {
      const result = pairsOfLanes(squad1Id, mockLanes);
      result.forEach(pair => {
        expect(pair.in_use).toBe(true);
      });
    });
    it('should return empty array when lanes array is empty', () => {            
      const result = pairsOfLanes(squad1Id, []);
      expect(result).toEqual([]);
    });
    it('should return empty array when squadId is null', () => {      
      const result = pairsOfLanes(null as any, mockLanes);
      expect(result).toEqual([]);
    });
    it('should return empty array when lanes array is null', () => {            
      const result = pairsOfLanes(squad1Id, null as any);
      expect(result).toEqual([]);
    });
    it('should return empty array when squadId does not match any lanes', () => {
      const result = pairsOfLanes(notFoundSquadId, mockLanes);
      expect(result).toEqual([]);
    });
    it('should maintain order of lanes in pairs when generating pairs of lanes', () => {
      const result = pairsOfLanes(squad2Id, lanes2Squads);
      expect(result).toEqual([
        {
          left_id: lanes2Squads[12].id,
          left_lane: lanes2Squads[12].lane_number,
          right_id: lanes2Squads[13].id,
          right_lane: lanes2Squads[13].lane_number,
          in_use: true
        },
        {
          left_id: lanes2Squads[14].id,
          left_lane: lanes2Squads[14].lane_number,
          right_id: lanes2Squads[15].id,
          right_lane: lanes2Squads[15].lane_number,
          in_use: true
        }
      ]);
    });
    it('should not modify the input arrays when generating pairs of lanes', () => {
      const originalLanes = [...mockLanes];
      pairsOfLanes(squad1Id, mockLanes);
      expect(mockLanes).toEqual(originalLanes);
    });
  })

  describe('getLanesFromPairs() function', () => {    
    it('should get the lanes from pairs', () => {
      const squadLanes = getLanesFromPairs(mockPairs, squad1Id)
      expect(squadLanes).toHaveLength(12)
    })
    it('should get the lanes correcly ordered from pairs', () => {
      const squadLanes = getLanesFromPairs(mockPairs, squad1Id)      
      expect(squadLanes[0].lane_number).toEqual(1)
      expect(squadLanes[1].lane_number).toEqual(2)
      expect(squadLanes[2].lane_number).toEqual(3)
      expect(squadLanes[3].lane_number).toEqual(4)
      expect(squadLanes[4].lane_number).toEqual(5)
      expect(squadLanes[5].lane_number).toEqual(6)
      expect(squadLanes[6].lane_number).toEqual(7)
      expect(squadLanes[7].lane_number).toEqual(8)
      expect(squadLanes[8].lane_number).toEqual(9)
      expect(squadLanes[9].lane_number).toEqual(10)
      expect(squadLanes[10].lane_number).toEqual(11)
      expect(squadLanes[11].lane_number).toEqual(12)
    })
    it('should return empty array when pairs is empty', () => {
      const pairs: pairsOfLanesType[] = [];      
      const result = getLanesFromPairs(pairs, squad1Id);
      expect(result).toEqual([]);
    });
    it('should return empty array when pairs is null or undefined', () => {      
      let result = getLanesFromPairs(null as any, squad1Id);
      expect(result).toEqual([]);
  
      result = getLanesFromPairs(undefined as any, squad1Id);
      expect(result).toEqual([]);
    });
    it('should assign correct squad_id to each lane', () => {
      const result = getLanesFromPairs(mockPairs, squad1Id);
      result.forEach(lane => expect(lane.squad_id).toEqual(squad1Id));
    });
    it('should exclude pairs if left_id or right_id is missing', () => {
      const missingDataPairs = structuredClone(mockPairs);
      missingDataPairs[0].left_id = '';
      missingDataPairs[1].right_id = '';
      const result = getLanesFromPairs(missingDataPairs, squad1Id);
      expect(result).toHaveLength(8);
    });
    it('should exclude pairs with undefined left_lane or right_lane values - Updated', () => {
      const missingDataPairs = structuredClone(mockPairs);
      missingDataPairs[0].left_lane = undefined as any;
      missingDataPairs[1].right_lane = undefined as any;      
      const result = getLanesFromPairs(missingDataPairs, squad1Id);
      expect(result).toHaveLength(8);
    });
    it('should not mutate input pairs array', () => {
      const originalPairs = structuredClone(mockPairs);
      getLanesFromPairs(mockPairs, squad1Id);
      expect(mockPairs).toEqual(originalPairs);
    });
    it('should maintain order of lanes as they appear in pairs', () => {      
      const result = getLanesFromPairs(mockPairs, squad1Id);
      expect(result[0].lane_number).toEqual(mockPairs[0].left_lane);
      expect(result[1].lane_number).toEqual(mockPairs[0].right_lane);
      expect(result[2].lane_number).toEqual(mockPairs[1].left_lane);
      expect(result[3].lane_number).toEqual(mockPairs[1].right_lane);
      expect(result[4].lane_number).toEqual(mockPairs[2].left_lane);
      expect(result[5].lane_number).toEqual(mockPairs[2].right_lane);
      expect(result[6].lane_number).toEqual(mockPairs[3].left_lane);
      expect(result[7].lane_number).toEqual(mockPairs[3].right_lane);
      expect(result[8].lane_number).toEqual(mockPairs[4].left_lane);
      expect(result[9].lane_number).toEqual(mockPairs[4].right_lane);
      expect(result[10].lane_number).toEqual(mockPairs[5].left_lane);
      expect(result[11].lane_number).toEqual(mockPairs[5].right_lane);
    });
    it('should not skip not in use lanes, but set in_use to false', () => { 
      const notInUsePairs = structuredClone(mockPairs)
      notInUsePairs[2].in_use = false
      const squadLanes = getLanesFromPairs(notInUsePairs, squad1Id)
      expect(squadLanes).toHaveLength(12) 
      expect(squadLanes[4].in_use).toBe(false)
      expect(squadLanes[5].in_use).toBe(false)
    })
  })

  describe('render the lanes list', () => {

    it('should render the "Lanes" column header', () => {
      render(<LanesList squadId={squad1Id} lanes={mockLanes} setLanes={mockSetLanes}/>) 
      const lanesHeader = screen.getByText('Lanes');
      expect(lanesHeader).toBeInTheDocument();
    })

    it('should render the "In Use" column header', () => {
      render(<LanesList squadId={squad1Id} lanes={mockLanes} setLanes={mockSetLanes}/>) 
      const inUseHeader = screen.getByText('In Use');
      expect(inUseHeader).toBeInTheDocument();
    })

    it('should render the first pair of lanes', () => { 
      render(<LanesList squadId={squad1Id} lanes={mockLanes} setLanes={mockSetLanes}/>)
      const firstPairText = mockLanes[0].lane_number + ' - ' + mockLanes[1].lane_number
      const firstPair = screen.getByText(firstPairText);
      expect(firstPair).toBeInTheDocument();
    })

    it('should render the 2nd pair of lanes (map is working)', () => { 
      render(<LanesList squadId={squad1Id} lanes={mockLanes} setLanes={mockSetLanes}/>)
      const secondPairText = mockLanes[2].lane_number + ' - ' + mockLanes[3].lane_number
      const secondPair = screen.getByText(secondPairText);
      expect(secondPair).toBeInTheDocument();
    })
  })
})