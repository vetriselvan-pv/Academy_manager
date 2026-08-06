import { buildApp } from './app';

// Initialize Fastify app
const appPromise = (async () => {
  const app = await buildApp();
  await app.ready(); // Ensures all plugins, routes, and hooks are fully registered
  return app;
})();

// Export a serverless request handler function as default
export default async function handler(req: any, res: any) {
  const app = await appPromise;
  app.server.emit('request', req, res);
}