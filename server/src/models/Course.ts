import mongoose, { Document, Schema } from 'mongoose';


export interface ICourse extends Document {
  name: string;
  category: mongoose.Types.ObjectId;
  description?: string;
  durationMonths?: number;
  fee: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'CourseCategory', required: true },
    description: { type: String },
    durationMonths: { type: Number, min: 1 },
    fee: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Course = mongoose.model<ICourse>('Course', courseSchema);
