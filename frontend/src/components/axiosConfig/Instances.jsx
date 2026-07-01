import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const authInst = axios.create({
    baseURL: BASE_URL + "/api/auth/",
    timeout: 5000,
    headers: { "Content-Type": "application/json"},
    withCredentials: true,
});

export const protectInst = axios.create({
    baseURL: BASE_URL + "/api/",
    timeout: 5000,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});