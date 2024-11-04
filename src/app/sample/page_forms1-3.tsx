"use client"
import React, { useState } from "react";
// import { SampleForm } from "./form";
// import { Form2 } from "./form2";
import { Form3 } from "./form3";
import { initEvent } from "../../lib/db/initVals";

export type petType = {
  id: number;
  name: string;
}

const initPets = [
  {
    id: 1,
    name: 'Dog', 
  },
  {
    id: 2,
    name: 'Cat',
  },
  {
    id: 3,
    name: 'Hamster',
  }
]

export default function SamplePage() {
  const [events, setEvents] = useState([initEvent]);
  const [pets, setPets] = useState(initPets);
  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <div className="shadow p-3 m-3 rounded-3 container">
        <h2 className="mb-3">Test</h2>
        {/* <SampleForm /> */}
        {/* <Form2 /> */}
        <Form3 events={events} setEvents={setEvents} pets={pets} setPets={setPets} />
      </div>
    </div>
  )
}