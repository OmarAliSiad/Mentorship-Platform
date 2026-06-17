import mongoose from 'mongoose';

const stackSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, default: '', trim: true }
}, { timestamps: true });

export default mongoose.model('Stack', stackSchema);
