const User = require('../models/User');
const Session = require('../models/Session');
const Subject = require('../models/Subject');
const Group = require('../models/Group');
const Classroom = require('../models/Classroom');
const Teacher = require('../models/Teacher');
const Section = require('../models/Section');

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
    const teacherCount = await Teacher.countDocuments();
    const studentCount = await User.countDocuments({ role: 'student' });
    const subjectCount = await Subject.countDocuments();
    const sectionCount = await Section.countDocuments();
    const groupCount = await Group.countDocuments();
    const classroomCount = await Classroom.countDocuments();
    const sessionCount = await Session.countDocuments();

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
    const upcomingSessions = await Session.find({
      date: { $gte: today },
      status: 'scheduled'
    })
    .sort({ date: 1 })
    .limit(5)
    .populate('subject')
    .populate('classroom')
    .populate('groups');

    // Format upcoming sessions for frontend
    const formattedUpcomingSessions = upcomingSessions.map(session => {
      return {
        id: session._id,
        subject: `${session.subject.name} (${session.subject.code})`,
        date: session.date,
        time: `${session.startTime} - ${session.endTime}`,
        classroom: session.classroom.roomNumber,
        groups: session.groups.map(group => group.name).join(', ')
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
        sessions: sessionCount
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
