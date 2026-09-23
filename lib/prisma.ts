import { Prisma, PrismaClient } from "@prisma/client";

// Neon (and other serverless Postgres providers) can take several seconds to
// wake a suspended compute or hand back a pooled connection. A single dropped
// or slow first attempt shouldn't surface as a hard crash, so transient
// "can't reach database server" errors get a couple of quick retries before
// giving up.
const RETRYABLE_ERROR_CODES = new Set(["P1001", "P1002", "P1008", "P1017"]);

function isRetryable(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return RETRYABLE_ERROR_CODES.has(error.code);
  }
  return false;
}

function withRetry(client: PrismaClient) {
  return client.$extends({
    query: {
      async $allOperations({ query, args }) {
        const attempts = 3;
        for (let attempt = 1; attempt <= attempts; attempt++) {
          try {
            return await query(args);
          } catch (error) {
            if (attempt === attempts || !isRetryable(error)) throw error;
            await new Promise((resolve) => setTimeout(resolve, attempt * 300));
          }
        }
        throw new Error("unreachable");
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof withRetry> | undefined;
};

export const prisma = globalForPrisma.prisma ?? withRetry(new PrismaClient());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
