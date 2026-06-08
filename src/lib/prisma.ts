import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  if (process.env.TURSO_DATABASE_URL) {
    // Producción: Turso (libSQL cloud)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@libsql/client')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN ?? '',
    })
    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])
  }
  // Local: SQLite archivo
  return new PrismaClient()
}

export const prisma = globalThis.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
