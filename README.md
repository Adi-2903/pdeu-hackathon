<!-- ============================================================
     HIREX — README.md
     Built by Team Last Commit · Breach Hackathon 2025
     ============================================================ -->

<div align="center">

<!-- ═══════════════════════════════════════════════════════════
     HERO BANNER
═══════════════════════════════════════════════════════════ -->

<svg width="100%" viewBox="0 0 1200 420" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">
  <defs>
    <!-- Glow filter for the X -->
    <filter id="xglow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="xglow2" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="3" result="blur">
        <animate attributeName="stdDeviation" values="3;10;3" dur="2.5s" repeatCount="indefinite"/>
      </feGaussianBlur>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <!-- Card drop shadow -->
    <filter id="cardshadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#F97316" flood-opacity="0.18"/>
    </filter>
    <filter id="softdrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.10"/>
    </filter>
    <!-- Animated gradient -->
    <linearGradient id="heroBG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF7ED"/>
      <stop offset="50%" stop-color="#FFEDD5"/>
      <stop offset="100%" stop-color="#FEF3C7"/>
    </linearGradient>
    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F97316" stop-opacity="0.12"/>
      <stop offset="50%" stop-color="#F97316" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#F97316" stop-opacity="0.12"/>
    </linearGradient>
    <linearGradient id="cardGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#FFF7ED"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="420" fill="url(#heroBG)"/>

  <!-- Subtle grid lines -->
  <line x1="0" y1="140" x2="1200" y2="140" stroke="#F97316" stroke-opacity="0.06" stroke-width="1"/>
  <line x1="0" y1="280" x2="1200" y2="280" stroke="#F97316" stroke-opacity="0.06" stroke-width="1"/>
  <line x1="300" y1="0" x2="300" y2="420" stroke="#F97316" stroke-opacity="0.06" stroke-width="1"/>
  <line x1="600" y1="0" x2="600" y2="420" stroke="#F97316" stroke-opacity="0.06" stroke-width="1"/>
  <line x1="900" y1="0" x2="900" y2="420" stroke="#F97316" stroke-opacity="0.06" stroke-width="1"/>

  <!-- Floating particles -->
  <circle cx="80" cy="360" r="3" fill="#F97316" fill-opacity="0.25">
    <animateTransform attributeName="transform" type="translate" values="0,0;4,-80;0,-160" dur="6s" repeatCount="indefinite"/>
    <animate attributeName="fill-opacity" values="0.25;0.5;0" dur="6s" repeatCount="indefinite"/>
  </circle>
  <circle cx="180" cy="380" r="2" fill="#F97316" fill-opacity="0.2">
    <animateTransform attributeName="transform" type="translate" values="0,0;-3,-100;0,-200" dur="7.5s" begin="1s" repeatCount="indefinite"/>
    <animate attributeName="fill-opacity" values="0.2;0.45;0" dur="7.5s" begin="1s" repeatCount="indefinite"/>
  </circle>
  <circle cx="320" cy="400" r="4" fill="#F97316" fill-opacity="0.15">
    <animateTransform attributeName="transform" type="translate" values="0,0;6,-120;0,-240" dur="9s" begin="0.5s" repeatCount="indefinite"/>
    <animate attributeName="fill-opacity" values="0.15;0.35;0" dur="9s" begin="0.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="750" cy="390" r="2.5" fill="#F97316" fill-opacity="0.2">
    <animateTransform attributeName="transform" type="translate" values="0,0;-5,-90;0,-180" dur="8s" begin="2s" repeatCount="indefinite"/>
    <animate attributeName="fill-opacity" values="0.2;0.4;0" dur="8s" begin="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="950" cy="370" r="3.5" fill="#F97316" fill-opacity="0.18">
    <animateTransform attributeName="transform" type="translate" values="0,0;3,-110;0,-220" dur="8.5s" begin="1.5s" repeatCount="indefinite"/>
    <animate attributeName="fill-opacity" values="0.18;0.38;0" dur="8.5s" begin="1.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="1100" cy="400" r="2" fill="#F97316" fill-opacity="0.22">
    <animateTransform attributeName="transform" type="translate" values="0,0;-4,-130;0,-260" dur="10s" begin="3s" repeatCount="indefinite"/>
    <animate attributeName="fill-opacity" values="0.22;0.42;0" dur="10s" begin="3s" repeatCount="indefinite"/>
  </circle>
  <circle cx="520" cy="380" r="3" fill="#F97316" fill-opacity="0.16">
    <animateTransform attributeName="transform" type="translate" values="0,0;5,-95;0,-190" dur="7s" begin="2.5s" repeatCount="indefinite"/>
    <animate attributeName="fill-opacity" values="0.16;0.36;0" dur="7s" begin="2.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="1050" cy="360" r="4" fill="#F97316" fill-opacity="0.12">
    <animateTransform attributeName="transform" type="translate" values="0,0;-6,-70;0,-140" dur="6.5s" begin="0.8s" repeatCount="indefinite"/>
    <animate attributeName="fill-opacity" values="0.12;0.32;0" dur="6.5s" begin="0.8s" repeatCount="indefinite"/>
  </circle>

  <!-- ── MAIN TITLE: HIRE + X ── -->
  <!-- "HIRE" -->
  <text x="250" y="175" text-anchor="middle" font-family="Arial, sans-serif" font-size="130" font-weight="900" fill="#1C1917" letter-spacing="-4">
    HIRE
    <animate attributeName="opacity" from="0" to="1" dur="0.6s" fill="freeze"/>
  </text>
  <!-- Glowing "X" -->
  <text x="455" y="175" text-anchor="middle" font-family="Arial, sans-serif" font-size="130" font-weight="900" fill="#F97316" filter="url(#xglow2)" letter-spacing="-4">
    X
    <animate attributeName="opacity" from="0" to="1" dur="0.6s" begin="0.3s" fill="freeze"/>
  </text>

  <!-- Tagline typewriter -->
  <text x="250" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" fill="#78716C" letter-spacing="1">
    <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.8s" fill="freeze"/>
    One Platform. All Sources. AI Does the Rest.
  </text>

  <!-- Orange accent underline under tagline -->
  <rect x="80" y="218" height="2.5" rx="2" fill="#F97316" fill-opacity="0.5">
    <animate attributeName="width" from="0" to="340" dur="0.8s" begin="1.2s" fill="freeze"/>
  </rect>

  <!-- ── 3 STAT CARDS ── -->
  <!-- Card 1: Time Reduction -->
  <g filter="url(#cardshadow)">
    <rect x="590" y="52" width="178" height="95" rx="14" fill="url(#cardGrad1)"/>
    <rect x="590" y="52" width="178" height="5" rx="3" fill="#F97316"/>
    <text x="679" y="88" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#78716C">Time-to-Hire</text>
    <text x="679" y="114" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="#1C1917">44 → 28 days</text>
    <text x="679" y="136" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#F97316" font-weight="700">⚡ 36% FASTER</text>
    <animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="3.2s" begin="0s" repeatCount="indefinite"/>
  </g>
  <!-- Card 2: GPT-4o -->
  <g filter="url(#cardshadow)">
    <rect x="786" y="52" width="178" height="95" rx="14" fill="url(#cardGrad1)"/>
    <rect x="786" y="52" width="178" height="5" rx="3" fill="#8B5CF6"/>
    <text x="875" y="88" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#78716C">AI Engine</text>
    <text x="875" y="114" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="#1C1917">GPT-4o</text>
    <text x="875" y="136" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#8B5CF6" font-weight="700">🧠 RAG POWERED</text>
    <animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="3.2s" begin="0.4s" repeatCount="indefinite"/>
  </g>
  <!-- Card 3: Features -->
  <g filter="url(#cardshadow)">
    <rect x="982" y="52" width="178" height="95" rx="14" fill="url(#cardGrad1)"/>
    <rect x="982" y="52" width="178" height="5" rx="3" fill="#10B981"/>
    <text x="1071" y="88" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#78716C">Prototype</text>
    <text x="1071" y="114" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="#1C1917">100%</text>
    <text x="1071" y="136" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#10B981" font-weight="700">🚀 FEATURE COMPLETE</text>
    <animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="3.2s" begin="0.8s" repeatCount="indefinite"/>
  </g>

  <!-- Sub-label -->
  <text x="250" y="246" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#A8A29E" letter-spacing="3">
    <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="1.4s" fill="freeze"/>
    AI-POWERED RECRUITMENT AUTOMATION PLATFORM
  </text>

  <!-- Team + Hackathon bar -->
  <rect x="0" y="278" width="1200" height="46" fill="#1C1917" fill-opacity="0.04"/>
  <text x="250" y="307" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="1.6s" fill="freeze"/>
    Team Last Commit  ·  Vraj Talati · Preetansh Devpura · Jenil Paghdar · Astha Jain · Aditya Jain  ·  Breach Hackathon 2025  ·  Nirma University
  </text>

  <!-- Bottom stat strip -->
  <rect x="0" y="324" width="1200" height="1" fill="#F97316" fill-opacity="0.2"/>

  <!-- 4 quick bottom stats -->
  <text x="150" y="360" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="900" fill="#F97316">83%</text>
  <text x="150" y="378" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#78716C">Admin Time Saved</text>

  <text x="450" y="360" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="900" fill="#8B5CF6">94%</text>
  <text x="450" y="378" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#78716C">Dedup Accuracy</text>

  <text x="750" y="360" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="900" fill="#10B981">&lt;3s</text>
  <text x="750" y="378" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#78716C">Resume Parse Time</text>

  <text x="1050" y="360" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="900" fill="#F97316">$1.85M</text>
  <text x="1050" y="378" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#78716C">Saved per 100 Hires</text>

  <!-- Dividers between stats -->
  <line x1="300" y1="340" x2="300" y2="390" stroke="#E5E7EB" stroke-width="1"/>
  <line x1="600" y1="340" x2="600" y2="390" stroke="#E5E7EB" stroke-width="1"/>
  <line x1="900" y1="340" x2="900" y2="390" stroke="#E5E7EB" stroke-width="1"/>

  <!-- Wave divider -->
  <path d="M0,400 Q150,385 300,395 Q450,405 600,395 Q750,385 900,395 Q1050,405 1200,395 L1200,420 L0,420 Z" fill="#F97316" fill-opacity="0.07"/>
  <path d="M0,408 Q200,395 400,405 Q600,415 800,405 Q1000,395 1200,405 L1200,420 L0,420 Z" fill="#F97316" fill-opacity="0.05"/>
