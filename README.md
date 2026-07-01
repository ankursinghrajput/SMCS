# SMCS — Sanjeev Memorial Center School

A full-stack web application for managing students, faculty, attendance, marks, notices, and holidays — with role-based dashboards for admins, faculty, and students.

**[Live Demo](https://smcschool.vercel.app)** · **[Backend API](https://smcs-backend-jbxt.onrender.com)**

---

## What is SMCS?

SMCS application gives a single platform to handle day-to-day operations. Admins manage users and academics, faculty record attendance and marks, and students track their own progress — all from role-specific dashboards.

No spreadsheets. No manual paperwork.

---

## Features

| Role | Capabilities |
|------|-------------|
| **Admin** | Manage students, faculty, classes, subjects, holidays, and notice board |
| **Faculty** | Record & update attendance, enter marks, view class data |
| **Student** | View attendance percentage, subject-wise marks, notices, and holidays |

- Role-based access control — JWT-authenticated sessions
- Holiday calendar — with type tagging (national, regional, school, exam)
- Notice board — broadcast announcements to all users
- Attendance tracking — per-subject, per-student, with percentage analytics
- Marks management — subject-wise grades with visual breakdowns
- Responsive UI — works on mobile and desktop
- Dark / light mode

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 19 (Vite) |
| Styling | Vanilla CSS |
| Icons | Lucide React |
| Backend Framework | Express.js 5 |
| Language | JavaScript |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (local or Atlas)

### 1. Clone & install

```bash
git clone https://github.com/ankursinghrajput/SMCS.git
cd SMCS
```

Install dependencies for both frontend and backend:

```bash
# Backend
cd Backend && npm install

# Frontend
cd ../Frontend && npm install
```

### 2. Environment variables

**Backend — `Backend/.env`**

```env
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/mySchool
PORT=7000
JWT_SECRET=your-secret-key

# Seeded admin account
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Admin
ADMIN_CONTACT=9999999999

FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend — `Frontend/.env`**

```env
VITE_API_URL=http://localhost:7000
```

### 3. Run

```bash
# Backend (from /Backend)
npm run dev

# Frontend (from /Frontend)
npm run dev
```

Open http://localhost:5173.

---

## Project Structure

```
SMCS/
├── Backend/
│   ├── src/              # Express app entry
│   ├── Routes/           # API route handlers
│   │   ├── auth.js       # Login / logout
│   │   ├── admin.js      # Admin operations
│   │   ├── student.js    # Student data
│   │   ├── faculty.js    # Faculty data
│   │   ├── attendance.js # Attendance CRUD
│   │   ├── academic.js   # Marks & subjects
│   │   └── holiday.js    # Holiday calendar
│   ├── models/           # Mongoose schemas
│   ├── middlewares/      # Auth & error handlers
│   └── config/           # DB connection
│
└── Frontend/
    └── src/
        ├── pages/
        │   ├── admin/    # Admin-only pages
        │   ├── student/  # Student-only pages
        │   ├── DashboardPage.jsx
        │   ├── NoticesPage.jsx
        │   ├── HolidaysPage.jsx
        │   └── LoginPage.jsx
        ├── components/   # Sidebar, Topbar, modals
        ├── context/      # Auth context
        └── lib/          # API helper
```

---

## Scripts

```bash
# Backend
npm run dev      # Development server (nodemon)
npm start        # Production server

# Frontend
npm run dev      # Development server (Vite)
npm run build    # Production build
npm run lint     # ESLint
```

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch from `main`
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. Make your changes
4. Open a pull request against `main`

**Guidelines**
- Keep new API routes consistent with the existing Express pattern
- All DB access goes through Mongoose models — no raw queries
- Test on both mobile and desktop before submitting

---

## Reporting Issues

Open an issue with:
- Steps to reproduce
- Expected vs actual behaviour
- Browser / OS if relevant

---

## License

ISC — see LICENSE for details.
