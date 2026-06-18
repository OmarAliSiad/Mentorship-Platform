import mongoose from 'mongoose';

const mentorProfileSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  stack_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Stack', 
    required: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  bio: { 
    type: String, 
    default: '' 
  },
  is_verified: { 
    type: Boolean, 
    default: false 
  },
  average_rating: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 5 
  },
  hourly_rate: { 
    type: Number, 
    default: 0, 
    min: 0 
  }
}, { timestamps: true });

export default mongoose.model('MentorProfile', mentorProfileSchema);