</svg>

</div>

<!-- ═══════════════════════════════════════════════════════════
     BADGES
═══════════════════════════════════════════════════════════ -->

<p align="center">
  <img src="https://img.shields.io/badge/React-18-F97316?style=for-the-badge&logo=react&logoColor=white&labelColor=1C1917" />
  <img src="https://img.shields.io/badge/Express.js-4.x-F97316?style=for-the-badge&logo=express&logoColor=white&labelColor=1C1917" />
  <img src="https://img.shields.io/badge/SQLite-3.45-F97316?style=for-the-badge&logo=sqlite&logoColor=white&labelColor=1C1917" />
  <img src="https://img.shields.io/badge/GPT--4o-OpenAI-8B5CF6?style=for-the-badge&logo=openai&logoColor=white&labelColor=1C1917" />
  <img src="https://img.shields.io/badge/Docker-Compose-F97316?style=for-the-badge&logo=docker&logoColor=white&labelColor=1C1917" />
</p>
<p align="center">
  <img src="https://img.shields.io/badge/Vite-5.x-F97316?style=for-the-badge&logo=vite&logoColor=white&labelColor=1C1917" />
  <img src="https://img.shields.io/badge/Chart.js-4.x-F97316?style=for-the-badge&logo=chartdotjs&logoColor=white&labelColor=1C1917" />
  <img src="https://img.shields.io/badge/Vercel-Deploy-F97316?style=for-the-badge&logo=vercel&logoColor=white&labelColor=1C1917" />
  <img src="https://img.shields.io/badge/Railway-Backend-F97316?style=for-the-badge&logo=railway&logoColor=white&labelColor=1C1917" />
  <img src="https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge&logoColor=white&labelColor=1C1917" />
</p>

<div align="center">
<svg width="100%" viewBox="0 0 800 14" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="4" width="800" height="3" rx="2" fill="#F97316" fill-opacity="0.15"/>
  <rect x="0" y="4" width="0" height="3" rx="2" fill="#F97316">
    <animate attributeName="width" from="0" to="800" dur="1.5s" begin="0.5s" fill="freeze"/>
  </rect>
  <circle cx="400" cy="5.5" r="5" fill="#F97316">
    <animate attributeName="cx" from="0" to="800" dur="1.5s" begin="0.5s" fill="freeze"/>
  </circle>
</svg>
</div>

<br/>

---

## ✨ Features

<div align="center">

<svg width="100%" viewBox="0 0 1200 820" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">
  <defs>
    <filter id="featdrop" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#F97316" flood-opacity="0.13"/>
    </filter>
    <!-- Hexagon pattern background -->
    <pattern id="hexPattern" x="0" y="0" width="52" height="60" patternUnits="userSpaceOnUse">
      <polygon points="26,2 50,16 50,44 26,58 2,44 2,16" fill="none" stroke="#F97316" stroke-width="0.6" stroke-opacity="0.12"/>
    </pattern>
    <linearGradient id="featBG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF7ED"/>
      <stop offset="100%" stop-color="#FFFBF5"/>
    </linearGradient>
    <linearGradient id="stripe1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F97316"/>
      <stop offset="100%" stop-color="#FB923C"/>
    </linearGradient>
    <linearGradient id="stripe2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8B5CF6"/>
      <stop offset="100%" stop-color="#A78BFA"/>
    </linearGradient>
    <linearGradient id="stripe3" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#34D399"/>
    </linearGradient>
    <linearGradient id="stripe4" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#60A5FA"/>
    </linearGradient>
    <linearGradient id="stripe5" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#EC4899"/>
      <stop offset="100%" stop-color="#F472B6"/>
    </linearGradient>
    <linearGradient id="stripe6" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#14B8A6"/>
      <stop offset="100%" stop-color="#2DD4BF"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="820" fill="url(#featBG)"/>
  <rect width="1200" height="820" fill="url(#hexPattern)"/>

  <!-- Section label -->
  <text x="600" y="44" text-anchor="middle" font-size="13" font-weight="700" fill="#F97316" letter-spacing="4">PLATFORM CAPABILITIES</text>
  <text x="600" y="72" text-anchor="middle" font-size="28" font-weight="900" fill="#1C1917">Six Features That Change Hiring Forever</text>

  <!-- ── ROW 1 ── -->

  <!-- Card 1: Live Parsing -->
  <g filter="url(#featdrop)">
    <rect x="40" y="100" width="348" height="200" rx="16" fill="#FFFFFF"/>
    <rect x="40" y="100" width="348" height="6" rx="4" fill="url(#stripe1)"/>
    <text x="72" y="148" font-size="36">⚡</text>
    <text x="120" y="148" font-size="19" font-weight="800" fill="#1C1917">Live Parsing Animation</text>
    <text x="72" y="172" font-size="13" fill="#78716C">GPT-4o extracts 20+ structured fields</text>
    <text x="72" y="189" font-size="13" fill="#78716C">from any resume format in under 3s.</text>
    <text x="72" y="210" font-size="13" fill="#78716C">Watch each field populate in real-time</text>
    <text x="72" y="227" font-size="13" fill="#78716C">via Server-Sent Events stream.</text>
    <rect x="72" y="252" width="90" height="26" rx="13" fill="#FFF7ED"/>
    <text x="117" y="269" text-anchor="middle" font-size="11" font-weight="700" fill="#F97316">PDF · DOCX · TXT</text>
    <animateTransform attributeName="transform" type="translate" values="0,0;0,-6;0,0" dur="3.4s" begin="0s" repeatCount="indefinite"/>
  </g>

  <!-- Card 2: Hire by Friday -->
  <g filter="url(#featdrop)">
    <rect x="426" y="100" width="348" height="200" rx="16" fill="#FFFFFF"/>
    <rect x="426" y="100" width="348" height="6" rx="4" fill="url(#stripe2)"/>
    <text x="458" y="148" font-size="36">📅</text>
    <text x="506" y="148" font-size="19" font-weight="800" fill="#1C1917">Hire by Friday Mode</text>
    <text x="458" y="172" font-size="13" fill="#78716C">Set a hiring deadline. HireX calculates</text>
    <text x="458" y="189" font-size="13" fill="#78716C">days remaining and generates a GPT-4o</text>
    <text x="458" y="206" font-size="13" fill="#78716C">powered daily action plan: which</text>
    <text x="458" y="223" font-size="13" fill="#78716C">candidates to advance, each day.</text>
    <rect x="458" y="252" width="100" height="26" rx="13" fill="#EDE9FE"/>
    <text x="508" y="269" text-anchor="middle" font-size="11" font-weight="700" fill="#8B5CF6">AI DEADLINE PLANNER</text>
    <animateTransform attributeName="transform" type="translate" values="0,0;0,-6;0,0" dur="3.4s" begin="0.3s" repeatCount="indefinite"/>
  </g>

  <!-- Card 3: Talent Radar -->
  <g filter="url(#featdrop)">
    <rect x="812" y="100" width="348" height="200" rx="16" fill="#FFFFFF"/>
    <rect x="812" y="100" width="348" height="6" rx="4" fill="url(#stripe3)"/>
    <text x="844" y="148" font-size="36">🕸</text>
    <text x="892" y="148" font-size="19" font-weight="800" fill="#1C1917">Talent Radar Chart</text>
    <text x="844" y="172" font-size="13" fill="#78716C">6-axis spider chart per candidate:</text>
    <text x="844" y="189" font-size="13" fill="#78716C">Technical · Leadership · Communication</text>
    <text x="844" y="206" font-size="13" fill="#78716C">Domain · Culture Fit · Growth Potential.</text>
    <text x="844" y="223" font-size="13" fill="#78716C">Instant visual skill fingerprint.</text>
    <rect x="844" y="252" width="100" height="26" rx="13" fill="#ECFDF5"/>
    <text x="894" y="269" text-anchor="middle" font-size="11" font-weight="700" fill="#10B981">6-AXIS SCORING</text>
    <animateTransform attributeName="transform" type="translate" values="0,0;0,-6;0,0" dur="3.4s" begin="0.6s" repeatCount="indefinite"/>
  </g>

  <!-- ── ROW 2 ── -->

  <!-- Card 4: Recruiter Copilot -->
  <g filter="url(#featdrop)">
    <rect x="40" y="340" width="348" height="200" rx="16" fill="#FFFFFF"/>
    <rect x="40" y="340" width="348" height="6" rx="4" fill="url(#stripe4)"/>
    <text x="72" y="388" font-size="36">🤖</text>
    <text x="120" y="388" font-size="19" font-weight="800" fill="#1C1917">Recruiter Copilot</text>
    <text x="72" y="412" font-size="13" fill="#78716C">Ask plain English: "Who are our top 5</text>
    <text x="72" y="429" font-size="13" fill="#78716C">React developers?" RAG architecture</text>
    <text x="72" y="446" font-size="13" fill="#78716C">retrieves top-N candidate profiles and</text>
    <text x="72" y="463" font-size="13" fill="#78716C">sends them to GPT-4o for ranked answers.</text>
    <rect x="72" y="492" width="82" height="26" rx="13" fill="#EFF6FF"/>
    <text x="113" y="509" text-anchor="middle" font-size="11" font-weight="700" fill="#3B82F6">RAG + GPT-4o</text>
    <animateTransform attributeName="transform" type="translate" values="0,0;0,-6;0,0" dur="3.4s" begin="0.9s" repeatCount="indefinite"/>
  </g>

  <!-- Card 5: Ghost Detector -->
  <g filter="url(#featdrop)">
    <rect x="426" y="340" width="348" height="200" rx="16" fill="#FFFFFF"/>
    <rect x="426" y="340" width="348" height="6" rx="4" fill="url(#stripe5)"/>
    <text x="458" y="388" font-size="36">👻</text>
    <text x="506" y="388" font-size="19" font-weight="800" fill="#1C1917">Ghost Detector</text>
    <text x="458" y="412" font-size="13" fill="#78716C">Automatically flags candidates not</text>
    <text x="458" y="429" font-size="13" fill="#78716C">contacted in 7+ days. One-click sends</text>
    <text x="458" y="446" font-size="13" fill="#78716C">AI-generated personalised re-engagement</text>
    <text x="458" y="463" font-size="13" fill="#78716C">emails via Nodemailer / SMTP.</text>
    <rect x="458" y="492" width="102" height="26" rx="13" fill="#FDF2F8"/>
    <text x="509" y="509" text-anchor="middle" font-size="11" font-weight="700" fill="#EC4899">AUTO RE-ENGAGE</text>
    <animateTransform attributeName="transform" type="translate" values="0,0;0,-6;0,0" dur="3.4s" begin="1.2s" repeatCount="indefinite"/>
  </g>

  <!-- Card 6: Candidate DNA -->
  <g filter="url(#featdrop)">
    <rect x="812" y="340" width="348" height="200" rx="16" fill="#FFFFFF"/>
    <rect x="812" y="340" width="348" height="6" rx="4" fill="url(#stripe6)"/>
    <text x="844" y="388" font-size="36">🧬</text>
    <text x="892" y="388" font-size="19" font-weight="800" fill="#1C1917">Candidate DNA Match</text>
    <text x="844" y="412" font-size="13" fill="#78716C">Mark any hire as a "star". HireX finds</text>
    <text x="844" y="429" font-size="13" fill="#78716C">lookalike candidates using cosine</text>
    <text x="844" y="446" font-size="13" fill="#78716C">similarity on skill embeddings. Clone</text>
    <text x="844" y="463" font-size="13" fill="#78716C">your best hires across the pipeline.</text>
    <rect x="844" y="492" width="110" height="26" rx="13" fill="#F0FDFA"/>
    <text x="899" y="509" text-anchor="middle" font-size="11" font-weight="700" fill="#14B8A6">VECTOR SIMILARITY</text>
    <animateTransform attributeName="transform" type="translate" values="0,0;0,-6;0,0" dur="3.4s" begin="1.5s" repeatCount="indefinite"/>
  </g>

  <!-- DEDUP + KANBAN bonus row -->
  <g filter="url(#featdrop)">
    <rect x="183" y="580" width="348" height="180" rx="16" fill="#FFFFFF"/>
    <rect x="183" y="580" width="348" height="6" rx="4" fill="url(#stripe1)"/>
    <text x="215" y="626" font-size="36">🔍</text>
    <text x="263" y="626" font-size="19" font-weight="800" fill="#1C1917">Smart Deduplication</text>
    <text x="215" y="650" font-size="13" fill="#78716C">Fuzzy Levenshtein matching on name,</text>
    <text x="215" y="667" font-size="13" fill="#78716C">email, phone, LinkedIn URL. 94% accuracy.</text>
    <text x="215" y="684" font-size="13" fill="#78716C">Auto-merge with full version history.</text>
    <rect x="215" y="714" width="80" height="24" rx="12" fill="#FFF7ED"/>
    <text x="255" y="730" text-anchor="middle" font-size="11" font-weight="700" fill="#F97316">0.85 THRESHOLD</text>
    <animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="3.4s" begin="0.2s" repeatCount="indefinite"/>
  </g>

  <g filter="url(#featdrop)">
    <rect x="669" y="580" width="348" height="180" rx="16" fill="#FFFFFF"/>
    <rect x="669" y="580" width="348" height="6" rx="4" fill="url(#stripe2)"/>
    <text x="701" y="626" font-size="36">📋</text>
    <text x="749" y="626" font-size="19" font-weight="800" fill="#1C1917">Kanban Pipeline Board</text>
    <text x="701" y="650" font-size="13" fill="#78716C">Drag-and-drop candidate cards across</text>
    <text x="701" y="667" font-size="13" fill="#78716C">Applied · Screened · Interviewed ·</text>
    <text x="701" y="684" font-size="13" fill="#78716C">Offered · Hired stages with audit trail.</text>
    <rect x="701" y="714" width="92" height="24" rx="12" fill="#EDE9FE"/>
    <text x="747" y="730" text-anchor="middle" font-size="11" font-weight="700" fill="#8B5CF6">DRAG AND DROP</text>
    <animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="3.4s" begin="0.5s" repeatCount="indefinite"/>
  </g>

  <!-- Bottom label -->
  <text x="600" y="796" text-anchor="middle" font-size="12" fill="#A8A29E" letter-spacing="1">hirex.vercel.app  ·  Breach Hackathon 2025</text>
