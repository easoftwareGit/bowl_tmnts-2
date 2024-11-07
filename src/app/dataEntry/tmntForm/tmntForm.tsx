"use client";
import React, { ChangeEvent, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Accordion, AccordionItem } from "react-bootstrap";
import { allDataOneTmntType, dataOneTmntType, ioDataErrorsType } from "@/lib/types/types";
import ModalErrorMsg, { cannotSaveTitle } from "@/components/modal/errorModal";
import { initModalObj } from "@/components/modal/modalObjType";
import { maxTmntNameLength } from "@/lib/validation";
import { startOfDayFromString } from "@/lib/dateTools";
import { noAcdnErr } from "./errors";
import OneToNEvents, { validateEvents } from "./oneToNEvents";
import OneToNDivs, { validateDivs } from "./oneToNDivs";
import OneToNSquads, { validateSquads } from "./oneToNSquads";
import OneToNLanes from "./oneToNLanes";
import ZeroToNPots, { validatePots } from "./zeroToNPots";
import ZeroToNBrackets, { validateBrkts } from "./zeroToNBrkts";
import ZeroToNElims, { validateElims } from "./zeroToNElims";
import { compareAsc, isValid } from "date-fns";
import { saveAllDataOneTmnt } from "@/lib/db/oneTmnt/oneTmnt";
import "./tmntForm.css";

interface FormProps {  
  tmntProps: allDataOneTmntType
}

