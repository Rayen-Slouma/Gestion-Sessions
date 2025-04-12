const Department = require('../models/Department');
const Section = require('../models/Section');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
exports.getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: `Department not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private/Admin
exports.createDepartment = async (req, res, next) => {
  try {
    // Remove description if it exists in the request body
    const { description, ...departmentData } = req.body;
    const department = await Department.create(departmentData);

    res.status(201).json({
      success: true,
      data: department
    });
  } catch (err) {
    if (err.code === 11000) {
      // Check if the error is due to duplicate name or code
      const errorMessage = err.message.includes('code')
        ? 'A department with this code already exists'
        : 'A department with this name already exists';

      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
    next(err);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
exports.updateDepartment = async (req, res, next) => {
  try {
    let department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: `Department not found with id of ${req.params.id}`
      });
    }

    // Remove description if it exists in the request body
    const { description, ...departmentData } = req.body;
    department = await Department.findByIdAndUpdate(req.params.id, departmentData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (err) {
    if (err.code === 11000) {
      // Check if the error is due to duplicate name or code
      const errorMessage = err.message.includes('code')
        ? 'A department with this code already exists'
        : 'A department with this name already exists';

      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
    next(err);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: `Department not found with id of ${req.params.id}`
      });
    }

    // Check if there are any sections using this department
    const sectionCount = await Section.countDocuments({ department: req.params.id });

    if (sectionCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department because it is associated with ${sectionCount} section(s)`
      });
    }

    await department.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
