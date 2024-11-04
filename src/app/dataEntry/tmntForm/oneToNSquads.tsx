import React, { useState, ChangeEvent } from "react";
import { squadType, AcdnErrType, eventType, laneType } from "../../../lib/types/types";
import { initSquad } from "../../../lib/db/initVals";
import { Tabs, Tab } from "react-bootstrap";
import ModalConfirm, { delConfTitle } from "@/components/modal/confirmModal";
import { initModalObj } from "@/components/modal/modalObjType";
import { 
  objErrClassName,
  acdnErrClassName,
  getAcdnErrMsg,
  noAcdnErr,
  isDuplicateSquadName,
  isDuplicateDateTime,
} from "./errors";
import { maxEventLength, minGames, maxGames, minStartLane, maxStartLane, minLaneCount, maxLaneCount, isOdd, isEven } from "@/lib/validation";
import { dateTo_UTC_MMddyyyy, getYearMonthDays, startOfDayFromString, startOfTodayUTC, todayStr, twelveHourto24Hour } from "@/lib/dateTools";
import { btDbUuid } from "@/lib/uuid";
import { compareAsc, isValid } from "date-fns";
import { lanesNotThisSquad } from "@/components/tmnts/lanesList";

interface ChildProps {
  squads: squadType[];
  setSquads: (squads: squadType[]) => void;
  lanes: laneType[];
  setLanes: (lanes: laneType[]) => void;
  events: eventType[];
  setAcdnErr: (objAcdnErr: AcdnErrType) => void;  
}
interface AddOrDelButtonProps {
  id: string;
  sortOrder: number;
}

// const defaultTabKey = "squad1";

const getSquadErrMsg = (squad: squadType): string => {

  if (squad.event_id_err) return squad.event_id_err;
  if (squad.squad_name_err) return squad.squad_name_err;
  if (squad.games_err) return squad.games_err;  
  if (squad.starting_lane_err) return squad.starting_lane_err;
  if (squad.lane_count_err) return squad.lane_count_err;
  if (squad.squad_date_err) return squad.squad_date_err;
  if (squad.squad_time_err) return squad.squad_time_err;  
  return "";
};

const getNextAcdnErrMsg = (
  updatedSquad: squadType | null,
  squads: squadType[]
): string => {
  let errMsg = "";
  let acdnErrMsg = "";
  let i = 0;
  let squad: squadType;
  while (i < squads.length && !errMsg) {
    squad = (squads[i].id === updatedSquad?.id) ? updatedSquad : squads[i];
    errMsg = getSquadErrMsg(squad);
    if (errMsg) {
      acdnErrMsg = getAcdnErrMsg(squad.squad_name, errMsg);
    }
    i++;
  }
  return acdnErrMsg;
};

