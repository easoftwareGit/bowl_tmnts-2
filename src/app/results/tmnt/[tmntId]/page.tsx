"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useParams } from "next/navigation";
import { Tabs, Tab } from "react-bootstrap";
import {
  fetchOneTmntGameResults,
  getOneTmntGameResultsError,
  getOneTmntGameResultsLoadStatus,
  selectOneTmntGameResults,
} from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import { divDataType } from "@/lib/types/types";
import WaitModal from "@/components/modal/waitModal";
import { blankDivData } from "@/lib/db/initVals";
import { getMonthDay, removeTimeFromISODateStr } from "@/lib/dateTools";
import TmntResultsForm from "./divForm";
import "./tmntResults.css";

// gold pin
// http://localhost:3000/results/tmnt/tmt_fd99387c33d9c78aba290286576ddce5

// new years eve
// http://localhost:3000/results/tmnt/tmt_fe8ac53dad0f400abe6354210a8f4cd1

const DivResultsPage = () => {
  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchOneTmntGameResults(tmntId));
  }, [tmntId, dispatch]);

  const resultsLoadStatsus = useSelector(getOneTmntGameResultsLoadStatus);
  const resultsError = useSelector(getOneTmntGameResultsError);
  const tmntResults = useSelector(selectOneTmntGameResults);

  const [defaultTabKey, setDefaultTabKey] = useState("");
  const [tabKey, setTabKey] = useState("");
  const [tmntName, setTmntName] = useState("");
  const [tmntStartDate, setTmntStartDate] = useState("");
  const [tmntDivs, setTmntDivs] = useState<divDataType[]>([]);

  useEffect(() => {
    if (tmntResults && tmntResults.length > 0) {
      setTmntName(tmntResults[0].tmnt_name);
      const startDate = removeTimeFromISODateStr(tmntResults[0].start_date);
      setTmntStartDate(
        getMonthDay(startDate) + ", " + startDate.substring(0, 4)
      );
      const tmntDivIds = Array.from(
        new Set(tmntResults.map((result) => result.div_id))
      );
      const tDivs: divDataType[] = [];
      tmntDivIds.forEach((divId) => {
        const result = tmntResults.find((result) => result.div_id === divId);
        if (result) {
          tDivs.push({
            ...blankDivData,
            id: divId,
            tmnt_id: tmntId,
            div_name: result.div_name,
            sort_order: result.sort_order,
          });
        }
      });
      tDivs.sort((a, b) => a.sort_order - b.sort_order);
      setTmntDivs(tDivs);
      setDefaultTabKey(tDivs[0].id);
      setTabKey(tDivs[0].id);
    }
  }, [tmntResults, tmntId]);

  const handleTabSelect = (key: string | null) => {
    if (key) {
      setTabKey(key);
    }
  };

  return (
    <>
      <WaitModal show={resultsLoadStatsus === "loading"} message="Loading..." />
      {resultsLoadStatsus !== "loading" &&
        resultsLoadStatsus !== "succeeded" &&
        resultsError && (
          <div>
            Error: {resultsError} tmntLoadStatus: {resultsLoadStatsus}
          </div>
        )}
      {resultsLoadStatsus === "succeeded" && (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <div className="tmnt-results-container">
            <h2 className="mb-1">Results for: {tmntName}</h2>
            <h5>{tmntStartDate}</h5>
            <Tabs
              defaultActiveKey={defaultTabKey}
              id="tmnt-tabs"
              className="mb-1"
              variant="pills"
              activeKey={tabKey ?? defaultTabKey} // ensure a tab is alwas selected
              onSelect={handleTabSelect}
            >
              {tmntDivs.map((div) => (
                <Tab key={div.id} eventKey={`${div.id}`} title={div.div_name}>
                  <TmntResultsForm divid={div.id} tmntResults={tmntResults} />
                </Tab>
              ))}
            </Tabs>
          </div>
        </div>
      )}
    </>
  );
};

export default DivResultsPage;
