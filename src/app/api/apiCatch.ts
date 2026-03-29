import { NextResponse } from "next/server";

/**
 * Returns error status based on error code
 * 
 * @param {string | undefined} code - error code
 * @returns {number} - error status 
 */
export const getErrorStatus = (code?: string) => { 
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
 * Returns error message and status
 * 
 * @param {unknown} err - error returned by prisma
 * @param {string} errMsg - error message to return 
 * @returns {NextResponse} - error message and status
 */
export const standardCatchReturn = (err: unknown, errMsg: string): NextResponse => { 
  let code: string | undefined;
  if (
    err &&
    typeof err === "object" &&
    "code" in err &&
    typeof err.code === "string"
  ) {
    code = (err as any).code;
  }  
	const errStatus = getErrorStatus(code)
	return NextResponse.json(
    { message: errMsg },
    { status: errStatus }
  );
}
