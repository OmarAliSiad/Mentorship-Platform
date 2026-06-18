import express from 'express';
import Stack from '../models/Stack.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET is accessible to any authenticated user (so mentors can see stacks)
router.get('/', protect, async (_req, res) => {
  res.json(await Stack.find().sort({ name: 1 }));
});

// Admin-only routes
router.use(protect, authorizeRoles('Admin'));

router.post('/', async (req, res) => {
  const { name, description = '' } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
  res.status(201).json(await Stack.create({ name, description }));
});

router.put('/:id', async (req, res) => {
  const { name, description = '' } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });

  const stack = await Stack.findByIdAndUpdate(req.params.id, { name, description }, { new: true });
  if (!stack) return res.status(404).json({ message: 'Stack not found' });
  res.json(stack);
});

router.delete('/:id', async (req, res) => {
  const stack = await Stack.findByIdAndDelete(req.params.id);
  if (!stack) return res.status(404).json({ message: 'Stack not found' });
  res.status(204).end();
});

export default router;
