"use client";
import React from "react";
import { useSession } from "next-auth/react"; 
import TmntDataForm from "../tmntForm/tmntForm";
import { dataOneTmntType, tmntActions, tmntFormDataType } from "@/lib/types/types";
import {
  initBrkts,  
  initDivs,
  initElims,
  initEvents,
  initLanes,
  initPots,
  initSquads,
  initTmnt,  
  linkedInitDataOneTmnt,  
} from "@/lib/db/initVals";
import { cloneDeep } from "lodash";

const blankFullTmnt: dataOneTmntType = {
  tmnt: initTmnt,
  events: initEvents,
  divs: initDivs,
  squads: initSquads,
  lanes: initLanes,
  pots: initPots,
  brkts: initBrkts,
  elims: initElims,
};

const NewTmntPage = () => {

  const { status, data } = useSession();
  // link the tmnt data types
  const userId = data?.user?.id || "";
  const fullTmntData: dataOneTmntType = linkedInitDataOneTmnt(userId)
  const blankDataOneTmnt = cloneDeep(blankFullTmnt);

  const dataOneTmnt: tmntFormDataType = {
    origData: blankDataOneTmnt,
    curData: fullTmntData,
    tmntAction: tmntActions.New
  }
  
  return (
    <>      
      <div className="d-flex flex-column justify-content-center align-items-center">
        <div className="shadow p-3 m-3 rounded-3 container">
          <h2 className="mb-3">New Tournament</h2>                    
          <TmntDataForm tmntProps={dataOneTmnt} />
        </div>
      </div>
    </>
  );
};

export default NewTmntPage;
