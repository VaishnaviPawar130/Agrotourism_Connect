import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { createEnquirySchema } from './enquiry.validation';
import * as enquiryService from './enquiry.service';

export const createEnquiryHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createEnquirySchema.parse(req.body);
  const enquiry = await enquiryService.createEnquiry(input);
  sendSuccess(res, enquiry, 'Thank you, we will get back to you shortly', 201);
});

export const listEnquiriesHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search } = req.query as Record<string, string>;
  const result = await enquiryService.listEnquiries({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    search,
  });
  sendSuccess(res, result, 'Enquiries fetched');
});
