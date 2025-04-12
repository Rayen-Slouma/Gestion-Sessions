/**
 * Utility functions for calculating session status based on date and time
 */

/**
 * Calculate the current status of a session based on its date and time
 * @param {Date} sessionDate - The date of the session
 * @param {String} startTime - The start time in format "HH:MM"
 * @param {String} endTime - The end time in format "HH:MM"
 * @param {String} currentStatus - The current status of the session
 * @returns {String} The calculated status: 'scheduled', 'ongoing', or 'completed'
 */
const calculateSessionStatus = (sessionDate, startTime, endTime, currentStatus) => {
  // If status is explicitly set to cancelled, keep it
  if (currentStatus === 'cancelled') {
    return 'cancelled';
  }

  // If the status is an exam type, we'll calculate the actual status
  const examTypes = ['devoir_surveille', 'examen_tp', 'examen_principal', 'examen_rattrapage'];

  // Get current date and time
  const now = new Date();
  const examDate = new Date(sessionDate);

  // Reset hours to compare just the dates
  const todayDate = new Date(now);
  todayDate.setHours(0, 0, 0, 0);
  const sessionDay = new Date(examDate);
  sessionDay.setHours(0, 0, 0, 0);

  // If exam is in the future
  if (sessionDay > todayDate) {
    return 'scheduled';
  }

  // If exam is in the past
  if (sessionDay < todayDate) {
    return 'completed';
  }

  // If exam is today, check the time
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const examStartTime = new Date(examDate);
  examStartTime.setHours(startHour, startMinute, 0);

  const examEndTime = new Date(examDate);
  examEndTime.setHours(endHour, endMinute, 0);

  // If current time is before the start time
  if (now < examStartTime) {
    return 'scheduled';
  }

  // If current time is after the end time
  if (now > examEndTime) {
    return 'completed';
  }

  // If current time is between start and end times
  return 'ongoing';
};

/**
 * Process a session object to update its status based on current time
 * @param {Object} session - The session object
 * @returns {Object} The updated session object
 */
const processSessionStatus = (session) => {
  // Skip if session doesn't have required fields
  if (!session || !session.date || !session.startTime || !session.endTime) {
    return session;
  }

  // Check if the status is an exam type
  const examTypes = ['devoir_surveille', 'examen_tp', 'examen_principal', 'examen_rattrapage'];
  const isExamType = examTypes.includes(session.status);

  // Store the original status for debugging
  const originalStatus = session.status;
  console.log(`Processing session ${session._id} - Original status: ${originalStatus}`);

  // Calculate the actual status
  const calculatedStatus = calculateSessionStatus(
    session.date,
    session.startTime,
    session.endTime,
    session.status
  );

  // If the status is an exam type, keep it as examType and set status to calculated value
  if (isExamType) {
    session.examType = originalStatus;
    session.originalStatus = originalStatus;
    session.status = calculatedStatus;
    console.log(`Session ${session._id} - Status is exam type. examType: ${session.examType}, status: ${session.status}`);
  } else if (!examTypes.includes(session.status)) {
    // Only update status if it's not already an exam type
    session.status = calculatedStatus;
    console.log(`Session ${session._id} - Status is not exam type. status: ${session.status}`);
  }

  return session;
};

module.exports = {
  calculateSessionStatus,
  processSessionStatus
};
