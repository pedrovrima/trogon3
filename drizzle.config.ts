import type { Config } from "drizzle-kit";

export default {
  driver: "mysql2",
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    connectionString: `mysql://pmartins_pvm:pegaju11@www.pmartins.a2hosted.com:3306/pmartins_trogon_test`,
  },
} satisfies Config;
