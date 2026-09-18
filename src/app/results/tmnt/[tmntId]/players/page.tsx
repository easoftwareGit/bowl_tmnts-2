"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useParams } from "next/navigation";
import {
  fetchTmntFullData,
  getTmntFullDataError,
  getTmntFullDataLoadStatus,
  getTmntFullDataRequestedTmntId,
  selectTmntFullData,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import WaitModal from "@/components/modal/waitModal";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";

type PlayerSort =
  | "lastName"
  | "firstName"
  | "average"
  | "lanePos";

type tmntPlayerInTableType = {
  id: string;
  first_name: string;
  last_name: string;
  average: number;
  lane_pos: string;
};

const TmntPlayersPage = () => {
  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const requestedTmntId = useSelector(getTmntFullDataRequestedTmntId);
  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
  const tmntError = useSelector(getTmntFullDataError);
  const stateTmntFullData = useSelector(selectTmntFullData);

  const [playerSort, setPlayerSort] = useState<PlayerSort>("lastName");

  useEffect(() => {
    const needsTmntData = stateTmntFullData.tmnt.id !== tmntId;

    const failedForThisTmnt =
      tmntLoadStatus === "failed" && requestedTmntId === tmntId;

    if (needsTmntData && tmntLoadStatus !== "loading" && !failedForThisTmnt) {
      dispatch(fetchTmntFullData(tmntId));
    }
  }, [
    tmntId,
    stateTmntFullData,
    tmntLoadStatus,
    requestedTmntId,
    dispatch]
  );

  /*********************************************/
  /* render loading/error until data is loaded */
  /*********************************************/

  const hasTmntData =
    stateTmntFullData.tmnt.id !== "" && stateTmntFullData.tmnt.id === tmntId;

  const failedForThisTmnt =
    tmntLoadStatus === "failed" && requestedTmntId === tmntId;

  if (!hasTmntData && failedForThisTmnt) {
    const errmsg = tmntError
      ? tmntError.includes("missing required child")
        ? `Tournament with id: ${tmntId} is missing data.`
        : `An error occurred while loading the tournament with id: ${tmntId}.`
      : `An error occurred while loading the tournament with id: ${tmntId}.`;
    return (
      <div className="text-center mt-5">
        <h4>Unable to load tournament</h4>

        <p>{errmsg}</p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => dispatch(fetchTmntFullData(tmntId))}
        >
          Retry
        </button>
      </div>
    );
  }

  /****************************************/
  /* create player data for results grid  */
  /****************************************/

  const nonByePlayers = stateTmntFullData.players.filter((player) =>
    player.id.startsWith("ply"),
  );

  const playerRows: tmntPlayerInTableType[] = nonByePlayers.map((player) => ({
    id: player.id,
    first_name: player.first_name,
    last_name: player.last_name,
    average: player.average,
    lane_pos: player.lane + "-" + player.position,
  }));

  /**
   * Sorts the player data rows by last name.
   *
   * Sort order:
   * 1. Last name
   * 2. First name
   * 3. Lane position
   * 4. Average
   * 
   * @param {tmntPlayerInTableType[]} playerRows - The player data rows to sort.
   * @returns {tmntPlayerInTableType[]} The sorted player data rows.
   */
  const sortPlayerRowsByLastName = (
    playerRows: tmntPlayerInTableType[],
  ): tmntPlayerInTableType[] => {
    // sort by last name, then first name, then lane, then average
    return playerRows.sort(
      (a, b) =>
        a.last_name.localeCompare(b.last_name, undefined, {
          sensitivity: "base",
        }) ||
        a.first_name.localeCompare(b.first_name, undefined, {
          sensitivity: "base",
        }) ||
        a.lane_pos.localeCompare(b.lane_pos, undefined, {
          sensitivity: "base",
        }) ||
        b.average - a.average,
    );
  };

  /**
   * Sorts the player data rows by first name.
   *
   * Sort order:
   * 1. First name
   * 2. Last name
   * 3. Lane position
   * 4. Average
   * 
   * @param {tmntPlayerInTableType[]} playerRows - The player data rows to sort.
   * @returns {tmntPlayerInTableType[]} The sorted player data rows.
   */
  const sortPlayerRowsByFirstName = (
    playerRows: tmntPlayerInTableType[],
  ): tmntPlayerInTableType[] => {
    // sort by first name, then last name, then lane, then average
    return playerRows.sort(
      (a, b) =>
        a.first_name.localeCompare(b.first_name, undefined, {
          sensitivity: "base",
        }) ||
        a.last_name.localeCompare(b.last_name, undefined, {
          sensitivity: "base",
        }) ||
        a.lane_pos.localeCompare(b.lane_pos, undefined, {
          sensitivity: "base",
        }) ||
        b.average - a.average,
    );
  };

  /**
   * Sorts the player data rows by lane position.
   *
   * Sort order:
   * 1. Lane position
   * 2. Last name
   * 3. First name
   * 4. Average
   * 
   * @param {tmntPlayerInTableType[]} playerRows - The player data rows to sort.
   * @returns {tmntPlayerInTableType[]} The sorted player data rows.
   */
  const sortPlayerRowsByLanePos = (
    playerRows: tmntPlayerInTableType[],
  ): tmntPlayerInTableType[] => {
    // sort by lane, then last name, then first name, then average
    return playerRows.sort(
      (a, b) =>
        a.lane_pos.localeCompare(b.lane_pos, undefined, {
          sensitivity: "base",
        }) ||
        a.last_name.localeCompare(b.last_name, undefined, {
          sensitivity: "base",
        }) ||
        a.first_name.localeCompare(b.first_name, undefined, {
          sensitivity: "base",
        }) ||
        b.average - a.average,
    );
  };

  /**
   * Sorts the player data rows by average.
   *
   * Sort order:
   * 1. Average
   * 2. Last name
   * 3. First name
   * 4. Lane position
   * 
   * @param {tmntPlayerInTableType[]} playerRows - The player data rows to sort.
   * @returns {tmntPlayerInTableType[]} The sorted player data rows.
   */
  const sortPlayerRowsByAverage = (
    playerRows: tmntPlayerInTableType[],
  ): tmntPlayerInTableType[] => {
    // sort by lane, then last name, then first name, then average
    return playerRows.sort(
      (a, b) =>
        b.average - a.average ||
        a.first_name.localeCompare(b.first_name, undefined, {
          sensitivity: "base",
        }) ||
        a.last_name.localeCompare(b.last_name, undefined, {
          sensitivity: "base",
        }) ||
        a.lane_pos.localeCompare(b.lane_pos, undefined, {
          sensitivity: "base",
        }),
    );
  };  

  switch (playerSort) {
    case "firstName":
      sortPlayerRowsByFirstName(playerRows);
      break;

    case "average":
      sortPlayerRowsByAverage(playerRows);
      break;

    case "lanePos":
      sortPlayerRowsByLanePos(playerRows);
      break;

    case "lastName":
    default:
      sortPlayerRowsByLastName(playerRows);
      break;
  }

  const averageWidth = 70;  
  const firstNameWidth = 100;  
  const lanePosWidth = 70;
  const lastNameWidth = 120;

  return (
    <>
      <WaitModal
        show={tmntLoadStatus === "loading"}        
        message="Loading..."
      /> 

      <TmntHomeHeader tmntFullData={stateTmntFullData} />

      {hasTmntData && (
        <div className="d-flex justify-content-center">
          <div className="tmnt_table overflow-x-auto">
            <table className="table table-sm table-striped table-hover w-auto">
              <thead>
                <tr>
                  <th
                    className="text-start align-middle"
                    style={{ width: lastNameWidth }}
                  >
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={() => setPlayerSort("lastName")}
                    >
                      Last Name
                    </button>
                  </th>
                  <th
                    className="text-start align-middle"
                    style={{ width: firstNameWidth }}                  
                  >
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={() => setPlayerSort("firstName")}
                    >
                      First Name
                    </button>
                  </th>
                  <th
                    className="text-end align-middle"
                    style={{ width: averageWidth }}
                  >
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={() => setPlayerSort("average")}
                    >
                      Ave
                    </button>
                  </th>
                  <th
                    className="text-end align-middle"
                    style={{ width: lanePosWidth }}
                  >
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={() => setPlayerSort("lanePos")}
                    >
                      Lane
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="table-group-divider">
                {playerRows.map((playerRow) => (
                  <tr key={playerRow.id}>
                    <td className="text-start">{playerRow.last_name}</td>
                    <td className="text-start">{playerRow.first_name}</td>
                    <td className="text-end">{playerRow.average}</td>
                    <td className="text-end">{playerRow.lane_pos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>        
      )}
    </>
  );
};

export default TmntPlayersPage;
