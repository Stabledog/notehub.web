(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e){return e===`github.com`?`https://api.github.com`:`https://${e}/api/v3`}function t(e){return{Authorization:`Bearer ${e}`,Accept:`application/vnd.github+json`,"Content-Type":`application/json`}}async function n(n,r,i,a){let o=await fetch(`${e(n)}${i}`,{...a,headers:{...t(r),...a?.headers}});if(!o.ok){let e=await o.text();throw Error(`GitHub API ${o.status}: ${e}`)}return o.json()}function r(e,t){return n(e,t,`/user`)}async function i(e,t,r,i){try{return await n(e,t,`/repos/${r}/${i}`),!0}catch{return!1}}async function a(e,t){return(await n(e,t,`/search/issues?q=is%3Aissue%20label%3Anotehub%20state%3Aopen&sort=updated&order=desc&per_page=100`)).items.map(e=>{let t=e.repository_url.split(`/`),n=t.pop(),r=t.pop();return{...e,owner:r,repo:n}})}function o(e,t,r,i,a){return n(e,t,`/repos/${r}/${i}/issues/${a}`)}function s(e,t,r,i,a,o){return n(e,t,`/repos/${r}/${i}/issues/${a}`,{method:`PATCH`,body:JSON.stringify(o)})}async function c(e,t,r,i,a,o){return await ee(e,t,r,i),n(e,t,`/repos/${r}/${i}/issues`,{method:`POST`,body:JSON.stringify({title:a,body:o,labels:[`notehub`]})})}function l(e,t,r,i,a){return n(e,t,`/repos/${r}/${i}/issues/${a}`,{method:`PATCH`,body:JSON.stringify({state:`closed`})})}function u(e){let[t,n]=e.split(`/`);return{owner:t,repo:`${n}.attachments`}}function d(e,t,n,r){return e===`github.com`?`https://raw.githubusercontent.com/${t}/${n}/main/${r}`:`https://${e}/raw/${t}/${n}/main/${r}`}async function f(e,t,r,i){let a=new Map;try{let o=await n(e,t,`/repos/${r}/${i}/git/trees/main?recursive=1`);for(let e of o.tree){if(e.type!==`blob`)continue;let t=e.path.split(`/`);if(t.length<4)continue;let n=`${t[0]}/${t[1]}/${t[2]}`;a.set(n,(a.get(n)??0)+1)}}catch{}return a}async function p(e,t,r,i,a,o,s){try{return await n(e,t,`/repos/${r}/${i}/contents/${a}/${o}/${s}`)}catch(e){if(e instanceof Error&&e.message.includes(`404`))return[];throw e}}async function m(e,t,r,i,a,o,s,c,l,u){let d={message:`notehub: attach ${c} to ${a}/${o}#${s}`,content:l};return u&&(d.sha=u),(await n(e,t,`/repos/${r}/${i}/contents/${a}/${o}/${s}/${encodeURIComponent(c)}`,{method:`PUT`,body:JSON.stringify(d)})).content}async function h(t,n,r,i,a){let o=await fetch(`${e(t)}/repos/${r}/${i}/contents/${a}`,{headers:{Authorization:`Bearer ${n}`,Accept:`application/vnd.github.raw`}});if(!o.ok){let e=await o.text();throw Error(`GitHub API ${o.status}: ${e}`)}return{blob:await o.blob(),filename:a.split(`/`).pop()}}async function g(e,t,r,i,a,o){await n(e,t,`/repos/${r}/${i}/contents/${a}`,{method:`DELETE`,body:JSON.stringify({message:`notehub: remove ${a.split(`/`).pop()}`,sha:o})})}async function ee(e,t,r,i){try{await n(e,t,`/repos/${r}/${i}/labels`,{method:`POST`,body:JSON.stringify({name:`notehub`,color:`1d76db`,description:`notehub note`})})}catch{}}var _=`_app_debug_logs`,v=1e3;function te(){try{let e=localStorage.getItem(_);return e?JSON.parse(e):[]}catch{return[]}}function ne(e){try{let t=e.slice(-v);localStorage.setItem(_,JSON.stringify(t))}catch{}}function re(e,t){let n={timestamp:new Date().toISOString(),level:e,message:t},r=te();r.push(n),ne(r),console[e===`warn`?`warn`:e===`error`?`error`:`log`](`[${e.toUpperCase()}] ${t}`)}function ie(e){re(`error`,e)}function ae(e){re(`info`,e)}function oe(){let e=te();return e.length===0?`(no logs)`:e.map(e=>`[${new Date(e.timestamp).toLocaleTimeString()}] ${e.level.toUpperCase()}: ${e.message}`).join(`
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
  `,s.addEventListener(`click`,()=>{i.value=oe(),i.scrollTop=i.scrollHeight}),a.appendChild(s),t.appendChild(n),t.appendChild(i),t.appendChild(a),e.appendChild(t),e.addEventListener(`click`,t=>{t.target===e&&e.remove()}),e}var le=`modulepreload`,ue=function(e){return`/notehub.web/`+e},de={},fe=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=ue(t,n),t in de)return;de[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:le,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},y=`notehub:token`,b=window.matchMedia(`(pointer: coarse)`).matches,x=`https://stabledog.github.io/veditor.web`,S,C=`notehub:host`,pe=`notehub:defaultRepo`,w=`notehub:pinnedIssue`,me=`🎫 New note`,he=`# New note`;function T(){return localStorage.getItem(pe)}function ge(){let e=localStorage.getItem(w);if(!e)return null;try{let t=JSON.parse(e);if(t.owner&&t.repo&&typeof t.number==`number`)return t}catch{}return null}function _e(){return T()!==null}function E(){let e=T();return e?u(e):null}async function ve(){if(!D)return null;let e=E();return e?await i(D.host,D.token,e.owner,e.repo)?e:(q(`Attachments repo "${e.owner}/${e.repo}" not found. Create it on GitHub to use attachments.`,!0),null):(q(`No default repo configured — cannot use attachments.`,!0),null)}var D=null,O=null,k=null,A=``,j=``,M=null,N=null,P=null,F=[],I=0,L=new Set,R=document.getElementById(`app`);async function ye(){if(!b){let e=document.createElement(`link`);e.rel=`stylesheet`,e.href=`${x}/veditor.css`,document.head.appendChild(e);try{S=await fe(()=>import(`${x}/veditor.js`),[]);let e=document.getElementById(`version-badge`);e&&S.VERSION&&(e.textContent+=` \u00b7 ve${S.VERSION}`)}catch(e){R.innerHTML=`<div class="auth-screen"><h1>notehub</h1><p class="error">Failed to load editor from ${x}/veditor.js: ${e instanceof Error?e.message:e}</p></div>`;return}}let e=localStorage.getItem(y),t=localStorage.getItem(C)??`github.com`;e?r(t,e).then(n=>{D={host:t,token:e,username:n.login},_e()?H():B()}).catch(()=>z()):z()}function z(e){P?.destroy(),P=null,S?.destroyEditor();let t=localStorage.getItem(C)??`github.com`;R.innerHTML=`
    <div class="auth-screen">
      <h1>notehub</h1>
      <p>GitHub Issues as notes, with vi keybindings.</p>
      ${e?`<div class="error">${e}</div>`:``}
      <form id="auth-form">
        <label>GitHub Host
          <input type="text" id="host" value="${t}" required />
        </label>
        <label>Personal Access Token
          <input type="password" id="pat" placeholder="ghp_..." required />
        </label>
        <button type="submit">Connect</button>
      </form>
    </div>
  `,document.getElementById(`auth-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`host`).value.trim(),n=document.getElementById(`pat`).value.trim();try{let e=await r(t,n);localStorage.setItem(C,t),localStorage.setItem(y,n),D={host:t,token:n,username:e.login},_e()?H():B()}catch(e){z(`Authentication failed: ${e instanceof Error?e.message:e}`)}})}function B(e){if(P?.destroy(),P=null,S?.destroyEditor(),!D)return;let t=`${D.username}/notehub.default`,n=u(t);R.innerHTML=`
    <div class="auth-screen">
      <h1>notehub</h1>
      <p>Welcome, @${D.username}! Configure your default repository for new notes.</p>
      ${e?`<div class="error">${e}</div>`:``}
      <form id="setup-form">
        <label>Default Repository
          <input type="text" id="setup-repo" value="${t}" placeholder="owner/repo" required />
        </label>
        <label>Pinned Issue Number <span style="color:#6c7086">(optional)</span>
          <input type="number" id="setup-pinned" placeholder="e.g. 7" min="1" />
        </label>
        <p id="attach-hint" style="color:#6c7086;font-size:0.8125rem;margin:0.5rem 0 0">To use file attachments, create a repo named <code>${n.owner}/${n.repo}</code></p>
        <button type="submit">Save &amp; Continue</button>
      </form>
    </div>
  `,document.getElementById(`setup-repo`).addEventListener(`input`,()=>{let e=document.getElementById(`setup-repo`).value.trim(),t=document.getElementById(`attach-hint`);if(!t)return;let n=e.split(`/`);if(n.length===2&&n[0]&&n[1]){let n=u(e);t.innerHTML=`To use file attachments, create a repo named <code>${n.owner}/${n.repo}</code>`}}),document.getElementById(`setup-form`).addEventListener(`submit`,e=>{e.preventDefault();let t=document.getElementById(`setup-repo`).value.trim(),n=document.getElementById(`setup-pinned`).value.trim(),r=t.split(`/`);if(r.length!==2||!r[0]||!r[1]){B(`Repository must be in owner/repo format.`);return}if(localStorage.setItem(pe,t),n){let e=parseInt(n,10);if(isNaN(e)||e<1){B(`Pinned issue must be a positive number.`);return}localStorage.setItem(w,JSON.stringify({owner:r[0],repo:r[1],number:e}))}else localStorage.removeItem(w);H()})}var V=null;async function H(){if(P?.destroy(),P=null,S?.destroyEditor(),V?.(),V=null,O=null,!D)return;let e=[];R.innerHTML=`
    <div class="note-list-screen">
      <header>
        <h1>notehub</h1>
        <div class="header-info">
          <span>@${D.username}</span>
          <button id="logs-btn" title="View debug logs">Logs</button>
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
  `;let t=document.getElementById(`notes-container`),n=0;function r(){let e=t.querySelectorAll(`.note-row`);e.forEach((e,t)=>{e.classList.toggle(`selected`,t===n)}),e[n]?.scrollIntoView({block:`nearest`})}let i=e=>{if(!(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)&&!c&&!document.getElementById(`repo-picker-overlay`))if(e.key===`n`)e.preventDefault(),document.getElementById(`new-note`).click();else if(e.key===`r`)e.preventDefault(),H();else if(e.key===`j`||e.key===`ArrowDown`){e.preventDefault();let i=t.querySelectorAll(`.note-row`);i.length>0&&(n=Math.min(n+1,i.length-1),r())}else if(e.key===`k`||e.key===`ArrowUp`)e.preventDefault(),n>0&&(n--,r());else if(e.key===`Enter`){e.preventDefault();let r=t.querySelectorAll(`.note-row`);r.length>0&&r[n].click()}else e.key===`Escape`&&s?(e.preventDefault(),h()):e.key===`/`&&(e.preventDefault(),p())};document.addEventListener(`keydown`,i),V=()=>document.removeEventListener(`keydown`,i);let o=null,s=!1,c=!1,u=!1,d=null,f=``;function p(){if(s)return;s=!0,c=!0,f=t.innerHTML;let e=document.createElement(`div`);e.className=`search-bar`,e.id=`search-bar`,e.innerHTML=`
      <span class="search-slash">/</span>
      <div id="search-input-container"></div>
      <button id="search-regex-toggle" class="search-regex-toggle" title="Toggle regex (Ctrl+R)">.*</button>
      <span id="search-count" class="search-count"></span>
    `,t.parentElement.insertBefore(e,t),e.addEventListener(`focusin`,()=>{c=!0}),e.addEventListener(`focusout`,()=>{c=!1}),o=S.createVimInput(document.getElementById(`search-input-container`),{placeholder:`Search notes...`,initialInsert:!0,onEscape:h,onChange:e=>{d&&clearTimeout(d),d=setTimeout(()=>g(e),150)},onEnter:()=>{document.activeElement?.blur()},storagePrefix:`notehub`}),o.focus(),m(),document.getElementById(`search-regex-toggle`).addEventListener(`click`,()=>{u=!u,m(),o&&g(o.getValue())}),e.addEventListener(`keydown`,e=>{e.key===`r`&&e.ctrlKey&&(e.preventDefault(),u=!u,m(),o&&g(o.getValue()))})}function m(){let e=document.getElementById(`search-regex-toggle`);e&&e.classList.toggle(`active`,u)}function h(){s&&(s=!1,c=!1,d&&=(clearTimeout(d),null),o?.destroy(),o=null,document.getElementById(`search-bar`)?.remove(),f&&(t.innerHTML=f,f=``,v()),n=0,r())}function g(i){let a=document.getElementById(`search-count`);if(!i.trim()){f&&(t.innerHTML=f,v()),a&&(a.textContent=``),n=0,r();return}let o=ee(i,u,e);a&&(a.textContent=`${o.length} match${o.length===1?``:`es`}`),_(o)}function ee(e,t,n){let r;if(t){let t;try{t=new RegExp(e,`gi`)}catch{let e=document.getElementById(`search-count`);return e&&(e.textContent=`invalid regex`,e.classList.add(`error`)),[]}let n=document.getElementById(`search-count`);n&&n.classList.remove(`error`),r=e=>{t.lastIndex=0;let n=t.exec(e);return n?{index:n.index,length:n[0].length}:null}}else{let t=e.toLowerCase();r=e=>{let n=e.toLowerCase().indexOf(t);return n>=0?{index:n,length:t.length}:null}}let i=[];for(let e=0;e<n.length;e++){let t=n[e],a=t.body??``,o=r(t.title),s=r(a);if(!o&&!s)continue;let c=s??o,l=s?a:t.title,u=Math.max(0,c.index-40),d=Math.min(l.length,c.index+c.length+40),f=J(l.slice(u,c.index)),p=J(l.slice(c.index,c.index+c.length)),m=J(l.slice(c.index+c.length,d)),h=`${u>0?`...`:``}${f}<mark>${p}</mark>${m}${d<l.length?`...`:``}`;i.push({note:t,index:e,context:h})}return i}function _(i){if(i.length===0){t.innerHTML=`<p class="empty">No matches found.</p>`;return}t.innerHTML=`
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
    `,n=0,r(),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,()=>{let n=parseInt(t.getAttribute(`data-index`),10),r=e[n];b?window.open(X(D.host,r.owner,r.repo,r.number)+`#new_comment_field`,`_blank`):U(r.owner,r.repo,r.number)})})}function v(){t.querySelectorAll(`.copy-url-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.dataset.url;navigator.clipboard.writeText(n).then(()=>{e.innerHTML=Re,setTimeout(()=>{e.innerHTML=Y},1500)})})}),t.querySelectorAll(`.context-menu-btn`).forEach(n=>{n.addEventListener(`click`,r=>{r.stopPropagation(),document.querySelector(`.note-context-menu`)?.remove();let i=parseInt(n.dataset.index,10),a=e[i],o=n.getBoundingClientRect(),s=document.createElement(`div`);s.className=`note-context-menu`,s.innerHTML=`
          <button class="context-github-btn">${Be} Edit on GitHub</button>
          <button class="context-delete-btn">${ze} Delete</button>
        `,s.style.top=`${o.bottom+4}px`,s.style.left=`${o.right}px`,document.body.appendChild(s);let c=()=>{s.remove(),document.removeEventListener(`click`,c)};setTimeout(()=>document.addEventListener(`click`,c),0),s.querySelector(`.context-github-btn`).addEventListener(`click`,e=>{e.stopPropagation(),c(),window.open(X(D.host,a.owner,a.repo,a.number)+`#new_comment_field`,`_blank`)}),s.querySelector(`.context-delete-btn`).addEventListener(`click`,async e=>{e.stopPropagation(),c();try{await l(D.host,D.token,a.owner,a.repo,a.number),t.querySelector(`.note-row[data-index="${i}"]`)?.remove()}catch(e){alert(`Failed to delete note: ${e instanceof Error?e.message:e}`)}})})}),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,()=>{let n=parseInt(t.getAttribute(`data-index`),10),r=e[n];b?window.open(X(D.host,r.owner,r.repo,r.number)+`#new_comment_field`,`_blank`):U(r.owner,r.repo,r.number)})})}document.getElementById(`sign-out`).addEventListener(`click`,()=>{localStorage.removeItem(y),localStorage.removeItem(C),D=null,z()}),document.getElementById(`refresh`).addEventListener(`click`,()=>H()),document.getElementById(`logs-btn`).addEventListener(`click`,()=>{document.body.appendChild(ce())});try{if(e=await a(D.host,D.token),N){let t=N;N=null,e.some(e=>e.owner===t.owner&&e.repo===t.repo&&e.number===t.number)||e.unshift(t)}let n=ge();if(n){let t=e=>e.owner===n.owner&&e.repo===n.repo&&e.number===n.number;e.sort((e,n)=>t(e)?-1:+!!t(n))}if(document.getElementById(`new-note`).addEventListener(`click`,()=>{xe(e)}),e.length===0){t.innerHTML=`<p class="empty">No notes found.</p>`;return}t.innerHTML=`
      <table>
        <thead><tr><th>Title</th><th>#</th><th></th><th>Updated</th><th></th><th>Repo</th></tr></thead>
        <tbody>
          ${e.map((e,t)=>`
            <tr class="note-row" data-index="${t}">
              <td>${J(e.title)}<span class="attachment-count-badge" data-owner="${Q(e.owner)}" data-repo="${Q(e.repo)}" data-issue="${e.number}"></span></td>
              <td><a href="${Q(X(D.host,e.owner,e.repo,e.number))}" target="${Z(X(D.host,e.owner,e.repo,e.number))}" class="issue-link" onclick="event.stopPropagation()">${e.number}</a></td>
              <td><button class="copy-url-btn" data-url="${Q(X(D.host,e.owner,e.repo,e.number))}" title="Copy issue URL">${Y}</button></td>
              <td>${new Date(e.updated_at).toLocaleDateString(`en-US`,{month:`numeric`,day:`numeric`,year:`2-digit`})}</td>
              <td><button class="context-menu-btn" data-index="${t}" title="More actions">&#x2026;</button></td>
              <td><span title="${Q(e.owner)}/${Q(e.repo)}">${J(e.repo)}</span></td>
            </tr>
          `).join(``)}
        </tbody>
      </table>
    `,t.querySelectorAll(`.copy-url-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.dataset.url;navigator.clipboard.writeText(n).then(()=>{e.innerHTML=Re,setTimeout(()=>{e.innerHTML=Y},1500)})})}),t.querySelectorAll(`.context-menu-btn`).forEach(n=>{n.addEventListener(`click`,r=>{r.stopPropagation(),document.querySelector(`.note-context-menu`)?.remove();let i=parseInt(n.dataset.index,10),a=e[i],o=n.getBoundingClientRect(),s=document.createElement(`div`);s.className=`note-context-menu`,s.innerHTML=`
          <button class="context-github-btn">${Be} Edit on GitHub</button>
          <button class="context-delete-btn">${ze} Delete</button>
        `,s.style.top=`${o.bottom+4}px`,s.style.left=`${o.right}px`,document.body.appendChild(s);let c=()=>{s.remove(),document.removeEventListener(`click`,c)};setTimeout(()=>document.addEventListener(`click`,c),0),s.querySelector(`.context-github-btn`).addEventListener(`click`,e=>{e.stopPropagation(),c(),window.open(X(D.host,a.owner,a.repo,a.number)+`#new_comment_field`,`_blank`)}),s.querySelector(`.context-delete-btn`).addEventListener(`click`,async e=>{e.stopPropagation(),c();try{await l(D.host,D.token,a.owner,a.repo,a.number),t.querySelector(`.note-row[data-index="${i}"]`)?.remove()}catch(e){alert(`Failed to delete note: ${e instanceof Error?e.message:e}`)}})})}),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,()=>{let n=parseInt(t.getAttribute(`data-index`),10),r=e[n];b?window.open(X(D.host,r.owner,r.repo,r.number)+`#new_comment_field`,`_blank`):U(r.owner,r.repo,r.number)})}),r(),be(e).catch(()=>{})}catch(e){document.getElementById(`notes-container`).innerHTML=`<p class="error">Failed to load notes: ${e instanceof Error?e.message:e}</p>`}}async function be(e){if(!D)return;let t=E();if(!t)return;let n=await f(D.host,D.token,t.owner,t.repo);document.querySelectorAll(`.attachment-count-badge`).forEach(e=>{let t=`${e.dataset.owner}/${e.dataset.repo}/${e.dataset.issue}`,r=n.get(t);r&&(e.textContent=` 📎${r}`)})}function xe(e){document.getElementById(`repo-picker-overlay`)?.remove();let t=new Map,n=T();if(n){let[e,r]=n.split(`/`);t.set(n,{owner:e,repo:r})}for(let n of e){let e=`${n.owner}/${n.repo}`;t.has(e)||t.set(e,{owner:n.owner,repo:n.repo})}let r=Array.from(t.entries()).sort((e,t)=>{if(n){if(e[0]===n)return-1;if(t[0]===n)return 1}return e[0].localeCompare(t[0])}),i=document.createElement(`div`);i.id=`repo-picker-overlay`,i.innerHTML=`
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
  `,R.appendChild(i),i.addEventListener(`click`,e=>{e.target===i&&i.remove()});let a=e=>{e.key===`Escape`&&(i.remove(),document.removeEventListener(`keydown`,a))};document.addEventListener(`keydown`,a),i.querySelectorAll(`.repo-option`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.owner,n=e.dataset.repo;i.remove(),document.removeEventListener(`keydown`,a),Se(t,n)})});let o=document.getElementById(`repo-other-go`),s=document.getElementById(`repo-other-input`),c=()=>{let e=s.value.trim().split(`/`);if(e.length!==2||!e[0]||!e[1]){s.classList.add(`error`);return}i.remove(),document.removeEventListener(`keydown`,a),Se(e[0],e[1])};o.addEventListener(`click`,c),s.addEventListener(`keydown`,e=>{e.key===`Enter`&&c()})}async function Se(e,t){if(b){window.open(`https://${D.host}/${e}/${t}/issues/new`,`_blank`);return}if(D){if(!await i(D.host,D.token,e,t)){alert(`Repository "${e}/${t}" not found. Check the owner and repo name.`);return}k={owner:e,repo:t},O=null,A=he,j=me,M=null,Ce(me,he)}}async function U(e,t,n){if(D){R.innerHTML=`<div class="editor-screen"><p>Loading note #${n}...</p></div>`;try{let r=await o(D.host,D.token,e,t,n);O={...r,owner:e,repo:t},A=r.body??``,j=r.title,M=r.updated_at,Ce(r.title,A)}catch(e){R.innerHTML=`<div class="editor-screen"><p class="error">Failed to load note: ${e instanceof Error?e.message:e}</p></div>`}}}function Ce(e,t){V?.(),V=null,R.innerHTML=`
    <div class="editor-screen">
      <header>
        <button id="back-to-list" title="Back to notes">&larr;</button>
        <div id="note-title-container"></div>
        <span id="note-number">${O?`<a href="${Q(X(D.host,O.owner,O.repo,O.number))}" target="${Z(X(D.host,O.owner,O.repo,O.number))}" class="issue-link">#${O.number}</a>`:`Title`}</span>
        ${O?`<button id="copy-note-url" class="copy-url-btn" title="Copy issue URL">${Y}</button>`:``}
        ${O?`<button id="attachment-toggle-btn" class="attachment-toggle-btn" title="Attachments (ga)">${Le}</button>`:``}
        ${O?`<button id="delete-note-btn" class="delete-note-btn" title="Delete note">${ze}</button>`:``}
        <span id="status-msg"></span>
      </header>
      <div id="editor-container"></div>
    </div>
  `,document.getElementById(`back-to-list`).addEventListener(`click`,()=>{S.requestQuit()});let n=document.getElementById(`copy-note-url`);if(n&&O){let e=X(D.host,O.owner,O.repo,O.number);n.addEventListener(`click`,()=>{navigator.clipboard.writeText(e).then(()=>{n.innerHTML=Re,setTimeout(()=>{n.innerHTML=Y},1500)})})}if(document.getElementById(`attachment-toggle-btn`)?.addEventListener(`click`,()=>De()),document.getElementById(`delete-note-btn`)?.addEventListener(`click`,()=>Te()),P=S.createVimInput(document.getElementById(`note-title-container`),{value:e,onEnter:()=>S.focusEditor(),onEscape:()=>S.focusEditor(),storagePrefix:`notehub`}),S.createEditor(document.getElementById(`editor-container`),t,{onSave:we,onQuit:()=>H(),isAppDirty:()=>P.getValue().trim()!==j},{storagePrefix:`notehub`,normalMappings:{gt:()=>P.focus(),ga:()=>De()}}),O){let e=O,t=E();t&&p(D.host,D.token,t.owner,t.repo,e.owner,e.repo,e.number).then(e=>{e.length>0&&document.querySelector(`.editor-screen`)&&Oe()}).catch(()=>{})}}async function we(){if(!D)return;let e=S.getEditorContent(),t=(P?.getValue()??``).trim();if(!O&&k){if(!t){q(`Title required`,!0);return}try{q(`Creating...`);let n=await c(D.host,D.token,k.owner,k.repo,t,e);O={...n,owner:k.owner,repo:k.repo},N=O,k=null,A=n.body??``,j=n.title,M=n.updated_at;let r=document.getElementById(`note-number`);r&&(r.innerHTML=`<a href="${Q(X(D.host,O.owner,O.repo,O.number))}" target="${Z(X(D.host,O.owner,O.repo,O.number))}" class="issue-link">#${O.number}</a>`),q(`Created`)}catch(e){q(`Create failed: ${e instanceof Error?e.message:e}`,!0)}return}if(!O)return;let n={};if(e!==A&&(n.body=e),t!==j&&(n.title=t),Object.keys(n).length===0){q(`No changes`);return}try{q(`Saving...`);let e=await o(D.host,D.token,O.owner,O.repo,O.number);if(M&&e.updated_at!==M&&!await Ee()){q(`Save cancelled`);return}let t=await s(D.host,D.token,O.owner,O.repo,O.number,n);A=t.body??``,j=t.title,M=t.updated_at,O={...t,owner:O.owner,repo:O.repo},q(`Saved`)}catch(e){q(`Save failed: ${e instanceof Error?e.message:e}`,!0)}}async function Te(){if(!(!D||!O)&&confirm(`Delete note "#${O.number}: ${j}"?`))try{if(q(`Deleting...`),(await l(D.host,D.token,O.owner,O.repo,O.number)).state!==`closed`){let e=`Delete failed: note was not closed`;q(e,!0),ie(e);return}ae(`Deleted note #${O.number}: ${j}`),q(`Deleted`),setTimeout(()=>{H()},500)}catch(e){let t=`Delete failed: ${e instanceof Error?e.message:e}`;q(t,!0),ie(t)}}function Ee(){return new Promise(e=>{let t=document.createElement(`div`);t.id=`conflict-overlay`,t.innerHTML=`
      <div class="conflict-dialog">
        <h3>Note changed</h3>
        <p>This note has been modified since you opened it. Saving will overwrite those changes.</p>
        <div class="conflict-actions">
          <button id="conflict-cancel">Cancel</button>
          <button id="conflict-overwrite" class="danger">Overwrite</button>
        </div>
      </div>
    `,document.body.appendChild(t);let n=n=>{t.remove(),document.removeEventListener(`keydown`,r),e(n)};function r(e){e.key===`Escape`&&n(!1)}t.querySelector(`#conflict-cancel`).addEventListener(`click`,()=>n(!1)),t.querySelector(`#conflict-overwrite`).addEventListener(`click`,()=>n(!0)),t.addEventListener(`click`,e=>{e.target===t&&n(!1)}),document.addEventListener(`keydown`,r)})}function De(){document.getElementById(`attachment-panel`)?W():Oe()}function W(){document.getElementById(`attachment-panel`)?.remove(),F=[],I=0,L.clear(),S?.focusEditor()}async function Oe(){if(!O||!D)return;let e=document.querySelector(`.editor-screen`);if(!e)return;let t=E(),n=t&&D&&O?`https://${D.host}/${t.owner}/${t.repo}/tree/main/${O.owner}/${O.repo}/${O.number}`:``,r=document.createElement(`div`);r.id=`attachment-panel`,r.className=`attachment-panel`,r.tabIndex=0,r.innerHTML=`
    <div class="attachment-panel-header">
      <span class="attachment-panel-title">
        ${Le} Attachments
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
  `,e.appendChild(r),r.focus(),document.getElementById(`attachment-close-btn`).addEventListener(`click`,e=>{e.stopPropagation(),W()}),r.querySelectorAll(`.footer-action[data-action]`).forEach(e=>{let t=e.dataset.action;t!==`navigate`&&(e.style.cursor=`pointer`,e.addEventListener(`click`,async e=>{e.stopPropagation(),t===`select`?Pe():t===`upload`?await je():t===`download`?await Ne():t===`preview`?await K():t===`delete`?await Fe():t===`close`&&W(),r.focus()}))}),r.addEventListener(`keydown`,async e=>{e.key===`Escape`?(e.preventDefault(),W()):e.key===`j`||e.key===`ArrowDown`?(e.preventDefault(),Ae(1)):e.key===`k`||e.key===`ArrowUp`?(e.preventDefault(),Ae(-1)):e.key===`a`?(e.preventDefault(),await je()):e.key===`Enter`||e.key===`d`?(e.preventDefault(),await Ne()):e.key===`p`?(e.preventDefault(),await K()):e.key===` `?(e.preventDefault(),Pe()):e.key===`x`&&(e.preventDefault(),await Fe())}),await ke()}async function ke(){if(!O||!D)return;let e=document.getElementById(`attachment-list`);if(!e)return;let t=await ve();if(!t){e.innerHTML=`<p class="attachment-error">Attachments repo not available.</p>`;return}try{F=await p(D.host,D.token,t.owner,t.repo,O.owner,O.repo,O.number)}catch(t){e.innerHTML=`<p class="attachment-error">Failed to load: ${t instanceof Error?t.message:t}</p>`;return}I=0,G(e)}function G(e){if(F.length===0){e.innerHTML=`<p class="attachment-empty">No attachments yet. Press <kbd>a</kbd> to upload.</p>`;return}e.innerHTML=F.map((e,t)=>{let n=t===I,r=L.has(t);return`
    <div class="${[`attachment-row`,n?`selected`:``,r?`multi-selected`:``].filter(Boolean).join(` `)}" data-index="${t}">
      <span class="attachment-checkbox">${r?`☑`:`☐`}</span>
      <span class="attachment-name" title="Click to preview, Ctrl+click to download">${J(e.name)}</span>
      <span class="attachment-size">${Ie(e.size)}</span>
    </div>`}).join(``);let t=!1,n=document.getElementById(`attachment-panel`);e.addEventListener(`mousedown`,()=>{t=n===document.activeElement}),e.querySelectorAll(`.attachment-row`).forEach(r=>{let i=parseInt(r.dataset.index,10);r.querySelector(`.attachment-checkbox`)?.addEventListener(`click`,r=>{if(r.stopPropagation(),!t){n?.focus();return}I=i,L.has(i)?L.delete(i):L.add(i),G(e),n?.focus()}),r.querySelector(`.attachment-name`)?.addEventListener(`click`,async r=>{if(r.stopPropagation(),!t){n?.focus();return}I=i,G(e),r.ctrlKey||r.metaKey?await Me(i):await K(),n?.focus()}),r.addEventListener(`click`,()=>{if(!t){n?.focus();return}I=i,G(e),n?.focus()})}),e.querySelector(`.attachment-row.selected`)?.scrollIntoView({block:`nearest`})}function Ae(e){if(F.length===0)return;I=Math.max(0,Math.min(F.length-1,I+e));let t=document.getElementById(`attachment-list`);t&&G(t)}async function je(){if(!O||!D)return;let e=await ve();if(!e)return;let t=document.createElement(`input`);t.type=`file`,t.multiple=!0,t.onchange=async()=>{let n=Array.from(t.files||[]);if(n.length===0)return;let r={};try{let t=await p(D.host,D.token,e.owner,e.repo,O.owner,O.repo,O.number);r=Object.fromEntries(t.map(e=>[e.name,e.sha]))}catch{}let i=[],a=[];for(let t of n)try{q(`Uploading ${i.length+1}/${n.length}...`);let a=await t.arrayBuffer(),o=new Uint8Array(a),s=8192,c=``;for(let e=0;e<o.length;e+=s)c+=String.fromCharCode(...o.subarray(e,e+s));let l=btoa(c),u=await m(D.host,D.token,e.owner,e.repo,O.owner,O.repo,O.number,t.name,l,r[t.name]),f=d(D.host,e.owner,e.repo,`${O.owner}/${O.repo}/${O.number}/${t.name}`);i.push(`[${t.name}](${f})`);let p=F.findIndex(e=>e.name===t.name);p>=0?F[p]=u:F.push(u)}catch{a.push(t.name)}let o=document.getElementById(`attachment-list`);if(o&&G(o),i.length>0){navigator.clipboard.writeText(i.join(`
`));let e=i.length===1?`Uploaded — link copied`:`Uploaded ${i.length} files — links copied`;q(a.length>0?`${e} (${a.length} failed)`:e)}else q(`Upload failed: ${a.join(`, `)}`,!0);document.getElementById(`attachment-panel`)?.focus()},t.click()}async function Me(e){let t=F[e];if(!t||!O||!D)return;let n=E();if(n)try{q(`Downloading...`);let{blob:e,filename:r}=await h(D.host,D.token,n.owner,n.repo,t.path),i=URL.createObjectURL(e),a=document.createElement(`a`);a.href=i,a.download=r,a.click(),setTimeout(()=>URL.revokeObjectURL(i),100),q(``)}catch(e){q(`Download failed: ${e instanceof Error?e.message:e}`,!0)}}async function Ne(){await Me(I)}async function K(){let e=F[I];if(!e||!O||!D)return;let t=E();if(t)try{q(`Loading preview...`);let{blob:n}=await h(D.host,D.token,t.owner,t.repo,e.path),r=e.name.split(`.`).pop()?.toLowerCase()??``,i={jpg:`image/jpeg`,jpeg:`image/jpeg`,png:`image/png`,gif:`image/gif`,webp:`image/webp`,svg:`image/svg+xml`,bmp:`image/bmp`,pdf:`application/pdf`,txt:`text/plain`,md:`text/plain`,json:`application/json`,csv:`text/csv`,html:`text/html`},a=i[r]?new Blob([n],{type:i[r]}):n,o=URL.createObjectURL(a);window.open(o,`_blank`),setTimeout(()=>URL.revokeObjectURL(o),6e4),q(``)}catch(e){q(`Preview failed: ${e instanceof Error?e.message:e}`,!0)}}function Pe(){if(F.length===0)return;L.has(I)?L.delete(I):L.add(I);let e=document.getElementById(`attachment-list`);e&&G(e)}async function Fe(){if(!O||!D)return;let e=E();if(!e)return;let t=L.size>0?[...L].sort((e,t)=>t-e):[I],n=t.map(e=>F[e]?.name).filter(Boolean);if(n.length===0)return;let r=n.length===1?`Delete "${n[0]}"?`:`Delete ${n.length} attachments?\n${n.join(`
`)}`;if(!confirm(r)){document.getElementById(`attachment-panel`)?.focus();return}try{q(`Deleting ${n.length===1?``:n.length+` `}...`);for(let n of t){let t=F[n];t&&await g(D.host,D.token,e.owner,e.repo,t.path,t.sha)}q(n.length===1?`Deleted`:`Deleted ${n.length} attachments`);for(let e of t)F.splice(e,1);L.clear(),I=Math.min(I,Math.max(0,F.length-1));let r=document.getElementById(`attachment-list`);r&&G(r),document.getElementById(`attachment-panel`)?.focus()}catch(e){q(`Delete failed: ${e instanceof Error?e.message:e}`,!0),document.getElementById(`attachment-panel`)?.focus()}}function Ie(e){return e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(1)} MB`}function q(e,t=!1){let n=document.getElementById(`status-msg`);n&&(n.textContent=e,n.className=t?`error`:`success`,t||setTimeout(()=>{n.textContent===e&&(n.textContent=``)},2e3))}function J(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}var Y=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,Le=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,Re=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,ze=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,Be=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;function X(e,t,n,r){return`https://${e}/${t}/${n}/issues/${r}`}function Z(e){return S?S.hashTarget(e):`_blank`}function Q(e){return e.replace(/&/g,`&amp;`).replace(/"/g,`&quot;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}var Ve=`0.2.0`,$=document.createElement(`span`);$.className=`version-badge`,$.id=`version-badge`,$.textContent=`v${Ve}`,document.body.appendChild($),ye();
//# sourceMappingURL=index-lUUWEpog.js.map