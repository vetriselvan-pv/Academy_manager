import { FastifyInstance } from 'fastify';
import { User } from '../../models/User';
import { NotFoundError } from '../../utils/errors';

export async function meRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/', async (request) => {
    const user = await User.findById(request.authUser!.id)
      .populate('branches', 'name code city')
      .populate('branch', 'name code city')
      .populate('specializedCourses', 'name category');

    if (!user) {
      throw new NotFoundError('User not found');
    }
    return { user };
  });
}
