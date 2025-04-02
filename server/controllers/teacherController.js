const Teacher = require('../models/Teacher');
const User = require('../models/User');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private/Admin
exports.getTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.find().populate({
      path: 'user',
      select: 'name email'
    }).populate('subjects');

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private/Admin
exports.getTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate('subjects')
      .populate('supervisionPreferences.preferredRooms');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: `No teacher with the id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: teacher
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create teacher profile
// @route   POST /api/teachers
// @access  Private/Admin
exports.createTeacher = async (req, res, next) => {
  try {
    // Check if user exists and is a teacher
    const user = await User.findById(req.body.user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'User is not a teacher'
      });
    }

    // Check if teacher profile already exists
    const existingTeacher = await Teacher.findOne({ user: req.body.user });
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: 'Teacher profile already exists for this user'
      });
    }

    const teacher = await Teacher.create(req.body);

    res.status(201).json({
      success: true,
      data: teacher
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update teacher profile
// @route   PUT /api/teachers/:id
// @access  Private/Admin
exports.updateTeacher = async (req, res, next) => {
  try {
    let teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: `No teacher with the id of ${req.params.id}`
      });
    }

    teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: teacher
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private/Admin
exports.deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: `No teacher with the id of ${req.params.id}`
      });
    }

    await teacher.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update teacher availability
// @route   PUT /api/teachers/:id/availability
// @access  Private/Teacher
exports.updateAvailability = async (req, res, next) => {
  try {
    let teacher = await Teacher.findOne({ user: req.user.id });

    // Allow admins to update any teacher's availability
    if (req.user.role === 'admin' && req.params.id) {
      teacher = await Teacher.findById(req.params.id);
    }

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    teacher.availability = req.body.availability;

    await teacher.save();

    res.status(200).json({
      success: true,
      data: teacher
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get teacher's availability
// @route   GET /api/teachers/:id/availability
// @access  Private
exports.getAvailability = async (req, res, next) => {
  try {
    let teacher;

    if (req.user.role === 'teacher') {
      teacher = await Teacher.findOne({ user: req.user.id });
    } else {
      teacher = await Teacher.findById(req.params.id);
    }

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: teacher.availability
    });
  } catch (err) {
    next(err);
  }
};
