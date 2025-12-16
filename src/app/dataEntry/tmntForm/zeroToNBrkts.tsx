import React, { useState, ChangeEvent } from "react";
import { divType, squadType, AcdnErrType, brktType, tmntActions } from "../../../lib/types/types";
import { initModalObj } from "@/components/modal/modalObjType";
import ModalConfirm, { delConfTitle } from "@/components/modal/confirmModal";
import { Tab, Tabs, OverlayTrigger, Tooltip } from "react-bootstrap";
import EaCurrencyInput, {
  maxMoneyText,
  minFeeText,
} from "@/components/currency/eaCurrencyInput";
import { defaultBrktGames, initBrkt } from "../../../lib/db/initVals";
import {  
  maxGames,
  maxMoney,
  minFee,  
  zeroAmount,
} from "@/lib/validation";
import {
  acdnErrClassName,
  getAcdnErrMsg,
  noAcdnErr,
  objErrClassName,
} from "./errors";
import { getBrktOrElimName, getDivName } from "@/lib/getName";
import { currRexEx, localConfig } from "@/lib/currency/const";
import { formatValue2Dec } from "@/lib/currency/formatValue";
import { btDbUuid } from "@/lib/uuid";
import clsx from "clsx";
import styles from "./tmntForm.module.css";

interface ChildProps {
  brkts: brktType[];
  setBrkts: (brkts: brktType[]) => void;
  divs: divType[];
  squads: squadType[];
  setAcdnErr: (objAcdnErr: AcdnErrType) => void;
  setShowingModal: (showingModal: boolean) => void;
  tmntAction: tmntActions;
}
interface NumberProps {
  brkt: brktType;
  LabelText: string;
  property: string;
  value: number | string;
  title?: string;
}

const createBrktTitle = "Create Bracket";
const duplicateBrktErrMsg = "Bracket - Division & Start already exists";

const getBrktErrMsg = (brkt: brktType): string => {
  if (!brkt) return "";
  if (brkt.div_err) return brkt.div_err;
  if (brkt.start_err) return brkt.start_err;
  if (brkt.fee_err) return brkt.fee_err;
  return "";
};

const getNextBrktAcdnErrMsg = (
  updatedBrkt: brktType | null,
  brkts: brktType[],
  divs: divType[]
): string => {
  let errMsg = "";
  let acdnErrMsg = "";
  let i = 0;
  let brkt: brktType;
  while (i < brkts.length && !errMsg) {
    brkt = brkts[i].id === updatedBrkt?.id ? updatedBrkt : brkts[i];
    errMsg = getBrktErrMsg(brkt);
    if (errMsg) {
      acdnErrMsg = getAcdnErrMsg(getBrktOrElimName(brkt, divs), errMsg);
    }
    i++;
  }
  return acdnErrMsg;
};

/**
 * validate a brkt
 * 
 * @param {brktType} brkt - brkt to validate
 * @param {brktType[]} brkts - all current brkts for tmnt
 * @param {number} maxStartGame - max start game for brkt
 * @returns {brktType} - brkt with errors messages if present 
 */
const validateBrkt = (
  brkt: brktType,
  brkts: brktType[],
  maxStartGame: number): brktType =>
{
  if (!brkt || !brkts || !maxStartGame ) return null as any;
  if (typeof maxStartGame !== "number"
      || isNaN(maxStartGame)
      || maxStartGame < 1
      || maxStartGame > maxGames) {
    return null as any;
  }
  const vBrkt = {
    ...brkt,
    div_err: "",
    start_err: "",
    fee_err: "",
  };  

  if (brkt.div_id === "") {
    vBrkt.div_err = "Division is required";        
  }
  const feeNum = Number(brkt.fee);
  if (typeof feeNum !== "number" || isNaN(feeNum)) {
    vBrkt.fee_err = "Invalid Fee";
  } else if (feeNum < minFee) {
    vBrkt.fee_err = "Fee cannot be less than " + minFeeText;
  } else if (feeNum > maxMoney) {
    vBrkt.fee_err = "Fee cannot be more than " + maxMoneyText;
  }
  if (brkt.start < 1) {
    vBrkt.start_err = "Start cannot be less than 1";        
  } else if (brkt.start > maxStartGame) {
    vBrkt.start_err = "Start cannot be more than " + maxStartGame;        
  }
  if (!vBrkt.div_err && !vBrkt.start_err && !vBrkt.fee_err) {      
    const duplicateBrkt = brkts.find(
      (brkt) =>
        (brkt.id !== vBrkt.id
        && brkt.start === vBrkt.start        
        && brkt.div_id === vBrkt.div_id)
    );
    if (duplicateBrkt) {
      vBrkt.start_err = duplicateBrktErrMsg;      
    }
  }
  return vBrkt
};

