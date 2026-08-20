import { Schema, model, Document, Types } from 'mongoose';
import { SiteVisitStatus } from './siteVisit.types';

export interface ISiteVisit extends Document {
  lead?: Types.ObjectId;
  project?: Types.ObjectId;
  visitDate: Date;
  visitTime?: string;
  visitorCount?: number;
  assignedTo?: Types.ObjectId;
  meetingPoint?: string;
  remarks?: string;
  status: SiteVisitStatus;
  postVisitNotes?: string;
  postVisitPhotos: string[];
  customerFeedback?: string;
  nextAction?: string;
  createdAt: Date;
  updatedAt: Date;
}

const siteVisitSchema = new Schema<ISiteVisit>(
  {
    lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    visitDate: { type: Date, required: true },
    visitTime: { type: String },
    visitorCount: { type: Number },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    meetingPoint: { type: String },
    remarks: { type: String },
    status: { type: String, enum: Object.values(SiteVisitStatus), default: SiteVisitStatus.SCHEDULED, index: true },
    postVisitNotes: { type: String },
    postVisitPhotos: [{ type: String }],
    customerFeedback: { type: String },
    nextAction: { type: String },
  },
  { timestamps: true }
);

export const SiteVisit = model<ISiteVisit>('SiteVisit', siteVisitSchema);
