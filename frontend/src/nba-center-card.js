// NBA Center Lovelace card — reads only Home Assistant entity state. Lit is bundled locally.
import { LitElement, css, html } from "lit";

const VIEWS = [
  { id: "home", label: "HOME" },
  { id: "scores", label: "SCORES" },
  { id: "teams", label: "TEAMS" },
  { id: "players", label: "PLAYERS" },
  { id: "stats", label: "STATS" },
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
  east: "sensor.nba_classement_est",
  west: "sensor.nba_classement_ouest",
  points: "sensor.nba_meilleurs_marqueurs",
  rebounds: "sensor.nba_meilleurs_rebondeurs",
  assists: "sensor.nba_meilleurs_passeurs",
  steals: "sensor.nba_meilleurs_intercepteurs",
  blocks: "sensor.nba_meilleurs_contreurs",
};
const localDateISO = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
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
    _calendarLoading: { state: true }, _calendarError: { state: true },
    _overlayGame: { state: true }, _overlayDetails: { state: true },
    _overlayLoading: { state: true }, _overlayError: { state: true },
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
    .team-row:first-child{padding-top:0}
    .large{width:34px;height:34px}
    .team-info{min-width:0;flex:1}
    .team-info strong{display:block;font-size:12px}
    .team-info small{display:block;margin-top:3px;color:#8f9db2;font-size:10px}
    .record{text-align:right;font-size:11px;font-weight:800;color:#dce3ef}
    .recent{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
    .form-chip{display:flex;align-items:center;gap:5px;padding:5px 7px;border:1px solid #2b3b52;border-radius:7px;color:#aab6ca;font-size:9px}
    .form-chip strong{font-size:9px}
    .form-chip.win strong{color:#72d5a0}
    .form-chip.loss strong{color:#ff8b91}
    .leader{display:grid;grid-template-columns:24px 34px minmax(0,1fr) auto;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #ffffff10}
    .leader:last-child{border-bottom:0}
    .rank{color:#8190a7;font-size:10px;font-weight:900}
    .avatar{width:32px;height:32px;object-fit:cover;border-radius:50%;background:#25344a}
    .player{min-width:0;font-size:11px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .player small{display:block;color:#8f9db2;font-size:9px;margin-top:3px;font-weight:500}
    .stat{color:#f2c45f;font-size:13px;font-weight:900;font-variant-numeric:tabular-nums}
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
    .overlay-score{font-size:24px;font-weight:950;color:#f2c45f}.overlay-close{min-width:38px;padding:8px;border:1px solid #34465f}
    .top-player{padding:12px 0;border-top:1px solid #ffffff12}.top-player strong{display:block;font-size:12px}.top-player small{color:#aab6ca}
    @media(max-width:620px){.overlay{padding:8px}.overlay-panel{max-height:94vh}}
    .footer{display:flex;justify-content:space-between;gap:10px;padding:12px 22px;color:#738199;border-top:1px solid #ffffff12;font-size:9px;letter-spacing:.06em}
    @media(max-width:620px){.hero{padding:20px 17px 17px}main{padding:15px}nav{padding:8px 7px}button{min-width:66px;padding:9px 10px}.grid{grid-template-columns:1fr}.game{grid-template-columns:1fr;gap:7px}.status{text-align:left}.matchup{gap:6px}.team-name{font-size:10px}.score{font-size:15px}.footer{padding:11px 15px}.meta{margin-top:11px}}
  `;

  constructor() {
    super();
    this._active = "home";
    this._filter = "all";
    this._search = "";
    this._selectedDate = localDateISO();
    this._calendarGames = []; this._calendarLoading = false; this._calendarError = "";
    this._overlayGame = null; this._overlayDetails = null;
    this._overlayLoading = false; this._overlayError = "";
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

  _leaders(key) {
    const fragment = LEADERS[key][1];
    const state = this._entity(key, (s) =>
      Array.isArray(s.attributes?.leaders) &&
      (s.attributes?.category ?? "").toLowerCase().includes(fragment)
    );
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

  _selectView(view) { this._active = view; if (view === "scores") this._loadCalendar(this._selectedDate); }
  _setFilter(filter) { this._filter = filter; }
  _setSearch(event) { this._search = event.target.value ?? ""; }
  _shiftDate(days) { const d = new Date(`${this._selectedDate}T12:00:00`); d.setDate(d.getDate() + days); this._selectedDate = d.toLocaleDateString("en-CA"); this._loadCalendar(this._selectedDate); }
  _setDate(event) { this._selectedDate = event.target.value; this._loadCalendar(this._selectedDate); }
  async _loadCalendar(date) {
    if (!this.hass?.callWS || !date) return;
    this._calendarLoading = true; this._calendarError = "";
    try { const result = await this.hass.callWS({ type: "nba/scoreboard", date }); this._calendarGames = result.games ?? []; }
    catch (err) { this._calendarError = err?.message ?? "Impossible de charger le calendrier NBA."; this._calendarGames = []; }
    finally { this._calendarLoading = false; }
  }
  async _openGame(game) {
    this._overlayGame = game; this._overlayDetails = null; this._overlayError = ""; this._overlayLoading = true;
    try { this._overlayDetails = await this.hass.callWS({ type: "nba/game_details", game_id: String(game.id) }); }
    catch (err) { this._overlayError = err?.message ?? "Résumé du match indisponible."; }
    finally { this._overlayLoading = false; }
  }
  _closeOverlay() { this._overlayGame = null; this._overlayDetails = null; this._overlayError = ""; }
  _onOverlayKeydown(event) { if (event.key === "Escape") this._closeOverlay(); }

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

  _leaderPanel(key, limit = 5) {
    const rows = this._leaders(key).rows;
    return html`
      <section class="panel">
        <div class="panel-head"><h3>${LEADERS[key][0]}</h3><span class="pill">SAISON</span></div>
        ${rows.length ? html`<div class="leader-list">${rows.slice(0, limit).map((p, i) => html`
          <div class="leader"><span class="rank">${value(p.rank, i + 1)}</span>
            ${p.headshot ? html`<img class="avatar" src=${p.headshot} alt="" loading="lazy">` : html`<div class="avatar"></div>`}
            <div class="player">${value(p.player)}<small>${value(p.team)}</small></div>
            <span class="stat">${value(p.value)}</span>
          </div>`)}</div>` : html`<p class="muted">Données de classement indisponibles.</p>`}
      </section>`;
  }

  _standingsTable(slug, label) {
    const rows = this._standings(slug).rows;
    return html`
      <section class="panel">
        <div class="panel-head"><h3>${label}</h3><span class="pill">${rows.length} ÉQUIPES</span></div>
        ${rows.length ? html`<div class="table-wrap"><table>
          <thead><tr><th>#</th><th>ÉQUIPE</th><th>V</th><th>D</th><th>%</th><th>GB</th></tr></thead>
          <tbody>${rows.slice(0,15).map((r,i) => html`
            <tr><td>${value(r.rank,i+1)}</td><td>${value(r.abbr,r.team)}</td><td>${value(r.wins)}</td>
            <td>${value(r.losses)}</td><td>${value(r.pct)}</td><td>${value(r.gb)}</td></tr>`)}</tbody>
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
            <span class="form-chip ${game.result === "V" ? "win" : "loss"}">
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
        <button @click=${() => { this._selectedDate = new Date().toLocaleDateString("en-CA"); this._loadCalendar(this._selectedDate); }}>AUJOURD&#39;HUI</button></div>
      <div class="filters">${[["all","TOUS"],["in","LIVE"],["pre","À VENIR"],["post","TERMINÉS"]].map(([k,l]) => html`<button class="chip" aria-pressed=${this._filter===k} @click=${() => this._setFilter(k)}>${l}</button>`)}
        <input type="search" aria-label="Rechercher une équipe" placeholder="Filtrer une équipe…" .value=${this._search} @input=${this._setSearch}></div>
      ${this._calendarLoading ? html`<section class="empty">Chargement du calendrier…</section>` : ""}
      ${this._calendarError ? html`<section class="empty"><strong>Calendrier indisponible</strong><p>${this._calendarError}</p><button @click=${() => this._loadCalendar(this._selectedDate)}>RÉESSAYER</button></section>` : ""}
      ${!this._calendarLoading && !this._calendarError && filtered.length ? html`<div class="game-list">${filtered.map((g) => this._gameCard(g))}</div>` : ""}
      ${!this._calendarLoading && !this._calendarError && !filtered.length ? html`<section class="empty"><strong>${rows.length ? "Aucun match correspondant" : "Aucun match programmé"}</strong><p>${rows.length ? "Modifie les filtres ou la recherche." : "Aucune rencontre n&#39;est prévue pour cette date dans le fuseau horaire de Home Assistant."}</p></section>` : ""}
    `;
  }
  _teamsView() {
    const teams = this._teams();
    return html`<div class="head"><h2>TEAMS CENTER</h2><span class="pill">${teams.length} FAVORITES</span></div>
      ${teams.length ? html`<div class="grid">${teams.map((t) => this._teamPanel(t))}</div>` :
        html`<section class="empty"><strong>Aucune équipe favorite détectée</strong><p>Sélectionne tes équipes favorites dans Paramètres → Appareils et services → NBA. Les fiches sont alimentées par les capteurs existants.</p></section>`}`;
  }

  _playersView() {
    return html`<div class="head"><h2>PLAYERS CENTER</h2><span class="pill">LEADERS NBA</span></div>
      <div class="grid">${Object.keys(LEADERS).map((key) => this._leaderPanel(key,10))}</div>`;
  }

  _statsView() {
    return html`<div class="head"><h2>STATS CENTER</h2><span class="pill">SAISON</span></div>
      <div class="grid">${this._standingsTable("east","EASTERN CONFERENCE")}${this._standingsTable("west","WESTERN CONFERENCE")}</div>
      <div class="grid" style="margin-top:12px">${Object.keys(LEADERS).map((key) => this._leaderPanel(key,5))}</div>`;
  }

  render() {
    const active = VIEWS.find((v) => v.id === this._active) ?? VIEWS[0];
    const view = { home: () => this._homeView(), scores: () => this._scoresView(),
      teams: () => this._teamsView(), players: () => this._playersView(), stats: () => this._statsView() };
    return html`
      <ha-card class="shell">
        <header class="hero"><div class="eyebrow">THE ASSOCIATION · HOME ASSISTANT</div>
          <h1>${this._config.title}</h1><div class="subtitle">${this._config.subtitle}</div>
          <div class="meta"><span class="dot"></span><span>NBA DATA</span><span>·</span>
            <span>${this.hass ? "CONNECTED TO HOME ASSISTANT" : "WAITING FOR HOME ASSISTANT"}</span></div>
        </header>
        <nav aria-label="NBA Center navigation">${VIEWS.map((v) => html`
          <button type="button" data-view=${v.id} aria-selected=${v.id===this._active}
            @click=${() => this._selectView(v.id)}>${v.label}</button>`)}</nav>
        <main>${this.hass ? view[active.id]() : html`
          <section class="empty"><strong>Connexion à Home Assistant…</strong><p>La carte attend les états de l'intégration NBA.</p></section>`}</main>
        ${this._overlayGame ? html`<div class="overlay" @click=${(event) => { if (event.target === event.currentTarget) this._closeOverlay(); }} @keydown=${this._onOverlayKeydown}>
          <section class="overlay-panel" role="dialog" aria-modal="true" aria-label="Détails du match">
            <header class="overlay-head"><h2>MATCH CENTER</h2><button class="overlay-close" aria-label="Fermer" @click=${this._closeOverlay}>✕</button></header>
            <div class="overlay-body"><div class="overlay-teams">
              <div class="overlay-team">${this._overlayGame.away?.logo ? html`<img src=${this._overlayGame.away.logo} alt="">` : ""}<strong>${value(this._overlayGame.away?.name)}</strong></div>
              <div class="overlay-score">${this._overlayGame.state === "pre" ? "VS" : `${value(this._overlayGame.away?.score)} – ${value(this._overlayGame.home?.score)}`}</div>
              <div class="overlay-team">${this._overlayGame.home?.logo ? html`<img src=${this._overlayGame.home.logo} alt="">` : ""}<strong>${value(this._overlayGame.home?.name)}</strong></div>
            </div><p class="muted" style="text-align:center">${value(this._overlayGame.date_text)} · ${value(this._overlayGame.detail, this._gameStatus(this._overlayGame).label)}</p>
            ${this._overlayLoading ? html`<section class="empty">Chargement du résumé…</section>` : ""}
            ${this._overlayError ? html`<section class="empty"><p>${this._overlayError}</p><button @click=${() => this._openGame(this._overlayGame)}>RÉESSAYER</button></section>` : ""}
            ${this._overlayDetails?.teams?.length ? html`<div class="grid">${this._overlayDetails.teams.map((team) => html`
              <section class="panel"><div class="panel-head"><h3>${value(team.abbr, team.name)}</h3><span class="pill">${value(team.score)}</span></div>
                ${team.quarters?.length ? html`<div class="muted">QUART-TEMPS · ${team.quarters.join(" / ")}</div>` : ""}
                ${(team.top_players ?? []).map((player) => html`<div class="top-player"><strong>${value(player.player)}</strong><small>${value(player.category)} · ${value(player.value)}</small></div>`)}</section>`)}</div>` : ""}
            ${!this._overlayLoading && !this._overlayError && !this._overlayDetails?.teams?.length ? html`<section class="empty"><p>Le résumé détaillé n’est pas encore disponible pour cette rencontre.</p></section>` : ""}
            </div></section></div>` : ""}
        <footer class="footer"><span>NBA CENTER · ${active.label}</span><span>DATA VIA HOME ASSISTANT</span></footer>
      </ha-card>`;
  }

  static getStubConfig() { return { title: "NBA CENTER", subtitle: "Your league. Your teams. One center." }; }
}

if (!customElements.get("nba-center-card")) customElements.define("nba-center-card", NBACenterCard);
window.customCards = window.customCards ?? [];
if (!window.customCards.some((card) => card.type === "nba-center-card")) {
  window.customCards.push({ type: "nba-center-card", name: "NBA Center",
    description: "NBA Dark dashboard — scores, teams, players and stats", preview: true });
}
