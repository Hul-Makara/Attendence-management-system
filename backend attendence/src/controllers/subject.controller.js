const Subject = require('../models/Subject');

exports.getSubjects = async (req, res) => {
  try {
    const filter = {};
    if (req.query.classGroup) filter.classGroups = req.query.classGroup;

    const subjects = await Subject.find(filter)
      .populate('teacherId', 'name')
      .populate('classGroups', 'groupName');
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSchedule = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate('teacherId', 'name')
      .populate('classGroups', 'groupName');
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('teacherId', 'name')
      .populate('classGroups', 'groupName');
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubjectsByTeacher = async (req, res) => {
  try {
    const subjects = await Subject.find({ teacherId: req.params.teacherId })
      .populate('classGroups', 'groupName');
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    const populated = await Subject.findById(subject._id)
      .populate('teacherId', 'name')
      .populate('classGroups', 'groupName');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('teacherId', 'name')
      .populate('classGroups', 'groupName');
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
