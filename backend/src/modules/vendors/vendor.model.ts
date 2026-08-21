import { Schema, model, Document, Types } from 'mongoose';
import { VendorCategory, VendorWorkStatus, VendorPaymentStatus } from './vendor.types';

export interface IVendor extends Document {
  vendorName: string;
  category: VendorCategory;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;

  project: Types.ObjectId;
  workItem?: Types.ObjectId;
  assignedWork?: string;

  quotationAmount?: number;
  workOrderNumber?: string;
  workOrderDate?: Date;

  startDate?: Date;
  expectedCompletionDate?: Date;
  actualCompletionDate?: Date;

  paymentStatus: VendorPaymentStatus;
  workStatus: VendorWorkStatus;
  notes?: string;

  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    vendorName: { type: String, required: true, trim: true },
    category: { type: String, enum: Object.values(VendorCategory), required: true, index: true },
    contactPerson: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },

    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    workItem: { type: Schema.Types.ObjectId, ref: 'ProjectWorkItem' },
    assignedWork: { type: String, trim: true },

    quotationAmount: { type: Number, min: 0 },
    workOrderNumber: { type: String, trim: true },
    workOrderDate: { type: Date },

    startDate: { type: Date },
    expectedCompletionDate: { type: Date },
    actualCompletionDate: { type: Date },

    paymentStatus: { type: String, enum: Object.values(VendorPaymentStatus), default: VendorPaymentStatus.NOT_PAID, index: true },
    workStatus: { type: String, enum: Object.values(VendorWorkStatus), default: VendorWorkStatus.NOT_STARTED, index: true },
    notes: { type: String, trim: true },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

vendorSchema.index({ vendorName: 'text', assignedWork: 'text' });

export const Vendor = model<IVendor>('Vendor', vendorSchema);
