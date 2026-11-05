import React from "react";
import "./contactForm.css";

const name = "Eric Adolphson";
const email = "easoftware@gmail.com";
const phone = "(925) 689-5397";
// tel: links should be digits only, with country code: tel:+19256895397
const phoneHref = `tel:+1${phone.replace(/\D/g, "")}`;

export const ContactForm = () => {
  return (
    <div className="contact_container">
      <dl className="row g-3">
        <dt className="col-md-3">Name:</dt>
        <dd className="col-md-9">{name}</dd>

        <dt className="col-md-3">Email:</dt>
        <dd className="col-md-9">
          <a href={`mailto:${email}`} className="email-link">
            {email}
          </a>
        </dd>

        <dt className="col-md-3">Phone:</dt>
        <dd className="col-md-9">
          <a href={phoneHref} className="phone-link">
            {phone}
          </a>
        </dd>
      </dl>
    </div>
  );
};