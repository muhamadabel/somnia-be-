// Shared AI contracts — every provider (Claude, local demo, future ones)
// returns the same structured shapes (docs/09 structured output).

export interface DetectedEmotion {
  name: string;
  intensity: number; // 0..100
  why: string; // explainability (docs/09)
}

export interface DetectedSymbol {
  name: string;
  confidence: number; // 0..100
  why: string;
}

export interface DreamAnalysisResult {
  summary: string;
  dominantEmotion: string;
  emotionIntensity: number; // 0..100
  emotions: DetectedEmotion[];
  symbols: DetectedSymbol[];
  themes: string[];
  reflection: string;
  recommendations: string[];
  suggestedQuestions: string[];
  patternNote: string | null;
  confidence: number; // 0..1
  provider: string;
  model: string;
}

export interface HistoryContext {
  totalDreams: number;
  recentDreams: Array<{
    title: string | null;
    description: string;
    dreamDate: string;
    dominantEmotion?: string | null;
    symbols: string[];
  }>;
  recurringSymbols: Array<{ name: string; count: number }>;
  emotionCounts: Array<{ name: string; count: number; tone: string }>;
}

export interface CompanionTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AIProvider {
  id: string;
  label: string;
  analyzeDream(input: {
    title: string | null;
    description: string;
    mood: string | null;
    history: HistoryContext;
  }): Promise<DreamAnalysisResult>;
  companionReply(input: {
    question: string;
    conversation: CompanionTurn[];
    history: HistoryContext;
    memoryEnabled: boolean;
  }): Promise<string>;
  reportObservations(input: {
    periodLabel: string;
    stats: {
      dreamCount: number;
      topEmotions: Array<{ name: string; count: number; tone: string }>;
      topSymbols: Array<{ name: string; count: number }>;
      positiveRatio: number; // 0..1
      avgSleep: number | null;
      streak: number;
    };
  }): Promise<{ observations: string[]; reflection: string }>;
}
