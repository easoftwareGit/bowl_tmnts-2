import React, { useState, ChangeEvent } from "react";
import { eventType, AcdnErrType, squadType, lpoxValidTypes } from "../../../lib/types/types";
import { initEvent } from "../../../lib/db/initVals";
import { Tabs, Tab } from "react-bootstrap";
import ModalConfirm, { delConfTitle } from "@/components/modal/confirmModal";
import ModalErrorMsg, { cannotDeleteTitle } from "@/components/modal/errorModal";
import { initModalObj } from "@/components/modal/modalObjType";
import { formatValue2Dec } from "@/lib/currency/formatValue";
import { 
  objErrClassName,
  acdnErrClassName,
  getAcdnErrMsg,
  noAcdnErr,
  isDuplicateEventName,
} from "./errors";
import {
  maxEventLength,
  minGames,
  maxGames,
  minTeamSize,
  maxTeamSize,
  zeroAmount,
  maxMoney,
} from "@/lib/validation";
import EaCurrencyInput, { minMoneyText, maxMoneyText } from "@/components/currency/eaCurrencyInput";
import { localConfig, currRexEx } from "@/lib/currency/const";
import { btDbUuid } from "@/lib/uuid";

interface ChildProps {
  events: eventType[];
  setEvents: (events: eventType[]) => void;
  squads: squadType[],
  setSquads: (squds: squadType[]) => void;
  setAcdnErr: (objAcdnErr: AcdnErrType) => void;    
}
interface AddOrDelButtonProps {
  id: string,
  sortOrder: number;
}

// const defaultTabKey = "event1";

const amountFields = [
  "entry_fee",
  "lineage",
  "prize_fund",
  "other",
  "expenses",
  "added_money",
];

const getEventErrMsg = (event: eventType): string => {
  if (event.event_name_err) return event.event_name_err;
  if (event.team_size_err) return event.team_size_err;
  if (event.games_err) return event.games_err;  
  if (event.added_money_err) return event.added_money_err;
  if (event.entry_fee_err) return event.entry_fee_err;
  if (event.lineage_err) return event.lineage_err;
  if (event.prize_fund_err) return event.prize_fund_err;
  if (event.other_err) return event.other_err;
  if (event.expenses_err) return event.expenses_err;
  if (event.lpox_err) return event.lpox_err;
  return "";
};

const getNextAcdnErrMsg = (
  updatedEvent: eventType | null,
  events: eventType[]
): string => {
  let errMsg = "";
  let acdnErrMsg = "";
  let i = 0;
  let event: eventType;
  while (i < events.length && !errMsg) {
    event = (events[i].id === updatedEvent?.id) ? updatedEvent : events[i];    
    errMsg = getEventErrMsg(event);
    if (errMsg) {
      acdnErrMsg = getAcdnErrMsg(event.event_name, errMsg);
    }
    i++;
  }
  return acdnErrMsg;
};

