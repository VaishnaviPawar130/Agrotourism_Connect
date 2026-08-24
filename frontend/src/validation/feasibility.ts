import { z } from 'zod';
import { SuitabilityRating, RiskSeverity } from '../types';
import { optionalText } from './common';

const rating = z.nativeEnum(SuitabilityRating);
const distanceKm = z.number().nonnegative('Distance cannot be negative').max(10000, 'Distance looks unrealistic').optional();

const riskSchema = z.object({
  description: z.string().trim().min(2, 'Risk description is required').max(500),
  severity: z.nativeEnum(RiskSeverity),
  mitigation: optionalText(500),
});

export const feasibilityFormSchema = z.object({
  landSuitability: rating,
  usableLandArea: z.number().nonnegative('Usable land area cannot be negative').max(1_000_000).optional(),
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
  risks: z.array(riskSchema).max(50),
  recommendations: optionalText(3000),
  adminNotes: optionalText(3000),
});

export type FeasibilityFormValues = z.infer<typeof feasibilityFormSchema>;

/** Which tab a given field (or `risks.N.field`) lives on, so a validation error can jump the user to the right tab. */
export function tabForField(path: string): string {
  if (path.startsWith('risks') || path === 'recommendations' || path === 'adminNotes') return 'risks';
  if (
    ['accessibilityRating', 'roadConnectivity', 'nearestHighwayDistanceKm', 'nearestRailwayDistanceKm', 'nearestAirportDistanceKm', 'publicTransportAvailable', 'accessibilityNotes'].includes(
      path
    )
  )
    return 'access';
  if (['waterAvailability', 'waterSourceDetails', 'electricityAvailability', 'electricityDetails'].includes(path)) return 'utilities';
  if (['surroundingAttractions', 'tourismPotential', 'tourismPotentialNotes'].includes(path)) return 'tourism';
  return 'land';
}
