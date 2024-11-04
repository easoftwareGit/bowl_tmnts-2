"use cliemt";
import { useState, ChangeEvent, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchBowls,
  selectAllBowls,
  getBowlsLoadStatus,
  getBowlsError,
} from "@/redux/features/bowls/bowlsSlice";
import { maxTmntNameLength } from "@/lib/validation";
import { initTmnt } from "@/lib/db/initVals";

const Form9 = () => {
  
  const [tmnt, setTmnt] = useState(initTmnt);
  const dispatch = useDispatch<AppDispatch>();
  const bowlsStatus = useSelector(getBowlsLoadStatus);
  const bowls = useSelector(selectAllBowls);
  const bowlsError = useSelector(getBowlsError);

  useEffect(() => {
    dispatch(fetchBowls());
  }, [dispatch]);

  return (
    <>
      <form>
        <h2>Form 9</h2>
        {bowlsStatus === "loading" && <div>Loading...</div>}
        {bowlsStatus !== "loading" && bowlsError ? (
          <div>Error: {bowlsError}</div>
        ) : null}
        {bowlsStatus === "succeeded" ? (
          <div className="form_container">
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label htmlFor="inputTmntName" className="form-label">
                  Tournament Name
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    tmnt.tmnt_name_err && "is-invalid"
                  }`}
                  id="inputTmntName"
                  name="tmnt_name"
                  value={tmnt.tmnt_name}
                  maxLength={maxTmntNameLength}
                />
              </div>
            </div>          
            <table className="table table-striped table-hover w-100">
              <thead>
                <tr>
                  <th className="align-left" style={{ width: 300 }}>
                    Bowl Name
                  </th>
                  <th className="align-left" style={{ width: 200 }}>
                    City
                  </th>
                  <th className="align-left" style={{ width: 100 }}>
                    State
                  </th>
                  <th className="align-left" style={{ width: 300 }}>
                    URL
                  </th>
                </tr>
              </thead>
              <tbody>
                {bowls.map((bowl) => (
                  <tr key={bowl.id}>
                    <td className="align-left">{bowl.bowl_name}</td>
                    <td className="align-left">{bowl.city}</td>
                    <td className="align-left">{bowl.state}</td>
                    <td className="align-left">{bowl.url}</td>
                  </tr>
                ))}
              </tbody>
            </table>              
          </div>
        ) : null}
      </form>
    </>
  );
};

export default Form9;