/* Jessica Syafaq Muthmaina - Interactive Windows 98 / Y2K Desktop JavaScript Logic */

let activeDragWindow = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let topZIndex = 100;

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initial window layout and tray clock setup
    updateTrayClock();
    setInterval(updateTrayClock, 1000);
    
    // Start clean with no windows open on startup
    rebuildTaskbarTabs();
    
    // Global mousedown listener to handle window focus activation
    document.querySelectorAll('.window').forEach(win => {
        win.addEventListener('mousedown', () => {
            focusWindow(win.id);
        });
    });

    // Close Start Menu when clicking outside
    document.addEventListener('click', (e) => {
        const startBtn = document.getElementById('start-menu-btn');
        const startMenu = document.getElementById('start-menu');
        if (startMenu && startBtn) {
            if (!startBtn.contains(e.target) && !startMenu.contains(e.target)) {
                startMenu.classList.remove('show-menu');
                startBtn.classList.remove('active');
            }
        }
    });

    // 2. Allan Deviation Simulator Initialization
    initAllanSimulator();

    // 3. Initialize SoundCloud API Widget
    setTimeout(initSoundCloudWidget, 1000);
});

/* Window Dragging Handlers */
function dragStart(e, windowId) {
    const win = document.getElementById(windowId);
    if (!win || win.classList.contains('maximized-window')) return;
    
    // Bring window to focus
    focusWindow(windowId);
    
    activeDragWindow = win;
    dragOffsetX = e.clientX - win.offsetLeft;
    dragOffsetY = e.clientY - win.offsetTop;
    
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
    
    // Prevent selection during dragging
    e.preventDefault();
}

function dragMove(e) {
    if (!activeDragWindow) return;
    
    let left = e.clientX - dragOffsetX;
    let top = e.clientY - dragOffsetY;
    
    // Constrain within desktop boundary
    const desktop = document.getElementById('desktop');
    const maxLeft = desktop.clientWidth - activeDragWindow.clientWidth;
    const maxTop = desktop.clientHeight - activeDragWindow.clientHeight;
    
    if (left < 0) left = 0;
    if (top < 0) top = 0;
    if (left > maxLeft) left = maxLeft;
    if (top > maxTop) top = maxTop;
    
    activeDragWindow.style.left = left + 'px';
    activeDragWindow.style.top = top + 'px';
}

function dragEnd() {
    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('mouseup', dragEnd);
    activeDragWindow = null;
}

/* Window Control Actions */
function openWindow(windowId) {
    const win = document.getElementById(windowId);
    if (!win) return;
    
    win.classList.remove('minimized-window');
    win.style.display = 'flex';
    focusWindow(windowId);
    rebuildTaskbarTabs();
}

function closeWindow(windowId) {
    const win = document.getElementById(windowId);
    if (!win) return;
    
    win.style.display = 'none';
    rebuildTaskbarTabs();
}

function minimizeWindow(windowId) {
    const win = document.getElementById(windowId);
    if (!win) return;
    
    win.classList.add('minimized-window');
    rebuildTaskbarTabs();
}

function maximizeWindow(windowId) {
    const win = document.getElementById(windowId);
    if (!win) return;
    
    win.classList.toggle('maximized-window');
    
    // Refocus on maximize
    focusWindow(windowId);
}

function focusWindow(windowId) {
    const win = document.getElementById(windowId);
    if (!win) return;
    
    // Check if it's already top focused
    if (win.style.zIndex == topZIndex && win.classList.contains('active-window')) {
        return;
    }
    
    // Reset all active classes
    document.querySelectorAll('.window').forEach(w => {
        w.classList.remove('active-window');
    });
    
    topZIndex += 2;
    win.style.zIndex = topZIndex;
    win.classList.add('active-window');
    
    // Sync taskbar active state
    updateActiveTaskTab(windowId);
}

