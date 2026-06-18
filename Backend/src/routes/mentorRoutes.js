import express from 'express';
import { getMentorProfile, updateMentorProfile, getMentorAvailability, createMentorAvailability, updateMentorAvailability, deleteMentorAvailability } from '../controllers/mentorController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, authorizeRoles('Mentor'), getMentorProfile);
router.put('/profile', protect, authorizeRoles('Mentor'), updateMentorProfile);
router.get('/availability', protect, authorizeRoles('Mentor'), getMentorAvailability);
router.post('/availability', protect, authorizeRoles('Mentor'), createMentorAvailability);
router.put('/availability/:id', protect, authorizeRoles('Mentor'), updateMentorAvailability);
router.delete('/availability/:id', protect, authorizeRoles('Mentor'), deleteMentorAvailability);

export default router;
