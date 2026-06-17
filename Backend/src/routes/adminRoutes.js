import express from 'express';
import User from '../models/User.js';
import Stack from '../models/Stack.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorizeRoles('Admin'));

router.get('/users', async (_req, res) => {
  const users = await User.find().select('-password_hash').sort({ created_at: -1 });
  res.json(users);
});

router.put('/users/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'blocked'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password_hash');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

router.get('/statistics', async (_req, res) => {
  const sessions = User.db.collection('sessions');
  const [totalUsers, totalMentors, totalStudents, totalStacks, scheduledSessions, completedSessions, canceledSessions] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'Mentor' }),
    User.countDocuments({ role: 'Student' }),
    Stack.countDocuments(),
    sessions.countDocuments({ status: 'scheduled' }).catch(() => 0),
    sessions.countDocuments({ status: 'completed' }).catch(() => 0),
    sessions.countDocuments({ status: 'canceled' }).catch(() => 0),
  ]);

  res.json({
    totalUsers,
    totalMentors,
    totalStudents,
    totalStacks,
    scheduledSessions,
    completedSessions,
    canceledSessions,
    totalSessions: scheduledSessions + completedSessions + canceledSessions,
  });
});

export default router;
