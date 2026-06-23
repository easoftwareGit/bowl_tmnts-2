"use client";

import "@/lib/syncfusion-license";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import {
  Aggregate,
  AggregateColumnDirective,
  AggregateColumnsDirective,
  AggregateDirective,
  AggregatesDirective,
  ColumnDirective,
  ColumnsDirective,
  Edit,
  GridComponent,
  Inject,
  Resize,
  Sort,
  Toolbar,
  type ActionEventArgs,
  type EditEventArgs,
  type EditSettingsModel,
  type RecordClickEventArgs,
  type RecordDoubleClickEventArgs,  
} from "@syncfusion/ej2-react-grids";

interface ChildProps {

}

export default function PrizeFundEntry({ }: ChildProps) {

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const tmntData = useSelector(
    (state: RootState) => state.tmntFullData.tmntFullData,
  );

  const gridRef = useRef<GridComponent | null>(null);
  
  return (
    <>
    </>
  );
}