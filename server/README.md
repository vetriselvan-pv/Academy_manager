# Viva Academy Server

Backend API for Viva Academy — a multi-branch institution offering courses such as Yoga, Dance,
Music, Abacus, 10th Tuition and Hindi Classes. Built with Fastify, TypeScript and MongoDB.

## Domain model

- **Branch** — a physical location of the institution.
- **Course** — an offering (category: `YOGA`, `DANCE`, `MUSIC`, `ABACUS`, `TUITION_10TH`, `HINDI_CLASSES`, `OTHER`).
- **User** — base account (`STUDENT`, `TEACHER`, `SUPER_ADMIN`), modeled with Mongoose discriminators:
  - **Student** — belongs to exactly one `Branch`, can hold multiple `Enrollment`s across courses.
  - **Teacher** — assigned to one or more `Branch`es, has a `designation`
    (`INSTRUCTOR` / `SENIOR_INSTRUCTOR` / `COORDINATOR` / `ACADEMIC_HEAD`) which seeds a default
    `permissions` set (view/manage students, view/manage enrollments, view reports, manage course
    content, manage branch teachers). Permissions can be customized per teacher by a super admin.
- **Enrollment** — links a student, course, branch and (optionally) an assigned teacher. A student
  can have several active enrollments at once (one per course).

## Access control

- **SUPER_ADMIN** — full access to everything.
- **TEACHER** — scoped to their assigned branches; specific actions additionally require the
  matching permission from their designation (e.g. `MANAGE_STUDENTS`, `MANAGE_ENROLLMENTS`).
- **STUDENT** — can only view/update their own profile and manage their own enrollments.

Auth is JWT-based: a short-lived access token (`Authorization: Bearer <token>`) plus a rotating
refresh token persisted in the `RefreshToken` collection so it can be revoked on logout.

## Setup

```bash
npm install
cp .env.example .env   # then edit MONGO_URI / secrets as needed
```

Make sure MongoDB is running locally (or point `MONGO_URI` at your instance), then:

```bash
npm run seed:admin   # creates the SUPER_ADMIN account from .env
npm run dev          # starts the API on http://localhost:4000
```

Other scripts: `npm run build` (compile to `dist/`), `npm start` (run compiled output),
`npm run lint` (type-check only, no emit).

## API overview

All routes are prefixed with `/api`. `Authorization: Bearer <accessToken>` is required unless noted.

| Method | Path | Access |
| --- | --- | --- |
| POST | `/auth/register/student` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/refresh` | Public (valid refresh token) |
| POST | `/auth/logout` | Public (valid refresh token) |
| POST | `/auth/change-password` | Any authenticated user |
| GET | `/me` | Any authenticated user — own profile |
| GET/POST/PATCH/DELETE | `/branches` | Read: any user. Write: `SUPER_ADMIN` |
| GET/POST/PATCH/DELETE | `/courses` | Read: any user. Write: `SUPER_ADMIN` or `TEACHER` with `MANAGE_COURSE_CONTENT` |
| GET/POST/PATCH/DELETE | `/teachers` | `SUPER_ADMIN`, or `TEACHER` (read own branch colleagues; manage requires `MANAGE_BRANCH_TEACHERS`) |
| GET/PATCH/DELETE | `/students` | `SUPER_ADMIN`; `TEACHER` with `VIEW_STUDENTS`/`MANAGE_STUDENTS` scoped to their branches; `STUDENT` limited to self |
| GET/POST/PATCH/DELETE | `/enrollments` | `SUPER_ADMIN`; `TEACHER` with `VIEW_ENROLLMENTS`/`MANAGE_ENROLLMENTS` scoped to their branches; `STUDENT` can enroll/view/cancel their own |
| GET | `/menus` | Any authenticated user — returns the nav menu tree filtered to what their role/permissions allow |

`GET /health` is unauthenticated and used for liveness checks.

## Menu mapping

`GET /api/menus` returns the navigation tree (`src/config/menu.ts`) filtered for the caller:
`SUPER_ADMIN` always gets the full tree; `TEACHER`/`STUDENT` are filtered by each item's `roles`
and (for teachers) `permissions`. A parent item with no restriction of its own still appears if at
least one child is visible (e.g. "Courses" stays visible to everyone, but its "Manage Courses"
child only shows for a `TEACHER` with `MANAGE_COURSE_CONTENT`). To add a new menu entry, add it to
`MENU_TREE` — no route or controller changes needed.
