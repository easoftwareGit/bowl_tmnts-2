"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; 
import { getAllDataForTmnt } from "@/lib/db/tmnts/tmntsAxios";
import { dataOneTmntType, tmntPropsType, tmntType } from "@/lib/types/types";
import { blankTmnt } from "@/lib/db/initVals";
import TmntDataForm from "../../newTmnt/form";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchOneTmnt, getOneTmntError, getOneTmntLoadStatus } from "@/redux/features/allDataOneTmnt/allDataOneTmntSlice";
import { AppDispatch } from "@/redux/store";

export default function EditTmntPage() {

  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const initBlankTmnt: tmntType = {
    ...blankTmnt,
    start_date: null as any,
    end_date: null as any,
  } 
  const initAllTmntData: dataOneTmntType = {
    tmnt: initBlankTmnt,
    events: [],
    divs: [],
    squads: [],
    lanes: [],
    pots: [],
    brkts: [],
    elims: [],
  }

  const [allTmntData, setAllTmntData] = useState<dataOneTmntType>(initAllTmntData);  
  const [tmntData, setTmntData] = useState(allTmntData.tmnt);
  const [events, setEvents] = useState(allTmntData.events);
  const [divs, setDivs] = useState(allTmntData.divs);
  const [squads, setSquads] = useState(allTmntData.squads);
  const [lanes, setLanes] = useState(allTmntData.lanes);
  const [pots, setPots] = useState(allTmntData.pots);
  const [brkts, setBrkts] = useState(allTmntData.brkts);
  const [elims, setElims] = useState(allTmntData.elims);
  const [showingModal, setShowingModal] = useState(false);  

  const tmntFormProps: tmntPropsType = {
    tmnt: tmntData,
    setTmnt: setTmntData,
    events,
    setEvents,
    divs,
    setDivs,
    squads,
    setSquads,
    lanes,
    setLanes,
    pots,
    setPots,
    brkts,
    setBrkts,
    elims,
    setElims,
    showingModal,
    setShowingModal,    
  };  

  useEffect(() => {
    dispatch(fetchOneTmnt(tmntId));
  }, [tmntId, dispatch]);

  const tmntLoadStatus = useSelector(getOneTmntLoadStatus);
  const tmntError = useSelector(getOneTmntError);  

  return (
    <> 
      {(tmntLoadStatus === 'loading') && <div>Loading...</div>}  
      {tmntLoadStatus !== 'loading' && tmntError
        ? (<div>Error: {tmntError}</div>
        ) : null}
      {(tmntLoadStatus === 'succeeded') ? ( 
        <div className="d-flex flex-column justify-content-center align-items-center">
          <div className="shadow p-3 m-3 rounded-3 container">
            <h2 className="mb-3">Tournament Info</h2>
            <TmntDataForm tmntProps={tmntFormProps} />
          </div>
        </div> 
      ) : null}  
    </>
  );
}