import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'barber'], default: 'user' },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('User', userSchema);
