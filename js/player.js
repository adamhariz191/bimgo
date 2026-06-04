function logoutApp() { 
    activeSessionEmail = null; profile = null; progress = {}; 
    ss("bimgo_session", null); 
    applyLanguageStrings(); 
    showScreen("s-auth"); 
}

function renderProfile(){ 
  if(!profile) return; 
  document.getElementById("prof-avatar").textContent=profile.avatar; 
  document.getElementById("prof-name").textContent=profile.username; 
  document.getElementById("prof-sub").textContent=`${profile.xp||0} XP · ${profile.streak||1} 🔥 hari`; 
  setProfileTab(profileTab); 
}

function setProfileTab(tabName){ 
  profileTab=tabName; 
  document.getElementById('t-tab-stat').className = `tab ${tabName==='stats'?'active':''}`;
  document.getElementById('t-tab-badge').className = `tab ${tabName==='badges'?'active':''}`;
  document.getElementById('t-tab-rank').className = `tab ${tabName==='leaders'?'active':''}`;
  
  const c=document.getElementById("prof-content"); 
  
  if(tabName==="stats"){ 
      let statsHTML = `<div style="display:flex;flex-direction:column;gap:12px;">`;
      let totalCalculatedXP = 0;

      CHAPTERS.forEach(ch => {
          let chDoneLevels = 0; let chXP = 0;
          ch.levels.forEach(lvl => { if (progress[lvl.id]?.completed) { chDoneLevels++; chXP += lvl.xp; } });
          totalCalculatedXP += chXP;
          statsHTML += `<div style="background:#111c11; border:1px solid #1e3a1e; border-radius:16px; padding:16px; display:flex; align-items:center; gap:16px;"><div style="font-size:32px;">${ch.icon}</div><div style="flex:1; text-align:left;"><div style="font-size:16px; font-weight:900; color:#fff;">${t(ch.dictKey)}</div><div style="font-size:13px; color:#9ca3af;">${chDoneLevels}/${ch.levels.length} ${t('stat_lvldone')}</div></div><div style="text-align:right;"><div style="font-size:16px; font-weight:900; color:#fbbf24;">⭐ ${chXP}</div></div></div>`;
      });
      statsHTML += `<div style="margin-top:8px; padding:20px; background:linear-gradient(135deg,#78350f22,#fbbf2422); border:1px solid #fbbf2444; border-radius:16px; text-align:center; box-shadow:0 10px 20px rgba(0,0,0,0.2);"><div style="font-size:14px; color:#fbbf24; font-weight:700; margin-bottom:4px;">${t('stat_totalxp')}</div><div style="font-size:32px; font-weight:900; color:#fff;">⭐ ${profile.xp || totalCalculatedXP}</div></div></div>`;
      c.innerHTML = statsHTML;
  } else if(tabName==="badges"){ 
    c.innerHTML=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">${CHAPTERS.map(ch=>{ const earned=ch.levels.some(l=>progress[l.id]?.completed); return `<div style="border-radius:16px;padding:16px;text-align:center;border:1.5px solid ${earned?ch.color:"#374151"};background:${earned?ch.color+"22":"#1f2937"}"><div style="font-size:32px; margin-bottom:8px;">${earned?ch.icon:"🔒"}</div><div style="font-size:13px; font-weight:700; color:#fff;">${t(ch.dictKey)}</div></div>`; }).join("")}</div>`; 
  } else { 
    c.innerHTML=`<div class="leader-row me" style="padding:16px; background:#0d2a0d; border:1px solid #4CAF5066; border-radius:16px; margin-bottom:10px; display:flex; align-items:center; gap:16px;"><span style="font-size:32px">${profile.avatar}</span><div style="flex:1;font-weight:900;font-size:16px;text-align:left;">${profile.username} (${t('you')})</div><span style="color:#fbbf24;font-weight:900;font-size:16px;">⭐ ${profile.xp||0}</span></div><div class="leader-row" style="padding:16px; background:#111c11; border:1px solid #1e3a1e; border-radius:16px; display:flex; align-items:center; gap:16px;"><span style="font-size:32px">🦋</span><div style="flex:1;font-weight:700;font-size:16px;text-align:left; color:#fff;">Aishah</div><span style="color:#fbbf24;font-weight:900;font-size:16px;">⭐ 8400</span></div>`; 
  } 
}

function openEditProfile() { 
    document.getElementById("edit-username").value = profile.username; 
    editTempAvatar = profile.avatar; 
    editTempLang = profile.lang || 'ms';
    renderEditAvatarGrid(); 
    renderLangButtons();
    showScreen("s-edit-profile"); 
}

function renderEditAvatarGrid() { 
    document.getElementById("edit-avatar-grid").innerHTML = AVATARS.map(a => `<button class="avatar-btn ${editTempAvatar === a ? 'sel' : ''}" onclick="editTempAvatar='${a}';renderEditAvatarGrid()">${a}</button>`).join(""); 
}

function renderLangButtons() {
    document.getElementById("lang-btn-ms").className = `btn ${editTempLang === 'ms' ? 'btn-primary' : 'btn-secondary'}`;
    document.getElementById("lang-btn-en").className = `btn ${editTempLang === 'en' ? 'btn-primary' : 'btn-secondary'}`;
}

function saveProfile() { 
    const newName = document.getElementById("edit-username").value.trim(); 
    if(!newName) return showNotif(t('err_req')); 
    profile.username = newName; 
    profile.avatar = editTempAvatar; 
    profile.lang = editTempLang;
    
    mockDB[profile.email] = profile; 
    ss("bimgo_users", mockDB); 
    
    applyLanguageStrings();
    showNotif("✅ Saved!"); 
    showScreen("s-profile"); 
}