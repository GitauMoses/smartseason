# SmartSeason — Field Monitoring System

## 1. Project Overview

SmartSeason is a field monitoring platform used by cooperatives and
agribusiness teams in Kenya to track crop progress across many farms.
Admins create plots, assign them to field agents, and watch an
automatically-computed health status (Active / At Risk / Completed) so
nothing silently falls off the radar. Agents log stage changes and
observations from the ground.

## 2. Tech Stack

- **Backend**: Node.js, Express 4
- **Database**: PostgreSQL (Sequelize ORM + `sequelize-cli` migrations)
- **Auth**: JWT (7-day access tokens, `Authorization: Bearer` header), bcrypt hashing
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **HTTP client**: Axios
- **Routing**: React Router v6

## 3. Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 13+ running locally (or a remote `DATABASE_URL`)

### Clone and install

```bash
git clone <your-repo-url>
cd smartseason

# Backend
cd backend
cp .env.example .env
# edit DATABASE_URL and JWT_SECRET in .env
npm install

# Create the database (one-time, e.g. via psql)
# createdb smartseason

npm run migrate   # runs Sequelize migrations
npm run seed      # inserts users + 10 realistic fields with update histories
npm run dev       # API on http://localhost:5000
```

In a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev       # app on http://localhost:5173
```

Open http://localhost:5173 and log in with any demo account below.

## 4. Demo Credentials

| Role  | Email                     | Password   |
| ----- | ------------------------- | ---------- |
| Admin | admin@smartseason.com     | Admin1234  |
| Agent | aisha@smartseason.com     | Agent1234  |
| Agent | brian@smartseason.com     | Agent1234  |

## 5. Live Demo

Live URL: [to be added]

## 6. Architecture Decisions

- **Node/Express backend**: small, well-understood surface area for a REST API with
  role-gated routes. Keeps middleware explicit and lets auth and role guards live
  next to the controllers that use them.
- **Sequelize ORM + migrations**: migrations give reproducible schema state and make
  the DB redeployable. The model layer also lets us hydrate relationships (`agent`,
  `updates`, `creator`) in a single query for the list + detail endpoints.
- **Monorepo with `/backend` and `/frontend`**: one checkout, one PR for end-to-end
  features, and a shared README. Each side still installs independently.
- **Computed status, never stored**: `status` is derived from `current_stage`,
  `planting_date`, and the most recent `field_update`. Avoiding a stored status
  column means it can't go stale — a field that misses updates slides to "At Risk"
  automatically the next time the API is called.

## 7. Status Logic

For every field returned by the API, the backend computes a `status`
field using [`statusCalculator.js`](backend/src/utils/statusCalculator.js):

1. If `current_stage === 'harvested'` → **Completed**
2. Else if `current_stage !== 'planted'` **and** (no `field_update` exists, or the
   most recent one is older than **14 days**) → **At Risk**
3. Else if `planting_date` is more than **120 days** ago and
   `current_stage !== 'harvested'` → **At Risk**
4. Else → **Active**

A `days_since_update` value is also attached so dashboards can flag fields
that haven't had activity in 7+ days.

## 8. API Overview

All endpoints are prefixed with `/api`. Authenticated calls expect
`Authorization: Bearer <jwt>`.

### Auth

| Method | Path              | Purpose                              |
| ------ | ----------------- | ------------------------------------ |
| POST   | /auth/register    | Create a new user (agent by default) |
| POST   | /auth/login       | Returns `{ token, user }`            |
| GET    | /auth/me          | Current authenticated user           |

### Admin (requires `role: admin`)

| Method | Path                         | Purpose                                         |
| ------ | ---------------------------- | ----------------------------------------------- |
| GET    | /admin/dashboard             | Summary stats + stale fields list               |
| GET    | /admin/agents                | List all users with `role: agent`               |
| GET    | /admin/fields                | All fields with computed status + agent info    |
| POST   | /admin/fields                | Create a field                                  |
| GET    | /admin/fields/:id            | Single field + full update history              |
| PUT    | /admin/fields/:id            | Edit a field                                    |
| DELETE | /admin/fields/:id            | Delete a field (cascades to updates)            |
| POST   | /admin/fields/:id/assign     | Assign field to an agent — body `{ agent_id }`  |

### Agent (requires `role: agent`)

| Method | Path                          | Purpose                                  |
| ------ | ----------------------------- | ---------------------------------------- |
| GET    | /agent/fields                 | Only fields assigned to the caller       |
| GET    | /agent/fields/:id             | Single field (must be assigned to caller)|
| POST   | /agent/fields/:id/updates     | Log a new stage + observation            |

### Health

| Method | Path         | Purpose        |
| ------ | ------------ | -------------- |
| GET    | /health      | Service check  |

## 9. Assumptions Made

- **Registration** creates agents by default. Admins are created by the seeder;
  there is no public self-signup path to `admin`.
- **Stage progression is forward-only** for agents — you can re-log the current
  stage with a new observation, but you can't roll a field back. Admins can
  override `current_stage` via the edit form when needed.
- **Field deletion cascades** to `field_updates` so no orphaned history rows
  remain. Deleting an agent user is `RESTRICT`ed — reassign their fields first.
- **Password policy**: minimum 8 characters, bcrypt with 10 salt rounds. No
  email-verification flow.
- **Timezone**: server uses system time. `days` are integer UTC-ish day diffs,
  which is accurate enough for agronomy cadence.

## 10. What I Would Add With More Time

- **Per-field photo uploads** on each update (S3 or similar) so observations
  include visual evidence from the ground.
- **SMS/WhatsApp alerts** when a field transitions to At Risk, aimed at
  low-bandwidth field agents.
- **Weather integration**: pull rainfall and temperature for each field's
  location and surface anomalies alongside status.
- **Audit log & soft deletes**: admin actions (reassignment, deletion) should
  leave a trail, and fields should be recoverable for a grace period.
