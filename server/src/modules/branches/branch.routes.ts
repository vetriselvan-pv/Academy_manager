import { FastifyInstance } from 'fastify';
import { Branch } from '../../models/Branch';
import { createBranchSchema, updateBranchSchema, branchQuerySchema } from '../../schemas/branch.schema';
import { objectId } from '../../schemas/common.schema';
import { ConflictError, NotFoundError } from '../../utils/errors';
import { UserRole } from '../../types';

export async function branchRoutes(fastify: FastifyInstance): Promise<void> {
  // Deliberately public (no `authenticate` hook): the student self-registration form needs to
  // populate a branch picker before the caller has any token. Only non-sensitive fields are
  // exposed here (name/code/address/contact details), and every write below still requires
  // SUPER_ADMIN.
  fastify.get('/', async (request) => {
    const query = branchQuerySchema.parse(request.query);
    const dbQuery: any = {};
    if (query.name) dbQuery.name = { $regex: query.name, $options: 'i' };
    if (query.code) dbQuery.code = { $regex: query.code, $options: 'i' };
    if (query.city) dbQuery.city = { $regex: query.city, $options: 'i' };
    if (query.phone) dbQuery.phone = { $regex: query.phone, $options: 'i' };
    if (query.isActive) dbQuery.isActive = query.isActive === 'true';

    const branches = await Branch.find(dbQuery).populate('manager', 'name email').sort({ name: 1 });
    return { branches };
  });

  fastify.get('/:id', async (request) => {
    const id = objectId.parse((request.params as { id: string }).id);
    const branch = await Branch.findById(id).populate('manager', 'name email');
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

      const lastBranch = await Branch.findOne().sort({ code: -1 }).select('code');
      let nextCodeNum = 1;
      
      if (lastBranch && lastBranch.code && lastBranch.code.startsWith('BR-')) {
        const lastNum = parseInt(lastBranch.code.split('-')[1] || '0', 10);
        if (!isNaN(lastNum)) {
          nextCodeNum = lastNum + 1;
        }
      }
      
      const nextCode = `BR-${nextCodeNum.toString().padStart(3, '0')}`;

      const branch = await Branch.create({ ...input, code: nextCode });
      reply.code(201).send({ branch });
    },
  );

  fastify.patch(
    '/:id',
    { preHandler: [fastify.authenticate, fastify.authorize(UserRole.SUPER_ADMIN)] },
    async (request) => {
      const id = objectId.parse((request.params as { id: string }).id);
      const input = updateBranchSchema.parse(request.body);

      const branch = await Branch.findByIdAndUpdate(id, input, { new: true, runValidators: true }).populate('manager', 'name email');
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
