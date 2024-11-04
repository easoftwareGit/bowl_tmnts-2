"use client";
import React, { useState } from "react";
import { squadType, laneType } from "../../../lib/types/types";
import { Tabs, Tab } from "react-bootstrap";
import LanesList from "@/components/tmnts/lanesList";

interface ChildProps {
  lanes: laneType[];  
  setLanes: (lanes: laneType[]) => void;
  squads: squadType[];  
}

// const defaultTabKey = 'squad1'

const OneToNLanes: React.FC<ChildProps> = ({
  lanes,  
  setLanes,
  squads,  
}) => {
  
  const defaultTabKey = `lane${squads[0].id}`; // need to have 'lane' in key

  const [tabKey, setTabKey] = useState(defaultTabKey); 

  const handleTabSelect = (key: string | null) => {
    if (key) {
      setTabKey(key);
    }    
  }

  return (
    <>
      <Tabs
        defaultActiveKey={defaultTabKey}
        id="lanes-tabs"
        className="mb-2"
        variant="pills"
        activeKey={tabKey}
        onSelect={handleTabSelect}
      >
        {squads.map((squad) => 
          <Tab
            key={squad.id}
            eventKey={`lane${squad.id}`} // need to have 'lane' in key
            title={squad.tab_title}
            // tabClassName={`${squad.laneErrClassName}`} no errors in lane tabs
          >
            <LanesList
              squadId={squad.id}
              lanes={lanes}
              setLanes={setLanes}
            />
          </Tab>
        )}
      </Tabs>
    </>
  )
}

export default OneToNLanes;