const User = require('../models/User');
const Session = require('../models/Session');
const Subject = require('../models/Subject');
const Group = require('../models/Group');
const Classroom = require('../models/Classroom');
const Teacher = require('../models/Teacher');
const Section = require('../models/Section');
const Department = require('../models/Department');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
  try {
    // Only admins can access these statistics
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }

    // Get counts
    const userCount = await User.countDocuments();
    const teacherCount = await User.countDocuments({ role: 'teacher' });
    const studentCount = await User.countDocuments({ role: 'student' });
    const subjectCount = await Subject.countDocuments();
    const sectionCount = await Section.countDocuments();
    const groupCount = await Group.countDocuments();
    const classroomCount = await Classroom.countDocuments();
    const sessionCount = await Session.countDocuments();
    const departmentCount = await Department.countDocuments();

    // Get distribution of users by role
    const userRoles = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const usersByRole = {};
    userRoles.forEach(role => {
      usersByRole[role._id] = role.count;
    });

    // Get distribution of sessions by status
    const sessionStatuses = await Session.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const sessionsByStatus = {};
    sessionStatuses.forEach(status => {
      sessionsByStatus[status._id] = status.count;
    });

    // Get upcoming sessions
    const today = new Date();
    let upcomingSessions = [];
    try {
      upcomingSessions = await Session.find({
        date: { $gte: today },
        status: 'scheduled'
      })
      .sort({ date: 1 })
      .limit(5)
      .populate('subject')
      .populate('classroom')
      .populate('groups');

      console.log('Fetched upcoming sessions:', JSON.stringify(upcomingSessions, null, 2));
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
      upcomingSessions = [];
    }

    // Format upcoming sessions for frontend
    const formattedUpcomingSessions = upcomingSessions.map(session => {
      // Check if session.subject exists before accessing its properties
      const subjectName = session.subject ? `${session.subject.name} (${session.subject.code})` : 'Unknown Subject';
      // Check if session.classroom exists before accessing its properties
      const classroomNumber = session.classroom ? session.classroom.roomNumber : 'Unknown Classroom';
      // Check if session.groups exists and is an array before mapping
      const groupNames = Array.isArray(session.groups) ? session.groups.map(group => group ? group.name : 'Unknown Group').join(', ') : 'No Groups';

      return {
        id: session._id,
        subject: subjectName,
        date: session.date,
        time: `${session.startTime} - ${session.endTime}`,
        classroom: classroomNumber,
        groups: groupNames
      };
    });

    // Construct the statistics object
    const stats = {
      counts: {
        users: userCount,
        teachers: teacherCount,
        students: studentCount,
        subjects: subjectCount,
        sections: sectionCount,
        groups: groupCount,
        classrooms: classroomCount,
        sessions: sessionCount,
        departments: departmentCount
      },
      usersByRole,
      sessionsByStatus,
      upcomingSessions: formattedUpcomingSessions
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
};
