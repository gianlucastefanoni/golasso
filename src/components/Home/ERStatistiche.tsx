import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { StatisticheGiocatore } from '../../types/GiocatoreTypes';
import { addStatisticheFromData } from '../../api/ApiService';

export const ERStatistiche: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [giornata, setGiornata] = useState(0)
    let playerStats: StatisticheGiocatore[] = [];
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

                // Process each sheet in the workbook
                workbook.SheetNames.forEach((sheetName) => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

                    let headers: string[] = [];

                    for (let i = 0; i < jsonData.length; i++) {
                        const row = jsonData[i];

                        if (!row || row.length === 0) continue;

                        if (row[0] === 'Cod.' || row[0] === 'Cod') {
                            headers = row.map(h => h.toString().toLowerCase());
                            continue;
                        }

                        if (headers.length > 0 &&
                            row[0] && !isNaN(Number(row[0]))) {
                            const player: Partial<StatisticheGiocatore> = {}

                            headers.forEach((header, index) => {
                                if (index >= row.length) return;

                                const value = row[index];
                                const numericValue = typeof value === 'string' ?
                                    parseFloat(value.replace('*', '')) :
                                    Number(value);

                                switch (header) {
                                    case 'cod.':
                                    case 'cod':
                                        player.cod = value?.toString();
                                        break;
                                    case 'voto':
                                        player.voto = numericValue;
                                        break;
                                    case 'gf':
                                        player.gf = numericValue;
                                        break;
                                    case 'gs':
                                        player.gs = numericValue;
                                        break;
                                    case 'rp':
                                        player.rp = numericValue;
                                        break;
                                    case 'rs':
                                        player.rs = numericValue;
                                        break;
                                    case 'rf':
                                        player.rf = numericValue;
                                        break;
                                    case 'au':
                                        player.au = numericValue;
                                        break;
                                    case 'amm':
                                        player.amm = numericValue;
                                        break;
                                    case 'esp':
                                        player.esp = numericValue;
                                        break;
                                    case 'ass':
                                        player.ass = numericValue;
                                        break;
                                }
                            });

                            if (player.cod) {
                                player.giornata = giornata
                                playerStats.push(player as StatisticheGiocatore);
                            }
                        }
                    }

                });

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
        addStatisticheFromData(playerStats)
    }

    return (
        <div className="flex flex-col gap-2">
            <h2>Carica Statistiche</h2>

            <div className='flex gap-2'>
                <input
                    className='text-white bg-emerald-500 hover:bg-emerald-600 cursor-pointer p-2 rounded-lg'
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    disabled={isLoading || !giornata || giornata === 0}
                />
                <div className='flex flex-col cap-1'>
                    <div>Giornata di riferimento</div>
                    <input type='number' value={giornata} onChange={(e) => setGiornata(parseInt(e.target.value))} />
                </div>
            </div>

            {playerStats.length > 0 && (
                <button className='text-white bg-emerald-500 hover:bg-emerald-600 cursor-pointer p-2 rounded-lg' onClick={() => aggiungiGiocatoriDB()}>
                    Aggiungi giocatori a db
                </button>)}
        </div>
    )
}
