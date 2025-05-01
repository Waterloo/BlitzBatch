import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, trim: true },
  company: { type: String, triim: true },
  status: { type: String, enum: ['active', 'inactive', 'pending'], 
    default: 'active' },
  tags: { type: [String] },
  lastContactedAt: { type: Date }
}, { timestamps: true,  indexes: [
  { email: 1 },
  { status: 1 },
  { company: 1 }
]});

export const Contact = mongoose.model('Contact', ContactSchema);
