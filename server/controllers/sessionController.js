const Session = require('../models/Session');
const Subject = require('../models/Subject');
const Group = require('../models/Group');
const Classroom = require('../models/Classroom');
const Teacher = require('../models/Teacher');

// @desc    Get all sessions
// @route   GET /api/sessions
// @access  Private
exports.getSessions = async (req, res, next) => {
  try {
    let query = {};
    
    // Filter sessions for teachers based on their supervision duties
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user.id });
      if (teacher) {
        query.supervisors = teacher._id;
      }
    }
    
    // Filter sessions for students based on their groups
    if (req.user.role === 'student') {
      const groups = await Group.find({ students: req.user.id });
      if (groups && groups.length > 0) {
        query.groups = { $in: groups.map(group => group._id) };
      }
    }
    
    const sessions = await Session.find(query)
      .populate('subject')
      .populate('groups')
      .populate('classroom')
      .populate({
        path: 'supervisors',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single session
// @route   GET /api/sessions/:id
// @access  Private
exports.getSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('subject')
      .populate('groups')
      .populate('classroom')
      .populate({
        path: 'supervisors',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: `No session with the id of ${req.params.id}`
      });
    }

    // Check if user has permission to view this session
    if (req.user.role === 'student') {
      const groups = await Group.find({ students: req.user.id });
      const groupIds = groups.map(group => group._id.toString());
      const sessionGroupIds = session.groups.map(group => group._id.toString());
      
      // Check if there's an intersection between the groups
      const hasAccess = groupIds.some(id => sessionGroupIds.includes(id));
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this session'
        });
      }
    }

    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user.id });
      
      if (teacher) {
        const supervisorIds = session.supervisors.map(supervisor => 
          supervisor._id.toString()
        );
        
        if (!supervisorIds.includes(teacher._id.toString())) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to access this session'
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create session
// @route   POST /api/sessions
// @access  Private/Admin
exports.createSession = async (req, res, next) => {
  try {
    // Extract session data
    const { 
      subject,
      date,
      startTime,
      endTime,
      classroom,
      groups,
      supervisors,
      status = 'scheduled'
    } = req.body;

    // Validate required fields
    if (!subject || !date || !startTime || !endTime || !classroom || !groups || !supervisors) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for session creation'
      });
    }

    // Check if classroom is available at the requested time
    const existingClassroomSession = await Session.findOne({
      classroom,
      date,
      $or: [
        { 
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ],
      status: { $ne: 'cancelled' }
    });

    if (existingClassroomSession) {
      return res.status(400).json({
        success: false,
        message: 'Classroom is already booked during the requested time slot'
      });
    }

    // Check if groups have other exams scheduled on the same day
    const existingGroupSessions = await Session.find({
      groups: { $in: groups },
      date,
      status: { $ne: 'cancelled' }
    });

    // If there are already sessions, check for time conflicts
    if (existingGroupSessions.length > 0) {
      const hasConflict = existingGroupSessions.some(session => {
        return (
          (startTime < session.endTime && endTime > session.startTime)
        );
      });

      if (hasConflict) {
        return res.status(400).json({
          success: false,
          message: 'Some groups already have an exam scheduled during this time slot'
        });
      }
    }

    // Create the session
    const session = await Session.create({
      subject,
      date,
      startTime,
      endTime,
      classroom,
      groups,
      supervisors,
      status
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private/Admin
exports.updateSession = async (req, res, next) => {
  try {
    let session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: `No session with the id of ${req.params.id}`
      });
    }

    session = await Session.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete session
// @route   DELETE /api/sessions/:id
// @access  Private/Admin
exports.deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: `No session with the id of ${req.params.id}`
      });
    }

    await session.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate exam schedule
// @route   POST /api/sessions/generate
// @access  Private/Admin
exports.generateSchedule = async (req, res, next) => {
  try {
    const { startDate, endDate, dailySlots } = req.body;
    
    if (!startDate || !endDate || !dailySlots) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startDate, endDate, and dailySlots'
      });
    }
    
    // Generate schedule
    const schedule = await generateExamSchedule({
      startDate,
      endDate,
      dailySlots
    });
    
    // Create sessions from schedule
    if (schedule && schedule.length > 0) {
      // Optional: Delete existing sessions before creating new ones
      await Session.deleteMany({});
      
      // Create sessions from generated schedule
      await Session.insertMany(schedule);
    }

    res.status(201).json({
      success: true,
      count: schedule.length,
      data: schedule
    });
  } catch (err) {
    next(err);
  }
};
