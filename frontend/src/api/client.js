import axios from "axios";

const base = import.meta.env.VITE_API_URL || "http://localhost:4000";
// Ensure the API prefix is present so requests hit Express (/api/*)
const baseURL = base.endsWith("/api") ? base : `${base}/api`;

const api = axios.create({ baseURL });

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default api;
