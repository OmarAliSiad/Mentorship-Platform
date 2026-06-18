import mongoose from 'mongoose';

const mentorAvailabilitySchema = new mongoose.Schema({
  mentor_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MentorProfile', 
    required: true 
  },
  day_of_week: { 
    type: String, 
    required: true,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  start_time: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'start_time must be in HH:MM format'
    }
  },
  end_time: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'end_time must be in HH:MM format'
    }
  }
}, { timestamps: true });

export default mongoose.model('MentorAvailability', mentorAvailabilitySchema);
