import React, { ChangeEvent, useState } from "react";
import {
  isEmail,
  maxEmailLength,
  maxFirstNameLength,
  maxLastNameLength,
  maxPhoneLength,
} from "@/lib/validation";
import { useSession } from "next-auth/react";
import { findUserByEmail } from "@/lib/db/users/users";
import { Alert } from "@/components/ui/index";
import { phone as phoneChecking } from "phone";
import { patchUser } from "@/lib/db/users/dbUsers";
import ModalErrorMsg, { cannotSaveTitle } from "@/components/modal/errorModal";
import { initModalObj } from "@/components/modal/modalObjType";
import { userType } from "@/lib/types/types";
import { useRouter } from "next/navigation"

interface ChildProps {
  user: userType;
  setUser: (user: userType) => void;
  origUserData: userType,
  infoType: string
  setInfoType: (infoType: string) => void
}

const blankErrors = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
};

const AcctInfo: React.FC<ChildProps> = ({
  user,
  setUser,
  origUserData,
  infoType,
  setInfoType
}) => {

  const { status, data, update } = useSession();

  const [formErrors, setFormErrors] = useState(blankErrors);  
  const [usedEmail, setUsedEmail] = useState("");  
  const [errModalObj, setErrModalObj] = useState(initModalObj);

  const router = useRouter();

  const phoneRequired = origUserData.phone ? true : false;

  const validUserData = async (): Promise<boolean> => {
    const errors = {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",  
    }
    let isValid = true; 

    // first name    
    if (!user.first_name.trim()) {
      errors.first_name = 'First Name is required';
      isValid = false;
    } else {
      errors.first_name = '';
    }

    // last name    
    if (!user.last_name.trim()) {
      errors.last_name = 'Last Name is required';
      isValid = false;
    } else {
      errors.last_name = '';
    }

    // email
    if (!user.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!isEmail(user.email)) {
      errors.email = 'Email is not valid';
      isValid = false;
    } else {
      errors.email = '';
    }

    // phone
    // if phone is not required (google auth) and phone is blank, then ok
    if (!phoneRequired && !user.phone.trim()) {
      errors.phone = "";
    } else {  // else if entered phone, check if valid
      if (!user.phone.trim()) {
        errors.phone = 'Phone is required';
        isValid = false;
      } else {
        const phoneCheck = phoneChecking(user.phone);
        if (!phoneCheck.isValid) {
          errors.phone = "Phone not valid";
          isValid = false;
        } else {
          errors.phone = "";        
        }
      }
    }

    if (isValid && user.email !== origUserData.email) {
      const foundEmail = await findUserByEmail(user.email);
      if (foundEmail) {
        errors.email = "Email already in use";
        isValid = false;
      }
    }
    
    setFormErrors(errors);
    return isValid;
  }
  
  const canceledModalErr = () => {
    const saved = (errModalObj.title === 'Account Info Saved') ? true : false;
    setErrModalObj(initModalObj); // reset modal object (hides modal)
    if (saved) {      
      router.push('/'); // back to list of tournaments
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
    setFormErrors({
      ...formErrors,
      [name]: "",
    });
    if (name === "email") {
      setUsedEmail("");
    }
  };

  const handleChangePasswordClick = () => {
    setInfoType('Password');
  }

  const handleCancelClick = () => {
    router.push('/'); // back to home 
  };

  const save = async () => {
    
    try {
      const dataValid = await validUserData();
      if (!dataValid) return;

      // update session
      update({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      });
      
      // patch user
      const dataToPatch = {
        id: user.id
      }
      if (user.first_name !== origUserData.first_name) {
        (dataToPatch as any).first_name = user.first_name;
      }
      if (user.last_name !== origUserData.last_name) {
        (dataToPatch as any).last_name = user.last_name;
      }
      if (user.email !== origUserData.email) {
        (dataToPatch as any).email = user.email;
      }
      if (origUserData.phone && user.phone !== origUserData.phone) {
        (dataToPatch as any).phone = user.phone;
      }      
      const patchedUser = await patchUser(dataToPatch);
      if (patchedUser) {
        router.push('/'); // back to home 
      }
    } catch (error) {
      setErrModalObj({
        show: true,
        title: cannotSaveTitle,
        message: `Cannot save Account Info.`,
        id: initModalObj.id
      })   
    }
  }

  const saveButtonClick = async () => {    
    const dataIsValid = await validUserData();
    if (dataIsValid) {
      save()
    }
  };

  return (
    <>
      <ModalErrorMsg
        show={errModalObj.show}
        title={errModalObj.title}
        message={errModalObj.message}   
        onCancel={canceledModalErr}
      />  
      <div>
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
              onChange={handleInputChange}                
            />
            <div className="text-danger" id="emailError">
              {formErrors.email}
            </div>
            {usedEmail && <Alert>{usedEmail}</Alert>}
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
            >
              Change Password
            </button>
          </div>
          <div className="col-md-6">
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button
              type="button"
              className="btn btn-success"
              onClick={saveButtonClick}
            >
              Save
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleCancelClick}
            >
              Cancel
            </button>
            </div>
          </div>
        </div>          
      </div>
    </>
  );
}

export default AcctInfo