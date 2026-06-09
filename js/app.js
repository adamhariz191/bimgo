function showNotif(msg){ const el=document.getElementById("notif"); el.textContent=msg; el.style.display="block"; setTimeout(()=>el.style.display="none",2500); }

function applyLanguageStrings() {
    document.getElementById('t-splash-sub').textContent = t('splash_sub'); document.getElementById('t-wb-title').textContent = t('wb_title'); document.getElementById('t-auth-title').textContent = t('auth_title'); document.getElementById('t-auth-sub').textContent = t('auth_sub'); document.getElementById('t-auth-g-text').textContent = t('auth_g_text'); document.getElementById('t-auth-a-text').textContent = t('auth_a_text'); document.getElementById('t-auth-or').textContent = t('auth_or'); document.getElementById('t-auth-email-btn').innerHTML = t('auth_email_btn'); document.getElementById('t-email-hub-title').textContent = t('email_hub_title'); document.getElementById('t-auth-reg').textContent = t('auth_reg'); document.getElementById('t-auth-log').textContent = t('auth_log'); document.getElementById('t-reg-title').textContent = t('reg_title'); document.getElementById('t-reg-lbl1').textContent = t('lbl_email'); document.getElementById('t-reg-lbl2').textContent = t('lbl_pass'); document.getElementById('t-reg-lbl3').textContent = t('lbl_pass2'); document.getElementById('t-reg-btn').textContent = t('btn_next'); document.getElementById('t-log-title').textContent = t('log_title'); document.getElementById('t-log-lbl1').textContent = t('lbl_email'); document.getElementById('t-log-lbl2').textContent = t('lbl_pass'); document.getElementById('t-log-btn').textContent = t('auth_log'); document.getElementById('t-home-welcome').textContent = t('home_welcome'); document.getElementById('t-home-target').textContent = t('home_target'); document.getElementById('t-home-ch-title').textContent = t('home_ch_title'); document.getElementById('t-nav-home').textContent = t('nav_home'); document.getElementById('t-nav-prof').textContent = t('nav_prof'); document.getElementById('t-prof-title').textContent = t('prof_title'); document.getElementById('t-prof-edit-btn').textContent = t('prof_edit_btn'); document.getElementById('t-tab-stat').textContent = t('tab_stat'); document.getElementById('t-tab-badge').textContent = t('tab_badge'); document.getElementById('t-tab-rank').textContent = t('tab_rank'); document.getElementById('t-prof-logout').textContent = t('prof_logout'); document.getElementById('t-edit-title').textContent = t('edit_title'); document.getElementById('t-edit-lbl1').textContent = t('edit_lbl1'); document.getElementById('t-edit-lbl2').textContent = t('edit_lbl2'); document.getElementById('t-edit-lbl3').textContent = t('edit_lbl3'); document.getElementById('t-edit-btn').textContent = t('edit_save'); document.getElementById('t-les-theory').textContent = t('les_theory'); document.getElementById('t-les-watch').textContent = t('les_watch'); document.getElementById('t-les-visual').textContent = t('les_visual'); document.getElementById('t-les-link').innerHTML = `🔗 ${t('les_link')}`; document.getElementById('t-les-cam').textContent = t('les_cam'); document.getElementById('t-cam-title').textContent = t('cam_title'); document.getElementById('t-cam-show').textContent = t('cam_show'); document.getElementById('t-cam-acc').textContent = t('cam_acc'); document.getElementById('cam-start-btn').textContent = t('cam_open'); document.getElementById('cam-submit-btn').textContent = t('cam_submit'); document.getElementById('cam-status').textContent = t('cam_load'); document.getElementById('cam-success-msg').textContent = t('cam_ready'); document.getElementById('t-res-acc').textContent = t('res_acc');
    document.getElementById('t-quiz-title').textContent = t('quiz_title'); document.getElementById('t-quiz-q').textContent = t('quiz_q');
}

function showScreen(id){ 
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active")); 
  document.getElementById(id).classList.add("active"); 
  
  const isLearningScreen = (id === 's-lesson' || id === 's-camera' || id === 's-quiz');
  if (isLearningScreen && !learningInterval) {
      learningInterval = setInterval(() => {
          if (profile) { profile.timeSpent = (profile.timeSpent || 0) + 1; if(profile.timeSpent % 5 === 0) { mockDB[profile.email] = profile; ss("bimgo_users", mockDB); } }
      }, 1000);
  } else if (!isLearningScreen && learningInterval) {
      clearInterval(learningInterval); learningInterval = null;
      if (profile) { mockDB[profile.email] = profile; ss("bimgo_users", mockDB); }
  }

  const nav = document.getElementById("main-nav");
  if(id === "s-home" || id === "s-profile" || id === "s-chapter") {
      nav.style.display = "flex"; document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
      if(id === "s-home" || id === "s-chapter") document.getElementById("nav-home").classList.add("active");
      if(id === "s-profile") document.getElementById("nav-profile").classList.add("active");
  } else { nav.style.display = "none"; }
  if(id==="s-home") renderHome(); if(id==="s-profile") renderProfile(); 
}

