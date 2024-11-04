import { prisma } from "@/lib/prisma";

/**
 * finds one testDate by searching for a matching testDate id
 *
 * @param {id} - testDate id
 * @return {Object|null} Object = testDate's data; mull = testDate not found
 */
export async function findTestDateById(id: number) {
  try {
    // validate the id as a number
    const validId = (id: number): boolean => {
      return (!isNaN(id) || !(Number.isInteger(id)) || id < 1 || id > Number.MAX_SAFE_INTEGER)
    }
    
    if (!validId(id)) { 
      return null;
    }
    // find testDate in database by matching id
    const testDate = await prisma.testDate.findUnique({
      where: {
        id: id,
      },
    });    
    return (testDate) ? testDate : null;
  } catch (error) {
    throw Error('error finding testDate')
  }
}
