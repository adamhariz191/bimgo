// ========================================
// CALCULATE MOVEMENT TRACKING SYSTEM
// ========================================

let movementData = {
    totalDistance: 0,
    xDistance: 0,
    yDistance: 0,
    directionChanges: 0,
    lastDirection: null,
    peakVelocity: 0,
    avgVelocity: 0,
    velocityHistory: [],
    pathPoints: [],
    startTime: null,
    holdDuration: 0,
    isHolding: false,
    holdStartTime: null,
    gesturePatterns: []
};

// Reset movement calculator
function resetMovementCalculator() {
    movementData = {
        totalDistance: 0,
        xDistance: 0,
        yDistance: 0,
        directionChanges: 0,
        lastDirection: null,
        peakVelocity: 0,
        avgVelocity: 0,
        velocityHistory: [],
        pathPoints: [],
        startTime: Date.now(),
        holdDuration: 0,
        isHolding: false,
        holdStartTime: null,
        gesturePatterns: []
    };
    wristHistory = [];
}

// Calculate movement metrics from wrist history
function calculateMovementMetrics() {
    if (wristHistory.length < 2) return movementData;
    
    let totalDist = 0;
    let xDist = 0;
    let yDist = 0;
    let dirChanges = 0;
    let lastDir = null;
    let velocities = [];
    
    for (let i = 1; i < wristHistory.length; i++) {
        const prev = wristHistory[i - 1];
        const curr = wristHistory[i];
        
        // Calculate distances
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const dist = Math.hypot(dx, dy);
        
        totalDist += dist;
        xDist += Math.abs(dx);
        yDist += Math.abs(dy);
        
        // Calculate velocity (assuming ~30fps)
        const velocity = dist * 30;
        velocities.push(velocity);
        
        // Detect direction changes
        let currentDir = null;
        if (Math.abs(dx) > Math.abs(dy)) {
            currentDir = dx > 0 ? 'right' : 'left';
        } else if (Math.abs(dy) > 0.005) {
            currentDir = dy > 0 ? 'down' : 'up';
        }
        
        if (currentDir && lastDir && currentDir !== lastDir) {
            dirChanges++;
        }
        if (currentDir) lastDir = currentDir;
    }
    
    // Update movement data
    movementData.totalDistance = totalDist;
    movementData.xDistance = xDist;
    movementData.yDistance = yDist;
    movementData.directionChanges = dirChanges;
    movementData.lastDirection = lastDir;
    movementData.velocityHistory = velocities;
    movementData.peakVelocity = velocities.length > 0 ? Math.max(...velocities) : 0;
    movementData.avgVelocity = velocities.length > 0 ? 
        velocities.reduce((a, b) => a + b, 0) / velocities.length : 0;
    
    return movementData;
}

// Detect specific gesture patterns
function detectGesturePattern() {
    if (wristHistory.length < 10) return null;
    
    const metrics = calculateMovementMetrics();
    let pattern = {
        type: 'unknown',
        confidence: 0,
        details: {}
    };
    
    // Wave Detection (horizontal oscillation)
    if (metrics.xDistance > metrics.yDistance * 1.5 && metrics.directionChanges >= 2) {
        pattern.type = 'wave';
        pattern.confidence = Math.min(100, (metrics.directionChanges * 20) + (metrics.xDistance * 200));
        pattern.details = {
            oscillations: Math.floor(metrics.directionChanges / 2),
            amplitude: metrics.xDistance / Math.max(1, metrics.directionChanges)
        };
    }
    
    // Chop Detection (vertical movement)
    else if (metrics.yDistance > metrics.xDistance * 1.5) {
        pattern.type = 'chop';
        pattern.confidence = Math.min(100, metrics.yDistance * 300);
        pattern.details = {
            direction: getVerticalDirection(),
            intensity: metrics.peakVelocity
        };
    }
    
    // Circle Detection
    else if (metrics.directionChanges >= 4 && 
             Math.abs(metrics.xDistance - metrics.yDistance) < 0.1) {
        pattern.type = 'circle';
        pattern.confidence = Math.min(100, metrics.directionChanges * 15);
        pattern.details = {
            completeness: metrics.directionChanges / 8,
            size: metrics.totalDistance
        };
    }
    
    // Hold/Static Detection
    else if (metrics.totalDistance < 0.02 && wristHistory.length > 15) {
        pattern.type = 'hold';
        pattern.confidence = Math.min(100, (1 - metrics.totalDistance * 50) * 100);
        pattern.details = {
            stability: 1 - metrics.totalDistance * 50,
            duration: wristHistory.length / 30
        };
    }
    
    movementData.gesturePatterns.push(pattern);
    return pattern;
}

