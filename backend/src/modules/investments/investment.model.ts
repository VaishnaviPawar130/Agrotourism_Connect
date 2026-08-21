import { Schema, model, Document, Types } from 'mongoose';
import {
  InvestmentType,
  InvestmentStatus,
  DueDiligenceStatus,
  PaymentMode,
  PaymentStatus,
} from './investment.types';

export interface IInvestmentPayment extends Types.Subdocument {
  amount: number;
  paymentDate: Date;
  paymentMode: PaymentMode;
  paymentModeOther?: string;
  referenceNumber?: string;
  status: PaymentStatus;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

export interface IInvestment extends Document {
  project: Types.ObjectId;
  investor: Types.ObjectId;
  investmentType: InvestmentType;

  proposedAmount?: number;
  committedAmount?: number;
  amountReceived: number;

  commitmentDate?: Date;
  expectedFundingDate?: Date;

  status: InvestmentStatus;
  dueDiligenceStatus: DueDiligenceStatus;
  agreementDocument?: Types.ObjectId;
  notes?: string;

  payments: Types.DocumentArray<IInvestmentPayment>;

  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IInvestmentPayment>(
  {
    amount: { type: Number, required: true, min: 0.01 },
    paymentDate: { type: Date, required: true },
    paymentMode: { type: String, enum: Object.values(PaymentMode), required: true },
    paymentModeOther: { type: String, trim: true },
    referenceNumber: { type: String, trim: true },
    status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const investmentSchema = new Schema<IInvestment>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    investor: { type: Schema.Types.ObjectId, ref: 'InvestorProfile', required: true, index: true },
    investmentType: { type: String, enum: Object.values(InvestmentType), required: true },

    proposedAmount: { type: Number, min: 0 },
    committedAmount: { type: Number, min: 0 },
    // Derived server-side from the sum of SUCCESS payments — never accepted
    // directly from client input. See investment.service.ts recomputeAmountReceived.
    amountReceived: { type: Number, min: 0, default: 0 },

    commitmentDate: { type: Date },
    expectedFundingDate: { type: Date },

    status: { type: String, enum: Object.values(InvestmentStatus), default: InvestmentStatus.INTERESTED, index: true },
    dueDiligenceStatus: { type: String, enum: Object.values(DueDiligenceStatus), default: DueDiligenceStatus.NOT_STARTED, index: true },
    agreementDocument: { type: Schema.Types.ObjectId, ref: 'DocumentRecord' },
    notes: { type: String, trim: true },

    payments: { type: [paymentSchema], default: [] },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Investment = model<IInvestment>('Investment', investmentSchema);
