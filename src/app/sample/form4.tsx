"use client";
import { useState, ChangeEvent, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch } from "@/redux/store";
import { eventType } from "../../lib/types/types";
import { initEvent } from "../../lib/db/initVals";
// import {
//   fetchBowls,
//   selectAllBowls,
//   getBowlsStatus,
//   getBowlsError,
// } from "@/redux/features/bowls/bowlsSlice";
import { tmntPropsType } from "../../lib/types/types";

interface FormProps {
  tmntProps: tmntPropsType;
}

export const Form4: React.FC<FormProps> = ({ tmntProps }) => {
  const {
    tmnt,
    setTmnt,
    events,
    setEvents,
    divs,
    setDivs,
    squads,
    setSquads,
    lanes,
    setLanes,
    pots,
    setPots,
    brkts,
    setBrkts,
    elims,
    setElims,
  } = tmntProps;

  // const dispatch = useDispatch<AppDispatch>();

  const bowlsStatus: string = "succeeded";
  const bowlsError = "";
  // const bowlsStatus = useSelector(getBowlsStatus);
  // const bowls = useSelector(selectAllBowls);
  // const bowlsError = useSelector(getBowlsError);

  // useEffect(() => {
  //   dispatch(fetchBowls());
  // }, [dispatch]);

  const [eventId, setEventId] = useState(2); // id # used in page.tsx

  const handleAdd = () => {
    const newEvent: eventType = {
      ...initEvent,      
      id: '' + (eventId + 1),
      event_name: (tmnt.tmnt_name === '') ? 'New Event' : tmnt.tmnt_name
    };
    setEventId(eventId + 1);
    setEvents([...events, newEvent]);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTmnt({
      ...tmnt,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    console.log("Submitted");
    e.preventDefault();
  };

  const handleBowlSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setTmnt({
      ...tmnt,
      bowl_id: value,
      bowl_id_err: "",
    });
  };

  const handleEventSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setTmnt({
      ...tmnt,
      start_date: value,
      start_date_err: "",
    });
  };

  // const bowlOptions = bowls.map((bowl) => (
  //   <option key={bowl.id} value={bowl.id}>
  //     {bowl.bowl_name} - {bowl.city}, {bowl.state}
  //   </option>
  // ));

  const eventOptions = events.map((event) => (
    <option key={event.id} value={event.id}>
      {event.event_name}
    </option>
  ))

  return (
    <form onSubmit={handleSubmit}>
      {bowlsStatus === "loading" && <div>Loading...</div>}
      {bowlsStatus !== "loading" && bowlsError ? (
        <div>Error: {bowlsError}</div>
      ) : null}
      {bowlsStatus === "succeeded" ? (
        <div className="form_container">
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <label className="form-label" htmlFor="eventName">
                Event Name
              </label>
              <input
                type="text"
                className="form-control"
                id="eventName"
                name="tmnt_name"
                value={tmnt.tmnt_name} // use as new event name
                onChange={handleInputChange}
              />
            </div>
            <div className='col-sm-2 d-flex justify-content-center align-items-end'>
              <button className="btn btn-success" onClick={() => handleAdd()}>
                Add Event
              </button>
            </div>
            {/* <div className="col-md-4">
              <label htmlFor="inputBowlName" className="form-label">
                Bowl Name
              </label>
              <select
                id="inputBowlName"
                data-testid="inputBowlName"
                className={`form-select ${tmnt.bowl_id_err && "is-invalid"}`}
                onChange={handleBowlSelectChange}
                value={tmnt.bowl_id === "" ? "Choose..." : tmnt.bowl_id}
              >
                <option disabled>Choose...</option>
                {bowlOptions}
              </select>
            </div> */}
            <div className="col-md-3">
              <label htmlFor="selectEvent" className="form-label">
                Select Event
              </label>
              <select
                id="selectEvent"
                data-testid="selectEvent"
                className={`form-select ${tmnt.start_date_err && "is-invalid"}`}
                onChange={handleEventSelectChange}
                value={tmnt.start_date === "" ? "Choose..." : tmnt.start_date}
              >
                <option disabled>Choose...</option>
                {eventOptions}
              </select>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
};
