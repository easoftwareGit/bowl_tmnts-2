"use client";
import React, { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { signIn } from "next-auth/react";
import { baseApi } from "@/lib/tools";
import { Alert } from "@/components/ui/index";
import {
  isEmail,
  isPassword8to20,
  maxFirstNameLength,
  maxLastNameLength,
  maxEmailLength,
  maxPhoneLength,
} from "@/lib/validation";
import { phone as phoneChecking } from "phone";
import { userType } from "@/lib/types/types";
import { initUser } from "@/lib/db/initVals";
import { sanitizeUser } from "@/app/api/users/validate";
import "./form.css";

const blankValues = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
  confirm: "",
};

export const RegisterForm = () => {  

  const router = useRouter();

  const [formData, setFormData] = useState(blankValues);
  const [formErrors, setFormErrors] = useState(blankValues);
  const [usedEmail, setUsedEmail] = useState("");
  
  // const sanitized = {
  //   first_name: "",
  //   last_name: "",
  //   email: "",
  //   phone: "",
  // };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validateForm = () => {
    const errors = {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      confirm: "",
    };
    let isValid = true;
    setUsedEmail("");

    // first name
    if (!formData.first_name.trim()) {
      errors.first_name = "First Name is required";
      isValid = false;
    } else {
      errors.first_name = "";      
    }

    // last name
    if (!formData.last_name.trim()) {
      errors.last_name = "Last Name is required";
      isValid = false;
    } else {
      errors.last_name = "";      
    }

    // email
    if (!formData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!isEmail(formData.email)) {
      errors.email = "Email is not valid";
      isValid = false;
    } else {
      errors.email = "";      
    }

    // phone
    if (!formData.phone.trim()) {
      errors.phone = "";
    } else {
      const phoneCheck = phoneChecking(formData.phone);
      if (!phoneCheck.isValid) {
        errors.phone = "Phone not valid";
        isValid = false;
      } else {
        errors.phone = "";        
      }
    }

    // password
    if (!formData.password.trim()) {
      errors.password = "Password is required";
      isValid = false;
    } else if (!isPassword8to20(formData.password)) {
      errors.password =
        "Password not in a valid format: at least 1 lower case, 1 UPPER case, 1 digit, 1 special character, 8 to 20 charaters long";
      isValid = false;
    } else {
      errors.password = "";
    }

    // confirm
    if (!formData.confirm.trim()) {
      errors.confirm = "Confirm password is required";
      isValid = false;
    } else if (!isPassword8to20(formData.confirm)) {
      errors.confirm =
        "Password not in a valid format: at least 1 lower case, 1 UPPER case, 1 digit, 1 special character, 8 to 20 charaters long";
      isValid = false;
    } else {
      errors.confirm = "";
    }

    // compare password and confirmation
    if (errors.password === "" && errors.confirm === "") {
      if (formData.password !== formData.confirm) {
        errors.confirm = "Passwords do not match";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const url = baseApi + "/auth/register";
        const toScrub: userType = {
          ...initUser,
          first_name: formData.first_name,
          last_name: formData.last_name,          
          phone: formData.phone,          
        }
        const sanitizedUser = sanitizeUser(toScrub);
        var userJson = JSON.stringify({
          id: sanitizedUser.id,
          first_name: sanitizedUser.first_name,
          last_name: sanitizedUser.last_name,
          email: formData.email,
          phone: sanitizedUser.phone,
          password: formData.password,
        });
        const response = await axios({
          method: "post",
          data: userJson,
          withCredentials: true,
          url: url,
        });
        if (response.status === 201) {
          signIn();              
        }
      } catch (error: any) {
        if (error.response?.status === 409) {
          setUsedEmail("Email already in use");
        } else {
          console.log("Error creating user");
        }
      }
    } else {
      console.log("Invalid Registraction Data!");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmVisibility = () => {
    setShowConfirm(!showConfirm);
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="form_container">
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label htmlFor="inputFirstName" className="form-label">
              First name
            </label>
            <input
              type="text"
              className={`form-control ${formErrors.first_name && "is-invalid"}`}
              id="inputFirstName"
              name="first_name"
              value={formData.first_name}
              maxLength={maxFirstNameLength}
              onChange={handleInputChange}
            />
            <div className="text-danger">{formErrors.first_name}</div>
          </div>
          <div className="col-md-6">
            <label htmlFor="inputLastName" className="form-label">
              Last name
            </label>
            <input
              type="text"
              className={`form-control ${formErrors.last_name && "is-invalid"}`}
              id="inputLastName"
              name="last_name"
              value={formData.last_name}
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
              value={formData.email}
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
              value={formData.phone}
              maxLength={maxPhoneLength}
              onChange={handleInputChange}
            />
            <div className="text-danger">{formErrors.phone}</div>
          </div>
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label htmlFor="inputPassword" className="form-label">
              Password
            </label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control ${
                  formErrors.password && "is-invalid"
                }`}
                id="inputPassword"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                className="btn border border-start-0 rounded-end"
                type="button"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
              >
                {showPassword ? (
                  <Image src="/eye-slash.svg" alt="hide" width="22" height="22" />
                ) : (
                  <Image src="/eye.svg" alt="show" width="22" height="22" />
                )}
              </button>
            </div>
            <div className="text-danger">{formErrors.password}</div>
          </div>
          <div className="col-md-6">
            <label htmlFor="inputConfirm" className="form-label">
              Confirm Password
            </label>
            <div className="input-group">
              <input
                type={showConfirm ? "text" : "password"}
                className={`form-control ${formErrors.confirm && "is-invalid"}`}
                id="inputConfirm"
                name="confirm"
                value={formData.confirm}
                onChange={handleInputChange}
              />
              <button
                className="btn border border-start-0 rounded-end"
                type="button"
                onClick={toggleConfirmVisibility}
                tabIndex={-1}
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
        <div className="row justify-content-md-center">
          <div className="col-md-6">
            <div className="d-grid mt-2">
              <button type="submit" id="btnSubmit" className="btn btn-primary">
                Register
              </button>
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-center align-middle mt-3">
          <p>
            Have an account? <Link href="/api/auth/signin">Sign in</Link>
          </p>
        </div>
      </div>
    </form>
  );
};
