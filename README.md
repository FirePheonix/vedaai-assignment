# VedaAI

VedaAI is an AI-powered assignment platform built for teachers and students.
Teachers create exam papers in seconds by describing a topic — the AI generates structured question papers with an answer key.
Papers are published to classes, students join with a short code, upload their handwritten answer sheets, and get their results back with teacher feedback.
The platform handles the full lifecycle: paper generation, class management, student submissions, grading, and analytics.
Built on Next.js, Express, MongoDB, BullMQ, and OpenAI — with real-time progress streaming via Socket.IO and end-to-end type safety via tRPC.
Deployed on Vercel (frontend) and Railway (backend), with Clerk for authentication.

---

## Local setup

### Prerequisites
- Node.js 18+
- A [MongoDB Atlas](https://cloud.mongodb.com) free cluster
- An [Upstash Redis](https://upstash.com) free database (use the **TCP** URL, not REST)
- An [OpenAI](https://platform.openai.com) API key
- A [Clerk](https://clerk.com) application (get Secret Key + Webhook Secret)
- A [Cloudinary](https://cloudinary.com) free account

### Backend

```bash
cp backend/.env.example backend/.env
# Fill in: MONGODB_URI, REDIS_URL, OPENAI_API_KEY,
#          CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET,
#          CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cd backend && npm install && npm run dev
```

Server runs at `http://localhost:4000` — Bull Board at `http://localhost:4000/admin/queues`.

### Frontend

```bash
cd frontend && npm install && npm run dev
```

App runs at `http://localhost:3000`.

> **Required Clerk step:** In your Clerk Dashboard → Configure → Sessions → Customize session token, add:
> ```json
> { "metadata": "{{user.public_metadata}}" }
> ```
> This embeds the user role in the JWT so the middleware can read it without a database call.

---

## Running tests

Backend tests use an in-memory MongoDB — no Atlas or Redis needed.

```bash
cd backend && npm test
```

Expected output:
```
Test Files  2 passed (2)
      Tests  13 passed (13)
```

Watch mode:
```bash
npm run test:watch
```

The frontend has no automated test suite — run `npm run lint` to check for type and lint errors.

---

## Architecture overview

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js 16 frontend (Vercel)                               │
│  - Clerk auth (JWT + publicMetadata role)                   │
│  - tRPC client  →  type-safe API calls                      │
│  - Zustand store for assignment flow state                  │
│  - @react-pdf/renderer for client-side PDF export           │
│  - Socket.IO client for live job progress                   │
└────────────────────────┬────────────────────────────────────┘
                         │ tRPC over HTTP + WebSocket
┌────────────────────────▼────────────────────────────────────┐
│  Express backend (Railway)                                  │
│  - tRPC router (protectedProcedure / teacherProcedure /     │
│    studentProcedure)                                        │
│  - BullMQ worker — AI paper generation jobs                 │
│  - Socket.IO server — streams job progress to browser       │
│  - Multer + Cloudinary — student file uploads               │
│  - Clerk webhook (/webhook/clerk) — syncs users to MongoDB  │
└────────┬────────────────────────────┬───────────────────────┘
         │                            │
   MongoDB Atlas                  Redis (Upstash)
   (documents)                    (BullMQ queue)
         │
   OpenAI GPT-4o
   (paper generation)
```

### Why each technology

| Tool | Role | Why not something simpler |
|------|------|--------------------------|
| **tRPC** | API layer | End-to-end type safety without a separate schema file; the frontend `AppRouter` type import replaces all OpenAPI/REST boilerplate |
| **Zod** | Validation | Shared between tRPC input validators and frontend form schemas; single source of truth for data shape |
| **BullMQ + Redis** | Job queue | OpenAI calls take 5–15 s; pushing them to a queue lets the HTTP response return immediately and the browser poll/stream progress. Using BullMQ here is justified — a timeout hack would break under load |
| **Socket.IO** | Real-time | Pushes `job:progress` and `job:done` events to the exact browser tab that submitted the job, so the loading screen updates live |
| **Zustand** | Client state | Holds the in-flight assignment form data and job result in memory so navigating `/create → /loading/[id] → /paper/[id]` doesn't re-fetch; cleared when the flow ends |
| **Cloudinary** | File storage | Free 25 GB; handles PDF and image variants transparently via `resource_type: raw/image` |
| **Clerk** | Auth | Handles sign-in/sign-up/sessions; `publicMetadata.role` is embedded in the JWT (via a custom JWT template) so the Next.js Edge middleware can read the role without a database call |

---

## Data models

### `User`
Synced from Clerk via webhook on `user.created` / `user.updated`.

| Field | Type | Notes |
|-------|------|-------|
| `clerkId` | string | Unique. Maps to Clerk's `userId` |
| `role` | `"teacher" \| "student" \| null` | Set at onboarding via `trpc.user.setRole` |
| `name` | string | |
| `email` | string | |
| `schoolName` | string? | Teacher fills in at onboarding |

### `Class`
A teacher's classroom that students join with a code.

| Field | Type | Notes |
|-------|------|-------|
| `userId` | string | Owner (teacher's Clerk ID) |
| `name` | string | Display name |
| `joinCode` | string | 6-char alphanumeric, unique. Uses unambiguous charset (no 0/O/1/I) |
| `studentIds` | string[] | Clerk IDs of enrolled students (`$addToSet` on join) |

### `Assignment`
A paper generation job created by a teacher.

| Field | Type | Notes |
|-------|------|-------|
| `userId` | string | Owner (teacher) |
| `title` | string | |
| `subject` | string | |
| `className` | string | e.g. "10th Grade" |
| `dueDate` | Date | |
| `questionTypes` | `{type, count, marks}[]` | e.g. `[{type:"MCQ", count:5, marks:2}]` |
| `sourceIds` | string[] | Vector DB chunk IDs used as context |
| `status` | `"pending" \| "processing" \| "done" \| "failed"` | Updated by the BullMQ worker |
| `paperId` | ObjectId? | Set when generation completes |
| `classId` | ObjectId? | Set when teacher publishes |
| `isPublished` | boolean | Students can only see published assignments |

### `QuestionPaper`
The AI-generated output linked 1-to-1 with an Assignment.

| Field | Type | Notes |
|-------|------|-------|
| `assignmentId` | ObjectId | |
| `schoolName` | string | |
| `subject` | string | |
| `className` | string | |
| `timeAllowed` | string | e.g. "45 minutes" |
| `maximumMarks` | number | |
| `totalQuestions` | number | |
| `sections` | `Section[]` | Each has title, questionType, instruction, marksPerQuestion, questions |
| `answerKey` | `{questionId, answer}[]` | Stored but only shown to teachers |

### `Submission`
A student's uploaded answer sheet for a published assignment.

| Field | Type | Notes |
|-------|------|-------|
| `assignmentId` | ObjectId | |
| `paperId` | ObjectId | |
| `studentId` | string | Clerk ID |
| `studentName` | string | Denormalized for display |
| `fileUrl` | string | Cloudinary URL |
| `fileType` | `"pdf" \| "image"` | |
| `status` | `"submitted" \| "graded"` | |
| `totalMarksAwarded` | number? | Set by teacher |
| `maxMarks` | number | Copied from paper at submission time |
| `feedback` | string? | Teacher's written feedback |
| `submittedAt` | Date | |
| `gradedAt` | Date? | |

Compound unique index: `{ assignmentId, studentId }` — one submission per student per paper.

---

## User flows

### Teacher flow

```
Sign up → /onboarding  (choose "Teacher", optional school name)
       → /home         (dashboard — recent assignments, quick stats)
       → /create       (multi-step form: title, subject, class, question types)
       → /loading/[id] (live progress: retrieving → generating → validating → saving)
       → /paper/[id]   (review paper, edit questions, download as PDF)
                       (Publish button → choose class → students can now see it)
       → /submissions/[assignmentId]  (list all students who submitted)
       → /grade/[submissionId]        (PDF/image viewer + marks + feedback form)
       → /library      (all generated papers, search by title/subject)
       → /classes      (manage classes, copy join codes, see student count)
       → /analytics    (overview of assignments/submissions)
```

### Student flow

```
Sign up → /onboarding  (choose "Student")
       → /student/join (enter 6-char class code)
       → /student/home (dashboard — published assignments, status badges)
       → /student/paper/[assignmentId]  (read-only paper view + upload answer sheet)
       → /student/home (card shows "Submitted" while awaiting grade)
       → /student/results/[submissionId] (marks / maxMarks, percentage, teacher feedback)
```

### Role gates (middleware)

Students are blocked from `/create`, `/analytics`, `/assignments`, `/paper/*`, `/submissions/*`, `/grade/*`, `/library/*`, `/toolkit/*` — redirected to `/student/home`.

Teachers are blocked from `/student/*` — redirected to `/home`.

Unauthenticated users anywhere except `/`, `/sign-in`, `/sign-up` are redirected to sign-in by Clerk.

Users with no role (fresh sign-up before onboarding) are redirected to `/onboarding`.

> **Important setup step:** For role routing to work, the Clerk JWT template must include publicMetadata. In your Clerk Dashboard → Configure → Sessions → Customize session token, add:
> ```json
> { "metadata": "{{user.public_metadata}}" }
> ```

---

## tRPC routers

| Router | Procedures | Who can call |
|--------|-----------|--------------|
| `user` | `getMe`, `setRole` | `protectedProcedure` |
| `assignment` | `create`, `list`, `getById`, `publish`, `listForStudent` | `teacherProcedure` / `studentProcedure` |
| `paper` | `getById`, `update`, `getByAssignmentId` | `protectedProcedure` |
| `class` | `list`, `create`, `delete`, `joinByCode`, `getStudents` | `teacherProcedure` / `studentProcedure` |
| `submission` | `create`, `getMySubmissions`, `getForAssignment`, `getById`, `grade` | `studentProcedure` / `teacherProcedure` |

### Procedure middleware chain

```
publicProcedure
  └── protectedProcedure   (Clerk JWT required — throws UNAUTHORIZED)
        ├── teacherProcedure  (MongoDB User.role === "teacher" — throws FORBIDDEN)
        └── studentProcedure  (MongoDB User.role === "student" — throws FORBIDDEN)
```

---

## HTTP routes (non-tRPC)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | Liveness check |
| `POST` | `/upload/file` | Teacher uploads source material (PDF/image) → Cloudinary, chunked for vector DB |
| `POST` | `/upload/submission` | Student uploads answer sheet → Cloudinary |
| `POST` | `/webhook/clerk` | Syncs `user.created` / `user.updated` from Clerk (svix signature verified) |
| `GET` | `/admin/queues` | Bull Board — BullMQ queue monitor (dev only) |

---

## Paper generation pipeline

1. Teacher submits form → `assignment.create` → BullMQ job enqueued → socket room joined
2. Worker picks up job:
   - `retrieving` — fetches relevant source chunks from vector DB
   - `generating` — calls OpenAI with subject/class/question-type prompt + retrieved context
   - `validating` — parses and validates the JSON response against the paper schema
   - `saving` — writes `QuestionPaper` doc, updates `Assignment.status = "done"`, sets `paperId`
3. Socket emits `job:done` with `paperId` → browser navigates to `/paper/[id]`

---

## Deployment

| Service | Platform | Notes |
|---------|----------|-------|
| Frontend | Vercel | Root: `frontend/`, Framework: Next.js |
| Backend | Railway | Root: `backend/`, start: `node dist/index.js` |
| Database | MongoDB Atlas | Free M0 cluster |
| Queue/Cache | Upstash Redis | Free tier, TCP URL |
| File storage | Cloudinary | Free 25 GB |
| Auth | Clerk | Configure JWT template (see above) |
