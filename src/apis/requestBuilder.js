import axios from "axios";
import { getCookie } from "../hooks/cookieUtil";

const { VITE_SERVER_END_POINT, VITE_DEV_SERVER_END_POINT } = import.meta.env;

export const SERVER_END_POINT = import.meta.env.DEV ? VITE_DEV_SERVER_END_POINT : VITE_SERVER_END_POINT;

export const request = axios.create({
  baseURL: SERVER_END_POINT,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});
export const requestFile = axios.create({
  baseURL: SERVER_END_POINT,
  timeout: 10000,
  headers: {
    "Content-Type": "multipart/form-data",
    "Authorization": `Bearer ${localStorage.getItem("jwt")}`
  },
});


export const authRequest = () => {
  return axios.create({
    baseURL: SERVER_END_POINT,
    timeout: 3000,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("jwt")}`
    },
    withCredentials: true
  })
}
