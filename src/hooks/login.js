
import { removeCookie } from "./cookieUtil";

export const logout = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("image");
    localStorage.removeItem("provider");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    removeCookie('jwt')
    window.location.href = "/"
}