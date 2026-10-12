# Turbo C++ Online Compiler 🚀

An authentic, modern, and nostalgic in-browser **Borland Turbo C++ 3.0** development environment and web simulator. Experience classic 16-bit C and C++ programming directly in your browser without installing DOSBox or configuring directories.

![Turbo C++ Online](https://img.shields.io/badge/Turbo_C++-3.0_Online-blue?style=for-the-badge&logo=cplusplus)
![Platform](https://img.shields.io/badge/Platform-Web_/_Browser-green?style=for-the-badge)
![Emulation](https://img.shields.io/badge/Emulation-DOSBox_WASM-orange?style=for-the-badge)

---

## ✨ Features

### 🕹️ 1. Authentic Borland Turbo C++ 3.0 (DOSBox WASM)
- Runs authentic 16-bit **Borland Turbo C++ 3.0 (TC.EXE)** inside modern browsers using WebAssembly DOSBox.
- Iconic Borland Royal Blue IDE with menus (`File`, `Edit`, `Search`, `Run`, `Compile`, `Debug`, `Project`, `Options`).
- Full support for classic header files:
  - `<iostream.h>` & `<fstream.h>`
  - `<conio.h>` (`clrscr()`, `getch()`, `gotoxy()`, `textcolor()`)
  - `<graphics.h>` (Borland Graphics Interface - BGI EGA/VGA modes)
  - `<dos.h>` (`delay()`, `sound()`, `nosound()`)
  - `<stdio.h>`, `<stdlib.h>`, `<string.h>`, `<math.h>`
- 16-bit system accuracy: `sizeof(int) == 2` bytes (range: `-32,768` to `32,767`).

### ⌨️ 2. Virtual Turbo C++ Keyboard Toolbar & Shortcuts
Modern laptops and MacBooks often lack function keys or conflict with browser shortcuts. Our on-screen toolbar provides 1-click execution for:
- **`Ctrl + F9`**: Run Program
- **`Alt + F9`**: Compile to Object (.OBJ)
- **`Alt + F5`**: User Output Screen
- **`F2`**: Save File
- **`F3`**: Open File
- **`F5`**: Zoom Window
- **`F6`**: Cycle Windows
- **`F7` / `F8`**: Trace & Step Debugging
- **`F10`**: Main Menu
- **`Alt + X`**: Quit Turbo C
- **Quick Symbol Row**: Easy insertion of `#`, `<`, `>`, `{`, `}`, `;`, `::`, `<<`, `>>`, `iostream.h`, `clrscr();`, `getch();`.

### 📋 3. High-Speed Code Injector / Autotyper
- Tired of manually typing 100 lines into DOSBox?
- Click **"Paste / Inject Code"**, paste your C/C++ code from your computer or clipboard, choose typing speed (5ms to 35ms), and watch the injector type your code directly into the Turbo C++ editor buffer!
- Live progress indicator with pause and cancel controls.

### ⚡ 4. Instant Turbo C++ Web IDE & Simulator (Zero-Boot Mode)
- Need to quickly test an algorithm without waiting for DOSBox to boot?
- Mode 2 provides an instant Web IDE with an **80x25 Virtual CRT Text Console** and **HTML5 Canvas BGI Graphics Engine**.
- Interactive `cin >>` / `scanf()` prompts, `clrscr()` screen clearing, and `textcolor()` support.
- Real-time `graphics.h` simulator supporting `initgraph`, `circle`, `line`, `rectangle`, `bar`, and `outtextxy`.

### 📚 5. Practical Exam Code Library
Includes 9 pre-loaded, classic college and school lab practical problems:
1. Hello World (`iostream.h` & `conio.h`)
2. Conio.h Colors & `gotoxy(x,y)` Text Video Demo
3. BGI Graphics: Concentric Geometric Art
4. BGI Graphics: Olympic Rings Symbol
5. C++ Class & Object OOP (Student Marksheet)
6. Matrix Multiplication (2D Arrays)
7. Palindrome Number & String Checker
8. Tower of Hanoi (Recursive Algorithm)
9. Standard C in Turbo C (`printf` / `scanf`)

### 🎨 6. Nostalgic Audio & CRT Themes
- Authentic PC speaker beep synthesizer using Web Audio API on `\a` alert bells.
- **4 Visual Themes**:
  - Classic Borland Blue
  - Modern Obsidian Dark
  - Retro Amber Phosphor CRT
  - Matrix Green Phosphor CRT
- Subtle CRT scanline overlay effect.
- Fullscreen mode support.

---

## 🚀 How to Run Locally

You can run this project locally with any static web server:

### Using Python 3 (Installed on Mac / Linux / Windows):
```bash
cd /Users/priyanxs/.gemini/antigravity/scratch/turbo-cpp-online
python3 -m http.server 8080
```
Then open your browser at:
```
http://localhost:8080
```

---

## 🌐 Deploying Online (Free Hosting)

This web application is completely client-side and requires no backend server.

### Option A: GitHub Pages
1. Push this folder to a GitHub repository.
2. Go to **Repository Settings** -> **Pages**.
3. Under **Build and deployment**, select **Source: Deploy from a branch** -> `main` branch -> `/ (root)`.
4. Click **Save**. Your site will be live at `https://<username>.github.io/<repo-name>/`.

### Option B: Cloudflare Pages / Vercel / Netlify
1. Drag and drop the folder into [Netlify Drop](https://app.netlify.com/drop) or link your GitHub repo to Cloudflare Pages / Vercel.
2. Framework preset: **None / Static HTML**.
3. Deploy in under 30 seconds!

---

## 📂 Project Structure

```
turbo-cpp-online/
├── index.html        # Main application layout, toolbar & tabs
├── style.css         # Retro Borland & CRT monitor styling, themes & responsiveness
├── app.js            # DOSBox lifecycle, keystroke injector & UI controller
├── simulator.js      # Interactive Web CRT (80x25) and BGI Graphics simulator
├── examples.js       # Pre-loaded classic Turbo C++ practical programs
└── README.md         # Documentation & guide
```

---

## 📜 License
Created for educational, archival, and nostalgic programming purposes.
Turbo C++ is a registered trademark of Borland / Embarcadero.
Powered by WebAssembly and DOSBox technology.