function showWelcomeBack() { document.getElementById("wb-avatar").textContent = profile.avatar; document.getElementById("wb-name").textContent = profile.username; showScreen("s-welcome-back"); setTimeout(() => { showScreen("s-home"); }, 1500); }

function signBankUrl(sign){ const s=sign.toLowerCase().replace(/\s+/g,"-"); return `https://www.bimsignbank.org/alphabets/${s[0]}/${s.length===1?'':s}`; }

window.onload = () => { applyLanguageStrings(); setTimeout(() => { if(activeSessionEmail && mockDB[activeSessionEmail]) { profile = mockDB[activeSessionEmail]; progress = profile.progress || {}; applyLanguageStrings(); showWelcomeBack(); } else { showScreen("s-auth"); } }, 2000); };

function handleSocialAuth(provider) {
    const btnId = provider === 'google' ? 't-auth-google' : 't-auth-apple'; const textId = provider === 'google' ? 't-auth-g-text' : 't-auth-a-text'; const btn = document.getElementById(btnId); const textSpan = document.getElementById(textId); const originalText = textSpan.innerHTML;
    textSpan.innerHTML = `⏳ ${t('auth_loading')}`; btn.disabled = true;
    setTimeout(() => { textSpan.innerHTML = originalText; btn.disabled = false; const email = `${provider}_user@mock.com`;
        if(mockDB[email]) { activeSessionEmail = email; profile = mockDB[email]; progress = profile.progress || {}; applyLanguageStrings(); ss("bimgo_session", email); showWelcomeBack(); } else { tempSignupEmail = email; tempSignupPass = 'oauth_mock_password'; setupStep = 0; renderSetup(); showScreen("s-setup"); }
    }, 1500);
}

function handleSignup(e) { e.preventDefault(); const email = document.getElementById("reg-email").value.trim(); const p1 = document.getElementById("reg-pass").value; const p2 = document.getElementById("reg-pass2").value; if(p1 !== p2) return showNotif(t('err_mismatch')); if(mockDB[email]) return showNotif(t('err_exists')); tempSignupEmail = email; tempSignupPass = p1; setupStep = 0; renderSetup(); showScreen("s-setup"); }

function handleLogin(e) { e.preventDefault(); const email = document.getElementById("login-email").value.trim(); const pass = document.getElementById("login-pass").value; if(mockDB[email]) { if(mockDB[email].password === pass) { activeSessionEmail = email; profile = mockDB[email]; progress = profile.progress || {}; applyLanguageStrings(); ss("bimgo_session", email); showWelcomeBack(); } else { showNotif(t('err_wrongpass')); } } else { showNotif(t('err_notfound')); } }

function renderSetup(){ const c=document.getElementById("setup-content"); const btn=document.getElementById("setup-next-btn"); document.getElementById("setup-dots").innerHTML=[0,1,2].map(i=>`<div style="flex:1;height:8px;border-radius:4px;background:${i<=setupStep?"#4CAF50":"#1f2937"}"></div>`).join(""); if(setupStep===0){ c.innerHTML=`<h2 style="font-size:28px; font-weight:900;">Nama anda?</h2><input type="text" oninput="setupData.username=this.value" placeholder="Nama..." style="font-size:20px; padding:20px;">`; btn.textContent=t('btn_next'); } else if(setupStep===1){ c.innerHTML=`<h2 style="font-size:28px; font-weight:900;">Pilih avatar</h2><div class="avatar-grid">${AVATARS.map(a=>`<button class="avatar-btn ${setupData.avatar===a?'sel':''}" onclick="setupData.avatar='${a}';renderSetup()">${a}</button>`).join("")}</div>`; btn.textContent=t('btn_next'); } else { c.innerHTML=`<h2 style="font-size:28px; font-weight:900;">Sasaran Masa?</h2><div style="display:flex;flex-direction:column;gap:12px;"><button class="btn ${setupData.goal===5?'btn-primary':'btn-secondary'}" onclick="setupData.goal=5;renderSetup()" style="padding:20px; font-size:18px;">5 minit / hari</button><button class="btn ${setupData.goal===10?'btn-primary':'btn-secondary'}" onclick="setupData.goal=10;renderSetup()" style="padding:20px; font-size:18px;">10 minit / hari</button></div>`; btn.textContent="Selesai & Mula"; } }

