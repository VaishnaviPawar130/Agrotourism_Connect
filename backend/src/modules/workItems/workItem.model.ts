import { Schema, model, Document, Types } from 'mongoose';
import { WorkItemCategory, WorkItemStatus } from './workItem.types';

export interface IProjectWorkItem extends Document {
  project: Types.ObjectId;
  title: string;
  category: WorkItemCategory;
  estimatedCost?: number;
  actualCost?: number;
  startDate?: Date;
  dueDate?: Date;
  completionDate?: Date;
  progress: number;
  status: WorkItemStatus;
  responsiblePerson?: Types.ObjectId;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const workItemSchema = new Schema<IProjectWorkItem>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: Object.values(WorkItemCategory), required: true, index: true },

    estimatedCost: { type: Number, min: 0 },
    actualCost: { type: Number, min: 0 },

    startDate: { type: Date },
    dueDate: { type: Date },
    completionDate: { type: Date },

    progress: { type: Number, min: 0, max: 100, default: 0 },
    status: { type: String, enum: Object.values(WorkItemStatus), default: WorkItemStatus.NOT_STARTED, index: true },

    responsiblePerson: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, trim: true },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const ProjectWorkItem = model<IProjectWorkItem>('ProjectWorkItem', workItemSchema);