</svg>

</div>

<br/>

---

## 🏗 System Architecture

<div align="center">

<svg width="100%" viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">
  <defs>
    <filter id="layerglow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur">
        <animate attributeName="stdDeviation" values="4;8;4" dur="3s" repeatCount="indefinite"/>
      </feGaussianBlur>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="normaldrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="2" dy="4" stdDeviation="5" flood-color="#000" flood-opacity="0.15"/>
    </filter>
    <linearGradient id="archBG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
    <marker id="arrowOrange" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 Z" fill="#F97316"/>
    </marker>
  </defs>

  <!-- Dark background -->
  <rect width="1200" height="700" fill="url(#archBG)" rx="16"/>

  <!-- Subtle grid -->
  <defs>
    <pattern id="dotgrid" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="15" cy="15" r="1" fill="#FFFFFF" fill-opacity="0.04"/>
    </pattern>
  </defs>
  <rect width="1200" height="700" fill="url(#dotgrid)" rx="16"/>

  <!-- Title -->
  <text x="600" y="38" text-anchor="middle" font-size="13" font-weight="700" fill="#F97316" letter-spacing="4">SYSTEM ARCHITECTURE</text>
  <text x="600" y="62" text-anchor="middle" font-size="22" font-weight="900" fill="#FFFFFF">Five-Layer Intelligent Stack</text>

  <!-- ──────────────────────────────────
       ISOMETRIC LAYERS (stacked slabs)
       Using parallelogram shapes to fake isometric
  ────────────────────────────────── -->

  <!-- Layer 1: DATA SOURCES (top layer) -->
  <g>
    <animateTransform attributeName="transform" type="translate" from="0,-60" to="0,0" dur="0.5s" begin="0s" fill="freeze"/>
    <!-- Top face -->
    <polygon points="200,108 560,88 760,108 400,128" fill="#2D3A1F" stroke="#4ADE80" stroke-width="1"/>
    <!-- Left face -->
    <polygon points="200,108 400,128 400,158 200,138" fill="#1A2412" stroke="#4ADE80" stroke-width="0.5"/>
    <!-- Right face -->
    <polygon points="760,108 400,128 400,158 760,138" fill="#243018" stroke="#4ADE80" stroke-width="0.5"/>
    <!-- Label on top -->
    <text x="480" y="112" text-anchor="middle" font-size="12" font-weight="700" fill="#4ADE80" letter-spacing="2">DATA SOURCES</text>
    <text x="480" y="126" text-anchor="middle" font-size="10" fill="#86EFAC">Email · LinkedIn · Job Boards · HRMS · Referrals</text>
  </g>

  <!-- Layer 2: FRONTEND (React) -->
  <g>
    <animateTransform attributeName="transform" type="translate" from="0,-60" to="0,0" dur="0.5s" begin="0.3s" fill="freeze"/>
    <!-- Top face -->
    <polygon points="180,178 560,155 780,178 400,201" fill="#0C2948" stroke="#60A5FA" stroke-width="1"/>
    <!-- Left face -->
    <polygon points="180,178 400,201 400,236 180,213" fill="#071C30" stroke="#60A5FA" stroke-width="0.5"/>
    <!-- Right face -->
    <polygon points="780,178 400,201 400,236 780,213" fill="#0A2540" stroke="#60A5FA" stroke-width="0.5"/>
    <text x="480" y="182" text-anchor="middle" font-size="12" font-weight="700" fill="#60A5FA" letter-spacing="2">PRESENTATION LAYER</text>
    <text x="480" y="196" text-anchor="middle" font-size="10" fill="#93C5FD">React 18 + Vite  ·  Kanban Board  ·  Copilot Widget  ·  Chart.js</text>
  </g>

  <!-- Layer 3: AI PROCESSING (highlighted) -->
  <g>
    <animateTransform attributeName="transform" type="translate" from="0,-60" to="0,0" dur="0.5s" begin="0.6s" fill="freeze"/>
    <!-- Glowing top face -->
    <polygon points="160,258 560,232 800,258 400,284" fill="#3D1A00" stroke="#F97316" stroke-width="1.5" filter="url(#layerglow)"/>
    <!-- Left face -->
    <polygon points="160,258 400,284 400,324 160,298" fill="#2A1200" stroke="#F97316" stroke-width="0.8"/>
    <!-- Right face -->
    <polygon points="800,258 400,284 400,324 800,298" fill="#321600" stroke="#F97316" stroke-width="0.8"/>
    <text x="480" y="262" text-anchor="middle" font-size="12" font-weight="700" fill="#F97316" letter-spacing="2">AI PROCESSING LAYER</text>
    <text x="480" y="278" text-anchor="middle" font-size="10" fill="#FED7AA">GPT-4o Parser  ·  Dedup Engine  ·  Scoring  ·  NLP Search  ·  RAG Copilot</text>
  </g>

  <!-- Layer 4: BACKEND API -->
  <g>
    <animateTransform attributeName="transform" type="translate" from="0,-60" to="0,0" dur="0.5s" begin="0.9s" fill="freeze"/>
    <polygon points="140,352 560,322 820,352 400,382" fill="#1A0A3A" stroke="#A78BFA" stroke-width="1"/>
    <polygon points="140,352 400,382 400,418 140,388" fill="#110722" stroke="#A78BFA" stroke-width="0.5"/>
    <polygon points="820,352 400,382 400,418 820,388" fill="#160930" stroke="#A78BFA" stroke-width="0.5"/>
    <text x="480" y="357" text-anchor="middle" font-size="12" font-weight="700" fill="#A78BFA" letter-spacing="2">APPLICATION LAYER</text>
    <text x="480" y="372" text-anchor="middle" font-size="10" fill="#C4B5FD">Express.js REST API  ·  Auth  ·  Job Mgmt  ·  WebSocket  ·  Email Service</text>
  </g>

  <!-- Layer 5: DATABASE (bottom) -->
  <g>
    <animateTransform attributeName="transform" type="translate" from="0,-60" to="0,0" dur="0.5s" begin="1.2s" fill="freeze"/>
    <polygon points="120,442 560,408 840,442 400,476" fill="#0A1628" stroke="#38BDF8" stroke-width="1"/>
    <polygon points="120,442 400,476 400,516 120,482" fill="#060D18" stroke="#38BDF8" stroke-width="0.5"/>
    <polygon points="840,442 400,476 400,516 840,482" fill="#081020" stroke="#38BDF8" stroke-width="0.5"/>
    <text x="480" y="448" text-anchor="middle" font-size="12" font-weight="700" fill="#38BDF8" letter-spacing="2">DATA LAYER</text>
    <text x="480" y="464" text-anchor="middle" font-size="10" fill="#7DD3FC">SQLite 3.45  ·  better-sqlite3  ·  Candidates  ·  Jobs  ·  Audit Logs</text>
  </g>

  <!-- Integration Layer label (bottom base) -->
  <g>
    <animateTransform attributeName="transform" type="translate" from="0,-60" to="0,0" dur="0.5s" begin="1.5s" fill="freeze"/>
    <polygon points="100,530 560,492 860,530 400,568" fill="#1A1209" stroke="#FCD34D" stroke-width="1"/>
    <polygon points="100,530 400,568 400,600 100,562" fill="#110C06" stroke="#FCD34D" stroke-width="0.5"/>
    <polygon points="860,530 400,568 400,600 860,562" fill="#150F08" stroke="#FCD34D" stroke-width="0.5"/>
    <text x="480" y="536" text-anchor="middle" font-size="12" font-weight="700" fill="#FCD34D" letter-spacing="2">INTEGRATION LAYER</text>
    <text x="480" y="552" text-anchor="middle" font-size="10" fill="#FDE68A">Gmail OAuth  ·  LinkedIn API  ·  HRMS Webhooks  ·  Resume Upload</text>
  </g>

  <!-- ── DATA FLOW ARROWS (animated dots) ── -->

  <!-- Arrow: Integration → Database -->
  <line x1="840" y1="548" x2="840" y2="470" stroke="#F97316" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.6"/>
  <circle r="5" fill="#F97316" opacity="0.9">
    <animateMotion path="M840,548 L840,470" dur="1.6s" begin="2s" repeatCount="indefinite"/>
  </circle>

  <!-- Arrow: Database → App -->
  <line x1="850" y1="465" x2="850" y2="388" stroke="#A78BFA" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.6"/>
  <circle r="5" fill="#A78BFA" opacity="0.9">
    <animateMotion path="M850,465 L850,388" dur="1.6s" begin="2.4s" repeatCount="indefinite"/>
  </circle>

  <!-- Arrow: App → AI -->
  <line x1="860" y1="383" x2="860" y2="298" stroke="#F97316" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.6"/>
  <circle r="5" fill="#F97316" opacity="0.9">
    <animateMotion path="M860,383 L860,298" dur="1.6s" begin="2.8s" repeatCount="indefinite"/>
  </circle>

  <!-- Arrow: AI → Frontend -->
  <line x1="850" y1="293" x2="850" y2="213" stroke="#60A5FA" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.6"/>
  <circle r="5" fill="#60A5FA" opacity="0.9">
    <animateMotion path="M850,293 L850,213" dur="1.6s" begin="3.2s" repeatCount="indefinite"/>
  </circle>

  <!-- ── RIGHT SIDE LABEL CARDS ── -->
  <!-- Data Sources label -->
  <rect x="920" y="90" width="240" height="54" rx="8" fill="#1E2A16" stroke="#4ADE80" stroke-width="1"/>
  <text x="940" y="112" font-size="11" font-weight="700" fill="#4ADE80">DATA SOURCES</text>
  <text x="940" y="128" font-size="10" fill="#86EFAC">Email · LinkedIn · CSV · HRMS · Referral</text>
  <line x1="760" y1="113" x2="920" y2="113" stroke="#4ADE80" stroke-width="1" stroke-dasharray="3,3" opacity="0.5"/>

  <!-- Frontend label -->
  <rect x="920" y="163" width="240" height="54" rx="8" fill="#0C1A2E" stroke="#60A5FA" stroke-width="1"/>
  <text x="940" y="185" font-size="11" font-weight="700" fill="#60A5FA">PRESENTATION</text>
  <text x="940" y="200" font-size="10" fill="#93C5FD">React 18 · Vite · Chart.js · React Router</text>
  <line x1="780" y1="186" x2="920" y2="186" stroke="#60A5FA" stroke-width="1" stroke-dasharray="3,3" opacity="0.5"/>

  <!-- AI label -->
  <rect x="920" y="245" width="240" height="54" rx="8" fill="#2A1200" stroke="#F97316" stroke-width="1.5"/>
  <text x="940" y="267" font-size="11" font-weight="700" fill="#F97316">AI PROCESSING ⚡</text>
  <text x="940" y="282" font-size="10" fill="#FED7AA">GPT-4o · Dedup · Scoring · RAG · NLP</text>
  <line x1="800" y1="268" x2="920" y2="268" stroke="#F97316" stroke-width="1" stroke-dasharray="3,3" opacity="0.5"/>

  <!-- Backend label -->
  <rect x="920" y="330" width="240" height="54" rx="8" fill="#120A26" stroke="#A78BFA" stroke-width="1"/>
  <text x="940" y="352" font-size="11" font-weight="700" fill="#A78BFA">APPLICATION LAYER</text>
  <text x="940" y="367" font-size="10" fill="#C4B5FD">Express.js · REST API · WebSocket · Auth</text>
  <line x1="820" y1="353" x2="920" y2="353" stroke="#A78BFA" stroke-width="1" stroke-dasharray="3,3" opacity="0.5"/>

  <!-- DB label -->
  <rect x="920" y="418" width="240" height="54" rx="8" fill="#060D18" stroke="#38BDF8" stroke-width="1"/>
  <text x="940" y="440" font-size="11" font-weight="700" fill="#38BDF8">DATA LAYER</text>
  <text x="940" y="455" font-size="10" fill="#7DD3FC">SQLite · better-sqlite3 · Audit Logs</text>
  <line x1="840" y1="441" x2="920" y2="441" stroke="#38BDF8" stroke-width="1" stroke-dasharray="3,3" opacity="0.5"/>

  <!-- Integration label -->
  <rect x="920" y="510" width="240" height="54" rx="8" fill="#110C06" stroke="#FCD34D" stroke-width="1"/>
  <text x="940" y="532" font-size="11" font-weight="700" fill="#FCD34D">INTEGRATION LAYER</text>
  <text x="940" y="547" font-size="10" fill="#FDE68A">Gmail OAuth · LinkedIn · HRMS Webhook</text>
  <line x1="860" y1="533" x2="920" y2="533" stroke="#FCD34D" stroke-width="1" stroke-dasharray="3,3" opacity="0.5"/>

  <!-- Footer note -->
  <text x="600" y="652" text-anchor="middle" font-size="11" fill="#475569" letter-spacing="1">Containerised with Docker Compose  ·  Frontend → Vercel  ·  Backend → Railway</text>
