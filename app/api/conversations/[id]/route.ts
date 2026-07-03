import { db } from "@/lib/db";
import { handle, notFound, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const conversation = await db.conversation.findFirst({
    where: { id, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) throw notFound("Conversation");
  return ok(conversation);
});

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const conversation = await db.conversation.findFirst({ where: { id, userId: user.id } });
  if (!conversation) throw notFound("Conversation");
  await db.conversation.delete({ where: { id } });
  return ok(null, "Conversation deleted.");
});
