import { Schema, model, Document, Types } from 'mongoose';
import { ProjectType, ProjectStatus } from './project.types';

export interface IProject extends Document {
  projectName: string;
  projectCode: string;
  slug: string;
  land?: Types.ObjectId;
  landowner?: Types.ObjectId;
  location: string;
  totalLand?: number;
  projectType: ProjectType;
  description?: string;
  status: ProjectStatus;
  projectManager?: Types.ObjectId;
  startDate?: Date;
  expectedCompletion?: Date;
  images: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    projectName: { type: String, required: true },
    projectCode: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    land: { type: Schema.Types.ObjectId, ref: 'Land' },
    landowner: { type: Schema.Types.ObjectId, ref: 'User' },
    location: { type: String, required: true },
    totalLand: { type: Number },
    projectType: { type: String, enum: Object.values(ProjectType), required: true },
    description: { type: String },
    status: { type: String, enum: Object.values(ProjectStatus), default: ProjectStatus.DRAFT, index: true },
    projectManager: { type: Schema.Types.ObjectId, ref: 'User' },
    startDate: { type: Date },
    expectedCompletion: { type: Date },
    images: [{ type: String }],
    isPublic: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

projectSchema.index({ projectName: 'text', location: 'text', description: 'text' });

export const Project = model<IProject>('Project', projectSchema);
