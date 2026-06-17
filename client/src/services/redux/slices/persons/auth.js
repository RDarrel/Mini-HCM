import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ENDPOINT, axioKit } from "../../../utilities";

const name = "persons/auth",
  maxPage = Number(localStorage.getItem("maxPage")) || 5,
  token = localStorage.getItem("token") || "",
  email = localStorage.getItem("email") || "",
  image = `${ENDPOINT}/assets/profile/${email}.jpg`;

const initialState = {
  id: "",
  auth: {},
  role: "",
  searchFound: "",
  information: {},
  route: "",
  token,
  email,
  image,
  code: "",
  maxPage,
  progress: {
    requirements: [],
    percentage: 0,
  },
  progressBar: -1,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const LOGIN = createAsyncThunk(`${name}/login`, (form, thunkAPI) => {
  try {
    return axioKit.login(form.email, form.password);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const CHANGE_PASSWORD = createAsyncThunk(
  `${name}/change_password`,
  ({ data }, thunkAPI) => {
    try {
      return axioKit.changePassword(name, data);
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

export const VALIDATEREFRESH = createAsyncThunk(
  `${name}/validateRefresh`,
  (token, thunkAPI) => {
    try {
      return axioKit.validateRefresh(token);
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

export const UPDATE = createAsyncThunk(`${name}/update`, (form, thunkAPI) => {
  try {
    return axioKit.update("users", form.data, form.token);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const UPLOAD = createAsyncThunk(
  `${name}/upload`,
  ({ data, token }, thunkAPI) => {
    try {
      return axioKit.upload(data, token);
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
  name,
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
      state.searchFound = null;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(LOGIN.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(LOGIN.fulfilled, (state, action) => {
        const { success, payload } = action.payload;
        const { token, user } = payload;
        state.token = token;
        state.email = user.email;
        state.auth = user;
        state.id = user._id;
        state.message = success;
        state.isSuccess = true;
        state.isLoading = false;
      })
      .addCase(LOGIN.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoading = false;
      })

      .addCase(UPDATE.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(UPDATE.fulfilled, (state, action) => {
        const { message, payload } = action.payload;
        state.auth = payload;
        state.isLoading = false;
        state.message = message;
        state.isSuccess = true;
      })
      .addCase(UPDATE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoading = false;
      })

      .addCase(VALIDATEREFRESH.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(VALIDATEREFRESH.fulfilled, (state, action) => {
        const { payload = {} } = action.payload;
        const { user, information } = payload || {};
        state.information = information;
        state.auth = user;
        state.role = user?.role?.name;

        state.email = user?.email;
        state.isLoading = false;
      })
      .addCase(VALIDATEREFRESH.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoading = false;
      })

      .addCase(UPLOAD.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(UPLOAD.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(UPLOAD.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoading = false;
      })

      .addCase(CHANGE_PASSWORD.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.message = "";
      })

      .addCase(CHANGE_PASSWORD.fulfilled, (state, _) => {
        state.isLoading = false;
      })
      .addCase(CHANGE_PASSWORD.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoading = false;
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
