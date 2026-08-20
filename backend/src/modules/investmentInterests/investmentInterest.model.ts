import { Schema, model, Document, Types } from 'mongoose';
import { InvestmentInterestAction, InvestmentInterestStatus } from './investmentInterest.types';

export interface IInvestmentInterest extends Document {
  investor: Types.ObjectId;
  project: Types.ObjectId;
  action: InvestmentInterestAction;
  message?: string;
  status: InvestmentInterestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const investmentInterestSchema = new Schema<IInvestmentInterest>(
  {
    investor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    action: { type: String, enum: Object.values(InvestmentInterestAction), required: true },
    message: { type: String },
    status: { type: String, enum: Object.values(InvestmentInterestStatus), default: InvestmentInterestStatus.NEW },
  },
  { timestamps: true }
);

export const InvestmentInterest = model<IInvestmentInterest>('InvestmentInterest', investmentInterestSchema);
