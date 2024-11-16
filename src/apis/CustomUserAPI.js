import axios from "axios";
const { VITE_SERVER_END_POINT, VITE_DEV_SERVER_END_POINT } = import.meta.env;

export const SERVER_END_POINT = import.meta.env.DEV ? VITE_DEV_SERVER_END_POINT : VITE_SERVER_END_POINT;
export const UserAPI = axios.create({
  // baseURL: import.meta.env.VITE_SERVER_END_POINT,
  baseURL: SERVER_END_POINT,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchUser = async (id) => {
  const response = await UserAPI.get(`/user?id=${id}`);
  return response.data;
};

export const fetchUsers = async () => {
  const response = await UserAPI.get(`/user/list`);
  return response.data;
};

export const searchUserByEmail = async (email) => {
  const params = { email: email };
  const response = await UserAPI.get(`/user/search/email`, { params: params });
  return response.data;
};

export const searchUsersByNickName = async (nickname) => {
  const params = { nickname: nickname };
  const response = await UserAPI.get(`/user/search/nickname`, { params: params });
  return response.data;
};

const ApiObject = {
  UserAPI,
  fetchUser,
  fetchUsers,
  searchUserByEmail,
  searchUsersByNickName,
};

export default ApiObject;
