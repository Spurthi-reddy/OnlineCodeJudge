# Backend - Online Code Judge

This folder contains the Express backend server for the Online Code Judge platform.

## Features

- REST API for problems, submissions, authentication, and AI helpers
- MongoDB database connection
- Automatic seeding of starter users and sample problems when the database is empty
- Judge0 / Gemini integrations for code execution and AI feedback

## Requirements

- Node.js 18+
- MongoDB running locally or a MongoDB connection string

## Environment variables

Create a `.env` file in `backend/` with any of the following values as needed:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/online-code-judge
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development
# Optional AI/code execution integration values
JUDGE0_API_URL=
RAPIDAPI_JUDGE0_KEY=
RAPIDAPI_JUDGE0_HOST=judge0-ce.p.rapidapi.com
GEMINI_API_KEY=
```

## Scripts

From the `backend/` folder:

```bash
npm install
npm run dev
npm start
```

- `npm run dev` starts the server using `nodemon`.
- `npm start` runs the server with `node`.

## Local development

Open a terminal in `backend/` and run:

```bash
npm install
npm run dev
```

The backend will listen on `http://localhost:5000` by default.

## Notes

- The backend will seed demo users and problems only when the database is empty.
- Authentication tokens are signed with `JWT_SECRET`. If not provided, a local development key is used.
- CORS is enabled for `http://localhost:5173` and `http://127.0.0.1:5173` by default.
