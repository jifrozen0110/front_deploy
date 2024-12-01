import { Cookies } from "react-cookie";
const domain = import.meta.env.DEV ? "localhost" : "puzzleshare.site";

const cookies = new Cookies();

export const setCookie = (name, value, options = {}) =>
  cookies.set(name, value, { path: "/", ...options });

export const getCookie = (name) => cookies.get(name);

export const removeCookie = (name) => cookies.remove(name, { path: "/", domain: domain});
