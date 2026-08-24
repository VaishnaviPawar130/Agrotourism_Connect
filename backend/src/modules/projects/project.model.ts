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
  /** Stored filename of the admin-uploaded thumbnail, or undefined if none was uploaded. Never exposed as a raw filesystem path — see `thumbnailUrl`. */
  thumbnail?: string;
  /** Public, safe URL for the thumbnail, derived from `thumbnail`. Read-only; not persisted. */
  readonly thumbnailUrl?: string;
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
    thumbnail: { type: String },
    isPublic: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

projectSchema.index({ projectName: 'text', location: 'text', description: 'text' });

// Never expose the raw stored filename as a filesystem path — only ever a
// same-origin URL served through the scoped static mount in app.ts.
projectSchema.virtual('thumbnailUrl').get(function (this: IProject) {
  return this.thumbnail ? `/uploads/projects/${this.thumbnail}` : undefined;
});

export const Project = model<IProject>('Project', projectSchema);
