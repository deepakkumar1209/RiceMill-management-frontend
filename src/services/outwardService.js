import axios from "axios";

const API =
"http://localhost:5000/api/outwards";

// ===============================
// Create Outward
// ===============================
export const createOutward = async (data) => {
  const response = await axios.post(
    API,
    data
  );

  return response.data;
};

// ===============================
// Get All Outwards
// ===============================
export const getOutwards = async () => {
  const response = await axios.get(
    API
  );

  return response.data;
};

// ===============================
// Get Single Outward
// ===============================
export const getOutward = async (id) => {
  const response = await axios.get(
    `${API}/${id}`
  );

  return response.data;
};

// ===============================
// Update Outward
// ===============================
export const updateOutward = async (
  id,
  data
) => {
  const response = await axios.put(
    `${API}/${id}`,
    data
  );

  return response.data;
};

// ===============================
// Delete Outward
// ===============================
export const deleteOutward = async (
  id
) => {
  const response = await axios.delete(
    `${API}/${id}`
  );

  return response.data;
};