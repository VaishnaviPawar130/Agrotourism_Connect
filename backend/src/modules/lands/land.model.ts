import { Schema, model, Document, Types } from 'mongoose';
import { LandStatus, AreaUnit, DevelopmentInterest } from './land.types';

export interface ILand extends Document {
  owner: Types.ObjectId;
  ownerName: string;
  mobile: string;
  email?: string;
  alternateMobile?: string;

  landTitle: string;
  state: string;
  district: string;
  taluka?: string;
  village?: string;
  surveyNumber?: string;
  totalArea: number;
  areaUnit: AreaUnit;
  naStatus?: string;
  currentLandUse?: string;
  askingPrice?: number;

  address?: string;
  latitude?: number;
  longitude?: number;
  mapsLink?: string;

  mainRoadDistanceKm?: number;
  highwayDistanceKm?: number;
  railwayDistanceKm?: number;
  airportDistanceKm?: number;
  nearbyTourismDestinations?: string;

  roadAccess?: boolean;
  roadWidthFt?: number;
  electricity?: boolean;
  waterSource?: string;
  borewell?: boolean;
  well?: boolean;
  nearbyWaterBody?: string;

  existingBuilding?: boolean;
  farmhouse?: boolean;
  shed?: boolean;
  restaurant?: boolean;
  cottages?: boolean;
  swimmingPool?: boolean;
  plantation?: boolean;

  developmentInterests: DevelopmentInterest[];

  photos: string[];
  videos: string[];
  documents: string[];

  status: LandStatus;
  reviewNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const landSchema = new Schema<ILand>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ownerName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String },
    alternateMobile: { type: String },

    landTitle: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    taluka: { type: String },
    village: { type: String },
    surveyNumber: { type: String },
    totalArea: { type: Number, required: true },
    areaUnit: { type: String, enum: Object.values(AreaUnit), default: AreaUnit.ACRE },
    naStatus: { type: String },
    currentLandUse: { type: String },
    askingPrice: { type: Number },

    address: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    mapsLink: { type: String },

    mainRoadDistanceKm: { type: Number },
    highwayDistanceKm: { type: Number },
    railwayDistanceKm: { type: Number },
    airportDistanceKm: { type: Number },
    nearbyTourismDestinations: { type: String },

    roadAccess: { type: Boolean, default: false },
    roadWidthFt: { type: Number },
    electricity: { type: Boolean, default: false },
    waterSource: { type: String },
    borewell: { type: Boolean, default: false },
    well: { type: Boolean, default: false },
    nearbyWaterBody: { type: String },

    existingBuilding: { type: Boolean, default: false },
    farmhouse: { type: Boolean, default: false },
    shed: { type: Boolean, default: false },
    restaurant: { type: Boolean, default: false },
    cottages: { type: Boolean, default: false },
    swimmingPool: { type: Boolean, default: false },
    plantation: { type: Boolean, default: false },

    developmentInterests: [{ type: String, enum: Object.values(DevelopmentInterest) }],

    photos: [{ type: String }],
    videos: [{ type: String }],
    documents: [{ type: String }],

    status: { type: String, enum: Object.values(LandStatus), default: LandStatus.DRAFT, index: true },
    reviewNotes: { type: String },
  },
  { timestamps: true }
);

landSchema.index({ ownerName: 'text', landTitle: 'text', district: 'text', state: 'text' });

export const Land = model<ILand>('Land', landSchema);
