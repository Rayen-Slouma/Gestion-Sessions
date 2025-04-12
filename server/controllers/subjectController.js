const Subject = require('../models/Subject');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find()
      .populate('teachers', 'name email')
      .populate('sections', 'name course');

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
exports.getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('teachers', 'name email')
      .populate('sections', 'name course');

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: `Subject not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private/Admin
exports.createSubject = async (req, res, next) => {
  try {
    const subject = await Subject.create(req.body);

    res.status(201).json({
      success: true,
      data: subject
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A subject with this code already exists. Subject codes must be unique, but subject names can be duplicated.'
      });
    }
    next(err);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin
exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: `Subject not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A subject with this code already exists. Subject codes must be unique, but subject names can be duplicated.'
      });
    }
    next(err);
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: `Subject not found with id of ${req.params.id}`
      });
    }

    await subject.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
