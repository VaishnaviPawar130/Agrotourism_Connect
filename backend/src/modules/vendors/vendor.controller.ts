import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { parsePagination } from '../../utils/parsePagination';
import { createVendorSchema, updateVendorSchema } from './vendor.validation';
import * as vendorService from './vendor.service';
import { logAudit } from '../auditLogs/auditLog.service';

export const createVendorHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createVendorSchema.parse(req.body);
  const vendor = await vendorService.createVendor(req.user!.id, input);
  await logAudit({
    userId: req.user!.id,
    action: 'VENDOR_CREATED',
    entity: 'Vendor',
    entityId: vendor.id,
    meta: { project: input.project, category: input.category },
  });
  sendSuccess(res, vendor, 'Vendor created', 201);
});

export const listVendorsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, category, workStatus, paymentStatus, project, search } = req.query as Record<string, string>;
  const result = await vendorService.listVendors({
    ...parsePagination(page, limit),
    category,
    workStatus,
    paymentStatus,
    project,
    search,
  });
  sendSuccess(res, result, 'Vendors fetched');
});

export const getVendorHandler = asyncHandler(async (req: Request, res: Response) => {
  const vendor = await vendorService.getVendorById(req.params.id);
  sendSuccess(res, vendor, 'Vendor fetched');
});

export const updateVendorHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateVendorSchema.parse(req.body);
  const vendor = await vendorService.updateVendor(req.params.id, input);
  await logAudit({ userId: req.user!.id, action: 'VENDOR_UPDATED', entity: 'Vendor', entityId: vendor.id });
  sendSuccess(res, vendor, 'Vendor updated');
});

export const deleteVendorHandler = asyncHandler(async (req: Request, res: Response) => {
  await vendorService.deleteVendor(req.params.id);
  await logAudit({ userId: req.user!.id, action: 'VENDOR_DELETED', entity: 'Vendor', entityId: req.params.id });
  sendSuccess(res, null, 'Vendor deleted');
});
