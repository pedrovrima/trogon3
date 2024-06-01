import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    // NEXTAUTH_SECRET:
    //   process.env.NODE_ENV === "production"
    //     ? z.string().min(1)
    //     : z.string().min(1).optional(),
    // NEXTAUTH_URL: z.string().min(1),
    // DB_HOST: z.string().min(1),
    // DB_USER_PROD: z.string().min(1),
    // DB_USER_DEV: z.string().min(1),

    // DB_PASSWORD_PROD: z.string().min(1),
    // DB_PASSWORD_DEV: z.string().min(1),
    // DB_DATABASE_PROD: z.string().min(1),
    // DB_DATABASE_DEV: z.string().min(1),
    CONNECTION_URL: z.string().min(1),

    // Add `.min(1) on ID and SECRET if you want to make sure they're not empty
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    // NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    // NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    // DB_HOST: process.env.DB_HOST,
    // DB_USER_PROD: process.env.DB_USER_PROD,
    // DB_USER_DEV: process.env.DB_USER_DEV,

    // DB_PASSWORD_PROD: process.env.DB_PASSWORD_PROD,
    // DB_PASSWORD_DEV: process.env.DB_PASSWORD_DEV,
    // DB_DATABASE_PROD: process.env.DB_DATABASE_PROD,
    // DB_DATABASE_DEV: process.env.DB_DATABASE_DEV,
    CONNECTION_URL: process.env.CONNECTION_URL,
  },
});
