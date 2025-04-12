const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const Classroom = require('../models/Classroom');
const Group = require('../models/Group');
const Section = require('../models/Section');
const Department = require('../models/Department');
const Session = require('../models/Session');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Clear database and seed with test data
const resetAndSeedDatabase = async () => {
  try {
    console.log('Clearing database...'.yellow);

    // Delete all existing data
    await Session.deleteMany();
    await Group.deleteMany();
    await Section.deleteMany();
    await Subject.deleteMany();
    await Classroom.deleteMany();
    await Teacher.deleteMany();
    await Department.deleteMany();
    await User.deleteMany();

    console.log('Database cleared successfully'.green);

    // Create admin user
    console.log('Creating admin user...'.yellow);

    // Instead of pre-hashing the password, let the User model handle it
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log(`Admin user created: ${adminUser.name}`.green);

    // Create departments
    console.log('Creating departments...'.yellow);
    const departments = await Department.insertMany([
      { name: 'Computer Science', code: 'CS' },
      { name: 'Mathematics', code: 'MATH' },
      { name: 'Physics', code: 'PHYS' },
      { name: 'Engineering', code: 'ENG' },
      { name: 'Business', code: 'BUS' }
    ]);
    console.log(`${departments.length} departments created`.green);

    // Create sections
    console.log('Creating sections...'.yellow);
    const sections = await Section.insertMany([
      { name: 'CS-1', code: 'CS1', department: departments[0]._id },
      { name: 'CS-2', code: 'CS2', department: departments[0]._id },
      { name: 'MATH-1', code: 'MATH1', department: departments[1]._id },
      { name: 'PHYS-1', code: 'PHYS1', department: departments[2]._id },
      { name: 'ENG-1', code: 'ENG1', department: departments[3]._id },
      { name: 'BUS-1', code: 'BUS1', department: departments[4]._id }
    ]);
    console.log(`${sections.length} sections created`.green);

    // Create teacher users
    console.log('Creating teacher users...'.yellow);

    // Create teachers one by one to ensure password hashing works correctly
    const teacherData = [
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        password: 'teacher123',
        role: 'teacher'
      },
      {
        name: 'Emily Johnson',
        email: 'emily.johnson@example.com',
        password: 'teacher123',
        role: 'teacher'
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@example.com',
        password: 'teacher123',
        role: 'teacher'
      },
      {
        name: 'Sarah Davis',
        email: 'sarah.davis@example.com',
        password: 'teacher123',
        role: 'teacher'
      },
      {
        name: 'David Wilson',
        email: 'david.wilson@example.com',
        password: 'teacher123',
        role: 'teacher'
      }
    ];

    const teacherUsers = [];
    for (const teacher of teacherData) {
      const newTeacher = await User.create(teacher);
      teacherUsers.push(newTeacher);
    }
    console.log(`${teacherUsers.length} teacher users created`.green);

    // Create teacher profiles
    console.log('Creating teacher profiles...'.yellow);
    const teachers = await Teacher.insertMany([
      {
        user: teacherUsers[0]._id,
        department: 'Computer Science',
        availability: [
          { day: 'Monday', startTime: '09:00', endTime: '12:00' },
          { day: 'Wednesday', startTime: '14:00', endTime: '17:00' }
        ],
        supervisionPreferences: { maxExamsPerDay: 2 }
      },
      {
        user: teacherUsers[1]._id,
        department: 'Mathematics',
        availability: [
          { day: 'Tuesday', startTime: '10:00', endTime: '15:00' },
          { day: 'Thursday', startTime: '09:00', endTime: '12:00' }
        ],
        supervisionPreferences: { maxExamsPerDay: 3 }
      },
      {
        user: teacherUsers[2]._id,
        department: 'Physics',
        availability: [
          { day: 'Monday', startTime: '13:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '12:00' }
        ],
        supervisionPreferences: { maxExamsPerDay: 2 }
      },
      {
        user: teacherUsers[3]._id,
        department: 'Engineering',
        availability: [
          { day: 'Wednesday', startTime: '09:00', endTime: '12:00' },
          { day: 'Friday', startTime: '13:00', endTime: '17:00' }
        ],
        supervisionPreferences: { maxExamsPerDay: 2 }
      },
      {
        user: teacherUsers[4]._id,
        department: 'Business',
        availability: [
          { day: 'Tuesday', startTime: '13:00', endTime: '17:00' },
          { day: 'Thursday', startTime: '09:00', endTime: '12:00' }
        ],
        supervisionPreferences: { maxExamsPerDay: 2 }
      }
    ]);
    console.log(`${teachers.length} teacher profiles created`.green);

    // Create student users
    console.log('Creating student users...'.yellow);

    // Create students one by one to ensure password hashing works correctly
    const studentData = [
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        password: 'student123',
        role: 'student'
      },
      {
        name: 'Bob Williams',
        email: 'bob.williams@example.com',
        password: 'student123',
        role: 'student'
      },
      {
        name: 'Charlie Brown',
        email: 'charlie.brown@example.com',
        password: 'student123',
        role: 'student'
      },
      {
        name: 'Diana Miller',
        email: 'diana.miller@example.com',
        password: 'student123',
        role: 'student'
      },
      {
        name: 'Edward Davis',
        email: 'edward.davis@example.com',
        password: 'student123',
        role: 'student'
      },
      {
        name: 'Fiona Wilson',
        email: 'fiona.wilson@example.com',
        password: 'student123',
        role: 'student'
      },
      {
        name: 'George Martin',
        email: 'george.martin@example.com',
        password: 'student123',
        role: 'student'
      },
      {
        name: 'Hannah Clark',
        email: 'hannah.clark@example.com',
        password: 'student123',
        role: 'student'
      },
      {
        name: 'Ian Lewis',
        email: 'ian.lewis@example.com',
        password: 'student123',
        role: 'student'
      },
      {
        name: 'Julia Walker',
        email: 'julia.walker@example.com',
        password: 'student123',
        role: 'student'
      }
    ];

    const studentUsers = [];
    for (const student of studentData) {
      const newStudent = await User.create(student);
      studentUsers.push(newStudent);
    }
    console.log(`${studentUsers.length} student users created`.green);

    // Create subjects
    console.log('Creating subjects...'.yellow);
    const subjects = await Subject.insertMany([
      {
        name: 'Introduction to Programming',
        code: 'CS101',
        examDuration: 120,
        credits: 3,
        department: 'Computer Science',
        teachers: [teachers[0]._id]
      },
      {
        name: 'Data Structures and Algorithms',
        code: 'CS201',
        examDuration: 150,
        credits: 4,
        department: 'Computer Science',
        teachers: [teachers[0]._id]
      },
      {
        name: 'Calculus I',
        code: 'MATH101',
        examDuration: 120,
        credits: 3,
        department: 'Mathematics',
        teachers: [teachers[1]._id]
      },
      {
        name: 'Linear Algebra',
        code: 'MATH201',
        examDuration: 120,
        credits: 3,
        department: 'Mathematics',
        teachers: [teachers[1]._id]
      },
      {
        name: 'Physics I',
        code: 'PHYS101',
        examDuration: 120,
        credits: 3,
        department: 'Physics',
        teachers: [teachers[2]._id]
      },
      {
        name: 'Engineering Principles',
        code: 'ENG101',
        examDuration: 120,
        credits: 3,
        department: 'Engineering',
        teachers: [teachers[3]._id]
      },
      {
        name: 'Business Management',
        code: 'BUS101',
        examDuration: 120,
        credits: 3,
        department: 'Business',
        teachers: [teachers[4]._id]
      },
      {
        name: 'Database Systems',
        code: 'CS301',
        examDuration: 150,
        credits: 4,
        department: 'Computer Science',
        teachers: [teachers[0]._id]
      }
    ]);
    console.log(`${subjects.length} subjects created`.green);

    // Create classrooms
    console.log('Creating classrooms...'.yellow);
    const classrooms = await Classroom.insertMany([
      {
        roomNumber: 'A101',
        building: 'Main Building',
        floor: 1,
        capacity: 50,
        features: ['whiteboard', 'projector', 'computers', 'internet']
      },
      {
        roomNumber: 'A102',
        building: 'Main Building',
        floor: 1,
        capacity: 40,
        features: ['whiteboard', 'projector', 'internet']
      },
      {
        roomNumber: 'B201',
        building: 'Science Building',
        floor: 2,
        capacity: 60,
        features: ['whiteboard', 'projector', 'internet', 'air_conditioning']
      },
      {
        roomNumber: 'B202',
        building: 'Science Building',
        floor: 2,
        capacity: 30,
        features: ['whiteboard', 'projector', 'computers', 'internet']
      },
      {
        roomNumber: 'C301',
        building: 'Engineering Building',
        floor: 3,
        capacity: 80,
        features: ['whiteboard', 'projector', 'internet', 'air_conditioning']
      },
      {
        roomNumber: 'C302',
        building: 'Engineering Building',
        floor: 3,
        capacity: 45,
        features: ['whiteboard', 'projector', 'internet']
      }
    ]);
    console.log(`${classrooms.length} classrooms created`.green);

    // Create groups
    console.log('Creating groups...'.yellow);
    const groups = await Group.insertMany([
      {
        name: 'CS-1A',
        size: 25,
        section: sections[0]._id,
        students: [studentUsers[0]._id, studentUsers[1]._id],
        subjects: [subjects[0]._id, subjects[1]._id, subjects[2]._id]
      },
      {
        name: 'CS-1B',
        size: 25,
        section: sections[0]._id,
        students: [studentUsers[2]._id, studentUsers[3]._id],
        subjects: [subjects[0]._id, subjects[1]._id, subjects[2]._id]
      },
      {
        name: 'CS-2A',
        size: 20,
        section: sections[1]._id,
        students: [studentUsers[4]._id, studentUsers[5]._id],
        subjects: [subjects[1]._id, subjects[7]._id, subjects[3]._id]
      },
      {
        name: 'MATH-1A',
        size: 30,
        section: sections[2]._id,
        students: [studentUsers[6]._id, studentUsers[7]._id],
        subjects: [subjects[2]._id, subjects[3]._id]
      },
      {
        name: 'PHYS-1A',
        size: 25,
        section: sections[3]._id,
        students: [studentUsers[8]._id, studentUsers[9]._id],
        subjects: [subjects[4]._id, subjects[2]._id]
      }
    ]);
    console.log(`${groups.length} groups created`.green);

    // Create some exam sessions
    console.log('Creating exam sessions...'.yellow);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const sessions = await Session.insertMany([
      {
        subject: subjects[0]._id,
        date: tomorrow,
        startTime: '09:00',
        endTime: '11:00',
        classroom: classrooms[0]._id,
        groups: [groups[0]._id, groups[1]._id],
        supervisors: [teachers[0]._id, teachers[2]._id],
        status: 'scheduled',
        examDuration: 120
      },
      {
        subject: subjects[2]._id,
        date: tomorrow,
        startTime: '13:00',
        endTime: '15:00',
        classroom: classrooms[1]._id,
        groups: [groups[3]._id],
        supervisors: [teachers[1]._id],
        status: 'scheduled',
        examDuration: 120
      },
      {
        subject: subjects[4]._id,
        date: nextWeek,
        startTime: '09:00',
        endTime: '11:00',
        classroom: classrooms[2]._id,
        groups: [groups[4]._id],
        supervisors: [teachers[2]._id],
        status: 'scheduled',
        examDuration: 120
      }
    ]);
    console.log(`${sessions.length} exam sessions created`.green);

    console.log('Database seeded successfully!'.green.bold);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

// Run the function
resetAndSeedDatabase();
