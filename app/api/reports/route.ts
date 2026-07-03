import { db } from "@/lib/db";
import { handle, ok, rateLimit } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { generateReportSchema } from "@/lib/validation";
import { generateReport } from "@/lib/services/reports";

export const GET = handle(async () => {
  const user = await requireUser();
  const reports = await db.report.findMany({
    where: { userId: user.id },
    orderBy: { generatedAt: "desc" },
    take: 30,
  });
  return ok(reports);
});

export const POST = handle(async (req: Request) => {
  const user = await requireUser();
  rateLimit(`report:${user.id}`, 6, 60_000);
  const { period } = generateReportSchema.parse(await req.json());
  const report = await generateReport(user.id, period);

  const periodLabelId = { weekly: "mingguan", monthly: "bulanan", yearly: "tahunan" }[period];
  await db.notification.create({
    data: {
      userId: user.id,
      type: "report",
      title: `Laporan ${periodLabelId}mu sudah siap`,
      message: "Laporan kesejahteraan baru telah dibuat dari riwayat mimpimu.",
      link: `/reports/${report.id}`,
    },
  });

  return ok(report, "Report generated.");
});
