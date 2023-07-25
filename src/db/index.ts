import { drizzle } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";

const env = process.env.NODE_ENV;
console.log(env);
const connection = connect({
  host: process.env.DB_HOST,
  username: process.env.DB_USER_DEV,
  password: process.env.DB_PASSWORD_DEV,
});

const db = drizzle(connection);

export default db;
