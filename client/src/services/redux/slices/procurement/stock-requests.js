import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../../utilities";

const sliceName = "procurement/stockRequests";
const apiUrl = "procurement/stockRequests";

const initialState = {
  collections: [],
  filtered: [],
  cartOpen: false,
  cart: [],
  selected: {},
  showOrderDetails: false,
  reviewOpen: false,
  shortDeliveryActionOpen: false,
  shortDeliveryActionSelected: null,
  shortDeliveryActionType: null,
  formSubmitted: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const BROWSE = createAsyncThunk(
  `${sliceName}`,
  ({ token, params }, thunkAPI) => {
    try {
      return axioKit.universal(`${apiUrl}/browse`, token, params);
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

export const SAVE = createAsyncThunk(`${sliceName}/save`, (form, thunkAPI) => {
  try {
    return axioKit.save(apiUrl, form.data, form.token);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const UPDATE = createAsyncThunk(
  `${sliceName}/update`,
  (form, thunkAPI) => {
    try {
      return axioKit.update(apiUrl, form.data, form.token);
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

export const RECEIVE_DELIVERY = createAsyncThunk(
  `${sliceName}/receive-delivery`,
  (form, thunkAPI) => {
    try {
      return axioKit.update(apiUrl, form.data, form.token, "receive-delivery");
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

export const DESTROY = createAsyncThunk(
  `${sliceName}/destroy`,
  (form, thunkAPI) => {
    try {
      return axioKit.destroy(apiUrl, form.data, form.token);
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
  name: sliceName,
  initialState,
  reducers: {
    SetCartOpen: (state, { payload }) => {
      state.cartOpen = Boolean(payload);
    },
    SetReviewOpen: (state) => {
      state.reviewOpen = !state.reviewOpen;
    },
    ReviewSetSameSupplierId: (state, { payload }) => {
      state.reviewSameSupplierId = String(payload || "all") || "all";
    },

    CartClear: (state) => {
      state.cart = [];
    },
    CartAdd: (state, { payload }) => {
      const inventoryId = String(
        payload?._id || payload?.inventory?._id || payload?.inventory || "",
      );
      if (!inventoryId) return;

      const inventoryObj =
        payload?.inventory && typeof payload.inventory === "object"
          ? payload.inventory
          : payload;

      const suppliers = Array.isArray(inventoryObj?.suppliers)
        ? inventoryObj.suppliers
        : [];
      const primarySupplierRow =
        suppliers
          .slice()
          .sort(
            (a, b) =>
              Number(Boolean(b?.isPrimary)) - Number(Boolean(a?.isPrimary)),
          )[0] || null;
      const supplierId = String(
        primarySupplierRow?.supplier?._id || inventoryObj?.supplier?._id || "",
      );
      const unitCost =
        primarySupplierRow?.cost ?? inventoryObj?.cost ?? payload?.cost ?? 0;

      const isExistIdx = state.cart?.findIndex(
        ({ inventory }) => String(inventory?._id || "") === inventoryId,
      );
      const _cart = [...state.cart];
      if (isExistIdx > -1) {
        _cart.splice(isExistIdx, 1);
      } else {
        _cart.unshift({
          inventory: inventoryObj,
          cost: unitCost,
          supplier: supplierId,
          quantity: 1,
        });
      }
      state.cart = _cart;
    },
    CartUpdate: (state, { payload }) => {
      const index = state.cart?.findIndex(
        ({ inventory }) => inventory?._id === payload?.inventory?._id,
      );
      if (index < 0) return;
      const _cart = [...state.cart];
      _cart[index] = {
        ..._cart[index],
        ...payload,
      };
      state.cart = _cart;
    },

    CartRemove: (state, { payload }) => {
      const _cart = [...state.cart];
      const index = _cart?.findIndex(
        ({ inventory }) => inventory?._id === payload,
      );
      if (index < 0) return;
      _cart.splice(index, 1);
      state.cart = _cart;
    },

    SetShowOrderDetails: (state, { payload }) => {
      state.showOrderDetails = true;
      state.selected = payload;
    },

    ToggleShowOrderDetails: (state) => {
      state.showOrderDetails = !state.showOrderDetails;
    },

    OpenShortDeliveryActionModal: (state, { payload }) => {
      state.shortDeliveryActionOpen = true;
      state.shortDeliveryActionSelected = payload?.purchase ?? null;
      state.shortDeliveryActionType = payload?.type ?? null;
    },

    ToggleShortDeliveryActionModal: (state) => {
      state.shortDeliveryActionOpen = !state.shortDeliveryActionOpen;
      if (!state.shortDeliveryActionOpen) {
        state.shortDeliveryActionSelected = null;
        state.shortDeliveryActionType = null;
      }
    },
    SEARCH: (state, { payload }) => {
      const query = String(payload || "")
        .trim()
        .toLowerCase();

      const rows = Array.isArray(state.collections) ? state.collections : [];

      if (!query) {
        state.filtered = rows;
        return;
      }

      state.filtered = rows.filter((row) => {
        const requestedByName = Object.values(
          row?.requestedBy?.fullName || {},
        ).join(" ");
        const requestedById = String(
          row?.requestedBy?._id || row?.requestedBy || "",
        );
        const status = String(row?.status || "");
        const adminNote = String(row?.admin?.note || "");
        const id = String(row?._id || "");

        const items = Array.isArray(row?.items) ? row.items : [];
        const itemNames = items
          .map((item) => String(item?.inventory?.name || ""))
          .filter(Boolean)
          .join(" ");

        return (
          requestedByName.toLowerCase().includes(query.toLowerCase()) ||
          requestedById.toLowerCase().includes(query) ||
          status.toLowerCase().includes(query) ||
          adminNote.toLowerCase().includes(query) ||
          itemNames.toLowerCase().includes(query) ||
          id.toLowerCase().includes(query)
        );
      });
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
    RESET: (state) => {
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

      .addCase(SAVE.pending, (state) => {
        state.formSubmitted = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(SAVE.fulfilled, (state, action) => {
        const { success } = action.payload;
        state.message = success;
        state.isSuccess = true;
        state.formSubmitted = false;
      })
      .addCase(SAVE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      })

      .addCase(RECEIVE_DELIVERY.pending, (state) => {
        state.formSubmitted = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(RECEIVE_DELIVERY.fulfilled, (state, action) => {
        const { success, payload } = action.payload;
        const updateCollections = (collections) => {
          const index = collections.findIndex(({ _id }) => _id === payload);
          if (index > -1) {
            collections.splice(index, 1);
          }
        };
        updateCollections(state.collections);
        updateCollections(state.filtered);
        state.formSubmitted = false;
        state.message = success;
        state.isSuccess = true;
      })
      .addCase(RECEIVE_DELIVERY.rejected, (state, action) => {
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
        const { success, payload, isAdmin = false } = action.payload;
        const updateCollections = (collections) => {
          const index = collections.findIndex(
            ({ _id: id }) => id === payload?._id,
          );
          if (index < 0) return;
          if (!isAdmin) {
            collections[index] = payload;
          } else {
            collections.splice(index, 1);
          }
        };

        updateCollections(state.collections);
        updateCollections(state.filtered);
        state.formSubmitted = false;
        state.message = success;
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
        const { success, payload } = action.payload;
        const updateCollections = (collections) => {
          const index = collections.findIndex(({ _id }) => _id === payload);
          if (index < 0) return;
          collections.splice(index, 1);
        };
        updateCollections(state.collections);
        updateCollections(state.filtered);
        state.formSubmitted = false;
        state.message = success;
        state.isSuccess = true;
      })
      .addCase(DESTROY.rejected, (state, action) => {
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
  SetCartOpen,
  SetReviewOpen,
  ReviewSetSameSupplierId,
  CartClear,
  CartAdd,
  CartRemove,
  CartUpdate,
  SetShowOrderDetails,
  ToggleShowOrderDetails,
  OpenShortDeliveryActionModal,
  ToggleShortDeliveryActionModal,
  SEARCH,
} = reduxSlice.actions;

export default reduxSlice.reducer;
