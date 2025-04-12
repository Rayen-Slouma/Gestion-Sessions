const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private/Student
exports.getStudentProfile = async (req, res, next) => {
  try {
    // Find student profile for the logged-in user
    const student = await Student.findOne({ user: req.user.id })
      .populate('section', 'name code')
      .populate('group', 'name size');

    if (!student) {
      // If no profile exists, return empty data
      return res.status(200).json({
        success: true,
        data: null
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create or update student profile
// @route   PUT /api/students/profile
// @access  Private/Student
exports.updateStudentProfile = async (req, res, next) => {
  try {
    // Check if student profile exists
    let student = await Student.findOne({ user: req.user.id });

    // Create or update profile
    if (student) {
      // Update existing profile
      student = await Student.findOneAndUpdate(
        { user: req.user.id },
        req.body,
        { new: true, runValidators: true }
      ).populate('section', 'name code')
       .populate('group', 'name size');
    } else {
      // Create new profile
      const profileData = {
        user: req.user.id,
        ...req.body
      };
      
      student = await Student.create(profileData);
      student = await Student.findById(student._id)
        .populate('section', 'name code')
        .populate('group', 'name size');
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all students (admin only)
// @route   GET /api/students
// @access  Private/Admin
exports.getStudents = async (req, res, next) => {
  try {
    const students = await Student.find()
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate('section', 'name code')
      .populate('group', 'name');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single student (admin only)
// @route   GET /api/students/:id
// @access  Private/Admin
exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate('section', 'name code')
      .populate('group', 'name');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `No student found with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update student (admin only)
// @route   PUT /api/students/:id
// @access  Private/Admin
exports.updateStudent = async (req, res, next) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `No student found with id ${req.params.id}`
      });
    }

    student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate('section', 'name code')
      .populate('group', 'name');

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete student (admin only)
// @route   DELETE /api/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `No student found with id ${req.params.id}`
      });
    }

    await student.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
