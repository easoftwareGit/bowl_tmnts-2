"use client";
import React, { ChangeEvent, useState } from "react";
import "./contactForm.css";

const name = "Eric Adolpshon"
const email = 'easoftware@gmail.com'
const phone = '(925) 689-5397'

export const ContactForm = () => {
  return (
    <>
      <div className="contact_container">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">
              Name:
            </label>
          </div>
          <div className="col-md-9">
            <label className="form-label">
              {name}
            </label>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">
              email:
            </label>
          </div>
          <div className="col-md-9">
            <a href={`mailto:${email}`} className="email-link">
              {email}
            </a>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">
              Phone:
            </label>
          </div>
          <div className="col-md-9">
            <label className="form-label">
              {phone}
            </label>
          </div>
        </div>
      </div>
    </>
  )
};
