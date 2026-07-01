import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../generated/prisma/client.js';
import { PrismaClientValidationError } from '../generated/prisma/runtime/client.js';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };