# MarkDocx Studio • Native Windows React Native Application

[![Platform: Windows](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D4?logo=windows)](https://microsoft.com/windows)
[![React Native](https://img.shields.io/badge/UI-React%20Native-61DAFB?logo=react)](https://reactnative.dev)
[![Electron](https://img.shields.io/badge/Desktop-Electron-47848F?logo=electron)](https://www.electronjs.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)

A high-performance native Windows desktop application built with **React Native** (using React Native components and the `Animated` physics engine) and styled with Windows 11 Fluent dark glassmorphism. It converts Markdown files (`.md`, `.markdown`, `.txt`) into beautifully formatted Microsoft Word documents (`.docx`).

---

## 📋 System Requirements & Prerequisites

Before downloading and installing MarkDocx Studio for the first time, verify that your machine meets the following requirements:

| Requirement | Specification | Notes |
| :--- | :--- | :--- |
| **Operating System** | Windows 10 (Build 19041+) or Windows 11 (64-bit) | Supports custom Fluent Titlebar & native dialogs |
| **Node.js** | **v18.0.0** or newer (v20+ or v22+ LTS recommended) | Verify in PowerShell: `node -v` |
| **Package Manager** | npm (v9.0+) bundled with Node.js | Verify in PowerShell: `npm -v` |
| **Version Control** | Git for Windows | Verify in PowerShell: `git --version` |
| **Document Viewer** | Microsoft Word, LibreOffice, or Office 365 *(Optional)* | To open and view generated `.docx` files |

> [!NOTE]
> If you do not have Node.js installed, download the official installer from [nodejs.org](https://nodejs.org/) (choose the **LTS** version).

---

## 🚀 First-Time Download & Installation Guide

Follow these step-by-step instructions to get the application up and running on your system:

### Step 1: Download or Clone the Repository

Open **PowerShell** or **Command Prompt** in your preferred development directory (e.g. `C:\development\playground`) and run:

```powershell
git clone <repository-url> mdtodoc
cd mdtodoc
```

*(Alternatively, download the repository as a ZIP archive and extract it to a folder such as `C:\development\playground\mdtodoc`).*

### Step 2: Install Node Dependencies

Inside the project directory, run:

```powershell
npm install
```

This installs all runtime and development packages, including:
- `react`, `react-dom`, and `react-native-web` (React Native desktop components)
- `electron` (Native Windows desktop shell)
- `docx` (Word OpenXML document generation engine)
- `marked` (Markdown syntax lexer & AST parser)
- `canvas-confetti` (Conversion celebration animations)
- `lucide-react` (Fluent design icon suite)
- `vite` & `@vitejs/plugin-react` (Lightning-fast asset compiler)

### Step 3: Build the Application Assets

Compile the React Native web bundle and styles:

```powershell
npm run build
```

This outputs optimized assets into the `dist/` directory in under 2 seconds.

### Step 4: Create a 1-Click Desktop Shortcut (Recommended)

Generate a dedicated desktop icon that launches the app silently with zero console popups:

```powershell
powershell -ExecutionPolicy Bypass -File .\create_desktop_shortcut.ps1
```

A **MarkDocx Studio** icon will immediately appear on your Windows Desktop!

---

## 🎮 How to Run the Application

You can start MarkDocx Studio in any of the following ways:

### Option A: One-Click Desktop Icon (Fastest)
Double-click the **MarkDocx Studio** icon on your Desktop. It launches silently in the background with the custom icon and no lingering terminal window.

### Option B: From PowerShell / Command Prompt
```powershell
npm start
```

### Option C: Double-Click the Batch File
Double-click [`run.bat`](run.bat) directly in File Explorer.

### Option D: Live Development Mode (For Code Modifications)
If you want to edit the React Native UI code with live hot-module reload (HMR):
```powershell
npm run dev
```

---

## 🌟 Core Features & Visual Design

### 1. Fluent Windows 11 Native Architecture
- **Frameless Window**: Custom draggable titlebar with Minimize, Maximize/Restore, and Close buttons.
- **Native OS Dialogs**: Integrates with Windows `dialog.showOpenDialog` and `dialog.showSaveDialog` filtering for Markdown files.
- **One-Click Shell Integration**: Instant buttons to **"Open in Microsoft Word"** (`shell.openPath`) or **"Show in File Explorer"** (`shell.showItemInFolder`).

### 2. Dynamic React Native Animations
- **Breathing Ambient Glow & Icon Float**: Continuous looping pulse and bobbing file icon using React Native's `Animated.loop` and `Animated.sequence`.
- **Drag & Drop Spring Feedback**: Scale and border highlight when hovering Markdown files over the dropzone.
- **Physics Card Entrance**: Spring bounce animation (`Animated.spring`) when a file is selected.
- **Live Multi-Stage Conversion Pipeline**: Real-time progress bar tracking syntax lexing, styling, table synthesis, and DOCX compilation.
- **Confetti Victory Explosion**: Celebratory particle burst (`canvas-confetti`) with spring checkmark upon file creation.

### 3. Complete Markdown to DOCX Formatting
- **Headings (H1 - H6)**: Custom typography sizing, accent colors, and `keepWithNext` pagination rules.
- **Inline Text Styles**: **Bold**, *Italics*, ***Bold-Italics***, `Inline Code` (Consolas font), ~~Strikethrough~~, and [Hyperlinks](https://example.com).
- **GitHub-Style Callouts**: `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, and `> [!CAUTION]` rendered into Word callout boxes with icons and accent borders.
- **Tables**: Full-width tables with colored headers, high-contrast text, alternating row zebra striping, and column alignments.
- **Lists & Checklists**: Bulleted lists, numbered lists, and interactive task checkboxes (`☑ Done`, `☐ Pending`).
- **Fenced Code Blocks**: Monospaced Consolas font with language tags and dark/light box styling.
- **Headers & Footers**: Automatic document title header and "Page X of Y" pagination footer.

### 4. Interactive Tabs
- **Converter**: Quick file drop, document statistics analysis, and conversion controls.
- **Live Preview**: Split view comparing raw Markdown source with a simulated Word document page.
- **Document Style**: Live customization of accent colors (*Office Blue, Emerald, Indigo, Crimson, Purple, Slate*), primary fonts (*Segoe UI, Aptos, Calibri, Arial, Georgia*), and page margins (*Normal, Narrow, Moderate, Wide*).

---

## 📁 Repository Structure

```
mdtodoc/
├── .gitignore                   # Git ignore patterns for dependencies and build outputs
├── package.json                 # Project dependencies and script definitions
├── vite.config.mjs              # Vite configuration with React Native aliasing
├── index.html                   # HTML host shell with global animation polyfill
├── create_desktop_shortcut.ps1  # Helper script to regenerate desktop shortcut
├── launch.vbs                   # Silent VBScript launcher (hides console window)
├── run.bat                      # Convenient double-click Windows batch launcher
├── app_icon.ico                 # Custom 32-bit application desktop icon
├── electron/
│   ├── main.js                  # Electron main process & Windows IPC dialog handlers
│   ├── preload.js               # Secure contextBridge API
│   └── markdownDocxConverter.js # Marked AST to OpenXML .docx compiler
├── src/
│   ├── main.jsx                 # App bootstrap with GlobalErrorBoundary
│   ├── App.jsx                  # Main React Native interface & state coordination
│   └── components/
│       ├── TitleBar.jsx             # Windows 11 custom title bar
│       ├── DropZone.jsx             # Animated dropzone with spring physics
│       ├── FileDetailsCard.jsx      # Animated file info & document metrics
│       ├── ConversionProgress.jsx   # Multi-stage conversion progress & celebration
│       ├── StyleConfigurator.jsx    # Custom accent palettes, fonts & margins
│       └── MarkdownPreview.jsx      # Split preview & Word layout simulation
└── sample_documents/
    └── sample_technical_spec.md # Ready-to-convert sample Markdown document
```

---

## 🛠️ Available NPM Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **`npm start`** | `electron .` | Runs the compiled native Windows application |
| **`npm run build`** | `vite build` | Compiles the React Native application assets into `dist/` |
| **`npm run dev`** | `node start-dev.js` | Launches Vite dev server + Electron with hot-module reload |

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
