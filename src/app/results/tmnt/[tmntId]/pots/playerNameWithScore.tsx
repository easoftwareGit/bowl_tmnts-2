import { getPlayerName } from "@/lib/getName"
import { potResultsRowType } from "@/lib/results/pots/potResults"
import { divType, tmntFullType } from "@/lib/types/types";

interface ChildProps {
  row: potResultsRowType;
  tmntFullData: tmntFullType;
  div: divType;
}  

const PlayerNameWithScore: React.FC<ChildProps> = ({
  row,
  tmntFullData,
  div,
}) => {
  return (
    <div className="d-flex align-items-center">
      <span>{getPlayerName(tmntFullData.players, row.player_id)}</span>
      <span className="ms-auto ps-2 text-nowrap">
        {row.scoreWithHdcp}
        {div.hdcp_per > 0 && row.score != null &&  (
          <span className="small">
            {" "}({row.score} + {row.hdcp})
            {(row.hdcp != null && row.hdcp < 10) && "\u2007"}
          </span>
        )}
      </span>
    </div>
  )
}

export default PlayerNameWithScore