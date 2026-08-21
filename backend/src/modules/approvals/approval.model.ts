import { Schema, model, Document, Types } from 'mongoose';
import { ApprovalType, ApprovalStatus } from './approval.types';

export interface IApproval extends Document {
  project: Types.ObjectId;
  approvalName: string;
  approvalType: ApprovalType;
  authority?: string;
  referenceNumber?: string;

  appliedDate?: Date;
  expectedApprovalDate?: Date;
  approvalDate?: Date;
  expiryDate?: Date;

  status: ApprovalStatus;
  responsiblePerson?: Types.ObjectId;
  remarks?: string;
  document?: Types.ObjectId;

  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const approvalSchema = new Schema<IApproval>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    approvalName: { type: String, required: true, trim: true },
    approvalType: { type: String, enum: Object.values(ApprovalType), required: true, index: true },
    authority: { type: String, trim: true },
    referenceNumber: { type: String, trim: true },

    appliedDate: { type: Date },
    expectedApprovalDate: { type: Date },
    approvalDate: { type: Date },
    expiryDate: { type: Date },

    status: { type: String, enum: Object.values(ApprovalStatus), default: ApprovalStatus.NOT_STARTED, index: true },
    responsiblePerson: { type: Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String, trim: true },
    document: { type: Schema.Types.ObjectId, ref: 'DocumentRecord' },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Approval = model<IApproval>('Approval', approvalSchema);
