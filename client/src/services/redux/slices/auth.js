import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../utilities";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../config/firebase"; // ayusin path
const name = "auth",
  maxPage = Number(localStorage.getItem("maxPage")) || 5,
  token = localStorage.getItem("token") || "";

const initialState = {
  auth: {},
  role: "",
  searchFound: "",
  information: {},
  route: "",
  token,
  maxPage,
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
export const REGISTER = createAsyncThunk(
  `${name}/register`,
  async (form, thunkAPI) => {
    const { email, password, name } = form;
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;

      const userData = {
        uid: user.uid,
        name,
        email: user.email,
        role: "employee",
        timezone,
        schedule: {
          start: "09:00",
          end: "18:00",
        },
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid), userData);

      return {
        uid: user.uid,
        name,
        email: user.email,
        role: "employee",
        timezone,
        schedule: {
          start: "09:00",
          end: "18:00",
        },
      };
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

export const reduxSlice = createSlice({
  name,
  initialState,
  reducers: {
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

      .addCase(REGISTER.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(REGISTER.fulfilled, (state, _) => {
        state.isLoading = false;
      })
      .addCase(REGISTER.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoading = false;
      });
  },
});

export const { RESET, MAXPAGE, UPDATE_AUTH } = reduxSlice.actions;

export default reduxSlice.reducer;