export const validateBrkts = (
  brkts: brktType[],
  setBrkts: (brkts: brktType[]) => void,  
  divs: divType[],  
  maxStartGame: number,
  setAcdnErr: (objAcdnErr: AcdnErrType) => void
): boolean => {
  if (!brkts || !divs || !maxStartGame || !setBrkts || !setAcdnErr) return false;
  if (typeof maxStartGame !== "number"
      || isNaN(maxStartGame)
      || maxStartGame < 1
      || maxStartGame > maxGames) {
    return false;
  }
  // brkts.length === 0 is OK
  if (divs.length < 1) return false;

  let areBrktsValid = true;
  let brktErrClassName = "";  

  const newBrktErrMsg = getBrktErrMsg(brkts[0]);
  const setError = (brktName: string, errMsg: string) => {
    if (areBrktsValid && !newBrktErrMsg) {
      setAcdnErr({
        errClassName: acdnErrClassName,
        message: getAcdnErrMsg(brktName, errMsg),
      });
    }
    areBrktsValid = false;
    brktErrClassName = objErrClassName;
  };

  setBrkts(
    brkts.map((brkt) => {
      const vBrkt = validateBrkt(brkt, brkts, maxStartGame);
      if (vBrkt.div_err) {
        setError(getBrktOrElimName(brkt, divs), vBrkt.div_err);
        vBrkt.errClassName = objErrClassName
      } else if (vBrkt.fee_err) {
        setError(getBrktOrElimName(brkt, divs), vBrkt.fee_err);
        vBrkt.errClassName = objErrClassName
      } else if (vBrkt.start_err) {
        setError(getBrktOrElimName(brkt, divs), vBrkt.start_err);
        vBrkt.errClassName = objErrClassName
      } else {
        vBrkt.errClassName = '';
      }
      return vBrkt;
    })
  );
  if (areBrktsValid) {
    setAcdnErr(noAcdnErr);
  }
  return areBrktsValid;
};

