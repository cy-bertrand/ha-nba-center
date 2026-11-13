var D=globalThis,I=D.ShadowRoot&&(D.ShadyCSS===void 0||D.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,M=Symbol(),se=new WeakMap,S=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==M)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(I&&e===void 0){let s=t!==void 0&&t.length===1;s&&(e=se.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&se.set(t,e))}return e}toString(){return this.cssText}},ae=o=>new S(typeof o=="string"?o:o+"",void 0,M),H=(o,...e)=>{let t=o.length===1?o[0]:e.reduce((s,a,i)=>s+(l=>{if(l._$cssResult$===!0)return l.cssText;if(typeof l=="number")return l;throw Error("Value passed to 'css' function must be a 'css' function result: "+l+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(a)+o[i+1],o[0]);return new S(t,o,M)},ie=(o,e)=>{if(I)o.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let s=document.createElement("style"),a=D.litNonce;a!==void 0&&s.setAttribute("nonce",a),s.textContent=t.cssText,o.appendChild(s)}},j=I?o=>o:o=>o instanceof CSSStyleSheet?(e=>{let t="";for(let s of e.cssRules)t+=s.cssText;return ae(t)})(o):o;var{is:ve,defineProperty:$e,getOwnPropertyDescriptor:xe,getOwnPropertyNames:we,getOwnPropertySymbols:Ee,getPrototypeOf:Ae}=Object,L=globalThis,re=L.trustedTypes,Se=re?re.emptyScript:"",Ce=L.reactiveElementPolyfillSupport,C=(o,e)=>o,B={toAttribute(o,e){switch(e){case Boolean:o=o?Se:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,e){let t=o;switch(e){case Boolean:t=o!==null;break;case Number:t=o===null?null:Number(o);break;case Object:case Array:try{t=JSON.parse(o)}catch{t=null}}return t}},ne=(o,e)=>!ve(o,e),oe={attribute:!0,type:String,converter:B,reflect:!1,useDefault:!1,hasChanged:ne};Symbol.metadata??=Symbol("metadata"),L.litPropertyMetadata??=new WeakMap;var f=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=oe){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let s=Symbol(),a=this.getPropertyDescriptor(e,s,t);a!==void 0&&$e(this.prototype,e,a)}}static getPropertyDescriptor(e,t,s){let{get:a,set:i}=xe(this.prototype,e)??{get(){return this[t]},set(l){this[t]=l}};return{get:a,set(l){let c=a?.call(this);i?.call(this,l),this.requestUpdate(e,c,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??oe}static _$Ei(){if(this.hasOwnProperty(C("elementProperties")))return;let e=Ae(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(C("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(C("properties"))){let t=this.properties,s=[...we(t),...Ee(t)];for(let a of s)this.createProperty(a,t[a])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[s,a]of t)this.elementProperties.set(s,a)}this._$Eh=new Map;for(let[t,s]of this.elementProperties){let a=this._$Eu(t,s);a!==void 0&&this._$Eh.set(a,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let s=new Set(e.flat(1/0).reverse());for(let a of s)t.unshift(j(a))}else e!==void 0&&t.push(j(e));return t}static _$Eu(e,t){let s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ie(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){let s=this.constructor.elementProperties.get(e),a=this.constructor._$Eu(e,s);if(a!==void 0&&s.reflect===!0){let i=(s.converter?.toAttribute!==void 0?s.converter:B).toAttribute(t,s.type);this._$Em=e,i==null?this.removeAttribute(a):this.setAttribute(a,i),this._$Em=null}}_$AK(e,t){let s=this.constructor,a=s._$Eh.get(e);if(a!==void 0&&this._$Em!==a){let i=s.getPropertyOptions(a),l=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:B;this._$Em=a;let c=l.fromAttribute(t,i.type);this[a]=c??this._$Ej?.get(a)??c,this._$Em=null}}requestUpdate(e,t,s,a=!1,i){if(e!==void 0){let l=this.constructor;if(a===!1&&(i=this[e]),s??=l.getPropertyOptions(e),!((s.hasChanged??ne)(i,t)||s.useDefault&&s.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(l._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:a,wrapped:i},l){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,l??t??this[e]),i!==!0||l!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),a===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[a,i]of this._$Ep)this[a]=i;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[a,i]of s){let{wrapped:l}=i,c=this[a];l!==!0||this._$AL.has(a)||c===void 0||this.C(a,void 0,i,c)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};f.elementStyles=[],f.shadowRootOptions={mode:"open"},f[C("elementProperties")]=new Map,f[C("finalized")]=new Map,Ce?.({ReactiveElement:f}),(L.reactiveElementVersions??=[]).push("2.1.2");var Y=globalThis,le=o=>o,U=Y.trustedTypes,ce=U?U.createPolicy("lit-html",{createHTML:o=>o}):void 0,ge="$lit$",b=`lit$${Math.random().toFixed(9).slice(2)}$`,fe="?"+b,Re=`<${fe}>`,x=document,T=()=>x.createComment(""),O=o=>o===null||typeof o!="object"&&typeof o!="function",K=Array.isArray,Te=o=>K(o)||typeof o?.[Symbol.iterator]=="function",q=`[ 	
\f\r]`,R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,de=/-->/g,pe=/>/g,v=RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),he=/'/g,me=/"/g,_e=/^(?:script|style|textarea|title)$/i,Q=o=>(e,...t)=>({_$litType$:o,strings:e,values:t}),r=Q(1),He=Q(2),je=Q(3),w=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),ue=new WeakMap,$=x.createTreeWalker(x,129);function be(o,e){if(!K(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return ce!==void 0?ce.createHTML(e):e}var Oe=(o,e)=>{let t=o.length-1,s=[],a,i=e===2?"<svg>":e===3?"<math>":"",l=R;for(let c=0;c<t;c++){let d=o[c],h,u,p=-1,g=0;for(;g<d.length&&(l.lastIndex=g,u=l.exec(d),u!==null);)g=l.lastIndex,l===R?u[1]==="!--"?l=de:u[1]!==void 0?l=pe:u[2]!==void 0?(_e.test(u[2])&&(a=RegExp("</"+u[2],"g")),l=v):u[3]!==void 0&&(l=v):l===v?u[0]===">"?(l=a??R,p=-1):u[1]===void 0?p=-2:(p=l.lastIndex-u[2].length,h=u[1],l=u[3]===void 0?v:u[3]==='"'?me:he):l===me||l===he?l=v:l===de||l===pe?l=R:(l=v,a=void 0);let _=l===v&&o[c+1].startsWith("/>")?" ":"";i+=l===R?d+Re:p>=0?(s.push(h),d.slice(0,p)+ge+d.slice(p)+b+_):d+b+(p===-2?c:_)}return[be(o,i+(o[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]},P=class o{constructor({strings:e,_$litType$:t},s){let a;this.parts=[];let i=0,l=0,c=e.length-1,d=this.parts,[h,u]=Oe(e,t);if(this.el=o.createElement(h,s),$.currentNode=this.el.content,t===2||t===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(a=$.nextNode())!==null&&d.length<c;){if(a.nodeType===1){if(a.hasAttributes())for(let p of a.getAttributeNames())if(p.endsWith(ge)){let g=u[l++],_=a.getAttribute(p).split(b),k=/([.?@])?(.*)/.exec(g);d.push({type:1,index:i,name:k[2],strings:_,ctor:k[1]==="."?V:k[1]==="?"?F:k[1]==="@"?W:A}),a.removeAttribute(p)}else p.startsWith(b)&&(d.push({type:6,index:i}),a.removeAttribute(p));if(_e.test(a.tagName)){let p=a.textContent.split(b),g=p.length-1;if(g>0){a.textContent=U?U.emptyScript:"";for(let _=0;_<g;_++)a.append(p[_],T()),$.nextNode(),d.push({type:2,index:++i});a.append(p[g],T())}}}else if(a.nodeType===8)if(a.data===fe)d.push({type:2,index:i});else{let p=-1;for(;(p=a.data.indexOf(b,p+1))!==-1;)d.push({type:7,index:i}),p+=b.length-1}i++}}static createElement(e,t){let s=x.createElement("template");return s.innerHTML=e,s}};function E(o,e,t=o,s){if(e===w)return e;let a=s!==void 0?t._$Co?.[s]:t._$Cl,i=O(e)?void 0:e._$litDirective$;return a?.constructor!==i&&(a?._$AO?.(!1),i===void 0?a=void 0:(a=new i(o),a._$AT(o,t,s)),s!==void 0?(t._$Co??=[])[s]=a:t._$Cl=a),a!==void 0&&(e=E(o,a._$AS(o,e.values),a,s)),e}var G=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:s}=this._$AD,a=(e?.creationScope??x).importNode(t,!0);$.currentNode=a;let i=$.nextNode(),l=0,c=0,d=s[0];for(;d!==void 0;){if(l===d.index){let h;d.type===2?h=new N(i,i.nextSibling,this,e):d.type===1?h=new d.ctor(i,d.name,d.strings,this,e):d.type===6&&(h=new J(i,this,e)),this._$AV.push(h),d=s[++c]}l!==d?.index&&(i=$.nextNode(),l++)}return $.currentNode=x,a}p(e){let t=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}},N=class o{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,a){this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=E(this,e,t),O(e)?e===m||e==null||e===""?(this._$AH!==m&&this._$AR(),this._$AH=m):e!==this._$AH&&e!==w&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Te(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==m&&O(this._$AH)?this._$AA.nextSibling.data=e:this.T(x.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:s}=e,a=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=P.createElement(be(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===a)this._$AH.p(t);else{let i=new G(a,this),l=i.u(this.options);i.p(t),this.T(l),this._$AH=i}}_$AC(e){let t=ue.get(e.strings);return t===void 0&&ue.set(e.strings,t=new P(e)),t}k(e){K(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,s,a=0;for(let i of e)a===t.length?t.push(s=new o(this.O(T()),this.O(T()),this,this.options)):s=t[a],s._$AI(i),a++;a<t.length&&(this._$AR(s&&s._$AB.nextSibling,a),t.length=a)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let s=le(e).nextSibling;le(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},A=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,a,i){this.type=1,this._$AH=m,this._$AN=void 0,this.element=e,this.name=t,this._$AM=a,this.options=i,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=m}_$AI(e,t=this,s,a){let i=this.strings,l=!1;if(i===void 0)e=E(this,e,t,0),l=!O(e)||e!==this._$AH&&e!==w,l&&(this._$AH=e);else{let c=e,d,h;for(e=i[0],d=0;d<i.length-1;d++)h=E(this,c[s+d],t,d),h===w&&(h=this._$AH[d]),l||=!O(h)||h!==this._$AH[d],h===m?e=m:e!==m&&(e+=(h??"")+i[d+1]),this._$AH[d]=h}l&&!a&&this.j(e)}j(e){e===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},V=class extends A{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===m?void 0:e}},F=class extends A{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==m)}},W=class extends A{constructor(e,t,s,a,i){super(e,t,s,a,i),this.type=5}_$AI(e,t=this){if((e=E(this,e,t,0)??m)===w)return;let s=this._$AH,a=e===m&&s!==m||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,i=e!==m&&(s===m||a);a&&this.element.removeEventListener(this.name,this,s),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},J=class{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){E(this,e)}};var Pe=Y.litHtmlPolyfillSupport;Pe?.(P,N),(Y.litHtmlVersions??=[]).push("3.3.3");var ye=(o,e,t)=>{let s=t?.renderBefore??e,a=s._$litPart$;if(a===void 0){let i=t?.renderBefore??null;s._$litPart$=a=new N(e.insertBefore(T(),i),i,void 0,t??{})}return a._$AI(o),a};var X=globalThis,y=class extends f{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ye(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return w}};y._$litElement$=!0,y.finalized=!0,X.litElementHydrateSupport?.({LitElement:y});var Ne=X.litElementPolyfillSupport;Ne?.({LitElement:y});(X.litElementVersions??=[]).push("4.2.2");var Z=[{id:"home",label:"HOME"},{id:"scores",label:"SCORES"},{id:"teams",label:"TEAMS"},{id:"players",label:"PLAYERS"},{id:"stats",label:"STATS"}],z={points:["POINTS","marque"],rebounds:["REBONDS","rebon"],assists:["PASSES","passe"],steals:["INTERCEPTIONS","inter"],blocks:["CONTRES","contr"]},ke={games:"sensor.nba_matchs_du_jour",east:"sensor.nba_classement_est",west:"sensor.nba_classement_ouest",points:"sensor.nba_meilleurs_marqueurs",rebounds:"sensor.nba_meilleurs_rebondeurs",assists:"sensor.nba_meilleurs_passeurs",steals:"sensor.nba_meilleurs_intercepteurs",blocks:"sensor.nba_meilleurs_contreurs"},ee=(o=new Date,e)=>{let t=new Intl.DateTimeFormat("en-CA",{timeZone:e,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(o),s=a=>t.find(i=>i.type===a)?.value;return`${s("year")}-${s("month")}-${s("day")}`},De=(o,e)=>{let[t,s,a]=o.split("-").map(Number),i=new Date(Date.UTC(t,s-1,a+e,12));return[i.getUTCFullYear(),String(i.getUTCMonth()+1).padStart(2,"0"),String(i.getUTCDate()).padStart(2,"0")].join("-")},n=(o,e="\u2014")=>o==null||o===""?e:String(o),Ie=o=>{if(!o)return"Date \xE0 confirmer";let e=new Date(o);return Number.isNaN(e.getTime())?n(o):new Intl.DateTimeFormat(void 0,{weekday:"short",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(e)},te=class extends y{static properties={hass:{attribute:!1},_active:{state:!0},_filter:{state:!0},_search:{state:!0},_selectedDate:{state:!0},_calendarGames:{state:!0},_calendarLoading:{state:!0},_calendarError:{state:!0},_calendarStale:{state:!0},_overlayGame:{state:!0},_overlayDetails:{state:!0},_overlayLoading:{state:!0},_overlayError:{state:!0},_showAllPlays:{state:!0},_scoringOnly:{state:!0},_teamSearch:{state:!0},_teamConference:{state:!0},_teamOverlay:{state:!0},_teamRoster:{state:!0},_teamRosterLoading:{state:!0},_teamRosterError:{state:!0}};static styles=H`
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
    .team-row:first-child{padding-top:0}\n    .catalog-team{min-width:0;cursor:pointer;transition:border-color .15s,transform .15s}.catalog-team:hover{border-color:#bd9448;transform:translateY(-1px)}.catalog-team:focus-visible{outline:2px solid #f2c45f;outline-offset:2px}.catalog-favorite-note{margin-top:8px}
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
    .overlay-score{font-size:24px;font-weight:950;color:#f2c45f}.overlay-actions{display:flex;align-items:center;gap:7px}.overlay-refresh{min-width:0;padding:8px 10px;border:1px solid #34465f;color:#e8bb58;font-size:9px}.overlay-refresh:disabled{opacity:.55;cursor:wait}.overlay-close{min-width:38px;padding:8px;border:1px solid #34465f}
    .game-leaders-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}.game-leader-card{padding:12px;min-width:0}.game-leader-card .panel-head{margin-bottom:7px}.game-leader-card .panel-head h3{font-size:12px;letter-spacing:.08em}.game-leader{display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:8px;padding:8px 0;border-top:1px solid #ffffff12}.game-leader-category{color:#e8bb58;font-size:9px;font-weight:900;letter-spacing:.08em}.game-leader-name{font-size:11px;font-weight:750;overflow-wrap:anywhere}.game-leader-value{color:#f2c45f;font-size:13px;font-weight:950;font-variant-numeric:tabular-nums}.game-leaders-empty{color:#91a0b5;font-size:10px;padding:7px 0}@media(max-width:620px){.game-leaders-grid{grid-template-columns:1fr;gap:8px}.game-leader-card{padding:10px}.game-leader{padding:6px 0}}
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
    .team-roster-heading{display:flex;align-items:center;gap:12px}.roster-list{display:grid;gap:7px}.roster-player{display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:10px;padding:9px;border:1px solid #ffffff10;border-radius:10px;background:#101a29}.roster-headshot{width:40px;height:40px;object-fit:cover;border-radius:50%;background:#25344a}.roster-placeholder{background:#25344a}.roster-player-info{min-width:0}.roster-player-button{width:100%;text-align:left;color:inherit;font:inherit;cursor:pointer}.roster-player-button:hover,.roster-player-button:focus-visible{background:#1c2a40;border-color:#8da9d8;outline:none}.player-profile-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;margin-top:12px}.player-profile-grid>div{display:flex;flex-direction:column;gap:4px;padding:10px;background:#ffffff08;border-radius:8px}.player-profile-grid small{color:#8290a5;font-size:9px;letter-spacing:.07em}.player-profile-grid strong{font-size:13px;color:#eef3fb}.team-season-summary{margin-bottom:14px}.roster-player-info strong{display:block;font-size:11px}.roster-player-info small{display:block;color:#91a0b5;font-size:9px;margin-top:3px}.roster-player-info .roster-injury{color:#ffb66d}.roster-number{text-align:right}.roster-number strong{display:block;color:#f2c45f;font-size:12px}.roster-number small{display:block;color:#91a0b5;font-size:8px;margin-top:3px}.team-roster-overlay{width:min(620px,100%)}.team-roster-overlay .overlay-body{overflow-y:auto;overscroll-behavior:contain;scroll-behavior:smooth}.catalog-favorite-tracking{display:grid;gap:5px;margin-top:10px;padding-top:9px;border-top:1px solid #ffffff12;color:#aab6ca;font-size:9px;line-height:1.4;letter-spacing:.04em}\n    .footer{display:flex;justify-content:space-between;gap:10px;padding:12px 22px;color:#738199;border-top:1px solid #ffffff12;font-size:9px;letter-spacing:.06em}
    @media(max-width:620px){.hero{padding:20px 17px 17px}main{padding:15px}nav{padding:8px 7px}button{min-width:66px;padding:9px 10px}.grid{grid-template-columns:1fr}.game{grid-template-columns:1fr;gap:7px}.status{text-align:left}.matchup{gap:6px}.team-name{font-size:10px}.score{font-size:15px}.footer{padding:11px 15px}.meta{margin-top:11px}}
  `;constructor(){super(),this._active="home",this._filter="all",this._search="",this._teamSearch="",this._teamConference="all",this._teamOverlay=null,this._teamRoster=null,this._teamRosterLoading=!1,this._teamRosterError="",this._selectedPlayer=null,this._selectedDate=ee(),this._calendarGames=[],this._calendarLoading=!1,this._calendarError="",this._calendarStale=!1,this._calendarStaleError="",this._calendarRequest=0,this._calendarInitialized=!1,this._overlayGame=null,this._overlayDetails=null,this._overlayRequest=0,this._overlayLoading=!1,this._overlayError="",this._config={}}setConfig(e){if(!e||typeof e!="object"||Array.isArray(e))throw new Error("Configuration NBA Center invalide : un objet YAML est attendu.");this._config={title:"NBA CENTER",subtitle:"Your league. Your teams. One center.",...e,entities:{...ke,...e.entities??{}}}}getCardSize(){return 8}get _states(){return this.hass?.states??{}}_state(e){return e?this._states[e]:void 0}_find(e){return Object.values(this._states).find(e)}_entity(e,t){return this._state(this._config.entities?.[e])??this._find(t)}_games(){let e=this._entity("games",t=>Array.isArray(t.attributes?.games)&&!t.attributes?.team_id);return{state:e,rows:e?.attributes?.games??[]}}_standings(e){let t=this._entity(e,s=>{if(!Array.isArray(s.attributes?.standings))return!1;let a=s.entity_id.toLowerCase();return e==="east"?a.includes("classement_est")||a.includes("eastern"):a.includes("classement_ouest")||a.includes("western")});return{state:t,rows:t?.attributes?.standings??[]}}_leaders(e){let t=z[e][1],s=this._entity(e,a=>Array.isArray(a.attributes?.leaders)&&(a.attributes?.category??"").toLowerCase().includes(t));return{state:s,rows:s?.attributes?.leaders??[]}}_teams(){let e={};for(let t of Object.values(this._states)){let s=t.attributes??{};if(!t.entity_id.startsWith("sensor.")||!s.team_id)continue;let a=String(s.team_id),i=(s.friendly_name??t.entity_id).toLowerCase(),l=e[a]??={id:a,name:(s.friendly_name??a).replace(/ (dernier match|prochain match|match en cours|derniers matchs)$/i,""),logo:s.team_logo};l.logo??=s.team_logo,i.includes("dernier match")&&(l.last=s),i.includes("prochain match")&&(l.next=s),i.includes("match en cours")&&(l.live=s),Array.isArray(s.games)&&(l.recent=s.games)}return Object.values(e).sort((t,s)=>t.name.localeCompare(s.name))}_teamsCatalog(){let e=this._find(a=>a.entity_id?.startsWith("sensor.")&&Array.isArray(a.attributes?.teams)&&a.attributes?.expected_count===30),t=e?.attributes??{},s=new Map(this._teams().map(a=>[String(a.id),a]));return{state:e,complete:!!t.complete,count:Number(t.count??t.teams?.length??0),teams:(t.teams??[]).map(a=>({...a,favorite:s.has(String(a.id)),favoriteData:s.get(String(a.id))})).sort((a,i)=>(a.name??"").localeCompare(i.name??""))}}async _openTeam(e){this._teamOverlay=e,this._teamRoster=null,this._teamRosterError="",this._teamRosterLoading=!0;try{this._teamRoster=await this.hass.callWS({type:"nba/team_roster",team_id:String(e.id)})}catch(t){this._teamRosterError=t?.message??"Effectif indisponible."}finally{this._teamRosterLoading=!1}}_closeTeamOverlay(){this._teamOverlay=null,this._teamRoster=null,this._teamRosterLoading=!1,this._teamRosterError="",this._selectedPlayer=null}_teamRosterPanel(){let e=this._teamRoster?.players??[];return r`
      <div class="overlay" @click=${t=>{t.target===t.currentTarget&&this._closeTeamOverlay()}}>
        <section class="overlay-panel team-roster-overlay" role="dialog" aria-modal="true" aria-label="Effectif de l'équipe">
          <header class="overlay-head">
            <div class="team-roster-heading">
              ${this._teamOverlay?.logo?r`<img class="logo large" src=${this._teamOverlay.logo} alt="">`:""}
              <div><h2>${n(this._teamOverlay?.display_name,this._teamOverlay?.name)}</h2>
                <div class="muted">${n(this._teamOverlay?.abbreviation)} · ${n(this._teamRoster?.season,"Effectif NBA")}</div></div>
            </div>
            <button class="overlay-close" aria-label="Fermer la fiche équipe" @click=${this._closeTeamOverlay}>✕</button>
          </header>
          <div class="overlay-body">
            ${this._selectedPlayer?r`
              <section class="panel player-profile-card">
                <div class="panel-head"><h3>FICHE JOUEUR</h3><button class="chip" @click=${()=>{this._selectedPlayer=null}}>RETOUR À L'EFFECTIF</button></div>
                <div class="team-row">${this._selectedPlayer.headshot?r`<img class="roster-headshot" src=${this._selectedPlayer.headshot} alt="">`:""}
                  <div class="team-info"><strong>${n(this._selectedPlayer.name)}</strong><small>${n(this._selectedPlayer.position)} · ${this._selectedPlayer.jersey?`#${this._selectedPlayer.jersey}`:"N\xB0 \u2014"}</small></div></div>
                <div class="player-profile-grid">
                  <div><small>ÂGE</small><strong>${n(this._selectedPlayer.age)}</strong></div><div><small>TAILLE</small><strong>${this._selectedPlayer.height_cm==null?"\u2014":`${this._selectedPlayer.height_cm} cm`}</strong></div>
                  <div><small>POIDS</small><strong>${this._selectedPlayer.weight_kg==null?"\u2014":`${this._selectedPlayer.weight_kg.toLocaleString("fr-BE")} kg`}</strong></div><div><small>EXPÉRIENCE</small><strong>${this._selectedPlayer.experience_years==null?"\u2014":`${this._selectedPlayer.experience_years} ans`}</strong></div>
                  <div><small>STATUT</small><strong>${n(this._selectedPlayer.status)}</strong></div><div><small>UNIVERSITÉ / CLUB</small><strong>${n(this._selectedPlayer.college)}</strong></div>
                </div>
                ${this._selectedPlayer.injuries?.length?r`<p class="roster-injury">ÉTAT MÉDICAL ESPN : ${this._selectedPlayer.injuries.map(t=>n(t.status)).filter(Boolean).join(" \xB7 ")}</p>`:""}
              </section>`:""}
            ${!this._selectedPlayer&&this._teamRoster?.standing?r`
              <section class="panel team-season-summary">
                <div class="panel-head"><h3>SAISON RÉGULIÈRE</h3><span class="pill">${n(this._teamRoster.standing.rank,"\u2014")}e PLACE</span></div>
                <div class="player-profile-grid">
                  <div><small>BILAN</small><strong>${n(this._teamRoster.standing.wins)}–${n(this._teamRoster.standing.losses)}</strong></div>
                  <div><small>% VICTOIRES</small><strong>${n(this._teamRoster.standing.pct)}</strong></div>
                  <div><small>RETARD</small><strong>${n(this._teamRoster.standing.gb)}</strong></div><div><small>SÉRIE</small><strong>${n(this._teamRoster.standing.streak)}</strong></div>
                </div>
                ${this._teamRoster.schedule?.recent?.length?r`<div class="muted" style="margin-top:12px">FORME RÉCENTE</div><div class="recent">${this._teamRoster.schedule.recent.slice(0,5).map(t=>r`<span class="form-chip ${t.result==="V"?"win":"loss"}"><strong>${n(t.result)}</strong><span>${t.home_away==="@"?`@${n(t.opp_abbr)}`:n(t.opp_abbr)}</span><span>${n(t.team_score)}–${n(t.opp_score)}</span></span>`)}</div>`:""}
                ${this._teamRoster.schedule?.next?r`<p class="muted">PROCHAIN MATCH · ${n(this._teamRoster.schedule.next.date_text)} · ${n(this._teamRoster.schedule.next.name)}</p>`:""}
              </section>`:""}
            <div class="panel-head"><h3>${this._selectedPlayer?"AUTRES JOUEURS":"EFFECTIF"}</h3><span class="pill">${this._teamRoster?.count??0} JOUEURS</span></div>
            ${this._teamRosterLoading?r`<section class="empty">Chargement de l'effectif…</section>`:""}
            ${this._teamRosterError?r`<section class="empty"><strong>Effectif indisponible</strong><p>${this._teamRosterError}</p><button @click=${()=>this._openTeam(this._teamOverlay)}>RÉESSAYER</button></section>`:""}
            ${!this._teamRosterLoading&&!this._teamRosterError&&e.length?r`
              <div class="roster-list">${e.map(t=>r`
                <button class="roster-player roster-player-button" type="button" @click=${()=>this._selectRosterPlayer(t)}>
                  ${t.headshot?r`<img class="roster-headshot" src=${t.headshot} alt="" loading="lazy">`:r`<div class="roster-headshot roster-placeholder"></div>`}
                  <div class="roster-player-info"><strong>${n(t.name)}</strong>
                    <small>${n(t.position)} · ${t.height_cm==null?"\u2014":`${t.height_cm} cm`} · ${n(t.college,"Universit\xE9 non renseign\xE9e")}</small>
                    ${t.injuries?.length?r`<small class="roster-injury">${t.injuries.map(s=>n(s.status)).filter(Boolean).join(" \xB7 ")}</small>`:""}
                  </div>
                  <div class="roster-number"><strong>${t.jersey?`#${t.jersey}`:"\u2014"}</strong><small>${n(t.status)}</small></div>
                </button>`)}</div>`:""}
            ${!this._teamRosterLoading&&!this._teamRosterError&&!e.length?r`<section class="empty">Aucun joueur retourné par ESPN.</section>`:""}
          </div>
        </section>
      </div>`}_selectRosterPlayer(e){this._selectedPlayer=e,this.requestUpdate(),this.updateComplete.then(()=>{this.renderRoot?.querySelector(".team-roster-overlay .overlay-body")?.scrollTo({top:0,behavior:"smooth"})})}_setTeamSearch(e){this._teamSearch=e.target.value??""}_setTeamConference(e){this._teamConference=e}_selectView(e){this._active=e,e==="scores"&&(this._calendarInitialized||(this._selectedDate=ee(new Date,this.hass?.config?.time_zone),this._calendarInitialized=!0),this._loadCalendar(this._selectedDate))}_setFilter(e){this._filter=e}_setSearch(e){this._search=e.target.value??""}_shiftDate(e){this._selectedDate=De(this._selectedDate,e),this._loadCalendar(this._selectedDate)}_setDate(e){this._selectedDate=e.target.value,this._loadCalendar(this._selectedDate)}async _loadCalendar(e){if(!this.hass?.callWS||!e)return;let t=++this._calendarRequest;this._calendarLoading=!0,this._calendarError="",this._calendarStale=!1,this._calendarStaleError="";try{let s=await this.hass.callWS({type:"nba/scoreboard",date:e});if(t!==this._calendarRequest||e!==this._selectedDate)return;this._calendarGames=s.games??[],this._calendarStale=!!s.stale,this._calendarStaleError=s.error??""}catch(s){if(t!==this._calendarRequest||e!==this._selectedDate)return;this._calendarError=s?.message??"Impossible de charger le calendrier NBA.",this._calendarGames=[]}finally{t===this._calendarRequest&&(this._calendarLoading=!1)}}async _openGame(e){let t=++this._overlayRequest;this._overlayGame=e,this._overlayDetails=null,this._overlayError="",this._overlayLoading=!0,this._showAllPlays=!1,this._scoringOnly=!1;try{let s=await this.hass.callWS({type:"nba/game_details",game_id:String(e.id)});if(t!==this._overlayRequest||String(this._overlayGame?.id)!==String(e.id))return;this._overlayDetails=s}catch(s){if(t!==this._overlayRequest)return;this._overlayError=s?.message??"R\xE9sum\xE9 du match indisponible."}finally{t===this._overlayRequest&&(this._overlayLoading=!1)}}_closeOverlay(){this._overlayRequest+=1,this._overlayGame=null,this._overlayDetails=null,this._overlayLoading=!1,this._overlayError=""}_onOverlayKeydown(e){e.key==="Escape"&&this._closeOverlay()}_boxscorePanel(e){let t=e.players??[],s=["MIN","PTS","FG","3PT","FT","OREB","DREB","REB","AST","STL","BLK","TO","PF","+/-"],a=new Set(t.flatMap(c=>Object.keys(c.stats??{}))),i=[...s.filter(c=>a.has(c)),...[...a].filter(c=>!s.includes(c))],l=[...t].sort((c,d)=>+!!d.starter-+!!c.starter);return r`
      <section class="panel boxscore-panel">
        <div class="panel-head"><h3>${n(e.abbr,e.team)}</h3><span class="pill">${t.length} JOUEURS</span></div>
        ${l.length?r`<div class="table-wrap player-table-wrap"><table class="player-table">
          <thead><tr><th>JOUEUR</th>${i.map(c=>r`<th>${c}</th>`)}</tr></thead>
          <tbody>${l.map(c=>r`
            <tr class="${c.starter?"starter":""} ${c.did_not_play?"dnp":""}">
              <td><span class="player-cell">${c.headshot?r`<img src=${c.headshot} alt="" loading="lazy">`:""}<span>${n(c.name)}<small>${[c.jersey?`#${c.jersey}`:"",c.position||"",c.ejected?"\xC9JECT\xC9":c.did_not_play?`DNP \xB7 ${n(c.reason,"NON PRIS EN JEU")}`:c.starter?"TITULAIRE":c.active?"ACTIF":""].filter(Boolean).join(" \xB7 ")}</small></span></span></td>
              ${i.map(d=>r`<td>${n(c.stats?.[d])}</td>`)}
            </tr>`)}
          </tbody>
        </table></div>`:r`<p class="muted">Statistiques individuelles indisponibles.</p>`}
      </section>`}_awayFirst(e,t=s=>s.home_away){return[...e??[]].sort((s,a)=>{let i=l=>t(l)==="away"?0:1;return i(s)-i(a)})}_quarterScorePanel(){let e=this._awayFirst(this._overlayDetails?.teams),t=Math.max(0,...e.map(a=>a.quarters?.length??0));if(!t||!e.length)return"";let s=Array.from({length:t},(a,i)=>i<4?`Q${i+1}`:i===4?"OT":`${i-4+1}OT`);return r`
      <section class="panel quarter-score-panel">
        <div class="panel-head"><h3>SCORE PAR PÉRIODE</h3><span class="pill">${t>4?"PROLONGATION":"TEMPS R\xC9GLEMENTAIRE"}</span></div>
        <div class="table-wrap"><table>
          <thead><tr><th>ÉQUIPE</th>${s.map(a=>r`<th>${a}</th>`)}<th>TOTAL</th></tr></thead>
          <tbody>${e.map(a=>r`
            <tr><td>${n(a.abbr,a.name)}</td>
              ${s.map((i,l)=>r`<td>${n(a.quarters?.[l])}</td>`)}
              <td>${n(a.score)}</td>
            </tr>`)}</tbody>
        </table></div>
      </section>`}_teamStatsPanel(){let e=this._awayFirst(this._overlayDetails?.team_stats);if(!e.length)return"";let t=[...new Set(e.flatMap(s=>(s.statistics??[]).map(a=>a.name)))];return r`
      <section class="panel team-stats-panel">
        <div class="panel-head"><h3>COMPARAISON DES ÉQUIPES</h3><span class="pill">TEAM STATS</span></div>
        <div class="table-wrap"><table><thead><tr><th>STATISTIQUE</th>${e.map(s=>r`<th>${n(s.abbr,s.name)}</th>`)}</tr></thead>
          <tbody>${t.map(s=>{let a=e.flatMap(i=>i.statistics??[]).find(i=>i.name===s)?.label??s;return r`<tr><td>${a}</td>${e.map(i=>r`<td>${n((i.statistics??[]).find(l=>l.name===s)?.value)}</td>`)}</tr>`})}</tbody>
        </table></div>
      </section>`}_playByPlayPanel(){let e=this._overlayDetails?.plays??[];if(!e.length)return"";let s=[...this._scoringOnly?e.filter(i=>i.scoring):e].reverse(),a=this._showAllPlays?s:s.slice(0,12);return r`
      <section class="panel playbyplay-panel">
        <div class="panel-head"><h3>FIL DU MATCH</h3><span class="pill">${e.length} ACTIONS</span></div>
        <div class="play-controls">
          <button class="chip" aria-pressed=${!this._scoringOnly} @click=${()=>{this._scoringOnly=!1,this._showAllPlays=!1}}>TOUTES</button>
          <button class="chip" aria-pressed=${this._scoringOnly} @click=${()=>{this._scoringOnly=!0,this._showAllPlays=!1}}>POINTS SEULEMENT</button>
        </div>
        <ol class="play-list">${a.map(i=>r`
          <li class="play-row ${i.scoring?"scoring":""}">
            <span class="play-clock">${n(i.period_display,Number(i.period)>4?Number(i.period)===5?"OT":`${Number(i.period)-4}OT`:`Q${n(i.period)}`)}<small>${n(i.clock)}</small></span>
            <span class="play-copy">${n(i.text,i.type||"Action")}${i.scoring?r`<small>MARQUE · +${n(i.score_value,"?")} PT</small>`:""}</span>
            <span class="play-score">${i.away_score!=null||i.home_score!=null?`${n(i.away_score)}\u2013${n(i.home_score)}`:""}</span>
          </li>`)}</ol>
        ${s.length>12?r`<button class="chip play-more" @click=${()=>{this._showAllPlays=!this._showAllPlays}}>${this._showAllPlays?"R\xC9DUIRE":`VOIR LES ${s.length} ACTIONS`}</button>`:""}
      </section>`}_gameStatus(e){return e.state==="in"?{label:e.clock?`LIVE \xB7 ${e.clock}`:"LIVE",live:!0}:e.state==="post"?{label:e.detail||"TERMIN\xC9",live:!1}:{label:e.time||"\xC0 VENIR",live:!1}}_gameCard(e){let t=e.home??{},s=e.away??{},a=this._gameStatus(e),i=e.state==="in"||e.state==="post";return r`
      <article class="game" role="button" tabindex="0" @click=${()=>this._openGame(e)} @keydown=${l=>{(l.key==="Enter"||l.key===" ")&&(l.preventDefault(),this._openGame(e))}}>
        <div class="game-main">
          <div class="game-date">${n(e.date_text,Ie(e.date))}</div>
          <div class="matchup">
            <div class="side away"><span class="team-name">${n(s.abbr,s.name)}</span>
              ${s.logo?r`<img class="logo" src=${s.logo} alt="" loading="lazy">`:""}</div>
            <div class="score ${i?"":"pending"}">${i?`${n(s.score)} \u2013 ${n(t.score)}`:"VS"}</div>
            <div class="side">${t.logo?r`<img class="logo" src=${t.logo} alt="" loading="lazy">`:""}
              <span class="team-name">${n(t.abbr,t.name)}</span></div>
          </div>
        </div>
        <div class="status ${a.live?"live":""}">${a.label}</div>
      </article>`}_filteredGames(e){let t=this._search.trim().toLowerCase();return e.filter(s=>{let a=this._filter==="all"||s.state===this._filter,i=`${s.home?.name??""} ${s.home?.abbr??""} ${s.away?.name??""} ${s.away?.abbr??""}`.toLowerCase();return a&&(!t||i.includes(t))})}_leaderPanel(e,t=5){let s=this._leaders(e).rows;return r`
      <section class="panel">
        <div class="panel-head"><h3>${z[e][0]}</h3><span class="pill">SAISON</span></div>
        ${s.length?r`<div class="leader-list">${s.slice(0,t).map((a,i)=>r`
          <div class="leader"><span class="rank">${n(a.rank,i+1)}</span>
            ${a.headshot?r`<img class="avatar" src=${a.headshot} alt="" loading="lazy">`:r`<div class="avatar"></div>`}
            <div class="player">${n(a.player)}<small>${n(a.team)}</small></div>
            <span class="stat">${n(a.value)}</span>
          </div>`)}</div>`:r`<p class="muted">Données de classement indisponibles.</p>`}
      </section>`}_standingsTable(e,t){let s=this._standings(e).rows;return r`
      <section class="panel">
        <div class="panel-head"><h3>${t}</h3><span class="pill">${s.length} ÉQUIPES</span></div>
        ${s.length?r`<div class="table-wrap"><table>
          <thead><tr><th>#</th><th>ÉQUIPE</th><th>V</th><th>D</th><th>%</th><th>GB</th></tr></thead>
          <tbody>${s.slice(0,15).map((a,i)=>r`
            <tr><td>${n(a.rank,i+1)}</td><td>${n(a.abbr,a.team)}</td><td>${n(a.wins)}</td>
            <td>${n(a.losses)}</td><td>${n(a.pct)}</td><td>${n(a.gb)}</td></tr>`)}</tbody>
        </table></div>`:r`<p class="muted">Classement indisponible.</p>`}
      </section>`}_teamPanel(e){let t=e.last,s=e.next;return r`
      <section class="panel">
        <div class="team-row">
          ${e.logo?r`<img class="logo large" src=${e.logo} alt="" loading="lazy">`:""}
          <div class="team-info"><strong>${e.name}</strong><small>Équipe favorite · ${e.id}</small></div>
          ${e.live?.state==="in"?r`<span class="pill accent">LIVE</span>`:""}
        </div>
        <div class="team-row"><div class="team-info"><small>DERNIER MATCH</small><strong>${n(t?.name,"Donn\xE9e indisponible")}</strong></div>
          <div class="record">${n(t?.away?.score)} – ${n(t?.home?.score)}</div></div>
        <div class="team-row"><div class="team-info"><small>PROCHAIN MATCH</small><strong>${n(s?.name,"Calendrier indisponible")}</strong>
          <small>${n(s?.date_text,"")}</small></div></div>
        ${e.recent?.length?r`
          <div class="muted" style="margin-top:10px">FORME RÉCENTE</div>
          <div class="recent">${e.recent.slice(0,5).map(a=>r`
            <span class="form-chip ${a.result==="V"?"win":"loss"}">
              <strong>${n(a.result)}</strong><span>${n(a.opp_abbr)}</span>
              <span>${n(a.team_score)}–${n(a.opp_score)}</span>
            </span>`)}</div>`:""}
      </section>`}_homeView(){let{rows:e}=this._games(),t=e.filter(i=>i.state==="in"),s=e.filter(i=>i.state==="pre").slice(0,4),a=this._teams();return r`
      <div class="head"><h2>TABLEAU DE BORD</h2><span class="pill">NBA DARK</span></div>
      <div class="grid">
        <section class="panel"><div class="panel-head"><h3>EN DIRECT</h3><span class="pill">${t.length} MATCHS</span></div>
          ${t.length?r`<div class="game-list">${t.map(i=>this._gameCard(i))}</div>`:r`<p class="muted">Aucun match en direct actuellement.</p>`}</section>
        <section class="panel"><div class="panel-head"><h3>À VENIR</h3><span class="pill">${s.length} MATCHS</span></div>
          ${s.length?r`<div class="game-list">${s.map(i=>this._gameCard(i))}</div>`:r`<p class="muted">Aucun prochain match dans le calendrier chargé.</p>`}</section>
        <section class="panel"><div class="panel-head"><h3>ÉQUIPES FAVORITES</h3><span class="pill">${a.length}</span></div>
          ${a.length?r`<div class="team-list">${a.slice(0,6).map(i=>r`
            <div class="team-row">${i.logo?r`<img class="logo" src=${i.logo} alt="">`:""}
              <div class="team-info"><strong>${i.name}</strong><small>${i.id}</small></div>
              <span class="muted">${n(i.next?.date_text,"\u2014")}</span></div>`)}</div>`:r`<p class="muted">Choisis tes équipes favorites dans la configuration de l'intégration NBA.</p>`}</section>
        ${this._leaderPanel("points",5)}
      </div>`}_scoresView(){let e=this._calendarGames,t=this._filteredGames(e),s=new Intl.DateTimeFormat("fr-BE",{weekday:"long",day:"2-digit",month:"long",year:"numeric"}).format(new Date(`${this._selectedDate}T12:00:00`));return r`
      <div class="head"><h2>SCORES & CALENDRIER</h2><span class="pill">${e.length} MATCHS</span></div>
      <div class="date-nav"><button aria-label="Jour précédent" @click=${()=>this._shiftDate(-1)}>‹</button>
        <span class="date-label">${s}</span><input type="date" aria-label="Choisir une date" .value=${this._selectedDate} @change=${this._setDate}>
        <button aria-label="Jour suivant" @click=${()=>this._shiftDate(1)}>›</button>
        <button @click=${()=>{this._selectedDate=ee(new Date,this.hass?.config?.time_zone),this._loadCalendar(this._selectedDate)}}>AUJOURD&#39;HUI</button></div>
      ${this._calendarStale?r`<p class="muted" role="status">Données en cache · actualisation ESPN indisponible${this._calendarStaleError?r` · ${this._calendarStaleError}`:""}</p>`:""}
      <div class="filters">${[["all","TOUS"],["in","LIVE"],["pre","\xC0 VENIR"],["post","TERMIN\xC9S"]].map(([a,i])=>r`<button class="chip" aria-pressed=${this._filter===a} @click=${()=>this._setFilter(a)}>${i}</button>`)}
        <input type="search" aria-label="Rechercher une équipe" placeholder="Filtrer une équipe…" .value=${this._search} @input=${this._setSearch}></div>
      ${this._calendarLoading?r`<section class="empty">Chargement du calendrier…</section>`:""}
      ${this._calendarError?r`<section class="empty"><strong>Calendrier indisponible</strong><p>${this._calendarError}</p><button @click=${()=>this._loadCalendar(this._selectedDate)}>RÉESSAYER</button></section>`:""}
      ${!this._calendarLoading&&!this._calendarError&&t.length?r`<div class="game-list">${t.map(a=>this._gameCard(a))}</div>`:""}
      ${!this._calendarLoading&&!this._calendarError&&!t.length?r`<section class="empty"><strong>${e.length?"Aucun match correspondant":"Aucun match programm\xE9"}</strong><p>${e.length?"Modifie les filtres ou la recherche.":"Aucune rencontre n&#39;est pr\xE9vue pour cette date dans le fuseau horaire de Home Assistant."}</p></section>`:""}
    `}_teamCatalogCard(e){let t=e.favoriteData;return r`<section class="panel catalog-team" role="button" tabindex="0" @click=${()=>this._openTeam(e)} @keydown=${s=>{(s.key==="Enter"||s.key===" ")&&(s.preventDefault(),this._openTeam(e))}}>
      <div class="team-row">
        ${e.logo?r`<img class="logo large" src=${e.logo} alt="" loading="lazy">`:""}
        <div class="team-info"><strong>${n(e.display_name,e.name)}</strong>
          <small>${n(e.abbreviation)} · ${n(e.conference,"Conf\xE9rence inconnue")} · ${n(e.division,"Division inconnue")}</small></div>
        ${e.favorite?r`<span class="pill accent">FAVORI</span>`:""}
      </div>
      ${t?r`<div class="catalog-favorite-tracking"><span>DERNIER MATCH · ${n(t.last?.name,"\u2014")}</span><span>PROCHAIN MATCH · ${n(t.next?.date_text,"\u2014")} ${n(t.next?.name,"")}</span>${t.live?.state==="in"?r`<strong class="pill accent">MATCH EN DIRECT</strong>`:""}</div>`:""}
    </section>`}_teamsView(){let e=this._teamsCatalog(),t=this._teamSearch.trim().toLowerCase(),s=e.teams.filter(a=>{let i=!t||[a.name,a.display_name,a.abbreviation,a.nickname,a.city].filter(Boolean).join(" ").toLowerCase().includes(t),l=String(a.conference??"").toLowerCase(),c=this._teamConference==="all"||(this._teamConference==="east"?l.includes("east"):l.includes("west"));return i&&c});return r`
      <div class="head"><h2>TEAMS CENTER</h2><span class="pill">${e.count}/30 FRANCHISES</span></div>
      ${e.complete?"":r`<p class="muted" role="status">Catalogue partiel ou en attente · ${e.count} équipes reçues</p>`}
      <div class="filters">
        <button class="chip" aria-pressed=${this._teamConference==="all"} @click=${()=>this._setTeamConference("all")}>TOUTES</button>
        <button class="chip" aria-pressed=${this._teamConference==="east"} @click=${()=>this._setTeamConference("east")}>EAST</button>
        <button class="chip" aria-pressed=${this._teamConference==="west"} @click=${()=>this._setTeamConference("west")}>WEST</button>
        <input type="search" aria-label="Rechercher une franchise NBA" placeholder="Rechercher une équipe…" .value=${this._teamSearch} @input=${this._setTeamSearch}>
      </div>
      ${s.length?r`<div class="grid">${s.map(a=>this._teamCatalogCard(a))}</div>`:r`<section class="empty"><strong>${e.count?"Aucune franchise correspondante":"Catalogue des \xE9quipes indisponible"}</strong><p>${e.count?"Modifie la recherche ou le filtre de conf\xE9rence.":"Le capteur Catalogue des \xE9quipes n'a pas encore re\xE7u les donn\xE9es ESPN."}</p></section>`}
    `}_playersView(){return r`<div class="head"><h2>PLAYERS CENTER</h2><span class="pill">LEADERS NBA</span></div>
      <div class="grid">${Object.keys(z).map(e=>this._leaderPanel(e,10))}</div>`}_statsView(){return r`<div class="head"><h2>STATS CENTER</h2><span class="pill">SAISON</span></div>
      <div class="grid">${this._standingsTable("east","EASTERN CONFERENCE")}${this._standingsTable("west","WESTERN CONFERENCE")}</div>
      <div class="grid" style="margin-top:12px">${Object.keys(z).map(e=>this._leaderPanel(e,5))}</div>`}render(){let e=Z.find(s=>s.id===this._active)??Z[0],t={home:()=>this._homeView(),scores:()=>this._scoresView(),teams:()=>this._teamsView(),players:()=>this._playersView(),stats:()=>this._statsView()};return r`
      <ha-card class="shell">
        <header class="hero"><div class="eyebrow">THE ASSOCIATION · HOME ASSISTANT</div>
          <h1>${this._config.title}</h1><div class="subtitle">${this._config.subtitle}</div>
          <div class="meta"><span class="dot"></span><span>NBA DATA</span><span>·</span>
            <span>${this.hass?"CONNECTED TO HOME ASSISTANT":"WAITING FOR HOME ASSISTANT"}</span></div>
        </header>
        <nav aria-label="NBA Center navigation">${Z.map(s=>r`
          <button type="button" data-view=${s.id} aria-selected=${s.id===this._active}
            @click=${()=>this._selectView(s.id)}>${s.label}</button>`)}</nav>
        <main>${this.hass?t[e.id]():r`
          <section class="empty"><strong>Connexion à Home Assistant…</strong><p>La carte attend les états de l'intégration NBA.</p></section>`}</main>
        ${this._overlayGame?r`<div class="overlay" @click=${s=>{s.target===s.currentTarget&&this._closeOverlay()}} @keydown=${this._onOverlayKeydown}>
          <section class="overlay-panel" role="dialog" aria-modal="true" aria-label="Détails du match">
            <header class="overlay-head"><h2>MATCH CENTER</h2><div class="overlay-actions">
              <button class="overlay-refresh" ?disabled=${this._overlayLoading} @click=${()=>this._openGame(this._overlayGame)} aria-label="Actualiser les détails du match">${this._overlayLoading?"CHARGEMENT\u2026":"\u21BB ACTUALISER"}</button>
              <button class="overlay-close" aria-label="Fermer" @click=${this._closeOverlay}>✕</button>
            </div></header>
            <div class="overlay-body"><div class="overlay-teams">
              <div class="overlay-team">${this._overlayGame.away?.logo?r`<img src=${this._overlayGame.away.logo} alt="">`:""}<strong>${n(this._overlayGame.away?.name)}</strong></div>
              <div class="overlay-score">${this._overlayGame.state==="pre"?"VS":`${n(this._overlayGame.away?.score)} \u2013 ${n(this._overlayGame.home?.score)}`}</div>
              <div class="overlay-team">${this._overlayGame.home?.logo?r`<img src=${this._overlayGame.home.logo} alt="">`:""}<strong>${n(this._overlayGame.home?.name)}</strong></div>
            </div><p class="muted" style="text-align:center">${n(this._overlayGame.date_text)} · ${n(this._overlayGame.detail,this._gameStatus(this._overlayGame).label)}</p>
            ${this._overlayLoading?r`<section class="empty">Chargement du résumé…</section>`:""}
            ${this._overlayError||this._overlayDetails?.error?r`<section class="empty"><p>${n(this._overlayError||this._overlayDetails?.error,"D\xE9tails du match indisponibles.")}</p><button @click=${()=>this._openGame(this._overlayGame)}>RÉESSAYER</button></section>`:""}
            ${this._overlayDetails?.teams?.length?r`<div class="game-leaders-grid">${this._awayFirst(this._overlayDetails.teams).map(s=>r`
              <section class="panel game-leader-card"><div class="panel-head"><h3>${n(s.abbr,s.name)}</h3><span class="pill">LEADERS</span></div>
                ${(s.top_players??[]).length?s.top_players.map(a=>r`<div class="game-leader"><span class="game-leader-category">${n(a.category)}</span><span class="game-leader-name">${n(a.player)}</span><strong class="game-leader-value">${n(a.value)}</strong></div>`):r`<div class="game-leaders-empty">Statistiques des leaders indisponibles.</div>`}</section>`)}</div>`:""}
            ${this._quarterScorePanel()}
            ${this._overlayDetails?.has_boxscore?r`
              <div class="boxscore-section"><div class="section-kicker">FULL GAME BREAKDOWN</div><h3>BOX SCORE · JOUEURS</h3>
                <div class="boxscore-grid">${this._awayFirst(this._overlayDetails.player_stats,s=>this._overlayDetails.team_stats?.find(a=>a.team_id===s.team_id)?.home_away).map(s=>this._boxscorePanel(s))}</div>
                ${this._teamStatsPanel()}
              </div>`:""}
            ${this._playByPlayPanel()}
            ${!this._overlayLoading&&!this._overlayError&&!this._overlayDetails?.error&&!this._overlayDetails?.teams?.length&&!this._overlayDetails?.has_boxscore?r`<section class="empty"><p>Le résumé détaillé n’est pas encore disponible pour cette rencontre.</p></section>`:""}            </div></section></div>`:""}
        ${this._teamOverlay?this._teamRosterPanel():""}\n        <footer class="footer"><span>NBA CENTER · ${e.label}</span><span>DATA VIA HOME ASSISTANT</span></footer>
      </ha-card>`}static getStubConfig(){return{title:"NBA CENTER",subtitle:"Your league. Your teams. One center."}}};customElements.get("nba-center-card")||customElements.define("nba-center-card",te);window.customCards=window.customCards??[];window.customCards.some(o=>o.type==="nba-center-card")||window.customCards.push({type:"nba-center-card",name:"NBA Center",description:"NBA Dark dashboard \u2014 scores, teams, players and stats",preview:!0});
