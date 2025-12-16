import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  API_KEY: z.string().min(1, "API_KEY is required"),
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  
  // Skip validation during build time
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return {
      NODE_ENV: "production",
      DATABASE_URL: "build-placeholder",
      API_KEY: "build-placeholder",
    };
  }

  try {
    cachedEnv = envSchema.parse(process.env);
    return cachedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("\n");
      throw new Error(`Invalid environment variables:\n${missingVars}`);
    }
    throw error;
  }
}

export const env = new Proxy({} as Env, {
  get(_, prop: keyof Env) {
    return getEnv()[prop];
  },
});