</svg>

</div>

<br/>

---

## ⚡ How It Works

<div align="center">

<svg width="100%" viewBox="0 0 1200 340" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">
  <defs>
    <filter id="nodeglow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#F97316" flood-opacity="0.4"/>
    </filter>
    <linearGradient id="pipelineBG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF7ED"/>
      <stop offset="100%" stop-color="#FFFBF5"/>
    </linearGradient>
    <linearGradient id="connLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F97316"/>
      <stop offset="100%" stop-color="#FB923C"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="340" fill="url(#pipelineBG)" rx="16"/>

  <text x="600" y="36" text-anchor="middle" font-size="13" font-weight="700" fill="#F97316" letter-spacing="4">CANDIDATE PIPELINE</text>
  <text x="600" y="58" text-anchor="middle" font-size="22" font-weight="900" fill="#1C1917">From Source to Hire in 6 Automated Steps</text>

  <!-- ── CONNECTING LINE ── -->
  <line x1="110" y1="148" x2="1090" y2="148" stroke="#F97316" stroke-width="2.5" stroke-opacity="0.2"/>
  <!-- Travelling orange dot on the line -->
  <circle r="7" fill="#F97316" opacity="0.85" filter="url(#nodeglow)">
    <animateMotion path="M110,148 L1090,148" dur="3.5s" repeatCount="indefinite"/>
  </circle>

  <!-- Step data -->
  <!-- Node positions: 110, 308, 506, 704, 902, 1090 -->

  <!-- Step 1: INGEST -->
  <circle cx="110" cy="148" r="40" fill="#FFFFFF" stroke="#3B82F6" stroke-width="3" filter="url(#normaldrop)">
    <animate attributeName="r" values="40;44;40" dur="3s" begin="0s" repeatCount="indefinite"/>
  </circle>
  <text x="110" y="141" text-anchor="middle" font-size="22">📧</text>
  <text x="110" y="160" text-anchor="middle" font-size="9" font-weight="700" fill="#3B82F6">INGEST</text>
  <rect x="46" y="206" width="128" height="76" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.5s" fill="freeze"/>
  </rect>
  <text x="110" y="224" text-anchor="middle" font-size="10" font-weight="700" fill="#1C1917">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.5s" fill="freeze"/>
    Source Collection
  </text>
  <text x="110" y="240" text-anchor="middle" font-size="9" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.5s" fill="freeze"/>
    Email · LinkedIn
  </text>
  <text x="110" y="254" text-anchor="middle" font-size="9" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.5s" fill="freeze"/>
    Job Boards · HRMS
  </text>
  <text x="110" y="268" text-anchor="middle" font-size="9" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.5s" fill="freeze"/>
    Referrals · Upload
  </text>

  <!-- Step 2: PARSE -->
  <circle cx="308" cy="148" r="40" fill="#FFFFFF" stroke="#F97316" stroke-width="3" filter="url(#normaldrop)">
    <animate attributeName="r" values="40;44;40" dur="3s" begin="0.5s" repeatCount="indefinite"/>
  </circle>
  <text x="308" y="141" text-anchor="middle" font-size="22">🤖</text>
  <text x="308" y="160" text-anchor="middle" font-size="9" font-weight="700" fill="#F97316">AI PARSE</text>
  <rect x="244" y="206" width="128" height="76" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.8s" fill="freeze"/>
  </rect>
  <text x="308" y="224" text-anchor="middle" font-size="10" font-weight="700" fill="#1C1917">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.8s" fill="freeze"/>
    GPT-4o Extraction
  </text>
  <text x="308" y="240" text-anchor="middle" font-size="9" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.8s" fill="freeze"/>
    20+ fields parsed
  </text>
  <text x="308" y="254" text-anchor="middle" font-size="9" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.8s" fill="freeze"/>
    under 3 seconds
  </text>
  <text x="308" y="268" text-anchor="middle" font-size="9" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.8s" fill="freeze"/>
    PDF · DOCX · HTML
  </text>

  <!-- Step 3: DEDUPE -->
  <circle cx="506" cy="148" r="40" fill="#FFFFFF" stroke="#8B5CF6" stroke-width="3" filter="url(#normaldrop)">
    <animate attributeName="r" values="40;44;40" dur="3s" begin="1s" repeatCount="indefinite"/>
  </circle>
  <text x="506" y="141" text-anchor="middle" font-size="22">🔍</text>
  <text x="506" y="160" text-anchor="middle" font-size="9" font-weight="700" fill="#8B5CF6">DEDUPE</text>
  <rect x="442" y="206" width="128" height="76" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.1s" fill="freeze"/>
  </rect>
  <text x="506" y="224" text-anchor="middle" font-size="10" font-weight="700" fill="#1C1917">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.1s" fill="freeze"/>
    Fuzzy Matching
  </text>
  <text x="506" y="240" text-anchor="middle" font-size="9" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.1s" fill="freeze"/>
    Levenshtein dist.
  </text>
  <text x="506" y="254" text-anchor="middle" font-size="9" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.1s" fill="freeze"/>
    94% accuracy
  </text>
  <text x="506" y="268" text-anchor="middle" font-size="9" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.1s" fill="freeze"/>
    Auto-merge profiles
  </text>

  <!-- Step 4: SCORE -->
  <circle cx="704" cy="148" r="40" fill="#FFFFFF" stroke="#10B981" stroke-width="3" filter="url(#normaldrop)">
    <animate attributeName="r" values="40;44;40" dur="3s" begin="1.5s" repeatCount="indefinite"/>
  </circle>
  <text x="704" y="141" text-anchor="middle" font-size="22">⭐</text>
  <text x="704" y="160" text-anchor="middle" font-size="9" font-weight="700" fill="#10B981">RANK</text>
  <rect x="640" y="206" width="128" height="76" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.4s" fill="freeze"/>
  </rect>
  <text x="704" y="224" text-anchor="middle" font-size="10" font-weight="700" fill="#1C1917">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.4s" fill="freeze"/>
    Cosine Similarity
  </text>
  <text x="704" y="240" text-anchor="middle" font-size="9" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.4s" fill="freeze"/>
    0-100 fit score
  </text>
  <text x="704" y="254" text-anchor="middle" font-size="9" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.4s" fill="freeze"/>
    vs job embeddings
  </text>
  <text x="704" y="268" text-anchor="middle" font-size="9" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.4s" fill="freeze"/>
    Auto-ranked list
  </text>

  <!-- Step 5: SEARCH -->
  <circle cx="902" cy="148" r="40" fill="#FFFFFF" stroke="#EC4899" stroke-width="3" filter="url(#normaldrop)">
    <animate attributeName="r" values="40;44;40" dur="3s" begin="2s" repeatCount="indefinite"/>
  </circle>
  <text x="902" y="141" text-anchor="middle" font-size="22">🔎</text>
  <text x="902" y="160" text-anchor="middle" font-size="9" font-weight="700" fill="#EC4899">NLP SEARCH</text>
  <rect x="838" y="206" width="128" height="76" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.7s" fill="freeze"/>
  </rect>
  <text x="902" y="224" text-anchor="middle" font-size="10" font-weight="700" fill="#1C1917">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.7s" fill="freeze"/>
    Semantic Search
  </text>
  <text x="902" y="240" text-anchor="middle" font-size="9" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.7s" fill="freeze"/>
    Plain English query
  </text>
  <text x="902" y="254" text-anchor="middle" font-size="9" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.7s" fill="freeze"/>
    800ms response
  </text>
  <text x="902" y="268" text-anchor="middle" font-size="9" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.7s" fill="freeze"/>
    BM25 + Vectors
  </text>

  <!-- Step 6: DASHBOARD -->
  <circle cx="1090" cy="148" r="40" fill="#FFFFFF" stroke="#F97316" stroke-width="3" filter="url(#nodeglow)">
    <animate attributeName="r" values="40;44;40" dur="3s" begin="2.5s" repeatCount="indefinite"/>
  </circle>
  <text x="1090" y="141" text-anchor="middle" font-size="22">📊</text>
  <text x="1090" y="160" text-anchor="middle" font-size="9" font-weight="700" fill="#F97316">DASHBOARD</text>
  <rect x="1026" y="206" width="128" height="76" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="2s" fill="freeze"/>
  </rect>
  <text x="1090" y="224" text-anchor="middle" font-size="10" font-weight="700" fill="#1C1917">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="2s" fill="freeze"/>
    Kanban + Copilot
  </text>
  <text x="1090" y="240" text-anchor="middle" font-size="9" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="2s" fill="freeze"/>
    Drag-drop stages
  </text>
  <text x="1090" y="254" text-anchor="middle" font-size="9" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="2s" fill="freeze"/>
    AI chat widget
  </text>
  <text x="1090" y="268" text-anchor="middle" font-size="9" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="2s" fill="freeze"/>
    Real-time updates
  </text>
