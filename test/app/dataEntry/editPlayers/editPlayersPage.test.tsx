import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import EditPlayersPage from "@/app/dataEntry/editPlayers/[tmntId]/page";
import {
  entryFeeColName,
  entryNumBrktsColName
} from "@/app/dataEntry/playersForm/createColumns";