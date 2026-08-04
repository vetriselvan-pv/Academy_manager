import { Schema, Types } from 'mongoose';
import { User, IUser } from './User';
import { UserRole } from '../types';

export interface IStudent extends IUser {
  branch: Types.ObjectId;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
}

const studentSchema = new Schema<IStudent>({
  branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
  address: { type: String },
  guardianName: { type: String, trim: true },
  guardianPhone: { type: String, trim: true },
});

export const Student = User.discriminator<IStudent>(UserRole.STUDENT, studentSchema);
