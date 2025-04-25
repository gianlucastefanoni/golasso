import { Routes, Route, Navigate, HashRouter } from "react-router-dom";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/home" element={<div>Home</div>} />
        <Route path="/giocatore" element={<div>Giocatore</div>} />
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </HashRouter>
  );
}
