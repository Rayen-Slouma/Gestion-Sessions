const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subject',
    required: [true, 'Please add a subject']
  },
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  startTime: {
    type: String,
    required: [true, 'Please add a start time'],
    match: [
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Please add a valid time format (HH:MM)'
    ]
  },
  endTime: {
    type: String,
    required: [true, 'Please add an end time'],
    match: [
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Please add a valid time format (HH:MM)'
    ]
  },
  examDuration: {
    type: Number,
    min: [15, 'Exam duration must be at least 15 minutes'],
    default: 120 // 2 hours in minutes
  },
  classroom: {
    type: mongoose.Schema.ObjectId,
    ref: 'Classroom',
    required: [true, 'Please add a classroom']
  },
  groups: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Group',
    required: [true, 'Please add at least one group']
  }],
  supervisors: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Teacher'
  }],
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'devoir_surveille', 'examen_tp', 'examen_principal', 'examen_rattrapage'],
    default: 'scheduled'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Session', SessionSchema);
