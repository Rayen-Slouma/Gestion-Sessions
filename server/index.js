require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const groupRoutes = require('./routes/groupRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const User = require('./models/User');
const Teacher = require('./models/Teacher');
const Subject = require('./models/Subject');
const Section = require('./models/Section');
const Group = require('./models/Group');
const Classroom = require('./models/Classroom');
const Session = require('./models/Session');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Add a route logger middleware to debug requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Create test users and populate database with sample data
const setupTestData = async () => {
  try {
    // Check if test users exist
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    const teacherExists = await User.findOne({ email: 'teacher@example.com' });
    const studentExists = await User.findOne({ email: 'student@example.com' });
    
    // Create test users
    if (!adminExists) {
      console.log('Creating test admin user...');
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin0',  // SECURITY RISK: This should be removed in production
        role: 'admin'
      });
      console.log('Test admin created successfully');
    }
    
    if (!teacherExists) {
      console.log('Creating test teacher user...');
      const teacherUser = await User.create({
        name: 'Teacher User',
        email: 'teacher@example.com',
        password: 'teacher0',  // SECURITY RISK: This should be removed in production
        role: 'teacher'
      });
      console.log('Test teacher created successfully');
      
      // Create teacher profile
      await Teacher.create({
        user: teacherUser._id,
        department: 'Computer Science',
        availability: [
          { day: 'Monday', startTime: '09:00', endTime: '12:00' },
          { day: 'Wednesday', startTime: '14:00', endTime: '17:00' },
          { day: 'Friday', startTime: '10:00', endTime: '15:00' }
        ],
        supervisionPreferences: {
          maxExamsPerDay: 2
        }
      });
      console.log('Teacher profile created successfully');
    }
    
    if (!studentExists) {
      console.log('Creating test student user...');
      await User.create({
        name: 'Student User',
        email: 'student@example.com',
        password: 'student0',  // SECURITY RISK: This should be removed in production
        role: 'student'
      });
      console.log('Test student created successfully');
    }
    
    // Check if we already have data
    const subjectsCount = await Subject.countDocuments();
    if (subjectsCount > 0) {
      console.log('Sample data already exists. Skipping data creation.');
      return;
    }
    
    // Create sample classrooms
    console.log('Creating sample classrooms...');
    const classrooms = await Classroom.create([
      {
        roomNumber: 'A101',
        building: 'Main Building',
        floor: 1,
        capacity: 50,
        features: ['projector', 'whiteboard']
      },
      {
        roomNumber: 'B205',
        building: 'Science Building',
        floor: 2,
        capacity: 30,
        features: ['computers', 'whiteboard']
      },
      {
        roomNumber: 'C310',
        building: 'Engineering Building',
        floor: 3,
        capacity: 40,
        features: ['projector', 'air_conditioning']
      }
    ]);
    console.log('Sample classrooms created successfully');
    
    // Create sample subjects
    console.log('Creating sample subjects...');
    const subjects = await Subject.create([
      {
        code: 'CS101',
        name: 'Introduction to Computer Science',
        credits: 3,
        department: 'Computer Science',
        examDuration: 120
      },
      {
        code: 'MATH201',
        name: 'Calculus II',
        credits: 4,
        department: 'Mathematics',
        examDuration: 180
      },
      {
        code: 'PHYS110',
        name: 'Physics for Engineers',
        credits: 3,
        department: 'Physics',
        examDuration: 120
      }
    ]);
    console.log('Sample subjects created successfully');
    
    // Create sample sections
    console.log('Creating sample sections...');
    const sections = await Section.create([
      {
        name: 'CS-1',
        course: 'Computer Science',
        major: 'Software Engineering',
        year: 1,
        semester: 1,
        subjects: [subjects[0]._id]
      },
      {
        name: 'MATH-2',
        course: 'Mathematics',
        major: 'Applied Mathematics',
        year: 2,
        semester: 1,
        subjects: [subjects[1]._id]
      },
      {
        name: 'ENG-1',
        course: 'Engineering',
        major: 'Electrical Engineering',
        year: 1,
        semester: 2,
        subjects: [subjects[2]._id]
      }
    ]);
    console.log('Sample sections created successfully');
    
    // Update subjects with section references
    await Promise.all(subjects.map(async (subject, index) => {
      subject.sections = [sections[index]._id];
      await subject.save();
    }));
    
    // Create sample groups
    console.log('Creating sample groups...');
    const groups = await Group.create([
      {
        name: 'CS-1A',
        size: 25,
        section: sections[0]._id,
        students: []
      },
      {
        name: 'CS-1B',
        size: 25,
        section: sections[0]._id,
        students: []
      },
      {
        name: 'MATH-2A',
        size: 20,
        section: sections[1]._id,
        students: []
      },
      {
        name: 'ENG-1A',
        size: 30,
        section: sections[2]._id,
        students: []
      }
    ]);
    console.log('Sample groups created successfully');
    
    // Update sections with group references
    await Promise.all(sections.map(async (section, index) => {
      if (index === 0) {
        section.groups = [groups[0]._id, groups[1]._id];
      } else {
        section.groups = [groups[index + 1]._id];
      }
      await section.save();
    }));
    
    // Update student with group reference
    const student = await User.findOne({ email: 'student@example.com' });
    if (student) {
      groups[0].students.push(student._id);
      await groups[0].save();
    }
    
    // Get teacher reference
    const teacher = await Teacher.findOne({ user: { $exists: true } });
    
    if (teacher) {
      // Update teacher with subjects
      teacher.subjects = subjects.map(subject => subject._id);
      await teacher.save();
      
      // Update subjects with teacher
      await Promise.all(subjects.map(async (subject) => {
        subject.teachers = [teacher._id];
        await subject.save();
      }));
      
      // Create sample sessions (exams)
      console.log('Creating sample exam sessions...');
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const twoWeeks = new Date(today);
      twoWeeks.setDate(twoWeeks.getDate() + 14);
      
      const threeWeeks = new Date(today);
      threeWeeks.setDate(threeWeeks.getDate() + 21);
      
      await Session.create([
        {
          subject: subjects[0]._id,
          date: nextWeek,
          startTime: '09:00',
          endTime: '11:00',
          groups: [groups[0]._id, groups[1]._id],
          classroom: classrooms[0]._id,
          supervisors: [teacher._id],
          status: 'scheduled'
        },
        {
          subject: subjects[1]._id,
          date: twoWeeks,
          startTime: '13:00',
          endTime: '16:00',
          groups: [groups[2]._id],
          classroom: classrooms[1]._id,
          supervisors: [teacher._id],
          status: 'scheduled'
        },
        {
          subject: subjects[2]._id,
          date: threeWeeks,
          startTime: '10:00',
          endTime: '12:00',
          groups: [groups[3]._id],
          classroom: classrooms[2]._id,
          supervisors: [teacher._id],
          status: 'scheduled'
        }
      ]);
      console.log('Sample exam sessions created successfully');
    }
    
    console.log('All sample data created successfully');
  } catch (err) {
    console.error('Error creating test data:', err);
  }
};

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB');
    // Create test users and sample data after successful DB connection
    setupTestData();
  })
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Route not found handler
app.use((req, res, next) => {
  console.log(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
