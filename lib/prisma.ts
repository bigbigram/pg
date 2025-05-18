import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });
};

declare global {
  var globalPrismaClient: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.globalPrismaClient ?? prismaClientSingleton();

// Validate database connection
prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch((e) => console.error('Database connection failed:', e));

if (process.env.NODE_ENV !== 'production') globalThis.globalPrismaClient = prisma;

export default prisma;
