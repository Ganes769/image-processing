import pg from "pg";
import dotenv from "dotenv";
import * as schema from "../schema/userSchema";
import { drizzle } from "drizzle-orm/node-postgres";
dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || "5432", 10),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});
export const db = drizzle(pool, { schema });
