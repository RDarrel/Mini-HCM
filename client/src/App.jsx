import { Routes, Route } from "react-router-dom";
import "./App.css";
import Platforms from "./pages/platforms";
import RouteConfig from "./routes/RouteConfig";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import Authentication from "./pages/authentication";
import { auth } from "./services/config/firebase";
import { RESTORE_SESSION, RESET } from "./services/redux/slices/auth";
export default function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        dispatch(RESTORE_SESSION(user.uid));
      } else {
        dispatch(RESET());
      }
    });

    return () => unsubscribe();
  }, []);
  return (
    <Routes>
      <Route path="/" element={<Authentication />} />
      {/* <Route path="/authentication/:action" element={<Authentication />} /> */}
      <Route path="/platforms" element={<Platforms />}>
        {RouteConfig()}
        <Route path="*" element={<h2>Not Found</h2>} />
      </Route>
      <Route path="*" element={<h2>Not Found</h2>} />
    </Routes>
  );
}
