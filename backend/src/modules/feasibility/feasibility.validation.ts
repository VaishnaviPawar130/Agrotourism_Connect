import { z } from 'zod';
import { SuitabilityRating, FeasibilityStatus, RiskSeverity } from './feasibility.types';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const optionalText = (max: number) => z.string().trim().max(max).optional();

const distanceKm = z.number().nonnegative().max(10000).optional();

const rating = z.nativeEnum(SuitabilityRating).default(SuitabilityRating.NOT_ASSESSED);

const riskSchema = z.object({
  description: z.string().trim().min(2, 'Risk description is required').max(500),
  severity: z.nativeEnum(RiskSeverity),
  mitigation: optionalText(500),
});

export const createFeasibilitySchema = z.object({
  project: objectId,
  land: objectId.optional(),

  landSuitability: rating,
  usableLandArea: z.number().nonnegative().max(1_000_000).optional(),
  usableLandAreaUnit: optionalText(20),
  landSuitabilityNotes: optionalText(2000),

  accessibilityRating: rating,
  roadConnectivity: rating,
  nearestHighwayDistanceKm: distanceKm,
  nearestRailwayDistanceKm: distanceKm,
  nearestAirportDistanceKm: distanceKm,
  publicTransportAvailable: z.boolean().optional(),
  accessibilityNotes: optionalText(2000),

  waterAvailability: rating,
  waterSourceDetails: optionalText(1000),
  electricityAvailability: rating,
  electricityDetails: optionalText(1000),

  existingInfrastructureNotes: optionalText(2000),
  existingStructuresUsable: z.boolean().optional(),

  surroundingAttractions: optionalText(2000),
  tourismPotential: rating,
  tourismPotentialNotes: optionalText(2000),

  developmentSuitability: rating,
  risks: z.array(riskSchema).max(50).default([]),
  recommendations: optionalText(3000),
  adminNotes: optionalText(3000),
});

export const updateFeasibilitySchema = createFeasibilitySchema.omit({ project: true }).partial();

export const updateFeasibilityStatusSchema = z.object({
  status: z.nativeEnum(FeasibilityStatus),
});

export type CreateFeasibilityInput = z.infer<typeof createFeasibilitySchema>;
export type UpdateFeasibilityInput = z.infer<typeof updateFeasibilitySchema>;