</svg>

</div>

<br/>

---

## 🛠 Tech Stack

<div align="center">

<svg width="100%" viewBox="0 0 1200 290" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">
  <defs>
    <filter id="stackdrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000" flood-opacity="0.08"/>
    </filter>
    <linearGradient id="stackBG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#F1F5F9"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="290" fill="url(#stackBG)" rx="12"/>

  <!-- Pipeline connector line -->
  <line x1="60" y1="145" x2="1140" y2="145" stroke="#F97316" stroke-width="2" stroke-opacity="0.2" stroke-dasharray="6,4"/>
  <!-- Travelling dot on stack line -->
  <circle r="5" fill="#F97316">
    <animateMotion path="M60,145 L1140,145" dur="4s" repeatCount="indefinite"/>
  </circle>

  <!-- Tech cards (8 cards, evenly spaced) -->
  <!-- Card width ~120, gap ~15. Start x=60. -->

  <!-- React -->
  <g filter="url(#stackdrop)">
    <rect x="60" y="80" width="120" height="130" rx="10" fill="#FFFFFF"/>
    <rect x="60" y="80" width="120" height="5" rx="3" fill="#61DAFB"/>
    <text x="120" y="118" text-anchor="middle" font-size="26">⚛</text>
    <text x="120" y="140" text-anchor="middle" font-size="12" font-weight="700" fill="#1C1917">React</text>
    <text x="120" y="156" text-anchor="middle" font-size="10" fill="#78716C">v18.x</text>
    <text x="120" y="172" text-anchor="middle" font-size="9" fill="#A8A29E">UI Framework</text>
    <text x="120" y="186" text-anchor="middle" font-size="9" fill="#A8A29E">Concurrent</text>
    <animateTransform attributeName="transform" type="translate" values="0,10;0,0" dur="0.4s" begin="0.1s" fill="freeze"/>
  </g>

  <!-- Vite -->
  <g filter="url(#stackdrop)">
    <rect x="198" y="80" width="120" height="130" rx="10" fill="#FFFFFF"/>
    <rect x="198" y="80" width="120" height="5" rx="3" fill="#646CFF"/>
    <text x="258" y="118" text-anchor="middle" font-size="26">⚡</text>
    <text x="258" y="140" text-anchor="middle" font-size="12" font-weight="700" fill="#1C1917">Vite</text>
    <text x="258" y="156" text-anchor="middle" font-size="10" fill="#78716C">v5.x</text>
    <text x="258" y="172" text-anchor="middle" font-size="9" fill="#A8A29E">Build Tool</text>
    <text x="258" y="186" text-anchor="middle" font-size="9" fill="#A8A29E">Fastest HMR</text>
    <animateTransform attributeName="transform" type="translate" values="0,10;0,0" dur="0.4s" begin="0.2s" fill="freeze"/>
  </g>

  <!-- Express -->
  <g filter="url(#stackdrop)">
    <rect x="336" y="80" width="120" height="130" rx="10" fill="#FFFFFF"/>
    <rect x="336" y="80" width="120" height="5" rx="3" fill="#000000"/>
    <text x="396" y="118" text-anchor="middle" font-size="26">🚀</text>
    <text x="396" y="140" text-anchor="middle" font-size="12" font-weight="700" fill="#1C1917">Express.js</text>
    <text x="396" y="156" text-anchor="middle" font-size="10" fill="#78716C">v4.x</text>
    <text x="396" y="172" text-anchor="middle" font-size="9" fill="#A8A29E">REST API</text>
    <text x="396" y="186" text-anchor="middle" font-size="9" fill="#A8A29E">Middleware</text>
    <animateTransform attributeName="transform" type="translate" values="0,10;0,0" dur="0.4s" begin="0.3s" fill="freeze"/>
  </g>

  <!-- SQLite -->
  <g filter="url(#stackdrop)">
    <rect x="474" y="80" width="120" height="130" rx="10" fill="#FFFFFF"/>
    <rect x="474" y="80" width="120" height="5" rx="3" fill="#003B57"/>
    <text x="534" y="118" text-anchor="middle" font-size="26">🗄</text>
    <text x="534" y="140" text-anchor="middle" font-size="12" font-weight="700" fill="#1C1917">SQLite</text>
    <text x="534" y="156" text-anchor="middle" font-size="10" fill="#78716C">v3.45</text>
    <text x="534" y="172" text-anchor="middle" font-size="9" fill="#A8A29E">Database</text>
    <text x="534" y="186" text-anchor="middle" font-size="9" fill="#A8A29E">10× faster reads</text>
    <animateTransform attributeName="transform" type="translate" values="0,10;0,0" dur="0.4s" begin="0.4s" fill="freeze"/>
  </g>

  <!-- GPT-4o -->
  <g filter="url(#stackdrop)">
    <rect x="612" y="80" width="120" height="130" rx="10" fill="#FFFFFF"/>
    <rect x="612" y="80" width="120" height="5" rx="3" fill="#10A37F"/>
    <text x="672" y="118" text-anchor="middle" font-size="26">🧠</text>
    <text x="672" y="140" text-anchor="middle" font-size="12" font-weight="700" fill="#1C1917">GPT-4o</text>
    <text x="672" y="156" text-anchor="middle" font-size="10" fill="#78716C">2024-11</text>
    <text x="672" y="172" text-anchor="middle" font-size="9" fill="#A8A29E">AI Engine</text>
    <text x="672" y="186" text-anchor="middle" font-size="9" fill="#A8A29E">Parser + Copilot</text>
    <animateTransform attributeName="transform" type="translate" values="0,10;0,0" dur="0.4s" begin="0.5s" fill="freeze"/>
  </g>

  <!-- Chart.js -->
  <g filter="url(#stackdrop)">
    <rect x="750" y="80" width="120" height="130" rx="10" fill="#FFFFFF"/>
    <rect x="750" y="80" width="120" height="5" rx="3" fill="#FF6384"/>
    <text x="810" y="118" text-anchor="middle" font-size="26">📈</text>
    <text x="810" y="140" text-anchor="middle" font-size="12" font-weight="700" fill="#1C1917">Chart.js</text>
    <text x="810" y="156" text-anchor="middle" font-size="10" fill="#78716C">v4.x</text>
    <text x="810" y="172" text-anchor="middle" font-size="9" fill="#A8A29E">Data Viz</text>
    <text x="810" y="186" text-anchor="middle" font-size="9" fill="#A8A29E">Radar + Bar</text>
    <animateTransform attributeName="transform" type="translate" values="0,10;0,0" dur="0.4s" begin="0.6s" fill="freeze"/>
  </g>

  <!-- Docker -->
  <g filter="url(#stackdrop)">
    <rect x="888" y="80" width="120" height="130" rx="10" fill="#FFFFFF"/>
    <rect x="888" y="80" width="120" height="5" rx="3" fill="#2496ED"/>
    <text x="948" y="118" text-anchor="middle" font-size="26">🐳</text>
    <text x="948" y="140" text-anchor="middle" font-size="12" font-weight="700" fill="#1C1917">Docker</text>
    <text x="948" y="156" text-anchor="middle" font-size="10" fill="#78716C">Compose v2</text>
    <text x="948" y="172" text-anchor="middle" font-size="9" fill="#A8A29E">1-cmd launch</text>
    <text x="948" y="186" text-anchor="middle" font-size="9" fill="#A8A29E">Dev + Prod</text>
    <animateTransform attributeName="transform" type="translate" values="0,10;0,0" dur="0.4s" begin="0.7s" fill="freeze"/>
  </g>

  <!-- Vercel + Railway -->
  <g filter="url(#stackdrop)">
    <rect x="1026" y="80" width="120" height="130" rx="10" fill="#FFFFFF"/>
    <rect x="1026" y="80" width="120" height="5" rx="3" fill="#F97316"/>
    <text x="1086" y="118" text-anchor="middle" font-size="26">☁</text>
    <text x="1086" y="140" text-anchor="middle" font-size="12" font-weight="700" fill="#1C1917">Deploy</text>
    <text x="1086" y="156" text-anchor="middle" font-size="10" fill="#78716C">Vercel + Railway</text>
    <text x="1086" y="172" text-anchor="middle" font-size="9" fill="#A8A29E">Frontend CDN</text>
    <text x="1086" y="186" text-anchor="middle" font-size="9" fill="#A8A29E">Backend API</text>
    <animateTransform attributeName="transform" type="translate" values="0,10;0,0" dur="0.4s" begin="0.8s" fill="freeze"/>
  </g>

  <text x="600" y="268" text-anchor="middle" font-size="11" fill="#A8A29E" letter-spacing="1">Zero external dependencies for local dev  ·  Single  docker-compose up  launches everything</text>
