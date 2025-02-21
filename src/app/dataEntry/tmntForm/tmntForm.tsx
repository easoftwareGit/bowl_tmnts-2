"use client";
import React, { ChangeEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { Accordion, AccordionItem } from "react-bootstrap";
import { allDataOneTmntType, dataOneTmntType, ioDataError, tmntActions, tmntFormDataType } from "@/lib/types/types";
import ModalErrorMsg, { cannotSaveTitle } from "@/components/modal/errorModal";
import { initModalObj } from "@/components/modal/modalObjType";
import { maxTmntNameLength } from "@/lib/validation";
import { startOfDayFromString, validDateString } from "@/lib/dateTools";
import { noAcdnErr } from "./errors";
import OneToNEvents, { validateEvents } from "./oneToNEvents";
import OneToNDivs, { validateDivs } from "./oneToNDivs";
import OneToNSquads, { validateSquads } from "./oneToNSquads";
import OneToNLanes from "./oneToNLanes";
import ZeroToNPots, { validatePots } from "./zeroToNPots";
import ZeroToNBrackets, { validateBrkts } from "./zeroToNBrkts";
import ZeroToNElims, { validateElims } from "./zeroToNElims";
import { compareAsc } from "date-fns";
import { saveAllDataOneTmnt } from "@/lib/db/oneTmnt/dbOneTmnt";
import ModalConfirm from "@/components/modal/confirmModal";
import { useRouter } from "next/navigation"
import { getOneTmntIoError, getOneTmntSaveStatus, saveOneTmnt } from "@/redux/features/allDataOneTmnt/allDataOneTmntSlice";
import "./tmntForm.css";
import WaitModal from "@/components/modal/waitModal";

interface FormProps {  
  tmntProps: tmntFormDataType
}

const TmntDataForm: React.FC<FormProps> = ({ tmntProps }) => { 
  
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const tmntSaveStatus = useSelector(getOneTmntSaveStatus);
  const ioError = useSelector(getOneTmntIoError);

  let origData = tmntProps.origData;
  let curData = tmntProps.curData;  
  const tmntAction = tmntProps.tmntAction;

  const cancelAction = (tmntAction === tmntActions.New)
    ? 'entering new'
    : 'editing';  
  const cancelTitle = (tmntAction === tmntActions.New)
    ? 'New'
    : 'Editing';
  const isDisabled = (tmntAction === tmntActions.Run);

  const bowls = useSelector((state: RootState) => state.bowls.bowls); 

  const [modalObj, setModalObj] = useState(initModalObj);
  const [errModalObj, setErrModalObj] = useState(initModalObj);
  const [showingModal, setShowingModal] = useState(false);

  const [tmnt, setTmnt] = useState(curData.tmnt);
  const [events, setEvents] = useState(curData.events);
  const [divs, setDivs] = useState(curData.divs);
  const [squads, setSquads] = useState(curData.squads);
  const [lanes, setLanes] = useState(curData.lanes);
  const [pots, setPots] = useState(curData.pots);
  const [brkts, setBrkts] = useState(curData.brkts);
  const [elims, setElims] = useState(curData.elims);

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
    const saved = (errModalObj.title === 'Tournament Saved') ? true : false;
    setErrModalObj(initModalObj); // reset modal object (hides modal)
    if (saved) {      
      router.push('/user/tmnts'); // back to list of tournaments
    }
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
      let startDateStr = "";
      let endDate: Date;
      // let endDateStr = "";
      if (name === "start_date") {
        setTmnt({
          ...tmnt,
          start_date_str: value,
          start_date_err: "",
        })
        startDate = startOfDayFromString(value) as Date
        startDateStr = value
        // endDateStr = tmnt.end_date_str
        endDate = startOfDayFromString(tmnt.end_date_str) as Date
      } else {
        setTmnt({
          ...tmnt,
          end_date_str: value,
          end_date_err: "",
        })
        endDate = startOfDayFromString(value) as Date
        // endDateStr = value
        startDateStr = tmnt.start_date_str
        startDate = startOfDayFromString(tmnt.start_date_str) as Date
      }
      // make sure squad dates are within the start and end dates for the event          
      setSquads(
        squads.map((squad) => {
          // if no squad date, use start date
          if (!squad.squad_date_str || !validDateString(squad.squad_date_str)) {
            return {
              ...squad,
              squad_date_str: startDateStr
            }
          } else {
            const squadDate = startOfDayFromString(squad.squad_date_str) as Date;
            // if start date is at or before and date AND
            // squad date is NOT between start date and end date
            if ((compareAsc(startDate, endDate) <= 0) &&                                          
              ((compareAsc(startDate, squadDate) > 0 || compareAsc(endDate, squadDate) < 0))) {
              // set squad date to start date
              return {
                ...squad,
                squad_date_str: startDateStr
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
    const toSaveData: allDataOneTmntType = {
      origData: origData,
      curData: curDataToSave
    }
    dispatch(saveOneTmnt(toSaveData));
    
    if (tmntSaveStatus === 'failed') {       
      switch (ioError) {
        case ioDataError.Tmnt:
          setErrModalObj({
            show: true,
            title: cannotSaveTitle,
            message: `Cannot save Tournament "${tmnt.tmnt_name}".`,
            id: initModalObj.id
          })
          return false;
          break;
        case ioDataError.Events:
          setErrModalObj({
            show: true,
            title: cannotSaveTitle,
            message: `Cannot save Events.`,
            id: initModalObj.id
          })
          return false;
          break;
        case ioDataError.Divs:
          setErrModalObj({
            show: true,
            title: cannotSaveTitle,
            message: `Cannot save Divisions.`,
            id: initModalObj.id
          })
          return false;
          break;
        case ioDataError.Squads:
          setErrModalObj({
            show: true,
            title: cannotSaveTitle,
            message: `Cannot save Squads.`,
            id: initModalObj.id
          })
          return false;
          break;
        case ioDataError.Lanes:
          setErrModalObj({
            show: true,
            title: cannotSaveTitle,
            message: `Cannot save Lanes.`,
            id: initModalObj.id
          })
          return false;
          break;
        case ioDataError.Pots:
          setErrModalObj({
            show: true,
            title: cannotSaveTitle,
            message: `Cannot save Pots.`,
            id: initModalObj.id
          })
          return false;
          break;
        case ioDataError.Brkts:
          setErrModalObj({
            show: true,
            title: cannotSaveTitle,
            message: `Cannot save Brackets.`,
            id: initModalObj.id
          })
          return false;
          break;
        case ioDataError.Elims:
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
    } else if (tmntSaveStatus === 'succeeded') {
      curData = { ...curDataToSave }
      origData = { ...curDataToSave }
      setErrModalObj({
        show: true,
        title: 'Tournament Saved',
        message: `Tournament: ${curDataToSave.tmnt.tmnt_name} saved.`,
        id: initModalObj.id
      })
      // router.push('/user/tmnts'); // back to list of tournaments          
    }
  };

  const confirmedCancel = () => {    
    setShowingModal(false);
    setModalObj(initModalObj);  // reset modal object (hides modal)    
    router.push('/user/tmnts'); // back to list of tournaments    
  };

  const canceledCancel = () => {
    setShowingModal(false);
    setModalObj(initModalObj); // reset modal object (hides modal)
  };

  // const handleKeyDown = (e: React.KeyboardEvent) => {
  //   if (e.key === 'Enter') {
  //     e.preventDefault();
  //   }
  // }

  const handleCancel = (e: React.FormEvent) => {   
    e.preventDefault();
    setShowingModal(true);
    setModalObj({
      show: true,
      title: `Cancel ${cancelTitle} Tournament`,
      message: `Do you want to cancel ${cancelAction} tournament?`,
      id: '0'
    }); // cancel done in confirmedCancel    
  }

  const handleSave = (e: React.FormEvent) => {    
    e.preventDefault();
    if (showingModal) return;
    // Check if the focused element is not the save button
    // if (document.activeElement && document.activeElement.tagName !== 'BUTTON') {
    if (document.activeElement && document.activeElement.id !== 'saveButton') {      
      return;
    }
    if (validateTmnt()) {      
      save();      
    }
  };

  return (
    <>
      <ModalConfirm
        show={modalObj.show}
        title={modalObj.title}
        message={modalObj.message}
        onConfirm={confirmedCancel}
        onCancel={canceledCancel}
      />      
      <ModalErrorMsg
        show={errModalObj.show}
        title={errModalObj.title}
        message={errModalObj.message}   
        onCancel={canceledModalErr}
      />      
      <WaitModal show={tmntSaveStatus === 'saving' && !errModalObj.show} message="Saving..." />
      <form>      
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
              disabled={isDisabled}
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
              disabled={isDisabled}
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
              disabled={isDisabled}
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
              disabled={isDisabled}
            />
            <div
              className="text-danger"
              data-testid="dangerEndDate"
            >
              {tmnt.end_date_err}
            </div>
          </div>
          {(tmntAction !== tmntActions.Run) ? ( 
            <div className="col-md-6 d-flex justify-content-center align-items-center">
              <button
                className="btn btn-success me-2"
                onClick={handleSave}
                id="saveButton"
              >
                Save Tournament
              </button>            
              <button
                className="btn btn-danger"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          ) : null }
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
                tmntAction={tmntAction}
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
                tmntAction={tmntAction}
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
                tmntAction={tmntAction}
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
                tmntAction={tmntAction}
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
                tmntAction={tmntAction}
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
                tmntAction={tmntAction}
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
                tmntAction={tmntAction}
              />
            </Accordion.Body>
          </AccordionItem>
        </Accordion>
      </form>
    </>    
  )
}

export default TmntDataForm