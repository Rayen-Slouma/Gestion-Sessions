const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  }
});

const TeacherSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  availability: [AvailabilitySchema],
  supervisionPreferences: {
    maxExamsPerDay: {
      type: Number,
      default: 2
    },
    preferredRooms: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom'
    }]
  }
});

module.exports = mongoose.model('Teacher', TeacherSchema);
