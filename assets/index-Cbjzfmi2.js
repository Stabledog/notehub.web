(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e){return e===`github.com`?`https://api.github.com`:`https://${e}/api/v3`}function t(e){return{Authorization:`Bearer ${e}`,Accept:`application/vnd.github+json`,"Content-Type":`application/json`}}async function n(n,r,i,a){let o;for(let s=0;s<3;s++)try{let o=await fetch(`${e(n)}${i}`,{...a,headers:{...t(r),...a?.headers}}),s=await o.text();if(!o.ok)throw Error(`GitHub API ${o.status}: ${s}`);return JSON.parse(s.replace(/\r\n/g,`
`))}catch(e){if(o=e instanceof Error?e:Error(String(e)),o.message.startsWith(`GitHub API `))throw o;s<2&&await new Promise(e=>setTimeout(e,500*(s+1)))}throw o}function r(e,t){return n(e,t,`/user`)}async function i(e,t,r,i){try{return await n(e,t,`/repos/${r}/${i}`),!0}catch{return!1}}async function a(e,t){return(await n(e,t,`/search/issues?q=is%3Aissue%20label%3Anotehub%20state%3Aopen&sort=updated&order=desc&per_page=100`)).items.map(e=>{let t=e.repository_url.split(`/`),n=t.pop(),r=t.pop();return{...e,owner:r,repo:n}})}function o(e,t,r,i,a){return n(e,t,`/repos/${r}/${i}/issues/${a}`)}function s(e,t,r,i,a,o){return n(e,t,`/repos/${r}/${i}/issues/${a}`,{method:`PATCH`,body:JSON.stringify(o)})}async function c(e,t,r,i,a,o){return await g(e,t,r,i),n(e,t,`/repos/${r}/${i}/issues`,{method:`POST`,body:JSON.stringify({title:a,body:o,labels:[`notehub`]})})}function l(e,t,r,i,a){return n(e,t,`/repos/${r}/${i}/issues/${a}`,{method:`PATCH`,body:JSON.stringify({state:`closed`})})}function u(e){let[t,n]=e.split(`/`);return{owner:t,repo:`${n}.attachments`}}async function d(e,t,r,i){let a=new Map;try{let o=await n(e,t,`/repos/${r}/${i}/git/trees/main?recursive=1`);for(let e of o.tree){if(e.type!==`blob`)continue;let t=e.path.split(`/`);if(t.length<4)continue;let n=`${t[0]}/${t[1]}/${t[2]}`;a.set(n,(a.get(n)??0)+1)}}catch{}return a}async function f(e,t,r,i,a,o,s){try{return await n(e,t,`/repos/${r}/${i}/contents/${a}/${o}/${s}`)}catch(e){if(e instanceof Error&&e.message.includes(`404`))return[];throw e}}async function p(e,t,r,i,a,o,s,c,l,u){let d={message:`notehub: attach ${c} to ${a}/${o}#${s}`,content:l};return u&&(d.sha=u),(await n(e,t,`/repos/${r}/${i}/contents/${a}/${o}/${s}/${encodeURIComponent(c)}`,{method:`PUT`,body:JSON.stringify(d)})).content}async function m(t,n,r,i,a){let o=await fetch(`${e(t)}/repos/${r}/${i}/contents/${a}`,{headers:{Authorization:`Bearer ${n}`,Accept:`application/vnd.github.raw`}});if(!o.ok){let e=await o.text();throw Error(`GitHub API ${o.status}: ${e}`)}return{blob:await o.blob(),filename:a.split(`/`).pop()}}async function h(e,t,r,i,a,o){await n(e,t,`/repos/${r}/${i}/contents/${a}`,{method:`DELETE`,body:JSON.stringify({message:`notehub: remove ${a.split(`/`).pop()}`,sha:o})})}async function g(e,t,r,i){try{await n(e,t,`/repos/${r}/${i}/labels`,{method:`POST`,body:JSON.stringify({name:`notehub`,color:`1d76db`,description:`notehub note`})})}catch{}}var _=`_app_debug_logs`;function ee(){try{let e=localStorage.getItem(_);return e?JSON.parse(e):[]}catch{return[]}}function te(e){try{let t=e.slice(-1e3);localStorage.setItem(_,JSON.stringify(t))}catch{}}function ne(e,t){let n={timestamp:new Date().toISOString(),level:e,message:t},r=ee();r.push(n),te(r),console[e===`warn`?`warn`:e===`error`?`error`:`log`](`[${e.toUpperCase()}] ${t}`)}function v(e){ne(`error`,e)}function re(e){ne(`warn`,e)}function y(e){ne(`info`,e)}function ie(){let e=ee();return e.length===0?`(no logs)`:e.map(e=>`[${new Date(e.timestamp).toLocaleTimeString()}] ${e.level.toUpperCase()}: ${e.message}`).join(`
`)}function ae(){try{localStorage.removeItem(_)}catch{}}function oe(){let e=document.createElement(`div`);e.id=`log-viewer-modal`,e.style.cssText=`
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
  `,r.addEventListener(`click`,()=>e.remove()),n.appendChild(r);let i=document.createElement(`textarea`);i.readOnly=!0,i.value=ie(),i.style.cssText=`
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
  `,o.addEventListener(`click`,()=>{ae(),i.value=`(no logs)`}),a.appendChild(o);let s=document.createElement(`button`);return s.textContent=`Refresh`,s.style.cssText=`
    padding: 6px 12px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  `,s.addEventListener(`click`,()=>{i.value=ie(),i.scrollTop=i.scrollHeight}),a.appendChild(s),t.appendChild(n),t.appendChild(i),t.appendChild(a),e.appendChild(t),e.addEventListener(`click`,t=>{t.target===e&&e.remove()}),e}function se(e){let t=e.replace(/^#\/?/,``);if(!t)return{screen:`list`};let n=t.split(`/`);if(n[0]===`edit`&&n.length===4){let e=parseInt(n[3],10);if(e>0&&Number.isFinite(e))return{screen:`edit`,owner:n[1],repo:n[2],number:e}}return n[0]===`new`&&n.length===3?{screen:`new`,owner:n[1],repo:n[2]}:{screen:`list`}}function b(e){switch(e.screen){case`list`:return`#/`;case`edit`:return`#/edit/${e.owner}/${e.repo}/${e.number}`;case`new`:return`#/new/${e.owner}/${e.repo}`}}function ce(e){location.hash=b(e)}function x(e){let t=b(e);history.replaceState(null,``,t)}function le(e){let t=()=>e(se(location.hash));return window.addEventListener(`hashchange`,t),()=>window.removeEventListener(`hashchange`,t)}var ue=`modulepreload`,de=function(e){return`/notehub.web/`+e},fe={},pe=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=de(t,n),t in fe)return;fe[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:ue,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},S=`notehub:token`,me=`https://stabledog.github.io/veditor.web`,C,w=`notehub:host`,he=`notehub:defaultRepo`,ge=`notehub:pinnedIssue`,_e=`🎫 New note`,ve=`# New note`;function T(){return localStorage.getItem(he)}function ye(){let e=localStorage.getItem(ge);if(!e)return null;try{let t=JSON.parse(e);if(t.owner&&t.repo&&typeof t.number==`number`)return t}catch{}return null}function be(){return T()!==null}function E(){let e=T();return e?u(e):null}async function xe(){if(!D)return null;let e=E();return e?await i(D.host,D.token,e.owner,e.repo)?e:(J(`Attachments repo "${e.owner}/${e.repo}" not found. Create it on GitHub to use attachments.`,!0),null):(J(`No default repo configured — cannot use attachments.`,!0),null)}var D=null,O=null,k=null,A=null,j=new Map,M=null,Se=[];function N(){return M?j.get(M)??null:null}var P=[],F=0,I=new Set,Ce=!1,L=null,R=null;function z(e){if(!D){H();return}switch(e.screen){case`list`:if(L===`list`)return;W();break;case`edit`:{let t=`${e.owner}/${e.repo}/${e.number}`;if(L===`edit`&&R===t)return;Oe(e.owner,e.repo,e.number);break}case`new`:De(e.owner,e.repo);break}}function B(e,t){let n={screen:`edit`,owner:e.owner,repo:e.repo,number:e.number};t.ctrlKey||t.metaKey?window.open(`${location.pathname}${b(n)}`,`_blank`):ce(n)}var V=document.getElementById(`app`);async function we(){let e=document.createElement(`link`);e.rel=`stylesheet`;let t=`v=${Date.now()}`;e.href=`${me}/veditor.css?${t}`,document.head.appendChild(e);try{C=await pe(()=>import(`${me}/veditor.js?${t}`),[]);let e=document.getElementById(`version-badge`);e&&C.VERSION&&(e.textContent+=` \u00b7 ve${C.VERSION}`)}catch(e){v(`Failed to load editor from ${me}/veditor.js: ${e instanceof Error?e.message:e}`)}let n=localStorage.getItem(S),i=localStorage.getItem(w)??`github.com`;n&&be()?r(i,n).then(e=>{D={host:i,token:n,username:e.login},le(z),z(se(location.hash))}).catch(()=>H()):H(),window.addEventListener(`message`,e=>{if(e.data?.type!==`barouse:activate`)return;Ce=!0;let t=document.querySelector(`.note-row.selected`)??document.querySelector(`.note-row`);t&&(t.tabIndex=-1,t.focus())})}function H(e){A?.destroy(),A=null,C?.destroyEditor();let t=localStorage.getItem(w)??`github.com`,n=localStorage.getItem(S)??``,i=localStorage.getItem(he)??``,a=ye(),o=D!==null;if(V.innerHTML=`
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
  `,o){let e=()=>W();document.getElementById(`settings-cancel`).addEventListener(`click`,e);let t=n=>{n.key===`Escape`&&(document.removeEventListener(`keydown`,t),e())};document.addEventListener(`keydown`,t)}document.getElementById(`settings-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`settings-host`).value.trim(),n=document.getElementById(`settings-pat`).value.trim(),i=document.getElementById(`settings-repo`).value.trim(),a=document.getElementById(`settings-pinned`).value.trim(),o=i.split(`/`);if(o.length!==2||!o[0]||!o[1]){H(`Repository must be in owner/repo format.`);return}try{y(`Settings: Validating token for host=${t}`);let e=await r(t,n);if(y(`Settings: Token validated for user ${e.login} on ${t}`),localStorage.setItem(w,t),localStorage.setItem(S,n),localStorage.setItem(he,i),D={host:t,token:n,username:e.login},a){let e=parseInt(a,10);if(isNaN(e)||e<1){H(`Pinned issue must be a positive number.`);return}localStorage.setItem(ge,JSON.stringify({owner:o[0],repo:o[1],number:e}))}else localStorage.removeItem(ge);le(z),z(se(location.hash))}catch(e){v(`Settings: Token validation failed for host=${t}: ${e instanceof Error?e.message:e}`),H(`Authentication failed: ${e instanceof Error?e.message:e}`)}})}var U=null;async function W(){if(A?.destroy(),A=null,C?.destroyEditor(),U?.(),U=null,j.clear(),M=null,L=`list`,R=null,x({screen:`list`}),!D)return;let e=[];V.innerHTML=`
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
  `;let t=document.getElementById(`notes-container`),n=0;function r(){let e=t.querySelectorAll(`.note-row`);e.forEach((e,t)=>{e.classList.toggle(`selected`,t===n)}),e[n]?.scrollIntoView({block:`nearest`})}let i=i=>{if(!(i.target instanceof HTMLInputElement||i.target instanceof HTMLTextAreaElement)&&!c&&!document.getElementById(`repo-picker-overlay`))if(i.key===`n`)i.preventDefault(),document.getElementById(`new-note`).click();else if(i.key===`r`)i.preventDefault(),W();else if(i.key===`j`||i.key===`ArrowDown`){i.preventDefault();let e=t.querySelectorAll(`.note-row`);e.length>0&&(n=Math.min(n+1,e.length-1),r())}else if(i.key===`k`||i.key===`ArrowUp`)i.preventDefault(),n>0&&(n--,r());else if(i.key===`Enter`){i.preventDefault();let r=t.querySelectorAll(`.note-row`);if(r.length>0){let t=parseInt(r[n].getAttribute(`data-index`),10),a=e[t];B(a,i)}}else i.key===`Escape`&&s?(i.preventDefault(),h()):i.key===`/`&&(i.preventDefault(),p())};document.addEventListener(`keydown`,i),U=()=>document.removeEventListener(`keydown`,i);let o=null,s=!1,c=!1,u=!1,d=null,f=``;function p(){if(s)return;s=!0,c=!0,f=t.innerHTML;let e=document.createElement(`div`);e.className=`search-bar`,e.id=`search-bar`,e.innerHTML=`
      <span class="search-slash">/</span>
      <div id="search-input-container"></div>
      <button id="search-regex-toggle" class="search-regex-toggle" title="Toggle regex (Ctrl+R)">.*</button>
      <span id="search-count" class="search-count"></span>
    `,t.parentElement.insertBefore(e,t),e.addEventListener(`focusin`,()=>{c=!0}),e.addEventListener(`focusout`,()=>{c=!1}),o=C.createVimInput(document.getElementById(`search-input-container`),{placeholder:`Search notes...`,initialInsert:!0,onEscape:h,onChange:e=>{d&&clearTimeout(d),d=setTimeout(()=>g(e),150)},onEnter:()=>{document.activeElement?.blur()},storagePrefix:`notehub`}),o.focus(),m(),document.getElementById(`search-regex-toggle`).addEventListener(`click`,()=>{u=!u,m(),o&&g(o.getValue())}),e.addEventListener(`keydown`,e=>{e.key===`r`&&e.ctrlKey&&(e.preventDefault(),u=!u,m(),o&&g(o.getValue()))})}function m(){let e=document.getElementById(`search-regex-toggle`);e&&e.classList.toggle(`active`,u)}function h(){s&&(s=!1,c=!1,d&&=(clearTimeout(d),null),o?.destroy(),o=null,document.getElementById(`search-bar`)?.remove(),f&&(t.innerHTML=f,f=``,te()),n=0,r())}function g(i){let a=document.getElementById(`search-count`);if(!i.trim()){f&&(t.innerHTML=f,te()),a&&(a.textContent=``),n=0,r();return}let o=_(i,u,e);a&&(a.textContent=`${o.length} match${o.length===1?``:`es`}`),ee(o)}function _(e,t,n){let r;if(t){let t;try{t=new RegExp(e,`gi`)}catch{let e=document.getElementById(`search-count`);return e&&(e.textContent=`invalid regex`,e.classList.add(`error`)),[]}let n=document.getElementById(`search-count`);n&&n.classList.remove(`error`),r=e=>{t.lastIndex=0;let n=t.exec(e);return n?{index:n.index,length:n[0].length}:null}}else{let t=e.toLowerCase();r=e=>{let n=e.toLowerCase().indexOf(t);return n>=0?{index:n,length:t.length}:null}}let i=[];for(let e=0;e<n.length;e++){let t=n[e],a=t.body??``,o=r(t.title),s=r(a);if(!o&&!s)continue;let c=s??o,l=s?a:t.title,u=Math.max(0,c.index-40),d=Math.min(l.length,c.index+c.length+40),f=Y(l.slice(u,c.index)),p=Y(l.slice(c.index,c.index+c.length)),m=Y(l.slice(c.index+c.length,d)),h=`${u>0?`...`:``}${f}<mark>${p}</mark>${m}${d<l.length?`...`:``}`;i.push({note:t,index:e,context:h})}return i}function ee(i){if(i.length===0){t.innerHTML=`<p class="empty">No matches found.</p>`;return}t.innerHTML=`
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
    `,n=0,r(),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,n=>{let r=parseInt(t.getAttribute(`data-index`),10),i=e[r];B(i,n)})})}function te(){t.querySelectorAll(`.copy-url-btn`).forEach(t=>{t.addEventListener(`click`,n=>{n.stopPropagation();let r=parseInt(t.dataset.index,10),i=e[r];et(t,$e(i.owner,i.repo,i.number),X(D.host,i.owner,i.repo,i.number))})}),t.querySelectorAll(`.context-menu-btn`).forEach(n=>{n.addEventListener(`click`,r=>{r.stopPropagation(),document.querySelector(`.note-context-menu`)?.remove();let i=parseInt(n.dataset.index,10),a=e[i],o=n.getBoundingClientRect(),s=document.createElement(`div`);s.className=`note-context-menu`,s.innerHTML=`
          <button class="context-github-btn">${Ze} Edit on GitHub</button>
          <button class="context-delete-btn">${Xe} Delete</button>
        `,s.style.top=`${o.bottom+4}px`,s.style.left=`${o.right}px`,document.body.appendChild(s);let c=()=>{s.remove(),document.removeEventListener(`click`,c)};setTimeout(()=>document.addEventListener(`click`,c),0),s.querySelector(`.context-github-btn`).addEventListener(`click`,e=>{e.stopPropagation(),c(),window.open(X(D.host,a.owner,a.repo,a.number)+`#new_comment_field`,`_blank`)}),s.querySelector(`.context-delete-btn`).addEventListener(`click`,async e=>{e.stopPropagation(),c();try{await l(D.host,D.token,a.owner,a.repo,a.number),t.querySelector(`.note-row[data-index="${i}"]`)?.remove()}catch(e){alert(`Failed to delete note: ${e instanceof Error?e.message:e}`)}})})}),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,n=>{let r=parseInt(t.getAttribute(`data-index`),10),i=e[r];B(i,n)})})}document.getElementById(`settings-btn`).addEventListener(`click`,()=>H()),document.getElementById(`sign-out`).addEventListener(`click`,()=>{localStorage.removeItem(S),localStorage.removeItem(w),D=null,H()}),document.getElementById(`refresh`).addEventListener(`click`,()=>W()),document.getElementById(`logs-btn`).addEventListener(`click`,()=>{document.body.appendChild(oe())});try{if(y(`Note list: Fetching notes for all configured repos`),e=await a(D.host,D.token),Se=e,y(`Note list: Loaded ${e.length} notes`),k){let t=k;k=null,e.some(e=>e.owner===t.owner&&e.repo===t.repo&&e.number===t.number)||(re(`Note list: Search API may not have indexed newly created note yet; using cache`),e.unshift(t))}let n=ye();if(n){let t=e=>e.owner===n.owner&&e.repo===n.repo&&e.number===n.number;e.sort((e,n)=>t(e)?-1:+!!t(n))}if(document.getElementById(`new-note`).addEventListener(`click`,()=>{Ee(e)}),e.length===0){t.innerHTML=`<p class="empty">No notes found.</p>`;return}t.innerHTML=`
      <table>
        <thead><tr><th>Title</th><th>#</th><th></th><th>Updated</th><th></th><th>Repo</th></tr></thead>
        <tbody>
          ${e.map((e,t)=>`
            <tr class="note-row" data-index="${t}">
              <td>${Y(e.title)}<span class="attachment-count-badge" data-owner="${Q(e.owner)}" data-repo="${Q(e.repo)}" data-issue="${e.number}"></span></td>
              <td><a href="${Q(X(D.host,e.owner,e.repo,e.number))}" target="${Z(X(D.host,e.owner,e.repo,e.number))}" class="issue-link" onclick="event.stopPropagation()">${e.number}</a></td>
              <td><button class="copy-url-btn" data-index="${t}" title="Copy URL">${qe}</button></td>
              <td>${new Date(e.updated_at).toLocaleDateString(`en-US`,{month:`numeric`,day:`numeric`,year:`2-digit`})}</td>
              <td><button class="context-menu-btn" data-index="${t}" title="More actions">&#x2026;</button></td>
              <td><span title="${Q(e.owner)}/${Q(e.repo)}">${Y(e.repo)}</span></td>
            </tr>
          `).join(``)}
        </tbody>
      </table>
    `,t.querySelectorAll(`.copy-url-btn`).forEach(t=>{t.addEventListener(`click`,n=>{n.stopPropagation();let r=parseInt(t.dataset.index,10),i=e[r];et(t,$e(i.owner,i.repo,i.number),X(D.host,i.owner,i.repo,i.number))})}),t.querySelectorAll(`.context-menu-btn`).forEach(n=>{n.addEventListener(`click`,r=>{r.stopPropagation(),document.querySelector(`.note-context-menu`)?.remove();let i=parseInt(n.dataset.index,10),a=e[i],o=n.getBoundingClientRect(),s=document.createElement(`div`);s.className=`note-context-menu`,s.innerHTML=`
          <button class="context-github-btn">${Ze} Edit on GitHub</button>
          <button class="context-delete-btn">${Xe} Delete</button>
        `,s.style.top=`${o.bottom+4}px`,s.style.left=`${o.right}px`,document.body.appendChild(s);let c=()=>{s.remove(),document.removeEventListener(`click`,c)};setTimeout(()=>document.addEventListener(`click`,c),0),s.querySelector(`.context-github-btn`).addEventListener(`click`,e=>{e.stopPropagation(),c(),window.open(X(D.host,a.owner,a.repo,a.number)+`#new_comment_field`,`_blank`)}),s.querySelector(`.context-delete-btn`).addEventListener(`click`,async e=>{e.stopPropagation(),c();try{await l(D.host,D.token,a.owner,a.repo,a.number),t.querySelector(`.note-row[data-index="${i}"]`)?.remove()}catch(e){alert(`Failed to delete note: ${e instanceof Error?e.message:e}`)}})})}),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,n=>{let r=parseInt(t.getAttribute(`data-index`),10),i=e[r];B(i,n)})}),r();let i=t.querySelector(`.note-row.selected`);i&&(i.tabIndex=-1,i.focus()),Te(e).catch(()=>{})}catch(e){let t=e instanceof Error?e.message:String(e);v(`Note list: Failed to load notes: ${t}`),document.getElementById(`notes-container`).innerHTML=`<p class="error">Failed to load notes: ${t}</p>`}}async function Te(e){if(!D)return;let t=E();if(!t)return;let n=await d(D.host,D.token,t.owner,t.repo);document.querySelectorAll(`.attachment-count-badge`).forEach(e=>{let t=`${e.dataset.owner}/${e.dataset.repo}/${e.dataset.issue}`,r=n.get(t);r&&(e.textContent=` 📎${r}`)})}function Ee(e){document.getElementById(`repo-picker-overlay`)?.remove();let t=new Map,n=T();if(n){let[e,r]=n.split(`/`);t.set(n,{owner:e,repo:r})}for(let n of e){let e=`${n.owner}/${n.repo}`;t.has(e)||t.set(e,{owner:n.owner,repo:n.repo})}let r=Array.from(t.entries()).sort((e,t)=>{if(n){if(e[0]===n)return-1;if(t[0]===n)return 1}return e[0].localeCompare(t[0])}),i=document.createElement(`div`);i.id=`repo-picker-overlay`,i.innerHTML=`
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
  `,V.appendChild(i),i.addEventListener(`click`,e=>{e.target===i&&i.remove()});let a=e=>{e.key===`Escape`&&(i.remove(),document.removeEventListener(`keydown`,a))};document.addEventListener(`keydown`,a),i.querySelectorAll(`.repo-option`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.owner,n=e.dataset.repo;i.remove(),document.removeEventListener(`keydown`,a),De(t,n)})});let o=document.getElementById(`repo-other-go`),s=document.getElementById(`repo-other-input`),c=()=>{let e=s.value.trim().split(`/`);if(e.length!==2||!e[0]||!e[1]){s.classList.add(`error`);return}i.remove(),document.removeEventListener(`keydown`,a),De(e[0],e[1])};o.addEventListener(`click`,c),s.addEventListener(`keydown`,e=>{e.key===`Enter`&&c()})}async function De(e,t){if(D){if(!await i(D.host,D.token,e,t)){v(`Auth: Repo validation failed for ${e}/${t}`),alert(`Repository "${e}/${t}" not found. Check the owner and repo name.`);return}O={owner:e,repo:t},M=null,L=`edit`,R=null,x({screen:`new`,owner:e,repo:t}),G(_e,ve,null)}}async function Oe(e,t,n){if(!D)return;L=`edit`;let r=`${e}/${t}/${n}`;if(R=r,x({screen:`edit`,owner:e,repo:t,number:n}),j.has(r)){M=r;let e=j.get(r);L===`edit`&&document.querySelector(`.editor-screen`)?ke(r,e):G(e.note.title,e.originalBody,e);return}V.innerHTML=`<div class="editor-screen"><p>Loading note #${n}...</p></div>`;try{y(`Note: Opening note #${n} from ${e}/${t}`);let i=await o(D.host,D.token,e,t,n);y(`Note: Loaded note #${n}: "${i.title}"`);let a={note:{...i,owner:e,repo:t},originalBody:i.body??``,originalTitle:i.title,loadedUpdatedAt:i.updated_at,attachments:[],selectedAttachmentIndex:0,multiSelectedAttachments:new Set};j.set(r,a),M=r,G(i.title,a.originalBody,a)}catch(e){let t=e instanceof Error?e.message:String(e);v(`Note: Failed to load note #${n}: ${t}`),V.innerHTML=`<div class="editor-screen"><p class="error">Failed to load note: ${t}</p></div>`}}function ke(e,t){M=e,R=e;let n=t.note;x({screen:`edit`,owner:n.owner,repo:n.repo,number:n.number}),A?.setValue(n.title);let r=document.getElementById(`note-number`);r&&(r.innerHTML=`<a href="${Q(X(D.host,n.owner,n.repo,n.number))}" target="${Z(X(D.host,n.owner,n.repo,n.number))}" class="issue-link">#${n.number}</a>`),P=t.attachments,F=t.selectedAttachmentIndex,I=t.multiSelectedAttachments,document.getElementById(`attachment-panel`)&&K()}function Ae(e){return async()=>{if(!D)return;let t=C.getEditorContent(),n=(A?.getValue()??``).trim(),r=e();if(!r&&O){if(!n){J(`Title required`,!0);return}try{J(`Creating...`),y(`Note: Creating new note in ${O.owner}/${O.repo}`);let e=await c(D.host,D.token,O.owner,O.repo,n,t);y(`Note: Created new note: #${e.number}`);let r={...e,owner:O.owner,repo:O.repo};k=r,O=null;let i=`${r.owner}/${r.repo}/${r.number}`,a={note:r,originalBody:e.body??``,originalTitle:e.title,loadedUpdatedAt:e.updated_at,attachments:[],selectedAttachmentIndex:0,multiSelectedAttachments:new Set};j.set(i,a),M=i,R=i,x({screen:`edit`,owner:r.owner,repo:r.repo,number:r.number});let o=document.getElementById(`note-number`);o&&(o.innerHTML=`<a href="${Q(X(D.host,r.owner,r.repo,r.number))}" target="${Z(X(D.host,r.owner,r.repo,r.number))}" class="issue-link">#${r.number}</a>`),J(`Created`)}catch(e){let t=e instanceof Error?e.message:String(e);v(`Note: Failed to create note: ${t}`),J(`Create failed: ${t}`,!0)}return}if(!r)return;let i={};if(t!==r.originalBody&&(i.body=t),n!==r.originalTitle&&(i.title=n),Object.keys(i).length===0){J(`No changes`);return}try{J(`Saving...`),y(`Note: Save initiated for #${r.note.number}`);let e=await o(D.host,D.token,r.note.owner,r.note.repo,r.note.number);if(r.loadedUpdatedAt&&e.updated_at!==r.loadedUpdatedAt&&(re(`Note: Remote conflict detected for #${r.note.number}; user chose to overwrite`),!await Pe())){y(`Note: Save cancelled due to conflict`),J(`Save cancelled`);return}let t=await s(D.host,D.token,r.note.owner,r.note.repo,r.note.number,i);y(`Note: Save successful for #${r.note.number}: "${t.title}"`),r.originalBody=t.body??``,r.originalTitle=t.title,r.loadedUpdatedAt=t.updated_at,r.note={...t,owner:r.note.owner,repo:r.note.repo},J(`Saved`)}catch(e){let t=e instanceof Error?e.message:String(e);v(`Note: Save failed for #${r.note.number}: ${t}`),J(`Save failed: ${t}`,!0)}}}function je(){return async e=>{if(!D)throw Error(`Not authenticated`);if(j.has(e)){let t=j.get(e);return{content:t.originalBody,label:t.note.title,callbacks:Me(()=>j.get(e)??null,e)}}let t=e.split(`/`);if(t.length!==3)throw Error(`Invalid document id: ${e}`);let[n,r,i]=t,a=parseInt(i,10);y(`Note: Loading document ${e} for new buffer`);let s=await o(D.host,D.token,n,r,a),c={note:{...s,owner:n,repo:r},originalBody:s.body??``,originalTitle:s.title,loadedUpdatedAt:s.updated_at,attachments:[],selectedAttachmentIndex:0,multiSelectedAttachments:new Set};return j.set(e,c),{content:c.originalBody,label:s.title,callbacks:Me(()=>j.get(e)??null,e)}}}function Me(e,t){return{onSave:Ae(e),onQuit:()=>{j.clear(),ce({screen:`list`})},isAppDirty:()=>{let t=e();return t?A?.getValue().trim()!==t.originalTitle:!1},onBufferSwitch:e=>{let t=j.get(e);t&&ke(e,t)},onListDocuments:async()=>Se.map(e=>({id:`${e.owner}/${e.repo}/${e.number}`,label:e.title})),onLoadDocument:je()}}function G(e,t,n){U?.(),U=null;let r=n?.note??null;V.innerHTML=`
    <div class="editor-screen">
      <header>
        <button id="back-to-list" title="Back to notes">&larr;</button>
        <div id="note-title-container"></div>
        <span id="note-number">${r?`<a href="${Q(X(D.host,r.owner,r.repo,r.number))}" target="${Z(X(D.host,r.owner,r.repo,r.number))}" class="issue-link">#${r.number}</a>`:`Title`}</span>
        ${r?`<button id="copy-note-url" class="copy-url-btn" title="Copy URL">${qe}</button>`:``}
        ${r?`<button id="attachment-toggle-btn" class="attachment-toggle-btn" title="Attachments (ga)">${Je}</button>`:``}
        ${r?`<button id="delete-note-btn" class="delete-note-btn" title="Delete note">${Xe}</button>`:``}
        <span id="status-msg"></span>
      </header>
      <div id="editor-container"></div>
    </div>
  `,document.getElementById(`back-to-list`).addEventListener(`click`,()=>{C.requestQuit()});let i=document.getElementById(`copy-note-url`);if(i&&r){let e=r;i.addEventListener(`click`,()=>{et(i,$e(e.owner,e.repo,e.number),X(D.host,e.owner,e.repo,e.number))})}document.getElementById(`attachment-toggle-btn`)?.addEventListener(`click`,()=>Fe()),document.getElementById(`delete-note-btn`)?.addEventListener(`click`,()=>Ne()),A=C.createVimInput(document.getElementById(`note-title-container`),{value:e,onEnter:()=>C.focusEditor(),onEscape:()=>C.focusEditor(),storagePrefix:`notehub`});let a=M,o=Me(()=>M?j.get(M)??null:null,a??`__new__`);if(C.createEditor(document.getElementById(`editor-container`),t,o,{storagePrefix:`notehub`,autoSaveMs:C.getAutoSaveMs(),initialBufferId:a??void 0,initialBufferLabel:e,normalMappings:{gt:()=>A.focus(),ga:()=>Fe()}}),r){let e=E();e&&f(D.host,D.token,e.owner,e.repo,r.owner,r.repo,r.number).then(e=>{e.length>0&&document.querySelector(`.editor-screen`)&&Ie()}).catch(()=>{})}}async function Ne(){if(!D)return;let e=N();if(e&&confirm(`Delete note "#${e.note.number}: ${e.originalTitle}"?`))try{if(J(`Deleting...`),(await l(D.host,D.token,e.note.owner,e.note.repo,e.note.number)).state!==`closed`){let e=`Delete failed: note was not closed`;J(e,!0),v(e);return}y(`Deleted note #${e.note.number}: ${e.originalTitle}`),J(`Deleted`),setTimeout(()=>{ce({screen:`list`})},500)}catch(e){let t=`Delete failed: ${e instanceof Error?e.message:e}`;J(t,!0),v(t)}}function Pe(){return new Promise(e=>{let t=document.createElement(`div`);t.id=`conflict-overlay`,t.innerHTML=`
      <div class="conflict-dialog">
        <h3>Note changed</h3>
        <p>This note has been modified since you opened it. Saving will overwrite those changes.</p>
        <div class="conflict-actions">
          <button id="conflict-cancel">Cancel</button>
          <button id="conflict-overwrite" class="danger">Overwrite</button>
        </div>
      </div>
    `,document.body.appendChild(t);let n=n=>{t.remove(),document.removeEventListener(`keydown`,r),e(n)};function r(e){e.key===`Escape`&&n(!1)}t.querySelector(`#conflict-cancel`).addEventListener(`click`,()=>n(!1)),t.querySelector(`#conflict-overwrite`).addEventListener(`click`,()=>n(!0)),t.addEventListener(`click`,e=>{e.target===t&&n(!1)}),document.addEventListener(`keydown`,r)})}function Fe(){document.getElementById(`attachment-panel`)?K():Ie()}function K(){document.getElementById(`attachment-panel`)?.remove(),P=[],F=0,I.clear(),C?.focusEditor()}async function Ie(){let e=N();if(!e||!D)return;let t=document.querySelector(`.editor-screen`);if(!t)return;let n=e.note,r=E(),i=r&&D&&n?`https://${D.host}/${r.owner}/${r.repo}/tree/main/${n.owner}/${n.repo}/${n.number}`:``,a=document.createElement(`div`);a.id=`attachment-panel`,a.className=`attachment-panel`,a.tabIndex=0,a.innerHTML=`
    <div class="attachment-panel-header">
      <span class="attachment-panel-title">
        ${Je} Attachments
        ${i?`<a href="${i}" target="_blank" class="attachment-repo-link" title="Open attachments folder on GitHub">\u2197</a>`:``}
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
  `,t.appendChild(a),a.focus(),document.getElementById(`attachment-close-btn`).addEventListener(`click`,e=>{e.stopPropagation(),K()}),a.querySelectorAll(`.footer-action[data-action]`).forEach(e=>{let t=e.dataset.action;t!==`navigate`&&(e.style.cursor=`pointer`,e.addEventListener(`click`,async e=>{e.stopPropagation(),t===`select`?We():t===`upload`?await Be():t===`download`?await He():t===`preview`?await Ue():t===`delete`?await Ge():t===`close`&&K(),a.focus()}))}),a.addEventListener(`keydown`,async e=>{e.key===`Escape`?(e.preventDefault(),K()):e.key===`j`||e.key===`ArrowDown`?(e.preventDefault(),Re(1)):e.key===`k`||e.key===`ArrowUp`?(e.preventDefault(),Re(-1)):e.key===`a`?(e.preventDefault(),await Be()):e.key===`Enter`||e.key===`d`?(e.preventDefault(),await He()):e.key===`p`?(e.preventDefault(),await Ue()):e.key===` `?(e.preventDefault(),We()):e.key===`x`&&(e.preventDefault(),await Ge())}),a.addEventListener(`dragover`,e=>{e.preventDefault(),a.classList.add(`attachment-panel-dragover`)}),a.addEventListener(`dragleave`,()=>{a.classList.remove(`attachment-panel-dragover`)}),a.addEventListener(`drop`,async e=>{e.preventDefault(),a.classList.remove(`attachment-panel-dragover`);let t=Array.from(e.dataTransfer?.files||[]);t.length>0&&await ze(t)}),await Le()}async function Le(){let e=N();if(!e||!D)return;let t=document.getElementById(`attachment-list`);if(!t)return;let n=await xe();if(!n){t.innerHTML=`<p class="attachment-error">Attachments repo not available.</p>`;return}try{P=await f(D.host,D.token,n.owner,n.repo,e.note.owner,e.note.repo,e.note.number),e.attachments=P}catch(e){t.innerHTML=`<p class="attachment-error">Failed to load: ${e instanceof Error?e.message:e}</p>`;return}F=0,e.selectedAttachmentIndex=0,q(t)}function q(e){if(P.length===0){e.innerHTML=`<p class="attachment-empty">No attachments yet. Press <kbd>a</kbd> to upload.</p>`;return}e.innerHTML=P.map((e,t)=>{let n=t===F,r=I.has(t);return`
    <div class="${[`attachment-row`,n?`selected`:``,r?`multi-selected`:``].filter(Boolean).join(` `)}" data-index="${t}">
      <span class="attachment-checkbox">${r?`☑`:`☐`}</span>
      <span class="attachment-name" title="Click to preview, Ctrl+click to download">${Y(e.name)}</span>
      <span class="attachment-size">${Ke(e.size)}</span>
    </div>`}).join(``);let t=!1,n=document.getElementById(`attachment-panel`);e.addEventListener(`mousedown`,()=>{t=n===document.activeElement}),e.querySelectorAll(`.attachment-row`).forEach(r=>{let i=parseInt(r.dataset.index,10);r.querySelector(`.attachment-checkbox`)?.addEventListener(`click`,r=>{if(r.stopPropagation(),!t){n?.focus();return}F=i,I.has(i)?I.delete(i):I.add(i),q(e),n?.focus()}),r.querySelector(`.attachment-name`)?.addEventListener(`click`,async r=>{if(r.stopPropagation(),!t){n?.focus();return}F=i,q(e),r.ctrlKey||r.metaKey?await Ve(i):await Ue(),n?.focus()}),r.addEventListener(`click`,()=>{if(!t){n?.focus();return}F=i,q(e),n?.focus()})}),e.querySelector(`.attachment-row.selected`)?.scrollIntoView({block:`nearest`})}function Re(e){if(P.length===0)return;F=Math.max(0,Math.min(P.length-1,F+e));let t=document.getElementById(`attachment-list`);t&&q(t)}async function ze(e){let t=N();if(!t||!D||e.length===0)return;let n=t.note,r=await xe();if(!r)return;let i={};try{let e=await f(D.host,D.token,r.owner,r.repo,n.owner,n.repo,n.number);i=Object.fromEntries(e.map(e=>[e.name,e.sha]))}catch{}let a=[],o=[];for(let t of e)try{J(`Uploading ${a.length+1}/${e.length}...`),y(`Attachment: Uploading ${t.name}`);let o=await t.arrayBuffer(),s=new Uint8Array(o),c=8192,l=``;for(let e=0;e<s.length;e+=c)l+=String.fromCharCode(...s.subarray(e,e+c));let u=btoa(l),d=await p(D.host,D.token,r.owner,r.repo,n.owner,n.repo,n.number,t.name,u,i[t.name]);y(`Attachment: Uploaded ${t.name} (${t.size} bytes)`),a.push(`[${t.name}](${d.download_url})`);let f=P.findIndex(e=>e.name===t.name);f>=0?P[f]=d:P.push(d)}catch(e){let n=e instanceof Error?e.message:String(e);v(`Attachment: Upload failed for ${t.name}: ${n}`),o.push(t.name)}let s=document.getElementById(`attachment-list`);if(s&&q(s),a.length>0){let e=!1;try{await Qe(a.join(`
`)),e=!0}catch(e){v(`Attachment: clipboard write failed: ${e instanceof Error?e.message:String(e)}`)}let t=a.length===1?e?`Uploaded — link copied`:`Uploaded`:e?`Uploaded ${a.length} files — links copied`:`Uploaded ${a.length} files`;J(o.length>0?`${t} (${o.length} failed)`:t,o.length>0)}else J(`Upload failed: ${o.join(`, `)}`,!0);document.getElementById(`attachment-panel`)?.focus()}async function Be(){if(!N()||!D)return;let e=document.createElement(`input`);e.type=`file`,e.multiple=!0,e.onchange=async()=>{await ze(Array.from(e.files||[]))},e.click()}async function Ve(e){let t=P[e];if(!t||!N()||!D)return;let n=E();if(n)try{J(`Downloading...`);let{blob:e,filename:r}=await m(D.host,D.token,n.owner,n.repo,t.path),i=URL.createObjectURL(e),a=document.createElement(`a`);a.href=i,a.download=r,a.click(),setTimeout(()=>URL.revokeObjectURL(i),100),J(``)}catch(e){J(`Download failed: ${e instanceof Error?e.message:e}`,!0)}}async function He(){await Ve(F)}async function Ue(){let e=P[F];if(!e||!N()||!D)return;let t=E();if(t)try{J(`Loading preview...`);let{blob:n}=await m(D.host,D.token,t.owner,t.repo,e.path),r=e.name.split(`.`).pop()?.toLowerCase()??``,i={jpg:`image/jpeg`,jpeg:`image/jpeg`,png:`image/png`,gif:`image/gif`,webp:`image/webp`,svg:`image/svg+xml`,bmp:`image/bmp`,pdf:`application/pdf`,txt:`text/plain`,md:`text/plain`,json:`application/json`,csv:`text/csv`,html:`text/html`},a=i[r]?new Blob([n],{type:i[r]}):n,o=URL.createObjectURL(a);window.open(o,`_blank`),setTimeout(()=>URL.revokeObjectURL(o),6e4),J(``)}catch(e){J(`Preview failed: ${e instanceof Error?e.message:e}`,!0)}}function We(){if(P.length===0)return;I.has(F)?I.delete(F):I.add(F);let e=document.getElementById(`attachment-list`);e&&q(e)}async function Ge(){let e=N();if(!e||!D)return;let t=e.note,n=E();if(!n)return;let r=I.size>0?[...I].sort((e,t)=>t-e):[F],i=r.map(e=>P[e]?.name).filter(Boolean);if(i.length===0)return;let a=i.length===1?`Delete "${i[0]}"?`:`Delete ${i.length} attachments?\n${i.join(`
`)}`;if(!confirm(a)){document.getElementById(`attachment-panel`)?.focus();return}try{J(`Deleting ${i.length===1?``:i.length+` `}...`);for(let e of r){let r=P[e];r&&(y(`Attachment: Deleting ${r.name} from note #${t?.number}`),await h(D.host,D.token,n.owner,n.repo,r.path,r.sha),y(`Attachment: Deleted ${r.name}`))}J(i.length===1?`Deleted`:`Deleted ${i.length} attachments`);for(let e of r)P.splice(e,1);I.clear(),F=Math.min(F,Math.max(0,P.length-1));let e=document.getElementById(`attachment-list`);e&&q(e),document.getElementById(`attachment-panel`)?.focus()}catch(e){let t=e instanceof Error?e.message:String(e);v(`Attachment: Delete failed for ${i.join(`, `)}: ${t}`),J(`Delete failed: ${e instanceof Error?e.message:e}`,!0),document.getElementById(`attachment-panel`)?.focus()}}function Ke(e){return e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(1)} MB`}function J(e,t=!1){let n=document.getElementById(`status-msg`);n&&(n.textContent=e,n.className=t?`error`:`success`,t||setTimeout(()=>{n.textContent===e&&(n.textContent=``)},2e3))}function Y(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}var qe=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,Je=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,Ye=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,Xe=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,Ze=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;function Qe(e){if(Ce)return window.postMessage({type:`barouse:clipboard-write`,text:e},`*`),Promise.resolve();if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(e);let t=document.createElement(`textarea`);return t.value=e,t.style.position=`fixed`,t.style.opacity=`0`,document.body.appendChild(t),t.select(),document.execCommand(`copy`),t.remove(),Promise.resolve()}function X(e,t,n,r){return`https://${e}/${t}/${n}/issues/${r}`}function $e(e,t,n){return`${location.origin}${location.pathname}${b({screen:`edit`,owner:e,repo:t,number:n})}`}function et(e,t,n){document.querySelector(`.copy-url-menu`)?.remove();let r=e.getBoundingClientRect(),i=document.createElement(`div`);i.className=`note-context-menu copy-url-menu`,i.innerHTML=`
    <button class="copy-menu-btn" data-url="${Q(t)}">Notehub URL</button>
    <button class="copy-menu-btn" data-url="${Q(n)}">GitHub URL</button>
  `,i.style.top=`${r.bottom+4}px`,i.style.left=`${r.right}px`,document.body.appendChild(i);let a=()=>{i.remove(),document.removeEventListener(`click`,a)};setTimeout(()=>document.addEventListener(`click`,a),0),i.querySelectorAll(`.copy-menu-btn`).forEach(t=>{t.addEventListener(`click`,n=>{n.stopPropagation(),a();let r=t.dataset.url;Qe(r).then(()=>{e.innerHTML=Ye,setTimeout(()=>{e.innerHTML=qe},1500)})})})}function Z(e){return C?C.hashTarget(e):`_blank`}function Q(e){return e.replace(/&/g,`&amp;`).replace(/"/g,`&quot;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}var tt=`0.28.0`,nt=`59b03a53ce2e`,$=document.createElement(`span`);$.className=`version-badge`,$.id=`version-badge`,$.textContent=`v${tt}`,$.title=nt,document.body.appendChild($),we();
//# sourceMappingURL=index-Cbjzfmi2.js.map