import axios from "axios";
import { getCookie } from "../hooks/cookieUtil";

const { VITE_SERVER_END_POINT, VITE_DEV_SERVER_END_POINT } = import.meta.env;

const SERVER_END_POINT = "http://localhost:8080";

export const request = axios.create({
  baseURL: "http://localhost:8080",
  // baseURL: SERVER_END_POINT,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});
export const requestFile = axios.create({
  baseURL: SERVER_END_POINT,
  timeout: 10000,
  headers: { "Content-Type": "multipart/form-data" },
});


export const authRequest = () => {
  return axios.create({
    baseURL: "http://localhost:8080",
    timeout: 3000,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getCookie("jwt")}`
    },
  })
}
