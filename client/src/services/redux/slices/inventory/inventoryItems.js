import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../../utilities";

const url = "inventory/items";

const initialState = {
  collections: [],
  search: "",
  params: {
    type: "",
    category: "",
    measurement: "",
    status: "",
  },
  cluster: [],
  filtered: [],
  selected: {},
  willCreate: false,
  showBatchesModal: false,
  showWasteModal: false,
  showMovementsModal: false,
  showModal: false,
  formSubmitted: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

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

export const BROWSE = createAsyncThunk(
  `${url}/inventory-items`,
  ({ token }, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/browse`, token);
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

export const DESTROY = createAsyncThunk(`${url}/destroy`, (form, thunkAPI) => {
  try {
    return axioKit.destroy(url, form.data, form.token);
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
    FILTER: (state, { payload }) => {
      const results = state.collections.filter((item) =>
        Object.entries(payload).every(
          ([key, value]) =>
            !value ||
            value === "all" ||
            (key === "status" ? item?.stockStatus : item[key]) === value,
        ),
      );
      state.cluster = results;
      state.filtered = results;
      state.params = payload;
      state.search = "";
    },
    SetNEW_MENU: (state, { payload }) => {
      state.collections.unshift(payload);
      state.filtered.unshift(payload);
      state.cluster.unshift(payload);
    },
    SetUPDATED_MENU: (state, { payload }) => {
      const updateCollections = (collections) => {
        const index = collections.findIndex(({ _id }) => _id === payload._id);
        if (index > -1) {
          collections[index] = payload;
        }
      };
      updateCollections(state.collections);
      updateCollections(state.cluster);
      updateCollections(state.filtered);
    },
    SetDELETED_MENU: (state, { payload }) => {
      const removeFromCollections = (collections) => {
        const index = collections.findIndex(({ _id }) => _id === payload);
        if (index > -1) {
          collections.splice(index, 1);
        }
      };

      removeFromCollections(state.collections);
      removeFromCollections(state.cluster);
      removeFromCollections(state.filtered);
    },
    SetCOLLECTIONS: (state, { payload }) => {
      state.collections = payload;
    },
    Set_SELECTED: (state, { payload = null }) => {
      state.selected = payload || {};
      state.showModal = true;
      state.willCreate = false;
    },
    SetFILTERED: (state, { payload }) => {
      state.filtered = payload;
    },
    SEARCH: (state, { payload }) => {
      const results = !payload
        ? state.cluster
        : state.cluster.filter((item) => {
            return item.name.toLowerCase().includes(payload.toLowerCase());
          });
      state.filtered = results;
      state.search = payload;
    },
    SetCREATE: (state) => {
      state.willCreate = true;
      state.showModal = true;
    },
    SetVIEW_BATCHES: (state, { payload }) => {
      state.selected = payload;
      state.showBatchesModal = true;
    },

    SetREPORT_WASTE: (state, { payload }) => {
      state.selected = payload;
      state.showWasteModal = true;
    },
    SetVIEW_STOCK_MOVEMENTS: (state, { payload }) => {
      state.selected = payload;
      state.showMovementsModal = true;
    },
    DISPOSE: (state, { payload }) => {
      const { remainingQty } = payload;
      const updateCollections = (collections) => {
        const index = collections.findIndex(
          ({ _id }) => _id === payload?.inventory,
        );
        if (index > -1) {
          collections[index] = {
            ...collections[index],
            expired: {
              display:
                collections[index]?.expired?.display - remainingQty?.display,
              value: collections[index]?.expired?.value - remainingQty?.value,
            },
          };
        }
      };
      state.selected = {
        ...state.selected,
        expired: {
          value: state.selected?.expired?.value - remainingQty?.value,
          display: state.selected?.expired?.display - remainingQty?.display,
        },
      };

      updateCollections(state.collections);
      updateCollections(state.filtered);
      updateCollections(state.cluster);
    },
    REPORT_WASTE: (state, { payload }) => {
      const updateCollections = (collections) => {
        const index = collections.findIndex(({ _id }) => _id === payload?._id);
        if (index > -1) {
          collections[index] = {
            ...collections[index],
            ...payload,
          };
        }
      };

      updateCollections(state.collections);
      updateCollections(state.filtered);
      updateCollections(state.cluster);
    },
    TOGGLE: (state) => {
      state.showModal = !state.showModal;
    },
    TOGGLE_BATCHES_MODAL: (state) => {
      state.showBatchesModal = !state.showBatchesModal;
    },
    TOGGLE_MOVEMENTS_MODAL: (state) => {
      state.showMovementsModal = !state.showMovementsModal;
    },
    TOGGLE_WASTE_MODAL: (state) => {
      state.showWasteModal = !state.showWasteModal;
    },
    RESET: (state, data) => {
      state.isSuccess = false;
      state.message = "";
      state.formSubmitted = false;
      state.selected = {};
      state.search = "";
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
        state.collections = state.cluster = payload;
        if (!state?.search) {
          state.filtered = payload;
        }
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
        state.collections.unshift(action.payload.payload);
        state.cluster.unshift(action.payload.payload);
        state.filtered.unshift(action.payload.payload);
        state.formSubmitted = false;
        state.message = success;
        state.isSuccess = true;
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
        const { success, payload } = action.payload;
        const updateCollections = (collections) => {
          const index = collections.findIndex(({ _id }) => _id === payload._id);
          if (index > -1) {
            collections[index] = payload;
          }
        };
        updateCollections(state.collections);
        updateCollections(state.cluster);
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
        const deletedId = payload?._id || payload;
        const removeFromCollections = (collections) => {
          const index = collections.findIndex(({ _id }) => _id === deletedId);
          if (index > -1) {
            collections.splice(index, 1);
          }
        };

        removeFromCollections(state.collections);
        removeFromCollections(state.cluster);
        removeFromCollections(state.filtered);
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
  SetCOLLECTIONS,
  Set_SELECTED,
  TOGGLE,
  SetNEW_MENU,
  SetCREATE,
  SetUPDATED_MENU,
  SetDELETED_MENU,
  FILTER,
  SetFILTERED,
  SEARCH,
  TOGGLE_BATCHES_MODAL,
  SetVIEW_BATCHES,
  TOGGLE_MOVEMENTS_MODAL,
  SetVIEW_STOCK_MOVEMENTS,
  DISPOSE,
  SetREPORT_WASTE,
  TOGGLE_WASTE_MODAL,
  REPORT_WASTE,
  RESET,
} = reduxSlice.actions;

export default reduxSlice.reducer;
