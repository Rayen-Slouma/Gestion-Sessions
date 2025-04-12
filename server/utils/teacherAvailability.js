const Teacher = require('../models/Teacher');
const Session = require('../models/Session');

/**
 * Check if a teacher is available at a specific date and time
 * @param {string} teacherId - The teacher's ID
 * @param {string} date - The date in YYYY-MM-DD format
 * @param {string} startTime - The start time in HH:MM format
 * @param {string} endTime - The end time in HH:MM format
 * @param {string} excludeSessionId - Optional session ID to exclude from conflict check (for editing)
 * @returns {Promise<{isAvailable: boolean, reason: string}>} - Availability result with reason
 */
const isTeacherAvailable = async (teacherId, date, startTime, endTime, excludeSessionId = null) => {
  try {
    // Get the teacher with availability and special occasions
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return { isAvailable: false, reason: 'Teacher not found' };
    }

    // Convert date to JavaScript Date object
    const sessionDate = new Date(date);

    // JavaScript getDay() returns 0 for Sunday, 1 for Monday, etc.
    // But we need to adjust for the timezone offset issue
    let dayOfWeek = sessionDate.getDay();

    // Add 1 to fix the day offset issue (when you select Tuesday, it's showing as Monday)
    // This is a workaround for the timezone handling issue
    dayOfWeek = (dayOfWeek + 1) % 7;

    // Map day number to day name
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[dayOfWeek];

    console.log(`Date: ${date}, Day: ${dayName} (adjusted from ${sessionDate.getDay()} to ${dayOfWeek})`);

    // Check for special occasions first (they override regular availability)
    const specialOccasion = teacher.specialOccasions?.find(occasion => {
      // Convert occasion date to YYYY-MM-DD for comparison
      const occasionDate = new Date(occasion.date);
      const formattedOccasionDate = occasionDate.toISOString().split('T')[0];
      const formattedSessionDate = sessionDate.toISOString().split('T')[0];

      // Check if dates match and times overlap
      if (formattedOccasionDate === formattedSessionDate) {
        // Check time overlap
        return (
          (startTime >= occasion.startTime && startTime < occasion.endTime) ||
          (endTime > occasion.startTime && endTime <= occasion.endTime) ||
          (startTime <= occasion.startTime && endTime >= occasion.endTime)
        );
      }
      return false;
    });

    // If there's a special occasion and it marks the teacher as unavailable
    if (specialOccasion && !specialOccasion.isAvailable) {
      return {
        isAvailable: false,
        reason: `Teacher has a special occasion: ${specialOccasion.reason}`
      };
    }

    // If there's a special occasion and it marks the teacher as available, they are available
    if (specialOccasion && specialOccasion.isAvailable) {
      // Still need to check for session conflicts
      const hasSessionConflict = await checkSessionConflicts(teacherId, date, startTime, endTime, excludeSessionId);
      if (hasSessionConflict) {
        return {
          isAvailable: false,
          reason: 'Teacher is already assigned to another session at this time'
        };
      }
      return { isAvailable: true, reason: 'Teacher is available (special occasion)' };
    }

    // Check if teacher has any availability set
    if (!teacher.availability || teacher.availability.length === 0) {
      return {
        isAvailable: false,
        reason: 'Teacher has not set any availability'
      };
    }

    // Check regular availability if no special occasion applies
    const availabilityForDay = teacher.availability.find(avail => {
      // Compare day names case-insensitively
      return avail.day.toLowerCase() === dayName.toLowerCase();
    });

    // If no availability is set for this day
    if (!availabilityForDay) {
      return {
        isAvailable: false,
        reason: `Teacher is not available on ${dayName}s`
      };
    }

    // Check if the session time falls within the teacher's availability
    // Convert time strings to minutes for accurate comparison
    const convertTimeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const sessionStartMinutes = convertTimeToMinutes(startTime);
    const sessionEndMinutes = convertTimeToMinutes(endTime);
    const availabilityStartMinutes = convertTimeToMinutes(availabilityForDay.startTime);
    const availabilityEndMinutes = convertTimeToMinutes(availabilityForDay.endTime);

    const isTimeAvailable = (
      sessionStartMinutes >= availabilityStartMinutes &&
      sessionEndMinutes <= availabilityEndMinutes
    );

    if (!isTimeAvailable) {
      return {
        isAvailable: false,
        reason: `Teacher is only available from ${availabilityForDay.startTime} to ${availabilityForDay.endTime} on ${dayName}s. Session time: ${startTime} to ${endTime}`
      };
    }

    // Finally, check if the teacher is already assigned to another session at this time
    const hasSessionConflict = await checkSessionConflicts(teacherId, date, startTime, endTime, excludeSessionId);
    if (hasSessionConflict) {
      return {
        isAvailable: false,
        reason: 'Teacher is already assigned to another session at this time'
      };
    }

    // If all checks pass, the teacher is available
    return { isAvailable: true, reason: 'Teacher is available' };
  } catch (error) {
    console.error('Error checking teacher availability:', error);
    return { isAvailable: false, reason: 'Error checking availability' };
  }
};

