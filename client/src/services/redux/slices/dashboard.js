import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../utilities";

const url = "dashboard";

const initialState = {
  sales: {},
  top: {},
  transactions: [],
  liters: [],
  formSubmitted: false,
  isSuccess: false,
  isLoadingSales: false,
  isLoadingTop: false,
  isLoadingTransact: false,
  isLoadingLiters: false,
  message: "",
};

export const SALES = createAsyncThunk(
  `${url}`,
  ({ token, params }, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/sales`, token, params);
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

export const TOP_PRODUCTS = createAsyncThunk(
  `${url}/topProducts`,
  ({ token, params }, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/topProducts`, token, params);
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

export const TRANSACTIONS = createAsyncThunk(
  `${url}/transactions`,
  ({ token, params }, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/transactions`, token, params);
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

export const LITERS = createAsyncThunk(
  `${url}/liters`,
  ({ token, params }, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/liters`, token, params);
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
  name: url,
  initialState,
  reducers: {
    RESET: (state, data) => {
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(SALES.pending, (state) => {
        state.isLoadingSales = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(SALES.fulfilled, (state, action) => {
        const { payload } = action.payload;
        state.sales = payload;
        state.isLoadingSales = false;
      })
      .addCase(SALES.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingSales = false;
      })

      .addCase(TOP_PRODUCTS.pending, (state) => {
        state.isLoadingTop = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(TOP_PRODUCTS.fulfilled, (state, action) => {
        const { payload } = action.payload;
        state.top = payload;
        state.isLoadingTop = false;
      })
      .addCase(TOP_PRODUCTS.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingTop = false;
      })

      .addCase(TRANSACTIONS.pending, (state) => {
        state.isLoadingTransact = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(TRANSACTIONS.fulfilled, (state, action) => {
        const { payload } = action.payload;
        state.transactions = payload;
        state.isLoadingTransact = false;
      })
      .addCase(TRANSACTIONS.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingTransact = false;
      })

      .addCase(LITERS.pending, (state) => {
        state.isLoadingLiters = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(LITERS.fulfilled, (state, action) => {
        const { payload } = action.payload;
        state.liters = payload;
        state.isLoadingLiters = false;
      })
      .addCase(LITERS.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingLiters = false;
      });
  },
});

export const { RESET } = reduxSlice.actions;

export default reduxSlice.reducer;
