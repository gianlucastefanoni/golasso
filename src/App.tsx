import { Routes, Route, Navigate, HashRouter } from "react-router-dom";
import { Home } from "./pages/Home";
import { Giocatore } from "./pages/Giocatore";
import { StatisticheERPage } from "./pages/StatisticheERPage";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase/firebaseconfig";
import { Login } from "./pages/Login";
import UserRoleManager from "./pages/UserRoleManager";

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  if (user === undefined) return null;
  return user ? children : <Navigate to="/login" />;
}


export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/giocatore" 
          element={
            <ProtectedRoute>
              <Giocatore />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/statistiche-er" 
          element={
            <ProtectedRoute>
              <StatisticheERPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user-manager" 
          element={
            <ProtectedRoute>
              <UserRoleManager />
            </ProtectedRoute>
          } 
        />
        <Route path="/*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  );
}
