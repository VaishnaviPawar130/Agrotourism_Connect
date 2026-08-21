import { Schema, model, Document, Types } from 'mongoose';
import { MilestoneCategory, MilestoneStatus } from './milestone.types';

export interface IMilestone extends Document {
  project: Types.ObjectId;
  title: string;
  description?: string;
  category: MilestoneCategory;

  targetDate?: Date;
  actualCompletionDate?: Date;

  progress: number;
  status: MilestoneStatus;
  responsiblePerson?: Types.ObjectId;
  workItem?: Types.ObjectId;
  notes?: string;

  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, enum: Object.values(MilestoneCategory), required: true, index: true },

    targetDate: { type: Date },
    actualCompletionDate: { type: Date },

    progress: { type: Number, min: 0, max: 100, default: 0 },
    status: { type: String, enum: Object.values(MilestoneStatus), default: MilestoneStatus.NOT_STARTED, index: true },
    responsiblePerson: { type: Schema.Types.ObjectId, ref: 'User' },
    workItem: { type: Schema.Types.ObjectId, ref: 'ProjectWorkItem' },
    notes: { type: String, trim: true },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

milestoneSchema.index({ title: 'text', description: 'text' });

export const Milestone = model<IMilestone>('Milestone', milestoneSchema);
