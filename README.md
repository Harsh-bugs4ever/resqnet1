# 🚨 ResQNet — Disaster Management Coordination Platform

A full-stack, real-time disaster response coordination platform connecting rescue teams, NGOs, and government agencies during emergencies.

---

## 🗂 Project Structure

```
resqnet/
├── backend/                   # Node.js + Express REST API
│   ├── src/
│   │   ├── app.js             # Express entry point
│   │   ├── config/
│   │   │   └── supabase.js    # Supabase admin client
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT auth + role guard middleware
│   │   └── routes/
│   │       ├── incidents.js   # CRUD incidents
│   │       ├── teams.js       # Teams + assignment logic
│   │       ├── assignments.js # Assignment status management
│   │       ├── resources.js   # Resource requests + demand summary
│   │       ├── alerts.js      # Broadcast alerts
│   │       └── profiles.js    # User profiles + role management
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                  # React + Vite + Tailwind
│   ├── src/
│   │   ├── App.jsx            # Root with QueryClient + auth guard
│   │   ├── main.jsx
│   │   ├── index.css          # Global styles + CSS variables
│   │   ├── lib/
│   │   │   ├── supabase.js    # Supabase browser client
│   │   │   ├── api.js         # Axios API client (all endpoints)
│   │   │   └── utils.js       # Helpers, constants, formatters
│   │   ├── stores/
│   │   │   ├── authStore.js   # Zustand: auth session + profile
│   │   │   └── uiStore.js     # Zustand: panels, modals, map state
│   │   ├── hooks/
│   │   │   ├── useData.js     # TanStack Query hooks for all entities
│   │   │   └── useRealtime.js # Supabase Realtime subscriptions
│   │   └── components/
│   │       ├── auth/
│   │       │   └── AuthPage.jsx        # Login + register page
│   │       ├── layout/
│   │       │   ├── AppLayout.jsx       # Main shell (sidebar + header)
│   │       │   ├── Sidebar.jsx         # Navigation sidebar
│   │       │   └── Header.jsx          # Top bar with live stats
│   │       ├── map/
│   │       │   └── IncidentMap.jsx     # Mapbox GL map with markers
│   │       ├── admin/
│   │       │   ├── AdminDashboard.jsx  # Map + tabbed side panel
│   │       │   ├── IncidentsPanel.jsx  # Incident list + management
│   │       │   ├── TeamsPanel.jsx      # Team list + create
│   │       │   ├── ResourcesPanel.jsx  # Resource demand + requests
│   │       │   └── AlertsPanel.jsx     # Alert feed + broadcast
│   │       ├── team/
│   │       │   └── TeamDashboard.jsx   # Rescue team view
│   │       ├── modals/
│   │       │   ├── CreateIncidentModal.jsx
│   │       │   ├── AssignTeamModal.jsx
│   │       │   ├── CreateAlertModal.jsx
│   │       │   └── CreateResourceModal.jsx
│   │       └── ui/
│   │           ├── Badge.jsx       # Severity, Status, Role badges
│   │           ├── Button.jsx      # Reusable button variants
│   │           ├── FormFields.jsx  # Input, Select, Textarea
│   │           ├── Loaders.jsx     # Spinner, PageLoader, EmptyState
│   │           ├── Modal.jsx       # Modal wrapper with backdrop
│   │           └── Toast.jsx       # Toast notification system
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
│
├── supabase_schema.sql        # Full DB schema + RLS + triggers
├── docker-compose.yml
└── README.md
```

---

## ⚡ Quick Start

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run `supabase_schema.sql` in full
3. Go to **Authentication → Settings** and enable email sign-ups
4. Copy your **Project URL**, **anon key**, and **service_role key**

### 2. Mapbox Token