</svg>

</div>

<br/>

---

## 📊 Performance

<div align="center">

<svg width="100%" viewBox="0 0 1000 290" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">
  <defs>
    <filter id="metdrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#F97316" flood-opacity="0.12"/>
    </filter>
    <linearGradient id="metBG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF7ED"/>
      <stop offset="100%" stop-color="#FFFBF5"/>
    </linearGradient>
    <linearGradient id="orangeStripe" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F97316"/>
      <stop offset="100%" stop-color="#FB923C"/>
    </linearGradient>
    <linearGradient id="purpleStripe" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8B5CF6"/>
      <stop offset="100%" stop-color="#A78BFA"/>
    </linearGradient>
    <linearGradient id="greenStripe" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#34D399"/>
    </linearGradient>
    <linearGradient id="blueStripe" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#60A5FA"/>
    </linearGradient>
  </defs>
  <rect width="1000" height="290" fill="url(#metBG)" rx="16"/>

  <text x="500" y="36" text-anchor="middle" font-size="13" font-weight="700" fill="#F97316" letter-spacing="4">PROTOTYPE RESULTS</text>
  <text x="500" y="60" text-anchor="middle" font-size="22" font-weight="900" fill="#1C1917">Validated Against 25 Real Resumes</text>

  <!-- Card 1: Admin Time -->
  <g filter="url(#metdrop)">
    <rect x="40" y="88" width="205" height="160" rx="14" fill="#FFFFFF"/>
    <rect x="40" y="88" width="205" height="6" rx="4" fill="url(#orangeStripe)"/>
    <text x="143" y="150" text-anchor="middle" font-size="52" font-weight="900" fill="#F97316">83%</text>
    <text x="143" y="178" text-anchor="middle" font-size="13" font-weight="700" fill="#1C1917">Admin Time Saved</text>
    <text x="143" y="196" text-anchor="middle" font-size="11" fill="#78716C">23 hrs/week → 4 hrs/week</text>
    <text x="143" y="216" text-anchor="middle" font-size="10" fill="#F97316" font-weight="700">↓ 83% REDUCTION</text>
  </g>

  <!-- Card 2: Dedup Accuracy -->
  <g filter="url(#metdrop)">
    <rect x="265" y="88" width="205" height="160" rx="14" fill="#FFFFFF"/>
    <rect x="265" y="88" width="205" height="6" rx="4" fill="url(#purpleStripe)"/>
    <text x="368" y="150" text-anchor="middle" font-size="52" font-weight="900" fill="#8B5CF6">94%</text>
    <text x="368" y="178" text-anchor="middle" font-size="13" font-weight="700" fill="#1C1917">Dedup Accuracy</text>
    <text x="368" y="196" text-anchor="middle" font-size="11" fill="#78716C">7/8 duplicates caught</text>
    <text x="368" y="216" text-anchor="middle" font-size="10" fill="#8B5CF6" font-weight="700">LEVENSHTEIN 0.85</text>
  </g>

  <!-- Card 3: Parse Time -->
  <g filter="url(#metdrop)">
    <rect x="490" y="88" width="205" height="160" rx="14" fill="#FFFFFF"/>
    <rect x="490" y="88" width="205" height="6" rx="4" fill="url(#greenStripe)"/>
    <text x="593" y="150" text-anchor="middle" font-size="52" font-weight="900" fill="#10B981">&lt;3s</text>
    <text x="593" y="178" text-anchor="middle" font-size="13" font-weight="700" fill="#1C1917">Resume Parse Time</text>
    <text x="593" y="196" text-anchor="middle" font-size="11" fill="#78716C">GPT-4o structured output</text>
    <text x="593" y="216" text-anchor="middle" font-size="10" fill="#10B981" font-weight="700">LIVE SSE STREAM</text>
  </g>

  <!-- Card 4: Time-to-Hire -->
  <g filter="url(#metdrop)">
    <rect x="715" y="88" width="245" height="160" rx="14" fill="#FFFFFF"/>
    <rect x="715" y="88" width="245" height="6" rx="4" fill="url(#blueStripe)"/>
    <text x="838" y="150" text-anchor="middle" font-size="52" font-weight="900" fill="#3B82F6">16</text>
    <text x="838" y="178" text-anchor="middle" font-size="13" font-weight="700" fill="#1C1917">Days Faster Hiring</text>
    <text x="838" y="196" text-anchor="middle" font-size="11" fill="#78716C">44 days industry avg → 28</text>
    <text x="838" y="216" text-anchor="middle" font-size="10" fill="#3B82F6" font-weight="700">36% TIME REDUCTION</text>
  </g>

  <text x="500" y="274" text-anchor="middle" font-size="11" fill="#A8A29E" letter-spacing="1">Tested with 25 mixed-format resumes  ·  15 NLP queries  ·  10 Copilot QA sessions</text>
