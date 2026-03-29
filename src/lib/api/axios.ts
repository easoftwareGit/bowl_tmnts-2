import axios from "axios";

export const publicApi = axios.create({
  baseURL: "/api",
});

export const privateApi = axios.create({
  baseURL: "/api",
  withCredentials: true,
});