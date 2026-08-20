import { User } from '../users/user.model';
import { UserRole } from '../users/user.types';
import { Land } from '../lands/land.model';
import { Project } from '../projects/project.model';
import { InvestorProfile } from '../investors/investor.model';
import { Lead } from '../leads/lead.model';
import { LeadStatus } from '../leads/lead.types';
import { SiteVisit } from '../siteVisits/siteVisit.model';
import { SiteVisitStatus } from '../siteVisits/siteVisit.types';
import { LeadFollowUp } from '../followUps/followUp.model';

export async function getDashboardSummary() {
  const now = new Date();

  const [
    totalUsers,
    totalLandowners,
    totalInvestors,
    totalLandSubmissions,
    totalProjects,
    newLeads,
    followUpsDue,
    siteVisitsScheduled,
    recentLeads,
    upcomingSiteVisits,
    recentLandSubmissions,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: UserRole.LANDOWNER }),
    InvestorProfile.countDocuments(),
    Land.countDocuments(),
    Project.countDocuments(),
    Lead.countDocuments({ status: LeadStatus.NEW }),
    LeadFollowUp.countDocuments({ nextFollowUpAt: { $lte: now } }),
    SiteVisit.countDocuments({ status: SiteVisitStatus.SCHEDULED }),
    Lead.find().sort({ createdAt: -1 }).limit(5),
    SiteVisit.find({ status: SiteVisitStatus.SCHEDULED }).sort({ visitDate: 1 }).limit(5),
    Land.find().sort({ createdAt: -1 }).limit(5),
  ]);

  return {
    counts: {
      totalUsers,
      totalLandowners,
      totalInvestors,
      totalLandSubmissions,
      totalProjects,
      newLeads,
      followUpsDue,
      siteVisitsScheduled,
    },
    recent: {
      leads: recentLeads,
      siteVisits: upcomingSiteVisits,
      landSubmissions: recentLandSubmissions,
    },
  };
}
