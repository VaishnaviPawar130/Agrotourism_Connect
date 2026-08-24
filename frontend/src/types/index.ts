export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  LANDOWNER = 'LANDOWNER',
  INVESTOR = 'INVESTOR',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  BLOCKED = 'BLOCKED',
}

export interface User {
  /** Mongo document id. The API serializes this as `_id`, matching every other
   *  entity — this interface previously declared `id`, so `user.id` was always
   *  undefined and the admin Users page sent status updates to `/users/undefined`. */
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: UserRole;
  city?: string;
  state?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export enum LandStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SITE_VISIT_REQUIRED = 'SITE_VISIT_REQUIRED',
  FEASIBLE = 'FEASIBLE',
  NOT_FEASIBLE = 'NOT_FEASIBLE',
  PROPOSAL_PREPARED = 'PROPOSAL_PREPARED',
  INVESTOR_REQUIRED = 'INVESTOR_REQUIRED',
  DEVELOPMENT_STARTED = 'DEVELOPMENT_STARTED',
  OPERATIONAL = 'OPERATIONAL',
}

export enum AreaUnit {
  ACRE = 'ACRE',
  GUNTHA = 'GUNTHA',
  HECTARE = 'HECTARE',
  SQFT = 'SQFT',
}

export enum DevelopmentInterest {
  AGRO_TOURISM = 'AGRO_TOURISM',
  RESORT = 'RESORT',
  FARM_STAY = 'FARM_STAY',
  TOURISM_PLOTTING = 'TOURISM_PLOTTING',
  VILLA_DEVELOPMENT = 'VILLA_DEVELOPMENT',
  WELLNESS_TOURISM = 'WELLNESS_TOURISM',
  ADVENTURE_TOURISM = 'ADVENTURE_TOURISM',
  NURSERY = 'NURSERY',
  ORGANIC_FARM = 'ORGANIC_FARM',
  MIXED_PROJECT = 'MIXED_PROJECT',
}

export interface Land {
  _id: string;
  owner: string | User;
  ownerName: string;
  mobile: string;
  email?: string;
  landTitle: string;
  state: string;
  district: string;
  taluka?: string;
  village?: string;
  surveyNumber?: string;
  totalArea: number;
  areaUnit: AreaUnit;
  status: LandStatus;
  developmentInterests: DevelopmentInterest[];
  photos: string[];
  videos: string[];
  documents: string[];
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ProjectType {
  AGRO_TOURISM = 'AGRO_TOURISM',
  RESORT = 'RESORT',
  FARM_STAY = 'FARM_STAY',
  TOURISM_PLOTTING = 'TOURISM_PLOTTING',
  VILLA_RESORT = 'VILLA_RESORT',
  WELLNESS_RESORT = 'WELLNESS_RESORT',
  ECO_RESORT = 'ECO_RESORT',
  MIXED_TOURISM_DEVELOPMENT = 'MIXED_TOURISM_DEVELOPMENT',
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  PLANNING = 'PLANNING',
  FEASIBILITY = 'FEASIBILITY',
  INVESTOR_REQUIRED = 'INVESTOR_REQUIRED',
  UNDER_DEVELOPMENT = 'UNDER_DEVELOPMENT',
  OPERATIONAL = 'OPERATIONAL',
  ON_HOLD = 'ON_HOLD',
  CLOSED = 'CLOSED',
}

export interface Project {
  _id: string;
  projectName: string;
  projectCode: string;
  slug: string;
  location: string;
  totalLand?: number;
  projectType: ProjectType;
  description?: string;
  status: ProjectStatus;
  images: string[];
  /** Stored filename of the admin-uploaded thumbnail, if any. Prefer `thumbnailUrl` for display. */
  thumbnail?: string;
  /** Safe, ready-to-use URL for the thumbnail (server-relative). Undefined when no thumbnail has been uploaded. */
  thumbnailUrl?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum InvestmentRange {
  BELOW_25L = 'BELOW_25L',
  RANGE_25_50L = 'RANGE_25_50L',
  RANGE_50L_1CR = 'RANGE_50L_1CR',
  RANGE_1_5CR = 'RANGE_1_5CR',
  RANGE_5_10CR = 'RANGE_5_10CR',
  ABOVE_10CR = 'ABOVE_10CR',
}

export interface InvestorProfile {
  _id: string;
  user: string;
  investorName: string;
  company?: string;
  mobile: string;
  email?: string;
  city?: string;
  state?: string;
  preferredInvestmentRange?: InvestmentRange;
  preferredLocations: string[];
  preferredProjectTypes: ProjectType[];
}

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  INTERESTED = 'INTERESTED',
  FOLLOW_UP = 'FOLLOW_UP',
  MEETING_SCHEDULED = 'MEETING_SCHEDULED',
  SITE_VISIT_SCHEDULED = 'SITE_VISIT_SCHEDULED',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  NEGOTIATION = 'NEGOTIATION',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST',
  NOT_INTERESTED = 'NOT_INTERESTED',
}

export enum LeadType {
  LANDOWNER = 'LANDOWNER',
  INVESTOR = 'INVESTOR',
  CUSTOMER = 'CUSTOMER',
  RESORT_OPERATOR = 'RESORT_OPERATOR',
  DEVELOPER = 'DEVELOPER',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
}

export enum LeadSource {
  WEBSITE = 'WEBSITE',
  WHATSAPP = 'WHATSAPP',
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  GOOGLE_ADS = 'GOOGLE_ADS',
  REFERRAL = 'REFERRAL',
  EXISTING_CUSTOMER = 'EXISTING_CUSTOMER',
  EVENT = 'EVENT',
  BROKER = 'BROKER',
  OTHER = 'OTHER',
}

export interface Lead {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  location?: string;
  source: LeadSource;
  leadType: LeadType;
  requirement?: string;
  budget?: string;
  status: LeadStatus;
  nextFollowUpAt?: string;
  notes?: string;
  createdAt: string;
}

export enum SiteVisitStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
  NO_SHOW = 'NO_SHOW',
}

