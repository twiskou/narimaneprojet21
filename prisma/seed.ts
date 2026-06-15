import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
dotenv.config();
process.env.DATABASE_URL = "file:./dev.db";

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.sentiment.deleteMany();
  await prisma.aIAnalysis.deleteMany();
  await prisma.mention.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash("admin1234", 12);
  await prisma.user.create({ data: { email: "admin@gmail.com", name: "Admin", passwordHash: adminHash, role: "ADMIN", orgName: "NARP-SMART" } });

  const analystHash = await bcrypt.hash("analyst1234", 12);
  await prisma.user.create({ data: { email: "user1@gmail.com", name: "Analyste", passwordHash: analystHash, role: "ANALYST", orgName: "NARP-SMART" } });

  const viewerHash = await bcrypt.hash("viewer1234", 12);
  await prisma.user.create({ data: { email: "user2@gmail.com", name: "Observateur", passwordHash: viewerHash, role: "VIEWER", orgName: "NARP-SMART" } });

  console.log("🎉 Seed terminé !");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });