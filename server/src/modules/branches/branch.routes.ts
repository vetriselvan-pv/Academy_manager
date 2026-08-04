import { FastifyInstance } from 'fastify';
import { Branch } from '../../models/Branch';
import { createBranchSchema, updateBranchSchema } from '../../schemas/branch.schema';
import { objectId } from '../../schemas/common.schema';
import { ConflictError, NotFoundError } from '../../utils/errors';
import { UserRole } from '../../types';

export async function branchRoutes(fastify: FastifyInstance): Promise<void> {
  // Deliberately public (no `authenticate` hook): the student self-registration form needs to
  // populate a branch picker before the caller has any token. Only non-sensitive fields are
  // exposed here (name/code/address/contact details), and every write below still requires
  // SUPER_ADMIN.
  fastify.get('/', async () => {
    const branches = await Branch.find().sort({ name: 1 });
    return { branches };
  });

  fastify.get('/:id', async (request) => {
    const id = objectId.parse((request.params as { id: string }).id);
    const branch = await Branch.findById(id);
    if (!branch) {
      throw new NotFoundError('Branch not found');
    }
    return { branch };
  });

  fastify.post(
    '/',
    { preHandler: [fastify.authenticate, fastify.authorize(UserRole.SUPER_ADMIN)] },
    async (request, reply) => {
      const input = createBranchSchema.parse(request.body);

      const existing = await Branch.findOne({ code: input.code.toUpperCase() });
      if (existing) {
        throw new ConflictError('Branch code already exists');
      }

      const branch = await Branch.create(input);
      reply.code(201).send({ branch });
    },
  );

  fastify.patch(
    '/:id',
    { preHandler: [fastify.authenticate, fastify.authorize(UserRole.SUPER_ADMIN)] },
    async (request) => {
      const id = objectId.parse((request.params as { id: string }).id);
      const input = updateBranchSchema.parse(request.body);

      const branch = await Branch.findByIdAndUpdate(id, input, { new: true, runValidators: true });
      if (!branch) {
        throw new NotFoundError('Branch not found');
      }
      return { branch };
    },
  );

  fastify.delete(
    '/:id',
    { preHandler: [fastify.authenticate, fastify.authorize(UserRole.SUPER_ADMIN)] },
    async (request, reply) => {
      const id = objectId.parse((request.params as { id: string }).id);
      const branch = await Branch.findByIdAndUpdate(id, { isActive: false }, { new: true });
      if (!branch) {
        throw new NotFoundError('Branch not found');
      }
      reply.code(204).send();
    },
  );
}
