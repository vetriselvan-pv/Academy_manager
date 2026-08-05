import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { ZodError } from 'zod';
import { env } from './config/env';
import { AppError } from './utils/errors';
import { authPlugin } from './plugins/auth';
import { authRoutes } from './modules/auth/auth.routes';
import { meRoutes } from './modules/me/me.routes';
import { branchRoutes } from './modules/branches/branch.routes';
import { courseCategoryRoutes } from './modules/course-categories/courseCategory.routes';
import { courseRoutes } from './modules/courses/course.routes';
import { teacherRoutes } from './modules/teachers/teacher.routes';
import { studentRoutes } from './modules/students/student.routes';
import { enrollmentRoutes } from './modules/enrollments/enrollment.routes';
import { menuRoutes } from './modules/menus/menu.routes';
import { userRoutes } from './modules/users/user.routes';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger:
      env.NODE_ENV === 'development'
        ? { transport: { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } } }
        : true,
  });

  await app.register(helmet);
  await app.register(cors, { origin: env.CORS_ORIGIN });
  await app.register(authPlugin);

  app.get('/health', async () => ({ status: 'ok' }));

  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(meRoutes, { prefix: '/api/me' });
  await app.register(branchRoutes, { prefix: '/api/branches' });
  await app.register(courseCategoryRoutes, { prefix: '/api/course-categories' });
  await app.register(courseRoutes, { prefix: '/api/courses' });
  await app.register(teacherRoutes, { prefix: '/api/teachers' });
  await app.register(studentRoutes, { prefix: '/api/students' });
  await app.register(enrollmentRoutes, { prefix: '/api/enrollments' });
  await app.register(menuRoutes, { prefix: '/api/menus' });
  await app.register(userRoutes, { prefix: '/api/users' });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      reply.code(400).send({ message: 'Validation failed', errors: error.flatten().fieldErrors });
      return;
    }

    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ message: error.message });
      return;
    }

    if ((error as { code?: number }).code === 11000) {
      reply.code(409).send({ message: 'Duplicate value violates a unique constraint' });
      return;
    }

    app.log.error(error);
    reply.code(500).send({ message: 'Internal server error' });
  });

  return app;
}
