import { Routes, Route, Navigate, HashRouter } from "react-router-dom";
import { Home } from "./pages/Home";
import { Giocatore } from "./pages/Giocatore";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/giocatore" element={<Giocatore />} />
        <Route path="/*" element={<Navigate to="/home" replace />} />
      </Routes>
    </HashRouter>
  );
}
