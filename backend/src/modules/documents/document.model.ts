import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';
import { DocumentCategory, DocumentVisibility } from './document.types';

export interface IDocumentRecord extends MongooseDocument {
  title: string;
  category: DocumentCategory;
  visibility: DocumentVisibility;
  filePath: string;
  originalName: string;
  mimeType: string;
  documentNumber?: string;
  issueDate?: Date;
  expiryDate?: Date;
  land?: Types.ObjectId;
  project?: Types.ObjectId;
  owner?: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocumentRecord>(
  {
    title: { type: String, required: true },
    category: { type: String, enum: Object.values(DocumentCategory), default: DocumentCategory.OTHER },
    visibility: { type: String, enum: Object.values(DocumentVisibility), default: DocumentVisibility.ADMIN_ONLY },
    filePath: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    documentNumber: { type: String },
    issueDate: { type: Date },
    expiryDate: { type: Date },
    land: { type: Schema.Types.ObjectId, ref: 'Land' },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const DocumentRecord = model<IDocumentRecord>('DocumentRecord', documentSchema);
