import { db } from "@/lib/db";
import { handle, notFound, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

// Symbol detail by slug (preferred) or cuid, plus the user's related dreams.
export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;

  const symbol = await db.symbol.findFirst({
    where: { OR: [{ slug: id }, { id }] },
    include: { bookmarks: { where: { userId: user.id }, select: { userId: true } } },
  });
  if (!symbol) throw notFound("Symbol");

  const related = await db.dream.findMany({
    where: { userId: user.id, deletedAt: null, symbols: { some: { symbolId: symbol.id } } },
    include: {
      emotions: { include: { emotion: true } },
      symbols: { include: { symbol: true } },
      visualizations: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { imagePath: true },
      },
    },
    orderBy: { dreamDate: "desc" },
    take: 9,
  });

  return ok({
    symbol: {
      id: symbol.id,
      name: symbol.name,
      slug: symbol.slug,
      category: symbol.category,
      description: symbol.description,
      interpretation: symbol.interpretation,
      relatedEmotions: symbol.relatedEmotions,
      bookmarked: symbol.bookmarks.length > 0,
    },
    related,
  });
});
