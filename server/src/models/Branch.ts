import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBranch extends Document {
  name: string;
  code: string;
  address: string;
  city: string;
  state?: string;
  phone?: string;
  email?: string;
  manager?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    phone: { type: String },
    email: { type: String, lowercase: true, trim: true },
    manager: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Branch = mongoose.model<IBranch>('Branch', branchSchema);
