import axios from "axios"

const API_BASE_URL = "http://localhost:5000/api"

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const predictDisease = async (symptoms) => {
  const response = await axios.post(
    `${API_BASE_URL}/predict`,
    { symptoms },
    getAuthConfig()
  );

  return response.data;
};

export const getSymptoms = async () => {
  const response = await axios.get(`${API_BASE_URL}/symptoms`)
  return response.data.symptoms
}

export const sendChatMessage = async (message, disease = "") => {
  const response = await axios.post(`${API_BASE_URL}/chat`, {
    message,
    disease,
  })

  return response.data
}

export const getHistory = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/history`,
    getAuthConfig()
  );

  return response.data;
};

export const deleteHistory = async (id) => {
  const response = await axios.delete(
    `${API_BASE_URL}/history/${id}`,
    getAuthConfig()
  );
  return response.data;
};

export const clearHistory = async () => {
  const response = await axios.delete(
    `${API_BASE_URL}/history`,
    getAuthConfig()
  );
  return response.data;
};