import { Schema, model, Document, Types } from 'mongoose';
import { EmploymentType, VacancyStatus } from './vacancy.types';

export interface IVacancy extends Document {
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  openings: number;

  minExperience?: number;
  maxExperience?: number;
  minSalary?: number;
  maxSalary?: number;

  description: string;
  responsibilities: string[];
  requiredSkills: string[];

  applicationDeadline?: Date;
  status: VacancyStatus;
  featured: boolean;
  urgent: boolean;

  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const vacancySchema = new Schema<IVacancy>(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    employmentType: { type: String, enum: Object.values(EmploymentType), required: true },
    openings: { type: Number, required: true, min: 1, default: 1 },

    minExperience: { type: Number, min: 0 },
    maxExperience: { type: Number, min: 0 },
    minSalary: { type: Number, min: 0 },
    maxSalary: { type: Number, min: 0 },

    description: { type: String, required: true, trim: true },
    responsibilities: { type: [String], default: [] },
    requiredSkills: { type: [String], default: [] },

    applicationDeadline: { type: Date },
    status: { type: String, enum: Object.values(VacancyStatus), default: VacancyStatus.DRAFT, index: true },
    featured: { type: Boolean, default: false },
    urgent: { type: Boolean, default: false },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

vacancySchema.index({ title: 'text', department: 'text', location: 'text' });
// Supports the public listing query (status + not-expired, newest first).
vacancySchema.index({ status: 1, applicationDeadline: 1, createdAt: -1 });

export const Vacancy = model<IVacancy>('Vacancy', vacancySchema);
