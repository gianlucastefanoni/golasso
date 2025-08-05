import { ERStatistiche } from "../components/StatisticheERPage/ERStatistiche";

export const StatisticheERPage = () => {
  return (
    <div className="p-4 bg-gray-900 min-h-screen text-white">
      <h2 className="text-xl mb-4">Statistiche ER</h2>
      <ERStatistiche />
    </div>
  );
};
