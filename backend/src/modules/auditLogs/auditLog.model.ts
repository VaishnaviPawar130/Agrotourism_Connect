import { Schema, model, Types } from 'mongoose';

export interface IAuditLog {
  user?: Types.ObjectId;
  action: string;
  entity: string;
  entityId?: Types.ObjectId;
  timestamp: Date;
  meta?: Record<string, unknown>;
}

const auditLogSchema = new Schema<IAuditLog>({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: Schema.Types.ObjectId },
  timestamp: { type: Date, default: Date.now },
  meta: { type: Schema.Types.Mixed },
});

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
