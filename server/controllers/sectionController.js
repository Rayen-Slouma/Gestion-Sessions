const Section = require('../models/Section');
const Department = require('../models/Department');

// @desc    Get all sections
// @route   GET /api/sections
// @access  Private
exports.getSections = async (req, res, next) => {
  try {
    const sections = await Section.find()
      .populate('department', 'name code')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: sections.length,
      data: sections
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get sections by department
// @route   GET /api/sections/department/:departmentId
// @access  Private
exports.getSectionsByDepartment = async (req, res, next) => {
  try {
    const sections = await Section.find({ department: req.params.departmentId })
      .populate('department', 'name code')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: sections.length,
      data: sections
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single section
// @route   GET /api/sections/:id
// @access  Private
exports.getSection = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate('department', 'name code');

    if (!section) {
      return res.status(404).json({
        success: false,
        message: `Section not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: section
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new section
// @route   POST /api/sections
// @access  Private/Admin
exports.createSection = async (req, res, next) => {
  try {
    // Check if department exists
    const department = await Department.findById(req.body.department);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: `Department not found with id of ${req.body.department}`
      });
    }

    // Remove year, semester, and description if they exist in the request body
    const { year, semester, description, ...sectionData } = req.body;
    const section = await Section.create(sectionData);

    // Populate the department field for the response
    const populatedSection = await Section.findById(section._id)
      .populate('department', 'name code');

    res.status(201).json({
      success: true,
      data: populatedSection
    });
  } catch (err) {
    if (err.code === 11000) {
      // Check if the error is due to duplicate code or duplicate name in department
      const errorMessage = err.message.includes('code')
        ? 'A section with this code already exists'
        : 'A section with this name already exists in this department';

      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
    next(err);
  }
};

// @desc    Update section
// @route   PUT /api/sections/:id
// @access  Private/Admin
exports.updateSection = async (req, res, next) => {
  try {
    let section = await Section.findById(req.params.id);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: `Section not found with id of ${req.params.id}`
      });
    }

    // If department is being updated, check if it exists
    if (req.body.department && req.body.department !== section.department.toString()) {
      const department = await Department.findById(req.body.department);

      if (!department) {
        return res.status(404).json({
          success: false,
          message: `Department not found with id of ${req.body.department}`
        });
      }
    }

    // Remove year, semester, and description if they exist in the request body
    const { year, semester, description, ...sectionData } = req.body;
    section = await Section.findByIdAndUpdate(req.params.id, sectionData, {
      new: true,
      runValidators: true
    }).populate('department', 'name code');

    res.status(200).json({
      success: true,
      data: section
    });
  } catch (err) {
    if (err.code === 11000) {
      // Check if the error is due to duplicate code or duplicate name in department
      const errorMessage = err.message.includes('code')
        ? 'A section with this code already exists'
        : 'A section with this name already exists in this department';

      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
    next(err);
  }
};

// @desc    Delete section
// @route   DELETE /api/sections/:id
// @access  Private/Admin
exports.deleteSection = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: `Section not found with id of ${req.params.id}`
      });
    }

    // Check if there are any groups or subjects associated with this section
    if (section.groups.length > 0 || section.subjects.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete section because it has associated groups or subjects`
      });
    }

    await section.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
