import React from "react";
import { eventType, squadType, AcdnErrType } from "../../lib/types/types";

interface ChildProps {
  events: eventType[];
  setEvents: (events: eventType[]) => void;
  squads: squadType[],
  setSquads: (squds: squadType[]) => void;
  setAcdnErr: (objAcdnErr: AcdnErrType) => void;  
}

const Component4: React.FC<ChildProps> = ({
  events,
  setEvents,
  squads,
  setSquads,
  setAcdnErr,
}) => {

  return (
    <>
    </>
  )
}

export default Component4;