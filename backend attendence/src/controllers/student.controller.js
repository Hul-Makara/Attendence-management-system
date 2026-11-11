const Student = require('../models/Student');
const ClassGroup = require('../models/ClassGroup');
const ParentStudent = require('../models/ParentStudent');
const XLSX = require('xlsx');

exports.getStudents = async (req, res) => {
  try {
    const { classGroup, search } = req.query;
    const filter = { isDeleted: { $ne: true } };
    if (classGroup) filter.classGroup = classGroup;
    if (search) {
      filter.$or = [
        { studentname_en: { $regex: search, $options: 'i' } },
        { studentname_kh: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(filter)
      .populate('user', 'username email')
      .populate('classGroup')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBlacklistedStudents = async (req, res) => {
  try {
    const students = await Student.find({ isBlacklisted: true, isDeleted: { $ne: true } })
      .populate('user', 'username email')
      .populate('classGroup');
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'username email')
      .populate('classGroup');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentParents = async (req, res) => {
  try {
    const relations = await ParentStudent.find({ studentId: req.params.id })
      .populate({
        path: 'parentId',
        populate: { path: 'user', select: 'username email' },
      });
    const parents = relations.map((r) => r.parentId);
    res.json({ success: true, data: parents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    const populated = await Student.findById(student._id)
      .populate('user', 'username email')
      .populate('classGroup');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.importStudents = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'File is required' });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const created = [];
    const khmerRegex = /[\u1780-\u17FF]/;

    for (const rawRow of rows) {
      // Create a normalized key-value map (lowercase, no spaces, no underscores)
      const row = {};
      for (const k of Object.keys(rawRow)) {
        const cleanKey = k.trim().toLowerCase().replace(/[\s_-]+/g, '');
        row[cleanKey] = rawRow[k];
      }

      // Class name detection
      const className = (row['class'] || row['classgroup'] || row['classname'] || row['groupname'] || rawRow['Class'] || '').toString().trim();

      // Gender detection
      const rawGender = (row['gender'] || rawRow['Gender'] || '').toString().trim().toLowerCase();
      let genderVal = 'other';
      if (rawGender === 'm' || rawGender === 'male') genderVal = 'male';
      else if (rawGender === 'f' || rawGender === 'female') genderVal = 'female';

      // Names detection
      let nameEn = (row['studentnameen'] || row['nameen'] || row['englishname'] || '').toString().trim();
      let nameKh = (row['studentnamekh'] || row['namekh'] || row['khmername'] || '').toString().trim();

      const firstName = (row['firstname'] || rawRow['First name'] || rawRow['First Name'] || '').toString().trim();
      const lastName = (row['lastname'] || rawRow['Last name'] || rawRow['Last Name'] || '').toString().trim();

      // If Khmer name not set, check if firstName or lastName has Khmer script
      if (!nameKh) {
        if (khmerRegex.test(firstName)) {
          nameKh = firstName;
        } else if (khmerRegex.test(lastName)) {
          nameKh = lastName;
        }
      }

      // If English name not set, use the non-Khmer name or combine
      if (!nameEn) {
        if (lastName && !khmerRegex.test(lastName)) {
          nameEn = lastName;
        } else if (firstName && !khmerRegex.test(firstName)) {
          nameEn = firstName;
        } else if (firstName || lastName) {
          nameEn = `${firstName} ${lastName}`.trim();
        }
      }

      if (!nameEn && nameKh) {
        nameEn = nameKh;
      }

      // Auto-create or resolve class group
      let classGroupId = row['classgroupid'] || rawRow['classGroupId'] || null;
      if (!classGroupId && className) {
        let cg = await ClassGroup.findOne({ groupName: className });
        if (!cg) {
          cg = await ClassGroup.create({ groupName: className });
        }
        classGroupId = cg._id;
      }

      const parts = nameEn.split(' ');
      const fName = parts[0] || 'Student';
      const lName = parts.slice(1).join(' ') || '';

      const docData = {
        studentname_en: nameEn,
        studentname_kh: nameKh,
        firstName: fName,
        lastName: lName,
        dob: row['dob'] ? new Date(row['dob']) : undefined,
        gender: genderVal,
        phone: (row['phone'] || row['phonenumber'] || rawRow['Phone'] || '').toString().trim(),
        classGroup: classGroupId || undefined,
      };

      // Only assign user if a valid user ID is present; do NOT set null!
      const userId = row['user'] || row['userid'];
      if (userId && typeof userId === 'string' && userId.length === 24) {
        docData.user = userId;
      }

      const student = await Student.create(docData);
      created.push(student);
    }

    res.status(201).json({
      success: true,
      message: `${created.length} students imported successfully`,
      data: created,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportStudents = async (req, res) => {
  try {
    const { classGroup } = req.query;
    const filter = { isDeleted: { $ne: true } };
    if (classGroup) filter.classGroup = classGroup;

    const students = await Student.find(filter)
      .populate('classGroup')
      .sort({ createdAt: -1 });

    const exportData = students.map((s) => ({
      ID: s._id.toString(),
      'English Name': s.studentname_en || `${s.firstName} ${s.lastName}`.trim(),
      'Khmer Name': s.studentname_kh || '',
      Gender: s.gender,
      Class: s.classGroup ? s.classGroup.groupName : 'Unassigned',
      'Created Date': s.createdAt ? s.createdAt.toISOString().split('T')[0] : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="students_list.xlsx"');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('user', 'username email')
      .populate('classGroup');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.restoreStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    student.isDeleted = false;
    await student.save();
    res.json({ success: true, message: 'Student restored successfully', data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    student.isDeleted = true;
    await student.save();
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
