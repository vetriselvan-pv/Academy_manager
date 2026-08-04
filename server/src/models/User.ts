import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../types';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(UserRole), required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    discriminatorKey: 'role',
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const User = mongoose.model<IUser>('User', userSchema);
export const SuperAdmin = User.discriminator(UserRole.SUPER_ADMIN, new Schema({}));
