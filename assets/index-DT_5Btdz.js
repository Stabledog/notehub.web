(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e){return e===`github.com`?`https://api.github.com`:`https://${e}/api/v3`}function t(e){return{Authorization:`Bearer ${e}`,Accept:`application/vnd.github+json`,"Content-Type":`application/json`}}async function n(n,r,i,a){let o;for(let s=0;s<3;s++)try{let o=await fetch(`${e(n)}${i}`,{...a,headers:{...t(r),...a?.headers}}),s=await o.text();if(!o.ok)throw Error(`GitHub API ${o.status}: ${s}`);return JSON.parse(s.replace(/\r\n/g,`
`))}catch(e){if(o=e instanceof Error?e:Error(String(e)),o.message.startsWith(`GitHub API `))throw o;s<2&&await new Promise(e=>setTimeout(e,500*(s+1)))}throw o}function r(e,t){return n(e,t,`/user`)}async function i(e,t,r,i){try{return await n(e,t,`/repos/${r}/${i}`),!0}catch{return!1}}async function a(e,t){return(await n(e,t,`/search/issues?q=is%3Aissue%20label%3Anotehub%20state%3Aopen&sort=updated&order=desc&per_page=100`)).items.map(e=>{let t=e.repository_url.split(`/`),n=t.pop(),r=t.pop();return{...e,owner:r,repo:n}})}function o(e,t,r,i,a){return n(e,t,`/repos/${r}/${i}/issues/${a}`)}function s(e,t,r,i,a,o){return n(e,t,`/repos/${r}/${i}/issues/${a}`,{method:`PATCH`,body:JSON.stringify(o)})}async function c(e,t,r,i,a,o){return await g(e,t,r,i),n(e,t,`/repos/${r}/${i}/issues`,{method:`POST`,body:JSON.stringify({title:a,body:o,labels:[`notehub`]})})}function l(e,t,r,i,a){return n(e,t,`/repos/${r}/${i}/issues/${a}`,{method:`PATCH`,body:JSON.stringify({state:`closed`})})}function u(e){let[t,n]=e.split(`/`);return{owner:t,repo:`${n}.attachments`}}async function d(e,t,r,i){let a=new Map;try{let o=await n(e,t,`/repos/${r}/${i}/git/trees/main?recursive=1`);for(let e of o.tree){if(e.type!==`blob`)continue;let t=e.path.split(`/`);if(t.length<4)continue;let n=`${t[0]}/${t[1]}/${t[2]}`;a.set(n,(a.get(n)??0)+1)}}catch{}return a}async function f(e,t,r,i,a,o,s){try{return await n(e,t,`/repos/${r}/${i}/contents/${a}/${o}/${s}`)}catch(e){if(e instanceof Error&&e.message.includes(`404`))return[];throw e}}async function p(e,t,r,i,a,o,s,c,l,u){let d={message:`notehub: attach ${c} to ${a}/${o}#${s}`,content:l};return u&&(d.sha=u),(await n(e,t,`/repos/${r}/${i}/contents/${a}/${o}/${s}/${encodeURIComponent(c)}`,{method:`PUT`,body:JSON.stringify(d)})).content}async function m(t,n,r,i,a){let o=await fetch(`${e(t)}/repos/${r}/${i}/contents/${a}`,{headers:{Authorization:`Bearer ${n}`,Accept:`application/vnd.github.raw`}});if(!o.ok){let e=await o.text();throw Error(`GitHub API ${o.status}: ${e}`)}return{blob:await o.blob(),filename:a.split(`/`).pop()}}async function h(e,t,r,i,a,o){await n(e,t,`/repos/${r}/${i}/contents/${a}`,{method:`DELETE`,body:JSON.stringify({message:`notehub: remove ${a.split(`/`).pop()}`,sha:o})})}async function g(e,t,r,i){try{await n(e,t,`/repos/${r}/${i}/labels`,{method:`POST`,body:JSON.stringify({name:`notehub`,color:`1d76db`,description:`notehub note`})})}catch{}}var _=`_app_debug_logs`;function v(){try{let e=localStorage.getItem(_);return e?JSON.parse(e):[]}catch{return[]}}function ee(e){try{let t=e.slice(-1e3);localStorage.setItem(_,JSON.stringify(t))}catch{}}function y(e,t){let n={timestamp:new Date().toISOString(),level:e,message:t},r=v();r.push(n),ee(r),console[e===`warn`?`warn`:e===`error`?`error`:`log`](`[${e.toUpperCase()}] ${t}`)}function b(e){y(`error`,e)}function te(e){y(`warn`,e)}function x(e){y(`info`,e)}function ne(){let e=v();return e.length===0?`(no logs)`:e.map(e=>`[${new Date(e.timestamp).toLocaleTimeString()}] ${e.level.toUpperCase()}: ${e.message}`).join(`
`)}function re(){try{localStorage.removeItem(_)}catch{}}function ie(){let e=document.createElement(`div`);e.id=`log-viewer-modal`,e.style.cssText=`
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
  `,r.addEventListener(`click`,()=>e.remove()),n.appendChild(r);let i=document.createElement(`textarea`);i.readOnly=!0,i.value=ne(),i.style.cssText=`
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
  `,o.addEventListener(`click`,()=>{re(),i.value=`(no logs)`}),a.appendChild(o);let s=document.createElement(`button`);return s.textContent=`Refresh`,s.style.cssText=`
    padding: 6px 12px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  `,s.addEventListener(`click`,()=>{i.value=ne(),i.scrollTop=i.scrollHeight}),a.appendChild(s),t.appendChild(n),t.appendChild(i),t.appendChild(a),e.appendChild(t),e.addEventListener(`click`,t=>{t.target===e&&e.remove()}),e}function ae(e){let t=e.replace(/^#\/?/,``);if(!t)return{screen:`list`};let n=t.split(`/`);if(n[0]===`edit`&&n.length===4){let e=parseInt(n[3],10);if(e>0&&Number.isFinite(e))return{screen:`edit`,owner:n[1],repo:n[2],number:e}}return n[0]===`new`&&n.length===3?{screen:`new`,owner:n[1],repo:n[2]}:{screen:`list`}}function S(e){switch(e.screen){case`list`:return`#/`;case`edit`:return`#/edit/${e.owner}/${e.repo}/${e.number}`;case`new`:return`#/new/${e.owner}/${e.repo}`}}function C(e){location.hash=S(e)}function w(e){let t=S(e);history.replaceState(null,``,t)}function oe(e){let t=()=>e(ae(location.hash));return window.addEventListener(`hashchange`,t),()=>window.removeEventListener(`hashchange`,t)}var se=`modulepreload`,ce=function(e){return`/notehub.web/`+e},le={},ue=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=ce(t,n),t in le)return;le[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:se,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},T=`notehub:token`,de=`https://stabledog.github.io/veditor.web`,E,D=`notehub:host`,fe=`notehub:defaultRepo`,pe=`notehub:pinnedIssue`,me=`🎫 New note`,he=`# New note`;function ge(){return localStorage.getItem(fe)}function _e(){let e=localStorage.getItem(pe);if(!e)return null;try{let t=JSON.parse(e);if(t.owner&&t.repo&&typeof t.number==`number`)return t}catch{}return null}function ve(){return ge()!==null}function O(){let e=ge();return e?u(e):null}async function ye(){if(!k)return null;let e=O();return e?await i(k.host,k.token,e.owner,e.repo)?e:(Y(`Attachments repo "${e.owner}/${e.repo}" not found. Create it on GitHub to use attachments.`,!0),null):(Y(`No default repo configured — cannot use attachments.`,!0),null)}function be(e,t,n,r){return{note:e,originalBody:t,originalTitle:n,loadedUpdatedAt:r,attachments:[],selectedAttachmentIndex:0,multiSelectedAttachments:new Set}}var k=null,A=null,j=null,M=null,N=new Map,P=null,xe=[];function F(){return P?N.get(P)??null:null}var I=[],L=0,R=new Set,Se=!1,z=null,B=null;function V(e){if(!k){W();return}switch(e.screen){case`list`:if(z===`list`)return;K();break;case`edit`:{let t=`${e.owner}/${e.repo}/${e.number}`;if(z===`edit`&&B===t)return;Oe(e.owner,e.repo,e.number);break}case`new`:De(e.owner,e.repo);break}}function H(e,t){let n={screen:`edit`,owner:e.owner,repo:e.repo,number:e.number};t.ctrlKey||t.metaKey?window.open(`${location.pathname}${S(n)}`,`_blank`):C(n)}var U=document.getElementById(`app`);async function Ce(){let e=document.createElement(`link`);e.rel=`stylesheet`;let t=`v=${Date.now()}`;e.href=`${de}/veditor.css?${t}`,document.head.appendChild(e);try{E=await ue(()=>import(`${de}/veditor.js?${t}`),[]);let e=document.getElementById(`version-badge`);e&&E.VERSION&&(e.textContent+=` \u00b7 ve${E.VERSION}`)}catch(e){b(`Failed to load editor from ${de}/veditor.js: ${e instanceof Error?e.message:e}`)}let n=localStorage.getItem(T),i=localStorage.getItem(D)??`github.com`;n&&ve()?r(i,n).then(e=>{k={host:i,token:n,username:e.login},oe(V),V(ae(location.hash))}).catch(()=>W()):W(),window.addEventListener(`message`,e=>{if(e.data?.type!==`barouse:activate`)return;Se=!0;let t=document.querySelector(`.note-row.selected`)??document.querySelector(`.note-row`);t&&(t.tabIndex=-1,t.focus())})}function W(e){M?.destroy(),M=null,E?.destroyEditor();let t=localStorage.getItem(D)??`github.com`,n=localStorage.getItem(T)??``,i=localStorage.getItem(fe)??``,a=_e(),o=k!==null;if(U.innerHTML=`
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
  `,o){let e=()=>K();document.getElementById(`settings-cancel`).addEventListener(`click`,e);let t=n=>{n.key===`Escape`&&(document.removeEventListener(`keydown`,t),e())};document.addEventListener(`keydown`,t)}document.getElementById(`settings-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`settings-host`).value.trim(),n=document.getElementById(`settings-pat`).value.trim(),i=document.getElementById(`settings-repo`).value.trim(),a=document.getElementById(`settings-pinned`).value.trim(),o=i.split(`/`);if(o.length!==2||!o[0]||!o[1]){W(`Repository must be in owner/repo format.`);return}try{x(`Settings: Validating token for host=${t}`);let e=await r(t,n);if(x(`Settings: Token validated for user ${e.login} on ${t}`),localStorage.setItem(D,t),localStorage.setItem(T,n),localStorage.setItem(fe,i),k={host:t,token:n,username:e.login},a){let e=parseInt(a,10);if(isNaN(e)||e<1){W(`Pinned issue must be a positive number.`);return}localStorage.setItem(pe,JSON.stringify({owner:o[0],repo:o[1],number:e}))}else localStorage.removeItem(pe);oe(V),V(ae(location.hash))}catch(e){b(`Settings: Token validation failed for host=${t}: ${e instanceof Error?e.message:e}`),W(`Authentication failed: ${e instanceof Error?e.message:e}`)}})}var G=null;function we(e,t,n){let r;if(t){let t;try{t=new RegExp(e,`gi`)}catch{return null}r=e=>{t.lastIndex=0;let n=t.exec(e);return n?{index:n.index,length:n[0].length}:null}}else{let t=e.toLowerCase();r=e=>{let n=e.toLowerCase().indexOf(t);return n>=0?{index:n,length:t.length}:null}}let i=[];for(let e=0;e<n.length;e++){let t=n[e],a=t.body??``,o=r(t.title),s=r(a);if(!o&&!s)continue;let c=s??o,l=s?a:t.title,u=Math.max(0,c.index-40),d=Math.min(l.length,c.index+c.length+40),f=X(l.slice(u,c.index)),p=X(l.slice(c.index,c.index+c.length)),m=X(l.slice(c.index+c.length,d)),h=`${u>0?`...`:``}${f}<mark>${p}</mark>${m}${d<l.length?`...`:``}`;i.push({note:t,index:e,context:h})}return i}async function K(){if(M?.destroy(),M=null,E?.destroyEditor(),G?.(),G=null,N.clear(),P=null,z=`list`,B=null,w({screen:`list`}),!k)return;let e=[];U.innerHTML=`
    <div class="note-list-screen">
      <header>
        <h1>notehub</h1>
        <div class="header-info">
          <span>@${k.username}</span>
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
  `;let t=document.getElementById(`notes-container`),n=0;function r(){let e=t.querySelectorAll(`.note-row`);e.forEach((e,t)=>{e.classList.toggle(`selected`,t===n)}),e[n]?.scrollIntoView({block:`nearest`})}let i=i=>{if(!(i.target instanceof HTMLInputElement||i.target instanceof HTMLTextAreaElement)&&!c&&!document.getElementById(`repo-picker-overlay`))if(i.key===`n`)i.preventDefault(),document.getElementById(`new-note`).click();else if(i.key===`r`)i.preventDefault(),K();else if(i.key===`j`||i.key===`ArrowDown`){i.preventDefault();let e=t.querySelectorAll(`.note-row`);e.length>0&&(n=Math.min(n+1,e.length-1),r())}else if(i.key===`k`||i.key===`ArrowUp`)i.preventDefault(),n>0&&(n--,r());else if(i.key===`Enter`){i.preventDefault();let r=t.querySelectorAll(`.note-row`);if(r.length>0){let t=parseInt(r[n].getAttribute(`data-index`),10),a=e[t];H(a,i)}}else i.key===`Escape`&&s?(i.preventDefault(),h()):i.key===`/`&&(i.preventDefault(),p())};document.addEventListener(`keydown`,i),G=()=>document.removeEventListener(`keydown`,i);let o=null,s=!1,c=!1,u=!1,d=null,f=``;function p(){if(s)return;s=!0,c=!0,f=t.innerHTML;let e=document.createElement(`div`);e.className=`search-bar`,e.id=`search-bar`,e.innerHTML=`
      <span class="search-slash">/</span>
      <div id="search-input-container"></div>
      <button id="search-regex-toggle" class="search-regex-toggle" title="Toggle regex (Ctrl+R)">.*</button>
      <span id="search-count" class="search-count"></span>
    `,t.parentElement.insertBefore(e,t),e.addEventListener(`focusin`,()=>{c=!0}),e.addEventListener(`focusout`,()=>{c=!1}),o=E.createVimInput(document.getElementById(`search-input-container`),{placeholder:`Search notes...`,initialInsert:!0,onEscape:h,onChange:e=>{d&&clearTimeout(d),d=setTimeout(()=>g(e),150)},onEnter:()=>{t.tabIndex=-1,t.focus()},storagePrefix:`notehub`}),o.focus(),m(),document.getElementById(`search-regex-toggle`).addEventListener(`click`,()=>{u=!u,m(),o&&g(o.getValue())}),e.addEventListener(`keydown`,e=>{e.key===`Tab`&&!e.shiftKey?(e.preventDefault(),t.tabIndex=-1,t.focus()):e.key===`r`&&e.ctrlKey&&(e.preventDefault(),u=!u,m(),o&&g(o.getValue()))})}function m(){let e=document.getElementById(`search-regex-toggle`);e&&e.classList.toggle(`active`,u)}function h(){s&&(s=!1,c=!1,d&&=(clearTimeout(d),null),o?.destroy(),o=null,document.getElementById(`search-bar`)?.remove(),t.removeAttribute(`tabindex`),f&&(t.innerHTML=f,f=``,v()),n=0,r())}function g(i){let a=document.getElementById(`search-count`);if(!i.trim()){f&&(t.innerHTML=f,v()),a&&(a.textContent=``),n=0,r();return}let o=we(i,u,e);if(o===null){a&&(a.textContent=`invalid regex`,a.classList.add(`error`));return}a&&(a.textContent=`${o.length} match${o.length===1?``:`es`}`,a.classList.remove(`error`)),_(o)}function _(i){if(i.length===0){t.innerHTML=`<p class="empty">No matches found.</p>`;return}t.innerHTML=`
      <table>
        <thead><tr><th>Title</th><th>#</th><th></th><th>Context</th><th>Updated</th><th>Repo</th></tr></thead>
        <tbody>
          ${i.map((e,t)=>`
            <tr class="note-row" data-index="${e.index}" data-result-index="${t}">
              <td>${X(e.note.title)}</td>
              <td>${e.note.number}</td>
              <td></td>
              <td class="search-context">${e.context}</td>
              <td>${new Date(e.note.updated_at).toLocaleDateString(`en-US`,{month:`numeric`,day:`numeric`,year:`2-digit`})}</td>
              <td><span title="${Q(e.note.owner)}/${Q(e.note.repo)}">${X(e.note.repo)}</span></td>
            </tr>
          `).join(``)}
        </tbody>
      </table>
    `,n=0,r(),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,n=>{let r=parseInt(t.getAttribute(`data-index`),10),i=e[r];H(i,n)})})}function v(){t.querySelectorAll(`.copy-url-btn`).forEach(t=>{t.addEventListener(`click`,n=>{n.stopPropagation();let r=parseInt(t.dataset.index,10),i=e[r];rt(t,nt(i.owner,i.repo,i.number),Z(k.host,i.owner,i.repo,i.number))})}),t.querySelectorAll(`.context-menu-btn`).forEach(n=>{n.addEventListener(`click`,r=>{r.stopPropagation(),document.querySelector(`.note-context-menu`)?.remove();let i=parseInt(n.dataset.index,10),a=e[i],o=n.getBoundingClientRect(),s=document.createElement(`div`);s.className=`note-context-menu`,s.innerHTML=`
          <button class="context-github-btn">${$e} Edit on GitHub</button>
          <button class="context-delete-btn">${Qe} Delete</button>
        `,s.style.top=`${o.bottom+4}px`,s.style.left=`${o.right}px`,document.body.appendChild(s);let c=()=>{s.remove(),document.removeEventListener(`click`,c)};setTimeout(()=>document.addEventListener(`click`,c),0),s.querySelector(`.context-github-btn`).addEventListener(`click`,e=>{e.stopPropagation(),c(),window.open(Z(k.host,a.owner,a.repo,a.number)+`#new_comment_field`,`_blank`)}),s.querySelector(`.context-delete-btn`).addEventListener(`click`,async e=>{e.stopPropagation(),c();try{await l(k.host,k.token,a.owner,a.repo,a.number),t.querySelector(`.note-row[data-index="${i}"]`)?.remove()}catch(e){alert(`Failed to delete note: ${e instanceof Error?e.message:e}`)}})})}),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,n=>{let r=parseInt(t.getAttribute(`data-index`),10),i=e[r];H(i,n)})})}document.getElementById(`settings-btn`).addEventListener(`click`,()=>W()),document.getElementById(`sign-out`).addEventListener(`click`,()=>{localStorage.removeItem(T),localStorage.removeItem(D),k=null,W()}),document.getElementById(`refresh`).addEventListener(`click`,()=>K()),document.getElementById(`logs-btn`).addEventListener(`click`,()=>{document.body.appendChild(ie())});try{if(x(`Note list: Fetching notes for all configured repos`),e=await a(k.host,k.token),xe=e,x(`Note list: Loaded ${e.length} notes`),j){let t=j;j=null,e.some(e=>e.owner===t.owner&&e.repo===t.repo&&e.number===t.number)||(te(`Note list: Search API may not have indexed newly created note yet; using cache`),e.unshift(t))}let n=_e();if(n){let t=e=>e.owner===n.owner&&e.repo===n.repo&&e.number===n.number;e.sort((e,n)=>t(e)?-1:+!!t(n))}if(document.getElementById(`new-note`).addEventListener(`click`,()=>{Ee(e)}),e.length===0){t.innerHTML=`<p class="empty">No notes found.</p>`;return}t.innerHTML=`
      <table>
        <thead><tr><th>Title</th><th>#</th><th></th><th>Updated</th><th></th><th>Repo</th></tr></thead>
        <tbody>
          ${e.map((e,t)=>`
            <tr class="note-row" data-index="${t}">
              <td>${X(e.title)}<span class="attachment-count-badge" data-owner="${Q(e.owner)}" data-repo="${Q(e.repo)}" data-issue="${e.number}"></span></td>
              <td><a href="${Q(Z(k.host,e.owner,e.repo,e.number))}" target="${it(Z(k.host,e.owner,e.repo,e.number))}" class="issue-link" onclick="event.stopPropagation()">${e.number}</a></td>
              <td><button class="copy-url-btn" data-index="${t}" title="Copy URL">${Ye}</button></td>
              <td>${new Date(e.updated_at).toLocaleDateString(`en-US`,{month:`numeric`,day:`numeric`,year:`2-digit`})}</td>
              <td><button class="context-menu-btn" data-index="${t}" title="More actions">&#x2026;</button></td>
              <td><span title="${Q(e.owner)}/${Q(e.repo)}">${X(e.repo)}</span></td>
            </tr>
          `).join(``)}
        </tbody>
      </table>
    `,t.querySelectorAll(`.copy-url-btn`).forEach(t=>{t.addEventListener(`click`,n=>{n.stopPropagation();let r=parseInt(t.dataset.index,10),i=e[r];rt(t,nt(i.owner,i.repo,i.number),Z(k.host,i.owner,i.repo,i.number))})}),t.querySelectorAll(`.context-menu-btn`).forEach(n=>{n.addEventListener(`click`,r=>{r.stopPropagation(),document.querySelector(`.note-context-menu`)?.remove();let i=parseInt(n.dataset.index,10),a=e[i],o=n.getBoundingClientRect(),s=document.createElement(`div`);s.className=`note-context-menu`,s.innerHTML=`
          <button class="context-github-btn">${$e} Edit on GitHub</button>
          <button class="context-delete-btn">${Qe} Delete</button>
        `,s.style.top=`${o.bottom+4}px`,s.style.left=`${o.right}px`,document.body.appendChild(s);let c=()=>{s.remove(),document.removeEventListener(`click`,c)};setTimeout(()=>document.addEventListener(`click`,c),0),s.querySelector(`.context-github-btn`).addEventListener(`click`,e=>{e.stopPropagation(),c(),window.open(Z(k.host,a.owner,a.repo,a.number)+`#new_comment_field`,`_blank`)}),s.querySelector(`.context-delete-btn`).addEventListener(`click`,async e=>{e.stopPropagation(),c();try{await l(k.host,k.token,a.owner,a.repo,a.number),t.querySelector(`.note-row[data-index="${i}"]`)?.remove()}catch(e){alert(`Failed to delete note: ${e instanceof Error?e.message:e}`)}})})}),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,n=>{let r=parseInt(t.getAttribute(`data-index`),10),i=e[r];H(i,n)})}),r();let i=t.querySelector(`.note-row.selected`);i&&(i.tabIndex=-1,i.focus()),Te(e).catch(()=>{})}catch(e){let t=e instanceof Error?e.message:String(e);b(`Note list: Failed to load notes: ${t}`),document.getElementById(`notes-container`).innerHTML=`<p class="error">Failed to load notes: ${t}</p>`}}async function Te(e){if(!k)return;let t=O();if(!t)return;let n=await d(k.host,k.token,t.owner,t.repo);document.querySelectorAll(`.attachment-count-badge`).forEach(e=>{let t=`${e.dataset.owner}/${e.dataset.repo}/${e.dataset.issue}`,r=n.get(t);r&&(e.textContent=` 📎${r}`)})}function Ee(e){document.getElementById(`repo-picker-overlay`)?.remove();let t=new Map,n=ge();if(n){let[e,r]=n.split(`/`);t.set(n,{owner:e,repo:r})}for(let n of e){let e=`${n.owner}/${n.repo}`;t.has(e)||t.set(e,{owner:n.owner,repo:n.repo})}let r=Array.from(t.entries()).sort((e,t)=>{if(n){if(e[0]===n)return-1;if(t[0]===n)return 1}return e[0].localeCompare(t[0])}),i=document.createElement(`div`);i.id=`repo-picker-overlay`,i.innerHTML=`
    <div class="repo-picker">
      <h2>Select repository</h2>
      <div class="repo-list">
        ${r.map(([e,t])=>`
          <button class="repo-option" data-owner="${Q(t.owner)}" data-repo="${Q(t.repo)}">${X(e)}</button>
        `).join(``)}
      </div>
      <div class="repo-other">
        <label>Other
          <input type="text" id="repo-other-input" placeholder="owner/repo" />
        </label>
        <button id="repo-other-go">Go</button>
      </div>
    </div>
  `,U.appendChild(i),i.addEventListener(`click`,e=>{e.target===i&&i.remove()});let a=e=>{e.key===`Escape`&&(i.remove(),document.removeEventListener(`keydown`,a))};document.addEventListener(`keydown`,a),i.querySelectorAll(`.repo-option`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.owner,n=e.dataset.repo;i.remove(),document.removeEventListener(`keydown`,a),De(t,n)})});let o=document.getElementById(`repo-other-go`),s=document.getElementById(`repo-other-input`),c=()=>{let e=s.value.trim().split(`/`);if(e.length!==2||!e[0]||!e[1]){s.classList.add(`error`);return}i.remove(),document.removeEventListener(`keydown`,a),De(e[0],e[1])};o.addEventListener(`click`,c),s.addEventListener(`keydown`,e=>{e.key===`Enter`&&c()})}async function De(e,t){if(k){if(!await i(k.host,k.token,e,t)){b(`Auth: Repo validation failed for ${e}/${t}`),alert(`Repository "${e}/${t}" not found. Check the owner and repo name.`);return}A={owner:e,repo:t},P=null,z=`edit`,B=null,w({screen:`new`,owner:e,repo:t}),Pe(me,he,null)}}async function Oe(e,t,n){if(!k)return;z=`edit`;let r=`${e}/${t}/${n}`;if(B=r,w({screen:`edit`,owner:e,repo:t,number:n}),N.has(r)){P=r;let e=N.get(r);document.querySelector(`.editor-screen`)?ke(r,e):Pe(e.note.title,e.originalBody,e);return}U.innerHTML=`<div class="editor-screen"><p>Loading note #${n}...</p></div>`;try{x(`Note: Opening note #${n} from ${e}/${t}`);let i=await o(k.host,k.token,e,t,n);x(`Note: Loaded note #${n}: "${i.title}"`);let a=be({...i,owner:e,repo:t},i.body??``,i.title,i.updated_at);N.set(r,a),P=r,Pe(i.title,a.originalBody,a)}catch(e){let t=e instanceof Error?e.message:String(e);b(`Note: Failed to load note #${n}: ${t}`),U.innerHTML=`<div class="editor-screen"><p class="error">Failed to load note: ${t}</p></div>`}}function ke(e,t){if(P===e)return;P=e,B=e;let n=t.note;w({screen:`edit`,owner:n.owner,repo:n.repo,number:n.number}),M?.setValue(n.title);let r=document.getElementById(`note-number`);r&&(r.innerHTML=tt(k.host,n.owner,n.repo,n.number)),I=t.attachments,L=t.selectedAttachmentIndex,R=t.multiSelectedAttachments,document.getElementById(`attachment-panel`)&&q()}function Ae(e){return async()=>{if(!k)return;let t=E.getEditorContent(),n=(M?.getValue()??``).trim(),r=e();if(!r&&A){if(!n){Y(`Title required`,!0);return}try{Y(`Creating...`),x(`Note: Creating new note in ${A.owner}/${A.repo}`);let e=await c(k.host,k.token,A.owner,A.repo,n,t);x(`Note: Created new note: #${e.number}`);let r={...e,owner:A.owner,repo:A.repo};j=r,A=null;let i=`${r.owner}/${r.repo}/${r.number}`,a=be(r,e.body??``,e.title,e.updated_at);N.set(i,a),P=i,B=i,w({screen:`edit`,owner:r.owner,repo:r.repo,number:r.number});let o=document.getElementById(`note-number`);o&&(o.innerHTML=tt(k.host,r.owner,r.repo,r.number)),Y(`Created`)}catch(e){let t=e instanceof Error?e.message:String(e);b(`Note: Failed to create note: ${t}`),Y(`Create failed: ${t}`,!0)}return}if(!r)return;let i={};if(t!==r.originalBody&&(i.body=t),n!==r.originalTitle&&(i.title=n),Object.keys(i).length===0){Y(`No changes`);return}try{Y(`Saving...`),x(`Note: Save initiated for #${r.note.number}`);let e=await o(k.host,k.token,r.note.owner,r.note.repo,r.note.number);if(r.loadedUpdatedAt&&e.updated_at!==r.loadedUpdatedAt&&(te(`Note: Remote conflict detected for #${r.note.number}; user chose to overwrite`),!await Ie())){x(`Note: Save cancelled due to conflict`),Y(`Save cancelled`);return}let t=await s(k.host,k.token,r.note.owner,r.note.repo,r.note.number,i);x(`Note: Save successful for #${r.note.number}: "${t.title}"`),r.originalBody=t.body??``,r.originalTitle=t.title,r.loadedUpdatedAt=t.updated_at,r.note={...t,owner:r.note.owner,repo:r.note.repo},Y(`Saved`)}catch(e){let t=e instanceof Error?e.message:String(e);b(`Note: Save failed for #${r.note.number}: ${t}`),Y(`Save failed: ${t}`,!0)}}}async function je(e){if(!k)throw Error(`Not authenticated`);if(N.has(e)){let t=N.get(e);return{content:t.originalBody,label:t.note.title,callbacks:Me(()=>N.get(e)??null)}}let t=e.split(`/`);if(t.length!==3)throw Error(`Invalid document id: ${e}`);let[n,r,i]=t,a=parseInt(i,10);x(`Note: Loading document ${e} for new buffer`);let s=await o(k.host,k.token,n,r,a),c=be({...s,owner:n,repo:r},s.body??``,s.title,s.updated_at);return N.set(e,c),{content:c.originalBody,label:s.title,callbacks:Me(()=>N.get(e)??null)}}function Me(e){return{onSave:Ae(e),onQuit:()=>{N.clear(),C({screen:`list`})},isAppDirty:()=>{let t=e();return t?M?.getValue().trim()!==t.originalTitle:!1},onBufferSwitch:e=>{let t=N.get(e);t&&ke(e,t)},onListDocuments:async()=>xe.map(e=>({id:`${e.owner}/${e.repo}/${e.number}`,label:e.title})),onLoadDocument:je}}function Ne(){if(document.getElementById(`global-search-overlay`)||!k)return;let e=[],t=!1,n=0,r=null,i=[],o=document.createElement(`div`);o.id=`global-search-overlay`,o.className=`global-search-overlay`,o.innerHTML=`
    <div class="global-search-card">
      <div class="global-search-header">
        <input id="gs-input" class="global-search-input" type="text" placeholder="Search all notes..." autocomplete="off" spellcheck="false" />
        <button id="gs-regex" class="search-regex-toggle" title="Toggle regex (Ctrl+R)">.*</button>
        <span id="gs-count" class="search-count"></span>
      </div>
      <div id="gs-results" class="global-search-results">
        <p class="global-search-status">Loading notes...</p>
      </div>
      <div class="global-search-footer">
        <span><kbd>Tab</kbd> Results</span>
        <span><kbd>j</kbd><kbd>k</kbd> Navigate</span>
        <span><kbd>Enter</kbd> Open</span>
        <span><kbd>Ctrl+Enter</kbd> New tab</span>
        <span><kbd>Ctrl+R</kbd> Regex</span>
        <span><kbd>Esc</kbd> Close</span>
      </div>
    </div>
  `,document.body.appendChild(o);let s=document.getElementById(`gs-input`),c=document.getElementById(`gs-results`),l=document.getElementById(`gs-count`),u=document.getElementById(`gs-regex`);s.focus();function d(){o.remove(),E?.focusEditor()}function f(){u.classList.toggle(`active`,t)}function p(){c.querySelectorAll(`.global-search-result`).forEach((e,t)=>{e.classList.toggle(`selected`,t===n)}),c.querySelector(`.global-search-result.selected`)?.scrollIntoView({block:`nearest`})}function m(e){if(i=e,n=0,e.length===0){c.innerHTML=`<p class="global-search-status">No matches.</p>`;return}c.innerHTML=e.map((e,t)=>`
      <div class="global-search-result${t===0?` selected`:``}" data-index="${t}">
        <span class="global-search-result-title">${X(e.note.title)}</span>
        <span class="global-search-result-repo">${X(e.note.repo)}</span>
        <span class="global-search-result-context search-context">${e.context}</span>
      </div>
    `).join(``),c.querySelectorAll(`.global-search-result`).forEach(e=>{let t=parseInt(e.dataset.index,10);e.addEventListener(`mousemove`,()=>{n!==t&&(n=t,p())}),e.addEventListener(`click`,e=>{n=t,g(e.ctrlKey||e.metaKey)})})}function h(){let n=s.value;if(!n.trim()){l.textContent=e.length>0?`${e.length} note${e.length===1?``:`s`}`:``,l.classList.remove(`error`),c.innerHTML=`<p class="global-search-status">Type to search…</p>`,i=[];return}let r=we(n,t,e);if(r===null){l.textContent=`invalid regex`,l.classList.add(`error`);return}l.textContent=`${r.length} match${r.length===1?``:`es`}`,l.classList.remove(`error`),m(r)}function g(e){let t=i[n];if(!t)return;d();let r={screen:`edit`,owner:t.note.owner,repo:t.note.repo,number:t.note.number};e?window.open(`${location.pathname}${S(r)}`,`_blank`):C(r)}s.addEventListener(`input`,()=>{r&&clearTimeout(r),e.length>0&&(r=setTimeout(h,150))}),c.tabIndex=-1,o.addEventListener(`keydown`,r=>{let a=r.target===s;r.key===`Escape`?(r.preventDefault(),d()):r.key===`Tab`&&!r.shiftKey&&a?(r.preventDefault(),c.focus()):r.key===`Tab`&&r.shiftKey&&r.target===c?(r.preventDefault(),s.focus()):r.key===`ArrowDown`||r.key===`j`&&!a?(r.preventDefault(),i.length>0&&(n=Math.min(n+1,i.length-1),p())):r.key===`ArrowUp`||r.key===`k`&&!a?(r.preventDefault(),n>0&&(n--,p())):r.key===`Enter`?(r.preventDefault(),g(r.ctrlKey||r.metaKey)):r.key===`r`&&r.ctrlKey&&(r.preventDefault(),t=!t,f(),e.length>0&&h())}),o.addEventListener(`click`,e=>{e.target===o&&d()}),u.addEventListener(`click`,()=>{t=!t,f(),e.length>0&&h()}),a(k.host,k.token).then(t=>{e=t,s.value.trim()?h():(l.textContent=`${t.length} note${t.length===1?``:`s`}`,c.innerHTML=`<p class="global-search-status">Type to search…</p>`)}).catch(e=>{c.innerHTML=`<p class="global-search-status error">Failed to load: ${X(e instanceof Error?e.message:String(e))}</p>`})}function Pe(e,t,n){G?.(),G=null;let r=n?.note??null;U.innerHTML=`
    <div class="editor-screen">
      <header>
        <button id="back-to-list" title="Back to notes">&larr;</button>
        <div id="note-title-container"></div>
        <span id="note-number">${r?tt(k.host,r.owner,r.repo,r.number):`Title`}</span>
        ${r?`<button id="copy-note-url" class="copy-url-btn" title="Copy URL">${Ye}</button>`:``}
        ${r?`<button id="attachment-toggle-btn" class="attachment-toggle-btn" title="Attachments (ga)">${Xe}</button>`:``}
        ${r?`<button id="delete-note-btn" class="delete-note-btn" title="Delete note">${Qe}</button>`:``}
        <span id="status-msg"></span>
      </header>
      <div id="editor-container"></div>
    </div>
  `,document.getElementById(`back-to-list`).addEventListener(`click`,()=>{E.requestQuit()});let i=document.getElementById(`copy-note-url`);if(i&&r){let e=r;i.addEventListener(`click`,()=>{rt(i,nt(e.owner,e.repo,e.number),Z(k.host,e.owner,e.repo,e.number))})}document.getElementById(`attachment-toggle-btn`)?.addEventListener(`click`,()=>Le()),document.getElementById(`delete-note-btn`)?.addEventListener(`click`,()=>Fe()),M=E.createVimInput(document.getElementById(`note-title-container`),{value:e,onEnter:()=>E.focusEditor(),onEscape:()=>E.focusEditor(),storagePrefix:`notehub`});let a=Me(()=>P?N.get(P)??null:null);if(E.createEditor(document.getElementById(`editor-container`),t,a,{storagePrefix:`notehub`,autoSaveMs:E.getAutoSaveMs(),initialBufferId:P??void 0,initialBufferLabel:e,normalMappings:{gt:()=>M.focus(),ga:()=>Le(),gs:()=>Ne()},helpSections:[{title:`notehub — Normal mode`,entries:[[`gt`,`Focus title input`],[`ga`,`Toggle attachment panel`],[`gs`,`Search all notes`]]},{title:`notehub — Note list (outside editor)`,entries:[[`j / k`,`Navigate notes`],[`n`,`New note`],[`r`,`Refresh note list`],[`/`,`Open search bar`]]}]}),r){let e=O();e&&f(k.host,k.token,e.owner,e.repo,r.owner,r.repo,r.number).then(e=>{e.length>0&&document.querySelector(`.editor-screen`)&&Re(e,{skipFocus:!0})}).catch(()=>{})}}async function Fe(){if(!k)return;let e=F();if(e&&confirm(`Delete note "#${e.note.number}: ${e.originalTitle}"?`))try{if(Y(`Deleting...`),(await l(k.host,k.token,e.note.owner,e.note.repo,e.note.number)).state!==`closed`){let e=`Delete failed: note was not closed`;Y(e,!0),b(e);return}x(`Deleted note #${e.note.number}: ${e.originalTitle}`),Y(`Deleted`),setTimeout(()=>{C({screen:`list`})},500)}catch(e){let t=`Delete failed: ${e instanceof Error?e.message:e}`;Y(t,!0),b(t)}}function Ie(){return new Promise(e=>{let t=document.createElement(`div`);t.id=`conflict-overlay`,t.innerHTML=`
      <div class="conflict-dialog">
        <h3>Note changed</h3>
        <p>This note has been modified since you opened it. Saving will overwrite those changes.</p>
        <div class="conflict-actions">
          <button id="conflict-cancel">Cancel</button>
          <button id="conflict-overwrite" class="danger">Overwrite</button>
        </div>
      </div>
    `,document.body.appendChild(t);let n=n=>{t.remove(),document.removeEventListener(`keydown`,r),e(n)};function r(e){e.key===`Escape`&&n(!1)}t.querySelector(`#conflict-cancel`).addEventListener(`click`,()=>n(!1)),t.querySelector(`#conflict-overwrite`).addEventListener(`click`,()=>n(!0)),t.addEventListener(`click`,e=>{e.target===t&&n(!1)}),document.addEventListener(`keydown`,r)})}function Le(){document.getElementById(`attachment-panel`)?q():Re()}function q(){document.getElementById(`attachment-panel`)?.remove(),I=[],L=0,R.clear(),E?.focusEditor()}async function Re(e,t){let n=F();if(!n||!k)return;let r=document.querySelector(`.editor-screen`);if(!r)return;let i=n.note,a=O(),o=a&&k&&i?`https://${k.host}/${a.owner}/${a.repo}/tree/main/${i.owner}/${i.repo}/${i.number}`:``,s=document.createElement(`div`);s.id=`attachment-panel`,s.className=`attachment-panel`,s.tabIndex=0,s.innerHTML=`
    <div class="attachment-panel-header">
      <span class="attachment-panel-title">
        ${Xe} Attachments
        ${o?`<a href="${o}" target="_blank" class="attachment-repo-link" title="Open attachments folder on GitHub">\u2197</a>`:``}
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
  `,r.appendChild(s),t?.skipFocus||s.focus(),document.getElementById(`attachment-close-btn`).addEventListener(`click`,e=>{e.stopPropagation(),q()}),s.querySelectorAll(`.footer-action[data-action]`).forEach(e=>{let t=e.dataset.action;t!==`navigate`&&(e.style.cursor=`pointer`,e.addEventListener(`click`,async e=>{e.stopPropagation(),t===`select`?Ke():t===`upload`?await He():t===`download`?await We():t===`preview`?await Ge():t===`delete`?await qe():t===`close`&&q(),s.focus()}))}),s.addEventListener(`keydown`,async e=>{e.key===`Escape`?(e.preventDefault(),q()):e.key===`j`||e.key===`ArrowDown`?(e.preventDefault(),Be(1)):e.key===`k`||e.key===`ArrowUp`?(e.preventDefault(),Be(-1)):e.key===`a`?(e.preventDefault(),await He()):e.key===`Enter`||e.key===`d`?(e.preventDefault(),await We()):e.key===`p`?(e.preventDefault(),await Ge()):e.key===` `?(e.preventDefault(),Ke()):e.key===`x`&&(e.preventDefault(),await qe())}),s.addEventListener(`dragover`,e=>{e.preventDefault(),s.classList.add(`attachment-panel-dragover`)}),s.addEventListener(`dragleave`,()=>{s.classList.remove(`attachment-panel-dragover`)}),s.addEventListener(`drop`,async e=>{e.preventDefault(),s.classList.remove(`attachment-panel-dragover`);let t=Array.from(e.dataTransfer?.files||[]);t.length>0&&await Ve(t)}),await ze(e)}async function ze(e){let t=F();if(!t||!k)return;let n=document.getElementById(`attachment-list`);if(n){if(e)I=e,t.attachments=I;else{let e=await ye();if(!e){n.innerHTML=`<p class="attachment-error">Attachments repo not available.</p>`;return}try{I=await f(k.host,k.token,e.owner,e.repo,t.note.owner,t.note.repo,t.note.number),t.attachments=I}catch(e){n.innerHTML=`<p class="attachment-error">Failed to load: ${e instanceof Error?e.message:e}</p>`;return}}L=0,t.selectedAttachmentIndex=0,J(n)}}function J(e){if(I.length===0){e.innerHTML=`<p class="attachment-empty">No attachments yet. Press <kbd>a</kbd> to upload.</p>`;return}e.innerHTML=I.map((e,t)=>{let n=t===L,r=R.has(t);return`
    <div class="${[`attachment-row`,n?`selected`:``,r?`multi-selected`:``].filter(Boolean).join(` `)}" data-index="${t}">
      <span class="attachment-checkbox">${r?`☑`:`☐`}</span>
      <span class="attachment-name" title="Click to preview, Ctrl+click to download">${X(e.name)}</span>
      <span class="attachment-size">${Je(e.size)}</span>
    </div>`}).join(``);let t=!1,n=document.getElementById(`attachment-panel`);e.addEventListener(`mousedown`,()=>{t=n===document.activeElement}),e.querySelectorAll(`.attachment-row`).forEach(r=>{let i=parseInt(r.dataset.index,10);r.querySelector(`.attachment-checkbox`)?.addEventListener(`click`,r=>{if(r.stopPropagation(),!t){n?.focus();return}L=i,R.has(i)?R.delete(i):R.add(i),J(e),n?.focus()}),r.querySelector(`.attachment-name`)?.addEventListener(`click`,async r=>{if(r.stopPropagation(),!t){n?.focus();return}L=i,J(e),r.ctrlKey||r.metaKey?await Ue(i):await Ge(),n?.focus()}),r.addEventListener(`click`,()=>{if(!t){n?.focus();return}L=i,J(e),n?.focus()})}),e.querySelector(`.attachment-row.selected`)?.scrollIntoView({block:`nearest`})}function Be(e){if(I.length===0)return;L=Math.max(0,Math.min(I.length-1,L+e));let t=document.getElementById(`attachment-list`);t&&J(t)}async function Ve(e){let t=F();if(!t||!k||e.length===0)return;let n=t.note,r=await ye();if(!r)return;let i={};try{let e=await f(k.host,k.token,r.owner,r.repo,n.owner,n.repo,n.number);i=Object.fromEntries(e.map(e=>[e.name,e.sha]))}catch{}let a=[],o=[];for(let t of e)try{Y(`Uploading ${a.length+1}/${e.length}...`),x(`Attachment: Uploading ${t.name}`);let o=await t.arrayBuffer(),s=new Uint8Array(o),c=8192,l=``;for(let e=0;e<s.length;e+=c)l+=String.fromCharCode(...s.subarray(e,e+c));let u=btoa(l),d=await p(k.host,k.token,r.owner,r.repo,n.owner,n.repo,n.number,t.name,u,i[t.name]);x(`Attachment: Uploaded ${t.name} (${t.size} bytes)`),a.push(`[${t.name}](${d.download_url})`);let f=I.findIndex(e=>e.name===t.name);f>=0?I[f]=d:I.push(d)}catch(e){let n=e instanceof Error?e.message:String(e);b(`Attachment: Upload failed for ${t.name}: ${n}`),o.push(t.name)}let s=document.getElementById(`attachment-list`);if(s&&J(s),a.length>0){let e=!1;try{await et(a.join(`
`)),e=!0}catch(e){b(`Attachment: clipboard write failed: ${e instanceof Error?e.message:String(e)}`)}let t=a.length===1?e?`Uploaded — link copied`:`Uploaded`:e?`Uploaded ${a.length} files — links copied`:`Uploaded ${a.length} files`;Y(o.length>0?`${t} (${o.length} failed)`:t,o.length>0)}else Y(`Upload failed: ${o.join(`, `)}`,!0);document.getElementById(`attachment-panel`)?.focus()}async function He(){if(!F()||!k)return;let e=document.createElement(`input`);e.type=`file`,e.multiple=!0,e.onchange=async()=>{await Ve(Array.from(e.files||[]))},e.click()}async function Ue(e){let t=I[e];if(!t||!F()||!k)return;let n=O();if(n)try{Y(`Downloading...`);let{blob:e,filename:r}=await m(k.host,k.token,n.owner,n.repo,t.path),i=URL.createObjectURL(e),a=document.createElement(`a`);a.href=i,a.download=r,a.click(),setTimeout(()=>URL.revokeObjectURL(i),100),Y(``)}catch(e){Y(`Download failed: ${e instanceof Error?e.message:e}`,!0)}}async function We(){await Ue(L)}async function Ge(){let e=I[L];if(!e||!F()||!k)return;let t=O();if(t)try{Y(`Loading preview...`);let{blob:n}=await m(k.host,k.token,t.owner,t.repo,e.path),r=e.name.split(`.`).pop()?.toLowerCase()??``,i={jpg:`image/jpeg`,jpeg:`image/jpeg`,png:`image/png`,gif:`image/gif`,webp:`image/webp`,svg:`image/svg+xml`,bmp:`image/bmp`,pdf:`application/pdf`,txt:`text/plain`,md:`text/plain`,json:`application/json`,csv:`text/csv`,html:`text/html`},a=i[r]?new Blob([n],{type:i[r]}):n,o=URL.createObjectURL(a);window.open(o,`_blank`),setTimeout(()=>URL.revokeObjectURL(o),6e4),Y(``)}catch(e){Y(`Preview failed: ${e instanceof Error?e.message:e}`,!0)}}function Ke(){if(I.length===0)return;R.has(L)?R.delete(L):R.add(L);let e=document.getElementById(`attachment-list`);e&&J(e)}async function qe(){let e=F();if(!e||!k)return;let t=e.note,n=O();if(!n)return;let r=R.size>0?[...R].sort((e,t)=>t-e):[L],i=r.map(e=>I[e]?.name).filter(Boolean);if(i.length===0)return;let a=i.length===1?`Delete "${i[0]}"?`:`Delete ${i.length} attachments?\n${i.join(`
`)}`;if(!confirm(a)){document.getElementById(`attachment-panel`)?.focus();return}try{Y(`Deleting ${i.length===1?``:i.length+` `}...`);for(let e of r){let r=I[e];r&&(x(`Attachment: Deleting ${r.name} from note #${t?.number}`),await h(k.host,k.token,n.owner,n.repo,r.path,r.sha),x(`Attachment: Deleted ${r.name}`))}Y(i.length===1?`Deleted`:`Deleted ${i.length} attachments`);for(let e of r)I.splice(e,1);R.clear(),L=Math.min(L,Math.max(0,I.length-1));let e=document.getElementById(`attachment-list`);e&&J(e),document.getElementById(`attachment-panel`)?.focus()}catch(e){let t=e instanceof Error?e.message:String(e);b(`Attachment: Delete failed for ${i.join(`, `)}: ${t}`),Y(`Delete failed: ${e instanceof Error?e.message:e}`,!0),document.getElementById(`attachment-panel`)?.focus()}}function Je(e){return e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(1)} MB`}function Y(e,t=!1){let n=document.getElementById(`status-msg`);n&&(n.textContent=e,n.className=t?`error`:`success`,t||setTimeout(()=>{n.textContent===e&&(n.textContent=``)},2e3))}function X(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}var Ye=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,Xe=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,Ze=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,Qe=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,$e=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;function et(e){if(Se)return window.postMessage({type:`barouse:clipboard-write`,text:e},`*`),Promise.resolve();if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(e);let t=document.createElement(`textarea`);return t.value=e,t.style.position=`fixed`,t.style.opacity=`0`,document.body.appendChild(t),t.select(),document.execCommand(`copy`),t.remove(),Promise.resolve()}function Z(e,t,n,r){return`https://${e}/${t}/${n}/issues/${r}`}function tt(e,t,n,r){let i=Z(e,t,n,r);return`<a href="${Q(i)}" target="${it(i)}" class="issue-link">#${r}</a>`}function nt(e,t,n){return`${location.origin}${location.pathname}${S({screen:`edit`,owner:e,repo:t,number:n})}`}function rt(e,t,n){document.querySelector(`.copy-url-menu`)?.remove();let r=e.getBoundingClientRect(),i=document.createElement(`div`);i.className=`note-context-menu copy-url-menu`,i.innerHTML=`
    <button class="copy-menu-btn" data-url="${Q(t)}">Notehub URL</button>
    <button class="copy-menu-btn" data-url="${Q(n)}">GitHub URL</button>
  `,i.style.top=`${r.bottom+4}px`,i.style.left=`${r.right}px`,document.body.appendChild(i);let a=()=>{i.remove(),document.removeEventListener(`click`,a)};setTimeout(()=>document.addEventListener(`click`,a),0),i.querySelectorAll(`.copy-menu-btn`).forEach(t=>{t.addEventListener(`click`,n=>{n.stopPropagation(),a();let r=t.dataset.url;et(r).then(()=>{e.innerHTML=Ze,setTimeout(()=>{e.innerHTML=Ye},1500)})})})}function it(e){return E?E.hashTarget(e):`_blank`}function Q(e){return e.replace(/&/g,`&amp;`).replace(/"/g,`&quot;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}var at=`0.31.0`,ot=`92d2acde1db1`,$=document.createElement(`span`);$.className=`version-badge`,$.id=`version-badge`,$.textContent=`v${at}`,$.title=ot,document.body.appendChild($),Ce();
//# sourceMappingURL=index-DT_5Btdz.js.map