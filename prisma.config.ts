import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma CLI configuration (required for migrate commands)
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "prisma/migrations",
  },
});
