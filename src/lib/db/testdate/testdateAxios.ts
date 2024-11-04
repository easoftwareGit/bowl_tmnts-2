import axios from "axios";
import { baseApi } from "@/lib/tools";
import { testDate } from "@prisma/client";

const url = baseApi + "/testdate";

/**
 * get array of test dates
 *
 * NOTE:
 * Do not use try / catch blocks here. Need the promise to be fulfilled
 * or rejected in /src/redux/features/bowls/bowlsSlice.tsx
 * which will have the appropriate response in the extraReducers.
 *
 * @returns { data: testDate[] } - array of test dates;
 */

export const getTestDates = async (): Promise<testDate[]> => {  
  const response = await axios.get(url);  
  return (!response || response.status !== 200) 
    ? []
    : response.data.testDates;
};
