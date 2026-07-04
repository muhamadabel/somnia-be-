import { handle, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getTrends } from "@/lib/services/trends";

const RANGES = [7, 30, 90, 365];

export const GET = handle(async (req: Request) => {
  const user = await requireUser();
  const raw = Number(new URL(req.url).searchParams.get("range"));
  const range = RANGES.includes(raw) ? raw : 30;
  const trends = await getTrends(user.id, range);
  return ok(trends);
});