export const validateEvents = (
  events: eventType[],
  setEvents: (events: eventType[]) => void,
  setAcdnErr: (objAcdnErr: AcdnErrType) => void
): boolean => { 
  let areEventsValid = true;
  let nameErr = '';
  let teamErr = '';
  let gamesErr = '';
  let addedMoneyErr = '';
  let entryFeeErr = ''
  let lineageErr = ''
  let prizeErr = ''
  let otherErr = ''
  let expensesErr = ''
  let lpoxFeeErr = ''
  let eventErrClassName = '';

  const setError = (eventName: string, errMsg: string) => {
    if (areEventsValid) {
      setAcdnErr({
        errClassName: acdnErrClassName,
        message: getAcdnErrMsg(eventName, errMsg),
      });
    }
    areEventsValid = false;
    eventErrClassName = objErrClassName;
  };

  setEvents(
    events.map((event) => {
      eventErrClassName = '';
      if (!event.event_name.trim()) {
        nameErr = "Event Name is required";
        setError("Events", nameErr);
      } else if (isDuplicateEventName(events, event)) {
        nameErr = `"${event.event_name}" has already been used.`;
        setError(event.event_name, nameErr);
      } else {
        nameErr = '';
      }
      if (event.team_size < minTeamSize) {
        teamErr = "Team Size cannot be less than " + minTeamSize;
        setError(event.event_name, teamErr);
      } else if (event.team_size > maxTeamSize) {
        teamErr = "Team Size cannot be more than " + maxTeamSize;
        setError(event.event_name, teamErr);
      } else {
        teamErr = '';
      }
      if (event.games < minGames) {
        gamesErr = "Event Games cannot be less than " + minGames;
        setError(event.event_name, gamesErr);
      } else if (event.games > maxGames) {
        gamesErr = "Event Games cannot be more than " + maxGames;
        setError(event.event_name, gamesErr);
      } else {
        gamesErr = '';
      }
      const addedMoney = Number(event.added_money)
      if (typeof addedMoney !== 'number') {
        addedMoneyErr = 'Invalid Added $'
        setError(event.event_name, addedMoneyErr);
      } else if (addedMoney < zeroAmount) {
        addedMoneyErr = 'Added $ cannot be less than ' + minMoneyText;
        setError(event.event_name, addedMoneyErr);
      } else if (addedMoney > maxMoney) {        
        addedMoneyErr = 'Added $ cannot be more than ' + maxMoneyText;
        setError(event.event_name, addedMoneyErr);
      } else {
        addedMoneyErr = '';
      }
      const entryFee = Number(event.entry_fee)      
      if (typeof entryFee !== 'number') {
        entryFeeErr = 'Invalid Entry Fee'
        setError(event.event_name, entryFeeErr);
      } else if (entryFee < zeroAmount) {
        entryFeeErr = 'Entry Fee cannot be less than ' + minMoneyText;
        setError(event.event_name, entryFeeErr);
      } else if (entryFee > maxMoney) {
        entryFeeErr = 'Entry Fee cannot be more than ' + maxMoneyText;
        setError(event.event_name, entryFeeErr);
      } else {
        entryFeeErr = ''
      }
      const lineage = Number(event.lineage)
      if (typeof lineage !== 'number') {
        lineageErr = 'Invalid Lineage'
        setError(event.event_name, lineageErr);
      } else if (lineage < zeroAmount) {
        lineageErr = 'Lineage cannot be less than ' + minMoneyText;
        setError(event.event_name, lineageErr);
      } else if (lineage > maxMoney) {
        lineageErr = 'Lineage cannot be more than ' + maxMoneyText;
        setError(event.event_name, lineageErr);
      } else {
        lineageErr = ''
      }
      const prize = Number(event.prize_fund)
      if (typeof prize !== 'number') {
        prizeErr = 'Invalid Prize Fund'
        setError(event.event_name, prizeErr);
      } else if (prize < zeroAmount) {
        prizeErr = 'Prize Fund cannot be less than ' + minMoneyText;
        setError(event.event_name, prizeErr);
      } else if (prize > maxMoney) {
        prizeErr = 'Prize Fund cannot be more than ' + maxMoneyText;
        setError(event.event_name, prizeErr);
      } else {
        prizeErr = ''
      }
      const other = Number(event.other)
      if (typeof other !== 'number') {
        otherErr = 'Invalid Other'
        setError(event.event_name, otherErr);
      } else if (other < zeroAmount) {
        otherErr = 'Other cannot be less than ' + minMoneyText;
        setError(event.event_name, otherErr);
      } else if (other > maxMoney) {
        otherErr = 'Other cannot be more than ' + maxMoneyText;
        setError(event.event_name, otherErr);
      }
      const expenses = Number(event.expenses)
      if (typeof expenses !== 'number') {
        expensesErr = 'Invalid Expenses'
        setError(event.event_name, expensesErr);
      } else if (expenses < zeroAmount) {
        expensesErr = 'Expenses cannot be less than ' + minMoneyText;
        setError(event.event_name, expensesErr);
      } else if (expenses > maxMoney) {
        expensesErr = 'Expenses cannot be more than ' + maxMoneyText;
        setError(event.event_name, expensesErr);
      }
      const LPOX = Number(event.lpox)
      if (typeof LPOX !== 'number') {
        lpoxFeeErr = 'Invalid LPOX'
        setError(event.event_name, lpoxFeeErr);
      }
      if (entryFee >= zeroAmount && entryFee <= maxMoney &&
          lineage >= zeroAmount && lineage <= maxMoney &&
          prize >= zeroAmount && prize <= maxMoney &&    
          other >= zeroAmount && other <= maxMoney &&
          expenses >= zeroAmount && expenses <= maxMoney &&
          entryFee !== LPOX) {
        lpoxFeeErr = 'Entry Fee ≠ LPOX'
        setError(event.event_name, lpoxFeeErr);
      } else {
        lpoxFeeErr = ''
      }

      return {
        ...event,
        event_name_err: nameErr,
        team_size_err: teamErr,
        games_err: gamesErr,
        added_money_err: addedMoneyErr,
        entry_fee_err: entryFeeErr,
        lineage_err: lineageErr,
        prize_fund_err: prizeErr,
        other_err: otherErr,
        expenses_err: expensesErr,
        lpox_err: lpoxFeeErr,
        errClassName: eventErrClassName,
      };
    })
  );
  if (areEventsValid) {1
    setAcdnErr(noAcdnErr);
  }
  return areEventsValid;
}

