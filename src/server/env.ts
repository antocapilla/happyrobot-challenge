import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  API_KEY: z.string().min(1, "API_KEY is required"),
  FMCSA_API_KEY: z.string().default("DEMO_KEY"),
});

type Env = z.infer<typeof envSchema>;

let env: Env;

// Skip validation during build time
if (process.env.NEXT_PHASE === "phase-production-build") {
  env = {
    NODE_ENV: "production",
    DATABASE_URL: "build-placeholder",
    API_KEY: "build-placeholder",
    FMCSA_API_KEY: "DEMO_KEY",
  };
} else {
  try {
    env = envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("\n");
      throw new Error(`Invalid environment variables:\n${missingVars}`);
    }
    throw error;
  }
}

export { env };