// Get vertical movement direction
function getVerticalDirection() {
    if (wristHistory.length < 5) return 'none';
    
    const recent = wristHistory.slice(-5);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const deltaY = last.y - first.y;
    
    if (deltaY > 0.03) return 'down';
    if (deltaY < -0.03) return 'up';
    return 'stable';
}

// Get horizontal movement direction  
function getHorizontalDirection() {
    if (wristHistory.length < 5) return 'none';
    
    const recent = wristHistory.slice(-5);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const deltaX = last.x - first.x;
    
    if (deltaX > 0.03) return 'right';
    if (deltaX < -0.03) return 'left';
    return 'stable';
}

// Calculate movement range
function calculateMovementRange() {
    if (wristHistory.length < 2) {
        return { minX: 0, maxX: 0, minY: 0, maxY: 0, rangeX: 0, rangeY: 0 };
    }
    
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    
    for (let pos of wristHistory) {
        if (pos.x < minX) minX = pos.x;
        if (pos.x > maxX) maxX = pos.x;
        if (pos.y < minY) minY = pos.y;
        if (pos.y > maxY) maxY = pos.y;
    }
    
    return {
        minX, maxX, minY, maxY,
        rangeX: maxX - minX,
        rangeY: maxY - minY
    };
}

// Check if hand is being held steady
function checkHoldSteady(threshold = 0.02) {
    if (wristHistory.length < 10) return false;
    
    const recent = wristHistory.slice(-10);
    let totalMovement = 0;
    
    for (let i = 1; i < recent.length; i++) {
        totalMovement += Math.hypot(
            recent[i].x - recent[i-1].x,
            recent[i].y - recent[i-1].y
        );
    }
    
    const isHolding = totalMovement < threshold;
    
    if (isHolding && !movementData.isHolding) {
        movementData.isHolding = true;
        movementData.holdStartTime = Date.now();
    } else if (!isHolding) {
        if (movementData.isHolding && movementData.holdStartTime) {
            movementData.holdDuration = Date.now() - movementData.holdStartTime;
        }
        movementData.isHolding = false;
        movementData.holdStartTime = null;
    }
    
    return isHolding;
}

// Translate pattern names to Malay
function translatePattern(pattern) {
    const translations = {
        'wave': 'Lambaian',
        'chop': 'Potong',
        'circle': 'Bulatan',
        'hold': 'Tahan',
        'unknown': 'Tidak Pasti',
        'none': 'Tiada'
    };
    return translations[pattern] || pattern;
}

