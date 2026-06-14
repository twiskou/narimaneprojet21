import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.role === "VIEWER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 413 });

    const ext = ALLOWED_TYPES[file.type];
    if (!ext)
      return NextResponse.json({ error: "Invalid file type. Only PDF, JPG, PNG, DOCX allowed." }, { status: 415 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const safeBase = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 60);
    const fileName = `${Date.now()}_${session.userId.slice(0, 8)}_${safeBase}`;
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      url: `/uploads/${fileName}`,
      fileName: file.name,
      fileType: ext,
    });
  } catch (e) {
    console.error("[/api/upload]", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
