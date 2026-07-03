import { db } from "@/lib/db";
import { handle, notFound, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export const POST = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const symbol = await db.symbol.findUnique({ where: { id } });
  if (!symbol) throw notFound("Symbol");

  const existing = await db.symbolBookmark.findUnique({
    where: { userId_symbolId: { userId: user.id, symbolId: id } },
  });
  if (existing) {
    await db.symbolBookmark.delete({ where: { userId_symbolId: { userId: user.id, symbolId: id } } });
    return ok({ bookmarked: false }, "Bookmark removed.");
  }
  await db.symbolBookmark.create({ data: { userId: user.id, symbolId: id } });
  return ok({ bookmarked: true }, "Symbol bookmarked.");
});