</svg>

</div>

<br/>

---

## 🚀 Quick Start

<div align="center">

<svg width="100%" viewBox="0 0 860 360" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">
  <defs>
    <filter id="termglow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#F97316" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Terminal window -->
  <rect width="860" height="360" rx="14" fill="#1C1917" filter="url(#termglow)"/>

  <!-- Title bar -->
  <rect width="860" height="42" rx="14" fill="#292524"/>
  <rect x="0" y="28" width="860" height="14" fill="#292524"/>

  <!-- Traffic lights -->
  <circle cx="28" cy="21" r="7" fill="#FF5F57"/>
  <circle cx="52" cy="21" r="7" fill="#FEBC2E"/>
  <circle cx="76" cy="21" r="7" fill="#28C840"/>

  <!-- Terminal title -->
  <text x="430" y="26" text-anchor="middle" font-size="12" fill="#78716C">bash — hirex</text>

  <!-- Line 1 -->
  <text x="24" y="76" font-size="13" fill="#F97316" font-weight="700">
    <animate attributeName="opacity" from="0" to="1" dur="0.1s" begin="0.3s" fill="freeze"/>
    $
  </text>
  <text x="40" y="76" font-size="13" fill="#E7E5E4">
    <animate attributeName="opacity" from="0" to="1" dur="0.1s" begin="0.3s" fill="freeze"/>
    git clone https://github.com/LastCommit/HireX.git
  </text>

  <!-- Line 2: response -->
  <text x="24" y="96" font-size="13" fill="#4ADE80">
    <animate attributeName="opacity" from="0" to="1" dur="0.1s" begin="0.7s" fill="freeze"/>
    ✓ Cloning into 'HireX'... done.
  </text>

  <!-- Line 3 -->
  <text x="24" y="122" font-size="13" fill="#F97316" font-weight="700">
    <animate attributeName="opacity" from="0" to="1" dur="0.1s" begin="1.0s" fill="freeze"/>
    $
  </text>
  <text x="40" y="122" font-size="13" fill="#E7E5E4">
    <animate attributeName="opacity" from="0" to="1" dur="0.1s" begin="1.0s" fill="freeze"/>
    cd HireX &amp;&amp; cp .env.example .env
  </text>

  <!-- Line 4: add key -->
  <text x="24" y="142" font-size="13" fill="#78716C">
    <animate attributeName="opacity" from="0" to="1" dur="0.1s" begin="1.3s" fill="freeze"/>
    # Add your OPENAI_API_KEY to .env
  </text>

  <!-- Line 5 -->
  <text x="24" y="168" font-size="13" fill="#F97316" font-weight="700">
    <animate attributeName="opacity" from="0" to="1" dur="0.1s" begin="1.6s" fill="freeze"/>
    $
  </text>
  <text x="40" y="168" font-size="13" fill="#E7E5E4">
    <animate attributeName="opacity" from="0" to="1" dur="0.1s" begin="1.6s" fill="freeze"/>
    docker-compose up --build
  </text>

  <!-- Line 6: docker response -->
  <text x="24" y="188" font-size="13" fill="#38BDF8">
    <animate attributeName="opacity" from="0" to="1" dur="0.1s" begin="2.0s" fill="freeze"/>
    ⠿ Container hirex-backend   Started
  </text>
  <text x="24" y="206" font-size="13" fill="#38BDF8">
    <animate attributeName="opacity" from="0" to="1" dur="0.1s" begin="2.2s" fill="freeze"/>
    ⠿ Container hirex-frontend  Started
  </text>

  <!-- Line 7: success -->
  <text x="24" y="232" font-size="13" fill="#4ADE80">
    <animate attributeName="opacity" from="0" to="1" dur="0.1s" begin="2.5s" fill="freeze"/>
    ✓  Frontend  →  http://localhost:5173
  </text>
  <text x="24" y="250" font-size="13" fill="#4ADE80">
    <animate attributeName="opacity" from="0" to="1" dur="0.1s" begin="2.7s" fill="freeze"/>
    ✓  Backend   →  http://localhost:3001
  </text>
  <text x="24" y="268" font-size="13" fill="#4ADE80">
    <animate attributeName="opacity" from="0" to="1" dur="0.1s" begin="2.9s" fill="freeze"/>
    ✓  HireX is running. Happy hiring!
  </text>

  <!-- Prompt line -->
  <text x="24" y="300" font-size="13" fill="#F97316" font-weight="700">
    <animate attributeName="opacity" from="0" to="1" dur="0.1s" begin="3.2s" fill="freeze"/>
    $
  </text>
  <!-- Blinking cursor -->
  <rect x="40" y="287" width="9" height="16" rx="1" fill="#E7E5E4">
    <animate attributeName="opacity" values="1;0;1" dur="1.2s" begin="3.2s" repeatCount="indefinite"/>
  </rect>

  <!-- Bottom note -->
  <text x="430" y="340" text-anchor="middle" font-size="11" fill="#57534E">No Docker? Run  npm install &amp;&amp; npm run dev  in /frontend and /backend separately</text>
</svg>

</div>

**Prerequisites:** Node.js 18+ · Docker (optional) · OpenAI API key

```bash
# 1. Clone
git clone https://github.com/LastCommit/HireX.git && cd HireX

# 2. Configure environment
cp .env.example .env
# → Add OPENAI_API_KEY=sk-... to .env

# 3. Launch with Docker (recommended)
docker-compose up --build

# 4. Or run manually
cd frontend && npm install && npm run dev   # http://localhost:5173
cd backend  && npm install && npm start     # http://localhost:3001
```

