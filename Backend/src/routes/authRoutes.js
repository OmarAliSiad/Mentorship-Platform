import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);


// Test routes to verify our auth middleware is working correctly

// // NEW: A protected test route that ONLY logged-in users can hit
// router.get('/me', protect, (req, res) => {
//   res.status(200).json(req.user);
// });

// // NEW: A highly restricted route that ONLY Admins can hit
// router.get('/admin-only', protect, authorizeRoles('Admin'), (req, res) => {
//   res.status(200).json({ message: "Welcome to the secret admin club." });
// });

export default router;