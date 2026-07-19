import axios from "axios";

const API_URL =
  "http://localhost:5000/api/customer-vendors";

// Create
export const createCustomerVendor = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

// Get All
export const getCustomerVendors = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get Single
export const getCustomerVendor = async (id) => {
  const response = await axios.get(
    `${API_URL}/${id}`
  );

  return response.data;
};

// Update
export const updateCustomerVendor = async (
  id,
  data
) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    data
  );

  return response.data;
};

// Delete
export const deleteCustomerVendor = async (
  id
) => {
  const response = await axios.delete(
    `${API_URL}/${id}`
  );

  return response.data;
};