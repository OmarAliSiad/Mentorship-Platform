import express from 'express';
import { getMentorProfile, updateMentorProfile, getMentorAvailability } from '../controllers/mentorController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, authorizeRoles('Mentor'), getMentorProfile);
router.put('/profile', protect, authorizeRoles('Mentor'), updateMentorProfile);
router.get('/availability', protect, authorizeRoles('Mentor'), getMentorAvailability);

export default router;
