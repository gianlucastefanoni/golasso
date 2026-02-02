import { Link } from 'react-router-dom';
import { LogoutButton } from './LogoutButton';
import logo from '../assets/logo.svg';
import { useUserStore } from '../store/useUserStore';

export const Header = () => {
  const { isAdmin } = useUserStore();
  return (
    <header className="w-full bg-gray-900 border-b border-gray-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LATO SINISTRO: Logo e Nome */}
        <Link to="/home" className="flex items-center gap-3 group outline-none">
          <img 
            src={logo} 
            alt="Golasso Logo" 
            className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-200" 
          />
        </Link>

        {/* LATO DESTRO: Navigazione e Logout */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-400">
             <Link to="/home" className="hover:text-emerald-400 transition-colors">Giocatori</Link>
             <Link to="/fantasquadra" className="hover:text-emerald-400 transition-colors">FantaSquadra</Link>
             {isAdmin && <Link to="/gestione-ruoli" className="hover:text-emerald-400 transition-colors">Utenti</Link>}
          </nav>

          <div className="h-6 w-[1px] bg-gray-700 hidden md:block"></div>

          <LogoutButton />
        </div>

      </div>
    </header>
  );
};