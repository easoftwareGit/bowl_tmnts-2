import { getPlayerName } from "@/lib/getName";
import { potResultsRowType } from "@/lib/results/pots/potResults";
import { divType, tmntFullType } from "@/lib/types/types";
import { FIGURE_SPACE } from "@/lib/validation/constants";

interface ChildProps {
  row: potResultsRowType;
  tmntFullData: tmntFullType;
  div: divType;
}

const padStartFigure = (num: number, width: number): string =>
  String(num).padStart(width, FIGURE_SPACE);

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
        {div.hdcp_per > 0 && row.score != null && row.hdcp != null && (
          <span className="small">
            {" "}({padStartFigure(row.score, 3)} + {row.hdcp})
            {row.hdcp < 10 && FIGURE_SPACE}
          </span>
        )}
      </span>
    </div>
  );
};

export default PlayerNameWithScore;

// import { getPlayerName } from "@/lib/getName"
// import { potResultsRowType } from "@/lib/results/pots/potResults"
// import { divType, tmntFullType } from "@/lib/types/types";
// import { FIGURE_SPACE } from "@/lib/validation/constants";

// interface ChildProps {
//   row: potResultsRowType;
//   tmntFullData: tmntFullType;
//   div: divType;
// }  

// const PlayerNameWithScore: React.FC<ChildProps> = ({
//   row,
//   tmntFullData,
//   div,
// }) => {
//   return (
//     <div className="d-flex align-items-center">
//       <span>{getPlayerName(tmntFullData.players, row.player_id)}</span>
//       <span className="ms-auto ps-2 text-nowrap">
//         {row.scoreWithHdcp}
//         {div.hdcp_per > 0 && row.score != null &&  (
//           <span className="small">
//             {" "}({row.score} + {row.hdcp})
//             {(row.hdcp != null && row.hdcp < 10) && FIGURE_SPACE}
//           </span>
//         )}
//       </span>
//     </div>
//   )
// }

// export default PlayerNameWithScore

