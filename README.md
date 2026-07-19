# SmartMic (QR Auditorium) 🎙️

> **Contactless, Web-Based Interactive Microphone & Queue Management System for Auditoriums**
> Created with 💻 and ☕ by **Kunal Singh**&**Lokendra Dubey**

---

## 🌟 Overview

**SmartMic** (also referred to as **QR Auditorium**) is a modern web application designed to eliminate physical microphone passing during conferences, lectures, and interactive sessions. By utilizing QR-code scanning, audience members can transform their own smartphones into controlled, high-quality wireless microphones that queue up and speak in real-time, managed seamlessly by a host.

---

## ✨ Features

- **Instant QR Access**: Zero installation required. Audience members scan a dynamic QR code to join the interactive auditorium queue instantly.
- **Smart Speaking Queue**: Automates the speaking queue fairly. The administrator can grant speaking rights, enforce time limits, and moderate participants.
- **Microphone Management**: Visual indicator showing who has the floor, remaining speaking time, and active queues.
- **Administrative Control Panel**: Full suite of controls to start, pause, extend, and terminate speaking sessions.
- **Responsive Web UI**: A beautiful, premium layout crafted with glassmorphism, responsive elements, and smooth animations.

---

## 🛠️ Technology Stack

- **Frontend**: React + TypeScript (Vite)
- **Styling**: Tailwind CSS + shadcn-ui + Framer Motion (for smooth micro-animations)
- **Backend / Database**: Supabase (real-time subscriptions & RPC functions)
- **Tooling**: Bun / Node.js & TypeScript

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+) or [Bun](https://bun.sh/)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for local development)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/qr-auditorium.git
   cd qr-auditorium/auditorium-connect
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or using Bun:
   bun install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root of the `auditorium-connect` directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the local development server:**
   ```bash
   npm run dev
   # or:
   bun dev
   ```
   Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 📂 Project Structure

```
auditorium-connect/
├── public/                 # Static assets (Favicons, robots.txt)
├── src/
│   ├── assets/             # Brand logos & content illustrations
│   ├── components/         # Reusable UI components & SaaS layouts
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # Database & API connectors (Supabase)
│   ├── lib/                # Utility modules & helpers
│   ├── pages/              # Page layouts & router views
│   ├── App.tsx             # Root Application router
│   ├── main.tsx            # App entrypoint
│   └── index.css           # Global theme & typography
├── tailwind.config.ts      # Design system configuration
└── vite.config.ts          # Vite bundle configuration
```

---

## 👨‍💻 Creator

- **Lokendra Dubey**&**Kunal Singh** — *Founder & Lead Architect*