const ZeroToNBrackets: React.FC<ChildProps> = ({
  brkts,
  setBrkts,
  divs,
  squads,
  setAcdnErr,
  setShowingModal,
  tmntAction,
}) => {

  const isDisabled = (tmntAction === tmntActions.Run); 
  const defaultTabKey = (isDisabled && brkts.length > 0 && brkts[0].id)
  ? brkts[0].id
  : 'createBrkt';  

  // const defaultTabKey = 'createBrkt';

  // only 1 squad for now, so all pots use squad[0]
  const brktWithSquadId = {
    ...initBrkt,
    squad_id: squads[0].id
  }
  
  const [modalObj, setModalObj] = useState(initModalObj);
  const [tabKey, setTabKey] = useState(defaultTabKey);
  const [createBrkt, setCreateBrkt] = useState(brktWithSquadId);

  const initSortOrder = brkts.length === 0 ? 1 : brkts[brkts.length - 1].sort_order + 1;
  const [sortOrder, setSortOrder] = useState(initSortOrder); 

  // right now only 1 squad is allowed, so just use the first one
  const maxStartGame = squads[0].games - (defaultBrktGames - 1);

  const delBtnStyle = isDisabled ? 'btn-dark' : 'btn-danger';

  const validNewBrkt = () => {

    const vBrkt = validateBrkt(createBrkt, brkts, maxStartGame); 
    setCreateBrkt({
      ...vBrkt,
    })

    // make sure values are updated in createBrkt
    createBrkt.start_err = vBrkt.start_err;
    createBrkt.div_err = vBrkt.div_err;
    createBrkt.fee_err = vBrkt.fee_err;
    // returns true if all error messages are blank
    return (vBrkt.start_err === "" && vBrkt.div_err === "" && vBrkt.fee_err === "");
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (validNewBrkt()) {
      // if brket is valid, make sure error are cleared 
      if (createBrkt.div_err !== '') {
        createBrkt.div_err = '';
      }
      if (createBrkt.fee_err !== '') {
        createBrkt.fee_err = '';
      }
      if (createBrkt.start_err !== '') {
        createBrkt.start_err = '';
      }
      const newBrkt = {
        ...createBrkt,
        id: btDbUuid('brk'),
      };
      // add new brkt
      const mappedBrkts = brkts.map((brkt) => ({ ...brkt }));
      mappedBrkts.push(newBrkt);
      setBrkts(mappedBrkts);
      // update sort order for next new brkt
      setCreateBrkt({
        ...createBrkt,
        sort_order: sortOrder + 1,
      });            
      setSortOrder(sortOrder + 1);
    }
  };

  const confirmedDelete = () => {
    const idToDel = modalObj.id
    setShowingModal(false);
    setModalObj(initModalObj); // reset modal object (hides modal)
    const updatedData = brkts.filter((brkt) => brkt.id !== idToDel);
    setBrkts(updatedData);
    setTabKey(defaultTabKey); // refocus create brkt
  };

  const canceledDelete = () => {
    setShowingModal(false);
    setModalObj(initModalObj); // reset modal object (hides modal)
  };

  const handleDelete = (id: string) => {
    const brktToDel = brkts.find((brkt) => brkt.id === id);    
    if (!brktToDel) return;
    const toDelName = getBrktOrElimName(brktToDel, divs);
    setShowingModal(true);
    setModalObj({
      show: true,
      title: delConfTitle,
      message: `Do you want to delete Bracket: ${toDelName}?`,
      id: id,
    }); // deletion done in confirmedDelete
  };

  const handleCreateBrktInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, name, value } = e.target;
    const ids = id.split("-");
    
    let updatedBrkt: brktType;
    if (name === 'brktsDivRadio') {
      const parentId = ids[1];      
      updatedBrkt = {
        ...createBrkt,        
        div_id: parentId, 
        div_err: "",
      };
      if (updatedBrkt.start_err = duplicateBrktErrMsg) {
        updatedBrkt.start_err = "";
      }
      if (createBrkt.div_err === duplicateBrktErrMsg) {
        updatedBrkt.div_err = "";
      }
    } else {
      updatedBrkt = {
        ...createBrkt,
        start: Number(value),
        start_err: "",
      };
    }
    setCreateBrkt(updatedBrkt);
  };

  const handlCreateBrktAmountValueChange = (id: string) => (value: string | undefined): void => {
  let rawValue = value === undefined ? "undefined" : value;
    rawValue = rawValue || " ";
    if (rawValue && Number.isNaN(Number(rawValue))) {
      rawValue = "";
    }
    let updatedBrkt: brktType = {
      ...createBrkt,
      fee: rawValue,
      fee_err: "",
      errClassName: "",
    };
    setCreateBrkt(updatedBrkt);
  };

  const handleCreateBrktBlur = (id: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value) {
      const temp_brkt = updateFSA(createBrkt, value);
      setCreateBrkt(temp_brkt);
    }

    if (!value.trim()) {
      // if cleared entry
      const temp_brkt = updateFSA(createBrkt, value);
      temp_brkt.fee = "";
      temp_brkt.fee_err = "";
      setCreateBrkt(temp_brkt);
    }
  };

  const handleAmountValueChange = (id: string) => (value: string | undefined): void => {
    let rawValue = value === undefined ? "undefined" : value;
    rawValue = rawValue || " ";

    setBrkts(
      brkts.map((brkt) => {
        if (brkt.id === id) {
          if (rawValue && Number.isNaN(Number(rawValue))) {
            rawValue = "";
          }
          let updatedBrkt: brktType;
          updatedBrkt = {
            ...brkt,
            fee: rawValue,
            fee_err: "",
            errClassName: "",
          };
          const acdnErrMsg = getNextBrktAcdnErrMsg(updatedBrkt, brkts, divs);
          if (acdnErrMsg) {
            setAcdnErr({
              errClassName: acdnErrClassName,
              message: acdnErrMsg,
            });
          } else {
            setAcdnErr(noAcdnErr);
          }
          const errMsg = getBrktErrMsg(updatedBrkt);
          if (errMsg) {
            return {
              ...updatedBrkt,
              errClassName: objErrClassName,
            } 
          } else {
            return {
              ...updatedBrkt,
              errClassName: "",
            }
          }
        } else {
          return brkt;
        }
      })
    );
  };

  const updateFSA = (brkt: brktType, value: string): brktType => {
    const valNoSymb = value.replace(currRexEx, "");
    let formattedValue = value ? formatValue2Dec(valNoSymb, localConfig) : "";
    if (formattedValue === "NaN") {
      formattedValue = "";
    }
    if (typeof Number(formattedValue) !== "number") {
      formattedValue = "";
    }
    const valueNum = Number(formattedValue);
    // * 1000000 so to large values show error, but dont allow huge values
    if (valueNum < zeroAmount || valueNum > maxMoney * 1000000) {
      formattedValue = "";
    }
    const temp_brkt = {
      ...brkt,
      fee: formattedValue,
      fee_err: "",
    };
    if (temp_brkt.fee) {
      const feeNum = Number(temp_brkt.fee);
      temp_brkt.first = formatValue2Dec((feeNum * 5).toString(), localConfig);
      temp_brkt.second = formatValue2Dec((feeNum * 2).toString(), localConfig);
      temp_brkt.admin = formatValue2Dec(feeNum.toString(), localConfig);
      temp_brkt.fsa = formatValue2Dec((feeNum * 8).toString(), localConfig);
    } else {
      temp_brkt.first = "";
      temp_brkt.second = "";
      temp_brkt.admin = "";
      temp_brkt.fsa = "";
    }
    return {
      ...temp_brkt,
    };
  };

  const handleBlur = (id: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value) {
      setBrkts(
        brkts.map((brkt) => {
          if (brkt.id === id) {
            const temp_brkt = updateFSA(brkt, value);
            return {
              ...temp_brkt,
            };
          } else {
            return brkt;
          }
        })
      );
    }

    if (!value.trim()) {
      // if cleared entry
      setBrkts(
        brkts.map((brkt) => {
          if (brkt.id === id) {
            const temp_brkt = updateFSA(brkt, value);
            return {
              ...temp_brkt,
              fee: "",
              fee_err: "",
            };
          }
          return brkt;
        })
      );
    }
  };

  const handleTabSelect = (key: string | null) => {
    if (key) {
      setTabKey(key);
    }
  };

  const NumberEntry: React.FC<NumberProps> = ({
    brkt,
    LabelText,
    property,
    value,
  }) => {
    return (
      <div className="col-sm-3">
        <label
          htmlFor={`inputBrkt${property}${brkt.id}`}
          className="form-label"
        >
          {LabelText}
        </label>
        <input
          type="number"
          id={`inputBrkt${property}${brkt.id}`}
          name={`${property}`}
          className="form-control"
          value={value}
          disabled
        />
      </div>
    );
  };

  const renderFSAToolTip = (props: any) => (
    <Tooltip id="button-tooltip" {...props}>
      First + Second + Admin must equal Fee * Players
    </Tooltip>
  )

  const MoneyDisabled: React.FC<NumberProps> = ({
    brkt,
    LabelText,
    property,
    value,
    title = "",
  }) => {
    return (
      <div className="col-sm-3">
        {title === "" ? (
          <label htmlFor={`${property}${brkt.id}`} className="form-label">
            {LabelText}
          </label>
        ) : (            
          <label
            htmlFor={`${property}${brkt.id}`}
            className="form-label"              
          >
            {LabelText}&nbsp;
            <>
              <OverlayTrigger
                placement="right"
                delay={{ show: 250, hide: 1000 }}
                overlay={renderFSAToolTip}
              >
                <span className="popup-help">&nbsp;?&nbsp;</span>
              </OverlayTrigger>
            </>
          </label>
        )}
        <EaCurrencyInput
          id={`${property}${brkt.id}`}
          name={`${property}`}
          className="form-control"
          value={value}
          disabled
        />
      </div>
    );
  };

  return (
    <>
      <ModalConfirm
        show={modalObj.show}
        title={modalObj.title}
        message={modalObj.message}
        onConfirm={confirmedDelete}
        onCancel={canceledDelete}
      />
      <Tabs
        defaultActiveKey={defaultTabKey}
        id="brkts-tab"
        className="mb-3"
        variant="pills"
        activeKey={tabKey}
        onSelect={handleTabSelect}
      >
        {(tmntAction !== tmntActions.Run) ? (
          <Tab
            key="createBrkt"
            eventKey="createBrkt"
            title={createBrktTitle}
          >
            <div
              data-testid="createBrktContainer"
              className={clsx("container", "rounded-3", styles.createBackground)}
            >
            {/* <div className="container rounded-3 createBackground"> */}
              <div className="row g-3 mb-1">
                <div className="col-sm-2">
                  <label className="form-label">
                    Division
                  </label>
                  {divs.map((div) => (
                    <div key={div.id} className="form-check text-break">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="brktsDivRadio"
                        id={`div_name-${div.id}-${div.div_name}-brkts`}
                        checked={createBrkt.div_id === div.id}
                        onChange={handleCreateBrktInputChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`div_name-${div.id}-${div.div_name}-brkts`}
                      >
                        {div.div_name}
                      </label>
                    </div>
                  ))}
                  <div
                    className="text-danger"
                    data-testid="dangerBrktDivRadio"
                  >
                    {createBrkt.div_err}
                  </div>
                </div>
                <div className="col-sm-8">
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <label
                        htmlFor={`inputBrktFee${createBrkt.id}`}
                        className="form-label"
                      >
                        Fee
                      </label>
                      <EaCurrencyInput
                        id={`inputBrktFee${createBrkt.id}`}
                        name="fee"
                        className={`form-control ${
                          createBrkt.fee_err && "is-invalid"
                        }`}
                        value={createBrkt.fee}
                        onValueChange={handlCreateBrktAmountValueChange(createBrkt.id)}
                        onBlur={handleCreateBrktBlur(createBrkt.id)}                            
                      />
                      <div
                        className="text-danger"
                        data-testid="dangerCreateBrktFee"
                      >
                        {createBrkt.fee_err}
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <label
                        htmlFor={`inputBrktStart${createBrkt.id}`}
                        className="form-label"
                      >
                        Start
                      </label>
                      <input
                        type="number"
                        id={`inputBrktStart${createBrkt.id}`}
                        name="start"
                        placeholder="#"
                        step={1}
                        className={`form-control ${
                          createBrkt.start_err && "is-invalid"
                        }`}
                        onChange={handleCreateBrktInputChange}
                        value={createBrkt.start}
                      />
                      <div
                        className="text-danger"
                        data-testid="dangerCreateBrktStart"
                      >
                        {createBrkt.start_err}
                      </div>
                    </div>
                    <NumberEntry
                      brkt={createBrkt}
                      LabelText="Games"
                      property="games"
                      value={createBrkt.games}
                    />
                    <NumberEntry
                      brkt={createBrkt}
                      LabelText="Players"
                      property="players"
                      value={createBrkt.players}
                    />
                  </div>
                  <div className="row">
                    <MoneyDisabled
                      brkt={createBrkt}
                      LabelText="First"
                      property="first"
                      value={createBrkt.first}
                    />
                    <MoneyDisabled
                      brkt={createBrkt}
                      LabelText="Second"
                      property="second"
                      value={createBrkt.second}
                    />
                    <MoneyDisabled
                      brkt={createBrkt}
                      LabelText="Admin"
                      property="admin"
                      value={createBrkt.admin}
                    />
                    <MoneyDisabled
                      brkt={createBrkt}
                      LabelText="F+S+A"
                      property="fsa"
                      value={createBrkt.fsa}
                      title="First + Second + Admin must equal Fee * Players"
                    />
                  </div>
                </div>
                <div className="col-sm-2 d-flex justify-content-center align-items-start">
                  <button
                    className="btn btn-success mx-3"
                    onClick={handleAdd}
                  >
                    Add Bracket
                  </button>
                </div>
                </div>
            </div>
          </Tab>
        ) : null }          
        {brkts.map((brkt) => (
          <Tab
            key={brkt.id}
            eventKey={`${brkt.id}`}
            title={getBrktOrElimName(brkt, divs)}
            tabClassName={`${brkt.errClassName}`}
          >
            <div className="row g-3 mb-3">                
              <div className="col-sm-2">
                <label
                  className="form-label"
                  htmlFor={`brkt_div-${brkt.id}`}
                >
                  Division
                </label>
                <input
                  type="text"
                  className="form-control"
                  id={`brkt_div-${brkt.id}`}
                  name="div_name"                  
                  value={getDivName(brkt.div_id, divs)}
                  disabled
                />
              </div>
              <div className="col-sm-8">
                <div className="row mb-3">
                  <div className="col-sm-3">
                    <label
                      htmlFor={`inputBrktFee${brkt.id}`}
                      className="form-label"
                    >
                      Fee
                    </label>
                    <EaCurrencyInput
                      id={`inputBrktFee${brkt.id}`}
                      name="fee"
                      className={`form-control ${
                        brkt.fee_err && "is-invalid"
                      }`}
                      value={brkt.fee}
                      onValueChange={handleAmountValueChange(brkt.id)}
                      onBlur={handleBlur(brkt.id)}
                      disabled={isDisabled}
                    />
                    <div
                      className="text-danger"                            
                      data-testid={`dangerBrktFee${brkt.id}`}
                    >
                      {brkt.fee_err}
                    </div>
                  </div>
                  <div className="col-sm-3">
                    <label
                      htmlFor={`viewBrktStart${brkt.id}`}
                      className="form-label"
                    >
                      Start
                    </label>
                    <input
                      type="number"
                      id={`viewBrktStart${brkt.id}`}
                      name="start"
                      className={`form-control ${
                        brkt.start_err && "is-invalid"
                      }`}                      
                      value={brkt.start}
                      disabled
                    />
                    <div
                      className="text-danger"
                      data-testid={`dangerViewBrktStart${brkt.id}`}
                    >
                      {brkt.start_err}
                    </div>
                  </div>
                  <NumberEntry
                    brkt={brkt}
                    LabelText="Games"
                    property="games"
                    value={brkt.games}
                  />
                  <NumberEntry
                    brkt={brkt}
                    LabelText="Players"
                    property="players"
                    value={brkt.players}
                  />
                </div>
                <div className="row">
                  <MoneyDisabled
                    brkt={brkt}
                    LabelText="First"
                    property="first"
                    value={brkt.first}
                  />
                  <MoneyDisabled
                    brkt={brkt}
                    LabelText="Second"
                    property="second"
                    value={brkt.second}
                  />
                  <MoneyDisabled
                    brkt={brkt}
                    LabelText="Admin"
                    property="admin"
                    value={brkt.admin}
                  />
                  <MoneyDisabled
                    brkt={brkt}
                    LabelText="F+S+A"
                    property="fsa"
                    value={brkt.fsa}
                    title="First + Second + Admin must equal Fee * Players"
                  />
                </div>
              </div>
              <div className="col-sm-2 d-flex justify-content-center align-items-start">
                <button
                  className={`btn ${delBtnStyle} mx-3`}
                  onClick={() => handleDelete(brkt.id)}
                  disabled={isDisabled}
                >
                  Delete Bracket
                </button>
              </div>            
            </div>
          </Tab>
        ))}
      </Tabs>
    </>
  );
};

export default ZeroToNBrackets;

export const exportedForTesting = {
  validateBrkt,
};