// Update movement stats UI display
function updateMovementStatsUI() {
    const stats = getMovementStats();
    const statsContainer = document.getElementById("movement-stats");
    
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Jarak Total:</span>
                <span class="stat-value">${(stats.totalDistance * 100).toFixed(1)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Horizontal:</span>
                <span class="stat-value">${(stats.horizontalRange * 100).toFixed(1)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Vertikal:</span>
                <span class="stat-value">${(stats.verticalRange * 100).toFixed(1)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Perubahan Arah:</span>
                <span class="stat-value">${stats.directionChanges}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Pola Dikesan:</span>
                <span class="stat-value">${translatePattern(stats.detectedPattern)} (${stats.patternConfidence}%)</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Status:</span>
                <span class="stat-value">${stats.isHolding ? '🔒 Tahan' : '👋 Bergerak'}</span>
            </div>
        `;
    }
}

// Get movement statistics summary
function getMovementStats() {
    const metrics = calculateMovementMetrics();
    const range = calculateMovementRange();
    const pattern = detectGesturePattern();
    const isHolding = checkHoldSteady();
    
    return {
        totalDistance: Math.round(metrics.totalDistance * 1000) / 1000,
        horizontalDistance: Math.round(metrics.xDistance * 1000) / 1000,
        verticalDistance: Math.round(metrics.yDistance * 1000) / 1000,
        
        horizontalRange: Math.round(range.rangeX * 1000) / 1000,
        verticalRange: Math.round(range.rangeY * 1000) / 1000,
        
        peakVelocity: Math.round(metrics.peakVelocity * 100) / 100,
        averageVelocity: Math.round(metrics.avgVelocity * 100) / 100,
        
        directionChanges: metrics.directionChanges,
        currentHorizontalDir: getHorizontalDirection(),
        currentVerticalDir: getVerticalDirection(),
        
        detectedPattern: pattern ? pattern.type : 'none',
        patternConfidence: pattern ? Math.round(pattern.confidence) : 0,
        
        isHolding: isHolding,
        holdDuration: movementData.isHolding && movementData.holdStartTime ? 
            (Date.now() - movementData.holdStartTime) / 1000 : 0,
        
        dataPoints: wristHistory.length,
        trackingDuration: movementData.startTime ? 
            (Date.now() - movementData.startTime) / 1000 : 0
    };
}

// ========================================
// CAMERA LIFECYCLE FUNCTIONS
// ========================================

function openCameraChallenge(){
    const sign = allLessonSigns[currentSignIdx];
    
    const targetElement = document.getElementById("cam-target-sign");
    targetElement.textContent = t("sign_" + sign); 
    targetElement.dataset.signId = sign; 

    document.getElementById("cam-start-btn").style.display = "block"; 
    document.getElementById("cam-submit-btn").style.display = "none";
    document.getElementById("cam-status").textContent = t('cam_load'); 
    document.getElementById("cam-success-msg").style.display = "none";
    
    if (holdInterval) { clearInterval(holdInterval); holdInterval = null; }
    
    resetMovementCalculator();
    
    updateAccUI(0); 
    updateMovementStatsUI(); 
    showScreen("s-camera");
}

async function startMediaPipeCam() {
    document.getElementById("cam-start-btn").style.display = "none"; 
    const msgBox = document.getElementById("cam-success-msg"); 
    msgBox.style.display = "block"; 
    msgBox.style.background = "transparent"; 
    msgBox.style.borderColor = "#374151"; 
    msgBox.style.color = "#9ca3af"; 
    msgBox.textContent = t('cam_ready');
    document.getElementById("cam-status").textContent = t('cam_load');
    
    resetMovementCalculator();
    
    const videoElement = document.getElementById("cam-video"); 
    const canvasElement = document.getElementById("hand-canvas"); 
    const canvasCtx = canvasElement.getContext("2d");
    canvasElement.width = 480; 
    canvasElement.height = 640;

    if(!mpHands) { 
        mpHands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`}); 
        mpHands.setOptions({maxNumHands:2, modelComplexity:1, minDetectionConfidence:0.6, minTrackingConfidence:0.6}); 
        mpHands.onResults((res) => onMediaPipeResult(res, canvasCtx, canvasElement)); 
    }
    if(!mpCamera) { 
        mpCamera = new Camera(videoElement, {
            onFrame: async () => { await mpHands.send({image: videoElement}); }, 
            width: 480, 
            height: 640
        }); 
    }
    mpCamera.start().then(() => { 
        isCameraRunning = true; 
        document.getElementById("cam-status").textContent = "AI Active"; 
    }).catch(e => { console.error(e); });
}

