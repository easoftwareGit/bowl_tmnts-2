"use client";
import React, { useState } from "react";
import type { ChangeEvent, ComponentProps } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { signIn } from "next-auth/react";
import { baseApi } from "@/lib/api/baseApi";
import { Alert } from "@/components/ui/index";
import {
  isEmail,
  isPassword8to20,
} from "@/lib/validation/validation";
import {
  maxFirstNameLength,
  maxLastNameLength,
  maxEmailLength,
  maxPhoneLength,
} from "@/lib/validation/constants";
import { phone as phoneChecking } from "phone";
import type { userFormType } from "@/lib/types/types";
import { initUserForm } from "@/lib/db/initVals";
import "./form.css";
import { sanitizeName } from "@/lib/validation/sanitize";
import { sanitizeUser } from "@/lib/validation/users/validate";

type registerFormStateType = userFormType & {
  confirm: string;
};

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

const blankValues: registerFormStateType = {
  ...initUserForm,
  id: "",
  confirm: "",
};

export const RegisterForm = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<registerFormStateType>(blankValues);
  const [formErrors, setFormErrors] = useState<registerFormStateType>(blankValues);
  const [usedEmail, setUsedEmail] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validateForm = () => {
    const errors: registerFormStateType = {
      ...blankValues,
    };
    let isValid = true;

    const sanitizedUser: registerFormStateType = {
      ...formData,
    };

    setUsedEmail("");

    // first name
    sanitizedUser.first_name = sanitizeName(sanitizedUser.first_name);
    if (!sanitizedUser.first_name) {
      errors.first_name = "First Name is required";
      isValid = false;
    } else {
      errors.first_name = "";
    }

    // last name
    sanitizedUser.last_name = sanitizeName(sanitizedUser.last_name);
    if (!sanitizedUser.last_name) {
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
      sanitizedUser.email = formData.email;
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
        sanitizedUser.phone = formData.phone;
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
      sanitizedUser.password = formData.password;
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
      sanitizedUser.confirm = formData.confirm;
      errors.confirm = "";
    }

    // compare password and confirmation
    if (errors.password === "" && errors.confirm === "") {
      if (formData.password !== formData.confirm) {
        errors.confirm = "Passwords do not match";
        isValid = false;
      }
    }

    setFormData(sanitizedUser);
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

  const onSubmit: FormSubmitHandler = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const url = baseApi + "/auth/register";
        const toScrub: userFormType = {
          ...initUserForm,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        };
        const sanitizedUser = sanitizeUser(toScrub);
        const userJson = JSON.stringify({
          id: sanitizedUser.id,
          first_name: sanitizedUser.first_name,
          last_name: sanitizedUser.last_name,
          email: sanitizedUser.email,
          phone: sanitizedUser.phone,
          password: formData.password,
        });

        const response = await axios.post(url, userJson, {
          withCredentials: true,
        });

        if (response.status === 201) {
          const res = await signIn("credentials", {
            redirect: false,
            email: formData.email,
            password: formData.password,
            callbackUrl: "/user/tmnts",
          });
          if (!res?.error) {
            router.push("/user/tmnts");
          } else {
            router.push("/login");
          }
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 409) {
            setUsedEmail("Email already in use");
          } else {
            setFormErrors({
              ...formErrors,
              email: "Other error registering",
            });
          }
        } else {
          setFormErrors({
            ...formErrors,
            email: "Unexpected error registering",
          });
        }
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmVisibility = () => {
    setShowConfirm(!showConfirm);
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="form_container">
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
              value={formData.first_name}
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
            Have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </form>
  );
};
