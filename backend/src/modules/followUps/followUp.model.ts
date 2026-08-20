import { Schema, model, Document, Types } from 'mongoose';

export interface ILeadFollowUp extends Document {
  lead: Types.ObjectId;
  date: Date;
  communicationType: string;
  notes?: string;
  nextAction?: string;
  nextFollowUpAt?: Date;
  addedBy: Types.ObjectId;
  createdAt: Date;
}

const followUpSchema = new Schema<ILeadFollowUp>(
  {
    lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    date: { type: Date, default: Date.now },
    communicationType: { type: String, required: true },
    notes: { type: String },
    nextAction: { type: String },
    nextFollowUpAt: { type: Date },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const LeadFollowUp = model<ILeadFollowUp>('LeadFollowUp', followUpSchema);
