import { logout } from "../firebase/loginGoogle";
import { useNavigate } from "react-router-dom";

export const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Errore logout:", err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 bg-gray-800 hover:bg-red-900/40 text-gray-300 hover:text-red-400 px-4 py-2 rounded-lg border border-gray-700 transition-all duration-200 shadow-sm text-sm font-medium group w-32"
    >
      {/* Icona Logout (SVG) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5 transition-transform group-hover:-translate-x-1"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
        />
      </svg>
      
      Logout
    </button>
  );
};