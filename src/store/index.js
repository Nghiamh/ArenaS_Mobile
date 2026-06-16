import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import venueReducer from "./slices/venueSlice";
import bookingReducer from "./slices/bookingSlice";
import matchmakingReducer from "./slices/matchmakingSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        venue: venueReducer,
        booking: bookingReducer,
        matchmaking: matchmakingReducer,
    },
    devTools: __DEV__,
});
