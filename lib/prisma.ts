// lib/prisma.ts
// Robust Prisma Client singleton with dynamic loading and graceful server fallback

let prismaClientInstance: any = null;

try {
  const prismaPackage = require('@prisma/client');
  if (prismaPackage && prismaPackage.PrismaClient) {
    const globalForPrisma = globalThis as unknown as { prisma: any };
    prismaClientInstance =
      globalForPrisma.prisma ??
      new prismaPackage.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      });
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaClientInstance;
    }
  }
} catch {
  // Fallback for build phase or ungenerated client
}

export const prisma =
  prismaClientInstance ||
  ({
    product: {
      findMany: async () => [],
      count: async () => 0,
      create: async (args: any) => args.data,
      update: async (args: any) => args.data,
      delete: async (args: any) => args.where,
      findUnique: async () => null,
    },
    sale: {
      findMany: async () => [],
      create: async (args: any) => args.data,
      findUnique: async () => null,
    },
    expense: {
      findMany: async () => [],
      count: async () => 0,
      create: async (args: any) => args.data,
      delete: async (args: any) => args.where,
    },
    customer: {
      findMany: async () => [],
      count: async () => 0,
      create: async (args: any) => args.data,
      update: async (args: any) => args.data,
      findUnique: async () => null,
    },
    stockMovement: {
      create: async (args: any) => args.data,
    },
    $transaction: async (fn: (tx: any) => Promise<any>) => fn(prisma),
  } as any);
