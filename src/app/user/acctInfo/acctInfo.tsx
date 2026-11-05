import React, { ChangeEvent, useState } from "react";
import { isEmail } from "@/lib/validation/validation";
import {
  maxFirstNameLength,
  maxLastNameLength,
  maxEmailLength,
  maxPhoneLength,
} from "@/lib/validation/constants";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { phone } from "phone";
import { isEmailInUse, patchUser } from "@/lib/db/users/dbUsers";
import ErrorModalMsg, {
  cannotSaveTitle,
} from "@/components/modal/errorModal";
import { initModalObj } from "@/components/modal/modalObjType";
import type { acctUserType, userDataType } from "@/lib/types/types";

const savedAcctInfoTitle = "Saved Account Info";

// only directors and admins can change account information; other users
// see their account read-only (the PATCH route enforces this on the server)
const editRoles: userDataType["role"][] = ["DIRECTOR", "ADMIN"];
const readOnlyMsg =
  "Only directors and admins can change account information.";

interface ChildProps {
  user: acctUserType;
  setUser: (user: acctUserType) => void;
  origUserData: acctUserType;
  setInfoType: (infoType: string) => void;
}

const blankErrors = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
};

// emails are stored trimmed and in lower case
const normalizeEmail = (email: string) => email.trim().toLowerCase();

const AcctInfo: React.FC<ChildProps> = ({
  user,
  setUser,
  origUserData,
  setInfoType,
}) => {
  const { update } = useSession();

  const [formErrors, setFormErrors] = useState(blankErrors);
  const [errModalObj, setErrModalObj] = useState(initModalObj);

  const router = useRouter();

  const phoneRequired = origUserData.phone ? true : false;

  // the API sends has_password, never password_hash
  // (no password = e.g. a Google sign-in, nothing to change)
  const hasPassword = user.has_password === true;

  // use the role loaded from the database (origUserData), not the edited copy
  const canEdit = editRoles.includes(origUserData.role);

  const validUserData = async (): Promise<boolean> => {
    const errors = {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    };
    let isValid = true;

    // first name
    if (!user.first_name.trim()) {
      errors.first_name = "First Name is required";
      isValid = false;
    }

    // last name
    if (!user.last_name.trim()) {
      errors.last_name = "Last Name is required";
      isValid = false;
    }

    // email
    if (!user.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!isEmail(user.email)) {
      errors.email = "Email is not valid";
      isValid = false;
    }

    // phone
    // if phone is not required (google auth) and phone is blank, then ok
    if (phoneRequired || user.phone.trim()) {
      // else if entered phone, check if valid
      if (!user.phone.trim()) {
        errors.phone = "Phone is required";
        isValid = false;
      } else if (!phone(user.phone).isValid) {
        errors.phone = "Phone is not valid";
        isValid = false;
      }
    }

    // only check for a used email when it really changed; a change in case
    // or spaces only is the same email, and would find this user's own account
    if (
      isValid &&
      normalizeEmail(user.email) !== normalizeEmail(origUserData.email)
    ) {
      if (await isEmailInUse(user.email)) {
        errors.email = "Email already in use";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const canceledModalErr = () => {
    const saved = errModalObj.title === savedAcctInfoTitle;
    setErrModalObj(initModalObj); // reset modal object (hides modal)
    if (saved) {
      router.push("/"); // back to list of tournaments
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
    setFormErrors({
      ...formErrors,
      [name]: "",
    });
  };

  const handleChangePasswordClick = () => {
    setInfoType("Password");
  };

  const handleCancelClick = () => {
    router.push("/"); // back to home
  };

  const saveButtonClick = async () => {
    if (!canEdit) return;
    try {
      const dataValid = await validUserData();
      if (!dataValid) return;

      const dataToPatch: userDataType = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone, // validated above; blank is allowed only when not required
        role: user.role,
      };

      // save to the database first, so the session never gets ahead of the db
      const patchedUser = await patchUser(dataToPatch);
      if (!patchedUser) {
        throw new Error("patchUser did not return a user");
      }

      // db is saved; now update the session with what the db saved (the route
      // may have cleaned up the values). If this fails the account is still
      // saved, and the session catches up on the next sign-in, so it should
      // not be reported as a failed save.
      try {
        await update({
          first_name: patchedUser.first_name,
          last_name: patchedUser.last_name,
          email: patchedUser.email,
        });
      } catch {
        // intentionally ignored, see comment above
      }

      setErrModalObj({
        show: true,
        title: savedAcctInfoTitle,
        message: "Successfully updated account information.",
        id: "success",
      });
    } catch {
      setErrModalObj({
        show: true,
        title: cannotSaveTitle,
        message: "Cannot save Account Info.",
        id: initModalObj.id,
      });
    }
  };

  return (
    <>
      <ErrorModalMsg
        show={errModalObj.show}
        title={errModalObj.title}
        message={errModalObj.message}
        onCancel={canceledModalErr}
      />
      <div>
        {!canEdit && (
          <div className="alert alert-info mb-3" role="note" data-testid="readOnlyMsg">
            {readOnlyMsg}
          </div>
        )}
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label htmlFor="inputFirstName" className="form-label">
              First Name
            </label>
            <input
              type="text"
              className={`form-control ${formErrors.first_name && "is-invalid"}`}
              id="inputFirstName"
              name="first_name"
              value={user.first_name}
              maxLength={maxFirstNameLength}
              readOnly={!canEdit}
              onChange={handleInputChange}
            />
            <div className="text-danger">{formErrors.first_name}</div>
          </div>
          <div className="col-md-6">
            <label htmlFor="inputLastName" className="form-label">
              Last Name
            </label>
            <input
              type="text"
              className={`form-control ${formErrors.last_name && "is-invalid"}`}
              id="inputLastName"
              name="last_name"
              value={user.last_name}
              maxLength={maxLastNameLength}
              readOnly={!canEdit}
              onChange={handleInputChange}
            />
            <div className="text-danger">{formErrors.last_name}</div>
          </div>
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label htmlFor="inputEmail" className="form-label">
              Email
            </label>
            <input
              type="email"
              className={`form-control ${formErrors.email && "is-invalid"}`}
              id="inputEmail"
              name="email"
              value={user.email}
              maxLength={maxEmailLength}
              readOnly={!canEdit}
              onChange={handleInputChange}
            />
            <div className="text-danger" id="emailError">
              {formErrors.email}
            </div>
          </div>
          <div className="col-md-6">
            <label htmlFor="inputPhone" className="form-label">
              Phone
            </label>
            <input
              type="text"
              className={`form-control ${formErrors.phone && "is-invalid"}`}
              id="inputPhone"
              name="phone"
              value={user.phone}
              maxLength={maxPhoneLength}
              readOnly={!canEdit}
              onChange={handleInputChange}
            />
            <div className="text-danger">{formErrors.phone}</div>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleChangePasswordClick}
              disabled={!hasPassword}
            >
              Change Password
            </button>
          </div>
          <div className="col-md-6">
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              {canEdit && (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={saveButtonClick}
                >
                  Save
                </button>
              )}
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleCancelClick}
              >
                {canEdit ? "Cancel" : "Back"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AcctInfo;
