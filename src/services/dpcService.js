import axios from "axios";

const API = "http://localhost:5000/api/dpcs";

// Create DPC
export const createDpc = async (data) => {
  const res = await axios.post(API, data);
  return res.data;
};

// Get All DPCs
export const getDpcs = async () => {
  const res = await axios.get(API);
  return res.data;
};

// Update DPC
export const updateDpc = async (id, data) => {
  const res = await axios.put(`${API}/${id}`, data);
  return res.data;
};

// Delete DPC
export const deleteDpc = async (id) => {
  const res = await axios.delete(`${API}/${id}`);
  return res.data;
};