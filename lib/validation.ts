import { z } from "zod";
import { MAX_DREAM_LENGTH } from "@/lib/constants";

// ── Auth ───────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Nama minimal 2 karakter").max(60),
  email: z.string().trim().toLowerCase().email("Masukkan alamat email yang valid"),
  password: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter")
    .max(100)
    .regex(/[a-zA-Z]/, "Kata sandi harus mengandung huruf")
    .regex(/[0-9]/, "Kata sandi harus mengandung angka"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Masukkan alamat email yang valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

// ── User / settings ────────────────────────────────────────────────────

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(60).optional(),
  timezone: z.string().max(60).optional(),
  language: z.enum(["en", "id"]).optional(),
  theme: z.enum(["light", "dark"]).optional(),
});

export const preferencesSchema = z.object({
  reminderEnabled: z.boolean().optional(),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Gunakan format JJ:MM").optional(),
  weeklyDigest: z.boolean().optional(),
  communityAlerts: z.boolean().optional(),
  aiMemoryEnabled: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
  newPassword: z
    .string()
    .min(8, "Kata sandi baru minimal 8 karakter")
    .max(100)
    .regex(/[a-zA-Z]/, "Kata sandi harus mengandung huruf")
    .regex(/[0-9]/, "Kata sandi harus mengandung angka"),
});

// ── Dreams ─────────────────────────────────────────────────────────────

export const dreamSchema = z.object({
  title: z.string().trim().max(120).optional().nullable(),
  description: z
    .string()
    .trim()
    .min(10, "Ceritakan mimpimu minimal 10 karakter")
    .max(MAX_DREAM_LENGTH, `Deskripsi mimpi dibatasi ${MAX_DREAM_LENGTH} karakter`),
  notes: z.string().trim().max(2000).optional().nullable(),
  mood: z.enum(["great", "good", "neutral", "low", "bad"]).optional().nullable(),
  sleepDuration: z.coerce.number().min(0).max(24).optional().nullable(),
  dreamDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid"),
  isDraft: z.boolean().optional().default(false),
});

export const dreamUpdateSchema = dreamSchema.partial().extend({
  dreamDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// ── Conversations ──────────────────────────────────────────────────────

export const messageSchema = z.object({
  content: z.string().trim().min(1, "Pesan tidak boleh kosong").max(2000),
});

// ── Community ──────────────────────────────────────────────────────────

export const sharePostSchema = z.object({
  dreamId: z.string().min(1),
  title: z.string().trim().min(3).max(120),
  note: z.string().trim().max(500).optional().nullable(),
});

export const commentSchema = z.object({
  content: z.string().trim().min(1, "Komentar tidak boleh kosong").max(1000),
});

export const reactionSchema = z.object({
  type: z.enum(["heart", "hug", "sparkle", "insight"]),
});

export const contentReportSchema = z.object({
  postId: z.string().optional(),
  commentId: z.string().optional(),
  reason: z.string().trim().min(3, "Jelaskan masalahnya").max(500),
});

// ── Reports ────────────────────────────────────────────────────────────

export const generateReportSchema = z.object({
  period: z.enum(["weekly", "monthly", "yearly"]),
});
