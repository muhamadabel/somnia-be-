import { handle, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { buildHistoryContext } from "@/lib/ai";
import { symbolLabel } from "@/lib/ai/lexicon";

export const GET = handle(async () => {
  const user = await requireUser();
  const history = await buildHistoryContext(user.id);

  const suggestions: string[] = [];
  if (history.recurringSymbols[0]) {
    suggestions.push(`Kenapa "${symbolLabel(history.recurringSymbols[0].name).toLowerCase()}" terus muncul di mimpiku?`);
  }
  if (history.emotionCounts[0]) {
    suggestions.push(`Bagaimana perasaan mimpiku belakangan ini?`);
  }
  if (history.totalDreams >= 2) {
    suggestions.push("Bandingkan dua mimpi terbaruku — apa yang berubah?");
  }
  suggestions.push(
    history.totalDreams > 0
      ? "Pola apa yang kamu lihat di jurnal mimpiku?"
      : "Bagaimana cara memaksimalkan jurnal mimpi?"
  );

  return ok(suggestions.slice(0, 4));
});
