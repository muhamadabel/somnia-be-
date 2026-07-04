import { db } from "@/lib/db";
import { handle, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getStreak, getTrends } from "@/lib/services/trends";

// Aggregated data for the dashboard home screen.
export const GET = handle(async () => {
  const user = await requireUser();

  const [totalDreams, recentDreams, streak, trends, latestReport] = await Promise.all([
    db.dream.count({ where: { userId: user.id, deletedAt: null, isDraft: false } }),
    db.dream.findMany({
      where: { userId: user.id, deletedAt: null, archivedAt: null },
      orderBy: { dreamDate: "desc" },
      take: 5,
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
    }),
    getStreak(user.id),
    getTrends(user.id, 7),
    db.report.findFirst({ where: { userId: user.id }, orderBy: { generatedAt: "desc" } }),
  ]);

  return ok({
    user: { fullName: user.fullName, reminderEnabled: user.reminderEnabled, reminderTime: user.reminderTime },
    totalDreams,
    recentDreams,
    streak,
    trends,
    latestReport,
  });
});
