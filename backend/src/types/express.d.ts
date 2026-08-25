import { UserRole } from '../modules/users/user.types';
import { IUser } from '../modules/users/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        email: string;
      };
      /**
       * The full Mongoose document `authenticate` loaded while re-verifying
       * the request's role from the database. Handlers that would otherwise
       * immediately re-fetch the same user by `req.user.id` (e.g. GET /me)
       * should read this instead of issuing a duplicate query.
       */
      authUser?: IUser;
    }
  }
}

export {};
