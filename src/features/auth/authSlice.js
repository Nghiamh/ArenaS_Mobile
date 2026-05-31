import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    token: null,
    isGuest: false,
    status: "idle",
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials(state, action) {
            state.user = action.payload?.user || null;
            state.token = action.payload?.token || null;
            state.isGuest = false;
            state.status = "authenticated";
            state.error = null;
        },
        setGuestMode(state) {
            state.user = {
                id: "guest",
                name: "Khách",
            };
            state.token = null;
            state.isGuest = true;
            state.status = "guest";
            state.error = null;
        },
        setAuthLoading(state) {
            state.status = "loading";
            state.error = null;
        },
        setAuthError(state, action) {
            state.status = "error";
            state.error = action.payload || "Authentication failed";
        },
        logout() {
            return initialState;
        },
    },
});

export const { setCredentials, setGuestMode, setAuthLoading, setAuthError, logout } = authSlice.actions;
export default authSlice.reducer;
