"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react"; 
import TmntDataForm from "../tmntForm/tmntForm";
import { allDataOneTmntType, dataOneTmntType, tmntPropsType } from "@/lib/types/types";
import {
  initBrkts,
  blankDataOneTmnt,
  initDivs,
  initElims,
  initEvents,
  initLanes,
  initPots,
  initSquads,
  initTmnt,
  linkedInitDataOneTmnt,  
} from "@/lib/db/initVals";

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

export const NewTmntPage = () => {

  const { status, data } = useSession();
  // link the tmnt data types
  const userId = data?.user?.id || "";
  const fullTmntData: dataOneTmntType = linkedInitDataOneTmnt(userId)
  
  const dataOneTmnt: allDataOneTmntType = {
    origData: blankDataOneTmnt(),
    curData: fullTmntData,
  }
  
  return (
    <>      
      <div className="d-flex flex-column justify-content-center align-items-center">
        <div className="shadow p-3 m-3 rounded-3 container">
          <h2 className="mb-3">Tournament Info</h2>                    
          <TmntDataForm tmntProps={dataOneTmnt} />
        </div>
      </div>
    </>
  );
};

export default NewTmntPage;