/* Taskbar Synchronization */
function rebuildTaskbarTabs() {
    const tabContainer = document.getElementById('taskbar-tabs');
    if (!tabContainer) return;
    
    tabContainer.innerHTML = '';
    
    // Get all windows
    const windows = document.querySelectorAll('.window');
    windows.forEach(win => {
        // Only show tabs for windows that are open (style.display !== 'none')
        if (win.style.display !== 'none') {
            const windowId = win.id;
            const titleBar = win.querySelector('.title-bar-text');
            const titleText = titleBar ? titleBar.textContent : 'Window';
            
            const tab = document.createElement('div');
            tab.className = 'task-tab';
            tab.id = 'tab-' + windowId;
            tab.textContent = titleText;
            
            // Toggle minimize/focus on tab click
            tab.addEventListener('click', () => {
                if (win.classList.contains('minimized-window')) {
                    // Restore and focus
                    win.classList.remove('minimized-window');
                    focusWindow(windowId);
                    rebuildTaskbarTabs();
                } else if (win.classList.contains('active-window')) {
                    // Minimize if already focused
                    win.classList.add('minimized-window');
                    rebuildTaskbarTabs();
                } else {
                    // Just bring to focus
                    focusWindow(windowId);
                }
            });
            
            if (win.classList.contains('active-window') && !win.classList.contains('minimized-window')) {
                tab.classList.add('active-tab');
            }
            
            tabContainer.appendChild(tab);
        }
    });
}

function updateActiveTaskTab(windowId) {
    document.querySelectorAll('.task-tab').forEach(tab => {
        tab.classList.remove('active-tab');
    });
    const activeTab = document.getElementById('tab-' + windowId);
    if (activeTab) {
        activeTab.classList.add('active-tab');
    }
}

/* Start Menu Controls */
function toggleStartMenu() {
    const startMenu = document.getElementById('start-menu');
    const startBtn = document.getElementById('start-menu-btn');
    if (startMenu && startBtn) {
        startMenu.classList.toggle('show-menu');
        startBtn.classList.toggle('active');
    }
}

function launchAndClose(windowId) {
    openWindow(windowId);
    toggleStartMenu();
}

function closeAllAndAlert() {
    toggleStartMenu();
    // Simulate system shutdown dialogue
    alert("System Shutdown command received. System is going to standby mode. Click OK to return to desktop.");
}

/* System Tray Clock */
function updateTrayClock() {
    const clockElement = document.getElementById('taskbar-clock');
    if (!clockElement) return;
    
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    clockElement.textContent = hours + ':' + minutes + ' ' + ampm;
}

/* 3. Allan Deviation Simulation Logic */
function initAllanSimulator() {
    const canvas = document.getElementById('allan-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const inputTau = document.getElementById('input-tau');
    const inputBaseline = document.getElementById('input-baseline');
    const lblTau = document.getElementById('lbl-tau');
    const lblBaseline = document.getElementById('lbl-baseline');
    const lblResult = document.getElementById('lbl-result');
    const calcBtn = document.getElementById('calc-btn');
    
    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < canvas.width; i += 40) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
        }
        for (let j = 0; j < canvas.height; j += 40) {
            ctx.moveTo(0, j);
            ctx.lineTo(canvas.width, j);
        }
        ctx.stroke();
    }
    
    function updateValuesAndSimulate() {
        const tau = parseFloat(inputTau.value);
        const b = parseFloat(inputBaseline.value);
        
        lblTau.textContent = tau + ' days';
        lblBaseline.textContent = b + ' km';
        
        // Calculate Allan Deviation model for Quasar 4C31.61
        const sigmaWhite = 0.25 * Math.pow(tau, -0.5) * (8000 / b);
        const sigmaRW = 0.003 * Math.pow(tau, 0.5);
        const totalSigma = Math.sqrt(sigmaWhite * sigmaWhite + sigmaRW * sigmaRW);
        
        lblResult.textContent = totalSigma.toFixed(3) + ' mas';
        
        drawGrid();
        
        // Draw the theoretical noise model curves
        ctx.strokeStyle = '#8b0000';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        
        const scaleX = canvas.width / 500;
        const centerY = canvas.height * 0.8;
        
        for (let px = 0; px < canvas.width; px++) {
            const currentTau = px / scaleX + 1;
            const sw = 0.25 * Math.pow(currentTau, -0.5) * (8000 / b);
            const srw = 0.003 * Math.pow(currentTau, 0.5);
            const sig = Math.sqrt(sw * sw + srw * srw);
            
            const py = centerY - sig * (canvas.height * 1.8);
            
            if (px === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
        
        // Draw selection marker indicator
        const markerX = tau * scaleX;
        ctx.strokeStyle = '#202030';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(markerX, 0);
        ctx.lineTo(markerX, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
        
        const markerY = centerY - totalSigma * (canvas.height * 1.8);
        ctx.fillStyle = '#ff6ab8'; /* Y2K Neon Pink pointer */
        ctx.beginPath();
        ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // Add real-time dynamic slider listeners
    inputTau.addEventListener('input', updateValuesAndSimulate);
    inputBaseline.addEventListener('input', updateValuesAndSimulate);
    calcBtn.addEventListener('click', updateValuesAndSimulate);
    
    // Initial draw run
    updateValuesAndSimulate();
}

/* PDF Viewer Tab Switcher */
function switchPdfTab(tabName) {
    const renderedView = document.getElementById('pdf-rendered-view');
    const texView = document.getElementById('pdf-tex-view');
    const btnRendered = document.getElementById('btn-pdf-rendered');
    const btnTex = document.getElementById('btn-pdf-tex');

    if (!renderedView || !texView) return;

    if (tabName === 'rendered') {
        renderedView.style.display = 'block';
        texView.style.display = 'none';
        btnRendered.classList.add('active-tab');
        btnTex.classList.remove('active-tab');
    } else {
        renderedView.style.display = 'none';
        texView.style.display = 'block';
        btnTex.classList.add('active-tab');
        btnRendered.classList.remove('active-tab');
    }
}

/* Winamp v2.91 Media Player Engine */
const winampPlaylist = [
    { title: "1. Ninajirachi - I Love My Computer", duration: 204, strDur: "3:24", freq: 440 },
    { title: "2. Ninajirachi - Start Button", duration: 178, strDur: "2:58", freq: 523 },
    { title: "3. Ninajirachi - Info Superhighway", duration: 225, strDur: "3:45", freq: 659 },
    { title: "4. Ninajirachi - Cyber Dream", duration: 252, strDur: "4:12", freq: 587 },
    { title: "5. Ninajirachi - Y2K System Shock", duration: 195, strDur: "3:15", freq: 698 },
    { title: "6. Ninajirachi - Binary Hearts", duration: 230, strDur: "3:50", freq: 784 }
];

let winampCurrentTrack = 0;
let winampIsPlaying = false;
let winampIsPaused = false;
let winampCurrentTime = 0;
let winampVolume = 0.8;
let winampTimerInterval = null;
let winampAnimFrame = null;
let audioCtx = null;
let synthOsc = null;
let synthGain = null;

let scWidget = null;
let ipodPlaying = false;

function initSoundCloudWidget() {
    const iframe = document.getElementById('sc-widget');
    if (iframe && typeof SC !== 'undefined') {
        try {
            scWidget = SC.Widget(iframe);
            scWidget.bind(SC.Widget.Events.PLAY_PROGRESS, function(data) {
                const secs = Math.floor(data.currentPosition / 1000);
                const mins = String(Math.floor(secs / 60)).padStart(1, '0');
                const sRem = String(secs % 60).padStart(2, '0');
                const currEl = document.getElementById('ipod-time-curr');
                if (currEl) currEl.textContent = `${mins}:${sRem}`;
                
                if (data.relativePosition) {
                    const seekEl = document.getElementById('ipod-seek-bar');
                    if (seekEl) seekEl.value = Math.floor(data.relativePosition * 100);
                }
            });
        } catch(e){}
    }
}

function ipodTogglePlay() {
    ipodPlaying = !ipodPlaying;
    const btn = document.getElementById('ipod-play-btn');
    if (!scWidget) initSoundCloudWidget();
    if (scWidget) {
        try { scWidget.toggle(); } catch(e){}
    }
    if (ipodPlaying) {
        if (btn) btn.textContent = '❚❚';
    } else {
        if (btn) btn.textContent = '►';
    }
}

function ipodNext() {
    if (!scWidget) initSoundCloudWidget();
    if (scWidget) {
        try { scWidget.next(); } catch(e){}
    }
}

function ipodPrev() {
    if (!scWidget) initSoundCloudWidget();
    if (scWidget) {
        try { scWidget.prev(); } catch(e){}
    }
}

function ipodSetVolume(val) {
    if (!scWidget) initSoundCloudWidget();
    if (scWidget) {
        try { scWidget.setVolume(val); } catch(e){}
    }
}

function ipodSeek(val) {
    if (!scWidget) initSoundCloudWidget();
    if (scWidget) {
        try {
            scWidget.getDuration(function(duration) {
                const targetMs = (val / 100) * duration;
                scWidget.seekTo(targetMs);
            });
        } catch(e){}
    }
}

function winampPlay() {
    winampIsPlaying = true;
    winampIsPaused = false;
    if (!scWidget) initSoundCloudWidget();
    if (scWidget) {
        try { scWidget.play(); } catch(e){}
    }
    startWinampAudioSynth();
    startWinampTimer();
    startWinampVisualizer();
    updateWinampUI();
}

function winampPause() {
    if (!winampIsPlaying) return;
    winampIsPaused = !winampIsPaused;
    if (scWidget) {
        try { scWidget.toggle(); } catch(e){}
    }
    if (winampIsPaused) {
        stopWinampAudioSynth();
    } else {
        startWinampAudioSynth();
    }
    updateWinampUI();
}

function winampStop() {
    winampIsPlaying = false;
    winampIsPaused = false;
    winampCurrentTime = 0;
    if (scWidget) {
        try { scWidget.pause(); scWidget.seekTo(0); } catch(e){}
    }
    stopWinampAudioSynth();
    if (winampTimerInterval) clearInterval(winampTimerInterval);
    if (winampAnimFrame) cancelAnimationFrame(winampAnimFrame);
    clearWinampCanvas();
    updateWinampUI();
}

function winampNext() {
    winampCurrentTrack = (winampCurrentTrack + 1) % winampPlaylist.length;
    winampCurrentTime = 0;
    if (scWidget) {
        try { scWidget.next(); } catch(e){}
    }
    if (winampIsPlaying) {
        stopWinampAudioSynth();
        startWinampAudioSynth();
    }
    updateWinampUI();
}

function winampPrev() {
    winampCurrentTrack = (winampCurrentTrack - 1 + winampPlaylist.length) % winampPlaylist.length;
    winampCurrentTime = 0;
    if (scWidget) {
        try { scWidget.prev(); } catch(e){}
    }
    if (winampIsPlaying) {
        stopWinampAudioSynth();
        startWinampAudioSynth();
    }
    updateWinampUI();
}

function winampSelectTrack(index) {
    winampCurrentTrack = index;
    winampCurrentTime = 0;
    if (scWidget) {
        try { scWidget.skip(index); } catch(e){}
    }
    winampPlay();
}

function winampSetVolume(val) {
    winampVolume = val / 100;
    const volEl = document.getElementById('winamp-vol-val');
    if (volEl) volEl.textContent = val + '%';
    if (scWidget) {
        try { scWidget.setVolume(val); } catch(e){}
    }
}

function winampSeek(val) {
    const track = winampPlaylist[winampCurrentTrack];
    winampCurrentTime = Math.floor((val / 100) * track.duration);
    updateWinampTimeDisplay();
}

function startWinampTimer() {
    if (winampTimerInterval) clearInterval(winampTimerInterval);
    winampTimerInterval = setInterval(() => {
        if (!winampIsPlaying || winampIsPaused) return;
        winampCurrentTime++;
        const track = winampPlaylist[winampCurrentTrack];
        if (winampCurrentTime >= track.duration) {
            winampNext();
        } else {
            updateWinampTimeDisplay();
        }
    }, 1000);
}

function updateWinampTimeDisplay() {
    const mins = String(Math.floor(winampCurrentTime / 60)).padStart(2, '0');
    const secs = String(winampCurrentTime % 60).padStart(2, '0');
    const timeEl = document.getElementById('winamp-time');
    if (timeEl) timeEl.textContent = `${mins}:${secs}`;
    
    const track = winampPlaylist[winampCurrentTrack];
    const seekEl = document.getElementById('winamp-seek');
    if (seekEl) seekEl.value = (winampCurrentTime / track.duration) * 100;
}

function updateWinampUI() {
    const track = winampPlaylist[winampCurrentTrack];
    const tickerEl = document.getElementById('winamp-ticker');
    if (tickerEl) {
        const state = winampIsPaused ? '[PAUSED] ' : (winampIsPlaying ? '▶ PLAYING: ' : '■ STOPPED: ');
        tickerEl.textContent = `${state} ${track.title} (${track.strDur}) *** WINAMP v2.91 ***`;
    }
    
    updateWinampTimeDisplay();

    // Highlight active track in playlist
    const items = document.querySelectorAll('.pl-item');
    items.forEach((item, idx) => {
        if (idx === winampCurrentTrack) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

let synthInterval = null;
let noteStep = 0;

const trackMelodies = [
    // Track 1: I Love My Computer (C Major Hyperpop Lead)
    [261.63, 329.63, 392.00, 523.25, 659.25, 523.25, 392.00, 329.63],
    // Track 2: Start Button (E Minor Electro Wave)
    [329.63, 392.00, 493.88, 659.25, 783.99, 659.25, 493.88, 392.00],
    // Track 3: Info Superhighway (F Major Chiptune)
    [349.23, 440.00, 523.25, 698.46, 880.00, 698.46, 523.25, 440.00],
    // Track 4: Cyber Dream (A Minor Ambient Pulse)
    [220.00, 261.63, 329.63, 440.00, 523.25, 440.00, 329.63, 261.63],
    // Track 5: Y2K System Shock (G Major Bass Synth)
    [196.00, 246.94, 293.66, 392.00, 493.88, 392.00, 293.66, 246.94],
    // Track 6: Binary Hearts (D Minor Synthpop)
    [293.66, 349.23, 440.00, 587.33, 698.46, 587.33, 440.00, 349.23]
];

function startWinampAudioSynth() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        stopWinampAudioSynth();
        
        noteStep = 0;
        const melody = trackMelodies[winampCurrentTrack % trackMelodies.length];
        
        // Play melodic electronic synth notes & bass beat pulse every 180ms
        synthInterval = setInterval(() => {
            if (!winampIsPlaying || winampIsPaused || !audioCtx) return;
            
            const freq = melody[noteStep % melody.length];
            noteStep++;
            
            // Lead Synth Note
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            
            const volume = winampVolume * 0.25;
            gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.16);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.17);
            
            // Bass Kick Pulse on rhythmic beats
            if (noteStep % 4 === 1) {
                const bassOsc = audioCtx.createOscillator();
                const bassGain = audioCtx.createGain();
                
                bassOsc.type = 'sine';
                bassOsc.frequency.setValueAtTime(110, audioCtx.currentTime);
                bassOsc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.12);
                
                bassGain.gain.setValueAtTime(winampVolume * 0.3, audioCtx.currentTime);
                bassGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.14);
                
                bassOsc.connect(bassGain);
                bassGain.connect(audioCtx.destination);
                
                bassOsc.start();
                bassOsc.stop(audioCtx.currentTime + 0.15);
            }
        }, 180);

    } catch (e) {
        // Audio synthesis fallback
    }
}

function stopWinampAudioSynth() {
    if (synthInterval) {
        clearInterval(synthInterval);
        synthInterval = null;
    }
}

function startWinampVisualizer() {
    const canvas = document.getElementById('winamp-spectrum');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    function draw() {
        if (!winampIsPlaying || winampIsPaused) {
            clearWinampCanvas();
            return;
        }
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const numBars = 22;
        const barWidth = canvas.width / numBars;
        
        for (let i = 0; i < numBars; i++) {
            const barHeight = Math.floor(Math.random() * (canvas.height - 4)) + 4;
            const x = i * barWidth;
            const y = canvas.height - barHeight;
            
            const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
            grad.addColorStop(0, '#00ff00');
            grad.addColorStop(0.65, '#ffff00');
            grad.addColorStop(1, '#ff0000');
            
            ctx.fillStyle = grad;
            ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
        }
        
        winampAnimFrame = requestAnimationFrame(draw);
    }
    
    if (winampAnimFrame) cancelAnimationFrame(winampAnimFrame);
    draw();
}

function clearWinampCanvas() {
    const canvas = document.getElementById('winamp-spectrum');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

