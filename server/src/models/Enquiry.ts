import mongoose, { Document, Schema } from 'mongoose';

export enum EnquiryStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  RESOLVED = 'RESOLVED',
}

export interface IEnquiry extends Document {
  name: string;
  email: string;
  phone: string;
  courseOfInterest: string;
  message?: string;
  status: EnquiryStatus;
  createdAt: Date;
  updatedAt: Date;
}

const enquirySchema = new Schema<IEnquiry>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    courseOfInterest: { type: String, required: true, trim: true },
    message: { type: String, trim: true },
    status: { type: String, enum: Object.values(EnquiryStatus), default: EnquiryStatus.NEW },
  },
  { timestamps: true }
);

export const Enquiry = mongoose.model<IEnquiry>('Enquiry', enquirySchema);
