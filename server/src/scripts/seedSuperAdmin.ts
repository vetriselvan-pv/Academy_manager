import { connectDB, disconnectDB } from '../config/db';
import { env } from '../config/env';
import { User } from '../models/User';
import { hashPassword } from '../utils/password';
import { UserRole } from '../types';

async function seed() {
  await connectDB();

  const existing = await User.findOne({ email: env.SUPER_ADMIN_EMAIL });
  if (existing) {
    console.log(`Super admin already exists: ${env.SUPER_ADMIN_EMAIL}`);
    await disconnectDB();
    return;
  }

  const passwordHash = await hashPassword(env.SUPER_ADMIN_PASSWORD);
  await User.create({
    name: env.SUPER_ADMIN_NAME,
    email: env.SUPER_ADMIN_EMAIL,
    passwordHash,
    role: UserRole.SUPER_ADMIN,
  });

  console.log(`Super admin created: ${env.SUPER_ADMIN_EMAIL}`);
  await disconnectDB();
}

seed().catch((error) => {
  console.error('Failed to seed super admin', error);
  process.exit(1);
});
