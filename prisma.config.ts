import "dotenv/config";
import { defineConfig, env } from "prisma/config";

type Env = {
  DATABASE_URL: string;
};

export default defineConfig({
  // where your Prisma schema lives
  schema: "prisma/schema.prisma",

  // Migrate / seed config
  migrations: {
    path: "prisma/migrations",
    // this is your existing seed command, moved from package.json
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },

  // Database connection URL now lives here instead of in schema.prisma
  datasource: {
    url: env<Env>("DATABASE_URL"),
  },
});
