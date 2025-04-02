const mongoose = require('mongoose');

const ClassroomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  building: {
    type: String,
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  features: [{
    type: String,
    enum: ['projector', 'computers', 'whiteboard', 'accessibility', 'air_conditioning']
  }],
  availability: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Classroom', ClassroomSchema);
