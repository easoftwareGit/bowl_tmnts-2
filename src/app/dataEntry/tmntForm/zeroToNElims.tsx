import React, { ChangeEvent, useState } from 'react'
import { elimType, divType, squadType, AcdnErrType } from "../../../lib/types/types";
import { initModalObj } from '@/components/modal/modalObjType';
import ModalConfirm, { delConfTitle } from '@/components/modal/confirmModal';
import { Tab, Tabs } from 'react-bootstrap';
import { getBrktOrElimName, getDivName } from '@/lib/getName';
import EaCurrencyInput, { maxMoneyText, minFeeText } from '@/components/currency/eaCurrencyInput';
import { acdnErrClassName, getAcdnErrMsg, noAcdnErr, objErrClassName } from './errors';
import { maxGames, maxMoney, minFee, minGames } from '@/lib/validation';
import { initElim } from '../../../lib/db/initVals';
import { btDbUuid } from '@/lib/uuid';

interface ChildProps {
  elims: elimType[];
  setElims: (elims: elimType[]) => void;
  divs: divType[];
  squads: squadType[];
  setAcdnErr: (objAcdnErr: AcdnErrType) => void;
  setShowingModal: (showingModal: boolean) => void;
}
interface NumberProps {
  elim: elimType;
  LabelText: string;
  property: string;
  value: number | string;
  title?: string;
}

const createElimTitle = "Create Eliminator";
const duplicateElimErrMsg = "Eliminator - Division, Start & Games already exists";

const getElimErrMsg = (elim: elimType): string => {  
  if (!elim) return '';
  if (elim.div_err) return elim.div_err;
  if (elim.start_err) return elim.start_err;
  if (elim.fee_err) return elim.fee_err;
  return '';
};

const getNextElimAcdnErrMsg = (
  updatedElim: elimType | null,
  brkts: elimType[],
  divs: divType[]
): string => {
  let errMsg = "";
  let acdnErrMsg = "";
  let i = 0;
  let elim: elimType;
  while (i < brkts.length && !errMsg) {
    elim = brkts[i].id === updatedElim?.id ? updatedElim : brkts[i];
    errMsg = getElimErrMsg(elim);
    if (errMsg) {
      acdnErrMsg = getAcdnErrMsg(getBrktOrElimName(elim, divs), errMsg);
    }
    i++;
  }
  return acdnErrMsg;
};

const validateElim = (
  elim: elimType,
  elims: elimType[],
  squadGames: number
): elimType => {
  if (!elim || !elims || !squadGames ) return null as any;
  if (typeof squadGames !== "number"
      || isNaN(squadGames)
      || squadGames < 1
      || squadGames > maxGames) {
    return null as any;
  }

  const vElim = {
    ...elim,
    div_err: "",
    start_err: "",
    fee_err: "",
    games_err: "",
  }

  if (elim.div_id === "") {
    vElim.div_err = "Division is required";    
  }
  const fee = Number(elim.fee);
  if (typeof fee !== "number" || isNaN(fee)) {
    vElim.fee_err = "Invalid Fee";    
  } else if (fee < minFee) {
    vElim.fee_err = "Fee cannot be less than " + minFeeText;    
  } else if (fee > maxMoney) {
    vElim.fee_err = "Fee cannot be more than " + maxMoneyText;    
  }
  if (elim.start < 1) {
    vElim.start_err = 'Start cannot be less than 1';    
  } else if (elim.start > squadGames) {
    vElim.start_err = 'Start cannot be more than ' + squadGames;
  }
  if (elim.games < 1) {
    vElim.games_err  = 'Games cannot be less than 1';
  } else if (elim.games > squadGames) {
    vElim.games_err  = 'Games cannot be more than ' + squadGames;    
  } 
  // right now only 1 squad is allowed, so just grab the first one
  if (elim.start + elim.games - 1 > squadGames) {
    vElim.start_err = 'Eliminator ends after last game';     
  }
  if (!vElim.div_err && !vElim.fee_err && !vElim.start_err && !vElim.games_err) {
    const duplicateElim = elims.find(
      (elim) =>
      (elim.id !== vElim.id
        && elim.div_id === vElim.div_id
        && elim.start === vElim.start
        && elim.games === vElim.games)
    );
    if (duplicateElim) {
      vElim.start_err = duplicateElimErrMsg;
    }
  }
  return vElim;
}

