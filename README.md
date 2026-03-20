# VedaAI

AI-powered question paper generator for teachers.

---

## Running tests

Tests live in the backend. They use an in-memory MongoDB so you don't need Atlas running, and Redis is mocked — just install dependencies and go.

```bash
cd backend
npm install
npm test
```

That's it. You should see something like:

```
Test Files  2 passed (2)
      Tests  13 passed (13)
```

If you want to watch for changes while working on something:

```bash
npm run test:watch
```

---

## Running the backend locally

You'll need a `.env` file first. Copy the example and fill in your values:

```bash
cp backend/.env.example backend/.env
```

The two things you actually need are:
- `MONGODB_URI` — get a free cluster from [MongoDB Atlas](https://cloud.mongodb.com)
- `REDIS_URL` — get a free database from [Upstash](https://upstash.com) (use the TCP URL, not REST)

Then:

```bash
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:4000`. You can check it's alive at `/health`.

Bull Board (job queue monitor) is at `http://localhost:4000/admin/queues` — useful for seeing what's happening when papers are being generated.

---

## Running the frontend locally

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:3000`.
