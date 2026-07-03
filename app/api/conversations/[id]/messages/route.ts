import { db } from "@/lib/db";
import { handle, notFound, ok, rateLimit } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { messageSchema } from "@/lib/validation";
import { buildHistoryContext, getAIProvider } from "@/lib/ai";
import type { CompanionTurn } from "@/lib/ai/types";

type Ctx = { params: Promise<{ id: string }> };

export const POST = handle(async (req: Request, { params }: Ctx) => {
  const user = await requireUser();
  rateLimit(`companion:${user.id}`, 15, 60_000);
  const { id } = await params;
  const { content } = messageSchema.parse(await req.json());

  const conversation = await db.conversation.findFirst({
    where: { id, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
  });
  if (!conversation) throw notFound("Conversation");

  const history = await buildHistoryContext(user.id);
  const provider = getAIProvider();
  const reply = await provider.companionReply({
    question: content,
    conversation: conversation.messages.map((m) => ({ role: m.role, content: m.content })) as CompanionTurn[],
    history,
    memoryEnabled: user.aiMemoryEnabled,
  });

  const [userMsg, assistantMsg] = await db.$transaction([
    db.message.create({ data: { conversationId: id, role: "user", content } }),
    db.message.create({ data: { conversationId: id, role: "assistant", content: reply } }),
    db.conversation.update({ where: { id }, data: { updatedAt: new Date() } }),
  ]);

  return ok({ userMessage: userMsg, assistantMessage: assistantMsg });
});
