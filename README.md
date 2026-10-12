# 🌩️ MEGH-AI: Severe Weather Nowcasting & Early Warning System

**MEGH-AI** is an AI-driven hyper-local early warning system for severe weather nowcasting (thunderstorms, cloudbursts, and flash floods) delivering 2–6 hour lead times across India. 

---

## 🎯 Problem Statement & Overview

### The Challenge
Severe convective weather events—such as sudden **cloudbursts**, **intense thunderstorms with hail/lightning**, and **flash floods**—pose significant risks to lives, infrastructure, and agriculture across India. 
- Traditional Numerical Weather Prediction (NWP) models often suffer from coarse resolution and long latency, making them insufficient for short-range (2–6 hour) hyper-local forecasting.
- Local District Emergency Operations Centers (DEOCs) and operational forecasters need high-resolution (~5 km grid), 15-minute update telemetry combined with **Explainable AI (XAI)** to issue timely, trustworthy emergency alerts.

### The MEGH-AI Solution
MEGH-AI bridges this gap by fusing multi-source telemetry data:
1. **Multi-Source Data Alignment**: Combines **IMDAA Reanalysis** atmospheric profiles, **INSAT-3D/3DR Satellite Feeds** (Water Vapor & Cloud Top Temperature), Satellite Quantitative Precipitation Estimation (QPE), and **CartoDEM** digital elevation models.
2. **Physics-Informed Feature Extraction**: Dynamically calculates key meteorological indicators such as Integrated Water Vapor (IWV), CAPE, CIN, Low-Level Convergence, Vertical Shear, and Cloud Top Temperature (CTT) drop rates.
3. **Multi-Task Spatiotemporal Transformer**: Predicts hazard risks for severe storms, cloudbursts, and hydrodynamic flash floods.
4. **Explainable AI & CAP Dispatch**: Delivers plain-language risk attributions and generates OASIS Common Alerting Protocol (CAP v1.2) emergency warnings.

---

## 🌐 Localhost Access Link

Once the development server is running, open your web browser and go to:

👉 **[http://localhost:3000](http://localhost:3000)**

*(If port `3000` is already in use, Next.js will automatically launch on `http://localhost:3001`).*

---

## 💻 Step-by-Step Installation & Setup Guide (VS Code)

To run this project, you need **Node.js** and **npm** (npm comes bundled with Node.js).

### Step 1: Install Node.js & npm

1. Go to the official Node.js download page:
   👉 **[Download Node.js](https://nodejs.org/en/download)**
2. Download the **LTS (Long Term Support)** version for your operating system (macOS or Windows).
3. Run the installer and keep all **default settings** selected during setup.

#### Alternative for macOS (Homebrew users):
If you use Homebrew on macOS, you can install Node.js via terminal:
```bash
brew install node
```

---

### Step 2: Restart VS Code / Terminal

After the installation finishes:
- Completely close **VS Code** (or your terminal window) and re-open it so that the system environment variables (`PATH`) reload properly.

---

### Step 3: Verify Node.js & npm Installation

In VS Code, open a terminal window (**Terminal → New Terminal**) and run:

```bash
node --version
```
*Expected output: `v20.x.x` or `v22.x.x`*

Then check npm:
```bash
npm --version
```
*Expected output: `10.x.x` or higher*

> ⚠️ **Troubleshooting `npm: command not found` or unrecognized command:**
> - **Windows**: Restart your computer. If npm is still not recognized, ensure "Add to PATH" was enabled during Node.js installation.
> - **macOS**: Ensure terminal shell configuration (`.zshrc` / `.bash_profile`) points to `/usr/local/bin` or brew path.

---

### Step 4: Install Project Dependencies

Navigate to your project directory in the terminal:

```bash
cd warning_project
```

Install all required packages from `package.json`:

```bash
npm install
```

---

### Step 5: Run the Development Server

Start the application:

```bash
npm run dev
```

You will see output similar to:
```text
   ▲ Next.js 15.x
   - Local:        http://localhost:3000
   - Network:      http://127.0.2.2:3000

 ✓ Ready in 1.6s
```

Open **[http://localhost:3000](http://localhost:3000)** in your web browser to view the application!

---

## 🛠️ Summary of Available Commands

| Command | Description |
| :--- | :--- |
| `npm install` | Installs all project dependencies |
| `npm run dev` | Starts the local dev server at `http://localhost:3000` |
| `npm run build` | Compiles and builds the production bundle |
| `npm run start` | Launches the production server after building |
| `npm run lint` | Runs ESLint code check |
| `npm run clean` | Cleans Next.js build cache |