export const validateElims = (
  elims: elimType[],  
  setElims: (elims: elimType[]) => void,
  divs: divType[],
  squadGames: number,
  setAcdnErr: (objAcdnErr: AcdnErrType) => void
): boolean => {
  
  if (!elims || !divs || !squadGames || !setElims || !setAcdnErr) return false;
  if (typeof squadGames !== "number"
      || isNaN(squadGames)
      || squadGames < 1
      || squadGames > maxGames) {
    return false;
  }
  // elims.length === 0 is OK
  if (divs.length < 1) return false;

  let areElimsValid = true;
  let elimErrClassName = '';

  const newElimErrMsg = getElimErrMsg(elims[0]);

  const setError = (elimName: string, errMsg: string) => {
    if (areElimsValid && !newElimErrMsg) {
      setAcdnErr({
        errClassName: acdnErrClassName,
        message: getAcdnErrMsg(elimName, errMsg),
      });
    }
    areElimsValid = false;
    elimErrClassName = objErrClassName;
  };

  setElims(
    elims.map((elim) => {
      const vElim = validateElim(elim, elims, squadGames);
      if (vElim.div_err) {
        setError(getBrktOrElimName(elim, divs), vElim.div_err);
        vElim.errClassName = objErrClassName;
      } else if (vElim.fee_err) {
        setError(getBrktOrElimName(elim, divs), vElim.fee_err);
        vElim.errClassName = objErrClassName;
      } else if (vElim.start_err) {
        setError(getBrktOrElimName(elim, divs), vElim.start_err);
        vElim.errClassName = objErrClassName;
      } else if (vElim.games_err) {
        setError(getBrktOrElimName(elim, divs), vElim.games_err);
        vElim.errClassName = objErrClassName;
      } else {
        vElim.errClassName = '';
      }
      return vElim;
    })
  )
  if (areElimsValid) {
    setAcdnErr(noAcdnErr);
  }
  return areElimsValid;
}

