"use client"  
import AcctInfoForm from "./form";

export default function AcctInfoPage() {
  return (
    <div
      data-testid="acct-info-page"
      className="d-flex flex-column align-items-center"
    >
      <div
        data-testid="acct-info-form"
        className="shadow p-3 m-5 rounded-3"
      >
        <AcctInfoForm />
      </div>
    </div>
  );
}
