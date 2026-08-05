import { FastifyInstance } from 'fastify';
import { Course } from '../../models/Course';
import { createCourseSchema, updateCourseSchema, courseQuerySchema } from '../../schemas/course.schema';
import { objectId, paginationSchema } from '../../schemas/common.schema';
import { NotFoundError } from '../../utils/errors';
import { Permission, UserRole } from '../../types';

export async function courseRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/', async (request) => {
    const query = courseQuerySchema.parse(request.query);
    const queryParams = request.query as Record<string, string>;
    const { page, limit } = paginationSchema.parse(queryParams);

    const filter: any = {};
    if (query.name) filter.name = { $regex: query.name, $options: 'i' };
    if (query.category) filter.category = query.category;
    if (query.isActive) filter.isActive = query.isActive === 'true';
    if (queryParams.code) filter.code = { $regex: queryParams.code, $options: 'i' };
    if (queryParams.duration) filter.duration = { $regex: queryParams.duration, $options: 'i' };

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find(filter).skip(skip).limit(limit).populate('category', 'name').sort({ name: 1 }),
      Course.countDocuments(filter)
    ]);

    return {
      data: courses,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  });

  fastify.get('/:id', async (request) => {
    const id = objectId.parse((request.params as { id: string }).id);
    const course = await Course.findById(id).populate('category', 'name');
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    return { course };
  });

  fastify.post(
    '/',
    { preHandler: [fastify.authorize(UserRole.SUPER_ADMIN, UserRole.TEACHER), fastify.can(Permission.MANAGE_COURSE_CONTENT)] },
    async (request, reply) => {
      const input = createCourseSchema.parse(request.body);
      const course = await Course.create(input);
      reply.code(201).send({ course });
    },
  );

  fastify.patch(
    '/:id',
    { preHandler: [fastify.authorize(UserRole.SUPER_ADMIN, UserRole.TEACHER), fastify.can(Permission.MANAGE_COURSE_CONTENT)] },
    async (request) => {
      const id = objectId.parse((request.params as { id: string }).id);
      const input = updateCourseSchema.parse(request.body);
      const course = await Course.findByIdAndUpdate(id, input, { new: true, runValidators: true });
      if (!course) {
        throw new NotFoundError('Course not found');
      }
      return { course };
    },
  );

  fastify.delete('/:id', { preHandler: [fastify.authorize(UserRole.SUPER_ADMIN)] }, async (request, reply) => {
    const id = objectId.parse((request.params as { id: string }).id);
    const course = await Course.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    reply.code(204).send();
  });
}
