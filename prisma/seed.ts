import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config();

const dbPath = path.resolve(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  console.log("🌱 Nettoyage de la base de données NARP-SMART...");

  // Suppression de toutes les données (l'ordre est important pour éviter les problèmes de clés étrangères)
  await prisma.sentiment.deleteMany();
  await prisma.aIAnalysis.deleteMany();
  await prisma.mention.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Base de données vidée.");

  console.log("👤 Création des nouveaux comptes de test...");

  // 1. Admin
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

  // 2. Analyst
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

  // 3. Viewer
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
