import axios from "axios";
import { getCookie } from "../hooks/cookieUtil";

const { VITE_SERVER_END_POINT, VITE_DEV_SERVER_END_POINT } = import.meta.env;

const SERVER_END_POINT = "https://container-service-1.9sjrmz3hsgdvw.ap-northeast-2.cs.amazonlightsail.com";

export const request = axios.create({
  baseURL: "https://container-service-1.9sjrmz3hsgdvw.ap-northeast-2.cs.amazonlightsail.com",
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
    baseURL: "https://container-service-1.9sjrmz3hsgdvw.ap-northeast-2.cs.amazonlightsail.com",
    timeout: 3000,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getCookie("jwt")}`
    },
  })
}
