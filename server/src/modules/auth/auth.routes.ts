import { FastifyInstance } from 'fastify';
import { User, SuperAdmin } from '../../models/User';
import { Student } from '../../models/Student';
import { Teacher } from '../../models/Teacher';
import { Branch } from '../../models/Branch';
import { RefreshToken } from '../../models/RefreshToken';
import { hashPassword, comparePassword } from '../../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { loginSchema, registerStudentSchema, refreshSchema, changePasswordSchema, registerTeacherSchema, registerAdminSchema } from '../../schemas/auth.schema';
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '../../utils/errors';
import { UserRole } from '../../types';

const REFRESH_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

async function issueTokenPair(userId: string, role: UserRole) {
  const accessToken = signAccessToken(userId, role);
  const { token: refreshToken, jti } = signRefreshToken(userId);

  await RefreshToken.create({
    user: userId,
    jti,
    expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
  });

  return { accessToken, refreshToken };
}

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/register/student', async (request, reply) => {
    const input = registerStudentSchema.parse(request.body);

    const existing = await User.findOne({ email: input.email });
    if (existing) {
      throw new ConflictError('Email is already registered');
    }

    const branch = await Branch.findById(input.branch);
    if (!branch) {
      throw new BadRequestError('Branch does not exist');
    }

    const passwordHash = await hashPassword(input.password);
    const student = await Student.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      branch: input.branch,
      dateOfBirth: input.dateOfBirth,
      gender: input.gender,
      address: input.address,
      guardianName: input.guardianName,
      guardianPhone: input.guardianPhone,
    });

    const tokens = await issueTokenPair(student.id, UserRole.STUDENT);
    reply.code(201).send({ user: student, ...tokens });
  });

  fastify.post('/register/teacher', async (request, reply) => {
    const input = registerTeacherSchema.parse(request.body);

    const existing = await User.findOne({ email: input.email });
    if (existing) {
      throw new ConflictError('Email is already registered');
    }

    const branches = await Branch.find({ _id: { $in: input.branches } });
    if (branches.length !== input.branches.length) {
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
      specializedCourses: input.specializedCourses,
    });

    const tokens = await issueTokenPair(teacher.id, UserRole.TEACHER);
    reply.code(201).send({ user: teacher, ...tokens });
  });

  fastify.post('/register/admin', async (request, reply) => {
    const input = registerAdminSchema.parse(request.body);

    const existing = await User.findOne({ email: input.email });
    if (existing) {
      throw new ConflictError('Email is already registered');
    }

    const passwordHash = await hashPassword(input.password);
    const admin = await SuperAdmin.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
    });

    const tokens = await issueTokenPair(admin.id, UserRole.SUPER_ADMIN);
    reply.code(201).send({ user: admin, ...tokens });
  });

  fastify.post('/login', async (request, reply) => {
    const input = loginSchema.parse(request.body);

    const user = await User.findOne({ email: input.email }).select('+passwordHash');
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = await issueTokenPair(user.id, user.role);
    reply.send({ user, ...tokens });
  });

  fastify.post('/refresh', async (request, reply) => {
    const { refreshToken } = refreshSchema.parse(request.body);
    const payload = verifyRefreshToken(refreshToken);

    const stored = await RefreshToken.findOne({ jti: payload.jti, user: payload.sub });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token is invalid or has been revoked');
    }

    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    stored.revokedAt = new Date();
    await stored.save();

    const tokens = await issueTokenPair(user.id, user.role);
    reply.send(tokens);
  });

  fastify.post('/logout', async (request, reply) => {
    const { refreshToken } = refreshSchema.parse(request.body);
    const payload = verifyRefreshToken(refreshToken);

    await RefreshToken.updateOne({ jti: payload.jti, revokedAt: null }, { revokedAt: new Date() });
    reply.code(204).send();
  });

  fastify.post(
    '/change-password',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const input = changePasswordSchema.parse(request.body);
      const user = await User.findById(request.authUser!.id).select('+passwordHash');
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const valid = await comparePassword(input.currentPassword, user.passwordHash);
      if (!valid) {
        throw new UnauthorizedError('Current password is incorrect');
      }

      user.passwordHash = await hashPassword(input.newPassword);
      await user.save();
      reply.code(204).send();
    },
  );
}