1. Create an account at [mapbox.com](https://mapbox.com)
2. Create a public token from your dashboard

### 3. Backend

```bash
cd backend
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, CORS_ORIGIN

npm install
npm run dev        # starts on port 3001
```

### 4. Frontend

```bash
cd frontend
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_MAPBOX_TOKEN

npm install
npm run dev        # starts on port 5173
```

### 5. Docker (optional)

```bash
# From project root, create .env with all variables
cp backend/.env.example .env
docker-compose up --build
```

---

## 🔑 Environment Variables

### Backend `.env`
| Variable | Description |
|---|---|
| `PORT` | API port (default: 3001) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Service role key (bypasses RLS for admin ops) |
| `CORS_ORIGIN` | Frontend origin for CORS |
| `NODE_ENV` | `development` or `production` |

### Frontend `.env`
| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_MAPBOX_TOKEN` | Mapbox GL public token |
| `VITE_API_URL` | Backend API URL |

---

## 👤 Roles & Permissions

| Role | Capabilities |
|---|---|
| `admin` | Full access: create/edit/delete incidents, manage teams, broadcast alerts, assign teams, update roles |
| `government` | Create incidents, assign teams, broadcast alerts, fulfill resource requests |
| `ngo` | Create incidents, request resources, view all data |
| `rescue_team` | View assigned tasks, update team status, share location, request resources |

---

## 🗺 Core Features

### Admin / Government Dashboard
- **Live incident map** — Mapbox GL with severity-colored markers and pulsing critical indicators
- **Incident management** — Create, filter by severity/status, resolve, delete
- **Team assignment** — Assign available teams to incidents with duplicate prevention; low-priority incidents are capped at 1 team
- **Resource demand view** — Visual bar chart of pending resource requests by type with priority breakdown
- **Alert broadcast** — Send targeted or all-personnel alerts by role
- **Real-time stats bar** — Active incidents, critical count, ready teams

### Rescue Team Dashboard
- **My Missions** — Active assignments with incident details, severity, and location
- **Status selector** — Toggle between Available / On Mission / Offline with instant backend sync
- **Live location sharing** — Browser Geolocation API → stored in `teams.latitude/longitude`
- **Resource requests** — Submit resource needs tied to active incidents
- **Alert feed** — Incoming broadcasts from command

### Real-time Sync
Supabase Realtime subscriptions on:
- `incidents` — INSERT/UPDATE/DELETE
- `teams` — UPDATE (status, location)
- `assignments` — INSERT/UPDATE
- `alerts` — INSERT (triggers toast notification)

TanStack Query handles cache invalidation; all queries auto-refetch at sensible intervals as a fallback.

---

## 🛡 Security

- All routes require Bearer JWT (Supabase session token)
- Role-based middleware (`requireRole`) on sensitive routes
- PostgreSQL Row Level Security (RLS) policies mirror API-level checks
- `my_role()` SQL helper function for efficient RLS evaluation
- Service role key used only on server-side; anon key on client
- Helmet.js for HTTP security headers

---

## 📡 API Reference

```
GET    /health                         # Health check

GET    /api/incidents                  # List all incidents (with assignments)
POST   /api/incidents                  # Create incident [admin, govt]
GET    /api/incidents/:id              # Get single incident
PATCH  /api/incidents/:id              # Update incident [admin, govt]
DELETE /api/incidents/:id              # Delete incident [admin]

GET    /api/teams                      # List all teams
POST   /api/teams                      # Create team [admin, govt]
GET    /api/teams/:id                  # Get team
PATCH  /api/teams/:id                  # Update team / location
POST   /api/teams/:id/assign           # Assign team to incident [admin, govt]

GET    /api/assignments                # List assignments (filterable)
PATCH  /api/assignments/:id            # Update assignment status

GET    /api/resources                  # List resource requests (filterable)
GET    /api/resources/summary          # Demand summary by resource type
POST   /api/resources                  # Create resource request
PATCH  /api/resources/:id              # Update resource status [admin, govt]

GET    /api/alerts                     # List alerts
POST   /api/alerts                     # Broadcast alert [admin, govt]

GET    /api/profiles/me                # Get current user profile
PATCH  /api/profiles/me                # Update own profile
GET    /api/profiles                   # List all profiles [admin]
PATCH  /api/profiles/:id/role          # Update user role [admin]
```

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| State | Zustand (auth + UI), TanStack Query (server state) |
| Maps | Mapbox GL JS, react-map-gl |
| Backend | Node.js, Express |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (JWT) |
| Realtime | Supabase Realtime (postgres_changes) |
| Containerization | Docker, Docker Compose, Nginx |

---

## 🚀 Deployment

### Vercel (Frontend)
```bash
cd frontend && vercel deploy
# Add all VITE_* env vars in Vercel dashboard
```

### Railway / Render (Backend)
```bash
# Set all environment variables in dashboard
# Start command: node src/app.js
```

### Supabase
- Hosted automatically — no extra deployment needed
- Enable Realtime for tables in **Database → Replication**
# resqnet1
