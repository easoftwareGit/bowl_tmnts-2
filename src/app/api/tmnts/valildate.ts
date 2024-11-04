import { isValidBtDbId, maxTmntNameLength, ErrorCode, minDate, maxDate } from "@/lib/validation";
import { sanitize } from "@/lib/sanitize";
import { isValid, compareAsc } from "date-fns";
import { idTypes, tmntType } from "@/lib/types/types";
import { blankTmnt } from "@/lib/db/initVals";
import { startOfDayFromString, validDateString } from "@/lib/dateTools";

/**
 * checks for required data and returns error code if missing 
 * 
 * @param tmnt - tournament data to check
 * @returns - {ErrorCode.MissingData, ErrorCode.None, ErrorCode.OtherError}
 */
const gotTmntData = (tmnt: tmntType): ErrorCode => { 
  try {
    if (!tmnt 
      || !tmnt.id
      || !sanitize(tmnt.tmnt_name)
      || (!tmnt.start_date) 
      || (!tmnt.end_date)  
      || !tmnt.bowl_id
      || !tmnt.user_id)
    {
      return ErrorCode.MissingData
    }
    return ErrorCode.None    
  } catch (error) {
    return ErrorCode.OtherError
  }
}

export const validTmntName = (tmntName: string): boolean => {  
  const sanitized = sanitize(tmntName);
  return (sanitized.length > 0 && sanitized.length <= maxTmntNameLength)
}

/**
 * checks if start and end dates are valid 
 * 
 * @param startDateStr - start date as string
 * @param endDateStr = end date as string
 * @returns - boolean: true if dates are valid 
 */
export const validTmntDates = (startDate: Date, endDate: Date): boolean => {     
  //  - both must be valid dates
  //  - end cannot be before start  
  if (!startDate || !endDate) {
    return false
  }
  if (typeof startDate === 'string') {
    if (validDateString(startDate)) {
      startDate = new Date(startDate)
    } else {
      return false
    }
  }
  if (typeof endDate === 'string') {
    if (validDateString(endDate)) {
      endDate = new Date(endDate)
    } else {
      return false
    }
  }
  if (!isValid(startDate) || !isValid(endDate)) {
    return false
  }       
  // if date not in valid range
  if (compareAsc(startDate, minDate) < 0 || compareAsc(startDate, maxDate) > 0) { 
    return false               
  }
  if (compareAsc(endDate, minDate) < 0 || compareAsc(endDate, maxDate) > 0) {
    return false
  }   
  // start must be before or equal to end
  return (compareAsc(startDate, endDate) <= 0) 
}

/**
 * checks if foreign key is valid
 * 
 * @param FkId - foreign key 
 * @param idType - id type - 'usr' or 'bwl'
 * @returns boolean - true if foreign key is valid
 */
export const validTmntFkId = (FkId: string, idType: idTypes): boolean => { 

  if (!(FkId) || !isValidBtDbId(FkId, idType)) {
    return false
  }
  return (idType === 'bwl' || idType === 'usr')
}

/**
 * checks if tournament data is valid
 * 
 * @param tmnt - tournament data to check
 * @returns - {ErrorCode.InvalidData, ErrorCode.None, ErrorCode.OtherError}
 */
const validTmntData = (tmnt: tmntType): ErrorCode => { 

  try {           
    if (!tmnt) return ErrorCode.InvalidData    
    if (!isValidBtDbId(tmnt.id, 'tmt')) {
      return ErrorCode.InvalidData
    }
    if (!validTmntName(tmnt.tmnt_name)) {
      return ErrorCode.InvalidData
    }
    if (!validTmntDates(tmnt.start_date, tmnt.end_date)) {
      return ErrorCode.InvalidData
    }
    if (!validTmntFkId(tmnt.bowl_id, 'bwl')) {
      return ErrorCode.InvalidData
    }
    if (!validTmntFkId(tmnt.user_id, 'usr')) {
      return ErrorCode.InvalidData
    }
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError
  }
}

/**
 * sanitizes tournament data - DOES NOT VALIDATE 
 * 
 * @param tmnt  - tournament data to sanitize
 * @returns tmnt object with sanitized data
 */
export const sanitizeTmnt = (tmnt: tmntType): tmntType => { 
  if (!tmnt) return null as any;
  const sanditizedTmnt: tmntType = {
    ...blankTmnt,      
    start_date: null as any,
    end_date: null as any
  }  
  if (isValidBtDbId(tmnt.id, 'tmt')) {
    sanditizedTmnt.id = tmnt.id
  }
  sanditizedTmnt.tmnt_name = sanitize(tmnt.tmnt_name) 
  if (typeof tmnt.start_date === 'string') {
    if (validDateString(tmnt.start_date)) {    
      sanditizedTmnt.start_date = startOfDayFromString(tmnt.start_date) as Date
    } 
  } else {
    if (isValid(tmnt.start_date)) {
      sanditizedTmnt.start_date = tmnt.start_date
    } 
  }

  if (typeof tmnt.end_date === 'string') {
    if (validDateString(tmnt.end_date)) {          
      sanditizedTmnt.end_date = startOfDayFromString(tmnt.end_date) as Date
    } 
  } else {
    if (isValid(tmnt.end_date)) {
      sanditizedTmnt.end_date = tmnt.end_date
    } 
  }
  if (isValidBtDbId(tmnt.bowl_id, 'bwl')) {    
    sanditizedTmnt.bowl_id = tmnt.bowl_id  
  } 
  if (isValidBtDbId(tmnt.user_id, 'usr')) {
    sanditizedTmnt.user_id = tmnt.user_id
  } 
  return sanditizedTmnt
}

/**
 * valildates a tournament data object
 * 
 * @param tmnt - tournament data to check
 * @returns - {ErrorCode.MissingData, ErrorCode.InvalidData, ErrorCode.None, ErrorCode.OtherError} 
 */
export const validateTmnt = (tmnt: tmntType): ErrorCode => { 

  try {
    const errCode = gotTmntData(tmnt)
    if (errCode !== ErrorCode.None) {
      return errCode
    }
    return validTmntData(tmnt)
  } catch (error) {
    return ErrorCode.OtherError
  }
}

export const exportedForTesting = {
  gotTmntData,
  validTmntData 
}