import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux"; // Import Provider from react-redux
import { Toaster } from "@/components/ui/sonner";
import App from "./App.jsx";
import store from "./services/redux/store";
import axios from "axios";
import { ENDPOINT } from "./services/utilities";
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
  </StrictMode>
);
