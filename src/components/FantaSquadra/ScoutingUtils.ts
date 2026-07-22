import { StatisticheGiocatore } from "../../types/GiocatoreTypes";

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
    allTeams: string[],
    budgetTotale: number = 500
) => {
    // 1. BUDGET REALE (Solo IN LISTA)
    const powerRanking = allTeams.map(teamName => {
        const activePlayers = giocatori.filter(g => g.FantaSquadra === teamName && !g.fl);
        const spent = activePlayers.reduce((acc, g) => acc + (Number(g.costo) || 0), 0);
        return { teamName, budget: budgetTotale - spent };
    });

    const mioTeamName = teamPlayers[0]?.FantaSquadra;
    const mioBudget = powerRanking.find(t => t.teamName === mioTeamName)?.budget || 0;

    // 2. ANALISI DELLA DOMANDA
    const domandaPerRuolo: Record<string, number> = { P: 0, D: 0, C: 0, A: 0 };
    allTeams.forEach(team => {
        const teamFlops = giocatori.filter(g =>
            g.FantaSquadra === team && (g.fl || Number(g.fm) < 6 || Number(g.mv) < 6)
        );
        teamFlops.forEach(f => {
            if (domandaPerRuolo[f.r] !== undefined) domandaPerRuolo[f.r]++;
        });
    });

    // 3. TAGLI
    const daTagliare = teamPlayers
        .filter(p => p.fl || (Number(p.mv) < 6 || Number(p.fm) < 6))
        .sort((a) => (a.fl ? -1 : 1));

    const iMieiRuoliNecessari = Array.from(new Set(daTagliare.map(p => p.r)));

    // 4. RANKING E PREZZI
    const liberi = giocatori
        .filter(g => (!g.FantaSquadra || g.FantaSquadra === "-" || g.FantaSquadra === "LIBERI") && !g.fl)
        .map(g => {
            let score = Number(g.fm) || 0;
            const squadraPulita = g.squadra?.toUpperCase() || "";
            if (TOP_CLUBS.includes(squadraPulita)) score += 0.5;
            return { ...g, dynamicScore: score };
        })
        .sort((a, b) => b.dynamicScore - a.dynamicScore);

    const rankingPerRuolo: Record<string, number> = { P: 0, D: 0, C: 0, A: 0 };

    const suggerimenti = liberi
        .filter(g => iMieiRuoliNecessari.includes(g.r))
        .map(g => {
            rankingPerRuolo[g.r]++;
            const position = rankingPerRuolo[g.r];

            const eliteMultiplier = position === 1 ? 2.8 : position === 2 ? 2.1 : position === 3 ? 1.6 : 0.8;

            const offertaBuona = liberi.filter(l => l.r === g.r && Number(l.fm) >= 6.5).length || 1;
            const pressioneMercato = (domandaPerRuolo[g.r] / offertaBuona);

            const basePrice = (g.dynamicScore * ROLE_WEIGHTS[g.r]);
            const scarcityIndex = Math.max(1, pressioneMercato * 0.4);

            let stimaPrezzo = Math.round(basePrice * scarcityIndex * eliteMultiplier);

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
        .filter(g => Number(g.pv) >= 5 || TOP_CLUBS.includes(g.squadra?.toUpperCase() || ""))
        .sort((a, b) => b.dynamicScore - a.dynamicScore);

    return { daTagliare, suggerimenti };
};