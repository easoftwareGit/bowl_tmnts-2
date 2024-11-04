"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { testDateType } from "@/lib/types/types";
import { fetchTestDates } from "@/redux/features/testdates/testdatesSlice";

import "./form.css";
import { dateTo_MMddyyyy } from "@/lib/dateTools";
import TestDatesList from "./testdatesList";

export const Form10: React.FC = () => { 

  const dispatch = useDispatch<AppDispatch>();

  const initDates: testDateType[] = []
  // const [allDates, setAllDates] = useState(initDates);

  useEffect(() => {
    dispatch(fetchTestDates());    
  }, [dispatch]);

  const stateTestDates = useSelector((state: RootState) => state.testdates);
  const testDatesArr: testDateType[] = stateTestDates.testDates;
  
  return (
    <>
      <TestDatesList
        testDatesArr={testDatesArr}
      />
      {/* <div className="d-flex bg-primary">
        <div className="flex-grow-1 bg-secondary-subtle"></div>
        <div
          className="d-flex justify-content-center tmnt_table bg-primary-subtle"
          style={{ width: 1100 }}
        >
          <table className="table table-striped table-hover w-100">
            <thead>
              <tr>
                <th className="align-middle" style={{ width: 150 }}>
                  SOD MM//DD/YYYY
                </th>
                <th className="align-middle" style={{ width: 150 }}>
                  Start of Day
                </th>
                <th className="align-middle" style={{ width: 150 }}>
                  EOD MM//DD/YYYY
                </th>
                <th className="align-middle" style={{ width: 150 }}>
                  End of Day
                </th>
                <th className="align-middle" style={{ width: 150 }}>
                  GMT MM//DD/YYYY
                </th>
                <th className="align-middle" style={{ width: 150 }}>
                  GMT
                </th>
              </tr>
            </thead>
            <tbody>
              {allDates.map((testDate) => (
                <tr key={testDate.id}>
                  <td>{dateTo_MMddyyyy(testDate.sod)}</td>
                  <td>{testDate.sod.toString()}</td>
                  <td>{dateTo_MMddyyyy(testDate.eod)}</td>
                  <td>{testDate.eod.toString()}</td>
                  <td>{dateTo_MMddyyyy(testDate.gmt)}</td>
                  <td>{testDate.gmt.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex-grow-1 bg-secondary-subtle"></div>
      </div> */}
    </>
  )

}