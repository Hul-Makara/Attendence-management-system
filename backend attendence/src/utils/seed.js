require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const Role = require('../models/Role');
const User = require('../models/User');
const ClassGroup = require('../models/ClassGroup');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Parent = require('../models/Parent');
const ParentStudent = require('../models/ParentStudent');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB. Starting seed...');

    // Clear all collections
    await Promise.all([
      Role.deleteMany({}),
      User.deleteMany({}),
      ClassGroup.deleteMany({}),
      Student.deleteMany({}),
      Teacher.deleteMany({}),
      Parent.deleteMany({}),
      ParentStudent.deleteMany({}),
      Subject.deleteMany({}),
      Attendance.deleteMany({}),
      LeaveRequest.deleteMany({}),
    ]);
    console.log('Cleared all collections.');

    // 1. Create Roles
    const adminRole = await Role.create({ roleName: 'Admin', roleDescription: 'Full system administrator access' });
    const teacherRole = await Role.create({ roleName: 'Teacher', roleDescription: 'Can mark and manage attendance' });
    const studentRole = await Role.create({ roleName: 'Student', roleDescription: 'Can view own attendance and submit leave' });
    const parentRole = await Role.create({ roleName: 'Parent', roleDescription: 'Can view child attendance' });
    console.log('Created 4 Roles');

    // 2. Create Users
    const pw = await bcrypt.hash('Password123!', 10);

    const adminUser = await User.create({ username: 'admin', email: 'admin@school.com', password: pw, role: adminRole._id });
    const teacherUser = await User.create({ username: 'teacher_dara', email: 'dara@school.com', password: pw, role: teacherRole._id });
    const studentUser = await User.create({ username: 'student_sophea', email: 'sophea@school.com', password: pw, role: studentRole._id });
    const parentUser = await User.create({ username: 'parent_bopha', email: 'bopha@school.com', password: pw, role: parentRole._id });
    console.log('Created 4 Users');

    // 3. Create Class Groups
    const class12A = await ClassGroup.create({ groupName: 'Class 12A', description: 'Science stream grade 12' });
    const class12B = await ClassGroup.create({ groupName: 'Class 12B', description: 'Arts stream grade 12' });
    console.log('Created 2 Class Groups');

    // 4. Create Teacher profile
    const teacherDoc = await Teacher.create({
      user: teacherUser._id,
      name: 'Mr. Dara',
      phone: '+85598765432',
    });
    console.log('Created Teacher profile');

    // 5. Create Subject
    const mathSubject = await Subject.create({
      subjectName: 'Mathematics',
      subjectCode: 'MATH101',
      description: 'Basic algebra and calculus',
      teacherId: teacherDoc._id,
      credit: 3,
      classGroups: [class12A._id],
      sessions: [
        { days: ['Monday', 'Wednesday'], startTime: '08:00', endTime: '09:30', room: 'Room A1' },
      ],
    });

    // Update teacher with subject ref
    teacherDoc.subject = mathSubject._id;
    await teacherDoc.save();
    console.log('Created Subject: Mathematics');

    // 6. Create Student profile
    const studentDoc = await Student.create({
      user: studentUser._id,
      firstName: 'Sophea',
      lastName: 'Chan',
      dob: new Date('2005-03-15'),
      gender: 'female',
      phone: '+85512345678',
      classGroup: class12A._id,
    });
    console.log('Created Student profile');

    // 7. Create Parent profile & link
    const parentDoc = await Parent.create({
      user: parentUser._id,
      parentName: 'Mrs. Bopha',
      phone: '+85512000000',
    });
    await ParentStudent.create({ parentId: parentDoc._id, studentId: studentDoc._id });
    console.log('Created Parent profile & linked to student');

    // 8. Create sample Attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await Attendance.create({
      student: studentDoc._id,
      subject: mathSubject._id,
      date: today,
      checkInTime: new Date(today.getTime() + 8 * 60 * 60 * 1000), // 08:00
      status: 'present',
      markedByTeacher: teacherDoc._id,
      note: 'On time',
    });
    console.log('Created today\'s attendance record');

    // 9. Create sample Leave Request
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    await LeaveRequest.create({
      student: studentDoc._id,
      fromDate: tomorrow,
      toDate: tomorrow,
      reason: 'Medical appointment',
      status: 'pending',
    });
    console.log('Created sample leave request');

    console.log('\n--- Seed completed successfully! ---');
    console.log('Login credentials (all password: Password123!):');
    console.log('  Admin:   username=admin');
    console.log('  Teacher: username=teacher_dara');
    console.log('  Student: username=student_sophea');
    console.log('  Parent:  username=parent_bopha');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
