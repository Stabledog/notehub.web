(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e){return e===`github.com`?`https://api.github.com`:`https://${e}/api/v3`}function t(e){return{Authorization:`Bearer ${e}`,Accept:`application/vnd.github+json`,"Content-Type":`application/json`}}async function n(n,r,i,a){let o=await fetch(`${e(n)}${i}`,{...a,headers:{...t(r),...a?.headers}});if(!o.ok){let e=await o.text();throw Error(`GitHub API ${o.status}: ${e}`)}return o.json()}function r(e,t){return n(e,t,`/user`)}async function i(e,t,r,i){try{return await n(e,t,`/repos/${r}/${i}`),!0}catch{return!1}}async function a(e,t){return(await n(e,t,`/search/issues?q=is%3Aissue%20label%3Anotehub%20state%3Aopen&sort=updated&order=desc&per_page=100`)).items.map(e=>{let t=e.repository_url.split(`/`),n=t.pop(),r=t.pop();return{...e,owner:r,repo:n}})}function o(e,t,r,i,a){return n(e,t,`/repos/${r}/${i}/issues/${a}`)}function s(e,t,r,i,a,o){return n(e,t,`/repos/${r}/${i}/issues/${a}`,{method:`PATCH`,body:JSON.stringify(o)})}async function c(e,t,r,i,a,o){return await ee(e,t,r,i),n(e,t,`/repos/${r}/${i}/issues`,{method:`POST`,body:JSON.stringify({title:a,body:o,labels:[`notehub`]})})}function l(e,t,r,i,a){return n(e,t,`/repos/${r}/${i}/issues/${a}`,{method:`PATCH`,body:JSON.stringify({state:`closed`})})}function u(e){let[t,n]=e.split(`/`);return{owner:t,repo:`${n}.attachments`}}function d(e,t,n,r){return e===`github.com`?`https://raw.githubusercontent.com/${t}/${n}/main/${r}`:`https://${e}/raw/${t}/${n}/main/${r}`}async function f(e,t,r,i){let a=new Map;try{let o=await n(e,t,`/repos/${r}/${i}/git/trees/main?recursive=1`);for(let e of o.tree){if(e.type!==`blob`)continue;let t=e.path.split(`/`);if(t.length<4)continue;let n=`${t[0]}/${t[1]}/${t[2]}`;a.set(n,(a.get(n)??0)+1)}}catch{}return a}async function p(e,t,r,i,a,o,s){try{return await n(e,t,`/repos/${r}/${i}/contents/${a}/${o}/${s}`)}catch(e){if(e instanceof Error&&e.message.includes(`404`))return[];throw e}}async function m(e,t,r,i,a,o,s,c,l,u){let d={message:`notehub: attach ${c} to ${a}/${o}#${s}`,content:l};return u&&(d.sha=u),(await n(e,t,`/repos/${r}/${i}/contents/${a}/${o}/${s}/${encodeURIComponent(c)}`,{method:`PUT`,body:JSON.stringify(d)})).content}async function h(t,n,r,i,a){let o=await fetch(`${e(t)}/repos/${r}/${i}/contents/${a}`,{headers:{Authorization:`Bearer ${n}`,Accept:`application/vnd.github.raw`}});if(!o.ok){let e=await o.text();throw Error(`GitHub API ${o.status}: ${e}`)}return{blob:await o.blob(),filename:a.split(`/`).pop()}}async function g(e,t,r,i,a,o){await n(e,t,`/repos/${r}/${i}/contents/${a}`,{method:`DELETE`,body:JSON.stringify({message:`notehub: remove ${a.split(`/`).pop()}`,sha:o})})}async function ee(e,t,r,i){try{await n(e,t,`/repos/${r}/${i}/labels`,{method:`POST`,body:JSON.stringify({name:`notehub`,color:`1d76db`,description:`notehub note`})})}catch{}}var _=`_app_debug_logs`,te=1e3;function ne(){try{let e=localStorage.getItem(_);return e?JSON.parse(e):[]}catch{return[]}}function re(e){try{let t=e.slice(-te);localStorage.setItem(_,JSON.stringify(t))}catch{}}function v(e,t){let n={timestamp:new Date().toISOString(),level:e,message:t},r=ne();r.push(n),re(r),console[e===`warn`?`warn`:e===`error`?`error`:`log`](`[${e.toUpperCase()}] ${t}`)}function y(e){v(`error`,e)}function ie(e){v(`warn`,e)}function b(e){v(`info`,e)}function ae(){let e=ne();return e.length===0?`(no logs)`:e.map(e=>`[${new Date(e.timestamp).toLocaleTimeString()}] ${e.level.toUpperCase()}: ${e.message}`).join(`
`)}function oe(){try{localStorage.removeItem(_)}catch{}}function se(){let e=document.createElement(`div`);e.id=`log-viewer-modal`,e.style.cssText=`
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
  `,s.addEventListener(`click`,()=>{i.value=ae(),i.scrollTop=i.scrollHeight}),a.appendChild(s),t.appendChild(n),t.appendChild(i),t.appendChild(a),e.appendChild(t),e.addEventListener(`click`,t=>{t.target===e&&e.remove()}),e}var ce=`modulepreload`,le=function(e){return`/notehub.web/`+e},ue={},de=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=le(t,n),t in ue)return;ue[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:ce,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},x=`notehub:token`,S=window.matchMedia(`(pointer: coarse)`).matches,fe=`https://stabledog.github.io/veditor.web/`,C,w=`notehub:host`,T=`notehub:defaultRepo`,E=`notehub:pinnedIssue`,pe=`🎫 New note`,me=`# New note`;function D(){return localStorage.getItem(T)}function he(){let e=localStorage.getItem(E);if(!e)return null;try{let t=JSON.parse(e);if(t.owner&&t.repo&&typeof t.number==`number`)return t}catch{}return null}function ge(){return D()!==null}function O(){let e=D();return e?u(e):null}async function _e(){if(!k)return null;let e=O();return e?await i(k.host,k.token,e.owner,e.repo)?e:(J(`Attachments repo "${e.owner}/${e.repo}" not found. Create it on GitHub to use attachments.`,!0),null):(J(`No default repo configured — cannot use attachments.`,!0),null)}var k=null,A=null,j=null,M=``,N=``,P=null,F=null,I=null,L=[],R=0,z=new Set,B=document.getElementById(`app`);async function ve(){if(!S){let e=document.createElement(`link`);e.rel=`stylesheet`,e.href=`${fe}/veditor.css`,document.head.appendChild(e);try{C=await de(()=>import(`${fe}/veditor.js`),[]);let e=document.getElementById(`version-badge`);e&&C.VERSION&&(e.textContent+=` \u00b7 ve${C.VERSION}`)}catch(e){y(`Failed to load editor from ${fe}/veditor.js: ${e instanceof Error?e.message:e}`)}}let e=localStorage.getItem(x),t=localStorage.getItem(w)??`github.com`;e&&ge()?r(t,e).then(n=>{k={host:t,token:e,username:n.login},U()}).catch(()=>V()):V()}function V(e){I?.destroy(),I=null,C?.destroyEditor();let t=localStorage.getItem(w)??`github.com`,n=localStorage.getItem(x)??``,i=localStorage.getItem(T)??``,a=he();B.innerHTML=`
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
  `,document.getElementById(`settings-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`settings-host`).value.trim(),n=document.getElementById(`settings-pat`).value.trim(),i=document.getElementById(`settings-repo`).value.trim(),a=document.getElementById(`settings-pinned`).value.trim(),o=i.split(`/`);if(o.length!==2||!o[0]||!o[1]){V(`Repository must be in owner/repo format.`);return}try{b(`Settings: Validating token for host=${t}`);let e=await r(t,n);if(b(`Settings: Token validated for user ${e.login} on ${t}`),localStorage.setItem(w,t),localStorage.setItem(x,n),localStorage.setItem(T,i),k={host:t,token:n,username:e.login},a){let e=parseInt(a,10);if(isNaN(e)||e<1){V(`Pinned issue must be a positive number.`);return}localStorage.setItem(E,JSON.stringify({owner:o[0],repo:o[1],number:e}))}else localStorage.removeItem(E);U()}catch(e){y(`Settings: Token validation failed for host=${t}: ${e instanceof Error?e.message:e}`),V(`Authentication failed: ${e instanceof Error?e.message:e}`)}})}var H=null;async function U(){if(I?.destroy(),I=null,C?.destroyEditor(),H?.(),H=null,A=null,!k)return;let e=[];B.innerHTML=`
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
  `;let t=document.getElementById(`notes-container`),n=0;function r(){let e=t.querySelectorAll(`.note-row`);e.forEach((e,t)=>{e.classList.toggle(`selected`,t===n)}),e[n]?.scrollIntoView({block:`nearest`})}let i=e=>{if(!(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)&&!c&&!document.getElementById(`repo-picker-overlay`))if(e.key===`n`)e.preventDefault(),document.getElementById(`new-note`).click();else if(e.key===`r`)e.preventDefault(),U();else if(e.key===`j`||e.key===`ArrowDown`){e.preventDefault();let i=t.querySelectorAll(`.note-row`);i.length>0&&(n=Math.min(n+1,i.length-1),r())}else if(e.key===`k`||e.key===`ArrowUp`)e.preventDefault(),n>0&&(n--,r());else if(e.key===`Enter`){e.preventDefault();let r=t.querySelectorAll(`.note-row`);r.length>0&&r[n].click()}else e.key===`Escape`&&s?(e.preventDefault(),h()):e.key===`/`&&(e.preventDefault(),p())};document.addEventListener(`keydown`,i),H=()=>document.removeEventListener(`keydown`,i);let o=null,s=!1,c=!1,u=!1,d=null,f=``;function p(){if(s)return;s=!0,c=!0,f=t.innerHTML;let e=document.createElement(`div`);e.className=`search-bar`,e.id=`search-bar`,e.innerHTML=`
      <span class="search-slash">/</span>
      <div id="search-input-container"></div>
      <button id="search-regex-toggle" class="search-regex-toggle" title="Toggle regex (Ctrl+R)">.*</button>
      <span id="search-count" class="search-count"></span>
    `,t.parentElement.insertBefore(e,t),e.addEventListener(`focusin`,()=>{c=!0}),e.addEventListener(`focusout`,()=>{c=!1}),o=C.createVimInput(document.getElementById(`search-input-container`),{placeholder:`Search notes...`,initialInsert:!0,onEscape:h,onChange:e=>{d&&clearTimeout(d),d=setTimeout(()=>g(e),150)},onEnter:()=>{document.activeElement?.blur()},storagePrefix:`notehub`}),o.focus(),m(),document.getElementById(`search-regex-toggle`).addEventListener(`click`,()=>{u=!u,m(),o&&g(o.getValue())}),e.addEventListener(`keydown`,e=>{e.key===`r`&&e.ctrlKey&&(e.preventDefault(),u=!u,m(),o&&g(o.getValue()))})}function m(){let e=document.getElementById(`search-regex-toggle`);e&&e.classList.toggle(`active`,u)}function h(){s&&(s=!1,c=!1,d&&=(clearTimeout(d),null),o?.destroy(),o=null,document.getElementById(`search-bar`)?.remove(),f&&(t.innerHTML=f,f=``,te()),n=0,r())}function g(i){let a=document.getElementById(`search-count`);if(!i.trim()){f&&(t.innerHTML=f,te()),a&&(a.textContent=``),n=0,r();return}let o=ee(i,u,e);a&&(a.textContent=`${o.length} match${o.length===1?``:`es`}`),_(o)}function ee(e,t,n){let r;if(t){let t;try{t=new RegExp(e,`gi`)}catch{let e=document.getElementById(`search-count`);return e&&(e.textContent=`invalid regex`,e.classList.add(`error`)),[]}let n=document.getElementById(`search-count`);n&&n.classList.remove(`error`),r=e=>{t.lastIndex=0;let n=t.exec(e);return n?{index:n.index,length:n[0].length}:null}}else{let t=e.toLowerCase();r=e=>{let n=e.toLowerCase().indexOf(t);return n>=0?{index:n,length:t.length}:null}}let i=[];for(let e=0;e<n.length;e++){let t=n[e],a=t.body??``,o=r(t.title),s=r(a);if(!o&&!s)continue;let c=s??o,l=s?a:t.title,u=Math.max(0,c.index-40),d=Math.min(l.length,c.index+c.length+40),f=Y(l.slice(u,c.index)),p=Y(l.slice(c.index,c.index+c.length)),m=Y(l.slice(c.index+c.length,d)),h=`${u>0?`...`:``}${f}<mark>${p}</mark>${m}${d<l.length?`...`:``}`;i.push({note:t,index:e,context:h})}return i}function _(i){if(i.length===0){t.innerHTML=`<p class="empty">No matches found.</p>`;return}t.innerHTML=`
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
    `,n=0,r(),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,()=>{let n=parseInt(t.getAttribute(`data-index`),10),r=e[n];S?window.open(Z(k.host,r.owner,r.repo,r.number)+`#new_comment_field`,`_blank`):W(r.owner,r.repo,r.number)})})}function te(){t.querySelectorAll(`.copy-url-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.dataset.url;navigator.clipboard.writeText(n).then(()=>{e.innerHTML=Le,setTimeout(()=>{e.innerHTML=X},1500)})})}),t.querySelectorAll(`.context-menu-btn`).forEach(n=>{n.addEventListener(`click`,r=>{r.stopPropagation(),document.querySelector(`.note-context-menu`)?.remove();let i=parseInt(n.dataset.index,10),a=e[i],o=n.getBoundingClientRect(),s=document.createElement(`div`);s.className=`note-context-menu`,s.innerHTML=`
          <button class="context-github-btn">${ze} Edit on GitHub</button>
          <button class="context-delete-btn">${Re} Delete</button>
        `,s.style.top=`${o.bottom+4}px`,s.style.left=`${o.right}px`,document.body.appendChild(s);let c=()=>{s.remove(),document.removeEventListener(`click`,c)};setTimeout(()=>document.addEventListener(`click`,c),0),s.querySelector(`.context-github-btn`).addEventListener(`click`,e=>{e.stopPropagation(),c(),window.open(Z(k.host,a.owner,a.repo,a.number)+`#new_comment_field`,`_blank`)}),s.querySelector(`.context-delete-btn`).addEventListener(`click`,async e=>{e.stopPropagation(),c();try{await l(k.host,k.token,a.owner,a.repo,a.number),t.querySelector(`.note-row[data-index="${i}"]`)?.remove()}catch(e){alert(`Failed to delete note: ${e instanceof Error?e.message:e}`)}})})}),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,()=>{let n=parseInt(t.getAttribute(`data-index`),10),r=e[n];S?window.open(Z(k.host,r.owner,r.repo,r.number)+`#new_comment_field`,`_blank`):W(r.owner,r.repo,r.number)})})}document.getElementById(`settings-btn`).addEventListener(`click`,()=>V()),document.getElementById(`sign-out`).addEventListener(`click`,()=>{localStorage.removeItem(x),localStorage.removeItem(w),k=null,V()}),document.getElementById(`refresh`).addEventListener(`click`,()=>U()),document.getElementById(`logs-btn`).addEventListener(`click`,()=>{document.body.appendChild(se())});try{if(b(`Note list: Fetching notes for all configured repos`),e=await a(k.host,k.token),b(`Note list: Loaded ${e.length} notes`),F){let t=F;F=null,e.some(e=>e.owner===t.owner&&e.repo===t.repo&&e.number===t.number)||(ie(`Note list: Search API may not have indexed newly created note yet; using cache`),e.unshift(t))}let n=he();if(n){let t=e=>e.owner===n.owner&&e.repo===n.repo&&e.number===n.number;e.sort((e,n)=>t(e)?-1:t(n)?1:0)}if(document.getElementById(`new-note`).addEventListener(`click`,()=>{be(e)}),e.length===0){t.innerHTML=`<p class="empty">No notes found.</p>`;return}t.innerHTML=`
      <table>
        <thead><tr><th>Title</th><th>#</th><th></th><th>Updated</th><th></th><th>Repo</th></tr></thead>
        <tbody>
          ${e.map((e,t)=>`
            <tr class="note-row" data-index="${t}">
              <td>${Y(e.title)}<span class="attachment-count-badge" data-owner="${Q(e.owner)}" data-repo="${Q(e.repo)}" data-issue="${e.number}"></span></td>
              <td><a href="${Q(Z(k.host,e.owner,e.repo,e.number))}" target="${Be(Z(k.host,e.owner,e.repo,e.number))}" class="issue-link" onclick="event.stopPropagation()">${e.number}</a></td>
              <td><button class="copy-url-btn" data-url="${Q(Z(k.host,e.owner,e.repo,e.number))}" title="Copy issue URL">${X}</button></td>
              <td>${new Date(e.updated_at).toLocaleDateString(`en-US`,{month:`numeric`,day:`numeric`,year:`2-digit`})}</td>
              <td><button class="context-menu-btn" data-index="${t}" title="More actions">&#x2026;</button></td>
              <td><span title="${Q(e.owner)}/${Q(e.repo)}">${Y(e.repo)}</span></td>
            </tr>
          `).join(``)}
        </tbody>
      </table>
    `,t.querySelectorAll(`.copy-url-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.dataset.url;navigator.clipboard.writeText(n).then(()=>{e.innerHTML=Le,setTimeout(()=>{e.innerHTML=X},1500)})})}),t.querySelectorAll(`.context-menu-btn`).forEach(n=>{n.addEventListener(`click`,r=>{r.stopPropagation(),document.querySelector(`.note-context-menu`)?.remove();let i=parseInt(n.dataset.index,10),a=e[i],o=n.getBoundingClientRect(),s=document.createElement(`div`);s.className=`note-context-menu`,s.innerHTML=`
          <button class="context-github-btn">${ze} Edit on GitHub</button>
          <button class="context-delete-btn">${Re} Delete</button>
        `,s.style.top=`${o.bottom+4}px`,s.style.left=`${o.right}px`,document.body.appendChild(s);let c=()=>{s.remove(),document.removeEventListener(`click`,c)};setTimeout(()=>document.addEventListener(`click`,c),0),s.querySelector(`.context-github-btn`).addEventListener(`click`,e=>{e.stopPropagation(),c(),window.open(Z(k.host,a.owner,a.repo,a.number)+`#new_comment_field`,`_blank`)}),s.querySelector(`.context-delete-btn`).addEventListener(`click`,async e=>{e.stopPropagation(),c();try{await l(k.host,k.token,a.owner,a.repo,a.number),t.querySelector(`.note-row[data-index="${i}"]`)?.remove()}catch(e){alert(`Failed to delete note: ${e instanceof Error?e.message:e}`)}})})}),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,()=>{let n=parseInt(t.getAttribute(`data-index`),10),r=e[n];S?window.open(Z(k.host,r.owner,r.repo,r.number)+`#new_comment_field`,`_blank`):W(r.owner,r.repo,r.number)})}),r(),ye(e).catch(()=>{})}catch(e){let t=e instanceof Error?e.message:String(e);y(`Note list: Failed to load notes: ${t}`),document.getElementById(`notes-container`).innerHTML=`<p class="error">Failed to load notes: ${t}</p>`}}async function ye(e){if(!k)return;let t=O();if(!t)return;let n=await f(k.host,k.token,t.owner,t.repo);document.querySelectorAll(`.attachment-count-badge`).forEach(e=>{let t=`${e.dataset.owner}/${e.dataset.repo}/${e.dataset.issue}`,r=n.get(t);r&&(e.textContent=` 📎${r}`)})}function be(e){document.getElementById(`repo-picker-overlay`)?.remove();let t=new Map,n=D();if(n){let[e,r]=n.split(`/`);t.set(n,{owner:e,repo:r})}for(let n of e){let e=`${n.owner}/${n.repo}`;t.has(e)||t.set(e,{owner:n.owner,repo:n.repo})}let r=Array.from(t.entries()).sort((e,t)=>{if(n){if(e[0]===n)return-1;if(t[0]===n)return 1}return e[0].localeCompare(t[0])}),i=document.createElement(`div`);i.id=`repo-picker-overlay`,i.innerHTML=`
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
  `,B.appendChild(i),i.addEventListener(`click`,e=>{e.target===i&&i.remove()});let a=e=>{e.key===`Escape`&&(i.remove(),document.removeEventListener(`keydown`,a))};document.addEventListener(`keydown`,a),i.querySelectorAll(`.repo-option`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.owner,n=e.dataset.repo;i.remove(),document.removeEventListener(`keydown`,a),xe(t,n)})});let o=document.getElementById(`repo-other-go`),s=document.getElementById(`repo-other-input`),c=()=>{let e=s.value.trim().split(`/`);if(e.length!==2||!e[0]||!e[1]){s.classList.add(`error`);return}i.remove(),document.removeEventListener(`keydown`,a),xe(e[0],e[1])};o.addEventListener(`click`,c),s.addEventListener(`keydown`,e=>{e.key===`Enter`&&c()})}async function xe(e,t){if(S){window.open(`https://${k.host}/${e}/${t}/issues/new`,`_blank`);return}if(k){if(!await i(k.host,k.token,e,t)){y(`Auth: Repo validation failed for ${e}/${t}`),alert(`Repository "${e}/${t}" not found. Check the owner and repo name.`);return}j={owner:e,repo:t},A=null,M=me,N=pe,P=null,Se(pe,me)}}async function W(e,t,n){if(k){B.innerHTML=`<div class="editor-screen"><p>Loading note #${n}...</p></div>`;try{b(`Note: Opening note #${n} from ${e}/${t}`);let r=await o(k.host,k.token,e,t,n);b(`Note: Loaded note #${n}: "${r.title}"`),A={...r,owner:e,repo:t},M=r.body??``,N=r.title,P=r.updated_at,Se(r.title,M)}catch(e){let t=e instanceof Error?e.message:String(e);y(`Note: Failed to load note #${n}: ${t}`),B.innerHTML=`<div class="editor-screen"><p class="error">Failed to load note: ${t}</p></div>`}}}function Se(e,t){H?.(),H=null,B.innerHTML=`
    <div class="editor-screen">
      <header>
        <button id="back-to-list" title="Back to notes">&larr;</button>
        <div id="note-title-container"></div>
        <span id="note-number">${A?`<a href="${Q(Z(k.host,A.owner,A.repo,A.number))}" target="${Be(Z(k.host,A.owner,A.repo,A.number))}" class="issue-link">#${A.number}</a>`:`Title`}</span>
        ${A?`<button id="copy-note-url" class="copy-url-btn" title="Copy issue URL">${X}</button>`:``}
        ${A?`<button id="attachment-toggle-btn" class="attachment-toggle-btn" title="Attachments (ga)">${Ie}</button>`:``}
        ${A?`<button id="delete-note-btn" class="delete-note-btn" title="Delete note">${Re}</button>`:``}
        <span id="status-msg"></span>
      </header>
      <div id="editor-container"></div>
    </div>
  `,document.getElementById(`back-to-list`).addEventListener(`click`,()=>{C.requestQuit()});let n=document.getElementById(`copy-note-url`);if(n&&A){let e=Z(k.host,A.owner,A.repo,A.number);n.addEventListener(`click`,()=>{navigator.clipboard.writeText(e).then(()=>{n.innerHTML=Le,setTimeout(()=>{n.innerHTML=X},1500)})})}if(document.getElementById(`attachment-toggle-btn`)?.addEventListener(`click`,()=>Ee()),document.getElementById(`delete-note-btn`)?.addEventListener(`click`,()=>we()),I=C.createVimInput(document.getElementById(`note-title-container`),{value:e,onEnter:()=>C.focusEditor(),onEscape:()=>C.focusEditor(),storagePrefix:`notehub`}),C.createEditor(document.getElementById(`editor-container`),t,{onSave:Ce,onQuit:()=>U(),isAppDirty:()=>I.getValue().trim()!==N},{storagePrefix:`notehub`,normalMappings:{gt:()=>I.focus(),ga:()=>Ee()}}),A){let e=A,t=O();t&&p(k.host,k.token,t.owner,t.repo,e.owner,e.repo,e.number).then(e=>{e.length>0&&document.querySelector(`.editor-screen`)&&De()}).catch(()=>{})}}async function Ce(){if(!k)return;let e=C.getEditorContent(),t=(I?.getValue()??``).trim();if(!A&&j){if(!t){J(`Title required`,!0);return}try{J(`Creating...`),b(`Note: Creating new note in ${j.owner}/${j.repo}`);let n=await c(k.host,k.token,j.owner,j.repo,t,e);b(`Note: Created new note: #${n.number}`),A={...n,owner:j.owner,repo:j.repo},F=A,j=null,M=n.body??``,N=n.title,P=n.updated_at;let r=document.getElementById(`note-number`);r&&(r.innerHTML=`<a href="${Q(Z(k.host,A.owner,A.repo,A.number))}" target="${Be(Z(k.host,A.owner,A.repo,A.number))}" class="issue-link">#${A.number}</a>`),J(`Created`)}catch(e){let t=e instanceof Error?e.message:String(e);y(`Note: Failed to create note: ${t}`),J(`Create failed: ${t}`,!0)}return}if(!A)return;let n={};if(e!==M&&(n.body=e),t!==N&&(n.title=t),Object.keys(n).length===0){J(`No changes`);return}try{J(`Saving...`),b(`Note: Save initiated for #${A.number}`);let e=await o(k.host,k.token,A.owner,A.repo,A.number);if(P&&e.updated_at!==P&&(ie(`Note: Remote conflict detected for #${A.number}; user chose to overwrite`),!await Te())){b(`Note: Save cancelled due to conflict`),J(`Save cancelled`);return}let t=await s(k.host,k.token,A.owner,A.repo,A.number,n);b(`Note: Save successful for #${A.number}: "${t.title}"`),M=t.body??``,N=t.title,P=t.updated_at,A={...t,owner:A.owner,repo:A.repo},J(`Saved`)}catch(e){let t=e instanceof Error?e.message:String(e);y(`Note: Save failed for #${A.number}: ${t}`),J(`Save failed: ${t}`,!0)}}async function we(){if(!(!k||!A)&&confirm(`Delete note "#${A.number}: ${N}"?`))try{if(J(`Deleting...`),(await l(k.host,k.token,A.owner,A.repo,A.number)).state!==`closed`){let e=`Delete failed: note was not closed`;J(e,!0),y(e);return}b(`Deleted note #${A.number}: ${N}`),J(`Deleted`),setTimeout(()=>{U()},500)}catch(e){let t=`Delete failed: ${e instanceof Error?e.message:e}`;J(t,!0),y(t)}}function Te(){return new Promise(e=>{let t=document.createElement(`div`);t.id=`conflict-overlay`,t.innerHTML=`
      <div class="conflict-dialog">
        <h3>Note changed</h3>
        <p>This note has been modified since you opened it. Saving will overwrite those changes.</p>
        <div class="conflict-actions">
          <button id="conflict-cancel">Cancel</button>
          <button id="conflict-overwrite" class="danger">Overwrite</button>
        </div>
      </div>
    `,document.body.appendChild(t);let n=n=>{t.remove(),document.removeEventListener(`keydown`,r),e(n)};function r(e){e.key===`Escape`&&n(!1)}t.querySelector(`#conflict-cancel`).addEventListener(`click`,()=>n(!1)),t.querySelector(`#conflict-overwrite`).addEventListener(`click`,()=>n(!0)),t.addEventListener(`click`,e=>{e.target===t&&n(!1)}),document.addEventListener(`keydown`,r)})}function Ee(){document.getElementById(`attachment-panel`)?G():De()}function G(){document.getElementById(`attachment-panel`)?.remove(),L=[],R=0,z.clear(),C?.focusEditor()}async function De(){if(!A||!k)return;let e=document.querySelector(`.editor-screen`);if(!e)return;let t=O(),n=t&&k&&A?`https://${k.host}/${t.owner}/${t.repo}/tree/main/${A.owner}/${A.repo}/${A.number}`:``,r=document.createElement(`div`);r.id=`attachment-panel`,r.className=`attachment-panel`,r.tabIndex=0,r.innerHTML=`
    <div class="attachment-panel-header">
      <span class="attachment-panel-title">
        ${Ie} Attachments
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
  `,e.appendChild(r),r.focus(),document.getElementById(`attachment-close-btn`).addEventListener(`click`,e=>{e.stopPropagation(),G()}),r.querySelectorAll(`.footer-action[data-action]`).forEach(e=>{let t=e.dataset.action;t!==`navigate`&&(e.style.cursor=`pointer`,e.addEventListener(`click`,async e=>{e.stopPropagation(),t===`select`?Ne():t===`upload`?await Ae():t===`download`?await Me():t===`preview`?await q():t===`delete`?await Pe():t===`close`&&G(),r.focus()}))}),r.addEventListener(`keydown`,async e=>{e.key===`Escape`?(e.preventDefault(),G()):e.key===`j`||e.key===`ArrowDown`?(e.preventDefault(),ke(1)):e.key===`k`||e.key===`ArrowUp`?(e.preventDefault(),ke(-1)):e.key===`a`?(e.preventDefault(),await Ae()):e.key===`Enter`||e.key===`d`?(e.preventDefault(),await Me()):e.key===`p`?(e.preventDefault(),await q()):e.key===` `?(e.preventDefault(),Ne()):e.key===`x`&&(e.preventDefault(),await Pe())}),await Oe()}async function Oe(){if(!A||!k)return;let e=document.getElementById(`attachment-list`);if(!e)return;let t=await _e();if(!t){e.innerHTML=`<p class="attachment-error">Attachments repo not available.</p>`;return}try{L=await p(k.host,k.token,t.owner,t.repo,A.owner,A.repo,A.number)}catch(t){e.innerHTML=`<p class="attachment-error">Failed to load: ${t instanceof Error?t.message:t}</p>`;return}R=0,K(e)}function K(e){if(L.length===0){e.innerHTML=`<p class="attachment-empty">No attachments yet. Press <kbd>a</kbd> to upload.</p>`;return}e.innerHTML=L.map((e,t)=>{let n=t===R,r=z.has(t);return`
    <div class="${[`attachment-row`,n?`selected`:``,r?`multi-selected`:``].filter(Boolean).join(` `)}" data-index="${t}">
      <span class="attachment-checkbox">${r?`☑`:`☐`}</span>
      <span class="attachment-name" title="Click to preview, Ctrl+click to download">${Y(e.name)}</span>
      <span class="attachment-size">${Fe(e.size)}</span>
    </div>`}).join(``);let t=!1,n=document.getElementById(`attachment-panel`);e.addEventListener(`mousedown`,()=>{t=n===document.activeElement}),e.querySelectorAll(`.attachment-row`).forEach(r=>{let i=parseInt(r.dataset.index,10);r.querySelector(`.attachment-checkbox`)?.addEventListener(`click`,r=>{if(r.stopPropagation(),!t){n?.focus();return}R=i,z.has(i)?z.delete(i):z.add(i),K(e),n?.focus()}),r.querySelector(`.attachment-name`)?.addEventListener(`click`,async r=>{if(r.stopPropagation(),!t){n?.focus();return}R=i,K(e),r.ctrlKey||r.metaKey?await je(i):await q(),n?.focus()}),r.addEventListener(`click`,()=>{if(!t){n?.focus();return}R=i,K(e),n?.focus()})}),e.querySelector(`.attachment-row.selected`)?.scrollIntoView({block:`nearest`})}function ke(e){if(L.length===0)return;R=Math.max(0,Math.min(L.length-1,R+e));let t=document.getElementById(`attachment-list`);t&&K(t)}async function Ae(){if(!A||!k)return;let e=await _e();if(!e)return;let t=document.createElement(`input`);t.type=`file`,t.multiple=!0,t.onchange=async()=>{let n=Array.from(t.files||[]);if(n.length===0)return;let r={};try{let t=await p(k.host,k.token,e.owner,e.repo,A.owner,A.repo,A.number);r=Object.fromEntries(t.map(e=>[e.name,e.sha]))}catch{}let i=[],a=[];for(let t of n)try{J(`Uploading ${i.length+1}/${n.length}...`),b(`Attachment: Uploading ${t.name}`);let a=await t.arrayBuffer(),o=new Uint8Array(a),s=8192,c=``;for(let e=0;e<o.length;e+=s)c+=String.fromCharCode(...o.subarray(e,e+s));let l=btoa(c),u=await m(k.host,k.token,e.owner,e.repo,A.owner,A.repo,A.number,t.name,l,r[t.name]);b(`Attachment: Uploaded ${t.name} (${t.size} bytes)`);let f=d(k.host,e.owner,e.repo,`${A.owner}/${A.repo}/${A.number}/${t.name}`);i.push(`[${t.name}](${f})`);let p=L.findIndex(e=>e.name===t.name);p>=0?L[p]=u:L.push(u)}catch(e){let n=e instanceof Error?e.message:String(e);y(`Attachment: Upload failed for ${t.name}: ${n}`),a.push(t.name)}let o=document.getElementById(`attachment-list`);if(o&&K(o),i.length>0){navigator.clipboard.writeText(i.join(`
`));let e=i.length===1?`Uploaded — link copied`:`Uploaded ${i.length} files — links copied`;J(a.length>0?`${e} (${a.length} failed)`:e)}else J(`Upload failed: ${a.join(`, `)}`,!0);document.getElementById(`attachment-panel`)?.focus()},t.click()}async function je(e){let t=L[e];if(!t||!A||!k)return;let n=O();if(n)try{J(`Downloading...`);let{blob:e,filename:r}=await h(k.host,k.token,n.owner,n.repo,t.path),i=URL.createObjectURL(e),a=document.createElement(`a`);a.href=i,a.download=r,a.click(),setTimeout(()=>URL.revokeObjectURL(i),100),J(``)}catch(e){J(`Download failed: ${e instanceof Error?e.message:e}`,!0)}}async function Me(){await je(R)}async function q(){let e=L[R];if(!e||!A||!k)return;let t=O();if(t)try{J(`Loading preview...`);let{blob:n}=await h(k.host,k.token,t.owner,t.repo,e.path),r=e.name.split(`.`).pop()?.toLowerCase()??``,i={jpg:`image/jpeg`,jpeg:`image/jpeg`,png:`image/png`,gif:`image/gif`,webp:`image/webp`,svg:`image/svg+xml`,bmp:`image/bmp`,pdf:`application/pdf`,txt:`text/plain`,md:`text/plain`,json:`application/json`,csv:`text/csv`,html:`text/html`},a=i[r]?new Blob([n],{type:i[r]}):n,o=URL.createObjectURL(a);window.open(o,`_blank`),setTimeout(()=>URL.revokeObjectURL(o),6e4),J(``)}catch(e){J(`Preview failed: ${e instanceof Error?e.message:e}`,!0)}}function Ne(){if(L.length===0)return;z.has(R)?z.delete(R):z.add(R);let e=document.getElementById(`attachment-list`);e&&K(e)}async function Pe(){if(!A||!k)return;let e=O();if(!e)return;let t=z.size>0?[...z].sort((e,t)=>t-e):[R],n=t.map(e=>L[e]?.name).filter(Boolean);if(n.length===0)return;let r=n.length===1?`Delete "${n[0]}"?`:`Delete ${n.length} attachments?\n${n.join(`
`)}`;if(!confirm(r)){document.getElementById(`attachment-panel`)?.focus();return}try{J(`Deleting ${n.length===1?``:n.length+` `}...`);for(let n of t){let t=L[n];t&&(b(`Attachment: Deleting ${t.name} from note #${A?.number}`),await g(k.host,k.token,e.owner,e.repo,t.path,t.sha),b(`Attachment: Deleted ${t.name}`))}J(n.length===1?`Deleted`:`Deleted ${n.length} attachments`);for(let e of t)L.splice(e,1);z.clear(),R=Math.min(R,Math.max(0,L.length-1));let r=document.getElementById(`attachment-list`);r&&K(r),document.getElementById(`attachment-panel`)?.focus()}catch(e){let t=e instanceof Error?e.message:String(e);y(`Attachment: Delete failed for ${n.join(`, `)}: ${t}`),J(`Delete failed: ${e instanceof Error?e.message:e}`,!0),document.getElementById(`attachment-panel`)?.focus()}}function Fe(e){return e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(1)} MB`}function J(e,t=!1){let n=document.getElementById(`status-msg`);n&&(n.textContent=e,n.className=t?`error`:`success`,t||setTimeout(()=>{n.textContent===e&&(n.textContent=``)},2e3))}function Y(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}var X=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,Ie=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,Le=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,Re=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,ze=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;function Z(e,t,n,r){return`https://${e}/${t}/${n}/issues/${r}`}function Be(e){return C?C.hashTarget(e):`_blank`}function Q(e){return e.replace(/&/g,`&amp;`).replace(/"/g,`&quot;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}var Ve=`0.7.0`,$=document.createElement(`span`);$.className=`version-badge`,$.id=`version-badge`,$.textContent=`v${Ve}`,document.body.appendChild($),ve();
//# sourceMappingURL=index-DX46-NXH.js.map