import { db } from "@/lib/db";
import { aiModeLabel } from "@/lib/ai";

export async function GET() {
  let dbOk = false;
  try {
    await db.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }
  return Response.json(
    {
      status: dbOk ? "healthy" : "degraded",
      database: dbOk ? "up" : "down",
      ai: aiModeLabel(),
      timestamp: new Date().toISOString(),
    },
    { status: dbOk ? 200 : 503 }
  );
}
