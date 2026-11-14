// NBA Center Lovelace card — reads only Home Assistant entity state. Lit is bundled locally.
import { LitElement, css, html } from "lit";

const BUILD_VERSION = "2026.11.14.9";

const VIEWS = [
  { id: "home", label: "HOME" },
  { id: "scores", label: "SCORES" },
  { id: "teams", label: "TEAMS" },
  { id: "players", label: "PLAYERS" },
  { id: "stats", label: "STANDINGS" },
];
const LEADERS = {
  points: ["POINTS", "marque"],
  rebounds: ["REBONDS", "rebon"],
  assists: ["PASSES", "passe"],
  steals: ["INTERCEPTIONS", "inter"],
  blocks: ["CONTRES", "contr"],
};
const DEFAULT_ENTITIES = {
  games: "sensor.nba_matchs_du_jour",
  status: "sensor.nba_etat_du_flux_principal",
  east: "sensor.nba_classement_est",
  west: "sensor.nba_classement_ouest",
  points: "sensor.nba_meilleurs_marqueurs",
  rebounds: "sensor.nba_meilleurs_rebondeurs",
  assists: "sensor.nba_meilleurs_passeurs",
  steals: "sensor.nba_meilleurs_intercepteurs",
  blocks: "sensor.nba_meilleurs_contreurs",
};
const localDateISO = (date = new Date(), timeZone) => {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
};
const shiftDateISO = (isoDate, days) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12));
  return [date.getUTCFullYear(), String(date.getUTCMonth() + 1).padStart(2, "0"), String(date.getUTCDate()).padStart(2, "0")].join("-");
};
const value = (v, fallback = "—") => v === null || v === undefined || v === "" ? fallback : String(v);
const fmtDate = (v) => {
  if (!v) return "Date à confirmer";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? value(v) : new Intl.DateTimeFormat(undefined, {
    weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(d);
};

class NBACenterCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _active: { state: true },
    _filter: { state: true },
    _search: { state: true },
    _selectedDate: { state: true }, _calendarGames: { state: true },
    _calendarLoading: { state: true }, _calendarError: { state: true }, _calendarStale: { state: true },
    _overlayGame: { state: true }, _overlayDetails: { state: true },
    _overlayLoading: { state: true }, _overlayError: { state: true },
    _showAllPlays: { state: true }, _scoringOnly: { state: true },
    _teamSearch: { state: true }, _teamConference: { state: true },
    _teamOverlay: { state: true }, _teamRoster: { state: true }, _teamRosterLoading: { state: true }, _teamRosterError: { state: true }, _teamRequest: { state: true },
    _playerSearch: { state: true }, _playerOverlay: { state: true }, _playerData: { state: true }, _playerLoading: { state: true }, _playerError: { state: true }, _playerRequest: { state: true }, _playerSelectedSeason: { state: true }, _playerSelectedPlayoffSeason: { state: true }, _playerPlayoffLoading: { state: true },
    _playoffData: { state: true }, _playoffLoading: { state: true }, _playoffError: { state: true }, _playoffSeason: { state: true }, _playoffRequest: { state: true },
    _standingSeason: { state: true }, _standingPhase: { state: true }, _seasonStandings: { state: true }, _seasonStandingsLoading: { state: true }, _seasonStandingsError: { state: true }, _seasonStandingsRequest: { state: true },
  };

  static styles = css`
    :host{display:block;color:var(--primary-text-color);font-family:var(--paper-font-body1_-_font-family,Roboto,sans-serif)}
    *{box-sizing:border-box}
    .shell{overflow:hidden;border:1px solid var(--divider-color);border-radius:18px;background:#090e17;color:#f4f6fb;box-shadow:0 12px 32px #0005}
    .hero{position:relative;padding:24px 26px 20px;background:radial-gradient(ellipse at 88% 0%,#2c4772 0,transparent 48%),linear-gradient(120deg,#14233a,#090e17 75%);border-bottom:1px solid #ffffff14}
    .hero:after{content:"";position:absolute;right:24px;bottom:-1px;width:92px;height:3px;background:#e7b54d}
    .eyebrow{color:#e8b74e;font-size:10px;font-weight:800;letter-spacing:.24em}
    h1{margin:8px 0 4px;font-size:clamp(25px,4vw,36px);line-height:1;letter-spacing:-.045em;font-weight:950}
    .subtitle{color:#aab6ca;font-size:12px}
    .meta{display:flex;gap:8px;align-items:center;margin-top:14px;color:#aab6ca;font-size:10px;text-transform:uppercase;letter-spacing:.1em}
    .data-health{padding:4px 7px;border-radius:999px;font-size:9px;font-weight:900;letter-spacing:.06em}.data-health.healthy{color:#83d8a9;background:#83d8a91a}.data-health.degraded{color:#ffca70;background:#ffca701a}
    .data-warning{margin-top:12px;padding:9px 11px;border:1px solid #8b6838;border-radius:9px;background:#8b68381c;color:#f2d19a;font-size:10px;line-height:1.5}
    .dot{width:7px;height:7px;border-radius:50%;background:#e8b74e;box-shadow:0 0 0 4px #e8b74e22}
    nav{display:flex;gap:5px;overflow-x:auto;padding:10px 12px;background:#0c1421;border-bottom:1px solid #ffffff12;scrollbar-width:thin}
    button{border:0;border-radius:9px;background:transparent;color:#8997ad;padding:10px 14px;min-width:76px;cursor:pointer;font:inherit;font-size:10px;font-weight:800;letter-spacing:.09em;white-space:nowrap}
    button:hover{color:#fff;background:#ffffff0a}
    button[aria-selected=true]{background:#1c2d47;color:#f2c45f;box-shadow:inset 0 0 0 1px #d9a83d55}
    button:focus-visible,input:focus-visible{outline:2px solid #f2c45f;outline-offset:2px}
    main{padding:22px;min-height:260px;background:linear-gradient(180deg,#0a101a,#0c1420)}
    .head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 16px}
    h2{margin:0;font-size:18px;letter-spacing:-.025em}
    h3{margin:0;font-size:12px;letter-spacing:.1em;color:#dce3ef}
    .muted{color:#8f9db2;font-size:11px}
    .pill{border:1px solid #2c3b52;border-radius:999px;color:#aab6ca;padding:5px 9px;font-size:9px;font-weight:800;letter-spacing:.08em}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .panel{min-width:0;border:1px solid #25344a;border-radius:13px;padding:14px;background:linear-gradient(145deg,#121e2e,#0e1725)}
    .panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
    .accent{color:#f0c05b}
    .empty{border:1px dashed #33445e;border-radius:13px;padding:20px;background:#101a29}
    .playoff-season{max-width:132px;border:1px solid #2b3b52;border-radius:9px;background:#101a29;color:#f2c45f;padding:9px;font:inherit;font-size:11px;font-weight:800}.playoff-summary{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 18px}.playoff-summary span{border:1px solid #2c3b52;border-radius:999px;padding:6px 10px;color:#aab6ca;font-size:9px;font-weight:800;letter-spacing:.08em}.playoff-conference{margin-top:22px}.playoff-conference-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.playoff-conference-title h2{font-size:16px;color:#f2c45f}.playoff-round{margin:14px 0}.playoff-round .grid{grid-template-columns:repeat(2,minmax(0,1fr))}.playoff-series{padding:12px}.playoff-series-button{display:block;width:100%;min-width:0;text-align:left;color:inherit;cursor:pointer;transition:border-color .15s,transform .15s}.playoff-series-button:hover{border-color:#bd9448;transform:translateY(-1px);background:linear-gradient(145deg,#17263a,#101a29)}.playoff-series-button:focus-visible{outline:2px solid #f2c45f;outline-offset:2px}.playoff-series-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}.playoff-series-round{color:#9eabc0;font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.playoff-team{display:grid;grid-template-columns:25px 28px minmax(0,1fr) 28px;align-items:center;gap:8px;padding:9px 2px;border-bottom:1px solid #ffffff12;font-size:12px}.playoff-team:last-of-type{border-bottom:0}.playoff-team-logo{width:25px;height:25px;max-width:25px;max-height:25px;object-fit:contain}.playoff-seed{color:#8291a7;font-size:10px;font-weight:800}.playoff-wins{text-align:center;color:#f2c45f;font-size:17px;font-weight:950}.playoff-winner strong{color:#75d6a0}.playoff-series-bottom{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:9px;padding-top:9px;border-top:1px solid #ffffff12;color:#8190a7;font-size:8px;letter-spacing:.06em}.playoff-series-bottom strong{color:#f2c45f;font-size:8px;white-space:nowrap}.playoff-warning{margin-top:8px;color:#e8b75a;font-size:10px;line-height:1.5}.playoff-series-detail-summary{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}.playoff-series-detail-summary>strong{color:#f2c45f;font-size:20px}.playoff-game-list{display:grid;gap:8px}.playoff-game-row{display:grid;grid-template-columns:75px minmax(0,1fr) minmax(0,1fr) 12px;align-items:center;gap:8px;width:100%;min-width:0;padding:11px;border:1px solid #27364b;border-radius:10px;background:#101a29;color:#e9eef7;text-align:left;cursor:pointer}.playoff-game-row:hover{border-color:#bd9448;background:#17263a}.playoff-game-row:disabled{opacity:.65;cursor:default}.playoff-game-number{color:#f2c45f;font-size:9px;font-weight:900}.playoff-game-number small{display:block;margin-top:4px;color:#8796ac;font-size:8px;font-weight:500}.playoff-game-team{display:grid;grid-template-columns:23px minmax(0,1fr) auto;align-items:center;gap:5px;min-width:0}.playoff-game-team img{width:22px;height:22px;object-fit:contain}.playoff-game-team strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px}.playoff-game-team b{font-size:14px;color:#aab6ca}.playoff-game-row.winner-away .playoff-game-team:nth-of-type(2) strong,.playoff-game-row.winner-home .playoff-game-team:nth-of-type(3) strong{color:#75d6a1}.playoff-game-row.winner-away .playoff-game-team:nth-of-type(2) b,.playoff-game-row.winner-home .playoff-game-team:nth-of-type(3) b{color:#f2c45f;font-size:17px}.playoff-winner-label{grid-column:2 / -1;color:#75d6a1;font-size:7px;font-weight:900;letter-spacing:.1em}.playoff-game-open{color:#f2c45f;font-size:20px}.playoff-series-overlay .overlay-panel{width:min(620px,100%)}.playoff-series-overlay .overlay-head h2{font-size:14px}.playoff-warning{margin-top:8px;color:#e8b75a;font-size:10px;line-height:1.5}.playoff-conference .empty{margin-top:8px}
    .empty strong{display:block;margin-bottom:7px;color:#e9edf5;font-size:13px}
    .empty p{margin:0;color:#9eabc0;font-size:11px;line-height:1.65}
    .game-list,.team-list,.leader-list{display:grid;gap:9px}
    .game{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:12px;border:1px solid #27364b;border-radius:11px;background:#101a29}
    .game-main{min-width:0;display:grid;gap:8px}
    .game-date{color:#8e9cb1;font-size:10px}
    .matchup{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:9px}
    .side{min-width:0;display:flex;align-items:center;gap:7px}
    .side.away{justify-content:flex-end;text-align:right}
    .team-name{min-width:0;font-size:12px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .logo{width:25px;height:25px;object-fit:contain;flex:0 0 auto}
    .score{font-size:17px;font-weight:900;font-variant-numeric:tabular-nums;white-space:nowrap}
    .pending{color:#8f9db2;font-size:11px}
    .status{min-width:75px;text-align:right;color:#9eabc0;font-size:10px;line-height:1.45}
    .live{color:#ff777d;font-weight:900}
    .filters{display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin-bottom:14px}
    .chip{min-width:0;padding:7px 10px;border:1px solid #2b3b52;color:#a6b2c6;border-radius:999px;font-size:9px}
    .chip[aria-pressed=true]{color:#f5c45e;background:#1a2b43;border-color:#876b35}
    input{min-width:140px;flex:1;border:1px solid #2b3b52;border-radius:9px;background:#0c1522;color:#f4f6fb;padding:9px 11px;font:inherit;font-size:11px}
    .team-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #ffffff10}
    .team-row:last-child{border-bottom:0;padding-bottom:0}
    .team-row:first-child{padding-top:0}\n    .catalog-team{min-width:0;cursor:pointer;transition:border-color .15s,transform .15s}.catalog-team:hover{border-color:#bd9448;transform:translateY(-1px)}.catalog-team:focus-visible{outline:2px solid #f2c45f;outline-offset:2px}.catalog-favorite-note{margin-top:8px}
    .large{width:34px;height:34px}
    .team-info{min-width:0;flex:1}
    .team-info strong{display:block;font-size:12px}
    .team-info small{display:block;margin-top:3px;color:#8f9db2;font-size:10px}
    .record{text-align:right;font-size:11px;font-weight:800;color:#dce3ef}
    .recent{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
    .form-chip{display:flex;align-items:center;gap:5px;padding:5px 7px;border:1px solid #2b3b52;border-radius:7px;color:#aab6ca;font-size:9px;min-width:0;cursor:pointer;text-align:left}.form-chip:hover{border-color:#bd9448;background:#1b2a40}.form-chip:disabled{opacity:.6;cursor:default}
    .form-chip strong{font-size:9px}
    .form-chip.win strong{color:#72d5a0}
    .form-chip.loss strong{color:#ff8b91}
    .form-chip.unknown strong{color:#aab6ca}
    .leader{display:grid;grid-template-columns:24px 34px minmax(0,1fr) auto;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #ffffff10}
    .leader:last-child{border-bottom:0}
    .leader-button{width:100%;min-width:0;margin:0;padding:8px 0;border:0;border-radius:7px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
    .leader-button:hover{background:#1b2a40}
    .leader-button:active{transform:translateY(1px)}
    .leader-button:focus-visible{outline:2px solid #f2c45f;outline-offset:2px}
    .rank{color:#8190a7;font-size:10px;font-weight:900}
    .avatar{width:32px;height:32px;object-fit:cover;border-radius:50%;background:#25344a}
    .player{min-width:0;font-size:11px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .player small{display:block;color:#8f9db2;font-size:9px;margin-top:3px;font-weight:500}
    .stat{color:#f2c45f;font-size:13px;font-weight:900;font-variant-numeric:tabular-nums}
    .standing-team-button{display:inline-flex;align-items:center;gap:7px;padding:2px 4px;margin:-2px 0;border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;font-weight:800;cursor:pointer;text-align:left}
    .standing-team-button:hover{background:#1b2a40;color:#f2c45f}
    .standing-team-button:focus-visible{outline:2px solid #f2c45f;outline-offset:2px}
    .standing-streak{text-align:right;color:#f2c45f;font-weight:900;font-variant-numeric:tabular-nums}
    .standing-team-button img{display:block;width:28px;height:28px;max-width:28px;max-height:28px;object-fit:contain;flex:0 0 28px}
    .table-wrap{overflow-x:auto}
    table{width:100%;border-collapse:collapse;font-size:10px;white-space:nowrap}
    th{text-align:left;color:#8190a7;font-size:9px;letter-spacing:.08em;padding:8px 7px;border-bottom:1px solid #314158}
    td{padding:9px 7px;border-bottom:1px solid #ffffff0e;color:#d7deea}
    td:first-child{color:#e9bb57;font-weight:900}
    .date-nav{display:flex;align-items:center;gap:7px;margin-bottom:13px;flex-wrap:wrap}
    .date-nav button{border:1px solid #2b3b52;background:#101a29;color:#dce3ef;min-width:40px}
    .date-label{font-weight:800;color:#f2c45f;font-size:12px;margin-right:auto}
    .game{cursor:pointer;transition:border-color .15s,transform .15s}
    .game:hover{border-color:#bd9448;transform:translateY(-1px)}
    .game:focus-visible{outline:2px solid #f2c45f;outline-offset:2px}
    .overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px;background:#02060dcc;backdrop-filter:blur(5px)}
    .overlay-panel{width:min(720px,100%);max-height:90vh;overflow:auto;border:1px solid #34465f;border-radius:17px;background:#0d1726;color:#f4f6fb;box-shadow:0 24px 70px #000b}
    .overlay-head{display:flex;justify-content:space-between;align-items:center;padding:17px 19px;border-bottom:1px solid #ffffff16}
    .overlay-body{padding:18px}.overlay-teams{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px;text-align:center}
    .overlay-team img{width:54px;height:54px;object-fit:contain}.overlay-team strong{display:block;margin-top:7px;font-size:12px}
    .overlay-score{font-size:24px;font-weight:950;color:#f2c45f}.overlay-actions{display:flex;align-items:center;gap:7px}.overlay-refresh{min-width:0;padding:8px 10px;border:1px solid #34465f;color:#e8bb58;font-size:9px}.overlay-refresh:disabled{opacity:.55;cursor:wait}.overlay-close{min-width:38px;padding:8px;border:1px solid #34465f}
    .game-leaders-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}.game-leader-card{padding:12px;min-width:0}.game-leader-card .panel-head{margin-bottom:7px}.game-leader-card .panel-head h3{font-size:12px;letter-spacing:.08em}.game-leader{display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:8px;padding:8px 0;border-top:1px solid #ffffff12}.game-leader-category{color:#e8bb58;font-size:9px;font-weight:900;letter-spacing:.08em}.game-leader-name{font-size:11px;font-weight:750;overflow-wrap:anywhere}.game-leader-value{color:#f2c45f;font-size:13px;font-weight:950;font-variant-numeric:tabular-nums}.game-leaders-empty{color:#91a0b5;font-size:10px;padding:7px 0}@media(max-width:760px){.playoff-round .grid{grid-template-columns:1fr}}
    @media(max-width:620px){.playoff-game-row{grid-template-columns:62px minmax(0,1fr) minmax(0,1fr) 10px;gap:5px;padding:9px}.playoff-game-team{grid-template-columns:20px minmax(0,1fr) auto;gap:4px}.playoff-game-team img{width:19px;height:19px}.playoff-game-team strong{font-size:9px}.game-leaders-grid{grid-template-columns:1fr;gap:8px}.game-leader-card{padding:10px}.game-leader{padding:6px 0}}
    .quarter-score-panel{margin-top:12px}.quarter-score-panel table{width:100%;border-collapse:collapse;font-size:10px}.quarter-score-panel th,.quarter-score-panel td{padding:9px 8px;text-align:center;border-bottom:1px solid #ffffff10;font-variant-numeric:tabular-nums}.quarter-score-panel th:first-child,.quarter-score-panel td:first-child{text-align:left}.quarter-score-panel td:last-child{color:#f2c45f;font-weight:900}
    .boxscore-section{margin-top:22px}.section-kicker{color:#e8b74e;font-size:9px;font-weight:900;letter-spacing:.2em;margin-bottom:5px}.boxscore-section>h3{margin:0 0 12px}
    .boxscore-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.boxscore-panel{padding:10px;min-width:0}.player-table-wrap{overflow-x:auto;max-width:100%}.player-table{width:100%;border-collapse:collapse;font-size:10px;white-space:nowrap}.player-table th,.player-table td{padding:8px 6px;text-align:right;border-bottom:1px solid #ffffff10;font-variant-numeric:tabular-nums}.player-table th:first-child,.player-table td:first-child{text-align:left;position:sticky;left:0;background:#111d2c}.player-table th{color:#94a5bc;font-size:8px;letter-spacing:.08em}.player-table tr.starter td{background-color:#17263a}.player-table tr.dnp td{color:#75849a}
    .playbyplay-panel{margin-top:12px}.play-controls{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px}
    .play-list{list-style:none;padding:0;margin:0;display:grid;gap:5px}
    .play-row{display:grid;grid-template-columns:52px minmax(0,1fr) auto;gap:10px;align-items:center;padding:8px 9px;border:1px solid #ffffff0d;border-radius:8px;background:#0d1725}
    .play-row.scoring{border-color:#8a6b35;background:#1b2430}
    .play-clock{font-size:10px;font-weight:900;color:#f0c05b}.play-clock small{display:block;color:#94a5bc;font-size:9px;margin-top:3px}
    .play-copy{font-size:10px;line-height:1.45;color:#dce3ef}.play-copy small{display:block;color:#f0c05b;font-size:8px;font-weight:900;letter-spacing:.1em;margin-top:3px}
    .play-score{font-size:10px;font-weight:900;color:#aab6ca;font-variant-numeric:tabular-nums}
    .play-more{display:block;margin:10px auto 0;border:1px solid #2b3b52;background:#101a29;color:#e8bb58}.player-cell{display:flex;align-items:center;gap:6px;min-width:112px;white-space:normal}.player-cell img{width:25px;height:25px;object-fit:contain;border-radius:50%}.player-cell small{display:block;color:#91a0b5;font-size:8px;margin-top:2px}.team-stats-panel{margin-top:12px}.team-stats-panel table{width:100%;border-collapse:collapse;font-size:10px}.team-stats-panel th,.team-stats-panel td{padding:8px;text-align:right;border-bottom:1px solid #ffffff10}.team-stats-panel th:first-child,.team-stats-panel td:first-child{text-align:left;color:#aab6ca}
    @media(max-width:620px){.overlay{padding:8px}.overlay-panel{max-height:94vh}.boxscore-grid{grid-template-columns:1fr}.player-table th,.player-table td{padding:7px 5px}}
    .team-roster-heading{display:flex;align-items:center;gap:12px}.roster-list{display:grid;gap:7px}.roster-player{display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:10px;padding:9px;border:1px solid #ffffff10;border-radius:10px;background:#101a29}.roster-headshot{width:40px;height:40px;object-fit:cover;border-radius:50%;background:#25344a}.roster-placeholder{background:#25344a}.roster-player-info{min-width:0}.roster-player-button{width:100%;text-align:left;color:inherit;font:inherit;cursor:pointer}.roster-player-button:hover,.roster-player-button:focus-visible{background:#1c2a40;border-color:#8da9d8;outline:none}.player-profile-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-top:7px}.player-profile-grid>div{padding:6px}.player-stat-grid{gap:5px;margin:6px 0}.player-stat-grid>div{padding:6px}.player-stat-grid strong{font-size:13px}.player-season-highlights{grid-template-columns:repeat(3,minmax(0,1fr));margin:3px 0 8px}.player-season-highlights>div{padding:5px}.player-gamelog{margin-top:9px}.player-team-logo{width:28px;height:28px;object-fit:contain;flex:0 0 auto}.player-game-list{display:grid;gap:0}.player-game-row{display:grid;grid-template-columns:minmax(0,1fr);gap:5px;align-items:center;padding:8px 2px;border-top:1px solid #ffffff12}.player-game-meta{display:flex;align-items:center;gap:7px;min-width:0}.player-game-meta strong{color:#f2c45f;white-space:nowrap;font-size:9px}.player-game-meta span{color:#c6d0df;text-align:left;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.player-game-stats{display:flex;flex-wrap:nowrap;gap:4px;margin:0;color:#c6d0df;font-size:9px;line-height:1.2;min-width:0}.player-game-stat{display:inline-flex;gap:2px;align-items:center;padding:4px 3px;border-radius:5px;background:#ffffff09;white-space:nowrap;flex:1 1 0;justify-content:center;min-width:0}.player-game-stat b{font-size:8px}.player-game-stat b{color:#e8bb58;font-size:9px;letter-spacing:.04em}.player-profile-grid>div{display:flex;flex-direction:column;gap:3px;padding:8px;background:#ffffff08;border-radius:8px}.player-profile-grid small{color:#8290a5;font-size:9px;letter-spacing:.07em}.player-profile-grid strong{font-size:13px;color:#eef3fb}.team-season-summary{margin-bottom:14px}.roster-player-info strong{display:block;font-size:11px}.roster-player-info small{display:block;color:#91a0b5;font-size:9px;margin-top:3px}.roster-player-info .roster-injury{color:#ffb66d}.roster-number{text-align:right}.roster-number strong{display:block;color:#f2c45f;font-size:12px}.roster-number small{display:block;color:#91a0b5;font-size:8px;margin-top:3px}.team-roster-overlay{width:min(620px,100%)}.team-roster-overlay .overlay-body{max-height:calc(90vh - 86px);overflow-y:auto;overscroll-behavior:contain;scroll-behavior:smooth}.catalog-favorite-tracking{display:grid;gap:5px;margin-top:10px;padding-top:9px;border-top:1px solid #ffffff12;color:#aab6ca;font-size:9px;line-height:1.4;letter-spacing:.04em}
    .player-result{display:grid;grid-template-columns:24px 38px minmax(0,1fr) auto;align-items:center;gap:9px;width:100%;padding:9px 7px;border-bottom:1px solid #ffffff10;text-align:left;color:inherit;border-radius:8px}.player-result:hover{background:#1b2a40}.player-result:last-child{border-bottom:0}.player-profile-overlay{width:min(760px,100%)}.player-profile-overlay .overlay-body{max-height:calc(90vh - 80px);overflow:auto;overscroll-behavior:contain}.player-stat-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:10px 0}.player-stat-grid>div{padding:8px;border-radius:8px;background:#ffffff08}.player-stat-grid small{display:block;color:#91a0b5;font-size:8px;letter-spacing:.08em}.player-stat-grid strong{display:block;margin-top:4px;color:#f2c45f;font-size:14px}.player-gamelog{margin-top:14px}.player-gamelog table{min-width:520px}.player-gamelog td:not(:first-child),.player-gamelog th:not(:first-child){text-align:right}\n    .footer{display:flex;justify-content:space-between;gap:10px;padding:12px 22px;color:#738199;border-top:1px solid #ffffff12;font-size:9px;letter-spacing:.06em}
    @media(max-width:620px){.player-game-meta{font-size:10px}.player-game-stats{font-size:9px}.player-profile-grid small{font-size:8px}.player-profile-grid strong{font-size:12px}.player-stat-grid small{font-size:7px}.player-stat-grid strong{font-size:12px}.hero{padding:20px 17px 17px}main{padding:15px}nav{padding:8px 7px}button{min-width:66px;padding:9px 10px}.grid{grid-template-columns:1fr}.game{grid-template-columns:1fr;gap:7px}.status{text-align:left}.matchup{gap:6px}.team-name{font-size:10px}.score{font-size:15px}.footer{padding:11px 15px}.meta{margin-top:11px}}
  `;

  constructor() {
    super();
    this._active = "home";
    this._filter = "all";
    this._search = "";
    this._teamSearch = "";
    this._teamConference = "all";
    this._teamOverlay = null;
    this._teamRoster = null;
    this._teamRosterLoading = false;
    this._teamRosterError = "";
    this._teamRequest = 0;
    this._selectedPlayer = null;
    this._playerSearch = ""; this._playerOverlay = null; this._playerData = null; this._playerLoading = false; this._playerError = ""; this._playerSelectedSeason = ""; this._playerSelectedPlayoffSeason = ""; this._playerPlayoffLoading = false; this._playerPlayoffRequest += 1; this._playerPlayoffRequest = 0; this._playerRequest = 0;
    this._selectedDate = localDateISO();
    this._calendarGames = []; this._calendarLoading = false; this._calendarError = ""; this._calendarStale = false; this._calendarStaleError = ""; this._calendarRequest = 0; this._calendarInitialized = false;
    this._overlayGame = null; this._overlayDetails = null; this._overlayRequest = 0;
    this._overlayLoading = false; this._overlayError = "";
    this._playoffData = null; this._playoffLoading = false; this._playoffError = ""; this._playoffSeason = 2027; this._playoffRequest = 0;
    this._standingSeason = 2027; this._standingPhase = "regular"; this._seasonStandings = null; this._seasonStandingsLoading = false; this._seasonStandingsError = ""; this._seasonStandingsRequest = 0;
    this._standingsResultsCache = new Map(); this._playoffResultsCache = new Map();
    this._seriesOverlay = null;
    this._config = {};
  }

  setConfig(config) {
    if (!config || typeof config !== "object" || Array.isArray(config)) {
      throw new Error("Configuration NBA Center invalide : un objet YAML est attendu.");
    }
    this._config = {
      title: "NBA CENTER",
      subtitle: "Your league. Your teams. One center.",
      ...config,
      entities: { ...DEFAULT_ENTITIES, ...(config.entities ?? {}) },
    };
  }

  getCardSize() { return 8; }
  get _states() { return this.hass?.states ?? {}; }
  _state(id) { return id ? this._states[id] : undefined; }
  _find(predicate) { return Object.values(this._states).find(predicate); }

  _entity(key, predicate) {
    return this._state(this._config.entities?.[key]) ?? this._find(predicate);
  }

  _dataStatus() {
    return this._entity("status", (state) => state.attributes?.scope === "scoreboard, standings, calendriers favoris, classements et catalogue des équipes");
  }

  _games() {
    const state = this._entity("games", (s) => Array.isArray(s.attributes?.games) && !s.attributes?.team_id);
    return { state, rows: state?.attributes?.games ?? [] };
  }

  _standings(slug) {
    const state = this._entity(slug, (s) => {
      if (!Array.isArray(s.attributes?.standings)) return false;
      const id = s.entity_id.toLowerCase();
      return slug === "east" ? id.includes("classement_est") || id.includes("eastern") :
        id.includes("classement_ouest") || id.includes("western");
    });
    return { state, rows: state?.attributes?.standings ?? [] };
  }

  _leaders(key, postseason = false) {
    const fragment = LEADERS[key][1];
    const state = this._entity(postseason ? `playoff_${key}` : key, (s) => {
      const category = (s.attributes?.category ?? "").toLowerCase();
      return Array.isArray(s.attributes?.leaders) && category.includes(fragment) &&
        (postseason ? category.startsWith("playoffs ") : !category.startsWith("playoffs "));
    });
    return { state, rows: state?.attributes?.leaders ?? [] };
  }

  _teams() {
    const teams = {};
    for (const state of Object.values(this._states)) {
      const attrs = state.attributes ?? {};
      if (!state.entity_id.startsWith("sensor.") || !attrs.team_id) continue;
      const id = String(attrs.team_id);
      const friendly = (attrs.friendly_name ?? state.entity_id).toLowerCase();
      const team = teams[id] ??= {
        id,
        name: (attrs.friendly_name ?? id).replace(/ (dernier match|prochain match|match en cours|derniers matchs)$/i, ""),
        logo: attrs.team_logo,
      };
      team.logo ??= attrs.team_logo;
      if (friendly.includes("dernier match")) team.last = attrs;
      if (friendly.includes("prochain match")) team.next = attrs;
      if (friendly.includes("match en cours")) team.live = attrs;
      if (Array.isArray(attrs.games)) team.recent = attrs.games;
    }
    return Object.values(teams).sort((a,b) => a.name.localeCompare(b.name));
  }

  _teamsCatalog() {
    const state = this._find((s) => s.entity_id?.startsWith("sensor.") &&
      Array.isArray(s.attributes?.teams) && s.attributes?.expected_count === 30);
    const catalog = state?.attributes ?? {};
    const favorites = new Map(this._teams().map((team) => [String(team.id), team]));
    return {
      state,
      complete: Boolean(catalog.complete),
      count: Number(catalog.count ?? catalog.teams?.length ?? 0),
      teams: (catalog.teams ?? []).map((team) => ({
        ...team,
        favorite: favorites.has(String(team.id)),
        favoriteData: favorites.get(String(team.id)),
      })).sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")),
    };
  }

  async _openTeam(team) {
    const request = ++this._teamRequest;
    this._teamOverlay = team;
    this._teamRoster = null;
    this._teamRosterError = "";
    this._teamRosterLoading = true;
    try {
      const roster = await this.hass.callWS({ type: "nba/team_roster", team_id: String(team.id) });
      if (request !== this._teamRequest || String(this._teamOverlay?.id) !== String(team.id)) return;
      this._teamRoster = roster;
    } catch (err) {
      if (request !== this._teamRequest || String(this._teamOverlay?.id) !== String(team.id)) return;
      this._teamRosterError = err?.message ?? "Effectif indisponible.";
    } finally {
      if (request === this._teamRequest) this._teamRosterLoading = false;
    }
  }

  _closeTeamOverlay() {
    this._teamRequest += 1;
    this._teamOverlay = null;
    this._teamRoster = null;
    this._teamRosterLoading = false;
    this._teamRosterError = "";
    this._selectedPlayer = null;
  }

  _teamRosterPanel() {
    const players = this._teamRoster?.players ?? [];
    return html`
      <div class="overlay" @click=${(event) => { if (event.target === event.currentTarget) this._closeTeamOverlay(); }}>
        <section class="overlay-panel team-roster-overlay" role="dialog" aria-modal="true" aria-label="Effectif de l'équipe">
          <header class="overlay-head">
            <div class="team-roster-heading">
              ${this._teamOverlay?.logo ? html`<img class="logo large" src=${this._teamOverlay.logo} alt="">` : ""}
              <div><h2>${value(this._teamOverlay?.display_name, this._teamOverlay?.name)}</h2>
                <div class="muted">${value(this._teamOverlay?.abbreviation)} · ${value(this._teamRoster?.season, "Effectif NBA")}</div></div>
            </div>
            <button class="overlay-close" aria-label="Fermer la fiche équipe" @click=${this._closeTeamOverlay}>✕</button>
          </header>
          <div class="overlay-body">
            ${this._selectedPlayer ? html`
              <section class="panel player-profile-card">
                <div class="panel-head"><h3>FICHE JOUEUR</h3><button class="chip" @click=${() => { this._selectedPlayer = null; }}>RETOUR À L'EFFECTIF</button></div>
                <div class="team-row">${this._selectedPlayer.headshot ? html`<img class="roster-headshot" src=${this._selectedPlayer.headshot} alt="">` : ""}
                  <div class="team-info"><strong>${value(this._selectedPlayer.name)}</strong><small>${value(this._selectedPlayer.position)} · ${this._selectedPlayer.jersey ? `#${this._selectedPlayer.jersey}` : "N° —"}</small></div></div>
                <div class="player-profile-grid">
                  <div><small>ÂGE</small><strong>${value(this._selectedPlayer.age)}</strong></div><div><small>TAILLE</small><strong>${this._selectedPlayer.height_cm == null ? "—" : `${this._selectedPlayer.height_cm} cm`}</strong></div>
                  <div><small>POIDS</small><strong>${this._selectedPlayer.weight_kg == null ? "—" : `${this._selectedPlayer.weight_kg.toLocaleString("fr-BE")} kg`}</strong></div><div><small>EXPÉRIENCE</small><strong>${this._selectedPlayer.experience_years == null ? "—" : `${this._selectedPlayer.experience_years} ans`}</strong></div>
                  <div><small>STATUT</small><strong>${value(this._selectedPlayer.status)}</strong></div><div><small>UNIVERSITÉ / CLUB</small><strong>${value(this._selectedPlayer.college)}</strong></div>
                </div>
                ${this._selectedPlayer.injuries?.length ? html`<p class="roster-injury">ÉTAT MÉDICAL ESPN : ${this._selectedPlayer.injuries.map((injury) => value(injury.status)).filter(Boolean).join(" · ")}</p>` : ""}
              </section>` : ""}
            ${!this._selectedPlayer && this._teamRoster?.standing ? html`
              <section class="panel team-season-summary">
                <div class="panel-head"><h3>SAISON RÉGULIÈRE</h3><span class="pill">${value(this._teamRoster.standing.rank, "—")}e PLACE</span></div>
                <div class="player-profile-grid">
                  <div><small>BILAN</small><strong>${value(this._teamRoster.standing.wins)}–${value(this._teamRoster.standing.losses)}</strong></div>
                  <div><small>% VICTOIRES</small><strong>${value(this._teamRoster.standing.pct)}</strong></div>
                  <div><small>RETARD</small><strong>${value(this._teamRoster.standing.gb)}</strong></div><div><small>SÉRIE</small><strong>${value(this._teamRoster.standing.streak)}</strong></div>
                </div>
                ${this._teamRoster.schedule?.recent?.length ? html`<div class="muted" style="margin-top:12px">FORME RÉCENTE</div><div class="recent">${this._teamRoster.schedule.recent.slice(0,5).map((game) => html`<button class="form-chip ${game.result === "V" ? "win" : game.result === "D" ? "loss" : "unknown"}" type="button" ?disabled=${!game.id} aria-label="Voir le match ${value(game.team_abbr)} contre ${value(game.opp_abbr)} du ${value(game.date_text)}" @click=${() => game.id && this._openRecentTeamGame(game)}><strong>${value(game.result)}</strong><span>${game.home_away === "@" ? `@${value(game.opp_abbr)}` : value(game.opp_abbr)}</span><span>${value(game.team_score)}–${value(game.opp_score)}</span></button>`)}</div>` : ""}
                ${this._teamRoster.schedule?.next ? html`<p class="muted">PROCHAIN MATCH · ${value(this._teamRoster.schedule.next.date_text)} · ${value(this._teamRoster.schedule.next.name)}</p>` : ""}
              </section>` : ""}
            <div class="panel-head"><h3>${this._selectedPlayer ? "AUTRES JOUEURS" : "EFFECTIF"}</h3><span class="pill">${this._teamRoster?.count ?? 0} JOUEURS</span></div>
            ${this._teamRosterLoading ? html`<section class="empty">Chargement de l'effectif…</section>` : ""}
            ${this._teamRosterError ? html`<section class="empty"><strong>Effectif indisponible</strong><p>${this._teamRosterError}</p><button @click=${() => this._openTeam(this._teamOverlay)}>RÉESSAYER</button></section>` : ""}
            ${!this._teamRosterLoading && !this._teamRosterError && players.length ? html`
              <div class="roster-list">${players.map((player) => html`
                <button class="roster-player roster-player-button" type="button" @click=${() => this._selectRosterPlayer(player)}>
                  ${player.headshot ? html`<img class="roster-headshot" src=${player.headshot} alt="" loading="lazy">` : html`<div class="roster-headshot roster-placeholder"></div>`}
                  <div class="roster-player-info"><strong>${value(player.name)}</strong>
                    <small>${value(player.position)} · ${player.height_cm == null ? "—" : `${player.height_cm} cm`} · ${value(player.college, "Université non renseignée")}</small>
                    ${player.injuries?.length ? html`<small class="roster-injury">${player.injuries.map((injury) => value(injury.status)).filter(Boolean).join(" · ")}</small>` : ""}
                  </div>
                  <div class="roster-number"><strong>${player.jersey ? `#${player.jersey}` : "—"}</strong><small>${value(player.status)}</small></div>
                </button>`)}</div>` : ""}
            ${!this._teamRosterLoading && !this._teamRosterError && !players.length ? html`<section class="empty">Aucun joueur retourné par ESPN.</section>` : ""}
          </div>
        </section>
      </div>`;
  }

  async _openPlayer(playerId, source = {}) {
    if (!playerId) return;
    const request = ++this._playerRequest;
    this._playerOverlay = { ...source, id: String(playerId), name: source.player ?? source.name ?? "Joueur NBA" };
    this._playerData = null; this._playerError = ""; this._playerLoading = true; this._playerSelectedSeason = ""; this._playerSelectedPlayoffSeason = ""; this._playerPlayoffLoading = false;
    try {
      const result = await this.hass.callWS({ type: "nba/player_data", player_id: String(playerId) });
      if (request !== this._playerRequest) return;
      this._playerData = result;
      // Le sélecteur playoffs est indépendant de celui de saison régulière.
      const playoffHistory = result.stats?.season_history ?? [];
      this._playerSelectedPlayoffSeason = String(playoffHistory[0]?.year ?? "");
      // Les leaders de PLAYERS ne contiennent pas la biographie : la récupérer via l’effectif ESPN.
      const hasBio = ["age", "position", "height_cm", "weight_kg", "experience_years", "jersey", "status"].some((key) => this._playerOverlay[key] != null);
      if (!hasBio) {
        const teamAbbr = String(source.team_abbreviation ?? source.team ?? this._teamOverlay?.abbreviation ?? this._teamOverlay?.abbr ?? "").toUpperCase();
        const team = this._teamsCatalog().teams.find((item) => (source.team_id != null && String(item.id) === String(source.team_id)) || String(item.abbreviation ?? item.abbr ?? "").toUpperCase() === teamAbbr);
        if (team?.id) {
          try {
            const roster = await this.hass.callWS({ type: "nba/team_roster", team_id: String(team.id) });
            if (request !== this._playerRequest) return;
            const bio = (roster.players ?? []).find((item) => String(item.id) === String(playerId));
            if (bio) this._playerOverlay = { ...this._playerOverlay, ...bio, team: source.team ?? team.abbreviation ?? team.abbr };
          } catch (err) { /* Le profil statistique reste accessible sans la biographie. */ }
        }
      }
    } catch (err) {
      if (request !== this._playerRequest) return;
      this._playerError = err?.message ?? "Données du joueur indisponibles.";
    } finally {
      if (request === this._playerRequest) this._playerLoading = false;
    }
  }

  async _loadPlayerPlayoffSeason(playerId, seasonYear) {
    if (!playerId || !Number.isInteger(seasonYear)) return;
    this._playerSelectedPlayoffSeason = String(seasonYear);
    this._playerPlayoffLoading = true;
    const playerRequest = this._playerRequest;
    const playoffRequest = ++this._playerPlayoffRequest;
    try {
      const result = await this.hass.callWS({ type: "nba/player_data", player_id: String(playerId), postseason_year: seasonYear });
      if (playerRequest !== this._playerRequest || playoffRequest !== this._playerPlayoffRequest || !this._playerOverlay) return;
      this._playerData = { ...this._playerData, postseason_stats: result.postseason_stats, postseason_gamelog: result.postseason_gamelog };
    } catch (err) {
      if (playerRequest === this._playerRequest && playoffRequest === this._playerPlayoffRequest) {
        this._playerError = err?.message ?? "Statistiques playoffs indisponibles.";
      }
    } finally {
      if (playerRequest === this._playerRequest && playoffRequest === this._playerPlayoffRequest) {
        this._playerPlayoffLoading = false;
      }
    }
  }

  _closePlayer() {
    this._playerRequest += 1;
    this._playerPlayoffRequest += 1;
    this._playerOverlay = null; this._playerData = null; this._playerLoading = false; this._playerError = "";
  }

  _playerProfilePanel() {
    const player = this._playerOverlay ?? {};
    const overview = this._playerData?.overview ?? {};
    const seasonHistory = this._playerData?.stats?.season_history ?? [];
    const selectedSeason = seasonHistory.find((item) => String(item.year) === String(this._playerSelectedSeason)) ?? seasonHistory[0];
    const stats = selectedSeason?.statistics ?? this._playerData?.stats?.statistics ?? [];
    const seasonLabel = selectedSeason?.display_name ?? this._playerData?.stats?.season ?? "SAISON";
    const postseason = this._playerData?.postseason_stats ?? {};
    const selectedPlayoffSeason = seasonHistory.find((item) => String(item.year) === String(this._playerSelectedPlayoffSeason)) ?? seasonHistory[0];
    const postseasonStats = postseason.statistics ?? [];
    const games = this._playerData?.gamelog?.games ?? [];
    const postseasonGames = this._playerData?.postseason_gamelog?.games ?? [];
    const teamCatalog = this._teamsCatalog().teams;
    const currentTeam = teamCatalog.find((team) =>
      (player.team_id != null && String(team.id) === String(player.team_id))
      || String(team.abbreviation ?? team.abbr ?? "").toUpperCase() === String(player.team_abbreviation ?? player.team ?? "").toUpperCase()
    );
    const seasonTeamLabel = (item) => {
      if (Array.isArray(item.teams) && item.teams.length > 1) {
        const abbreviations = item.teams.map((entry) => {
          const team = teamCatalog.find((candidate) =>
            (entry.team_id && String(candidate.id) === String(entry.team_id))
            || (entry.team_abbreviation && String(candidate.abbreviation).toUpperCase() === String(entry.team_abbreviation).toUpperCase())
          );
          return entry.team_abbreviation ?? team?.abbreviation ?? entry.team_name ?? team?.display_name ?? "";
        }).filter(Boolean);
        if (abbreviations.length) return [...new Set(abbreviations)].join(" · ");
      }
      const team = teamCatalog.find((candidate) =>
        (item.team_id && String(candidate.id) === String(item.team_id))
        || (item.team_abbreviation && String(candidate.abbreviation).toUpperCase() === String(item.team_abbreviation).toUpperCase())
      );
      return item.team_abbreviation ?? team?.abbreviation ?? item.team_name ?? team?.display_name ?? "";
    };
    const formatGameDate = (raw) => {
      const date = String(raw ?? "").split("T")[0];
      const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      return match ? `${match[3]}/${match[2]}/${match[1]}` : (date || "—");
    };
    const translateStat = (item) => {
      const key = String(item.name ?? "").toLowerCase();
      const labels = { gamesplayed: "Matchs joués", gamesstarted: "Matchs comme titulaire",
        fieldgoalsmadeattemptedpergame: "Tirs réussis / tentés par match", fieldgoalpercentage: "Réussite aux tirs (%)",
        threepointfieldgoalsmadeattemptedpergame: "3 points réussis / tentés par match", threepointfieldgoalpercentage: "Réussite à 3 points (%)",
        freethrowsmadeattemptedpergame: "Lancers francs réussis / tentés par match", freethrowpercentage: "Réussite aux lancers francs (%)",
        offensivereboundspergame: "Rebonds offensifs par match", defensivereboundspergame: "Rebonds défensifs par match",
        foulspergame: "Fautes par match", turnoverpergame: "Balles perdues par match", turnoverspergame: "Balles perdues par match",
        offensiverebounds: "Rebonds offensifs", defensiverebounds: "Rebonds défensifs", turnovers: "Balles perdues",
        fouls: "Fautes", doubledouble: "Double-double", tripledouble: "Triple-double",
        disqualifications: "Disqualifications", ejections: "Expulsions", technicalfouls: "Fautes techniques",
        flagrantfouls: "Fautes flagrantes", assisttoturnoverratio: "Ratio passes / balles perdues",
        stealtoturnoverratio: "Ratio interceptions / balles perdues", scoringefficiency: "Efficacité offensive",
        shootingefficiency: "Efficacité au tir" };
      return labels[key] ?? item.label ?? item.name;
    };
    const stat = (...names) => stats.find((item) => names.includes(String(item.name).toLowerCase()) || names.includes(String(item.label).toLowerCase()));
    // Les six indicateurs mis en évidence doivent être des moyennes par match.
    // Ne jamais retomber sur les totaux (points, rebounds, minutes, etc.).
    const quickDefinitions = [
      ["MIN", ["avgminutes", "minutespergame", "minutes per game"]],
      ["PTS", ["avgpoints", "pointspergame", "points per game"]],
      ["REB", ["avgrebounds", "reboundspergame", "rebounds per game"]],
      ["AST", ["avgassists", "assistspergame", "assists per game"]],
      ["STL", ["avgsteals", "stealspergame", "steals per game"]],
      ["BLK", ["avgblocks", "blockspergame", "blocks per game"]],
    ];
    const quick = quickDefinitions.map(([label, aliases]) => [label, stat(...aliases)]);
    const normalizeStatKey = (raw) => String(raw ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const statKeys = (item) => [
      item.name, item.label, item.display_name, item.abbreviation, item.shortDisplayName,
    ].map(normalizeStatKey).filter(Boolean);
    // Les six valeurs mises en évidence utilisent les mêmes lignes ESPN que
    // le tableau détaillé : l'identifiant "name" est la seule clé de sélection.
    const postseasonByName = Object.fromEntries(
      postseasonStats.map((item) => [String(item.name ?? ""), item])
    );
    const postseasonQuickDefinitions = [
      ["MIN", "avgMinutes"],
      ["PTS", "avgPoints"],
      ["REB", "avgRebounds"],
      ["AST", "avgAssists"],
      ["STL", "avgSteals"],
      ["BLK", "avgBlocks"],
    ];
    const postseasonQuick = postseasonQuickDefinitions.map(([label, id]) => {
      const item = postseasonByName[id];
      return [label, item ? (item.display_value ?? item.value ?? "—") : "—"];
    });
    const postseasonHighlighted = new Set(postseasonQuickDefinitions.map(([, id]) => normalizeStatKey(id)));
    const postseasonGamesPlayed = postseasonStats.find((item) =>
      statKeys(item).some((key) => ["gamesplayed", "games", "gp"].includes(key))
    );
    if (postseasonGamesPlayed) statKeys(postseasonGamesPlayed).forEach((key) => postseasonHighlighted.add(key));
    const postseasonDetailOrder = [
      "gamesstarted", "fieldgoalsmade", "fieldgoalsattempted", "fieldgoalsmadeattempted",
      "fieldgoalpercentage", "threepointersmade", "threepointersattempted",
      "threepointfieldgoalsmade", "threepointfieldgoalsattempted", "threepointfieldgoalpercentage",
      "freethrowsmade", "freethrowsattempted", "freethrowpercentage",
      "offensiverebounds", "defensiverebounds", "rebounds",
      "assists", "steals", "blocks", "turnovers", "assisttoturnoverratio",
      "personalfouls", "fouls", "technicalfouls", "flagrantfouls",
      "doubledouble", "tripledouble", "disqualifications", "ejections",
    ];
    const postseasonDetailed = postseasonStats
      .filter((item) => !statKeys(item).some((key) => postseasonHighlighted.has(key)))
      .sort((a, b) => {
        const rank = (item) => {
          const key = String(item.name ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
          const index = postseasonDetailOrder.indexOf(key);
          return index < 0 ? 1000 : index;
        };
        return rank(a) - rank(b) || String(a.label ?? a.name).localeCompare(String(b.label ?? b.name), "fr");
      });
    const highlightedNames = new Set(quickDefinitions.flatMap(([, aliases]) => aliases).map(normalizeStatKey));
    const regularDetailOrder = [
      "gamesstarted", "fieldgoalsmadeattemptedpergame", "fieldgoalsmade",
      "fieldgoalsattempted", "fieldgoalpercentage", "threepointfieldgoalsmadeattemptedpergame",
      "threepointersmade", "threepointersattempted", "threepointfieldgoalsmade",
      "threepointfieldgoalsattempted", "threepointfieldgoalpercentage",
      "freethrowsmadeattemptedpergame", "freethrowsmade", "freethrowsattempted",
      "freethrowpercentage", "offensivereboundspergame", "defensivereboundspergame",
      "offensiverebounds", "defensiverebounds", "rebounds", "assists",
      "steals", "blocks", "turnoverspergame", "turnoverpergame", "turnovers",
      "assisttoturnoverratio", "personalfouls", "foulspergame", "fouls",
      "technicalfouls", "flagrantfouls", "doubledouble", "tripledouble",
      "disqualifications", "ejections",
    ];
    const detailedStats = stats
      .filter((item) => !statKeys(item).some((key) => highlightedNames.has(key)))
      .sort((a, b) => {
        const rank = (item) => {
          const keys = statKeys(item);
          const index = regularDetailOrder.findIndex((key) => keys.includes(key));
          return index < 0 ? 1000 : index;
        };
        return rank(a) - rank(b)
          || String(a.label ?? a.name).localeCompare(String(b.label ?? b.name), "fr");
      });
    const statLabel = (item) => item?.display_value ?? (item?.value == null ? "—" : item.value);
    return html`<div class="overlay" @click=${(event) => { if (event.target === event.currentTarget) this._closePlayer(); }}>
      <section class="overlay-panel player-profile-overlay" role="dialog" aria-modal="true" aria-label="Profil joueur">
        <header class="overlay-head"><div class="team-roster-heading">${player.headshot ? html`<img class="roster-headshot" src=${player.headshot} alt="">` : ""}${(currentTeam?.logo ?? player.team_logo) ? html`<img class="player-team-logo" src=${currentTeam?.logo ?? player.team_logo} alt="">` : ""}<div><h2>${value(overview.athlete?.name, player.name)}</h2><div class="muted">${value(player.team)} · PROFIL JOUEUR</div></div></div>
          <button class="overlay-close" aria-label="Fermer le profil joueur" @click=${() => this._closePlayer()}>✕</button></header>
        <div class="overlay-body">
          ${this._playerLoading ? html`<section class="empty">Chargement des statistiques du joueur…</section>` : ""}
          ${this._playerError ? html`<section class="empty"><strong>Profil détaillé indisponible</strong><p>${this._playerError}</p><button @click=${() => this._openPlayer(player.id, player)}>RÉESSAYER</button></section>` : ""}
          ${this._playerData ? html`
            <section class="panel">
              <div class="panel-head"><h3>FICHE JOUEUR &amp; BILAN CARRIÈRE</h3><span class="pill">CAREER</span></div>
              <div class="player-profile-grid">
                <div><small>ÂGE</small><strong>${value(player.age)}</strong></div>
                <div><small>POSTE</small><strong>${value(player.position_name, player.position)}</strong></div>
                <div><small>TAILLE</small><strong>${player.height_cm == null ? value(player.height) : `${player.height_cm} cm`}</strong></div>
                <div><small>POIDS</small><strong>${player.weight_kg == null ? value(player.weight) : `${player.weight_kg.toLocaleString("fr-BE")} kg`}</strong></div>
                <div><small>EXPÉRIENCE NBA</small><strong>${player.experience_years == null ? "—" : `${player.experience_years} ans`}</strong></div>
                <div><small>N°</small><strong>${value(player.jersey)}</strong></div>
                <div><small>UNIVERSITÉ / CLUB</small><strong>${value(player.college)}</strong></div>
                <div><small>STATUT</small><strong>${value(player.status)}</strong></div>
                <div><small>ÉTAT MÉDICAL</small><strong class="roster-injury">${player.injuries?.length ? player.injuries.map((injury) => value(injury.status)).filter(Boolean).join(" · ") : "Non renseigné"}</strong></div>
              </div>
              ${overview.career_statistics?.length ? html`
                <div class="panel-head" style="margin-top:16px"><h3>MOYENNES EN CARRIÈRE</h3></div>
                <div class="player-stat-grid">${["gamesPlayed","avgMinutes","avgPoints","avgRebounds","avgAssists","avgBlocks","avgSteals"].map((name) => {
                  const item = overview.career_statistics.find((row) => row.name === name);
                  return item ? html`<div><small>${value(item.label,item.name)}</small><strong>${value(item.display_value,item.value)}</strong></div>` : "";
                })}</div>` : ""}
            </section>
            ${games.length ? html`
              <section class="panel player-gamelog"><div class="panel-head"><h3>5 DERNIERS MATCHS · STATS INDIVIDUELLES</h3><span class="pill">${this._playerData.gamelog?.boxscore_count ?? 0}/${Math.min(games.length, 5)} BOX SCORES</span></div>
                ${games.slice(0,5).some((game) => Object.keys(game.stats ?? {}).length) ? html`<div class="player-game-list">
                  ${games.slice(0,5).map((game) => {
                    const stats = game.stats ?? {};
                    const pick = (...keys) => {
                      const key = keys.find((candidate) => stats[candidate] !== undefined && stats[candidate] !== null && stats[candidate] !== "");
                      return key ? stats[key] : "—";
                    };
                    const didNotPlay = game.did_not_play === true;
                    const labels = [["MIN",pick("MIN","minutes")],["PTS",pick("PTS","points")],["REB",pick("REB","rebounds")],["AST",pick("AST","assists")],["STL",pick("STL","steals")],["BLK",pick("BLK","blocks")]];
                    return html`<div class="player-game-row"><div class="player-game-meta"><strong>${formatGameDate(game.date)}</strong><span>${game.home_away === "@" ? "@" : "vs"} ${value(game.opponent_abbreviation, value(game.opponent))}${didNotPlay ? " · DNP" : ""}</span></div><div class="player-game-stats">${labels.map(([label,val]) => html`<span class="player-game-stat"><b>${label}</b>${didNotPlay ? "—" : val}</span>`)}</div></div>`;
                  })}</div>` : html`<p class="muted">Les box scores individuels ne sont pas encore disponibles pour ces rencontres.</p>`}
              </section>` : ""}
            <section class="panel player-season-panel"><div class="panel-head"><h3>STATISTIQUES DE SAISON</h3><span class="pill">${value(seasonLabel, "SAISON")}</span></div>
              ${seasonHistory.length > 1 ? html`<div class="filters player-season-picker"><label class="muted" for="player-season-select">SAISON</label><select id="player-season-select" aria-label="Choisir une saison" .value=${String(selectedSeason?.year ?? "")} @change=${(event) => { this._playerSelectedSeason = event.target.value; this.requestUpdate(); }}>${seasonHistory.map((item) => html`<option value=${String(item.year)}>${item.display_name}${seasonTeamLabel(item) ? ` · ${seasonTeamLabel(item)}` : ""}</option>`)}</select></div>` : ""}
            <div class="player-stat-grid player-season-highlights">${quick.map(([label,item]) => html`<div><small>${label} / MATCH</small><strong>${statLabel(item)}</strong></div>`)}</div>
              ${stats.length ? html`<div class="table-wrap"><table><thead><tr><th>STATISTIQUE</th><th>VALEUR</th></tr></thead><tbody>${detailedStats.map((item) => html`<tr><td>${value(translateStat(item),item.name)}</td><td>${value(item.display_value ?? item.value)}</td></tr>`)}</tbody></table></div>` : html`<p class="muted">Aucune autre statistique disponible pour cette saison.</p>`}
            </section>
            <section class="panel player-postseason-panel">
              <div class="panel-head"><h3>STATISTIQUES PLAYOFFS</h3><span class="pill">${value(postseason.season, selectedPlayoffSeason?.display_name ?? "POSTSEASON")}</span></div>
              <p class="muted">Moyennes fournies par ESPN Web API v3. On les affiche directement, sans recalcul local.</p>
              ${seasonHistory.length ? html`<div class="filters player-season-picker"><label class="muted" for="player-playoff-season-select">SAISON PLAYOFFS</label><select id="player-playoff-season-select" aria-label="Choisir la saison des playoffs" .value=${String(this._playerSelectedPlayoffSeason || seasonHistory[0]?.year || "")} @change=${(event) => this._loadPlayerPlayoffSeason(player.id, Number(event.target.value))}>${seasonHistory.map((item) => html`<option value=${String(item.year)}>${item.display_name}${seasonTeamLabel(item) ? ` · ${seasonTeamLabel(item)}` : ""}</option>`)}</select>${this._playerPlayoffLoading ? html`<span class="muted">Chargement…</span>` : ""}</div>` : ""}
              ${postseasonStats.length ? html`
                <div class="player-stat-grid player-season-highlights">${postseasonQuick.map(([label,item]) => html`<div><small>${label} / MATCH</small><strong>${value(item)}</strong></div>`)}</div>
                ${postseasonDetailed.length ? html`<div class="table-wrap"><table><thead><tr><th>STATISTIQUE</th><th>VALEUR</th></tr></thead><tbody>${postseasonDetailed.map((item) => html`<tr><td>${value(translateStat(item),item.name)}</td><td>${value(item.display_value ?? item.value)}</td></tr>`)}</tbody></table></div>` : ""}
              ` : html`<p class="muted">Les statistiques des playoffs sont récupérées séparément. Elles apparaîtront ici dès qu'ESPN publiera les données de postseason pour cette saison.</p>`}
            </section>
            ${Object.keys(this._playerData.errors ?? {}).length ? html`<p class="muted">Certaines sources ESPN sont indisponibles : ${Object.keys(this._playerData.errors).join(" · ")}</p>` : ""}
          ` : ""}
        </div>
      </section>
    </div>`;
  }

  _selectRosterPlayer(player) {
    this._selectedPlayer = player;
    this._openPlayer(player.id, { ...player, player: player.name, team_id: this._teamOverlay?.id, team_abbreviation: this._teamOverlay?.abbreviation ?? this._teamOverlay?.abbr, team_logo: this._teamOverlay?.logo, team: this._teamOverlay?.abbreviation ?? this._teamOverlay?.abbr ?? this._teamOverlay?.name });
    this.requestUpdate();
    this.updateComplete.then(() => {
      const body = this.renderRoot?.querySelector(".team-roster-overlay .overlay-body");
      body?.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  _setTeamSearch(event) { this._teamSearch = event.target.value ?? ""; }
  _setTeamConference(value) { this._teamConference = value; }

  _selectView(view) {
    this._active = view;
    if (view === "stats") this._loadStandingsView();
    if (view === "scores") {
      if (!this._calendarInitialized) { this._selectedDate = localDateISO(new Date(), this.hass?.config?.time_zone); this._calendarInitialized = true; }
      this._loadCalendar(this._selectedDate);
    }
  }
  _setFilter(filter) { this._filter = filter; }
  _setStandingsSeason(event) {
    const year = Number(event.target.value);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) return;
    this._standingSeason = year;
    this._playoffSeason = year;
    this._loadStandingsView();
  }
  _setStandingsPhase(phase) {
    if (!["regular", "playoffs"].includes(phase) || phase === this._standingPhase) return;
    this._standingPhase = phase;
    // Les classements réguliers sont disponibles depuis 2002-03,
    // mais les playoffs ne sont exploitables qu'à partir de 2007-08.
    if (phase === "playoffs" && this._standingSeason < 2008) {
      this._standingSeason = 2008;
      this._playoffSeason = 2008;
    }
    if (phase === "playoffs") this._loadPlayoffBracket(this._standingSeason);
    else this._loadHistoricalStandings(this._standingSeason);
  }
  _loadStandingsView() {
    if (this._standingPhase === "playoffs") this._loadPlayoffBracket(this._standingSeason);
    else this._loadHistoricalStandings(this._standingSeason);
  }
  async _loadHistoricalStandings(year = this._standingSeason) {
    if (!this.hass?.callWS || !Number.isInteger(year)) return;
    const request = ++this._seasonStandingsRequest;
    const cached = this._standingsResultsCache.get(year);
    const cacheTtl = year === (new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0)) ? 5 * 60 * 1000 : 7 * 86400 * 1000;
    if (cached && Date.now() - cached.at < cacheTtl) {
      this._seasonStandings = cached.data;
      this._seasonStandingsLoading = false;
      this._seasonStandingsError = "";
      return;
    }
    this._seasonStandingsLoading = true;
    this._seasonStandingsError = "";
    this._seasonStandings = null;
    try {
      const result = await this.hass.callWS({ type: "nba/standings", season_year: year });
      if (request !== this._seasonStandingsRequest || year !== this._standingSeason) return;
      this._standingsResultsCache.set(year, { at: Date.now(), data: result });
      this._seasonStandings = result;
    } catch (err) {
      if (request !== this._seasonStandingsRequest) return;
      this._seasonStandingsError = err?.message ?? "Impossible de charger le classement de cette saison.";
    } finally {
      if (request === this._seasonStandingsRequest) this._seasonStandingsLoading = false;
    }
  }
  async _loadPlayoffBracket(year = this._playoffSeason) {
    if (!this.hass?.callWS || !Number.isInteger(year)) return;
    const request = ++this._playoffRequest;
    const cached = this._playoffResultsCache.get(year);
    const currentSeason = new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0);
    const cacheTtl = year === currentSeason ? 15 * 60 * 1000 : 7 * 86400 * 1000;
    if (cached && Date.now() - cached.at < cacheTtl) {
      this._playoffData = cached.data;
      this._playoffLoading = false;
      this._playoffError = "";
      return;
    }
    this._playoffLoading = true; this._playoffError = ""; this._playoffData = null;
    try {
      const result = await this.hass.callWS({ type: "nba/playoff_bracket", season_year: year });
      if (request !== this._playoffRequest || year !== this._playoffSeason) return;
      this._playoffResultsCache.set(year, { at: Date.now(), data: result });
      this._playoffData = result;
    } catch (err) {
      if (request !== this._playoffRequest) return;
      this._playoffError = err?.message ?? "Impossible de charger le tableau des playoffs.";
    } finally {
      if (request === this._playoffRequest) this._playoffLoading = false;
    }
  }
  _openPlayoffSeries(series) { this._seriesOverlay = series; }
  _closePlayoffSeries() { this._seriesOverlay = null; }
  _playoffSeriesCard(series) {
    const teams = series.teams ?? [];
    const winnerId = series.winner?.id == null ? null : String(series.winner.id);
    const catalog = this._teamsCatalog().teams;
    const status = series.status === "completed" ? "TERMINÉE" : series.status === "inconsistent" ? "À VÉRIFIER" : "EN COURS";
    return html`<button type="button" class="playoff-series playoff-series-button" @click=${() => this._openPlayoffSeries(series)} aria-label=${`Voir les matchs de la série ${teams.map((team) => team.abbreviation ?? team.name).join(" contre ")}`}>
      <div class="playoff-series-top"><span class="playoff-series-round">${value(series.round_label, "SÉRIE")}</span><span class="pill">${status}</span></div>
      ${teams.map((team) => {
        const club = catalog.find((candidate) => String(candidate.id) === String(team.id));
        return html`<div class="playoff-team ${winnerId === String(team.id) ? "playoff-winner" : ""}">
          <span class="playoff-seed">${team.seed == null ? "—" : `#${team.seed}`}</span>
          ${club?.logo ? html`<img class="playoff-team-logo" src=${club.logo} alt="" loading="lazy">` : ""}
          <strong>${value(team.abbreviation, team.name ?? team.id)}</strong>
          <span class="playoff-wins">${Number.isInteger(team.wins) ? `${series.unknown_results ? "≥" : ""}${team.wins}` : "—"}</span>
        </div>`;
      })}
      <div class="playoff-series-bottom"><span>${series.completed_games ?? 0} / ${series.games_played ?? 0} MATCHS TERMINÉS</span><strong>VOIR LES MATCHS <span aria-hidden="true">›</span></strong></div>
      ${series.unknown_results ? html`<div class="playoff-warning">${series.unknown_results} résultat(s) non confirmé(s)</div>` : ""}
      ${series.issues?.length ? html`<div class="playoff-warning">Données incohérentes : ${series.issues.join(", ")}</div>` : ""}
    </button>`;
  }
  _playoffSeriesOverlay() {
    const series = this._seriesOverlay;
    if (!series) return "";
    const catalog = this._teamsCatalog().teams;
    const teams = series.teams ?? [];
    const games = [...(series.games ?? [])].sort((a, b) => (a.game_number ?? 99) - (b.game_number ?? 99) || String(a.date ?? "").localeCompare(String(b.date ?? "")));
    const teamFor = (game, side) => (game.teams ?? []).find((team) => team.home_away === side) ?? {};
    const clubFor = (team) => catalog.find((club) => String(club.id) === String(team.id));
    return html`<div class="overlay playoff-series-overlay" @click=${(event) => { if (event.target === event.currentTarget) this._closePlayoffSeries(); }}>
      <section class="overlay-panel" role="dialog" aria-modal="true" aria-label="Matchs de la série">
        <header class="overlay-head"><div><div class="section-kicker">${value(series.round_label, "PLAYOFFS")}</div><h2>${teams.map((team) => value(team.abbreviation, team.name)).join(" · ")}</h2></div><button class="overlay-close" aria-label="Fermer la série" @click=${this._closePlayoffSeries}>✕</button></header>
        <div class="overlay-body">
          <div class="playoff-series-detail-summary"><span class="pill">${series.status === "completed" ? "SÉRIE TERMINÉE" : series.status === "inconsistent" ? "DONNÉES À VÉRIFIER" : "SÉRIE EN COURS"}</span><strong>${teams.map((team) => Number.isInteger(team.wins) ? team.wins : "—").join(" – ")}</strong><span class="muted">${series.completed_games ?? 0} matchs terminés · ${series.games_played ?? 0} recensés</span></div>
          <div class="playoff-game-list">
            ${games.length ? games.map((game) => {
              const away = teamFor(game, "away");
              const home = teamFor(game, "home");
              const awayClub = clubFor(away);
              const homeClub = clubFor(home);
              const completed = game.completed === true;
              const declaredWinners = (game.teams ?? []).filter((team) => team.winner === true);
              const scoreWinner = completed && Number.isFinite(Number(away.score)) && Number.isFinite(Number(home.score)) && Number(away.score) !== Number(home.score)
                ? (Number(away.score) > Number(home.score) ? "away" : "home") : null;
              const winnerSide = declaredWinners.length === 1
                ? (String(declaredWinners[0].id) === String(away.id) ? "away" : String(declaredWinners[0].id) === String(home.id) ? "home" : null)
                : scoreWinner;
              const gameLabel = game.game_number ? `GAME ${game.game_number}` : "MATCH";
              const date = game.date ? new Date(game.date).toLocaleDateString("fr-BE", { day: "2-digit", month: "short", year: "numeric" }) : "Date indisponible";
              return html`<button type="button" class="playoff-game-row ${winnerSide === "away" ? "winner-away" : winnerSide === "home" ? "winner-home" : ""}" ?disabled=${!game.id} @click=${() => {
                if (!game.id) return;
                this._closePlayoffSeries();
                this._openGame({
                  id: game.id, date_text: date, state: completed ? "post" : "pre",
                  detail: completed ? "TERMINÉ" : "À VENIR",
                  away: { id: away.id, name: away.name ?? awayClub?.display_name ?? awayClub?.name, abbr: away.abbreviation, logo: awayClub?.logo, score: away.score },
                  home: { id: home.id, name: home.name ?? homeClub?.display_name ?? homeClub?.name, abbr: home.abbreviation, logo: homeClub?.logo, score: home.score },
                });
              }}>
                <span class="playoff-game-number">${gameLabel}<small>${date}</small></span>
                <span class="playoff-game-team">${awayClub?.logo ? html`<img src=${awayClub.logo} alt="" loading="lazy">` : ""}<strong>${value(away.abbreviation, away.name)}</strong><b>${completed ? value(away.score) : "—"}</b>${winnerSide === "away" ? html`<small class="playoff-winner-label">GAGNANT</small>` : ""}</span>
                <span class="playoff-game-team">${homeClub?.logo ? html`<img src=${homeClub.logo} alt="" loading="lazy">` : ""}<strong>${value(home.abbreviation, home.name)}</strong><b>${completed ? value(home.score) : "—"}</b>${winnerSide === "home" ? html`<small class="playoff-winner-label">GAGNANT</small>` : ""}</span>
                <span class="playoff-game-open" aria-hidden="true">›</span>
              </button>`;
            }) : html`<section class="empty"><p>Les rencontres détaillées de cette série ne sont pas disponibles dans les données ESPN reçues.</p></section>`}
          </div>
        </div>
      </section>
    </div>`;
  }
  _playoffRound(round) {
    return html`<section class="playoff-round"><div class="section-kicker">${value(round.round_label)}</div><div class="grid">${(round.series ?? []).map((series) => this._playoffSeriesCard(series))}</div></section>`;
  }
  _playoffsView() {
    const data = this._playoffData;
    return html`<div class="section-kicker">TABLEAU DES PLAYOFFS · ${this._standingSeason - 1}-${String(this._standingSeason).slice(-2)}</div>
      ${this._playoffLoading ? html`<section class="empty">Chargement du tableau ${this._playoffSeason - 1}-${String(this._playoffSeason).slice(-2)}…</section>` : ""}
      ${this._playoffError ? html`<section class="empty"><strong>Tableau indisponible</strong><p>${this._playoffError}</p><button @click=${() => this._loadPlayoffBracket()}>RÉESSAYER</button></section>` : ""}
      ${!this._playoffLoading && data ? html`<div class="playoff-summary"><span>${data.games_count ?? 0} MATCHS</span><span>${data.series_count ?? 0} SÉRIES</span><span>${data.available ? "DONNÉES REÇUES" : "AUCUN MATCH PLAYOFF"}</span></div>
        ${Object.entries(data.conferences ?? {}).map(([conference, rounds]) => html`<section class="playoff-conference"><div class="playoff-conference-title"><h2>${conference.toUpperCase()}ERN CONFERENCE</h2><span class="pill">${(rounds ?? []).reduce((n, round) => n + (round.series?.length ?? 0), 0)} SÉRIES</span></div>${(rounds ?? []).length ? rounds.map((round) => this._playoffRound(round)) : html`<section class="empty"><strong>Tableau ${conference} indisponible</strong><p>Les données ESPN ne permettent pas de reconstituer les séries de cette conférence.</p></section>`}</section>`)}
        <section class="playoff-conference"><div class="playoff-conference-title"><h2>NBA FINALS</h2></div>${(data.finals ?? []).length ? html`<div class="grid">${data.finals.map((series) => this._playoffSeriesCard(series))}</div>` : html`<section class="empty"><strong>Finales NBA non disponibles</strong><p>Aucune série des Finales n'a été identifiée pour cette saison.</p></section>`}</section>
        ${(data.unplaced ?? []).length ? html`<section class="playoff-conference"><div class="playoff-conference-title"><h2>SÉRIES NON CLASSÉES</h2></div><div class="grid">${data.unplaced.map((series) => this._playoffSeriesCard(series))}</div></section>` : ""}
        ${Object.keys(data.seed_errors ?? {}).length ? html`<section class="empty playoff-warning"><strong>Têtes de série non validées</strong><p>${Object.entries(data.seed_errors).map(([conference, errors]) => `${conference} : ${errors.join(", ")}`).join(" · ")}</p>Les positions de tableau ne sont pas inventées.</section>` : ""}
        ${Object.keys(data.schedule_errors ?? {}).length ? html`<p class="muted">Calendriers manquants pour ${Object.keys(data.schedule_errors).length} équipe(s) · certaines séries peuvent être incomplètes.</p>` : ""}
      ` : ""}
      ${!this._playoffLoading && !this._playoffError && !data ? html`<section class="empty"><strong>Aucune donnée chargée</strong><p>Choisis une saison pour charger son tableau.</p><button @click=${() => this._loadPlayoffBracket()}>CHARGER LES PLAYOFFS</button></section>` : ""}`;
  }
  _setSearch(event) { this._search = event.target.value ?? ""; }
  _shiftDate(days) { this._selectedDate = shiftDateISO(this._selectedDate, days); this._loadCalendar(this._selectedDate); }
  _setDate(event) { this._selectedDate = event.target.value; this._loadCalendar(this._selectedDate); }
  async _loadCalendar(date) {
    if (!this.hass?.callWS || !date) return;
    const request = ++this._calendarRequest;
    this._calendarLoading = true; this._calendarError = ""; this._calendarStale = false; this._calendarStaleError = "";
    try {
      const result = await this.hass.callWS({ type: "nba/scoreboard", date });
      if (request !== this._calendarRequest || date !== this._selectedDate) return;
      this._calendarGames = result.games ?? [];
      this._calendarStale = Boolean(result.stale);
      this._calendarStaleError = result.error ?? "";
    } catch (err) {
      if (request !== this._calendarRequest || date !== this._selectedDate) return;
      this._calendarError = err?.message ?? "Impossible de charger le calendrier NBA.";
      this._calendarGames = [];
    } finally {
      if (request === this._calendarRequest) this._calendarLoading = false;
    }
  }
  _openRecentTeamGame(game) {
    const currentTeam = {
      name: this._teamOverlay?.display_name ?? this._teamOverlay?.name ?? game.team_abbr,
      abbr: game.team_abbr,
      logo: this._teamOverlay?.logo,
      score: game.team_score,
    };
    const opponent = {
      name: game.opp_name ?? game.opp_abbr,
      abbr: game.opp_abbr,
      logo: game.opp_logo,
      score: game.opp_score,
    };
    const currentTeamIsAway = game.home_away === "@";
    this._openGame({
      id: game.id,
      date_text: game.date_text,
      state: "post",
      detail: "TERMINÉ",
      away: currentTeamIsAway ? currentTeam : opponent,
      home: currentTeamIsAway ? opponent : currentTeam,
    });
  }
  async _openGame(game) {
    const request = ++this._overlayRequest;
    this._overlayGame = game; this._overlayDetails = null; this._overlayError = ""; this._overlayLoading = true;
    this._showAllPlays = false; this._scoringOnly = false;
    try {
      const details = await this.hass.callWS({ type: "nba/game_details", game_id: String(game.id) });
      if (request !== this._overlayRequest || String(this._overlayGame?.id) !== String(game.id)) return;
      this._overlayDetails = details;
    } catch (err) {
      if (request !== this._overlayRequest) return;
      this._overlayError = err?.message ?? "Résumé du match indisponible.";
    } finally {
      if (request === this._overlayRequest) this._overlayLoading = false;
    }
  }
  _closeOverlay() {
    this._overlayRequest += 1;
    this._overlayGame = null; this._overlayDetails = null; this._overlayLoading = false; this._overlayError = "";
  }
  _onOverlayKeydown(event) { if (event.key === "Escape") this._closeOverlay(); }

  _boxscorePanel(block) {
    const players = block.players ?? [];
    const preferred = ["MIN", "PTS", "FG", "3PT", "FT", "OREB", "DREB", "REB", "AST", "STL", "BLK", "TO", "PF", "+/-"];
    const available = new Set(players.flatMap((player) => Object.keys(player.stats ?? {})));
    const columns = [...preferred.filter((key) => available.has(key)), ...[...available].filter((key) => !preferred.includes(key))];
    const rows = [...players].sort((a, b) => Number(Boolean(b.starter)) - Number(Boolean(a.starter)));
    return html`
      <section class="panel boxscore-panel">
        <div class="panel-head"><h3>${value(block.abbr, block.team)}</h3><span class="pill">${players.length} JOUEURS</span></div>
        ${rows.length ? html`<div class="table-wrap player-table-wrap"><table class="player-table">
          <thead><tr><th>JOUEUR</th>${columns.map((key) => html`<th>${key}</th>`)}</tr></thead>
          <tbody>${rows.map((player) => html`
            <tr class="${player.starter ? "starter" : ""} ${player.did_not_play ? "dnp" : ""}">
              <td><span class="player-cell">${player.headshot ? html`<img src=${player.headshot} alt="" loading="lazy">` : ""}<span>${value(player.name)}<small>${[player.jersey ? `#${player.jersey}` : "", player.position || "", player.ejected ? "ÉJECTÉ" : player.did_not_play ? `DNP · ${value(player.reason, "NON PRIS EN JEU")}` : player.starter ? "TITULAIRE" : player.active ? "ACTIF" : ""].filter(Boolean).join(" · ")}</small></span></span></td>
              ${columns.map((key) => html`<td>${value(player.stats?.[key])}</td>`)}
            </tr>`)}
          </tbody>
        </table></div>` : html`<p class="muted">Statistiques individuelles indisponibles.</p>`}
      </section>`;
  }

  _awayFirst(items, homeAwayFor = (item) => item.home_away) {
    return [...(items ?? [])].sort((a, b) => {
      const rank = (item) => homeAwayFor(item) === "away" ? 0 : 1;
      return rank(a) - rank(b);
    });
  }

  _quarterScorePanel() {
    const teams = this._awayFirst(this._overlayDetails?.teams);
    const periods = Math.max(0, ...teams.map((team) => team.quarters?.length ?? 0));
    if (!periods || !teams.length) return "";
    const labels = Array.from({ length: periods }, (_, index) =>
      index < 4 ? `Q${index + 1}` : index === 4 ? "OT" : `${index - 4 + 1}OT`
    );
    return html`
      <section class="panel quarter-score-panel">
        <div class="panel-head"><h3>SCORE PAR PÉRIODE</h3><span class="pill">${periods > 4 ? "PROLONGATION" : "TEMPS RÉGLEMENTAIRE"}</span></div>
        <div class="table-wrap"><table>
          <thead><tr><th>ÉQUIPE</th>${labels.map((label) => html`<th>${label}</th>`)}<th>TOTAL</th></tr></thead>
          <tbody>${teams.map((team) => html`
            <tr><td>${value(team.abbr, team.name)}</td>
              ${labels.map((_, index) => html`<td>${value(team.quarters?.[index])}</td>`)}
              <td>${value(team.score)}</td>
            </tr>`)}</tbody>
        </table></div>
      </section>`;
  }

  _teamStatsPanel() {
    const teams = this._awayFirst(this._overlayDetails?.team_stats);
    if (!teams.length) return "";
    const keys = [...new Set(teams.flatMap((team) => (team.statistics ?? []).map((stat) => stat.name)))];
    return html`
      <section class="panel team-stats-panel">
        <div class="panel-head"><h3>COMPARAISON DES ÉQUIPES</h3><span class="pill">TEAM STATS</span></div>
        <div class="table-wrap"><table><thead><tr><th>STATISTIQUE</th>${teams.map((team) => html`<th>${value(team.abbr, team.name)}</th>`)}</tr></thead>
          <tbody>${keys.map((key) => {
            const label = teams.flatMap((team) => team.statistics ?? []).find((stat) => stat.name === key)?.label ?? key;
            return html`<tr><td>${label}</td>${teams.map((team) => html`<td>${value((team.statistics ?? []).find((stat) => stat.name === key)?.value)}</td>`)}</tr>`;
          })}</tbody>
        </table></div>
      </section>`;
  }


  _playByPlayPanel() {
    const plays = this._overlayDetails?.plays ?? [];
    if (!plays.length) return "";
    const filtered = this._scoringOnly ? plays.filter((play) => play.scoring) : plays;
    const ordered = [...filtered].reverse();
    const rows = this._showAllPlays ? ordered : ordered.slice(0, 12);
    return html`
      <section class="panel playbyplay-panel">
        <div class="panel-head"><h3>FIL DU MATCH</h3><span class="pill">${plays.length} ACTIONS</span></div>
        <div class="play-controls">
          <button class="chip" aria-pressed=${!this._scoringOnly} @click=${() => { this._scoringOnly = false; this._showAllPlays = false; }}>TOUTES</button>
          <button class="chip" aria-pressed=${this._scoringOnly} @click=${() => { this._scoringOnly = true; this._showAllPlays = false; }}>POINTS SEULEMENT</button>
        </div>
        <ol class="play-list">${rows.map((play) => html`
          <li class="play-row ${play.scoring ? "scoring" : ""}">
            <span class="play-clock">${value(play.period_display, Number(play.period) > 4 ? (Number(play.period) === 5 ? "OT" : `${Number(play.period) - 4}OT`) : `Q${value(play.period)}`)}<small>${value(play.clock)}</small></span>
            <span class="play-copy">${value(play.text, play.type || "Action")}${play.scoring ? html`<small>MARQUE · +${value(play.score_value, "?")} PT</small>` : ""}</span>
            <span class="play-score">${play.away_score != null || play.home_score != null ? `${value(play.away_score)}–${value(play.home_score)}` : ""}</span>
          </li>`)}</ol>
        ${ordered.length > 12 ? html`<button class="chip play-more" @click=${() => { this._showAllPlays = !this._showAllPlays; }}>${this._showAllPlays ? "RÉDUIRE" : `VOIR LES ${ordered.length} ACTIONS`}</button>` : ""}
      </section>`;
  }

  _gameStatus(game) {
    if (game.state === "in") return { label: game.clock ? `LIVE · ${game.clock}` : "LIVE", live: true };
    if (game.state === "post") return { label: game.detail || "TERMINÉ", live: false };
    return { label: game.time || "À VENIR", live: false };
  }

  _gameCard(game) {
    const home = game.home ?? {}, away = game.away ?? {};
    const status = this._gameStatus(game);
    const played = game.state === "in" || game.state === "post";
    return html`
      <article class="game" role="button" tabindex="0" @click=${() => this._openGame(game)} @keydown=${(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); this._openGame(game); } }}>
        <div class="game-main">
          <div class="game-date">${value(game.date_text, fmtDate(game.date))}</div>
          <div class="matchup">
            <div class="side away"><span class="team-name">${value(away.abbr, away.name)}</span>
              ${away.logo ? html`<img class="logo" src=${away.logo} alt="" loading="lazy">` : ""}</div>
            <div class="score ${played ? "" : "pending"}">${played ? `${value(away.score)} – ${value(home.score)}` : "VS"}</div>
            <div class="side">${home.logo ? html`<img class="logo" src=${home.logo} alt="" loading="lazy">` : ""}
              <span class="team-name">${value(home.abbr, home.name)}</span></div>
          </div>
        </div>
        <div class="status ${status.live ? "live" : ""}">${status.label}</div>
      </article>`;
  }

  _filteredGames(rows) {
    const term = this._search.trim().toLowerCase();
    return rows.filter((game) => {
      const status = this._filter === "all" || game.state === this._filter;
      const names = `${game.home?.name ?? ""} ${game.home?.abbr ?? ""} ${game.away?.name ?? ""} ${game.away?.abbr ?? ""}`.toLowerCase();
      return status && (!term || names.includes(term));
    });
  }

  _leaderPanel(key, limit = 5, postseason = false) {
    const rows = this._leaders(key, postseason).rows;
    return html`
      <section class="panel">
        <div class="panel-head"><h3>${LEADERS[key][0]}</h3><span class="pill">${postseason ? "PLAYOFFS" : "SAISON"}</span></div>
        ${rows.length ? html`<div class="leader-list">${rows.slice(0, limit).map((p, i) => html`
          <button class="leader leader-button" type="button" aria-label="Voir le profil de ${value(p.player)}" @click=${() => this._openPlayer(p.id, p)}>
            <span class="rank">${value(p.rank, i + 1)}</span>
            ${p.headshot ? html`<img class="avatar" src=${p.headshot} alt="" loading="lazy">` : html`<div class="avatar"></div>`}
            <span class="player">${value(p.player)}<small>${value(p.team)}</small></span>
            <span class="stat">${value(p.value)}</span>
          </button>`)}</div>` : html`<p class="muted">Données de classement indisponibles.</p>`}
      </section>`;
  }

  _openStandingTeam(row) {
    if (!row?.team_id) return;
    const team = this._teamsCatalog().teams.find((item) => String(item.id) === String(row.team_id)) ?? {
      id: row.team_id,
      name: row.team,
      display_name: row.team,
      abbreviation: row.abbr,
      logo: row.logo,
    };
    this._openTeam(team);
  }

  _standingsTable(slug, label, rowsOverride = null) {
    const rows = rowsOverride ?? this._standings(slug).rows;
    return html`
      <section class="panel">
        <div class="panel-head"><h3>${label}</h3><span class="pill">${rows.length} ÉQUIPES</span></div>
        ${rows.length ? html`<div class="table-wrap"><table>
          <thead><tr><th>#</th><th>ÉQUIPE</th><th>V</th><th>D</th><th>%</th><th>GB</th><th>SÉRIE</th></tr></thead>
          <tbody>${rows.slice(0,15).map((r,i) => html`
            <tr><td>${value(r.rank,i+1)}</td><td><button class="standing-team-button" type="button" ?disabled=${!r.team_id} @click=${() => this._openStandingTeam(r)}>${r.logo ? html`<img src=${r.logo} alt="" loading="lazy">` : ""}<span>${value(r.abbr,r.team)}</span></button></td><td>${value(r.wins)}</td>
            <td>${value(r.losses)}</td><td>${value(r.pct)}</td><td>${value(r.gb)}</td><td class="standing-streak">${value(r.streak)}</td></tr>`)}</tbody>
        </table></div>` : html`<p class="muted">Classement indisponible.</p>`}
      </section>`;
  }

  _teamPanel(team) {
    const last = team.last, next = team.next;
    return html`
      <section class="panel">
        <div class="team-row">
          ${team.logo ? html`<img class="logo large" src=${team.logo} alt="" loading="lazy">` : ""}
          <div class="team-info"><strong>${team.name}</strong><small>Équipe favorite · ${team.id}</small></div>
          ${team.live?.state === "in" ? html`<span class="pill accent">LIVE</span>` : ""}
        </div>
        <div class="team-row"><div class="team-info"><small>DERNIER MATCH</small><strong>${value(last?.name,"Donnée indisponible")}</strong></div>
          <div class="record">${value(last?.away?.score)} – ${value(last?.home?.score)}</div></div>
        <div class="team-row"><div class="team-info"><small>PROCHAIN MATCH</small><strong>${value(next?.name,"Calendrier indisponible")}</strong>
          <small>${value(next?.date_text,"")}</small></div></div>
        ${team.recent?.length ? html`
          <div class="muted" style="margin-top:10px">FORME RÉCENTE</div>
          <div class="recent">${team.recent.slice(0,5).map((game) => html`
            <span class="form-chip ${game.result === "V" ? "win" : game.result === "D" ? "loss" : "unknown"}">
              <strong>${value(game.result)}</strong><span>${value(game.opp_abbr)}</span>
              <span>${value(game.team_score)}–${value(game.opp_score)}</span>
            </span>`)}</div>` : ""}
      </section>`;
  }

  _homeView() {
    const { rows } = this._games();
    const live = rows.filter((g) => g.state === "in");
    const next = rows.filter((g) => g.state === "pre").slice(0,4);
    const teams = this._teams();
    return html`
      <div class="head"><h2>TABLEAU DE BORD</h2><span class="pill">NBA DARK</span></div>
      <div class="grid">
        <section class="panel"><div class="panel-head"><h3>EN DIRECT</h3><span class="pill">${live.length} MATCHS</span></div>
          ${live.length ? html`<div class="game-list">${live.map((g) => this._gameCard(g))}</div>` : html`<p class="muted">Aucun match en direct actuellement.</p>`}</section>
        <section class="panel"><div class="panel-head"><h3>À VENIR</h3><span class="pill">${next.length} MATCHS</span></div>
          ${next.length ? html`<div class="game-list">${next.map((g) => this._gameCard(g))}</div>` : html`<p class="muted">Aucun prochain match dans le calendrier chargé.</p>`}</section>
        <section class="panel"><div class="panel-head"><h3>ÉQUIPES FAVORITES</h3><span class="pill">${teams.length}</span></div>
          ${teams.length ? html`<div class="team-list">${teams.slice(0,6).map((t) => html`
            <div class="team-row">${t.logo ? html`<img class="logo" src=${t.logo} alt="">` : ""}
              <div class="team-info"><strong>${t.name}</strong><small>${t.id}</small></div>
              <span class="muted">${value(t.next?.date_text,"—")}</span></div>`)}</div>` : html`<p class="muted">Choisis tes équipes favorites dans la configuration de l'intégration NBA.</p>`}</section>
        ${this._leaderPanel("points",5)}
      </div>`;
  }

  _scoresView() {
    const rows = this._calendarGames;
    const filtered = this._filteredGames(rows);
    const dateLabel = new Intl.DateTimeFormat("fr-BE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${this._selectedDate}T12:00:00`));
    return html`
      <div class="head"><h2>SCORES & CALENDRIER</h2><span class="pill">${rows.length} MATCHS</span></div>
      <div class="date-nav"><button aria-label="Jour précédent" @click=${() => this._shiftDate(-1)}>‹</button>
        <span class="date-label">${dateLabel}</span><input type="date" aria-label="Choisir une date" .value=${this._selectedDate} @change=${this._setDate}>
        <button aria-label="Jour suivant" @click=${() => this._shiftDate(1)}>›</button>
        <button @click=${() => { this._selectedDate = localDateISO(new Date(), this.hass?.config?.time_zone); this._loadCalendar(this._selectedDate); }}>AUJOURD&#39;HUI</button></div>
      ${this._calendarStale ? html`<p class="muted" role="status">Données en cache · actualisation ESPN indisponible${this._calendarStaleError ? html` · ${this._calendarStaleError}` : ""}</p>` : ""}
      <div class="filters">${[["all","TOUS"],["in","LIVE"],["pre","À VENIR"],["post","TERMINÉS"]].map(([k,l]) => html`<button class="chip" aria-pressed=${this._filter===k} @click=${() => this._setFilter(k)}>${l}</button>`)}
        <input type="search" aria-label="Rechercher une équipe" placeholder="Filtrer une équipe…" .value=${this._search} @input=${this._setSearch}></div>
      ${this._calendarLoading ? html`<section class="empty">Chargement du calendrier…</section>` : ""}
      ${this._calendarError ? html`<section class="empty"><strong>Calendrier indisponible</strong><p>${this._calendarError}</p><button @click=${() => this._loadCalendar(this._selectedDate)}>RÉESSAYER</button></section>` : ""}
      ${!this._calendarLoading && !this._calendarError && filtered.length ? html`<div class="game-list">${filtered.map((g) => this._gameCard(g))}</div>` : ""}
      ${!this._calendarLoading && !this._calendarError && !filtered.length ? html`<section class="empty"><strong>${rows.length ? "Aucun match correspondant" : "Aucun match programmé"}</strong><p>${rows.length ? "Modifie les filtres ou la recherche." : "Aucune rencontre n&#39;est prévue pour cette date dans le fuseau horaire de Home Assistant."}</p></section>` : ""}
    `;
  }
  _teamCatalogCard(team) {
    const favorite = team.favoriteData;
    return html`<section class="panel catalog-team" role="button" tabindex="0" @click=${() => this._openTeam(team)} @keydown=${(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); this._openTeam(team); } }}>
      <div class="team-row">
        ${team.logo ? html`<img class="logo large" src=${team.logo} alt="" loading="lazy">` : ""}
        <div class="team-info"><strong>${value(team.display_name, team.name)}</strong>
          <small>${value(team.abbreviation)} · ${value(team.conference, "Conférence inconnue")} · ${value(team.division, "Division inconnue")}</small></div>
        ${team.favorite ? html`<span class="pill accent">FAVORI</span>` : ""}
      </div>
      ${favorite ? html`<div class="catalog-favorite-tracking"><span>DERNIER MATCH · ${value(favorite.last?.name, "—")}</span><span>PROCHAIN MATCH · ${value(favorite.next?.date_text, "—")} ${value(favorite.next?.name, "")}</span>${favorite.live?.state === "in" ? html`<strong class="pill accent">MATCH EN DIRECT</strong>` : ""}</div>` : ""}
    </section>`;
  }

  _teamsView() {
    const catalog = this._teamsCatalog();
    const term = this._teamSearch.trim().toLowerCase();
    const teams = catalog.teams.filter((team) => {
      const matchesSearch = !term || [team.name, team.display_name, team.abbreviation, team.nickname, team.city].filter(Boolean).join(" ").toLowerCase().includes(term);
      const conference = String(team.conference ?? "").toLowerCase();
      const matchesConference = this._teamConference === "all" ||
        (this._teamConference === "east" ? conference.includes("east") : conference.includes("west"));
      return matchesSearch && matchesConference;
    });
    return html`
      <div class="head"><h2>TEAMS CENTER</h2><span class="pill">${catalog.count}/30 FRANCHISES</span></div>
      ${!catalog.complete ? html`<p class="muted" role="status">Catalogue partiel ou en attente · ${catalog.count} équipes reçues</p>` : ""}
      <div class="filters">
        <button class="chip" aria-pressed=${this._teamConference === "all"} @click=${() => this._setTeamConference("all")}>TOUTES</button>
        <button class="chip" aria-pressed=${this._teamConference === "east"} @click=${() => this._setTeamConference("east")}>EAST</button>
        <button class="chip" aria-pressed=${this._teamConference === "west"} @click=${() => this._setTeamConference("west")}>WEST</button>
        <input type="search" aria-label="Rechercher une franchise NBA" placeholder="Rechercher une équipe…" .value=${this._teamSearch} @input=${this._setTeamSearch}>
      </div>
      ${teams.length ? html`<div class="grid">${teams.map((team) => this._teamCatalogCard(team))}</div>` :
        html`<section class="empty"><strong>${catalog.count ? "Aucune franchise correspondante" : "Catalogue des équipes indisponible"}</strong><p>${catalog.count ? "Modifie la recherche ou le filtre de conférence." : "Le capteur Catalogue des équipes n'a pas encore reçu les données ESPN."}</p></section>`}
    `;
  }

  _playersView() {
    return html`<div class="head"><h2>PLAYERS CENTER</h2><span class="pill">TOP 10 · SAISON & PLAYOFFS</span></div>
      <p class="muted">Sélectionne directement un joueur dans un classement pour ouvrir sa fiche détaillée. Les classements de playoffs restent séparés de la saison régulière.</p>
      <div class="section-kicker">SAISON RÉGULIÈRE</div>
      <div class="grid">${Object.keys(LEADERS).map((key) => this._leaderPanel(key,10))}</div>
      <div class="section-kicker" style="margin-top:18px">PLAYOFFS</div>
      <div class="grid">${Object.keys(LEADERS).map((key) => this._leaderPanel(key,10,true))}</div>`;
  }

  _statsView() {
    const currentSeasonYear = new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0);
    const firstAvailableYear = this._standingPhase === "playoffs" ? 2008 : 2002;
    const years = Array.from({ length: currentSeasonYear - firstAvailableYear + 1 }, (_, index) => currentSeasonYear - index);
    const standings = this._seasonStandings?.standings ?? {};
    const eastKey = Object.keys(standings).find((name) => name.toLowerCase().includes("eastern")) ?? "Eastern Conference";
    const westKey = Object.keys(standings).find((name) => name.toLowerCase().includes("western")) ?? "Western Conference";
    const eastRows = standings[eastKey] ?? [];
    const westRows = standings[westKey] ?? [];
    return html`
      <div class="head"><div><h2>STANDINGS CENTER</h2><p class="muted">Classements officiels ESPN · saison régulière et playoffs</p></div>
        <select class="playoff-season" aria-label="Choisir la saison NBA" .value=${String(this._standingSeason)} @change=${this._setStandingsSeason}>
          ${years.map((year) => html`<option value=${year}>${year - 1}-${String(year).slice(-2)}</option>`)}
        </select>
      </div>
      <div class="filters">
        <button class="chip" aria-pressed=${this._standingPhase === "regular"} @click=${() => this._setStandingsPhase("regular")}>SAISON RÉGULIÈRE</button>
        <button class="chip" aria-pressed=${this._standingPhase === "playoffs"} @click=${() => this._setStandingsPhase("playoffs")}>PLAYOFFS</button>
      </div>
      ${this._standingPhase === "regular" ? html`
        ${this._seasonStandingsLoading ? html`<section class="empty">Chargement du classement ${this._standingSeason - 1}-${String(this._standingSeason).slice(-2)}…</section>` : ""}
        ${this._seasonStandingsError ? html`<section class="empty"><strong>Classement indisponible</strong><p>${this._seasonStandingsError}</p><button @click=${() => this._loadHistoricalStandings()}>RÉESSAYER</button></section>` : ""}
        ${!this._seasonStandingsLoading && this._seasonStandings ? html`
          <div class="grid">
            ${this._standingsTable("east", "EASTERN CONFERENCE", eastRows)}
            ${this._standingsTable("west", "WESTERN CONFERENCE", westRows)}
          </div>` : ""}
      ` : this._playoffsView()}
    `;
  }

  render() {
    const active = VIEWS.find((v) => v.id === this._active) ?? VIEWS[0];
    const dataStatus = this._dataStatus();
    const degraded = dataStatus?.state !== "À jour" || dataStatus?.attributes?.stale;
    const view = { home: () => this._homeView(), scores: () => this._scoresView(),
      teams: () => this._teamsView(), players: () => this._playersView(), stats: () => this._statsView() };
    return html`
      <ha-card class="shell">
        <header class="hero"><div class="eyebrow">THE ASSOCIATION · HOME ASSISTANT</div>
          <h1>${this._config.title}</h1><div class="subtitle">${this._config.subtitle}</div>
          <div class="meta"><span class="dot"></span><span>NBA DATA</span><span>·</span>
            <span>${this.hass ? "CONNECTED TO HOME ASSISTANT" : "WAITING FOR HOME ASSISTANT"}</span>
            ${dataStatus ? html`<span class="data-health ${degraded ? "degraded" : "healthy"}">${degraded ? "DONNÉES PARTIELLES" : "FLUX À JOUR"}</span>` : ""}</div>
          ${degraded ? html`<div class="data-warning">Certaines sources ESPN sont indisponibles. Les dernières données valides sont conservées. Consultez l'attribut <strong>errors</strong> du capteur d'état pour le détail.</div>` : ""}
        </header>
        <nav aria-label="NBA Center navigation">${VIEWS.map((v) => html`
          <button type="button" data-view=${v.id} aria-selected=${v.id===this._active}
            @click=${() => this._selectView(v.id)}>${v.label}</button>`)}</nav>
        <main>${this.hass ? view[active.id]() : html`
          <section class="empty"><strong>Connexion à Home Assistant…</strong><p>La carte attend les états de l'intégration NBA.</p></section>`}</main>
        ${this._seriesOverlay && !this._overlayGame ? this._playoffSeriesOverlay() : ""}
        ${this._overlayGame ? html`<div class="overlay" @click=${(event) => { if (event.target === event.currentTarget) this._closeOverlay(); }} @keydown=${this._onOverlayKeydown}>
          <section class="overlay-panel" role="dialog" aria-modal="true" aria-label="Détails du match">
            <header class="overlay-head"><h2>MATCH CENTER</h2><div class="overlay-actions">
              <button class="overlay-refresh" ?disabled=${this._overlayLoading} @click=${() => this._openGame(this._overlayGame)} aria-label="Actualiser les détails du match">${this._overlayLoading ? "CHARGEMENT…" : "↻ ACTUALISER"}</button>
              <button class="overlay-close" aria-label="Fermer" @click=${this._closeOverlay}>✕</button>
            </div></header>
            <div class="overlay-body"><div class="overlay-teams">
              <div class="overlay-team">${this._overlayGame.away?.logo ? html`<img src=${this._overlayGame.away.logo} alt="">` : ""}<strong>${value(this._overlayGame.away?.name)}</strong></div>
              <div class="overlay-score">${this._overlayGame.state === "pre" ? "VS" : `${value(this._overlayGame.away?.score)} – ${value(this._overlayGame.home?.score)}`}</div>
              <div class="overlay-team">${this._overlayGame.home?.logo ? html`<img src=${this._overlayGame.home.logo} alt="">` : ""}<strong>${value(this._overlayGame.home?.name)}</strong></div>
            </div><p class="muted" style="text-align:center">${value(this._overlayGame.date_text)} · ${value(this._overlayGame.detail, this._gameStatus(this._overlayGame).label)}</p>
            ${this._overlayLoading ? html`<section class="empty">Chargement du résumé…</section>` : ""}
            ${(this._overlayError || this._overlayDetails?.error) ? html`<section class="empty"><p>${value(this._overlayError || this._overlayDetails?.error, "Détails du match indisponibles.")}</p><button @click=${() => this._openGame(this._overlayGame)}>RÉESSAYER</button></section>` : ""}
            ${this._overlayDetails?.teams?.length ? html`<div class="game-leaders-grid">${this._awayFirst(this._overlayDetails.teams).map((team) => html`
              <section class="panel game-leader-card"><div class="panel-head"><h3>${value(team.abbr, team.name)}</h3><span class="pill">LEADERS</span></div>
                ${(team.top_players ?? []).length ? team.top_players.map((player) => html`<div class="game-leader"><span class="game-leader-category">${value(player.category)}</span><span class="game-leader-name">${value(player.player)}</span><strong class="game-leader-value">${value(player.value)}</strong></div>`) : html`<div class="game-leaders-empty">Statistiques des leaders indisponibles.</div>`}</section>`)}</div>` : ""}
            ${this._quarterScorePanel()}
            ${this._overlayDetails?.has_boxscore ? html`
              <div class="boxscore-section"><div class="section-kicker">FULL GAME BREAKDOWN</div><h3>BOX SCORE · JOUEURS</h3>
                <div class="boxscore-grid">${this._awayFirst(this._overlayDetails.player_stats, (block) => this._overlayDetails.team_stats?.find((team) => team.team_id === block.team_id)?.home_away).map((block) => this._boxscorePanel(block))}</div>
                ${this._teamStatsPanel()}
              </div>` : ""}
            ${this._playByPlayPanel()}
            ${!this._overlayLoading && !this._overlayError && !this._overlayDetails?.error && !this._overlayDetails?.teams?.length && !this._overlayDetails?.has_boxscore ? html`<section class="empty"><p>Le résumé détaillé n’est pas encore disponible pour cette rencontre.</p></section>` : ""}            </div></section></div>` : ""}
        ${this._teamOverlay && !this._overlayGame ? this._teamRosterPanel() : ""}
        ${this._playerOverlay ? this._playerProfilePanel() : ""}
        <footer class="footer"><span>NBA CENTER · ${active.label}</span><span>JS ${BUILD_VERSION}</span></footer>
      </ha-card>`;
  }

  static getStubConfig() { return { title: "NBA CENTER", subtitle: "Your league. Your teams. One center." }; }
}

if (!customElements.get("nba-center-card")) customElements.define("nba-center-card", NBACenterCard);
window.customCards = window.customCards ?? [];
console.info(`[NBA Center] JS build ${BUILD_VERSION}`);
if (!window.customCards.some((card) => card.type === "nba-center-card")) {
  window.customCards.push({ type: "nba-center-card", name: "NBA Center",
    description: "NBA Dark dashboard — scores, teams, players and stats", preview: true });
}
