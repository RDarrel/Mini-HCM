import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../../utilities";

const url = "inventory/stockBatch";

const initialState = {
  collections: [],
  formSubmitted: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const BROWSE = createAsyncThunk(
  `${url}`,
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
  },
);

export const SAVE = createAsyncThunk(`${url}/save`, (form, thunkAPI) => {
  try {
    return axioKit.save(url, form.data, form.token);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const UPDATE = createAsyncThunk(`${url}/update`, (form, thunkAPI) => {
  try {
    return axioKit.update(url, form.data, form.token);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const DISPOSE = createAsyncThunk(`${url}/dispose`, (form, thunkAPI) => {
  try {
    return axioKit.update(url, form.data, form.token, "dispose");
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const REPORT_WASTE = createAsyncThunk(
  `${url}/report-waste`,
  (form, thunkAPI) => {
    try {
      return axioKit.update(url, form.data, form.token, "report-waste");
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
    UPDATE_AUTH: (state, data) => {
      state.auth = { ...state.auth, ...data.payload };
      state.information = { ...state.information, isFreshman: false };
    },
    PROGRESS: (state, data) => {
      state.progress = data.payload;
    },
    UPLOADBAR: (state, data) => {
      state.progressBar = data.payload;
    },
    IMAGE: (state, data) => {
      state.image = data.payload;
      state.progressBar = -1;
    },
    MAXPAGE: (state, data) => {
      localStorage.setItem("maxPage", data.payload);
      state.maxPage = data.payload;
    },
    SETROUTE: (state, data) => {
      state.route = data.payload;
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
        state.collections = payload;
        state.isLoading = false;
      })
      .addCase(BROWSE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoading = false;
      })

      .addCase(SAVE.pending, (state) => {
        state.formSubmitted = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(SAVE.fulfilled, (state, action) => {
        const { success, payload } = action.payload;
        state.message = success;
        if (state.collections) state.collections.unshift(payload);
        state.isSuccess = true;
        state.formSubmitted = false;
      })
      .addCase(SAVE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      })

      .addCase(UPDATE.pending, (state) => {
        state.formSubmitted = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(UPDATE.fulfilled, (state, action) => {
        const { message, payload, staff } = action.payload;
        const updateCollections = (collections) => {
          const index = collections.findIndex(({ _id }) => _id === staff);
          collections[index] = {
            ...collections[index],
            ...payload,
          };
        };
        updateCollections(state.collections);
        state.formSubmitted = false;
        state.message = message;
        state.isSuccess = true;
      })
      .addCase(UPDATE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      })

      .addCase(DISPOSE.pending, (state) => {
        state.formSubmitted = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(DISPOSE.fulfilled, (state, action) => {
        const { message, payload } = action.payload;
        const updateCollections = (collections) => {
          const index = collections.findIndex(({ _id }) => _id === payload);
          if (index > -1) {
            collections[index] = {
              ...collections[index],
              remainingQuantity: 0,
              remainingQtyDisplay: 0,
            };
          }
        };
        updateCollections(state.collections);
        state.formSubmitted = false;
        state.message = message;
        state.isSuccess = true;
      })
      .addCase(DISPOSE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      })

      .addCase(REPORT_WASTE.pending, (state) => {
        state.formSubmitted = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(REPORT_WASTE.fulfilled, (state, action) => {
        const { message } = action.payload;
        state.formSubmitted = false;
        state.message = message;
        state.isSuccess = true;
      })
      .addCase(REPORT_WASTE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      });
  },
});

export const {
  RESET,
  MAXPAGE,
  PROGRESS,
  UPLOADBAR,
  IMAGE,
  SETROUTE,
  UPDATE_AUTH,
} = reduxSlice.actions;

export default reduxSlice.reducer;
