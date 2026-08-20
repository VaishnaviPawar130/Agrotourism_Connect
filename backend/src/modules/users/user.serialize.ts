import { IUser } from './user.model';

export interface PublicUser {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: string;
  city?: string;
  state?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Whitelist-serializes a user document for API responses.
 *
 * `passwordHash` / `resetPasswordToken` carry `select: false`, but that only
 * applies to documents loaded from a query — a document returned straight from
 * `User.create()` (or one where the field was explicitly selected) still holds
 * the value and would otherwise be serialized into the response. Always route
 * user documents through this function before sending them to a client.
 */
export function toPublicUser(user: IUser): PublicUser {
  return {
    _id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    city: user.city,
    state: user.state,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toPublicUsers(users: IUser[]): PublicUser[] {
  return users.map(toPublicUser);
}
