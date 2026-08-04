import mongoose, { Document, Schema, Types } from 'mongoose';
import { EnrollmentStatus } from '../types';

export interface IEnrollment extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  branch: Types.ObjectId;
  teacher?: Types.ObjectId;
  batchTiming?: string;
  startDate: Date;
  endDate?: Date;
  status: EnrollmentStatus;
  feePaid: number;
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User' },
    batchTiming: { type: String },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date },
    status: { type: String, enum: Object.values(EnrollmentStatus), default: EnrollmentStatus.ACTIVE },
    feePaid: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

// A student can enroll in the same course more than once over time (e.g. after
// cancelling and re-joining), but never hold two simultaneously ACTIVE enrollments
// for the same course.
enrollmentSchema.index(
  { student: 1, course: 1 },
  { unique: true, partialFilterExpression: { status: EnrollmentStatus.ACTIVE } },
);

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);
