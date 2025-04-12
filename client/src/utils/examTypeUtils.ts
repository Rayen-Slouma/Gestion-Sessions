/**
 * Utility functions for handling exam types and statuses
 */

/**
 * Get the French display name for an exam type
 * @param type The exam type code
 * @returns Formatted exam type text in French
 */
export const getExamTypeDisplayName = (type: string): string => {
  switch (type) {
    case 'devoir_surveille':
      return 'Devoir Surveillé';
    case 'examen_tp':
      return 'Examen TP';
    case 'examen_principal':
      return 'Examen Principal';
    case 'examen_rattrapage':
      return 'Examen Rattrapage';
    case 'controle_continu':
      return 'Contrôle Continu';
    case 'examen_final':
      return 'Examen Final';
    case 'rattrapage':
      return 'Rattrapage';
    case 'tp':
      return 'TP';
    default:
      return type || 'Non Spécifié';
  }
};

/**
 * Get the French display name for a session status
 * @param status The session status code
 * @returns Formatted status text in French
 */
export const getStatusDisplayName = (status: string): string => {
  switch (status) {
    case 'scheduled':
      return 'Planifié';
    case 'ongoing':
      return 'En cours';
    case 'completed':
      return 'Terminé';
    case 'cancelled':
      return 'Annulé';
    default:
      return status;
  }
};

/**
 * Get the color for a session status chip
 * @param status The status code
 * @returns MUI color name
 */
export const getStatusColor = (status: string): 'primary' | 'success' | 'error' | 'default' | 'secondary' | 'info' | 'warning' => {
  switch (status) {
    case 'scheduled':
    case 'Planifié':
    case 'devoir_surveille':
    case 'examen_tp':
    case 'examen_principal':
    case 'examen_rattrapage':
      return 'primary';
    case 'ongoing':
    case 'En cours':
      return 'success';
    case 'completed':
    case 'Terminé':
      return 'default';
    case 'cancelled':
    case 'Annulé':
      return 'error';
    default:
      return 'primary';
  }
};

/**
 * Determine if a status is an exam type or a time-based status
 * @param status The status to check
 * @returns True if the status is an exam type
 */
export const isExamType = (status: string): boolean => {
  const examTypes = ['devoir_surveille', 'examen_tp', 'examen_principal', 'examen_rattrapage', 'controle_continu', 'examen_final', 'rattrapage', 'tp'];
  return examTypes.includes(status.toLowerCase());
};
