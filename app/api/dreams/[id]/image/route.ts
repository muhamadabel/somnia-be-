import { db } from "@/lib/db";
import { AppError, handle, notFound, ok, rateLimit } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { deleteStoredFile, extForMime, saveFile } from "@/lib/services/storage";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/constants";

type Ctx = { params: Promise<{ id: string }> };

export const POST = handle(async (req: Request, { params }: Ctx) => {
  const user = await requireUser();
  rateLimit(`upload:${user.id}`, 20, 60_000);
  const { id } = await params;
  const dream = await db.dream.findFirst({ where: { id, userId: user.id, deletedAt: null } });
  if (!dream) throw notFound("Dream");

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new AppError(422, "No file uploaded.");
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new AppError(422, "Unsupported image format. Use JPEG, PNG, or WebP.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new AppError(422, "Image is too large — maximum size is 5 MB.");
  }

  const ext = extForMime(file.type)!;
  const buffer = Buffer.from(await file.arrayBuffer());
  await deleteStoredFile(dream.imagePath);
  const imagePath = await saveFile("dreams", ext, buffer);
  const updated = await db.dream.update({ where: { id }, data: { imagePath } });
  return ok({ imagePath: updated.imagePath }, "Image attached.");
});

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const dream = await db.dream.findFirst({ where: { id, userId: user.id, deletedAt: null } });
  if (!dream) throw notFound("Dream");
  await deleteStoredFile(dream.imagePath);
  await db.dream.update({ where: { id }, data: { imagePath: null } });
  return ok(null, "Image removed.");
});
