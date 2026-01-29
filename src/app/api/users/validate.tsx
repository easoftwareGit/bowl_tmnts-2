import { ErrorCode, maxFirstNameLength, maxLastNameLength, isEmail, isPassword8to20, isValidBtDbId, isValidRole, isValidName } from "@/lib/validation/validation";
import { sanitize } from "@/lib/validation/sanitize";
import { userType } from "@/lib/types/types";
import { phone as phoneChecking } from "phone";
import { blankUser } from "@/lib/db/initVals";
import { cloneDeep } from "lodash";

const validRoles = ["ADMIN", "DIRECTOR", "USER"]

/**
 * checks for required data and returns error code if missing 
 *  
 * @param user - user data to check 
 * @param checkPhone - true if need to check phone 
 * @param checkPass - true if need to check password
 * @returns - {ErrorCode.MISSING_DATA, ErrorCode.NONE, ErrorCode.OtherError}
 */
const gotUserData = (user: userType, checkPhone: boolean, checkPass: boolean): ErrorCode => {
  try {
    if (!user 
        || !(user.id)
        || !sanitize(user.first_name)
        || !sanitize(user.last_name)
        || !(user.email)
        || !(user.role))
    {
      return ErrorCode.MISSING_DATA
    }
    if (checkPhone && !user.phone) {      
      return ErrorCode.MISSING_DATA
    }
    if (checkPass && !user.password) {
      return ErrorCode.MISSING_DATA
    }
    return ErrorCode.NONE
  } catch (error) {
    return ErrorCode.OTHER_ERROR
  }
}

export const validUserFirstName = (firstName: string): boolean => {  
  return isValidName(firstName, maxFirstNameLength)
}
export const validUserLastName = (lastName: string): boolean => {  
  return isValidName(lastName, maxLastNameLength)
}
export const validUserEmail = (email: string): boolean => {  
  if (!email) return false
  return (isEmail.length > 0 && isEmail(email))
}
export const validUserPhone = (phone: string): boolean => {
  if (!phone) return false
  return (phone.length > 0 && phoneChecking(phone).isValid)
}
export const validUserPassword = (password: string): boolean => {
  if (!password) return false
  return (password.length > 0 && isPassword8to20(password))
}

/**
 * checks if user data is valid
 * 
 * @param {userType} user - user data to check
 * @param {boolean} checkPhone - true if need to check phone 
 * @param {boolean} checkPass - true if need to check password
 * @returns {ErrorCode} - ErrorCode.NONE: user data is valid, 
 *    ErrorCode.INVALID_DATA: user data is invalid
 *    ErrorCode.OtherError: unknown error
 */
const validUserData = (user: userType, checkPhone: boolean, checkPass: boolean): ErrorCode => {
  
  try {
    if (!user) return ErrorCode.INVALID_DATA
    if (!isValidBtDbId(user.id, 'usr')) {
      return ErrorCode.INVALID_DATA
    }
    if (!validUserFirstName(user.first_name)) {
      return ErrorCode.INVALID_DATA
    }
    if (!validUserLastName(user.last_name)) {
      return ErrorCode.INVALID_DATA
    }
    if (!validUserEmail(user.email)) {
      return ErrorCode.INVALID_DATA
    }
    if (checkPhone && !validUserPhone(user.phone)) {
      return ErrorCode.INVALID_DATA
    }
    if (checkPass && !validUserPassword(user.password)) {
      return ErrorCode.INVALID_DATA
    }    
    if (!isValidRole(user.role)) {
      return ErrorCode.INVALID_DATA
    }
    return ErrorCode.NONE
  } catch (error) {
    return ErrorCode.OTHER_ERROR
  }
}

/**
 * sanitizes user data to replace unwanted characters and format phone
 * 
 * @param user - user data to scrub
 * @returns - sanitized user: 
 *  - sanitized first & last name
 *  - phone in correct format (not validated, just format OK) 
 */
export const sanitizeUser = (user: userType): userType => {
  if (!user) return null as any;  
  const sanitizedUser: userType = cloneDeep(blankUser)
  if
    (isValidBtDbId(user.id, 'usr')) {
    sanitizedUser.id = user.id
  }  
  sanitizedUser.first_name = sanitize(user.first_name)
  sanitizedUser.last_name = sanitize(user.last_name)
  if (isEmail(user.email)) {
    sanitizedUser.email = user.email
  }
  if (user.phone) {
    const phoneCheck = phoneChecking(user.phone); 
    if (phoneCheck.isValid) { 
      sanitizedUser.phone = phoneCheck.phoneNumber
    }  
  }
  if (user.password) {
    if (isPassword8to20(user.password)) {
      // DO NOT SANITIZE
      sanitizedUser.password = user.password
    }    
  }
  if (isValidRole(user.role)) {
    sanitizedUser.role = user.role
  }
  return sanitizedUser
}

/**
 * valildates a user data object
 * 
 * @param user - user data to check
 * @param checkPhone - true if need to check phone 
 * @param checkPass - true if need to check password
 * @returns - {ErrorCode.MISSING_DATA, ErrorCode.INVALID_DATA, ErrorCode.NONE, ErrorCode.OtherError} 
 */
export function validateUser(user: userType, checkPhone: boolean, checkPass: boolean): ErrorCode { 
  
  try {
    const errCode = gotUserData(user, checkPhone, checkPass)
    if (errCode !== ErrorCode.NONE) {
      return errCode
    }
    return validUserData(user, checkPhone, checkPass)
  } catch (error) {
    return ErrorCode.OTHER_ERROR
  }
}

export const exportedForTesting = {
  gotUserData,
  validUserData 
}