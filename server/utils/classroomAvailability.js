const Session = require('../models/Session');

/**
 * Check if a classroom is available at a specific date and time
 * @param {string} classroomId - The classroom's ID
 * @param {string} date - The date in YYYY-MM-DD format
 * @param {string} startTime - The start time in HH:MM format
 * @param {string} endTime - The end time in HH:MM format
 * @param {string} excludeSessionId - Optional session ID to exclude from conflict check (for editing)
 * @returns {Promise<{isAvailable: boolean, reason: string}>} - Availability result with reason
 */
const isClassroomAvailable = async (classroomId, date, startTime, endTime, excludeSessionId = null) => {
  try {
    // Check if classroom is already booked for another session at this time
    const query = {
      classroom: classroomId,
      date: date,
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ],
      status: { $ne: 'cancelled' }
    };

    // Exclude the current session if we're editing
    if (excludeSessionId) {
      query._id = { $ne: excludeSessionId };
    }

    const existingSession = await Session.findOne(query);

    if (existingSession) {
      return {
        isAvailable: false,
        reason: `Classroom is already booked for another session from ${existingSession.startTime} to ${existingSession.endTime}`
      };
    }

    return {
      isAvailable: true,
      reason: null
    };
  } catch (error) {
    console.error('Error checking classroom availability:', error);
    return {
      isAvailable: false,
      reason: 'Error checking classroom availability'
    };
  }
};

/**
 * Get available classrooms for a specific date and time
 * @param {Array} classrooms - Array of all classrooms
 * @param {string} date - The date in YYYY-MM-DD format
 * @param {string} startTime - The start time in HH:MM format
 * @param {string} endTime - The end time in HH:MM format
 * @param {string} excludeSessionId - Optional session ID to exclude from conflict check (for editing)
 * @returns {Promise<Array>} - Array of available classrooms with availability status
 */
const getAvailableClassrooms = async (classrooms, date, startTime, endTime, excludeSessionId = null) => {
  try {
    // Check availability for each classroom
    const availabilityPromises = classrooms.map(async (classroom) => {
      // Check classroom's availability
      const { isAvailable, reason } = await isClassroomAvailable(
        classroom._id,
        date,
        startTime,
        endTime,
        excludeSessionId
      );

      return {
        ...classroom.toObject(),
        isAvailable,
        reason: isAvailable ? null : reason
      };
    });

    const classroomsWithAvailability = await Promise.all(availabilityPromises);

    // Return all classrooms with their availability status
    return classroomsWithAvailability;
  } catch (error) {
    console.error('Error getting available classrooms:', error);
    return [];
  }
};

module.exports = {
  isClassroomAvailable,
  getAvailableClassrooms
};
