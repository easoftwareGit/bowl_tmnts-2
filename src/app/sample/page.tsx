"use client"
import ModalErrorMsg from "@/components/modal/errorModal";
import { initModalObj } from "@/components/modal/modalObjType";
import React, { useState } from "react";

const SamplePage = () => { 

  const [errModalObj, setErrModalObj] = useState(initModalObj);
  const [showingModal, setShowingModal] = useState(false);

  const canceledModalErr = () => {    
    setErrModalObj(initModalObj); // reset modal object (hides modal)
  };

  const handleCancel = (e: React.FormEvent) => {   
    e.preventDefault();
    setShowingModal(true);
    setErrModalObj({
      show: true,
      title: `Cancel Test`,
      message: `Do you want to cancel?`,
      id: '0'
    });    
  }

  return (
    <>
      <ModalErrorMsg
        show={errModalObj.show}
        title={errModalObj.title}
        message={errModalObj.message}   
        onCancel={canceledModalErr}
      />
      <div>
        <button
          className="btn btn-danger"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
    </>
  )
}

export default SamplePage;