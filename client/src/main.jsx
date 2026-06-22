import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux"; // Import Provider from react-redux
import { Toaster } from "@/components/ui/sonner";
import App from "./App.jsx";
import store from "./redux/store.js";
import axios from "axios";
import { ENDPOINT } from "./utilities/index.js";
import "./index.css";

axios.defaults.baseURL = ENDPOINT;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <Toaster position="top-center" richColors />
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>,
);
