"use client";

import React, { ChangeEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { maxEmailLength, isEmail, maxPasswordLength } from "@/lib/validation";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Alert } from "@/components/ui/index";

export const LoginForm = () => {
  const blankValues = {
    email: "",
    password: "",
  };

  const router = useRouter()
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/user';

  const [formData, setFormData] = useState(blankValues);
  const [formErrors, setFormErrors] = useState(blankValues);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [googleError, setGoogleError] = useState("");

  const validateForm = () => {
    const errors = {
      email: "",
      password: "",  
    }
    let isValid = true; 

    // email
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!isEmail(formData.email)) {
      errors.email = 'Email is not valid';
      isValid = false;
    } else {
      errors.email = '';
    }

    // password
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
      isValid = false;
    } else if ((formData.password.trim()).length > maxPasswordLength) {
      errors.password = `Password must be less than ${maxPasswordLength} characters`;      
    } else {
      errors.password = '';
    }
    setFormErrors(errors);
    return isValid;
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => { 
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setFormErrors({
      ...formErrors,
      [name]: "",
    });     
  }
  
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (validateForm()) { 
        const res = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
          callbackUrl,
        });
        if (!res?.error) {
          router.push(callbackUrl)
        } else {
          setLoginError('Invalid email or password')
        }
      } else {
        console.log("Invalid login Data!");        
      }      
    } catch (err: any) {
      setLoginError("Other error logging in");
    }
  };

  const googleButtonClicked = async () => {
    try {    
      setGoogleError("");
      const res = await signIn("google", {
        redirect: false,
        callbackUrl,
      });
      if (!res?.error) {
        router.push(callbackUrl);
      } else {
        setGoogleError("Invalid google login");
      }
    } catch (err: any) {
      setGoogleError("Other error logging in with Google");
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }

  const handleLoginAsEric = () => {
    setFormData({
      email: 'eric@email.com',
      password: 'Test123!',
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="form_container">
        <div className="row g-3 mb-3">
          <div className="col">
            <label htmlFor="inputEmail" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="inputEmail"
              name="email"
              value={formData.email}
              maxLength={maxEmailLength}
              onChange={handleInputChange}  
            />
            <div className="text-danger">{formErrors.email}</div>
          </div>
        </div>
        <div className="row g-3 mb-3">
          <div className="col">
            <label htmlFor="inputPassword" className="form-label">
              Password
            </label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
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
            {loginError && <Alert>{loginError}</Alert>}
          </div>            
        </div>
        <div className="d-grid">
          <button type="submit" id="btnSubmit" className="btn btn-primary mt-2">
            Login
          </button>
          <button id="btnLoginAsEric" className="btn btn-secondary mt-2" onClick={handleLoginAsEric}>
            login as Eric Johnson
          </button>
        </div>
        <div className="d-flex justify-content-center align-middle mt-3">
          No account?&nbsp;&nbsp;<Link href="/register">Create Account</Link>
        </div>
        <hr />
        <div className="d-grid">
          <button
            type="button"
            className="btn bg-secondary-subtle btn-lg"
            onClick={googleButtonClicked}
          >
            <span className="pe-3">
              <Image src="google.svg" alt="google" width="30" height="30"></Image>
            </span>
            <span className="pe-2">Sign in with Google</span>
          </button>
          {googleError && <Alert>{googleError}</Alert>}
        </div>
      </div>
    </form>
  );
};
