(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e){return e===`github.com`?`https://api.github.com`:`https://${e}/api/v3`}function t(e){return{Authorization:`Bearer ${e}`,Accept:`application/vnd.github+json`,"Content-Type":`application/json`}}async function n(n,r,i,a){let o;for(let s=0;s<3;s++)try{let o=await fetch(`${e(n)}${i}`,{...a,headers:{...t(r),...a?.headers}}),s=await o.text();if(!o.ok)throw Error(`GitHub API ${o.status}: ${s}`);return JSON.parse(s.replace(/\r\n/g,`
`))}catch(e){if(o=e instanceof Error?e:Error(String(e)),o.message.startsWith(`GitHub API `))throw o;s<2&&await new Promise(e=>setTimeout(e,500*(s+1)))}throw o}function r(e,t){return n(e,t,`/user`)}async function i(e,t,r,i){try{return await n(e,t,`/repos/${r}/${i}`),!0}catch{return!1}}async function a(e,t){return(await n(e,t,`/search/issues?q=is%3Aissue%20label%3Anotehub%20state%3Aopen&sort=updated&order=desc&per_page=100`)).items.map(e=>{let t=e.repository_url.split(`/`),n=t.pop(),r=t.pop();return{...e,owner:r,repo:n}})}function o(e,t,r,i,a){return n(e,t,`/repos/${r}/${i}/issues/${a}`)}function s(e,t,r,i,a,o){return n(e,t,`/repos/${r}/${i}/issues/${a}`,{method:`PATCH`,body:JSON.stringify(o)})}async function c(e,t,r,i,a,o){return await ee(e,t,r,i),n(e,t,`/repos/${r}/${i}/issues`,{method:`POST`,body:JSON.stringify({title:a,body:o,labels:[`notehub`]})})}function l(e,t,r,i,a){return n(e,t,`/repos/${r}/${i}/issues/${a}`,{method:`PATCH`,body:JSON.stringify({state:`closed`})})}function u(e){let[t,n]=e.split(`/`);return{owner:t,repo:`${n}.attachments`}}function d(e,t,n,r){return e===`github.com`?`https://raw.githubusercontent.com/${t}/${n}/main/${r}`:`https://${e}/raw/${t}/${n}/main/${r}`}async function f(e,t,r,i){let a=new Map;try{let o=await n(e,t,`/repos/${r}/${i}/git/trees/main?recursive=1`);for(let e of o.tree){if(e.type!==`blob`)continue;let t=e.path.split(`/`);if(t.length<4)continue;let n=`${t[0]}/${t[1]}/${t[2]}`;a.set(n,(a.get(n)??0)+1)}}catch{}return a}async function p(e,t,r,i,a,o,s){try{return await n(e,t,`/repos/${r}/${i}/contents/${a}/${o}/${s}`)}catch(e){if(e instanceof Error&&e.message.includes(`404`))return[];throw e}}async function m(e,t,r,i,a,o,s,c,l,u){let d={message:`notehub: attach ${c} to ${a}/${o}#${s}`,content:l};return u&&(d.sha=u),(await n(e,t,`/repos/${r}/${i}/contents/${a}/${o}/${s}/${encodeURIComponent(c)}`,{method:`PUT`,body:JSON.stringify(d)})).content}async function h(t,n,r,i,a){let o=await fetch(`${e(t)}/repos/${r}/${i}/contents/${a}`,{headers:{Authorization:`Bearer ${n}`,Accept:`application/vnd.github.raw`}});if(!o.ok){let e=await o.text();throw Error(`GitHub API ${o.status}: ${e}`)}return{blob:await o.blob(),filename:a.split(`/`).pop()}}async function g(e,t,r,i,a,o){await n(e,t,`/repos/${r}/${i}/contents/${a}`,{method:`DELETE`,body:JSON.stringify({message:`notehub: remove ${a.split(`/`).pop()}`,sha:o})})}async function ee(e,t,r,i){try{await n(e,t,`/repos/${r}/${i}/labels`,{method:`POST`,body:JSON.stringify({name:`notehub`,color:`1d76db`,description:`notehub note`})})}catch{}}var _=`_app_debug_logs`,te=1e3;function ne(){try{let e=localStorage.getItem(_);return e?JSON.parse(e):[]}catch{return[]}}function re(e){try{let t=e.slice(-te);localStorage.setItem(_,JSON.stringify(t))}catch{}}function ie(e,t){let n={timestamp:new Date().toISOString(),level:e,message:t},r=ne();r.push(n),re(r),console[e===`warn`?`warn`:e===`error`?`error`:`log`](`[${e.toUpperCase()}] ${t}`)}function v(e){ie(`error`,e)}function ae(e){ie(`warn`,e)}function y(e){ie(`info`,e)}function oe(){let e=ne();return e.length===0?`(no logs)`:e.map(e=>`[${new Date(e.timestamp).toLocaleTimeString()}] ${e.level.toUpperCase()}: ${e.message}`).join(`
`)}function se(){try{localStorage.removeItem(_)}catch{}}function ce(){let e=document.createElement(`div`);e.id=`log-viewer-modal`,e.style.cssText=`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;let t=document.createElement(`div`);t.style.cssText=`
    background: #1e1e1e;
    color: #e0e0e0;
    border: 1px solid #444;
    border-radius: 4px;
    width: 80vw;
    max-width: 800px;
    height: 70vh;
    display: flex;
    flex-direction: column;
    font-family: monospace;
    font-size: 12px;
  `;let n=document.createElement(`div`);n.style.cssText=`
    padding: 10px;
    border-bottom: 1px solid #444;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,n.innerHTML=`<div>Debug Logs</div>`;let r=document.createElement(`button`);r.textContent=`×`,r.style.cssText=`
    background: none;
    border: none;
    color: #e0e0e0;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
  `,r.addEventListener(`click`,()=>e.remove()),n.appendChild(r);let i=document.createElement(`textarea`);i.readOnly=!0,i.value=oe(),i.style.cssText=`
    flex: 1;
    padding: 10px;
    background: #1e1e1e;
    color: #e0e0e0;
    border: none;
    font-family: monospace;
    font-size: 12px;
    resize: none;
    overflow: auto;
  `,i.scrollTop=i.scrollHeight;let a=document.createElement(`div`);a.style.cssText=`
    padding: 10px;
    border-top: 1px solid #444;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  `;let o=document.createElement(`button`);o.textContent=`Clear Logs`,o.style.cssText=`
    padding: 6px 12px;
    background: #d32f2f;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  `,o.addEventListener(`click`,()=>{se(),i.value=`(no logs)`}),a.appendChild(o);let s=document.createElement(`button`);return s.textContent=`Refresh`,s.style.cssText=`
    padding: 6px 12px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  `,s.addEventListener(`click`,()=>{i.value=oe(),i.scrollTop=i.scrollHeight}),a.appendChild(s),t.appendChild(n),t.appendChild(i),t.appendChild(a),e.appendChild(t),e.addEventListener(`click`,t=>{t.target===e&&e.remove()}),e}function le(e){let t=e.replace(/^#\/?/,``);if(!t)return{screen:`list`};let n=t.split(`/`);if(n[0]===`edit`&&n.length===4){let e=parseInt(n[3],10);if(e>0&&Number.isFinite(e))return{screen:`edit`,owner:n[1],repo:n[2],number:e}}return n[0]===`new`&&n.length===3?{screen:`new`,owner:n[1],repo:n[2]}:{screen:`list`}}function b(e){switch(e.screen){case`list`:return`#/`;case`edit`:return`#/edit/${e.owner}/${e.repo}/${e.number}`;case`new`:return`#/new/${e.owner}/${e.repo}`}}function x(e){location.hash=b(e)}function S(e){let t=b(e);history.replaceState(null,``,t)}function ue(e){let t=()=>e(le(location.hash));return window.addEventListener(`hashchange`,t),()=>window.removeEventListener(`hashchange`,t)}var de=`modulepreload`,fe=function(e){return`/notehub.web/`+e},pe={},me=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=fe(t,n),t in pe)return;pe[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:de,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},C=`notehub:token`,he=window.matchMedia(`(pointer: coarse)`).matches,ge=`https://stabledog.github.io/veditor.web/`,w,T=`notehub:host`,_e=`notehub:defaultRepo`,ve=`notehub:pinnedIssue`,ye=`🎫 New note`,be=`# New note`;function xe(){return localStorage.getItem(_e)}function Se(){let e=localStorage.getItem(ve);if(!e)return null;try{let t=JSON.parse(e);if(t.owner&&t.repo&&typeof t.number==`number`)return t}catch{}return null}function Ce(){return xe()!==null}function E(){let e=xe();return e?u(e):null}async function we(){if(!D)return null;let e=E();return e?await i(D.host,D.token,e.owner,e.repo)?e:(J(`Attachments repo "${e.owner}/${e.repo}" not found. Create it on GitHub to use attachments.`,!0),null):(J(`No default repo configured — cannot use attachments.`,!0),null)}var D=null,O=null,k=null,A=``,j=``,M=null,N=null,P=null,F=[],I=0,L=new Set,R=null,z=null;function B(e){if(!D){U();return}switch(e.screen){case`list`:if(R===`list`)return;Ee();break;case`edit`:{let t=`${e.owner}/${e.repo}/${e.number}`;if(R===`edit`&&z===t)return;ke(e.owner,e.repo,e.number);break}case`new`:G(e.owner,e.repo);break}}function V(e,t){if(he){window.open(X(D.host,e.owner,e.repo,e.number)+`#new_comment_field`,`_blank`);return}let n={screen:`edit`,owner:e.owner,repo:e.repo,number:e.number};t.ctrlKey||t.metaKey?window.open(`${location.pathname}${b(n)}`,`_blank`):x(n)}var H=document.getElementById(`app`);async function Te(){if(!he){let e=document.createElement(`link`);e.rel=`stylesheet`,e.href=`${ge}/veditor.css`,document.head.appendChild(e);try{w=await me(()=>import(`${ge}/veditor.js`),[]);let e=document.getElementById(`version-badge`);e&&w.VERSION&&(e.textContent+=` \u00b7 ve${w.VERSION}`)}catch(e){v(`Failed to load editor from ${ge}/veditor.js: ${e instanceof Error?e.message:e}`)}}let e=localStorage.getItem(C),t=localStorage.getItem(T)??`github.com`;e&&Ce()?r(t,e).then(n=>{D={host:t,token:e,username:n.login},ue(B),B(le(location.hash))}).catch(()=>U()):U()}function U(e){P?.destroy(),P=null,w?.destroyEditor();let t=localStorage.getItem(T)??`github.com`,n=localStorage.getItem(C)??``,i=localStorage.getItem(_e)??``,a=Se();H.innerHTML=`
    <div class="auth-screen">
      <h1>notehub</h1>
      <p>GitHub Issues as notes, with vi keybindings.</p>
      ${e?`<div class="error">${e}</div>`:``}
      <form id="settings-form">
        <label>GitHub Host
          <input type="text" id="settings-host" value="${Q(t)}" required />
        </label>
        <label>Personal Access Token
          <input type="password" id="settings-pat" value="${Q(n)}" placeholder="ghp_..." required />
        </label>
        <label>Default Repository
          <input type="text" id="settings-repo" value="${Q(i)}" placeholder="owner/repo" required />
        </label>
        <label>Pinned Issue Number <span style="color:#6c7086">(optional)</span>
          <input type="number" id="settings-pinned" value="${a?.number??``}" placeholder="e.g. 7" min="1" />
        </label>
        <button type="submit">Save &amp; Continue</button>
      </form>
    </div>
  `,document.getElementById(`settings-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`settings-host`).value.trim(),n=document.getElementById(`settings-pat`).value.trim(),i=document.getElementById(`settings-repo`).value.trim(),a=document.getElementById(`settings-pinned`).value.trim(),o=i.split(`/`);if(o.length!==2||!o[0]||!o[1]){U(`Repository must be in owner/repo format.`);return}try{y(`Settings: Validating token for host=${t}`);let e=await r(t,n);if(y(`Settings: Token validated for user ${e.login} on ${t}`),localStorage.setItem(T,t),localStorage.setItem(C,n),localStorage.setItem(_e,i),D={host:t,token:n,username:e.login},a){let e=parseInt(a,10);if(isNaN(e)||e<1){U(`Pinned issue must be a positive number.`);return}localStorage.setItem(ve,JSON.stringify({owner:o[0],repo:o[1],number:e}))}else localStorage.removeItem(ve);ue(B),B(le(location.hash))}catch(e){v(`Settings: Token validation failed for host=${t}: ${e instanceof Error?e.message:e}`),U(`Authentication failed: ${e instanceof Error?e.message:e}`)}})}var W=null;async function Ee(){if(P?.destroy(),P=null,w?.destroyEditor(),W?.(),W=null,O=null,R=`list`,z=null,S({screen:`list`}),!D)return;let e=[];H.innerHTML=`
    <div class="note-list-screen">
      <header>
        <h1>notehub</h1>
        <div class="header-info">
          <span>@${D.username}</span>
          <button id="logs-btn" title="View debug logs">Logs</button>
          <button id="settings-btn" title="Settings">Settings</button>
          <button id="sign-out">Sign out</button>
        </div>
      </header>
      <div class="toolbar">
        <button id="new-note">New Note</button>
        <button id="refresh">Refresh</button>
      </div>
      <div id="notes-container"><p>Loading...</p></div>
      <footer class="note-list-footer">
        <span><kbd>j</kbd><kbd>k</kbd> Navigate</span>
        <span><kbd>Enter</kbd> Open note</span>
        <span><kbd>n</kbd> New note</span>
        <span><kbd>r</kbd> Refresh</span>
        <span><kbd>/</kbd> Search</span>
      </footer>
    </div>
  `;let t=document.getElementById(`notes-container`),n=0;function r(){let e=t.querySelectorAll(`.note-row`);e.forEach((e,t)=>{e.classList.toggle(`selected`,t===n)}),e[n]?.scrollIntoView({block:`nearest`})}let i=i=>{if(!(i.target instanceof HTMLInputElement||i.target instanceof HTMLTextAreaElement)&&!c&&!document.getElementById(`repo-picker-overlay`))if(i.key===`n`)i.preventDefault(),document.getElementById(`new-note`).click();else if(i.key===`r`)i.preventDefault(),Ee();else if(i.key===`j`||i.key===`ArrowDown`){i.preventDefault();let e=t.querySelectorAll(`.note-row`);e.length>0&&(n=Math.min(n+1,e.length-1),r())}else if(i.key===`k`||i.key===`ArrowUp`)i.preventDefault(),n>0&&(n--,r());else if(i.key===`Enter`){i.preventDefault();let r=t.querySelectorAll(`.note-row`);if(r.length>0){let t=parseInt(r[n].getAttribute(`data-index`),10),a=e[t];V(a,i)}}else i.key===`Escape`&&s?(i.preventDefault(),h()):i.key===`/`&&(i.preventDefault(),p())};document.addEventListener(`keydown`,i),W=()=>document.removeEventListener(`keydown`,i);let o=null,s=!1,c=!1,u=!1,d=null,f=``;function p(){if(s)return;s=!0,c=!0,f=t.innerHTML;let e=document.createElement(`div`);e.className=`search-bar`,e.id=`search-bar`,e.innerHTML=`
      <span class="search-slash">/</span>
      <div id="search-input-container"></div>
      <button id="search-regex-toggle" class="search-regex-toggle" title="Toggle regex (Ctrl+R)">.*</button>
      <span id="search-count" class="search-count"></span>
    `,t.parentElement.insertBefore(e,t),e.addEventListener(`focusin`,()=>{c=!0}),e.addEventListener(`focusout`,()=>{c=!1}),o=w.createVimInput(document.getElementById(`search-input-container`),{placeholder:`Search notes...`,initialInsert:!0,onEscape:h,onChange:e=>{d&&clearTimeout(d),d=setTimeout(()=>g(e),150)},onEnter:()=>{document.activeElement?.blur()},storagePrefix:`notehub`}),o.focus(),m(),document.getElementById(`search-regex-toggle`).addEventListener(`click`,()=>{u=!u,m(),o&&g(o.getValue())}),e.addEventListener(`keydown`,e=>{e.key===`r`&&e.ctrlKey&&(e.preventDefault(),u=!u,m(),o&&g(o.getValue()))})}function m(){let e=document.getElementById(`search-regex-toggle`);e&&e.classList.toggle(`active`,u)}function h(){s&&(s=!1,c=!1,d&&=(clearTimeout(d),null),o?.destroy(),o=null,document.getElementById(`search-bar`)?.remove(),f&&(t.innerHTML=f,f=``,te()),n=0,r())}function g(i){let a=document.getElementById(`search-count`);if(!i.trim()){f&&(t.innerHTML=f,te()),a&&(a.textContent=``),n=0,r();return}let o=ee(i,u,e);a&&(a.textContent=`${o.length} match${o.length===1?``:`es`}`),_(o)}function ee(e,t,n){let r;if(t){let t;try{t=new RegExp(e,`gi`)}catch{let e=document.getElementById(`search-count`);return e&&(e.textContent=`invalid regex`,e.classList.add(`error`)),[]}let n=document.getElementById(`search-count`);n&&n.classList.remove(`error`),r=e=>{t.lastIndex=0;let n=t.exec(e);return n?{index:n.index,length:n[0].length}:null}}else{let t=e.toLowerCase();r=e=>{let n=e.toLowerCase().indexOf(t);return n>=0?{index:n,length:t.length}:null}}let i=[];for(let e=0;e<n.length;e++){let t=n[e],a=t.body??``,o=r(t.title),s=r(a);if(!o&&!s)continue;let c=s??o,l=s?a:t.title,u=Math.max(0,c.index-40),d=Math.min(l.length,c.index+c.length+40),f=Y(l.slice(u,c.index)),p=Y(l.slice(c.index,c.index+c.length)),m=Y(l.slice(c.index+c.length,d)),h=`${u>0?`...`:``}${f}<mark>${p}</mark>${m}${d<l.length?`...`:``}`;i.push({note:t,index:e,context:h})}return i}function _(i){if(i.length===0){t.innerHTML=`<p class="empty">No matches found.</p>`;return}t.innerHTML=`
      <table>
        <thead><tr><th>Title</th><th>#</th><th></th><th>Context</th><th>Updated</th><th>Repo</th></tr></thead>
        <tbody>
          ${i.map((e,t)=>`
            <tr class="note-row" data-index="${e.index}" data-result-index="${t}">
              <td>${Y(e.note.title)}</td>
              <td>${e.note.number}</td>
              <td></td>
              <td class="search-context">${e.context}</td>
              <td>${new Date(e.note.updated_at).toLocaleDateString(`en-US`,{month:`numeric`,day:`numeric`,year:`2-digit`})}</td>
              <td><span title="${Q(e.note.owner)}/${Q(e.note.repo)}">${Y(e.note.repo)}</span></td>
            </tr>
          `).join(``)}
        </tbody>
      </table>
    `,n=0,r(),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,n=>{let r=parseInt(t.getAttribute(`data-index`),10),i=e[r];V(i,n)})})}function te(){t.querySelectorAll(`.copy-url-btn`).forEach(t=>{t.addEventListener(`click`,n=>{n.stopPropagation();let r=parseInt(t.dataset.index,10),i=e[r];Qe(t,Ze(i.owner,i.repo,i.number),X(D.host,i.owner,i.repo,i.number))})}),t.querySelectorAll(`.context-menu-btn`).forEach(n=>{n.addEventListener(`click`,r=>{r.stopPropagation(),document.querySelector(`.note-context-menu`)?.remove();let i=parseInt(n.dataset.index,10),a=e[i],o=n.getBoundingClientRect(),s=document.createElement(`div`);s.className=`note-context-menu`,s.innerHTML=`
          <button class="context-github-btn">${Ye} Edit on GitHub</button>
          <button class="context-delete-btn">${Je} Delete</button>
        `,s.style.top=`${o.bottom+4}px`,s.style.left=`${o.right}px`,document.body.appendChild(s);let c=()=>{s.remove(),document.removeEventListener(`click`,c)};setTimeout(()=>document.addEventListener(`click`,c),0),s.querySelector(`.context-github-btn`).addEventListener(`click`,e=>{e.stopPropagation(),c(),window.open(X(D.host,a.owner,a.repo,a.number)+`#new_comment_field`,`_blank`)}),s.querySelector(`.context-delete-btn`).addEventListener(`click`,async e=>{e.stopPropagation(),c();try{await l(D.host,D.token,a.owner,a.repo,a.number),t.querySelector(`.note-row[data-index="${i}"]`)?.remove()}catch(e){alert(`Failed to delete note: ${e instanceof Error?e.message:e}`)}})})}),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,n=>{let r=parseInt(t.getAttribute(`data-index`),10),i=e[r];V(i,n)})})}document.getElementById(`settings-btn`).addEventListener(`click`,()=>U()),document.getElementById(`sign-out`).addEventListener(`click`,()=>{localStorage.removeItem(C),localStorage.removeItem(T),D=null,U()}),document.getElementById(`refresh`).addEventListener(`click`,()=>Ee()),document.getElementById(`logs-btn`).addEventListener(`click`,()=>{document.body.appendChild(ce())});try{if(y(`Note list: Fetching notes for all configured repos`),e=await a(D.host,D.token),y(`Note list: Loaded ${e.length} notes`),N){let t=N;N=null,e.some(e=>e.owner===t.owner&&e.repo===t.repo&&e.number===t.number)||(ae(`Note list: Search API may not have indexed newly created note yet; using cache`),e.unshift(t))}let n=Se();if(n){let t=e=>e.owner===n.owner&&e.repo===n.repo&&e.number===n.number;e.sort((e,n)=>t(e)?-1:t(n)?1:0)}if(document.getElementById(`new-note`).addEventListener(`click`,()=>{Oe(e)}),e.length===0){t.innerHTML=`<p class="empty">No notes found.</p>`;return}t.innerHTML=`
      <table>
        <thead><tr><th>Title</th><th>#</th><th></th><th>Updated</th><th></th><th>Repo</th></tr></thead>
        <tbody>
          ${e.map((e,t)=>`
            <tr class="note-row" data-index="${t}">
              <td>${Y(e.title)}<span class="attachment-count-badge" data-owner="${Q(e.owner)}" data-repo="${Q(e.repo)}" data-issue="${e.number}"></span></td>
              <td><a href="${Q(X(D.host,e.owner,e.repo,e.number))}" target="${Z(X(D.host,e.owner,e.repo,e.number))}" class="issue-link" onclick="event.stopPropagation()">${e.number}</a></td>
              <td><button class="copy-url-btn" data-index="${t}" title="Copy URL">${Ge}</button></td>
              <td>${new Date(e.updated_at).toLocaleDateString(`en-US`,{month:`numeric`,day:`numeric`,year:`2-digit`})}</td>
              <td><button class="context-menu-btn" data-index="${t}" title="More actions">&#x2026;</button></td>
              <td><span title="${Q(e.owner)}/${Q(e.repo)}">${Y(e.repo)}</span></td>
            </tr>
          `).join(``)}
        </tbody>
      </table>
    `,t.querySelectorAll(`.copy-url-btn`).forEach(t=>{t.addEventListener(`click`,n=>{n.stopPropagation();let r=parseInt(t.dataset.index,10),i=e[r];Qe(t,Ze(i.owner,i.repo,i.number),X(D.host,i.owner,i.repo,i.number))})}),t.querySelectorAll(`.context-menu-btn`).forEach(n=>{n.addEventListener(`click`,r=>{r.stopPropagation(),document.querySelector(`.note-context-menu`)?.remove();let i=parseInt(n.dataset.index,10),a=e[i],o=n.getBoundingClientRect(),s=document.createElement(`div`);s.className=`note-context-menu`,s.innerHTML=`
          <button class="context-github-btn">${Ye} Edit on GitHub</button>
          <button class="context-delete-btn">${Je} Delete</button>
        `,s.style.top=`${o.bottom+4}px`,s.style.left=`${o.right}px`,document.body.appendChild(s);let c=()=>{s.remove(),document.removeEventListener(`click`,c)};setTimeout(()=>document.addEventListener(`click`,c),0),s.querySelector(`.context-github-btn`).addEventListener(`click`,e=>{e.stopPropagation(),c(),window.open(X(D.host,a.owner,a.repo,a.number)+`#new_comment_field`,`_blank`)}),s.querySelector(`.context-delete-btn`).addEventListener(`click`,async e=>{e.stopPropagation(),c();try{await l(D.host,D.token,a.owner,a.repo,a.number),t.querySelector(`.note-row[data-index="${i}"]`)?.remove()}catch(e){alert(`Failed to delete note: ${e instanceof Error?e.message:e}`)}})})}),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,n=>{let r=parseInt(t.getAttribute(`data-index`),10),i=e[r];V(i,n)})}),r(),De(e).catch(()=>{})}catch(e){let t=e instanceof Error?e.message:String(e);v(`Note list: Failed to load notes: ${t}`),document.getElementById(`notes-container`).innerHTML=`<p class="error">Failed to load notes: ${t}</p>`}}async function De(e){if(!D)return;let t=E();if(!t)return;let n=await f(D.host,D.token,t.owner,t.repo);document.querySelectorAll(`.attachment-count-badge`).forEach(e=>{let t=`${e.dataset.owner}/${e.dataset.repo}/${e.dataset.issue}`,r=n.get(t);r&&(e.textContent=` 📎${r}`)})}function Oe(e){document.getElementById(`repo-picker-overlay`)?.remove();let t=new Map,n=xe();if(n){let[e,r]=n.split(`/`);t.set(n,{owner:e,repo:r})}for(let n of e){let e=`${n.owner}/${n.repo}`;t.has(e)||t.set(e,{owner:n.owner,repo:n.repo})}let r=Array.from(t.entries()).sort((e,t)=>{if(n){if(e[0]===n)return-1;if(t[0]===n)return 1}return e[0].localeCompare(t[0])}),i=document.createElement(`div`);i.id=`repo-picker-overlay`,i.innerHTML=`
    <div class="repo-picker">
      <h2>Select repository</h2>
      <div class="repo-list">
        ${r.map(([e,t])=>`
          <button class="repo-option" data-owner="${Q(t.owner)}" data-repo="${Q(t.repo)}">${Y(e)}</button>
        `).join(``)}
      </div>
      <div class="repo-other">
        <label>Other
          <input type="text" id="repo-other-input" placeholder="owner/repo" />
        </label>
        <button id="repo-other-go">Go</button>
      </div>
    </div>
  `,H.appendChild(i),i.addEventListener(`click`,e=>{e.target===i&&i.remove()});let a=e=>{e.key===`Escape`&&(i.remove(),document.removeEventListener(`keydown`,a))};document.addEventListener(`keydown`,a),i.querySelectorAll(`.repo-option`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.owner,n=e.dataset.repo;i.remove(),document.removeEventListener(`keydown`,a),G(t,n)})});let o=document.getElementById(`repo-other-go`),s=document.getElementById(`repo-other-input`),c=()=>{let e=s.value.trim().split(`/`);if(e.length!==2||!e[0]||!e[1]){s.classList.add(`error`);return}i.remove(),document.removeEventListener(`keydown`,a),G(e[0],e[1])};o.addEventListener(`click`,c),s.addEventListener(`keydown`,e=>{e.key===`Enter`&&c()})}async function G(e,t){if(he){window.open(`https://${D.host}/${e}/${t}/issues/new`,`_blank`);return}if(D){if(!await i(D.host,D.token,e,t)){v(`Auth: Repo validation failed for ${e}/${t}`),alert(`Repository "${e}/${t}" not found. Check the owner and repo name.`);return}k={owner:e,repo:t},O=null,R=`edit`,z=null,S({screen:`new`,owner:e,repo:t}),A=be,j=ye,M=null,Ae(ye,be)}}async function ke(e,t,n){if(D){R=`edit`,z=`${e}/${t}/${n}`,S({screen:`edit`,owner:e,repo:t,number:n}),H.innerHTML=`<div class="editor-screen"><p>Loading note #${n}...</p></div>`;try{y(`Note: Opening note #${n} from ${e}/${t}`);let r=await o(D.host,D.token,e,t,n);y(`Note: Loaded note #${n}: "${r.title}"`),O={...r,owner:e,repo:t},A=r.body??``,j=r.title,M=r.updated_at,Ae(r.title,A)}catch(e){let t=e instanceof Error?e.message:String(e);v(`Note: Failed to load note #${n}: ${t}`),H.innerHTML=`<div class="editor-screen"><p class="error">Failed to load note: ${t}</p></div>`}}}function Ae(e,t){W?.(),W=null,H.innerHTML=`
    <div class="editor-screen">
      <header>
        <button id="back-to-list" title="Back to notes">&larr;</button>
        <div id="note-title-container"></div>
        <span id="note-number">${O?`<a href="${Q(X(D.host,O.owner,O.repo,O.number))}" target="${Z(X(D.host,O.owner,O.repo,O.number))}" class="issue-link">#${O.number}</a>`:`Title`}</span>
        ${O?`<button id="copy-note-url" class="copy-url-btn" title="Copy URL">${Ge}</button>`:``}
        ${O?`<button id="attachment-toggle-btn" class="attachment-toggle-btn" title="Attachments (ga)">${Ke}</button>`:``}
        ${O?`<button id="delete-note-btn" class="delete-note-btn" title="Delete note">${Je}</button>`:``}
        <span id="status-msg"></span>
      </header>
      <div id="editor-container"></div>
    </div>
  `,document.getElementById(`back-to-list`).addEventListener(`click`,()=>{w.requestQuit()});let n=document.getElementById(`copy-note-url`);if(n&&O){let e=O;n.addEventListener(`click`,()=>{Qe(n,Ze(e.owner,e.repo,e.number),X(D.host,e.owner,e.repo,e.number))})}if(document.getElementById(`attachment-toggle-btn`)?.addEventListener(`click`,()=>Pe()),document.getElementById(`delete-note-btn`)?.addEventListener(`click`,()=>Me()),P=w.createVimInput(document.getElementById(`note-title-container`),{value:e,onEnter:()=>w.focusEditor(),onEscape:()=>w.focusEditor(),storagePrefix:`notehub`}),w.createEditor(document.getElementById(`editor-container`),t,{onSave:je,onQuit:()=>x({screen:`list`}),isAppDirty:()=>P.getValue().trim()!==j},{storagePrefix:`notehub`,normalMappings:{gt:()=>P.focus(),ga:()=>Pe()}}),O){let e=O,t=E();t&&p(D.host,D.token,t.owner,t.repo,e.owner,e.repo,e.number).then(e=>{e.length>0&&document.querySelector(`.editor-screen`)&&Fe()}).catch(()=>{})}}async function je(){if(!D)return;let e=w.getEditorContent(),t=(P?.getValue()??``).trim();if(!O&&k){if(!t){J(`Title required`,!0);return}try{J(`Creating...`),y(`Note: Creating new note in ${k.owner}/${k.repo}`);let n=await c(D.host,D.token,k.owner,k.repo,t,e);y(`Note: Created new note: #${n.number}`),O={...n,owner:k.owner,repo:k.repo},N=O,k=null,A=n.body??``,j=n.title,M=n.updated_at,z=`${O.owner}/${O.repo}/${O.number}`,S({screen:`edit`,owner:O.owner,repo:O.repo,number:O.number});let r=document.getElementById(`note-number`);r&&(r.innerHTML=`<a href="${Q(X(D.host,O.owner,O.repo,O.number))}" target="${Z(X(D.host,O.owner,O.repo,O.number))}" class="issue-link">#${O.number}</a>`),J(`Created`)}catch(e){let t=e instanceof Error?e.message:String(e);v(`Note: Failed to create note: ${t}`),J(`Create failed: ${t}`,!0)}return}if(!O)return;let n={};if(e!==A&&(n.body=e),t!==j&&(n.title=t),Object.keys(n).length===0){J(`No changes`);return}try{J(`Saving...`),y(`Note: Save initiated for #${O.number}`);let e=await o(D.host,D.token,O.owner,O.repo,O.number);if(M&&e.updated_at!==M&&(ae(`Note: Remote conflict detected for #${O.number}; user chose to overwrite`),!await Ne())){y(`Note: Save cancelled due to conflict`),J(`Save cancelled`);return}let t=await s(D.host,D.token,O.owner,O.repo,O.number,n);y(`Note: Save successful for #${O.number}: "${t.title}"`),A=t.body??``,j=t.title,M=t.updated_at,O={...t,owner:O.owner,repo:O.repo},J(`Saved`)}catch(e){let t=e instanceof Error?e.message:String(e);v(`Note: Save failed for #${O.number}: ${t}`),J(`Save failed: ${t}`,!0)}}async function Me(){if(!(!D||!O)&&confirm(`Delete note "#${O.number}: ${j}"?`))try{if(J(`Deleting...`),(await l(D.host,D.token,O.owner,O.repo,O.number)).state!==`closed`){let e=`Delete failed: note was not closed`;J(e,!0),v(e);return}y(`Deleted note #${O.number}: ${j}`),J(`Deleted`),setTimeout(()=>{x({screen:`list`})},500)}catch(e){let t=`Delete failed: ${e instanceof Error?e.message:e}`;J(t,!0),v(t)}}function Ne(){return new Promise(e=>{let t=document.createElement(`div`);t.id=`conflict-overlay`,t.innerHTML=`
      <div class="conflict-dialog">
        <h3>Note changed</h3>
        <p>This note has been modified since you opened it. Saving will overwrite those changes.</p>
        <div class="conflict-actions">
          <button id="conflict-cancel">Cancel</button>
          <button id="conflict-overwrite" class="danger">Overwrite</button>
        </div>
      </div>
    `,document.body.appendChild(t);let n=n=>{t.remove(),document.removeEventListener(`keydown`,r),e(n)};function r(e){e.key===`Escape`&&n(!1)}t.querySelector(`#conflict-cancel`).addEventListener(`click`,()=>n(!1)),t.querySelector(`#conflict-overwrite`).addEventListener(`click`,()=>n(!0)),t.addEventListener(`click`,e=>{e.target===t&&n(!1)}),document.addEventListener(`keydown`,r)})}function Pe(){document.getElementById(`attachment-panel`)?K():Fe()}function K(){document.getElementById(`attachment-panel`)?.remove(),F=[],I=0,L.clear(),w?.focusEditor()}async function Fe(){if(!O||!D)return;let e=document.querySelector(`.editor-screen`);if(!e)return;let t=E(),n=t&&D&&O?`https://${D.host}/${t.owner}/${t.repo}/tree/main/${O.owner}/${O.repo}/${O.number}`:``,r=document.createElement(`div`);r.id=`attachment-panel`,r.className=`attachment-panel`,r.tabIndex=0,r.innerHTML=`
    <div class="attachment-panel-header">
      <span class="attachment-panel-title">
        ${Ke} Attachments
        ${n?`<a href="${n}" target="_blank" class="attachment-repo-link" title="Open attachments folder on GitHub">\u2197</a>`:``}
      </span>
      <button id="attachment-close-btn" class="attachment-close-btn" title="Close (Esc)">\u2715</button>
    </div>
    <div id="attachment-list" class="attachment-list"><p class="attachment-loading">Loading...</p></div>
    <div class="attachment-panel-footer">
      <span class="footer-action" data-action="navigate"><kbd>j</kbd><kbd>k</kbd> Nav</span>
      <span class="footer-action" data-action="select"><kbd>Space</kbd> Select</span>
      <span class="footer-action" data-action="upload"><kbd>a</kbd> Upload</span>
      <span class="footer-action" data-action="download"><kbd>Enter</kbd> Download</span>
      <span class="footer-action" data-action="preview"><kbd>p</kbd> Preview</span>
      <span class="footer-action" data-action="delete"><kbd>x</kbd> Delete</span>
      <span class="footer-action" data-action="close"><kbd>Esc</kbd> Close</span>
    </div>
  `,e.appendChild(r),r.focus(),document.getElementById(`attachment-close-btn`).addEventListener(`click`,e=>{e.stopPropagation(),K()}),r.querySelectorAll(`.footer-action[data-action]`).forEach(e=>{let t=e.dataset.action;t!==`navigate`&&(e.style.cursor=`pointer`,e.addEventListener(`click`,async e=>{e.stopPropagation(),t===`select`?He():t===`upload`?await Re():t===`download`?await Be():t===`preview`?await Ve():t===`delete`?await Ue():t===`close`&&K(),r.focus()}))}),r.addEventListener(`keydown`,async e=>{e.key===`Escape`?(e.preventDefault(),K()):e.key===`j`||e.key===`ArrowDown`?(e.preventDefault(),Le(1)):e.key===`k`||e.key===`ArrowUp`?(e.preventDefault(),Le(-1)):e.key===`a`?(e.preventDefault(),await Re()):e.key===`Enter`||e.key===`d`?(e.preventDefault(),await Be()):e.key===`p`?(e.preventDefault(),await Ve()):e.key===` `?(e.preventDefault(),He()):e.key===`x`&&(e.preventDefault(),await Ue())}),await Ie()}async function Ie(){if(!O||!D)return;let e=document.getElementById(`attachment-list`);if(!e)return;let t=await we();if(!t){e.innerHTML=`<p class="attachment-error">Attachments repo not available.</p>`;return}try{F=await p(D.host,D.token,t.owner,t.repo,O.owner,O.repo,O.number)}catch(t){e.innerHTML=`<p class="attachment-error">Failed to load: ${t instanceof Error?t.message:t}</p>`;return}I=0,q(e)}function q(e){if(F.length===0){e.innerHTML=`<p class="attachment-empty">No attachments yet. Press <kbd>a</kbd> to upload.</p>`;return}e.innerHTML=F.map((e,t)=>{let n=t===I,r=L.has(t);return`
    <div class="${[`attachment-row`,n?`selected`:``,r?`multi-selected`:``].filter(Boolean).join(` `)}" data-index="${t}">
      <span class="attachment-checkbox">${r?`☑`:`☐`}</span>
      <span class="attachment-name" title="Click to preview, Ctrl+click to download">${Y(e.name)}</span>
      <span class="attachment-size">${We(e.size)}</span>
    </div>`}).join(``);let t=!1,n=document.getElementById(`attachment-panel`);e.addEventListener(`mousedown`,()=>{t=n===document.activeElement}),e.querySelectorAll(`.attachment-row`).forEach(r=>{let i=parseInt(r.dataset.index,10);r.querySelector(`.attachment-checkbox`)?.addEventListener(`click`,r=>{if(r.stopPropagation(),!t){n?.focus();return}I=i,L.has(i)?L.delete(i):L.add(i),q(e),n?.focus()}),r.querySelector(`.attachment-name`)?.addEventListener(`click`,async r=>{if(r.stopPropagation(),!t){n?.focus();return}I=i,q(e),r.ctrlKey||r.metaKey?await ze(i):await Ve(),n?.focus()}),r.addEventListener(`click`,()=>{if(!t){n?.focus();return}I=i,q(e),n?.focus()})}),e.querySelector(`.attachment-row.selected`)?.scrollIntoView({block:`nearest`})}function Le(e){if(F.length===0)return;I=Math.max(0,Math.min(F.length-1,I+e));let t=document.getElementById(`attachment-list`);t&&q(t)}async function Re(){if(!O||!D)return;let e=await we();if(!e)return;let t=document.createElement(`input`);t.type=`file`,t.multiple=!0,t.onchange=async()=>{let n=Array.from(t.files||[]);if(n.length===0)return;let r={};try{let t=await p(D.host,D.token,e.owner,e.repo,O.owner,O.repo,O.number);r=Object.fromEntries(t.map(e=>[e.name,e.sha]))}catch{}let i=[],a=[];for(let t of n)try{J(`Uploading ${i.length+1}/${n.length}...`),y(`Attachment: Uploading ${t.name}`);let a=await t.arrayBuffer(),o=new Uint8Array(a),s=8192,c=``;for(let e=0;e<o.length;e+=s)c+=String.fromCharCode(...o.subarray(e,e+s));let l=btoa(c),u=await m(D.host,D.token,e.owner,e.repo,O.owner,O.repo,O.number,t.name,l,r[t.name]);y(`Attachment: Uploaded ${t.name} (${t.size} bytes)`);let f=d(D.host,e.owner,e.repo,`${O.owner}/${O.repo}/${O.number}/${t.name}`);i.push(`[${t.name}](${f})`);let p=F.findIndex(e=>e.name===t.name);p>=0?F[p]=u:F.push(u)}catch(e){let n=e instanceof Error?e.message:String(e);v(`Attachment: Upload failed for ${t.name}: ${n}`),a.push(t.name)}let o=document.getElementById(`attachment-list`);if(o&&q(o),i.length>0){let e=!1;try{await navigator.clipboard.writeText(i.join(`
`)),e=!0}catch(e){v(`Attachment: clipboard write failed: ${e instanceof Error?e.message:String(e)}`)}let t=i.length===1?e?`Uploaded — link copied`:`Uploaded — copy to clipboard failed`:e?`Uploaded ${i.length} files — links copied`:`Uploaded ${i.length} files — copy to clipboard failed`;J(a.length>0?`${t} (${a.length} failed)`:t,!e)}else J(`Upload failed: ${a.join(`, `)}`,!0);document.getElementById(`attachment-panel`)?.focus()},t.click()}async function ze(e){let t=F[e];if(!t||!O||!D)return;let n=E();if(n)try{J(`Downloading...`);let{blob:e,filename:r}=await h(D.host,D.token,n.owner,n.repo,t.path),i=URL.createObjectURL(e),a=document.createElement(`a`);a.href=i,a.download=r,a.click(),setTimeout(()=>URL.revokeObjectURL(i),100),J(``)}catch(e){J(`Download failed: ${e instanceof Error?e.message:e}`,!0)}}async function Be(){await ze(I)}async function Ve(){let e=F[I];if(!e||!O||!D)return;let t=E();if(t)try{J(`Loading preview...`);let{blob:n}=await h(D.host,D.token,t.owner,t.repo,e.path),r=e.name.split(`.`).pop()?.toLowerCase()??``,i={jpg:`image/jpeg`,jpeg:`image/jpeg`,png:`image/png`,gif:`image/gif`,webp:`image/webp`,svg:`image/svg+xml`,bmp:`image/bmp`,pdf:`application/pdf`,txt:`text/plain`,md:`text/plain`,json:`application/json`,csv:`text/csv`,html:`text/html`},a=i[r]?new Blob([n],{type:i[r]}):n,o=URL.createObjectURL(a);window.open(o,`_blank`),setTimeout(()=>URL.revokeObjectURL(o),6e4),J(``)}catch(e){J(`Preview failed: ${e instanceof Error?e.message:e}`,!0)}}function He(){if(F.length===0)return;L.has(I)?L.delete(I):L.add(I);let e=document.getElementById(`attachment-list`);e&&q(e)}async function Ue(){if(!O||!D)return;let e=E();if(!e)return;let t=L.size>0?[...L].sort((e,t)=>t-e):[I],n=t.map(e=>F[e]?.name).filter(Boolean);if(n.length===0)return;let r=n.length===1?`Delete "${n[0]}"?`:`Delete ${n.length} attachments?\n${n.join(`
`)}`;if(!confirm(r)){document.getElementById(`attachment-panel`)?.focus();return}try{J(`Deleting ${n.length===1?``:n.length+` `}...`);for(let n of t){let t=F[n];t&&(y(`Attachment: Deleting ${t.name} from note #${O?.number}`),await g(D.host,D.token,e.owner,e.repo,t.path,t.sha),y(`Attachment: Deleted ${t.name}`))}J(n.length===1?`Deleted`:`Deleted ${n.length} attachments`);for(let e of t)F.splice(e,1);L.clear(),I=Math.min(I,Math.max(0,F.length-1));let r=document.getElementById(`attachment-list`);r&&q(r),document.getElementById(`attachment-panel`)?.focus()}catch(e){let t=e instanceof Error?e.message:String(e);v(`Attachment: Delete failed for ${n.join(`, `)}: ${t}`),J(`Delete failed: ${e instanceof Error?e.message:e}`,!0),document.getElementById(`attachment-panel`)?.focus()}}function We(e){return e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(1)} MB`}function J(e,t=!1){let n=document.getElementById(`status-msg`);n&&(n.textContent=e,n.className=t?`error`:`success`,t||setTimeout(()=>{n.textContent===e&&(n.textContent=``)},2e3))}function Y(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}var Ge=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,Ke=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,qe=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,Je=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,Ye=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;function Xe(e){if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(e);let t=document.createElement(`textarea`);return t.value=e,t.style.position=`fixed`,t.style.opacity=`0`,document.body.appendChild(t),t.select(),document.execCommand(`copy`),t.remove(),Promise.resolve()}function X(e,t,n,r){return`https://${e}/${t}/${n}/issues/${r}`}function Ze(e,t,n){return`${location.origin}${location.pathname}${b({screen:`edit`,owner:e,repo:t,number:n})}`}function Qe(e,t,n){document.querySelector(`.copy-url-menu`)?.remove();let r=e.getBoundingClientRect(),i=document.createElement(`div`);i.className=`note-context-menu copy-url-menu`,i.innerHTML=`
    <button class="copy-menu-btn" data-url="${Q(t)}">Notehub URL</button>
    <button class="copy-menu-btn" data-url="${Q(n)}">GitHub URL</button>
  `,i.style.top=`${r.bottom+4}px`,i.style.left=`${r.right}px`,document.body.appendChild(i);let a=()=>{i.remove(),document.removeEventListener(`click`,a)};setTimeout(()=>document.addEventListener(`click`,a),0),i.querySelectorAll(`.copy-menu-btn`).forEach(t=>{t.addEventListener(`click`,n=>{n.stopPropagation(),a();let r=t.dataset.url;Xe(r).then(()=>{e.innerHTML=qe,setTimeout(()=>{e.innerHTML=Ge},1500)})})})}function Z(e){return w?w.hashTarget(e):`_blank`}function Q(e){return e.replace(/&/g,`&amp;`).replace(/"/g,`&quot;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}var $e=`0.10.1`,et=`7f25c27558f6`,$=document.createElement(`span`);$.className=`version-badge`,$.id=`version-badge`,$.textContent=`v${$e}`,$.title=et,document.body.appendChild($),Te();
//# sourceMappingURL=index-Cgyll_Do.js.map