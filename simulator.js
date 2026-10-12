// Turbo C++ Web CRT & BGI Simulator Engine
// Emulates classic Borland Turbo C++ 3.0 conio.h, graphics.h, iostream.h, and stdio.h in browser

class TurboSimulator {
    constructor(terminalElement, graphicsCanvas, statusCallback) {
        this.termEl = terminalElement;
        this.canvas = graphicsCanvas;
        this.ctx = graphicsCanvas ? graphicsCanvas.getContext('2d') : null;
        this.statusCb = statusCallback || (() => {});
        
        // 80x25 Text Grid
        this.cols = 80;
        this.rows = 25;
        this.cursorX = 1; // 1-indexed (Borland conio standard)
        this.cursorY = 1;
        this.textColor = 7; // LIGHTGRAY
        this.textBg = 0;    // BLACK
        this.screenBuffer = []; // 2D array [row][col] = { char, fg, bg }
        this.isGraphicsMode = false;
        this.isRunning = false;
        this.keyPressResolver = null;
        this.inputResolver = null;
        this.currentX = 0;
        this.currentY = 0;

        // BGI Colors (EGA / VGA 16 colors)
        this.EGA_COLORS = [
            '#000000', // 0: BLACK
            '#0000AA', // 1: BLUE
            '#00AA00', // 2: GREEN
            '#00AAAA', // 3: CYAN
            '#AA0000', // 4: RED
            '#AA00AA', // 5: MAGENTA
            '#AA5500', // 6: BROWN
            '#AAAAAA', // 7: LIGHTGRAY
            '#555555', // 8: DARKGRAY
            '#5555FF', // 9: LIGHTBLUE
            '#55FF55', // 10: LIGHTGREEN
            '#55FFFF', // 11: LIGHTCYAN
            '#FF5555', // 12: LIGHTRED
            '#FF55FF', // 13: LIGHTMAGENTA
            '#FFFF55', // 14: YELLOW
            '#FFFFFF'  // 15: WHITE
        ];

        this.initGrid();
        this.renderScreen();
        this.setupKeyboardListeners();
    }

