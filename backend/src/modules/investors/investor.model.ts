import { Schema, model, Document, Types } from 'mongoose';
import { InvestmentRange } from './investor.types';
import { ProjectType } from '../projects/project.types';

export interface IInvestorProfile extends Document {
  user: Types.ObjectId;
  investorName: string;
  company?: string;
  mobile: string;
  email?: string;
  city?: string;
  state?: string;
  preferredInvestmentRange?: InvestmentRange;
  preferredLocations: string[];
  preferredProjectTypes: ProjectType[];
  createdAt: Date;
  updatedAt: Date;
}

const investorProfileSchema = new Schema<IInvestorProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    investorName: { type: String, required: true },
    company: { type: String },
    mobile: { type: String, required: true },
    email: { type: String },
    city: { type: String },
    state: { type: String },
    preferredInvestmentRange: { type: String, enum: Object.values(InvestmentRange) },
    preferredLocations: [{ type: String }],
    preferredProjectTypes: [{ type: String, enum: Object.values(ProjectType) }],
  },
  { timestamps: true }
);

export const InvestorProfile = model<IInvestorProfile>('InvestorProfile', investorProfileSchema);
