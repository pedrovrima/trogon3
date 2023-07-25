import { drizzle } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";

const env = process.env.NODE_ENV;
const connection = connect({
  host: process.env.DB_HOST,
  username:
    env === "development" ? process.env.DB_USER_DEV : process.env.DB_USER_PROD,
  password:
    env === "development"
      ? process.env.DB_PASSWORD_DEV
      : process.env.DB_PASSWORD_PROD,
});

const db = drizzle(connection);

export default db;
