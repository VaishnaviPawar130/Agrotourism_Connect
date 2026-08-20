import { z } from 'zod';
import { LandStatus, AreaUnit, DevelopmentInterest } from './land.types';

export const createLandSchema = z.object({
  ownerName: z.string().min(2),
  mobile: z.string().min(7).max(15),
  email: z.string().email().optional(),
  alternateMobile: z.string().optional(),

  landTitle: z.string().min(2),
  state: z.string().min(2),
  district: z.string().min(2),
  taluka: z.string().optional(),
  village: z.string().optional(),
  surveyNumber: z.string().optional(),
  totalArea: z.number().positive(),
  areaUnit: z.nativeEnum(AreaUnit).default(AreaUnit.ACRE),
  naStatus: z.string().optional(),
  currentLandUse: z.string().optional(),
  askingPrice: z.number().nonnegative().optional(),

  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  mapsLink: z.string().optional(),

  mainRoadDistanceKm: z.number().nonnegative().optional(),
  highwayDistanceKm: z.number().nonnegative().optional(),
  railwayDistanceKm: z.number().nonnegative().optional(),
  airportDistanceKm: z.number().nonnegative().optional(),
  nearbyTourismDestinations: z.string().optional(),

  roadAccess: z.boolean().optional(),
  roadWidthFt: z.number().nonnegative().optional(),
  electricity: z.boolean().optional(),
  waterSource: z.string().optional(),
  borewell: z.boolean().optional(),
  well: z.boolean().optional(),
  nearbyWaterBody: z.string().optional(),

  existingBuilding: z.boolean().optional(),
  farmhouse: z.boolean().optional(),
  shed: z.boolean().optional(),
  restaurant: z.boolean().optional(),
  cottages: z.boolean().optional(),
  swimmingPool: z.boolean().optional(),
  plantation: z.boolean().optional(),

  developmentInterests: z.array(z.nativeEnum(DevelopmentInterest)).default([]),
});

export const updateLandSchema = createLandSchema.partial();

export const updateLandStatusSchema = z.object({
  status: z.nativeEnum(LandStatus),
  reviewNotes: z.string().optional(),
});

export type CreateLandInput = z.infer<typeof createLandSchema>;
export type UpdateLandInput = z.infer<typeof updateLandSchema>;
