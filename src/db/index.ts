import { drizzle } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";

const connection = connect({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const db = drizzle(connection);

export default db;
