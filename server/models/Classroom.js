const mongoose = require('mongoose');

const ClassroomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  building: {
    type: String,
    required: false
  },
  floor: {
    type: Number,
    required: false
  },
  capacity: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    default: ''
  },
  features: [{
    type: String,
    enum: ['projector', 'computers', 'whiteboard', 'air_conditioning', 'heating', 'internet']
  }],
  availability: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Classroom', ClassroomSchema);
