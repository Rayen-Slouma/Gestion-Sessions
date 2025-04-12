const Group = require('../models/Group');

// @desc    Get all groups
// @route   GET /api/groups
// @access  Private
exports.getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find()
      .populate('section', 'name')
      .populate('subjects', 'name code');

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single group
// @route   GET /api/groups/:id
// @access  Private
exports.getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('section', 'name')
      .populate('students', 'name email');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: `Group not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new group
// @route   POST /api/groups
// @access  Private/Admin
exports.createGroup = async (req, res, next) => {
  try {
    const group = await Group.create(req.body);

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private/Admin
exports.updateGroup = async (req, res, next) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: `Group not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private/Admin
exports.deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: `Group not found with id of ${req.params.id}`
      });
    }

    await group.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
