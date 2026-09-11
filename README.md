# AI Interview Simulator

# Ai-interviewer-stimulator

An academic (NIIT) full-stack project that simulates a real job interview using AI.
Users pick a job role, experience level and difficulty, answer questions by typing or
speaking, and receive AI-generated scores, feedback and a full interview history.

---

## 1. Project Overview

AI Interview Simulator lets a candidate:

- Register and log in securely.
- Configure a mock interview (role, experience level, difficulty, interview type, number of questions).
- Answer AI-generated questions by typing or using their microphone.
- Receive structured AI evaluation after every answer (score, feedback, strengths, improvements, model answer).
- View a full results summary at the end of the interview.
- Browse interview history and performance analytics over time.

The project is split into two **completely independent** projects that talk to each other only through a REST API:

```
ai-interview-simulator/
├── frontend/   (React + Vite)
├── backend/    (Java + Spring Boot)
└── README.md
```

---

## 2. Features

- Email/password authentication with hashed passwords (BCrypt) and JWT sessions.
- Profile management: view/edit profile, change password.
- Configurable interview setup: job role (including a custom role), experience level,
  difficulty, interview type, question count, optional job description and focus skills.
- AI-generated interview questions (dynamic, not hard-coded), adaptively generated based
  on prior answers within the same interview.
- Typed answers **and** voice answers (Web Speech API) — voice is always an enhancement,
  never a requirement.
- Text-to-speech "Read Question" control (SpeechSynthesis API).
- Per-interview countdown timer, enforced independently on the backend.
- Structured AI evaluation per answer: score, feedback, strengths, improvements, model answer,
  relevance/clarity/technical-accuracy sub-scores.
- Full results page, interview history with filters, and a performance analytics page with charts.
- Light and dark mode.
- Responsive design (desktop, laptop, tablet, mobile).
- Friendly error handling and loading states everywhere; the AI being unavailable never crashes
  the app or the interview session.

---

## 3. Technology Stack

**Frontend:** React 18, Vite, React Router, Axios, `lucide-react` icons, `recharts` for charts,
the browser Web Speech API (SpeechRecognition) and SpeechSynthesis API.

**Backend:** Java 17, Spring Boot 3, Spring Web, Spring Data JPA, Spring Security (JWT-based,
stateless), Bean Validation, Maven.

**Database:** PostgreSQL (production/default), H2 (local development/testing — see `dev` profile).

**AI:** OpenAI Chat Completions API, called exclusively from the backend.

---

## 4. Architecture

```
                 React Frontend (Vite, port 5173)
                          │
                          │  REST / JSON over HTTPS (Bearer JWT)
                          ▼
                 Spring Boot Backend (port 8080)
                 /                          \
                /                            \
               ▼                              ▼
        PostgreSQL Database             OpenAI API
     (users, interviews, questions,   (question generation,
      answers, evaluations)            answer evaluation)
```

The OpenAI API key lives **only** in the backend's environment variables. React never talks to
OpenAI directly — it only ever calls the Spring Boot API.

Voice features run entirely in the browser:

```
Microphone → Browser SpeechRecognition → plain text
           → inserted into the React answer textarea
           → user reviews/edits the text
           → submitted to Spring Boot like any typed answer
```

---

## 5. Folder Structure

```
ai-interview-simulator/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── .env.example
│   └── src/
│       ├── components/     Reusable UI building blocks
│       ├── pages/           Route-level views
│       ├── services/        API layer (api.js, authService.js, ...)
│       ├── hooks/            useSpeechRecognition, useSpeechSynthesis, useTimer
│       ├── context/          AuthContext, ThemeContext
│       ├── styles/           theme.css (design tokens, light/dark mode)
│       ├── App.jsx
│       └── main.jsx
│
├── backend/
│   ├── pom.xml
│   ├── .env.example
│   └── src/
│       ├── main/
│       │   ├── java/com/aiinterview/
│       │   │   ├── controller/    REST controllers
│       │   │   ├── service/        Business logic (Auth, User, Interview, Answer, AI)
│       │   │   ├── repository/     Spring Data JPA repositories
│       │   │   ├── entity/          User, Interview, InterviewQuestion, Answer, Evaluation
│       │   │   ├── dto/             Request/response DTOs (never expose entities directly)
│       │   │   ├── security/        JWT filter, JWT util, UserDetailsService
│       │   │   ├── config/          Security/CORS configuration
│       │   │   └── exception/       Custom exceptions + global handler
│       │   └── resources/
│       │       ├── application.properties
│       │       └── application-dev.properties  (H2 profile)
│       └── test/java/com/aiinterview/   Unit tests
│
└── README.md
```