function setupNext(){ if(setupStep===0 && !setupData.username) return showNotif(t('err_req')); if(setupStep<2){setupStep++; renderSetup(); return;} profile = {...setupData, email: tempSignupEmail, password: tempSignupPass, xp:0, streak:1, progress: {}}; progress = profile.progress; mockDB[tempSignupEmail] = profile; ss("bimgo_users", mockDB); activeSessionEmail = tempSignupEmail; ss("bimgo_session", activeSessionEmail); applyLanguageStrings(); showScreen("s-home"); }

function renderHome(){
  document.getElementById("home-greeting").textContent=`${profile.avatar} ${profile.username}`; document.getElementById("home-xp").textContent=profile.xp||0; document.getElementById("home-streak").textContent=profile.streak||1; 
  const spentSecs = profile.timeSpent || 0; const goalSecs = (profile.goal || 10) * 60; let mins = Math.floor(spentSecs / 60); let secs = spentSecs % 60; let pct = Math.min((spentSecs / goalSecs) * 100, 100); let displaySecs = secs < 10 ? "0" + secs : secs;
  document.getElementById("home-goal-label").textContent=`${mins}m ${displaySecs}s / ${profile.goal}m`; document.querySelector("#s-home .progress-fill").style.width = `${pct}%`;
  document.getElementById("chapter-grid").innerHTML=CHAPTERS.map((ch,i)=>{ const done=ch.levels.filter(l=>progress[l.id]?.completed).length; const pct=Math.round((done/ch.levels.length)*100); return `<button class="chapter-card" onclick="openChapter(${i})" style="border-color:${ch.color}44;background:${ch.color}18"><div style="font-size:36px;margin-bottom:12px">${ch.icon}</div><div style="font-size:16px;font-weight:900;color:#ffffff;">${t(ch.dictKey)}</div><div style="font-size:12px;color:#9ca3af;margin-bottom:12px">${t(ch.dictKey)}</div><div class="progress-bar"><div class="progress-fill" style="background:${ch.color};width:${pct}%"></div></div></button>`; }).join("");
}

function openChapter(ci){
  currentChapter=CHAPTERS[ci]; document.getElementById("ch-title").textContent=t(currentChapter.dictKey); document.getElementById("ch-icon").textContent=currentChapter.icon;
  document.getElementById("level-list").innerHTML=currentChapter.levels.map((lv,li)=>{
    const done = progress[lv.id]?.completed; const unlocked = li===0 || progress[currentChapter.levels[li-1].id]?.completed;
    let levelIcon = lv.isQuiz ? "📝" : (done ? "✅" : li+1); 
    let levelTitle = lv.isQuiz ? t('quiz_title') : t(lv.dictKey);
    return `<div class="level-item ${unlocked? done?'done':'':'locked'}" onclick="${unlocked? `startLevel(${li})`:''}"><div style="width:48px;height:48px;border-radius:16px;background:${done?currentChapter.color:unlocked?"#374151":"#1f2937"};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px;">${levelIcon}</div><div style="flex:1; font-weight:900; font-size:16px; color:#fff;">${levelTitle}</div>${unlocked && !done ? '<div style="color:#6b7280; font-size:20px;">▶</div>' : ''}</div>`;
  }).join("");
  showScreen("s-chapter");
}

function startLevel(li){ 
    currentLevel=currentChapter.levels[li]; 
    if (currentLevel.isQuiz) startQuiz();
    else { currentSignIdx=0; allLessonSigns=[...currentLevel.signs]; sessionAccuracies = []; renderLessonView(); }
}

function startQuiz() {
    quizScore = 0; currentQuizIdx = 0; let allChapterSigns = [];
    currentChapter.levels.forEach(l => { if (!l.isQuiz) allChapterSigns.push(...l.signs); });
    quizQuestions = [];
    for(let i = 0; i < 8; i++) {
        let correctSign = allChapterSigns[Math.floor(Math.random() * allChapterSigns.length)]; let options = [correctSign];
        while(options.length < 4) { let wrongSign = allChapterSigns[Math.floor(Math.random() * allChapterSigns.length)]; if(!options.includes(wrongSign)) options.push(wrongSign); }
        options.sort(() => Math.random() - 0.5); quizQuestions.push({ correct: correctSign, options: options });
    }
    renderQuizQuestion(); showScreen('s-quiz');
}

function renderQuizQuestion() {
    let q = quizQuestions[currentQuizIdx]; document.getElementById('quiz-progress-text').textContent = `${currentQuizIdx + 1}/8`;
    document.getElementById('quiz-gif').src = `https://via.placeholder.com/400x300/111c11/4CAF50?text=Sign:+` + encodeURIComponent(t("sign_" + q.correct));
    let grid = document.getElementById('quiz-options');
    grid.innerHTML = q.options.map(opt => `<button class="quiz-btn" onclick="handleQuizAnswer(this, '${opt}', '${q.correct}')">${t("sign_" + opt)}</button>`).join('');
}

