/**
 * Creates the initial platform_admin account.
 * Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed:admin
 * (values may also come from backend/.env). Does nothing if the user already exists.
 */
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../app.module';
import { User } from '../modules/user/user.entity';
import { Role } from '../common/enums';

async function seedAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set (env or backend/.env).');
      process.exitCode = 1;
      return;
    }
    if (password.length < 8) {
      console.error('❌ ADMIN_PASSWORD must be at least 8 characters.');
      process.exitCode = 1;
      return;
    }

    const users = app.get<Repository<User>>(getRepositoryToken(User));
    const existing = await users.findOne({ where: { email } });
    if (existing) {
      console.log(`ℹ️  User ${email} already exists (role: ${existing.role}). Nothing to do.`);
      return;
    }

    const admin = users.create({
      email,
      password: await bcrypt.hash(password, 10),
      firstName: 'Platform',
      lastName: 'Admin',
      role: Role.PLATFORM_ADMIN,
      enterpriseId: null,
    });
    await users.save(admin);
    console.log(`✅ Platform admin ${email} created.`);
  } finally {
    await app.close();
  }
}

seedAdmin().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
