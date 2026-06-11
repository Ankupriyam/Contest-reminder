# ContestSync

ContestSync automatically synchronizes competitive programming contests from major platforms (LeetCode, Codeforces, CodeChef, and AtCoder) directly into your Google Calendar. It sets up automatic reminders and features a self-healing reconciliation sync loop so your calendar is always correct.

## Features

- **Multi-Platform Support**: Fetch upcoming contests from LeetCode, Codeforces, CodeChef, and AtCoder.
- **Google Calendar Integration**: Automatically provisions a dedicated "Competitive Programming Contests" calendar in your Google account.
- **Self-Healing & Reconciled Sync Engine**: 
  - Prevents duplicate calendar events using compound index validations (`userId` + `contestId`).
  - Automatically checks Google Calendar. If a synced event is manually deleted from your calendar, the engine recreates it on the next sync run.
  - Reconciles manual overrides. If you modify event details directly on Google Calendar, the engine overwrites them to match the database source of truth.
  - Cleans up orphaned events and deletes cancelled rounds.
- **Real-Time Analytics**: Full 30-day sync activity graphs and sync health indicators (failure rates, lag) compiled dynamically from live MongoDB aggregation query runs.
- **Customizable Reminders**: Set custom alert times (e.g., 15 minutes before, 1 hour before) that sync directly as Google Calendar notifications.
- **Hardened Authentication**: 
  - Google OAuth 2.0 with rotating JWTs securely stored in secure, HttpOnly cookies.
  - AES-256-GCM encryption for stored Google refresh tokens utilizing a random 12-byte initialization vector (IV) per encryption, complete with legacy AES-CBC fallback.
  - Sanitized database query structures protecting endpoints against ReDoS (Regular Expression Denial of Service).

## Tech Stack

### Frontend
- **Framework**: React with Vite
- **Routing**: TanStack Router
- **State & Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS, Radix UI primitives, Lucide Icons

### Backend
- **Framework**: Express.js (TypeScript)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT & Google OAuth 2.0 (googleapis)
- **Scheduling**: node-cron for background polling

## Prerequisites

Before running ContestSync locally, ensure you have the following provisioned:

1. **Node.js** (v18+)
2. **MongoDB Database** (Local or Atlas)
3. **Google Cloud Console Project**:
   - Enable the Google Calendar API.
   - Configure OAuth 2.0 Credentials (Client ID & Secret).
   - Add authorized redirect URIs (e.g., `http://localhost:3000/api/auth/google/callback`).
4. **CLIST.by API Credentials**:
   - Register an account on [CLIST](https://clist.by/) to obtain your Username and API Key.

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/contest-reminder.git
cd contest-reminder
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory using the provided example:

```bash
cp .env.example .env
```

Ensure you populate all variables in `server/.env`:
- `MONGODB_URI`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `CLIST_USERNAME`
- `CLIST_API_KEY`
- `JWT_SECRET` (Must be secure, e.g., 32+ chars)
- `JWT_REFRESH_SECRET` (Must be secure, e.g., 32+ chars)
- `ENCRYPTION_KEY` (64 character hex string representing a 256-bit key)
- `ENCRYPTION_IV` (Optional. Legacy 32 character hex string for backward compatibility decryption)

Start the development server:

```bash
npm run dev
```

The backend will run on `http://localhost:3000`.

### 3. Frontend Setup

In a new terminal window, navigate to the root directory:

```bash
npm install
```

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:8080`.

## Architecture Overview

1. **Background Jobs**: The backend runs a `node-cron` job that periodically pulls data from the CLIST API and caches upcoming contests in MongoDB.
2. **Sync Engine**: The sync engine runs every hour, fetching configured platforms, verifying live Google Calendar states, recreating manually deleted calendar entries, and aligning event names and start times.
3. **Symmetric Encryption**: Google refresh tokens are stored symmetrically encrypted with GCM. Each record preserves its own `iv` and `authTag`.
4. **Authentication Flow**: The user signs in via Google OAuth. The backend provisions HttpOnly cookies for a seamless, secure session without exposing access tokens directly to the frontend JavaScript.

## Testing

The backend utilizes `vitest` for unit testing the core synchronization engine and crypto utilities.

```bash
cd server
npm run test
```

## License

MIT License
