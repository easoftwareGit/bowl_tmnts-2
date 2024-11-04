"use client"
import React, { useState } from "react";
import { initDivs, blankTmnt } from "../../lib/db/initVals";
import { todayStr } from "@/lib/dateTools";
import { mockEvents } from "../../../test/mocks/tmnts/singlesAndDoubles/mockEvents";
import { tmntType, brktType, divType, elimType, potType, squadType, tmntPropsType, laneType, eventType } from "../../lib/types/types";
import { SampleForm } from "./form";
import { Form3 } from "./form3";
import { Form5 } from "./form5";
import { Form6 } from "./form6";
import { Form7 } from "./form7";
import { Form8 } from "./form8";
import Form9 from "./form9";
import { Form10 } from "./form10";
import { Form12 } from "./form12";
import { btDbUuid } from "@/lib/uuid";
import { Form13 } from "./form13";
import { Form14 } from "./form14";

interface FormProps {
  tmnt?: tmntType  
}

export const SamplePage: React.FC<FormProps> = ({ tmnt = blankTmnt }) => { 

  const [tmntData, setTmntData] = useState(tmnt);
  const [events, setEvents] = useState<eventType[]>([]);
  const [divs, setDivs] = useState<divType[]>(initDivs);
  const [squads, setSquads] = useState<squadType[]>([]);
  const [lanes, setLanes] = useState<laneType[]>([])
  const [pots, setPots] = useState<potType[]>([])
  const [brkts, setBrkts] = useState<brktType[]>([])
  const [elims, setElims] = useState<elimType[]>([])  
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
  }

  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <div className="shadow p-3 m-3 rounded-3 container">
        <h2 className="mb-3">Test</h2>
        {/* <SampleForm /> */}
        {/* <Form2 /> */}
        {/* <Form3 events={events} setEvents={setEvents} /> */}
        {/* <Form4 tmntProps={tmntFormProps} /> */}
        {/* <Form5 tmntProps={tmntFormProps} /> */}
        {/* <Form6 /> */}
        {/* <Form7 /> */}
        {/* <Form8 /> */}
        {/* <Form9 /> */}
        {/* <Form10 /> */}
        {/* <Form12 /> */}
        {/* <Form13 /> */}
        <Form14 />
      </div>
    </div>
  )
}

export default SamplePage;