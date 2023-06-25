import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
 console.log(process.env);
const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD
});
 
const db = drizzle(connection);

export default db;