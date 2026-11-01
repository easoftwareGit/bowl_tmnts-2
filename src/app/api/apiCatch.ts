import { NextResponse } from "next/server";

/**
 * Returns error status based on error code
 * 
 * @param {string | undefined} code - error code
 * @returns {number} - error status 
 */
export const getErrorStatus = (code?: string): number => { 
  switch (code) {
    case "P2002": // unique constraint
      return 409;        
    case "P2003": // foreign key constraint
      return 409;        
    case "P2025": // record not found
      return 404;        
    default:
      return 500;        
  }
}

/**
 * Returns additional error message based on error code
 * 
 * @param {string | undefined} code - error code
 * @returns {string} - additional error message
 */
export const additionalErrorMsg = (code?: string): string => {
  switch (code) {
    case "P2002": // unique constraint
      return "Unique constraint violation";
    case "P2003": // foreign key constraint
      return "Foreign key constraint violation";        
    case "P2025": // record not found
      return "Record not found";
    default:
      return "Unknown error";
  }  
}

/**
 * Returns error message and status
 * 
 * @param {unknown} err - error returned by prisma
 * @param {string} errMsg - error message to return 
 * @returns {NextResponse} - error message and status
 */
export const standardCatchReturn = (err: unknown, errMsg: string): NextResponse => { 
  let code: string | undefined;
  let message: string | undefined;
  if (err && typeof err === "object") {
    if ("code" in err && typeof err.code === "string") {
      code = err.code; // no cast needed, already narrowed
    }
    if ("message" in err && typeof err.message === "string") {
      message = err.message;
    }
  }

  const errStatus = getErrorStatus(code)
  if (message) {
    errMsg = `${errMsg} - ${message}`;
  }
  return NextResponse.json(
    { message: errMsg },
    { status: errStatus }  );
}
