import { FastifyInstance } from 'fastify';
import { CourseCategory } from '../../models/CourseCategory';
import { createCourseCategorySchema, updateCourseCategorySchema, courseCategoryQuerySchema } from '../../schemas/courseCategory.schema';
import { objectId } from '../../schemas/common.schema';
import { NotFoundError } from '../../utils/errors';
import { Permission, UserRole } from '../../types';

export async function courseCategoryRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/', async (request) => {
    const query = courseCategoryQuerySchema.parse(request.query);
    const filter: any = {};
    if (query.name) filter.name = { $regex: query.name, $options: 'i' };
    if (query.isActive) filter.isActive = query.isActive === 'true';

    const categories = await CourseCategory.find(filter).sort({ name: 1 });
    return { courseCategories: categories };
  });

  fastify.get('/:id', async (request) => {
    const id = objectId.parse((request.params as { id: string }).id);
    const category = await CourseCategory.findById(id);
    if (!category) {
      throw new NotFoundError('Course Category not found');
    }
    return { courseCategory: category };
  });

  fastify.post(
    '/',
    { preHandler: [fastify.authorize(UserRole.SUPER_ADMIN), fastify.can(Permission.MANAGE_COURSE_CONTENT)] },
    async (request, reply) => {
      const input = createCourseCategorySchema.parse(request.body);
      const category = await CourseCategory.create(input);
      reply.code(201).send({ courseCategory: category });
    },
  );

  fastify.patch(
    '/:id',
    { preHandler: [fastify.authorize(UserRole.SUPER_ADMIN), fastify.can(Permission.MANAGE_COURSE_CONTENT)] },
    async (request) => {
      const id = objectId.parse((request.params as { id: string }).id);
      const input = updateCourseCategorySchema.parse(request.body);
      const category = await CourseCategory.findByIdAndUpdate(id, input, { new: true, runValidators: true });
      if (!category) {
        throw new NotFoundError('Course Category not found');
      }
      return { courseCategory: category };
    },
  );

  fastify.delete('/:id', { preHandler: [fastify.authorize(UserRole.SUPER_ADMIN)] }, async (request, reply) => {
    const id = objectId.parse((request.params as { id: string }).id);
    const category = await CourseCategory.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!category) {
      throw new NotFoundError('Course Category not found');
    }
    reply.code(204).send();
  });
}
