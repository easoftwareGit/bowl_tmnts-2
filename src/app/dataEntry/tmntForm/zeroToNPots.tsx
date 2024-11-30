import React, { useState, ChangeEvent } from "react";
import { divType, squadType, AcdnErrType, PotCategoryObjType, potType, potCategoriesTypes, tmntActions } from "@/lib/types/types";
import ModalConfirm, { delConfTitle } from "@/components/modal/confirmModal";
import { Tab, Tabs } from "react-bootstrap";
import { initModalObj } from "@/components/modal/modalObjType";
import EaCurrencyInput, {
  maxMoneyText,
  minFeeText,
} from "@/components/currency/eaCurrencyInput";
import { initPot } from "@/lib/db/initVals";
import {
  objErrClassName,
  acdnErrClassName,
  getAcdnErrMsg,
  noAcdnErr,
} from "./errors";
import { maxMoney, minFee } from "@/lib/validation";
import { getDivName, getPotName } from "@/lib/getName";
import { btDbUuid } from "@/lib/uuid";

interface ChildProps {
  pots: potType[];
  setPots: (pots: potType[]) => void;
  divs: divType[];  
  squads: squadType[];
  setAcdnErr: (objAcdnErr: AcdnErrType) => void;  
  setShowingModal: (showingModal: boolean) => void;
  tmntAction: tmntActions;
}

const createPotTitle = "Create Pot";

const potCategories: PotCategoryObjType[] = [
  {
    id: 1,
    name: "Game",
  },
  {
    id: 2,
    name: "Last Game",    
  },
  {
    id: 3,
    name: "Series",    
  },
];

const getPotErrMsg = (pot: potType): string => {
  if (!pot) return "";
  if (pot.pot_type_err) return pot.pot_type_err;
  if (pot.div_err) return pot.div_err;
  if (pot.fee_err) return pot.fee_err;
  return "";
};

const getNextPotAcdnErrMsg = (
  updatedPot: potType | null,  
  pots: potType[],
  divs: divType[]
): string => {
  let errMsg = "";
  let acdnErrMsg = "";
  let i = 0;
  let pot: potType;

  while (i < pots.length && !errMsg) {
    pot = pots[i].id === updatedPot?.id ? updatedPot : pots[i];
    errMsg = getPotErrMsg(pot);
    if (errMsg) {      
      acdnErrMsg = getAcdnErrMsg(getPotName(pot, divs), errMsg);
    }
    i++;
  }
  return acdnErrMsg;
};

export const validatePots = (
  pots: potType[],  
  setPots: (pots: potType[]) => void,
  divs: divType[],
  setAcdnErr: (objAcdnErr: AcdnErrType) => void
): boolean => {
  let arePotsValid = true;
  let feeErr = "";
  let potErrClassName = "";

  const newPotErrMsg = getPotErrMsg(pots[0]);

  const setError = (potName: string, errMsg: string) => {
    if (arePotsValid && !newPotErrMsg) {
      setAcdnErr({
        errClassName: acdnErrClassName,
        message: getAcdnErrMsg(potName, errMsg),
      });
    }
    arePotsValid = false;
    potErrClassName = objErrClassName;
  };

  setPots(
    pots.map((pot) => {
      feeErr = "";
      potErrClassName = "";      
      const fee = Number(pot.fee);
      if (typeof fee !== "number") {
        feeErr = "Invalid Fee";
      } else if (fee < minFee) {
        feeErr = "Fee cannot be less than " + minFeeText;
      } else if (fee > maxMoney) {
        feeErr = "Fee cannot be more than " + maxMoneyText;
      }
      if (feeErr) {
        setError(pot.pot_type + " - " + getDivName(pot.div_id, divs), feeErr);
      }
      return {
        ...pot,
        fee_err: feeErr,
        errClassName: potErrClassName,
      };
    })
  );
  if (arePotsValid) {
    setAcdnErr(noAcdnErr);    
  }
  return arePotsValid;
};