export interface SiteVisit {
  _id: string;
  lead?: Lead | string;
  project?: Project | string;
  visitDate: string;
  visitTime?: string;
  visitorCount?: number;
  meetingPoint?: string;
  remarks?: string;
  status: SiteVisitStatus;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export enum SuitabilityRating {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  MODERATE = 'MODERATE',
  POOR = 'POOR',
  NOT_ASSESSED = 'NOT_ASSESSED',
}

export enum FeasibilityStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FEASIBLE = 'FEASIBLE',
  NOT_FEASIBLE = 'NOT_FEASIBLE',
  FEASIBLE_WITH_CONDITIONS = 'FEASIBLE_WITH_CONDITIONS',
}

export enum RiskSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface FeasibilityRisk {
  description: string;
  severity: RiskSeverity;
  mitigation?: string;
}

export interface FeasibilityAssessment {
  _id: string;
  project: Project | string;
  land?: { _id: string; landTitle: string; district: string; state: string } | string;

  landSuitability: SuitabilityRating;
  usableLandArea?: number;
  usableLandAreaUnit?: string;
  landSuitabilityNotes?: string;

  accessibilityRating: SuitabilityRating;
  roadConnectivity: SuitabilityRating;
  nearestHighwayDistanceKm?: number;
  nearestRailwayDistanceKm?: number;
  nearestAirportDistanceKm?: number;
  publicTransportAvailable?: boolean;
  accessibilityNotes?: string;

  waterAvailability: SuitabilityRating;
  waterSourceDetails?: string;
  electricityAvailability: SuitabilityRating;
  electricityDetails?: string;

  existingInfrastructureNotes?: string;
  existingStructuresUsable?: boolean;

  surroundingAttractions?: string;
  tourismPotential: SuitabilityRating;
  tourismPotentialNotes?: string;

  developmentSuitability: SuitabilityRating;
  risks: FeasibilityRisk[];
  recommendations?: string;
  adminNotes?: string;

