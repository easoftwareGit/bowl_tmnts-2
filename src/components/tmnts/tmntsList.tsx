"use client";
import { FC, useState, useEffect } from "react";
import { tmntType, YearObj, tmntsListType } from "@/lib/types/types";

interface TmntListProps {
  years: YearObj[];
  tmnts: tmntsListType[];
  onYearChange: (val: string) => void | undefined;
}

interface SelectOption {
  value: string;
  text: string;
}

type SortDir = "ASC" | "DESC";

/**
 * for a sorted array, gets the inder to insert a new item,
 * keeping the array sorted
 *
 * @param {SelectOption[]} arr - array of sorted objects
 * @param {string} toBeAdded - new value to be added to sorted array
 * @param {SortDir} [sortDir="ASC"] - direction of sort
 * @return {*} {number} - index to insert new item
 */
function sortedIndex(
  arr: SelectOption[],
  toBeAdded: string,
  sortDir: SortDir = "ASC"
): number {
  let low = 0;
  let high = arr.length;

  while (low < high) {
    // same as Math.floor((low + high) / 2);
    let mid = (low + high) >>> 1;
    if (sortDir === "ASC") {
      if (arr[mid].text < toBeAdded) low = mid + 1;
      else high = mid;
    } else {
      if (arr[mid].text > toBeAdded) low = mid + 1;
      else high = mid;
    }
  }
  return low;
}

/**
 * gets an array of sorted state objects, no duplicates
 *
 * @param {tmntsListType[]} tmnts
 * @return {*}  {SelectOption[]}
 */
export function getSortedStateOptions(tmnts: tmntsListType[]): SelectOption[] {
  if (!tmnts) return [];
  const stateOptions: SelectOption[] = [];
  tmnts.forEach((tmnt) => {
    const state = tmnt.bowls.state;
    const index: number = sortedIndex(stateOptions, state);
    if (stateOptions.length > 0) {
      if (index === stateOptions.length) {
        stateOptions.push({ value: state, text: state });
      } else if (stateOptions[index].text !== state) {
        stateOptions.splice(index, 0, { value: state, text: state });
      }
    } else {
      stateOptions.push({ value: state, text: state });
    }
  });
  return stateOptions;
}

const TmntsList: FC<TmntListProps> = (props) => {
  const { years, tmnts } = props;

  let stateFilter: string = "all";
  const [filteredTmnts, setFilteredTmnts] = useState(tmnts);
  const [tmntYear, setTmntYear] = useState(years[0]?.year);  

  useEffect(() => {
    setFilteredTmnts(tmnts)
    setTmntYear(years[0]?.year)    
  }, [tmnts, years])

  function filterTmnt(tmnt: tmntsListType): boolean {
    if (stateFilter === "all") return true;
    return tmnt.bowls.state === stateFilter;
  }

  // populate array of states (no duplicates), keeping array sorted
  const sortedStates = getSortedStateOptions(tmnts);
  // add "all" at top
  sortedStates.splice(0, 0, { value: "all", text: "all" });

  function handleYearChange(e: any): void {    
    const { value } = e.target;     // get new selected year value    
    props.onYearChange(value);      // send value to parent, so parent can re-load tmnts for selected year        
    stateFilter = 'all';            // reset state filter
    setFilteredTmnts([]);           // reset filtered tmnts to all tmnts for year
    let selFilter: any = document?.getElementById("stateFilter")  // get state filter element
    if (selFilter) {                
      selFilter.selectedIndex = 0;  // reset selcted state filter to top value, 'all'
    }    
  }

  function handleStateFilterChange(e: any): void {
    const { value } = e.target;
    stateFilter = value;
    setFilteredTmnts(tmnts.filter(filterTmnt));
  }

  return (
    <>
      <div className="d-flex bg-primary">
        <div className="flex-grow-1 bg-secondary-subtle"></div>
        {/* style width is in pixels */}
        <div
          className="d-flex justify-content-center tmnt_table bg-primary-subtle"
          style={{ width: 720 }}
        >
          <table className="table table-striped table-hover w-100">
            <thead>
              <tr>
                <th className="align-middle" style={{ width: 100 }}>
                  Tournament
                </th>
                <th style={{ width: 150 }}>   
                  {years.length ? (
                    <select
                      className="form-select w-auto"
                      id="yearSelect"
                      onChange={handleYearChange}
                      data-testid="yearSelect"
                    >
                      {years.map((yearObj) => (
                        <option
                          key={yearObj.year}
                          value={yearObj.year}
                          data-testid="select-option"
                        >
                          {yearObj.year}
                        </option>
                      ))}
                    </select>
                  ) : null }  
                </th>
                <th className="align-middle" style={{ width: 300 }}>
                  Center
                </th>
                <th>
                  <select
                    id="stateFilter"
                    className="form-select w-100"
                    aria-label="Select State"
                    data-testid="stateSelect"
                    onChange={handleStateFilterChange}
                  >
                    {sortedStates.map((stateObj) => (
                      <option key={stateObj.value} value={stateObj.value}>
                        {stateObj.text}
                      </option>
                    ))}
                  </select>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTmnts.map((tmnt) => (
                <tr key={tmnt.id}>
                  <td colSpan={2}>{tmnt.tmnt_name}</td>
                  <td>
                    <a
                      href={tmnt.bowls.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {tmnt.bowls.bowl_name}
                    </a>
                  </td>
                  <td>
                    {tmnt.bowls.city}, {tmnt.bowls.state}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex-grow-1 bg-secondary-subtle"></div>
      </div>
    </>
  );
};

export default TmntsList;
