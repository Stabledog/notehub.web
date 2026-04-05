(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e){return e===`github.com`?`https://api.github.com`:`https://${e}/api/v3`}function t(e){return{Authorization:`Bearer ${e}`,Accept:`application/vnd.github+json`,"Content-Type":`application/json`}}async function n(n,r,i,a){let o=await fetch(`${e(n)}${i}`,{...a,headers:{...t(r),...a?.headers}});if(!o.ok){let e=await o.text();throw Error(`GitHub API ${o.status}: ${e}`)}return o.json()}function r(e,t){return n(e,t,`/user`)}async function i(e,t){return(await n(e,t,`/search/issues?q=is%3Aissue%20label%3Anotehub%20state%3Aopen&sort=updated&order=desc&per_page=100`)).items.map(e=>{let t=e.repository_url.split(`/`),n=t.pop(),r=t.pop();return{...e,owner:r,repo:n}})}function a(e,t,r,i,a){return n(e,t,`/repos/${r}/${i}/issues/${a}`)}function o(e,t,r,i,a,o){return n(e,t,`/repos/${r}/${i}/issues/${a}`,{method:`PATCH`,body:JSON.stringify(o)})}async function s(e,t,r,i,a,o){return await l(e,t,r,i),n(e,t,`/repos/${r}/${i}/issues`,{method:`POST`,body:JSON.stringify({title:a,body:o,labels:[`notehub`]})})}function c(e,t,r,i,a){return n(e,t,`/repos/${r}/${i}/issues/${a}`,{method:`PATCH`,body:JSON.stringify({state:`closed`})})}async function l(e,t,r,i){try{await n(e,t,`/repos/${r}/${i}/labels`,{method:`POST`,body:JSON.stringify({name:`notehub`,color:`1d76db`,description:`notehub note`})})}catch{}}var u=`modulepreload`,d=function(e){return`/notehub.web/`+e},f={},p=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=d(t,n),t in f)return;f[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:u,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},m=`notehub:token`,h=`https://stabledog.github.io/veditor.web`,g,_=`notehub:host`,v=`notehub:defaultRepo`,y=`notehub:pinnedIssue`,b=`🎫 New note`,x=`# New note`;function S(){return localStorage.getItem(v)}function C(){let e=localStorage.getItem(y);if(!e)return null;try{let t=JSON.parse(e);if(t.owner&&t.repo&&typeof t.number==`number`)return t}catch{}return null}function w(){return S()!==null}var T=null,E=null,D=null,O=``,k=``,A=null,j=document.getElementById(`app`);async function M(){let e=document.createElement(`link`);e.rel=`stylesheet`,e.href=`${h}/veditor.css`,document.head.appendChild(e);try{g=await p(()=>import(`${h}/veditor.js`),[])}catch(e){j.innerHTML=`<div class="auth-screen"><h1>notehub</h1><p class="error">Failed to load editor from ${h}/veditor.js: ${e instanceof Error?e.message:e}</p></div>`;return}let t=localStorage.getItem(m),n=localStorage.getItem(_)??`github.com`;t?r(n,t).then(e=>{T={host:n,token:t,username:e.login},w()?I():P()}).catch(()=>N()):N()}function N(e){g.destroyEditor();let t=localStorage.getItem(_)??`github.com`;j.innerHTML=`
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
  `,document.getElementById(`auth-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`host`).value.trim(),n=document.getElementById(`pat`).value.trim();try{let e=await r(t,n);localStorage.setItem(_,t),localStorage.setItem(m,n),T={host:t,token:n,username:e.login},w()?I():P()}catch(e){N(`Authentication failed: ${e instanceof Error?e.message:e}`)}})}function P(e){if(g.destroyEditor(),!T)return;let t=`${T.username}/notehub.default`;j.innerHTML=`
    <div class="auth-screen">
      <h1>notehub</h1>
      <p>Welcome, @${T.username}! Configure your default repository for new notes.</p>
      ${e?`<div class="error">${e}</div>`:``}
      <form id="setup-form">
        <label>Default Repository
          <input type="text" id="setup-repo" value="${t}" placeholder="owner/repo" required />
        </label>
        <label>Pinned Issue Number <span style="color:#6c7086">(optional)</span>
          <input type="number" id="setup-pinned" placeholder="e.g. 7" min="1" />
        </label>
        <button type="submit">Save &amp; Continue</button>
      </form>
    </div>
  `,document.getElementById(`setup-form`).addEventListener(`submit`,e=>{e.preventDefault();let t=document.getElementById(`setup-repo`).value.trim(),n=document.getElementById(`setup-pinned`).value.trim(),r=t.split(`/`);if(r.length!==2||!r[0]||!r[1]){P(`Repository must be in owner/repo format.`);return}if(localStorage.setItem(v,t),n){let e=parseInt(n,10);if(isNaN(e)||e<1){P(`Pinned issue must be a positive number.`);return}localStorage.setItem(y,JSON.stringify({owner:r[0],repo:r[1],number:e}))}else localStorage.removeItem(y);I()})}var F=null;async function I(){if(g.destroyEditor(),F?.(),F=null,E=null,!T)return;let e=[];j.innerHTML=`
    <div class="note-list-screen">
      <header>
        <h1>notehub</h1>
        <div class="header-info">
          <span>@${T.username}</span>
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
      </footer>
    </div>
  `;let t=document.getElementById(`notes-container`),n=0;function r(){let e=t.querySelectorAll(`.note-row`);e.forEach((e,t)=>{e.classList.toggle(`selected`,t===n)}),e[n]?.scrollIntoView({block:`nearest`})}let a=e=>{if(!(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)&&!document.getElementById(`repo-picker-overlay`)){if(e.key===`n`)e.preventDefault(),document.getElementById(`new-note`).click();else if(e.key===`r`)e.preventDefault(),I();else if(e.key===`j`||e.key===`ArrowDown`){e.preventDefault();let i=t.querySelectorAll(`.note-row`);i.length>0&&(n=Math.min(n+1,i.length-1),r())}else if(e.key===`k`||e.key===`ArrowUp`)e.preventDefault(),n>0&&(n--,r());else if(e.key===`Enter`){e.preventDefault();let r=t.querySelectorAll(`.note-row`);r.length>0&&r[n].click()}}};document.addEventListener(`keydown`,a),F=()=>document.removeEventListener(`keydown`,a),document.getElementById(`sign-out`).addEventListener(`click`,()=>{localStorage.removeItem(m),localStorage.removeItem(_),T=null,N()}),document.getElementById(`refresh`).addEventListener(`click`,()=>I());try{if(e=await i(T.host,T.token),A){let t=A;A=null,e.some(e=>e.owner===t.owner&&e.repo===t.repo&&e.number===t.number)||e.unshift(t)}let n=C();if(n){let t=e=>e.owner===n.owner&&e.repo===n.repo&&e.number===n.number;e.sort((e,n)=>t(e)?-1:t(n)?1:0)}if(document.getElementById(`new-note`).addEventListener(`click`,()=>{L(e)}),e.length===0){t.innerHTML=`<p class="empty">No notes found.</p>`;return}t.innerHTML=`
      <table>
        <thead><tr><th>Repo</th><th>#</th><th>Title</th><th>Updated</th><th></th></tr></thead>
        <tbody>
          ${e.map((e,t)=>`
            <tr class="note-row" data-index="${t}">
              <td>${G(e.owner)}/${G(e.repo)}</td>
              <td><a href="${X(Y(T.host,e.owner,e.repo,e.number))}" target="${g.hashTarget(Y(T.host,e.owner,e.repo,e.number))}" class="issue-link" onclick="event.stopPropagation()">${e.number}</a></td>
              <td>${G(e.title)}</td>
              <td>${new Date(e.updated_at).toLocaleDateString(`en-US`,{month:`numeric`,day:`numeric`,year:`2-digit`})}</td>
              <td><button class="copy-url-btn" data-url="${X(Y(T.host,e.owner,e.repo,e.number))}" title="Copy issue URL">${K}</button></td>
              <td><button class="context-menu-btn" data-index="${t}" title="More actions">&#x2026;</button></td>
            </tr>
          `).join(``)}
        </tbody>
      </table>
    `,t.querySelectorAll(`.copy-url-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.dataset.url;navigator.clipboard.writeText(n).then(()=>{e.innerHTML=q,setTimeout(()=>{e.innerHTML=K},1500)})})}),t.querySelectorAll(`.context-menu-btn`).forEach(n=>{n.addEventListener(`click`,r=>{r.stopPropagation(),document.querySelector(`.note-context-menu`)?.remove();let i=parseInt(n.dataset.index,10),a=e[i],o=n.getBoundingClientRect(),s=document.createElement(`div`);s.className=`note-context-menu`,s.innerHTML=`<button class="context-delete-btn">${J} Delete</button>`,s.style.top=`${o.bottom+4}px`,s.style.left=`${o.right}px`,document.body.appendChild(s);let l=()=>{s.remove(),document.removeEventListener(`click`,l)};setTimeout(()=>document.addEventListener(`click`,l),0),s.querySelector(`.context-delete-btn`).addEventListener(`click`,async e=>{e.stopPropagation(),l();try{await c(T.host,T.token,a.owner,a.repo,a.number),t.querySelector(`.note-row[data-index="${i}"]`)?.remove()}catch(e){alert(`Failed to delete note: ${e instanceof Error?e.message:e}`)}})})}),t.querySelectorAll(`.note-row`).forEach(t=>{t.addEventListener(`click`,()=>{let n=parseInt(t.getAttribute(`data-index`),10),r=e[n];z(r.owner,r.repo,r.number)})}),r()}catch(e){document.getElementById(`notes-container`).innerHTML=`<p class="error">Failed to load notes: ${e instanceof Error?e.message:e}</p>`}}function L(e){document.getElementById(`repo-picker-overlay`)?.remove();let t=new Map,n=S();if(n){let[e,r]=n.split(`/`);t.set(n,{owner:e,repo:r})}for(let n of e){let e=`${n.owner}/${n.repo}`;t.has(e)||t.set(e,{owner:n.owner,repo:n.repo})}let r=Array.from(t.entries()).sort((e,t)=>{if(n){if(e[0]===n)return-1;if(t[0]===n)return 1}return e[0].localeCompare(t[0])}),i=document.createElement(`div`);i.id=`repo-picker-overlay`,i.innerHTML=`
    <div class="repo-picker">
      <h2>Select repository</h2>
      <div class="repo-list">
        ${r.map(([e,t])=>`
          <button class="repo-option" data-owner="${X(t.owner)}" data-repo="${X(t.repo)}">${G(e)}</button>
        `).join(``)}
      </div>
      <div class="repo-other">
        <label>Other
          <input type="text" id="repo-other-input" placeholder="owner/repo" />
        </label>
        <button id="repo-other-go">Go</button>
      </div>
    </div>
  `,j.appendChild(i),i.addEventListener(`click`,e=>{e.target===i&&i.remove()});let a=e=>{e.key===`Escape`&&(i.remove(),document.removeEventListener(`keydown`,a))};document.addEventListener(`keydown`,a),i.querySelectorAll(`.repo-option`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.owner,n=e.dataset.repo;i.remove(),document.removeEventListener(`keydown`,a),R(t,n)})});let o=document.getElementById(`repo-other-go`),s=document.getElementById(`repo-other-input`),c=()=>{let e=s.value.trim().split(`/`);if(e.length!==2||!e[0]||!e[1]){s.classList.add(`error`);return}i.remove(),document.removeEventListener(`keydown`,a),R(e[0],e[1])};o.addEventListener(`click`,c),s.addEventListener(`keydown`,e=>{e.key===`Enter`&&c()})}function R(e,t){D={owner:e,repo:t},E=null,O=x,k=b,B(b,x)}async function z(e,t,n){if(T){j.innerHTML=`<div class="editor-screen"><p>Loading note #${n}...</p></div>`;try{let r=await a(T.host,T.token,e,t,n);E={...r,owner:e,repo:t},O=r.body??``,k=r.title,B(r.title,O)}catch(e){j.innerHTML=`<div class="editor-screen"><p class="error">Failed to load note: ${e instanceof Error?e.message:e}</p></div>`}}}function B(e,t){F?.(),F=null,j.innerHTML=`
    <div class="editor-screen">
      <header>
        <button id="back-to-list" title="Back to notes">&larr;</button>
        <input type="text" id="note-title" value="${X(e)}" />
        <span id="note-number">${E?`<a href="${X(Y(T.host,E.owner,E.repo,E.number))}" target="${g.hashTarget(Y(T.host,E.owner,E.repo,E.number))}" class="issue-link">#${E.number}</a>`:`Title`}</span>
        ${E?`<button id="copy-note-url" class="copy-url-btn" title="Copy issue URL">${K}</button>`:``}
        <span id="status-msg"></span>
      </header>
      <div id="editor-container"></div>
    </div>
  `,document.getElementById(`back-to-list`).addEventListener(`click`,()=>{H(!1)});let n=document.getElementById(`copy-note-url`);if(n&&E){let e=Y(T.host,E.owner,E.repo,E.number);n.addEventListener(`click`,()=>{navigator.clipboard.writeText(e).then(()=>{n.innerHTML=q,setTimeout(()=>{n.innerHTML=K},1500)})})}let r=document.getElementById(`note-title`);r.addEventListener(`keydown`,e=>{(e.key===`Escape`||e.key===`Enter`)&&(e.preventDefault(),g.focusEditor())}),g.createEditor(document.getElementById(`editor-container`),t,{onSave:V,onQuit:H},{storagePrefix:`notehub`,normalMappings:{gt:()=>r.focus()}})}async function V(){if(!T)return;let e=g.getEditorContent(),t=document.getElementById(`note-title`).value.trim();if(!E&&D){if(!t){W(`Title required`,!0);return}try{W(`Creating...`);let n=await s(T.host,T.token,D.owner,D.repo,t,e);E={...n,owner:D.owner,repo:D.repo},A=E,D=null,O=n.body??``,k=n.title;let r=document.getElementById(`note-number`);r&&(r.innerHTML=`<a href="${X(Y(T.host,E.owner,E.repo,E.number))}" target="${g.hashTarget(Y(T.host,E.owner,E.repo,E.number))}" class="issue-link">#${E.number}</a>`),W(`Created`)}catch(e){W(`Create failed: ${e instanceof Error?e.message:e}`,!0)}return}if(!E)return;let n={};if(e!==O&&(n.body=e),t!==k&&(n.title=t),Object.keys(n).length===0){W(`No changes`);return}try{W(`Saving...`);let e=await o(T.host,T.token,E.owner,E.repo,E.number,n);O=e.body??``,k=e.title,E={...e,owner:E.owner,repo:E.repo},W(`Saved`)}catch(e){W(`Save failed: ${e instanceof Error?e.message:e}`,!0)}}function H(e){let t=document.getElementById(`note-title`),n=t?t.value.trim()!==k:!1;if(!e&&(g.isEditorDirty(O)||n)){U(`Unsaved changes. Discard?`,()=>I());return}I()}function U(e,t){document.getElementById(`confirm-bar`)?.remove();let n=document.createElement(`div`);n.id=`confirm-bar`,n.innerHTML=`
    <span>${e}</span>
    <span class="confirm-hint">[y]es / [n]o</span>
  `;let r=document.querySelector(`.editor-screen header`);if(!r)return;r.after(n);let i=()=>{n.remove(),document.removeEventListener(`keydown`,a)},a=e=>{e.key===`y`||e.key===`Enter`?(i(),t()):(e.key===`n`||e.key===`Escape`)&&i()};document.addEventListener(`keydown`,a)}function W(e,t=!1){let n=document.getElementById(`status-msg`);n&&(n.textContent=e,n.className=t?`error`:`success`,t||setTimeout(()=>{n.textContent===e&&(n.textContent=``)},2e3))}function G(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}var K=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,q=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,J=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;function Y(e,t,n,r){return`https://${e}/${t}/${n}/issues/${r}`}function X(e){return e.replace(/&/g,`&amp;`).replace(/"/g,`&quot;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}M();