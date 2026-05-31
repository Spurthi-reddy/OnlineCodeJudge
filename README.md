# Online Code Judge

This repository is a full-stack online coding judge platform with separate frontend and backend packages.

## Project structure

- `backend/` — Express/MongoDB API server, authentication, problem seeding, submission handling, AI services.
- `frontend/` — React/Vite user interface for login, problem browsing, editor, and submissions.

## Getting started

From the root folder:

```bash
npm install
npm run install:all
```

## Development

Start both servers in parallel:

```bash
npm run dev
```

Alternatively, start individually:

```bash
npm run dev:server
npm run dev:client
```

## Build

Build the frontend or backend separately:

```bash
npm run build:client
npm run build:server
```

## Notes

- The backend automatically seeds starter users and sample problems when the database is empty.
- The frontend defaults to `http://localhost:5173`.
- The backend defaults to `http://localhost:5000`.

For more details, see `backend/README.md` and `frontend/README.md`.
