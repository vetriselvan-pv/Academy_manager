import { FastifyInstance } from 'fastify';
import { MENU_TREE } from '../../config/menu';
import { filterMenu } from './menu.service';

export async function menuRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/', async (request) => {
    const menu = filterMenu(MENU_TREE, request.authUser!);
    return { menu };
  });
}
