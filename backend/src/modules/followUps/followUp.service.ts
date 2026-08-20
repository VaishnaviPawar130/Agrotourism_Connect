import { LeadFollowUp } from './followUp.model';
import { CreateFollowUpInput } from './followUp.validation';
import { Lead } from '../leads/lead.model';
import { LeadStatus } from '../leads/lead.types';

export async function createFollowUp(userId: string, input: CreateFollowUpInput) {
  const followUp = await LeadFollowUp.create({ ...input, addedBy: userId });

  if (input.nextFollowUpAt) {
    await Lead.findByIdAndUpdate(input.lead, {
      nextFollowUpAt: input.nextFollowUpAt,
      status: LeadStatus.FOLLOW_UP,
    });
  }

  return followUp;
}

export async function listFollowUpsForLead(leadId: string) {
  return LeadFollowUp.find({ lead: leadId }).populate('addedBy', 'fullName email').sort({ date: -1 });
}

export async function listDueFollowUps(before: Date) {
  return LeadFollowUp.find({ nextFollowUpAt: { $lte: before } })
    .populate('lead')
    .sort({ nextFollowUpAt: 1 });
}
