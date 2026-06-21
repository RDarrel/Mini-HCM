import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase"; // ayusin path
import { Formatter } from "../../utilities";
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
  isCheckingAuth: true,
  message: "",
};

export const LOGIN = createAsyncThunk(
  `${name}/login`,
  async (form, thunkAPI) => {
    try {
      const { email, password } = form;
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return thunkAPI.rejectWithValue("User profile not found");
      }

      const userData = userSnap.data();

      return {
        uid: user.uid,
        email: user.email,
        ...userData,
        createdAt: Formatter.date(userData.createdAt),
      };
    } catch (error) {
      let message = "Login failed";
      if (error.code === "auth/invalid-credential") {
        message = "Invalid email or password";
      } else if (error.code === "auth/user-not-found") {
        message = "User not found";
      } else if (error.code === "auth/wrong-password") {
        message = "Wrong password";
      } else {
        message = error.message;
      }

      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const REGISTER = createAsyncThunk(
  `${name}/register`,
  async (form, thunkAPI) => {
    const { email, password, name, timezone } = form;
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
      let message = "Registration failed";

      if (
        error.code === "auth/email-already-in-use" ||
        error.message?.includes("EMAIL_EXISTS")
      ) {
        message = "Email already exists";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address";
      } else if (error.code === "auth/weak-password") {
        message = "Password should be at least 6 characters";
      } else {
        message = error.message;
      }

      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const RESTORE_SESSION = createAsyncThunk(
  `${name}/restoreSession`,
  async (uid, thunkAPI) => {
    try {
      const snapshot = await getDoc(doc(db, "users", uid));

      if (!snapshot.exists()) {
        return thunkAPI.rejectWithValue("User profile not found");
      }

      return {
        uid,
        ...snapshot.data(),
        createdAt: Formatter.date(snapshot.data().createdAt),
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const LOGOUT = createAsyncThunk(
  `${name}/logout`,
  async (_, thunkAPI) => {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
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
      state.isSuccess = false;
      state.auth = {};
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
        state.auth = action.payload;
        state.isSuccess = true;
        state.isLoading = false;
      })
      .addCase(LOGIN.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoading = false;
      })

      .addCase(RESTORE_SESSION.pending, (state) => {
        state.isCheckingAuth = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(RESTORE_SESSION.fulfilled, (state, action) => {
        state.auth = action.payload;
        state.isCheckingAuth = false;
      })
      .addCase(RESTORE_SESSION.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isCheckingAuth = false;
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
        const { payload } = action;
        state.message = payload;
        state.isLoading = false;
      })
      .addCase(LOGOUT.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(LOGOUT.fulfilled, (state, _) => {
        state.isLoading = false;
        state.auth = {};
        state.isSuccess = true;
      })
      .addCase(LOGOUT.rejected, (state, action) => {
        const { payload } = action;
        state.message = payload;
        state.isLoading = false;
      });
  },
});

export const { RESET, MAXPAGE } = reduxSlice.actions;

export default reduxSlice.reducer;
