var k=globalThis,I=k.ShadowRoot&&(k.ShadyCSS===void 0||k.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,M=Symbol(),st=new WeakMap,S=class{constructor(t,s,e){if(this._$cssResult$=!0,e!==M)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=s}get styleSheet(){let t=this.o,s=this.t;if(I&&t===void 0){let e=s!==void 0&&s.length===1;e&&(t=st.get(s)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&st.set(s,t))}return t}toString(){return this.cssText}},at=r=>new S(typeof r=="string"?r:r+"",void 0,M),H=(r,...t)=>{let s=r.length===1?r[0]:t.reduce((e,a,i)=>e+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(a)+r[i+1],r[0]);return new S(s,r,M)},it=(r,t)=>{if(I)r.adoptedStyleSheets=t.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet);else for(let s of t){let e=document.createElement("style"),a=k.litNonce;a!==void 0&&e.setAttribute("nonce",a),e.textContent=s.cssText,r.appendChild(e)}},B=I?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let s="";for(let e of t.cssRules)s+=e.cssText;return at(s)})(r):r;var{is:$t,defineProperty:vt,getOwnPropertyDescriptor:xt,getOwnPropertyNames:wt,getOwnPropertySymbols:At,getPrototypeOf:Et}=Object,z=globalThis,rt=z.trustedTypes,St=rt?rt.emptyScript:"",Ct=z.reactiveElementPolyfillSupport,C=(r,t)=>r,q={toAttribute(r,t){switch(t){case Boolean:r=r?St:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let s=r;switch(t){case Boolean:s=r!==null;break;case Number:s=r===null?null:Number(r);break;case Object:case Array:try{s=JSON.parse(r)}catch{s=null}}return s}},nt=(r,t)=>!$t(r,t),ot={attribute:!0,type:String,converter:q,reflect:!1,useDefault:!1,hasChanged:nt};Symbol.metadata??=Symbol("metadata"),z.litPropertyMetadata??=new WeakMap;var g=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=ot){if(s.state&&(s.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=!0),this.elementProperties.set(t,s),!s.noAccessor){let e=Symbol(),a=this.getPropertyDescriptor(t,e,s);a!==void 0&&vt(this.prototype,t,a)}}static getPropertyDescriptor(t,s,e){let{get:a,set:i}=xt(this.prototype,t)??{get(){return this[s]},set(o){this[s]=o}};return{get:a,set(o){let d=a?.call(this);i?.call(this,o),this.requestUpdate(t,d,e)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ot}static _$Ei(){if(this.hasOwnProperty(C("elementProperties")))return;let t=Et(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(C("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(C("properties"))){let s=this.properties,e=[...wt(s),...At(s)];for(let a of e)this.createProperty(a,s[a])}let t=this[Symbol.metadata];if(t!==null){let s=litPropertyMetadata.get(t);if(s!==void 0)for(let[e,a]of s)this.elementProperties.set(e,a)}this._$Eh=new Map;for(let[s,e]of this.elementProperties){let a=this._$Eu(s,e);a!==void 0&&this._$Eh.set(a,s)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let s=[];if(Array.isArray(t)){let e=new Set(t.flat(1/0).reverse());for(let a of e)s.unshift(B(a))}else t!==void 0&&s.push(B(t));return s}static _$Eu(t,s){let e=s.attribute;return e===!1?void 0:typeof e=="string"?e:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,s=this.constructor.elementProperties;for(let e of s.keys())this.hasOwnProperty(e)&&(t.set(e,this[e]),delete this[e]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return it(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,s,e){this._$AK(t,e)}_$ET(t,s){let e=this.constructor.elementProperties.get(t),a=this.constructor._$Eu(t,e);if(a!==void 0&&e.reflect===!0){let i=(e.converter?.toAttribute!==void 0?e.converter:q).toAttribute(s,e.type);this._$Em=t,i==null?this.removeAttribute(a):this.setAttribute(a,i),this._$Em=null}}_$AK(t,s){let e=this.constructor,a=e._$Eh.get(t);if(a!==void 0&&this._$Em!==a){let i=e.getPropertyOptions(a),o=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:q;this._$Em=a;let d=o.fromAttribute(s,i.type);this[a]=d??this._$Ej?.get(a)??d,this._$Em=null}}requestUpdate(t,s,e,a=!1,i){if(t!==void 0){let o=this.constructor;if(a===!1&&(i=this[t]),e??=o.getPropertyOptions(t),!((e.hasChanged??nt)(i,s)||e.useDefault&&e.reflect&&i===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,e))))return;this.C(t,s,e)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,s,{useDefault:e,reflect:a,wrapped:i},o){e&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??s??this[t]),i!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||e||(s=void 0),this._$AL.set(t,s)),a===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(s){Promise.reject(s)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[a,i]of this._$Ep)this[a]=i;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[a,i]of e){let{wrapped:o}=i,d=this[a];o!==!0||this._$AL.has(a)||d===void 0||this.C(a,void 0,i,d)}}let t=!1,s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(s)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(s)}willUpdate(t){}_$AE(t){this._$EO?.forEach(s=>s.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(s=>this._$ET(s,this[s])),this._$EM()}updated(t){}firstUpdated(t){}};g.elementStyles=[],g.shadowRootOptions={mode:"open"},g[C("elementProperties")]=new Map,g[C("finalized")]=new Map,Ct?.({ReactiveElement:g}),(z.reactiveElementVersions??=[]).push("2.1.2");var J=globalThis,lt=r=>r,U=J.trustedTypes,dt=U?U.createPolicy("lit-html",{createHTML:r=>r}):void 0,ft="$lit$",b=`lit$${Math.random().toFixed(9).slice(2)}$`,gt="?"+b,Tt=`<${gt}>`,x=document,O=()=>x.createComment(""),R=r=>r===null||typeof r!="object"&&typeof r!="function",K=Array.isArray,Ot=r=>K(r)||typeof r?.[Symbol.iterator]=="function",j=`[ 	
\f\r]`,T=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ct=/-->/g,pt=/>/g,$=RegExp(`>|${j}(?:([^\\s"'>=/]+)(${j}*=${j}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ht=/'/g,mt=/"/g,_t=/^(?:script|style|textarea|title)$/i,Q=r=>(t,...s)=>({_$litType$:r,strings:t,values:s}),n=Q(1),Ht=Q(2),Bt=Q(3),w=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),ut=new WeakMap,v=x.createTreeWalker(x,129);function bt(r,t){if(!K(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return dt!==void 0?dt.createHTML(t):t}var Rt=(r,t)=>{let s=r.length-1,e=[],a,i=t===2?"<svg>":t===3?"<math>":"",o=T;for(let d=0;d<s;d++){let c=r[d],h,u,p=-1,f=0;for(;f<c.length&&(o.lastIndex=f,u=o.exec(c),u!==null);)f=o.lastIndex,o===T?u[1]==="!--"?o=ct:u[1]!==void 0?o=pt:u[2]!==void 0?(_t.test(u[2])&&(a=RegExp("</"+u[2],"g")),o=$):u[3]!==void 0&&(o=$):o===$?u[0]===">"?(o=a??T,p=-1):u[1]===void 0?p=-2:(p=o.lastIndex-u[2].length,h=u[1],o=u[3]===void 0?$:u[3]==='"'?mt:ht):o===mt||o===ht?o=$:o===ct||o===pt?o=T:(o=$,a=void 0);let _=o===$&&r[d+1].startsWith("/>")?" ":"";i+=o===T?c+Tt:p>=0?(e.push(h),c.slice(0,p)+ft+c.slice(p)+b+_):c+b+(p===-2?d:_)}return[bt(r,i+(r[s]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),e]},N=class r{constructor({strings:t,_$litType$:s},e){let a;this.parts=[];let i=0,o=0,d=t.length-1,c=this.parts,[h,u]=Rt(t,s);if(this.el=r.createElement(h,e),v.currentNode=this.el.content,s===2||s===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(a=v.nextNode())!==null&&c.length<d;){if(a.nodeType===1){if(a.hasAttributes())for(let p of a.getAttributeNames())if(p.endsWith(ft)){let f=u[o++],_=a.getAttribute(p).split(b),P=/([.?@])?(.*)/.exec(f);c.push({type:1,index:i,name:P[2],strings:_,ctor:P[1]==="."?V:P[1]==="?"?F:P[1]==="@"?W:E}),a.removeAttribute(p)}else p.startsWith(b)&&(c.push({type:6,index:i}),a.removeAttribute(p));if(_t.test(a.tagName)){let p=a.textContent.split(b),f=p.length-1;if(f>0){a.textContent=U?U.emptyScript:"";for(let _=0;_<f;_++)a.append(p[_],O()),v.nextNode(),c.push({type:2,index:++i});a.append(p[f],O())}}}else if(a.nodeType===8)if(a.data===gt)c.push({type:2,index:i});else{let p=-1;for(;(p=a.data.indexOf(b,p+1))!==-1;)c.push({type:7,index:i}),p+=b.length-1}i++}}static createElement(t,s){let e=x.createElement("template");return e.innerHTML=t,e}};function A(r,t,s=r,e){if(t===w)return t;let a=e!==void 0?s._$Co?.[e]:s._$Cl,i=R(t)?void 0:t._$litDirective$;return a?.constructor!==i&&(a?._$AO?.(!1),i===void 0?a=void 0:(a=new i(r),a._$AT(r,s,e)),e!==void 0?(s._$Co??=[])[e]=a:s._$Cl=a),a!==void 0&&(t=A(r,a._$AS(r,t.values),a,e)),t}var G=class{constructor(t,s){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:s},parts:e}=this._$AD,a=(t?.creationScope??x).importNode(s,!0);v.currentNode=a;let i=v.nextNode(),o=0,d=0,c=e[0];for(;c!==void 0;){if(o===c.index){let h;c.type===2?h=new D(i,i.nextSibling,this,t):c.type===1?h=new c.ctor(i,c.name,c.strings,this,t):c.type===6&&(h=new Y(i,this,t)),this._$AV.push(h),c=e[++d]}o!==c?.index&&(i=v.nextNode(),o++)}return v.currentNode=x,a}p(t){let s=0;for(let e of this._$AV)e!==void 0&&(e.strings!==void 0?(e._$AI(t,e,s),s+=e.strings.length-2):e._$AI(t[s])),s++}},D=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,s,e,a){this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=t,this._$AB=s,this._$AM=e,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,s=this._$AM;return s!==void 0&&t?.nodeType===11&&(t=s.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,s=this){t=A(this,t,s),R(t)?t===m||t==null||t===""?(this._$AH!==m&&this._$AR(),this._$AH=m):t!==this._$AH&&t!==w&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Ot(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==m&&R(this._$AH)?this._$AA.nextSibling.data=t:this.T(x.createTextNode(t)),this._$AH=t}$(t){let{values:s,_$litType$:e}=t,a=typeof e=="number"?this._$AC(t):(e.el===void 0&&(e.el=N.createElement(bt(e.h,e.h[0]),this.options)),e);if(this._$AH?._$AD===a)this._$AH.p(s);else{let i=new G(a,this),o=i.u(this.options);i.p(s),this.T(o),this._$AH=i}}_$AC(t){let s=ut.get(t.strings);return s===void 0&&ut.set(t.strings,s=new N(t)),s}k(t){K(this._$AH)||(this._$AH=[],this._$AR());let s=this._$AH,e,a=0;for(let i of t)a===s.length?s.push(e=new r(this.O(O()),this.O(O()),this,this.options)):e=s[a],e._$AI(i),a++;a<s.length&&(this._$AR(e&&e._$AB.nextSibling,a),s.length=a)}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(!1,!0,s);t!==this._$AB;){let e=lt(t).nextSibling;lt(t).remove(),t=e}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},E=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,s,e,a,i){this.type=1,this._$AH=m,this._$AN=void 0,this.element=t,this.name=s,this._$AM=a,this.options=i,e.length>2||e[0]!==""||e[1]!==""?(this._$AH=Array(e.length-1).fill(new String),this.strings=e):this._$AH=m}_$AI(t,s=this,e,a){let i=this.strings,o=!1;if(i===void 0)t=A(this,t,s,0),o=!R(t)||t!==this._$AH&&t!==w,o&&(this._$AH=t);else{let d=t,c,h;for(t=i[0],c=0;c<i.length-1;c++)h=A(this,d[e+c],s,c),h===w&&(h=this._$AH[c]),o||=!R(h)||h!==this._$AH[c],h===m?t=m:t!==m&&(t+=(h??"")+i[c+1]),this._$AH[c]=h}o&&!a&&this.j(t)}j(t){t===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},V=class extends E{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===m?void 0:t}},F=class extends E{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==m)}},W=class extends E{constructor(t,s,e,a,i){super(t,s,e,a,i),this.type=5}_$AI(t,s=this){if((t=A(this,t,s,0)??m)===w)return;let e=this._$AH,a=t===m&&e!==m||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,i=t!==m&&(e===m||a);a&&this.element.removeEventListener(this.name,this,e),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},Y=class{constructor(t,s,e){this.element=t,this.type=6,this._$AN=void 0,this._$AM=s,this.options=e}get _$AU(){return this._$AM._$AU}_$AI(t){A(this,t)}};var Nt=J.litHtmlPolyfillSupport;Nt?.(N,D),(J.litHtmlVersions??=[]).push("3.3.3");var yt=(r,t,s)=>{let e=s?.renderBefore??t,a=e._$litPart$;if(a===void 0){let i=s?.renderBefore??null;e._$litPart$=a=new D(t.insertBefore(O(),i),i,void 0,s??{})}return a._$AI(r),a};var X=globalThis,y=class extends g{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=yt(s,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return w}};y._$litElement$=!0,y.finalized=!0,X.litElementHydrateSupport?.({LitElement:y});var Dt=X.litElementPolyfillSupport;Dt?.({LitElement:y});(X.litElementVersions??=[]).push("4.2.2");var Z=[{id:"home",label:"HOME"},{id:"scores",label:"SCORES"},{id:"teams",label:"TEAMS"},{id:"players",label:"PLAYERS"},{id:"stats",label:"STATS"}],L={points:["POINTS","marque"],rebounds:["REBONDS","rebon"],assists:["PASSES","passe"],steals:["INTERCEPTIONS","inter"],blocks:["CONTRES","contr"]},Pt={games:"sensor.nba_matchs_du_jour",east:"sensor.nba_classement_est",west:"sensor.nba_classement_ouest",points:"sensor.nba_meilleurs_marqueurs",rebounds:"sensor.nba_meilleurs_rebondeurs",assists:"sensor.nba_meilleurs_passeurs",steals:"sensor.nba_meilleurs_intercepteurs",blocks:"sensor.nba_meilleurs_contreurs"},tt=(r=new Date,t)=>{let s=new Intl.DateTimeFormat("en-CA",{timeZone:t,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(r),e=a=>s.find(i=>i.type===a)?.value;return`${e("year")}-${e("month")}-${e("day")}`},kt=(r,t)=>{let[s,e,a]=r.split("-").map(Number),i=new Date(Date.UTC(s,e-1,a+t,12));return[i.getUTCFullYear(),String(i.getUTCMonth()+1).padStart(2,"0"),String(i.getUTCDate()).padStart(2,"0")].join("-")},l=(r,t="\u2014")=>r==null||r===""?t:String(r),It=r=>{if(!r)return"Date \xE0 confirmer";let t=new Date(r);return Number.isNaN(t.getTime())?l(r):new Intl.DateTimeFormat(void 0,{weekday:"short",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(t)},et=class extends y{static properties={hass:{attribute:!1},_active:{state:!0},_filter:{state:!0},_search:{state:!0},_selectedDate:{state:!0},_calendarGames:{state:!0},_calendarLoading:{state:!0},_calendarError:{state:!0},_calendarStale:{state:!0},_overlayGame:{state:!0},_overlayDetails:{state:!0},_overlayLoading:{state:!0},_overlayError:{state:!0},_showAllPlays:{state:!0},_scoringOnly:{state:!0}};static styles=H`
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
    .top-player{padding:12px 0;border-top:1px solid #ffffff12}.top-player strong{display:block;font-size:12px}.top-player small{color:#aab6ca}
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
  `;constructor(){super(),this._active="home",this._filter="all",this._search="",this._selectedDate=tt(),this._calendarGames=[],this._calendarLoading=!1,this._calendarError="",this._calendarStale=!1,this._calendarStaleError="",this._calendarRequest=0,this._calendarInitialized=!1,this._overlayGame=null,this._overlayDetails=null,this._overlayRequest=0,this._overlayLoading=!1,this._overlayError="",this._config={}}setConfig(t){if(!t||typeof t!="object"||Array.isArray(t))throw new Error("Configuration NBA Center invalide : un objet YAML est attendu.");this._config={title:"NBA CENTER",subtitle:"Your league. Your teams. One center.",...t,entities:{...Pt,...t.entities??{}}}}getCardSize(){return 8}get _states(){return this.hass?.states??{}}_state(t){return t?this._states[t]:void 0}_find(t){return Object.values(this._states).find(t)}_entity(t,s){return this._state(this._config.entities?.[t])??this._find(s)}_games(){let t=this._entity("games",s=>Array.isArray(s.attributes?.games)&&!s.attributes?.team_id);return{state:t,rows:t?.attributes?.games??[]}}_standings(t){let s=this._entity(t,e=>{if(!Array.isArray(e.attributes?.standings))return!1;let a=e.entity_id.toLowerCase();return t==="east"?a.includes("classement_est")||a.includes("eastern"):a.includes("classement_ouest")||a.includes("western")});return{state:s,rows:s?.attributes?.standings??[]}}_leaders(t){let s=L[t][1],e=this._entity(t,a=>Array.isArray(a.attributes?.leaders)&&(a.attributes?.category??"").toLowerCase().includes(s));return{state:e,rows:e?.attributes?.leaders??[]}}_teams(){let t={};for(let s of Object.values(this._states)){let e=s.attributes??{};if(!s.entity_id.startsWith("sensor.")||!e.team_id)continue;let a=String(e.team_id),i=(e.friendly_name??s.entity_id).toLowerCase(),o=t[a]??={id:a,name:(e.friendly_name??a).replace(/ (dernier match|prochain match|match en cours|derniers matchs)$/i,""),logo:e.team_logo};o.logo??=e.team_logo,i.includes("dernier match")&&(o.last=e),i.includes("prochain match")&&(o.next=e),i.includes("match en cours")&&(o.live=e),Array.isArray(e.games)&&(o.recent=e.games)}return Object.values(t).sort((s,e)=>s.name.localeCompare(e.name))}_selectView(t){this._active=t,t==="scores"&&(this._calendarInitialized||(this._selectedDate=tt(new Date,this.hass?.config?.time_zone),this._calendarInitialized=!0),this._loadCalendar(this._selectedDate))}_setFilter(t){this._filter=t}_setSearch(t){this._search=t.target.value??""}_shiftDate(t){this._selectedDate=kt(this._selectedDate,t),this._loadCalendar(this._selectedDate)}_setDate(t){this._selectedDate=t.target.value,this._loadCalendar(this._selectedDate)}async _loadCalendar(t){if(!this.hass?.callWS||!t)return;let s=++this._calendarRequest;this._calendarLoading=!0,this._calendarError="",this._calendarStale=!1,this._calendarStaleError="";try{let e=await this.hass.callWS({type:"nba/scoreboard",date:t});if(s!==this._calendarRequest||t!==this._selectedDate)return;this._calendarGames=e.games??[],this._calendarStale=!!e.stale,this._calendarStaleError=e.error??""}catch(e){if(s!==this._calendarRequest||t!==this._selectedDate)return;this._calendarError=e?.message??"Impossible de charger le calendrier NBA.",this._calendarGames=[]}finally{s===this._calendarRequest&&(this._calendarLoading=!1)}}async _openGame(t){let s=++this._overlayRequest;this._overlayGame=t,this._overlayDetails=null,this._overlayError="",this._overlayLoading=!0,this._showAllPlays=!1,this._scoringOnly=!1;try{let e=await this.hass.callWS({type:"nba/game_details",game_id:String(t.id)});if(s!==this._overlayRequest||String(this._overlayGame?.id)!==String(t.id))return;this._overlayDetails=e}catch(e){if(s!==this._overlayRequest)return;this._overlayError=e?.message??"R\xE9sum\xE9 du match indisponible."}finally{s===this._overlayRequest&&(this._overlayLoading=!1)}}_closeOverlay(){this._overlayRequest+=1,this._overlayGame=null,this._overlayDetails=null,this._overlayLoading=!1,this._overlayError=""}_onOverlayKeydown(t){t.key==="Escape"&&this._closeOverlay()}_boxscorePanel(t){let s=t.players??[],e=["MIN","FG","3PT","FT","OREB","DREB","REB","AST","STL","BLK","TO","PF","+/-","PTS"],a=new Set(s.flatMap(d=>Object.keys(d.stats??{}))),i=[...e.filter(d=>a.has(d)),...[...a].filter(d=>!e.includes(d))],o=[...s].sort((d,c)=>+!!c.starter-+!!d.starter);return n`
      <section class="panel boxscore-panel">
        <div class="panel-head"><h3>${l(t.abbr,t.team)}</h3><span class="pill">${s.length} JOUEURS</span></div>
        ${o.length?n`<div class="table-wrap player-table-wrap"><table class="player-table">
          <thead><tr><th>JOUEUR</th>${i.map(d=>n`<th>${d}</th>`)}</tr></thead>
          <tbody>${o.map(d=>n`
            <tr class="${d.starter?"starter":""} ${d.did_not_play?"dnp":""}">
              <td><span class="player-cell">${d.headshot?n`<img src=${d.headshot} alt="" loading="lazy">`:""}<span>${l(d.name)}<small>${[d.jersey?`#${d.jersey}`:"",d.position||"",d.ejected?"\xC9JECT\xC9":d.did_not_play?`DNP \xB7 ${l(d.reason,"NON PRIS EN JEU")}`:d.starter?"TITULAIRE":d.active?"ACTIF":""].filter(Boolean).join(" \xB7 ")}</small></span></span></td>
              ${i.map(c=>n`<td>${l(d.stats?.[c])}</td>`)}
            </tr>`)}
          </tbody>
        </table></div>`:n`<p class="muted">Statistiques individuelles indisponibles.</p>`}
      </section>`}_awayFirst(t,s=e=>e.home_away){return[...t??[]].sort((e,a)=>{let i=o=>s(o)==="away"?0:1;return i(e)-i(a)})}_quarterScorePanel(){let t=this._awayFirst(this._overlayDetails?.teams),s=Math.max(0,...t.map(a=>a.quarters?.length??0));if(!s||!t.length)return"";let e=Array.from({length:s},(a,i)=>i<4?`Q${i+1}`:i===4?"OT":`${i-4+1}OT`);return n`
      <section class="panel quarter-score-panel">
        <div class="panel-head"><h3>SCORE PAR PÉRIODE</h3><span class="pill">${s>4?"PROLONGATION":"TEMPS R\xC9GLEMENTAIRE"}</span></div>
        <div class="table-wrap"><table>
          <thead><tr><th>ÉQUIPE</th>${e.map(a=>n`<th>${a}</th>`)}<th>TOTAL</th></tr></thead>
          <tbody>${t.map(a=>n`
            <tr><td>${l(a.abbr,a.name)}</td>
              ${e.map((i,o)=>n`<td>${l(a.quarters?.[o])}</td>`)}
              <td>${l(a.score)}</td>
            </tr>`)}</tbody>
        </table></div>
      </section>`}_teamStatsPanel(){let t=this._awayFirst(this._overlayDetails?.team_stats);if(!t.length)return"";let s=[...new Set(t.flatMap(e=>(e.statistics??[]).map(a=>a.name)))];return n`
      <section class="panel team-stats-panel">
        <div class="panel-head"><h3>COMPARAISON DES ÉQUIPES</h3><span class="pill">TEAM STATS</span></div>
        <div class="table-wrap"><table><thead><tr><th>STATISTIQUE</th>${t.map(e=>n`<th>${l(e.abbr,e.name)}</th>`)}</tr></thead>
          <tbody>${s.map(e=>{let a=t.flatMap(i=>i.statistics??[]).find(i=>i.name===e)?.label??e;return n`<tr><td>${a}</td>${t.map(i=>n`<td>${l((i.statistics??[]).find(o=>o.name===e)?.value)}</td>`)}</tr>`})}</tbody>
        </table></div>
      </section>`}_playByPlayPanel(){let t=this._overlayDetails?.plays??[];if(!t.length)return"";let e=[...this._scoringOnly?t.filter(i=>i.scoring):t].reverse(),a=this._showAllPlays?e:e.slice(0,12);return n`
      <section class="panel playbyplay-panel">
        <div class="panel-head"><h3>FIL DU MATCH</h3><span class="pill">${t.length} ACTIONS</span></div>
        <div class="play-controls">
          <button class="chip" aria-pressed=${!this._scoringOnly} @click=${()=>{this._scoringOnly=!1,this._showAllPlays=!1}}>TOUTES</button>
          <button class="chip" aria-pressed=${this._scoringOnly} @click=${()=>{this._scoringOnly=!0,this._showAllPlays=!1}}>POINTS SEULEMENT</button>
        </div>
        <ol class="play-list">${a.map(i=>n`
          <li class="play-row ${i.scoring?"scoring":""}">
            <span class="play-clock">${l(i.period_display,Number(i.period)>4?Number(i.period)===5?"OT":`${Number(i.period)-4}OT`:`Q${l(i.period)}`)}<small>${l(i.clock)}</small></span>
            <span class="play-copy">${l(i.text,i.type||"Action")}${i.scoring?n`<small>MARQUE · +${l(i.score_value,"?")} PT</small>`:""}</span>
            <span class="play-score">${i.away_score!=null||i.home_score!=null?`${l(i.away_score)}\u2013${l(i.home_score)}`:""}</span>
          </li>`)}</ol>
        ${e.length>12?n`<button class="chip play-more" @click=${()=>{this._showAllPlays=!this._showAllPlays}}>${this._showAllPlays?"R\xC9DUIRE":`VOIR LES ${e.length} ACTIONS`}</button>`:""}
      </section>`}_gameStatus(t){return t.state==="in"?{label:t.clock?`LIVE \xB7 ${t.clock}`:"LIVE",live:!0}:t.state==="post"?{label:t.detail||"TERMIN\xC9",live:!1}:{label:t.time||"\xC0 VENIR",live:!1}}_gameCard(t){let s=t.home??{},e=t.away??{},a=this._gameStatus(t),i=t.state==="in"||t.state==="post";return n`
      <article class="game" role="button" tabindex="0" @click=${()=>this._openGame(t)} @keydown=${o=>{(o.key==="Enter"||o.key===" ")&&(o.preventDefault(),this._openGame(t))}}>
        <div class="game-main">
          <div class="game-date">${l(t.date_text,It(t.date))}</div>
          <div class="matchup">
            <div class="side away"><span class="team-name">${l(e.abbr,e.name)}</span>
              ${e.logo?n`<img class="logo" src=${e.logo} alt="" loading="lazy">`:""}</div>
            <div class="score ${i?"":"pending"}">${i?`${l(e.score)} \u2013 ${l(s.score)}`:"VS"}</div>
            <div class="side">${s.logo?n`<img class="logo" src=${s.logo} alt="" loading="lazy">`:""}
              <span class="team-name">${l(s.abbr,s.name)}</span></div>
          </div>
        </div>
        <div class="status ${a.live?"live":""}">${a.label}</div>
      </article>`}_filteredGames(t){let s=this._search.trim().toLowerCase();return t.filter(e=>{let a=this._filter==="all"||e.state===this._filter,i=`${e.home?.name??""} ${e.home?.abbr??""} ${e.away?.name??""} ${e.away?.abbr??""}`.toLowerCase();return a&&(!s||i.includes(s))})}_leaderPanel(t,s=5){let e=this._leaders(t).rows;return n`
      <section class="panel">
        <div class="panel-head"><h3>${L[t][0]}</h3><span class="pill">SAISON</span></div>
        ${e.length?n`<div class="leader-list">${e.slice(0,s).map((a,i)=>n`
          <div class="leader"><span class="rank">${l(a.rank,i+1)}</span>
            ${a.headshot?n`<img class="avatar" src=${a.headshot} alt="" loading="lazy">`:n`<div class="avatar"></div>`}
            <div class="player">${l(a.player)}<small>${l(a.team)}</small></div>
            <span class="stat">${l(a.value)}</span>
          </div>`)}</div>`:n`<p class="muted">Données de classement indisponibles.</p>`}
      </section>`}_standingsTable(t,s){let e=this._standings(t).rows;return n`
      <section class="panel">
        <div class="panel-head"><h3>${s}</h3><span class="pill">${e.length} ÉQUIPES</span></div>
        ${e.length?n`<div class="table-wrap"><table>
          <thead><tr><th>#</th><th>ÉQUIPE</th><th>V</th><th>D</th><th>%</th><th>GB</th></tr></thead>
          <tbody>${e.slice(0,15).map((a,i)=>n`
            <tr><td>${l(a.rank,i+1)}</td><td>${l(a.abbr,a.team)}</td><td>${l(a.wins)}</td>
            <td>${l(a.losses)}</td><td>${l(a.pct)}</td><td>${l(a.gb)}</td></tr>`)}</tbody>
        </table></div>`:n`<p class="muted">Classement indisponible.</p>`}
      </section>`}_teamPanel(t){let s=t.last,e=t.next;return n`
      <section class="panel">
        <div class="team-row">
          ${t.logo?n`<img class="logo large" src=${t.logo} alt="" loading="lazy">`:""}
          <div class="team-info"><strong>${t.name}</strong><small>Équipe favorite · ${t.id}</small></div>
          ${t.live?.state==="in"?n`<span class="pill accent">LIVE</span>`:""}
        </div>
        <div class="team-row"><div class="team-info"><small>DERNIER MATCH</small><strong>${l(s?.name,"Donn\xE9e indisponible")}</strong></div>
          <div class="record">${l(s?.away?.score)} – ${l(s?.home?.score)}</div></div>
        <div class="team-row"><div class="team-info"><small>PROCHAIN MATCH</small><strong>${l(e?.name,"Calendrier indisponible")}</strong>
          <small>${l(e?.date_text,"")}</small></div></div>
        ${t.recent?.length?n`
          <div class="muted" style="margin-top:10px">FORME RÉCENTE</div>
          <div class="recent">${t.recent.slice(0,5).map(a=>n`
            <span class="form-chip ${a.result==="V"?"win":"loss"}">
              <strong>${l(a.result)}</strong><span>${l(a.opp_abbr)}</span>
              <span>${l(a.team_score)}–${l(a.opp_score)}</span>
            </span>`)}</div>`:""}
      </section>`}_homeView(){let{rows:t}=this._games(),s=t.filter(i=>i.state==="in"),e=t.filter(i=>i.state==="pre").slice(0,4),a=this._teams();return n`
      <div class="head"><h2>TABLEAU DE BORD</h2><span class="pill">NBA DARK</span></div>
      <div class="grid">
        <section class="panel"><div class="panel-head"><h3>EN DIRECT</h3><span class="pill">${s.length} MATCHS</span></div>
          ${s.length?n`<div class="game-list">${s.map(i=>this._gameCard(i))}</div>`:n`<p class="muted">Aucun match en direct actuellement.</p>`}</section>
        <section class="panel"><div class="panel-head"><h3>À VENIR</h3><span class="pill">${e.length} MATCHS</span></div>
          ${e.length?n`<div class="game-list">${e.map(i=>this._gameCard(i))}</div>`:n`<p class="muted">Aucun prochain match dans le calendrier chargé.</p>`}</section>
        <section class="panel"><div class="panel-head"><h3>ÉQUIPES FAVORITES</h3><span class="pill">${a.length}</span></div>
          ${a.length?n`<div class="team-list">${a.slice(0,6).map(i=>n`
            <div class="team-row">${i.logo?n`<img class="logo" src=${i.logo} alt="">`:""}
              <div class="team-info"><strong>${i.name}</strong><small>${i.id}</small></div>
              <span class="muted">${l(i.next?.date_text,"\u2014")}</span></div>`)}</div>`:n`<p class="muted">Choisis tes équipes favorites dans la configuration de l'intégration NBA.</p>`}</section>
        ${this._leaderPanel("points",5)}
      </div>`}_scoresView(){let t=this._calendarGames,s=this._filteredGames(t),e=new Intl.DateTimeFormat("fr-BE",{weekday:"long",day:"2-digit",month:"long",year:"numeric"}).format(new Date(`${this._selectedDate}T12:00:00`));return n`
      <div class="head"><h2>SCORES & CALENDRIER</h2><span class="pill">${t.length} MATCHS</span></div>
      <div class="date-nav"><button aria-label="Jour précédent" @click=${()=>this._shiftDate(-1)}>‹</button>
        <span class="date-label">${e}</span><input type="date" aria-label="Choisir une date" .value=${this._selectedDate} @change=${this._setDate}>
        <button aria-label="Jour suivant" @click=${()=>this._shiftDate(1)}>›</button>
        <button @click=${()=>{this._selectedDate=tt(new Date,this.hass?.config?.time_zone),this._loadCalendar(this._selectedDate)}}>AUJOURD&#39;HUI</button></div>
      ${this._calendarStale?n`<p class="muted" role="status">Données en cache · actualisation ESPN indisponible${this._calendarStaleError?n` · ${this._calendarStaleError}`:""}</p>`:""}
      <div class="filters">${[["all","TOUS"],["in","LIVE"],["pre","\xC0 VENIR"],["post","TERMIN\xC9S"]].map(([a,i])=>n`<button class="chip" aria-pressed=${this._filter===a} @click=${()=>this._setFilter(a)}>${i}</button>`)}
        <input type="search" aria-label="Rechercher une équipe" placeholder="Filtrer une équipe…" .value=${this._search} @input=${this._setSearch}></div>
      ${this._calendarLoading?n`<section class="empty">Chargement du calendrier…</section>`:""}
      ${this._calendarError?n`<section class="empty"><strong>Calendrier indisponible</strong><p>${this._calendarError}</p><button @click=${()=>this._loadCalendar(this._selectedDate)}>RÉESSAYER</button></section>`:""}
      ${!this._calendarLoading&&!this._calendarError&&s.length?n`<div class="game-list">${s.map(a=>this._gameCard(a))}</div>`:""}
      ${!this._calendarLoading&&!this._calendarError&&!s.length?n`<section class="empty"><strong>${t.length?"Aucun match correspondant":"Aucun match programm\xE9"}</strong><p>${t.length?"Modifie les filtres ou la recherche.":"Aucune rencontre n&#39;est pr\xE9vue pour cette date dans le fuseau horaire de Home Assistant."}</p></section>`:""}
    `}_teamsView(){let t=this._teams();return n`<div class="head"><h2>TEAMS CENTER</h2><span class="pill">${t.length} FAVORITES</span></div>
      ${t.length?n`<div class="grid">${t.map(s=>this._teamPanel(s))}</div>`:n`<section class="empty"><strong>Aucune équipe favorite détectée</strong><p>Sélectionne tes équipes favorites dans Paramètres → Appareils et services → NBA. Les fiches sont alimentées par les capteurs existants.</p></section>`}`}_playersView(){return n`<div class="head"><h2>PLAYERS CENTER</h2><span class="pill">LEADERS NBA</span></div>
      <div class="grid">${Object.keys(L).map(t=>this._leaderPanel(t,10))}</div>`}_statsView(){return n`<div class="head"><h2>STATS CENTER</h2><span class="pill">SAISON</span></div>
      <div class="grid">${this._standingsTable("east","EASTERN CONFERENCE")}${this._standingsTable("west","WESTERN CONFERENCE")}</div>
      <div class="grid" style="margin-top:12px">${Object.keys(L).map(t=>this._leaderPanel(t,5))}</div>`}render(){let t=Z.find(e=>e.id===this._active)??Z[0],s={home:()=>this._homeView(),scores:()=>this._scoresView(),teams:()=>this._teamsView(),players:()=>this._playersView(),stats:()=>this._statsView()};return n`
      <ha-card class="shell">
        <header class="hero"><div class="eyebrow">THE ASSOCIATION · HOME ASSISTANT</div>
          <h1>${this._config.title}</h1><div class="subtitle">${this._config.subtitle}</div>
          <div class="meta"><span class="dot"></span><span>NBA DATA</span><span>·</span>
            <span>${this.hass?"CONNECTED TO HOME ASSISTANT":"WAITING FOR HOME ASSISTANT"}</span></div>
        </header>
        <nav aria-label="NBA Center navigation">${Z.map(e=>n`
          <button type="button" data-view=${e.id} aria-selected=${e.id===this._active}
            @click=${()=>this._selectView(e.id)}>${e.label}</button>`)}</nav>
        <main>${this.hass?s[t.id]():n`
          <section class="empty"><strong>Connexion à Home Assistant…</strong><p>La carte attend les états de l'intégration NBA.</p></section>`}</main>
        ${this._overlayGame?n`<div class="overlay" @click=${e=>{e.target===e.currentTarget&&this._closeOverlay()}} @keydown=${this._onOverlayKeydown}>
          <section class="overlay-panel" role="dialog" aria-modal="true" aria-label="Détails du match">
            <header class="overlay-head"><h2>MATCH CENTER</h2><div class="overlay-actions">
              <button class="overlay-refresh" ?disabled=${this._overlayLoading} @click=${()=>this._openGame(this._overlayGame)} aria-label="Actualiser les détails du match">${this._overlayLoading?"CHARGEMENT\u2026":"\u21BB ACTUALISER"}</button>
              <button class="overlay-close" aria-label="Fermer" @click=${this._closeOverlay}>✕</button>
            </div></header>
            <div class="overlay-body"><div class="overlay-teams">
              <div class="overlay-team">${this._overlayGame.away?.logo?n`<img src=${this._overlayGame.away.logo} alt="">`:""}<strong>${l(this._overlayGame.away?.name)}</strong></div>
              <div class="overlay-score">${this._overlayGame.state==="pre"?"VS":`${l(this._overlayGame.away?.score)} \u2013 ${l(this._overlayGame.home?.score)}`}</div>
              <div class="overlay-team">${this._overlayGame.home?.logo?n`<img src=${this._overlayGame.home.logo} alt="">`:""}<strong>${l(this._overlayGame.home?.name)}</strong></div>
            </div><p class="muted" style="text-align:center">${l(this._overlayGame.date_text)} · ${l(this._overlayGame.detail,this._gameStatus(this._overlayGame).label)}</p>
            ${this._overlayLoading?n`<section class="empty">Chargement du résumé…</section>`:""}
            ${this._overlayError||this._overlayDetails?.error?n`<section class="empty"><p>${l(this._overlayError||this._overlayDetails?.error,"D\xE9tails du match indisponibles.")}</p><button @click=${()=>this._openGame(this._overlayGame)}>RÉESSAYER</button></section>`:""}
            ${this._overlayDetails?.teams?.length?n`<div class="grid">${this._awayFirst(this._overlayDetails.teams).map(e=>n`
              <section class="panel"><div class="panel-head"><h3>${l(e.abbr,e.name)}</h3><span class="pill">${l(e.score)}</span></div>
                ${(e.top_players??[]).map(a=>n`<div class="top-player"><strong>${l(a.player)}</strong><small>${l(a.category)} · ${l(a.value)}</small></div>`)}</section>`)}</div>`:""}
            ${this._quarterScorePanel()}
            ${this._overlayDetails?.has_boxscore?n`
              <div class="boxscore-section"><div class="section-kicker">FULL GAME BREAKDOWN</div><h3>BOX SCORE · JOUEURS</h3>
                <div class="boxscore-grid">${this._awayFirst(this._overlayDetails.player_stats,e=>this._overlayDetails.team_stats?.find(a=>a.team_id===e.team_id)?.home_away).map(e=>this._boxscorePanel(e))}</div>
                ${this._teamStatsPanel()}
              </div>`:""}
            ${this._playByPlayPanel()}
            ${!this._overlayLoading&&!this._overlayError&&!this._overlayDetails?.error&&!this._overlayDetails?.teams?.length&&!this._overlayDetails?.has_boxscore?n`<section class="empty"><p>Le résumé détaillé n’est pas encore disponible pour cette rencontre.</p></section>`:""}            </div></section></div>`:""}
        <footer class="footer"><span>NBA CENTER · ${t.label}</span><span>DATA VIA HOME ASSISTANT</span></footer>
      </ha-card>`}static getStubConfig(){return{title:"NBA CENTER",subtitle:"Your league. Your teams. One center."}}};customElements.get("nba-center-card")||customElements.define("nba-center-card",et);window.customCards=window.customCards??[];window.customCards.some(r=>r.type==="nba-center-card")||window.customCards.push({type:"nba-center-card",name:"NBA Center",description:"NBA Dark dashboard \u2014 scores, teams, players and stats",preview:!0});
