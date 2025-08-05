interface RuoloBadgeProps {
    ruolo: string;
  }
  
  export const RuoloBadge = ({ ruolo }: RuoloBadgeProps) => {
    const ruoloColor = (r: string) => {
      switch (r) {
        case 'P': return 'bg-orange-500 text-white';
        case 'D': return 'bg-blue-500 text-white';
        case 'C': return 'bg-green-500 text-white';
        case 'A': return 'bg-red-600 text-white';
        default: return 'bg-gray-300 text-gray-700';
      }
    };
  
    return (
      <span className={`inline-block px-3 py-1 rounded-full font-semibold ${ruoloColor(ruolo)}`} style={{ minWidth: 24, textAlign: 'center' }}>
        {ruolo}
      </span>
    );
  };
  