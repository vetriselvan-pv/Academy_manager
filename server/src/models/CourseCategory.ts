import mongoose, { Document, Schema } from 'mongoose';

export interface ICourseCategory extends Document {
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseCategorySchema = new Schema<ICourseCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

export const CourseCategory = mongoose.model<ICourseCategory>('CourseCategory', CourseCategorySchema);
