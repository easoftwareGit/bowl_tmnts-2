import { dataOneTmntType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";
import { get } from "lodash";

const getDivAndHdcpSQL = (curData: dataOneTmntType): string => {
  
  if (!curData || !curData.divs || curData.divs.length === 0) {
    return '';  
  }
  let sql = '';
  curData.divs.forEach((div) => {
    if (div.id && isValidBtDbId(div.id, 'div')) {
      sql +=
        `MAX(CASE WHEN public."Div_Entry".div_id = '${div.id}' ` +
        `THEN public."Div_Entry".fee END) AS ${div.id}_fee, ` + 
        `MAX(CASE WHEN public."Div_Entry".div_id = '${div.id}' ` +
        `THEN FLOOR(GREATEST(0, public."Div".hdcp_from - public."Player".average) * public."Div".hdcp_per)::INTEGER END) AS ${div.id}_hdcp, `
    }
  });
  return sql
}

const getPotsSQL = (curData: dataOneTmntType): string => {
  
  if (!curData || !curData.pots || curData.pots.length === 0) {
    return '';  
  }
  let sql = '';
  curData.pots.forEach((pot) => {
    if (pot.id && isValidBtDbId(pot.id, 'pot')) {
      sql +=
        `MAX(CASE WHEN public."Pot".id = '${pot.id}' ` +
        `THEN public."Pot_Entry".fee END) AS ${pot.id}_fee, `
    }
  });
  return sql
}

const getBrktsSQL = (curData: dataOneTmntType): string => {
  
  if (!curData || !curData.brkts || curData.brkts.length === 0) {
    return '';  
  }
  let sql = '';
  curData.brkts.forEach((brkt) => {
    if (brkt.id && isValidBtDbId(brkt.id, 'brk')) {
      sql +=
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = '${brkt.id}' ` +
        `THEN public."Brkt_Entry".num_brackets END) AS ${brkt.id}_num_brackets, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = '${brkt.id}' ` +
        `THEN public."Brkt".fee * public."Brkt_Entry".num_brackets END) AS ${brkt.id}_fee, `
    }
  });
  return sql
}

const getElimsSQL = (curData: dataOneTmntType): string => {
  
  if (!curData || !curData.elims || curData.elims.length === 0) {
    return '';  
  }
  let sql = '';
  curData.elims.forEach((elim) => {
    if (elim.id && isValidBtDbId(elim.id, 'elm')) {
      sql +=
        `MAX(CASE WHEN public."Elim_Entry".elim_id = '${elim.id}' ` +
        `THEN public."Elim_Entry".fee END) AS ${elim.id}_fee, `
    }
  });
  return sql
}

export const getSquadEntriesSQL = (curData: dataOneTmntType): string => {
  
  if (!curData
    || !curData.squads
    || curData.squads.length === 0
    || !curData.squads[0].id
    || !curData.divs
    || curData.divs.length === 0
    || !isValidBtDbId(curData.squads[0].id, 'sqd')) {
    return '';
  }
  let divsHdcpPotsBrktsElims =
    getDivAndHdcpSQL(curData) +
    getPotsSQL(curData) +
    getBrktsSQL(curData) +
    getElimsSQL(curData);
  // no comma at end of SELECT part of SQL and before FROM part of SQL
  // any one of the above functions could return empty string
  // so only trim when string ends with comma
  divsHdcpPotsBrktsElims = divsHdcpPotsBrktsElims.replace(/, $/, " ")  
  const squadEntriesQL =
    `SELECT ` + 
    `public."Player".id AS player_id, ` +
    `public."Player".first_name, ` +
    `public."Player".last_name, ` +
    `public."Player".average, ` +
    `public."Player".lane, ` +
    `public."Player".position, ` +
    // divs and hdcp + pots + brackets + elims
    divsHdcpPotsBrktsElims +
    `FROM public."Player" ` +
    `LEFT JOIN public."Div_Entry" ON public."Player".id = public."Div_Entry".player_id ` +
    `LEFT JOIN public."Div" ON public."Div_Entry".div_id = public."Div".id ` +
    `LEFT JOIN public."Pot_Entry" ON public."Player".id = public."Pot_Entry".player_id ` +
    `LEFT JOIN public."Pot" ON public."Pot_Entry".pot_id = public."Pot".id ` +
    `LEFT JOIN public."Brkt_Entry" ON public."Player".id = public."Brkt_Entry".player_id ` +
    `LEFT JOIN public."Brkt" ON public."Brkt_Entry".brkt_id = public."Brkt".id ` +
    `LEFT JOIN public."Elim_Entry" ON public."Player".id = public."Elim_Entry".player_id ` +
    `LEFT JOIN public."Elim" ON public."Elim_Entry".elim_id = public."Elim".id ` +
    `JOIN public."Event" ON public."Div".tmnt_id = public."Event".tmnt_id ` +
    `JOIN public."Squad" ON public."Event".id = public."Squad".event_id ` +
    `WHERE public."Squad".id = '${curData.squads[0].id}' ` +
    `GROUP BY public."Player".id, public."Player".first_name, public."Player".last_name, public."Player".average, public."Player".lane, public."Player".position ` +
    `ORDER BY public."Player".lane, public."Player".position;`;
  
  return squadEntriesQL
}

export const exportedForTesting = {
  getDivAndHdcpSQL,  
  getPotsSQL,
  getBrktsSQL,
  getElimsSQL
}