---

## 6. Database Setup

### Option A — PostgreSQL (recommended for a realistic run)

1. Install PostgreSQL and create a database:
   ```sql
   CREATE DATABASE ai_interview_simulator;
   ```
2. Set the connection details as environment variables (see section 8) or edit
   `backend/src/main/resources/application.properties` directly.
3. Run the backend with the default profile — tables are created/updated automatically via
   `spring.jpa.hibernate.ddl-auto=update`.

### Option B — H2 (fastest for local development, no install required)

Set `SPRING_PROFILES_ACTIVE=dev` (this is the default if you don't set anything). The app will
use an in-memory H2 database. Data resets every time the backend restarts. The H2 console is
available at `http://localhost:8080/h2-console`.

---

## 7. OpenAI API Setup

1. Create an API key at https://platform.openai.com.
2. Set it as the `OPENAI_API_KEY` environment variable for the backend (never commit it).
3. Set `AI_MOCK_MODE=false` once a real key is configured.

**Development without a key:** if `OPENAI_API_KEY` is empty or `AI_MOCK_MODE=true` (the default),
the backend automatically uses a deterministic **mock mode**: it returns realistic mock questions
and a heuristic evaluation (based on answer length) instead of calling OpenAI. This lets the whole
application run end-to-end with no API key. Mock responses are clearly labeled as such in the
feedback text. Never enable mock mode in a real/production deployment.

---

## 8. Environment Variables

### Backend (`backend/.env.example`)

```
DATABASE_URL=jdbc:postgresql://localhost:5432/ai_interview_simulator
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_db_password_here

JWT_SECRET=replace_with_a_long_random_secret_value
JWT_EXPIRATION_MS=86400000

OPENAI_API_KEY=your_api_key_here
OPENAI_API_URL=https://api.openai.com/v1/chat/completions
OPENAI_MODEL=gpt-4o-mini
AI_MOCK_MODE=true

CORS_ALLOWED_ORIGINS=http://localhost:5173
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=dev
```

Export these as real environment variables before running the backend (or use your IDE's run
configuration / a `.env` loader of your choice). **Never commit a real API key or password.**

### Frontend (`frontend/.env.example`)

```
VITE_API_BASE_URL=http://localhost:8080/api
```

Copy to `frontend/.env` and adjust if your backend runs on a different host/port.

---

## 9. Frontend Installation

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173`.

---

## 10. Backend Installation

```bash
cd backend
cp .env.example .env   # then export these variables in your shell, or configure them in your IDE
mvn spring-boot:run
```

The API runs at `http://localhost:8080`. On Windows PowerShell, environment variables can be set
per-session with `$env:OPENAI_API_KEY="..."` before running `mvn spring-boot:run`.

---

## 11. How to Run (Quick Start)

1. Start PostgreSQL (or skip this and rely on the default H2 `dev` profile).
2. In one terminal: `cd backend && mvn spring-boot:run`
3. In another terminal: `cd frontend && npm install && npm run dev`
4. Open `http://localhost:5173`, register an account, and start an interview.

Default URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

---

## 12. How Voice Input Works

1. The user clicks **Start Speaking** on the answer screen.
2. The browser's `SpeechRecognition` (or `webkitSpeechRecognition`) API converts speech to text
   in real time.
3. The resulting text is inserted into the same textarea used for typed answers.
4. The user can freely edit the text before submitting.
5. Submission works identically regardless of whether the text came from typing or speech —
   the backend has no concept of "voice answers," only plain text answers.

## 13. Browser Speech-Recognition Limitations

- `SpeechRecognition` is best supported in Chrome and Chromium-based browsers. Safari and Firefox
  have limited or no support at the time of writing.
- It typically requires an active internet connection (recognition runs in the cloud in most
  browser implementations).
- Recognition can fail due to: microphone permission denial, no microphone present, no speech
  detected, a network error, or the recognition service being unavailable. All of these are
  handled gracefully in the UI with a clear message, and the app always falls back to typing.

## 14. Typing Fallback

If speech recognition is unsupported, denied, or fails for any reason, the microphone button is
hidden/disabled and a message is shown:

> "Voice input isn't supported by this browser. You can type your answer instead."

The typing flow is not just a fallback — it's the primary, always-available way to answer, and the
interview works perfectly using only the keyboard.

---

## 15. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in, returns a JWT |
| POST | `/api/auth/logout` | Stateless logout (client discards the token) |
| GET | `/api/users/me` | Current authenticated user |
| GET | `/api/profile` | Get profile |
| PUT | `/api/profile` | Update profile |
| PUT | `/api/profile/password` | Change password |
| POST | `/api/interviews` | Create a new interview (generates question 1) |
| GET | `/api/interviews` | List the current user's interviews |
| GET | `/api/interviews/{id}` | Get interview detail + questions so far |
| GET | `/api/interviews/{id}/next-question` | Get or adaptively generate the next question |
| POST | `/api/interviews/{id}/answers` | Submit an answer, returns AI evaluation |
| POST | `/api/interviews/{id}/complete` | Finalize the interview and compute overall results |
| GET | `/api/interviews/{id}/results` | Fetch stored results for a completed interview |
| GET | `/api/results` | Same as `/api/interviews` (history use) |
| GET | `/api/analytics` | Aggregate performance analytics for the current user |

All endpoints except `/api/auth/**` require an `Authorization: Bearer <token>` header. Every
interview/question/answer lookup verifies that the resource belongs to the authenticated user —
requesting another user's interview ID returns `404 Not Found`, not their data.

---

## 16. Deployment Considerations

- Use a real, non-default `JWT_SECRET` and store all secrets (DB credentials, OpenAI key) in your
  hosting platform's secret manager — never in source control.
- Set `AI_MOCK_MODE=false` and provide a real `OPENAI_API_KEY` in production.
- Restrict `CORS_ALLOWED_ORIGINS` to your actual deployed frontend origin(s); do not use a wildcard
  for authenticated endpoints.
- Use `spring.jpa.hibernate.ddl-auto=validate` (instead of `update`) once your schema is stable,
  and manage migrations with a tool like Flyway if the project grows.
- Serve the frontend build (`npm run build`) as static files behind a CDN or reverse proxy, and
  run the backend behind HTTPS.

---

## 17. Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Frontend can't reach the API | Check `VITE_API_BASE_URL` in `frontend/.env` and that the backend is running on that port. |
| CORS errors in the browser console | Confirm `CORS_ALLOWED_ORIGINS` on the backend matches the frontend's exact origin (including port). |
| 401 Unauthorized on every request | Your JWT may have expired — log out and log back in. Check `JWT_EXPIRATION_MS`. |
| "AI evaluation is temporarily unavailable" | The OpenAI API key is missing/invalid or OpenAI is unreachable. Check `OPENAI_API_KEY`, or leave `AI_MOCK_MODE=true` for local development. |
| Microphone button is missing | Your browser doesn't support `SpeechRecognition`. This is expected and the app still works by typing. |
| Database connection errors | Verify PostgreSQL is running and `DATABASE_URL`/`DATABASE_USERNAME`/`DATABASE_PASSWORD` are correct, or switch to the `dev` (H2) profile for a zero-config option. |
| Backend won't start: "Failed to configure a DataSource" | You're missing database configuration. Either start PostgreSQL and set the `DATABASE_*` variables, or set `SPRING_PROFILES_ACTIVE=dev` to use H2. |

---

## Demo Credentials

This project ships with no pre-seeded users — register a new account after starting the backend
and frontend. If you add demo/sample data for grading purposes, mark any such account clearly as
a **development/demo credential** and never reuse it in a real deployment.

## Running Backend Tests

```bash
cd backend
mvn test
```

Tests cover: password/registration validation, duplicate email handling, login failure cases,
answer submission validation (empty answers, ownership, already-answered questions), and AI
evaluation wiring.
