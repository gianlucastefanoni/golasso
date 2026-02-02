import { Routes, Route, Navigate, HashRouter } from "react-router-dom";
import { ReactNode, useEffect } from "react";
import { useUserStore } from "./store/useUserStore";

// Pagine
import { Home } from "./pages/Home";
import { Giocatore } from "./pages/Giocatore";
import { StatisticheERPage } from "./pages/StatisticheERPage";
import { Login } from "./pages/Login";
import UserRoleManager from "./pages/UserRoleManager";

// Tipi
import { UserProfile } from "./types/UserTypes";
import { FantaSquadraDetail } from "./pages/FantaSquadraDetail";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserProfile; // Assuming UserProfile is your enum/type
}

/**
 * Componente per proteggere le rotte in base a login e ruoli
 */
function ProtectedRoute({ children, requiredRole = UserProfile.Lettore }: ProtectedRouteProps) {
  const { profile, loading, user } = useUserStore();

  // Se lo store sta ancora caricando profilo o auth, aspettiamo
  if (loading) {
    return (
      <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 1. Controllo base: l'utente è loggato?
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Controllo Ruolo: il profilo ha il grado necessario?
  // Usiamo >= così un Admin può vedere anche le pagine Scrittore
  const userRole = profile?.idProfilo ?? UserProfile.Lettore;
  if (userRole < requiredRole) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default function App() {
  // Inizializziamo lo store una volta sola
  useEffect(() => {
    useUserStore.getState().initialize();
  }, []);
  
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rotte per tutti i loggati (Lettori) */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/fantasquadra" element={
          <ProtectedRoute>
            <FantaSquadraDetail />
          </ProtectedRoute>
        } />
        
        <Route path="/giocatore" element={
          <ProtectedRoute>
            <Giocatore />
          </ProtectedRoute>
        } />

        {/* Rotte solo per Scrittori e Admin */}
        <Route path="/statistiche-er" element={
          <ProtectedRoute requiredRole={UserProfile.Scrittore}>
            <StatisticheERPage />
          </ProtectedRoute>
        } />

        {/* Rotte solo per Admin */}
        <Route path="/gestione-ruoli" element={
          <ProtectedRoute requiredRole={UserProfile.Admin}>
            <UserRoleManager />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="/*" element={<Navigate to="/home" replace />} />
      </Routes>
    </HashRouter>
  );
}