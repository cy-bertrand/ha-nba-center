var d=[{id:"home",label:"HOME"},{id:"scores",label:"SCORES"},{id:"teams",label:"TEAMS"},{id:"players",label:"PLAYERS"},{id:"stats",label:"STATS"}],o={points:["POINTS","marque"],rebounds:["REBONDS","rebon"],assists:["PASSES","passe"],steals:["INTERCEPTIONS","inter"],blocks:["CONTRES","contr"]},c={games:"sensor.nba_matchs_du_jour",east:"sensor.nba_classement_est",west:"sensor.nba_classement_ouest",points:"sensor.nba_meilleurs_marqueurs",rebounds:"sensor.nba_meilleurs_rebondeurs",assists:"sensor.nba_meilleurs_passeurs",steals:"sensor.nba_meilleurs_intercepteurs",blocks:"sensor.nba_meilleurs_contreurs"},n=(r,e="\u2014")=>r==null||r===""?e:String(r),m=r=>{if(!r)return"Date \xE0 confirmer";let e=new Date(r);return Number.isNaN(e.getTime())?n(r):new Intl.DateTimeFormat(void 0,{weekday:"short",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(e)},p=class extends LitElement{static properties={hass:{attribute:!1},_active:{state:!0},_filter:{state:!0},_search:{state:!0}};static styles=css`
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
    .record{text-align:right;font-size:11px;font-weight:800;color:#dce3ef}\n    .recent{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}\n    .form-chip{display:flex;align-items:center;gap:5px;padding:5px 7px;border:1px solid #2b3b52;border-radius:7px;color:#aab6ca;font-size:9px}\n    .form-chip strong{font-size:9px}\n    .form-chip.win strong{color:#72d5a0}\n    .form-chip.loss strong{color:#ff8b91}
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
    .footer{display:flex;justify-content:space-between;gap:10px;padding:12px 22px;color:#738199;border-top:1px solid #ffffff12;font-size:9px;letter-spacing:.06em}
    @media(max-width:620px){.hero{padding:20px 17px 17px}main{padding:15px}nav{padding:8px 7px}button{min-width:66px;padding:9px 10px}.grid{grid-template-columns:1fr}.game{grid-template-columns:1fr;gap:7px}.status{text-align:left}.matchup{gap:6px}.team-name{font-size:10px}.score{font-size:15px}.footer{padding:11px 15px}.meta{margin-top:11px}}
  `;constructor(){super(),this._active="home",this._filter="all",this._search="",this._config={}}setConfig(e){if(!e||typeof e!="object"||Array.isArray(e))throw new Error("Configuration NBA Center invalide : un objet YAML est attendu.");this._config={title:"NBA CENTER",subtitle:"Your league. Your teams. One center.",...e,entities:{...c,...e.entities??{}}}}getCardSize(){return 8}get _states(){return this.hass?.states??{}}_state(e){return e?this._states[e]:void 0}_find(e){return Object.values(this._states).find(e)}_entity(e,a){return this._state(this._config.entities?.[e])??this._find(a)}_games(){let e=this._entity("games",a=>Array.isArray(a.attributes?.games)&&!a.attributes?.team_id);return{state:e,rows:e?.attributes?.games??[]}}_standings(e){let a=this._entity(e,t=>{if(!Array.isArray(t.attributes?.standings))return!1;let s=t.entity_id.toLowerCase();return e==="east"?s.includes("classement_est")||s.includes("eastern"):s.includes("classement_ouest")||s.includes("western")});return{state:a,rows:a?.attributes?.standings??[]}}_leaders(e){let a=o[e][1],t=this._entity(e,s=>Array.isArray(s.attributes?.leaders)&&(s.attributes?.category??"").toLowerCase().includes(a));return{state:t,rows:t?.attributes?.leaders??[]}}_teams(){let e={};for(let a of Object.values(this._states)){let t=a.attributes??{};if(!a.entity_id.startsWith("sensor.")||!t.team_id)continue;let s=String(t.team_id),i=(t.friendly_name??a.entity_id).toLowerCase(),l=e[s]??={id:s,name:(t.friendly_name??s).replace(/ (dernier match|prochain match|match en cours|derniers matchs)$/i,""),logo:t.team_logo};l.logo??=t.team_logo,i.includes("dernier match")&&(l.last=t),i.includes("prochain match")&&(l.next=t),i.includes("match en cours")&&(l.live=t),Array.isArray(t.games)&&(l.recent=t.games)}return Object.values(e).sort((a,t)=>a.name.localeCompare(t.name))}_selectView(e){this._active=e}_setFilter(e){this._filter=e}_setSearch(e){this._search=e.target.value??""}_gameStatus(e){return e.state==="in"?{label:e.clock?`LIVE \xB7 ${e.clock}`:"LIVE",live:!0}:e.state==="post"?{label:e.detail||"TERMIN\xC9",live:!1}:{label:e.time||"\xC0 VENIR",live:!1}}_gameCard(e){let a=e.home??{},t=e.away??{},s=this._gameStatus(e),i=e.state==="in"||e.state==="post";return html`
      <article class="game">
        <div class="game-main">
          <div class="game-date">${n(e.date_text,m(e.date))}</div>
          <div class="matchup">
            <div class="side away"><span class="team-name">${n(t.abbr,t.name)}</span>
              ${t.logo?html`<img class="logo" src=${t.logo} alt="" loading="lazy">`:""}</div>
            <div class="score ${i?"":"pending"}">${i?`${n(t.score)} \u2013 ${n(a.score)}`:"VS"}</div>
            <div class="side">${a.logo?html`<img class="logo" src=${a.logo} alt="" loading="lazy">`:""}
              <span class="team-name">${n(a.abbr,a.name)}</span></div>
          </div>
        </div>
        <div class="status ${s.live?"live":""}">${s.label}</div>
      </article>`}_filteredGames(e){let a=this._search.trim().toLowerCase();return e.filter(t=>{let s=this._filter==="all"||t.state===this._filter,i=`${t.home?.name??""} ${t.home?.abbr??""} ${t.away?.name??""} ${t.away?.abbr??""}`.toLowerCase();return s&&(!a||i.includes(a))})}_leaderPanel(e,a=5){let t=this._leaders(e).rows;return html`
      <section class="panel">
        <div class="panel-head"><h3>${o[e][0]}</h3><span class="pill">SAISON</span></div>
        ${t.length?html`<div class="leader-list">${t.slice(0,a).map((s,i)=>html`
          <div class="leader"><span class="rank">${n(s.rank,i+1)}</span>
            ${s.headshot?html`<img class="avatar" src=${s.headshot} alt="" loading="lazy">`:html`<div class="avatar"></div>`}
            <div class="player">${n(s.player)}<small>${n(s.team)}</small></div>
            <span class="stat">${n(s.value)}</span>
          </div>`)}</div>`:html`<p class="muted">Données de classement indisponibles.</p>`}
      </section>`}_standingsTable(e,a){let t=this._standings(e).rows;return html`
      <section class="panel">
        <div class="panel-head"><h3>${a}</h3><span class="pill">${t.length} ÉQUIPES</span></div>
        ${t.length?html`<div class="table-wrap"><table>
          <thead><tr><th>#</th><th>ÉQUIPE</th><th>V</th><th>D</th><th>%</th><th>GB</th></tr></thead>
          <tbody>${t.slice(0,15).map((s,i)=>html`
            <tr><td>${n(s.rank,i+1)}</td><td>${n(s.abbr,s.team)}</td><td>${n(s.wins)}</td>
            <td>${n(s.losses)}</td><td>${n(s.pct)}</td><td>${n(s.gb)}</td></tr>`)}</tbody>
        </table></div>`:html`<p class="muted">Classement indisponible.</p>`}
      </section>`}_teamPanel(e){let a=e.last,t=e.next;return html`
      <section class="panel">
        <div class="team-row">
          ${e.logo?html`<img class="logo large" src=${e.logo} alt="" loading="lazy">`:""}
          <div class="team-info"><strong>${e.name}</strong><small>Équipe favorite · ${e.id}</small></div>
          ${e.live?.state==="in"?html`<span class="pill accent">LIVE</span>`:""}
        </div>
        <div class="team-row"><div class="team-info"><small>DERNIER MATCH</small><strong>${n(a?.name,"Donn\xE9e indisponible")}</strong></div>
          <div class="record">${n(a?.away?.score)} – ${n(a?.home?.score)}</div></div>
        <div class="team-row"><div class="team-info"><small>PROCHAIN MATCH</small><strong>${n(t?.name,"Calendrier indisponible")}</strong>
          <small>${n(t?.date_text,"")}</small></div></div>
        ${e.recent?.length?html`
          <div class="muted" style="margin-top:10px">FORME RÉCENTE</div>
          <div class="recent">${e.recent.slice(0,5).map(s=>html`
            <span class="form-chip ${s.result==="V"?"win":"loss"}">
              <strong>${n(s.result)}</strong><span>${n(s.opp_abbr)}</span>
              <span>${n(s.team_score)}–${n(s.opp_score)}</span>
            </span>`)}</div>`:""}
      </section>`}_homeView(){let{rows:e}=this._games(),a=e.filter(i=>i.state==="in"),t=e.filter(i=>i.state==="pre").slice(0,4),s=this._teams();return html`
      <div class="head"><h2>TABLEAU DE BORD</h2><span class="pill">NBA DARK</span></div>
      <div class="grid">
        <section class="panel"><div class="panel-head"><h3>EN DIRECT</h3><span class="pill">${a.length} MATCHS</span></div>
          ${a.length?html`<div class="game-list">${a.map(i=>this._gameCard(i))}</div>`:html`<p class="muted">Aucun match en direct actuellement.</p>`}</section>
        <section class="panel"><div class="panel-head"><h3>À VENIR</h3><span class="pill">${t.length} MATCHS</span></div>
          ${t.length?html`<div class="game-list">${t.map(i=>this._gameCard(i))}</div>`:html`<p class="muted">Aucun prochain match dans le calendrier chargé.</p>`}</section>
        <section class="panel"><div class="panel-head"><h3>ÉQUIPES FAVORITES</h3><span class="pill">${s.length}</span></div>
          ${s.length?html`<div class="team-list">${s.slice(0,6).map(i=>html`
            <div class="team-row">${i.logo?html`<img class="logo" src=${i.logo} alt="">`:""}
              <div class="team-info"><strong>${i.name}</strong><small>${i.id}</small></div>
              <span class="muted">${n(i.next?.date_text,"\u2014")}</span></div>`)}</div>`:html`<p class="muted">Choisis tes équipes favorites dans la configuration de l'intégration NBA.</p>`}</section>
        ${this._leaderPanel("points",5)}
      </div>`}_scoresView(){let{rows:e,state:a}=this._games(),t=this._filteredGames(e);return html`
      <div class="head"><h2>SCORES & CALENDRIER</h2><span class="pill">${e.length} MATCHS CHARGÉS</span></div>
      <div class="filters">
        ${[["all","TOUS"],["in","LIVE"],["pre","\xC0 VENIR"],["post","TERMIN\xC9S"]].map(([s,i])=>html`
          <button class="chip" aria-pressed=${this._filter===s} @click=${()=>this._setFilter(s)}>${i}</button>`)}
        <input type="search" aria-label="Rechercher une équipe" placeholder="Filtrer une équipe…" .value=${this._search} @input=${this._setSearch}>
      </div>
      ${t.length?html`<div class="game-list">${t.map(s=>this._gameCard(s))}</div>`:html`<section class="empty"><strong>${a?.state==="unavailable"?"Donn\xE9es NBA indisponibles":"Aucun match correspondant"}</strong>
          <p>Vérifie la connexion de l'intégration ou modifie les filtres. Les matchs affichés proviennent du calendrier chargé par Home Assistant.</p></section>`}`}_teamsView(){let e=this._teams();return html`<div class="head"><h2>TEAMS CENTER</h2><span class="pill">${e.length} FAVORITES</span></div>
      ${e.length?html`<div class="grid">${e.map(a=>this._teamPanel(a))}</div>`:html`<section class="empty"><strong>Aucune équipe favorite détectée</strong><p>Sélectionne tes équipes favorites dans Paramètres → Appareils et services → NBA. Les fiches sont alimentées par les capteurs existants.</p></section>`}`}_playersView(){return html`<div class="head"><h2>PLAYERS CENTER</h2><span class="pill">LEADERS NBA</span></div>
      <div class="grid">${Object.keys(o).map(e=>this._leaderPanel(e,10))}</div>`}_statsView(){return html`<div class="head"><h2>STATS CENTER</h2><span class="pill">SAISON</span></div>
      <div class="grid">${this._standingsTable("east","EASTERN CONFERENCE")}${this._standingsTable("west","WESTERN CONFERENCE")}</div>
      <div class="grid" style="margin-top:12px">${Object.keys(o).map(e=>this._leaderPanel(e,5))}</div>`}render(){let e=d.find(t=>t.id===this._active)??d[0],a={home:()=>this._homeView(),scores:()=>this._scoresView(),teams:()=>this._teamsView(),players:()=>this._playersView(),stats:()=>this._statsView()};return html`
      <ha-card class="shell">
        <header class="hero"><div class="eyebrow">THE ASSOCIATION · HOME ASSISTANT</div>
          <h1>${this._config.title}</h1><div class="subtitle">${this._config.subtitle}</div>
          <div class="meta"><span class="dot"></span><span>NBA DATA</span><span>·</span>
            <span>${this.hass?"CONNECTED TO HOME ASSISTANT":"WAITING FOR HOME ASSISTANT"}</span></div>
        </header>
        <nav aria-label="NBA Center navigation">${d.map(t=>html`
          <button type="button" data-view=${t.id} aria-selected=${t.id===this._active}
            @click=${()=>this._selectView(t.id)}>${t.label}</button>`)}</nav>
        <main>${this.hass?a[e.id]():html`
          <section class="empty"><strong>Connexion à Home Assistant…</strong><p>La carte attend les états de l'intégration NBA.</p></section>`}</main>
        <footer class="footer"><span>NBA CENTER · ${e.label}</span><span>DATA VIA HOME ASSISTANT</span></footer>
      </ha-card>`}static getStubConfig(){return{title:"NBA CENTER",subtitle:"Your league. Your teams. One center."}}};customElements.get("nba-center-card")||customElements.define("nba-center-card",p);window.customCards=window.customCards??[];window.customCards.some(r=>r.type==="nba-center-card")||window.customCards.push({type:"nba-center-card",name:"NBA Center",description:"NBA Dark dashboard \u2014 scores, teams, players and stats",preview:!0});
