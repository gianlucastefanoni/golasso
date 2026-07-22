interface Props {
  current: number;
  previous: number | undefined;
  invert?: boolean; // true per statistiche dove "meno è meglio" (gol subiti, ammonizioni, espulsioni, autogol)
  decimals?: number;
}

export const TrendIndicator = ({
  current,
  previous,
  invert = false,
  decimals = 0,
}: Props) => {
  if (previous === undefined) return null;

  const diff = current - previous;
  const diffArrotondato = Number(diff.toFixed(decimals));
  if (diffArrotondato === 0)
    return <span className="text-gray-600 text-[9px] ml-1">–</span>;

  const isMiglioramento = invert ? diff < 0 : diff > 0;
  const simbolo = diff > 0 ? "▲" : "▼";
  const valoreAssoluto = Math.abs(diffArrotondato).toFixed(decimals);

  return (
    <span
      className={`text-[9px] font-black ml-1 ${isMiglioramento ? "text-emerald-400" : "text-red-400"}`}
    >
      {simbolo}
      {valoreAssoluto}
    </span>
  );
};
