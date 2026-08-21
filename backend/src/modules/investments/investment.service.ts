import { Investment } from './investment.model';
import {
  CreateInvestmentInput,
  UpdateInvestmentInput,
  CreatePaymentInput,
  UpdatePaymentInput,
} from './investment.validation';
import { PaymentStatus } from './investment.types';
import { Project } from '../projects/project.model';
import { InvestorProfile } from '../investors/investor.model';
import { DocumentRecord } from '../documents/document.model';
import { ApiError } from '../../utils/ApiError';

async function assertDocumentBelongsToProject(documentId: string | undefined | null, projectId: string) {
  if (!documentId) return;
  const doc = await DocumentRecord.findById(documentId);
  if (!doc) throw ApiError.notFound('Document not found');
  if (!doc.project || String(doc.project) !== String(projectId)) {
    throw ApiError.badRequest('Document does not belong to the selected project');
  }
}

/**
 * amountReceived must reflect reality, not whatever a client sends — it is
 * always recomputed here from the sum of SUCCESS payment entries and never
 * accepted directly as create/update input.
 */
function recomputeAmountReceived(investment: InstanceType<typeof Investment>) {
  investment.amountReceived = investment.payments
    .filter((p) => p.status === PaymentStatus.SUCCESS)
    .reduce((sum, p) => sum + p.amount, 0);
}

/** Rejects a state where successful payments would exceed an explicitly set commitment. */
function assertWithinCommitment(investment: InstanceType<typeof Investment>) {
  if (investment.committedAmount == null) return;
  if (investment.amountReceived > investment.committedAmount) {
    throw ApiError.badRequest(
      `Amount received (${investment.amountReceived}) would exceed the committed amount (${investment.committedAmount}). Increase the committed amount first if this is intentional.`
    );
  }
}

export async function createInvestment(userId: string, input: CreateInvestmentInput) {
  const project = await Project.findById(input.project);
  if (!project) throw ApiError.notFound('Project not found');

  const investor = await InvestorProfile.findById(input.investor);
  if (!investor) throw ApiError.notFound('Investor profile not found');

  await assertDocumentBelongsToProject(input.agreementDocument, input.project);

  const investment = await Investment.create({
    ...input,
    createdBy: userId,
  });
  return investment;
}

export async function listInvestments(params: {
  page?: number;
  limit?: number;
  status?: string;
  investmentType?: string;
  project?: string;
  investor?: string;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filter: Record<string, unknown> = {};
  if (params.status) filter.status = params.status;
  if (params.investmentType) filter.investmentType = params.investmentType;
  if (params.project) filter.project = params.project;
  if (params.investor) filter.investor = params.investor;

  const [items, total] = await Promise.all([
    Investment.find(filter)
      .populate('project', 'projectName projectCode slug location status')
      .populate('investor', 'investorName company mobile email')
      .populate('agreementDocument', 'title originalName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Investment.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getInvestmentById(id: string) {
  const investment = await Investment.findById(id)
    .populate('project', 'projectName projectCode slug location status')
    .populate('investor', 'investorName company mobile email')
    .populate('agreementDocument', 'title originalName')
    .populate('createdBy', 'fullName')
    .populate('payments.createdBy', 'fullName');
  if (!investment) throw ApiError.notFound('Investment not found');
  return investment;
}

export async function updateInvestment(id: string, input: UpdateInvestmentInput) {
  const investment = await Investment.findById(id);
  if (!investment) throw ApiError.notFound('Investment not found');

  // `agreementDocument` is handled separately: `null` clears the link, a
  // string id is validated then set, and `undefined` (key absent) leaves the
  // existing link untouched.
  const { agreementDocument, ...rest } = input;
  Object.assign(investment, rest);

  if (agreementDocument === null) {
    investment.agreementDocument = undefined;
  } else if (agreementDocument !== undefined) {
    await assertDocumentBelongsToProject(agreementDocument, String(investment.project));
    investment.agreementDocument = agreementDocument as never;
  }

  // committedAmount may have just been lowered below what's already received.
  assertWithinCommitment(investment);

  await investment.save();
  return investment;
}

export async function deleteInvestment(id: string) {
  const investment = await Investment.findById(id);
  if (!investment) throw ApiError.notFound('Investment not found');
  await investment.deleteOne();
}

export async function addPayment(investmentId: string, userId: string, input: CreatePaymentInput) {
  const investment = await Investment.findById(investmentId);
  if (!investment) throw ApiError.notFound('Investment not found');

  investment.payments.push({ ...input, createdBy: userId } as never);

  recomputeAmountReceived(investment);
  assertWithinCommitment(investment);

  await investment.save();
  return investment;
}

export async function updatePaymentStatus(investmentId: string, paymentId: string, input: UpdatePaymentInput) {
  const investment = await Investment.findById(investmentId);
  if (!investment) throw ApiError.notFound('Investment not found');

  const payment = investment.payments.id(paymentId);
  if (!payment) throw ApiError.notFound('Payment not found');

  const previousStatus = payment.status;
  payment.status = input.status;

  recomputeAmountReceived(investment);
  try {
    assertWithinCommitment(investment);
  } catch (err) {
    // Roll back in memory so the rejected transition is never persisted.
    payment.status = previousStatus;
    recomputeAmountReceived(investment);
    throw err;
  }

  await investment.save();
  return investment;
}

export async function deletePayment(investmentId: string, paymentId: string) {
  const investment = await Investment.findById(investmentId);
  if (!investment) throw ApiError.notFound('Investment not found');

  const payment = investment.payments.id(paymentId);
  if (!payment) throw ApiError.notFound('Payment not found');

  payment.deleteOne();
  recomputeAmountReceived(investment);
  await investment.save();
  return investment;
}
