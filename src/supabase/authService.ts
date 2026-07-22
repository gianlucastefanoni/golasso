import { supabase } from "./supabaseClient";

const getOAuthRedirectTo = () => {
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // In produzione l'app e servita sotto /golasso, in locale normalmente e servita alla root.
  return isLocalhost
    ? window.location.origin
    : `${window.location.origin}/golasso`;
};

export const loginWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getOAuthRedirectTo(),
    },
  });
  if (error) {
    console.error("Errore durante il login con Google:", error);
    throw error;
  }
  return data;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Errore durante il logout:", error);
    throw error;
  }
};
