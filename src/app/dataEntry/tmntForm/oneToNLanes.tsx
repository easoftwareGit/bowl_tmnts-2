"use client";
import React, { useState } from "react";
import { squadType, laneType, tmntActions } from "../../../lib/types/types";
import { Tabs, Tab } from "react-bootstrap";
import LanesList from "@/components/tmnts/lanesList";

interface ChildProps {
  lanes: laneType[];  
  setLanes: (lanes: laneType[]) => void;
  squads: squadType[];
  tmntAction: tmntActions;
}

// const defaultTabKey = 'squad1'

const OneToNLanes: React.FC<ChildProps> = ({
  lanes,  
  setLanes,
  squads,
  tmntAction,
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
          >
            <LanesList
              squadId={squad.id}
              lanes={lanes}
              setLanes={setLanes}
              tmntAction={tmntAction}
            />
          </Tab>
        )}
      </Tabs>
    </>
  )
}

export default OneToNLanes;