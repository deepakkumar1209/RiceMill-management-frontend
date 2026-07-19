import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/users`;

export const getUsers = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axios.post(
    API_URL,
    userData
  );

  return response.data;
};