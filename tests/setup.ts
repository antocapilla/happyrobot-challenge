// Setup file for tests
// Mock environment variables before any imports
process.env.API_KEY = process.env.API_KEY || "test-api-key";
process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./test.db";
(process.env as { NODE_ENV: string }).NODE_ENV = process.env.NODE_ENV || "test";

