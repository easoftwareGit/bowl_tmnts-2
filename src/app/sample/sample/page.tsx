"use client"
import usePreventUnload from "@/components/preventUnload/preventUnload";
import React, { useState } from "react";

const SamplePage = () => { 

  const initSample = 'Sample Text';
  const [sample, setSample] = useState(initSample);

  const dataWasChanged = () => { 
    return sample !== initSample;
  }

  usePreventUnload(dataWasChanged);

  return (
    <div>      
      <h2 className="mb-3">Test</h2>
      <label htmlFor="sampleInput" className="form-label">
        Sample Text 3
      </label>
      <input
        type="text"
        className="form-control"
        id="sampleInput"
        name="sampleInput"
        value={sample}
        onChange={(e) => setSample(e.target.value)}
      />      
    </div>
  )
}

export default SamplePage;