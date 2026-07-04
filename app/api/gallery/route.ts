import { db } from "@/lib/db";
import { handle, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";

// All AI/procedural visualizations belonging to the user's dreams.
export const GET = handle(async (req: Request) => {
  const user = await requireUser();
  const q = new URL(req.url).searchParams.get("q")?.trim();

  const visualizations = await db.visualization.findMany({
    where: {
      deletedAt: null,
      dream: {
        userId: user.id,
        deletedAt: null,
        ...(q ? { OR: [{ title: { contains: q } }, { description: { contains: q } }] } : {}),
      },
    },
    include: { dream: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return ok(
    visualizations.map((v) => ({
      id: v.id,
      imagePath: v.imagePath,
      prompt: v.prompt,
      createdAt: v.createdAt,
      dreamId: v.dream.id,
      dreamTitle: v.dream.title,
    }))
  );
});
