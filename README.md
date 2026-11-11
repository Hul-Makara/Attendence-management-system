# 📚 Student Attendance Management System

A full-stack web application designed for educational institutions to manage student records, classes, subjects, attendance, and user accounts with role-based access control (**Admin** and **Teacher**).

---

## 🚀 Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Angular (v22 / Standalone Components), TypeScript, RxJS, FontAwesome, XLSX |
| **Backend** | Node.js, Express.js (v5), MongoDB, Mongoose (v8), Multer, JWT, bcryptjs |
| **Styling & Fonts** | Custom CSS Design System, Google Fonts (*Inter* and *Kantumruy Pro* for Khmer script) |
| **Ports** | Backend: `http://localhost:4000` \| Frontend: `http://localhost:4200` |

---

## 🛠️ Features & Modules

### 1. 🔐 Authentication & Role Management
- JWT Bearer Token authentication with 30-day validity.
- Role-based routing guards:
  - **Admin**: Full access across all modules (Students, Classes, Subjects, Attendance, Users & Roles).
  - **Teacher**: Record attendance, view assigned students, classes, and subjects.
- Quick 1-click demo login buttons on the login screen.

### 2. 👨‍🎓 Student Management
- Full CRUD operations with instant search & filter (by English/Khmer name, phone, class, and gender).
- **Excel Bulk Import**: Upload `.xlsx` files with columns `studentname_en`, `studentname_kh`, `gender`, `class`.
  - Automatically creates new classes if they don't already exist.
  - Interactive table preview of parsed rows before saving to the database.
  - Built-in button to download a sample template.
- **Excel Export**: Export student list to `.xlsx` with selectable columns (ID, English Name, Khmer Name, Gender, Class, Created Date).

### 3. 📋 Attendance Recording
- Daily and Weekly table views by class and date.
- 4 attendance status options:
  - **Present**
  - **Absent**
  - **Late**
  - **Permission** (Excused / Approved Leave)
- **Daily View**:
  - Live summary badges (Total in Class, Present, Absent, Late, Permission, % Attendance Rate).
  - 1-click **"Mark All Present"** shortcut.
  - Inline per-student note input.
- **Weekly View**:
  - Mon–Fri attendance matrix per student with status badges and weekly present counts.

### 4. 🏫 Class Management
- Create, view, update, and delete class groups (e.g., Grade 10A, Class 12B).
- Automatic duplicate class name prevention.
- Live enrolled student count per class.

### 5. 📖 Subject Management
- Create, view, update, and delete subjects with credit units and descriptions.
- Assign subjects to class groups and teachers.

### 6. 👥 User Management (Admin Only)
- Manage Admin and Teacher accounts.
- One-click account activation / deactivation toggle.
- Create new accounts with role assignment.

---

## 🏃 How to Run the Project

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) running locally on `mongodb://localhost:27017`

### 2. Backend Setup
```powershell
cd "backend attendence"
npm install
npm run seed       # (Optional) Seed sample Admin, Teacher, Classes, Students, and Subjects
npm start          # Starts server on http://localhost:4000
```

### 3. Frontend Setup
```powershell
cd frontend
npm install
npm start          # Starts Angular dev server on http://localhost:4200
```

Open your browser to `http://localhost:4200`.

---

## 🔑 Demo Credentials

| Role | Username | Password |
|---|---|---|
| **Admin** | `admin` | `Password123!` |
| **Teacher** | `teacher_dara` | `Password123!` |
| **Student** | `student_sophea` | `Password123!` |
| **Parent** | `parent_bopha` | `Password123!` |
