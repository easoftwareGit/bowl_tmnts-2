"use client"
import React, { useState, ChangeEvent } from 'react'
import { eventType, squadType } from '../../lib/types/types'
import { initModalObj } from '@/components/modal/modalObjType'
import { maxGames, minGames } from '@/lib/validation/validation'
import { objErrClassName } from '../dataEntry/tmntForm/errors'
import ModalConfirm from '@/components/modal/confirmModal'
import EaCurrencyInput from '@/components/currency/eaCurrencyInput'

export type petType = {
  id: number;
  name: string;
};

const fruits = [
  {
    id: 1,
    name: 'Apple',
  },
  {
    id: 2,
    name: 'Banana',
  },
  {
    id: 3,
    name: 'Cherry',
  }
]

const numbers = [
  {
    id: 1,
    name: 'One',
  },
  {
    id: 2,
    name: 'Two',
  },
  {
    id: 3,
    name: 'Three',
  }
]

const pets = [
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

interface ChildProps {
  events: eventType[];
  setEvents: (events: eventType[]) => void;
  // pets: petType[],
  // setPets: (pets: petType[]) => void;  
}

export const Form3: React.FC<ChildProps> = ({
  events,
  setEvents,
  // pets,
  // setPets
}) => {
  const [petId, setPetId] = useState(4);
  const [confModalObj, setConfModalObj] = useState(initModalObj);
  const [pets, setPets] = useState<petType[]>([]);

  const handleAdd = () => {
    const newPet: petType = {
      id: (petId),
      name: events[0].event_name,     
    }    
    setPetId(petId + 1);
    setPets([...pets, newPet]);    
  }

  const confirmedDelete = () => {
    setConfModalObj(initModalObj); // reset modal object (hides modal)
  };

  const canceledDelete = () => {
    setConfModalObj(initModalObj); // reset modal object (hides modal)
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
          const errMsg = ""
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

    // console.log('handleInputChange; name: ', name, 'value: ', value)

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
          } else if (name === 'games') {
            const gamesNum = Number(value)

            if (typeof gamesNum === 'number') {
              updatedEvent = {
                ...event,
                games: gamesNum,
                games_err: "",
              };
            } else {
              updatedEvent = {
                ...event
              }
            }
            // if (typeof gamesNum === 'number' && gamesNum >= minGames && gamesNum <= maxGames) {
            //   updatedEvent = {
            //     ...event,
            //     games: Number(value),
            //     games_err: "",
            //   };    
            //   setSquads(
            //     squads.map((squad: squadType) => {
            //       if (squad.event_id === event.id) {
            //         const squadGames = (squad.games === event.games) ? updatedEvent.games : squad.games;                      
            //         return {
            //           ...squad,
            //           games: squadGames,
            //         }
            //       } else {
            //         return squad;
            //       }
            //     })
            //   )
            // } else {
            //   updatedEvent = {
            //     ...event
            //   }              
            // }
          } else {
            updatedEvent = {
              ...event,
              [name]: value,
              [nameErr]: "",
            };
          }
          const errMsg = "";
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

  const handleEventSelectChange = (id: string) => (e: ChangeEvent<HTMLSelectElement>) => {
    const { selectedIndex } = e.target;
    setEvents(
      events.map(event => {
        if (event.id === id) {
          // get pet id # from selectedIndex of pets
          const petId = pets[selectedIndex - 1].id.toString();
          return {
            ...event, 
            lineage: petId,
            lineage_err: '',
          }          
        } else {
          return event
        }
      })
    )
  };

  const petOptions = pets.map(pet => (
    <option key={pet.id} value={pet.id}>
      {pet.name}
    </option>
  ));

  return (
    <>
      <ModalConfirm
        show={confModalObj.show}
        title={confModalObj.title}
        message={confModalObj.message}
        onConfirm={confirmedDelete}
        onCancel={canceledDelete}
      />
      {events.map((event) => (
        <div className='row g-3 mb-3' key={event.id}>
          <div className='col-sm-2'>
            <label htmlFor="inputEventName" className="form-label">
              Event Name
            </label>
            <input
              type="text"
              className="form-control"
              id="inputEventName"              
              name="event_name"
              value={event.event_name}
              onChange={handleInputChange(event.id)}
            />
            <div
              className="text-danger"
              data-testid="dangerEventName"
            >
              {event.event_name_err}              
            </div>            
          </div>
          <div className='col-sm-2 d-flex justify-content-center align-items-end'>
            <button className="btn btn-success" onClick={() => handleAdd()}>
              Add Pet
            </button>
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
              min={minGames}
              max={maxGames}
              step={1}
              className={`form-control ${event.games_err && "is-invalid"}`}
              id={`inputEventGames${event.id}`}
              data-testid="inputEventGames"
              name="games"
              value={event.games}
              onChange={handleInputChange(event.id)}              
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
              htmlFor={`inputEventEntryFee${event.id}`}
              className="form-label"
            >
              Entry Fee
            </label>
            <EaCurrencyInput
              id={`inputEventEntryFee${event.id}`}
              data-testid="inputEventEntryFee"
              name="entry_fee"
              className={`form-control ${event.entry_fee_err && "is-invalid"}`}
              value={event.entry_fee}
              onValueChange={handleAmountValueChange(event.id, 'entry_fee')}              
            />
            <div
              className="text-danger"
              data-testid="dangerEventEntryFee"
            >
              {event.entry_fee_err}
            </div>
          </div> 
          <div className="col-sm-3">
            <label
              htmlFor={`inputPet${event.id}`}
              className="form-label"
            >
              Event
            </label>
            <select
              id={`inputPet${event.id}`}
              data-testid="inputPet"
              className={`form-select ${event.lineage_err && "is-invalid"}`}
              onChange={handleEventSelectChange(event.id)}
              // defaultValue={pets[0].id}
              // value={event.lineage}
              defaultValue='Choose...'
            >
              <option disabled>Choose...</option>
              {petOptions}
            </select>
            <div
              className="text-danger"
              data-testid="dangerSquadEvent"
            >
              {event.lineage_err}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}