const ZeroToNPots: React.FC<ChildProps> = ({
  pots,
  setPots,
  divs,  
  squads,
  setAcdnErr,  
  setShowingModal,
  tmntAction,
}) => {
  
  const isDisabled = (tmntAction === tmntActions.Run);  
  const defaultTabKey = (isDisabled && pots.length > 0 && pots[0].id)
    ? pots[0].id
    : 'createPot';  

  // only 1 squad for now, so all pots use squad[0]
  const potWithSquadId = {
    ...initPot,
    squad_id: squads[0].id
  }
  
  const [modalObj, setModalObj] = useState(initModalObj);
  const [tabKey, setTabKey] = useState(defaultTabKey);  
  const [createPot, setCreatePot] = useState(potWithSquadId);

  const initSortOrder = pots.length === 0 ? 1 : pots[pots.length - 1].sort_order + 1;
  const [sortOrder, setSortOrder] = useState(initSortOrder); 
   
  const delBtnStyle = isDisabled ? 'btn-dark' : 'btn-danger';

  const validNewPot = () => {
    let isPotValid = true;
    let potErr = "";
    let divErr = "";
    let feeErr = "";    
  
    if (createPot.pot_type === "") {
      potErr = "Pot Type is required";
      isPotValid = false;
    }
    if (createPot.div_id === "") {
      divErr = "Division is required";
      isPotValid = false;      
    }
    const fee = Number(createPot.fee);
    if (typeof fee !== "number") {
      feeErr = "Invalid Fee";
      isPotValid = false;      
    } else if (fee < minFee) {
      feeErr = "Fee cannot be less than " + minFeeText;
      isPotValid = false;      
    } else if (fee > maxMoney) {
      feeErr = "Fee cannot be more than " + maxMoneyText;
      isPotValid = false;      
    }

    if (isPotValid) {      
      const duplicatePot = pots.find((pot) =>
        pot.pot_type === createPot.pot_type && pot.div_id === createPot.div_id            
      );
      if (duplicatePot) {        
        const duplicatePotErrMsg = `Pot: ${createPot.pot_type} - ${getDivName(createPot.div_id, divs)} already exists`;
        potErr = duplicatePotErrMsg;
        isPotValid = false;        
      }
    }

    setCreatePot({
      ...createPot,
      pot_type_err: potErr,
      div_err: divErr,
      fee_err: feeErr,
    })
    return isPotValid;
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (validNewPot()) {
      // create a new pot with a new id
      const newPot: potType = {
        ...createPot,
        id: btDbUuid('pot')
      };
      // add new pot      
      const mappedPots = pots.map((pot) => ({ ...pot }));
      mappedPots.push(newPot);
      setPots(mappedPots);  
      // update sort order for next new pot
      setCreatePot({
        ...createPot,
        sort_order: sortOrder + 1,
      });            
      setSortOrder(sortOrder + 1);
    } 
  };

  const confirmedDelete = () => {
    const idToDel = modalObj.id
    setShowingModal(false);
    setModalObj(initModalObj); // reset modal object (hides modal)
    const updatedData = pots.filter((pot) => pot.id !== idToDel);
    setPots(updatedData);
    setTabKey(defaultTabKey); // refocus create pot
  };

  const canceledDelete = () => {
    setShowingModal(false);
    setModalObj(initModalObj); // reset modal object (hides modal)
  };

  const handleDelete = (id: string) => {
    const potToDel = pots.find((pot) => pot.id === id);     
    if (!potToDel) return;
    const toDelName = getPotName(potToDel, divs); // potToDel.pot_type + " - " + potToDel.div_name;
    setShowingModal(true);
    setModalObj({
      show: true,
      title: delConfTitle,
      message: `Do you want to delete Pot: ${toDelName}?`,
      id: id,
    }); // deletion done in confirmedDelete
  };

  const handleCreatePotInputChange = (e: ChangeEvent<HTMLInputElement>) => { 
    const { id, name, value } = e.target;
    const ids = id.split("-");

    let updatedPot: potType;
    if (name === "potsDivRadio") { 
      const parentId = ids[1];
      updatedPot = {
        ...createPot,
        div_id: parentId, 
        div_err: "",
      };
      if (createPot.pot_type_err.includes('already exists')) {
        updatedPot.pot_type_err = "";
      }
    } else {
      updatedPot = {
        ...createPot,        
        pot_type: value as potCategoriesTypes,
        pot_type_err: "",
      };
    }
    setCreatePot(updatedPot);
  }

  const handleCreatePotAmountValueChange =
    (id: string) =>
    (value: string | undefined): void => {
      let rawValue = value === undefined ? "undefined" : value;
      rawValue = rawValue || " ";

      if (rawValue && Number.isNaN(Number(rawValue))) {
        rawValue = "";
      }
      let updatedPot: potType = {
        ...createPot,
        fee: rawValue,
        fee_err: "",        
      };
      setCreatePot(updatedPot);      
    }
  
  const handleAmountValueChange =
    (id: string) =>
    (value: string | undefined): void => {
      let rawValue = value === undefined ? "undefined" : value;
      rawValue = rawValue || " ";

      setPots(
        pots.map((pot) => {
          if (pot.id === id) {
            if (rawValue && Number.isNaN(Number(rawValue))) {
              rawValue = "";
            }
            let updatedPot: potType;
            updatedPot = {
              ...pot,
              fee: rawValue,
              fee_err: "",
              errClassName: "",
            };
            const acdnErrMsg = getNextPotAcdnErrMsg(updatedPot, pots, divs);
            if (acdnErrMsg) {
              setAcdnErr({
                errClassName: acdnErrClassName,
                message: acdnErrMsg,
              });
            } else {
              setAcdnErr(noAcdnErr);
            }
            return updatedPot;
          } else {
            return pot;
          }
        })
      );
    };

  const handleTabSelect = (key: string | null) => {
    if (key) {
      setTabKey(key);
    }
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
        id="pots-tabs"
        className="mb-3"
        variant="pills"
        activeKey={tabKey}
        onSelect={handleTabSelect}
      >
        {(tmntAction !== tmntActions.Run) ? (
          <Tab
            key="createPot"
            eventKey="createPot"
            title={createPotTitle}               
          >
            <div className="container rounded-3 createBackground">
              <div className="row g-3 mb-1">
                <div className="col-sm-3">              
                  <label className="form-label">
                    Pot Type
                  </label>
                  {potCategories.map((potCat) => (
                    <div key={potCat.id} className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="potTypeRadio"                    
                        id={`pot_type-${potCat.name}`}
                        value={potCat.name}
                        checked={createPot.pot_type === potCat.name}
                        onChange={handleCreatePotInputChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`pot_type-${potCat.name}`}
                      >
                        {potCat.name}
                      </label>
                    </div>
                  ))}
                  <div className="text-danger" data-testid="dangerPotType">
                    {createPot.pot_type_err}
                  </div>                
                </div>  
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
                        name="potsDivRadio"
                        id={`div_name-${div.id}-${div.div_name}-pots`}
                        value={div.div_name}
                        checked={createPot.div_id === div.id}
                        onChange={handleCreatePotInputChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`div_name-${div.id}-${div.div_name}-pots`}
                      >
                        {div.div_name}
                      </label>
                    </div>
                  ))}
                  <div className="text-danger" data-testid="dangerDiv">
                    {createPot.div_err}
                  </div>
                </div>   
                <div className="col-sm-3">
                  <label htmlFor="inputPotFee" className="form-label">
                    Fee
                  </label>
                  <EaCurrencyInput
                    id="inputPotFee"                      
                    name="inputPotFee"
                    className={`form-control ${createPot.fee_err && "is-invalid"}`}
                    value={createPot.fee}
                    onValueChange={handleCreatePotAmountValueChange(createPot.id)}
                  />
                  <div className="text-danger" data-testid="dangerPotFee">
                    {createPot.fee_err}
                  </div>
                </div>
                <div className="col-sm-3 d-flex justify-content-center align-items-start">
                  <button
                    className="btn btn-success mx-3"
                    onClick={handleAdd}
                  >
                    Add Pot
                  </button>
                </div>            
              </div>
            </div>
          </Tab>
        ) : null }
        {pots.map((pot) => (
          <Tab
            key={pot.id}
            eventKey={`${pot.id}`}
            title={getPotName(pot, divs)}
            tabClassName={`${pot.errClassName}`}
          >
            <div className="row g-3 mb-1">
              <div className="col-sm-3">
                <label
                  className="form-label"
                  htmlFor={`pot_type-${pot.id}`}
                >
                  Pot Type
                </label>
                <input
                  type="text"
                  className="form-control"
                  id={`pot_type-${pot.id}`}                      
                  name={`pot_type-${pot.id}`}
                  value={pot.pot_type}
                  disabled
                />
              </div>
              <div className="col-sm-3">
                <label
                  className="form-label"
                  htmlFor={`div_name-${pot.id}`}
                >
                  Division
                </label>
                <input
                  type="text"
                  className="form-control"
                  id={`div_name-${pot.id}`}                      
                  name={`div_name-${pot.id}`}                  
                  value={getDivName(pot.div_id, divs)}
                  disabled
                />
              </div>
              <div className="col-sm-3">
                <label className="form-label" htmlFor={`potFee-${pot.id}`}>
                  Fee
                </label>
                <EaCurrencyInput
                  id={`potFee-${pot.id}`}
                  name={`potFee-${pot.id}`}
                  className={`form-control ${pot.fee_err && "is-invalid"}`}
                  value={pot.fee}
                  onValueChange={handleAmountValueChange(pot.id)}
                  disabled={isDisabled}
                />
                <div
                  className="text-danger"
                  data-testid={`dangerPotFee${pot.id}`}
                >
                  {pot.fee_err}
                </div>
              </div>
              <div className="col-sm-3 d-flex justify-content-center align-items-start">
                <button                  
                  className={`btn ${delBtnStyle} mx-3`}
                  onClick={() => handleDelete(pot.id)}
                  disabled={isDisabled}
                >
                  Delete Pot
                </button>
              </div>                            
            </div>
          </Tab>
        ))}
      </Tabs>
    </>
  );
};

export default ZeroToNPots;