  status: FeasibilityStatus;
  assessedBy?: { _id: string; fullName: string } | string;
  assessedAt?: string;
  createdBy?: { _id: string; fullName: string } | string;
  createdAt: string;
  updatedAt: string;
}

export enum WorkItemCategory {
  ROAD = 'ROAD',
  WATER = 'WATER',
  ELECTRICITY = 'ELECTRICITY',
  DRAINAGE = 'DRAINAGE',
  LANDSCAPING = 'LANDSCAPING',
  PLANTATION = 'PLANTATION',
  COTTAGE_VILLA = 'COTTAGE_VILLA',
  POOL = 'POOL',
  RESTAURANT = 'RESTAURANT',
  GAZEBO = 'GAZEBO',
  AMENITIES = 'AMENITIES',
  OTHER = 'OTHER',
}

export enum WorkItemStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface ProjectWorkItem {
  _id: string;
  project: Project | string;
  title: string;
  category: WorkItemCategory;
  estimatedCost?: number;
  actualCost?: number;
  startDate?: string;
  dueDate?: string;
  completionDate?: string;
  progress: number;
  status: WorkItemStatus;
  responsiblePerson?: { _id: string; fullName: string } | string;
  notes?: string;
  createdBy?: { _id: string; fullName: string } | string;
  createdAt: string;
  updatedAt: string;
}

export enum VendorCategory {
  CIVIL = 'CIVIL',
  ARCHITECT = 'ARCHITECT',
  COTTAGE_MANUFACTURER = 'COTTAGE_MANUFACTURER',
  LANDSCAPING = 'LANDSCAPING',
  POOL = 'POOL',
  ELECTRICAL = 'ELECTRICAL',
  PLUMBING = 'PLUMBING',
  FURNITURE = 'FURNITURE',
  SUPPLIER = 'SUPPLIER',
  MARKETING = 'MARKETING',
  OTHER = 'OTHER',
}

export enum VendorWorkStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum VendorPaymentStatus {
  NOT_PAID = 'NOT_PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
}

export interface Vendor {
  _id: string;
  vendorName: string;
  category: VendorCategory;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;

  project: Project | string;
  workItem?: { _id: string; title: string; category: WorkItemCategory; status: WorkItemStatus } | string;
  assignedWork?: string;

  quotationAmount?: number;
  workOrderNumber?: string;
  workOrderDate?: string;

  startDate?: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;

  paymentStatus: VendorPaymentStatus;
  workStatus: VendorWorkStatus;
  notes?: string;

  createdBy?: { _id: string; fullName: string } | string;
  createdAt: string;
  updatedAt: string;
}

export enum ApprovalType {
  LAND_CONVERSION = 'LAND_CONVERSION',
  ENVIRONMENTAL_CLEARANCE = 'ENVIRONMENTAL_CLEARANCE',
  BUILDING_PLAN = 'BUILDING_PLAN',
  FIRE_NOC = 'FIRE_NOC',
  TOURISM_LICENSE = 'TOURISM_LICENSE',
  WATER_NOC = 'WATER_NOC',
  ELECTRICITY_CONNECTION = 'ELECTRICITY_CONNECTION',
  POLLUTION_CONTROL = 'POLLUTION_CONTROL',
  FOOD_LICENSE = 'FOOD_LICENSE',
  LIQUOR_LICENSE = 'LIQUOR_LICENSE',
  LABOUR_LICENSE = 'LABOUR_LICENSE',
  OTHER = 'OTHER',
}

export enum ApprovalStatus {
  NOT_STARTED = 'NOT_STARTED',
  APPLIED = 'APPLIED',
  UNDER_PROCESS = 'UNDER_PROCESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export interface Approval {
  _id: string;
  project: Project | string;
  approvalName: string;
  approvalType: ApprovalType;
  authority?: string;
  referenceNumber?: string;

  appliedDate?: string;
  expectedApprovalDate?: string;
  approvalDate?: string;
  expiryDate?: string;

  status: ApprovalStatus;
  responsiblePerson?: { _id: string; fullName: string } | string;
  remarks?: string;
  document?: { _id: string; title: string; originalName: string } | string;

