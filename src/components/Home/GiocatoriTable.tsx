import { useState } from 'react';
import { GiocatoreType } from '../../types/GiocatoreTypes';

type SortDirection = 'ascending' | 'descending';
type SortableField = keyof GiocatoreType;
interface GiocatoriTableProps {
    giocatori: GiocatoreType[]
}

export const GiocatoriTable = ({giocatori}: GiocatoriTableProps) => {

  
  const [sortConfig, setSortConfig] = useState<{
    key: SortableField | null;
    direction: SortDirection;
  }>({
    key: null,
    direction: 'ascending'
  });

  const requestSort = (key: SortableField) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedGiocatori = [...giocatori].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div>
      {giocatori.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('ruolo')}>
                Ruolo {sortConfig.key === 'ruolo' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('nome')}>
                Nome {sortConfig.key === 'nome' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('squadra')}>
                Squadra {sortConfig.key === 'squadra' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedGiocatori.map((giocatore) => (
              <tr key={giocatore.id}>
                <td>{giocatore.ruolo}</td>
                <td>{giocatore.nome}</td>
                <td>{giocatore.squadra}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nessun giocatore trovato.</p>
      )}
    </div>
  );
}
