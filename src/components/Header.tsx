import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import logo from "../assets/logo.svg";
import { useUserStore } from "../store/useUserStore";

export const Header = () => {
  const { isAdmin } = useUserStore();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="w-full bg-gray-900 border-b border-gray-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/home" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Golasso Logo"
            className="w-10 h-10 object-contain"
          />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-4 text-sm font-medium text-gray-400">
            <Link to="/home" className="hover:text-emerald-400">
              Giocatori
            </Link>

            <Link to="/fantasquadra" className="hover:text-emerald-400">
              FantaSquadra
            </Link>

            <Link to="/rosaottimale" className="hover:text-emerald-400">
              Rosa ottimale
            </Link>

            <Link to="/nuova-configurazione" className="hover:text-emerald-400">
              Nuova configurazione
            </Link>

            {isAdmin && (
              <Link
                to="/gestione-ruoli"
                className="hover:text-emerald-400"
              >
                Utenti
              </Link>
            )}
          </nav>

          <div className="h-6 w-px bg-gray-700" />

          <LogoutButton />
        </div>

        {/* Mobile */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menu Mobile */}
      {open && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <nav className="flex flex-col py-2">
            <Link
              to="/home"
              onClick={closeMenu}
              className="px-4 py-3 text-gray-300 hover:bg-gray-800"
            >
              Giocatori
            </Link>

            <Link
              to="/fantasquadra"
              onClick={closeMenu}
              className="px-4 py-3 text-gray-300 hover:bg-gray-800"
            >
              FantaSquadra
            </Link>

            <Link
              to="/rosaottimale"
              onClick={closeMenu}
              className="px-4 py-3 text-gray-300 hover:bg-gray-800"
            >
              Rosa ottimale
            </Link>

            {isAdmin && (
              <Link
                to="/gestione-ruoli"
                onClick={closeMenu}
                className="px-4 py-3 text-gray-300 hover:bg-gray-800"
              >
                Utenti
              </Link>
            )}

            <div className="border-t border-gray-800 mt-2 pt-2 px-4">
              <LogoutButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};