const OneToNEvents: React.FC<ChildProps> = ({
  events,
  setEvents,
  squads,
  setSquads,
  setAcdnErr,  
}) => {
  
  const defaultTabKey = events[0].id;

  const [confModalObj, setConfModalObj] = useState(initModalObj);
  const [errModalObj, setErrModalObj] = useState(initModalObj);
  const [tabKey, setTabKey] = useState(defaultTabKey);  
  const [sortOrder, setSortOrder] = useState(1); // id # used in initEvents in form.tsx
  
  const tmntId = events[0].tmnt_id; // save parent id for all events 

  const handleAdd = () => {
    const newEvent: eventType = {
      ...initEvent,      
      id: btDbUuid('evt'),
      tmnt_id: tmntId,
      sort_order: sortOrder + 1,
      event_name: "Event " + (sortOrder + 1),
      tab_title: "Event " + (sortOrder + 1),      
    };
    setSortOrder(sortOrder + 1);
    setEvents([...events, newEvent]);    
  };

  const confirmedDelete = () => {    
    const idToDel = confModalObj.id;
    setConfModalObj(initModalObj); // reset modal object (hides modal)

    // filter out deleted event
    const updatedData = events.filter((event) => event.id !== idToDel);
    setEvents(updatedData);

    // deleted event might have an acdn error, get next acdn error
    const acdnErrMsg = getNextAcdnErrMsg(null, updatedData);
    if (acdnErrMsg) {
      setAcdnErr({
        errClassName: acdnErrClassName,
        message: acdnErrMsg
      })
    } else {
      setAcdnErr(noAcdnErr)
    }

    setTabKey(defaultTabKey); // refocus 1st event
  };

  const canceledDelete = () => {    
    setConfModalObj(initModalObj); // reset modal object (hides modal)
  };

  const canceledModalErr = () => {    
    setErrModalObj(initModalObj); // reset modal object (hides modal)
  };

  const eventHasSquads = (eventToDel: eventType): boolean => {    
    return squads.some((squad) => squad.event_id === eventToDel.id);
  }

  const handleDelete = (id: string) => {
    const eventToDel = events.find((event) => event.id === id);    
    // if did not find event OR only 1 event (must have at least 1 event)
    if (!eventToDel || events.length === 1) return;
    
    const toDelName = eventToDel.event_name;
    if (eventHasSquads(eventToDel)) {
      setErrModalObj({
        show: true,
        title: cannotDeleteTitle,
        message: `Cannot delete Event: ${toDelName}. It has a Squad.`,
        id: id,
      });
    } else {
      setConfModalObj({
        show: true,
        title: delConfTitle,
        message: `Do you want to delete Event: ${toDelName}?`,
        id: id,
      }); // deletion done in confirmedDelete
    }
  };

  const handleAmountValueChange = (id: string, name: string) => (value: string | undefined): void => {
    const nameErr = name + "_err";
    let rawValue = value === undefined ? 'undefined' : value;
    rawValue = (rawValue || ' ');

    // console.log(`handleAmountValueChange; id: "${id}", name: "${name}", value: "${value}"`);    

    setEvents(
      events.map((event) => {
        if (event.id === id) {
          if (rawValue && Number.isNaN(Number(rawValue))) {
            rawValue = ''
          } 
          let updatedEvent: eventType;
          updatedEvent = {
            ...event,
            [name]: rawValue,
            [nameErr]: ''
          }
          // if part of the entry fee, clear lpox error message if editing          
          if (name !== 'added_money') {     
            // get current value in object
            // typescript will not allow event[name] here
            let numVal = 0
            if (name === 'entry_fee') {
              numVal = Number(event.entry_fee)
            } else if (name === 'lineage') {
              numVal = Number(event.lineage)
            } else if (name === 'prize_fund') { 
              numVal = Number(event.prize_fund)
            } else if (name === 'other') { 
              numVal = Number(event.other)
            } else if (name === 'expenses') { 
              numVal = Number(event.expenses)
            } 
            // if losing focus, rawValue will equal object value,
            // user not editing, do not clear lpox error
            if (numVal !== Number(rawValue)) {
              // clear lpox error if user editing
              updatedEvent = {
                ...updatedEvent,
                lpox_err: '',
              }
            }        
          }
          const acdnErrMsg = getNextAcdnErrMsg(updatedEvent, events);
          if (acdnErrMsg) {
            setAcdnErr({
              errClassName: acdnErrClassName,
              message: acdnErrMsg,
            });
          } else {
            setAcdnErr(noAcdnErr);
          }
          const errMsg = getEventErrMsg(updatedEvent);
          if (errMsg) {
            return {
              ...updatedEvent,
              errClassName: objErrClassName,
            };
          } else {
            return {
              ...updatedEvent,
              errClassName: '',
            };
          }
        } else {
          return event;
        }
      })
    )
  };
  
  const handleInputChange = (id: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nameErr = name + "_err";

    setEvents(
      events.map((event) => {
        if (event.id === id) {
          let updatedEvent: eventType;
          // set tabTitle changing event_name property value
          if (name === "event_name") {
            updatedEvent = {
              ...event,
              event_name: value,
              tab_title: value,
              event_name_err: "",
            };
          } else if (name === 'team_size') {
            const teamSizeNum = Number(value)
            if (typeof teamSizeNum === 'number') {
              updatedEvent = {
                ...event,
                team_size: teamSizeNum,
                team_size_err: "",
              };
            } else {
              updatedEvent = {
                ...event
              }              
            }
          } else if (name === 'games') {
            const gamesNum = Number(value)
            if (typeof gamesNum === 'number') {
              updatedEvent = {
                ...event,
                games: gamesNum,
                games_err: "",
              };    
              if (gamesNum >= minGames && gamesNum <= maxGames) {                
                  setSquads(
                    squads.map((squad) => {
                      if (squad.event_id === event.id) {
                        const squadGames = (squad.games === event.games || event.games === 0) ? updatedEvent.games : squad.games;
                        return {
                          ...squad,
                          games: squadGames,
                        }
                      } else {
                        return squad;
                      }
                    })
                  )
                // }
              }
            } else {
              updatedEvent = {
                ...event
              }              
            }
          } else {
            updatedEvent = {
              ...event,
              [name]: value,
              [nameErr]: "",
            };
          }
          const acdnErrMsg = getNextAcdnErrMsg(updatedEvent, events);
          if (acdnErrMsg) {
            setAcdnErr({
              errClassName: acdnErrClassName,
              message: acdnErrMsg,
            });
          } else {
            setAcdnErr(noAcdnErr);
          }
          const errMsg = getEventErrMsg(updatedEvent);
          if (errMsg) {
            return {
              ...updatedEvent,
              errClassName: objErrClassName,
            };
          } else {
            return {
              ...updatedEvent,
              errClassName: "",
            };
          }
        } else {
          return event;
        }
      })
    );
  };

  const updateLPOX = (event: eventType, name: string, value: string): eventType => {
    const nameErr = name + "_err";
    const valNoSymb = value.replace(currRexEx, '')
    let formattedValue = (value) ? formatValue2Dec(valNoSymb, localConfig) : '';

    if (formattedValue === 'NaN') {
      formattedValue = ''
    }
    if (typeof (Number(formattedValue)) !== 'number') {
      formattedValue = ''
    }
    const valueNum = Number(formattedValue)
    if (valueNum < zeroAmount || valueNum > maxMoney) {
      formattedValue = ''
    }
    const temp_event = {
      ...event,
      [name]: formattedValue,
      [nameErr]: '',
    }
    let lpoxStr = ''
    let lpoxValid: lpoxValidTypes = ''
    if (!temp_event.entry_fee
        && !temp_event.lineage
        && !temp_event.prize_fund
        && !temp_event.other
        && !temp_event.expenses) {
    } else {
      const lpoxNum = Number(temp_event.lineage)
        + Number(temp_event.prize_fund)
        + Number(temp_event.other)
        + Number(temp_event.expenses);
      lpoxStr = formatValue2Dec(lpoxNum.toString(), localConfig)
      if (Number(temp_event.entry_fee) === lpoxNum) {
        lpoxValid = 'is-valid'        
      } else {
        lpoxValid = 'is-invalid'      
      }
    }
    return {
      ...temp_event,
      lpox: lpoxStr,
      lpox_valid: lpoxValid
    } 
  }

  const handleBlur = (id: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (amountFields.includes(name) && (value)) {
      setEvents(
        events.map((event) => {
          if (event.id === id) {
            const temp_event = updateLPOX(event, name, value)
            return {
              ...temp_event
            }
          } else {
            return event;
          }
        })
      )
    }

    if (!value.trim()) {
      setEvents(
        events.map((event) => {
          if (event.id === id) {
            if (name === "name") {
              return {
                ...event,
                name: "Event " + event.id,
                tabTitle: "Event " + event.id,
                name_err: "",
              };
            } else if (name === "team_size") {
              return {
                ...event,
                team_size: 1,
                team_size_err: '',
              };
            } else if (name === "games") {
              return {
                ...event,
                games: 3,
                games_err: '',
              };
            } else if (amountFields.includes(name)) {              
              const temp_event = updateLPOX(event, name, value);
              return {
                ...temp_event,
              };
            } else {
              return event;
            }
          } else {
            return event;
          }
        })
      );
    }
  };

  const handleTabSelect = (key: string | null) => {
    if (key) {
      setTabKey(key);
    }
  };

  const AddOrDelButton: React.FC<AddOrDelButtonProps> = ({ id, sortOrder }) => {
    if (sortOrder === 1) {
      return (
        <div className="col-sm-3">
          <label htmlFor="inputNumEvents" className="form-label">
            # Events
          </label>
          <div className="row g-0">
            <div className="col-sm-8">
              <input
                disabled
                type="text"
                className="form-control"
                id="inputNumEvents"                
                name="num_events"
                value={events.length}
              />
            </div> 
            <div className="d-grid col-sm-4">            
              <button
                className="btn btn-success"
                id="eventAdd"
                data-testid="eventAdd"
                onClick={handleAdd}                  
              >
                Add
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="col-sm-3 d-flex justify-content-center align-items-end">
          <button
            className="btn btn-danger"
            id="eventDel"
            onClick={() => handleDelete(id)}
          >
            Delete Event
          </button>
        </div>
      );
    }
  };

  return (
    <>
      <ModalConfirm
        show={confModalObj.show}
        title={confModalObj.title}
        message={confModalObj.message}
        onConfirm={confirmedDelete}
        onCancel={canceledDelete}
      />
      <ModalErrorMsg
        show={errModalObj.show}
        title={errModalObj.title}
        message={errModalObj.message}   
        onCancel={canceledModalErr}
      />
      <Tabs
        defaultActiveKey={defaultTabKey}
        id="event-tabs"
        className="mb-2"
        variant="pills"
        activeKey={tabKey}
        onSelect={handleTabSelect}
      >
        {events.map((event) => (
          <Tab
            key={event.id}
            eventKey={`${event.id}`}
            title={event.tab_title}
            tabClassName={`${event.errClassName}`}            
          >
            <div className="row g-3 mb-3">
              {/* AddOrDelButton includes a <div className="col-sm-3">...</div> */}
              <AddOrDelButton id={event.id} sortOrder={event.sort_order} />
              <div className="col-sm-3">
                <label
                  htmlFor={`inputEventName${event.id}`}
                  className="form-label"
                >
                  Event Name
                </label>
                <input
                  type="text"                  
                  name="event_name"
                  className={`form-control ${event.event_name_err && "is-invalid"}`}
                  id={`inputEventName${event.id}`}                                                  
                  value={event.event_name}
                  maxLength={maxEventLength}
                  onChange={handleInputChange(event.id)}
                  onBlur={handleBlur(event.id)}                  
                />
                <div
                  className="text-danger"
                  data-testid="dangerEventName"
                >
                  {event.event_name_err}
                </div>
              </div>
              <div className="col-sm-2">
                <label                  
                  htmlFor={`inputTeamSize${event.id}`}
                  className="form-label"
                  title="Singles = 1, Doubles = 2..."
                >
                  Team Size <span className="popup-help">&nbsp;?&nbsp;</span>
                </label>
                <input
                  type="number"
                  step={1}
                  className={`form-control ${event.team_size_err && "is-invalid"}`}
                  id={`inputTeamSize${event.id}`}                  
                  name="team_size"
                  value={event.team_size}
                  onChange={handleInputChange(event.id)}
                  onBlur={handleBlur(event.id)}
                />
                <div
                  className="text-danger"
                  data-testid="dangerTeamSize"
                >
                  {event.team_size_err}
                </div>
              </div>
              <div className="col-sm-2">
                <label
                  htmlFor={`inputEventGames${event.id}`}
                  className="form-label"
                >
                  Event Games
                </label>
                <input
                  type="number"
                  step={1}
                  className={`form-control ${event.games_err && "is-invalid"}`}
                  id={`inputEventGames${event.id}`}                  
                  name="games"
                  value={event.games}
                  onChange={handleInputChange(event.id)}
                  onBlur={handleBlur(event.id)}
                />
                <div
                  className="text-danger"
                  data-testid="dangerEventGames"
                >
                  {event.games_err}
                </div>
              </div>
              <div className="col-sm-2">
                <label
                  htmlFor={`inputEventAddedMoney${event.id}`}
                  className="form-label"
                  title="Total Prize Fund = Added $ + (Entry Prize Fund * Number of Entries)"
                >
                  Added $ <span className="popup-help">&nbsp;?&nbsp;</span>
                </label>
                <EaCurrencyInput
                  id={`inputEventAddedMoney${event.id}`}                  
                  name="added_money"
                  className={`form-control ${event.added_money_err && "is-invalid"}`}
                  value={event.added_money}
                  onValueChange={handleAmountValueChange(event.id, 'added_money')}                  
                />
                <div
                  className="text-danger"
                  data-testid="dangerEventAddedMoney"
                >
                  {event.added_money_err}
                </div>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-sm-2">
                <label
                  htmlFor={`inputEventEntryFee${event.id}`}
                  className="form-label"
                >
                  Entry Fee
                </label>
                <EaCurrencyInput
                  id={`inputEventEntryFee${event.id}`}                  
                  name="entry_fee"
                  className={`form-control ${event.entry_fee_err && "is-invalid"}`}
                  value={event.entry_fee}
                  onValueChange={handleAmountValueChange(event.id, 'entry_fee')}
                  // onValueChange={handleAmountValueChange2(event.id, 'entry_fee')}
                  onBlur={handleBlur(event.id)}
                />
                <div
                  className="text-danger"
                  data-testid="dangerEventEntryFee"
                >
                  {event.entry_fee_err}
                </div>
              </div> 
              <div className="col-sm-2">
                <label
                  htmlFor={`inputEventLineage${event.id}`}
                  className="form-label"
                >
                  Lineage
                </label>
                <EaCurrencyInput
                  id={`inputEventLineage${event.id}`}                  
                  name="lineage"
                  className={`form-control ${event.lineage_err && "is-invalid"}`}
                  value={event.lineage}
                  onValueChange={handleAmountValueChange(event.id, 'lineage')}
                  onBlur={handleBlur(event.id)}
                />
                <div
                  className="text-danger"
                  data-testid="dangerEventLineage"
                >
                  {event.lineage_err}
                </div>
              </div>
              <div className="col-sm-2">
                <label
                  htmlFor={`inputEventPrizeFund${event.id}`}
                  className="form-label"
                >
                  Prize Fund
                </label>
                <EaCurrencyInput
                  id={`inputEventPrizeFund${event.id}`}                  
                  name="prize_fund"
                  className={`form-control ${event.prize_fund_err && "is-invalid"}`}
                  value={event.prize_fund}
                  onValueChange={handleAmountValueChange(event.id, 'prize_fund')}
                  onBlur={handleBlur(event.id)}
                />
                <div
                  className="text-danger"
                  data-testid="dangerEventPrizeFund"
                >
                  {event.prize_fund_err}
                </div>
              </div>
              <div className="col-sm-2">
                <label
                  htmlFor={`inputEventOther${event.id}`}
                  className="form-label"
                >
                  Other
                </label>
                <EaCurrencyInput
                  id={`inputEventOther${event.id}`}                  
                  name="other"
                  className={`form-control ${event.other_err && "is-invalid"}`}
                  value={event.other}
                  onValueChange={handleAmountValueChange(event.id, 'other')}
                  onBlur={handleBlur(event.id)}
                />
                <div
                  className="text-danger"
                  data-testid="dangerEventOther"
                >
                  {event.other_err}
                </div>
              </div>
              <div className="col-sm-2">
                <label
                  htmlFor={`inputEventExpenses${event.id}`}
                  className="form-label"
                >
                  Expenses
                </label>
                <EaCurrencyInput
                  id={`inputEventExpenses${event.id}`}                  
                  name="expenses"
                  className={`form-control ${event.expenses_err && "is-invalid"}`}
                  value={event.expenses}
                  onValueChange={handleAmountValueChange(event.id, 'expenses')}
                  onBlur={handleBlur(event.id)}
                />
                <div
                  className="text-danger"
                  data-testid="dangerEventExpenses"
                >
                  {event.expenses_err}
                </div>
              </div>
              <div className="col-sm-2">
                <label
                  htmlFor={`inputEventLPOX${event.id}`}
                  className="form-label"
                  title="Lineage + Prize Fund + Other + eXpeses must equal Entry Fee"
                >
                  L+P+O+X <span className="popup-help">&nbsp;?&nbsp;</span>
                </label>
                <EaCurrencyInput
                  id={`inputEventLPOX${event.id}`}                  
                  name="lpox"
                  className={`form-control ${event.lpox_valid}`}
                  value={event.lpox}
                  disabled
                />
                <div
                  className="text-danger"
                  data-testid="dangerEventLpox"
                >
                  {event.lpox_err}
                </div>
              </div>
            </div>
          </Tab>
        ))}
      </Tabs>
    </>
  );
};

export default OneToNEvents;
