import React, { useEffect, useState, ChangeEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { fetchBowls, getBowlsSaveStatus, getBowlsError, getBowlsLoadStatus, saveBowl, selectAllBowls, resetSaveStatus } from "@/redux/features/bowls/bowlsSlice";

import "./form.css";
import { initBowl } from "@/lib/db/initVals";

export const Form14: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => { 
    dispatch(fetchBowls());
  }, [dispatch]);

  const bowlsLoadStatus = useSelector(getBowlsLoadStatus);
  const bowlsSaveStatus = useSelector(getBowlsSaveStatus);
  const bowlsError = useSelector(getBowlsError);  

  const bowls = useSelector(selectAllBowls);

  const [editBowl, setEditBowl] = useState({...initBowl});

  const handleNewClick = () => {
    setEditBowl(initBowl);
  }

  const handleEditClick = (id: string) => { 
    const toEdit = bowls.find((bowl) => bowl.id === id);
    if (toEdit) {
      setEditBowl(toEdit);
    }
  }

  const handleSaveClick = () => {
    dispatch(saveBowl(editBowl));
  }

  const handleOkClick = () => {
    dispatch(resetSaveStatus());
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const updatedBowl = {
      ...editBowl,
      [name]: value
    }
    setEditBowl(updatedBowl);
  }    

  return (
    <>      
      {(bowlsLoadStatus === 'loading') && <div>Loading...</div>}
      {bowlsLoadStatus !== 'loading' && bowlsError
        ? (<div>Error: {bowlsError}</div>
        ) : null}
      {(bowlsLoadStatus === 'succeeded') ? ( 
        <div className="container">
          <div className="row g-3 mb-3 justify-content-md-center align-items-center">      
            <div className="col-md-auto">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleNewClick}
              >
                New
              </button>
            </div>
          </div>
          <div className="row g-1 mb-1 justify-content-md-center align-items-center">                  
            <div className="flex-grow-1 bg-secondary-subtle"></div>
            {/* style width is in pixels */}
            <div
              className="d-flex justify-content-center tmnt_table bg-primary-subtle"
              // style={{ width: 768 }}              
            >
              <table className="table table-striped table-hover w-100">
                <thead>
                  <tr className="tmnts-header-row">
                    <th style={{ width: 200 }}>
                      Bowl Name
                    </th>
                    <th style={{ width: 100 }}>
                      City
                    </th>
                    <th className="align-middle" style={{ width: 80, textAlign: "center" }}>
                      State
                    </th>
                    <th style={{ width: 150 }}>
                      URL
                    </th>
                    <th className="align-middle" style={{ width: 200, textAlign: "center" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bowls.map((bowl) => (
                    <tr key={bowl.id}>
                      <td>{bowl.bowl_name}</td>
                      <td>{bowl.city}</td>
                      <td style={{ textAlign: "center" }}>{bowl.state}</td>
                      <td>{bowl.url}</td>
                      <td className="align-middle" style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => handleEditClick(bowl.id)}
                        >
                          Edit
                        </button>&nbsp;&nbsp;
                        <button
                          type="button"
                          className="btn btn-danger"                          
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>  
          <div className="row g-1 mb-1 justify-content-md-center align-items-center">
            <div className="col-md-2">
              <label htmlFor="inputBowlName" className="form-label">
                Bowl Name
              </label>
            </div>    
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                id="inputBowlName"
                name="bowl_name"
                value={editBowl.bowl_name}
                onChange={handleInputChange}
              />              
            </div>    
          </div>
          <div className="row g-1 mb-1 justify-content-md-center align-items-center">
            <div className="col-md-2">
              <label htmlFor="inputCity" className="form-label">
                City
              </label>
            </div>    
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                id="inputCity"
                name="city"
                value={editBowl.city}
                onChange={handleInputChange}
              />              
            </div>    
          </div>
          <div className="row g-1 mb-1 justify-content-md-center align-items-center">
            <div className="col-md-2">
              <label htmlFor="inputState" className="form-label">
                State
              </label>
            </div>    
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                id="inputState"
                name="state"
                value={editBowl.state}
                onChange={handleInputChange}
              />              
            </div>    
          </div>
          <div className="row g-1 mb-1 justify-content-md-center align-items-center">
            <div className="col-md-2">
              <label htmlFor="inputUrl" className="form-label">
                URL
              </label>
            </div>    
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                id="inputUrl"
                name="url"
                value={editBowl.url}
                onChange={handleInputChange}
              />              
            </div>    
          </div>
          <div className="row g-3 mb-3 justify-content-md-center align-items-center">      
            <div className="col-md-auto">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSaveClick}
              >
                Save
              </button>
            </div>
          </div>
          {(bowlsSaveStatus === 'succeeded') ? ( 
            <div className="row g-3 mb-3 justify-content-md-center align-items-center">      
              <div className="col-md-3">
                Bowl data saved!
              </div>
              <div className="col-md-auto">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleOkClick}
                >
                  OK
                </button>
              </div>
            </div>
          ) : null}        
        </div>
      ) : null}
    </>
  );
}