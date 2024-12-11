"use client"  
import AcctInfoForm from "./form";

export default function AcctInfoPage() {
  return (
    <div className="d-flex flex-column align-items-center">    
      <div className="shadow p-3 m-5 rounded-3">
        {/* <h2 className="mb-3">Account Information</h2> */}
        <AcctInfoForm />
      </div>
    </div>
  );
}
