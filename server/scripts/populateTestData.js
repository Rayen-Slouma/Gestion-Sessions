const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Department = require('../models/Department');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const Classroom = require('../models/Classroom');
const Group = require('../models/Group');
const Session = require('../models/Session');
const Teacher = require('../models/Teacher');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Function to clear existing data
const clearData = async () => {
  try {
    console.log('Clearing existing data...');
    await Session.deleteMany({}); // Clear sessions first (they reference other collections)
    await Group.deleteMany({}); // Clear groups before departments and sections
    await Department.deleteMany({});
    await Section.deleteMany({});
    await Subject.deleteMany({});
    await Classroom.deleteMany({});

    // Keep existing users but clear teacher data except for the test teacher
    const testTeacher = await Teacher.findOne().populate('user');
    if (testTeacher) {
      console.log(`Preserving test teacher: ${testTeacher.user.name}`);
      await Teacher.deleteMany({ _id: { $ne: testTeacher._id } });
    } else {
      await Teacher.deleteMany({});
    }

    console.log('Data cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

// Function to create departments
const createDepartments = async () => {
  try {
    console.log('Creating departments...');
    const departments = [
      { name: 'Computer Science', code: 'CS' },
      { name: 'Electrical Engineering', code: 'EE' },
      { name: 'Mechanical Engineering', code: 'ME' },
      { name: 'Civil Engineering', code: 'CE' },
      { name: 'Business Administration', code: 'BA' }
    ];

    const createdDepartments = await Department.insertMany(departments);
    console.log(`${createdDepartments.length} departments created`);
    return createdDepartments;
  } catch (error) {
    console.error('Error creating departments:', error);
    process.exit(1);
  }
};

// Function to create sections
const createSections = async (departments) => {
  try {
    console.log('Creating sections...');
    const sections = [
      { name: 'Computer Science - Year 1', code: 'CS1', department: departments[0]._id },
      { name: 'Computer Science - Year 2', code: 'CS2', department: departments[0]._id },
      { name: 'Computer Science - Year 3', code: 'CS3', department: departments[0]._id },
      { name: 'Electrical Engineering - Year 1', code: 'EE1', department: departments[1]._id },
      { name: 'Electrical Engineering - Year 2', code: 'EE2', department: departments[1]._id },
      { name: 'Mechanical Engineering - Year 1', code: 'ME1', department: departments[2]._id },
      { name: 'Mechanical Engineering - Year 2', code: 'ME2', department: departments[2]._id },
      { name: 'Civil Engineering - Year 1', code: 'CE1', department: departments[3]._id },
      { name: 'Business Administration - Year 1', code: 'BA1', department: departments[4]._id },
      { name: 'Business Administration - Year 2', code: 'BA2', department: departments[4]._id }
    ];

    const createdSections = await Section.insertMany(sections);
    console.log(`${createdSections.length} sections created`);
    return createdSections;
  } catch (error) {
    console.error('Error creating sections:', error);
    process.exit(1);
  }
};

// Function to create subjects
const createSubjects = async (departments) => {
  try {
    console.log('Creating subjects...');
    const subjects = [
      { name: 'Introduction to Programming', code: 'CS101', department: departments[0]._id, examDuration: 120, credits: 3 },
      { name: 'Data Structures', code: 'CS201', department: departments[0]._id, examDuration: 180, credits: 4 },
      { name: 'Algorithms', code: 'CS202', department: departments[0]._id, examDuration: 180, credits: 4 },
      { name: 'Database Systems', code: 'CS301', department: departments[0]._id, examDuration: 150, credits: 3 },
      { name: 'Web Development', code: 'CS302', department: departments[0]._id, examDuration: 120, credits: 3 },
      { name: 'Circuit Theory', code: 'EE101', department: departments[1]._id, examDuration: 120, credits: 3 },
      { name: 'Digital Electronics', code: 'EE201', department: departments[1]._id, examDuration: 150, credits: 4 },
      { name: 'Signals and Systems', code: 'EE202', department: departments[1]._id, examDuration: 180, credits: 4 },
      { name: 'Engineering Mechanics', code: 'ME101', department: departments[2]._id, examDuration: 120, credits: 3 },
      { name: 'Thermodynamics', code: 'ME201', department: departments[2]._id, examDuration: 150, credits: 4 },
      { name: 'Structural Analysis', code: 'CE101', department: departments[3]._id, examDuration: 120, credits: 3 },
      { name: 'Fluid Mechanics', code: 'CE201', department: departments[3]._id, examDuration: 150, credits: 4 },
      { name: 'Principles of Management', code: 'BA101', department: departments[4]._id, examDuration: 90, credits: 2 },
      { name: 'Financial Accounting', code: 'BA201', department: departments[4]._id, examDuration: 120, credits: 3 },
      { name: 'Marketing Management', code: 'BA301', department: departments[4]._id, examDuration: 90, credits: 3 }
    ];

    const createdSubjects = await Subject.insertMany(subjects);
    console.log(`${createdSubjects.length} subjects created`);
    return createdSubjects;
  } catch (error) {
    console.error('Error creating subjects:', error);
    process.exit(1);
  }
};

// Function to create classrooms
const createClassrooms = async () => {
  try {
    console.log('Creating classrooms...');
    const classrooms = [
      { roomNumber: 'A101', building: 'Building A', capacity: 30, features: ['whiteboard', 'projector'] },
      { roomNumber: 'A102', building: 'Building A', capacity: 40, features: ['whiteboard', 'projector', 'computers'] },
      { roomNumber: 'A201', building: 'Building A', capacity: 25, features: ['whiteboard'] },
      { roomNumber: 'B101', building: 'Building B', capacity: 60, features: ['whiteboard', 'projector', 'air_conditioning'] },
      { roomNumber: 'B102', building: 'Building B', capacity: 45, features: ['whiteboard', 'projector'] },
      { roomNumber: 'B201', building: 'Building B', capacity: 35, features: ['whiteboard', 'computers'] },
      { roomNumber: 'C101', building: 'Building C', capacity: 100, features: ['whiteboard', 'projector', 'air_conditioning'] },
      { roomNumber: 'C102', building: 'Building C', capacity: 80, features: ['whiteboard', 'projector', 'air_conditioning'] },
      { roomNumber: 'D101', building: 'Building D', capacity: 20, features: ['whiteboard', 'computers', 'internet'] },
      { roomNumber: 'D102', building: 'Building D', capacity: 15, features: ['whiteboard', 'computers', 'internet'] }
    ];

    const createdClassrooms = await Classroom.insertMany(classrooms);
    console.log(`${createdClassrooms.length} classrooms created`);
    return createdClassrooms;
  } catch (error) {
    console.error('Error creating classrooms:', error);
    process.exit(1);
  }
};

// Function to create teachers
const createTeachers = async (departments) => {
  try {
    console.log('Creating teachers...');

    // Get existing teacher
    const existingTeacher = await Teacher.findOne().populate('user');
    let teachers = [];

    if (existingTeacher) {
      console.log(`Using existing teacher: ${existingTeacher.user.name}`);
      teachers.push(existingTeacher);
    }

    // Create new teacher users
    const newTeacherUsers = [
      { name: 'John Smith', email: 'john.smith@example.com', password: 'password123', role: 'teacher' },
      { name: 'Emily Johnson', email: 'emily.johnson@example.com', password: 'password123', role: 'teacher' },
      { name: 'Michael Brown', email: 'michael.brown@example.com', password: 'password123', role: 'teacher' },
      { name: 'Sarah Davis', email: 'sarah.davis@example.com', password: 'password123', role: 'teacher' },
      { name: 'David Wilson', email: 'david.wilson@example.com', password: 'password123', role: 'teacher' },
      { name: 'Jennifer Miller', email: 'jennifer.miller@example.com', password: 'password123', role: 'teacher' },
      { name: 'Robert Taylor', email: 'robert.taylor@example.com', password: 'password123', role: 'teacher' },
      { name: 'Lisa Anderson', email: 'lisa.anderson@example.com', password: 'password123', role: 'teacher' },
      { name: 'James Thomas', email: 'james.thomas@example.com', password: 'password123', role: 'teacher' }
    ];

    for (const userData of newTeacherUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      // Create teacher profile with varied availability
      const departmentIndex = Math.floor(Math.random() * departments.length);

      // Create varied availability patterns
      const availabilityPatterns = [
        // Pattern 1: Standard work hours
        [
          { day: 'Monday', startTime: '08:00', endTime: '16:00' },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '08:00', endTime: '16:00' },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '08:00', endTime: '14:00' }
        ],
        // Pattern 2: Morning availability
        [
          { day: 'Monday', startTime: '08:00', endTime: '12:00' },
          { day: 'Tuesday', startTime: '08:00', endTime: '12:00' },
          { day: 'Wednesday', startTime: '08:00', endTime: '12:00' },
          { day: 'Thursday', startTime: '08:00', endTime: '12:00' },
          { day: 'Friday', startTime: '08:00', endTime: '12:00' },
          { day: 'Saturday', startTime: '09:00', endTime: '12:00' }
        ],
        // Pattern 3: Afternoon availability
        [
          { day: 'Monday', startTime: '13:00', endTime: '18:00' },
          { day: 'Tuesday', startTime: '13:00', endTime: '18:00' },
          { day: 'Wednesday', startTime: '13:00', endTime: '18:00' },
          { day: 'Thursday', startTime: '13:00', endTime: '18:00' },
          { day: 'Friday', startTime: '13:00', endTime: '17:00' }
        ],
        // Pattern 4: Split schedule
        [
          { day: 'Monday', startTime: '08:00', endTime: '11:00' },
          { day: 'Monday', startTime: '14:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '08:00', endTime: '11:00' },
          { day: 'Wednesday', startTime: '14:00', endTime: '17:00' },
          { day: 'Friday', startTime: '08:00', endTime: '11:00' },
          { day: 'Friday', startTime: '14:00', endTime: '17:00' }
        ],
        // Pattern 5: Limited availability
        [
          { day: 'Tuesday', startTime: '10:00', endTime: '16:00' },
          { day: 'Thursday', startTime: '10:00', endTime: '16:00' }
        ]
      ];

      // Select a random availability pattern
      const selectedPattern = availabilityPatterns[Math.floor(Math.random() * availabilityPatterns.length)];

      // Create special occasions (unavailable and available dates)
      const specialOccasions = [];

      // Generate 2-4 special occasions
      const numSpecialOccasions = Math.floor(Math.random() * 3) + 2;

      // Get dates for the next 30 days
      const today = new Date();

      for (let i = 0; i < numSpecialOccasions; i++) {
        // Random date in the next 30 days
        const randomDaysAhead = Math.floor(Math.random() * 30) + 1;
        const occasionDate = new Date(today);
        occasionDate.setDate(today.getDate() + randomDaysAhead);

        // Format date as YYYY-MM-DD
        const formattedDate = occasionDate.toISOString().split('T')[0];

        // Random start and end times
        const startHour = Math.floor(Math.random() * 6) + 8; // 8-13
        const endHour = Math.floor(Math.random() * 5) + 14; // 14-18

        const startTime = `${String(startHour).padStart(2, '0')}:00`;
        const endTime = `${String(endHour).padStart(2, '0')}:00`;

        // Randomly decide if available or unavailable
        const isAvailable = Math.random() > 0.7; // 30% chance of being available

        specialOccasions.push({
          date: formattedDate,
          startTime,
          endTime,
          isAvailable
        });
      }

      const teacher = new Teacher({
        user: user._id,
        department: departments[departmentIndex]._id,
        availability: selectedPattern,
        specialOccasions
      });

      await teacher.save();
      teachers.push(teacher);
    }

    console.log(`${teachers.length} teachers available`);
    return teachers;
  } catch (error) {
    console.error('Error creating teachers:', error);
    process.exit(1);
  }
};

// Function to create groups
const createGroups = async (sections, subjects) => {
  try {
    console.log('Creating groups...');
    const groups = [];

    // For each section, create 2-3 groups
    for (const section of sections) {
      const numGroups = Math.floor(Math.random() * 2) + 2; // 2-3 groups per section

      for (let i = 1; i <= numGroups; i++) {
        // Assign 3-5 subjects to each group
        const groupSubjects = [];
        const numSubjects = Math.floor(Math.random() * 3) + 3; // 3-5 subjects

        // Find subjects for this department
        const departmentSubjects = subjects.filter(
          subject => subject.department.toString() === section.department.toString()
        );

        // If no department subjects, use random subjects
        const subjectsToChooseFrom = departmentSubjects.length > 0 ? departmentSubjects : subjects;

        // Select random subjects
        for (let j = 0; j < numSubjects && j < subjectsToChooseFrom.length; j++) {
          const randomIndex = Math.floor(Math.random() * subjectsToChooseFrom.length);
          const subject = subjectsToChooseFrom[randomIndex];

          if (!groupSubjects.includes(subject._id)) {
            groupSubjects.push(subject._id);
          }

          // Remove selected subject to avoid duplicates
          subjectsToChooseFrom.splice(randomIndex, 1);
        }

        // Create group with unique name (section code + group number)
        groups.push({
          name: `${section.code}-G${i}`,
          section: section._id,
          size: Math.floor(Math.random() * 15) + 15, // 15-30 students
          subjects: groupSubjects
        });
      }
    }

    const createdGroups = await Group.insertMany(groups);
    console.log(`${createdGroups.length} groups created`);
    return createdGroups;
  } catch (error) {
    console.error('Error creating groups:', error);
    process.exit(1);
  }
};

// Function to create sessions
const createSessions = async (subjects, classrooms, groups, teachers) => {
  try {
    console.log('Creating sessions...');
    const sessions = [];

    // Create sessions for the next 30 days
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 5); // Include some past sessions

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 25); // Include future sessions

    // Create 40-50 sessions
    const numSessions = Math.floor(Math.random() * 11) + 40; // 40-50 sessions

    for (let i = 0; i < numSessions; i++) {
      // Random date between start and end date
      const sessionDate = new Date(startDate);
      sessionDate.setDate(startDate.getDate() + Math.floor(Math.random() * ((endDate - startDate) / (24 * 60 * 60 * 1000))));

      // Format date as YYYY-MM-DD
      const formattedDate = sessionDate.toISOString().split('T')[0];

      // Random subject
      const subject = subjects[Math.floor(Math.random() * subjects.length)];

      // Random classroom
      const classroom = classrooms[Math.floor(Math.random() * classrooms.length)];

      // Random groups (1-3)
      const numGroups = Math.floor(Math.random() * 3) + 1;
      const sessionGroups = [];

      // Find groups that study this subject
      const eligibleGroups = groups.filter(group =>
        group.subjects.some(s => s.toString() === subject._id.toString())
      );

      // If no eligible groups, use random groups
      const groupsToChooseFrom = eligibleGroups.length > 0 ? eligibleGroups : groups;

      for (let j = 0; j < numGroups && j < groupsToChooseFrom.length; j++) {
        const randomIndex = Math.floor(Math.random() * groupsToChooseFrom.length);
        sessionGroups.push(groupsToChooseFrom[randomIndex]._id);
        groupsToChooseFrom.splice(randomIndex, 1); // Remove to avoid duplicates
      }

      // Random start time (8:00 - 16:00)
      const startHour = Math.floor(Math.random() * 9) + 8; // 8-16
      const startTime = `${String(startHour).padStart(2, '0')}:00`;

      // Duration from subject or random (60-180 minutes)
      const examDuration = subject.examDuration || (Math.floor(Math.random() * 7) + 3) * 30; // 90-180 minutes in 30-minute increments

      // Calculate end time
      const endHour = startHour + Math.floor(examDuration / 60);
      const endMinutes = examDuration % 60;
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

      // Random supervisors (1-2)
      const numSupervisors = Math.floor(Math.random() * 2) + 1;
      const supervisors = [];

      for (let j = 0; j < numSupervisors && j < teachers.length; j++) {
        const randomIndex = Math.floor(Math.random() * teachers.length);
        supervisors.push(teachers[randomIndex]._id);
        teachers.splice(randomIndex, 1); // Remove to avoid duplicates

        // Add teacher back to the array for next iteration
        if (j === numSupervisors - 1) {
          teachers.push(...teachers.splice(0, j + 1));
        }
      }

      // Determine time-based status for internal use
      let timeStatus;
      if (sessionDate < today) {
        timeStatus = 'completed';
      } else if (sessionDate.toDateString() === today.toDateString()) {
        const currentHour = today.getHours();
        const currentMinutes = today.getMinutes();

        if (currentHour > endHour || (currentHour === endHour && currentMinutes >= endMinutes)) {
          timeStatus = 'completed';
        } else if (currentHour >= startHour && currentHour < endHour) {
          timeStatus = 'ongoing';
        } else {
          timeStatus = 'scheduled';
        }
      } else {
        timeStatus = 'scheduled';
      }

      // For the database, we'll use either the time-based status or an exam type
      // Randomly decide whether to use time-based status or exam type
      // For past or current sessions, always use time-based status
      // For future sessions, use exam type 70% of the time

      let status;
      if (timeStatus === 'completed' || timeStatus === 'ongoing') {
        status = timeStatus;
      } else {
        // For scheduled sessions, 70% chance to use exam type instead
        const useExamType = Math.random() < 0.7;

        if (useExamType) {
          const examTypes = ['devoir_surveille', 'examen_tp', 'examen_principal', 'examen_rattrapage'];
          status = examTypes[Math.floor(Math.random() * examTypes.length)];
        } else {
          status = timeStatus; // Use 'scheduled'
        }
      }

      // Add a small chance of cancelled sessions
      if (timeStatus === 'scheduled' && Math.random() < 0.1) { // 10% chance for scheduled sessions
        status = 'cancelled';
      }

      // Create session
      sessions.push({
        subject: subject._id,
        date: formattedDate,
        startTime,
        endTime,
        examDuration,
        classroom: classroom._id,
        groups: sessionGroups,
        supervisors,
        status, // Use calculated status or exam type
        sections: [] // Will be populated by pre-save middleware
      });
    }

    const createdSessions = await Session.insertMany(sessions);
    console.log(`${createdSessions.length} sessions created`);
    return createdSessions;
  } catch (error) {
    console.error('Error creating sessions:', error);
    process.exit(1);
  }
};

// Main function to populate test data
const populateTestData = async () => {
  try {
    // Clear existing data
    await clearData();

    // Create test data
    const departments = await createDepartments();
    const sections = await createSections(departments);
    const subjects = await createSubjects(departments);
    const classrooms = await createClassrooms();
    const teachers = await createTeachers(departments);
    const groups = await createGroups(sections, subjects);
    await createSessions(subjects, classrooms, groups, teachers);

    console.log('Test data populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating test data:', error);
    process.exit(1);
  }
};

// Run the script
populateTestData();