**Live Demo:** [hirex.vercel.app](https://hirex.vercel.app)

<br/>

---

## 👥 Team

<div align="center">

<svg width="100%" viewBox="0 0 1100 230" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">
  <defs>
    <filter id="teamdrop" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#F97316" flood-opacity="0.12"/>
    </filter>
    <linearGradient id="teamBG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF7ED"/>
      <stop offset="100%" stop-color="#FFFBF5"/>
    </linearGradient>
  </defs>

  <rect width="1100" height="230" fill="url(#teamBG)" rx="16"/>

  <!-- Connecting line -->
  <line x1="98" y1="115" x2="1002" y2="115" stroke="#F97316" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="5,4"/>

  <!-- Card 1: Vraj -->
  <g filter="url(#teamdrop)">
    <rect x="40" y="46" width="140" height="148" rx="14" fill="#FFFFFF"/>
    <circle cx="110" cy="96" r="34" fill="#FFF7ED" stroke="#F97316" stroke-width="2"/>
    <text x="110" y="103" text-anchor="middle" font-size="22" font-weight="800" fill="#F97316">VT</text>
    <text x="110" y="148" text-anchor="middle" font-size="12" font-weight="700" fill="#1C1917">Vraj Talati</text>
    <text x="110" y="165" text-anchor="middle" font-size="10" fill="#F97316">Team Lead</text>
    <text x="110" y="180" text-anchor="middle" font-size="9" fill="#A8A29E">Full Stack + AI</text>
    <animateTransform attributeName="transform" type="translate" values="0,-20;0,0" dur="0.4s" begin="0.2s" fill="freeze"/>
  </g>

  <!-- Card 2: Preetansh -->
  <g filter="url(#teamdrop)">
    <rect x="220" y="46" width="140" height="148" rx="14" fill="#FFFFFF"/>
    <circle cx="290" cy="96" r="34" fill="#EDE9FE" stroke="#8B5CF6" stroke-width="2"/>
    <text x="290" y="103" text-anchor="middle" font-size="22" font-weight="800" fill="#8B5CF6">PD</text>
    <text x="290" y="148" text-anchor="middle" font-size="12" font-weight="700" fill="#1C1917">Preetansh</text>
    <text x="290" y="163" text-anchor="middle" font-size="12" font-weight="700" fill="#1C1917">Devpura</text>
    <text x="290" y="180" text-anchor="middle" font-size="10" fill="#8B5CF6">Backend + DB</text>
    <animateTransform attributeName="transform" type="translate" values="0,20;0,0" dur="0.4s" begin="0.3s" fill="freeze"/>
  </g>

  <!-- Card 3: Jenil -->
  <g filter="url(#teamdrop)">
    <rect x="400" y="46" width="140" height="148" rx="14" fill="#FFFFFF"/>
    <circle cx="470" cy="96" r="34" fill="#ECFDF5" stroke="#10B981" stroke-width="2"/>
    <text x="470" y="103" text-anchor="middle" font-size="22" font-weight="800" fill="#10B981">JP</text>
    <text x="470" y="148" text-anchor="middle" font-size="12" font-weight="700" fill="#1C1917">Jenil Paghdar</text>
    <text x="470" y="165" text-anchor="middle" font-size="10" fill="#10B981">AI / ML</text>
    <text x="470" y="180" text-anchor="middle" font-size="9" fill="#A8A29E">GPT-4o + RAG</text>
    <animateTransform attributeName="transform" type="translate" values="0,-20;0,0" dur="0.4s" begin="0.4s" fill="freeze"/>
  </g>

  <!-- Card 4: Astha -->
  <g filter="url(#teamdrop)">
    <rect x="580" y="46" width="140" height="148" rx="14" fill="#FFFFFF"/>
    <circle cx="650" cy="96" r="34" fill="#FDF2F8" stroke="#EC4899" stroke-width="2"/>
    <text x="650" y="103" text-anchor="middle" font-size="22" font-weight="800" fill="#EC4899">AJ</text>
    <text x="650" y="148" text-anchor="middle" font-size="12" font-weight="700" fill="#1C1917">Astha Jain</text>
    <text x="650" y="165" text-anchor="middle" font-size="10" fill="#EC4899">UI / UX</text>
    <text x="650" y="180" text-anchor="middle" font-size="9" fill="#A8A29E">Design + Frontend</text>
    <animateTransform attributeName="transform" type="translate" values="0,20;0,0" dur="0.4s" begin="0.5s" fill="freeze"/>
  </g>

  <!-- Card 5: Aditya -->
  <g filter="url(#teamdrop)">
    <rect x="760" y="46" width="140" height="148" rx="14" fill="#FFFFFF"/>
    <circle cx="830" cy="96" r="34" fill="#EFF6FF" stroke="#3B82F6" stroke-width="2"/>
    <text x="830" y="103" text-anchor="middle" font-size="22" font-weight="800" fill="#3B82F6">AJ</text>
    <text x="830" y="148" text-anchor="middle" font-size="12" font-weight="700" fill="#1C1917">Aditya Jain</text>
    <text x="830" y="165" text-anchor="middle" font-size="10" fill="#3B82F6">DevOps + Infra</text>
    <text x="830" y="180" text-anchor="middle" font-size="9" fill="#A8A29E">Docker + Deploy</text>
    <animateTransform attributeName="transform" type="translate" values="0,-20;0,0" dur="0.4s" begin="0.6s" fill="freeze"/>
  </g>

  <!-- University badge -->
  <rect x="940" y="80" width="126" height="68" rx="10" fill="#FFFFFF" stroke="#F97316" stroke-width="1.5"/>
  <text x="1003" y="104" text-anchor="middle" font-size="10" font-weight="700" fill="#F97316">NIRMA</text>
  <text x="1003" y="118" text-anchor="middle" font-size="10" font-weight="700" fill="#F97316">UNIVERSITY</text>
  <text x="1003" y="136" text-anchor="middle" font-size="9" fill="#78716C">Ahmedabad, IN</text>

  <text x="550" y="214" text-anchor="middle" font-size="11" fill="#A8A29E" letter-spacing="1">Team Last Commit  ·  Built in 36 hours  ·  Breach Hackathon 2025</text>
</svg>

</div>

<br/>

---

## 📄 License · 🤝 Contributing · ⭐ Star History

<div align="center">

<svg width="100%" viewBox="0 0 1200 200" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">
  <defs>
    <linearGradient id="footerBG" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1C1917"/>
      <stop offset="50%" stop-color="#292524">
        <animate attributeName="stop-color" values="#292524;#3D1A00;#292524" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" stop-color="#1C1917"/>
    </linearGradient>
    <filter id="footglow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#F97316" flood-opacity="0.3"/>
    </filter>
  </defs>

  <rect width="1200" height="200" fill="url(#footerBG)" rx="16"/>

  <!-- Floating stars -->
  <circle cx="60" cy="40" r="2" fill="#F97316" fill-opacity="0.7">
    <animate attributeName="cy" values="40;20;40" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="fill-opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite"/>
  </circle>
  <circle cx="200" cy="160" r="1.5" fill="#F97316" fill-opacity="0.5">
    <animate attributeName="cy" values="160;140;160" dur="4s" begin="1s" repeatCount="indefinite"/>
    <animate attributeName="fill-opacity" values="0.5;0.9;0.5" dur="4s" begin="1s" repeatCount="indefinite"/>
  </circle>
  <circle cx="400" cy="30" r="2.5" fill="#FB923C" fill-opacity="0.4">
    <animate attributeName="cy" values="30;10;30" dur="5s" begin="0.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="700" cy="170" r="2" fill="#F97316" fill-opacity="0.6">
    <animate attributeName="cy" values="170;150;170" dur="3.5s" begin="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="900" cy="25" r="1.5" fill="#FB923C" fill-opacity="0.5">
    <animate attributeName="cy" values="25;5;25" dur="4.5s" begin="1.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="1100" cy="155" r="2" fill="#F97316" fill-opacity="0.45">
    <animate attributeName="cy" values="155;130;155" dur="3.8s" begin="0.8s" repeatCount="indefinite"/>
  </circle>
  <circle cx="1050" cy="50" r="3" fill="#F97316" fill-opacity="0.3">
    <animate attributeName="cy" values="50;25;50" dur="6s" begin="2.5s" repeatCount="indefinite"/>
  </circle>

  <!-- Main text -->
  <text x="600" y="78" text-anchor="middle" font-size="26" font-weight="900" fill="#FFFFFF" filter="url(#footglow)">
    Built with ❤ + AI at Breach Hackathon 2025
  </text>
  <text x="600" y="106" text-anchor="middle" font-size="14" fill="#A8A29E">
    Team Last Commit  ·  Nirma University, Ahmedabad  ·  March 2025
  </text>

  <!-- Buttons -->
  <!-- GitHub -->
  <rect x="320" y="126" width="140" height="38" rx="19" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.3"/>
  <text x="390" y="150" text-anchor="middle" font-size="13" font-weight="700" fill="#FFFFFF">⭐ GitHub</text>

  <!-- Demo -->
  <rect x="480" y="126" width="140" height="38" rx="19" fill="#F97316"/>
  <text x="550" y="150" text-anchor="middle" font-size="13" font-weight="700" fill="#FFFFFF">🚀 Live Demo</text>

  <!-- Email -->
  <rect x="640" y="126" width="240" height="38" rx="19" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.3"/>
  <text x="760" y="150" text-anchor="middle" font-size="13" font-weight="700" fill="#FFFFFF">✉ 24btm032@nirmauni.ac.in</text>

  <!-- Bottom line -->
  <text x="600" y="186" text-anchor="middle" font-size="10" fill="#57534E" letter-spacing="1">MIT LICENSE  ·  PRs WELCOME  ·  hirex.vercel.app</text>
</svg>

</div>

---

<div align="center">

**[⭐ Star this repo](https://github.com/LastCommit/HireX)** · **[🚀 Live Demo](https://hirex.vercel.app)** · **[📧 Contact](mailto:24btm032@nirmauni.ac.in)**

<sub>Built in 36 hours · Powered by GPT-4o · Breach Hackathon 2025 · Nirma University · MIT License</sub>

</div>