/**
 * Check if a teacher has session conflicts
 * @param {string} teacherId - The teacher's ID
 * @param {string} date - The date in YYYY-MM-DD format
 * @param {string} startTime - The start time in HH:MM format
 * @param {string} endTime - The end time in HH:MM format
 * @param {string} excludeSessionId - Optional session ID to exclude from conflict check (for editing)
 * @returns {Promise<boolean>} - True if there's a conflict, false otherwise
 */
const checkSessionConflicts = async (teacherId, date, startTime, endTime, excludeSessionId) => {
  // Format date for query
  const formattedDate = new Date(date).toISOString().split('T')[0];

  // Find sessions on the same date where this teacher is a supervisor
  const query = {
    date: formattedDate,
    'supervisors': teacherId
  };

  // Exclude the current session if we're editing
  if (excludeSessionId) {
    query._id = { $ne: excludeSessionId };
  }

  const sessions = await Session.find(query);

  // Convert time strings to minutes for accurate comparison
  const convertTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert all times to minutes
  const sessionStartMinutes = convertTimeToMinutes(startTime);
  const sessionEndMinutes = convertTimeToMinutes(endTime);

  // Check for time conflicts
  return sessions.some(session => {
    const existingStartMinutes = convertTimeToMinutes(session.startTime);
    const existingEndMinutes = convertTimeToMinutes(session.endTime);

    return (
      (sessionStartMinutes >= existingStartMinutes && sessionStartMinutes < existingEndMinutes) ||
      (sessionEndMinutes > existingStartMinutes && sessionEndMinutes <= existingEndMinutes) ||
      (sessionStartMinutes <= existingStartMinutes && sessionEndMinutes >= existingEndMinutes)
    );
  });
};

/**
 * Get available teachers for a specific date and time
 * @param {string} date - The date in YYYY-MM-DD format
 * @param {string} startTime - The start time in HH:MM format
 * @param {string} endTime - The end time in HH:MM format
 * @param {string} excludeSessionId - Optional session ID to exclude from conflict check (for editing)
 * @returns {Promise<Array>} - Array of available teachers with their IDs and session counts
 */
const getAvailableTeachers = async (date, startTime, endTime, excludeSessionId = null) => {
  try {
    // Get all teachers
    const teachers = await Teacher.find().populate('user', 'name email');

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

    // Check availability for each teacher
    const availabilityPromises = teachers.map(async (teacher) => {
      // Check teacher's availability
      const { isAvailable, reason } = await isTeacherAvailable(
        teacher._id,
        date,
        startTime,
        endTime,
        excludeSessionId
      );

      // Count sessions for this day
      const dailySessions = await Session.countDocuments({
        supervisors: teacher._id,
        date: formattedDate,
        _id: { $ne: excludeSessionId }
      });

      // Count sessions for this week
      const weeklySessions = await Session.countDocuments({
        supervisors: teacher._id,
        date: { $gte: formattedWeekStart, $lte: formattedWeekEnd },
        _id: { $ne: excludeSessionId }
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
    });

    const teachersWithAvailability = await Promise.all(availabilityPromises);

    // Return all teachers with their availability status and session counts
    return teachersWithAvailability;
  } catch (error) {
    console.error('Error getting available teachers:', error);
    return [];
  }
};

module.exports = {
  isTeacherAvailable,
  getAvailableTeachers
};
