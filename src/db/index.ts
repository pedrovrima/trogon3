import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";

import mysql from "mysql2/promise";
console.log(process.env.NODE_ENV);
const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database:
    process.env.NODE_ENV === "development"
      ? process.env.DB_DATABASE_DEV
      : process.env.DB_DATABASE_PROD,
  password: process.env.DB_PASSWORD,
});

const db = drizzle(connection);

export default db;
