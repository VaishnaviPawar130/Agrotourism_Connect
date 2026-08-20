import { Types } from 'mongoose';
import { AuditLog } from './auditLog.model';

export async function logAudit(params: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  meta?: Record<string, unknown>;
}) {
  try {
    await AuditLog.create({
      user: params.userId ? new Types.ObjectId(params.userId) : undefined,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId ? new Types.ObjectId(params.entityId) : undefined,
      meta: params.meta,
    });
  } catch (err) {
    console.error('[audit] failed to write audit log', err);
  }
}
