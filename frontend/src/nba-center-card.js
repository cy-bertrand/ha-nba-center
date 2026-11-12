import { LitElement, css, html } from "lit";

const VIEWS = [
  { id: "home", label: "HOME" },
  { id: "scores", label: "SCORES" },
  { id: "teams", label: "TEAMS" },
  { id: "players", label: "PLAYERS" },
  { id: "stats", label: "STATS" },
];

class NBACenterCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _active: { state: true },
  };

  static styles = css`
    :host { display:block; color:var(--primary-text-color); font-family:var(--paper-font-body1_-_font-family,Roboto,sans-serif); }
    * { box-sizing:border-box; }
    .shell { overflow:hidden; border:1px solid var(--divider-color); border-radius:18px; background:#0b1019; color:#f4f6fb; box-shadow:0 12px 32px #0005; }
    .hero { padding:22px 24px 18px; background:radial-gradient(ellipse at 85% 0%,#263b61 0,transparent 46%),linear-gradient(120deg,#111c2c,#090d15 75%); border-bottom:1px solid #ffffff14; }
    .eyebrow { color:#f0b84b; font-size:10px; font-weight:800; letter-spacing:.22em; }
    h1 { margin:7px 0 3px; font-size:clamp(23px,4vw,32px); line-height:1.1; letter-spacing:-.04em; font-weight:900; }
    .subtitle { color:#9eabc0; font-size:12px; }
    nav { display:flex; gap:5px; overflow-x:auto; padding:10px 12px; background:#0d1420; border-bottom:1px solid #ffffff12; }
    button { border:0; border-radius:9px; background:transparent; color:#8794a9; padding:10px 13px; min-width:74px; cursor:pointer; font:inherit; font-size:10px; font-weight:700; letter-spacing:.08em; white-space:nowrap; }
    button[aria-selected="true"] { background:#1b2b43; color:#f5c45e; box-shadow:inset 0 0 0 1px #d9a83d55; }
    button:focus-visible { outline:2px solid #f5c45e; outline-offset:2px; }
    main { padding:22px; min-height:230px; background:linear-gradient(180deg,#0b1019,#0c121d); }
    .section-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; }
    h2 { margin:0; font-size:18px; letter-spacing:-.02em; }
    .pill { border:1px solid #2c3b52; border-radius:999px; color:#9eabc0; padding:5px 9px; font-size:10px; }
    .empty { border:1px dashed #33445e; border-radius:14px; padding:22px; background:#101a29; }
    .empty strong { display:block; margin-bottom:7px; color:#e9edf5; font-size:14px; }
    .empty p { margin:0; color:#9eabc0; font-size:12px; line-height:1.6; max-width:620px; }
    .skeletons { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; margin-top:14px; }
    .sk { height:54px; border-radius:10px; background:linear-gradient(100deg,#141f30,#1b2a40,#141f30); }
    footer { display:flex; justify-content:space-between; gap:10px; padding:12px 22px; color:#738199; border-top:1px solid #ffffff12; font-size:10px; }
    @media(max-width:520px) { .hero{padding:18px 16px 15px} main{padding:16px} nav{padding:8px} button{min-width:65px;padding:9px 10px} .skeletons{grid-template-columns:1fr 1fr} footer{padding:11px 16px} }
  `;

  constructor() {
    super();
    this._active = "home";
    this._config = {};
  }

  setConfig(config) {
    this._config = config ?? {};
  }

  getCardSize() {
    return 6;
  }

  _selectView(view) {
    this._active = view;
  }

  render() {
    const active = VIEWS.find((view) => view.id === this._active) ?? VIEWS[0];
    return html`
      <ha-card class="shell">
        <header class="hero">
          <div class="eyebrow">THE ASSOCIATION · HOME ASSISTANT</div>
          <h1>NBA CENTER</h1>
          <div class="subtitle">Your league. Your teams. One center.</div>
        </header>
        <nav aria-label="NBA Center navigation">
          ${VIEWS.map((view) => html`
            <button type="button" data-view=${view.id}
              aria-selected=${view.id === this._active}
              @click=${() => this._selectView(view.id)}>${view.label}</button>
          `)}
        </nav>
        <main>
          <div class="section-head">
            <h2>${active.label}</h2>
            <span class="pill">NBA DARK</span>
          </div>
          <section class="empty">
            <strong>${active.id === "home" ? "Welcome to your NBA Center" : `${active.label} is being prepared`}</strong>
            <p>${active.id === "home"
              ? "Your NBA dashboard is ready for the next stage. Live scores, team information and player statistics will be connected through Home Assistant's backend."
              : "This section will be powered by the centralized NBA data coordinator. No external browser requests are made."}</p>
            <div class="skeletons" aria-hidden="true">
              <div class="sk"></div><div class="sk"></div><div class="sk"></div>
            </div>
          </section>
        </main>
        <footer><span>NBA CENTER · ${active.label}</span><span>DATA VIA HOME ASSISTANT</span></footer>
      </ha-card>
    `;
  }
}

if (!customElements.get("nba-center-card")) {
  customElements.define("nba-center-card", NBACenterCard);
}

window.customCards = window.customCards ?? [];
if (!window.customCards.some((card) => card.type === "nba-center-card")) {
  window.customCards.push({
    type: "nba-center-card",
    name: "NBA Center",
    description: "NBA Dark dashboard for Home Assistant",
    preview: true,
  });
}
