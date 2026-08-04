import { buildApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function main() {
  await connectDB();
  const app = await buildApp();

  await app.listen({ port: env.PORT, host: '0.0.0.0' });

  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down`);
    await app.close();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
