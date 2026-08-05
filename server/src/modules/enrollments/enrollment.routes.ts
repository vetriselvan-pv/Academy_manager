import { FastifyInstance } from 'fastify';
import { Enrollment } from '../../models/Enrollment';
import { Course } from '../../models/Course';
import { Student } from '../../models/Student';
import { createEnrollmentSchema, updateEnrollmentSchema } from '../../schemas/enrollment.schema';
import { objectId, paginationSchema } from '../../schemas/common.schema';
import { Teacher } from '../../models/Teacher';
import { assertBranchAccess } from '../../utils/authHelpers';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';
import { EnrollmentStatus, Permission, UserRole } from '../../types';

export async function enrollmentRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/', async (request) => {
    const queryParams = request.query as Record<string, string>;
    const { page, limit } = paginationSchema.parse(queryParams);
    const { student, course, branch, teacher, status } = queryParams;
    const authUser = request.authUser!;
    const filter: Record<string, unknown> = {};

    if (authUser.role === UserRole.STUDENT) {
      filter.student = authUser.id;
    } else if (authUser.role === UserRole.TEACHER) {
      if (!authUser.permissions.includes(Permission.VIEW_ENROLLMENTS)) {
        throw new ForbiddenError('Missing required permission: VIEW_ENROLLMENTS');
      }
      filter.branch = branch ? branch : { $in: authUser.branches };
      if (branch) assertBranchAccess(authUser, branch);
    } else {
      if (branch) filter.branch = branch;
    }

    if (status) filter.status = status;

    if (authUser.role !== UserRole.STUDENT && student) {
      const matchingStudents = await Student.find({ name: { $regex: student, $options: 'i' } }).select('_id');
      filter.student = { $in: matchingStudents.map(s => s._id) };
    }
    
    if (course) {
      const matchingCourses = await Course.find({ name: { $regex: course, $options: 'i' } }).select('_id');
      filter.course = { $in: matchingCourses.map(c => c._id) };
    }

    if (teacher) {
      const matchingTeachers = await Teacher.find({ name: { $regex: teacher, $options: 'i' } }).select('_id');
      filter.teacher = { $in: matchingTeachers.map(t => t._id) };
    }

    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      Enrollment.find(filter)
        .skip(skip)
        .limit(limit)
        .populate('student', 'name email')
        .populate('course', 'name category fee')
        .populate('branch', 'name code')
        .populate('teacher', 'name email')
        .sort({ createdAt: -1 }),
      Enrollment.countDocuments(filter)
    ]);

    return {
      data: enrollments,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  });

  fastify.get('/:id', async (request) => {
    const id = objectId.parse((request.params as { id: string }).id);
    const authUser = request.authUser!;

    const enrollment = await Enrollment.findById(id)
      .populate('student', 'name email')
      .populate('course', 'name category fee')
      .populate('branch', 'name code')
      .populate('teacher', 'name email');
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }

    if (authUser.role === UserRole.STUDENT && enrollment.student.toString() !== authUser.id) {
      throw new ForbiddenError('You can only view your own enrollments');
    }
    if (authUser.role === UserRole.TEACHER) {
      if (!authUser.permissions.includes(Permission.VIEW_ENROLLMENTS)) {
        throw new ForbiddenError('Missing required permission: VIEW_ENROLLMENTS');
      }
      assertBranchAccess(authUser, enrollment.branch.toString());
    }

    return { enrollment };
  });

  fastify.post('/', async (request, reply) => {
    const input = createEnrollmentSchema.parse(request.body);
    const authUser = request.authUser!;

    let studentId: string;
    if (authUser.role === UserRole.STUDENT) {
      studentId = authUser.id;
    } else if (authUser.role === UserRole.TEACHER) {
      if (!authUser.permissions.includes(Permission.MANAGE_ENROLLMENTS)) {
        throw new ForbiddenError('Missing required permission: MANAGE_ENROLLMENTS');
      }
      assertBranchAccess(authUser, input.branch);
      if (!input.student) {
        throw new BadRequestError('student is required');
      }
      studentId = input.student;
    } else {
      if (!input.student) {
        throw new BadRequestError('student is required');
      }
      studentId = input.student;
    }

    const student = await Student.findById(studentId);
    if (!student) {
      throw new BadRequestError('Student does not exist');
    }
    if (authUser.role === UserRole.STUDENT && student.branch.toString() !== input.branch) {
      throw new BadRequestError('Enrollment branch must match your registered branch');
    }

    const course = await Course.findById(input.course);
    if (!course || !course.isActive) {
      throw new BadRequestError('Course does not exist or is not active');
    }

    try {
      const enrollment = await Enrollment.create({
        student: studentId,
        course: input.course,
        branch: input.branch,
        teacher: input.teacher,
        batchTiming: input.batchTiming,
        startDate: input.startDate,
        feePaid: 0,
      });
      reply.code(201).send({ enrollment });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new BadRequestError('Student already has an active enrollment in this course');
      }
      throw error;
    }
  });

  fastify.patch(
    '/:id',
    { preHandler: [fastify.authorize(UserRole.SUPER_ADMIN, UserRole.TEACHER), fastify.can(Permission.MANAGE_ENROLLMENTS)] },
    async (request) => {
      const id = objectId.parse((request.params as { id: string }).id);
      const input = updateEnrollmentSchema.parse(request.body);
      const authUser = request.authUser!;

      const enrollment = await Enrollment.findById(id);
      if (!enrollment) {
        throw new NotFoundError('Enrollment not found');
      }
      if (authUser.role === UserRole.TEACHER) {
        assertBranchAccess(authUser, enrollment.branch.toString());
      }

      Object.assign(enrollment, input);
      await enrollment.save();
      return { enrollment };
    },
  );

  fastify.delete('/:id', async (request, reply) => {
    const id = objectId.parse((request.params as { id: string }).id);
    const authUser = request.authUser!;

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }

    if (authUser.role === UserRole.STUDENT) {
      if (enrollment.student.toString() !== authUser.id) {
        throw new ForbiddenError('You can only cancel your own enrollments');
      }
    } else if (authUser.role === UserRole.TEACHER) {
      if (!authUser.permissions.includes(Permission.MANAGE_ENROLLMENTS)) {
        throw new ForbiddenError('Missing required permission: MANAGE_ENROLLMENTS');
      }
      assertBranchAccess(authUser, enrollment.branch.toString());
    }

    enrollment.status = EnrollmentStatus.CANCELLED;
    enrollment.endDate = new Date();
    await enrollment.save();
    reply.code(204).send();
  });
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
}
