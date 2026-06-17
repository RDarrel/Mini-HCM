import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../utilities";

const url = "asets/staffs";

const initialState = {
  sale: 0,
  soldLiters: 0,
  sales: [],
  salesFiltered: [],
  activeTab: "POS",
  fuel: {},
  fuels: [],
  cart: [],
  fuelLoading: true,
  soldLoading: true,
  isLoading: false,
};

export const BROWSE = createAsyncThunk(`${url}`, ({ token }, thunkAPI) => {
  try {
    return axioKit.universal(`${url}/browse`, token);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const SALES = createAsyncThunk(
  `${url}/pos/sales`,
  ({ token, params }, thunkAPI) => {
    try {
      return axioKit.universal(`commerce/deals/browse`, token, params);
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

export const SOLD_LITERS = createAsyncThunk(
  `${url}/commerce/deals/soldLiters`,
  ({ token, params }, thunkAPI) => {
    try {
      return axioKit.universal(`commerce/deals/soldLiters`, token, params);
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

export const FUELS = createAsyncThunk(`${url}/fuels`, ({ token }, thunkAPI) => {
  try {
    return axioKit.universal(`assets/fuels/available`, token);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const SAVE = createAsyncThunk(
  `${url}/commerce/deals`,
  (form, thunkAPI) => {
    try {
      return axioKit.save(`commerce/deals`, form.data, form.token);
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

export const DESTROY = createAsyncThunk(`sales/destroy`, (form, thunkAPI) => {
  try {
    return axioKit.destroy("commerce/deals", form.data, form.token);
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
    SetSALE: (state, { payload }) => {
      state.sale = payload;
    },
    SetActiveTab: (state, { payload }) => {
      state.activeTab = payload;
    },
    SetFUEL: (state, { payload }) => {
      state.fuel = payload;
    },
    SetCART: (state, { payload }) => {
      state.cart = payload;
    },
    RESET_SALE: (state) => {
      state.sale = 0;
      state.fuel = {};
    },
    RESET: (state, data) => {
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(SOLD_LITERS.pending, (state) => {
        state.soldLoading = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(SOLD_LITERS.fulfilled, (state, action) => {
        const { payload } = action.payload;
        state.soldLiters = payload;
        state.soldLoading = false;
      })
      .addCase(SOLD_LITERS.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.soldLoading = false;
      })
      .addCase(FUELS.pending, (state) => {
        state.fuelLoading = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(FUELS.fulfilled, (state, action) => {
        const { payload } = action.payload;
        state.fuels = payload;
        state.fuelLoading = false;
      })
      .addCase(FUELS.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.fuelLoading = false;
      })
      .addCase(SALES.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(SALES.fulfilled, (state, action) => {
        const { payload } = action.payload;
        state.sales = state.salesFiltered = payload;
        state.isLoading = false;
      })
      .addCase(SALES.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoading = false;
      })
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
        state.sales.unshift(payload);
        state.message = success;
        state.isSuccess = true;
        state.formSubmitted = false;
        state.soldLiters += payload.liters;
        localStorage.setItem("claimStub", JSON.stringify(payload));
        window.open(
          "/printout/claimStub",
          "Claim Stub",
          "top=100px,left=500px,width=400px,height=750px"
        );
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
        const { message, payload } = action.payload;
        const index = state.collections.findIndex(
          ({ _id }) => _id === payload?._id
        );
        state.collections[index] = payload;
        state.formSubmitted = false;
        state.message = message;
        state.isSuccess = true;
      })
      .addCase(UPDATE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      })
      .addCase(DESTROY.pending, (state) => {
        state.formSubmitted = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(DESTROY.fulfilled, (state, action) => {
        const { message, payload } = action.payload;
        const updateCollections = (collections) => {
          const index = collections.findIndex(
            ({ _id }) => _id === payload?._id
          );
          collections[index] = {
            ...collections[index],
            deletedAt: new Date(),
            reason: payload?.reason,
          };
        };
        updateCollections(state.sales);
        updateCollections(state.salesFiltered);
        state.formSubmitted = false;
        state.message = message;
        state.isSuccess = true;
      })
      .addCase(DESTROY.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      });
  },
});

export const { RESET, SetSALE, SetFUEL, SetCART, RESET_SALE, SetActiveTab } =
  reduxSlice.actions;

export default reduxSlice.reducer;
