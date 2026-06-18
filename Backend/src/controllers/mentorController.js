import MentorProfile from '../models/MentorProfile.js';

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
    console.error('Error fetching mentor profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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
        runValidators: true
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
    console.error('Error updating mentor profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
