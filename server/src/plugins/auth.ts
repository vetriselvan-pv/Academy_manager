import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { User } from '../models/User';
import { ITeacher } from '../models/Teacher';
import { IStudent } from '../models/Student';
import { verifyAccessToken } from '../utils/jwt';
import { AuthUser, Permission, UserRole } from '../types';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorize: (...roles: UserRole[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    can: (...permissions: Permission[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

async function authenticate(request: FastifyRequest): Promise<void> {
  const header = request.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed Authorization header');
  }

  const token = header.slice('Bearer '.length);
  const payload = verifyAccessToken(token);

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    throw new UnauthorizedError('User not found or inactive');
  }

  const authUser: AuthUser = {
    id: user.id,
    role: user.role,
    email: user.email,
    permissions: user.role === UserRole.TEACHER ? (user as unknown as ITeacher).permissions ?? [] : [],
    branches:
      user.role === UserRole.TEACHER
        ? (user as unknown as ITeacher).branches.map((b) => b.toString())
        : user.role === UserRole.STUDENT
          ? [(user as unknown as IStudent).branch.toString()]
          : [],
  };

  request.authUser = authUser;
}

function authorize(...roles: UserRole[]) {
  return async (request: FastifyRequest): Promise<void> => {
    if (!request.authUser) {
      throw new UnauthorizedError('Not authenticated');
    }
    if (request.authUser.role === UserRole.SUPER_ADMIN) {
      return;
    }
    if (!roles.includes(request.authUser.role)) {
      throw new ForbiddenError('You do not have access to this resource');
    }
  };
}

function can(...permissions: Permission[]) {
  return async (request: FastifyRequest): Promise<void> => {
    if (!request.authUser) {
      throw new UnauthorizedError('Not authenticated');
    }
    if (request.authUser.role === UserRole.SUPER_ADMIN) {
      return;
    }
    if (request.authUser.role !== UserRole.TEACHER) {
      throw new ForbiddenError('You do not have access to this resource');
    }
    const missing = permissions.filter((p) => !request.authUser!.permissions.includes(p));
    if (missing.length > 0) {
      throw new ForbiddenError(`Missing required permission(s): ${missing.join(', ')}`);
    }
  };
}

export const authPlugin = fp(async function (fastify: FastifyInstance): Promise<void> {
  fastify.decorate('authenticate', authenticate);
  fastify.decorate('authorize', authorize);
  fastify.decorate('can', can);
});
