"use client";
import React, { useRef, useState } from "react";
import type { ChangeEvent, ComponentProps } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { signIn } from "next-auth/react";
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
import { normalizeEmail } from "@/lib/auth/authUtils";
import { initUserForm } from "@/lib/db/initVals";
import { sanitizeName } from "@/lib/validation/sanitize";
import { registerUser } from "@/lib/db/auth/dbAuth";
import "./registerForm.css";

type registerFormStateType = userFormType & {
  confirm: string;
};

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

const blankValues: registerFormStateType = {
  ...initUserForm,
  id: "",
  confirm: "",
};

const passwordFormatMsg =
  "Password not in a valid format: at least 1 lower case, 1 UPPER case, 1 digit, 1 special character, 8 to 20 charaters long";

export const RegisterForm = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<registerFormStateType>(blankValues);
  const [formErrors, setFormErrors] = useState<registerFormStateType>(blankValues);
  const [usedEmail, setUsedEmail] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // submitting: disables the button. submittingRef: blocks a 2nd submit
  // right away, before React has re-rendered with the disabled button
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

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
    }

    // last name
    sanitizedUser.last_name = sanitizeName(sanitizedUser.last_name);
    if (!sanitizedUser.last_name) {
      errors.last_name = "Last Name is required";
      isValid = false;
    }

    // email
    const email = normalizeEmail(formData.email);
    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!isEmail(email)) {
      errors.email = "Email is not valid";
      isValid = false;
    } else {
      // show the user the email as it will be saved
      sanitizedUser.email = email;
    }

    // phone
    if (formData.phone.trim()) {
      const phoneCheck = phoneChecking(formData.phone);
      if (!phoneCheck.isValid) {
        errors.phone = "Phone not valid";
        isValid = false;
      }
    }

    // password
    if (!formData.password.trim()) {
      errors.password = "Password is required";
      isValid = false;
    } else if (!isPassword8to20(formData.password)) {
      errors.password = passwordFormatMsg;
      isValid = false;
    }

    // confirm
    if (!formData.confirm.trim()) {
      errors.confirm = "Confirm password is required";
      isValid = false;
    } else if (!isPassword8to20(formData.confirm)) {
      errors.confirm = passwordFormatMsg;
      isValid = false;
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    if (name === "email") {
      setUsedEmail("");
    }
  };

  const onSubmit: FormSubmitHandler = async (e) => {
    e.preventDefault();
    // ignore a 2nd click while the 1st submit is still running
    if (submittingRef.current) return;
    if (!validateForm()) return;

    submittingRef.current = true;
    setSubmitting(true);
    // once we navigate away, leave the button disabled
    let navigating = false;

    try {
      // only the fields the API needs; never send confirm
      const userToPost: userFormType = {
        ...initUserForm,
        first_name: sanitizeName(formData.first_name) || "",
        last_name: sanitizeName(formData.last_name) || "",
        email: normalizeEmail(formData.email),
        phone: formData.phone,
        password: formData.password,
      };
      const postedUser = await registerUser(userToPost);
      if (postedUser) {
        const response = await signIn("credentials", {
          redirect: false,
          email: userToPost.email,
          password: userToPost.password,
          callbackUrl: "/user/tmnts",
        });
        navigating = true;
        if (!response?.error) {
          router.push("/user/tmnts");
        } else {
          router.push("/login");
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          setUsedEmail(error.response?.data?.error || "Other error registering");
        } else {
          setFormErrors((prev) => ({
            ...prev,
            email: "Other error registering",
          }));
        }
      } else {
        setFormErrors((prev) => ({
          ...prev,
          email: "Unexpected error registering",
        }));
      }
    } finally {
      if (!navigating) {
        submittingRef.current = false;
        setSubmitting(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmVisibility = () => {
    setShowConfirm((prev) => !prev);
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
                aria-label="Show password"
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <Image src="/eye-slash.svg" alt="" width="22" height="22" />
                ) : (
                  <Image src="/eye.svg" alt="" width="22" height="22" />
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
                aria-label="Show confirm password"
                aria-pressed={showConfirm}
              >
                {showConfirm ? (
                  <Image src="/eye-slash.svg" alt="" width="22" height="22" />
                ) : (
                  <Image src="/eye.svg" alt="" width="22" height="22" />
                )}
              </button>
            </div>
            <div className="text-danger">{formErrors.confirm}</div>
          </div>
        </div>
        <div className="row justify-content-md-center">
          <div className="col-md-6">
            <div className="d-grid mt-2">
              <button
                type="submit"
                id="btnSubmit"
                className="btn btn-primary"
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? "Registering..." : "Register"}
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