const ZeroToNElims: React.FC<ChildProps> = ({
  elims,
  setElims,
  divs,
  squads,
  setAcdnErr,
  setShowingModal,
}) => {

  const defaultTabKey = 'createElim';

  // only 1 squad for now, so all pots use squad[0]
  const elimWithSquadId = {
    ...initElim,
    squad_id: squads[0].id
  }

  const [modalObj, setModalObj] = useState(initModalObj);
  const [tabKey, setTabKey] = useState(defaultTabKey);
  const [sortOrder, setSortOrder] = useState(1); 
  const [createElim, setCreateElim] = useState(elimWithSquadId);

  const validNewElim = (): boolean => {

    // right now only 1 squad is allowed, so just grab the first one
    const vElim = validateElim(createElim, elims, squads[0].games);
    setCreateElim({
      ...vElim,
    })

    // make sure values are updated in createElim
    createElim.start_err = vElim.start_err;
    createElim.div_err = vElim.div_err;
    createElim.fee_err = vElim.fee_err;
    createElim.games_err = vElim.games_err;
    // returns true if all error messages are blank
    return (vElim.start_err === "" && vElim.div_err === "" && vElim.fee_err === "" && vElim.games_err === "");
  }

  const handleAdd = (e: React.FormEvent) => { 
    e.preventDefault();
    if (validNewElim()) {
      // if elim is valid, make sure errors are cleared
      if (createElim.div_err !== '') {
        createElim.div_err = '';
      }
      if (createElim.fee_err !== '') {
        createElim.fee_err = '';
      }
      if (createElim.games_err !== '') {
        createElim.games_err = '';
      }
      if (createElim.start_err !== '') {
        createElim.start_err = '';
      }
      const newElim = {
        ...createElim,
        id: btDbUuid('elm'),
      }
      // add new elim      
      const mappedElims = elims.map((elim) => ({ ...elim }));
      mappedElims.push(newElim);
      setElims(mappedElims);
      // update sort order for next new elim
      setCreateElim({
        ...createElim,
        sort_order: sortOrder + 1,
      })
      setSortOrder(sortOrder + 1);
    }
  }

  const confirmedDelete = () => { 
    const idToDel = modalObj.id
    setShowingModal(false);
    setModalObj(initModalObj)   // reset modal object (hides modal)
    const updatedData = elims.filter((elim) => elim.id !== idToDel);
    setElims(updatedData);
    setTabKey(defaultTabKey);   // refocus 1st pot
  }

  const canceledDelete = () => { 
    setShowingModal(false);
    setModalObj(initModalObj); // reset modal object (hides modal)
  }

  const handleDelete = (id: string) => {    
    const elimToDel = elims.find((elim) => elim.id === id);    
    if (!elimToDel) return;
    const toDelName = getBrktOrElimName(elimToDel, divs);
    setShowingModal(true);
    setModalObj({
      show: true,
      title: delConfTitle,
      message: `Do you want to delete Eliminator: ${toDelName}?`,
      id: id,
    }); // deletion done in confirmedDelete
  }

  const handleCreateElimInputChange = (id: string) => (e: ChangeEvent<HTMLInputElement>) => { 
    const { id, name, value } = e.target;      
    const ids = id.split("-");    
    
    let updatedElim: elimType;
    if (name === "elimsDivRadio") {
      const parentId = ids[1];      
      updatedElim = {
        ...createElim,
        div_id: parentId,
        div_err: "",
      }
      if (updatedElim.start_err = duplicateElimErrMsg) {
        updatedElim.start_err = "";
      }
      if (createElim.div_err === duplicateElimErrMsg) {
        updatedElim.div_err = "";
      }
    } else { 
      const valueNum = Number(value)
      const nameErr = name + "_err";
      updatedElim = {
        ...createElim,
        [name]: valueNum,
        [nameErr]: "",
      }
    }
    setCreateElim(updatedElim);
  }

  const handleCreateElimAmountValueChange = (id: string, name: string) => (value: string | undefined): void => { 
    const nameErr = name + "_err";
    let rawValue = value === undefined ? 'undefined' : value;
    rawValue = (rawValue || ' ');
    if (rawValue && Number.isNaN(Number(rawValue))) {
      rawValue = ''
    } 
    let updatedElim: elimType = {            
      ...createElim,
      fee: rawValue,
      fee_err: ''
    }
    setCreateElim(updatedElim);
  }

  const handleAmountValueChange = (id: string, name: string) => (value: string | undefined): void => { 
    const nameErr = name + "_err";
    let rawValue = value === undefined ? 'undefined' : value;
    rawValue = (rawValue || ' ');

    setElims(
      elims.map((elim) => {
        if (elim.id === id) {
          if (rawValue && Number.isNaN(Number(rawValue))) {
            rawValue = ''
          } 
          let updatedElim: elimType;
          updatedElim = {
            ...elim,
            fee: rawValue,
            fee_err: ''
          }
          const acdnErrMsg = getNextElimAcdnErrMsg(updatedElim, elims, divs);
          if (acdnErrMsg) {
            setAcdnErr({
              errClassName: acdnErrClassName,
              message: acdnErrMsg,
            });
          } else {
            setAcdnErr(noAcdnErr);
          }
          const errMsg = getElimErrMsg(updatedElim);
          if (errMsg) {
            return {
              ...updatedElim,
              errClassName: objErrClassName,
            };
          } else {
            return {
              ...updatedElim,
              errClassName: '',
            };
          }          
        }
        return elim;
      })
    )    
  }

  const handleTabSelect = (key: string | null) => {
    if (key) {
      setTabKey(key);
    }
  };

  const NumberEntry: React.FC<NumberProps> = ({ elim, LabelText, property, value }) => { 

    return (
      <div className="col-sm-2">
        <label htmlFor={`inputElim${property}${elim.id}`} className="form-label">
          {LabelText}
        </label>
        <input
          type="number"
          id={`inputElim${property}${elim.id}`}
          // data-testid={`inputElim_${property}${elim.sort_order}`}
          name={`${property}`}
          className="form-control"
          value={value}          
          disabled          
        />        
      </div>
    )
  }

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
        id='elims-tabs'
        className='mb-3'
        variant='pills'
        activeKey={tabKey}
        onSelect={handleTabSelect}
      >
        <Tab
          key={'createElim'}
          eventKey={'createElim'}
          title={createElimTitle}            
        >
          <div className="row g-3 mb-3">
            <div className="col-sm-3">
              <label
                className="form-label"                      
              >
                Division
              </label>
              {divs.map((div) => (
                <div key={div.id} className="form-check text-break">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="elimsDivRadio"
                    id={`div_name-${div.id}-${div.div_name}-elims`}
                    checked={createElim.div_id === div.id}
                    onChange={handleCreateElimInputChange(createElim.id)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`div_name-${div.id}-${div.div_name}-elims`}
                  >
                    {div.div_name}
                  </label>
                </div>
              ))}
              <div
                className="text-danger"
                data-testid="dangerElimDivRadio"
              >
                {createElim.div_err}
              </div>
            </div>
            <div className="col-sm-2">
              <label
                htmlFor={`inputElimFee${createElim.id}`}
                className="form-label"                      
              >
                Fee
              </label>
              <EaCurrencyInput
                id={`inputElimFee${createElim.id}`}                      
                name="fee"
                className={`form-control ${createElim.fee_err && "is-invalid"}`}
                value={createElim.fee}
                onValueChange={handleCreateElimAmountValueChange(createElim.id, 'fee')}                
              />
              <div
                className="text-danger"
                data-testid="dangerCreateElimFee"
              >
                {createElim.fee_err}
              </div>
            </div>
            <div className="col-sm-2">
              <label
                htmlFor={`inputElimStart${createElim.id}`}
                className="form-label"                      
              >
                Start
              </label>
              <input
                type="number"
                id={`inputElimStart${createElim.id}`}                      
                name="start"
                placeholder="#"
                step={1}
                className={`form-control ${createElim.start_err && "is-invalid"}`}
                onChange={handleCreateElimInputChange(createElim.id)}
                value={createElim.start}
              />
              <div
                className="text-danger"
                data-testid="dangerCreateElimStart"
              >
                {createElim.start_err}
              </div>
            </div>
            <div className="col-sm-2">
              <label
                htmlFor={`inputElimGames${createElim.id}`}
                className="form-label"                      
              >
                Games
              </label>
              <input
                type="number"
                id={`inputElimGames${createElim.id}`}                      
                name="games"
                placeholder="#"
                step={1}
                className={`form-control ${createElim.games_err && "is-invalid"}`}
                onChange={handleCreateElimInputChange(createElim.id)}
                value={createElim.games}
                data-testid="createElimGames"
              />
              <div
                className="text-danger"
                data-testid="dangerCreateElimGames"
              >
                {createElim.games_err}
              </div>
            </div>
            <div className="col-sm-3 d-flex justify-content-center align-items-start">
              <button className="btn btn-success mx-3" onClick={handleAdd}>
                Add Eliminator
              </button>
            </div>
          </div>
        </Tab>
        {elims.map((elim) => (
          <Tab
            key={elim.id}
            eventKey={`elim${elim.id}`}
            title={getBrktOrElimName(elim, divs)}
            tabClassName={`${elim.errClassName}`}
          >
            <div className="row g-3 mb-3">
              <div className="col-sm-3">
                <label
                  className="form-label"
                  htmlFor={`elim_div-${elim.id}`}
                >
                  Division
                </label>
                <input
                  type="text"
                  className="form-control"
                  id={`elim_div-${elim.id}`}                  
                  name="div_name"
                  value={getDivName(elim.div_id, divs)}
                  disabled
                />
              </div>
              <div className="col-sm-2">
                <label
                  htmlFor={`inputElimFee${elim.id}`}
                  className="form-label"
                >
                  Fee
                </label>
                <EaCurrencyInput
                  id={`inputElimFee${elim.id}`}                                
                  name="fee"
                  className={`form-control ${elim.fee_err && "is-invalid"}`}
                  value={elim.fee}
                  onValueChange={handleAmountValueChange(elim.id, 'fee')}                  
                />
                <div
                  className="text-danger"
                  data-testid={`dangerElimFee${elim.id}`}
                >
                  {elim.fee_err}
                </div>
              </div>
              <div className="col-sm-2">
                <label
                  htmlFor={`viewElimStart${elim.id}`}
                  className="form-label"                      
                >
                  Start
                </label>
                <input
                  type="number"
                  id={`viewElimStart${elim.id}`}                      
                  name="start"
                  className={`form-control ${createElim.start_err && "is-invalid"}`}
                  value={elim.start}
                  disabled
                />
                <div
                  className="text-danger"
                  data-testid={`dangerViewElimStart${elim.id}`}
                >
                  {elim.start_err}
                </div>
              </div>                            
              <NumberEntry
                elim={elim}
                LabelText='Games'
                property='games'
                value={elim.games}
              />
              <div className="col-sm-3 d-flex justify-content-center align-items-start">
                <button
                  className="btn btn-danger mx-3"
                  onClick={() => handleDelete(elim.id)}
                >
                  Delete Eliminator
                </button>
              </div>                
            </div>
          </Tab>
        ))}        
      </Tabs>
    </>
  )
}

export default ZeroToNElims

export const exportedForTesting = {
  validateElim,
};
