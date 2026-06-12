import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Mentor', 'Student'], required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

// Pre-save hook to hash passwords
userSchema.pre('save', async function (next) {
  if (!this.isModified('password_hash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
});

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password_hash);
};

export default mongoose.model('User', userSchema);