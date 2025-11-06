import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const getServerStatus = async () => {
  const response = await api.get("/health");
  return response.data;
};

export default api;
