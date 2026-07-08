import type { ReactElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import type { tmntFullType } from "@/lib/types/types";
import RecapsPerPairReport from "./RecapsPerPairReport";
import RecapsPerTeamReport from "./RecapsPerTeamReport";
import ReportNotFound from "./ReportNotFound";
import GridScoresReport from "./GridScoresReport";
import BalanceSheetReport from "./BalanceSheetReport";

export type ReportDocument = {
  title: string;
  document: ReactElement<DocumentProps>;
};

export function getReportDocument(
  reportId: string,
  tmntFullData: tmntFullType,
  onRender?: () => void,
): ReportDocument {
  switch (reportId) {
    case "recapsPerPair":
      return {
        title: "Recaps per Pair",
        document: (
          <RecapsPerPairReport
            tmntFullData={tmntFullData}
            onRender={onRender}
          />
        ),
      };

    case "recapsPerTeam":
      return {
        title: "Recaps per Team",
        document: (
          <RecapsPerTeamReport
            tmntFullData={tmntFullData}
            onRender={onRender}
          />
        ),
      };

    case "scoreGrid":
      return {
        title: "Scores Grid",
        document: (
          <GridScoresReport
            tmntFullData={tmntFullData}
            onRender={onRender}
          />  
        ),
      };

    case "balanceSheet":
      return {
        title: "Balance Sheet",
        document: (
          <BalanceSheetReport
            tmntFullData={tmntFullData}
            onRender={onRender}
          />  
        ),
      };


    // case "fees":
    //   return {
    //     title: "Fees Report",
    //     document: <FeesReport tmntId={tmntId} />,
    //   };

    default:
      return {
        title: "Report Not Found",
        document: <ReportNotFound reportId={reportId} />,
      };
  }
}