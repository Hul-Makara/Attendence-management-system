const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Parent = require('../models/Parent');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const user = await User.findOne({ username }).select('+password').populate('role');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const roleName = user.role ? user.role.roleName : 'Student';

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: roleName },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Look up linked profiles
    const student = await Student.findOne({ user: user._id });
    const teacher = await Teacher.findOne({ user: user._id });
    const parent = await Parent.findOne({ user: user._id });

    res.json({
      success: true,
      data: {
        tokens: token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: roleName,
          studentId: student ? student._id : null,
          teacherId: teacher ? teacher._id : null,
          parentId: parent ? parent._id : null,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password, email, roleId } = req.body;
    if (!username || !password || !email || !roleId) {
      return res.status(400).json({ success: false, message: 'username, password, email, and roleId are required' });
    }

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Username or email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role: roleId });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { userId: user._id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
