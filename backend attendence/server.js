require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const studentRoutes = require('./src/routes/student.routes');
const teacherRoutes = require('./src/routes/teacher.routes');
const parentRoutes = require('./src/routes/parent.routes');
const parentStudentRoutes = require('./src/routes/parentStudent.routes');
const subjectRoutes = require('./src/routes/subject.routes');
const classGroupRoutes = require('./src/routes/classGroup.routes');
const attendanceRoutes = require('./src/routes/attendance.routes');
const leaveRequestRoutes = require('./src/routes/leaveRequest.routes');
const roleRoutes = require('./src/routes/role.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.json({ success: true, message: 'Attendance API is healthy & connected to DB' });
  } catch {
    res.status(500).json({ success: false, message: 'DB unavailable' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/parent-students', parentStudentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/class-groups', classGroupRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave-requests', leaveRequestRoutes);
app.use('/api/roles', roleRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = status >= 500 ? 'Internal Server Error' : err.message;
  if (status >= 500) console.error('[ERROR]', err);
  res.status(status).json({ success: false, message });
});

// Connect to DB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });
