// Turbo C++ Online - Main Application Controller
// Orchestrates DOSBox WebAssembly, Virtual Keyboard, Code Injector, and Web IDE

(function () {
    'use strict';

    // State
    let dosInstance = null;
    let ciInstance = null;
    let isDosLoading = false;
    let activeTab = 'dosbox'; // 'dosbox', 'simulator', 'library', 'guide'
    let webSimulator = null;
    let audioCtx = null;
    let isSoundEnabled = true;
    let injectionCanceled = false;

    // DOS Bundle Sources
    const BUNDLES = [
        { name: "Cloudflare Pages CDN", url: "https://turboc.pages.dev/turbocpp.jsdos" },
        { name: "GitHub Pages CDN", url: "https://sankalpsinghcoder-ai.github.io/online-c/turboc.jsdos" }
    ];
    let currentBundleIndex = 0;

    // Keycode Constants for DOSBox
    const DOS_KEYS = {
        'F1': 282, 'F2': 283, 'F3': 284, 'F4': 285, 'F5': 286, 'F6': 287,
        'F7': 288, 'F8': 289, 'F9': 290, 'F10': 291, 'F11': 292, 'F12': 293,
        'Enter': 257, 'Backspace': 259, 'Tab': 258, 'Esc': 256, 'Space': 32,
        'Up': 265, 'Down': 264, 'Left': 263, 'Right': 262,
        'Ctrl': 341, 'Alt': 342, 'Shift': 340,
        'Insert': 277, 'Delete': 278, 'Home': 268, 'End': 269, 'PageUp': 266, 'PageDown': 267
    };

    const SHIFT_CHARS = {
        '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
        '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/',
        '~': '`'
    };

    // DOM Elements
    const elements = {
        dosContainer: document.getElementById('dos-container'),
        dosDiv: document.getElementById('dos'),
        dosLoadingOverlay: document.getElementById('dos-loading-overlay'),
        dosStatusText: document.getElementById('dos-status-text'),
        dosRetryBtn: document.getElementById('dos-retry-btn'),
        
        // Mode Tabs
        tabDosbox: document.getElementById('tab-btn-dosbox'),
        tabSimulator: document.getElementById('tab-btn-simulator'),
        tabLibrary: document.getElementById('tab-btn-library'),
        tabGuide: document.getElementById('tab-btn-guide'),
        
        sectionDosbox: document.getElementById('section-dosbox'),
        sectionSimulator: document.getElementById('section-simulator'),
        sectionLibrary: document.getElementById('section-library'),
        sectionGuide: document.getElementById('section-guide'),
        
        // Code Injector Modal
        pasteModal: document.getElementById('paste-modal'),
        pasteOpenBtn: document.getElementById('btn-open-paste'),
        pasteCloseBtn: document.getElementById('btn-close-paste'),
        pasteInput: document.getElementById('paste-code-input'),
        pasteStartBtn: document.getElementById('btn-start-inject'),
        pasteCancelBtn: document.getElementById('btn-cancel-inject'),
        pasteProgress: document.getElementById('paste-progress'),
        pasteProgressBar: document.getElementById('paste-progress-bar'),
        pasteStatus: document.getElementById('paste-status'),
        pasteSpeed: document.getElementById('paste-speed'),
        
        // Simulator Controls
        simRunBtn: document.getElementById('sim-run-btn'),
        simClearBtn: document.getElementById('sim-clear-btn'),
        simCodeEditor: document.getElementById('sim-code-editor'),
        simStatus: document.getElementById('sim-status'),
        simTerminal: document.getElementById('sim-terminal'),
        simCanvas: document.getElementById('sim-canvas'),
        
        // Global Actions
        btnFullscreen: document.getElementById('btn-fullscreen'),
        btnRestartDos: document.getElementById('btn-restart-dos'),
        btnSoundToggle: document.getElementById('btn-sound-toggle'),
        themeSelect: document.getElementById('theme-select'),
        fileInput: document.getElementById('file-upload-input'),
        btnUploadFile: document.getElementById('btn-upload-file'),
        btnExportFile: document.getElementById('btn-export-file'),
        examplesList: document.getElementById('examples-grid')
    };

    // ==========================================
    // AUDIO SYNTHESIZER (Web Audio API)
    // ==========================================
    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) audioCtx = new AudioContext();
        }
    }

    function playBeep(freq = 800, durationMs = 80, type = 'square') {
        if (!isSoundEnabled) return;
        try {
            initAudio();
            if (!audioCtx) return;
            if (audioCtx.state === 'suspended') audioCtx.resume();
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (durationMs / 1000));
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + (durationMs / 1000));
        } catch (e) {
            console.warn("Audio error:", e);
        }
    }

    function playKeyClick() {
        playBeep(1200, 15, 'sine');
    }

    // ==========================================
    // DOSBOX INITIALIZATION & RETRY
    // ==========================================
    async function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async function initDosbox() {
        if (dosInstance || isDosLoading) return;
        isDosLoading = true;
        
        elements.dosLoadingOverlay.style.display = 'flex';
        elements.dosStatusText.textContent = `Downloading Turbo C++ 3.0 image from ${BUNDLES[currentBundleIndex].name}...`;

        try {
            // Load JS-DOS v8 scripts if not already in window
            if (typeof window.Dos === "undefined") {
                elements.dosStatusText.textContent = "Loading WebAssembly DOSBox engine...";
                await loadScript("https://v8.js-dos.com/latest/emulators/emulators.js");
                await loadScript("https://v8.js-dos.com/latest/js-dos.js");
                
                while (typeof window.Dos === "undefined" || typeof window.emulators === "undefined") {
                    await new Promise(r => setTimeout(r, 100));
                }
                window.emulators.pathPrefix = "https://v8.js-dos.com/latest/emulators/";
            }

            const bundleUrl = BUNDLES[currentBundleIndex].url + "?v=" + Date.now();
            elements.dosStatusText.textContent = `Extracting Borland Turbo C++ 3.0 files...`;

            elements.dosDiv.innerHTML = '';
            
            dosInstance = Dos(elements.dosDiv, {
                url: bundleUrl,
                onEvent: (event, ci) => {
                    console.log("[DOSBOX EVENT]", event);
                    if (event === "ci-ready") {
                        ciInstance = ci;
                        isDosLoading = false;
                        elements.dosLoadingOverlay.style.display = 'none';
                        playBeep(520, 200, 'square');
                        console.log("Turbo C++ 3.0 is ready!");
                    }
                },
                onError: (error) => {
                    console.error("[DOSBOX ERROR]", error);
                    handleDosError(error);
                }
            });

        } catch (err) {
            console.error("Failed to initialize DOSBox:", err);
            handleDosError(err);
        }
    }

    function handleDosError(err) {
        isDosLoading = false;
        elements.dosStatusText.innerHTML = `
            <div style="color: #ff6b6b; margin-bottom: 8px;">Failed to load bundle from ${BUNDLES[currentBundleIndex].name}.</div>
            <div style="font-size: 0.8rem; opacity: 0.8;">${err.message || 'Network timeout or CORS limitation.'}</div>
        `;
        elements.dosRetryBtn.style.display = 'inline-block';
        
        // Auto-switch to fallback bundle next attempt
        currentBundleIndex = (currentBundleIndex + 1) % BUNDLES.length;
        elements.dosRetryBtn.textContent = `Try Alternative Mirror (${BUNDLES[currentBundleIndex].name})`;
    }

    function restartDosbox() {
        if (ciInstance) {
            try { ciInstance.exit(); } catch(e){}
            ciInstance = null;
        }
        dosInstance = null;
        isDosLoading = false;
        initDosbox();
    }

    // ==========================================
    // KEYSTROKE DISPATCH TO DOSBOX
    // ==========================================
    function sendKeyToDos(keyCode, shift = false, ctrl = false, alt = false) {
        if (!ciInstance) {
            alert("Turbo C++ is still booting up in DOSBox. Please wait for the blue screen to appear!");
            return;
        }
        playKeyClick();

        if (shift) ciInstance.sendKeyEvent(DOS_KEYS.Shift, true);
        if (ctrl) ciInstance.sendKeyEvent(DOS_KEYS.Ctrl, true);
        if (alt) ciInstance.sendKeyEvent(DOS_KEYS.Alt, true);

        ciInstance.sendKeyEvent(keyCode, true);

        setTimeout(() => {
            ciInstance.sendKeyEvent(keyCode, false);
            if (alt) ciInstance.sendKeyEvent(DOS_KEYS.Alt, false);
            if (ctrl) ciInstance.sendKeyEvent(DOS_KEYS.Ctrl, false);
            if (shift) ciInstance.sendKeyEvent(DOS_KEYS.Shift, false);
        }, 35);
    }

    function sendCharToDos(char) {
        if (!ciInstance) return;
        
        let needsShift = false;
        let targetKey = char;

        if (SHIFT_CHARS[char]) {
            needsShift = true;
            targetKey = SHIFT_CHARS[char];
        } else if (char >= 'A' && char <= 'Z') {
            needsShift = true;
            targetKey = char.toLowerCase();
        }

        let code = null;
        if (targetKey === '\n' || targetKey === '\r') {
            code = DOS_KEYS.Enter;
        } else if (targetKey === '\t') {
            code = DOS_KEYS.Tab;
        } else if (targetKey === ' ') {
            code = DOS_KEYS.Space;
        } else if (targetKey.length === 1) {
            code = targetKey.toUpperCase().charCodeAt(0);
        }

        if (code) {
            sendKeyToDos(code, needsShift, false, false);
        }
    }

    // ==========================================
    // CODE INJECTOR (Keystroke Autotyper)
    // ==========================================
    async function injectCodeIntoDos(codeText, speedMs = 15) {
        if (!ciInstance) {
            alert("Turbo C++ is not running yet. Please wait for DOSBox to boot!");
            return;
        }

        injectionCanceled = false;
        elements.pasteProgress.style.display = 'block';
        elements.pasteStartBtn.style.display = 'none';
        elements.pasteCancelBtn.style.display = 'inline-block';
        
        const totalChars = codeText.length;
        elements.pasteStatus.textContent = `Injecting 0 / ${totalChars} characters into Turbo C++...`;

        // Focus DOS canvas
        const canvas = elements.dosDiv.querySelector('canvas');
        if (canvas) canvas.focus();

        for (let i = 0; i < totalChars; i++) {
            if (injectionCanceled) {
                elements.pasteStatus.textContent = "Injection stopped by user.";
                break;
            }

            const char = codeText[i];
            sendCharToDos(char);

            // Update UI periodically
            if (i % 10 === 0 || i === totalChars - 1) {
                const percent = Math.round(((i + 1) / totalChars) * 100);
                elements.pasteProgressBar.style.width = `${percent}%`;
                elements.pasteStatus.textContent = `Injecting: ${i + 1} / ${totalChars} (${percent}%)...`;
            }

            await new Promise(r => setTimeout(r, speedMs));
        }

        elements.pasteStartBtn.style.display = 'inline-block';
        elements.pasteCancelBtn.style.display = 'none';
        
        if (!injectionCanceled) {
            elements.pasteStatus.textContent = "✓ Code injection complete! Check your Turbo C++ editor.";
            playBeep(600, 150);
            setTimeout(() => {
                elements.pasteModal.style.display = 'none';
                elements.pasteProgress.style.display = 'none';
            }, 1200);
        }
    }

    // ==========================================
    // TOOLBAR & VIRTUAL SHORTCUT KEYS
    // ==========================================
    function setupToolbarButtons() {
        // Quick Shortcuts
        const bindKeyBtn = (id, keyCode, shift, ctrl, alt) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    sendKeyToDos(keyCode, shift, ctrl, alt);
                });
            }
        };

        // Turbo C Standard Commands
        bindKeyBtn('tc-key-run', DOS_KEYS.F9, false, true, false);      // Ctrl + F9
        bindKeyBtn('tc-key-compile', DOS_KEYS.F9, false, false, true);  // Alt + F9
        bindKeyBtn('tc-key-output', DOS_KEYS.F5, false, false, true);   // Alt + F5
        bindKeyBtn('tc-key-save', DOS_KEYS.F2, false, false, false);    // F2
        bindKeyBtn('tc-key-open', DOS_KEYS.F3, false, false, false);    // F3
        bindKeyBtn('tc-key-zoom', DOS_KEYS.F5, false, false, false);    // F5
        bindKeyBtn('tc-key-nextwin', DOS_KEYS.F6, false, false, false); // F6
        bindKeyBtn('tc-key-trace', DOS_KEYS.F7, false, false, false);   // F7
        bindKeyBtn('tc-key-step', DOS_KEYS.F8, false, false, false);    // F8
        bindKeyBtn('tc-key-menu', DOS_KEYS.F10, false, false, false);   // F10
        bindKeyBtn('tc-key-esc', DOS_KEYS.Esc, false, false, false);    // Esc
        bindKeyBtn('tc-key-quit', 88, false, false, true);              // Alt + X

        // Navigation Keys
        bindKeyBtn('tc-nav-up', DOS_KEYS.Up, false, false, false);
        bindKeyBtn('tc-nav-down', DOS_KEYS.Down, false, false, false);
        bindKeyBtn('tc-nav-left', DOS_KEYS.Left, false, false, false);
        bindKeyBtn('tc-nav-right', DOS_KEYS.Right, false, false, false);
        bindKeyBtn('tc-nav-enter', DOS_KEYS.Enter, false, false, false);
        bindKeyBtn('tc-nav-bksp', DOS_KEYS.Backspace, false, false, false);
        bindKeyBtn('tc-nav-tab', DOS_KEYS.Tab, false, false, false);

        // Symbol Buttons
        document.querySelectorAll('.tc-sym-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const sym = btn.getAttribute('data-sym');
                if (sym) {
                    for (let c of sym) {
                        sendCharToDos(c);
                    }
                }
            });
        });
    }

    // ==========================================
    // TAB SWITCHING
    // ==========================================
    function switchTab(tabId) {
        activeTab = tabId;
        const tabs = ['dosbox', 'simulator', 'library', 'guide'];
        
        tabs.forEach(t => {
            const btn = elements[`tab${t.charAt(0).toUpperCase() + t.slice(1)}`];
            const sec = elements[`section${t.charAt(0).toUpperCase() + t.slice(1)}`];
            if (btn) btn.classList.toggle('active', t === tabId);
            if (sec) sec.style.display = (t === tabId) ? 'block' : 'none';
        });

        if (tabId === 'dosbox' && !dosInstance && !isDosLoading) {
            initDosbox();
        }

        playKeyClick();
    }

    // ==========================================
    // EXAMPLES LIBRARY RENDERING
    // ==========================================
    function renderExamples() {
        if (!elements.examplesList || !window.TURBO_EXAMPLES) return;

        let html = '';
        window.TURBO_EXAMPLES.forEach(ex => {
            html += `
                <div class="example-card">
                    <div class="example-header">
                        <span class="example-tag">${ex.category}</span>
                        <h4 class="example-title">${ex.title}</h4>
                    </div>
                    <p class="example-desc">${ex.description}</p>
                    <div class="example-preview">
                        <pre><code>${escapeHtml(ex.code.substring(0, 150))}...</code></pre>
                    </div>
                    <div class="example-actions">
                        <button class="btn-retro btn-sm btn-load-sim" data-id="${ex.id}">
                            ⚡ Run in Web IDE
                        </button>
                        <button class="btn-retro btn-sm btn-inject-tc" data-id="${ex.id}">
                            🕹️ Inject to Turbo C++
                        </button>
                        <button class="btn-retro btn-sm btn-copy-code" data-id="${ex.id}">
                            📋 Copy Code
                        </button>
                    </div>
                </div>
            `;
        });
        elements.examplesList.innerHTML = html;

        // Attach event listeners
        elements.examplesList.querySelectorAll('.btn-load-sim').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const ex = window.TURBO_EXAMPLES.find(e => e.id === id);
                if (ex) {
                    elements.simCodeEditor.value = ex.code;
                    switchTab('simulator');
                    runWebSimulator();
                }
            });
        });

        elements.examplesList.querySelectorAll('.btn-inject-tc').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const ex = window.TURBO_EXAMPLES.find(e => e.id === id);
                if (ex) {
                    elements.pasteInput.value = ex.code;
                    switchTab('dosbox');
                    elements.pasteModal.style.display = 'flex';
                }
            });
        });

        elements.examplesList.querySelectorAll('.btn-copy-code').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const ex = window.TURBO_EXAMPLES.find(e => e.id === id);
                if (ex) {
                    navigator.clipboard.writeText(ex.code).then(() => {
                        btn.textContent = "✓ Copied!";
                        setTimeout(() => btn.textContent = "📋 Copy Code", 1500);
                    });
                }
            });
        });
    }

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // ==========================================
    // WEB SIMULATOR RUNNER
    // ==========================================
    function initWebSimulator() {
        if (!elements.simTerminal) return;
        webSimulator = new window.TurboSimulator(
            elements.simTerminal,
            elements.simCanvas,
            (status) => {
                if (elements.simStatus) elements.simStatus.textContent = status;
            }
        );
    }

    async function runWebSimulator() {
        if (!webSimulator) initWebSimulator();
        const code = elements.simCodeEditor.value;
        if (!code.trim()) {
            alert("Please enter C/C++ source code to run.");
            return;
        }

        elements.simRunBtn.disabled = true;
        elements.simRunBtn.innerHTML = '⏳ Running...';
        playBeep(440, 100);

        try {
            await webSimulator.executeCode(code);
        } finally {
            elements.simRunBtn.disabled = false;
            elements.simRunBtn.innerHTML = '▶ Run (Ctrl+F9)';
        }
    }

    // ==========================================
    // FILE IMPORT & EXPORT
    // ==========================================
    function setupFileHandling() {
        if (elements.btnUploadFile && elements.fileInput) {
            elements.btnUploadFile.addEventListener('click', () => elements.fileInput.click());
            
            elements.fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target.result;
                    // Load into both simulator and paste modal
                    elements.simCodeEditor.value = content;
                    elements.pasteInput.value = content;
                    
                    if (confirm(`Loaded "${file.name}". Do you want to inject it into Turbo C++ DOSBox now?`)) {
                        switchTab('dosbox');
                        elements.pasteModal.style.display = 'flex';
                    } else {
                        switchTab('simulator');
                    }
                };
                reader.readAsText(file);
            });
        }

        if (elements.btnExportFile) {
            elements.btnExportFile.addEventListener('click', () => {
                const code = elements.simCodeEditor.value || elements.pasteInput.value || "// Turbo C++ Code";
                const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'TURBO.CPP';
                a.click();
                URL.revokeObjectURL(a.href);
            });
        }
    }

    // ==========================================
    // THEME & FULLSCREEN
    // ==========================================
    function setupThemesAndFullscreen() {
        if (elements.themeSelect) {
            elements.themeSelect.addEventListener('change', (e) => {
                document.body.className = e.target.value;
                localStorage.setItem('turboc_theme', e.target.value);
            });

            const savedTheme = localStorage.getItem('turboc_theme');
            if (savedTheme) {
                elements.themeSelect.value = savedTheme;
                document.body.className = savedTheme;
            }
        }

        if (elements.btnFullscreen) {
            elements.btnFullscreen.addEventListener('click', () => {
                const target = elements.dosContainer || document.documentElement;
                if (!document.fullscreenElement) {
                    target.requestFullscreen().catch(err => alert("Fullscreen error: " + err.message));
                } else {
                    document.exitFullscreen();
                }
            });
        }

        if (elements.btnSoundToggle) {
            elements.btnSoundToggle.addEventListener('click', () => {
                isSoundEnabled = !isSoundEnabled;
                elements.btnSoundToggle.textContent = isSoundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
                playBeep(isSoundEnabled ? 880 : 330, 80);
            });
        }
    }

    // ==========================================
    // EVENT LISTENERS & SETUP
    // ==========================================
    function init() {
        // Tab buttons
        elements.tabDosbox.addEventListener('click', () => switchTab('dosbox'));
        elements.tabSimulator.addEventListener('click', () => switchTab('simulator'));
        elements.tabLibrary.addEventListener('click', () => switchTab('library'));
        elements.tabGuide.addEventListener('click', () => switchTab('guide'));

        // Retry DOSBox button
        if (elements.dosRetryBtn) {
            elements.dosRetryBtn.addEventListener('click', () => {
                elements.dosRetryBtn.style.display = 'none';
                initDosbox();
            });
        }

        if (elements.btnRestartDos) {
            elements.btnRestartDos.addEventListener('click', () => {
                if (confirm("Restart Turbo C++ DOSBox environment?")) {
                    restartDosbox();
                }
            });
        }

        // Paste Modal
        elements.pasteOpenBtn.addEventListener('click', () => {
            elements.pasteModal.style.display = 'flex';
            elements.pasteInput.focus();
        });

        elements.pasteCloseBtn.addEventListener('click', () => {
            elements.pasteModal.style.display = 'none';
        });

        elements.pasteStartBtn.addEventListener('click', () => {
            const code = elements.pasteInput.value;
            if (!code.trim()) {
                alert("Please paste your C/C++ code into the box first.");
                return;
            }
            const speed = parseInt(elements.pasteSpeed.value, 10) || 15;
            injectCodeIntoDos(code, speed);
        });

        elements.pasteCancelBtn.addEventListener('click', () => {
            injectionCanceled = true;
        });

        // Simulator buttons
        elements.simRunBtn.addEventListener('click', runWebSimulator);
        elements.simClearBtn.addEventListener('click', () => {
            if (webSimulator) webSimulator.clrscr();
        });

        // Shortcut for simulator Ctrl+F9
        window.addEventListener('keydown', (e) => {
            if (activeTab === 'simulator' && e.ctrlKey && e.key === 'F9') {
                e.preventDefault();
                runWebSimulator();
            }
        });

        setupToolbarButtons();
        setupFileHandling();
        setupThemesAndFullscreen();
        renderExamples();
        initWebSimulator();

        // Boot DOSBox by default
        initDosbox();
    }

    // Start on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
