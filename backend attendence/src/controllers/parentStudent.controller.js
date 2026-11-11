const ParentStudent = require('../models/ParentStudent');

exports.getAll = async (req, res) => {
  try {
    const relations = await ParentStudent.find()
      .populate({ path: 'parentId', populate: { path: 'user', select: 'username email' } })
      .populate({ path: 'studentId', populate: { path: 'user', select: 'username email' } });
    res.json({ success: true, data: relations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const relation = await ParentStudent.findById(req.params.id)
      .populate({ path: 'parentId', populate: { path: 'user', select: 'username email' } })
      .populate({ path: 'studentId', populate: { path: 'user', select: 'username email' } });
    if (!relation) return res.status(404).json({ success: false, message: 'Relation not found' });
    res.json({ success: true, data: relation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { parentId, studentId } = req.body;
    const exists = await ParentStudent.findOne({ parentId, studentId });
    if (exists) return res.status(400).json({ success: false, message: 'Relation already exists' });

    const relation = await ParentStudent.create({ parentId, studentId });
    res.status(201).json({ success: true, data: relation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const relation = await ParentStudent.findByIdAndDelete(req.params.id);
    if (!relation) return res.status(404).json({ success: false, message: 'Relation not found' });
    res.json({ success: true, message: 'Relation deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