function stopCam() { 
    if(mpCamera && isCameraRunning) { 
        mpCamera.stop(); 
        isCameraRunning = false; 
    } 
    if (holdInterval) { 
        clearTimeout(holdInterval); 
        clearInterval(holdInterval); 
        holdInterval = null; 
    } 
}

function onMediaPipeResult(results, ctx, canvas) {
    ctx.save(); 
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    ctx.translate(canvas.width, 0); 
    ctx.scale(-1, 1); 
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        let bestScore = 0;
        let bestHandLm = results.multiHandLandmarks[0];

        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
            const lm = results.multiHandLandmarks[i];
            
            drawConnectors(ctx, lm, HAND_CONNECTIONS, {color: '#4CAF50', lineWidth: 4}); 
            drawLandmarks(ctx, lm, {color: '#fbbf24', lineWidth: 2, radius: 4});
            
            const signId = document.getElementById("cam-target-sign").dataset.signId;
            let score = getGestureScore(signId, lm); 
            
            if (score >= bestScore) {
                bestScore = score;
                bestHandLm = lm;
            }
        }

        wristHistory.push({ x: bestHandLm[0].x, y: bestHandLm[0].y });
        if (wristHistory.length > 30) wristHistory.shift();

        updateMovementStatsUI();
        updateAccUI(bestScore);
    } else { 
        updateAccUI(0); 
    }
    ctx.restore();
}

// ========================================
// GESTURE RECOGNITION SCORING ENGINE
// ========================================

