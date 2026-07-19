import axios from "axios";

const API =
   `${import.meta.env.VITE_API_URL}/vehicles`;

export const createVehicle =
async (data) => {
  const res =
    await axios.post(
      API,
      data
    );

  return res.data;
};

export const getVehicles =
async () => {
  const res =
    await axios.get(API);

  return res.data;
};

export const updateVehicle =
async (id, data) => {
  const res =
    await axios.put(
      `${API}/${id}`,
      data
    );

  return res.data;
};

export const deleteVehicle =
async (id) => {
  const res =
    await axios.delete(
      `${API}/${id}`
    );

  return res.data;
};