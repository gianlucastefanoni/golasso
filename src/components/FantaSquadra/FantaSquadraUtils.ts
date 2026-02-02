export const getMvColor = (val: number) => {
    if (val < 5) return "text-red-500";
    if (val < 6) return "text-yellow-500";
    if (val >= 6.3) return "text-emerald-500";
    return "text-gray-400"; // Tra 6 e 6.2
  };
  
export const getFmColor = (val: number) => {
    if (val < 5) return "text-red-500";
    if (val < 6) return "text-yellow-500";
    if (val >= 6.7) return "text-emerald-500";
    return "text-gray-400"; // Tra 6 e 6.9
  };
  
export const getPvColor = (val: number) => {
    if (val < 5) return "text-red-500";
    if (val < 10) return "text-yellow-500";
    if (val >= 15) return "text-emerald-500";
    return "text-gray-400"; // Sopra 10
  };