function handleQuizAnswer(btn, selected, correct) {
    document.querySelectorAll('.quiz-btn').forEach(b => b.disabled = true);
    if (selected === correct) { btn.style.background = "#4CAF50"; btn.style.borderColor = "#4CAF50"; quizScore++; } 
    else { btn.style.background = "#F44336"; btn.style.borderColor = "#F44336"; document.querySelectorAll('.quiz-btn').forEach(b => { 
        if(b.textContent === t("sign_" + correct)) { b.style.background = "#4CAF50"; b.style.borderColor = "#4CAF50"; } 
    }); }
    setTimeout(() => { currentQuizIdx++; if(currentQuizIdx < 8) { renderQuizQuestion(); } else { finishQuiz(); } }, 1200);
}

function finishQuiz() {
    const isSuccess = quizScore >= 6;
    const resIcon = document.getElementById("res-icon"); const resTitle = document.getElementById("res-title"); const resSub = document.getElementById("res-sub"); const retryBtn = document.getElementById("res-retry-btn"); const nextBtn = document.getElementById("res-next-btn"); const statsBox = document.getElementById("res-stats-box");
    if (isSuccess) {
        resIcon.textContent = "🏅"; resTitle.textContent = t('quiz_pass'); resTitle.style.color = "#4CAF50"; resSub.textContent = `${quizScore}/8 - Lulus!`;
        retryBtn.style.display = "none"; nextBtn.style.display = "block"; nextBtn.textContent = t('res_home'); nextBtn.onclick = () => showScreen('s-home');
        document.getElementById("res-xp-val").textContent = currentLevel.xp; document.getElementById("t-res-acc").textContent = t('quiz_score'); document.getElementById("res-acc-val").textContent = Math.round((quizScore/8)*100);
        statsBox.style.display = "flex"; 
        progress[currentLevel.id] = {completed:true}; profile.progress = progress; profile.xp = (profile.xp || 0) + currentLevel.xp; mockDB[profile.email] = profile; ss("bimgo_users", mockDB);
    } else {
        resIcon.textContent = "💔"; resTitle.textContent = t('quiz_fail'); resTitle.style.color = "#F44336"; resSub.textContent = `${quizScore}/8. ${t('quiz_req')}`;
        retryBtn.style.display = "block"; nextBtn.style.display = "none"; retryBtn.textContent = t('res_retrybtn'); retryBtn.onclick = () => startQuiz(); statsBox.style.display = "none";
    }
    showScreen("s-result");
}

function renderLessonView() {
  const sign = allLessonSigns[currentSignIdx];
  document.getElementById("lesson-breadcrumb").textContent=`${t(currentChapter.dictKey)} · ${t(currentLevel.dictKey)}`;
  document.getElementById("lesson-progress-text").textContent=`${currentSignIdx + 1}/${allLessonSigns.length}`;
  document.getElementById("vid-sign-name").textContent=t("sign_" + sign);
  document.getElementById("t-les-link").href=signBankUrl(sign);
  
  const mediaUrl = SIGN_MEDIA[sign] || "https://via.placeholder.com/400x300/111c11/4CAF50?text=Tiada+Media"; 
  const vidPlayer = document.getElementById("lesson-vid");
  const imgPlayer = document.getElementById("lesson-img");
  
  if (mediaUrl.toLowerCase().endsWith(".mp4") || mediaUrl.toLowerCase().endsWith(".webm")) {
      imgPlayer.style.display = "none"; vidPlayer.style.display = "block";
      vidPlayer.removeAttribute("src"); vidPlayer.muted = true; vidPlayer.playsInline = true; vidPlayer.src = mediaUrl; vidPlayer.load();
      var playPromise = vidPlayer.play();
      if (playPromise !== undefined) { playPromise.catch(error => { document.body.addEventListener('click', () => { vidPlayer.play(); }, { once: true }); }); }
  } else {
      vidPlayer.style.display = "none"; vidPlayer.pause(); 
      imgPlayer.style.display = "block"; imgPlayer.src = mediaUrl;
  }
  showScreen("s-lesson");
}

function nextLessonOrFinish() {
  if(currentSignIdx < allLessonSigns.length - 1) {
      currentSignIdx++;
      renderLessonView();
  } else {
      showScreen('s-home');
  }
}

function openCameraChallenge() {
    const currentSign = allLessonSigns[currentSignIdx];
    document.getElementById("cam-target-sign").textContent = t("sign_" + currentSign);
    showScreen('s-camera');
}