export const validateSquads = (
  squads: squadType[],
  setSquads: (squads: squadType[]) => void,
  events: eventType[],
  setAcdnErr: (objAcdnErr: AcdnErrType) => void,
  minDate: Date = startOfTodayUTC(),
  maxDate: Date = startOfTodayUTC(),
): boolean => {
  let areSquadsValid = true;
  let eventIdErr = "";
  let nameErr = "";
  let gameErr = "";
  let startingLaneErr = "";
  let laneCountErr = "";
  let dateErr = "";
  let timeErr = "";
  let squadErrClassName = "";
  let squadMaxGames = maxGames

  const setError = (squadName: string, errMsg: string) => {
    if (areSquadsValid) {
      setAcdnErr({
        errClassName: acdnErrClassName,
        message: getAcdnErrMsg(squadName, errMsg),
      });
    }
    areSquadsValid = false;
    squadErrClassName = objErrClassName;
  };

  setSquads(
    squads.map((squad) => {
      squadErrClassName = "";
      const event = events.find(ev => ev.id === squad.event_id);
      if (!event) {
        eventIdErr = "Event not found"
        setError(squad.squad_name, eventIdErr);
        squadMaxGames = maxGames
      } else {
        squadMaxGames = event.games
        eventIdErr = "";
      }
      if (!squad.squad_name.trim()) {
        nameErr = "Squad Name is required";
        setError('Squads', nameErr);
      } else if (isDuplicateSquadName(squads, squad)) {
        nameErr = `"${squad.squad_name}" has already been used.`;
        setError(squad.squad_name, nameErr);
      } else {
        nameErr = "";
      }
      if (squad.games < minGames) {
        gameErr = "Squad Games cannot be less than " + (minGames);
        setError(squad.squad_name, gameErr);
      } else if (squad.games > squadMaxGames) {        
        gameErr = "Squad Games cannot be more than " + (squadMaxGames);
        setError(squad.squad_name, gameErr);
      } else {
        gameErr = "";
      }
      if (squad.starting_lane < 1) { 
        startingLaneErr = "Starting Lane cannot be less than 1";
        setError(squad.squad_name, startingLaneErr);
      } else if (squad.starting_lane > maxStartLane) {
        startingLaneErr = "Starting Lane cannot be more than " + maxStartLane;
        setError(squad.squad_name, startingLaneErr);      
      } else if (!isOdd(squad.starting_lane)) {
        startingLaneErr = "Starting Lane cannot be even";
        setError(squad.squad_name, startingLaneErr);
      } else {
        startingLaneErr = "";      
      }
      if (squad.lane_count < minLaneCount) {              
        laneCountErr = "Number of Lanes cannot be less than 2";
        setError(squad.squad_name, laneCountErr);
      } else if (squad.lane_count > maxLaneCount) {
        laneCountErr = "Number of Lanes cannot be more than " + maxLaneCount;
        setError(squad.squad_name, laneCountErr);
      } else if (isOdd(squad.lane_count)) {
        laneCountErr = "Number of Lanes cannot be odd";
        setError(squad.squad_name, laneCountErr);
      } else {
        laneCountErr = "";
      }
      if (!squad.squad_date) {
        dateErr = "Date is required";
        setError(squad.squad_name, dateErr);
      } else if (!isValid(new Date(squad.squad_date))) {
        dateErr = "Date is invalid";
        setError(squad.squad_name, dateErr);
      } else if (compareAsc(squad.squad_date, minDate) < 0) {
        dateErr = "Earliest date is " + dateTo_UTC_MMddyyyy(minDate);        
        setError(squad.squad_name, dateErr);
      } else if (compareAsc(squad.squad_date, maxDate) > 0) {                      
        dateErr = "Latest date is " + dateTo_UTC_MMddyyyy(maxDate);
        setError(squad.squad_name, dateErr);
      } else {
        dateErr = "";
      }
      if (squads.length === 1) {
        if (!squad.squad_time) {
          timeErr = "";
        }
      } else {
        if (!squad.squad_time) {
          timeErr = 'Time is required'
          setError(squad.squad_name, timeErr);
        } else if (isDuplicateDateTime(squads, squad)) {
          const dateErr = dateTo_UTC_MMddyyyy(new Date(squad.squad_date)) 
          timeErr = `${dateErr} - ${squad.squad_time} has already been used.`;
          setError(squad.squad_name, timeErr);
        } else {
          timeErr = ""; 
        }
      }
      return {
        ...squad,
        event_id_err: eventIdErr,
        squad_name_err: nameErr,
        games_err: gameErr,
        starting_lane_err: startingLaneErr,
        lane_count_err: laneCountErr,
        squad_date_err: dateErr,
        squad_time_err: timeErr,
        errClassName: squadErrClassName,
      };
    })
  );
  if (areSquadsValid) {
    setAcdnErr(noAcdnErr);
  }
  return areSquadsValid;
};

/**
 * return an updated array of lanes for the tournament
 * 
 * @param lanes - the array of lanes for the tournament
 * @param squad - the current squad
 * @returns - an array with the updated array of lanes
 */
export const updatedLanes = (lanes: laneType[], squad: squadType): laneType[] => {
  
  if (!lanes || !squad || squad.id === "") return [];
  const nonSquadLanes = lanesNotThisSquad(squad.id, lanes);
  const newLanesThisSquad: laneType[] = [];
  for (let laneNum = squad.starting_lane; laneNum < squad.starting_lane + squad.lane_count; laneNum++) {    
    const newLane: laneType = {
      id: btDbUuid('lan'),
      lane_number: laneNum,
      squad_id: squad.id,
      in_use: true
    }      
    newLanesThisSquad.push(newLane);
  }
  return ([...nonSquadLanes, ...newLanesThisSquad]);
}

/**
 * checks if the staring lane and lane count are valid
 * 
 * @param squad - the current squad
 * @returns true: bothe starting lane and lane count are valid
 */
export const validLanes = (squad: squadType): boolean => {
  return (squad.starting_lane >= minStartLane &&
          squad.starting_lane <= maxStartLane && 
          isOdd(squad.starting_lane) &&
          squad.lane_count >= minLaneCount &&
          squad.lane_count <= maxLaneCount &&
          isEven(squad.lane_count))   
}

type squadDateStrType = {  
  id: string;
  squad_date_str: string,
}

