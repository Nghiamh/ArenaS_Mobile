import axiosClient from "./axiosClient";

const authApi = {
    login: (credentials) => {
        return axiosClient.post("/api/auth/login", credentials);
    },
    register: (data) => {
        return axiosClient.post("/api/auth/register", data);
    },
    getProfile: () => {
        return axiosClient.get("/api/profile/me");
    },
    updateProfile: (data) => {
        return axiosClient.put("/api/profile/me", data);
    },
};

export default authApi;
