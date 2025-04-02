const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  }],
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true
  },
  supervisors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  }],
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  }
});

module.exports = mongoose.model('Session', SessionSchema);
