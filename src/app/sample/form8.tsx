import React, { useState, ChangeEvent } from "react";
import { postTmnt } from "@/lib/db/tmnts/tmntsAxios";

import './form.css';

export const Form8: React.FC = () => { 

  const initVals = {
    first: '',
    last: '',
    email: '',
    phone: '',
    employee: true,
  }

  const [vals, setVals] = useState(initVals);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    if (name === "employee") {
      setVals({
        ...vals,
        [name]: checked
      })
    } else {
      setVals({
        ...vals,
        [name]: value
      });
    }
  }

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const posted = await postTmnt(vals as any);
    if (!posted) {
      alert("User not saved!");
    }
  }

  return (
    <>
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label htmlFor="inputFirst" className='form-label'>First</label>
          <input
            type="text"
            className="form-control"
            id="inputFirst"
            name="first"
            value={vals.first}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="inputLast" className='form-label'>Last</label>
          <input
            type="text"
            className="form-control"
            id="inputLast"
            name="last"
            value={vals.last}
            onChange={handleChange} 
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="inputEmail" className='form-label'>Email</label>
          <input
            type="text"
            className="form-control"
            id="inputEmail"
            name="email"
            value={vals.email}
            onChange={handleChange} 
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="inputPhone" className='form-label'>Phone</label>
          <input
            type="text"
            className="form-control"
            id="inputPhone"
            name="phone"
            value={vals.phone}
            onChange={handleChange} 
          />
        </div>
      </div>                    
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <h6> </h6>
          <input
            type="checkbox"
            className="form-check-input"
            id={`checkBoxEmployee`}  
            name='employee'
            checked={vals.employee}
            onChange={handleChange}            
          />
          <label htmlFor={`checkBoxEmployee`} className="form-label">
            &nbsp;Employee
          </label>
        </div>

        <div className="col-md-3">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </>
  )
}