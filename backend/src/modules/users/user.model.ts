import { Schema, model, Document } from 'mongoose';
import { UserRole, UserStatus } from './user.types';

export interface IUser extends Document {
  fullName: string;
  email: string;
  mobile: string;
  passwordHash: string;
  role: UserRole;
  city?: string;
  state?: string;
  status: UserStatus;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.LANDOWNER },
    city: { type: String },
    state: { type: String },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
