import { FC, useState, useEffect, ChangeEvent } from "react";
import { laneType, pairsOfLanesType } from "@/lib/types/types"
import { isOdd } from "@/lib/validation";

import "./lanesList.css";
import { btDbUuid } from "@/lib/uuid";

interface LanesListProps {
  squadId: string,
  lanes: laneType[],
  setLanes: (lanes: laneType[]) => void
}

/**
 * gets the array of pairs of lanes for the squad
 * 
 * @param pairs - array of pairs of lanes
 * @param squadId - the id of the squad
 * @returns {lanes[]} - an array of lanes for the squad or empty array
 */
export const getLanesFromPairs = (pairs: pairsOfLanesType[], squadId: string): laneType[] => {
  if (!pairs || pairs.length === 0) return [];
  const lanes: laneType[] = [];
  const validPairs = pairs.filter(pair => pair.left_id && pair.left_lane && pair.right_id && pair.right_lane);
  validPairs.forEach(pair => {
    lanes.push(
      {
        id: pair.left_id,
        lane_number: pair.left_lane,
        squad_id: squadId,
        in_use: pair.in_use
      },
      {
        id: pair.right_id,
        lane_number: pair.right_lane,
        squad_id: squadId,
        in_use: pair.in_use
      }
    )
  })
  return lanes
}

/**
 * filters the array of lanes for the squad
 * 
 * @param squadId - the id of the squad
 * @param lanes - the array of all lanes for all squads
 * @returns {lanes[]} - an array of lanes just for the squad
 */
export const lanesThisSquad = (squadId: string, lanes: laneType[]): laneType[] => {
  if (!squadId || !lanes || lanes.length === 0) return [];
  return lanes.filter(lane => lane.squad_id === squadId);
}

/**
 * filters the array of lanes not for the squad
 * 
 * @param squadId - the id of the squad
 * @param lanes - the array of all lanes for all squads
 * @returns {lanes[]} - an array of lanes not for the squad
 */
export const lanesNotThisSquad = (squadId: string, lanes: laneType[]): laneType[] => {
  if (!squadId || !lanes || lanes.length === 0) return [];
  return lanes.filter(lane => lane.squad_id !== squadId);
}

/**
 * gets the pairs of lanes for the squad 
 * 
 * @param squadId - the id of the squad
 * @param lanes - array of all lanes
 * @returns {pairsOfLanesType[]} - an array of pairs of lanes or empty array
 */
export const pairsOfLanes = (squadId: string, lanes: laneType[]): pairsOfLanesType[] => {
  if (!squadId || !lanes || lanes.length === 0 || isOdd(lanes.length)) return [];
  const pairs: pairsOfLanesType[] = [];
  const squadLanes = lanesThisSquad(squadId, lanes);
  for (let i = 0; i < squadLanes.length - 1; i += 2) {
    pairs.push(
      {
        left_id: squadLanes[i].id,
        left_lane: squadLanes[i].lane_number,
        right_id: squadLanes[i + 1].id,
        right_lane: squadLanes[i + 1].lane_number,
        in_use: squadLanes[i].in_use,
      }  
    )
  }
  return pairs;
}

const LanesList: FC<LanesListProps> = (props) => {
  const { squadId, lanes, setLanes } = props;
  const initPairs = pairsOfLanes(squadId, lanes);

  const [pairs, setPairs] = useState(initPairs);

  useEffect(() => {
    setPairs(pairsOfLanes(squadId, lanes));
  },[squadId, lanes])

  const handleInputChange = (id: string) => (e: ChangeEvent<HTMLInputElement>) => { 
    const { checked } = e.target;

    if (checked) { 
      const tempPairs = pairs.map((pair) => {
        if (pair.left_id === id) {          
          return {
            ...pair,
            in_use: checked,
          }
        } else {
          return pair
        }
      })        
      tempPairs.pop();                // always remove the last one
      // while there is a pair that at the end of the array that is not in use
      while (tempPairs.length > 0 && !tempPairs[tempPairs.length - 1].in_use) {
        tempPairs.pop();    
      }
      setPairs(tempPairs);
      // setLanes(pairsToLanes(tempPairs));
      setLanes(getLanesFromPairs(tempPairs, squadId));
    } else {
      const newPairs = pairs.map((pair) => {
        if (pair.left_id === id) {          
          return {
            ...pair,
            in_use: checked,
          }
        } else {
          return pair
        }        
      })
      const lastPair = newPairs[newPairs.length - 1]; 
      const newPair: pairsOfLanesType = {
        left_id: btDbUuid("lan"),
        left_lane: lastPair.left_lane + 2,
        right_id: btDbUuid("lan"),
        right_lane: lastPair.right_lane + 2,
        in_use: true,
      }
      newPairs.push(newPair);
      setPairs(newPairs);
      // setLanes(pairsToLanes(newPairs));
      setLanes(getLanesFromPairs(newPairs, squadId));
    }
  }

  return (
    <>
      {/* style width is in pixels */}
      <div
        className="d-flex justify-content-start lanes_table"
        style={{ width: 175 }}
      >
        <table className="table table-striped table-hover w-100">
          <thead>
            <tr className="lanes-header-row">
              <th scope="col">
                Lanes
              </th>
              <th scope="col" className="text-center">
                In Use
              </th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair) => (
              <tr key={pair.left_id}>
                <td>{pair.left_lane} - {pair.right_lane}</td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    name="in_use"
                    id={`inUse${pair.left_id}`}
                    checked={pair.in_use}
                    onChange={handleInputChange(pair.left_id)}
                  >
                  </input>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>  
    </>
  );
}

export default LanesList;