import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    token: null,
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
            state.status = "authenticated";
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

export const { setCredentials, setAuthLoading, setAuthError, logout } = authSlice.actions;
export default authSlice.reducer;
