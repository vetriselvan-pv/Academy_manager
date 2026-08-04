import { Schema, Types } from 'mongoose';
import { User, IUser } from './User';
import { UserRole, TeacherDesignation, Permission, DESIGNATION_PERMISSIONS } from '../types';

export interface ITeacher extends IUser {
  designation: TeacherDesignation;
  branches: Types.ObjectId[];
  specializedCourses: Types.ObjectId[];
  permissions: Permission[];
  joiningDate?: Date;
}

const teacherSchema = new Schema<ITeacher>({
  designation: {
    type: String,
    enum: Object.values(TeacherDesignation),
    required: true,
    default: TeacherDesignation.INSTRUCTOR,
  },
  branches: [{ type: Schema.Types.ObjectId, ref: 'Branch', required: true }],
  specializedCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  permissions: [{ type: String, enum: Object.values(Permission) }],
  joiningDate: { type: Date },
});

teacherSchema.pre('validate', function preValidate(next) {
  if (!this.permissions || this.permissions.length === 0) {
    this.permissions = DESIGNATION_PERMISSIONS[this.designation];
  }
  next();
});

export const Teacher = User.discriminator<ITeacher>(UserRole.TEACHER, teacherSchema);
