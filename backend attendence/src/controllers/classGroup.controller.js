const ClassGroup = require('../models/ClassGroup');

exports.getClassGroups = async (req, res) => {
  try {
    const groups = await ClassGroup.find().sort({ groupName: 1 });
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getClassGroupById = async (req, res) => {
  try {
    const group = await ClassGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Class group not found' });
    res.json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createClassGroup = async (req, res) => {
  try {
    const group = await ClassGroup.create(req.body);
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateClassGroup = async (req, res) => {
  try {
    const group = await ClassGroup.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!group) return res.status(404).json({ success: false, message: 'Class group not found' });
    res.json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteClassGroup = async (req, res) => {
  try {
    const group = await ClassGroup.findByIdAndDelete(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Class group not found' });
    res.json({ success: true, message: 'Class group deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
