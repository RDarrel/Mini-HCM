import { Routes, Route } from "react-router-dom";
import "./App.css";
import Platforms from "./pages/platforms";
import RouteConfig from "./routes/RouteConfig";
import { useDispatch, useSelector } from "react-redux";
import { VALIDATEREFRESH } from "./services/redux/slices/persons/auth";
import { useEffect } from "react";
import Authentication from "./pages/authentication";
import { OrderReceipt } from "./components/shared/receipts";
export default function App() {
  const { auth, token } = useSelector(({ auth }) => auth),
    dispatch = useDispatch();
  useEffect(() => {
    if (!auth?._id && token) {
      dispatch(VALIDATEREFRESH(token));
    }
  }, [token, auth]);
  return (
    <Routes>
      <Route path="/" element={<Authentication />} />
      {/* <Route path="/authentication/:action" element={<Authentication />} /> */}
      <Route path="/platforms" element={<Platforms />}>
        {RouteConfig()}
        <Route path="*" element={<h2>Not Found</h2>} />
      </Route>
      <Route path="receipts/order" element={<OrderReceipt />} />
      <Route path="*" element={<h2>Not Found</h2>} />
    </Routes>
  );
}
