import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  mentor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorProfile',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduled_date: {
    type: Date,
    required: true
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
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'canceled'],
    default: 'scheduled'
  },
  submission_description: {
    type: String,
    default: ''
  },
  mentor_notes: {
    type: String,
    default: ''
  },
  meeting_link: {
    type: String,
    default: '',
    trim: true
  }
}, { timestamps: true });

// Indexes for query optimization
sessionSchema.index({ mentor_id: 1, status: 1, scheduled_date: 1 });
sessionSchema.index({ student_id: 1, status: 1, scheduled_date: 1 });
sessionSchema.index({ status: 1 });

export default mongoose.model('Session', sessionSchema);
