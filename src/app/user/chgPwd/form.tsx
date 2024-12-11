"use client";
import React, { ChangeEvent, useState } from 'react'
import Image from "next/image";
import { isPassword8to20 } from '@/lib/validation';
import { userType } from '@/lib/types/types';

const blankValues = {
  current: '',
  new: '',
  confirm: ''
}

interface ChildProps { 
  user: userType
}

const ChangePasswordForm: React.FC<ChildProps> = ({ user }) => {
  
  const [pwdData, setPwdData] = useState(blankValues);
  const [formErrors, setFormErrors] = useState(blankValues);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validUserData = async (): Promise<boolean> => {
    const errors = {
      current: "",
      new: "",
      confirm: "",      
    }
    let isValid = true; 

    // current   
    if (!pwdData.current.trim()) {
      errors.current = 'Current Password is required';
      isValid = false;
    } else if (!isPassword8to20(pwdData.current)) {
      errors.current =
        "Password not in a valid format: at least 1 lower case, 1 UPPER case, 1 digit, 1 special character, 8 to 20 charaters long";
      isValid = false;
    } else {
      errors.current = '';
    }

    // new   
    if (!pwdData.current.trim()) {
      errors.new = 'New Password is required';
      isValid = false;
    } else if (!isPassword8to20(pwdData.new)) {
      errors.new =
        "Password not in a valid format: at least 1 lower case, 1 UPPER case, 1 digit, 1 special character, 8 to 20 charaters long";
      isValid = false;
    } else if (pwdData.new === pwdData.current) {
      errors.new = 'New Password cannot be the same as Current Password';
      isValid = false;
    } else {
      errors.new = '';
    }

    // confirm 
    if (!pwdData.confirm.trim()) {
      errors.confirm = 'Confirm Password is required';
      isValid = false;
    } else if (!isPassword8to20(pwdData.confirm)) {
      errors.confirm =
        "Password not in a valid format: at least 1 lower case, 1 UPPER case, 1 digit, 1 special character, 8 to 20 charaters long";
      isValid = false;
    } else if (pwdData.new !== pwdData.confirm) {
      errors.confirm = 'New and Confirm Passwords do not match';
      isValid = false;    
    } else {
      errors.confirm = '';
    }
    
    setFormErrors(errors);
    return isValid;
  }


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPwdData({
      ...pwdData,
      [name]: value,
    });
    setFormErrors({
      ...formErrors,
      [name]: "",
    });
  };

  const toggleCurrentVisibility = () => {
    setShowCurrent(!showCurrent);
  };

  const toggleNewVisibility = () => {
    setShowNew(!showNew);
  };

  const toggleConfirmVisibility = () => {
    setShowConfirm(!showConfirm);
  };

  return (
    <div className="form_container">
      <div className="row g-3 mb-3">
        <div className="col-12">
          <label
            className="form-label"
            htmlFor="current"
          >
            Current Password
          </label>
          <div className="input-group">
            <input
              type={showCurrent ? "text" : "password"}
              className={`form-control ${
                formErrors.current && "is-invalid"
              }`}
              id="inputCurrent"
              name="current"
              value={pwdData.current}
              onChange={handleInputChange}
            />
            <button
              className="btn border border-start-0 rounded-end"
              type="button"
              onClick={toggleCurrentVisibility}
              tabIndex={-1}
            >
              {showCurrent ? (
                <Image src="/eye-slash.svg" alt="hide" width="22" height="22" />
              ) : (
                <Image src="/eye.svg" alt="show" width="22" height="22" />
              )}
            </button>
          </div>
          <div className="text-danger">{formErrors.current}</div>
        </div>
      </div>
      <div className="row g-3 mb-3">
        <div className="col-12">
          <label
            className="form-label"
            htmlFor="new"
          >
            New Password
          </label>
          <div className="input-group">
            <input
              type={showNew ? "text" : "password"}
              className={`form-control ${
                formErrors.new && "is-invalid"
              }`}
              id="inputNew"
              name="new"
              value={pwdData.new}
              onChange={handleInputChange}
            />
            <button
              className="btn border border-start-0 rounded-end"
              type="button"
              onClick={toggleNewVisibility}
              tabIndex={-1}
            >
              {showNew ? (
                <Image src="/eye-slash.svg" alt="hide" width="22" height="22" />
              ) : (
                <Image src="/eye.svg" alt="show" width="22" height="22" />
              )}
            </button>
          </div>
          <div className="text-danger">{formErrors.new}</div>
        </div>
      </div>
      <div className="row g-3 mb-3">
        <div className="col-12">
          <label
            className="form-label"
            htmlFor="confirm"
          >
            Confirm Password
          </label>
          <div className="input-group">
            <input
              type={showConfirm ? "text" : "password"}
              className={`form-control ${
                formErrors.confirm && "is-invalid"
              }`}
              id="inputConfirm"
              name="confirm"
              value={pwdData.confirm}
              onChange={handleInputChange}
            />
            <button
              className="btn border border-start-0 rounded-end"
              type="button"
              onClick={toggleConfirmVisibility}
              tabIndex={-1}
            >
              {showNew ? (
                <Image src="/eye-slash.svg" alt="hide" width="22" height="22" />
              ) : (
                <Image src="/eye.svg" alt="show" width="22" height="22" />
              )}
            </button>
          </div>
          <div className="text-danger">{formErrors.confirm}</div>
        </div>
      </div>
      <div className="row g-3">
        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button
            type="submit"
            className="btn btn-success"
            // onClick={saveButtonClick}
          >
            Update
          </button>
          <button
            type="reset"
            className="btn btn-danger"
            // onClick={handleCancelClick}
          >
            Cancel
          </button>
        </div>
      </div>
    </div> 
  )
}

export default ChangePasswordForm;