"use client";
import { dateTo_MMddyyyy } from "@/lib/dateTools";
import { testDateType } from "@/lib/types/types";
import { FC, useState, useEffect } from "react";

interface TestDatesListProps {
  testDatesArr: testDateType[];
}

const TestDatesList: FC<TestDatesListProps> = (props) => {

  const { testDatesArr } = props; 
  const testdates: testDateType[] = [];
  testDatesArr.forEach((testdate) => {
    testdates.push({
      id: testdate.id,
      sod: new Date(testdate.sod),
      eod: new Date(testdate.eod),
      gmt: new Date(testdate.gmt),
    })  
  })
  const [allDates, setAllDates] = useState(testdates);

  useEffect(() => {
    setAllDates(testDatesArr);
  }, [testDatesArr]);

  return (
    <>
      <div className="d-flex bg-primary">
        <div className="flex-grow-1 bg-secondary-subtle"></div>
        <div
          className="d-flex justify-content-center tmnt_table bg-primary-subtle"
          style={{ width: 1100 }}
        >
          <table className="table table-striped table-hover w-100">
            <thead>
              <tr>
                <th className="align-middle" style={{ width: 30 }}>
                  ID
                </th>
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
                  <td>{testDate.id}</td>
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
      </div>
    </>
  );
};

export default TestDatesList;