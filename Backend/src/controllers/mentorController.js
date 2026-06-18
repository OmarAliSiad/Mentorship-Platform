import MentorProfile from '../models/MentorProfile.js';
import MentorAvailability from '../models/MentorAvailability.js';
import Session from '../models/Session.js';
import mongoose from 'mongoose';

const handleControllerError = (res, error, context) => {
  console.error(`Error ${context}:`, error);
  if (error.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: error.message });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Invalid ${error.path}: ${error.value}` });
  }
  res.status(500).json({ success: false, message: 'Server error' });
};

export const getMentorProfile = async (req, res) => {
  try {
    const mentorProfile = await MentorProfile.findOne({ user_id: req.user._id })
      .populate('stack_id');

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found'
      });
    }

    res.json({
      success: true,
      mentor: {
        id: mentorProfile._id,
        name: mentorProfile.name,
        title: mentorProfile.title,
        bio: mentorProfile.bio,
        is_verified: mentorProfile.is_verified,
        average_rating: mentorProfile.average_rating,
        hourly_rate: mentorProfile.hourly_rate,
        stack: mentorProfile.stack_id
      }
    });
  } catch (error) {
    handleControllerError(res, error, 'fetching mentor profile');
  }
};

export const updateMentorProfile = async (req, res) => {
  try {
    const { name, title, bio, hourly_rate, stack_id } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (title !== undefined) updateData.title = title;
    if (bio !== undefined) updateData.bio = bio;
    if (hourly_rate !== undefined) updateData.hourly_rate = hourly_rate;
    if (stack_id !== undefined) updateData.stack_id = stack_id;

    const mentorProfile = await MentorProfile.findOneAndUpdate(
      { user_id: req.user._id },
      updateData,
      {
        new: true,
        runValidators: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    ).populate('stack_id');

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found'
      });
    }

    res.json({
      success: true,
      mentor: {
        id: mentorProfile._id,
        name: mentorProfile.name,
        title: mentorProfile.title,
        bio: mentorProfile.bio,
        is_verified: mentorProfile.is_verified,
        average_rating: mentorProfile.average_rating,
        hourly_rate: mentorProfile.hourly_rate,
        stack: mentorProfile.stack_id
      }
    });
  } catch (error) {
    handleControllerError(res, error, 'updating mentor profile');
  }
};

export const getMentorAvailability = async (req, res) => {
  try {
    const mentorProfile = await MentorProfile.findOne({ user_id: req.user._id });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found'
      });
    }

    const availability = await MentorAvailability.find({ mentor_id: mentorProfile._id })
      .sort({ day_of_week: 1, start_time: 1 });

    res.json({
      success: true,
      availability
    });
  } catch (error) {
    handleControllerError(res, error, 'fetching mentor availability');
  }
};

export const createMentorAvailability = async (req, res) => {
  try {
    const { day_of_week, start_time, end_time } = req.body;

    if (!day_of_week || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'day_of_week, start_time, and end_time are required'
      });
    }

    if (end_time <= start_time) {
      return res.status(400).json({
        success: false,
        message: 'end_time must be greater than start_time'
      });
    }

    const mentorProfile = await MentorProfile.findOne({ user_id: req.user._id });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found'
      });
    }

    const existingSlots = await MentorAvailability.find({
      mentor_id: mentorProfile._id,
      day_of_week
    });

    for (const slot of existingSlots) {
      if (start_time < slot.end_time && end_time > slot.start_time) {
        return res.status(400).json({
          success: false,
          message: 'Availability slot overlaps with an existing slot'
        });
      }
    }

    const availability = await MentorAvailability.create({
      mentor_id: mentorProfile._id,
      day_of_week,
      start_time,
      end_time
    });

    res.status(201).json({
      success: true,
      availability
    });
  } catch (error) {
    handleControllerError(res, error, 'creating mentor availability');
  }
};

export const updateMentorAvailability = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability slot id'
      });
    }

    const { day_of_week, start_time, end_time } = req.body;

    const mentorProfile = await MentorProfile.findOne({ user_id: req.user._id });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found'
      });
    }

    const availabilitySlot = await MentorAvailability.findById(req.params.id);

    if (!availabilitySlot) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found'
      });
    }

    if (availabilitySlot.mentor_id.toString() !== mentorProfile._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found'
      });
    }

    const updateData = {};
    if (day_of_week !== undefined) updateData.day_of_week = day_of_week;
    if (start_time !== undefined) updateData.start_time = start_time;
    if (end_time !== undefined) updateData.end_time = end_time;

    const newDayOfWeek = updateData.day_of_week || availabilitySlot.day_of_week;
    const newStartTime = updateData.start_time || availabilitySlot.start_time;
    const newEndTime = updateData.end_time || availabilitySlot.end_time;

    if (newEndTime <= newStartTime) {
      return res.status(400).json({
        success: false,
        message: 'end_time must be greater than start_time'
      });
    }

    const existingSlots = await MentorAvailability.find({
      mentor_id: mentorProfile._id,
      day_of_week: newDayOfWeek,
      _id: { $ne: req.params.id }
    });

    for (const slot of existingSlots) {
      if (newStartTime < slot.end_time && newEndTime > slot.start_time) {
        return res.status(400).json({
          success: false,
          message: 'Availability slot overlaps with an existing slot'
        });
      }
    }

    const updatedAvailability = await MentorAvailability.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      availability: updatedAvailability
    });
  } catch (error) {
    handleControllerError(res, error, 'updating mentor availability');
  }
};

export const deleteMentorAvailability = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability slot id'
      });
    }

    const mentorProfile = await MentorProfile.findOne({ user_id: req.user._id });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found'
      });
    }

    const availabilitySlot = await MentorAvailability.findById(req.params.id);

    if (!availabilitySlot) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found'
      });
    }

    if (availabilitySlot.mentor_id.toString() !== mentorProfile._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found'
      });
    }

    await MentorAvailability.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Availability slot deleted successfully'
    });
  } catch (error) {
    handleControllerError(res, error, 'deleting mentor availability');
  }
};

export const getMentorSessions = async (req, res) => {
  try {
    const mentorProfile = await MentorProfile.findOne({ user_id: req.user._id });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found'
      });
    }

    const sessions = await Session.find({ mentor_id: mentorProfile._id })
      .populate('student_id', 'name email')
      .sort({ scheduled_date: 1, start_time: 1 });

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    handleControllerError(res, error, 'fetching mentor sessions');
  }
};

export const updateSessionNotes = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session id'
      });
    }

    const mentorProfile = await MentorProfile.findOne({ user_id: req.user._id });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found'
      });
    }

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.mentor_id.toString() !== mentorProfile._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (
      typeof req.body.mentor_notes !== 'string' ||
      !req.body.mentor_notes.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'mentor_notes is required'
      });
    }

    session.mentor_notes = req.body.mentor_notes;
    await session.save();

    res.json({
      success: true,
      session
    });
  } catch (error) {
    handleControllerError(res, error, 'updating session notes');
  }
};

export const updateSessionStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session id'
      });
    }

    const mentorProfile = await MentorProfile.findOne({ user_id: req.user._id });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found'
      });
    }

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.mentor_id.toString() !== mentorProfile._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const { status } = req.body;

    if (status !== 'completed' && status !== 'canceled') {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    session.status = status;
    await session.save();

    res.json({
      success: true,
      session
    });
  } catch (error) {
    handleControllerError(res, error, 'updating session status');
  }
};

export const getMentorSessionHistory = async (req, res) => {
  try {
    const mentorProfile = await MentorProfile.findOne({ user_id: req.user._id });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found'
      });
    }

    const sessions = await Session.find({
      mentor_id: mentorProfile._id,
      status: { $in: ['completed', 'canceled'] }
    })
      .populate('student_id', 'name email')
      .sort({ scheduled_date: -1 });

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    handleControllerError(res, error, 'fetching mentor session history');
  }
};
