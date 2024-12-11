"use client";
import React, { ChangeEvent, useState } from 'react'
import Image from "next/image";
import { isPassword8to20 } from '@/lib/validation';
import { userType } from '@/lib/types/types';
import { compare } from "bcrypt";
import { doHash } from '@/lib/hash';
import { patchUser } from '@/lib/db/users/dbUsers';
import { initModalObj } from '@/components/modal/modalObjType';
import ModalErrorMsg from '@/components/modal/errorModal';

const blankValues = {
  current: '',
  new: '',
  confirm: ''
}

interface ChildProps { 
  user: userType,
  infoType: string
  setInfoType: (infoType: string) => void
}

const ChangePassword: React.FC<ChildProps> = ({
  user,
  infoType,
  setInfoType
}) => {
 
  const [pwdData, setPwdData] = useState(blankValues);
  const [formErrors, setFormErrors] = useState(blankValues);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errModalObj, setErrModalObj] = useState(initModalObj);

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
    
    // compare current password to hashed password 
    if (isValid) { 
      // const hashedCurrent = await doHash(pwdData.current);      
      const isCurrentValid = false
      // const isCurrentValid = (hashedCurrent === user.password_hash);
      // const isCurrentValid = await compare(hashedCurrent, user.password_hash);
      if (!isCurrentValid) {
        errors.current = 'Current Password is incorrect';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  }

  const handleAcctInfoClick = async () => {
    setInfoType('AcctInfo');
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

  // const canceledModalErr = () => {
  //   setErrModalObj(initModalObj); // reset modal object (hides modal)
  // };

  const toggleCurrentVisibility = () => {
    setShowCurrent(!showCurrent);
  };

  const toggleNewVisibility = () => {
    setShowNew(!showNew);
  };

  const toggleConfirmVisibility = () => {
    setShowConfirm(!showConfirm);
  };

  // const updatePassword = async () => { 
  //   // patch user
  //   const dataToPatch = {
  //     id: user.id,
  //     password_hash: await doHash(pwdData.new)
  //   }
  //   const patchedUser = await patchUser(dataToPatch);
  //   if (!patchedUser) {
  //     setErrModalObj({
  //       show: true,
  //       title: 'Update Password Failed',
  //       message: `Cannot update new password.`,
  //       id: initModalObj.id
  //     })   
  //   } else { 
  //     setInfoType('AcctInfo');
  //   }
  // }

  const handleUpdateClick = async () => {
    const isValid = await validUserData();
    if (isValid) {
      // update password
    }
  }

  return (
    <>
      <ModalErrorMsg
        show={errModalObj.show}
        title={errModalObj.title}
        message={errModalObj.message}   
        // onCancel={canceledModalErr}
      />        
      <div className="form_container">
        <div className="row g-3 mb-1">
          <h5>{user.first_name + " " + user.last_name}</h5>
        </div>
        <div className="row g-3 mb-2">
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
        <div className="row g-3 mb-2">
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
          <div className="col-md-6">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAcctInfoClick}
            >
              Acct Info
            </button>
          </div>
          <div className="col-md-6">
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button
              type="button"
              className="btn btn-success"
              // onClick={handleUpdateClick}
            >
              Update
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleAcctInfoClick}
            >
              Cancel
            </button>
            </div>
          </div>
        </div>          
      </div> 
    </>
  )
}

export default ChangePassword;