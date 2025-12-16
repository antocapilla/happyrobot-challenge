// Mock for env in tests
export const env = {
  NODE_ENV: (process.env.NODE_ENV || "test") as "development" | "test" | "production",
  DATABASE_URL: process.env.DATABASE_URL || "file:./test.db",
  API_KEY: process.env.API_KEY || "test-api-key",
};

