import axiosClient from "./axiosClient";

const authApi = {
    login: (credentials) => {
        return axiosClient.post("/api/auth/login", credentials);
    },
    register: (data) => {
        return axiosClient.post("/api/auth/register", data);
    },
};

export default authApi;
