import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    venues: [],
    selectedVenue: null,
    searchQuery: "",
    filters: {
        sport: null,
        district: null,
        availableToday: false,
    },
    status: "idle",
    error: null,
};

const venueSlice = createSlice({
    name: "venue",
    initialState,
    reducers: {
        setVenues(state, action) {
            state.venues = action.payload || [];
        },
        setSelectedVenue(state, action) {
            state.selectedVenue = action.payload || null;
        },
        setSearchQuery(state, action) {
            state.searchQuery = action.payload || "";
        },
        setVenueFilters(state, action) {
            state.filters = { ...state.filters, ...(action.payload || {}) };
        },
    },
});

export const { setVenues, setSelectedVenue, setSearchQuery, setVenueFilters } = venueSlice.actions;
export default venueSlice.reducer;
