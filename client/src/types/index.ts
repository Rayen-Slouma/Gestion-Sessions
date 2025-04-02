// Common TypeScript interfaces used across the application

// User interfaces
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  createdAt?: string;
}

// Exam Session interfaces
export interface Subject {
  _id: string;
  name: string;
  code: string;
  examDuration: number;
  credits?: number;
  department?: string;
  teachers?: Teacher[];
  sections?: Section[];
}

export interface Classroom {
  _id: string;
  roomNumber: string;
  building: string;
  floor?: number;
  capacity: number;
  features?: string[];
  availability?: boolean;
}

export interface Group {
  _id: string;
  name: string;
  size: number;
  section: {
    _id?: string;
    name: string;
  };
  students?: string[];
}

export interface Teacher {
  _id: string;
  user: {
    _id?: string;
    name: string;
    email: string;
  };
  department: string;
  subjects?: Subject[];
  availability?: Availability[];
}

export interface Availability {
  day: string;
  startTime: string;
  endTime: string;
}

export interface ExamSession {
  _id: string;
  subject: {
    _id?: string;
    name: string;
    code: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  classroom: {
    _id?: string;
    roomNumber: string;
  };
  groups: {
    _id?: string;
    name: string;
  }[];
  supervisors: Teacher[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

export interface Section {
  _id: string;
  name: string;
  course: string;
  major?: string;
  year: number;
  semester: number;
  subjects?: string[];
  groups?: string[];
}

// Dashboard interfaces
export interface DashboardStats {
  counts: {
    users: number;
    teachers: number;
    students: number;
    subjects: number;
    sections: number;
    groups: number;
    classrooms: number;
    sessions: number;
  };
  upcomingSessions: {
    id: string;
    subject: string;
    date: string;
    time: string;
    classroom: string;
    groups: string;
  }[];
  sessionsByStatus: {
    scheduled?: number;
    ongoing?: number;
    completed?: number;
    cancelled?: number;
  };
  usersByRole: {
    admin?: number;
    teacher?: number;
    student?: number;
  };
}

export interface ChartDataItem {
  name: string;
  value: number;
}
