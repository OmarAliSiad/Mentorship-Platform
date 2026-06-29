import express from 'express';
import { getMentorProfile, updateMentorProfile, getMentorAvailability, createMentorAvailability, updateMentorAvailability, deleteMentorAvailability, getMentorSessions, updateSessionNotes, updateSessionMeetingLink, updateSessionStatus, getMentorSessionHistory } from '../controllers/mentorController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, authorizeRoles('Mentor'), getMentorProfile);
router.put('/profile', protect, authorizeRoles('Mentor'), updateMentorProfile);
router.get('/availability', protect, authorizeRoles('Mentor'), getMentorAvailability);
router.post('/availability', protect, authorizeRoles('Mentor'), createMentorAvailability);
router.put('/availability/:id', protect, authorizeRoles('Mentor'), updateMentorAvailability);
router.delete('/availability/:id', protect, authorizeRoles('Mentor'), deleteMentorAvailability);
router.get('/sessions', protect, authorizeRoles('Mentor'), getMentorSessions);
router.get('/sessions/history', protect, authorizeRoles('Mentor'), getMentorSessionHistory);
router.put('/sessions/:id/link', protect, authorizeRoles('Mentor'), updateSessionMeetingLink);
router.put('/sessions/:id/notes', protect, authorizeRoles('Mentor'), updateSessionNotes);
router.put('/sessions/:id/status', protect, authorizeRoles('Mentor'), updateSessionStatus);

export default router;
