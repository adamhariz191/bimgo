function openCameraChallenge(){
  const sign = allLessonSigns[currentSignIdx];
  document.getElementById("cam-target-sign").textContent = sign;
  document.getElementById("cam-start-btn").style.display = "block"; 
  document.getElementById("cam-submit-btn").style.display = "none";
  document.getElementById("cam-status").textContent = t('cam_load'); 
  document.getElementById("cam-success-msg").style.display = "none";
  
  if (holdInterval) { clearInterval(holdInterval); holdInterval = null; }
  wristHistory = []; 
  
  updateAccUI(0); 
  showScreen("s-camera");
}

async function startMediaPipeCam() {
  document.getElementById("cam-start-btn").style.display = "none"; 
  const msgBox = document.getElementById("cam-success-msg"); msgBox.style.display = "block"; msgBox.style.background = "transparent"; msgBox.style.borderColor = "#374151"; msgBox.style.color = "#9ca3af"; msgBox.textContent = t('cam_ready');
  document.getElementById("cam-status").textContent = t('cam_load');
  
  const videoElement = document.getElementById("cam-video"); const canvasElement = document.getElementById("hand-canvas"); const canvasCtx = canvasElement.getContext("2d");
  canvasElement.width = 480; canvasElement.height = 640;

  if(!mpHands) { mpHands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`}); mpHands.setOptions({maxNumHands:1, modelComplexity:1, minDetectionConfidence:0.6, minTrackingConfidence:0.6}); mpHands.onResults((res) => onMediaPipeResult(res, canvasCtx, canvasElement)); }
  if(!mpCamera) { mpCamera = new Camera(videoElement, {onFrame: async () => { await mpHands.send({image: videoElement}); }, width: 480, height: 640}); }
  mpCamera.start().then(() => { isCameraRunning = true; document.getElementById("cam-status").textContent = "AI Active"; }).catch(e => { console.error(e); });
}

function stopCam() { 
    if(mpCamera && isCameraRunning) { mpCamera.stop(); isCameraRunning = false; } 
    if (holdInterval) { clearTimeout(holdInterval); clearInterval(holdInterval); holdInterval = null; } 
}

function onMediaPipeResult(results, ctx, canvas) {
  ctx.save(); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.translate(canvas.width, 0); ctx.scale(-1, 1); ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const lm = results.multiHandLandmarks[0]; 
    drawConnectors(ctx, lm, HAND_CONNECTIONS, {color: '#4CAF50', lineWidth: 4}); drawLandmarks(ctx, lm, {color: '#fbbf24', lineWidth: 2, radius: 4});
    
    // TRACK WRIST POSITION
    wristHistory.push({ x: lm[0].x, y: lm[0].y });
    if (wristHistory.length > 30) wristHistory.shift();

    let score = getGestureScore(document.getElementById("cam-target-sign").textContent, lm); updateAccUI(score);
  } else { updateAccUI(0); }
  ctx.restore();
}

function getGestureScore(sign, lm) {
  const isUp = (tip, pip) => lm[tip].y < lm[pip].y;
  const idxUp = isUp(8, 6); const midUp = isUp(12, 10); const rngUp = isUp(16, 14); const pnkUp = isUp(20, 18);
  let s = 0;

  switch((sign || "").trim()) {
        case "Hello": {
            let fingersUpCount = 0;
            if (idxUp) fingersUpCount++;
            if (midUp) fingersUpCount++;
            if (rngUp) fingersUpCount++;
            if (pnkUp) fingersUpCount++;
            s += (fingersUpCount * 10); 
            if (wristHistory.length > 10) {
                let minX = 1, maxX = 0;
                for (let pos of wristHistory) {
                    if (pos.x < minX) minX = pos.x;
                    if (pos.x > maxX) maxX = pos.x;
                }
                let deltaX = maxX - minX; 
                if (deltaX > 0.03) s += 30; 
                if (deltaX > 0.06) s += 30; 
                if (fingersUpCount >= 3 && deltaX > 0.05) { s = 100; }
            }
            break;
        }

        case "Bye":
        case "Good Bye":
        case "Goodbye":
        case "bye": {
            let fingersUpCount = 0;
            if (idxUp) fingersUpCount++;
            if (midUp) fingersUpCount++;
            if (rngUp) fingersUpCount++;
            if (pnkUp) fingersUpCount++;
            s += (fingersUpCount * 10); 
            if (wristHistory.length > 10) {
                let minX = 1, maxX = 0;
                for (let pos of wristHistory) {
                    if (pos.x < minX) minX = pos.x;
                    if (pos.x > maxX) maxX = pos.x;
                }
                let deltaX = maxX - minX; 
                if (deltaX > 0.03) s += 30; 
                if (deltaX > 0.06) s += 30; 
                if (fingersUpCount >= 3 && deltaX > 0.05) { s = 100; }
            }
            break;
        }

        case "Father": {
            let fatherFingers = 0;
            if (idxUp) fatherFingers++; if (midUp) fatherFingers++; if (rngUp) fatherFingers++;
            s += (fatherFingers * 15); 
            
            if (wristHistory.length > 10) {
                let maxY = 0; 
                for (let pos of wristHistory) { if (pos.y > maxY) maxY = pos.y; }
                let currentY = wristHistory[wristHistory.length - 1].y; 
                let deltaY = currentY - maxY; 
                if (deltaY < -0.04) s = 100; 
            }
            break;
        }

    case "Mother": {
            let motherFingers = 0;
            if (idxUp) motherFingers++; if (midUp) motherFingers++; if (rngUp) motherFingers++;
            s += (motherFingers * 15); 
            
            if (wristHistory.length > 10) {
                let minY = 1; 
                for (let pos of wristHistory) { if (pos.y < minY) minY = pos.y; }
                let currentY = wristHistory[wristHistory.length - 1].y; 
                let deltaY = currentY - minY; 
                if (deltaY > 0.04) s = 100; 
            }
            break;
        }

   case "Brother":
        case "Sister": {
            if (wristHistory.length > 0) s += 40;
            
            if (wristHistory.length > 10) {
                let pathLength = 0;
                for (let i = 1; i < wristHistory.length; i++) {
                    let pos = wristHistory[i]; let prev = wristHistory[i-1];
                    pathLength += Math.hypot(pos.x - prev.x, pos.y - prev.y);
                }
                if (pathLength > 0.15) s += 30;
                if (pathLength > 0.25) s = 100; 
            }
            break;
        }
    case "Thank you": 
    case "You're Welcome": 
      if(idxUp) s += 15; 
      if(midUp) s += 15; 
      if(rngUp) s += 15; 
      if(pnkUp) s += 15; 
      
      if (wristHistory.length > 10) {
          let minY = 1; 
          for (let pos of wristHistory) {
              if (pos.y < minY) minY = pos.y; 
          }
          let currentY = wristHistory[wristHistory.length - 1].y; 
          let deltaY = currentY - minY; 
          
          if (deltaY > 0.05) s += 20; 
          if (deltaY > 0.12) s += 20; 
      }
      break;
    case "A": if(!idxUp) s+=20; if(!midUp) s+=20; if(!rngUp) s+=20; if(!pnkUp) s+=20; if(lm[4].y < lm[2].y) s+=20; break;
    case "B": if(idxUp) s+=20; if(midUp) s+=20; if(rngUp) s+=20; if(pnkUp) s+=20; if(lm[4].x > Math.min(lm[5].x, lm[17].x) && lm[4].x < Math.max(lm[5].x, lm[17].x)) s+=20; break;
    case "C": if(!idxUp && !midUp) s+=50; if(lm[4].x < lm[5].x) s+=50; break; 
    case "D": if(idxUp) s+=25; if(!midUp) s+=15; if(!rngUp) s+=15; if(!pnkUp) s+=15; if(Math.hypot(lm[4].x - lm[12].x, lm[4].y - lm[12].y) < 0.15) s+=30; break;
    case "E": if(!idxUp) s+=20; if(!midUp) s+=20; if(!rngUp) s+=20; if(!pnkUp) s+=20; if(lm[4].y > lm[5].y) s+=20; break; 
    case "F": if(!idxUp) s+=25; if(midUp) s+=15; if(rngUp) s+=15; if(pnkUp) s+=15; if(Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y) < 0.15) s+=30; break;
    case "G": if(!midUp && !rngUp && !pnkUp) s+=50; if(Math.abs(lm[8].x - lm[6].x) > Math.abs(lm[8].y - lm[6].y)) s+=50; break; 
    case "H": if(!rngUp && !pnkUp) s+=50; if(Math.abs(lm[8].x - lm[6].x) > Math.abs(lm[8].y - lm[6].y)) s+=50; break;
    case "I": if(!idxUp) s+=20; if(!midUp) s+=20; if(!rngUp) s+=20; if(pnkUp) s+=40; break;
    case "J": if(!idxUp) s+=20; if(!midUp) s+=20; if(!rngUp) s+=20; if(pnkUp) s+=40; break;
    case "K": if(idxUp) s+=30; if(midUp) s+=30; if(!rngUp) s+=10; if(!pnkUp) s+=10; if(lm[4].y < lm[6].y) s+=20; break;
    case "L": if(idxUp) s+=25; if(!midUp) s+=15; if(!rngUp) s+=15; if(!pnkUp) s+=15; if(lm[4].x < lm[5].x) s+=30; break;
    case "M": if(!idxUp) s+=25; if(!midUp) s+=25; if(!rngUp) s+=25; if(!pnkUp) s+=25; break;
    case "N": if(!idxUp) s+=25; if(!midUp) s+=25; if(!rngUp) s+=25; if(!pnkUp) s+=25; break;
    case "O": if(!idxUp) s+=20; if(!midUp) s+=20; if(!rngUp) s+=20; if(!pnkUp) s+=20; if(Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y) < 0.15) s+=20; break;
    case "P": if(!idxUp && !midUp && !rngUp && !pnkUp) s+=100; break; 
    case "Q": if(!idxUp && !midUp && !rngUp && !pnkUp) s+=100; break;
    case "R": if(idxUp) s+=40; if(midUp) s+=40; if(!rngUp) s+=10; if(!pnkUp) s+=10; break;
    case "S": if(!idxUp) s+=20; if(!midUp) s+=20; if(!rngUp) s+=20; if(!pnkUp) s+=20; if(lm[4].x > lm[5].x) s+=20; break; 
    case "T": if(!idxUp) s+=25; if(!midUp) s+=25; if(!rngUp) s+=25; if(!pnkUp) s+=25; break;
    case "U": if(idxUp) s+=30; if(midUp) s+=30; if(!rngUp) s+=10; if(!pnkUp) s+=10; if(Math.abs(lm[8].x - lm[12].x) < 0.05) s+=20; break; 
    case "V": if(idxUp) s+=30; if(midUp) s+=30; if(!rngUp) s+=10; if(!pnkUp) s+=10; if(Math.abs(lm[8].x - lm[12].x) >= 0.05) s+=20; break; 
    case "W": if(idxUp) s+=30; if(midUp) s+=30; if(rngUp) s+=30; if(!pnkUp) s+=10; break;
    case "X": if(lm[6].y < lm[5].y && !idxUp) s+=50; if(!midUp && !rngUp && !pnkUp) s+=50; break;
    case "Y": if(!idxUp) s+=15; if(!midUp) s+=15; if(!rngUp) s+=15; if(pnkUp) s+=35; if(lm[4].x < lm[5].x) s+=20; break;
    case "Z": if(idxUp) s+=40; if(!midUp) s+=20; if(!rngUp) s+=20; if(!pnkUp) s+=20; break;
    default: s = Math.random() * 100;
  }
  if(s > 98) s = 98 + Math.random(); return s;
}

function updateAccUI(score) { 
  currentScore = score; 
  let bar = document.getElementById("cam-acc-bar"); 
  let label = document.getElementById("cam-acc-label"); 
  let msgBox = document.getElementById("cam-success-msg"); 
  let submitBtn = document.getElementById("cam-submit-btn");
  
  label.textContent = Math.round(score) + "%"; 
  bar.style.width = score + "%"; 
  
  if (isCameraRunning && document.getElementById("cam-start-btn").style.display === "none") {
      if(score >= 85) { 
        bar.style.background = "#4CAF50"; 
        label.style.color = "#4CAF50"; 
        submitBtn.style.display = "none"; 
        
        // --- SMART SUBMIT LOGIC ---
        if (currentChapter && currentChapter.id > 1) {
            // DYNAMIC SIGNS: INSTANT SUBMIT
            msgBox.style.background = "#0d2a0d"; 
            msgBox.style.borderColor = "#4CAF50"; 
            msgBox.style.color = "#81c784"; 
            msgBox.textContent = `✅ Tepat!`;
            
            if (!holdInterval) {
                holdInterval = setTimeout(() => {
                    holdInterval = null;
                    submitCam();
                }, 500); 
            }
        } else {
            // STATIC SIGNS: 3 SECOND COUNTDOWN
            if (!holdInterval) {
                holdTimer = 3;
                msgBox.style.background = "#0d2a0d"; 
                msgBox.style.borderColor = "#4CAF50"; 
                msgBox.style.color = "#81c784"; 
                msgBox.textContent = `✅ Tepat! Tahan posisi ini... ${holdTimer}s`;
                
                holdInterval = setInterval(() => {
                    holdTimer--;
                    if (holdTimer > 0) {
                        msgBox.textContent = `✅ Tepat! Tahan posisi ini... ${holdTimer}s`;
                    } else {
                        clearInterval(holdInterval);
                        holdInterval = null;
                        submitCam(); 
                    }
                }, 1000);
            }
        }
      } else { 
        // --- RESET IF DROPPED BELOW 85% ---
        if (holdInterval) {
            if (currentChapter && currentChapter.id > 1) clearTimeout(holdInterval);
            else clearInterval(holdInterval);
            holdInterval = null;
        }
        
        bar.style.background = score > 50 ? "#FF9800" : "#F44336"; 
        label.style.color = score > 50 ? "#FF9800" : "#F44336"; 
        msgBox.style.background = "#2a0d0d"; 
        msgBox.style.borderColor = "#F44336"; 
        msgBox.style.color = "#ef9a9a"; 
        msgBox.textContent = t('cam_wrong');
        
        submitBtn.style.display = "none";
      } 
  }
}

function submitCam() {
  stopCam();
  const isSuccess = currentScore >= 85;
  const resIcon = document.getElementById("res-icon"); const resTitle = document.getElementById("res-title"); const resSub = document.getElementById("res-sub"); const retryBtn = document.getElementById("res-retry-btn"); const nextBtn = document.getElementById("res-next-btn");
  const statsBox = document.getElementById("res-stats-box");

  if(isSuccess) {
      sessionAccuracies.push(currentScore); 
      resIcon.textContent = "✅"; resTitle.textContent = t('res_congrats'); resTitle.style.color = "#4CAF50"; resSub.textContent = t('res_correct');
      retryBtn.style.display = "none"; nextBtn.style.display = "block";
      statsBox.style.display = "none"; 
      
      if(currentSignIdx < allLessonSigns.length - 1) {
          nextBtn.textContent = t('res_next');
          nextBtn.onclick = () => nextLessonOrFinish(); 
      } else {
          resIcon.textContent = "🏆"; resSub.textContent = t('res_lvldone'); nextBtn.textContent = t('res_home');
          nextBtn.onclick = () => showScreen('s-home');
          
          let avgAcc = Math.round(sessionAccuracies.reduce((a,b)=>a+b, 0) / sessionAccuracies.length);
          document.getElementById("res-xp-val").textContent = currentLevel.xp;
          document.getElementById("t-res-acc").textContent = t('res_acc'); 
          document.getElementById("res-acc-val").textContent = avgAcc;
          statsBox.style.display = "flex"; 

          progress[currentLevel.id] = {completed:true}; profile.progress = progress; profile.xp = (profile.xp || 0) + currentLevel.xp; 
          mockDB[profile.email] = profile; ss("bimgo_users", mockDB);
      }
  } else {
      resIcon.textContent = "💪"; resTitle.textContent = t('res_tryagain'); resTitle.style.color = "#F44336"; resSub.textContent = t('res_below');
      retryBtn.style.display = "block"; nextBtn.style.display = "none";
      retryBtn.textContent = t('res_retrybtn');
      retryBtn.onclick = () => openCameraChallenge(); 
      statsBox.style.display = "none";
  }
  showScreen("s-result");
}