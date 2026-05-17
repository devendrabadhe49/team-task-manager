Team Task Manager

A full-stack task management app for teams to create projects, assign work, track status, and manage access with Admin and Member roles.

Features
Email/password authentication with signup and login
Role-based access control
Admin: create projects, manage project details, manage team members, create and assign tasks
Member: view shared projects and update status for tasks assigned to them
Project and team management
Task creation, assignment, due dates, and status tracking
Dashboard with project counts, task pipeline, and overdue task visibility
REST API routes built with Next.js App Router
Prisma ORM with a PostgreSQL database
Tech Stack
Next.js 16
React 19
TypeScript
Tailwind CSS 4
NextAuth
Prisma
PostgreSQL (Neon)
Role Rules
The first account created becomes ADMIN
Every account created after that becomes MEMBER
Admins can add members to projects and assign tasks to the project owner or project members
Members can only update the status of tasks assigned to them
API Routes
POST /api/auth/signup
GET|POST /api/auth/[...nextauth]
GET /api/users
GET|POST /api/projects
GET|PUT|DELETE /api/projects/:id
PATCH /api/projects/:id/members
GET|POST /api/tasks
GET|PUT|DELETE /api/tasks/:id
Local Setup
1. Install dependencies
npm install
2. Create your env file
cp .env.example .env
3. Add environment variables
DATABASE_URL="your_postgresql_database_url"
NEXTAUTH_SECRET="your_secret_key"
NEXTAUTH_URL="http://localhost:3000"
4. Push Prisma schema
npx prisma db push
5. Start development server
npm run dev
6. Open app
http://localhost:3000
Environment Variables
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
Deployment

This project is deployed on Vercel using Neon PostgreSQL database.

Live Demo
https://team-task-manager-phi-ten.vercel.app
GitHub Repository
https://github.com/devendrabadhe49/team-task-manager
Demo Flow Suggestion
Sign up as the first user to become ADMIN
Create a second account that becomes MEMBER
Log in as admin and create a project
Add the member to the project
Create tasks and assign one to the member
Log in as the member and update task status
Show the dashboard and project board
Author

Devendra Badhe