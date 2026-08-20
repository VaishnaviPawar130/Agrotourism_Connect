import { Schema, model, Document, Types } from 'mongoose';
import { SuitabilityRating, FeasibilityStatus, RiskSeverity } from './feasibility.types';

export interface IFeasibilityRisk {
  description: string;
  severity: RiskSeverity;
  mitigation?: string;
}

export interface IFeasibilityAssessment extends Document {
  project: Types.ObjectId;
  land?: Types.ObjectId;

  // Land suitability
  landSuitability: SuitabilityRating;
  usableLandArea?: number;
  usableLandAreaUnit?: string;
  landSuitabilityNotes?: string;

  // Accessibility & connectivity
  accessibilityRating: SuitabilityRating;
  roadConnectivity: SuitabilityRating;
  nearestHighwayDistanceKm?: number;
  nearestRailwayDistanceKm?: number;
  nearestAirportDistanceKm?: number;
  publicTransportAvailable?: boolean;
  accessibilityNotes?: string;

  // Utilities
  waterAvailability: SuitabilityRating;
  waterSourceDetails?: string;
  electricityAvailability: SuitabilityRating;
  electricityDetails?: string;

  // Existing infrastructure
  existingInfrastructureNotes?: string;
  existingStructuresUsable?: boolean;

  // Tourism context
  surroundingAttractions?: string;
  tourismPotential: SuitabilityRating;
  tourismPotentialNotes?: string;

  // Overall assessment
  developmentSuitability: SuitabilityRating;
  risks: IFeasibilityRisk[];
  recommendations?: string;
  adminNotes?: string;

  status: FeasibilityStatus;

  assessedBy?: Types.ObjectId;
  assessedAt?: Date;

  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const riskSchema = new Schema<IFeasibilityRisk>(
  {
    description: { type: String, required: true, trim: true },
    severity: { type: String, enum: Object.values(RiskSeverity), required: true },
    mitigation: { type: String, trim: true },
  },
  { _id: false }
);

const feasibilitySchema = new Schema<IFeasibilityAssessment>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true, index: true },
    land: { type: Schema.Types.ObjectId, ref: 'Land' },

    landSuitability: { type: String, enum: Object.values(SuitabilityRating), default: SuitabilityRating.NOT_ASSESSED },
    usableLandArea: { type: Number },
    usableLandAreaUnit: { type: String },
    landSuitabilityNotes: { type: String, trim: true },

    accessibilityRating: { type: String, enum: Object.values(SuitabilityRating), default: SuitabilityRating.NOT_ASSESSED },
    roadConnectivity: { type: String, enum: Object.values(SuitabilityRating), default: SuitabilityRating.NOT_ASSESSED },
    nearestHighwayDistanceKm: { type: Number },
    nearestRailwayDistanceKm: { type: Number },
    nearestAirportDistanceKm: { type: Number },
    publicTransportAvailable: { type: Boolean, default: false },
    accessibilityNotes: { type: String, trim: true },

    waterAvailability: { type: String, enum: Object.values(SuitabilityRating), default: SuitabilityRating.NOT_ASSESSED },
    waterSourceDetails: { type: String, trim: true },
    electricityAvailability: { type: String, enum: Object.values(SuitabilityRating), default: SuitabilityRating.NOT_ASSESSED },
    electricityDetails: { type: String, trim: true },

    existingInfrastructureNotes: { type: String, trim: true },
    existingStructuresUsable: { type: Boolean, default: false },

    surroundingAttractions: { type: String, trim: true },
    tourismPotential: { type: String, enum: Object.values(SuitabilityRating), default: SuitabilityRating.NOT_ASSESSED },
    tourismPotentialNotes: { type: String, trim: true },

    developmentSuitability: { type: String, enum: Object.values(SuitabilityRating), default: SuitabilityRating.NOT_ASSESSED },
    risks: { type: [riskSchema], default: [] },
    recommendations: { type: String, trim: true },
    adminNotes: { type: String, trim: true },

    status: { type: String, enum: Object.values(FeasibilityStatus), default: FeasibilityStatus.DRAFT, index: true },

    assessedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    assessedAt: { type: Date },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const FeasibilityAssessment = model<IFeasibilityAssessment>('FeasibilityAssessment', feasibilitySchema);
