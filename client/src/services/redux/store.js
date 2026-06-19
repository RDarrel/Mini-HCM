import { configureStore } from "@reduxjs/toolkit";
import auth from "./slices/auth";
import attendance from "./slices/attendance";
const store = configureStore({
  reducer: {
    auth,
    attendance,
  },
});

export default store;
