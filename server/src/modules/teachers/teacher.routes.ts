import { FastifyInstance } from 'fastify';
import { Teacher } from '../../models/Teacher';
import { User } from '../../models/User';
import { Branch } from '../../models/Branch';
import { createTeacherSchema, updateTeacherSchema } from '../../schemas/teacher.schema';
import { objectId, paginationSchema } from '../../schemas/common.schema';
import { hashPassword } from '../../utils/password';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../../utils/errors';
import { DESIGNATION_PERMISSIONS, Permission, UserRole } from '../../types';

export async function teacherRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', fastify.authenticate);
  fastify.addHook('preHandler', fastify.authorize(UserRole.SUPER_ADMIN, UserRole.TEACHER));

  fastify.get('/', async (request) => {
    const queryParams = request.query as Record<string, string>;
    const { page, limit } = paginationSchema.parse(queryParams);
    const { branch, name, email, designation } = queryParams;

    const filter: Record<string, unknown> = {};
    if (branch) {
      filter.branches = branch;
    }
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (designation) filter.designation = designation;

    const skip = (page - 1) * limit;

    const [teachers, total] = await Promise.all([
      Teacher.find(filter)
        .skip(skip)
        .limit(limit)
        .populate('branches', 'name code')
        .populate('specializedCourses', 'name category')
        .sort({ createdAt: -1 }),
      Teacher.countDocuments(filter)
    ]);

    return {
      data: teachers,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  });

  fastify.get('/:id', async (request) => {
    const id = objectId.parse((request.params as { id: string }).id);
    const teacher = await Teacher.findById(id).populate('branches', 'name code').populate('specializedCourses', 'name category');
    if (!teacher) {
      throw new NotFoundError('Teacher not found');
    }
    return { teacher };
  });

  fastify.post('/', { preHandler: [fastify.authorize(UserRole.SUPER_ADMIN)] }, async (request, reply) => {
    const input = createTeacherSchema.parse(request.body);

    const existing = await User.findOne({ email: input.email });
    if (existing) {
      throw new ConflictError('Email is already registered');
    }

    const branchCount = await Branch.countDocuments({ _id: { $in: input.branches } });
    if (branchCount !== input.branches.length) {
      throw new BadRequestError('One or more branches do not exist');
    }

    const passwordHash = await hashPassword(input.password);
    const teacher = await Teacher.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      designation: input.designation,
      branches: input.branches,
      specializedCourses: input.specializedCourses ?? [],
      permissions: DESIGNATION_PERMISSIONS[input.designation],
      joiningDate: input.joiningDate,
    });

    reply.code(201).send({ teacher });
  });

  fastify.patch('/:id', async (request) => {
    const id = objectId.parse((request.params as { id: string }).id);
    const input = updateTeacherSchema.parse(request.body);
    const authUser = request.authUser!;

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      throw new NotFoundError('Teacher not found');
    }

    if (authUser.role === UserRole.TEACHER) {
      const isSelf = authUser.id === id;

      if (isSelf) {
        // My Profile only ever offers name/phone — strip everything else so a crafted request
        // can't have a teacher re-assign their own designation, permissions or branches.
        delete input.branches;
        delete input.specializedCourses;
      } else {
        const managesSharedBranch = teacher.branches.some((b) => authUser.branches.includes(b.toString()));
        if (!managesSharedBranch || !authUser.permissions.includes(Permission.MANAGE_BRANCH_TEACHERS)) {
          throw new ForbiddenError('You do not have access to manage this teacher');
        }
      }

      // Teachers (self or acting on a colleague) can never re-assign designation/permissions —
      // those stay Super-Admin-only.
      delete input.designation;
      delete input.permissions;
    }

    if (input.branches) {
      const branchCount = await Branch.countDocuments({ _id: { $in: input.branches } });
      if (branchCount !== input.branches.length) {
        throw new BadRequestError('One or more branches do not exist');
      }
    }

    if (input.designation && !input.permissions) {
      input.permissions = DESIGNATION_PERMISSIONS[input.designation];
    }

    Object.assign(teacher, input);
    await teacher.save();
    return { teacher };
  });

  fastify.delete('/:id', { preHandler: [fastify.authorize(UserRole.SUPER_ADMIN)] }, async (request, reply) => {
    const id = objectId.parse((request.params as { id: string }).id);
    const teacher = await Teacher.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!teacher) {
      throw new NotFoundError('Teacher not found');
    }
    reply.code(204).send();
  });
}
