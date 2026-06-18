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
    required: true 
  },
  end_time: { 
    type: String, 
    required: true 
  }
}, { timestamps: true });

export default mongoose.model('MentorAvailability', mentorAvailabilitySchema);
