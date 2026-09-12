"use client";

import "@/lib/syncfusion-license";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
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
import { ColumnDirective, ColumnsDirective, GridComponent, Inject, Sort } from "@syncfusion/ej2-react-grids";
import { calcHandicap } from "@/lib/db/divEntries/calcHdcp";
import { sfRowHeight } from "@/lib/syncfusionTools";

type tmntPlayerInGridType = {
  id: string;
  first_name: string;
  last_name: string;
  average: number;
  hdcp: number;  
  lane_pos: string;
}

const TmntPlayersPage = () => {
  const params = useParams();
  const tmntId = params.tmntId as string;  

  const dispatch = useDispatch<AppDispatch>();

  const requestedTmntId = useSelector(getTmntFullDataRequestedTmntId);
  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
  const tmntError = useSelector(getTmntFullDataError);
  const stateTmntFullData = useSelector(selectTmntFullData);

  useEffect(() => {
    const needsTmntData = stateTmntFullData.tmnt.id !== tmntId;

    const failedForThisTmnt =
      tmntLoadStatus === "failed" && requestedTmntId === tmntId;

    if (
      needsTmntData &&
      tmntLoadStatus !== "loading" &&
      !failedForThisTmnt
    ) {
      dispatch(fetchTmntFullData(tmntId));
    }
  }, [
    tmntId,
    stateTmntFullData,
    tmntLoadStatus,
    requestedTmntId,
    dispatch
  ]);

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

  if (!hasTmntData) {
    return (
      <WaitModal show={tmntLoadStatus === "loading"} message="Loading..." />
    );
  }

  /****************************************/
  /* create player data for results grid  */
  /****************************************/

  const divWithHdcp = stateTmntFullData?.divs.find(
    (div) => div.hdcp_per > 0
  );
  const divToUse = (divWithHdcp) ? divWithHdcp : stateTmntFullData?.divs[0];

  const nonByePlayers = stateTmntFullData.players
    .filter((player) => player.id.startsWith("ply"))
    .sort(
      (a, b) =>
        a.last_name.localeCompare(b.last_name) ||
        a.first_name.localeCompare(b.first_name)
    );

  const playerData: tmntPlayerInGridType[] =
    nonByePlayers.map((player) => ({
      id: player.id,
      first_name: player.first_name,
      last_name: player.last_name,
      average: player.average,
      hdcp: calcHandicap(
        player.average,
        divToUse?.hdcp_from,
        divToUse?.hdcp_per,
        divToUse?.int_hdcp,
        divToUse?.hdcp_for),
      lane_pos: player.lane + "-" + player.position
    }));    
  
  return (
    <>
      <TmntHomeHeader        
        tmntFullData={stateTmntFullData}
      />
      <div className="text-center mb-2">
        <h4>{stateTmntFullData?.tmnt.tmnt_name} - Players</h4>

        <div style={{ width: "500px" }} className="mx-auto">
          <GridComponent
            id="tmntPlayersGrid"          
            dataSource={playerData}
            allowPaging={false}
            allowSorting={true}
            gridLines="None"
            readOnly={true}
            rowHeight={sfRowHeight}
          >
            <ColumnsDirective>        
              <ColumnDirective
                field="id"
                isPrimaryKey={true}
                visible={false}
              />            
              <ColumnDirective
                field="last_name"
                headerText="Last Name"
                width="100"
                textAlign="Left"
              />
              <ColumnDirective
                field="first_name"
                headerText="First Name"
                width="100"
                textAlign="Left"
              />
              <ColumnDirective
                field="lane_pos"
                headerText="Lane"
                width="60"
                textAlign="Center"
              />            
              <ColumnDirective
                field="average"
                headerText="Avg"
                width="60"
                textAlign="Right"
              />
              <ColumnDirective
                field="hdcp"
                headerText="HDCP"
                width="70"
                textAlign="Right"
              />            
            </ColumnsDirective>
            <Inject services={[Sort]} />
          </GridComponent>
        </div>
      </div>
    </>
  );
};

export default TmntPlayersPage;