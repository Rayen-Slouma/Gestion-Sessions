/**
 * Utility functions for handling session status in the client
 */

/**
 * Get the display text for a session status
 * @param status The status code
 * @returns Formatted status text
 */
export const getStatusDisplayText = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'scheduled':
      return 'Scheduled';
    case 'ongoing':
      return 'Ongoing';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'devoir_surveille':
      return 'Devoir Surveillé';
    case 'examen_tp':
      return 'Examen TP';
    case 'examen_principal':
      return 'Examen Principal';
    case 'examen_rattrapage':
      return 'Examen Rattrapage';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

/**
 * Get the color for a session status chip
 * @param status The status code
 * @returns MUI color name
 */
export const getStatusColor = (status: string): 'primary' | 'success' | 'error' | 'default' | 'secondary' | 'info' | 'warning' => {
  switch (status.toLowerCase()) {
    case 'scheduled':
      return 'primary';
    case 'ongoing':
      return 'success';
    case 'completed':
      return 'default';
    case 'cancelled':
      return 'error';
    case 'devoir_surveille':
    case 'examen_tp':
    case 'examen_principal':
    case 'examen_rattrapage':
      return 'secondary';
    default:
      return 'default';
  }
};

/**
 * Determine if a status is an exam type or a time-based status
 * @param status The status to check
 * @returns True if the status is an exam type
 */
export const isExamType = (status: string): boolean => {
  const examTypes = ['devoir_surveille', 'examen_tp', 'examen_principal', 'examen_rattrapage'];
  return examTypes.includes(status.toLowerCase());
};

/**
 * Process a session object to ensure it has the correct status properties
 * @param session The session object to process
 * @returns The processed session object
 */
export const processSessionStatus = (session: any): any => {
  if (!session) return session;

  // If the session already has examType and status properties, return it as is
  if (session.examType && session.status) {
    return session;
  }

  // If the status is an exam type, set examType and use status from the server
  if (isExamType(session.status)) {
    return {
      ...session,
      examType: session.status,
      // The server should have already calculated the status
    };
  }

  // Otherwise, just return the session as is
  return session;
};
