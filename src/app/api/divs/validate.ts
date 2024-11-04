import {
  isValidBtDbId,
  maxEventLength,
  minHdcpPer,
  maxHdcpPer,
  ErrorCode,
  minHdcpFrom,
  maxHdcpFrom,
  validSortOrder,
} from "@/lib/validation";
import { sanitize } from "@/lib/sanitize";
import { HdcpForTypes, idTypes, validDivsType } from "@/lib/types/types";
import { divType } from "@/lib/types/types";
import { blankDiv } from "@/lib/db/initVals";
import { isNumber } from "@/lib/validation";

const isHdcpForType = (value: any): value is HdcpForTypes => {
  return value === "Game" || value === "Series";
}

/**
 * checks if div object has data
 * 
 * @param div - div object to check
 * @returns { ErrorCode.None | ErrorCode.MissingData | ErrorCode.OtherError } 
 */
const gotDivData = (div: divType): ErrorCode => {
  try {
    if (!div.id
      || !div.tmnt_id
      || !sanitize(div.div_name)
      || (typeof div.hdcp_per !== 'number')
      || (typeof div.hdcp_from !== 'number')
      || (typeof div.int_hdcp !== 'boolean')
      || (!isHdcpForType(div.hdcp_for))
      || (typeof div.sort_order !== 'number')
    ) {
      return ErrorCode.MissingData;
    }
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError;
  }
}

export const validDivName = (divName: string): boolean => {
  if (!divName) return false
  const sanitized = sanitize(divName);
  return (sanitized.length > 0 && sanitized.length <= maxEventLength);
}
export const validHdcpPer = (hdcpPer: number): boolean => {
  if (typeof hdcpPer !== 'number') return false  
  return (hdcpPer >= minHdcpPer && hdcpPer <= maxHdcpPer);
}
export const validHdcpFrom = (hdcpFrom: number): boolean => {
  if (typeof hdcpFrom !== 'number' || !Number.isInteger(hdcpFrom)) return false
  return (hdcpFrom >= minHdcpFrom && hdcpFrom <= maxHdcpFrom);
}
export const validIntHdcp = (intHdcp: boolean): boolean => {
  if (typeof intHdcp !== 'boolean') return false
  return (intHdcp === true || intHdcp === false);
}
export const validHdcpFor = (hdcpFor: string): boolean => {
  if (typeof hdcpFor !== 'string') return false
  return isHdcpForType(hdcpFor);
}

/**
 * checks if foreign key is valid
 * 
 * @param FkId - foreign key 
 * @param idType - id type - 'usr' or 'bwl'
 * @returns boolean - true if foreign key is valid
 */
export const validDivFkId = (FkId: string, idType: idTypes): boolean => { 
  if (!(FkId) || !isValidBtDbId(FkId, idType)) {
    return false
  }
  return (idType === 'tmt')
}

/**
 * checks if div data is valid 
 * 
 * @param div - div data to validate
 * @returns {ErrorCode.None | ErrorCode.InvalidData, ErrorCode.OtherError}
 */
const validDivData = (div: divType): ErrorCode => {
  try {
    if (!div) return ErrorCode.InvalidData;
    if (!isValidBtDbId(div.id, 'div')) {
      return ErrorCode.InvalidData
    }
    if (!validDivFkId(div.tmnt_id, 'tmt')) {
      return ErrorCode.InvalidData;
    }
    if (!validDivName(div.div_name)) {
      return ErrorCode.InvalidData;
    }
    if (!validHdcpPer(div.hdcp_per)) {
      return ErrorCode.InvalidData;
    }
    if (!validHdcpFrom(div.hdcp_from)) {
      return ErrorCode.InvalidData;
    }
    if (!validIntHdcp(div.int_hdcp)) {
      return ErrorCode.InvalidData;
    }
    if (!validHdcpFor(div.hdcp_for)) {
      return ErrorCode.InvalidData;
    }
    if (!validSortOrder(div.sort_order)) {
      return ErrorCode.InvalidData;
    }
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError;
  }
}

/**
 * sanitize a div object
 * 
 * @param div - div data to sanitize
 * @returns { divType } - sanitized div
 */
export const sanitizeDiv = (div: divType): divType => {
  if (!div) return null as any;
  const sanitizedDiv = {
    ...blankDiv,
    hdcp_per: null as any,
    hdcp_from: null as any,
    int_hdcp: null as any,
    hdcp_for: "" as any,
    sort_order: null as any
  }
  if (isValidBtDbId(div.id, "div")) {
    sanitizedDiv.id = div.id;
  }
  if (validDivFkId(div.tmnt_id, 'tmt')) {
    sanitizedDiv.tmnt_id = div.tmnt_id
  }
  sanitizedDiv.div_name = sanitize(div.div_name)
  if ((div.hdcp_per === null) || isNumber(div.hdcp_per)) {
    sanitizedDiv.hdcp_per = div.hdcp_per
  }
  if ((div.hdcp_from === null) || isNumber(div.hdcp_from)) {
    sanitizedDiv.hdcp_from = div.hdcp_from
  }
  if (validIntHdcp(div.int_hdcp)) {
    sanitizedDiv.int_hdcp = div.int_hdcp
  }
  if (validHdcpFor(div.hdcp_for)) {
    sanitizedDiv.hdcp_for = div.hdcp_for
  }
  if ((div.sort_order === null) || isNumber(div.sort_order)) {
    sanitizedDiv.sort_order = div.sort_order
  }
  return sanitizedDiv
}

/**
 * checks if div data is valid 
 * 
 * @param div - div data to validate
 * @returns {ErrorCode.None | ErrorCode.MissingData | ErrorCode.InvalidData | ErrorCode.OtherError}
 */
export function validateDiv(div: divType): ErrorCode { 
  try {
    const errCode = gotDivData(div)
    if (errCode !== ErrorCode.None) {
      return errCode
    }    
    return validDivData(div)
  } catch (error) {
    return ErrorCode.OtherError
  }
}

/**
 * sanitizea and validates an array of divs
 * 
 * @param {divType[]} divs - array of divs to validate
 * @returns {validDivsType} - {divs:divType[], errorCode: ErrorCode.None | ErrorCode.MissingData | ErrorCode.InvalidData | ErrorCode.OtherError}
 */
export const validateDivs = (divs: divType[]): validDivsType => {
  
  const blankDivs: divType[] = [];
  const okDivs: divType[] = [];
  if (!Array.isArray(divs) || divs.length === 0) {
    return { divs: blankDivs, errorCode: ErrorCode.MissingData };
  };
  // cannot use forEach because if got an errror need exit loop
  let i = 0;
  let tmntId = "";
  while (i < divs.length) {
    const toPost = sanitizeDiv(divs[i]);
    const errCode = validateDiv(toPost);
    if (errCode !== ErrorCode.None) { 
      return { divs: okDivs, errorCode: errCode };
    }    
    // all events MUST have same tmnt_id
    if (i > 0 && tmntId !== toPost.tmnt_id) {
      return { divs: okDivs, errorCode: ErrorCode.InvalidData };
    }
    // push AFETER errCode is None
    okDivs.push(toPost);    
    // set tmnt_id AFTER 1st event sanitzied and validated
    if (i === 0) {
      tmntId = toPost.tmnt_id;
    }
    i++;
  }
  return { divs: okDivs, errorCode: ErrorCode.None };
}

export const exportedForTesting = {
  gotDivData,  
  validDivData
}
