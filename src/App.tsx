import { Routes, Route, Navigate, HashRouter } from "react-router-dom";
import { Home } from "./pages/Home";
import { Giocatore } from "./pages/Giocatore";
import { StatisticheERPage } from "./pages/StatisticheERPage";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase/firebaseconfig";
import { Login } from "./pages/Login";
import UserRoleManager from "./pages/UserRoleManager";
import { useUserStore } from "./store/useUserStore";

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  if (user === undefined) return null;
  return user ? children : <Navigate to="/login" />;
}


export default function App() {
  useEffect(() => {
    useUserStore.getState().initialize();
  }, []);
  
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
          path="/gestione-ruoli" 
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
