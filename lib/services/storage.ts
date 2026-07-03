// Provider-independent file storage (docs/06 storage module).
// Local disk implementation; the functions are the seam where S3/GCS/etc.
// would plug in. Files live OUTSIDE public/ and are served through the
// authenticated /api/files route (docs/10 secure file access).

import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import { randomBytes } from "crypto";
import path from "path";

const STORAGE_ROOT = path.join(process.cwd(), "storage", "uploads");

export type StorageCategory = "dreams" | "visualizations" | "avatars";

function safeName(name: string) {
  // Only serve names we generated: random hex + fixed extension.
  return /^[a-f0-9]{24,64}\.(jpg|jpeg|png|webp|svg)$/.test(name);
}

export async function saveFile(category: StorageCategory, ext: string, data: Buffer | string): Promise<string> {
  const dir = path.join(STORAGE_ROOT, category);
  await mkdir(dir, { recursive: true });
  const name = `${randomBytes(16).toString("hex")}.${ext}`;
  await writeFile(path.join(dir, name), data);
  return `${category}/${name}`;
}

export async function readStoredFile(category: string, name: string): Promise<{ data: Buffer; contentType: string } | null> {
  if (!["dreams", "visualizations", "avatars"].includes(category) || !safeName(name)) return null;
  try {
    const data = await readFile(path.join(STORAGE_ROOT, category, name));
    const ext = name.split(".").pop()!;
    const contentType =
      ext === "svg" ? "image/svg+xml" : ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    return { data, contentType };
  } catch {
    return null;
  }
}

export async function deleteStoredFile(storedPath: string | null | undefined) {
  if (!storedPath) return;
  const [category, name] = storedPath.split("/");
  if (!category || !name || !safeName(name)) return;
  await unlink(path.join(STORAGE_ROOT, category, name)).catch(() => {});
}

export function extForMime(mime: string): string | null {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return null;
}
