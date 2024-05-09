import { createSlice, configureStore } from "@reduxjs/toolkit";
const globalSlice = createSlice({
	name: "global",
	initialState: {
		permission: false,
		stream: null,
	},
	reducers: {
		setPermission: (state, action) => {
			state.permission = action.payload;
		},
		setStream: (state, action) => {
			state.stream = action.payload;
		},
	},
});

export const actions = globalSlice.actions;
const store = configureStore({
	reducer: {
		global: globalSlice.reducer,
	},
});
export default store;