function getGestureScore(sign, lm) {
    const isUp = (tip, pip) => lm[tip].y < lm[pip].y;
    const idxUp = isUp(8, 6); 
    const midUp = isUp(12, 10); 
    const rngUp = isUp(16, 14); 
    const pnkUp = isUp(20, 18);
    let s = 0;

    const metrics = calculateMovementMetrics();
    const range = calculateMovementRange();

    switch((sign || "").trim()) {
        case "Hello": {
            let fingersUpCount = 0;
            if (idxUp) fingersUpCount++;
            if (midUp) fingersUpCount++;
            if (rngUp) fingersUpCount++;
            if (pnkUp) fingersUpCount++;
            s += (fingersUpCount * 10); 
            
            if (wristHistory.length > 10) {
                let deltaX = range.rangeX; 
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
                let deltaX = range.rangeX; 
                if (deltaX > 0.03) s += 30; 
                if (deltaX > 0.06) s += 30; 
                if (fingersUpCount >= 3 && deltaX > 0.05) { s = 100; }
            }
            break;
        }

        // ========================================================
        // CHAPTER 3: DAILY LIFE ENGINE (FIXED & FULLY INTEGRATED)
        // ========================================================
        case "Eat":
        case "Makan":
        case "Food":
        case "Makanan": {
            let score = 0;
            if (!idxUp && !midUp && !rngUp && !pnkUp) score += 30;

            let thumbToIndex = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);
            let thumbToMid   = Math.hypot(lm[4].x - lm[12].x, lm[4].y - lm[12].y);
            if (thumbToIndex < 0.12 && thumbToMid < 0.15) score += 30;

            if (wristHistory.length > 10) {
                if (lm[0].y < 0.58) score += 20; 
                if (range.rangeY > 0.03 && metrics.totalDistance > 0.04) score += 20;
            }
            s = score;
            break;
        }

        case "Minum":
        case "Drink": {
            let score = 0;
            let thumbUp = lm[4].y < lm[3].y;
            let idxCurled = lm[8].y > lm[6].y;
            let midCurled = lm[12].y > lm[10].y;
            
            if (thumbUp && idxCurled && midCurled) score += 50; 
            
            if (score === 50 && wristHistory.length > 10) {
                if (range.rangeY > 0.02 || metrics.totalDistance > 0.04) score += 25;
                if (getVerticalDirection() === 'up' || metrics.peakVelocity > 1.5) score += 25;
            }
            s = score;
            break;
        }

        case "Water":
        case "Air": {
            let score = 0;
            if (idxUp && midUp && rngUp && !pnkUp) score += 60;
            if (score === 60 && wristHistory.length > 5) {
                if (calculateMovementMetrics().totalDistance < 0.03) score += 40;
            }
            s = score;
            break;
        }

        case "Father":
        case "Ayah": {
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

        case "Mother":
        case "Ibu": {
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

        case "Toilet":
        case "Tandas": {
            let score = 0;
            let thumbBetween = lm[4].x > lm[6].x && lm[4].x < lm[10].x;
            if (!idxUp && !midUp && thumbBetween) score += 50;
            if (score === 50 && wristHistory.length > 10) {
                if (metrics.directionChanges >= 2 && range.rangeX > 0.03) score += 50;
            }
            s = score;
            break;
        }

        case "Tomorrow":
        case "Esok": {
            let score = 0;
            if (lm[4].y < lm[3].y && !idxUp && !midUp) score += 50;
            if (score === 50 && wristHistory.length > 10) {
                if (getHorizontalDirection() === 'right' || metrics.totalDistance > 0.04) score += 50;
            }
            s = score;
            break;
        }

        case "Later":
        case "Nanti": {
            let score = 0;
            let isLshape = lm[4].x < lm[5].x && idxUp && !midUp;
            if (isLshape) score += 50;
            if (score === 50 && wristHistory.length > 10) {
                if (getVerticalDirection() === 'down' && range.rangeY > 0.03) score += 50;
            }
            s = score;
            break;
        }

        case "Need":
        case "Perlu": {
            let score = 0;
            let isHook = lm[8].y > lm[6].y && lm[6].y < lm[5].y;
            if (isHook && !midUp && !rngUp) score += 50;
            if (score === 50 && wristHistory.length > 10) {
                if (getVerticalDirection() === 'down' && range.rangeY > 0.04) score += 50;
            }
            s = score;
            break;
        }

        case "Go":
        case "Pergi": {
            let score = 0;
            if (idxUp && !midUp && !rngUp) score += 50;
            if (score === 50 && wristHistory.length > 8) {
                if (metrics.peakVelocity > 2.5 && metrics.totalDistance > 0.05) score += 50;
            }
            s = score;
            break;
        }

        case "Brother":
        case "Sister":
        case "Abang/Adik Lelaki":
        case "Kakak/Adik Perempuan": {
            if (wristHistory.length > 0) s += 40;
            if (wristHistory.length > 10) {
                let pathLength = metrics.totalDistance;
                if (pathLength > 0.15) s += 30;
                if (pathLength > 0.25) s = 100; 
            }
            break;
        }

        case "Home":
        case "Rumah": {
            let score = 0;
            if (idxUp && midUp && rngUp && pnkUp) score += 50;
            if (score === 50 && wristHistory.length > 8) {
                if (metrics.totalDistance < 0.03) score += 50;
            }
            s = score;
            break;
        }

        case "Work":
        case "Kerja": {
            let score = 0;
            if (!idxUp && !midUp && !rngUp && !pnkUp) score += 50;
            if (score === 50 && wristHistory.length > 10) {
                if (metrics.directionChanges >= 2 && metrics.yDistance > 0.03) score += 50;
            }
            s = score;
            break;
        }

        case "School":
        case "Sekolah": {
            let score = 0;
            if (idxUp && midUp && rngUp && pnkUp) score += 50;
            if (score === 50 && wristHistory.length > 10) {
                if (metrics.directionChanges >= 2 && metrics.xDistance > 0.03) score += 50;
            }
            s = score;
            break;
        }

        case "Want":
        case "Mahu": {
            let score = 0;
            if (idxUp && midUp && rngUp) score += 50;
            if (score === 50 && wristHistory.length > 10) {
                if (getVerticalDirection() === 'down' && metrics.totalDistance > 0.04) score += 50;
            }
            s = score;
            break;
        }

        case "Today":
        case "Now":
        case "Hari Ini":
        case "Sekarang": {
            let score = 0;
            let isYshape = lm[4].x < lm[5].x && pnkUp && !idxUp && !midUp && !rngUp;
            if (isYshape) score += 50;
            if (score === 50 && wristHistory.length > 10) {
                if (metrics.yDistance > 0.04 && getVerticalDirection() === 'down') score += 50;
            }
            s = score;
            break;
        }

        // ========================================================
        // CORE SYSTEM RECOGNITIONS
        // ========================================================
        case "Friend": {
            let score = 0;
            if (idxUp) score += 25;
            if (!midUp) score += 15;
            if (!rngUp) score += 15;
            if (!pnkUp) score += 15;
            let indexBentAmount = lm[6].y - lm[8].y; 
            if (indexBentAmount > 0.01 && indexBentAmount < 0.08) score += 30; 
            s = score;
            break;
        }

        case "Yes": {
            let score = 0;
            let isFist = !idxUp && !midUp && !rngUp && !pnkUp;
            if (isFist) score += 40;
            let thumbTucked = lm[4].y > lm[5].y;
            if (thumbTucked) score += 20;

            if (isFist && wristHistory.length > 15) {
                let totalVerticalMovement = 0;
                let vertDirChanges = 0;
                let lastVertDir = null;

                for (let i = 1; i < wristHistory.length; i++) {
                    const dy = wristHistory[i].y - wristHistory[i - 1].y;
                    totalVerticalMovement += Math.abs(dy);
                    let vertDir = dy > 0.005 ? 'down' : dy < -0.005 ? 'up' : null;
                    if (vertDir && lastVertDir && vertDir !== lastVertDir) vertDirChanges++;
                    if (vertDir) lastVertDir = vertDir;
                }
                if (totalVerticalMovement > 0.08) score += 20;
                if (totalVerticalMovement > 0.15) score += 10;
                if (vertDirChanges >= 1) score += 10; 
            }
            s = score;
            break;
        }

        case "No": {
            let score = 0;
            if (idxUp) score += 25;
            if (!midUp) score += 15;
            if (!rngUp) score += 15;
            if (!pnkUp) score += 15;

            if (idxUp && wristHistory.length > 15) {
                let totalHorizontalMovement = 0;
                let horizDirChanges = 0;
                let lastHorizDir = null;

                for (let i = 1; i < wristHistory.length; i++) {
                    const dx = wristHistory[i].x - wristHistory[i - 1].x;
                    totalHorizontalMovement += Math.abs(dx);
                    let horizDir = dx > 0.005 ? 'right' : dx < -0.005 ? 'left' : null;
                    if (horizDir && lastHorizDir && horizDir !== lastHorizDir) horizDirChanges++;
                    if (horizDir) lastHorizDir = horizDir;
                }
                if (totalHorizontalMovement > 0.06) score += 15;
                if (horizDirChanges >= 1) score += 15; 
                if (horizDirChanges >= 2) score += 15; 
            }
            s = score;
            break;
        }

        case "Understand": {
            let score = 0;
            if (idxUp) score += 25;
            if (!midUp) score += 15;
            if (!rngUp) score += 15;
            if (!pnkUp) score += 15;
            if (lm[0].y < 0.55) score += 15; 

            if (idxUp && wristHistory.length > 10) {
                let recentSlice = wristHistory.slice(-10);
                let firstY = recentSlice[0].y;
                let lastY = recentSlice[recentSlice.length - 1].y;
                let deltaY = firstY - lastY; 
                if (deltaY > 0.04) score += 15; 
                if (deltaY > 0.08) score += 15; 
            }
            s = score;
            break;
        }
        
        case "Police":
        case "Polis": {
            let score = 0;
            if (idxUp && midUp && !rngUp && !pnkUp) score += 60;
            if (score === 60 && wristHistory.length > 5) {
                if (calculateMovementMetrics().totalDistance < 0.03) score += 40;
            }
            s = score;
            break;
        }

        case "Help": {
            let score = 0;
            let isFist = !idxUp && !midUp && !rngUp && !pnkUp;
            let thumbIsUp = lm[4].y < lm[5].y; 
            
            if (isFist && thumbIsUp) {
                score += 50; 
            } else if (isFist) {
                score += 20; 
            }
            
            if (score === 50 && wristHistory.length > 15) {
                let lowestY = 0;
                for (let pos of wristHistory) { if (pos.y > lowestY) lowestY = pos.y; }
                let currentY = wristHistory[wristHistory.length - 1].y;
                let deltaY = lowestY - currentY; 
                if (deltaY > 0.10) score += 25; 
                if (deltaY > 0.20) score += 25; 
            }
            s = score;
            break;
        }
        
        case "Stop": {
            let score = 0;
            if (idxUp && midUp && rngUp && pnkUp) {
                score += 50; 
            } else if (idxUp && midUp && rngUp) {
                score += 20; 
            }
            
            if (score === 50 && wristHistory.length > 10) {
                let highestY = 1; 
                for (let pos of wristHistory) { if (pos.y < highestY) highestY = pos.y; }
                let currentY = wristHistory[wristHistory.length - 1].y;
                let deltaY = currentY - highestY; 
                if (deltaY > 0.08) score += 25; 
                if (deltaY > 0.15) score += 25; 
            }
            s = score;
            break;
        }
        
        case "Danger": {
            let score = 0;
            if (idxUp && midUp && rngUp && pnkUp) {
                score += 40; 
            } else if (idxUp && midUp) {
                score += 20; 
            }
            
            if (wristHistory.length > 15) {
                let totalVerticalMovement = 0;
                for (let i = 1; i < wristHistory.length; i++) {
                    totalVerticalMovement += Math.abs(wristHistory[i].y - wristHistory[i-1].y);
                }
                if (totalVerticalMovement > 0.15) score += 30; 
                if (totalVerticalMovement > 0.30) score += 30; 
            }
            s = score;
            break;
        }
        // Emergency

       case "Pain":
        case "Sakit": {
            let score = 0;

            // 1. HANDSHAPE: Open hand (all fingers generally extended/relaxed)
            if (idxUp) score += 10;
            if (midUp) score += 10;
            if (rngUp) score += 10;
            if (pnkUp) score += 10;

            // 2. MOVEMENT: Shaking / Vibrating in place
            if (wristHistory.length > 15) {
                
                // --- THE NOISE FILTER ---
                // Find the widest physical boundary the hand traveled across.
                let maxSpread = Math.max(range.rangeX, range.rangeY);
                
                // Only grade the movement if the hand moved more than 4% of the screen.
                // This ignores camera jitter and forces the user to actually shake their hand!
                if (maxSpread > 0.04) {
                    
                    if (metrics.totalDistance > 0.15) score += 20;
                    if (metrics.totalDistance > 0.30) score += 20;

                    // Must change direction rapidly to prove it's a shake, not a swipe
                    if (metrics.directionChanges >= 3) {
                        score += 20;
                    }
                }
            }

            s = score;
            break;
        }

case "Medicine":
        case "Ubat": {
            let score = 0;

            // 1. HANDSHAPE: Only the middle finger bends down (!midUp). 
            // Index, Ring, and Pinky stay straight and relaxed (Up).
            if (idxUp) score += 15;
            if (!midUp) score += 35; // Heavily weighted because it's the key identifier!
            if (rngUp) score += 15;
            if (pnkUp) score += 15;

            // 2. MOVEMENT: Small circular rubbing or tapping motion on the palm
            if (wristHistory.length > 15) {
                let maxSpread = Math.max(range.rangeX, range.rangeY);
                
                // Noise filter: Hand must be moving, but staying inside a small zone
                if (maxSpread > 0.02) {
                    // Continuous circular or tapping shifting
                    if (metrics.directionChanges >= 2) {
                        score += 10;
                    }
                    // Accumulate tracking distance
                    if (metrics.totalDistance > 0.06) {
                        score += 10;
                    }
                }
            }

            s = score;
            break;
        }
        
case "Dizzy":
case "Pening": {
    let score = 0;

    // Hand shape: index finger extended pointing up, others curled
    if (idxUp) score += 20;
    if (!midUp) score += 10;
    if (!rngUp) score += 10;
    if (!pnkUp) score += 10;

    // Hand must be raised high — near head/temple level
    let wristY = lm[0].y;
    if (wristY < 0.50) score += 15; // hand raised near head

    // Movement: hands move outward away from head (increasing horizontal range)
    if (wristHistory.length > 10) {
        let horizDirChanges = 0;
        let lastHorizDir = null;
        let totalHoriz = 0;

        for (let i = 1; i < wristHistory.length; i++) {
            const dx = wristHistory[i].x - wristHistory[i - 1].x;
            totalHoriz += Math.abs(dx);

            let horizDir = dx > 0.004 ? 'right' : dx < -0.004 ? 'left' : null;
            if (horizDir && lastHorizDir && horizDir !== lastHorizDir) horizDirChanges++;
            if (horizDir) lastHorizDir = horizDir;
        }

        // Outward spreading + circular motion = horizontal movement + direction changes
        if (totalHoriz > 0.06) score += 15;
        if (horizDirChanges >= 2) score += 10; // circular/spreading motion
        if (range.rangeX > 0.10) score += 10; // wide horizontal spread near head
    }

    s = score;
    break;
}

        // Static Alphabet Signs
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
    
    if(s > 98) s = 98 + Math.random(); 
    return s;
}

// ========================================
// UI HANDLERS & NAVIGATION INTERFACES
// ========================================

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
    const resIcon = document.getElementById("res-icon"); 
    const resTitle = document.getElementById("res-title"); 
    const resSub = document.getElementById("res-sub"); 
    const retryBtn = document.getElementById("res-retry-btn"); 
    const nextBtn = document.getElementById("res-next-btn");
    const statsBox = document.getElementById("res-stats-box");

    if(isSuccess) {
        sessionAccuracies.push(currentScore); 
        resIcon.textContent = "✅"; 
        resTitle.textContent = t('res_congrats'); 
        resTitle.style.color = "#4CAF50"; 
        resSub.textContent = t('res_correct');
        retryBtn.style.display = "none"; 
        nextBtn.style.display = "block";
        statsBox.style.display = "none"; 
        
        if(currentSignIdx < allLessonSigns.length - 1) {
            nextBtn.textContent = t('res_next');
            nextBtn.onclick = () => nextLessonOrFinish(); 
        } else {
            resIcon.textContent = "🏆"; 
            resSub.textContent = t('res_lvldone'); 
            nextBtn.textContent = t('res_home');
            nextBtn.onclick = () => showScreen('s-home');
            
            let avgAcc = Math.round(sessionAccuracies.reduce((a,b)=>a+b, 0) / sessionAccuracies.length);
            document.getElementById("res-xp-val").textContent = currentLevel.xp;
            document.getElementById("t-res-acc").textContent = t('res_acc'); 
            document.getElementById("res-acc-val").textContent = avgAcc;
            statsBox.style.display = "flex"; 

            progress[currentLevel.id] = {completed:true}; 
            profile.progress = progress; 
            profile.xp = (profile.xp || 0) + currentLevel.xp; 
            mockDB[profile.email] = profile; 
            ss("bimgo_users", mockDB);
        }
    } else {
        resIcon.textContent = "💪"; 
        resTitle.textContent = t('res_tryagain'); 
        resTitle.style.color = "#F44336"; 
        resSub.textContent = t('res_below');
        retryBtn.style.display = "block"; 
        nextBtn.style.display = "none";
        retryBtn.textContent = t('res_retrybtn');
        retryBtn.onclick = () => openCameraChallenge(); 
        statsBox.style.display = "none";
    }
    showScreen("s-result");
}