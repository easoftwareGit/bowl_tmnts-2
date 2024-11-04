"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import { Tab, Tabs } from "react-bootstrap";
// import { mockPots, mockDivs } from "../../../test/mocks/tmnts/twoDivs/mockDivs";
import { PotCategoryObjType, potType } from "@/lib/types/types";
import { blankPot, initPot } from "@/lib/db/initVals";
import EaCurrencyInput from "@/components/currency/eaCurrencyInput";
import { btDbUuid } from "@/lib/uuid";
import { getPotName } from "@/lib/getName";

import "./form.css";

export const Form12: React.FC = () => {
  

  const myPots = [
    {
      id: btDbUuid('pot'),      
      pot_type: "Game",
      div_id: 1,
      div_name: "Div 1",
      fee: '20',
      sort_order: 1,
    },
    {
      id: btDbUuid('pot'),      
      pot_type: "Last Game",
      div_id: 1,
      div_name: "Div 1",
      fee: '20',
      sort_order: 1,
    },
  ]
  const defaultTabKey = 'createPot';  

  const [createPot, setCreatePot] = useState(blankPot);
  const [pots, setPots] = useState(myPots);
  const [tabKey, setTabKey] = useState('createPot');
  // const [divs, setDivs] = useState(mockDivs);
  const [potSortOrder, setPotSortOrder] = useState(1);

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
  
  const handleAdd = (e: React.FormEvent) => {
    alert(`Add Pot`);
    // e.preventDefault();
    // const newPot: potType = {
    //   ...initPot,
    //   id: btDbUuid('pot'),
    //   pot_type: pots[0].pot_type,
    //   div_id: pots[0].div_id,
    //   div_name: pots[0].div_name,
    //   fee: pots[0].fee,
    //   sort_order: potSortOrder + 1,
    // };
    // setPotSortOrder(potSortOrder + 1);

    // const mappedPots = pots.map((pot) => ({ ...pot }));
    //   mappedPots[0] = {
    //     ...initPot,
    //   }
    // mappedPots.push(newPot);
    // setPots(mappedPots);    
  };

  const handleDelete = (id: string) => { 
    alert(`delete ${id}`);
  }

  const handleCreatePotAmountValueChange =
    (id: string) =>
    (value: string | undefined): void =>
  {
    let rawValue = value === undefined ? "undefined" : value;
    rawValue = rawValue || " ";
    
    if (rawValue && Number.isNaN(Number(rawValue))) {
      rawValue = "";
    }
    let updatedPot: potType;
    updatedPot = {
      ...createPot,
      fee: rawValue,
      fee_err: "",
      errClassName: "",
    };
    setCreatePot(updatedPot);
  };
   
  const handleAmountValueChange =
    (id: string) =>
    (value: string | undefined): void => {
      let rawValue = value === undefined ? "undefined" : value;
      rawValue = rawValue || " ";

      // setPots(
      //   pots.map((pot) => {
      //     if (pot.id === id) {
      //       if (rawValue && Number.isNaN(Number(rawValue))) {
      //         rawValue = "";
      //       }
      //       let updatedPot: potType;
      //       updatedPot = {
      //         ...pot,
      //         fee: rawValue,
      //         fee_err: "",
      //         errClassName: "",
      //       };
      //       return updatedPot;
      //     } else {
      //       return pot;
      //     }
      //   })
      // );
    };


  const handleCreatePotInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id } = e.target;
    const ids = id.split("-");
    const name = ids[0];
    const value = ids[2];

    // // only pots[0] has editable pot_type and div_name
    // let updatedPot: potType;
    // if (name === "div_name") {
    //   updatedPot = {
    //     ...pots[0],
    //     div_name: value,
    //     div_id: ids[1],
    //     div_err: "",
    //   };
    // } else {
    //   // use [name] here, not pot_type, becuase typescript
    //   // does not like assigning pot_name: value
    //   updatedPot = {
    //     ...pots[0],
    //     [name]: value,
    //     pot_type_err: "",
    //   };
    // }
    // updatedPot.errClassName = "";

    // setPots(
    //   pots.map((pot) => {
    //     if (pot.id === updatedPot.id) {
    //       return updatedPot;
    //     }
    //     return pot;
    //   })
    // );
  };

  const handleTabSelect = (key: string | null) => {
    if (key) {
      setTabKey(key);
    }
  };

  return (
    <>
      <Tabs
        defaultActiveKey={defaultTabKey}
        id="test-tabs"
        className="mb-2"
        variant="pills"
        activeKey={tabKey}
        onSelect={handleTabSelect}
      >
        <Tab
          key={'createPot'}
          eventKey={'createPot'}
          title={'Create Pot'}
        >
          <div className="row g-3 mb-3">
            <div className="col-sm-3">
              <label
                className="form-label"                      
              >
                Pot Type
              </label>
              {/* {potCategories.map((potCat) => (
                <div key={potCat.id} className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="potTypeRadio"
                    id={`pot_type-${potCat.id}-${potCat.name}`}                          
                    value={potCat.name}
                    checked={createPot.pot_type === potCat.name}
                    // onChange={handleCreatePotInputChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`pot_type-${potCat.id}-${potCat.name}`}
                  >
                    {potCat.name}
                  </label>
                </div>
              ))}
              <div className="text-danger" data-testid="dangerPotType">
                {createPot.pot_type_err}
              </div> */}
            </div>
            <div className="col-sm-3">
              <label
                className="form-label"                      
              >
                Division
              </label>
              {/* {divs.map((div) => (
                <div key={div.id} className="form-check text-break">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="potsDivRadio"
                    id={`div_name-${div.id}-${div.div_name}-pots`}                          
                    value={div.div_name}
                    checked={createPot.div_name === div.div_name}
                    // onChange={handleCreatePotInputChange}
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
              </div> */}
            </div>
            <div className="col-sm-3">
              <label htmlFor="inputPotFee" className="form-label">
                Fee
              </label>
              {/* <EaCurrencyInput
                id="inputPotFee"                      
                name="inputPotFee"
                className={`form-control ${createPot.fee_err && "is-invalid"}`}
                value={createPot.fee}
                // onValueChange={handleCreatePotAmountValueChange(createPot.id)}
              />
              <div className="text-danger" data-testid="dangerPotFee">
                {createPot.fee_err}
              </div> */}
            </div>
            <div className="col-sm-3 d-flex justify-content-center align-items-start">
              <button
                className="btn btn-success mx-3"
                // onClick={handleAdd}
              >
                Add Pot
              </button>
            </div>            
          </div>
        </Tab>
        {pots.map((pot) => ( 
          <Tab
            key={pot.id}
            eventKey={`${pot.id}`}
            // title={getPotName(pot, divs)}              
            title={pot.pot_type}
          > 
            <div className="col-sm-3">
              <label
                className="form-label"
                htmlFor={`pot_type-${pot.id}`}
              >
                Pot Type
              </label>
              {/* <input
                type="text"
                className="form-control"
                id={`pot_type-${pot.id}`}                      
                name={`pot_type-${pot.id}`}
                value={pot.pot_type}
                disabled
              /> */}
            </div>
            <div className="col-sm-3">
              <label
                className="form-label"
                htmlFor={`div_name-${pot.id}`}
              >
                Division
              </label>
              {/* <input
                type="text"
                className="form-control"
                id={`div_name-${pot.id}`}                      
                name={`div_name-${pot.id}`}
                value={pot.div_name}
                disabled
              /> */}
            </div>
            <div className="col-sm-3">
              <label className="form-label" htmlFor={`potFee-${pot.id}`}>
                Fee
              </label>
              {/* <EaCurrencyInput
                id={`potFee-${pot.id}`}                      
                name={`potFee-${pot.id}`}
                className={`form-control ${pot.fee_err && "is-invalid"}`}
                value={pot.fee}
                // onValueChange={handleAmountValueChange(pot.id)}
              />
              <div
                className="text-danger"
                data-testid={`dangerPotFee${pot.sort_order}`}
              >
                {pot.fee_err}
              </div> */}
            </div>
            <div className="col-sm-3 d-flex justify-content-center align-items-start">
              <button
                className="btn btn-danger mx-3"
                // onClick={() => handleDelete(pot.id)}
              >
                Delete Pot
              </button>
            </div>
          </Tab>
        ))}
      </Tabs>      
    </>
  );
};
