import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import venueReducer from "../features/discovery/venueSlice";
import bookingReducer from "../features/booking/bookingSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        venue: venueReducer,
        booking: bookingReducer,
    },
    devTools: __DEV__,
});
