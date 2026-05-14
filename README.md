# Team Task Manager

A full-stack task management app for teams to create projects, assign work, track status, and manage access with `Admin` and `Member` roles.

## Features

- Email/password authentication with signup and login
- Role-based access control
  - `Admin`: create projects, manage project details, manage team members, create and assign tasks
  - `Member`: view shared projects and update status for tasks assigned to them
- Project and team management
- Task creation, assignment, due dates, and status tracking
- Dashboard with project counts, task pipeline, and overdue task visibility
- REST API routes built with Next.js App Router
- Prisma ORM with a SQL database

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- NextAuth
- Prisma
- SQLite

## Role Rules

- The first account created becomes `ADMIN`
- Every account created after that becomes `MEMBER`
- Admins can add members to projects and assign tasks to the project owner or project members
- Members can only update the status of tasks assigned to them

## API Routes

- `POST /api/auth/signup`
- `GET|POST /api/auth/[...nextauth]`
- `GET /api/users`
- `GET|POST /api/projects`
- `GET|PUT|DELETE /api/projects/:id`
- `PATCH /api/projects/:id/members`
- `GET|POST /api/tasks`
- `GET|PUT|DELETE /api/tasks/:id`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create your env file:

```bash
cp .env.example .env
```

3. Start the app:

```bash
npm run dev
```

4. Open:

```bash
http://localhost:3000
```

## Environment Variables

Use `.env.example` as a template:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Railway Deployment

This project is set up to deploy on Railway with a persistent SQLite volume.

1. Push the repo to GitHub.
2. Create a new Railway project from the GitHub repo.
3. Add a persistent volume and mount it at `/data`.
4. Set these Railway environment variables:

```env
DATABASE_URL="file:/data/dev.db"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="https://your-railway-domain.up.railway.app"
```

5. Railway will run:

```bash
npm run start
```

The start script runs `prisma db push` before `next start`, so the database schema is created automatically on deploy.

## Submission Checklist

- Live URL: `add your Railway URL here`
- GitHub Repo: `add your GitHub repo URL here`
- README: included
- Demo Video: record a 2-5 minute walkthrough showing:
  - signup/login
  - admin creating a project
  - admin adding members
  - admin creating and assigning tasks
  - member updating task status
  - dashboard and overdue tasks

## Demo Flow Suggestion

1. Sign up as the first user to become `ADMIN`
2. Create a second account that becomes `MEMBER`
3. Log in as admin and create a project
4. Add the member to the project
5. Create tasks and assign one to the member
6. Log in as the member and update that task status
7. Show the dashboard and project board
