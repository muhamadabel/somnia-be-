import { db } from "@/lib/db";
import { handle, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";

// Symbol library with filters: q, category, view = all | mine | bookmarked.
export const GET = handle(async (req: Request) => {
  const user = await requireUser();
  const sp = new URL(req.url).searchParams;
  const q = sp.get("q")?.trim();
  const category = sp.get("category")?.trim();
  const view = sp.get("view") ?? "all";

  const symbols = await db.symbol.findMany({
    where: {
      ...(q ? { OR: [{ name: { contains: q } }, { description: { contains: q } }] } : {}),
      ...(category ? { category } : {}),
      ...(view === "mine" ? { dreams: { some: { dream: { userId: user.id, deletedAt: null } } } } : {}),
      ...(view === "bookmarked" ? { bookmarks: { some: { userId: user.id } } } : {}),
    },
    include: {
      bookmarks: { where: { userId: user.id }, select: { userId: true } },
      _count: { select: { dreams: { where: { dream: { userId: user.id, deletedAt: null } } } } },
    },
    orderBy: { name: "asc" },
  });

  const sorted = [...symbols].sort(
    (a, b) => b._count.dreams - a._count.dreams || a.name.localeCompare(b.name)
  );

  return ok(
    sorted.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      category: s.category,
      interpretation: s.interpretation,
      dreamCount: s._count.dreams,
      bookmarked: s.bookmarks.length > 0,
    }))
  );
});
