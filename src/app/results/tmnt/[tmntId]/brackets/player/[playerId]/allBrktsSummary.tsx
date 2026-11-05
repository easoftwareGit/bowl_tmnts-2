import { brktListRecord } from "@/components/brackets/buildBrktLists";
import { IntlConfig } from "@/lib/currency/components/CurrencyInputProps";
import { getLocaleConfig } from "@/lib/currency/components/utils";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { tmntFullType } from "@/lib/types/types";
import {
  calcAllBrktSummaries,
  missingDataError,
  type brktSummaryType,
} from "./playerBrktData";

type AllBrktsSummaryProps = {
  tmntFullData: tmntFullType;
  brktListRecords: brktListRecord;
  playerId: string;
  playerName: string;
  brktIds: string[];
};

const brktsNotFoundMsg = "Brackets not found for player";

const AllBrktsSummary = ({
  tmntFullData,
  brktListRecords,
  playerId,
  playerName,
  brktIds,
}: AllBrktsSummaryProps) => {
  const ic: IntlConfig = { locale: "en-US" };
  const localConfig = getLocaleConfig(ic);
  localConfig.prefix = "$";

  // calcAllBrktSummaries throws when the player has no bracket entries or a
  // bracket has no list. The page guards against both, so show an error.
  let summary: brktSummaryType;
  try {
    summary = calcAllBrktSummaries(
      tmntFullData,
      brktListRecords,
      playerId,
      brktIds,
    );
  } catch {
    return missingDataError(brktsNotFoundMsg);
  }

  // Old code:
  // const summary = calcAllBrktSummaries(
  //   tmntFullData,
  //   brktListRecords,
  //   playerId,
  //   brktIds,
  // );

  const fmt = (n: number) => formatValueSymbSep2Dec(n.toString(), localConfig);
  const entriesLabel = summary.entries === 1 ? "entry" : "entries";
  const summaryWidth = "230px";

  return (
    <div
      className="d-flex justify-content-center mt-2"
      data-testid="all-brkts-summary"
    >
      <div
        className="border border-dark rounded-top rounded-bottom small-table-font fw-semibold"
        data-testid="all-brkts-summary-box"
        style={{ width: summaryWidth }}
      >
        <div className="text-center bracket-title_backgroud text-white rounded-top">
          {playerName}
        </div>

        {summary.allComplete ? (
          <>
            <div className="text-center bracket-title_backgroud text-white">
              Summary for all divisions
            </div>
            <div className="border-bottom border-dark text-end pe-1">
              {summary.entries} {entriesLabel} = {fmt(summary.entryAmount)}
            </div>
            {summary.refunds > 0 && (
              <>
                <div className="border-bottom border-dark text-end pe-1">
                  {summary.refunds} unused = {fmt(summary.refundAmount)}
                </div>
                <div className="border-bottom border-dark text-end pe-1">
                  Total Paid: {fmt(summary.entryAmount + summary.refundAmount)}
                </div>
              </>
            )}
            {summary.refunds === 0 ? (
              <div className="border-top border-dark text-end text-success pe-1">
                Earnings: {fmt(summary.earnings)}
              </div>
            ) : (
                <div
                  className="text-end text-success"
                  data-testid="all-brkts-returned-group"
                >
                <div className="border-top border-bottom border-dark pe-1">
                  Earnings: {fmt(summary.earnings)}
                </div>
                <div className="border-bottom border-dark pe-1">
                  Refunds: {fmt(summary.refundAmount)}
                </div>
                <div className="pe-1">
                  Total Returned: {fmt(summary.earnings + summary.refundAmount)}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center bracket-title_backgroud text-white">
            All brackets not complete
          </div>
        )}
      </div>
    </div>
  );
};


export default AllBrktsSummary;


// import { brktListRecord } from "@/components/brackets/buildBrktLists";
// import { IntlConfig } from "@/lib/currency/components/CurrencyInputProps";
// import { getLocaleConfig } from "@/lib/currency/components/utils";
// import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
// import type { tmntFullType } from "@/lib/types/types";
// import {
//   calcAllBrktSummaries,
//   missingDataError,
//   type brktSummaryType,
// } from "./playerBrktData";

// type AllBrktsSummaryProps = {
//   tmntFullData: tmntFullType;
//   brktListRecords: brktListRecord;
//   playerId: string;
//   playerName: string;
//   brktIds: string[];
// };

// const brktsNotFoundMsg = "Brackets not found for player";

// const AllBrktsSummary = ({
//   tmntFullData,
//   brktListRecords,
//   playerId,
//   playerName,
//   brktIds,
// }: AllBrktsSummaryProps) => {
//   const ic: IntlConfig = { locale: "en-US" };
//   const localConfig = getLocaleConfig(ic);
//   localConfig.prefix = "$";

//   // calcAllBrktSummaries throws when the player has no bracket entries or a
//   // bracket has no list. The page guards against both, so show an error.
//   let summary: brktSummaryType;
//   try {
//     summary = calcAllBrktSummaries(
//       tmntFullData,
//       brktListRecords,
//       playerId,
//       brktIds,
//     );
//   } catch {
//     return missingDataError(brktsNotFoundMsg);
//   }
  
//   const fmt = (n: number) => formatValueSymbSep2Dec(n.toString(), localConfig);
//   const entriesLabel = summary.entries === 1 ? "entry" : "entries";
//   const summaryWidth = "230px";

//   return (
//     <div
//       className="d-flex justify-content-center mt-2"
//       data-testid="all-brkts-summary"
//     >
//       <div
//         className="border border-dark rounded-top rounded-bottom small-table-font fw-semibold"
//         data-testid="all-brkts-summary-box"
//         style={{ width: summaryWidth }}
//       >
//         <div className="text-center bracket-title_backgroud text-white rounded-top">
//           {playerName}
//         </div>

//         {summary.allComplete ? (
//           <>
//             <div className="text-center bracket-title_backgroud text-white">
//               Summary for all divisions
//             </div>
//             <div className="border-bottom border-dark text-end pe-1">
//               {summary.entries} {entriesLabel} = {fmt(summary.entryAmount)}
//             </div>
//             {summary.refunds > 0 && (
//               <>
//                 <div className="border-bottom border-dark text-end pe-1">
//                   {summary.refunds} unused = {fmt(summary.refundAmount)}
//                 </div>
//                 <div className="border-bottom border-dark text-end pe-1">
//                   Total Paid: {fmt(summary.entryAmount + summary.refundAmount)}
//                 </div>
//               </>
//             )}
//             {summary.refunds === 0 ? (
//               <div className="border-top border-dark text-end text-success pe-1">
//                 Earnings: {fmt(summary.earnings)}
//               </div>
//             ) : (
//                 <div
//                   className="text-end text-success"
//                   data-testid="all-brkts-returned-group"
//                 >
//                 <div className="border-top border-bottom border-dark pe-1">
//                   Earnings: {fmt(summary.earnings)}
//                 </div>
//                 <div className="border-bottom border-dark pe-1">
//                   Refunds: {fmt(summary.refundAmount)}
//                 </div>
//                 <div className="pe-1">
//                   Total Returned: {fmt(summary.earnings + summary.refundAmount)}
//                 </div>
//               </div>
//             )}
//           </>
//         ) : (
//           <div className="text-center bracket-title_backgroud text-white">
//             All brackets not complete
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };


// export default AllBrktsSummary;