  createdBy?: { _id: string; fullName: string } | string;
  createdAt: string;
  updatedAt: string;
}

export enum InvestmentType {
  EQUITY = 'EQUITY',
  PROFIT_PARTICIPATION = 'PROFIT_PARTICIPATION',
  PROJECT_INVESTMENT = 'PROJECT_INVESTMENT',
  DEBT = 'DEBT',
  STRATEGIC = 'STRATEGIC',
  OTHER = 'OTHER',
}

export enum InvestmentStatus {
  INTERESTED = 'INTERESTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  DUE_DILIGENCE = 'DUE_DILIGENCE',
  COMMITTED = 'COMMITTED',
  PARTIALLY_FUNDED = 'PARTIALLY_FUNDED',
  FUNDED = 'FUNDED',
  WITHDRAWN = 'WITHDRAWN',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED',
}

export enum DueDiligenceStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum PaymentMode {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  UPI = 'UPI',
  CASH = 'CASH',
  OTHER = 'OTHER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface InvestmentPayment {
  _id: string;
  amount: number;
  paymentDate: string;
  paymentMode: PaymentMode;
  paymentModeOther?: string;
  referenceNumber?: string;
  status: PaymentStatus;
  notes?: string;
  createdBy?: { _id: string; fullName: string } | string;
  createdAt: string;
}

export interface Investment {
  _id: string;
  project: Project | string;
  investor: (Pick<InvestorProfile, '_id' | 'investorName' | 'company' | 'mobile' | 'email'>) | string;
  investmentType: InvestmentType;

  proposedAmount?: number;
  committedAmount?: number;
  amountReceived: number;

  commitmentDate?: string;
  expectedFundingDate?: string;

  status: InvestmentStatus;
  dueDiligenceStatus: DueDiligenceStatus;
  agreementDocument?: { _id: string; title: string; originalName: string } | string;
  notes?: string;

  payments: InvestmentPayment[];

  createdBy?: { _id: string; fullName: string } | string;
  createdAt: string;
  updatedAt: string;
}

export enum MilestoneCategory {
  PLANNING = 'PLANNING',
  APPROVAL = 'APPROVAL',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  CONSTRUCTION = 'CONSTRUCTION',
  LANDSCAPING = 'LANDSCAPING',
  PLANTATION = 'PLANTATION',
  AMENITIES = 'AMENITIES',
  OPERATIONS_READINESS = 'OPERATIONS_READINESS',
  OTHER = 'OTHER',
}

export enum MilestoneStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  DELAYED = 'DELAYED',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
}

export interface Milestone {
  _id: string;
  project: Project | string;
  title: string;
  description?: string;
  category: MilestoneCategory;

  targetDate?: string;
  actualCompletionDate?: string;

  progress: number;
  status: MilestoneStatus;
  responsiblePerson?: { _id: string; fullName: string } | string;
  workItem?: { _id: string; title: string; category: WorkItemCategory; status: WorkItemStatus } | string;
  notes?: string;

  createdBy?: { _id: string; fullName: string } | string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkItemBudgetLine {
  _id: string;
  title: string;
  category: WorkItemCategory;
  status: WorkItemStatus;
  estimatedCost: number;
  actualCost: number;
  varianceAmount: number;
  variancePercent: number | null;
  overBudget: boolean;
}

export interface CategoryBudgetLine {
  category: WorkItemCategory;
  estimatedCost: number;
  actualCost: number;
  varianceAmount: number;
  variancePercent: number | null;
  overBudget: boolean;
  workItemCount: number;
}

export interface VendorSupportingDetail {
  _id: string;
  vendorName: string;
  category: string;
  workItem?: string;
  quotationAmount?: number;
  workOrderNumber?: string;
  workStatus: string;
  paymentStatus: string;
}

export type BudgetStatus = 'OVER_BUDGET' | 'UNDER_BUDGET' | 'ON_BUDGET';

export interface ProjectBudgetSummary {
  project: { _id: string; projectName: string; projectCode: string; location: string };

