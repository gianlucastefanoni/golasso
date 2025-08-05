import { useState } from "react";
import { ERStatistiche } from "../components/StatisticheERPage/ERStatistiche";
import { Link } from "react-router-dom";

const PASSWORD = "intermerda"; // cambia qui la password

export const StatisticheERPage = () => {
  const [inputPassword, setInputPassword] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === PASSWORD) {
      setAccessGranted(true);
      setError("");
    } else {
      setError("Password errata, riprova.");
    }
  };

  return (
    <div className="p-4 md:px-0 bg-gray-900 min-h-screen text-white relative">
      <div className="w-full md:w-4/6 mx-auto flex flex-col gap-2 h-full">
        {/* Pulsante sempre visibile */}
        <div className="ml-auto mr-0">
          <Link
            to="/"
            className="bg-emerald-600 hover:bg-emerald-500 text-white py-1 px-3 rounded"
          >
            Torna alla Home
          </Link>
        </div>

        {!accessGranted ? (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-xl mb-4">Inserisci la password per accedere</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64">
              <input
                type="password"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="p-2 rounded bg-gray-800 text-white focus:outline-none"
                placeholder="Password"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 py-2 rounded text-white font-semibold"
              >
                Accedi
              </button>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>
          </div>
        ) : (
          <div>
            <h2 className="text-xl mb-4">Statistiche ER</h2>
            <ERStatistiche />
          </div>
        )}
      </div></div>
  );
};
