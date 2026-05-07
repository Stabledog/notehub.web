(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e){return e===`github.com`?`https://api.github.com`:`https://${e}/api/v3`}function t(e){return{Authorization:`Bearer ${e}`,Accept:`application/vnd.github+json`,"Content-Type":`application/json`}}async function n(n,r,i,a){let o;for(let s=0;s<3;s++)try{let o=await fetch(`${e(n)}${i}`,{...a,headers:{...t(r),...a?.headers}}),s=await o.text();if(!o.ok)throw Error(`GitHub API ${o.status}: ${s}`);return JSON.parse(s.replace(/\r\n/g,`
`))}catch(e){if(o=e instanceof Error?e:Error(String(e)),o.message.startsWith(`GitHub API `))throw o;s<2&&await new Promise(e=>setTimeout(e,500*(s+1)))}throw o}function r(e,t){return n(e,t,`/user`)}async function i(e,t,r,i){try{return await n(e,t,`/repos/${r}/${i}`),!0}catch{return!1}}async function a(e,t){return(await n(e,t,`/search/issues?q=is%3Aissue%20label%3Anotehub%20state%3Aopen&sort=updated&order=desc&per_page=100`)).items.map(e=>{let t=e.repository_url.split(`/`),n=t.pop(),r=t.pop();return{...e,owner:r,repo:n}})}function o(e,t,r,i,a){return n(e,t,`/repos/${r}/${i}/issues/${a}`)}function s(e,t,r,i,a,o){return n(e,t,`/repos/${r}/${i}/issues/${a}`,{method:`PATCH`,body:JSON.stringify(o)})}async function c(e,t,r,i,a,o){return await h(e,t,r,i),n(e,t,`/repos/${r}/${i}/issues`,{method:`POST`,body:JSON.stringify({title:a,body:o,labels:[`notehub`]})})}function l(e,t,r,i,a){return n(e,t,`/repos/${r}/${i}/issues/${a}`,{method:`PATCH`,body:JSON.stringify({state:`closed`})})}function u(e){let[t,n]=e.split(`/`);return{owner:t,repo:`${n}.attachments`}}async function d(e,t,r,i){let a=new Map;try{let o=await n(e,t,`/repos/${r}/${i}/git/trees/main?recursive=1`);for(let e of o.tree){if(e.type!==`blob`)continue;let t=e.path.split(`/`);if(t.length<4)continue;let n=`${t[0]}/${t[1]}/${t[2]}`;a.set(n,(a.get(n)??0)+1)}}catch{}return a}async function f(e,t,r,i,a,o,s){try{return await n(e,t,`/repos/${r}/${i}/contents/${a}/${o}/${s}`)}catch(e){if(e instanceof Error&&e.message.includes(`404`))return[];throw e}}async function ee(e,t,r,i,a,o,s,c,l,u){let d={message:`notehub: attach ${c} to ${a}/${o}#${s}`,content:l};return u&&(d.sha=u),(await n(e,t,`/repos/${r}/${i}/contents/${a}/${o}/${s}/${encodeURIComponent(c)}`,{method:`PUT`,body:JSON.stringify(d)})).content}async function p(t,n,r,i,a){let o=await fetch(`${e(t)}/repos/${r}/${i}/contents/${a}`,{headers:{Authorization:`Bearer ${n}`,Accept:`application/vnd.github.raw`}});if(!o.ok){let e=await o.text();throw Error(`GitHub API ${o.status}: ${e}`)}return{blob:await o.blob(),filename:a.split(`/`).pop()}}async function m(e,t,r,i,a,o){await n(e,t,`/repos/${r}/${i}/contents/${a}`,{method:`DELETE`,body:JSON.stringify({message:`notehub: remove ${a.split(`/`).pop()}`,sha:o})})}async function h(e,t,r,i){try{await n(e,t,`/repos/${r}/${i}/labels`,{method:`POST`,body:JSON.stringify({name:`notehub`,color:`1d76db`,description:`notehub note`})})}catch{}}var g=`_app_debug_logs`,te=1e3;function _(){try{let e=localStorage.getItem(g);return e?JSON.parse(e):[]}catch{return[]}}function ne(e){try{let t=e.slice(-te);localStorage.setItem(g,JSON.stringify(t))}catch{}}function re(e,t){let n={timestamp:new Date().toISOString(),level:e,message:t},r=_();r.push(n),ne(r),console[e===`warn`?`warn`:e===`error`?`error`:`log`](`[${e.toUpperCase()}] ${t}`)}function v(e){re(`error`,e)}function ie(e){re(`warn`,e)}function y(e){re(`info`,e)}function ae(){let e=_();return e.length===0?`(no logs)`:e.map(e=>`[${new Date(e.timestamp).toLocaleTimeString()}] ${e.level.toUpperCase()}: ${e.message}`).join(`
`)}function oe(){try{localStorage.removeItem(g)}catch{}}function se(){let e=document.createElement(`div`);e.id=`log-viewer-modal`,e.style.cssText=`
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
  `,r.addEventListener(`click`,()=>e.remove()),n.appendChild(r);let i=document.createElement(`textarea`);i.readOnly=!0,i.value=ae(),i.style.cssText=`
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
  `,o.addEventListener(`click`,()=>{oe(),i.value=`(no logs)`}),a.appendChild(o);let s=document.createElement(`button`);return s.textContent=`Refresh`,s.style.cssText=`
    padding: 6px 12px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  `,s.addEventListener(`click`,()=>{i.value=ae(),i.scrollTop=i.scrollHeight}),a.appendChild(s),t.appendChild(n),t.appendChild(i),t.appendChild(a),e.appendChild(t),e.addEventListener(`click`,t=>{t.target===e&&e.remove()}),e}function ce(e){let t=e.replace(/^#\/?/,``);if(!t)return{screen:`list`};let n=t.split(`/`);if(n[0]===`edit`&&n.length===4){let e=parseInt(n[3],10);if(e>0&&Number.isFinite(e))return{screen:`edit`,owner:n[1],repo:n[2],number:e}}return n[0]===`new`&&n.length===3?{screen:`new`,owner:n[1],repo:n[2]}:{screen:`list`}}function b(e){switch(e.screen){case`list`:return`#/`;case`edit`:return`#/edit/${e.owner}/${e.repo}/${e.number}`;case`new`:return`#/new/${e.owner}/${e.repo}`}}function le(e){location.hash=b(e)}function x(e){let t=b(e);history.replaceState(null,``,t)}function ue(e){let t=()=>e(ce(location.hash));return window.addEventListener(`hashchange`,t),()=>window.removeEventListener(`hashchange`,t)}var de=`modulepreload`,fe=function(e){return`/notehub.web/`+e},pe={},me=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=fe(t,n),t in pe)return;pe[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:de,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},S=`notehub:token`,he=`https://stabledog.github.io/veditor.web`,C,w=`notehub:host`,ge=`notehub:defaultRepo`,_e=`notehub:pinnedIssue`,ve=`🎫 New note`,ye=`# New note`;function be(){return localStorage.getItem(ge)}function xe(){let e=localStorage.getItem(_e);if(!e)return null;try{let t=JSON.parse(e);if(t.owner&&t.repo&&typeof t.number==`number`)return t}catch{}return null}function Se(){return be()!==null}function T(){let e=be();return e?u(e):null}async function Ce(){if(!E)return null;let e=T();return e?await i(E.host,E.token,e.owner,e.repo)?e:(q(`Attachments repo "${e.owner}/${e.repo}" not found. Create it on GitHub to use attachments.`,!0),null):(q(`No default repo configured — cannot use attachments.`,!0),null)}var E=null,D=null,O=null,k=``,A=``,j=null,M=null,N=null,P=[],F=0,I=new Set,we=!1,L=null,R=null;function z(e){if(!E){H();return}switch(e.screen){case`list`:if(L===`list`)return;W();break;case`edit`:{let t=`${e.owner}/${e.repo}/${e.number}`;if(L===`edit`&&R===t)return;ke(e.owner,e.repo,e.number);break}case`new`:Oe(e.owner,e.repo);break}}function B(e,t){let n={screen:`edit`,owner:e.owner,repo:e.repo,number:e.number};t.ctrlKey||t.metaKey?window.open(`${location.pathname}${b(n)}`,`_blank`):le(n)}var V=document.getElementById(`app`);async function Te(){let e=document.createElement(`link`);e.rel=`stylesheet`,e.href=`${he}/veditor.css`,document.head.appendChild(e);try{C=await me(()=>import(`${he}/veditor.js`),[]);let e=document.getElementById(`version-badge`);e&&C.VERSION&&(e.textContent+=` \u00b7 ve${C.VERSION}`)}catch(e){v(`Failed to load editor from ${he}/veditor.js: ${e instanceof Error?e.message:e}`)}let t=localStorage.getItem(S),n=localStorage.getItem(w)??`github.com`;t&&Se()?r(n,t).then(e=>{E={host:n,token:t,username:e.login},ue(z),z(ce(location.hash))}).catch(()=>H()):H(),window.addEventListener(`message`,e=>{if(e.data?.type!==`barouse:activate`)return;we=!0;let t=document.querySelector(`.note-row.selected`)??document.querySelector(`.note-row`);t&&(t.tabIndex=-1,t.focus())})}function H(e){N?.destroy(),N=null,C?.destroyEditor();let t=localStorage.getItem(w)??`github.com`,n=localStorage.getItem(S)??``,i=localStorage.getItem(ge)??``,a=xe(),o=E!==null;if(V.innerHTML=`
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
        <div class="settings-actions">
          <button type="submit">Save &amp; Continue</button>
          ${o?`<button type="button" id="settings-cancel">Cancel</button>`:``}
        </div>
      </form>
    </div>
  `,o){let e=()=>W();document.getElementById(`settings-cancel`).addEventListener(`click`,e);let t=n=>{n.key===`Escape`&&(document.removeEventListener(`keydown`,t),e())};document.addEventListener(`keydown`,t)}document.getElementById(`settings-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`settings-host`).value.trim(),n=document.getElementById(`settings-pat`).value.trim(),i=document.getElementById(`settings-repo`).value.trim(),a=document.getElementById(`settings-pinned`).value.trim(),o=i.split(`/`);if(o.length!==2||!o[0]||!o[1]){H(`Repository must be in owner/repo format.`);return}try{y(`Settings: Validating token for host=${t}`);let e=await r(t,n);if(y(`Settings: Token validated for user ${e.login} on ${t}`),localStorage.setItem(w,t),localStorage.setItem(S,n),localStorage.setItem(ge,i),E={host:t,token:n,username:e.login},a){let e=parseInt(a,10);if(isNaN(e)||e<1){H(`Pinned issue must be a positive number.`);return}localStorage.setItem(_e,JSON.stringify({owner:o[0],repo:o[1],number:e}))}else localStorage.removeItem(_e);ue(z),z(ce(location.hash))}catch(e){v(`Settings: Token validation failed for host=${t}: ${e instanceof Error?e.message:e}`),H(`Authentication failed: ${e instanceof Error?e.message:e}`)}})}var U=null;async function W(){if(N?.destroy(),N=null,C?.destroyEditor(),U?.(),U=null,D=null,L=`list`,R=null,x({screen:`list`}),!E)return;let e=[];V.innerHTML=`
    <div class="note-list-screen">
      <header>
        <h1>notehub</h1>
        <div class="header-info">
          <span>@${E.username}</span>
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
  `;let t=document.getElementById(`notes-container`),n=0;function r(){let e=t.querySelectorAll(`.note-row`);e.forEach((e,t)=>{e.classList.toggle(`selected`,t===n)}),e[n]?.scrollIntoView({block:`nearest`})}let i=i=>{if(!(i.target instanceof HTMLInputElement||i.target instanceof HTMLTextAreaElement)&&!c&&!document.getElementById(`repo-picker-overlay`))if(i.key===`n`)i.preventDefault(),document.getElementById(`new-note`).click();else if(i.key===`r`)i.preventDefault(),W();else if(i.key===`j`||i.key===`ArrowDown`){i.preventDefault();let e=t.querySelectorAll(`.note-row`);e.length>0&&(n=Math.min(n+1,e.length-1),r())}else if(i.key===`k`||i.key===`ArrowUp`)i.preventDefault(),n>0&&(n--,r());else if(i.key===`Enter`){i.preventDefault();let r=t.querySelectorAll(`.note-row`);if(r.length>0){let t=parseInt(r[n].getAttribute(`data-index`),10),a=e[t];B(a,i)}}else i.key===`Escape`&&s?(i.preventDefault(),m()):i.key===`/`&&(i.preventDefault(),ee())};document.addEventListener(`keydown`,i),U=()=>document.removeEventListener(`keydown`,i);let o=null,s=!1,c=!1,u=!1,d=null,f=``;function ee(){if(s)return;s=!0,c=!0,f=t.innerHTML;let e=document.createElement(`div`);e.className=`search-bar`,e.id=`search-bar`,e.innerHTML=`
      <span class="search-slash">/</span>
      <div id="search-input-container"></div>
      <button id="search-regex-toggle" class="search-regex-toggle" title="Toggle regex (Ctrl+R)">.*</button>
      <span id="search-count" class="search-count"></span>
    `,t.parentElement.insertBefore(e,t),e.addEventListener(`focusin`,()=>{c=!0}),e.addEventListener(`focusout`,()=>{c=!1}),o=C.createVimInput(document.getElementById(`search-input-container`),{placeholder:`Search notes...`,initialInsert:!0,onEscape:m,onChange:e=>{d&&clearTimeout(d),d=setTimeout(()=>h(e),150)},onEnter:()=>{document.activeElement?.blur()},storagePrefix:`notehub`}),o.focus(),p(),document.getElementById(`search-regex-toggle`).addEventListener(`click`,()=>{u=!u,p(),o&&h(o.getValue())}),e.addEventListener(`keydown`,e=>{e.key===`r`&&e.ctrlKey&&(e.preventDefault(),u=!u,p(),o&&h(o.getValue()))})}function p(){let e=document.getElementById(`search-regex-toggle`);e&&e.classList.toggle(`active`,u)}function m(){s&&(s=!1,c=!1,d&&=(clearTimeout(d),null),o?.destroy(),o=null,document.getElementById(`search-bar`)?.remove(),f&&(t.innerHTML=f,f=``,_()),n=0,r())}function h(i){let a=document.getElementById(`search-count`);if(!i.trim()){f&&(t.innerHTML=f,_()),a&&(a.textContent=``),n=0,r();return}let o=g(i,u,e);a&&(a.textContent=`${o.length} match${o.length===1?``:`es`}`),te(o)}function g(e,t,n){let r;if(t){let t;try{t=new RegExp(e,`gi`)}catch{let e=document.getElementById(`search-count`);return e&&(e.textContent=`invalid regex`,e.classList.add(`error`)),[]}let n=document.getElementById(`search-count`);n&&n.classList.remove(`error`),r=e=>{t.lastIndex=0;let n=t.exec(e);return n?{index:n.index,length:n[0].length}:null}}else{let t=e.toLowerCase();r=e=>{let n=e.toLowerCase().indexOf(t);return n>=0?{index:n,length:t.length}:null}}let i=[];for(let e=0;e<n.length;e++){let t=n[e],a=t.body??``,o=r(t.title),s=r(a);if(!o&&!s)continue;let c=s??o,l=s?a:t.title,u=Math.max(0,c.index-40),d=Math.min(l.length,c.index+c.length+40),f=J(l.slice(u,c.index)),ee=J(l.slice(c.index,c.index+c.length)),p=J(l.slice(c.index+c.length,d)),m=`${u>0?`...`:``}${f}<mark>${ee}</mark>${p}${d<l.length?`...`:``}`;i.push({note:t,index:e,context:m})}return i}function te(i){if(i.length===0){t.innerHTML=`<p class="empty">No matches found.</p>`;return}t.innerHTML=`
      <table>
        <thead><tr><th>Title</th><th>#</th><th></th><th>Context</th><th>Updated</th><th>Repo</th></tr></thead>
        <tbody>
          ${i.map((e,t)=>`
            <tr class="note-row" data-index="${e.index}" data-result-index="${t}">
              <td>${J(e.note.title)}</td>
              <td>${e.note.number}</td>
              <td></td>
              <td class="search-context">${e.context}</td>
              <td>${new Date(e.note.updated_at).toLocaleDateString(`en-US`,{month:`numeric`,day:`numeric`,year:`2-digit`})}</td>
              <td><span title="${Q(e.note.owner)}/${Q(e.note.repo)}">${J(e.note.repo)}</span></td>
            </tr>
          `).join(``)}
        </tbody>
      </table>
    `,n=0,r(),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,n=>{let r=parseInt(t.getAttribute(`data-index`),10),i=e[r];B(i,n)})})}function _(){t.querySelectorAll(`.copy-url-btn`).forEach(t=>{t.addEventListener(`click`,n=>{n.stopPropagation();let r=parseInt(t.dataset.index,10),i=e[r];Qe(t,Ze(i.owner,i.repo,i.number),X(E.host,i.owner,i.repo,i.number))})}),t.querySelectorAll(`.context-menu-btn`).forEach(n=>{n.addEventListener(`click`,r=>{r.stopPropagation(),document.querySelector(`.note-context-menu`)?.remove();let i=parseInt(n.dataset.index,10),a=e[i],o=n.getBoundingClientRect(),s=document.createElement(`div`);s.className=`note-context-menu`,s.innerHTML=`
          <button class="context-github-btn">${Ye} Edit on GitHub</button>
          <button class="context-delete-btn">${Je} Delete</button>
        `,s.style.top=`${o.bottom+4}px`,s.style.left=`${o.right}px`,document.body.appendChild(s);let c=()=>{s.remove(),document.removeEventListener(`click`,c)};setTimeout(()=>document.addEventListener(`click`,c),0),s.querySelector(`.context-github-btn`).addEventListener(`click`,e=>{e.stopPropagation(),c(),window.open(X(E.host,a.owner,a.repo,a.number)+`#new_comment_field`,`_blank`)}),s.querySelector(`.context-delete-btn`).addEventListener(`click`,async e=>{e.stopPropagation(),c();try{await l(E.host,E.token,a.owner,a.repo,a.number),t.querySelector(`.note-row[data-index="${i}"]`)?.remove()}catch(e){alert(`Failed to delete note: ${e instanceof Error?e.message:e}`)}})})}),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,n=>{let r=parseInt(t.getAttribute(`data-index`),10),i=e[r];B(i,n)})})}document.getElementById(`settings-btn`).addEventListener(`click`,()=>H()),document.getElementById(`sign-out`).addEventListener(`click`,()=>{localStorage.removeItem(S),localStorage.removeItem(w),E=null,H()}),document.getElementById(`refresh`).addEventListener(`click`,()=>W()),document.getElementById(`logs-btn`).addEventListener(`click`,()=>{document.body.appendChild(se())});try{if(y(`Note list: Fetching notes for all configured repos`),e=await a(E.host,E.token),y(`Note list: Loaded ${e.length} notes`),M){let t=M;M=null,e.some(e=>e.owner===t.owner&&e.repo===t.repo&&e.number===t.number)||(ie(`Note list: Search API may not have indexed newly created note yet; using cache`),e.unshift(t))}let n=xe();if(n){let t=e=>e.owner===n.owner&&e.repo===n.repo&&e.number===n.number;e.sort((e,n)=>t(e)?-1:+!!t(n))}if(document.getElementById(`new-note`).addEventListener(`click`,()=>{De(e)}),e.length===0){t.innerHTML=`<p class="empty">No notes found.</p>`;return}t.innerHTML=`
      <table>
        <thead><tr><th>Title</th><th>#</th><th></th><th>Updated</th><th></th><th>Repo</th></tr></thead>
        <tbody>
          ${e.map((e,t)=>`
            <tr class="note-row" data-index="${t}">
              <td>${J(e.title)}<span class="attachment-count-badge" data-owner="${Q(e.owner)}" data-repo="${Q(e.repo)}" data-issue="${e.number}"></span></td>
              <td><a href="${Q(X(E.host,e.owner,e.repo,e.number))}" target="${Z(X(E.host,e.owner,e.repo,e.number))}" class="issue-link" onclick="event.stopPropagation()">${e.number}</a></td>
              <td><button class="copy-url-btn" data-index="${t}" title="Copy URL">${Y}</button></td>
              <td>${new Date(e.updated_at).toLocaleDateString(`en-US`,{month:`numeric`,day:`numeric`,year:`2-digit`})}</td>
              <td><button class="context-menu-btn" data-index="${t}" title="More actions">&#x2026;</button></td>
              <td><span title="${Q(e.owner)}/${Q(e.repo)}">${J(e.repo)}</span></td>
            </tr>
          `).join(``)}
        </tbody>
      </table>
    `,t.querySelectorAll(`.copy-url-btn`).forEach(t=>{t.addEventListener(`click`,n=>{n.stopPropagation();let r=parseInt(t.dataset.index,10),i=e[r];Qe(t,Ze(i.owner,i.repo,i.number),X(E.host,i.owner,i.repo,i.number))})}),t.querySelectorAll(`.context-menu-btn`).forEach(n=>{n.addEventListener(`click`,r=>{r.stopPropagation(),document.querySelector(`.note-context-menu`)?.remove();let i=parseInt(n.dataset.index,10),a=e[i],o=n.getBoundingClientRect(),s=document.createElement(`div`);s.className=`note-context-menu`,s.innerHTML=`
          <button class="context-github-btn">${Ye} Edit on GitHub</button>
          <button class="context-delete-btn">${Je} Delete</button>
        `,s.style.top=`${o.bottom+4}px`,s.style.left=`${o.right}px`,document.body.appendChild(s);let c=()=>{s.remove(),document.removeEventListener(`click`,c)};setTimeout(()=>document.addEventListener(`click`,c),0),s.querySelector(`.context-github-btn`).addEventListener(`click`,e=>{e.stopPropagation(),c(),window.open(X(E.host,a.owner,a.repo,a.number)+`#new_comment_field`,`_blank`)}),s.querySelector(`.context-delete-btn`).addEventListener(`click`,async e=>{e.stopPropagation(),c();try{await l(E.host,E.token,a.owner,a.repo,a.number),t.querySelector(`.note-row[data-index="${i}"]`)?.remove()}catch(e){alert(`Failed to delete note: ${e instanceof Error?e.message:e}`)}})})}),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,n=>{let r=parseInt(t.getAttribute(`data-index`),10),i=e[r];B(i,n)})}),r();let i=t.querySelector(`.note-row.selected`);i&&(i.tabIndex=-1,i.focus()),Ee(e).catch(()=>{})}catch(e){let t=e instanceof Error?e.message:String(e);v(`Note list: Failed to load notes: ${t}`),document.getElementById(`notes-container`).innerHTML=`<p class="error">Failed to load notes: ${t}</p>`}}async function Ee(e){if(!E)return;let t=T();if(!t)return;let n=await d(E.host,E.token,t.owner,t.repo);document.querySelectorAll(`.attachment-count-badge`).forEach(e=>{let t=`${e.dataset.owner}/${e.dataset.repo}/${e.dataset.issue}`,r=n.get(t);r&&(e.textContent=` 📎${r}`)})}function De(e){document.getElementById(`repo-picker-overlay`)?.remove();let t=new Map,n=be();if(n){let[e,r]=n.split(`/`);t.set(n,{owner:e,repo:r})}for(let n of e){let e=`${n.owner}/${n.repo}`;t.has(e)||t.set(e,{owner:n.owner,repo:n.repo})}let r=Array.from(t.entries()).sort((e,t)=>{if(n){if(e[0]===n)return-1;if(t[0]===n)return 1}return e[0].localeCompare(t[0])}),i=document.createElement(`div`);i.id=`repo-picker-overlay`,i.innerHTML=`
    <div class="repo-picker">
      <h2>Select repository</h2>
      <div class="repo-list">
        ${r.map(([e,t])=>`
          <button class="repo-option" data-owner="${Q(t.owner)}" data-repo="${Q(t.repo)}">${J(e)}</button>
        `).join(``)}
      </div>
      <div class="repo-other">
        <label>Other
          <input type="text" id="repo-other-input" placeholder="owner/repo" />
        </label>
        <button id="repo-other-go">Go</button>
      </div>
    </div>
  `,V.appendChild(i),i.addEventListener(`click`,e=>{e.target===i&&i.remove()});let a=e=>{e.key===`Escape`&&(i.remove(),document.removeEventListener(`keydown`,a))};document.addEventListener(`keydown`,a),i.querySelectorAll(`.repo-option`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.owner,n=e.dataset.repo;i.remove(),document.removeEventListener(`keydown`,a),Oe(t,n)})});let o=document.getElementById(`repo-other-go`),s=document.getElementById(`repo-other-input`),c=()=>{let e=s.value.trim().split(`/`);if(e.length!==2||!e[0]||!e[1]){s.classList.add(`error`);return}i.remove(),document.removeEventListener(`keydown`,a),Oe(e[0],e[1])};o.addEventListener(`click`,c),s.addEventListener(`keydown`,e=>{e.key===`Enter`&&c()})}async function Oe(e,t){if(E){if(!await i(E.host,E.token,e,t)){v(`Auth: Repo validation failed for ${e}/${t}`),alert(`Repository "${e}/${t}" not found. Check the owner and repo name.`);return}O={owner:e,repo:t},D=null,L=`edit`,R=null,x({screen:`new`,owner:e,repo:t}),k=ye,A=ve,j=null,Ae(ve,ye)}}async function ke(e,t,n){if(E){L=`edit`,R=`${e}/${t}/${n}`,x({screen:`edit`,owner:e,repo:t,number:n}),V.innerHTML=`<div class="editor-screen"><p>Loading note #${n}...</p></div>`;try{y(`Note: Opening note #${n} from ${e}/${t}`);let r=await o(E.host,E.token,e,t,n);y(`Note: Loaded note #${n}: "${r.title}"`),D={...r,owner:e,repo:t},k=r.body??``,A=r.title,j=r.updated_at,Ae(r.title,k)}catch(e){let t=e instanceof Error?e.message:String(e);v(`Note: Failed to load note #${n}: ${t}`),V.innerHTML=`<div class="editor-screen"><p class="error">Failed to load note: ${t}</p></div>`}}}function Ae(e,t){U?.(),U=null,V.innerHTML=`
    <div class="editor-screen">
      <header>
        <button id="back-to-list" title="Back to notes">&larr;</button>
        <div id="note-title-container"></div>
        <span id="note-number">${D?`<a href="${Q(X(E.host,D.owner,D.repo,D.number))}" target="${Z(X(E.host,D.owner,D.repo,D.number))}" class="issue-link">#${D.number}</a>`:`Title`}</span>
        ${D?`<button id="copy-note-url" class="copy-url-btn" title="Copy URL">${Y}</button>`:``}
        ${D?`<button id="attachment-toggle-btn" class="attachment-toggle-btn" title="Attachments (ga)">${Ke}</button>`:``}
        ${D?`<button id="delete-note-btn" class="delete-note-btn" title="Delete note">${Je}</button>`:``}
        <span id="status-msg"></span>
      </header>
      <div id="editor-container"></div>
    </div>
  `,document.getElementById(`back-to-list`).addEventListener(`click`,()=>{C.requestQuit()});let n=document.getElementById(`copy-note-url`);if(n&&D){let e=D;n.addEventListener(`click`,()=>{Qe(n,Ze(e.owner,e.repo,e.number),X(E.host,e.owner,e.repo,e.number))})}if(document.getElementById(`attachment-toggle-btn`)?.addEventListener(`click`,()=>Pe()),document.getElementById(`delete-note-btn`)?.addEventListener(`click`,()=>Me()),N=C.createVimInput(document.getElementById(`note-title-container`),{value:e,onEnter:()=>C.focusEditor(),onEscape:()=>C.focusEditor(),storagePrefix:`notehub`}),C.createEditor(document.getElementById(`editor-container`),t,{onSave:je,onQuit:()=>le({screen:`list`}),isAppDirty:()=>N.getValue().trim()!==A},{storagePrefix:`notehub`,normalMappings:{gt:()=>N.focus(),ga:()=>Pe()}}),D){let e=D,t=T();t&&f(E.host,E.token,t.owner,t.repo,e.owner,e.repo,e.number).then(e=>{e.length>0&&document.querySelector(`.editor-screen`)&&Fe()}).catch(()=>{})}}async function je(){if(!E)return;let e=C.getEditorContent(),t=(N?.getValue()??``).trim();if(!D&&O){if(!t){q(`Title required`,!0);return}try{q(`Creating...`),y(`Note: Creating new note in ${O.owner}/${O.repo}`);let n=await c(E.host,E.token,O.owner,O.repo,t,e);y(`Note: Created new note: #${n.number}`),D={...n,owner:O.owner,repo:O.repo},M=D,O=null,k=n.body??``,A=n.title,j=n.updated_at,R=`${D.owner}/${D.repo}/${D.number}`,x({screen:`edit`,owner:D.owner,repo:D.repo,number:D.number});let r=document.getElementById(`note-number`);r&&(r.innerHTML=`<a href="${Q(X(E.host,D.owner,D.repo,D.number))}" target="${Z(X(E.host,D.owner,D.repo,D.number))}" class="issue-link">#${D.number}</a>`),q(`Created`)}catch(e){let t=e instanceof Error?e.message:String(e);v(`Note: Failed to create note: ${t}`),q(`Create failed: ${t}`,!0)}return}if(!D)return;let n={};if(e!==k&&(n.body=e),t!==A&&(n.title=t),Object.keys(n).length===0){q(`No changes`);return}try{q(`Saving...`),y(`Note: Save initiated for #${D.number}`);let e=await o(E.host,E.token,D.owner,D.repo,D.number);if(j&&e.updated_at!==j&&(ie(`Note: Remote conflict detected for #${D.number}; user chose to overwrite`),!await Ne())){y(`Note: Save cancelled due to conflict`),q(`Save cancelled`);return}let t=await s(E.host,E.token,D.owner,D.repo,D.number,n);y(`Note: Save successful for #${D.number}: "${t.title}"`),k=t.body??``,A=t.title,j=t.updated_at,D={...t,owner:D.owner,repo:D.repo},q(`Saved`)}catch(e){let t=e instanceof Error?e.message:String(e);v(`Note: Save failed for #${D.number}: ${t}`),q(`Save failed: ${t}`,!0)}}async function Me(){if(!(!E||!D)&&confirm(`Delete note "#${D.number}: ${A}"?`))try{if(q(`Deleting...`),(await l(E.host,E.token,D.owner,D.repo,D.number)).state!==`closed`){let e=`Delete failed: note was not closed`;q(e,!0),v(e);return}y(`Deleted note #${D.number}: ${A}`),q(`Deleted`),setTimeout(()=>{le({screen:`list`})},500)}catch(e){let t=`Delete failed: ${e instanceof Error?e.message:e}`;q(t,!0),v(t)}}function Ne(){return new Promise(e=>{let t=document.createElement(`div`);t.id=`conflict-overlay`,t.innerHTML=`
      <div class="conflict-dialog">
        <h3>Note changed</h3>
        <p>This note has been modified since you opened it. Saving will overwrite those changes.</p>
        <div class="conflict-actions">
          <button id="conflict-cancel">Cancel</button>
          <button id="conflict-overwrite" class="danger">Overwrite</button>
        </div>
      </div>
    `,document.body.appendChild(t);let n=n=>{t.remove(),document.removeEventListener(`keydown`,r),e(n)};function r(e){e.key===`Escape`&&n(!1)}t.querySelector(`#conflict-cancel`).addEventListener(`click`,()=>n(!1)),t.querySelector(`#conflict-overwrite`).addEventListener(`click`,()=>n(!0)),t.addEventListener(`click`,e=>{e.target===t&&n(!1)}),document.addEventListener(`keydown`,r)})}function Pe(){document.getElementById(`attachment-panel`)?G():Fe()}function G(){document.getElementById(`attachment-panel`)?.remove(),P=[],F=0,I.clear(),C?.focusEditor()}async function Fe(){if(!D||!E)return;let e=document.querySelector(`.editor-screen`);if(!e)return;let t=T(),n=t&&E&&D?`https://${E.host}/${t.owner}/${t.repo}/tree/main/${D.owner}/${D.repo}/${D.number}`:``,r=document.createElement(`div`);r.id=`attachment-panel`,r.className=`attachment-panel`,r.tabIndex=0,r.innerHTML=`
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
  `,e.appendChild(r),r.focus(),document.getElementById(`attachment-close-btn`).addEventListener(`click`,e=>{e.stopPropagation(),G()}),r.querySelectorAll(`.footer-action[data-action]`).forEach(e=>{let t=e.dataset.action;t!==`navigate`&&(e.style.cursor=`pointer`,e.addEventListener(`click`,async e=>{e.stopPropagation(),t===`select`?Ue():t===`upload`?await ze():t===`download`?await Ve():t===`preview`?await He():t===`delete`?await We():t===`close`&&G(),r.focus()}))}),r.addEventListener(`keydown`,async e=>{e.key===`Escape`?(e.preventDefault(),G()):e.key===`j`||e.key===`ArrowDown`?(e.preventDefault(),Le(1)):e.key===`k`||e.key===`ArrowUp`?(e.preventDefault(),Le(-1)):e.key===`a`?(e.preventDefault(),await ze()):e.key===`Enter`||e.key===`d`?(e.preventDefault(),await Ve()):e.key===`p`?(e.preventDefault(),await He()):e.key===` `?(e.preventDefault(),Ue()):e.key===`x`&&(e.preventDefault(),await We())}),r.addEventListener(`dragover`,e=>{e.preventDefault(),r.classList.add(`attachment-panel-dragover`)}),r.addEventListener(`dragleave`,()=>{r.classList.remove(`attachment-panel-dragover`)}),r.addEventListener(`drop`,async e=>{e.preventDefault(),r.classList.remove(`attachment-panel-dragover`);let t=Array.from(e.dataTransfer?.files||[]);t.length>0&&await Re(t)}),await Ie()}async function Ie(){if(!D||!E)return;let e=document.getElementById(`attachment-list`);if(!e)return;let t=await Ce();if(!t){e.innerHTML=`<p class="attachment-error">Attachments repo not available.</p>`;return}try{P=await f(E.host,E.token,t.owner,t.repo,D.owner,D.repo,D.number)}catch(t){e.innerHTML=`<p class="attachment-error">Failed to load: ${t instanceof Error?t.message:t}</p>`;return}F=0,K(e)}function K(e){if(P.length===0){e.innerHTML=`<p class="attachment-empty">No attachments yet. Press <kbd>a</kbd> to upload.</p>`;return}e.innerHTML=P.map((e,t)=>{let n=t===F,r=I.has(t);return`
    <div class="${[`attachment-row`,n?`selected`:``,r?`multi-selected`:``].filter(Boolean).join(` `)}" data-index="${t}">
      <span class="attachment-checkbox">${r?`☑`:`☐`}</span>
      <span class="attachment-name" title="Click to preview, Ctrl+click to download">${J(e.name)}</span>
      <span class="attachment-size">${Ge(e.size)}</span>
    </div>`}).join(``);let t=!1,n=document.getElementById(`attachment-panel`);e.addEventListener(`mousedown`,()=>{t=n===document.activeElement}),e.querySelectorAll(`.attachment-row`).forEach(r=>{let i=parseInt(r.dataset.index,10);r.querySelector(`.attachment-checkbox`)?.addEventListener(`click`,r=>{if(r.stopPropagation(),!t){n?.focus();return}F=i,I.has(i)?I.delete(i):I.add(i),K(e),n?.focus()}),r.querySelector(`.attachment-name`)?.addEventListener(`click`,async r=>{if(r.stopPropagation(),!t){n?.focus();return}F=i,K(e),r.ctrlKey||r.metaKey?await Be(i):await He(),n?.focus()}),r.addEventListener(`click`,()=>{if(!t){n?.focus();return}F=i,K(e),n?.focus()})}),e.querySelector(`.attachment-row.selected`)?.scrollIntoView({block:`nearest`})}function Le(e){if(P.length===0)return;F=Math.max(0,Math.min(P.length-1,F+e));let t=document.getElementById(`attachment-list`);t&&K(t)}async function Re(e){if(!D||!E||e.length===0)return;let t=await Ce();if(!t)return;let n={};try{let e=await f(E.host,E.token,t.owner,t.repo,D.owner,D.repo,D.number);n=Object.fromEntries(e.map(e=>[e.name,e.sha]))}catch{}let r=[],i=[];for(let a of e)try{q(`Uploading ${r.length+1}/${e.length}...`),y(`Attachment: Uploading ${a.name}`);let i=await a.arrayBuffer(),o=new Uint8Array(i),s=8192,c=``;for(let e=0;e<o.length;e+=s)c+=String.fromCharCode(...o.subarray(e,e+s));let l=btoa(c),u=await ee(E.host,E.token,t.owner,t.repo,D.owner,D.repo,D.number,a.name,l,n[a.name]);y(`Attachment: Uploaded ${a.name} (${a.size} bytes)`),r.push(`[${a.name}](${u.download_url})`);let d=P.findIndex(e=>e.name===a.name);d>=0?P[d]=u:P.push(u)}catch(e){let t=e instanceof Error?e.message:String(e);v(`Attachment: Upload failed for ${a.name}: ${t}`),i.push(a.name)}let a=document.getElementById(`attachment-list`);if(a&&K(a),r.length>0){let e=!1;try{await Xe(r.join(`
`)),e=!0}catch(e){v(`Attachment: clipboard write failed: ${e instanceof Error?e.message:String(e)}`)}let t=r.length===1?e?`Uploaded — link copied`:`Uploaded`:e?`Uploaded ${r.length} files — links copied`:`Uploaded ${r.length} files`;q(i.length>0?`${t} (${i.length} failed)`:t,i.length>0)}else q(`Upload failed: ${i.join(`, `)}`,!0);document.getElementById(`attachment-panel`)?.focus()}async function ze(){if(!D||!E)return;let e=document.createElement(`input`);e.type=`file`,e.multiple=!0,e.onchange=async()=>{await Re(Array.from(e.files||[]))},e.click()}async function Be(e){let t=P[e];if(!t||!D||!E)return;let n=T();if(n)try{q(`Downloading...`);let{blob:e,filename:r}=await p(E.host,E.token,n.owner,n.repo,t.path),i=URL.createObjectURL(e),a=document.createElement(`a`);a.href=i,a.download=r,a.click(),setTimeout(()=>URL.revokeObjectURL(i),100),q(``)}catch(e){q(`Download failed: ${e instanceof Error?e.message:e}`,!0)}}async function Ve(){await Be(F)}async function He(){let e=P[F];if(!e||!D||!E)return;let t=T();if(t)try{q(`Loading preview...`);let{blob:n}=await p(E.host,E.token,t.owner,t.repo,e.path),r=e.name.split(`.`).pop()?.toLowerCase()??``,i={jpg:`image/jpeg`,jpeg:`image/jpeg`,png:`image/png`,gif:`image/gif`,webp:`image/webp`,svg:`image/svg+xml`,bmp:`image/bmp`,pdf:`application/pdf`,txt:`text/plain`,md:`text/plain`,json:`application/json`,csv:`text/csv`,html:`text/html`},a=i[r]?new Blob([n],{type:i[r]}):n,o=URL.createObjectURL(a);window.open(o,`_blank`),setTimeout(()=>URL.revokeObjectURL(o),6e4),q(``)}catch(e){q(`Preview failed: ${e instanceof Error?e.message:e}`,!0)}}function Ue(){if(P.length===0)return;I.has(F)?I.delete(F):I.add(F);let e=document.getElementById(`attachment-list`);e&&K(e)}async function We(){if(!D||!E)return;let e=T();if(!e)return;let t=I.size>0?[...I].sort((e,t)=>t-e):[F],n=t.map(e=>P[e]?.name).filter(Boolean);if(n.length===0)return;let r=n.length===1?`Delete "${n[0]}"?`:`Delete ${n.length} attachments?\n${n.join(`
`)}`;if(!confirm(r)){document.getElementById(`attachment-panel`)?.focus();return}try{q(`Deleting ${n.length===1?``:n.length+` `}...`);for(let n of t){let t=P[n];t&&(y(`Attachment: Deleting ${t.name} from note #${D?.number}`),await m(E.host,E.token,e.owner,e.repo,t.path,t.sha),y(`Attachment: Deleted ${t.name}`))}q(n.length===1?`Deleted`:`Deleted ${n.length} attachments`);for(let e of t)P.splice(e,1);I.clear(),F=Math.min(F,Math.max(0,P.length-1));let r=document.getElementById(`attachment-list`);r&&K(r),document.getElementById(`attachment-panel`)?.focus()}catch(e){let t=e instanceof Error?e.message:String(e);v(`Attachment: Delete failed for ${n.join(`, `)}: ${t}`),q(`Delete failed: ${e instanceof Error?e.message:e}`,!0),document.getElementById(`attachment-panel`)?.focus()}}function Ge(e){return e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(1)} MB`}function q(e,t=!1){let n=document.getElementById(`status-msg`);n&&(n.textContent=e,n.className=t?`error`:`success`,t||setTimeout(()=>{n.textContent===e&&(n.textContent=``)},2e3))}function J(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}var Y=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,Ke=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,qe=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,Je=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,Ye=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;function Xe(e){if(we)return window.postMessage({type:`barouse:clipboard-write`,text:e},`*`),Promise.resolve();if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(e);let t=document.createElement(`textarea`);return t.value=e,t.style.position=`fixed`,t.style.opacity=`0`,document.body.appendChild(t),t.select(),document.execCommand(`copy`),t.remove(),Promise.resolve()}function X(e,t,n,r){return`https://${e}/${t}/${n}/issues/${r}`}function Ze(e,t,n){return`${location.origin}${location.pathname}${b({screen:`edit`,owner:e,repo:t,number:n})}`}function Qe(e,t,n){document.querySelector(`.copy-url-menu`)?.remove();let r=e.getBoundingClientRect(),i=document.createElement(`div`);i.className=`note-context-menu copy-url-menu`,i.innerHTML=`
    <button class="copy-menu-btn" data-url="${Q(t)}">Notehub URL</button>
    <button class="copy-menu-btn" data-url="${Q(n)}">GitHub URL</button>
  `,i.style.top=`${r.bottom+4}px`,i.style.left=`${r.right}px`,document.body.appendChild(i);let a=()=>{i.remove(),document.removeEventListener(`click`,a)};setTimeout(()=>document.addEventListener(`click`,a),0),i.querySelectorAll(`.copy-menu-btn`).forEach(t=>{t.addEventListener(`click`,n=>{n.stopPropagation(),a();let r=t.dataset.url;Xe(r).then(()=>{e.innerHTML=qe,setTimeout(()=>{e.innerHTML=Y},1500)})})})}function Z(e){return C?C.hashTarget(e):`_blank`}function Q(e){return e.replace(/&/g,`&amp;`).replace(/"/g,`&quot;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}var $e=`0.24.0`,et=`f8df0b5f8f54`,$=document.createElement(`span`);$.className=`version-badge`,$.id=`version-badge`,$.textContent=`v${$e}`,$.title=et,document.body.appendChild($),Te();
//# sourceMappingURL=index-VybuiZN0.js.map