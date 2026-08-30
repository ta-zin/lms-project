# LMS — Learning Management System

A full-stack LMS built with Next.js and Strapi.

## Tech Stack

Next.js 16.3.3 • React 19 • TypeScript • Tailwind CSS 4 • Strapi 5 • Node.js 22 • Vercel • Railway

## Roles

- **Admin** — manages users, roles, all courses, lessons, and blog posts
- **Content Manager** — course, lesson, quiz, and blog management **(not completed)**
- **Instructor** — manages own courses, lessons, quizzes, and student progress
- **Student** — browses courses, enrolls, studies lessons, tracks progress, and takes quizzes

## Completed Features

- Authentication, registration, login, role-based dashboards, and protected routes
- New users default to **Student**
- Admin user management, role filtering, role changes, and account deletion
- Admin can create, edit, and delete **all courses and lessons**
- Course–instructor assignment and recent-activity ordering
- Student enrollment, lesson viewing, lesson completion, and persistent progress tracking
- Course progress percentage per student
- Blog create/edit/delete with Draft → Published workflow
- Admin blog reading, publishing, and unpublishing
- Quiz creation, editing, deletion, and student quiz flow
- Basic admin platform statistics

## Run Locally

Download the ZIP from GitHub and extract it, **or** clone the repository:

```bash
git clone <your-github-repository-url>
cd <project-folder>
```

### Backend

```bash
cd backend
npm install
npm run develop
```

### Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:1337/api
```

Then open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:1337`  
Strapi Admin: `http://localhost:1337/admin`

## Deployment

- **Frontend:** Vercel
- **Backend:** Railway

Configure production environment variables separately.