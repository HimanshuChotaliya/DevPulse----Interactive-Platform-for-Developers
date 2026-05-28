# DevPulse
Developers build incredible things every day — but most of it stays invisible. GitHub shows what you committed, LinkedIn shows what you announced, but nothing captures the raw, real-time pulse of a developer actually working — the bugs they fought, the features they shipped, the questions they are stuck on right now. DevPulse fills that gap.
It is a real-time activity feed built exclusively for developers to share their work as it happens — not polished post-launch announcements, but live updates, honest bug reports, genuine questions, and milestone moments that make up the actual journey of building software. Think of it as the developer's version of a live newsroom — where your team's progress is always visible, always current, and always one scroll away.

## Tech Stack
**Backend:** Node.js, Express, PostgreSQL, Redis (caching + pub/sub), WebSockets, GraphQL (Apollo Server)  
**Frontend:** React (Vite), Tailwind CSS, Zustand, Apollo Client, Axios, Framer Motion, React Router v6  
**DevOps:** Docker, GitHub Actions CI/CD, Railway (backend + PostgreSQL), Upstash (Redis), Vercel (frontend)

## Why This Stack
DevPulse is built around one core requirement — real time. Every technical decision flows from that.
The backend splits REST and GraphQL by responsibility — REST handles all writes because mutations need predictable, controlled endpoints, while GraphQL handles all reads because the frontend needs flexibility in what it fetches without overfetching. Redis sits in the middle doing two jobs — caching the feed so the database isn't hit on every request, and acting as a pub/sub bridge so when a REST controller writes data, the WebSocket server knows about it instantly and broadcasts to every connected client. This separation keeps each layer focused on one job and makes the real-time pipeline clean and traceable.
On the frontend, Zustand manages global state because it is lightweight and works naturally with WebSocket events — when a new post arrives over the socket, one store update re-renders every component that cares about it. Apollo Client handles GraphQL queries with built-in caching so the feed does not re-fetch unnecessarily. The presence system — showing who is online in real time — runs entirely through WebSocket connection and disconnection events, with state persisted in PostgreSQL so last seen survives server restarts.
The result is a stack where every piece has a clear reason to exist and a clear boundary with everything around it.
