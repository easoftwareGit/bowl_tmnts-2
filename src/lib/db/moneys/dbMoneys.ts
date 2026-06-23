import { publicApi, privateApi } from "@/lib/api/axios";
import { baseMoneyApi } from "@/lib/api/apiPaths";
import { testBaseMoneysApi } from "../../../../test/testApi";
import type { tmntMoneyType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankTmntMoney } from "../initVals";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseMoneysApi
  ? testBaseMoneysApi
  : baseMoneyApi;  

const oneMoneyUrl = url + "/money/";
const tmntUrl = url + "/tmnt/";

/**
 * extracts money data from GET API response
 *
 * @param {any} tmntMoneys - array of tmntMoneys from GET API response
 * @returns {tmntMoneyType[]} - array of players with extracted data
 */
export const extractTmntMoneys = (tmntMoneys: any): tmntMoneyType[] => {
  return tmntMoneys.map((tmntMoney: any) => ({
    ...blankTmntMoney,
    id: tmntMoney.id,
    event_id: tmntMoney.event_id,
    squad_id: tmntMoney.squad_id,
    div_id: tmntMoney.div_id,
    descrip: tmntMoney.descrip,
    flow: tmntMoney.flow,
    amount: Number(tmntMoney.amount) || 0,
    pot_id: tmntMoney.pot_id,
    brkt_id: tmntMoney.brkt_id,
    elim_id: tmntMoney.elim_id,
    sort_order: tmntMoney.sort_order
  }));
};