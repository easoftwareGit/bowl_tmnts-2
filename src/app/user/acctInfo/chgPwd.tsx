"use client";

import React, { ChangeEvent, useState } from "react";
import Image from "next/image";
import { isPassword8to20 } from "@/lib/validation/validation";
import type { acctUserType } from "@/lib/types/types";
import { changePassword } from "@/lib/db/users/dbUsers";
import { initModalObj } from "@/components/modal/modalObjType";
import ErrorModalMsg from "@/components/modal/errorModal";

const blankValues = {
  current: "",
  new: "",
  confirm: "",
};

const invalidFormatMsg =
  "Password not in a valid format: at least 1 lower case, 1 UPPER case, 1 digit, 1 special character, 8 to 20 characters long";
const currentIncorrectMsg = "Current Password is incorrect";
// the route's lock message ends with the number of minutes, so match the start
const lockedMsgStart = "Too many attempts";
const defaultFailMsg = "Cannot update new password.";
const noPasswordMsg =
  "This account signs in without a password, so there is no password to change.";

interface ChildProps {
  user: acctUserType;
  setInfoType: (infoType: string) => void;
}

const ChangePassword: React.FC<ChildProps> = ({ user, setInfoType }) => {
  const [pwdData, setPwdData] = useState(blankValues);
  const [formErrors, setFormErrors] = useState(blankValues);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errModalObj, setErrModalObj] = useState(initModalObj);
  const [saving, setSaving] = useState(false);

  const validUserData = (): boolean => {
    const errors = {
      current: "",
      new: "",
      confirm: "",
    };
    let isValid = true;

    // current
    if (!pwdData.current.trim()) {
      errors.current = "Current Password is required";
      isValid = false;
    } else if (!isPassword8to20(pwdData.current)) {
      errors.current = invalidFormatMsg;
      isValid = false;
    }

    // new
    if (!pwdData.new.trim()) {
      errors.new = "New Password is required";
      isValid = false;
    } else if (!isPassword8to20(pwdData.new)) {
      errors.new = invalidFormatMsg;
      isValid = false;
    } else if (pwdData.new === pwdData.current) {
      errors.new = "New Password cannot be the same as Current Password";
      isValid = false;
    }

    // confirm
    if (!pwdData.confirm.trim()) {
      errors.confirm = "Confirm Password is required";
      isValid = false;
    } else if (!isPassword8to20(pwdData.confirm)) {
      errors.confirm = invalidFormatMsg;
      isValid = false;
    } else if (pwdData.new !== pwdData.confirm) {
      errors.confirm = "New and Confirm Passwords do not match";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleAcctInfoClick = () => {
    setInfoType("AcctInfo");
  };

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

  const canceledModalErr = () => {
    const gotoAcctInfo = errModalObj.id === "success";
    setErrModalObj(initModalObj); // reset modal object (hides modal)
    if (gotoAcctInfo) setInfoType("AcctInfo");
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

  const showFailModal = (message: string) => {
    setErrModalObj({
      show: true,
      title: "Update Password Failed",
      message,
      id: "fail",
    });
  };

  const updatePassword = async () => {
    setSaving(true);
    try {
      const result = await changePassword(
        user.id,
        pwdData.current,
        pwdData.new
      );

      if (result.success) {
        setErrModalObj({
          show: true,
          title: "Update Password Success",
          message: "Successfully updated password.",
          id: "success",
        });
        return;
      }

      // wrong current password, or too many wrong tries (account locked):
      // show it on the Current Password field
      if (
        result.error === currentIncorrectMsg ||
        result.error?.startsWith(lockedMsgStart)
      ) {
        const currentError = result.error;
        setFormErrors((prev) => ({ ...prev, current: currentError }));
        return;
      }

      showFailModal(result.error ?? defaultFailMsg);
    } catch {
      // network / server error
      showFailModal(defaultFailMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateClick = async () => {
    if (saving) return; // ignore double clicks while a request is in flight
    if (validUserData()) {
      await updatePassword();
    }
  };

  // e.g. a Google login: nothing to change, so don't show the form
  if (!user.has_password) {
    return (
      <div className="form_container">
        <div className="row g-3 mb-1">
          <h5>{user.first_name + " " + user.last_name}</h5>
        </div>
        <div className="row g-3 mb-3">
          <div className="col-12" data-testid="noPasswordMsg">
            {noPasswordMsg}
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
        </div>
      </div>
    );
  }

  return (
    <>
      <ErrorModalMsg
        show={errModalObj.show}
        title={errModalObj.title}
        message={errModalObj.message}
        onCancel={canceledModalErr}
      />
      <div className="form_container">
        <div className="row g-3 mb-1">
          <h5>{user.first_name + " " + user.last_name}</h5>
        </div>
        <div className="row g-3 mb-2">
          <div className="col-12">
            <label className="form-label" htmlFor="inputCurrent">
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
                data-testid="inputCurrent"
              />
              <button
                className="btn border border-start-0 rounded-end"
                type="button"
                onClick={toggleCurrentVisibility}
                tabIndex={-1}
                aria-label="Toggle current password visibility"
              >
                {showCurrent ? (
                  <Image
                    src="/eye-slash.svg"
                    alt="hide"
                    width="22"
                    height="22"
                  />
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
            <label className="form-label" htmlFor="inputNew">
              New Password
            </label>
            <div className="input-group">
              <input
                type={showNew ? "text" : "password"}
                className={`form-control ${formErrors.new && "is-invalid"}`}
                id="inputNew"
                name="new"
                value={pwdData.new}
                onChange={handleInputChange}
                data-testid="inputNew"
              />
              <button
                className="btn border border-start-0 rounded-end"
                type="button"
                onClick={toggleNewVisibility}
                tabIndex={-1}
                aria-label="Toggle new password visibility"
              >
                {showNew ? (
                  <Image
                    src="/eye-slash.svg"
                    alt="hide"
                    width="22"
                    height="22"
                  />
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
            <label className="form-label" htmlFor="inputConfirm">
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
                data-testid="inputConfirm"
              />
              <button
                className="btn border border-start-0 rounded-end"
                type="button"
                onClick={toggleConfirmVisibility}
                tabIndex={-1}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? (
                  <Image
                    src="/eye-slash.svg"
                    alt="hide"
                    width="22"
                    height="22"
                  />
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
                onClick={handleUpdateClick}
                disabled={saving}
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
  );
};

export default ChangePassword;
