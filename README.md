# ContestSync

ContestSync automatically synchronizes competitive programming contests from major platforms (LeetCode, Codeforces, CodeChef, and AtCoder) directly into your Google Calendar. It sets up automatic reminders so you never miss a contest again.

## Features

- **Multi-Platform Support**: Fetch upcoming contests from LeetCode, Codeforces, CodeChef, and AtCoder.
- **Google Calendar Integration**: Automatically provisions a dedicated "Contests · ContestSync" calendar in your Google account.
- **Idempotent Sync Engine**: Prevents duplicate calendar events. Intelligently updates existing events if contest times or names change, and removes events for cancelled contests.
- **Customizable Reminders**: Set custom alert times (e.g., 15 minutes before, 1 hour before) that sync directly as Google Calendar notifications.
- **Secure Authentication**: Uses Google OAuth 2.0 with rotating JWTs securely stored in HttpOnly cookies.

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
- `ENCRYPTION_KEY` (64 character hex string)
- `ENCRYPTION_IV` (32 character hex string)

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
2. **Sync Engine**: Every hour, the sync engine iterates through users, fetching their configured platforms, and pushes new or updated contests via the Google Calendar API.
3. **Authentication Flow**: The user signs in via Google OAuth. The backend provisions HttpOnly cookies for a seamless, secure session without exposing access tokens directly to the frontend JavaScript.

## Testing

The backend utilizes `vitest` for unit testing the core synchronization engine.

```bash
cd server
npm run test
```

## License

MIT License
