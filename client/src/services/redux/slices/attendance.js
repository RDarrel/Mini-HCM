import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axioKit from "../../utilities/axioKit";
const url = "attendance";

const initialState = {
  collections: [],
  pagination: {
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  isSuccess: false,
  isLoading: false,
  isSubmitting: false,
  message: "",
};

export const PUNCH = createAsyncThunk(`${url}/punch`, (payload, thunkAPI) => {
  try {
    return axioKit.save(url, payload, "punch");
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const BROWSE = createAsyncThunk(`${url}/browse`, (params, thunkAPI) => {
  try {
    return axioKit.universal(url, params);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});
export const reduxSlice = createSlice({
  name: url,
  initialState,
  reducers: {
    MAXPAGE: (state, data) => {
      localStorage.setItem("maxPage", data.payload);
      state.maxPage = data.payload;
    },
    SETROUTE: (state, data) => {
      state.route = data.payload;
    },

    RESET: (state, data) => {
      state.isSuccess = false;
      state.auth = {};
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
        const { data, pagination } = action.payload;
        state.collections = data;
        state.pagination = pagination;
        state.isSuccess = true;
        state.isLoading = false;
      })
      .addCase(BROWSE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoading = false;
      })
      .addCase(PUNCH.pending, (state) => {
        state.isSubmitting = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(PUNCH.fulfilled, (state, action) => {
        const { data } = action.payload;
        const _collections = [...state.collections];
        if (data?.punchType === "in") {
          _collections.unshift(data);
        } else {
          const index = _collections.findIndex((item) => item.id === data.id);
          _collections[index] = data;
        }
        state.collections = _collections;
        state.isSuccess = true;
        state.isSubmitting = false;
      })
      .addCase(PUNCH.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isSubmitting = false;
      });
  },
});

export const { RESET, MAXPAGE } = reduxSlice.actions;

export default reduxSlice.reducer;