    initGrid() {
        this.screenBuffer = [];
        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                row.push({ char: ' ', fg: 7, bg: 0 });
            }
            this.screenBuffer.push(row);
        }
        this.cursorX = 1;
        this.cursorY = 1;
    }

    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            if (this.keyPressResolver) {
                e.preventDefault();
                const resolver = this.keyPressResolver;
                this.keyPressResolver = null;
                resolver(e.key.length === 1 ? e.key.charCodeAt(0) : 13);
            }
        });
    }

    // ==========================================
    // CONIO.H & TEXT SCREEN API
    // ==========================================

    clrscr() {
        this.initGrid();
        if (this.canvas && this.ctx) {
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.isGraphicsMode = false;
        this.renderScreen();
    }

    gotoxy(x, y) {
        this.cursorX = Math.max(1, Math.min(this.cols, Math.floor(x)));
        this.cursorY = Math.max(1, Math.min(this.rows, Math.floor(y)));
        this.renderScreen();
    }

    wherex() { return this.cursorX; }
    wherey() { return this.cursorY; }

    textcolor(color) {
        if (typeof color === 'string') {
            const colorMap = {
                'BLACK': 0, 'BLUE': 1, 'GREEN': 2, 'CYAN': 3,
                'RED': 4, 'MAGENTA': 5, 'BROWN': 6, 'LIGHTGRAY': 7,
                'DARKGRAY': 8, 'LIGHTBLUE': 9, 'LIGHTGREEN': 10, 'LIGHTCYAN': 11,
                'LIGHTRED': 12, 'LIGHTMAGENTA': 13, 'YELLOW': 14, 'WHITE': 15
            };
            this.textColor = colorMap[color.toUpperCase()] !== undefined ? colorMap[color.toUpperCase()] : 7;
        } else {
            this.textColor = Math.max(0, Math.min(15, color));
        }
    }

    textbackground(color) {
        if (typeof color === 'string') {
            const colorMap = {
                'BLACK': 0, 'BLUE': 1, 'GREEN': 2, 'CYAN': 3,
                'RED': 4, 'MAGENTA': 5, 'BROWN': 6, 'LIGHTGRAY': 7
            };
            this.textBg = colorMap[color.toUpperCase()] !== undefined ? colorMap[color.toUpperCase()] : 0;
        } else {
            this.textBg = Math.max(0, Math.min(7, color));
        }
    }

    putChar(ch) {
        if (ch === '\n') {
            this.cursorX = 1;
            this.cursorY++;
            if (this.cursorY > this.rows) {
                this.scrollUp();
                this.cursorY = this.rows;
            }
            return;
        }

        if (ch === '\r') {
            this.cursorX = 1;
            return;
        }

        if (ch === '\t') {
            const nextTab = Math.min(this.cols, ((Math.floor((this.cursorX - 1) / 8) + 1) * 8) + 1);
            while (this.cursorX < nextTab) {
                this.putChar(' ');
            }
            return;
        }

        if (ch === '\b') {
            if (this.cursorX > 1) this.cursorX--;
            return;
        }

        if (this.cursorX > this.cols) {
            this.cursorX = 1;
            this.cursorY++;
            if (this.cursorY > this.rows) {
                this.scrollUp();
                this.cursorY = this.rows;
            }
        }

        const r = this.cursorY - 1;
        const c = this.cursorX - 1;
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
            this.screenBuffer[r][c] = {
                char: ch,
                fg: this.textColor,
                bg: this.textBg
            };
            this.cursorX++;
        }
    }

    scrollUp() {
        this.screenBuffer.shift();
        const newRow = [];
        for (let c = 0; c < this.cols; c++) {
            newRow.push({ char: ' ', fg: 7, bg: this.textBg });
        }
        this.screenBuffer.push(newRow);
    }

    writeString(str) {
        for (let i = 0; i < str.length; i++) {
            this.putChar(str[i]);
        }
        this.renderScreen();
    }

    renderScreen() {
        if (!this.termEl) return;
        
        let html = '';
        for (let r = 0; r < this.rows; r++) {
            let rowHtml = '';
            for (let c = 0; c < this.cols; c++) {
                const cell = this.screenBuffer[r][c];
                const isCursor = (r === this.cursorY - 1 && c === this.cursorX - 1);
                const char = cell.char === ' ' ? '&nbsp;' : this.escapeHtml(cell.char);
                const fgColor = this.EGA_COLORS[cell.fg] || '#AAAAAA';
                const bgColor = this.EGA_COLORS[cell.bg] || '#000000';
                
                if (isCursor) {
                    rowHtml += `<span class="dos-cursor" style="color: ${bgColor}; background-color: ${fgColor}; font-weight: bold;">${char}</span>`;
                } else {
                    rowHtml += `<span style="color: ${fgColor}; background-color: ${bgColor};">${char}</span>`;
                }
            }
            html += `<div class="dos-line">${rowHtml}</div>`;
        }
        this.termEl.innerHTML = html;
    }

    escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    async getch() {
        this.renderScreen();
        return new Promise((resolve) => {
            this.keyPressResolver = resolve;
            this.statusCb("Waiting for getch() keypress [Press any key]...");
        });
    }

    async delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async readInput(promptText) {
        if (promptText) this.writeString(promptText);
        this.renderScreen();
        
        return new Promise((resolve) => {
            const inputContainer = document.createElement('div');
            inputContainer.className = 'interactive-input-box';
            inputContainer.innerHTML = `
                <div class="input-prompt-label">DOS User Screen Prompt:</div>
                <div class="input-row">
                    <input type="text" id="turbo-interactive-input" class="turbo-stdin-field" autofocus placeholder="Type value & hit Enter..." autocomplete="off" />
                    <button id="turbo-submit-input" class="turbo-stdin-btn">Submit (Enter)</button>
                </div>
            `;
            
            const overlay = document.getElementById('screen-input-overlay');
            if (overlay) {
                overlay.innerHTML = '';
                overlay.appendChild(inputContainer);
                overlay.style.display = 'flex';
                
                const inputField = inputContainer.querySelector('#turbo-interactive-input');
                const submitBtn = inputContainer.querySelector('#turbo-submit-input');
                inputField.focus();

                const submitHandler = () => {
                    const val = inputField.value;
                    overlay.style.display = 'none';
                    overlay.innerHTML = '';
                    this.writeString(val + '\n');
                    resolve(val);
                };

                submitBtn.addEventListener('click', submitHandler);
                inputField.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') submitHandler();
                });
            } else {
                const res = prompt(promptText || "Input value:") || "";
                this.writeString(res + '\n');
                resolve(res);
            }
        });
    }

    // ==========================================
    // GRAPHICS.H (BGI) API
    // ==========================================

    initgraph(gd, gm, path) {
        this.isGraphicsMode = true;
        if (this.canvas) {
            this.canvas.style.display = 'block';
            this.canvas.width = 640;
            this.canvas.height = 480;
            if (this.termEl) this.termEl.style.display = 'none';
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, 640, 480);
            this.ctx.lineWidth = 1;
            this.setcolor(15); // WHITE default
        }
        this.currentX = 0;
        this.currentY = 0;
        this.statusCb("Graphics Mode Initialized: 640x480 EGA/VGA");
    }

    closegraph() {
        this.isGraphicsMode = false;
        if (this.canvas) this.canvas.style.display = 'none';
        if (this.termEl) this.termEl.style.display = 'block';
        this.statusCb("Graphics closed. Returned to text mode.");
    }

    setcolor(color) {
        const c = typeof color === 'string' ? color : (this.EGA_COLORS[color] || '#FFFFFF');
        if (this.ctx) {
            this.ctx.strokeStyle = c;
            this.ctx.fillStyle = c;
        }
    }

    setbkcolor(color) {
        const c = typeof color === 'string' ? color : (this.EGA_COLORS[color] || '#000000');
        if (this.canvas && this.ctx) {
            this.ctx.fillStyle = c;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    getmaxx() { return 639; }
    getmaxy() { return 479; }
    getx() { return this.currentX; }
    gety() { return this.currentY; }

    line(x1, y1, x2, y2) {
        if (!this.ctx) return;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.currentX = x2;
        this.currentY = y2;
    }

    lineto(x, y) {
        this.line(this.currentX, this.currentY, x, y);
    }

    linerel(dx, dy) {
        this.line(this.currentX, this.currentY, this.currentX + dx, this.currentY + dy);
    }

    circle(x, y, radius) {
        if (!this.ctx) return;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    arc(x, y, stangle, endangle, radius) {
        if (!this.ctx) return;
        const startRad = (stangle * Math.PI) / 180;
        const endRad = (endangle * Math.PI) / 180;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, startRad, endRad);
        this.ctx.stroke();
    }

    rectangle(left, top, right, bottom) {
        if (!this.ctx) return;
        this.ctx.beginPath();
        this.ctx.strokeRect(left, top, right - left, bottom - top);
    }

    bar(left, top, right, bottom) {
        if (!this.ctx) return;
        this.ctx.fillRect(left, top, right - left, bottom - top);
    }

    bar3d(left, top, right, bottom, depth, topflag) {
        if (!this.ctx) return;
        // Front face
        this.ctx.fillRect(left, top, right - left, bottom - top);
        this.ctx.strokeRect(left, top, right - left, bottom - top);
        
        // 3D side and top
        this.ctx.beginPath();
        this.ctx.moveTo(right, bottom);
        this.ctx.lineTo(right + depth, bottom - depth);
        this.ctx.lineTo(right + depth, top - depth);
        this.ctx.lineTo(right, top);
        this.ctx.stroke();

        if (topflag) {
            this.ctx.beginPath();
            this.ctx.moveTo(left, top);
            this.ctx.lineTo(left + depth, top - depth);
            this.ctx.lineTo(right + depth, top - depth);
            this.ctx.lineTo(right, top);
            this.ctx.stroke();
        }
    }

    ellipse(x, y, stangle, endangle, xradius, yradius) {
        if (!this.ctx) return;
        const startRad = (stangle * Math.PI) / 180;
        const endRad = (endangle * Math.PI) / 180;
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, xradius, yradius, 0, startRad, endRad);
        this.ctx.stroke();
    }

    outtextxy(x, y, text) {
        if (!this.ctx) return;
        this.ctx.font = '12px "Courier New", monospace';
        this.ctx.fillText(text, x, y + 10);
    }

    cleardevice() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // ==========================================
    // CODE PARSER & TRANSPILER EXECUTION
    // ==========================================

    async executeCode(sourceCode) {
        this.isRunning = true;
        this.statusCb("Compiling C/C++ source code...");

        try {
            const jsCode = this.transpileToJS(sourceCode);
            this.statusCb("Running Turbo C++ program...");

            // Sandbox execution with Turbo Simulator instance methods exposed
            const runner = new Function(
                'tc',
                `return (async () => {
                    const clrscr = () => tc.clrscr();
                    const getch = () => tc.getch();
                    const gotoxy = (x, y) => tc.gotoxy(x, y);
                    const textcolor = (c) => tc.textcolor(c);
                    const textbackground = (c) => tc.textbackground(c);
                    const wherex = () => tc.wherex();
                    const wherey = () => tc.wherey();
                    const delay = (ms) => tc.delay(ms);
                    const cout = (...args) => tc.writeString(args.join(''));
                    const endl = "\\n";
                    const cin = async (prompt) => tc.readInput(prompt);
                    const cprintf = (fmt, ...args) => tc.writeString(tc.formatPrintf(fmt, args));
                    const printf = (fmt, ...args) => tc.writeString(tc.formatPrintf(fmt, args));
                    const scanf = async (fmt, ...vars) => tc.readInput();
                    
                    // BGI
                    const DETECT = 0;
                    const initgraph = (gd, gm, path) => tc.initgraph(gd, gm, path);
                    const closegraph = () => tc.closegraph();
                    const setcolor = (c) => tc.setcolor(c);
                    const setbkcolor = (c) => tc.setbkcolor(c);
                    const line = (x1, y1, x2, y2) => tc.line(x1, y1, x2, y2);
                    const lineto = (x, y) => tc.lineto(x, y);
                    const linerel = (dx, dy) => tc.linerel(dx, dy);
                    const circle = (x, y, r) => tc.circle(x, y, r);
                    const arc = (x, y, s, e, r) => tc.arc(x, y, s, e, r);
                    const rectangle = (l, t, r, b) => tc.rectangle(l, t, r, b);
                    const bar = (l, t, r, b) => tc.bar(l, t, r, b);
                    const bar3d = (l, t, r, b, d, tf) => tc.bar3d(l, t, r, b, d, tf);
                    const ellipse = (x, y, s, e, xr, yr) => tc.ellipse(x, y, s, e, xr, yr);
                    const outtextxy = (x, y, txt) => tc.outtextxy(x, y, txt);
                    const getmaxx = () => tc.getmaxx();
                    const getmaxy = () => tc.getmaxy();
                    const cleardevice = () => tc.cleardevice();
                    const sizeof = (t) => 2; // Turbo C 16-bit integer standard

                    // Colors
                    const BLACK = 0, BLUE = 1, GREEN = 2, CYAN = 3, RED = 4, MAGENTA = 5, BROWN = 6, LIGHTGRAY = 7;
                    const DARKGRAY = 8, LIGHTBLUE = 9, LIGHTGREEN = 10, LIGHTCYAN = 11, LIGHTRED = 12, LIGHTMAGENTA = 13;
                    const YELLOW = 14, WHITE = 15;

                    ${jsCode}
                    
                    if (typeof main === 'function') {
                        await main();
                    }
                })();`
            );

            await runner(this);
            this.statusCb("Program execution finished.");
        } catch (err) {
            console.error(err);
            this.writeString(`\n\n*** TURBO C COMPILER / RUNTIME ERROR ***\n${err.message}\n`);
            this.statusCb(`Error: ${err.message}`);
        } finally {
            this.isRunning = false;
        }
    }

    formatPrintf(fmt, args) {
        if (!fmt) return '';
        let i = 0;
        return fmt.replace(/%[0-9]*\.?[0-9]*[dfsSc%]/g, (match) => {
            if (match === '%%') return '%';
            if (i < args.length) {
                const arg = args[i++];
                return arg !== undefined ? String(arg) : match;
            }
            return match;
        }).replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    }

    transpileToJS(code) {
        let lines = code.split('\n');
        let transpiled = [];

        for (let rawLine of lines) {
            let line = rawLine.trim();

            // Ignore header files and pragmas
            if (line.startsWith('#include') || line.startsWith('#pragma')) {
                continue;
            }

            // Replace void main() / int main()
            line = line.replace(/\b(void|int)\s+main\s*\([^)]*\)/, 'async function main()');

            // Handle cout << ... << endl;
            if (line.includes('cout')) {
                line = line.replace(/cout\s*<<\s*([^;]+);/, (match, content) => {
                    let parts = content.split('<<').map(p => p.trim());
                    let mapped = parts.map(p => {
                        if (p === 'endl') return '"\\n"';
                        return p;
                    });
                    return `await cout(${mapped.join(', ')});`;
                });
            }

            // Handle cin >> x >> y;
            if (line.includes('cin')) {
                line = line.replace(/cin\s*>>\s*([^;]+);/, (match, content) => {
                    let vars = content.split('>>').map(v => v.trim());
                    let statements = vars.map(v => `${v} = await cin();`);
                    return statements.join(' ');
                });
            }

            // Replace getch() with await getch()
            line = line.replace(/\bgetch\s*\(\s*\)/g, 'await getch()');
            line = line.replace(/\bdelay\s*\(([^)]+)\)/g, 'await delay($1)');

            // Replace classic C/C++ type declarations with let
            line = line.replace(/\b(int|float|double|char|long|short)\s+([a-zA-Z_][a-zA-Z0-9_]*\s*(\[[^\]]*\])?(\s*=\s*[^,;]+)?(\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*\s*(\[[^\]]*\])?(\s*=\s*[^,;]+)?)*);/g, (match) => {
                let decl = match.replace(/^(int|float|double|char|long|short)\s+/, 'let ');
                // Clean array brackets in declaration: let arr[5] -> let arr = []
                decl = decl.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\[\s*\d*\s*\]\[\s*\d*\s*\]/g, '$1 = [[],[]]');
                decl = decl.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\[\s*\d*\s*\]/g, '$1 = []');
                return decl;
            });

            // Replace C++ class definitions syntax loosely
            if (line.startsWith('class ')) {
                line = line.replace(/^class\s+([a-zA-Z0-9_]+)/, 'class $1');
            }
            if (line === 'public:' || line === 'private:' || line === 'protected:') {
                continue;
            }

            transpiled.push(line);
        }

        return transpiled.join('\n');
    }
}

window.TurboSimulator = TurboSimulator;
