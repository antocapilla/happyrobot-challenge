import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use process.env directly so it's optional for prisma generate
    // Only needed for migrate commands, not for generate
    url: process.env.DATABASE_URL ?? "postgresql://dummy:dummy@localhost:5432/dummy",
  },
});

