import { Kysely, PostgresDialect } from "kysely";
import pkg from "pg";
const { Pool } = pkg;

let dbInstance = null;

export default function getDbPostgres() {
  if (!dbInstance) {
    const pool = new Pool({
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.POSTGRES_DATABASE,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    dbInstance = new Kysely({
      dialect: new PostgresDialect({ pool }),
    });
  }
  return dbInstance;
}
