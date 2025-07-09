export const getErrorStatus = (code: string) => { 
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
