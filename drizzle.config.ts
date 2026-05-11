import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

export default {
  schema: "./src/lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    // biome-ignore lint/style/noNonNullAssertion: drizzle-kit requires DATABASE_URL
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
