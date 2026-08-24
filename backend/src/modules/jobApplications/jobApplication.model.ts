import { Schema, model, Document, Types } from 'mongoose';
import { ApplicationStatus } from './jobApplication.types';

export interface IApplicationNote {
  _id: Types.ObjectId;
  note: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

export interface IJobApplication extends Document {
  vacancy: Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  experience: number;
  currentCompany?: string;
  currentCTC?: number;
  expectedCTC?: number;
  noticePeriod?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  coverNote?: string;

  resumePath: string;
  resumeOriginalName: string;
  resumeMimeType: string;

  status: ApplicationStatus;
  // Internal-only — never populated/returned on any public-facing endpoint.
  internalNotes: IApplicationNote[];

  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<IApplicationNote>(
  {
    note: { type: String, required: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const jobApplicationSchema = new Schema<IJobApplication>(
  {
    vacancy: { type: Schema.Types.ObjectId, ref: 'Vacancy', required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    city: { type: String, trim: true },
    experience: { type: Number, required: true, min: 0, max: 60 },
    currentCompany: { type: String, trim: true },
    currentCTC: { type: Number, min: 0 },
    expectedCTC: { type: Number, min: 0 },
    noticePeriod: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    portfolioUrl: { type: String, trim: true },
    coverNote: { type: String, trim: true },

    resumePath: { type: String, required: true },
    resumeOriginalName: { type: String, required: true },
    resumeMimeType: { type: String, required: true },

    status: { type: String, enum: Object.values(ApplicationStatus), default: ApplicationStatus.NEW, index: true },
    internalNotes: { type: [noteSchema], default: [] },
  },
  { timestamps: true }
);

// Supports the duplicate-application lookup (same vacancy + email/phone within a short window).
jobApplicationSchema.index({ vacancy: 1, email: 1, createdAt: -1 });
jobApplicationSchema.index({ vacancy: 1, phone: 1, createdAt: -1 });

export const JobApplication = model<IJobApplication>('JobApplication', jobApplicationSchema);
