"use client";
import React from "react";
import { useSession } from "next-auth/react"; 
import TmntDataForm from "../tmntForm/tmntForm";
import { tmntActions, tmntFormDataType, tmntFullType } from "@/lib/types/types";
import { getBlankTmntFullData } from "../tmntForm/tmntTools";

const NewTmntPage = () => {

  const { status, data } = useSession();
  const userId = data?.user?.id || ""; 

  const blankTmnt: tmntFullType = getBlankTmntFullData();
  blankTmnt.tmnt.user_id = userId;

  const dataOneTmnt: tmntFormDataType = {
    tmntFullData: blankTmnt,
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
