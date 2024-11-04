"use client"
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchTmnts } from "@/redux/features/tmnts/tmntsSlice";
import { YearObj } from "@/lib/types/types" 
import TmntsList from "@/components/tmnts/tmntsList";

export default function TmntUpcomingPage() {
  const dispatch = useDispatch<AppDispatch>();

  const tmntYear = ''

  useEffect(() => {
    dispatch(fetchTmnts(tmntYear));
  }, [tmntYear, dispatch]);
  
  const stateTmnts = useSelector((state: RootState) => state.tmnts);  

  const yearsArr: YearObj[] = [];
  
  // need dummy function here
  function yearChanged(year: string): void { }

  return (
    <div>
      <h1 className="d-flex justify-content-center">Upcoming Tournaments</h1>
      <TmntsList
        years={yearsArr}        
        tmnts={stateTmnts.tmnts}
        onYearChange={yearChanged}
      />
    </div>
  );
}
