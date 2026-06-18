import express from 'express';
import { getMentors, getMentorDetails, bookSession, getStudentSessions, cancelSession } from '../controllers/studentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/mentors', getMentors);
router.get('/mentors/:id', getMentorDetails);
router.post('/sessions', protect, authorizeRoles('Student'), bookSession);
router.get('/sessions', protect, authorizeRoles('Student'), getStudentSessions);
router.put('/sessions/:id/cancel', protect, authorizeRoles('Student'), cancelSession);

export default router;
