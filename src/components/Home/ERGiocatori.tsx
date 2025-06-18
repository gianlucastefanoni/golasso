import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { GiocatoreType, TeamData } from '../../types/GiocatoreTypes';
import { addGiocatoriFromData } from '../../api/ApiService';

export const ERGiocatori: React.FC = () => {
  const [teamsData, setTeamsData] = useState<TeamData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    
    const file = e.target.files?.[0];
    if (!file) {
      setIsLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const result: TeamData[] = [];
        
        // Process each sheet in the workbook
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          let currentTeam = '';
          let headers: string[] = [];
          let teamPlayers: GiocatoreType[] = [];
          
          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            
            if (!row || row.length === 0) continue;
            
            if (row[0] && typeof row[0] === 'string' && row[0].trim() !== '' && 
                !row[0].includes('Voti') && !row[0].includes('Cod.') && 
                !row[0].includes('QUESTO FILE')) {
              if (currentTeam && teamPlayers.length > 0) {
                result.push({
                  squadra: currentTeam,
                  giocatori: teamPlayers
                });
              }
              
              currentTeam = row[0];
              teamPlayers = [];
              continue;
            }
            
            if (row[0] === 'Cod.' || row[0] === 'Cod') {
              headers = row.map(h => h.toString().toLowerCase());
              continue;
            }
            
            if (currentTeam && headers.length > 0 && 
                row[0] && !isNaN(Number(row[0]))) {
              const player: Partial<GiocatoreType> = {
                squadra: currentTeam,
              };
              
              headers.forEach((header, index) => {
                if (index >= row.length) return;
                
                const value = row[index];
                
                switch (header) {
                  case 'cod.':
                  case 'cod':
                    player.cod = value?.toString();
                    break;
                  case 'ruolo':
                    player.ruolo = value?.toString();
                    break;
                  case 'nome':
                    player.nome = value?.toString();
                    break;
                }
              });
              
              if (player.cod && player.nome) {
                teamPlayers.push(player as GiocatoreType);
              }
            }
          }
          
          // Add the last team's players
          if (currentTeam && teamPlayers.length > 0) {
            result.push({
              squadra: currentTeam,
              giocatori: teamPlayers
            });
          }
        });
        
        setTeamsData(result);
      } catch (err) {
        console.error('Error processing Excel file:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setIsLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
  }, []);

    function aggiungiGiocatoriDB(): void {
        for (var team of teamsData){
            addGiocatoriFromData(team.giocatori)
        }
    }

  return (
    <div className="flex flex-col gap-">
      <h2>Carica giocatori</h2>
      
      <div>
        <input 
        className='text-white bg-emerald-500 hover:bg-emerald-600 cursor-pointer p-2 rounded-lg'
          type="file" 
          accept=".xlsx, .xls" 
          onChange={handleFileUpload} 
          disabled={isLoading}
        />
      </div>
      
      {teamsData.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3>Processed Data</h3>
          <div className="flex flex-col">
            <p>Teams processed: {teamsData.length}</p>
            <p>Total players: {teamsData.reduce((sum, team) => sum + team.giocatori.length, 0)}</p>
          </div>
          
          <button className='text-white bg-emerald-500 hover:bg-emerald-600 cursor-pointer p-2 rounded-lg' onClick={() => aggiungiGiocatoriDB()}>
            Aggiungi giocatori a db
          </button>
        </div>
      )}
    </div>
  );
};