const TmntDataForm: React.FC<FormProps> = ({ tmntProps }) => { 
  
  let origData = tmntProps.origData;
  let oneTmntData = tmntProps.curData;

  const bowls = useSelector((state: RootState) => state.bowls.bowls); 

  const [errModalObj, setErrModalObj] = useState(initModalObj);
  const [showingModal, setShowingModal] = useState(false);

  const [tmnt, setTmnt] = useState(oneTmntData.tmnt);
  const [events, setEvents] = useState(oneTmntData.events);
  const [divs, setDivs] = useState(oneTmntData.divs);
  const [squads, setSquads] = useState(oneTmntData.squads);
  const [lanes, setLanes] = useState(oneTmntData.lanes);
  const [pots, setPots] = useState(oneTmntData.pots);
  const [brkts, setBrkts] = useState(oneTmntData.brkts);
  const [elims, setElims] = useState(oneTmntData.elims);

  const [eventAcdnErr, setEventAcdnErr] = useState(noAcdnErr);
  const [divAcdnErr, setDivAcdnErr] = useState(noAcdnErr);
  const [squadAcdnErr, setSquadAcdnErr] = useState(noAcdnErr);  
  const [potAcdnErr, setPotAcdnErr] = useState(noAcdnErr);
  const [brktAcdnErr, setBrktAcdnErr] = useState(noAcdnErr);
  const [elimAcdnErr, setElimAcdnErr] = useState(noAcdnErr);

  const bowlOptions = bowls.map(bowl => (
    <option key={bowl.id} value={bowl.id}>
      {bowl.bowl_name} - {bowl.city}, {bowl.state}
    </option>
  ));

  const canceledModalErr = () => {
    setErrModalObj(initModalObj); // reset modal object (hides modal)
  };

  const handleBowlSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;

    setTmnt({
      ...tmnt,
      bowl_id: value,
      bowl_id_err: "",
    })
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nameErr = name + "_err"; 
    if (name === "tmnt_name" || name === "bowl_id") {
      setTmnt({
        ...tmnt,
        [name]: value,
        [nameErr]: "",
      })
    } else if ((name === "start_date") || (name === "end_date")) {      
      if (!e.target.valueAsDate) return;
      let startDate: Date;
      let endDate: Date;
      if (name === "start_date") {
        setTmnt({
          ...tmnt,
          start_date_str: value,
          start_date_err: "",
        })
        startDate = startOfDayFromString(value) as Date
      } else {
        setTmnt({
          ...tmnt,
          end_date_str: value,
          end_date_err: "",
        })
        endDate = startOfDayFromString(value) as Date
      }
      // make sure squad dates are within the start and end dates for the event          
      setSquads(
        squads.map((squad) => {
          // if no squad date, use start date
          if (!squad.squad_date || !isValid(squad.squad_date)) {
            return {
              ...squad,
              squad_date: startDate
            }
          } else {
            // if squad date is before start date, use start date
            if (compareAsc(startDate, squad.squad_date) < 0) {
              return {
                ...squad,
                squad_date: startDate
              }
              // if squad date is after end date, use end date
            } else if (compareAsc(endDate, squad.squad_date) > 0) {
              return {
                ...squad,
                squad_date: endDate
              }
            }
          }
          return squad
        })
      )      
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // if (!value.trim()) {      
    //   if (name === "start_date" || name === "end_date") {               
    //     const ymd = getYearMonthDays(value);
    //     if (ymd.year === 0 || ymd.month === 0 || ymd.days === 0) {
    //       let updatedData: tmntType;
    //       if (name === "start_date") {
    //         updatedData = {
    //           ...tmnt,
    //           start_date: new Date(Date.UTC(ymd.year, ymd.month, ymd.days)),
    //           start_date_err: "",
    //         };
    //       } else {
    //         updatedData = {
    //           ...tmnt,
    //           end_date: new Date(Date.UTC(ymd.year, ymd.month, ymd.days)),
    //           end_date_err: "",
    //         };
    //       }
    //       setTmnt(updatedData);
    //     }
    //   }
    // }
  };

  const validateTmntInfo = (): boolean => {
    let istmntInfoValid = true;

    let nameErr = '';
    let bowlErr = '';
    let startErr = '';
    let endErr = '';

    if (!tmnt.tmnt_name.trim()) {
      nameErr = "Tournament Name is required";
      istmntInfoValid = false;
    }
    if (!tmnt.bowl_id) {
      bowlErr = "Bowl Name is required";
      istmntInfoValid = false;
    }
    if (!tmnt.start_date_str) {
      startErr = "Start date is required";
      istmntInfoValid = false;
    }    
    if (!tmnt.end_date_str) {
      endErr = "End date is required";
      istmntInfoValid = false;
    }    
    if (!startErr && !endErr) {
      const startDate = startOfDayFromString(tmnt.start_date_str) as Date;
      const endDate = startOfDayFromString(tmnt.end_date_str) as Date;
      if (compareAsc(startDate, endDate) > 0) {
        endErr = "End date cannot be before start date";
        istmntInfoValid = false;
      }
    }
    if (nameErr || bowlErr || startErr || endErr) {
      setTmnt({
        ...tmnt,
        tmnt_name_err: nameErr,
        bowl_id_err: bowlErr,
        start_date_err: startErr,
        end_date_err: endErr,
      });
    }

    return istmntInfoValid;
  }

  const validateTmnt = (): boolean => {
    let isTmntValid = true;
    if (!validateTmntInfo()) {
      isTmntValid = false;
    }
    if (!validateEvents(events, setEvents, setEventAcdnErr)) {
      isTmntValid = false;
    }
    if (!validateDivs(divs, setDivs, setDivAcdnErr)) {
      isTmntValid = false;
    }
    const startDate = startOfDayFromString(tmnt.start_date_str) as Date;
    const endDate = startOfDayFromString(tmnt.end_date_str) as Date;
    if (!validateSquads(squads, setSquads, events, setSquadAcdnErr, startDate, endDate)) {
      isTmntValid = false;
    }
    if (!validatePots(pots, setPots, divs, setPotAcdnErr)) {
      isTmntValid = false;
    }
    // right now only 1 squad is allowed, so just grab games the first one
    if (!validateBrkts(brkts, setBrkts, divs, squads[0].games, setBrktAcdnErr)) {
      isTmntValid = false;
    }
    // right now only 1 squad is allowed, so just grab games the first one
    if (!validateElims(elims, setElims, divs, squads[0].games, setElimAcdnErr)) { 
      isTmntValid = false;
    }
    return isTmntValid;
  };

  const handleDebug = (e: React.MouseEvent<HTMLElement>) => {
    console.log('Handled debug button');
  };

  const getLanesTabTilte = (): string => {
    let lanesTitle = '';
    squads.forEach((squad) => {
      if (lanesTitle === '') {
        lanesTitle = squad.lane_count + '';
      } else {
        lanesTitle = lanesTitle + ', ' + squad.lane_count;
      }
    })
    return lanesTitle
  }  

  const save = async () => { 

    // const origData: dataOneTmntType = {
    //   tmnt: origTmnt,
    //   events: origEvents,
    //   divs: origDivs,
    //   squads: origSquads,
    //   lanes: origLanes,
    //   pots: origPots,
    //   brkts: origBrkts,
    //   elims: origElims
    // }
    const curDataToSave: dataOneTmntType = {
      tmnt,
      events,
      divs,
      squads,
      lanes,
      pots,
      brkts,
      elims
    }
    // const origData: dataOneTmntType = { ...oneTmntData }
    // if a new tournament (tmnt_name will be blank)
    // set id to blank for original tmnt data    
    // if (origData.tmnt.tmnt_name=== '') {
    //   origData.tmnt.id = '';
    // }
    const tmntSaveError: ioDataErrorsType = await saveAllDataOneTmnt({      
      origData: origData,
      curData: curDataToSave,
    });    
    switch (tmntSaveError) {
      case ioDataErrorsType.Tmnt:
        setErrModalObj({
          show: true,
          title: cannotSaveTitle,
          message: `Cannot save Tournament "${tmnt.tmnt_name}".`,
          id: initModalObj.id
        })   
        return false;
        break;
      case ioDataErrorsType.Events:
        setErrModalObj({
          show: true,
          title: cannotSaveTitle,
          message: `Cannot save Events.`,
          id: initModalObj.id
        })   
        return false;
        break;
      case ioDataErrorsType.Divs:
        setErrModalObj({
          show: true,
          title: cannotSaveTitle,
          message: `Cannot save Divisions.`,
          id: initModalObj.id
        })   
        return false;
        break;
      case ioDataErrorsType.Squads:
        setErrModalObj({
          show: true,
          title: cannotSaveTitle,
          message: `Cannot save Squads.`,
          id: initModalObj.id
        })   
        return false;
        break;
      case ioDataErrorsType.Lanes:
        setErrModalObj({
          show: true,
          title: cannotSaveTitle,
          message: `Cannot save Lanes.`,
          id: initModalObj.id
        })   
        return false;
        break;
      case ioDataErrorsType.Pots:
        setErrModalObj({
          show: true,
          title: cannotSaveTitle,
          message: `Cannot save Pots.`,
          id: initModalObj.id
        })   
        return false;
        break;
      case ioDataErrorsType.Brkts:
        setErrModalObj({
          show: true,
          title: cannotSaveTitle,
          message: `Cannot save Brackets.`,
          id: initModalObj.id
        })   
        return false;
        break;
      case ioDataErrorsType.Elims:
        setErrModalObj({
          show: true,
          title: cannotSaveTitle,
          message: `Cannot save Eliminations.`,
          id: initModalObj.id
        })   
        return false;
        break;
      default:
        break;
    }    
    oneTmntData = { ...curDataToSave }
    origData = { ...curDataToSave }
    // origTmnt = { ...tmnt };
    // origEvents = [...events];
    // origDivs = [...divs];
    // origSquads = [...squads];
    // origLanes = [...lanes];
    // origPots = [...pots];
    // origBrkts = [...brkts];
    // origElims = [...elims];    
    return true;    
  };

  const handleSubmit = (e: React.FormEvent) => {    
    e.preventDefault();
    if (showingModal) return;
    if (validateTmnt()) {      
      save();      
    } else {
      // console.log("Tournament invalid");
    }
  };

  return (
    <>
      <ModalErrorMsg
        show={errModalObj.show}
        title={errModalObj.title}
        message={errModalObj.message}   
        onCancel={canceledModalErr}
      />      
      <form onSubmit={handleSubmit}>      
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label htmlFor="inputTmntName" className="form-label">
              Tournament Name
            </label>
            <input
              type="text"
              className={`form-control ${
                tmnt.tmnt_name_err && "is-invalid"
              }`}
              id="inputTmntName"                
              name="tmnt_name"
              value={tmnt.tmnt_name}
              maxLength={maxTmntNameLength}
              onChange={handleInputChange}
            />
            <div
              className="text-danger"
              data-testid="dangerTmntName"
            >
              {tmnt.tmnt_name_err}
            </div>
          </div>
          <div className="col-md-6">
            <label htmlFor="inputBowlName" className="form-label">
              Bowl Name
            </label>
            <select
              id="inputBowlName"
              data-testid="inputBowlName"
              name="bowl_id"
              className={`form-select ${tmnt.bowl_id_err && "is-invalid"}`}
              onChange={handleBowlSelectChange}
              value={tmnt.bowl_id === '' ? 'Choose...' : tmnt.bowl_id}
            >
              <option disabled>                
                Choose...
              </option>
              {bowlOptions}
            </select>
            <div
              className="text-danger"
              data-testid="dangerBowlName"
            >
              {tmnt.bowl_id_err}
            </div>
          </div>        
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-3">
            <label htmlFor="inputStartDate" className="form-label">
              Start Date
            </label>
            <input
              type="date"
              className={`form-control ${
                tmnt.start_date_err && "is-invalid"
              }`}
              id="inputStartDate"
              name="start_date"
              data-testid="inputStartDate"                  
              value={tmnt.start_date_str}
              onChange={handleInputChange}
              onBlur={handleBlur}
            />
            <div
              className="text-danger"
              data-testid="dangerStartDate"
            >
              {tmnt.start_date_err}
            </div>
          </div>
          <div className="col-md-3">
            <label htmlFor="inputEndDate" className="form-label">
              End Date
            </label>
            <input
              type="date"
              className={`form-control ${
                tmnt.end_date_err && "is-invalid"
              }`}
              id="inputEndDate"
              name="end_date"
              data-testid="inputEndDate"                  
              value={tmnt.end_date_str}
              onChange={handleInputChange}
              onBlur={handleBlur}
            />
            <div
              className="text-danger"
              data-testid="dangerEndDate"
            >
              {tmnt.end_date_err}
            </div>
          </div>
          <div className="col-md-6 d-flex justify-content-center align-items-center">
            <button
              className="btn btn-success"
              onClick={handleSubmit}
            >
              Save Tournament
            </button>
          </div>
          <div className="col-sm-3">
            <button 
              className="btn btn-info"
              onClick={handleDebug}
              onFocus={() => console.log("Debug button: got focus")}
            >
              Debug
            </button>
          </div>
        </div>
        <Accordion>
          <AccordionItem eventKey="events" >
            <Accordion.Header className={eventAcdnErr.errClassName} data-testid="acdnEvents">
              Events - {events.length}{eventAcdnErr.message}
            </Accordion.Header>
            <Accordion.Body data-testid="eventAcdn">
              <OneToNEvents
                events={events}
                setEvents={setEvents}
                squads={squads}
                setSquads={setSquads}
                setAcdnErr={setEventAcdnErr}                    
              />
            </Accordion.Body>
          </AccordionItem>
        </Accordion>
        <Accordion>
          <AccordionItem eventKey="divs">
            <Accordion.Header className={divAcdnErr.errClassName}>
              Divisions - {divs.length}{divAcdnErr.message}
            </Accordion.Header>
            <Accordion.Body>
              <OneToNDivs
                divs={divs}
                setDivs={setDivs}
                pots={pots}
                brkts={brkts}
                elims={elims}
                setAcdnErr={setDivAcdnErr}
              />
            </Accordion.Body>
          </AccordionItem>
        </Accordion>
        <Accordion>
          <AccordionItem eventKey="squads">
            <Accordion.Header className={squadAcdnErr.errClassName}>
              Squads - {squads.length}{squadAcdnErr.message}
            </Accordion.Header>
            <Accordion.Body>
              <OneToNSquads
                squads={squads}
                setSquads={setSquads}
                lanes={lanes}
                setLanes={setLanes}
                events={events}
                setAcdnErr={setSquadAcdnErr}
              />
            </Accordion.Body>
          </AccordionItem>
        </Accordion>
        <Accordion>
          <AccordionItem eventKey="lanes">
            {/* <no errors in Lanes */}
            <Accordion.Header>
              Lanes - {getLanesTabTilte()}
            </Accordion.Header>
            <Accordion.Body>
              <OneToNLanes  
                lanes={lanes} 
                setLanes={setLanes}
                squads={squads}
              />
            </Accordion.Body>
          </AccordionItem>
        </Accordion>
        <Accordion>
          <AccordionItem eventKey="pots">
            <Accordion.Header className={potAcdnErr.errClassName}>
              Pots - {pots.length}{potAcdnErr.message}
            </Accordion.Header>
            <Accordion.Body>
              <ZeroToNPots
                pots={pots}
                setPots={setPots}
                divs={divs}      
                squads={squads}
                setAcdnErr={setPotAcdnErr}
                setShowingModal={setShowingModal}
              />
            </Accordion.Body>
          </AccordionItem>
        </Accordion>
        <Accordion>
          <AccordionItem eventKey="brkts">
            <Accordion.Header className={brktAcdnErr.errClassName}>
              Brackets - {brkts.length}{brktAcdnErr.message}
            </Accordion.Header>
            <Accordion.Body>
              <ZeroToNBrackets
                brkts={brkts}
                setBrkts={setBrkts}
                divs={divs}
                squads={squads}
                setAcdnErr={setBrktAcdnErr}
                setShowingModal={setShowingModal}
              />
            </Accordion.Body>
          </AccordionItem>
        </Accordion>
        <Accordion>
          <AccordionItem eventKey="elims">
            <Accordion.Header className={elimAcdnErr.errClassName}>
              Eliminators - {elims.length}{elimAcdnErr.message}
            </Accordion.Header>
            <Accordion.Body>
              <ZeroToNElims
                elims={elims}
                setElims={setElims}
                divs={divs}
                squads={squads}
                setAcdnErr={setElimAcdnErr}
                setShowingModal={setShowingModal}
              />
            </Accordion.Body>
          </AccordionItem>
        </Accordion>
      </form>
    </>    
  )
}

export default TmntDataForm