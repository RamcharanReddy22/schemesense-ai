# SchemeSense AI: Project Overview & HackathonZ Pitch

## 1. Project Summary
**Project Name:** SchemeSense AI
**Team Name:** Team six_seven
**Event:** HackathonZ

**What it is:**
SchemeSense AI is a centralized "Welfare Scheme Aggregation & Eligibility Assessment System". It bridges the gap between citizens and the hundreds of complex government welfare programs available across the country. 

Instead of forcing citizens to navigate confusing, scattered government websites, SchemeSense provides a single, unified portal. Users can input their demographic data (age, gender, state, income, caste, etc.) through an intuitive Eligibility Wizard to instantly discover exactly which schemes they qualify for.

**Key Features:**
*   **Eligibility Wizard:** A step-by-step questionnaire that filters out irrelevant schemes and provides hyper-personalized matches.
*   **Seva Mitra AI Chatbot:** A multi-lingual (English, Hindi, Telugu) AI assistant powered by a RAG (Retrieval-Augmented Generation) backend. Citizens can type natural queries (e.g., "scholarships for girls") and get instant, accurate answers.
*   **Offline Support (PWA):** Built as a Progressive Web App. Citizens in rural areas with spotty internet can install the app directly to their phones and use core features offline.
*   **Accessibility First:** High contrast UI, scalable fonts (A-, A, A+), and multi-language support ensuring it serves all demographics.
*   **Analytics Dashboard:** Visualizing active schemes, state coverage, and category distributions using interactive maps and charts.

---

## 2. The Tech Stack (What & Where)

### Frontend (Client-Side)
*   **React 19:** The core UI library used to build the entire interactive interface, managing state for the Wizard and Chatbot.
*   **Vite:** The lightning-fast build tool and development server powering the React frontend.
*   **Vite PWA Plugin:** Used to configure the Service Workers and Web Manifest, turning the website into an installable mobile application with offline capabilities.
*   **Vanilla CSS3:** Custom, highly optimized design system using CSS variables for a premium, lightweight, and accessible user experience (no heavy UI frameworks).
*   **react-simple-maps & d3-scale:** Used in the Analytics Dashboard to render the interactive India map and data visualizations.
*   **Hosting - Netlify:** The frontend is automatically deployed and hosted on Netlify via continuous integration from GitHub.

### Backend (Server-Side & AI)
*   **Python & FastAPI:** The backend framework serving the REST API endpoints for the AI Chatbot.
*   **Groq LLM API:** Used to power the natural language generation for the "Seva Mitra" chatbot, providing lightning-fast AI responses.
*   **RAG Architecture:** The backend uses Retrieval-Augmented Generation to search through a database of government schemes and feed the context to Groq, ensuring the AI doesn't hallucinate and only gives accurate scheme data.
*   **Hosting - Render:** The Python backend is hosted on Render's cloud infrastructure.

---

## 3. The Pitch Script (3-Minute Presentation)

**[Hook - 30 Seconds]**
"Good [Morning/Afternoon] Judges. We are Team six_seven. 
Did you know there are hundreds of incredible government welfare schemes available in our country, yet millions of rupees go unclaimed every year? Why? Because the people who need them the most—farmers in rural areas, low-income students, marginalized communities—don't know they exist, or don't know how to navigate the complex bureaucratic websites to see if they are eligible. 
Information is scattered, English-only, and extremely confusing. We decided to fix this."

**[The Solution - 45 Seconds]**
"Meet **SchemeSense AI**: A centralized Welfare Scheme Aggregation and Eligibility Assessment System. 
We've built a single, unified portal where a citizen can come, enter basic demographic details like their age, gender, state, and income into our Eligibility Wizard, and instantly see a hyper-personalized list of exact government programs they qualify for—complete with document checklists and direct application links."

**[The Tech & AI - 60 Seconds]**
"But we didn't stop at just a directory. We integrated **Seva Mitra**, an AI-powered Citizen Welfare Assistant. 
Powered by a Python backend and the lightning-fast Groq LLM, our chatbot uses RAG (Retrieval-Augmented Generation) to answer natural language questions. A citizen can type in Hindi, Telugu, or English, asking 'Are there any scholarships for girls in my state?' and the AI instantly fetches the correct scheme data without hallucinating.

Furthermore, we built SchemeSense as a Progressive Web App (PWA). This means a farmer with spotty internet can install it directly to their phone and access cached information offline. The frontend is built on React 19 and Vite, hosted on Netlify, while our AI backend runs on Render."

**[Conclusion - 30 Seconds]**
"With SchemeSense, we aren't just building a website; we are building a bridge between the government's resources and the citizens who desperately need them. 
It’s accessible, it’s multi-lingual, it’s AI-driven, and it works offline. 
Thank you. We’d love to show you a demo!"
