import type { Config } from "drizzle-kit";
import {env} from "@/env.mjs"; 

export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  connectionString: `mysql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:3306/${env.DB_DATABASE}`
    
} satisfies Config;
