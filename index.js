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
