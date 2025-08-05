import { Routes, Route, Navigate, HashRouter } from "react-router-dom";
import { Home } from "./pages/Home";
import { Giocatore } from "./pages/Giocatore";
import { StatisticheERPage } from "./pages/StatisticheERPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/giocatore" element={<Giocatore />} />
        <Route path="/statistiche-er" element={<StatisticheERPage />} />
        <Route path="/*" element={<Navigate to="/home" replace />} />
      </Routes>
    </HashRouter>
  );
}
