var k=globalThis,z=k.ShadowRoot&&(k.ShadyCSS===void 0||k.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,M=Symbol(),se=new WeakMap,S=class{constructor(e,s,t){if(this._$cssResult$=!0,t!==M)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=s}get styleSheet(){let e=this.o,s=this.t;if(z&&e===void 0){let t=s!==void 0&&s.length===1;t&&(e=se.get(s)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&se.set(s,e))}return e}toString(){return this.cssText}},ae=r=>new S(typeof r=="string"?r:r+"",void 0,M),H=(r,...e)=>{let s=r.length===1?r[0]:e.reduce((t,a,i)=>t+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(a)+r[i+1],r[0]);return new S(s,r,M)},ie=(r,e)=>{if(z)r.adoptedStyleSheets=e.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet);else for(let s of e){let t=document.createElement("style"),a=k.litNonce;a!==void 0&&t.setAttribute("nonce",a),t.textContent=s.cssText,r.appendChild(t)}},B=z?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let s="";for(let t of e.cssRules)s+=t.cssText;return ae(s)})(r):r;var{is:$e,defineProperty:ve,getOwnPropertyDescriptor:xe,getOwnPropertyNames:we,getOwnPropertySymbols:Ae,getPrototypeOf:Ee}=Object,I=globalThis,re=I.trustedTypes,Se=re?re.emptyScript:"",Ce=I.reactiveElementPolyfillSupport,C=(r,e)=>r,q={toAttribute(r,e){switch(e){case Boolean:r=r?Se:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let s=r;switch(e){case Boolean:s=r!==null;break;case Number:s=r===null?null:Number(r);break;case Object:case Array:try{s=JSON.parse(r)}catch{s=null}}return s}},ne=(r,e)=>!$e(r,e),oe={attribute:!0,type:String,converter:q,reflect:!1,useDefault:!1,hasChanged:ne};Symbol.metadata??=Symbol("metadata"),I.litPropertyMetadata??=new WeakMap;var f=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,s=oe){if(s.state&&(s.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((s=Object.create(s)).wrapped=!0),this.elementProperties.set(e,s),!s.noAccessor){let t=Symbol(),a=this.getPropertyDescriptor(e,t,s);a!==void 0&&ve(this.prototype,e,a)}}static getPropertyDescriptor(e,s,t){let{get:a,set:i}=xe(this.prototype,e)??{get(){return this[s]},set(n){this[s]=n}};return{get:a,set(n){let d=a?.call(this);i?.call(this,n),this.requestUpdate(e,d,t)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??oe}static _$Ei(){if(this.hasOwnProperty(C("elementProperties")))return;let e=Ee(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(C("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(C("properties"))){let s=this.properties,t=[...we(s),...Ae(s)];for(let a of t)this.createProperty(a,s[a])}let e=this[Symbol.metadata];if(e!==null){let s=litPropertyMetadata.get(e);if(s!==void 0)for(let[t,a]of s)this.elementProperties.set(t,a)}this._$Eh=new Map;for(let[s,t]of this.elementProperties){let a=this._$Eu(s,t);a!==void 0&&this._$Eh.set(a,s)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let s=[];if(Array.isArray(e)){let t=new Set(e.flat(1/0).reverse());for(let a of t)s.unshift(B(a))}else e!==void 0&&s.push(B(e));return s}static _$Eu(e,s){let t=s.attribute;return t===!1?void 0:typeof t=="string"?t:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,s=this.constructor.elementProperties;for(let t of s.keys())this.hasOwnProperty(t)&&(e.set(t,this[t]),delete this[t]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ie(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,s,t){this._$AK(e,t)}_$ET(e,s){let t=this.constructor.elementProperties.get(e),a=this.constructor._$Eu(e,t);if(a!==void 0&&t.reflect===!0){let i=(t.converter?.toAttribute!==void 0?t.converter:q).toAttribute(s,t.type);this._$Em=e,i==null?this.removeAttribute(a):this.setAttribute(a,i),this._$Em=null}}_$AK(e,s){let t=this.constructor,a=t._$Eh.get(e);if(a!==void 0&&this._$Em!==a){let i=t.getPropertyOptions(a),n=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:q;this._$Em=a;let d=n.fromAttribute(s,i.type);this[a]=d??this._$Ej?.get(a)??d,this._$Em=null}}requestUpdate(e,s,t,a=!1,i){if(e!==void 0){let n=this.constructor;if(a===!1&&(i=this[e]),t??=n.getPropertyOptions(e),!((t.hasChanged??ne)(i,s)||t.useDefault&&t.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,t))))return;this.C(e,s,t)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,s,{useDefault:t,reflect:a,wrapped:i},n){t&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??s??this[e]),i!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||t||(s=void 0),this._$AL.set(e,s)),a===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(s){Promise.reject(s)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[a,i]of this._$Ep)this[a]=i;this._$Ep=void 0}let t=this.constructor.elementProperties;if(t.size>0)for(let[a,i]of t){let{wrapped:n}=i,d=this[a];n!==!0||this._$AL.has(a)||d===void 0||this.C(a,void 0,i,d)}}let e=!1,s=this._$AL;try{e=this.shouldUpdate(s),e?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(s)}willUpdate(e){}_$AE(e){this._$EO?.forEach(s=>s.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(s=>this._$ET(s,this[s])),this._$EM()}updated(e){}firstUpdated(e){}};f.elementStyles=[],f.shadowRootOptions={mode:"open"},f[C("elementProperties")]=new Map,f[C("finalized")]=new Map,Ce?.({ReactiveElement:f}),(I.reactiveElementVersions??=[]).push("2.1.2");var J=globalThis,le=r=>r,U=J.trustedTypes,de=U?U.createPolicy("lit-html",{createHTML:r=>r}):void 0,ge="$lit$",b=`lit$${Math.random().toFixed(9).slice(2)}$`,fe="?"+b,Te=`<${fe}>`,x=document,R=()=>x.createComment(""),O=r=>r===null||typeof r!="object"&&typeof r!="function",K=Array.isArray,Re=r=>K(r)||typeof r?.[Symbol.iterator]=="function",j=`[ 	
\f\r]`,T=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ce=/-->/g,pe=/>/g,$=RegExp(`>|${j}(?:([^\\s"'>=/]+)(${j}*=${j}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),he=/'/g,me=/"/g,_e=/^(?:script|style|textarea|title)$/i,Q=r=>(e,...s)=>({_$litType$:r,strings:e,values:s}),o=Q(1),He=Q(2),Be=Q(3),w=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),ue=new WeakMap,v=x.createTreeWalker(x,129);function be(r,e){if(!K(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return de!==void 0?de.createHTML(e):e}var Oe=(r,e)=>{let s=r.length-1,t=[],a,i=e===2?"<svg>":e===3?"<math>":"",n=T;for(let d=0;d<s;d++){let c=r[d],h,u,p=-1,g=0;for(;g<c.length&&(n.lastIndex=g,u=n.exec(c),u!==null);)g=n.lastIndex,n===T?u[1]==="!--"?n=ce:u[1]!==void 0?n=pe:u[2]!==void 0?(_e.test(u[2])&&(a=RegExp("</"+u[2],"g")),n=$):u[3]!==void 0&&(n=$):n===$?u[0]===">"?(n=a??T,p=-1):u[1]===void 0?p=-2:(p=n.lastIndex-u[2].length,h=u[1],n=u[3]===void 0?$:u[3]==='"'?me:he):n===me||n===he?n=$:n===ce||n===pe?n=T:(n=$,a=void 0);let _=n===$&&r[d+1].startsWith("/>")?" ":"";i+=n===T?c+Te:p>=0?(t.push(h),c.slice(0,p)+ge+c.slice(p)+b+_):c+b+(p===-2?d:_)}return[be(r,i+(r[s]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),t]},N=class r{constructor({strings:e,_$litType$:s},t){let a;this.parts=[];let i=0,n=0,d=e.length-1,c=this.parts,[h,u]=Oe(e,s);if(this.el=r.createElement(h,t),v.currentNode=this.el.content,s===2||s===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(a=v.nextNode())!==null&&c.length<d;){if(a.nodeType===1){if(a.hasAttributes())for(let p of a.getAttributeNames())if(p.endsWith(ge)){let g=u[n++],_=a.getAttribute(p).split(b),P=/([.?@])?(.*)/.exec(g);c.push({type:1,index:i,name:P[2],strings:_,ctor:P[1]==="."?V:P[1]==="?"?F:P[1]==="@"?W:E}),a.removeAttribute(p)}else p.startsWith(b)&&(c.push({type:6,index:i}),a.removeAttribute(p));if(_e.test(a.tagName)){let p=a.textContent.split(b),g=p.length-1;if(g>0){a.textContent=U?U.emptyScript:"";for(let _=0;_<g;_++)a.append(p[_],R()),v.nextNode(),c.push({type:2,index:++i});a.append(p[g],R())}}}else if(a.nodeType===8)if(a.data===fe)c.push({type:2,index:i});else{let p=-1;for(;(p=a.data.indexOf(b,p+1))!==-1;)c.push({type:7,index:i}),p+=b.length-1}i++}}static createElement(e,s){let t=x.createElement("template");return t.innerHTML=e,t}};function A(r,e,s=r,t){if(e===w)return e;let a=t!==void 0?s._$Co?.[t]:s._$Cl,i=O(e)?void 0:e._$litDirective$;return a?.constructor!==i&&(a?._$AO?.(!1),i===void 0?a=void 0:(a=new i(r),a._$AT(r,s,t)),t!==void 0?(s._$Co??=[])[t]=a:s._$Cl=a),a!==void 0&&(e=A(r,a._$AS(r,e.values),a,t)),e}var G=class{constructor(e,s){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:s},parts:t}=this._$AD,a=(e?.creationScope??x).importNode(s,!0);v.currentNode=a;let i=v.nextNode(),n=0,d=0,c=t[0];for(;c!==void 0;){if(n===c.index){let h;c.type===2?h=new D(i,i.nextSibling,this,e):c.type===1?h=new c.ctor(i,c.name,c.strings,this,e):c.type===6&&(h=new Y(i,this,e)),this._$AV.push(h),c=t[++d]}n!==c?.index&&(i=v.nextNode(),n++)}return v.currentNode=x,a}p(e){let s=0;for(let t of this._$AV)t!==void 0&&(t.strings!==void 0?(t._$AI(e,t,s),s+=t.strings.length-2):t._$AI(e[s])),s++}},D=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,s,t,a){this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=e,this._$AB=s,this._$AM=t,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,s=this._$AM;return s!==void 0&&e?.nodeType===11&&(e=s.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,s=this){e=A(this,e,s),O(e)?e===m||e==null||e===""?(this._$AH!==m&&this._$AR(),this._$AH=m):e!==this._$AH&&e!==w&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Re(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==m&&O(this._$AH)?this._$AA.nextSibling.data=e:this.T(x.createTextNode(e)),this._$AH=e}$(e){let{values:s,_$litType$:t}=e,a=typeof t=="number"?this._$AC(e):(t.el===void 0&&(t.el=N.createElement(be(t.h,t.h[0]),this.options)),t);if(this._$AH?._$AD===a)this._$AH.p(s);else{let i=new G(a,this),n=i.u(this.options);i.p(s),this.T(n),this._$AH=i}}_$AC(e){let s=ue.get(e.strings);return s===void 0&&ue.set(e.strings,s=new N(e)),s}k(e){K(this._$AH)||(this._$AH=[],this._$AR());let s=this._$AH,t,a=0;for(let i of e)a===s.length?s.push(t=new r(this.O(R()),this.O(R()),this,this.options)):t=s[a],t._$AI(i),a++;a<s.length&&(this._$AR(t&&t._$AB.nextSibling,a),s.length=a)}_$AR(e=this._$AA.nextSibling,s){for(this._$AP?.(!1,!0,s);e!==this._$AB;){let t=le(e).nextSibling;le(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},E=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,s,t,a,i){this.type=1,this._$AH=m,this._$AN=void 0,this.element=e,this.name=s,this._$AM=a,this.options=i,t.length>2||t[0]!==""||t[1]!==""?(this._$AH=Array(t.length-1).fill(new String),this.strings=t):this._$AH=m}_$AI(e,s=this,t,a){let i=this.strings,n=!1;if(i===void 0)e=A(this,e,s,0),n=!O(e)||e!==this._$AH&&e!==w,n&&(this._$AH=e);else{let d=e,c,h;for(e=i[0],c=0;c<i.length-1;c++)h=A(this,d[t+c],s,c),h===w&&(h=this._$AH[c]),n||=!O(h)||h!==this._$AH[c],h===m?e=m:e!==m&&(e+=(h??"")+i[c+1]),this._$AH[c]=h}n&&!a&&this.j(e)}j(e){e===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},V=class extends E{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===m?void 0:e}},F=class extends E{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==m)}},W=class extends E{constructor(e,s,t,a,i){super(e,s,t,a,i),this.type=5}_$AI(e,s=this){if((e=A(this,e,s,0)??m)===w)return;let t=this._$AH,a=e===m&&t!==m||e.capture!==t.capture||e.once!==t.once||e.passive!==t.passive,i=e!==m&&(t===m||a);a&&this.element.removeEventListener(this.name,this,t),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Y=class{constructor(e,s,t){this.element=e,this.type=6,this._$AN=void 0,this._$AM=s,this.options=t}get _$AU(){return this._$AM._$AU}_$AI(e){A(this,e)}};var Ne=J.litHtmlPolyfillSupport;Ne?.(N,D),(J.litHtmlVersions??=[]).push("3.3.3");var ye=(r,e,s)=>{let t=s?.renderBefore??e,a=t._$litPart$;if(a===void 0){let i=s?.renderBefore??null;t._$litPart$=a=new D(e.insertBefore(R(),i),i,void 0,s??{})}return a._$AI(r),a};var X=globalThis,y=class extends f{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ye(s,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return w}};y._$litElement$=!0,y.finalized=!0,X.litElementHydrateSupport?.({LitElement:y});var De=X.litElementPolyfillSupport;De?.({LitElement:y});(X.litElementVersions??=[]).push("4.2.2");var Z=[{id:"home",label:"HOME"},{id:"scores",label:"SCORES"},{id:"teams",label:"TEAMS"},{id:"players",label:"PLAYERS"},{id:"stats",label:"STATS"}],L={points:["POINTS","marque"],rebounds:["REBONDS","rebon"],assists:["PASSES","passe"],steals:["INTERCEPTIONS","inter"],blocks:["CONTRES","contr"]},Pe={games:"sensor.nba_matchs_du_jour",east:"sensor.nba_classement_est",west:"sensor.nba_classement_ouest",points:"sensor.nba_meilleurs_marqueurs",rebounds:"sensor.nba_meilleurs_rebondeurs",assists:"sensor.nba_meilleurs_passeurs",steals:"sensor.nba_meilleurs_intercepteurs",blocks:"sensor.nba_meilleurs_contreurs"},ee=(r=new Date,e)=>{let s=new Intl.DateTimeFormat("en-CA",{timeZone:e,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(r),t=a=>s.find(i=>i.type===a)?.value;return`${t("year")}-${t("month")}-${t("day")}`},ke=(r,e)=>{let[s,t,a]=r.split("-").map(Number),i=new Date(Date.UTC(s,t-1,a+e,12));return[i.getUTCFullYear(),String(i.getUTCMonth()+1).padStart(2,"0"),String(i.getUTCDate()).padStart(2,"0")].join("-")},l=(r,e="\u2014")=>r==null||r===""?e:String(r),ze=r=>{if(!r)return"Date \xE0 confirmer";let e=new Date(r);return Number.isNaN(e.getTime())?l(r):new Intl.DateTimeFormat(void 0,{weekday:"short",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(e)},te=class extends y{static properties={hass:{attribute:!1},_active:{state:!0},_filter:{state:!0},_search:{state:!0},_selectedDate:{state:!0},_calendarGames:{state:!0},_calendarLoading:{state:!0},_calendarError:{state:!0},_calendarStale:{state:!0},_overlayGame:{state:!0},_overlayDetails:{state:!0},_overlayLoading:{state:!0},_overlayError:{state:!0},_showAllPlays:{state:!0},_scoringOnly:{state:!0}};static styles=H`
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
    .footer{display:flex;justify-content:space-between;gap:10px;padding:12px 22px;color:#738199;border-top:1px solid #ffffff12;font-size:9px;letter-spacing:.06em}
    @media(max-width:620px){.hero{padding:20px 17px 17px}main{padding:15px}nav{padding:8px 7px}button{min-width:66px;padding:9px 10px}.grid{grid-template-columns:1fr}.game{grid-template-columns:1fr;gap:7px}.status{text-align:left}.matchup{gap:6px}.team-name{font-size:10px}.score{font-size:15px}.footer{padding:11px 15px}.meta{margin-top:11px}}
  `;constructor(){super(),this._active="home",this._filter="all",this._search="",this._selectedDate=ee(),this._calendarGames=[],this._calendarLoading=!1,this._calendarError="",this._calendarStale=!1,this._calendarStaleError="",this._calendarRequest=0,this._calendarInitialized=!1,this._overlayGame=null,this._overlayDetails=null,this._overlayRequest=0,this._overlayLoading=!1,this._overlayError="",this._config={}}setConfig(e){if(!e||typeof e!="object"||Array.isArray(e))throw new Error("Configuration NBA Center invalide : un objet YAML est attendu.");this._config={title:"NBA CENTER",subtitle:"Your league. Your teams. One center.",...e,entities:{...Pe,...e.entities??{}}}}getCardSize(){return 8}get _states(){return this.hass?.states??{}}_state(e){return e?this._states[e]:void 0}_find(e){return Object.values(this._states).find(e)}_entity(e,s){return this._state(this._config.entities?.[e])??this._find(s)}_games(){let e=this._entity("games",s=>Array.isArray(s.attributes?.games)&&!s.attributes?.team_id);return{state:e,rows:e?.attributes?.games??[]}}_standings(e){let s=this._entity(e,t=>{if(!Array.isArray(t.attributes?.standings))return!1;let a=t.entity_id.toLowerCase();return e==="east"?a.includes("classement_est")||a.includes("eastern"):a.includes("classement_ouest")||a.includes("western")});return{state:s,rows:s?.attributes?.standings??[]}}_leaders(e){let s=L[e][1],t=this._entity(e,a=>Array.isArray(a.attributes?.leaders)&&(a.attributes?.category??"").toLowerCase().includes(s));return{state:t,rows:t?.attributes?.leaders??[]}}_teams(){let e={};for(let s of Object.values(this._states)){let t=s.attributes??{};if(!s.entity_id.startsWith("sensor.")||!t.team_id)continue;let a=String(t.team_id),i=(t.friendly_name??s.entity_id).toLowerCase(),n=e[a]??={id:a,name:(t.friendly_name??a).replace(/ (dernier match|prochain match|match en cours|derniers matchs)$/i,""),logo:t.team_logo};n.logo??=t.team_logo,i.includes("dernier match")&&(n.last=t),i.includes("prochain match")&&(n.next=t),i.includes("match en cours")&&(n.live=t),Array.isArray(t.games)&&(n.recent=t.games)}return Object.values(e).sort((s,t)=>s.name.localeCompare(t.name))}_selectView(e){this._active=e,e==="scores"&&(this._calendarInitialized||(this._selectedDate=ee(new Date,this.hass?.config?.time_zone),this._calendarInitialized=!0),this._loadCalendar(this._selectedDate))}_setFilter(e){this._filter=e}_setSearch(e){this._search=e.target.value??""}_shiftDate(e){this._selectedDate=ke(this._selectedDate,e),this._loadCalendar(this._selectedDate)}_setDate(e){this._selectedDate=e.target.value,this._loadCalendar(this._selectedDate)}async _loadCalendar(e){if(!this.hass?.callWS||!e)return;let s=++this._calendarRequest;this._calendarLoading=!0,this._calendarError="",this._calendarStale=!1,this._calendarStaleError="";try{let t=await this.hass.callWS({type:"nba/scoreboard",date:e});if(s!==this._calendarRequest||e!==this._selectedDate)return;this._calendarGames=t.games??[],this._calendarStale=!!t.stale,this._calendarStaleError=t.error??""}catch(t){if(s!==this._calendarRequest||e!==this._selectedDate)return;this._calendarError=t?.message??"Impossible de charger le calendrier NBA.",this._calendarGames=[]}finally{s===this._calendarRequest&&(this._calendarLoading=!1)}}async _openGame(e){let s=++this._overlayRequest;this._overlayGame=e,this._overlayDetails=null,this._overlayError="",this._overlayLoading=!0,this._showAllPlays=!1,this._scoringOnly=!1;try{let t=await this.hass.callWS({type:"nba/game_details",game_id:String(e.id)});if(s!==this._overlayRequest||String(this._overlayGame?.id)!==String(e.id))return;this._overlayDetails=t}catch(t){if(s!==this._overlayRequest)return;this._overlayError=t?.message??"R\xE9sum\xE9 du match indisponible."}finally{s===this._overlayRequest&&(this._overlayLoading=!1)}}_closeOverlay(){this._overlayRequest+=1,this._overlayGame=null,this._overlayDetails=null,this._overlayLoading=!1,this._overlayError=""}_onOverlayKeydown(e){e.key==="Escape"&&this._closeOverlay()}_boxscorePanel(e){let s=e.players??[],t=["MIN","PTS","FG","3PT","FT","OREB","DREB","REB","AST","STL","BLK","TO","PF","+/-"],a=new Set(s.flatMap(d=>Object.keys(d.stats??{}))),i=[...t.filter(d=>a.has(d)),...[...a].filter(d=>!t.includes(d))],n=[...s].sort((d,c)=>+!!c.starter-+!!d.starter);return o`
      <section class="panel boxscore-panel">
        <div class="panel-head"><h3>${l(e.abbr,e.team)}</h3><span class="pill">${s.length} JOUEURS</span></div>
        ${n.length?o`<div class="table-wrap player-table-wrap"><table class="player-table">
          <thead><tr><th>JOUEUR</th>${i.map(d=>o`<th>${d}</th>`)}</tr></thead>
          <tbody>${n.map(d=>o`
            <tr class="${d.starter?"starter":""} ${d.did_not_play?"dnp":""}">
              <td><span class="player-cell">${d.headshot?o`<img src=${d.headshot} alt="" loading="lazy">`:""}<span>${l(d.name)}<small>${[d.jersey?`#${d.jersey}`:"",d.position||"",d.ejected?"\xC9JECT\xC9":d.did_not_play?`DNP \xB7 ${l(d.reason,"NON PRIS EN JEU")}`:d.starter?"TITULAIRE":d.active?"ACTIF":""].filter(Boolean).join(" \xB7 ")}</small></span></span></td>
              ${i.map(c=>o`<td>${l(d.stats?.[c])}</td>`)}
            </tr>`)}
          </tbody>
        </table></div>`:o`<p class="muted">Statistiques individuelles indisponibles.</p>`}
      </section>`}_awayFirst(e,s=t=>t.home_away){return[...e??[]].sort((t,a)=>{let i=n=>s(n)==="away"?0:1;return i(t)-i(a)})}_quarterScorePanel(){let e=this._awayFirst(this._overlayDetails?.teams),s=Math.max(0,...e.map(a=>a.quarters?.length??0));if(!s||!e.length)return"";let t=Array.from({length:s},(a,i)=>i<4?`Q${i+1}`:i===4?"OT":`${i-4+1}OT`);return o`
      <section class="panel quarter-score-panel">
        <div class="panel-head"><h3>SCORE PAR PÉRIODE</h3><span class="pill">${s>4?"PROLONGATION":"TEMPS R\xC9GLEMENTAIRE"}</span></div>
        <div class="table-wrap"><table>
          <thead><tr><th>ÉQUIPE</th>${t.map(a=>o`<th>${a}</th>`)}<th>TOTAL</th></tr></thead>
          <tbody>${e.map(a=>o`
            <tr><td>${l(a.abbr,a.name)}</td>
              ${t.map((i,n)=>o`<td>${l(a.quarters?.[n])}</td>`)}
              <td>${l(a.score)}</td>
            </tr>`)}</tbody>
        </table></div>
      </section>`}_teamStatsPanel(){let e=this._awayFirst(this._overlayDetails?.team_stats);if(!e.length)return"";let s=[...new Set(e.flatMap(t=>(t.statistics??[]).map(a=>a.name)))];return o`
      <section class="panel team-stats-panel">
        <div class="panel-head"><h3>COMPARAISON DES ÉQUIPES</h3><span class="pill">TEAM STATS</span></div>
        <div class="table-wrap"><table><thead><tr><th>STATISTIQUE</th>${e.map(t=>o`<th>${l(t.abbr,t.name)}</th>`)}</tr></thead>
          <tbody>${s.map(t=>{let a=e.flatMap(i=>i.statistics??[]).find(i=>i.name===t)?.label??t;return o`<tr><td>${a}</td>${e.map(i=>o`<td>${l((i.statistics??[]).find(n=>n.name===t)?.value)}</td>`)}</tr>`})}</tbody>
        </table></div>
      </section>`}_playByPlayPanel(){let e=this._overlayDetails?.plays??[];if(!e.length)return"";let t=[...this._scoringOnly?e.filter(i=>i.scoring):e].reverse(),a=this._showAllPlays?t:t.slice(0,12);return o`
      <section class="panel playbyplay-panel">
        <div class="panel-head"><h3>FIL DU MATCH</h3><span class="pill">${e.length} ACTIONS</span></div>
        <div class="play-controls">
          <button class="chip" aria-pressed=${!this._scoringOnly} @click=${()=>{this._scoringOnly=!1,this._showAllPlays=!1}}>TOUTES</button>
          <button class="chip" aria-pressed=${this._scoringOnly} @click=${()=>{this._scoringOnly=!0,this._showAllPlays=!1}}>POINTS SEULEMENT</button>
        </div>
        <ol class="play-list">${a.map(i=>o`
          <li class="play-row ${i.scoring?"scoring":""}">
            <span class="play-clock">${l(i.period_display,Number(i.period)>4?Number(i.period)===5?"OT":`${Number(i.period)-4}OT`:`Q${l(i.period)}`)}<small>${l(i.clock)}</small></span>
            <span class="play-copy">${l(i.text,i.type||"Action")}${i.scoring?o`<small>MARQUE · +${l(i.score_value,"?")} PT</small>`:""}</span>
            <span class="play-score">${i.away_score!=null||i.home_score!=null?`${l(i.away_score)}\u2013${l(i.home_score)}`:""}</span>
          </li>`)}</ol>
        ${t.length>12?o`<button class="chip play-more" @click=${()=>{this._showAllPlays=!this._showAllPlays}}>${this._showAllPlays?"R\xC9DUIRE":`VOIR LES ${t.length} ACTIONS`}</button>`:""}
      </section>`}_gameStatus(e){return e.state==="in"?{label:e.clock?`LIVE \xB7 ${e.clock}`:"LIVE",live:!0}:e.state==="post"?{label:e.detail||"TERMIN\xC9",live:!1}:{label:e.time||"\xC0 VENIR",live:!1}}_gameCard(e){let s=e.home??{},t=e.away??{},a=this._gameStatus(e),i=e.state==="in"||e.state==="post";return o`
      <article class="game" role="button" tabindex="0" @click=${()=>this._openGame(e)} @keydown=${n=>{(n.key==="Enter"||n.key===" ")&&(n.preventDefault(),this._openGame(e))}}>
        <div class="game-main">
          <div class="game-date">${l(e.date_text,ze(e.date))}</div>
          <div class="matchup">
            <div class="side away"><span class="team-name">${l(t.abbr,t.name)}</span>
              ${t.logo?o`<img class="logo" src=${t.logo} alt="" loading="lazy">`:""}</div>
            <div class="score ${i?"":"pending"}">${i?`${l(t.score)} \u2013 ${l(s.score)}`:"VS"}</div>
            <div class="side">${s.logo?o`<img class="logo" src=${s.logo} alt="" loading="lazy">`:""}
              <span class="team-name">${l(s.abbr,s.name)}</span></div>
          </div>
        </div>
        <div class="status ${a.live?"live":""}">${a.label}</div>
      </article>`}_filteredGames(e){let s=this._search.trim().toLowerCase();return e.filter(t=>{let a=this._filter==="all"||t.state===this._filter,i=`${t.home?.name??""} ${t.home?.abbr??""} ${t.away?.name??""} ${t.away?.abbr??""}`.toLowerCase();return a&&(!s||i.includes(s))})}_leaderPanel(e,s=5){let t=this._leaders(e).rows;return o`
      <section class="panel">
        <div class="panel-head"><h3>${L[e][0]}</h3><span class="pill">SAISON</span></div>
        ${t.length?o`<div class="leader-list">${t.slice(0,s).map((a,i)=>o`
          <div class="leader"><span class="rank">${l(a.rank,i+1)}</span>
            ${a.headshot?o`<img class="avatar" src=${a.headshot} alt="" loading="lazy">`:o`<div class="avatar"></div>`}
            <div class="player">${l(a.player)}<small>${l(a.team)}</small></div>
            <span class="stat">${l(a.value)}</span>
          </div>`)}</div>`:o`<p class="muted">Données de classement indisponibles.</p>`}
      </section>`}_standingsTable(e,s){let t=this._standings(e).rows;return o`
      <section class="panel">
        <div class="panel-head"><h3>${s}</h3><span class="pill">${t.length} ÉQUIPES</span></div>
        ${t.length?o`<div class="table-wrap"><table>
          <thead><tr><th>#</th><th>ÉQUIPE</th><th>V</th><th>D</th><th>%</th><th>GB</th></tr></thead>
          <tbody>${t.slice(0,15).map((a,i)=>o`
            <tr><td>${l(a.rank,i+1)}</td><td>${l(a.abbr,a.team)}</td><td>${l(a.wins)}</td>
            <td>${l(a.losses)}</td><td>${l(a.pct)}</td><td>${l(a.gb)}</td></tr>`)}</tbody>
        </table></div>`:o`<p class="muted">Classement indisponible.</p>`}
      </section>`}_teamPanel(e){let s=e.last,t=e.next;return o`
      <section class="panel">
        <div class="team-row">
          ${e.logo?o`<img class="logo large" src=${e.logo} alt="" loading="lazy">`:""}
          <div class="team-info"><strong>${e.name}</strong><small>Équipe favorite · ${e.id}</small></div>
          ${e.live?.state==="in"?o`<span class="pill accent">LIVE</span>`:""}
        </div>
        <div class="team-row"><div class="team-info"><small>DERNIER MATCH</small><strong>${l(s?.name,"Donn\xE9e indisponible")}</strong></div>
          <div class="record">${l(s?.away?.score)} – ${l(s?.home?.score)}</div></div>
        <div class="team-row"><div class="team-info"><small>PROCHAIN MATCH</small><strong>${l(t?.name,"Calendrier indisponible")}</strong>
          <small>${l(t?.date_text,"")}</small></div></div>
        ${e.recent?.length?o`
          <div class="muted" style="margin-top:10px">FORME RÉCENTE</div>
          <div class="recent">${e.recent.slice(0,5).map(a=>o`
            <span class="form-chip ${a.result==="V"?"win":"loss"}">
              <strong>${l(a.result)}</strong><span>${l(a.opp_abbr)}</span>
              <span>${l(a.team_score)}–${l(a.opp_score)}</span>
            </span>`)}</div>`:""}
      </section>`}_homeView(){let{rows:e}=this._games(),s=e.filter(i=>i.state==="in"),t=e.filter(i=>i.state==="pre").slice(0,4),a=this._teams();return o`
      <div class="head"><h2>TABLEAU DE BORD</h2><span class="pill">NBA DARK</span></div>
      <div class="grid">
        <section class="panel"><div class="panel-head"><h3>EN DIRECT</h3><span class="pill">${s.length} MATCHS</span></div>
          ${s.length?o`<div class="game-list">${s.map(i=>this._gameCard(i))}</div>`:o`<p class="muted">Aucun match en direct actuellement.</p>`}</section>
        <section class="panel"><div class="panel-head"><h3>À VENIR</h3><span class="pill">${t.length} MATCHS</span></div>
          ${t.length?o`<div class="game-list">${t.map(i=>this._gameCard(i))}</div>`:o`<p class="muted">Aucun prochain match dans le calendrier chargé.</p>`}</section>
        <section class="panel"><div class="panel-head"><h3>ÉQUIPES FAVORITES</h3><span class="pill">${a.length}</span></div>
          ${a.length?o`<div class="team-list">${a.slice(0,6).map(i=>o`
            <div class="team-row">${i.logo?o`<img class="logo" src=${i.logo} alt="">`:""}
              <div class="team-info"><strong>${i.name}</strong><small>${i.id}</small></div>
              <span class="muted">${l(i.next?.date_text,"\u2014")}</span></div>`)}</div>`:o`<p class="muted">Choisis tes équipes favorites dans la configuration de l'intégration NBA.</p>`}</section>
        ${this._leaderPanel("points",5)}
      </div>`}_scoresView(){let e=this._calendarGames,s=this._filteredGames(e),t=new Intl.DateTimeFormat("fr-BE",{weekday:"long",day:"2-digit",month:"long",year:"numeric"}).format(new Date(`${this._selectedDate}T12:00:00`));return o`
      <div class="head"><h2>SCORES & CALENDRIER</h2><span class="pill">${e.length} MATCHS</span></div>
      <div class="date-nav"><button aria-label="Jour précédent" @click=${()=>this._shiftDate(-1)}>‹</button>
        <span class="date-label">${t}</span><input type="date" aria-label="Choisir une date" .value=${this._selectedDate} @change=${this._setDate}>
        <button aria-label="Jour suivant" @click=${()=>this._shiftDate(1)}>›</button>
        <button @click=${()=>{this._selectedDate=ee(new Date,this.hass?.config?.time_zone),this._loadCalendar(this._selectedDate)}}>AUJOURD&#39;HUI</button></div>
      ${this._calendarStale?o`<p class="muted" role="status">Données en cache · actualisation ESPN indisponible${this._calendarStaleError?o` · ${this._calendarStaleError}`:""}</p>`:""}
      <div class="filters">${[["all","TOUS"],["in","LIVE"],["pre","\xC0 VENIR"],["post","TERMIN\xC9S"]].map(([a,i])=>o`<button class="chip" aria-pressed=${this._filter===a} @click=${()=>this._setFilter(a)}>${i}</button>`)}
        <input type="search" aria-label="Rechercher une équipe" placeholder="Filtrer une équipe…" .value=${this._search} @input=${this._setSearch}></div>
      ${this._calendarLoading?o`<section class="empty">Chargement du calendrier…</section>`:""}
      ${this._calendarError?o`<section class="empty"><strong>Calendrier indisponible</strong><p>${this._calendarError}</p><button @click=${()=>this._loadCalendar(this._selectedDate)}>RÉESSAYER</button></section>`:""}
      ${!this._calendarLoading&&!this._calendarError&&s.length?o`<div class="game-list">${s.map(a=>this._gameCard(a))}</div>`:""}
      ${!this._calendarLoading&&!this._calendarError&&!s.length?o`<section class="empty"><strong>${e.length?"Aucun match correspondant":"Aucun match programm\xE9"}</strong><p>${e.length?"Modifie les filtres ou la recherche.":"Aucune rencontre n&#39;est pr\xE9vue pour cette date dans le fuseau horaire de Home Assistant."}</p></section>`:""}
    `}_teamsView(){let e=this._teams();return o`<div class="head"><h2>TEAMS CENTER</h2><span class="pill">${e.length} FAVORITES</span></div>
      ${e.length?o`<div class="grid">${e.map(s=>this._teamPanel(s))}</div>`:o`<section class="empty"><strong>Aucune équipe favorite détectée</strong><p>Sélectionne tes équipes favorites dans Paramètres → Appareils et services → NBA. Les fiches sont alimentées par les capteurs existants.</p></section>`}`}_playersView(){return o`<div class="head"><h2>PLAYERS CENTER</h2><span class="pill">LEADERS NBA</span></div>
      <div class="grid">${Object.keys(L).map(e=>this._leaderPanel(e,10))}</div>`}_statsView(){return o`<div class="head"><h2>STATS CENTER</h2><span class="pill">SAISON</span></div>
      <div class="grid">${this._standingsTable("east","EASTERN CONFERENCE")}${this._standingsTable("west","WESTERN CONFERENCE")}</div>
      <div class="grid" style="margin-top:12px">${Object.keys(L).map(e=>this._leaderPanel(e,5))}</div>`}render(){let e=Z.find(t=>t.id===this._active)??Z[0],s={home:()=>this._homeView(),scores:()=>this._scoresView(),teams:()=>this._teamsView(),players:()=>this._playersView(),stats:()=>this._statsView()};return o`
      <ha-card class="shell">
        <header class="hero"><div class="eyebrow">THE ASSOCIATION · HOME ASSISTANT</div>
          <h1>${this._config.title}</h1><div class="subtitle">${this._config.subtitle}</div>
          <div class="meta"><span class="dot"></span><span>NBA DATA</span><span>·</span>
            <span>${this.hass?"CONNECTED TO HOME ASSISTANT":"WAITING FOR HOME ASSISTANT"}</span></div>
        </header>
        <nav aria-label="NBA Center navigation">${Z.map(t=>o`
          <button type="button" data-view=${t.id} aria-selected=${t.id===this._active}
            @click=${()=>this._selectView(t.id)}>${t.label}</button>`)}</nav>
        <main>${this.hass?s[e.id]():o`
          <section class="empty"><strong>Connexion à Home Assistant…</strong><p>La carte attend les états de l'intégration NBA.</p></section>`}</main>
        ${this._overlayGame?o`<div class="overlay" @click=${t=>{t.target===t.currentTarget&&this._closeOverlay()}} @keydown=${this._onOverlayKeydown}>
          <section class="overlay-panel" role="dialog" aria-modal="true" aria-label="Détails du match">
            <header class="overlay-head"><h2>MATCH CENTER</h2><div class="overlay-actions">
              <button class="overlay-refresh" ?disabled=${this._overlayLoading} @click=${()=>this._openGame(this._overlayGame)} aria-label="Actualiser les détails du match">${this._overlayLoading?"CHARGEMENT\u2026":"\u21BB ACTUALISER"}</button>
              <button class="overlay-close" aria-label="Fermer" @click=${this._closeOverlay}>✕</button>
            </div></header>
            <div class="overlay-body"><div class="overlay-teams">
              <div class="overlay-team">${this._overlayGame.away?.logo?o`<img src=${this._overlayGame.away.logo} alt="">`:""}<strong>${l(this._overlayGame.away?.name)}</strong></div>
              <div class="overlay-score">${this._overlayGame.state==="pre"?"VS":`${l(this._overlayGame.away?.score)} \u2013 ${l(this._overlayGame.home?.score)}`}</div>
              <div class="overlay-team">${this._overlayGame.home?.logo?o`<img src=${this._overlayGame.home.logo} alt="">`:""}<strong>${l(this._overlayGame.home?.name)}</strong></div>
            </div><p class="muted" style="text-align:center">${l(this._overlayGame.date_text)} · ${l(this._overlayGame.detail,this._gameStatus(this._overlayGame).label)}</p>
            ${this._overlayLoading?o`<section class="empty">Chargement du résumé…</section>`:""}
            ${this._overlayError||this._overlayDetails?.error?o`<section class="empty"><p>${l(this._overlayError||this._overlayDetails?.error,"D\xE9tails du match indisponibles.")}</p><button @click=${()=>this._openGame(this._overlayGame)}>RÉESSAYER</button></section>`:""}
            ${this._overlayDetails?.teams?.length?o`<div class="game-leaders-grid">${this._awayFirst(this._overlayDetails.teams).map(t=>o`
              <section class="panel game-leader-card"><div class="panel-head"><h3>${l(t.abbr,t.name)}</h3><span class="pill">LEADERS</span></div>
                ${(t.top_players??[]).length?t.top_players.map(a=>o`<div class="game-leader"><span class="game-leader-category">${l(a.category)}</span><span class="game-leader-name">${l(a.player)}</span><strong class="game-leader-value">${l(a.value)}</strong></div>`):o`<div class="game-leaders-empty">Statistiques des leaders indisponibles.</div>`}</section>`)}</div>`:""}
            ${this._quarterScorePanel()}
            ${this._overlayDetails?.has_boxscore?o`
              <div class="boxscore-section"><div class="section-kicker">FULL GAME BREAKDOWN</div><h3>BOX SCORE · JOUEURS</h3>
                <div class="boxscore-grid">${this._awayFirst(this._overlayDetails.player_stats,t=>this._overlayDetails.team_stats?.find(a=>a.team_id===t.team_id)?.home_away).map(t=>this._boxscorePanel(t))}</div>
                ${this._teamStatsPanel()}
              </div>`:""}
            ${this._playByPlayPanel()}
            ${!this._overlayLoading&&!this._overlayError&&!this._overlayDetails?.error&&!this._overlayDetails?.teams?.length&&!this._overlayDetails?.has_boxscore?o`<section class="empty"><p>Le résumé détaillé n’est pas encore disponible pour cette rencontre.</p></section>`:""}            </div></section></div>`:""}
        <footer class="footer"><span>NBA CENTER · ${e.label}</span><span>DATA VIA HOME ASSISTANT</span></footer>
      </ha-card>`}static getStubConfig(){return{title:"NBA CENTER",subtitle:"Your league. Your teams. One center."}}};customElements.get("nba-center-card")||customElements.define("nba-center-card",te);window.customCards=window.customCards??[];window.customCards.some(r=>r.type==="nba-center-card")||window.customCards.push({type:"nba-center-card",name:"NBA Center",description:"NBA Dark dashboard \u2014 scores, teams, players and stats",preview:!0});
