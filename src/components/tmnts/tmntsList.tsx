"use client";
import { FC, useState, useEffect } from "react";
import type { YearObj, tmntsListType } from "@/lib/types/types";
import Link from "next/link";
import { getMonthDay } from "@/lib/dateTools";

interface TmntListProps {
  years: YearObj[];
  tmnts: tmntsListType[];
  tmntYear: string;
  showResults: boolean;
  onYearChange: (val: string) => void;
}

interface SelectOption {
  value: string;
  text: string;
}

type SortDir = "ASC" | "DESC";

function sortedIndex(
  arr: SelectOption[],
  toBeAdded: string,
  sortDir: SortDir = "ASC"
): number {
  let low = 0;
  let high = arr.length;

  while (low < high) {
    const mid = (low + high) >>> 1;
    const midOption = arr[mid];
    if (midOption === undefined) break; // can't happen: mid is always < arr.length
    if (sortDir === "ASC") {
      if (midOption.text < toBeAdded) low = mid + 1;
      else high = mid;
    } else {
      if (midOption.text > toBeAdded) low = mid + 1;
      else high = mid;
    }
  }
  return low;
}

/**
 * gets an array of sorted state objects, no duplicates
 * 
 * @param {tmntsListType[]} tmnts - array of tmnts
 * @return {SelectOption[]} - array of sorted state objects, or empty array
 */
export function getSortedStateOptions(tmnts: tmntsListType[]): SelectOption[] {  
  if (!Array.isArray(tmnts)) return [];
  const stateOptions: SelectOption[] = [];
  tmnts.forEach((tmnt) => {
    const state = tmnt.bowl.state;
    const index: number = sortedIndex(stateOptions, state);
    // stateOptions[index] is undefined when index === length (add at end),
    // and splice at length works the same as push
    if (stateOptions[index]?.text !== state) {
      stateOptions.splice(index, 0, { value: state, text: state });
    }
  });
  return stateOptions;
}

const TmntsList: FC<TmntListProps> = (props) => {
  const { years, tmnts, tmntYear, showResults } = props;

  const [stateFilter, setStateFilter] = useState("all");
  const [filteredTmnts, setFilteredTmnts] = useState(tmnts);

  // new tmnts from the parent: show them all, and reset the state filter
  // so the select matches the list
  useEffect(() => {
    setFilteredTmnts(tmnts);
    setStateFilter("all");
  }, [tmnts]);

  const TmntMonthDay = (tmnt: tmntsListType): string => {
    return getMonthDay(tmnt.start_date_str);
  };

  const sortedStates = getSortedStateOptions(tmnts);
  sortedStates.splice(0, 0, { value: "all", text: "all" });

  function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    const { value } = e.target;

    props.onYearChange(value); // parent re-loads tmnts for the selected year
    setStateFilter("all");     // reset state filter; the controlled select follows
    setFilteredTmnts([]);      // clear the list until the parent sends the new year's tmnts
  }

  function handleStateFilterChange(
    e: React.ChangeEvent<HTMLSelectElement>,
  ): void {
    const { value } = e.target;
    setStateFilter(value);
    setFilteredTmnts(
      value === "all"
        ? tmnts
        : tmnts.filter((tmnt) => tmnt.bowl.state === value),
    );
  }

  return (
    <>
      <div className="d-flex justify-content-center">
        <div
          className="tmnt_table"
          style={{ width: 720 }}
        >
          <table className="table table-sm table-striped table-hover w-100">
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
                      value={tmntYear}
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
                    value={stateFilter}
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
            <tbody className="table-group-divider">
              {filteredTmnts.map((tmnt) => (
                <tr key={tmnt.id}>
                  <td colSpan={2}>
                    {showResults
                      ?
                      <Link href={`/results/tmnt/${tmnt.id}/home`}>
                        {tmnt.tmnt_name} - {TmntMonthDay(tmnt)}
                      </Link>
                      : <>{tmnt.tmnt_name} - {TmntMonthDay(tmnt)}</>
                    }
                  </td>
                  <td>
                    <a
                      href={tmnt.bowl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {tmnt.bowl.bowl_name}
                    </a>
                  </td>
                  <td>
                    {tmnt.bowl.city}, {tmnt.bowl.state}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TmntsList;
