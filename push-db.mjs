import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import dotenv from "dotenv";
dotenv.config();

const sql = readFileSync("migration.sql", "utf-8");
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const statements = sql.split(";").map(s => s.trim()).filter(s => s.length > 0);
for (const statement of statements) {
  await client.execute(statement);
  console.log("✅ " + statement.substring(0, 60));
}
console.log("🎉 DB pushed to Turso!");