import axios from "axios";
import { getCookie } from "../hooks/cookieUtil";

export const request = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 3000,
  headers: { "Content-Type": "application/json" },
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