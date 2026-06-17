import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../utilities";

const url = "audit";

const initialState = {
  collections: [],
  filtered: [],
  chosenRoles: [],
  formSubmitted: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const BROWSE = createAsyncThunk(
  `${url}/browse`,
  ({ token, params }, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/browse`, token, params);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const reduxSlice = createSlice({
  name: `${url}/transactions`,
  initialState,
  reducers: {
    SetFILTERED: (state, { payload }) => {
      state.filtered = payload;
    },
    SetCHOSEN_ROLES: (state, { payload }) => {
      state.chosenRoles = payload;
    },
    RESET: (state, data) => {
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(BROWSE.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(BROWSE.fulfilled, (state, action) => {
        const { payload } = action.payload;
        state.collections = state.filtered = payload;
        state.isLoading = false;
      })
      .addCase(BROWSE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoading = false;
      });
  },
});

export const { RESET, SetFILTERED, SetCHOSEN_ROLES } = reduxSlice.actions;

export default reduxSlice.reducer;
