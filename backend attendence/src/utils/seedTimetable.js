require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const ClassGroup = require('../models/ClassGroup');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Role = require('../models/Role');

async function seedTimetable() {
  await connectDB();
  console.log('Connected to DB');

  // 1. Ensure class SV50 (E-N) exists
  let sv50 = await ClassGroup.findOne({ groupName: 'SV50 (E-N)' });
  if (!sv50) {
    sv50 = await ClassGroup.create({
      groupName: 'SV50 (E-N)',
      description: 'Evening Class Batch SV50 (E-N) - Semester 2',
    });
    console.log('Created class SV50 (E-N)');
  }

  // Include all classes so subjects can be assigned to SV50 and other classes
  const allClassGroups = await ClassGroup.find();
  const classGroupIds = allClassGroups.map((c) => c._id);

  // 2. Ensure Teacher Role exists
  let teacherRole = await Role.findOne({ roleName: 'Teacher' });
  if (!teacherRole) {
    teacherRole = await Role.create({
      roleName: 'Teacher',
      roleDescription: 'Can mark and manage attendance',
    });
  }

  const defaultPassword = await bcrypt.hash('Password123!', 10);

  // 3. Teachers from timetable: RR, CS, BORA, MAKARA, NARITH, KO, PISA, LIM, ONG
  const teacherList = [
    { name: 'RR', username: 'teacher_rr', phone: '+855 12 111 222' },
    { name: 'CS', username: 'teacher_cs', phone: '+855 12 222 333' },
    { name: 'BORA', username: 'teacher_bora', phone: '+855 12 333 444' },
    { name: 'MAKARA', username: 'teacher_makara', phone: '+855 12 444 555' },
    { name: 'NARITH', username: 'teacher_narith', phone: '+855 12 555 666' },
    { name: 'KO', username: 'teacher_ko', phone: '+855 12 666 777' },
    { name: 'PISA', username: 'teacher_pisa', phone: '+855 12 777 888' },
    { name: 'LIM', username: 'teacher_lim', phone: '+855 12 888 999' },
    { name: 'ONG', username: 'teacher_ong', phone: '+855 12 999 000' },
  ];

  const teacherMap = {};
  for (const t of teacherList) {
    let user = await User.findOne({ username: t.username });
    if (!user) {
      user = await User.create({
        username: t.username,
        email: `${t.username}@school.com`,
        password: defaultPassword,
        role: teacherRole._id,
      });
    }
    let teacher = await Teacher.findOne({ name: t.name });
    if (!teacher) {
      teacher = await Teacher.create({
        user: user._id,
        name: t.name,
        phone: t.phone,
      });
    }
    teacherMap[t.name] = teacher._id;
  }
  console.log('Processed teachers successfully');

  // 4. Subjects from the timetable with exact days, times, and rooms:
  const subjectsData = [
    {
      subjectName: 'WBD II',
      subjectCode: 'WBD201',
      description: 'Web Development II',
      credit: 3,
      teacherId: teacherMap['RR'],
      classGroups: classGroupIds,
      sessions: [
        { days: ['Monday'], startTime: '17:45', endTime: '18:45', room: '2H' },
        { days: ['Friday'], startTime: '18:45', endTime: '19:45', room: '2E' },
      ],
    },
    {
      subjectName: 'MA I',
      subjectCode: 'MA101',
      description: 'Mobile Applications I',
      credit: 3,
      teacherId: teacherMap['KO'],
      classGroups: classGroupIds,
      sessions: [
        { days: ['Monday'], startTime: '18:45', endTime: '19:45', room: '2H' },
        { days: ['Tuesday'], startTime: '19:45', endTime: '20:45', room: '1I' },
      ],
    },
    {
      subjectName: 'J II',
      subjectCode: 'J201',
      description: 'Java Programming II',
      credit: 3,
      teacherId: teacherMap['LIM'],
      classGroups: classGroupIds,
      sessions: [
        { days: ['Monday'], startTime: '19:45', endTime: '20:45', room: '2H' },
        { days: ['Wednesday'], startTime: '18:45', endTime: '19:45', room: '1F' },
      ],
    },
    {
      subjectName: 'SA II',
      subjectCode: 'SA201',
      description: 'System Analysis II',
      credit: 3,
      teacherId: teacherMap['CS'],
      classGroups: classGroupIds,
      sessions: [
        { days: ['Tuesday'], startTime: '17:45', endTime: '18:45', room: '2B' },
        { days: ['Friday'], startTime: '19:45', endTime: '20:45', room: '5D' },
      ],
    },
    {
      subjectName: 'LIN I',
      subjectCode: 'LIN101',
      description: 'Linux Administration I',
      credit: 3,
      teacherId: teacherMap['PISA'],
      classGroups: classGroupIds,
      sessions: [
        { days: ['Tuesday'], startTime: '18:45', endTime: '19:45', room: '1G' },
        { days: ['Thursday'], startTime: '19:45', endTime: '20:45', room: '5A' },
      ],
    },
    {
      subjectName: 'CA I',
      subjectCode: 'CA101',
      description: 'Computer Architecture I',
      credit: 3,
      teacherId: teacherMap['BORA'],
      classGroups: classGroupIds,
      sessions: [
        { days: ['Wednesday'], startTime: '17:45', endTime: '18:45', room: '2E' },
        { days: ['Thursday'], startTime: '17:45', endTime: '18:45', room: '5A' },
      ],
    },
    {
      subjectName: 'CND I',
      subjectCode: 'CND101',
      description: 'Computer Network & Data I',
      credit: 3,
      teacherId: teacherMap['ONG'],
      classGroups: classGroupIds,
      sessions: [
        { days: ['Wednesday'], startTime: '19:45', endTime: '20:45', room: '1G' },
        { days: ['Saturday'], startTime: '19:45', endTime: '20:45', room: '5D' },
      ],
    },
    {
      subjectName: 'O II',
      subjectCode: 'O201',
      description: 'Oracle Database II',
      credit: 3,
      teacherId: teacherMap['MAKARA'],
      classGroups: classGroupIds,
      sessions: [
        { days: ['Thursday'], startTime: '18:45', endTime: '19:45', room: '5A' },
        { days: ['Friday'], startTime: '17:45', endTime: '18:45', room: '2E' },
      ],
    },
    {
      subjectName: 'PP',
      subjectCode: 'PP101',
      description: 'Python Programming / Project Planning',
      credit: 3,
      teacherId: teacherMap['NARITH'],
      classGroups: classGroupIds,
      sessions: [
        { days: ['Saturday'], startTime: '17:45', endTime: '18:45', room: '2E' },
        { days: ['Saturday'], startTime: '18:45', endTime: '19:45', room: '1H' },
      ],
    },
  ];

  for (const s of subjectsData) {
    let existing = await Subject.findOne({ subjectName: s.subjectName });
    if (existing) {
      existing.sessions = s.sessions;
      existing.teacherId = s.teacherId;
      existing.classGroups = s.classGroups;
      existing.description = s.description;
      existing.credit = s.credit;
      await existing.save();
      console.log('Updated subject:', s.subjectName);
    } else {
      await Subject.create(s);
      console.log('Created subject:', s.subjectName);
    }
  }

  console.log('Timetable seed finished successfully!');
  process.exit(0);
}

seedTimetable().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
