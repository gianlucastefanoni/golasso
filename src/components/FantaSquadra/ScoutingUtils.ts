import { StatisticheGiocatore } from "../types/GiocatoreTypes";

const TOP_CLUBS = ["ATALANTA", "BOLOGNA", "COMO", "JUVENTUS", "INTER", "MILAN", "NAPOLI", "ROMA"];

const ROLE_WEIGHTS: Record<string, number> = {
    P: 1.0,
    D: 1.2,
    C: 1.8,
    A: 3.5
};

export const calculateScouting = (
    giocatori: StatisticheGiocatore[],
    teamPlayers: StatisticheGiocatore[],
    allTeams: string[]
) => {
    // 1. BUDGET REALE (Solo IN LISTA)
    const powerRanking = allTeams.map(teamName => {
        const activePlayers = giocatori.filter(g => g.FantaSquadra === teamName && !g.Fl);
        const spent = activePlayers.reduce((acc, g) => acc + (Number(g.Costo) || 0), 0);
        return { teamName, budget: 500 - spent };
    });

    const mioTeamName = teamPlayers[0]?.FantaSquadra;
    const mioBudget = powerRanking.find(t => t.teamName === mioTeamName)?.budget || 0;

    // 2. ANALISI DELLA DOMANDA
    const domandaPerRuolo: Record<string, number> = { P: 0, D: 0, C: 0, A: 0 };
    allTeams.forEach(team => {
        const teamFlops = giocatori.filter(g => 
            g.FantaSquadra === team && (g.Fl || Number(g.Fm) < 6 || Number(g.Mv) < 6)
        );
        teamFlops.forEach(f => {
            if (domandaPerRuolo[f.R] !== undefined) domandaPerRuolo[f.R]++;
        });
    });

    // 3. TAGLI
    const daTagliare = teamPlayers
        .filter(p => p.Fl || (Number(p.Mv) < 6 || Number(p.Fm) < 6))
        .sort((a, b) => (a.Fl ? -1 : 1));

    const iMieiRuoliNecessari = Array.from(new Set(daTagliare.map(p => p.R)));

    // 4. RANKING E PREZZI (Fix toUpperCase)
    const liberi = giocatori
        .filter(g => (!g.FantaSquadra || g.FantaSquadra === "-" || g.FantaSquadra === "LIBERI") && !g.Fl)
        .map(g => {
            let score = Number(g.Fm) || 0;
            // FIX: Controllo esistenza Squadra prima di toUpperCase()
            const squadraPulita = g.Squadra?.toUpperCase() || "";
            if (TOP_CLUBS.includes(squadraPulita)) score += 0.5;
            return { ...g, dynamicScore: score };
        })
        .sort((a, b) => b.dynamicScore - a.dynamicScore);

    const rankingPerRuolo: Record<string, number> = { P: 0, D: 0, C: 0, A: 0 };

    const suggerimenti = liberi
        .filter(g => iMieiRuoliNecessari.includes(g.R))
        .map(g => {
            rankingPerRuolo[g.R]++;
            const position = rankingPerRuolo[g.R];

            // MOLTIPLICATORE ELITE (1° = 2.8x, 2° = 2.1x, 3° = 1.6x, Altri = 0.8x)
            let eliteMultiplier = position === 1 ? 2.8 : position === 2 ? 2.1 : position === 3 ? 1.6 : 0.8;

            const offertaBuona = liberi.filter(l => l.R === g.R && Number(l.Fm) >= 6.5).length || 1;
            const pressioneMercato = (domandaPerRuolo[g.R] / offertaBuona);

            const basePrice = (g.dynamicScore * ROLE_WEIGHTS[g.R]);
            const scarcityIndex = Math.max(1, pressioneMercato * 0.4);
            
            let stimaPrezzo = Math.round(basePrice * scarcityIndex * eliteMultiplier);

            // Aggiustamento basato sui budget della lega
            const budgetAltissimi = powerRanking.filter(p => p.budget > 100).length;
            if (position <= 3) stimaPrezzo += (budgetAltissimi * 5);

            return {
                ...g,
                rankNelRuolo: position,
                stimaPrezzo,
                livelloHype: position <= 3 ? "ASTA FOLLIA" : "POSSIBILE AFFARE",
                convenienza: mioBudget >= stimaPrezzo ? "ALTA" : "RISCHIOSA"
            };
        })
        .filter(g => Number(g.Pv) >= 5 || TOP_CLUBS.includes(g.Squadra?.toUpperCase() || ""))
        .sort((a, b) => b.dynamicScore - a.dynamicScore);

    return { daTagliare, suggerimenti };
};