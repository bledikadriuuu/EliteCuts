import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const serviceSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true, index: true },
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    duration_minutes: { type: Number, required: true },
    price: { type: Number, required: true },
    created_at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.model('Service', serviceSchema);
