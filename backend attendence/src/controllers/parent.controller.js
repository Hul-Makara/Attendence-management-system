const Parent = require('../models/Parent');
const ParentStudent = require('../models/ParentStudent');

exports.getParents = async (req, res) => {
  try {
    const parents = await Parent.find().populate('user', 'username email');
    res.json({ success: true, data: parents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getParentById = async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id).populate('user', 'username email');
    if (!parent) return res.status(404).json({ success: false, message: 'Parent not found' });
    res.json({ success: true, data: parent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getParentChildren = async (req, res) => {
  try {
    const relations = await ParentStudent.find({ parentId: req.params.id })
      .populate({
        path: 'studentId',
        populate: [
          { path: 'user', select: 'username email' },
          { path: 'classGroup' },
        ],
      });
    const children = relations.map((r) => r.studentId);
    res.json({ success: true, data: children });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createParent = async (req, res) => {
  try {
    const parent = await Parent.create(req.body);
    const populated = await Parent.findById(parent._id).populate('user', 'username email');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addChild = async (req, res) => {
  try {
    const { studentId } = req.body;
    const relation = await ParentStudent.create({ parentId: req.params.id, studentId });
    res.status(201).json({ success: true, message: 'Child linked successfully', data: relation });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'This child is already linked to this parent' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateParent = async (req, res) => {
  try {
    const parent = await Parent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('user', 'username email');
    if (!parent) return res.status(404).json({ success: false, message: 'Parent not found' });
    res.json({ success: true, data: parent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteParent = async (req, res) => {
  try {
    const parent = await Parent.findByIdAndDelete(req.params.id);
    if (!parent) return res.status(404).json({ success: false, message: 'Parent not found' });
    await ParentStudent.deleteMany({ parentId: req.params.id });
    res.json({ success: true, message: 'Parent deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeChild = async (req, res) => {
  try {
    await ParentStudent.findOneAndDelete({ parentId: req.params.id, studentId: req.params.studentId });
    res.json({ success: true, message: 'Child unlinked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
