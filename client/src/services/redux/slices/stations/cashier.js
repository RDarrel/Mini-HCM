import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../../utilities";
import {
  createCartLineId,
  createCartSignature,
  normalizeAddOns,
  normalizeCart,
} from "./cashier.utils";

const url = "asets/staffs";

const initialState = {
  sale: 0,
  soldLiters: 0,
  sales: [],
  salesFiltered: [],
  activeTab: "menus",
  category: "all",
  activeCategory: "",
  availability: "all",
  search: "",
  menus: [],
  menusCluster: [],
  menusFiltered: [],
  categories: [],
  fuel: {},
  fuels: [],
  cartOpen: false,
  cart: [],
  customizeState: null,
  customSelected: [],
  isLoading: false,
  isLoadingSales: false,
  formSubmitted: false,
};

export const BROWSE_SALES = createAsyncThunk(
  `${url}/sales`,
  ({ token, params }, thunkAPI) => {
    try {
      return axioKit.universal(`sales/orders/browse`, token, params);
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
    return axioKit.save("sales/orders", form.data, form.token);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const BROWSE_MENUS = createAsyncThunk(
  `${url}/menus`,
  ({ token, params }, thunkAPI) => {
    try {
      return axioKit.universal(`/menu/menus/browse`, token, params);
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
const getIsAvailable = (item) => Boolean(item?.isAvailable ?? item?.isPublish);

const applyFilters = (collections, { category, availability, search }) => {
  const byCategory =
    category === "all"
      ? collections
      : collections.filter((item) => item?.category?._id === category);

  const byAvailability =
    availability === "all"
      ? byCategory
      : byCategory.filter((item) => {
          const isAvailable = getIsAvailable(item);
          return availability === "available" ? isAvailable : !isAvailable;
        });

  const cluster = byAvailability;
  const filtered = !search
    ? cluster
    : cluster.filter((item) => {
        return item.name.toLowerCase().includes(search.toLowerCase());
      });

  return { cluster, filtered };
};

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
      state.cart = normalizeCart(payload);
    },
    SetCartOpen: (state, { payload }) => {
      state.cartOpen = Boolean(payload);
    },
    SetCustomizeState: (state, { payload }) => {
      state.customizeState = payload || null;
    },
    SetCustomSelected: (state, { payload }) => {
      state.customSelected = Array.isArray(payload) ? payload : [];
    },
    HydrateCart: (state, { payload }) => {
      state.cart = normalizeCart(payload);
    },
    CartClear: (state) => {
      state.cart = [];
    },
    CartAdd: (state, { payload }) => {
      const menu = payload?.menu || null;
      const menuId = String(menu?._id || payload?.menuId || "");
      if (!menuId) return;

      const now = Date.now();
      const addOns = normalizeAddOns(payload?.addOns || []);
      const signature = createCartSignature(
        menuId,
        addOns.map((item) => item._id),
      );

      const lines = Array.isArray(state.cart) ? state.cart : [];
      const index = lines.findIndex(
        (line) => String(line?.signature || "") === signature,
      );

      if (index > -1) {
        const current = lines[index];
        lines[index] = {
          ...current,
          quantity: (Number(current?.quantity) || 0) + 1,
          updatedAt: now,
          attentionAt: now,
        };
        state.cart = lines;
        return;
      }

      const nextLine = {
        id: createCartLineId(),
        menuId,
        menu,
        quantity: 1,
        addOns,
        signature,
        updatedAt: now,
        addedAt: now,
        attentionAt: now,
      };

      state.cart = [nextLine, ...lines];
    },
    CartIncrement: (state, { payload }) => {
      const lineId = String(payload || "");
      if (!lineId) return;

      const now = Date.now();
      const lines = Array.isArray(state.cart) ? state.cart : [];
      const index = lines.findIndex(
        (line) => String(line?.id || "") === lineId,
      );
      if (index === -1) return;

      const current = lines[index];
      lines[index] = {
        ...current,
        quantity: (Number(current?.quantity) || 0) + 1,
        updatedAt: now,
      };
      state.cart = lines;
    },
    CartDecrement: (state, { payload }) => {
      const lineId = String(payload || "");
      if (!lineId) return;

      const now = Date.now();
      const lines = Array.isArray(state.cart) ? state.cart : [];
      const index = lines.findIndex(
        (line) => String(line?.id || "") === lineId,
      );
      if (index === -1) return;

      const current = lines[index];
      const nextQty = Math.max(0, (Number(current?.quantity) || 0) - 1);
      if (nextQty <= 0) {
        state.cart = lines.filter((l) => l.id !== lineId);
        return;
      }

      lines[index] = { ...current, quantity: nextQty, updatedAt: now };
      state.cart = lines;
    },
    CartRemove: (state, { payload }) => {
      const lineId = String(payload || "");
      if (!lineId) return;

      const lines = Array.isArray(state.cart) ? state.cart : [];
      state.cart = lines.filter((l) => l.id !== lineId);
    },
    CartUpdateLineAddOns: (state, { payload }) => {
      const lineId = String(payload?.lineId || "");
      if (!lineId) return;

      const now = Date.now();
      const lines = Array.isArray(state.cart) ? state.cart : [];
      const index = lines.findIndex(
        (line) => String(line?.id || "") === lineId,
      );
      if (index === -1) return;

      const current = lines[index];
      const addOns = normalizeAddOns(payload?.addOns || []);
      const signature = createCartSignature(
        String(current?.menuId || current?.menu?._id || ""),
        addOns.map((item) => item._id),
      );

      lines[index] = {
        ...current,
        addOns,
        signature,
        updatedAt: now,
      };
      state.cart = lines;
    },
    SEARCH: (state, { payload }) => {
      state.search = payload;

      const { filtered } = applyFilters(state.menus, {
        category: state.category,
        availability: state.availability,
        search: state.search,
      });

      state.menusFiltered = filtered;
    },
    FilterBY_CATEGORY: (state, { payload }) => {
      state.category = payload;
      state.search = "";

      const { cluster, filtered } = applyFilters(state.menus, {
        category: state.category,
        availability: state.availability,
        search: state.search,
      });

      state.menusCluster = cluster;
      state.menusFiltered = filtered;
    },
    SetActiveCategory: (state, { payload }) => {
      state.activeCategory = String(payload || "");
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
      .addCase(BROWSE_SALES.pending, (state) => {
        state.isLoadingSales = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(BROWSE_SALES.fulfilled, (state, action) => {
        const { payload } = action.payload;
        state.sales = payload;
        state.isLoadingSales = false;
      })
      .addCase(BROWSE_SALES.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingSales = false;
      })
      .addCase(BROWSE_MENUS.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(BROWSE_MENUS.fulfilled, (state, action) => {
        const { payload } = action.payload;
        const categories = Object.values(
          payload?.reduce((acc, item) => {
            const { category } = item;
            acc[category?._id] = item?.category;
            return acc;
          }, {}),
        );
        state.menus = state.menusCluster = state.menusFiltered = payload;
        state.categories = categories;
        state.isLoading = false;
      })
      .addCase(BROWSE_MENUS.rejected, (state, action) => {
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
        const { payload } = action.payload;

        state.formSubmitted = false;
        state.isLoading = false;
        state.sales.unshift(payload);
        localStorage.setItem("order-printout", JSON.stringify(payload));
        window.open(
          "/receipts/order",
          "order-printout",
          "top=100px,left=500px,width=700px,height=750px",
        );
      })
      .addCase(SAVE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      });
  },
});

export const {
  RESET,
  SetSALE,
  SetFUEL,
  SetCART,
  SetCartOpen,
  SetCustomizeState,
  SetCustomSelected,
  HydrateCart,
  CartAdd,
  CartIncrement,
  CartDecrement,
  CartRemove,
  CartClear,
  CartUpdateLineAddOns,
  RESET_SALE,
  SetActiveTab,
  SetActiveCategory,
  FilterBY_CATEGORY,
  SEARCH,
} = reduxSlice.actions;

export default reduxSlice.reducer;
