"use client";
import React from "react";
import { useSession } from "next-auth/react"; 
import TmntDataForm from "../tmntForm/tmntForm";
import { tmntFormDataType, tmntFormParent, tmntFullType } from "@/lib/types/types";
import { getBlankTmntFullData } from "../tmntForm/tmntTools";
import { SquadStage } from "@prisma/client";

const NewTmntPage = () => {

  const { status, data } = useSession();
  const userId = data?.user?.id || ""; 

  const blankTmnt: tmntFullType = getBlankTmntFullData();
  blankTmnt.tmnt.user_id = userId;

  const dataOneTmnt: tmntFormDataType = {
    tmntFullData: blankTmnt,
    stage: SquadStage.DEFINE,
    parentForm: tmntFormParent.NEW,
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
