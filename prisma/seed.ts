import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
dotenv.config();

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Nettoyage de la base de données NARP-SMART...");

  await prisma.sentiment.deleteMany();
  await prisma.aIAnalysis.deleteMany();
  await prisma.mention.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Base de données vidée.");
  console.log("👤 Création des nouveaux comptes de test...");

  const adminHash = await bcrypt.hash("admin1234", 12);
  await prisma.user.create({
    data: {
      email: "admin@narp-smart.com",
      name: "Administrateur",
      passwordHash: adminHash,
      role: "ADMIN",
      orgName: "NARP-SMART",
    },
  });

  const analystHash = await bcrypt.hash("analyst1234", 12);
  await prisma.user.create({
    data: {
      email: "analyst@narp-smart.com",
      name: "Analyste",
      passwordHash: analystHash,
      role: "ANALYST",
      orgName: "NARP-SMART",
    },
  });

  const viewerHash = await bcrypt.hash("viewer1234", 12);
  await prisma.user.create({
    data: {
      email: "viewer@narp-smart.com",
      name: "Observateur",
      passwordHash: viewerHash,
      role: "VIEWER",
      orgName: "NARP-SMART",
    },
  });

  console.log("\n🎉 Seed terminé avec succès !");
  console.log("   Admin   : admin@narp-smart.com / admin1234");
  console.log("   Analyst : analyst@narp-smart.com / analyst1234");
  console.log("   Viewer  : viewer@narp-smart.com / viewer1234");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });