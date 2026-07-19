import axios from "axios";

const API_URL =
  "http://localhost:5000/api/inwards";

// ===============================
// Create Inward
// ===============================
export const createInward = async (data) => {
  const response = await axios.post(
    API_URL,
    data
  );

  return response.data;
};

// ===============================
// Get All Inwards
// ===============================
export const getInwards = async () => {
  const response = await axios.get(
    API_URL
  );

  return response.data;
};

// ===============================
// Get Single Inward
// ===============================
export const getInward = async (id) => {
  const response = await axios.get(
    `${API_URL}/${id}`
  );

  return response.data;
};

// ===============================
// Update Inward
// ===============================
export const updateInward = async (
  id,
  data
) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    data
  );

  return response.data;
};

// ===============================
// Delete Inward
// ===============================
export const deleteInward = async (
  id
) => {
  const response = await axios.delete(
    `${API_URL}/${id}`
  );

  return response.data;
};