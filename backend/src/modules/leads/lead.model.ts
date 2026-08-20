import { Schema, model, Document, Types } from 'mongoose';
import { LeadSource, LeadType, LeadStatus } from './lead.types';

export interface ILead extends Document {
  name: string;
  mobile: string;
  email?: string;
  location?: string;
  source: LeadSource;
  leadType: LeadType;
  requirement?: string;
  budget?: string;
  assignedTo?: Types.ObjectId;
  nextFollowUpAt?: Date;
  notes?: string;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String },
    location: { type: String },
    source: { type: String, enum: Object.values(LeadSource), default: LeadSource.WEBSITE },
    leadType: { type: String, enum: Object.values(LeadType), required: true },
    requirement: { type: String },
    budget: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    nextFollowUpAt: { type: Date },
    notes: { type: String },
    status: { type: String, enum: Object.values(LeadStatus), default: LeadStatus.NEW, index: true },
  },
  { timestamps: true }
);

leadSchema.index({ name: 'text', mobile: 'text', email: 'text' });
// Supports the dedup lookup in createLeadFromSource (mobile + leadType).
leadSchema.index({ mobile: 1, leadType: 1 });

export const Lead = model<ILead>('Lead', leadSchema);
