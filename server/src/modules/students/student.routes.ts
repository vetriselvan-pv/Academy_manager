import { FastifyInstance } from 'fastify';
import { Student } from '../../models/Student';
import { Branch } from '../../models/Branch';
import { updateStudentSchema } from '../../schemas/student.schema';
import { objectId } from '../../schemas/common.schema';
import { assertBranchAccess } from '../../utils/authHelpers';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';
import { Permission, UserRole } from '../../types';

export async function studentRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get(
    '/',
    { preHandler: [fastify.authorize(UserRole.SUPER_ADMIN, UserRole.TEACHER), fastify.can(Permission.VIEW_STUDENTS)] },
    async (request) => {
      const { branch } = request.query as { branch?: string };
      const authUser = request.authUser!;

      const filter: Record<string, unknown> = {};
      if (authUser.role === UserRole.TEACHER) {
        filter.branch = branch ? branch : { $in: authUser.branches };
        if (branch) {
          assertBranchAccess(authUser, branch);
        }
      } else if (branch) {
        filter.branch = branch;
      }

      const students = await Student.find(filter).populate('branch', 'name code city');
      return { students };
    },
  );

  fastify.get('/:id', async (request) => {
    const id = objectId.parse((request.params as { id: string }).id);
    const authUser = request.authUser!;

    if (authUser.role === UserRole.STUDENT && authUser.id !== id) {
      throw new ForbiddenError('You can only view your own profile');
    }

    const student = await Student.findById(id).populate('branch', 'name code city');
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    if (authUser.role === UserRole.TEACHER) {
      if (!authUser.permissions.includes(Permission.VIEW_STUDENTS)) {
        throw new ForbiddenError('Missing required permission: VIEW_STUDENTS');
      }
      assertBranchAccess(authUser, student.branch.toString());
    }

    return { student };
  });

  fastify.patch('/:id', async (request) => {
    const id = objectId.parse((request.params as { id: string }).id);
    const authUser = request.authUser!;

    const student = await Student.findById(id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    if (authUser.role === UserRole.STUDENT) {
      if (authUser.id !== id) {
        throw new ForbiddenError('You can only update your own profile');
      }
      const { name, phone, address, guardianName, guardianPhone } = updateStudentSchema.parse(request.body);
      Object.assign(student, { name, phone, address, guardianName, guardianPhone });
    } else if (authUser.role === UserRole.TEACHER) {
      if (!authUser.permissions.includes(Permission.MANAGE_STUDENTS)) {
        throw new ForbiddenError('Missing required permission: MANAGE_STUDENTS');
      }
      assertBranchAccess(authUser, student.branch.toString());
      const input = updateStudentSchema.parse(request.body);
      if (input.branch) {
        assertBranchAccess(authUser, input.branch);
      }
      Object.assign(student, input);
    } else {
      const input = updateStudentSchema.parse(request.body);
      if (input.branch) {
        const branchExists = await Branch.exists({ _id: input.branch });
        if (!branchExists) {
          throw new BadRequestError('Branch does not exist');
        }
      }
      Object.assign(student, input);
    }

    await student.save();
    return { student };
  });

  fastify.delete(
    '/:id',
    { preHandler: [fastify.authorize(UserRole.SUPER_ADMIN, UserRole.TEACHER), fastify.can(Permission.MANAGE_STUDENTS)] },
    async (request, reply) => {
      const id = objectId.parse((request.params as { id: string }).id);
      const authUser = request.authUser!;

      const student = await Student.findById(id);
      if (!student) {
        throw new NotFoundError('Student not found');
      }
      if (authUser.role === UserRole.TEACHER) {
        assertBranchAccess(authUser, student.branch.toString());
      }

      student.isActive = false;
      await student.save();
      reply.code(204).send();
    },
  );
}
