const Classroom = require('../models/Classroom');
const Booking = require('../models/Booking');

// Helper function to check if a classroom is currently available
const isClassroomAvailable = async (classroomId) => {
  const now = new Date();
  
  // Find any active bookings for this classroom
  const activeBooking = await Booking.findOne({
    classroom: classroomId,
    startTime: { $lte: now },
    endTime: { $gte: now }
  });
  
  return !activeBooking;
};

// @desc    Get all classrooms with real-time availability
// @route   GET /api/classrooms
// @access  Private
exports.getClassrooms = async (req, res, next) => {
  try {
    const classrooms = await Classroom.find();
    
    // Check real-time availability for each classroom
    const classroomsWithAvailability = await Promise.all(
      classrooms.map(async (classroom) => {
        const isAvailable = await isClassroomAvailable(classroom._id);
        
        // Create a new object with the updated availability
        return {
          ...classroom.toObject(),
          availability: isAvailable
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: classroomsWithAvailability.length,
      data: classroomsWithAvailability
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single classroom with real-time availability
// @route   GET /api/classrooms/:id
// @access  Private
exports.getClassroom = async (req, res, next) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: `Classroom not found with id of ${req.params.id}`
      });
    }
    
    // Check real-time availability
    const isAvailable = await isClassroomAvailable(classroom._id);
    
    // Create a new object with the updated availability
    const classroomWithAvailability = {
      ...classroom.toObject(),
      availability: isAvailable
    };
    
    res.status(200).json({
      success: true,
      data: classroomWithAvailability
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new classroom
// @route   POST /api/classrooms
// @access  Private/Admin
exports.createClassroom = async (req, res, next) => {
  try {
    const classroom = await Classroom.create(req.body);
    
    res.status(201).json({
      success: true,
      data: classroom
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A classroom with this room number already exists'
      });
    }
    next(err);
  }
};

// @desc    Update classroom
// @route   PUT /api/classrooms/:id
// @access  Private/Admin
exports.updateClassroom = async (req, res, next) => {
  try {
    let classroom = await Classroom.findById(req.params.id);
    
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: `Classroom not found with id of ${req.params.id}`
      });
    }
    
    classroom = await Classroom.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: classroom
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A classroom with this room number already exists'
      });
    }
    next(err);
  }
};

// @desc    Delete classroom
// @route   DELETE /api/classrooms/:id
// @access  Private/Admin
exports.deleteClassroom = async (req, res, next) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: `Classroom not found with id of ${req.params.id}`
      });
    }
    
    await classroom.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