const OneToNSquads: React.FC<ChildProps> = ({
  squads,
  setSquads,
  events,
  lanes,
  setLanes,
  setAcdnErr,
}) => {

  const defaultTabKey = squads[0].id;

  const [modalObj, setModalObj] = useState(initModalObj);
  const [tabKey, setTabKey] = useState(defaultTabKey);  
  const [sortOrder, setSortOrder] = useState(1); // id # used in initSquads in form.tsx

  const clearLanes = (squad: squadType) => {
    const nonSquadLanes = lanes.filter((lane) => lane.squad_id !== squad.id);
    setLanes(nonSquadLanes);
  }

  const handleAdd = () => {    
    const newSquad: squadType = {
      ...initSquad,
      id: btDbUuid('sqd'),
      squad_name: "Squad " + (sortOrder + 1),
      tab_title: "Squad " + (sortOrder + 1),
      sort_order: sortOrder + 1,
    };
    setSortOrder(sortOrder + 1);
    setSquads([...squads, newSquad]);
    setLanes(updatedLanes(lanes, newSquad));    
  };

  const confirmedDelete = () => {
    const idToDel = modalObj.id
    setModalObj(initModalObj); // reset modal object (hides modal)

    // filter out deleted squad
    const updatedData = squads.filter((squad) => squad.id !== idToDel);
    setSquads(updatedData);

    // filter out lanes for deleted squad 
    const updatedLanes = lanes.filter((lane) => lane.squad_id !== idToDel);
    setLanes(updatedLanes);    

    // if had multiple squads, then squad time is manditory
    // if now only have 1 squad and time was missing, then clear time error
    if (updatedData.length === 1 && updatedData[0].squad_time_err === "Time is required") {
      setSquads(
        updatedData.map((squad) => {
          return {
            ...squad,
            squad_time_err: "",
          };
        })
      )
    }

    // deleted squad might have an acdn error, get next acdn error
    let acdnErrMsg = getNextAcdnErrMsg(null, updatedData);
    // if now only have 1 squad and time was missing, then clear time error
    if (updatedData.length === 1 && acdnErrMsg.includes('Time is required')) { 
      acdnErrMsg = '';
    }
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
    setModalObj(initModalObj); // reset modal object (hides modal)
  };

  const handleDelete = (id: string) => {
    const squadToDel = squads.find((squad) => squad.id === id);
    // if did not find event only 1 event (must have at least 1 event)
    if (!squadToDel || squads.length === 1) return;

    const toDelName = squadToDel.squad_name;
    setModalObj({
      show: true,
      title: delConfTitle,
      message: `Do you want to delete Squad: ${toDelName}?`,
      id: id,
    }); // deletion done in confirmedDelete
  };

  const handleInputChange = (id: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nameErr = name + "_err";

    setSquads(
      squads.map((squad) => {
        if (squad.id === id) {
          let updatedSquad: squadType;
          // set tabTitle changing name property value
          if (name === "name") {
            updatedSquad = {
              ...squad,
              squad_name: value,
              tab_title: value,
              squad_name_err: "",
            };
          } else if (name === "games") {
            const valueNum = Number(value)
            updatedSquad = {
              ...squad,
              [name]: valueNum,
              [nameErr]: "",
            }
          } else if (name === "starting_lane" || name === "lane_count") {
            const valueNum = Number(value)
            updatedSquad = {
              ...squad,
              [name]: valueNum,
              [nameErr]: "",
            }
            if (validLanes(updatedSquad)) {
              setLanes(updatedLanes(lanes, updatedSquad));
            } else {
              clearLanes(updatedSquad);
            }
          } else if (name === "squad_time") {
            const valueAsDate = e.target.valueAsDate;
            let timeStr = "";
            if (valueAsDate) {
              const offset = valueAsDate.getTimezoneOffset();
              let currentDateTime = new Date(
                valueAsDate.getFullYear(),
                valueAsDate.getMonth() - 1,
                valueAsDate.getDate(),
                valueAsDate.getHours(),
                valueAsDate.getMinutes() + offset
              );
              timeStr = currentDateTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              timeStr = twelveHourto24Hour(timeStr);
            }
            updatedSquad = {
              ...squad,
              squad_time: timeStr,
              squad_time_err: "",
            };
          } else if (name === "squad_date") {
            if (e.target.valueAsDate) {
              updatedSquad = {
                ...squad,
                squad_date: startOfDayFromString(value) as Date,
                squad_date_str: value,
                squad_date_err: "",                
              };
            } else {
              updatedSquad = {
                ...squad,
              };
            }
          } else {
            updatedSquad = {
              ...squad,
              [name]: value,
              [nameErr]: "",
            };
          }
          const acdnErrMsg = getNextAcdnErrMsg(updatedSquad, squads);
          if (acdnErrMsg) {
            setAcdnErr({
              errClassName: acdnErrClassName,
              message: acdnErrMsg,
            });
          } else {
            setAcdnErr(noAcdnErr);
          }
          const errMsg = getSquadErrMsg(updatedSquad);
          if (errMsg) {
            return {
              ...updatedSquad,
              errClassName: objErrClassName,
            };
          } else {
            return {
              ...updatedSquad,
              errClassName: "",
            };
          }
        } else {
          return squad;
        }
      })
    );
  };

  const handleBlur = (id: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (!value.trim()) {
      setSquads(
        squads.map((squad) => {
          if (squad.id === id) {
            if (name === "name") {
              return {
                ...squad,
                name: "Squad " + squad.id,
                tab_title: "Squad " + squad.id,
                name_err: "",
              };
            } else if (name === "games") {
              return {
                ...squad,
                games: 3,
                games_err: "",
              };
            } else if (name === "starting_lane") {
              return {
                ...squad,
                starting_lane: 1,
                starting_lane_err: "",
              };                          
            } else if (name === "lane_count") {
              return {
                ...squad,
                lane_count: 2,
                lane_count_err: "",
              };                          
            } else if (name === "squad_date") {
              const ymd = getYearMonthDays(value);
              if (ymd.year === 0 || ymd.month === 0 || ymd.days === 0) {
                return {
                  ...squad,
                  squad_date: new Date(Date.UTC(ymd.year, ymd.month, ymd.days)),
                  squad_date_err: "",
                };                
              } else {
                return squad;
              }
            } else if (name === "squad_time") {
              const timeInput = document.getElementById(
                `inputSquadTime${id}`
              ) as HTMLInputElement;
              if (timeInput) {
                timeInput.value = "";
              }
              return {
                ...squad,
                squad_time: "",
                squad_time_err: "",
              };
            } else {
              return squad;
            }
          } else {
            return squad;
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

  const handleEventSelectChange = (id: string) => (e: ChangeEvent<HTMLSelectElement>) => {
    const { selectedIndex } = e.target;
    setSquads(
      squads.map(squad => {
        if (squad.id === id) {
          // get event id # from selectedIndex of events
          const eventId = events[selectedIndex].id;
          return {
            ...squad, 
            event_id: eventId,
            event_nane_err: '',
          }
        } else {
          return squad
        }
      })
    )
  };

  const AddOrDelButton: React.FC<AddOrDelButtonProps> = ({ id, sortOrder }) => {
    if (sortOrder === 1) {
      return (
        <div className="col-sm-3">
          <label htmlFor="inputNumSquads" className="form-label">
            # Squads            
          </label>
          <div className="row g-0">
            <div className="col-sm-8">
              <input
                disabled
                type="text"
                className="form-control"
                id="inputNumSquads"                
                name="num_Squads"
                value={squads.length}
              />
            </div>
            <div className="d-grid col-sm-4">            
              <button
                className="btn btn-success"
                id="squadAdd"
                data-testid="squadAdd"
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
            id="squadDel"            
            onClick={() => handleDelete(id)}
          >
            Delete Squad
          </button>
        </div>
      );
    }
  };

  const eventOptions = events.map(event => (
    <option key={event.id} value={event.id}>
      {event.event_name}
    </option>
  ));

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
        id="squad-tabs"
        className="mb-2"
        variant="pills"
        activeKey={tabKey}
        onSelect={handleTabSelect}
      >
        {squads.map((squad) => (
          <Tab
            key={squad.id}
            eventKey={`${squad.id}`}
            title={squad.tab_title}
            tabClassName={`${squad.errClassName}`}
          >
            <div className="row g-3 mb-3">
              {/* AddOrDelButton includes a <div className="col-sm-3">...</div> */}
              <AddOrDelButton id={squad.id} sortOrder={squad.sort_order} />
              <div className="col-sm-3">
                <label
                  htmlFor={`inputSquadName${squad.id}`}
                  className="form-label"
                >
                  Squad Name
                </label>
                <input
                  type="text"
                  className={`form-control ${squad.squad_name_err && "is-invalid"}`}
                  id={`inputSquadName${squad.id}`}                  
                  name="name"
                  maxLength={maxEventLength}
                  value={squad.squad_name}
                  onChange={handleInputChange(squad.id)}
                  onBlur={handleBlur(squad.id)}
                />
                <div
                  className="text-danger"
                  data-testid="dangerSquadName"
                >
                  {squad.squad_name_err}
                </div>
              </div>
              <div className="col-sm-3">
                <label
                  htmlFor={`inputSquadGames${squad.id}`}
                  className="form-label"
                >
                  Squad Games
                </label>
                <input
                  type="number"
                  min={minGames}
                  max={maxGames}
                  step={1}
                  className={`form-control ${squad.games_err && "is-invalid"}`}
                  id={`inputSquadGames${squad.id}`}                  
                  name="games"
                  value={squad.games}
                  onChange={handleInputChange(squad.id)}
                  onBlur={handleBlur(squad.id)}
                />
                <div
                  className="text-danger"
                  data-testid="dangerSquadGames"
                >
                  {squad.games_err}
                </div>
              </div>
              <div className="col-sm-3">
              <label
                  htmlFor={`inputSquadEvent${squad.id}`}
                  className="form-label"
                >
                  Event
                </label>
                <select
                  id={`inputSquadEvent${squad.id}`}                  
                  className={`form-select ${squad.event_id_err && "is-invalid"}`}
                  onChange={handleEventSelectChange(squad.id)}
                  // defaultValue={events[0].id}
                  value={squad.event_id}
                >
                  {eventOptions}
                </select>
                <div
                  className="text-danger"
                  data-testid="dangerSquadEvent"
                >
                  {squad.event_id_err}
                </div>
              </div>
            </div>
            <div className="row g-3">              
              <div className="col-sm-3">
                <label
                  htmlFor={`inputStartingLane${squad.id}`}
                  className="form-label"
                >
                  Starting Lane
                </label>
                <input
                  type="number"
                  min={minStartLane}
                  max={maxStartLane}
                  step={2}
                  className={`form-control ${squad.starting_lane_err && "is-invalid"}`}
                  id={`inputStartingLane${squad.id}`}                  
                  name="starting_lane"
                  value={squad.starting_lane}
                  onChange={handleInputChange(squad.id)}
                  onBlur={handleBlur(squad.id)}
                />
                <div
                  className="text-danger"
                  data-testid="dangerStartingLane"
                >
                  {squad.starting_lane_err}
                </div>
              </div>
              <div className="col-sm-3">
                <label
                  htmlFor={`inputLaneCount${squad.id}`}
                  className="form-label"
                  title="Number of lanes used in the squad"
                >
                  # of Lanes <span className="popup-help">&nbsp;?&nbsp;</span>
                </label>
                <input
                  type="number"
                  min={minLaneCount}
                  max={maxLaneCount}
                  step={2}
                  className={`form-control ${squad.lane_count_err && "is-invalid"}`}
                  id={`inputLaneCount${squad.id}`}                  
                  name="lane_count"
                  value={squad.lane_count}
                  onChange={handleInputChange(squad.id)}
                  onBlur={handleBlur(squad.id)}
                />
                <div
                  className="text-danger"
                  data-testid="dangerLaneCount"
                >
                  {squad.lane_count_err}
                </div>
              </div>
              <div className="col-sm-3">
                <label
                  htmlFor={`inputSquadDate${squad.id}`}
                  className="form-label"
                >
                  Date
                </label>
                <input
                  type="date"
                  className={`form-control ${
                    squad.squad_date_err && "is-invalid"
                  }`}
                  id={`inputSquadDate${squad.id}`}                  
                  name="squad_date"
                  data-testid="squadDate"
                  value={squad.squad_date_str}
                  onChange={handleInputChange(squad.id)}
                  onBlur={handleBlur(squad.id)}
                />
                <div
                  className="text-danger"
                  data-testid="dangerSquadDate"
                >
                  {squad.squad_date_err}
                </div>
              </div>
              <div className="col-sm-3">
                <label
                  htmlFor={`inputSquadTime${squad.id}`}
                  className="form-label"
                >
                  Start Time
                </label>
                <input
                  type="time"
                  className={`form-control ${
                    squad.squad_time_err && "is-invalid"
                  }`}
                  id={`inputSquadTime${squad.id}`}                  
                  name="squad_time"
                  // value={squad.squad_time ?? ""}
                  value={squad.squad_time !== null ? squad.squad_time : ""}
                  onChange={handleInputChange(squad.id)}
                  onBlur={handleBlur(squad.id)}
                />
                <div
                  className="text-danger"
                  data-testid="dangerSquadTime"
                >
                  {squad.squad_time_err}
                </div>
              </div>
            </div>
          </Tab>
        ))}
      </Tabs>
    </>
  );
};

export default OneToNSquads;
