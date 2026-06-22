import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { auth } from "./config/firebase";
import { RESTORE_SESSION, RESET } from "./redux/slices/auth";
import { useSelector } from "react-redux";
import Authentication from "./pages/authentication";
import Platforms from "./pages/platforms";
import RouteConfig from "./routes/RouteConfig";
import "./App.css";

import AppLoader from "./components/shared/appLoader";
export default function App() {
  const { auth: authUser, isCheckingAuth } = useSelector(({ auth }) => auth);
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

  if (isCheckingAuth) return <AppLoader />;
  return (
    <Routes>
      <Route
        path="/"
        element={
          authUser?.uid ? (
            <Navigate to="/platforms/dashboard" replace />
          ) : (
            <Authentication />
          )
        }
      />
      {/* <Route path="/authentication/:action" element={<Authentication />} /> */}
      <Route path="/platforms" element={<Platforms />}>
        {RouteConfig(authUser?.role)}
        <Route path="*" element={<h2>Not Found</h2>} />
      </Route>
      <Route path="*" element={<h2>Not Found</h2>} />
    </Routes>
  );
}
