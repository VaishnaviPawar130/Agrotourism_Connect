import { Schema, model, Document, Types } from 'mongoose';

export interface IEnquiry extends Document {
  name: string;
  mobile: string;
  email?: string;
  city?: string;
  requirement?: string;
  message?: string;
  lead?: Types.ObjectId;
  createdAt: Date;
}

const enquirySchema = new Schema<IEnquiry>(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String },
    city: { type: String },
    requirement: { type: String },
    message: { type: String },
    lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Supports the duplicate-submission lookup (same name + mobile within a short window).
enquirySchema.index({ mobile: 1, createdAt: -1 });

export const Enquiry = model<IEnquiry>('Enquiry', enquirySchema);
