import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axioKit from "../../utilities/axioKit";
const url = "attendance";

const initialState = {
  collections: [],
  todayRecord: {}, // Today's attendance record (employee)
  todaySummary: {}, // Today's attendance summary (admin)
  pagination: {
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  isSuccess: false,
  isSubmitting: false,
  isFetchingItem: false,
  isFetchingList: false, // For History Page
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
export const UPDATE = createAsyncThunk(`${url}/update`, (payload, thunkAPI) => {
  try {
    return axioKit.update(url, payload);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});
export const HISTORY = createAsyncThunk(
  `${url}/history`,
  (params, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/history`, params);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const RECORDS = createAsyncThunk(
  `${url}/records`,
  (params, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/records`, params);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const TODAY_SUMMARY = createAsyncThunk(
  `${url}/summary`,
  (params, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/today/summary`, params);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const TODAY_RECORD = createAsyncThunk(
  `${url}/today-record`,
  (params = {}, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/today/record`, params);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);
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

    RESET: (state) => {
      state.isSuccess = false;
      state.auth = {};
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(HISTORY.pending, (state) => {
        state.isFetchingList = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(HISTORY.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.collections = data;
        state.pagination = pagination;
        state.isSuccess = true;
        state.isFetchingList = false;
      })
      .addCase(HISTORY.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isFetchingList = false;
      })

      .addCase(RECORDS.pending, (state) => {
        state.isFetchingList = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(RECORDS.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.collections = data;
        state.pagination = pagination;
        state.isSuccess = true;
        state.isFetchingList = false;
      })
      .addCase(RECORDS.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isFetchingList = false;
      })

      .addCase(TODAY_SUMMARY.pending, (state) => {
        state.isFetchingItem = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(TODAY_SUMMARY.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.todaySummary = data;
        state.isSuccess = true;
        state.isFetchingItem = false;
      })
      .addCase(TODAY_SUMMARY.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isFetchingItem = false;
      })

      .addCase(TODAY_RECORD.pending, (state) => {
        state.isFetchingItem = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(TODAY_RECORD.fulfilled, (state, action) => {
        const { data = {} } = action.payload;
        state.todayRecord = data;
        state.isSuccess = true;
        state.isFetchingItem = false;
      })
      .addCase(TODAY_RECORD.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isFetchingItem = false;
      })
      .addCase(PUNCH.pending, (state) => {
        state.isSubmitting = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(PUNCH.fulfilled, (state, action) => {
        const { data = null } = action.payload;
        if (!data) return;

        const _collections = [...state.collections];
        const index = _collections.findIndex((item) => item.id === data.id);

        if (index > -1) {
          _collections[index] = data;
          state.todayRecord = data;
        } else if (data?.punchType === "in" && state.pagination.page === 1) {
          _collections.unshift(data);
          state.todayRecord = data;
        }

        state.collections = _collections;
        state.isSuccess = true;
        state.isSubmitting = false;
      })
      .addCase(PUNCH.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isSubmitting = false;
      })
      .addCase(UPDATE.pending, (state) => {
        state.isSubmitting = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(UPDATE.fulfilled, (state, action) => {
        const { data = null } = action.payload;
        if (!data) return;

        const _collections = [...state.collections];
        const index = _collections.findIndex(
          (item) => item.attendanceId === data.id,
        );

        if (index > -1) {
          _collections[index] = { ..._collections[index], ...data };
        }

        state.collections = _collections;
        state.isSuccess = true;
        state.isSubmitting = false;
      })
      .addCase(UPDATE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isSubmitting = false;
      });
  },
});

export const { RESET, MAXPAGE } = reduxSlice.actions;

export default reduxSlice.reducer;
