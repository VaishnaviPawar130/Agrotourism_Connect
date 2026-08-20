import { z } from 'zod';
import { LandStatus, AreaUnit, DevelopmentInterest } from './land.types';

const mobile = z
  .string()
  .trim()
  .regex(/^[+]?[0-9\s-]{7,15}$/, 'Enter a valid mobile number');

/** Trimmed, length-bounded text — `.trim()` before `.min()` rejects spaces-only input. */
const text = (min: number, max: number, label = 'This field') =>
  z.string().trim().min(min, `${label} must be at least ${min} characters`).max(max);

const optionalText = (max: number) => z.string().trim().max(max).optional();

/** Distances in km — bounded so a typo cannot store an absurd value. */
const distanceKm = z.number().nonnegative().max(10000).optional();

export const createLandSchema = z.object({
  ownerName: text(2, 120, 'Owner name'),
  mobile,
  email: z.string().trim().toLowerCase().email().optional().or(z.literal('').transform(() => undefined)),
  alternateMobile: mobile.optional().or(z.literal('').transform(() => undefined)),

  landTitle: text(2, 200, 'Land title'),
  state: text(2, 100, 'State'),
  district: text(2, 100, 'District'),
  taluka: optionalText(100),
  village: optionalText(100),
  surveyNumber: optionalText(100),
  totalArea: z
    .number({ invalid_type_error: 'Total area must be a number' })
    .positive('Total area must be greater than zero')
    .max(1_000_000, 'Total area looks unrealistically large'),
  areaUnit: z.nativeEnum(AreaUnit).default(AreaUnit.ACRE),
  naStatus: optionalText(100),
  currentLandUse: optionalText(200),
  askingPrice: z.number().nonnegative('Asking price cannot be negative').max(1e13).optional(),

  address: optionalText(500),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  mapsLink: z.string().trim().url('Enter a valid URL').max(500).optional().or(z.literal('').transform(() => undefined)),

  mainRoadDistanceKm: distanceKm,
  highwayDistanceKm: distanceKm,
  railwayDistanceKm: distanceKm,
  airportDistanceKm: distanceKm,
  nearbyTourismDestinations: optionalText(500),

  roadAccess: z.boolean().optional(),
  roadWidthFt: z.number().nonnegative().max(1000).optional(),
  electricity: z.boolean().optional(),
  waterSource: optionalText(200),
  borewell: z.boolean().optional(),
  well: z.boolean().optional(),
  nearbyWaterBody: optionalText(200),

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
  reviewNotes: z.string().trim().max(2000).optional(),
});

export type CreateLandInput = z.infer<typeof createLandSchema>;
export type UpdateLandInput = z.infer<typeof updateLandSchema>;
