import { db } from "@/lib/db";
import { handle, ok, rateLimit } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { messageSchema } from "@/lib/validation";
import { buildHistoryContext, getAIProvider } from "@/lib/ai";
import { truncate } from "@/lib/utils";

export const GET = handle(async () => {
  const user = await requireUser();
  const conversations = await db.conversation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 30,
    include: { _count: { select: { messages: true } } },
  });
  return ok(conversations);
});

// Start a conversation with the first user message → returns the
// conversation including the assistant's contextual reply.
export const POST = handle(async (req: Request) => {
  const user = await requireUser();
  rateLimit(`companion:${user.id}`, 15, 60_000);
  const { content } = messageSchema.parse(await req.json());

  const history = await buildHistoryContext(user.id);
  const provider = getAIProvider();
  const reply = await provider.companionReply({
    question: content,
    conversation: [],
    history,
    memoryEnabled: user.aiMemoryEnabled,
  });

  const conversation = await db.conversation.create({
    data: {
      userId: user.id,
      title: truncate(content, 60),
      messages: {
        create: [
          { role: "user", content },
          { role: "assistant", content: reply },
        ],
      },
    },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return ok(conversation, "Conversation started.");
});
