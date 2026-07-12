import { PrismaClient } from '@prisma/client';
import { beforeEach } from 'vitest';

const prisma = new PrismaClient();

// Wipe database before every test to ensure isolation
beforeEach(async () => {
  await prisma.application.deleteMany();
  await prisma.candidate.deleteMany();
});