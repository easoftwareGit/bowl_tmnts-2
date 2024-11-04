"use client";
import React, { useState, ChangeEvent, useRef } from "react";
import { sanitize } from "@/lib/sanitize";
import { format, startOfToday, endOfToday, formatISO, isValid, startOfDay, addDays, interval } from "date-fns";
import { todayStr, dateTo_yyyyMMdd, twelveHourto24Hour, getTimeString, dateTo_UTC_MMddyyyy } from "@/lib/dateTools";
import CurrencyInput, { formatValue } from "@/lib/currency";
import { getLocaleConfig } from "@/lib/currency/components/utils";
import { IntlConfig } from "@/lib/currency/components/CurrencyInputProps";
import EaCurrencyInput from "@/components/currency/eaCurrencyInput";
import { IMaskInput } from 'react-imask';

import "./form.css";

const ic: IntlConfig = {
  // locale: window.navigator.language,
  locale: 'en-US'
}
const localConfig = getLocaleConfig(ic);
localConfig.prefix = '$'

const eventsNames = [
  {
    id: 1,
    name: 'Singles',
  },
  {
    id: 2,
    name: 'Doubles',
  },
  {
    id: 3,
    name: 'Mixed',
  }
];

export const SampleForm: React.FC = () => {  

  const initVals = {
    start_date: todayStr,
    end_date: todayStr,    
    // start_of_day: formatISO(startOfToday()),    
    start_of_day: dateTo_UTC_MMddyyyy(startOfDay(new Date(todayStr))),
    end_of_day: formatISO(endOfToday()),
    today_as_date: new Date(todayStr),
    ten_am: "10:00",
    two_pm: "14:00",
    dollars: '123',
    event_id: 2,
    anyString: '',    
    sanitized: '',
    startGames: ''
  };

  const testDate = startOfDay(new Date(todayStr))
  const testDate2 = new Date(initVals.start_date)
  const startDate = startOfToday()
  const diff = interval(testDate, startDate)

  console.log('testDate: ', testDate) 
  console.log('startDate: ', startDate)
  console.log('diff: ', diff)

  // use ref to get access to internal "masked = ref.current.maskRef"
  const ref = useRef(null);
  const inputRef = useRef(null);
    
  const [formData, setFormData] = useState(initVals);

  // const [className, setClassName] = useState('');
  const [rawValue, setRawValue] = useState<string | undefined>(' ');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === "start_date") { 
      if (value) {
        const startDate = new Date(value);        
        if (isValid(startDate)) {
          let endDate;
          let endDateStr: string;
          const endDateInput = document.getElementById("inputEndDate") as HTMLInputElement;
          if (endDateInput && endDateInput.value === "") { 
            endDate = new Date(value)
            endDateStr = dateTo_yyyyMMdd(endDate)
            setFormData({
              ...formData,
              start_date: value,
              end_date: value,
              anyString: value,
            });
            endDateInput.value = endDateStr; 
          } else {
            endDate = new Date(formData.end_date)
            if (endDate < startDate) {            
              setFormData({
                ...formData,
                start_date: value,
                end_date: value,
                anyString: value,
              })
            }            
          }
        }
      }
    }    
  }

  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const valueAsDate = e.target.valueAsDate;
    
    if (valueAsDate) {
      const timeStr = getTimeString(valueAsDate);

      // const offset = valueAsDate.getTimezoneOffset();
      // let currentDateTime = new Date(
      //   valueAsDate.getFullYear(),
      //   valueAsDate.getMonth() - 1,
      //   valueAsDate.getDate(),
      //   valueAsDate.getHours(),
      //   valueAsDate.getMinutes() + offset
      // );
      // timeStr = currentDateTime.toLocaleTimeString([], {
      //   hour: "2-digit",
      //   minute: "2-digit",
      // });
      // timeStr = twelveHourto24Hour(timeStr);
      setFormData({
        ...formData,
        [name]: timeStr,
      });
    }
  }

  const validateValue = (value: string | undefined): void => {
    const rawValue = value === undefined ? 'undefined' : value;
    setRawValue(rawValue || ' ');

    // if (!value) {
    //   // setClassName('');
    //   value = '0'
    // } else if (Number.isNaN(Number(value))) {
    //   setErrorMessage('Please enter a valid number');
    //   // setClassName('is-invalid');
    //   value = '0'
    // } else {
    //   // setClassName('is-valid');
    // }
    setFormData({
      ...formData,
      dollars: rawValue
    })
  };

  const onBlur = () => {
    
  }

  const handleDebug = (e: React.MouseEvent<HTMLElement>) => { 

    setFormData({
      ...formData,
      sanitized: formatValue({
        value: formData.dollars,
        groupSeparator: localConfig.groupSeparator,
        decimalSeparator: localConfig.decimalSeparator,
        prefix: localConfig.prefix,
        suffix: localConfig.suffix,
        decimalScale: 2,        
        disableGroupSeparators: false,
      }),
      anyString: (Number(formData.dollars) || 0).toString()

    })
  }

  // let startGamesMask
  // const handleStartGamesFocus = () => {
  //   const startGamesInput = document?.getElementById('inputStartGames')
  //   if (startGamesInput) {
  //     startGamesMask = IMask(startGamesInput, {
  //       mask: /\d(\d)?(,(\d(\d)?)?)*$/
  //     })
  //     const r = new IMask.MaskedRegExp({
  //       mask: /\d(\d)?(,(\d(\d)?)?)*$/
  //     })
  //     const m = IMask(startGamesInput, {
        
  //     })
  //   }
  // }

  const handleEventSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { selectedIndex } = e.target;
    setFormData({
      ...formData,
      event_id: eventsNames[selectedIndex].id
    })
  }

  const eventOptions = eventsNames.map(event => (
    <option key={event.id} value={event.id}>
      {event.name}
    </option>
  ))

  return (
    <>
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label htmlFor="inputStartDate" className="form-label">
            Start Date
          </label>
          <input
            type="date"
            className="form-control"
            id="inputStartDate"
            name="start_date"
            value={formData.start_date}
            onChange={handleInputChange}            
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="inputEndDate" className="form-label">
            End Date
          </label>
          <input
            type="date"
            className="form-control"
            id="inputEndDate"
            name="end_date"
            value={formData.end_date}
            onChange={handleInputChange}            
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="inputStartOfDay" className="form-label">
            Start of Day
          </label>
          <input
            type="text"
            className="form-control"
            id="inputStartOfDay"
            name="start_of_date"
            value={formData.start_of_day}
            readOnly
          />
        </div>
        <div className="col-md-3">
        <label htmlFor="inputEndOfDay" className="form-label">
            End of Day
          </label>
          <input
            type="text"
            className="form-control"
            id="inputEndOfDay"
            name="end_of_date"
            value={formData.end_of_day}
            readOnly
          />
        </div>
      </div>
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label htmlFor="inputTodayStr" className="form-label">
            todayStr
          </label>
          <input
            type="text"
            className="form-control"
            id="inputTodayStr"
            name="start_games"
            value={todayStr} 
            readOnly
          />
          {/* <label htmlFor="inputStartGames" className="form-label">
            todayStr
          </label>
          <IMaskInput
            ref={ref}
            inputRef={inputRef}
            unmask={true}
            mask={/\d(\d)?(,(\d(\d)?)?)*$/}
            className="form-control"            
            placeholder="#,#"
          /> */}
        </div>
        <div className="col-md-3">
          <label htmlFor="inputAnyString" className="form-label">
            Any String
          </label>
          <input
            type="text"
            className="form-control"
            id="inputString"
            name="anyString"
            value={formData.anyString}
            onChange={handleInputChange}
          />
        </div>        
        <div className="col-md-3">
          <button
            className="btn btn-info"
            onClick={handleDebug}
          >
            Debug
          </button>
        </div>
        <div className="col-md-3">
        <label htmlFor="inputSanitized" className="form-label">
            Sanitized
          </label>
          <input
            type="text"
            className="form-control"
            id="inputSanitized"
            name="sanitized"
            value={formData.sanitized}
            readOnly
          />
        </div>
      </div>
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label htmlFor="inputTime10AM" className="form-label">
            Time 10AM
          </label>
          <input
            type="time"
            className="form-control"
            id="inputTime10AM"
            name="time_10am"
            value={formData.ten_am}            
            onChange={handleTimeChange}
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="selectEvent" className="form-label">
            Event
          </label>
          <select
            id="selectEvent"            
            className="form-select"
            onChange={handleEventSelectChange}
            defaultValue={eventsNames[0].id}
            value={formData.event_id}
          >
            {eventOptions}
          </select>
        </div>
      </div>
    </>
  );
};
