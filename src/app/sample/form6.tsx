"use client";
import React, { useState, ChangeEvent } from "react";
import { addDays, addMilliseconds, endOfToday, isDate, isValid, startOfToday } from "date-fns";
import {
  todayStr,
  dateTo_UTC_yyyyMMdd,
  dateTo_yyyyMMdd,
  dateTo_UTC_MMddyyyy,
  startOfDayFromString,
  nowOnDayFromString,
  endOfDayFromString,
  todayStrMMddyyyy,
  startOfTodayUTC,
  yyyyMMdd_To_ddMMyyyy,
} from "@/lib/dateTools";
import ModalConfirm, { cancelConfTitle } from "@/components/modal/confirmModal";
import { initModalObj } from "@/components/modal/modalObjType";
import { useRouter } from "next/navigation"

import "./form.css";

const sod = startOfDayFromString(todayStr) as Date
const eod = endOfDayFromString(todayStr) as Date
const nd = nowOnDayFromString(todayStr) as Date

export const Form6: React.FC = () => {
  const initVals = {
    sod,    
    sodStr: dateTo_yyyyMMdd(sod),
    prismaSod: new Date(todayStr),
    eod,    
    eodStr: dateTo_yyyyMMdd(eod),
    prismaEod: addMilliseconds(addDays(new Date(todayStr), 1), -1),
    nd,  
    ndStr: dateTo_yyyyMMdd(nd),
    prismaNd: new Date(),
    di: todayStr,
  }; 

  const toDayStr_to_MMddyyyy = yyyyMMdd_To_ddMMyyyy(todayStr)

  const [formData, setFormData] = useState(initVals);

  const router = useRouter();
  const [modalObj, setModalObj] = useState(initModalObj);

  const confirmedCancel = () => {        
    setModalObj(initModalObj);  // reset modal object (hides modal)    
    router.push('/user/tmnts'); // back to list of tournaments    
  };

  const canceledCancel = () => {    
    setModalObj(initModalObj); // reset modal object (hides modal)
  };


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    const isValidDate = isValid(new Date(value))
    console.log("isValidDate: ", isValidDate, ' value: ', value);
    // if user enters invalid data, value will be empty string
    if (!isValid(new Date(value))) return;
    const newFormData = {
      ...formData,
    }
    if (name === "sod") {
      // need to have SDO string for input, then convert to SOD date
      newFormData.sodStr = value         
      newFormData.sod = startOfDayFromString(value) as Date;
    } else if (name === "eod") {
      newFormData.eodStr = value      
      newFormData.eod = endOfDayFromString(value) as Date;
    } else if (name === "nd") {
      newFormData.ndStr = value         
      newFormData.nd = nowOnDayFromString(value) as Date;
    } else if (name === "dateInput") {
      newFormData.di = value
    }
    setFormData({
      ...newFormData,      
    });
  };

  const diHandleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDebug = (e: React.MouseEvent<HTMLElement>) => {
    setFormData({
      ...formData,
      di: '2024-01-01',
    })
  };

  const handleCancel = () => {    
    setModalObj({
      show: true,
      title: `Cancel ${cancelConfTitle} Sample`,
      message: `Do you want to cancel sample?`,
      id: '0'
    }); // cancel done in confirmedCancel    
  }

  return (
    <>
      <ModalConfirm
        show={modalObj.show}
        title={modalObj.title}
        message={modalObj.message}
        onConfirm={confirmedCancel}
        onCancel={canceledCancel}        
      />      
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label htmlFor="todayStr" className="form-label">
            TodayStr
          </label>
          <input
            type="text"
            className="form-control"
            id="todayStr"
            name="todayStr"
            value={todayStr}
            readOnly
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="todayStrMMddYYYY" className="form-label">
            todayStrMMddYYYY
          </label>
          <input
            type="text"
            className="form-control"
            id="todayStrMMddYYYY"
            name="todayStrMMddYYYY"
            value={todayStrMMddyyyy}
            readOnly
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="toDayStr_to_MMddyyyy" className="form-label">
            as MM/DD/YYYY
          </label>
          <input
            type="text"
            className="form-control"
            id="toDayStr_to_MMddyyyy"
            name="toDayStr_to_MMddyyyy"
            value={toDayStr_to_MMddyyyy}
            readOnly
          />
        </div>
      </div>
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label htmlFor="inputTypes" className="form-label">
            Input Types
          </label>
          <input
            type="text"
            className="form-control"
            id="inputTypes"
            name="dateInput"
            value={"Date"}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="toString"
            name="toString"
            value={"toString()"}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="toDateString"
            name="toDateString"
            value={"toDateString()"}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="toLocaleDateString"
            name="toLocaleDateString"
            value={"toLocaleDateString()"}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="dateTo_UTC_yyyyMMdd"
            name="dateTo_UTC_yyyyMMdd"
            value={"dateTo_UTC_yyyyMMdd()"}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="dateTo_yyyyMMdd"
            name="dateTo_yyyyMMdd"
            value={"dateTo_yyyyMMdd()"}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="dateTo_UTC_MMddyyyy"
            name="dateTo_UTC_MMddyyyy"
            value={"dateTo_UTC_MMddyyyy()"}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="startOfDayUTC"
            name="startofTodayUTC"
            value={"startofTodayUTC()"}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="startOfDayFromString"
            name="startOfDayFromString"
            value={"startOfDayFromString()"}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="prisma"
            name="prisma"
            value={"prisma"}
            readOnly
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="inputSod" className="form-label">
            Start Date
          </label>
          <input
            type="date"
            className="form-control"
            id="inputSod"
            name="sod"
            value={formData.sodStr}
            onChange={handleInputChange}
          />
          <input
            type="text"
            className="form-control"
            id="sodStr"
            name="sodStr"
            value={formData.sod.toString()}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="sodDateStr"
            name="sodDateStr"
            value={formData.sod.toDateString()}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="sodLocalDateStr"
            name="sodLocalDateStr"
            value={formData.sod.toLocaleDateString()}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="soddateTo_UTC_yyyyMMdd"
            name="soddateTo_UTC_yyyyMMdd"
            value={dateTo_UTC_yyyyMMdd(formData.sod)}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="soddateTo_yyyyMMdd"
            name="soddateTo_yyyyMMdd"
            value={dateTo_yyyyMMdd(formData.sod)}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="soddateTo_UTC_MMddyyyy"
            name="soddateTo_UTC_MMddyyyy"
            value={dateTo_UTC_MMddyyyy(formData.sod)}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="startOfTodayUTCsod"
            name="startOfTodayUTCsod"
            value={startOfTodayUTC().toString()}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="startOfTodayFromString"
            name="startOfTodayFromString"
            value={startOfDayFromString(todayStr)?.toString()}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="prismaSod"
            name="prismaSod"
            value={formData.prismaSod.toString()}
            readOnly
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="inputEod" className="form-label">
            End Date
          </label>
          <input
            type="date"
            className="form-control"
            id="inputEod"
            name="eod"
            value={formData.eodStr}
            onChange={handleInputChange}
          />
          <input
            type="text"
            className="form-control"
            id="edoStr"
            name="eodStr"
            value={formData.eod.toString()}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="eodDateStr"
            name="eodDateStr"
            value={formData.eod.toDateString()}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="eodLocalDateStr"
            name="eodLocalDateStr"
            value={formData.eod.toLocaleDateString()}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="eoddateTo_UTC_yyyyMMdd"
            name="eoddateTo_UTC_yyyyMMdd"
            value={dateTo_UTC_yyyyMMdd(formData.eod)}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="eoddateTo_yyyyMMdd"
            name="eoddateTo_yyyyMMdd"
            value={dateTo_yyyyMMdd(formData.eod)}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="eoddateTo_UTC_MMddyyyy"
            name="eoddateTo_UTC_MMddyyyy"
            value={dateTo_UTC_MMddyyyy(formData.eod)}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="startOfTodayUTCeod"
            name="startOfTodayUTCeod"
            value={startOfTodayUTC().toString()}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="startOfTodayFromStringeod"
            name="startOfTodayFromStringeod"
            value={startOfDayFromString(todayStr)?.toString()}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="prismaEod"
            name="prismaEod"
            value={formData.prismaEod.toString()}
            readOnly
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="inputNow" className="form-label">
            Now
          </label>
          <input
            type="date"
            className="form-control"
            id="inputNow"
            name="nd"
            value={formData.ndStr}
            onChange={handleInputChange}
          />
          <input
            type="text"
            className="form-control"
            id="ndStr"
            name="ndStr"
            value={formData.nd.toString()}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="ndStr"
            name="ndStr"
            value={formData.nd.toDateString()}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="ndLocalDateStr"
            name="ndLocalDateStr"
            value={formData.nd.toLocaleDateString()}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="nddateTo_UTC_yyyyMMdd"
            name="nddateTo_UTC_yyyyMMdd"
            value={dateTo_UTC_yyyyMMdd(formData.nd)}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="nddateTo_yyyyMMdd"
            name="nddateTo_yyyyMMdd"
            value={dateTo_yyyyMMdd(formData.nd)}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="nddateTo_UTC_MMddyyyy"
            name="nddateTo_UTC_MMddyyyy"
            value={dateTo_UTC_MMddyyyy(formData.nd)}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="startOfTodayUTCsod"
            name="startOfTodayUTCsod"
            value={startOfTodayUTC().toString()}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="startOfTodayFromString"
            name="startOfTodayFromString"
            value={startOfDayFromString(todayStr)?.toString()}
            readOnly
          />
          <input
            type="text"
            className="form-control"
            id="prismaNd"
            name="prismaNd"
            value={formData.prismaNd.toString()}
            readOnly
          />

        </div>
      </div>
      <div className="row g-3 mb-3">      
        <div className="col-md-3">
          <label htmlFor="di" className="form-label">
            Date Input
          </label>
          <input
            type="date"
            className="form-control"
            id="di"
            name="di"
            value={formData.di}
            onChange={diHandleInputChange}
          />
        </div>
      </div>
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <button className="btn btn-info" onClick={handleDebug}>
            Debug
          </button>
        </div>
        <div className="col-md-3">
          <button className="btn btn-danger" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};
