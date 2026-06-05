import axios from "axios";

import { API_BASE_URL, STORAGE_KEYS } from "../constants/config";
import { getItem, removeItem } from "../utils/storage";

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

axiosClient.interceptors.request.use(
    async (config) => {
        const token = await getItem(STORAGE_KEYS.authToken);

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error?.response?.status === 401) {
            await removeItem(STORAGE_KEYS.authToken);
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
