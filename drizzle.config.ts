import type { Config } from "drizzle-kit";
 
export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  connectionString: `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:3306/${process.env.DB_DATABASE}`
    
} satisfies Config;
