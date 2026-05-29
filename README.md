# DevPulse 🚀
Live Demo ---> https://dev-pulse-interactive-platform-for.vercel.app/

Developers build incredible things every day — but most of it stays invisible.

GitHub shows what you committed. LinkedIn shows what you announced. But neither captures the *real-time pulse* of a developer actually building software — the bugs they fought for hours, the features they finally shipped at 3 AM, the questions they are stuck on right now, or the small wins that never make it into polished showcase posts.

**DevPulse** fills that gap.

DevPulse is a real-time social activity feed built exclusively for developers to share their work *as it happens*. Instead of polished post-launch announcements, it focuses on the raw journey of building software:

* 🛠️ Live progress updates
* 🐞 Honest bug reports
* 💡 Development breakthroughs
* ❓ Questions and blockers
* 🎯 Milestone moments

Think of it as a developer’s live newsroom — where your team’s progress is always visible, always current, and always one scroll away.

---

# ⚙️ Tech Stack

## Backend

* Node.js
* Express.js
* PostgreSQL
* Redis (Caching + Pub/Sub)
* WebSockets
* GraphQL (Apollo Server)

## Frontend

* React (Vite)
* Tailwind CSS
* Zustand
* Apollo Client
* Axios
* Framer Motion
* React Router v6

## DevOps & Deployment

* Docker
* GitHub Actions (CI/CD)
* Railway (Backend + PostgreSQL)
* Upstash (Redis)
* Vercel (Frontend)

---

# 🧠 Why This Stack?

DevPulse is built around one core requirement: **real-time interaction**.

Every technical decision in the stack exists to support fast, scalable, and traceable real-time communication between developers.

---

## 🔹 Backend Architecture

The backend separates **REST** and **GraphQL** by responsibility:

### REST → Writes & Mutations

REST handles operations that modify data because mutations require predictable and controlled endpoints.

Examples:

* Creating posts
* Updating profiles
* Adding comments
* Managing authentication

### GraphQL → Reads & Queries

GraphQL handles all read operations because the frontend often needs flexible data fetching without overfetching unnecessary fields.

This separation keeps both systems focused on what they do best:

* REST for controlled data modification
* GraphQL for efficient and flexible data retrieval

---

## 🔴 Redis: The Real-Time Engine

Redis plays two critical roles inside DevPulse:

### 1. Feed Caching

The activity feed is cached in Redis so PostgreSQL is not queried on every request. This dramatically improves performance and reduces database load.

### 2. Pub/Sub Messaging

Redis also acts as a real-time event bridge.

When a REST controller creates or updates content:

1. Redis publishes an event
2. The WebSocket server receives it instantly
3. Connected clients receive live updates in real time

This creates a clean and scalable real-time pipeline.

---

## 🌐 WebSockets & Presence System

The application uses WebSockets for:

* Live feed updates
* Real-time notifications
* Online/offline presence tracking

Presence is managed through WebSocket connection and disconnection events.

To make the system persistent:

* online state updates instantly through sockets
* last seen timestamps are stored in PostgreSQL

This ensures presence data survives server restarts and reconnects.

---

## 🎨 Frontend Architecture

### Zustand → Global State Management

Zustand was chosen because it is lightweight, simple, and works naturally with WebSocket-driven updates.

When a new event arrives:

* one store update triggers
* only dependent components re-render

This keeps the frontend reactive without unnecessary complexity.

---

### Apollo Client → GraphQL Caching

Apollo Client manages GraphQL queries and caching automatically.

Benefits:

* Reduced unnecessary re-fetching
* Faster UI updates
* Better client-side performance

---

### Framer Motion → UI Experience

Framer Motion adds smooth animations and transitions to make the feed feel alive and interactive without sacrificing performance.

---

# 🏗️ Final Result

The result is a system where every layer has:

* a clear responsibility
* a clear boundary
* a clear reason to exist

DevPulse is not just another social platform for developers — it is infrastructure designed around the *actual process* of building software in real time.
