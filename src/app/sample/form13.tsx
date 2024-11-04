import React, { useState } from "react";
import { prisma } from "@/lib/prisma"; // for production & developemnt

import "./form.css";

export const Form13: React.FC = () => { 
   
  const [squads, setSquads]: any[] = useState([]);

  const getSquads = async (tmntId: string) => {
    try {
      const prismaSquads = await prisma.squad.findMany({
        where: {
          event_id: {
            in: await prisma.event.findMany({
              where: { tmnt_id: tmntId },
              select: { id: true },
            }).then((events) => events.map((event) => event.id)),
          }
        }
      })
      return prismaSquads;
    } catch (err) {
      console.log(err);
      return []
    }
  }

  const handleGetSquads1Event = async () => {
    const tmntId1 = 'tmt_d9b1af944d4941f65b2d2d4ac160cdea'; // 1 event & 2 squads    
    const tmntSquads = await getSquads(tmntId1);
    if (!tmntSquads) {
      setSquads([])
    } else {
      setSquads(tmntSquads);
    }    
  }

  const handleGetSquads2Events = async () => {    
    const tmntId2 = 'tmt_fe8ac53dad0f400abe6354210a8f4cd1' // 2 events & 2 squads
    const tmntSquads = await getSquads(tmntId2);
    if (!tmntSquads) {
      setSquads([])
    } else {
      setSquads(tmntSquads);
    }    
  }

  return (
    <>
      <div className="row g-3 mb-3">
        <div className="col-sm-3 d-flex justify-content-center align-items-start">
          <button
            className="btn btn-success mx-3"
            onClick={handleGetSquads1Event}
          >
            Get Squads 1 Event 2 Squads
          </button>
        </div>            
        <div className="col-sm-3 d-flex justify-content-center align-items-start">
          <label htmlFor="squadCount" className="form-label">
            Squad Count
          </label>
          <input
            type="text"
            className="form-control"
            id="squadCount"                
            name="squadCount"
            value={squads.length}
            disabled
          />          
        </div>            
        <div className="col-sm-3 d-flex justify-content-center align-items-start">
          <button
            className="btn btn-success mx-3"
            onClick={handleGetSquads2Events}
          >
            Get Squads 2 Events 2 Squads
          </button>
        </div>            
      </div>
    </>
  );
}