  totalEstimatedBudget: number;
  totalActualCost: number;
  remainingBudget: number;
  varianceAmount: number;
  variancePercent: number | null;
  budgetUtilizationPercent: number | null;
  budgetStatus: BudgetStatus;

  workItemsWithoutEstimate: number;
  workItemsWithoutActual: number;

  categoryBreakdown: CategoryBudgetLine[];
  workItemBreakdown: WorkItemBudgetLine[];
  vendorSupportingDetails: VendorSupportingDetail[];
}

export type ProjectHealthStatus = 'ON_TRACK' | 'ATTENTION_REQUIRED' | 'AT_RISK';

export interface WorkProgressSummary {
  overallProgressPercent: number | null;
  totalWorkItems: number;
  completed: number;
  inProgress: number;
  onHold: number;
  notStarted: number;
  cancelled: number;
  overdueCount: number;
  recentWorkItems: { _id: string; title: string; category: string; status: string; progress: number; dueDate: string | null }[];
  overdueWorkItems: { _id: string; title: string; category: string; status: string; dueDate: string | null }[];
}

export interface ApprovalsSummary {
  total: number;
  approved: number;
  underProcess: number;
  pending: number;
  rejectedOrExpired: number;
}

export interface VendorsSummary {
  total: number;
  active: number;
  completed: number;
  paymentStatusCounts: Record<string, number>;
}

export interface InvestmentsSummary {
  proposedTotal: number;
  committedTotal: number;
  receivedTotal: number;
  fundingProgressPercent: number | null;
  statusCounts: Record<string, number>;
}

export interface MilestonesSummary {
  total: number;
  completed: number;
  upcoming: { _id: string; title: string; targetDate: string | null; status: string }[];
  overdue: { _id: string; title: string; targetDate: string | null; status: string }[];
  overdueCount: number;
  nextMilestone: { _id: string; title: string; targetDate: string | null; status: string } | null;
}

export interface ProjectHealthResult {
  status: ProjectHealthStatus;
  reasons: string[];
}

export interface ProjectProgressDashboard {
  project: { _id: string; projectName: string; projectCode: string; location: string };

  summaryCards: {
    overallProjectProgressPercent: number | null;
    estimatedBudget: number;
    actualCost: number;
    budgetUtilizationPercent: number | null;
    totalWorkItems: number;
    completedWorkItems: number;
    delayedOrPendingWork: number;
    pendingApprovals: number;
    activeVendors: number;
    committedInvestment: number;
    amountReceived: number;
    upcomingMilestones: number;
  };

  workProgress: WorkProgressSummary;
  budget: ProjectBudgetSummary;
  approvals: ApprovalsSummary;
  vendors: VendorsSummary;
  investments: InvestmentsSummary;
  milestones: MilestonesSummary;
  health: ProjectHealthResult;
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  TEMPORARY = 'TEMPORARY',
  OTHER = 'OTHER',
}

export enum VacancyStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
}

export interface Vacancy {
  _id: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  openings: number;

  minExperience?: number;
  maxExperience?: number;
  minSalary?: number;
  maxSalary?: number;

  description: string;
  responsibilities: string[];
  requiredSkills: string[];

  applicationDeadline?: string;
  status: VacancyStatus;
  featured: boolean;
  urgent: boolean;

  createdBy?: { _id: string; fullName: string } | string;
  createdAt: string;
  updatedAt: string;
}

export enum ApplicationStatus {
  NEW = 'NEW',
  REVIEWING = 'REVIEWING',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW = 'INTERVIEW',
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface ApplicationNote {
  _id: string;
  note: string;
  createdBy?: { _id: string; fullName: string } | string;
  createdAt: string;
}

export interface JobApplication {
  _id: string;
  vacancy: { _id: string; title: string; department: string; location: string; status: VacancyStatus } | string;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  experience: number;
  currentCompany?: string;
  currentCTC?: number;
  expectedCTC?: number;
  noticePeriod?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  coverNote?: string;

  resumeOriginalName: string;

  status: ApplicationStatus;
  internalNotes: ApplicationNote[];

  createdAt: string;
  updatedAt: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}
