import mongoose from 'mongoose';
import MentorProfile from '../models/MentorProfile.js';
import MentorAvailability from '../models/MentorAvailability.js';
import Session from '../models/Session.js';

export const getMentors = async (req, res) => {
  try {
    const { stack, search, sort_by = 'rating', page = 1, limit = 10 } = req.query;
    let query = {}; // Temporarily removed is_verified requirement for local testing

    if (stack) {
      query.stack_id = stack;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    const sortConfig = {};
    if (sort_by === 'rating') sortConfig.average_rating = -1;
    else if (sort_by === 'price_low') sortConfig.hourly_rate = 1;
    else if (sort_by === 'price_high') sortConfig.hourly_rate = -1;
    else sortConfig.average_rating = -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const mentors = await MentorProfile.find(query)
      .populate('stack_id', 'name')
      .sort(sortConfig)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MentorProfile.countDocuments(query);

    res.json({
      mentors,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMentorDetails = async (req, res) => {
  try {
    const mentor = await MentorProfile.findOne({ user_id: req.params.id }).populate('stack_id', 'name');
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
    
    const availability = await MentorAvailability.find({ mentor_id: mentor._id });
    res.json({ mentor, availability });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const bookSession = async (req, res) => {
  try {
    const { mentor_id, scheduled_date, start_time, end_time, submission_description } = req.body;
    const student_id = req.user.id;

    if (!mentor_id || !mongoose.Types.ObjectId.isValid(mentor_id)) {
      return res.status(400).json({ message: 'Invalid mentor_id.' });
    }

    const dateObj = new Date(scheduled_date);
    if (isNaN(dateObj)) {
      return res.status(400).json({ message: 'Invalid scheduled_date.' });
    }

    // Helper to convert HH:MM to minutes for safe comparison
    const timeToMinutes = (timeStr) => {
      if (!timeStr || !timeStr.includes(':')) return 0;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const requestedStart = timeToMinutes(start_time);
    const requestedEnd = timeToMinutes(end_time);

    if (requestedEnd <= requestedStart) {
      return res.status(400).json({ message: 'end_time must be after start_time.' });
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[dateObj.getUTCDay()];

    // Get mentor availability for the requested day
    const availabilities = await MentorAvailability.find({
      mentor_id,
      day_of_week: dayOfWeek
    });

    if (availabilities.length === 0) {
      return res.status(400).json({ message: `Mentor is not available on ${dayOfWeek}s.` });
    }

    // Check if requested time falls fully within any of the slots
    const isWithinSlot = availabilities.some(slot => {
      const slotStart = timeToMinutes(slot.start_time);
      const slotEnd = timeToMinutes(slot.end_time);
      return requestedStart >= slotStart && requestedEnd <= slotEnd;
    });

    if (!isWithinSlot) {
      return res.status(400).json({ message: 'Requested time is outside the mentor\'s availability slots.' });
    }

    // Check overlap
    const overlappingSession = await Session.findOne({
      mentor_id,
      scheduled_date: new Date(scheduled_date),
      status: { $in: ['scheduled', 'completed'] },
      $or: [
        { start_time: { $lt: end_time }, end_time: { $gt: start_time } }
      ]
    });

    if (overlappingSession) {
      return res.status(409).json({ message: 'Time slot is no longer available.' });
    }

    const newSession = await Session.create({
      mentor_id,
      student_id,
      scheduled_date: new Date(scheduled_date),
      start_time,
      end_time,
      submission_description
    });

    res.status(201).json({ session: newSession });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getStudentSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ student_id: req.user.id })
      .populate('mentor_id', 'name email title average_rating hourly_rate')
      .sort({ scheduled_date: -1, start_time: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const cancelSession = async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, student_id: req.user.id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    
    session.status = 'canceled';
    await session.save();
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
