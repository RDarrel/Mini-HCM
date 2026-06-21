import { Routes, Route } from "react-router-dom";

import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { auth } from "./services/config/firebase";
import { RESTORE_SESSION, RESET } from "./services/redux/slices/auth";
import { useSelector } from "react-redux";
import Authentication from "./pages/authentication";
import Platforms from "./pages/platforms";
import RouteConfig from "./routes/RouteConfig";
import "./App.css";

import AppLoader from "./components/shared/appLoader";
export default function App() {
  const { auth: authUser, isLoading } = useSelector(({ auth }) => auth);
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
  }, [dispatch]);

  if (isLoading) return <AppLoader />;
  return (
    <Routes>
      <Route path="/" element={<Authentication />} />
      {/* <Route path="/authentication/:action" element={<Authentication />} /> */}
      <Route path="/platforms" element={<Platforms />}>
        {RouteConfig(authUser?.role)}
        <Route path="*" element={<h2>Not Found</h2>} />
      </Route>
      <Route path="*" element={<h2>Not Found</h2>} />
    </Routes>
  );
}
