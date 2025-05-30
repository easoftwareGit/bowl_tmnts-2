import { brktRefundType, validBrktRefundsType } from "@/lib/types/types";
import { validateBrktRefunds } from "../validate";
import { ErrorCode } from "@/lib/validation";

/**
 * gets array of unique brktIds
 * 
 * @param {brktRefundType[]} brktRefunds - array of brktRefunds
 * @returns {string[]} - array of unique brktIds
 */
const getBrktIds = (brktRefunds: brktRefundType[]) => {
  const brktIds: string[] = [];
  brktRefunds.forEach((brktRefund) => {
    if (!brktIds.includes(brktRefund.brkt_id)) {
      brktIds.push(brktRefund.brkt_id);
    }    
  })
  return brktIds;
}

/**
 * gets SQL query to update many brktRefunds at once
 * 
 * @param {brktRefundType[]} brktRefunds - array of brktRefunds
 * @returns {string} - SQL query to update many brktRefunds at once or '' 
 */
export const getUpdateManySQL = (brktRefunds: brktRefundType[]) => {

  if (!brktRefunds || brktRefunds.length === 0) return "";

  const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefunds);
  if (validBrktRefunds.errorCode !== ErrorCode.None) return "";

  const brktIds: string[] = getBrktIds(brktRefunds);
  if (brktIds.length === 0) return "";

  const getSqlValues = (brktRefunds: brktRefundType[]) => {
    const values: string[] = [];
    brktRefunds.forEach((brktRefund) => {      
      values.push(`('${brktRefund.brkt_id}', '${brktRefund.player_id}', ${brktRefund.num_refunds})`)
    })    
    return values.join(`, `);
  }

  // create the SQL query  
  const updateManySQL =
    `UPDATE public."Brkt_Refund" ` +
    `SET num_refunds = CASE ` +
      brktIds.map((brktId) => `WHEN public."Brkt_Refund".brkt_id = '${brktId}' THEN b2Up.num_refunds`).join(` `) + ' ' +
    `END ` +
    `FROM (VALUES ` +
      getSqlValues(validBrktRefunds.brktRefunds) +
    `) AS b2Up(brkt_id, player_id, num_refunds) ` +
    `WHERE public."Brkt_Refund".player_id = b2Up.player_id AND public."Brkt_Refund".brkt_id = b2Up.brkt_id;`
    
  return updateManySQL  
}

/**
 * gets SQL query to insert many brktRefunds at once
 * 
 * @param {brktRefundType[]} brktRefunds - array of brktRefunds
 * @returns {string} - SQL query to insert many brktRefunds at once or '' 
 */
export const getInsertManySQL = (brktRefunds: brktRefundType[]) => {

  if (!brktRefunds || brktRefunds.length === 0) return "";
  const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefunds);
  if (validBrktRefunds.errorCode !== ErrorCode.None) return "";

  const getSqlValues = (brktRefunds: brktRefundType[]) => {
    const values: string[] = [];
    brktRefunds.forEach((brktRefund) => {      
      values.push(`('${brktRefund.id}', '${brktRefund.brkt_id}', '${brktRefund.player_id}', ${brktRefund.num_refunds})`)
    })    
    return values.join(`, `);
  }

  const insertManySQL = 
    `INSERT INTO public."Brkt_Refund" (id, brkt_id, player_id, num_refunds) ` +
    `SELECT b2up.id, b2up.brkt_id, b2up.player_id, b2up.num_refunds ` +
    `FROM (VALUES ` +
      getSqlValues(validBrktRefunds.brktRefunds) +
      `) AS b2up(id, brkt_id, player_id, num_refunds) ` +
    `WHERE NOT EXISTS (SELECT 1 FROM public."Brkt_Refund" WHERE id = b2up.id);`

  return insertManySQL 
}

/**
 * gets SQL query to delete many brktRefunds at once
 * 
 * @param {brktRefundType[]} brktRefunds - array of brktRefunds
 * @returns {string} - SQL query to delete many brktRefunds at once or '' 
 */
export const getDeleteManySQL = (brktRefunds: brktRefundType[]) => { 

  if (!brktRefunds || brktRefunds.length === 0) return "";
  const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefunds);
  if (validBrktRefunds.errorCode !== ErrorCode.None) return "";

  const getSqlValues = (brktRefunds: brktRefundType[]) => {
    const values: string[] = [];
    brktRefunds.forEach((brktRefund) => {
      values.push(`('${brktRefund.brkt_id}', '${brktRefund.player_id}')`)
    })
    return values.join(`, `);
  }

  const deleteManySQL = 
    `DELETE FROM public."Brkt_Refund" ` +
    `WHERE (brkt_id, player_id) IN ( ` +
      getSqlValues(validBrktRefunds.brktRefunds) +
    `);`

  return deleteManySQL
}

export const exportedForTesting = {
  getBrktIds,  
}