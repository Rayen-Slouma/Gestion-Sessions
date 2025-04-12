const Session = require('../models/Session');
const Subject = require('../models/Subject');
const Group = require('../models/Group');
const Classroom = require('../models/Classroom');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const { processSessionStatus } = require('../utils/sessionStatus');
const { isTeacherAvailable } = require('../utils/teacherAvailability');
const { isClassroomAvailable, getAvailableClassrooms } = require('../utils/classroomAvailability');

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

    // Filter sessions for students based on their group and section
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });

      if (student && student.group) {
        // If student has a group, filter sessions for that group
        query.groups = student.group;
      } else if (student && student.section) {
        // If student has only a section but no group, find all groups in that section
        const sectionGroups = await Group.find({ section: student.section });
        if (sectionGroups && sectionGroups.length > 0) {
          query.groups = { $in: sectionGroups.map(group => group._id) };
        }
      }

      // If student has neither group nor section, no filtering is applied
      // and they will see all sessions (which might be appropriate for testing)
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

    // Process each session to update its status based on current time
    const processedSessions = sessions.map(session => {
      // Convert Mongoose document to plain object
      const sessionObj = session.toObject();
      // Update status based on current time
      return processSessionStatus(sessionObj);
    });

    res.status(200).json({
      success: true,
      count: processedSessions.length,
      data: processedSessions
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

    // Process session to update its status based on current time
    const processedSession = processSessionStatus(session.toObject());

    res.status(200).json({
      success: true,
      data: processedSession
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
      examDuration,
      classroom,
      groups,
      supervisors,
      status = 'scheduled',
      sections
    } = req.body;

    // Log the status for debugging
    console.log('Creating session with status:', status);

    // Validate required fields
    if (!subject || !date || !startTime || !classroom || !groups || !groups.length) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for session creation'
      });
    }

    // Calculate endTime if not provided but examDuration is
    let finalEndTime = endTime;
    if (!finalEndTime && startTime && examDuration) {
      const [hours, minutes] = startTime.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes + examDuration;
      const endHours = Math.floor(totalMinutes / 60);
      const endMinutes = totalMinutes % 60;
      finalEndTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    }

    // Check if classroom is available at the requested time
    const existingClassroomSession = await Session.findOne({
      classroom,
      date,
      $or: [
        {
          startTime: { $lt: finalEndTime },
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
          (startTime < session.endTime && finalEndTime > session.startTime)
        );
      });

      if (hasConflict) {
        return res.status(400).json({
          success: false,
          message: 'Some groups already have an exam scheduled during this time slot'
        });
      }
    }

    // Check teacher availability if supervisors are provided
    if (supervisors && supervisors.length > 0) {
      const unavailableSupervisors = [];

      // Check each supervisor's availability
      for (const supervisorId of supervisors) {
        const { isAvailable, reason } = await isTeacherAvailable(
          supervisorId,
          date,
          startTime,
          finalEndTime
        );

        if (!isAvailable) {
          // Get teacher details for the error message
          const teacher = await Teacher.findById(supervisorId).populate('user', 'name');
          const teacherName = teacher?.user?.name || 'Unknown teacher';

          unavailableSupervisors.push({
            id: supervisorId,
            name: teacherName,
            reason
          });
        }
      }

      // If any supervisors are unavailable, return an error
      if (unavailableSupervisors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Some selected supervisors are not available at this time',
          unavailableSupervisors
        });
      }
    }

    // Create the session
    const session = await Session.create({
      subject,
      date,
      startTime,
      endTime: finalEndTime,
      examDuration,
      classroom,
      groups,
      supervisors: supervisors || [],
      status,
      sections: sections || []
    });

    return res.status(201).json({
      success: true,
      data: session
    });
  } catch (err) {
    if (next) {
      next(err);
    } else {
      throw err;
    }
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

    // Extract session data from request body
    const {
      supervisors,
      date,
      startTime,
      endTime,
      examDuration
    } = req.body;

    // Calculate final end time if needed
    let finalEndTime = endTime;
    if (!finalEndTime && startTime && examDuration) {
      const [hours, minutes] = startTime.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes + examDuration;
      const endHours = Math.floor(totalMinutes / 60);
      const endMinutes = totalMinutes % 60;
      finalEndTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    }

    // Check teacher availability if supervisors are being updated
    if (supervisors && supervisors.length > 0) {
      const sessionDate = date || session.date;
      const sessionStartTime = startTime || session.startTime;
      const sessionEndTime = finalEndTime || session.endTime;

      const unavailableSupervisors = [];

      // Get the current supervisors as strings for comparison
      const currentSupervisorIds = session.supervisors.map(id => id.toString());

      // Identify new supervisors (added) and removed supervisors
      const newSupervisorIds = supervisors.filter(id => !currentSupervisorIds.includes(id.toString()));
      const removedSupervisorIds = currentSupervisorIds.filter(id => !supervisors.includes(id));

      console.log('Current supervisors:', currentSupervisorIds);
      console.log('New supervisors:', newSupervisorIds);
      console.log('Removed supervisors:', removedSupervisorIds);

      // Check each new supervisor's availability
      for (const supervisorId of newSupervisorIds) {
        const { isAvailable, reason } = await isTeacherAvailable(
          supervisorId,
          sessionDate,
          sessionStartTime,
          sessionEndTime,
          req.params.id // Exclude current session from conflict check
        );

        if (!isAvailable) {
          // Get teacher details for the error message
          const teacher = await Teacher.findById(supervisorId).populate('user', 'name');
          const teacherName = teacher?.user?.name || 'Unknown teacher';

          unavailableSupervisors.push({
            id: supervisorId,
            name: teacherName,
            reason
          });
        }
      }

      // If any supervisors are unavailable, return an error
      if (unavailableSupervisors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Some selected supervisors are not available at this time',
          unavailableSupervisors
        });
      }
    }

    // Store the original supervisors for reference
    const originalSupervisors = [...session.supervisors];

    // Update the session
    session = await Session.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Get all affected supervisors (both added and removed)
    let affectedSupervisors = [];

    if (supervisors) {
      // Convert original supervisors to strings for comparison
      const originalSupervisorIds = originalSupervisors.map(id => id.toString());

      // Get new supervisors as strings
      const newSupervisorIds = supervisors.map(id => id.toString());

      // Find supervisors that were added or removed
      const addedSupervisors = newSupervisorIds.filter(id => !originalSupervisorIds.includes(id));
      const removedSupervisors = originalSupervisorIds.filter(id => !newSupervisorIds.includes(id));

      // Combine all affected supervisors
      affectedSupervisors = [...addedSupervisors, ...removedSupervisors];
    }

    res.status(200).json({
      success: true,
      data: session,
      affectedSupervisors
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

    // Store the supervisors that will be affected by this deletion
    const affectedSupervisors = session.supervisors.map(id => id.toString());

    await session.remove();

    res.status(200).json({
      success: true,
      data: {},
      affectedSupervisors
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

// Constants for exam types and statuses
const EXAM_TYPES = ['devoir_surveille', 'examen_tp', 'examen_principal', 'examen_rattrapage'];
const SESSION_STATUSES = ['scheduled', 'ongoing', 'completed', 'cancelled'];

// @desc    Get exam types
// @route   GET /api/sessions/exam-types
// @access  Private
exports.getExamTypes = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: EXAM_TYPES
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get session statuses
// @route   GET /api/sessions/statuses
// @access  Private
exports.getSessionStatuses = async (req, res, next) => {
  try {
    // Only return time-based statuses, not exam types
    const timeBasedStatuses = SESSION_STATUSES.filter(status =>
      !EXAM_TYPES.includes(status)
    );

    res.status(200).json({
      success: true,
      data: timeBasedStatuses
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get available teachers for a specific time slot
// @route   GET /api/sessions/available-teachers
// @access  Private/Admin
exports.getAvailableTeachers = async (req, res, next) => {
  try {
    const { date, startTime, endTime, sessionId } = req.query;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date, startTime, and endTime'
      });
    }

    // Parse the date to get the week start and end dates
    const sessionDate = new Date(date);
    const dayOfWeek = sessionDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate the start of the week (Sunday)
    const weekStart = new Date(sessionDate);
    weekStart.setDate(sessionDate.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    // Calculate the end of the week (Saturday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Format dates for query
    const formattedDate = sessionDate.toISOString().split('T')[0];
    const formattedWeekStart = weekStart.toISOString().split('T')[0];
    const formattedWeekEnd = weekEnd.toISOString().split('T')[0];

    // Get all teachers
    const teachers = await Teacher.find().populate('user', 'name email');

    // Check availability for each teacher
    const teachersWithAvailability = await Promise.all(
      teachers.map(async (teacher) => {
        // Check teacher's availability
        const { isAvailable, reason } = await isTeacherAvailable(
          teacher._id,
          date,
          startTime,
          endTime,
          sessionId || null
        );

        // Count sessions for this day
        const dailySessions = await Session.countDocuments({
          supervisors: teacher._id,
          date: formattedDate,
          _id: { $ne: sessionId }
        });

        // Count sessions for this week
        const weeklySessions = await Session.countDocuments({
          supervisors: teacher._id,
          date: { $gte: formattedWeekStart, $lte: formattedWeekEnd },
          _id: { $ne: sessionId }
        });

        return {
          _id: teacher._id,
          user: teacher.user,
          department: teacher.department,
          isAvailable,
          reason: isAvailable ? null : reason,
          dailySessions,
          weeklySessions
        };
      })
    );

    // Log the availability results for debugging
    console.log(`Available teachers for date: ${date}, time: ${startTime}-${endTime}:`,
      teachersWithAvailability.map(t => ({
        name: t.user?.name,
        isAvailable: t.isAvailable,
        reason: t.reason,
        dailySessions: t.dailySessions,
        weeklySessions: t.weeklySessions
      }))
    );

    res.status(200).json({
      success: true,
      count: teachersWithAvailability.length,
      data: teachersWithAvailability
    });
  } catch (err) {
    next(err);
  }
};






// @desc    Get available classrooms for a specific time slot
// @route   GET /api/sessions/available-classrooms
// @access  Private/Admin
exports.getAvailableClassroomsForTime = async (req, res, next) => {
  try {
    const { date, startTime, endTime, sessionId } = req.query;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date, startTime, and endTime'
      });
    }

    // Get all classrooms
    const classrooms = await Classroom.find();

    // Check availability for each classroom
    const classroomsWithAvailability = await getAvailableClassrooms(
      classrooms,
      date,
      startTime,
      endTime,
      sessionId || null
    );

    // Log the availability results for debugging
    console.log(`Available classrooms for date: ${date}, time: ${startTime}-${endTime}:`,
      classroomsWithAvailability.map(c => ({
        roomNumber: c.roomNumber,
        isAvailable: c.isAvailable,
        reason: c.reason
      }))
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