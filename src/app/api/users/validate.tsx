import { ErrorCode, maxFirstNameLength, maxLastNameLength, isEmail, isPassword8to20, isValidBtDbId, isValidRole } from "@/lib/validation";
import { sanitize } from "@/lib/sanitize";
import { userType } from "@/lib/types/types";
import { phone as phoneChecking } from "phone";
import { blankUser } from "@/lib/db/initVals";

const validRoles = ["ADMIN", "DIRECTOR", "USER"]

/**
 * checks for required data and returns error code if missing 
 *  
 * @param user - user data to check 
 * @param checkPhone - true if need to check phone 
 * @param checkPass - true if need to check password
 * @returns - {ErrorCode.MissingData, ErrorCode.None, ErrorCode.OtherError}
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
      return ErrorCode.MissingData
    }
    if (checkPhone && !user.phone) {      
        return ErrorCode.MissingData
    }
    if (checkPass && !user.password) {
      return ErrorCode.MissingData
    }
    return ErrorCode.None
  } catch (error) {
    return ErrorCode.OtherError
  }
}

export const validUserFirstName = (firstName: string): boolean => {  
  const sanitized = sanitize(firstName);  
  return (sanitized.length > 0 && sanitized.length <= maxFirstNameLength)
}
export const validUserLastName = (lastName: string): boolean => {  
  const sanitized = sanitize(lastName);
  return (sanitized.length > 0 && sanitized.length <= maxLastNameLength)  
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
 * @param user - user data to check
 * @param checkPhone - true if need to check phone 
 * @param checkPass - true if need to check password
 * @returns - {ErrorCode.InvalidData, ErrorCode.None, ErrorCode.OtherError}
 */
const validUserData = (user: userType, checkPhone: boolean, checkPass: boolean): ErrorCode => {
  
  try {
    if (!user) return ErrorCode.InvalidData
    if (!isValidBtDbId(user.id, 'usr')) {
      return ErrorCode.InvalidData
    }
    if (!validUserFirstName(user.first_name)) {
      return ErrorCode.InvalidData
    }
    if (!validUserLastName(user.last_name)) {
      return ErrorCode.InvalidData
    }
    if (!validUserEmail(user.email)) {
      return ErrorCode.InvalidData
    }
    if (checkPhone && !validUserPhone(user.phone)) {
      return ErrorCode.InvalidData
    }
    if (checkPass && !validUserPassword(user.password)) {
      return ErrorCode.InvalidData
    }    
    if (!isValidRole(user.role)) {
      return ErrorCode.InvalidData
    }
    return ErrorCode.None
  } catch (error) {
    return ErrorCode.OtherError
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
  const sanitizedUser: userType = { ...blankUser }
  if (isValidBtDbId(user.id, 'usr')) {
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
 * @returns - {ErrorCode.MissingData, ErrorCode.InvalidData, ErrorCode.None, ErrorCode.OtherError} 
 */
export function validateUser(user: userType, checkPhone: boolean, checkPass: boolean): ErrorCode { 
  
  try {
    const errCode = gotUserData(user, checkPhone, checkPass)
    if (errCode !== ErrorCode.None) {
      return errCode
    }
    return validUserData(user, checkPhone, checkPass)
  } catch (error) {
    return ErrorCode.OtherError
  }
}

export const exportedForTesting = {
  gotUserData,
  validUserData 
}