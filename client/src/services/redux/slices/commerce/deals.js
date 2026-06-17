import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../../utilities";

const url = "commerce/deals";

const initialState = {
  collections: [],
  frequency: "daily",
  filtered: [],
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
  }
);

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

const arrangeSalesData = (frequency, collections) => {
  const solds = collections.flatMap((item) => item.cart);

  const formatDate = (date, freq) => {
    const d = new Date(date);

    const formatLong = (dt) =>
      dt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    if (freq === "daily") {
      return formatLong(d); // March 3, 2025
    }
    if (freq === "monthly") {
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      }); // March 2025
    }
    if (freq === "yearly") {
      return d.getFullYear().toString(); // 2025
    }
    if (freq === "weekly") {
      // get Monday as start of week
      const dayOfWeek = d.getDay(); // 0=Sunday, 1=Monday...
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7)); // back to Monday

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      return `${formatLong(monday)} to ${formatLong(sunday)}`;
    }
  };
  const grouped = solds.reduce((acc, sold) => {
    const key = formatDate(sold.createdAt, frequency);

    if (!acc[key]) {
      acc[key] = { date: key, total: 0, solds: [] };
    }

    acc[key].total += sold.amount ?? 0; // adjust depende sa field na gusto mo
    acc[key].solds.push(sold);

    return acc;
  }, {});

  return Object.values(grouped);
};

export const reduxSlice = createSlice({
  name: url,
  initialState,
  reducers: {
    SetFREQUENCY: (state, { payload }) => {
      state.filtered = arrangeSalesData(payload, state.collections);
      state.frequency = payload;
    },

    SetFILTERED: (state, { payload }) => {
      state.filtered = payload;
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
        const { payload, isSales = false } = action.payload;
        state.collections = payload;
        if (isSales) {
          state.filtered = arrangeSalesData(state.frequency, payload);
        } else {
          state.filtered = payload;
        }
        state.isLoading = false;
      })
      .addCase(BROWSE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoading = false;
      })

      .addCase(UPDATE.pending, (state) => {
        state.formSubmitted = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(UPDATE.fulfilled, (state, action) => {
        const { success, payload } = action.payload;
        const index = state.collections.findIndex(
          ({ _id }) => _id === payload?._id
        );
        state.collections[index] = payload;
        state.formSubmitted = false;
        state.message = success;
        state.isSuccess = true;
      })
      .addCase(UPDATE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      });
  },
});

export const { RESET, MAXPAGE, SetFILTERED, SetFREQUENCY } = reduxSlice.actions;

export default reduxSlice.reducer;
