(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e){return e===`github.com`?`https://api.github.com`:`https://${e}/api/v3`}function t(e){return{Authorization:`Bearer ${e}`,Accept:`application/vnd.github+json`,"Content-Type":`application/json`}}async function n(n,r,i,a){let o;for(let s=0;s<3;s++)try{let o=await fetch(`${e(n)}${i}`,{...a,headers:{...t(r),...a?.headers}}),s=await o.text();if(!o.ok)throw Error(`GitHub API ${o.status}: ${s}`);return JSON.parse(s.replace(/\r\n/g,`
`))}catch(e){if(o=e instanceof Error?e:Error(String(e)),o.message.startsWith(`GitHub API `))throw o;s<2&&await new Promise(e=>setTimeout(e,500*(s+1)))}throw o}function r(e,t){return n(e,t,`/user`)}async function i(e,t,r,i){try{return await n(e,t,`/repos/${r}/${i}`),!0}catch{return!1}}async function a(e,t){return(await n(e,t,`/search/issues?q=is%3Aissue%20label%3Anotehub%20state%3Aopen&sort=updated&order=desc&per_page=100`)).items.map(e=>{let t=e.repository_url.split(`/`),n=t.pop(),r=t.pop();return{...e,owner:r,repo:n}})}function o(e,t,r,i,a){return n(e,t,`/repos/${r}/${i}/issues/${a}`)}function s(e,t,r,i,a,o){return n(e,t,`/repos/${r}/${i}/issues/${a}`,{method:`PATCH`,body:JSON.stringify(o)})}async function c(e,t,r,i,a,o){return await h(e,t,r,i),n(e,t,`/repos/${r}/${i}/issues`,{method:`POST`,body:JSON.stringify({title:a,body:o,labels:[`notehub`]})})}function l(e,t,r,i,a){return n(e,t,`/repos/${r}/${i}/issues/${a}`,{method:`PATCH`,body:JSON.stringify({state:`closed`})})}function u(e){let[t,n]=e.split(`/`);return{owner:t,repo:`${n}.attachments`}}async function d(e,t,r,i){let a=new Map;try{let o=await n(e,t,`/repos/${r}/${i}/git/trees/main?recursive=1`);for(let e of o.tree){if(e.type!==`blob`)continue;let t=e.path.split(`/`);if(t.length<4)continue;let n=`${t[0]}/${t[1]}/${t[2]}`;a.set(n,(a.get(n)??0)+1)}}catch{}return a}async function f(e,t,r,i,a,o,s){try{return await n(e,t,`/repos/${r}/${i}/contents/${a}/${o}/${s}`)}catch(e){if(e instanceof Error&&e.message.includes(`404`))return[];throw e}}async function ee(e,t,r,i,a,o,s,c,l,u){let d={message:`notehub: attach ${c} to ${a}/${o}#${s}`,content:l};return u&&(d.sha=u),(await n(e,t,`/repos/${r}/${i}/contents/${a}/${o}/${s}/${encodeURIComponent(c)}`,{method:`PUT`,body:JSON.stringify(d)})).content}async function p(t,n,r,i,a){let o=await fetch(`${e(t)}/repos/${r}/${i}/contents/${a}`,{headers:{Authorization:`Bearer ${n}`,Accept:`application/vnd.github.raw`}});if(!o.ok){let e=await o.text();throw Error(`GitHub API ${o.status}: ${e}`)}return{blob:await o.blob(),filename:a.split(`/`).pop()}}async function m(e,t,r,i,a,o){await n(e,t,`/repos/${r}/${i}/contents/${a}`,{method:`DELETE`,body:JSON.stringify({message:`notehub: remove ${a.split(`/`).pop()}`,sha:o})})}async function h(e,t,r,i){try{await n(e,t,`/repos/${r}/${i}/labels`,{method:`POST`,body:JSON.stringify({name:`notehub`,color:`1d76db`,description:`notehub note`})})}catch{}}var g=`_app_debug_logs`;function _(){try{let e=localStorage.getItem(g);return e?JSON.parse(e):[]}catch{return[]}}function v(e){try{let t=e.slice(-1e3);localStorage.setItem(g,JSON.stringify(t))}catch{}}function y(e,t){let n={timestamp:new Date().toISOString(),level:e,message:t},r=_();r.push(n),v(r),console[e===`warn`?`warn`:e===`error`?`error`:`log`](`[${e.toUpperCase()}] ${t}`)}function b(e){y(`error`,e)}function te(e){y(`warn`,e)}function x(e){y(`info`,e)}function ne(){let e=_();return e.length===0?`(no logs)`:e.map(e=>`[${new Date(e.timestamp).toLocaleTimeString()}] ${e.level.toUpperCase()}: ${e.message}`).join(`
`)}function re(){try{localStorage.removeItem(g)}catch{}}function ie(){let e=document.createElement(`div`);e.id=`log-viewer-modal`,e.style.cssText=`
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
  `,s.addEventListener(`click`,()=>{i.value=ne(),i.scrollTop=i.scrollHeight}),a.appendChild(s),t.appendChild(n),t.appendChild(i),t.appendChild(a),e.appendChild(t),e.addEventListener(`click`,t=>{t.target===e&&e.remove()}),e}function ae(e){let t=e.replace(/^#\/?/,``);if(!t)return{screen:`list`};let n=t.split(`/`);if(n[0]===`edit`&&n.length===4){let e=parseInt(n[3],10);if(e>0&&Number.isFinite(e))return{screen:`edit`,owner:n[1],repo:n[2],number:e}}return n[0]===`new`&&n.length===3?{screen:`new`,owner:n[1],repo:n[2]}:{screen:`list`}}function S(e){switch(e.screen){case`list`:return`#/`;case`edit`:return`#/edit/${e.owner}/${e.repo}/${e.number}`;case`new`:return`#/new/${e.owner}/${e.repo}`}}function oe(e){location.hash=S(e)}function C(e){let t=S(e);history.replaceState(null,``,t)}function se(e){let t=()=>e(ae(location.hash));return window.addEventListener(`hashchange`,t),()=>window.removeEventListener(`hashchange`,t)}var ce=`modulepreload`,le=function(e){return`/notehub.web/`+e},ue={},de=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=le(t,n),t in ue)return;ue[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:ce,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},w=`notehub:token`,fe=`https://stabledog.github.io/veditor.web`,T,E=`notehub:host`,pe=`notehub:defaultRepo`,me=`notehub:pinnedIssue`,he=`🎫 New note`,ge=`# New note`;function _e(){return localStorage.getItem(pe)}function ve(){let e=localStorage.getItem(me);if(!e)return null;try{let t=JSON.parse(e);if(t.owner&&t.repo&&typeof t.number==`number`)return t}catch{}return null}function ye(){return _e()!==null}function D(){let e=_e();return e?u(e):null}async function be(){if(!k)return null;let e=D();return e?await i(k.host,k.token,e.owner,e.repo)?e:(Y(`Attachments repo "${e.owner}/${e.repo}" not found. Create it on GitHub to use attachments.`,!0),null):(Y(`No default repo configured — cannot use attachments.`,!0),null)}function O(e,t,n,r){return{note:e,originalBody:t,originalTitle:n,loadedUpdatedAt:r,attachments:[],selectedAttachmentIndex:0,multiSelectedAttachments:new Set}}var k=null,A=null,j=null,M=null,N=new Map,P=null,xe=[];function F(){return P?N.get(P)??null:null}var I=[],L=0,R=new Set,Se=!1,z=null,B=null;function V(e){if(!k){W();return}switch(e.screen){case`list`:if(z===`list`)return;K();break;case`edit`:{let t=`${e.owner}/${e.repo}/${e.number}`;if(z===`edit`&&B===t)return;De(e.owner,e.repo,e.number);break}case`new`:Ee(e.owner,e.repo);break}}function H(e,t){let n={screen:`edit`,owner:e.owner,repo:e.repo,number:e.number};t.ctrlKey||t.metaKey?window.open(`${location.pathname}${S(n)}`,`_blank`):oe(n)}var U=document.getElementById(`app`);async function Ce(){let e=document.createElement(`link`);e.rel=`stylesheet`;let t=`v=${Date.now()}`;e.href=`${fe}/veditor.css?${t}`,document.head.appendChild(e);try{T=await de(()=>import(`${fe}/veditor.js?${t}`),[]);let e=document.getElementById(`version-badge`);e&&T.VERSION&&(e.textContent+=` \u00b7 ve${T.VERSION}`)}catch(e){b(`Failed to load editor from ${fe}/veditor.js: ${e instanceof Error?e.message:e}`)}let n=localStorage.getItem(w),i=localStorage.getItem(E)??`github.com`;n&&ye()?r(i,n).then(e=>{k={host:i,token:n,username:e.login},se(V),V(ae(location.hash))}).catch(()=>W()):W(),window.addEventListener(`message`,e=>{if(e.data?.type!==`barouse:activate`)return;Se=!0;let t=document.querySelector(`.note-row.selected`)??document.querySelector(`.note-row`);t&&(t.tabIndex=-1,t.focus())})}function W(e){M?.destroy(),M=null,T?.destroyEditor();let t=localStorage.getItem(E)??`github.com`,n=localStorage.getItem(w)??``,i=localStorage.getItem(pe)??``,a=ve(),o=k!==null;if(U.innerHTML=`
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
  `,o){let e=()=>K();document.getElementById(`settings-cancel`).addEventListener(`click`,e);let t=n=>{n.key===`Escape`&&(document.removeEventListener(`keydown`,t),e())};document.addEventListener(`keydown`,t)}document.getElementById(`settings-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`settings-host`).value.trim(),n=document.getElementById(`settings-pat`).value.trim(),i=document.getElementById(`settings-repo`).value.trim(),a=document.getElementById(`settings-pinned`).value.trim(),o=i.split(`/`);if(o.length!==2||!o[0]||!o[1]){W(`Repository must be in owner/repo format.`);return}try{x(`Settings: Validating token for host=${t}`);let e=await r(t,n);if(x(`Settings: Token validated for user ${e.login} on ${t}`),localStorage.setItem(E,t),localStorage.setItem(w,n),localStorage.setItem(pe,i),k={host:t,token:n,username:e.login},a){let e=parseInt(a,10);if(isNaN(e)||e<1){W(`Pinned issue must be a positive number.`);return}localStorage.setItem(me,JSON.stringify({owner:o[0],repo:o[1],number:e}))}else localStorage.removeItem(me);se(V),V(ae(location.hash))}catch(e){b(`Settings: Token validation failed for host=${t}: ${e instanceof Error?e.message:e}`),W(`Authentication failed: ${e instanceof Error?e.message:e}`)}})}var G=null;async function K(){if(M?.destroy(),M=null,T?.destroyEditor(),G?.(),G=null,N.clear(),P=null,z=`list`,B=null,C({screen:`list`}),!k)return;let e=[];U.innerHTML=`
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
  `;let t=document.getElementById(`notes-container`),n=0;function r(){let e=t.querySelectorAll(`.note-row`);e.forEach((e,t)=>{e.classList.toggle(`selected`,t===n)}),e[n]?.scrollIntoView({block:`nearest`})}let i=i=>{if(!(i.target instanceof HTMLInputElement||i.target instanceof HTMLTextAreaElement)&&!c&&!document.getElementById(`repo-picker-overlay`))if(i.key===`n`)i.preventDefault(),document.getElementById(`new-note`).click();else if(i.key===`r`)i.preventDefault(),K();else if(i.key===`j`||i.key===`ArrowDown`){i.preventDefault();let e=t.querySelectorAll(`.note-row`);e.length>0&&(n=Math.min(n+1,e.length-1),r())}else if(i.key===`k`||i.key===`ArrowUp`)i.preventDefault(),n>0&&(n--,r());else if(i.key===`Enter`){i.preventDefault();let r=t.querySelectorAll(`.note-row`);if(r.length>0){let t=parseInt(r[n].getAttribute(`data-index`),10),a=e[t];H(a,i)}}else i.key===`Escape`&&s?(i.preventDefault(),m()):i.key===`/`&&(i.preventDefault(),ee())};document.addEventListener(`keydown`,i),G=()=>document.removeEventListener(`keydown`,i);let o=null,s=!1,c=!1,u=!1,d=null,f=``;function ee(){if(s)return;s=!0,c=!0,f=t.innerHTML;let e=document.createElement(`div`);e.className=`search-bar`,e.id=`search-bar`,e.innerHTML=`
      <span class="search-slash">/</span>
      <div id="search-input-container"></div>
      <button id="search-regex-toggle" class="search-regex-toggle" title="Toggle regex (Ctrl+R)">.*</button>
      <span id="search-count" class="search-count"></span>
    `,t.parentElement.insertBefore(e,t),e.addEventListener(`focusin`,()=>{c=!0}),e.addEventListener(`focusout`,()=>{c=!1}),o=T.createVimInput(document.getElementById(`search-input-container`),{placeholder:`Search notes...`,initialInsert:!0,onEscape:m,onChange:e=>{d&&clearTimeout(d),d=setTimeout(()=>h(e),150)},onEnter:()=>{document.activeElement?.blur()},storagePrefix:`notehub`}),o.focus(),p(),document.getElementById(`search-regex-toggle`).addEventListener(`click`,()=>{u=!u,p(),o&&h(o.getValue())}),e.addEventListener(`keydown`,e=>{e.key===`r`&&e.ctrlKey&&(e.preventDefault(),u=!u,p(),o&&h(o.getValue()))})}function p(){let e=document.getElementById(`search-regex-toggle`);e&&e.classList.toggle(`active`,u)}function m(){s&&(s=!1,c=!1,d&&=(clearTimeout(d),null),o?.destroy(),o=null,document.getElementById(`search-bar`)?.remove(),f&&(t.innerHTML=f,f=``,v()),n=0,r())}function h(i){let a=document.getElementById(`search-count`);if(!i.trim()){f&&(t.innerHTML=f,v()),a&&(a.textContent=``),n=0,r();return}let o=g(i,u,e);a&&(a.textContent=`${o.length} match${o.length===1?``:`es`}`),_(o)}function g(e,t,n){let r;if(t){let t;try{t=new RegExp(e,`gi`)}catch{let e=document.getElementById(`search-count`);return e&&(e.textContent=`invalid regex`,e.classList.add(`error`)),[]}let n=document.getElementById(`search-count`);n&&n.classList.remove(`error`),r=e=>{t.lastIndex=0;let n=t.exec(e);return n?{index:n.index,length:n[0].length}:null}}else{let t=e.toLowerCase();r=e=>{let n=e.toLowerCase().indexOf(t);return n>=0?{index:n,length:t.length}:null}}let i=[];for(let e=0;e<n.length;e++){let t=n[e],a=t.body??``,o=r(t.title),s=r(a);if(!o&&!s)continue;let c=s??o,l=s?a:t.title,u=Math.max(0,c.index-40),d=Math.min(l.length,c.index+c.length+40),f=X(l.slice(u,c.index)),ee=X(l.slice(c.index,c.index+c.length)),p=X(l.slice(c.index+c.length,d)),m=`${u>0?`...`:``}${f}<mark>${ee}</mark>${p}${d<l.length?`...`:``}`;i.push({note:t,index:e,context:m})}return i}function _(i){if(i.length===0){t.innerHTML=`<p class="empty">No matches found.</p>`;return}t.innerHTML=`
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
    `,n=0,r(),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,n=>{let r=parseInt(t.getAttribute(`data-index`),10),i=e[r];H(i,n)})})}function v(){t.querySelectorAll(`.copy-url-btn`).forEach(t=>{t.addEventListener(`click`,n=>{n.stopPropagation();let r=parseInt(t.dataset.index,10),i=e[r];tt(t,et(i.owner,i.repo,i.number),Z(k.host,i.owner,i.repo,i.number))})}),t.querySelectorAll(`.context-menu-btn`).forEach(n=>{n.addEventListener(`click`,r=>{r.stopPropagation(),document.querySelector(`.note-context-menu`)?.remove();let i=parseInt(n.dataset.index,10),a=e[i],o=n.getBoundingClientRect(),s=document.createElement(`div`);s.className=`note-context-menu`,s.innerHTML=`
          <button class="context-github-btn">${Ze} Edit on GitHub</button>
          <button class="context-delete-btn">${Xe} Delete</button>
        `,s.style.top=`${o.bottom+4}px`,s.style.left=`${o.right}px`,document.body.appendChild(s);let c=()=>{s.remove(),document.removeEventListener(`click`,c)};setTimeout(()=>document.addEventListener(`click`,c),0),s.querySelector(`.context-github-btn`).addEventListener(`click`,e=>{e.stopPropagation(),c(),window.open(Z(k.host,a.owner,a.repo,a.number)+`#new_comment_field`,`_blank`)}),s.querySelector(`.context-delete-btn`).addEventListener(`click`,async e=>{e.stopPropagation(),c();try{await l(k.host,k.token,a.owner,a.repo,a.number),t.querySelector(`.note-row[data-index="${i}"]`)?.remove()}catch(e){alert(`Failed to delete note: ${e instanceof Error?e.message:e}`)}})})}),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,n=>{let r=parseInt(t.getAttribute(`data-index`),10),i=e[r];H(i,n)})})}document.getElementById(`settings-btn`).addEventListener(`click`,()=>W()),document.getElementById(`sign-out`).addEventListener(`click`,()=>{localStorage.removeItem(w),localStorage.removeItem(E),k=null,W()}),document.getElementById(`refresh`).addEventListener(`click`,()=>K()),document.getElementById(`logs-btn`).addEventListener(`click`,()=>{document.body.appendChild(ie())});try{if(x(`Note list: Fetching notes for all configured repos`),e=await a(k.host,k.token),xe=e,x(`Note list: Loaded ${e.length} notes`),j){let t=j;j=null,e.some(e=>e.owner===t.owner&&e.repo===t.repo&&e.number===t.number)||(te(`Note list: Search API may not have indexed newly created note yet; using cache`),e.unshift(t))}let n=ve();if(n){let t=e=>e.owner===n.owner&&e.repo===n.repo&&e.number===n.number;e.sort((e,n)=>t(e)?-1:+!!t(n))}if(document.getElementById(`new-note`).addEventListener(`click`,()=>{Te(e)}),e.length===0){t.innerHTML=`<p class="empty">No notes found.</p>`;return}t.innerHTML=`
      <table>
        <thead><tr><th>Title</th><th>#</th><th></th><th>Updated</th><th></th><th>Repo</th></tr></thead>
        <tbody>
          ${e.map((e,t)=>`
            <tr class="note-row" data-index="${t}">
              <td>${X(e.title)}<span class="attachment-count-badge" data-owner="${Q(e.owner)}" data-repo="${Q(e.repo)}" data-issue="${e.number}"></span></td>
              <td><a href="${Q(Z(k.host,e.owner,e.repo,e.number))}" target="${nt(Z(k.host,e.owner,e.repo,e.number))}" class="issue-link" onclick="event.stopPropagation()">${e.number}</a></td>
              <td><button class="copy-url-btn" data-index="${t}" title="Copy URL">${qe}</button></td>
              <td>${new Date(e.updated_at).toLocaleDateString(`en-US`,{month:`numeric`,day:`numeric`,year:`2-digit`})}</td>
              <td><button class="context-menu-btn" data-index="${t}" title="More actions">&#x2026;</button></td>
              <td><span title="${Q(e.owner)}/${Q(e.repo)}">${X(e.repo)}</span></td>
            </tr>
          `).join(``)}
        </tbody>
      </table>
    `,t.querySelectorAll(`.copy-url-btn`).forEach(t=>{t.addEventListener(`click`,n=>{n.stopPropagation();let r=parseInt(t.dataset.index,10),i=e[r];tt(t,et(i.owner,i.repo,i.number),Z(k.host,i.owner,i.repo,i.number))})}),t.querySelectorAll(`.context-menu-btn`).forEach(n=>{n.addEventListener(`click`,r=>{r.stopPropagation(),document.querySelector(`.note-context-menu`)?.remove();let i=parseInt(n.dataset.index,10),a=e[i],o=n.getBoundingClientRect(),s=document.createElement(`div`);s.className=`note-context-menu`,s.innerHTML=`
          <button class="context-github-btn">${Ze} Edit on GitHub</button>
          <button class="context-delete-btn">${Xe} Delete</button>
        `,s.style.top=`${o.bottom+4}px`,s.style.left=`${o.right}px`,document.body.appendChild(s);let c=()=>{s.remove(),document.removeEventListener(`click`,c)};setTimeout(()=>document.addEventListener(`click`,c),0),s.querySelector(`.context-github-btn`).addEventListener(`click`,e=>{e.stopPropagation(),c(),window.open(Z(k.host,a.owner,a.repo,a.number)+`#new_comment_field`,`_blank`)}),s.querySelector(`.context-delete-btn`).addEventListener(`click`,async e=>{e.stopPropagation(),c();try{await l(k.host,k.token,a.owner,a.repo,a.number),t.querySelector(`.note-row[data-index="${i}"]`)?.remove()}catch(e){alert(`Failed to delete note: ${e instanceof Error?e.message:e}`)}})})}),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,n=>{let r=parseInt(t.getAttribute(`data-index`),10),i=e[r];H(i,n)})}),r();let i=t.querySelector(`.note-row.selected`);i&&(i.tabIndex=-1,i.focus()),we(e).catch(()=>{})}catch(e){let t=e instanceof Error?e.message:String(e);b(`Note list: Failed to load notes: ${t}`),document.getElementById(`notes-container`).innerHTML=`<p class="error">Failed to load notes: ${t}</p>`}}async function we(e){if(!k)return;let t=D();if(!t)return;let n=await d(k.host,k.token,t.owner,t.repo);document.querySelectorAll(`.attachment-count-badge`).forEach(e=>{let t=`${e.dataset.owner}/${e.dataset.repo}/${e.dataset.issue}`,r=n.get(t);r&&(e.textContent=` 📎${r}`)})}function Te(e){document.getElementById(`repo-picker-overlay`)?.remove();let t=new Map,n=_e();if(n){let[e,r]=n.split(`/`);t.set(n,{owner:e,repo:r})}for(let n of e){let e=`${n.owner}/${n.repo}`;t.has(e)||t.set(e,{owner:n.owner,repo:n.repo})}let r=Array.from(t.entries()).sort((e,t)=>{if(n){if(e[0]===n)return-1;if(t[0]===n)return 1}return e[0].localeCompare(t[0])}),i=document.createElement(`div`);i.id=`repo-picker-overlay`,i.innerHTML=`
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
  `,U.appendChild(i),i.addEventListener(`click`,e=>{e.target===i&&i.remove()});let a=e=>{e.key===`Escape`&&(i.remove(),document.removeEventListener(`keydown`,a))};document.addEventListener(`keydown`,a),i.querySelectorAll(`.repo-option`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.owner,n=e.dataset.repo;i.remove(),document.removeEventListener(`keydown`,a),Ee(t,n)})});let o=document.getElementById(`repo-other-go`),s=document.getElementById(`repo-other-input`),c=()=>{let e=s.value.trim().split(`/`);if(e.length!==2||!e[0]||!e[1]){s.classList.add(`error`);return}i.remove(),document.removeEventListener(`keydown`,a),Ee(e[0],e[1])};o.addEventListener(`click`,c),s.addEventListener(`keydown`,e=>{e.key===`Enter`&&c()})}async function Ee(e,t){if(k){if(!await i(k.host,k.token,e,t)){b(`Auth: Repo validation failed for ${e}/${t}`),alert(`Repository "${e}/${t}" not found. Check the owner and repo name.`);return}A={owner:e,repo:t},P=null,z=`edit`,B=null,C({screen:`new`,owner:e,repo:t}),Me(he,ge,null)}}async function De(e,t,n){if(!k)return;z=`edit`;let r=`${e}/${t}/${n}`;if(B=r,C({screen:`edit`,owner:e,repo:t,number:n}),N.has(r)){P=r;let e=N.get(r);document.querySelector(`.editor-screen`)?Oe(r,e):Me(e.note.title,e.originalBody,e);return}U.innerHTML=`<div class="editor-screen"><p>Loading note #${n}...</p></div>`;try{x(`Note: Opening note #${n} from ${e}/${t}`);let i=await o(k.host,k.token,e,t,n);x(`Note: Loaded note #${n}: "${i.title}"`);let a=O({...i,owner:e,repo:t},i.body??``,i.title,i.updated_at);N.set(r,a),P=r,Me(i.title,a.originalBody,a)}catch(e){let t=e instanceof Error?e.message:String(e);b(`Note: Failed to load note #${n}: ${t}`),U.innerHTML=`<div class="editor-screen"><p class="error">Failed to load note: ${t}</p></div>`}}function Oe(e,t){if(P===e)return;P=e,B=e;let n=t.note;C({screen:`edit`,owner:n.owner,repo:n.repo,number:n.number}),M?.setValue(n.title);let r=document.getElementById(`note-number`);r&&(r.innerHTML=$e(k.host,n.owner,n.repo,n.number)),I=t.attachments,L=t.selectedAttachmentIndex,R=t.multiSelectedAttachments,document.getElementById(`attachment-panel`)&&q()}function ke(e){return async()=>{if(!k)return;let t=T.getEditorContent(),n=(M?.getValue()??``).trim(),r=e();if(!r&&A){if(!n){Y(`Title required`,!0);return}try{Y(`Creating...`),x(`Note: Creating new note in ${A.owner}/${A.repo}`);let e=await c(k.host,k.token,A.owner,A.repo,n,t);x(`Note: Created new note: #${e.number}`);let r={...e,owner:A.owner,repo:A.repo};j=r,A=null;let i=`${r.owner}/${r.repo}/${r.number}`,a=O(r,e.body??``,e.title,e.updated_at);N.set(i,a),P=i,B=i,C({screen:`edit`,owner:r.owner,repo:r.repo,number:r.number});let o=document.getElementById(`note-number`);o&&(o.innerHTML=$e(k.host,r.owner,r.repo,r.number)),Y(`Created`)}catch(e){let t=e instanceof Error?e.message:String(e);b(`Note: Failed to create note: ${t}`),Y(`Create failed: ${t}`,!0)}return}if(!r)return;let i={};if(t!==r.originalBody&&(i.body=t),n!==r.originalTitle&&(i.title=n),Object.keys(i).length===0){Y(`No changes`);return}try{Y(`Saving...`),x(`Note: Save initiated for #${r.note.number}`);let e=await o(k.host,k.token,r.note.owner,r.note.repo,r.note.number);if(r.loadedUpdatedAt&&e.updated_at!==r.loadedUpdatedAt&&(te(`Note: Remote conflict detected for #${r.note.number}; user chose to overwrite`),!await Pe())){x(`Note: Save cancelled due to conflict`),Y(`Save cancelled`);return}let t=await s(k.host,k.token,r.note.owner,r.note.repo,r.note.number,i);x(`Note: Save successful for #${r.note.number}: "${t.title}"`),r.originalBody=t.body??``,r.originalTitle=t.title,r.loadedUpdatedAt=t.updated_at,r.note={...t,owner:r.note.owner,repo:r.note.repo},Y(`Saved`)}catch(e){let t=e instanceof Error?e.message:String(e);b(`Note: Save failed for #${r.note.number}: ${t}`),Y(`Save failed: ${t}`,!0)}}}async function Ae(e){if(!k)throw Error(`Not authenticated`);if(N.has(e)){let t=N.get(e);return{content:t.originalBody,label:t.note.title,callbacks:je(()=>N.get(e)??null)}}let t=e.split(`/`);if(t.length!==3)throw Error(`Invalid document id: ${e}`);let[n,r,i]=t,a=parseInt(i,10);x(`Note: Loading document ${e} for new buffer`);let s=await o(k.host,k.token,n,r,a),c=O({...s,owner:n,repo:r},s.body??``,s.title,s.updated_at);return N.set(e,c),{content:c.originalBody,label:s.title,callbacks:je(()=>N.get(e)??null)}}function je(e){return{onSave:ke(e),onQuit:()=>{N.clear(),oe({screen:`list`})},isAppDirty:()=>{let t=e();return t?M?.getValue().trim()!==t.originalTitle:!1},onBufferSwitch:e=>{let t=N.get(e);t&&Oe(e,t)},onListDocuments:async()=>xe.map(e=>({id:`${e.owner}/${e.repo}/${e.number}`,label:e.title})),onLoadDocument:Ae}}function Me(e,t,n){G?.(),G=null;let r=n?.note??null;U.innerHTML=`
    <div class="editor-screen">
      <header>
        <button id="back-to-list" title="Back to notes">&larr;</button>
        <div id="note-title-container"></div>
        <span id="note-number">${r?$e(k.host,r.owner,r.repo,r.number):`Title`}</span>
        ${r?`<button id="copy-note-url" class="copy-url-btn" title="Copy URL">${qe}</button>`:``}
        ${r?`<button id="attachment-toggle-btn" class="attachment-toggle-btn" title="Attachments (ga)">${Je}</button>`:``}
        ${r?`<button id="delete-note-btn" class="delete-note-btn" title="Delete note">${Xe}</button>`:``}
        <span id="status-msg"></span>
      </header>
      <div id="editor-container"></div>
    </div>
  `,document.getElementById(`back-to-list`).addEventListener(`click`,()=>{T.requestQuit()});let i=document.getElementById(`copy-note-url`);if(i&&r){let e=r;i.addEventListener(`click`,()=>{tt(i,et(e.owner,e.repo,e.number),Z(k.host,e.owner,e.repo,e.number))})}document.getElementById(`attachment-toggle-btn`)?.addEventListener(`click`,()=>Fe()),document.getElementById(`delete-note-btn`)?.addEventListener(`click`,()=>Ne()),M=T.createVimInput(document.getElementById(`note-title-container`),{value:e,onEnter:()=>T.focusEditor(),onEscape:()=>T.focusEditor(),storagePrefix:`notehub`});let a=je(()=>P?N.get(P)??null:null);if(T.createEditor(document.getElementById(`editor-container`),t,a,{storagePrefix:`notehub`,autoSaveMs:T.getAutoSaveMs(),initialBufferId:P??void 0,initialBufferLabel:e,normalMappings:{gt:()=>M.focus(),ga:()=>Fe()}}),r){let e=D();e&&f(k.host,k.token,e.owner,e.repo,r.owner,r.repo,r.number).then(e=>{e.length>0&&document.querySelector(`.editor-screen`)&&Ie(e)}).catch(()=>{})}}async function Ne(){if(!k)return;let e=F();if(e&&confirm(`Delete note "#${e.note.number}: ${e.originalTitle}"?`))try{if(Y(`Deleting...`),(await l(k.host,k.token,e.note.owner,e.note.repo,e.note.number)).state!==`closed`){let e=`Delete failed: note was not closed`;Y(e,!0),b(e);return}x(`Deleted note #${e.note.number}: ${e.originalTitle}`),Y(`Deleted`),setTimeout(()=>{oe({screen:`list`})},500)}catch(e){let t=`Delete failed: ${e instanceof Error?e.message:e}`;Y(t,!0),b(t)}}function Pe(){return new Promise(e=>{let t=document.createElement(`div`);t.id=`conflict-overlay`,t.innerHTML=`
      <div class="conflict-dialog">
        <h3>Note changed</h3>
        <p>This note has been modified since you opened it. Saving will overwrite those changes.</p>
        <div class="conflict-actions">
          <button id="conflict-cancel">Cancel</button>
          <button id="conflict-overwrite" class="danger">Overwrite</button>
        </div>
      </div>
    `,document.body.appendChild(t);let n=n=>{t.remove(),document.removeEventListener(`keydown`,r),e(n)};function r(e){e.key===`Escape`&&n(!1)}t.querySelector(`#conflict-cancel`).addEventListener(`click`,()=>n(!1)),t.querySelector(`#conflict-overwrite`).addEventListener(`click`,()=>n(!0)),t.addEventListener(`click`,e=>{e.target===t&&n(!1)}),document.addEventListener(`keydown`,r)})}function Fe(){document.getElementById(`attachment-panel`)?q():Ie()}function q(){document.getElementById(`attachment-panel`)?.remove(),I=[],L=0,R.clear(),T?.focusEditor()}async function Ie(e){let t=F();if(!t||!k)return;let n=document.querySelector(`.editor-screen`);if(!n)return;let r=t.note,i=D(),a=i&&k&&r?`https://${k.host}/${i.owner}/${i.repo}/tree/main/${r.owner}/${r.repo}/${r.number}`:``,o=document.createElement(`div`);o.id=`attachment-panel`,o.className=`attachment-panel`,o.tabIndex=0,o.innerHTML=`
    <div class="attachment-panel-header">
      <span class="attachment-panel-title">
        ${Je} Attachments
        ${a?`<a href="${a}" target="_blank" class="attachment-repo-link" title="Open attachments folder on GitHub">\u2197</a>`:``}
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
  `,n.appendChild(o),o.focus(),document.getElementById(`attachment-close-btn`).addEventListener(`click`,e=>{e.stopPropagation(),q()}),o.querySelectorAll(`.footer-action[data-action]`).forEach(e=>{let t=e.dataset.action;t!==`navigate`&&(e.style.cursor=`pointer`,e.addEventListener(`click`,async e=>{e.stopPropagation(),t===`select`?We():t===`upload`?await Be():t===`download`?await He():t===`preview`?await Ue():t===`delete`?await Ge():t===`close`&&q(),o.focus()}))}),o.addEventListener(`keydown`,async e=>{e.key===`Escape`?(e.preventDefault(),q()):e.key===`j`||e.key===`ArrowDown`?(e.preventDefault(),Re(1)):e.key===`k`||e.key===`ArrowUp`?(e.preventDefault(),Re(-1)):e.key===`a`?(e.preventDefault(),await Be()):e.key===`Enter`||e.key===`d`?(e.preventDefault(),await He()):e.key===`p`?(e.preventDefault(),await Ue()):e.key===` `?(e.preventDefault(),We()):e.key===`x`&&(e.preventDefault(),await Ge())}),o.addEventListener(`dragover`,e=>{e.preventDefault(),o.classList.add(`attachment-panel-dragover`)}),o.addEventListener(`dragleave`,()=>{o.classList.remove(`attachment-panel-dragover`)}),o.addEventListener(`drop`,async e=>{e.preventDefault(),o.classList.remove(`attachment-panel-dragover`);let t=Array.from(e.dataTransfer?.files||[]);t.length>0&&await ze(t)}),await Le(e)}async function Le(e){let t=F();if(!t||!k)return;let n=document.getElementById(`attachment-list`);if(n){if(e)I=e,t.attachments=I;else{let e=await be();if(!e){n.innerHTML=`<p class="attachment-error">Attachments repo not available.</p>`;return}try{I=await f(k.host,k.token,e.owner,e.repo,t.note.owner,t.note.repo,t.note.number),t.attachments=I}catch(e){n.innerHTML=`<p class="attachment-error">Failed to load: ${e instanceof Error?e.message:e}</p>`;return}}L=0,t.selectedAttachmentIndex=0,J(n)}}function J(e){if(I.length===0){e.innerHTML=`<p class="attachment-empty">No attachments yet. Press <kbd>a</kbd> to upload.</p>`;return}e.innerHTML=I.map((e,t)=>{let n=t===L,r=R.has(t);return`
    <div class="${[`attachment-row`,n?`selected`:``,r?`multi-selected`:``].filter(Boolean).join(` `)}" data-index="${t}">
      <span class="attachment-checkbox">${r?`☑`:`☐`}</span>
      <span class="attachment-name" title="Click to preview, Ctrl+click to download">${X(e.name)}</span>
      <span class="attachment-size">${Ke(e.size)}</span>
    </div>`}).join(``);let t=!1,n=document.getElementById(`attachment-panel`);e.addEventListener(`mousedown`,()=>{t=n===document.activeElement}),e.querySelectorAll(`.attachment-row`).forEach(r=>{let i=parseInt(r.dataset.index,10);r.querySelector(`.attachment-checkbox`)?.addEventListener(`click`,r=>{if(r.stopPropagation(),!t){n?.focus();return}L=i,R.has(i)?R.delete(i):R.add(i),J(e),n?.focus()}),r.querySelector(`.attachment-name`)?.addEventListener(`click`,async r=>{if(r.stopPropagation(),!t){n?.focus();return}L=i,J(e),r.ctrlKey||r.metaKey?await Ve(i):await Ue(),n?.focus()}),r.addEventListener(`click`,()=>{if(!t){n?.focus();return}L=i,J(e),n?.focus()})}),e.querySelector(`.attachment-row.selected`)?.scrollIntoView({block:`nearest`})}function Re(e){if(I.length===0)return;L=Math.max(0,Math.min(I.length-1,L+e));let t=document.getElementById(`attachment-list`);t&&J(t)}async function ze(e){let t=F();if(!t||!k||e.length===0)return;let n=t.note,r=await be();if(!r)return;let i={};try{let e=await f(k.host,k.token,r.owner,r.repo,n.owner,n.repo,n.number);i=Object.fromEntries(e.map(e=>[e.name,e.sha]))}catch{}let a=[],o=[];for(let t of e)try{Y(`Uploading ${a.length+1}/${e.length}...`),x(`Attachment: Uploading ${t.name}`);let o=await t.arrayBuffer(),s=new Uint8Array(o),c=8192,l=``;for(let e=0;e<s.length;e+=c)l+=String.fromCharCode(...s.subarray(e,e+c));let u=btoa(l),d=await ee(k.host,k.token,r.owner,r.repo,n.owner,n.repo,n.number,t.name,u,i[t.name]);x(`Attachment: Uploaded ${t.name} (${t.size} bytes)`),a.push(`[${t.name}](${d.download_url})`);let f=I.findIndex(e=>e.name===t.name);f>=0?I[f]=d:I.push(d)}catch(e){let n=e instanceof Error?e.message:String(e);b(`Attachment: Upload failed for ${t.name}: ${n}`),o.push(t.name)}let s=document.getElementById(`attachment-list`);if(s&&J(s),a.length>0){let e=!1;try{await Qe(a.join(`
`)),e=!0}catch(e){b(`Attachment: clipboard write failed: ${e instanceof Error?e.message:String(e)}`)}let t=a.length===1?e?`Uploaded — link copied`:`Uploaded`:e?`Uploaded ${a.length} files — links copied`:`Uploaded ${a.length} files`;Y(o.length>0?`${t} (${o.length} failed)`:t,o.length>0)}else Y(`Upload failed: ${o.join(`, `)}`,!0);document.getElementById(`attachment-panel`)?.focus()}async function Be(){if(!F()||!k)return;let e=document.createElement(`input`);e.type=`file`,e.multiple=!0,e.onchange=async()=>{await ze(Array.from(e.files||[]))},e.click()}async function Ve(e){let t=I[e];if(!t||!F()||!k)return;let n=D();if(n)try{Y(`Downloading...`);let{blob:e,filename:r}=await p(k.host,k.token,n.owner,n.repo,t.path),i=URL.createObjectURL(e),a=document.createElement(`a`);a.href=i,a.download=r,a.click(),setTimeout(()=>URL.revokeObjectURL(i),100),Y(``)}catch(e){Y(`Download failed: ${e instanceof Error?e.message:e}`,!0)}}async function He(){await Ve(L)}async function Ue(){let e=I[L];if(!e||!F()||!k)return;let t=D();if(t)try{Y(`Loading preview...`);let{blob:n}=await p(k.host,k.token,t.owner,t.repo,e.path),r=e.name.split(`.`).pop()?.toLowerCase()??``,i={jpg:`image/jpeg`,jpeg:`image/jpeg`,png:`image/png`,gif:`image/gif`,webp:`image/webp`,svg:`image/svg+xml`,bmp:`image/bmp`,pdf:`application/pdf`,txt:`text/plain`,md:`text/plain`,json:`application/json`,csv:`text/csv`,html:`text/html`},a=i[r]?new Blob([n],{type:i[r]}):n,o=URL.createObjectURL(a);window.open(o,`_blank`),setTimeout(()=>URL.revokeObjectURL(o),6e4),Y(``)}catch(e){Y(`Preview failed: ${e instanceof Error?e.message:e}`,!0)}}function We(){if(I.length===0)return;R.has(L)?R.delete(L):R.add(L);let e=document.getElementById(`attachment-list`);e&&J(e)}async function Ge(){let e=F();if(!e||!k)return;let t=e.note,n=D();if(!n)return;let r=R.size>0?[...R].sort((e,t)=>t-e):[L],i=r.map(e=>I[e]?.name).filter(Boolean);if(i.length===0)return;let a=i.length===1?`Delete "${i[0]}"?`:`Delete ${i.length} attachments?\n${i.join(`
`)}`;if(!confirm(a)){document.getElementById(`attachment-panel`)?.focus();return}try{Y(`Deleting ${i.length===1?``:i.length+` `}...`);for(let e of r){let r=I[e];r&&(x(`Attachment: Deleting ${r.name} from note #${t?.number}`),await m(k.host,k.token,n.owner,n.repo,r.path,r.sha),x(`Attachment: Deleted ${r.name}`))}Y(i.length===1?`Deleted`:`Deleted ${i.length} attachments`);for(let e of r)I.splice(e,1);R.clear(),L=Math.min(L,Math.max(0,I.length-1));let e=document.getElementById(`attachment-list`);e&&J(e),document.getElementById(`attachment-panel`)?.focus()}catch(e){let t=e instanceof Error?e.message:String(e);b(`Attachment: Delete failed for ${i.join(`, `)}: ${t}`),Y(`Delete failed: ${e instanceof Error?e.message:e}`,!0),document.getElementById(`attachment-panel`)?.focus()}}function Ke(e){return e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(1)} MB`}function Y(e,t=!1){let n=document.getElementById(`status-msg`);n&&(n.textContent=e,n.className=t?`error`:`success`,t||setTimeout(()=>{n.textContent===e&&(n.textContent=``)},2e3))}function X(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}var qe=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,Je=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,Ye=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,Xe=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,Ze=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;function Qe(e){if(Se)return window.postMessage({type:`barouse:clipboard-write`,text:e},`*`),Promise.resolve();if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(e);let t=document.createElement(`textarea`);return t.value=e,t.style.position=`fixed`,t.style.opacity=`0`,document.body.appendChild(t),t.select(),document.execCommand(`copy`),t.remove(),Promise.resolve()}function Z(e,t,n,r){return`https://${e}/${t}/${n}/issues/${r}`}function $e(e,t,n,r){let i=Z(e,t,n,r);return`<a href="${Q(i)}" target="${nt(i)}" class="issue-link">#${r}</a>`}function et(e,t,n){return`${location.origin}${location.pathname}${S({screen:`edit`,owner:e,repo:t,number:n})}`}function tt(e,t,n){document.querySelector(`.copy-url-menu`)?.remove();let r=e.getBoundingClientRect(),i=document.createElement(`div`);i.className=`note-context-menu copy-url-menu`,i.innerHTML=`
    <button class="copy-menu-btn" data-url="${Q(t)}">Notehub URL</button>
    <button class="copy-menu-btn" data-url="${Q(n)}">GitHub URL</button>
  `,i.style.top=`${r.bottom+4}px`,i.style.left=`${r.right}px`,document.body.appendChild(i);let a=()=>{i.remove(),document.removeEventListener(`click`,a)};setTimeout(()=>document.addEventListener(`click`,a),0),i.querySelectorAll(`.copy-menu-btn`).forEach(t=>{t.addEventListener(`click`,n=>{n.stopPropagation(),a();let r=t.dataset.url;Qe(r).then(()=>{e.innerHTML=Ye,setTimeout(()=>{e.innerHTML=qe},1500)})})})}function nt(e){return T?T.hashTarget(e):`_blank`}function Q(e){return e.replace(/&/g,`&amp;`).replace(/"/g,`&quot;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}var rt=`0.28.2`,it=`b234dca42da5`,$=document.createElement(`span`);$.className=`version-badge`,$.id=`version-badge`,$.textContent=`v${rt}`,$.title=it,document.body.appendChild($),Ce();
//# sourceMappingURL=index-DanceUp1.js.map