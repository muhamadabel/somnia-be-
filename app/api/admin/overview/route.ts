import { db } from "@/lib/db";
import { handle, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

// Admin dashboard: counts + one detail list chosen by ?tab=.
export const GET = handle(async (req: Request) => {
  await requireAdmin();
  const tab = new URL(req.url).searchParams.get("tab") ?? "moderation";

  const [userCount, dreamCount, postCount, openReports] = await Promise.all([
    db.user.count(),
    db.dream.count({ where: { deletedAt: null } }),
    db.communityPost.count({ where: { deletedAt: null } }),
    db.contentReport.count({ where: { status: "open" } }),
  ]);

  const reports =
    tab === "moderation"
      ? await db.contentReport.findMany({
          orderBy: [{ status: "asc" }, { createdAt: "desc" }],
          take: 30,
          include: {
            post: { select: { id: true, title: true, content: true } },
            comment: { select: { id: true, content: true, postId: true } },
            reporter: { select: { anonName: true } },
          },
        })
      : [];

  const users =
    tab === "users"
      ? await db.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true, fullName: true, email: true, role: true, status: true, createdAt: true,
            _count: { select: { dreams: true, posts: true } },
          },
        })
      : [];

  const logs =
    tab === "audit"
      ? await db.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { user: { select: { email: true } } },
        })
      : [];

  return ok({ stats: { userCount, dreamCount, postCount, openReports }, reports, users, logs });
});
