"use client";

import React, { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { isEmail } from "@/lib/validation/validation";
import { maxEmailLength, maxPasswordLength } from "@/lib/validation/constants";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Alert } from "@/components/ui/index";

const defaultCallback = "/user/tmnts";

const blankValues = {
  email: "",
  password: "",
};

// demo account for the "login as Adam Smith" button
const demoUser = {
  email: "adam@email.com",
  password: "Test123!",
};

// errors other code sends here with ?error=... (e.g. the Google sign-in in
// auth.ts). Only these known codes are shown; text from the URL never is,
// so nobody can craft a login link that displays their own message.
const urlErrorMessages: Record<string, string> = {
  no_account:
    "No account exists for this email. Contact the tournament administrator.",
};

const getUrlErrorMessage = (code: string | null): string =>
  code && Object.hasOwn(urlErrorMessages, code) ? urlErrorMessages[code] : "";

// emails are saved in lower case, so log in with the same form
const normalizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * turns the callbackUrl search param into a path on THIS site.
 * Anything that could send the user to another site goes to the default.
 *
 * @param raw - callbackUrl from the query string
 * @returns - a path that starts with a single "/"
 */
const getSafeCallbackUrl = (raw: string | null): string => {
  if (!raw) return defaultCallback;

  let path = raw.trim();

  // absolute URL (e.g. from NextAuth or middleware): keep only the
  // path + search + hash, so the origin is always this site
  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      path = `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return defaultCallback;
    }
  }

  // must be a same-site path. "//evil.com" and "/\evil.com" are read by
  // browsers as another site, and "javascript:..." is not a path at all
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return defaultCallback;
  }

  // "/" (or an origin with no path) means "no preference"
  if (path === "/") return defaultCallback;

  return path;
};

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));

  const [formData, setFormData] = useState(blankValues);
  const [formErrors, setFormErrors] = useState(blankValues);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [urlError, setUrlError] = useState(() =>
    getUrlErrorMessage(searchParams.get("error")),
  );  

  // submitting: disables the button. submittingRef: blocks a 2nd submit
  // right away, before React has re-rendered with the disabled button
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const validateForm = () => {
    const errors = { ...blankValues };
    let isValid = true;

    // email
    const email = normalizeEmail(formData.email);
    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!isEmail(email)) {
      errors.email = "Email is not valid";
      isValid = false;
    }

    // password
    if (!formData.password.trim()) {
      errors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length > maxPasswordLength) {
      errors.password = `Password must be ${maxPasswordLength} characters or less`;
      isValid = false;
    }

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
    setLoginError("");
    setUrlError("");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // ignore a 2nd click while the 1st submit is still running
    if (submittingRef.current) return;

    setLoginError("");
    setUrlError("");
    if (!validateForm()) return;

    submittingRef.current = true;
    setSubmitting(true);
    // once we navigate away, leave the button disabled
    let navigating = false;

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: normalizeEmail(formData.email),
        password: formData.password,
        callbackUrl,
      });
      if (!res?.error) {
        navigating = true;
        router.push(callbackUrl);
      } else {
        setLoginError("Invalid email or password");
      }
    } catch {
      setLoginError("Other error logging in");
    } finally {
      if (!navigating) {
        submittingRef.current = false;
        setSubmitting(false);
      }
    }
  };

  const googleButtonClicked = async () => {
    setGoogleError("");
    setUrlError("");
    try {
      // NextAuth redirects to Google, then back to callbackUrl
      await signIn("google", { callbackUrl });
    } catch {
      setGoogleError("Other error logging in with Google");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // fills in the demo account; the user still clicks Login
  const handleLoginAsAdam = () => {
    setFormData(demoUser);
    setFormErrors(blankValues);
    setLoginError("");
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="form_container">
        {urlError && <Alert>{urlError}</Alert>}
        <div className="row g-3 mb-3">
          <div className="col">
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
                className={`form-control ${formErrors.password && "is-invalid"}`}
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
            {loginError && <Alert>{loginError}</Alert>}
          </div>
        </div>
        <div className="d-grid">
          <button
            type="submit"
            id="btnSubmit"
            data-testid="btnSubmit"
            className="btn btn-primary mt-2"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
          <button
            type="button"
            id="btnLoginAsAdam"
            className="btn btn-secondary mt-2"
            onClick={handleLoginAsAdam}
          >
            login as Adam Smith
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
              <Image src="/google.svg" alt="" width="30" height="30" />
            </span>
            <span className="pe-2">Sign in with Google</span>
          </button>
          {googleError && <Alert>{googleError}</Alert>}
        </div>
      </div>
    </form>
  );
};
