# Meetsy (NexAI)

**Meetsy** is a full-stack, AI-powered learning partner matching platform that connects learners with compatible peers for collaboration, accountability, and growth. Users join topic-based communities, define their learning goals, and get intelligently matched with partners using OpenAI's GPT-4o-mini. Built-in real-time chat and AI-generated conversation summaries keep learners on track.

> _Stop learning alone. Find your perfect study partner with the power of AI._

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)
- [AI-Powered Features](#ai-powered-features)
- [Monetization & Tier System](#monetization--tier-system)
- [License](#license)

---

## Features

- **AI-Powered Partner Matching** — GPT-4o-mini analyzes learning goals, tags, and descriptions to find semantically compatible partners within each community.
- **Learning Communities** — Browse and join topic-based communities (e.g., Next.js, Python, AI/ML, Cloud/DevOps, Leadership, YouTube content creation).
- **Learning Goals** — Define what you want to learn with titles, descriptions, and tags. Goals drive the AI matching algorithm.
- **Real-Time Chat** — Message your matched partners with 5-second polling for near-instant updates.
- **AI Conversation Summaries** — Generate structured summaries of your conversations with key points, action items, and next steps powered by GPT-4o-mini.
- **Dashboard** — View stats (communities joined, goals set, active/pending matches), pending match notifications, recent chats, and community overview at a glance.
- **Authentication** — Secure sign-in/sign-up via Clerk with automatic database user sync.
- **Subscription Tiers** — Free and Pro plans with Clerk Billing integration. Pro unlocks unlimited communities, goals, and match visibility.
- **Animated Landing Page** — Polished marketing page with Framer Motion animations, feature highlights, step-by-step guide, and integrated pricing table.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, React 19) |
| **API** | [Hono](https://hono.dev) — mounted on Next.js catch-all route (`/api/*`) via `hono/vercel` |
| **Database** | PostgreSQL with [Drizzle ORM](https://orm.drizzle.team) |
| **Authentication** | [Clerk](https://clerk.com) (middleware + billing) |
| **AI** | [Vercel AI SDK](https://sdk.vercel.ai) + [OpenAI GPT-4o-mini](https://openai.com) |
| **State Management** | [TanStack React Query](https://tanstack.com/query) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) components |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) (via `motion` package) |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Notifications** | [Sonner](https://sonner.emilkowal.dev) toasts |
| **Font** | Google Fonts — Outfit |
| **Language** | TypeScript (strict) |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (React 19)                        │
│                                                                 │
│  Landing Page ←→ Dashboard ←→ Communities ←→ Chat Interface     │
│       │              │             │              │              │
│       └──────────────┴─────────────┴──────────────┘              │
│                          │                                       │
│              TanStack React Query (hooks)                        │
│                          │                                       │
│              Hono RPC Client (type-safe)                         │
└──────────────────────────┬───────────────────────────────────────┘
                           │ HTTP
┌──────────────────────────┴───────────────────────────────────────┐
│                     API Layer (Hono on Next.js)                   │
│                                                                   │
│  /api/communities  /api/goals  /api/matches  /api/conversations   │
│  /api/users                                                       │
│       │                                                           │
│  Clerk Auth Middleware → DB User Sync → Route Handlers            │
│       │                                                           │
│  AI Module (OpenAI GPT-4o-mini)                                   │
│    • Partner matching    • Conversation summaries                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────┴───────────────────────────────────────┐
│                   PostgreSQL (Drizzle ORM)                        │
│                                                                   │
│  users · communities · community_members · learning_goals         │
│  matches · conversations · messages · conversation_summaries      │
└───────────────────────────────────────────────────────────────────┘
```

**Key Architectural Decisions:**

1. **Hono on Next.js** — All API routes run through a single Hono app mounted on a `[[...route]]` catch-all. This provides fast, type-safe routing with middleware support, while leveraging Next.js for SSR and deployment.
2. **End-to-End Type Safety** — The Hono RPC client (`hc<AppType>`) gives full TypeScript type inference from API route definitions to frontend hook calls, eliminating runtime type errors.
3. **Clerk Auth + DB Sync** — Clerk handles authentication; the auth middleware automatically creates/sync database users on first API call via `getOrCreateUserByClerkId`.
4. **React Query Data Layer** — All server state is managed through TanStack Query hooks with cache invalidation, stale time management, and optimistic updates.

---

## Database Schema

The application uses **8 PostgreSQL tables** connected through UUID foreign keys:

| Table | Purpose |
|---|---|
| `users` | User profiles synced with Clerk (clerk_id, email, name, image, subscription tier) |
| `communities` | Topic-based learning groups (name, description, image, creator) |
| `community_members` | Join table linking users to communities |
| `learning_goals` | User learning objectives per community (title, description, JSONB tags) |
| `matches` | AI-generated partner matches (user1, user2, community, status: pending/accepted/declined) |
| `conversations` | Chat threads linked to accepted matches |
| `messages` | Individual chat messages (sender, content, timestamp) |
| `conversation_summaries` | AI-generated summaries (summary text, JSONB arrays: key_points, action_items, next_steps) |

**Entity Relationships:**

```
users ──< community_members >── communities
users ──< learning_goals >── communities
users ──< matches >── communities
matches ──< conversations ──< messages
conversations ──< conversation_summaries
```

---

## Project Structure

```
next-ai/
├── app/
│   ├── layout.tsx                 # Root layout (Clerk, fonts, providers)
│   ├── page.tsx                   # Landing page (hero, features, pricing)
│   ├── globals.css                # Tailwind CSS imports
│   ├── (main)/                    # Authenticated app routes
│   │   ├── layout.tsx             # App shell layout
│   │   ├── dashboard/page.tsx     # Dashboard with stats & overview
│   │   ├── chat/
│   │   │   ├── page.tsx           # Chat hub (pending + active matches)
│   │   │   └── [matchId]/page.tsx # Individual chat interface
│   │   └── communities/
│   │       ├── layout.tsx         # Communities section layout
│   │       ├── page.tsx           # My communities + goals + AI matching
│   │       └── all/page.tsx       # Browse & join all communities
│   ├── api/
│   │   └── [[...route]]/route.ts  # Hono API catch-all entry point
│   ├── server/                    # Hono route definitions
│   │   ├── community-routes.ts    # Community CRUD & join
│   │   ├── conversations-routes.ts# Messaging & AI summaries
│   │   ├── learning-goals-routes.ts# Goal CRUD with Zod validation
│   │   ├── matches-routes.ts      # AI matching, accept, conversation setup
│   │   ├── users-routes.ts        # Current user info + pro status
│   │   └── middleware/
│   │       └── auth-middleware.ts  # Clerk → DB user resolution
│   ├── sign-in/                   # Clerk sign-in page
│   └── sign-up/                   # Clerk sign-up page
├── components/
│   ├── chat/
│   │   └── chat-interface.tsx     # 2-column chat + summary sidebar
│   ├── communities/
│   │   ├── add-learning-goal.tsx  # Inline goal creation form
│   │   └── ai-matching.tsx        # AI match trigger button
│   ├── dashboard/
│   │   └── stats-card.tsx         # Stat display card
│   ├── landing/                   # Landing page sections
│   │   ├── hero-section.tsx
│   │   ├── features-section.tsx
│   │   ├── how-it-works-section.tsx
│   │   ├── pricing-section.tsx
│   │   └── cta-section.tsx
│   ├── layout/
│   │   ├── header.tsx             # App navigation + auth buttons
│   │   ├── header-wrapper.tsx     # Header data fetching wrapper
│   │   └── footer.tsx             # Copyright footer
│   ├── providers/
│   │   └── query-provider.tsx     # TanStack Query provider
│   └── ui/                        # Reusable UI primitives (shadcn/ui)
├── db/
│   ├── index.ts                   # Drizzle + pg Pool connection
│   ├── schema.ts                  # All tables, relations & types
│   ├── seed.ts                    # Seed script (users, communities, goals)
│   ├── query-user.ts              # Debug utility
│   └── add-conversations.ts       # Test conversation seeder
├── hooks/                         # React Query hooks
│   ├── use-ai-partner.ts          # AI matching & match management
│   ├── use-communities.ts         # Community queries & mutations
│   ├── use-conversations.ts       # Message fetching (5s polling)
│   ├── use-goals.ts               # Learning goal creation
│   └── use-users.ts               # Current user query
├── lib/
│   ├── ai.ts                      # AI matching + summary generation (OpenAI)
│   ├── api-client.ts              # Hono RPC type-safe client
│   ├── db-helpers.ts              # Reusable database query functions
│   ├── user-utils.ts              # Clerk ↔ DB user sync
│   └── utils.ts                   # Utility functions (cn, getOtherUser)
├── proxy.ts                       # Clerk middleware configuration
├── drizzle.config.ts              # Drizzle Kit configuration
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** database (local or hosted, e.g., Neon, Supabase, Railway)
- **Clerk** account (for authentication & billing)
- **OpenAI** API key (for AI matching & summaries)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/next-ai.git
   cd next-ai
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables** (see [Environment Variables](#environment-variables)):

   ```bash
   cp .env.example .env.local
   ```

4. **Push the database schema:**

   ```bash
   npm run db:push
   ```

5. **Seed the database** (optional — adds sample users, communities, and goals):

   ```bash
   npm run db:seed
   ```

6. **Run the development server:**

   ```bash
   npm run dev
   ```

7. **Open** [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# OpenAI
OPENAI_API_KEY=sk-...
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:push` | Push schema changes directly to the database |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |
| `npm run db:seed` | Seed the database with sample data |

---

## API Endpoints

All API routes are served under `/api` via Hono.

### Communities

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/communities/all` | List all communities (public) |
| `GET` | `/api/communities` | List user's joined communities |
| `POST` | `/api/communities/:communityId/join` | Join a community |
| `GET` | `/api/communities/:communityId/goals` | Get user's goals in a community |

### Learning Goals

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/goals/:communityId/goals` | Get goals for a community |
| `POST` | `/api/goals/goals` | Create a new learning goal |
| `GET` | `/api/goals/goals` | Get all user's learning goals |

### Matches

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/matches/:communityId/aimatch` | Trigger AI-powered partner matching |
| `GET` | `/api/matches/:communityId/matches` | Get potential matches in a community |
| `GET` | `/api/matches/allmatches` | Get all matches (enriched with partner info) |
| `PUT` | `/api/matches/:matchId/accept` | Accept a match & create conversation |
| `GET` | `/api/matches/:matchId/conversation` | Get or create conversation for a match |

### Conversations

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/conversations/:conversationId/messages` | Get all messages in a conversation |
| `POST` | `/api/conversations/:conversationId/messages` | Send a message |
| `POST` | `/api/conversations/:conversationId/summarize` | Generate AI summary |
| `GET` | `/api/conversations/:conversationId/summary` | Get latest AI summary |

### Users

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | Get current user info + pro status |

---

## AI-Powered Features

### 1. Smart Partner Matching

When a user triggers AI matching within a community, the system:

1. Fetches the user's learning goals (titles, descriptions, tags) for that community.
2. Gathers all other community members' goals (excluding already-matched users).
3. Constructs a detailed prompt asking GPT-4o-mini to evaluate **semantic similarity** — not just keyword overlap but conceptual alignment of learning interests.
4. Parses the AI response (JSON with matched user IDs and similarity reasoning).
5. Creates match records in the database with `pending` status.

### 2. Conversation Summaries

After chatting with a partner, users can generate an AI-powered summary that extracts:

- **Summary** — A concise overview of the conversation.
- **Key Points** — Main topics and insights discussed.
- **Action Items** — Tasks and commitments mentioned.
- **Next Steps** — Planned follow-up activities.

Summaries are stored in the database and displayed in the chat sidebar for ongoing reference.

---

## Monetization & Tier System

The platform uses **Clerk Billing** for subscription management with two tiers:

| Feature | Free | Pro |
|---|---|---|
| Communities | Up to 3 | Unlimited |
| Learning goals per community | Limited | Unlimited |
| Pending match visibility | 1 at a time | All matches visible |
| AI matching | Available | Available |
| AI summaries | Available | Available |

Pro status is determined via Clerk's `has({ plan: "pro_plan" })` check on the server side and propagated to the client through the user query hook.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Nikhil Nagar
