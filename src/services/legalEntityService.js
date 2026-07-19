import axios from "axios";

const API =
   `${import.meta.env.VITE_API_URL}/legal-entities`;

export const createLegalEntity = async (data) => {
  const res = await axios.post(API, data);

  return res.data;
};

export const getLegalEntities = async () => {
  const res = await axios.get(API);

  return res.data;
};

export const updateLegalEntity = async (
  id,
  data
) => {
  const res = await axios.put(
    `${API}/${id}`,
    data
  );

  return res.data;
};

export const deleteLegalEntity = async (
  id
) => {
  const res = await axios.delete(
    `${API}/${id}`
  );

  return res.data;
};