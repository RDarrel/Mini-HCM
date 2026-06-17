import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../../utilities";

const url = "commerce/deals";

const initialState = {
  collections: [],
  filtered: [],
  formSubmitted: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const BROWSE = createAsyncThunk(
  `${url}/browse/transactions`,
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

export const reduxSlice = createSlice({
  name: `${url}/transactions`,
  initialState,
  reducers: {
    SetFILTERED: (state, { payload }) => {
      state.filtered = payload;
    },
    SetDELETED_SALE: (state, { payload }) => {
      const updateCollections = (collections) => {
        const index = collections.findIndex(({ _id }) => _id === payload);
        state.collections[index] = {
          ...state.collections[index],
          deletedAt: new Date(),
        };
      };
      updateCollections(state.collections);
      updateCollections(state.filtered);
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

export const { RESET, MAXPAGE, SetFILTERED, SetFREQUENCY, SetDELETED_SALE } =
  reduxSlice.actions;

export default reduxSlice.reducer;
