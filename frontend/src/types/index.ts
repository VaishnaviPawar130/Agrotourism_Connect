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

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}
