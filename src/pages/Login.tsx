import { useEffect, useState } from "react";
import { loginWithGoogle } from "../firebase/loginGoogle";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebase/firebaseconfig"; // Assicurati che il percorso sia corretto
import logo from '../assets/logo.svg';

const auth = getAuth(app);

export const Login = () => {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Ascolta i cambiamenti dello stato auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Se l'utente esiste, mandalo subito alla home
        navigate("/home");
      } else {
        // Se non c'è utente, smetti di caricare e mostra la login
        setCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate("/home");
    } catch (err) {
      console.error("Errore login:", err);
    }
  };

  // Mentre controlliamo se l'utente è loggato, mostriamo una schermata vuota o un caricamento
  if (checkingAuth) {
    return (
      <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 flex flex-col items-center justify-center p-4">
      {/* Effetto luce soffusa */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-600/10 blur-[120px] rounded-full"></div>

      <div className="relative w-full max-w-md bg-gray-800 border border-gray-700 p-10 rounded-3xl shadow-2xl text-center">
        
        {/* Logo Golasso */}
        <div className="mb-6 flex justify-center">
          <img src={logo} alt="Golasso Logo" className="w-24 h-24 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
        </div>

        <p className="text-gray-400 mt-3 mb-10 text-sm">
          La piattaforma definitiva per la gestione del tuo Fantacalcio.
        </p>

        {/* Bottone Login con Google */}
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-bold py-4 px-6 rounded-2xl transition-all duration-200 shadow-xl active:scale-[0.97]"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Entra in Campo
        </button>

        <div className="mt-10 text-[10px] text-gray-600 uppercase tracking-widest font-semibold">
          Powered by Golasso Engine
        </div>
      </div>
    </div>
  );
};