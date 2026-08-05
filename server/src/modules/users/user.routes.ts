import { FastifyInstance } from 'fastify';
import { User } from '../../models/User';
import { UserRole } from '../../types';

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get(
    '/admins',
    { preHandler: [fastify.authenticate, fastify.authorize(UserRole.SUPER_ADMIN, UserRole.TEACHER)] },
    async () => {
      const admins = await User.find({ role: UserRole.SUPER_ADMIN }).select('_id name email').sort({ name: 1 });
      return { admins };
    },
  );
}
