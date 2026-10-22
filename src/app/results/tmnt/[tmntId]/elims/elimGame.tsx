import Image from "next/image";
import { elimResults, erAliveKey } from "@/lib/results/elims/elimResults";
import { tgrGameKey, tgrHdcpKey } from "@/lib/types/resultsTypes";
import { divType } from "@/lib/types/types";

const imageWidth = 16;
const imageHeight = 16;

interface ElimStatusProps {
  isAlive: boolean | null;  
}

const ElimStatus = ({ isAlive }: ElimStatusProps) => {
  return (
    <>
      {isAlive !== null 
        ? (                              
          <>
            {isAlive 
              ? (
                <Image
                  src="/check-circle-fill-success.svg"
                  alt="Advanced"
                  title="Advanced"
                  width={imageWidth}
                  height={imageHeight}
                  className="ms-1 align-text-bottom fw-bold"
                />
              ) : (
                <Image
                  src="/x-circle-fill-danger.svg"
                  alt="Eliminated"
                  title="Eliminated"
                  width={imageWidth}
                  height={imageHeight}
                  className="ms-1 align-text-bottom"
                />
              )
            }
          </>
        ) : (
          <span className="pe-2">
            &nbsp;
          </span>
        )
      }
    </>
  );
};


interface ChildProps { 
  row: elimResults;
  elimDiv: divType;  
  gameNum: number;
}

const ElimGame = ({ row, elimDiv, gameNum }: ChildProps) => {

  const isAlive = row[erAliveKey(gameNum)];
  const gameWithHdcp = row[tgrHdcpKey(gameNum)];
  
  return (
    <div className="d-flex align-items-center">      
      <span className="ms-auto ps-2 text-nowrap">
        {gameWithHdcp}
        {elimDiv.hdcp_per > 0 && gameWithHdcp != null && (
          <>
            <span className="small">
              {" "}({row[tgrGameKey(gameNum)]} + {row.hdcp})
              {(row.hdcp != null && row.hdcp < 10) && "\u2007"}
            </span>
          </>
        )}
        <ElimStatus isAlive={isAlive} />
      </span>
    </div>
  );
};

export default ElimGame;