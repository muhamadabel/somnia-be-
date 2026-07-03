// Seed: demo accounts + a living journal so every feature has data.
// Run with `npm run db:seed` (or `npm run setup` for full init).

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { EMOTIONS } from "../lib/constants";
import { SYMBOL_LEXICON } from "../lib/ai/lexicon";
import { localProvider, detectSymbols } from "../lib/ai/local";
import { generateDreamArt } from "../lib/ai/art";
import { mkdir, writeFile } from "fs/promises";
import { randomBytes } from "crypto";
import path from "path";

const db = new PrismaClient();

function daysAgo(n: number, hour = 6): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 30, 0, 0);
  return d;
}
function dreamDay(n: number): Date {
  const d = daysAgo(n);
  d.setHours(12, 0, 0, 0);
  return d;
}

interface SeedDream {
  ago: number;
  title: string;
  description: string;
  mood: "great" | "good" | "neutral" | "low" | "bad";
  sleep: number | null;
  analyze: boolean;
  visualize?: boolean;
  draft?: boolean;
  archived?: boolean;
}

const DEMO_DREAMS: SeedDream[] = [
  {
    ago: 0, title: "Perpustakaan kaca", mood: "good", sleep: 7.5, analyze: true, visualize: true,
    description: "Aku berada di dalam perpustakaan raksasa yang seluruhnya terbuat dari kaca, melayang di atas laut yang tenang. Cahaya matahari menembus rak-rak dan memencarkan pelangi ke lantai. Aku mengambil sebuah buku dan sadar setiap halamannya menampilkan kenanganku, tapi sedikit berbeda — entah kenapa lebih bahagia. Seorang teman lama dari sekolah muncul dan kami membaca bersama dalam keheningan yang nyaman. Aku merasa penasaran dan sangat tenang, seolah akhirnya punya waktu untuk memahami diriku.",
  },
  {
    ago: 1, title: "Dikejar di pasar malam", mood: "low", sleep: 5.5, analyze: true, visualize: true,
    description: "Aku berlari melewati pasar malam yang ramai, dikejar sosok tinggi yang wajahnya tak bisa kulihat. Kios-kios terus bergeser dan berubah seperti labirin, dan setiap jalan keluar kembali ke tengah. Kakiku terasa berat, dan aku sangat takut akan tertangkap. Pada satu titik aku bersembunyi di balik tirai dan menonton sosok itu lewat. Aku terbangun dengan jantung berdebar sebelum sempat melihat ke mana ia pergi.",
  },
  {
    ago: 2, title: "Terbang di atas sawah", mood: "great", sleep: 8, analyze: true, visualize: true,
    description: "Aku menemukan bahwa aku bisa terbang hanya dengan mencondongkan tubuh ke arah angin. Aku membumbung di atas hamparan sawah hijau dan sungai berkelok yang berkilau keemasan saat senja. Burung-burung terbang di sampingku seperti pengawal. Aku merasa benar-benar bebas, tertawa lepas di dalam mimpi. Saat melihat rumah masa kecilku di bawah, aku mendarat lembut di atap dan hanya menonton langit berganti warna. Bahagia sekali.",
  },
  {
    ago: 4, title: "Ujian yang tak pernah kupelajari", mood: "bad", sleep: 6, analyze: true,
    description: "Aku kembali ke sekolah, mengikuti ujian akhir yang benar-benar kulupakan. Jam berdetak keras dan semua orang menulis dengan percaya diri. Penaku tak berfungsi, soal-soalnya berubah setiap kali kubaca, dan aku merasa cemas luar biasa akan gagal dan mengecewakan semua orang. Guru terus menatapku. Aku terbangun kelelahan, masih merasa tidak siap.",
  },
  {
    ago: 5, title: "Dapur nenek", mood: "good", sleep: 7, analyze: true,
    description: "Aku berada di dapur tua nenekku, persis seperti saat aku kecil. Ia sedang memasak sup sambil menyenandungkan lagu yang kukira sudah kulupa. Kehangatan kompor, aroma bawang putih, suara hujan di luar — semuanya terasa aman. Ia menyuruhku untuk tidak terlalu khawatir soal masa depan, lalu menyerahkan semangkuk sup. Aku menangis sedikit dalam mimpi, merindukannya, tapi itu kesedihan yang lembut. Aku merasa disayang.",
  },
  {
    ago: 7, title: "Tangga tak berujung", mood: "neutral", sleep: 6.5, analyze: true,
    description: "Aku menaiki tangga spiral di dalam mercusuar yang seolah tak berujung. Tiap lantai punya pintu, tapi semuanya terkunci. Lewat jendela aku bisa melihat laut yang berbadai di bawah, ombak menghantam karang. Aku tidak persis takut, lebih bingung kenapa aku terus naik alih-alih turun. Menjelang puncak ada pintu yang sedikit terbuka dengan cahaya hangat di baliknya, tapi aku terbangun sebelum mencapainya.",
  },
  {
    ago: 9, title: "Samudra bintang", mood: "great", sleep: 8.5, analyze: true, visualize: true,
    description: "Aku berenang di lautan gelap pada malam hari, tapi alih-alih menakutkan, airnya penuh bintang-bintang kecil yang bercahaya, seolah galaksi jatuh ke laut. Setiap kayuhan membuat bintang berputar di sekitar tanganku. Seekor paus lewat di bawahku sambil bernyanyi, dan suaranya seakan menata ulang sesuatu di dadaku. Aku mengapung telentang dan menatap bintang sungguhan mencerminkan yang ada di air. Jarang aku merasa setenang itu.",
  },
  {
    ago: 10, title: "Gigi rontok sebelum pidato", mood: "bad", sleep: 5, analyze: true,
    description: "Aku hendak berpidato di sebuah pernikahan di depan ratusan orang. Saat melangkah ke mikrofon, gigiku mulai goyah dan copot satu per satu. Aku berusaha terus bicara sambil menutup mulut, panik semua orang bisa melihat. Tak seorang pun di antara hadirin bereaksi, yang entah kenapa malah membuatnya lebih buruk. Aku terus meminta maaf. Kecemasannya luar biasa dan aku terbangun sambil memeriksa gigiku masih ada.",
  },
  {
    ago: 12, title: "Hutan yang menata ulang dirinya", mood: "neutral", sleep: 7, analyze: true, visualize: true,
    description: "Aku berjalan melewati hutan berkabut tempat pepohonan diam-diam berpindah setiap kali aku memalingkan pandangan. Jalan di belakangku terus menghilang. Aku tidak panik — lebih terpesona, seolah hutan itu menguji apakah aku memercayainya. Aku menemukan tanah lapang kecil dengan sebuah cermin berdiri sendirian di rerumputan. Bayanganku melambai padaku sedetik sebelum aku melambai. Aku ingat berpikir, dalam mimpi, 'aku harus menuliskan yang ini.'",
  },
  {
    ago: 14, title: "Bertengkar dengan kakak", mood: "low", sleep: 6, analyze: true,
    description: "Aku bermimpi bertengkar hebat dengan kakakku di rumah masa kecil kami. Kami saling membentak soal sesuatu yang tak bisa kami sebutkan — setiap kali aku mencoba mengatakan alasannya, kata-kata keluar seperti suara statis. Aku melempar piring dan ia membeku di udara. Ia menatapku dan berkata 'kamu sebenarnya tidak marah padaku' lalu aku terbangun. Frustrasinya terasa sangat nyata, dan membekas sepanjang pagi.",
  },
  {
    ago: 16, title: "Kereta tengah malam", mood: "good", sleep: 7.5, analyze: true,
    description: "Aku berada di kereta yang hampir kosong melaju menembus malam. Di luar jendela, kota-kota yang belum pernah kukunjungi melintas, bercahaya lembut. Seorang kondektur memeriksa tiketku dan tersenyum seolah mengenalku. Aku tak tahu ke mana kereta itu menuju, tapi aku memercayainya. Aku tertidur di dalam mimpi, yang terasa aneh sekaligus nyaman. Ada rasa antusias yang tenang sepanjang waktu, seperti berada di ambang babak baru.",
  },
  {
    ago: 18, title: "Jatuh dari taman atap", mood: "low", sleep: 6, analyze: true,
    description: "Aku berdiri di taman atap yang indah ketika tepiannya tiba-tiba runtuh dan aku terjatuh. Jatuhnya terlalu lama — aku melewati jendela-jendela yang menampilkan adegan dari mingguku, rapat dan percakapan, semuanya sedikit keliru. Aku terus menunggu membentur tanah tapi malah mendarat lembut di air. Aku tenggelam perlahan, menatap cahaya di atas, merasa lebih kecewa ketimbang takut. Lalu aku terbangun dengan sentakan jatuh itu.",
  },
  {
    ago: 20, title: "Rumah dengan ruangan tambahan", mood: "good", sleep: 8, analyze: true, visualize: true,
    description: "Aku berada di rumahku sendiri, tapi ada pintu yang tak pernah kusadari di ujung lorong. Di dalamnya ruangan besar bermandi cahaya matahari, penuh tanaman, sebuah piano, dan rak berisi proyek-proyek yang belum selesai yang justru terlihat indah, bukan memalukan. Debu melayang di cahaya seperti salju yang lambat. Aku merasakan campuran aneh antara penasaran dan pulang ke rumah, seolah ruangan itu menungguku siap. Aku mulai membersihkan piano dan terbangun bahagia.",
  },
  {
    ago: 23, title: "Ular di taman", mood: "neutral", sleep: 7, analyze: true,
    description: "Seekor ular hijau melingkar tenang di tamanku, mengawasiku saat aku menyiram tanaman. Aku waspada tapi tidak takut — entah bagaimana kami saling memahami. Ia mengikutiku dari jarak yang sopan, dan setiap kali aku mengkhawatirkannya, ia memalingkan pandangan seolah malu. Akhirnya ia berganti kulit di dekat pagar dan meninggalkan kulit lamanya seperti sebuah hadiah. Mimpi ini terasa penting, seolah ada sesuatu dalam diriku yang sedang berubah.",
  },
  {
    ago: 26, title: "Terlambat ke bandara", mood: "bad", sleep: 5.5, analyze: true,
    description: "Aku terburu-buru mengejar penerbangan tapi segalanya bersekongkol memperlambatku — koperku tak mau tertutup, taksi berjalan mundur, teleponku terus menghubungi orang yang salah. Di bandara, papan keberangkatan menunjukkan penerbanganku berangkat dalam satu menit, dan gerbangnya makin menjauh saat aku berlari. Aku tak pernah sampai. Aku berdiri di gerbang kosong dengan firasat berat bahwa aku juga telah melewatkan sesuatu yang penting di kehidupan nyata.",
  },
  {
    ago: 28, title: "Jembatan di antara dua tebing", mood: "good", sleep: 7.5, analyze: true, visualize: true,
    description: "Aku berdiri di depan jembatan tali tua yang membentang di antara dua tebing di atas sungai awan. Di sisiku, semuanya familiar; sisi seberang kabur, belum selesai, seperti sketsa. Aku menyeberang perlahan, papan demi papan. Di tengah jalan, jembatan berayun keras dan aku mencengkeram tali, jantung berdebar — tapi aku terus melangkah. Saat mencapai seberang, kabur itu menjelma menjadi kota kecil yang terang. Aku merasa bangga pada diriku dengan cara yang tenang.",
  },
  { ago: 31, title: "Fragmen: dengungan dalam gelap", mood: "neutral", sleep: null, analyze: false,
    description: "Hanya ingat sepenggal — berdiri di ruangan gelap yang berdengung seperti kulkas, memegang cangkir hangat. Seseorang hendak mengatakan sesuatu padaku. Terbangun sebelum ia bicara." },
  { ago: 33, title: "Perahu kertas", mood: "good", sleep: 7, analyze: false,
    description: "Melipat perahu kertas bersama seseorang yang wajahnya tak kuingat, menaruhnya di jalan yang tergenang hujan. Setiap perahu menyala saat hanyut menjauh. Kami menghitungnya bersama. Rasanya seperti mengucapkan selamat tinggal pada kekhawatiran-kekhawatiran kecil satu per satu." },
  { ago: 2, title: "Lift yang bergerak menyamping", mood: "neutral", sleep: null, analyze: false, draft: true,
    description: "Lift bergerak menyamping alih-alih naik, menembus dinding masuk ke apartemen orang lain — perlu kuselesaikan yang ini, detailnya cepat memudar. Ada musik di suatu tempat." },
  { ago: 40, title: "Mimpi lama — penjaga mercusuar", mood: "good", sleep: 7, analyze: true, archived: true,
    description: "Seorang penjaga mercusuar tua mengajariku cara menjaga lampu tetap menyala menembus badai. Katanya rahasianya bukan melawan angin, tapi melindungi nyala api dengan tubuhmu dan menunggu. Laut ganas sekaligus indah. Saat pagi tiba, kapal-kapal mengedipkan lampu pada kami sebagai ucapan terima kasih. Kuarsipkan yang ini, tapi ia tetap berarti bagiku." },
];

const FRIEND_DREAMS: Array<{ email: string; name: string; anon: string; title: string; description: string; mood: string; ago: number; postNote: string }> = [
  {
    email: "mira@example.com", name: "Mira Anggraini", anon: "Starlit Fern 412",
    title: "Paus di atas kota", ago: 3, mood: "great",
    description: "Seekor paus berenang perlahan menembus langit di antara gedung-gedung pencakar, dan semua orang berhenti untuk menonton. Lalu lintas hening. Ia bernyanyi sekali dan setiap jendela di kota menyala oranye hangat. Aku menangis dalam mimpi dan terbangun merasa bersih, seolah sesuatu yang berat telah terangkat semalaman.",
    postNote: "Masih memikirkan ini berhari-hari kemudian. Ada yang pernah memimpikan paus langit juga?",
  },
  {
    email: "dimas@example.com", name: "Dimas Prasetyo", anon: "Wandering Compass 227",
    title: "Tersesat di kota penuh pintu", ago: 6, mood: "neutral",
    description: "Setiap dinding di kota itu adalah pintu dengan warna berbeda, tapi tak satu pun punya gagang. Seekor kucing dengan kunci di kalungnya terus muncul di sudut-sudut, selalu di luar jangkauan. Aku tak pernah marah — itu menjadi permainan di antara kami. Akhirnya kucing itu duduk dan membiarkanku mengambil kuncinya, tapi aku terbangun sebelum memilih pintu mana yang akan kubuka.",
    postNote: "Pintu mana yang akan kalian buka? Aku terus penasaran.",
  },
  {
    email: "salsa@example.com", name: "Salsabila Putri", anon: "Amber Moth 883",
    title: "Ruang ujian yang berubah jadi taman", ago: 8, mood: "good",
    description: "Di tengah ujian, benar-benar panik dan blank pada setiap jawaban, lampu neon melembut menjadi cahaya matahari dan meja-meja tumbuh menjadi petak bunga. Pengawas berubah menjadi tukang kebun yang menyerahkan gembor dan berkata 'ini tidak pernah menjadi ujian.' Kecemasannya... lenyap begitu saja. Aku ingin mengingat perasaan itu saat tenggat nyata menumpuk lagi.",
    postNote: "Untuk semua yang punya mimpi buruk soal ujian — kadang ia berbalik jadi sesuatu yang lembut.",
  },
];

async function main() {
  console.log("Seeding…");

  // ── Emotions & symbol library ────────────────────────────────────────
  for (const e of EMOTIONS) {
    await db.emotion.upsert({
      where: { name: e.name },
      create: { name: e.name, tone: e.tone, color: e.color, description: e.description },
      update: { tone: e.tone, color: e.color, description: e.description },
    });
  }
  for (const s of SYMBOL_LEXICON) {
    await db.symbol.upsert({
      where: { slug: s.slug },
      create: {
        name: s.name, slug: s.slug, category: s.category,
        description: s.description, interpretation: s.interpretation,
        relatedEmotions: JSON.stringify(s.relatedEmotions),
      },
      update: { description: s.description, interpretation: s.interpretation, category: s.category },
    });
  }
  console.log(`  ${EMOTIONS.length} emotions, ${SYMBOL_LEXICON.length} symbols`);

  // ── Users ────────────────────────────────────────────────────────────
  const demoHash = await bcrypt.hash("dream1234", 12);
  const adminHash = await bcrypt.hash("admin1234", 12);

  const demo = await db.user.upsert({
    where: { email: "demo@somnia.app" },
    create: {
      email: "demo@somnia.app", fullName: "Aria Nightingale", passwordHash: demoHash,
      anonName: "Lucid Lantern 141", onboardedAt: new Date(), theme: "dark",
    },
    update: {},
  });
  const admin = await db.user.upsert({
    where: { email: "admin@somnia.app" },
    create: {
      email: "admin@somnia.app", fullName: "Administrator Situs", passwordHash: adminHash,
      anonName: "Silver Harbor 900", role: "admin", onboardedAt: new Date(),
    },
    update: {},
  });

  const friends: Record<string, string> = {};
  for (const f of FRIEND_DREAMS) {
    const u = await db.user.upsert({
      where: { email: f.email },
      create: { email: f.email, fullName: f.name, passwordHash: demoHash, anonName: f.anon, onboardedAt: new Date() },
      update: {},
    });
    friends[f.email] = u.id;
  }
  console.log("  users: demo@somnia.app / dream1234, admin@somnia.app / admin1234");

  // Clean previous demo content so the seed is idempotent
  await db.dream.deleteMany({ where: { userId: demo.id } });
  await db.report.deleteMany({ where: { userId: demo.id } });
  await db.conversation.deleteMany({ where: { userId: demo.id } });
  await db.notification.deleteMany({ where: { userId: demo.id } });
  await db.communityPost.deleteMany({});

  // ── Demo dreams + analyses + visualizations ──────────────────────────
  const storageDir = path.join(process.cwd(), "storage", "uploads", "visualizations");
  await mkdir(storageDir, { recursive: true });

  const emotionRows = await db.emotion.findMany();
  const emotionByName = new Map(emotionRows.map((e) => [e.name, e]));
  const symbolRows = await db.symbol.findMany();
  const symbolByName = new Map(symbolRows.map((s) => [s.name, s]));

  // Build a rolling history so pattern notes reflect earlier dreams
  const historyAccum: Array<{ title: string | null; description: string; dreamDate: string; symbols: string[] }> = [];
  const symbolCountAccum = new Map<string, number>();
  const emotionCountAccum = new Map<string, number>();

  let sharedDreamId: string | null = null;

  // oldest first so history builds naturally
  const ordered = [...DEMO_DREAMS].sort((a, b) => b.ago - a.ago);
  for (const d of ordered) {
    const created = await db.dream.create({
      data: {
        userId: demo.id,
        title: d.title,
        description: d.description,
        mood: d.mood,
        sleepDuration: d.sleep,
        dreamDate: dreamDay(d.ago),
        isDraft: d.draft ?? false,
        archivedAt: d.archived ? daysAgo(d.ago - 1) : null,
        createdAt: daysAgo(d.ago),
        updatedAt: daysAgo(d.ago),
      },
    });

    if (d.analyze) {
      const history = {
        totalDreams: historyAccum.length,
        recentDreams: historyAccum.slice(-10).map((h) => ({ ...h, dominantEmotion: null })),
        recurringSymbols: [...symbolCountAccum.entries()].filter(([, c]) => c >= 2).map(([name, count]) => ({ name, count })),
        emotionCounts: [...emotionCountAccum.entries()].map(([name, count]) => ({ name, count, tone: "neutral" })),
      };
      const result = await localProvider.analyzeDream({
        title: d.title, description: d.description, mood: d.mood, history,
      });
      await db.analysis.create({
        data: {
          dreamId: created.id, version: 1,
          summary: result.summary, reflection: result.reflection,
          dominantEmotion: result.dominantEmotion, emotionIntensity: result.emotionIntensity,
          themes: JSON.stringify(result.themes),
          recommendations: JSON.stringify(result.recommendations),
          suggestedQuestions: JSON.stringify(result.suggestedQuestions),
          patternNote: result.patternNote,
          emotionsJson: JSON.stringify(result.emotions),
          symbolsJson: JSON.stringify(result.symbols),
          confidence: result.confidence, provider: "local-demo", model: "lexicon-v1",
          generatedAt: daysAgo(d.ago, 7),
        },
      });
      for (const e of result.emotions) {
        const row = emotionByName.get(e.name);
        if (row) {
          await db.dreamEmotion.create({ data: { dreamId: created.id, emotionId: row.id, intensity: e.intensity } });
          emotionCountAccum.set(e.name, (emotionCountAccum.get(e.name) ?? 0) + 1);
        }
      }
      for (const s of result.symbols) {
        const row = symbolByName.get(s.name);
        if (row) {
          await db.dreamSymbol.create({ data: { dreamId: created.id, symbolId: row.id, confidence: s.confidence } });
          symbolCountAccum.set(s.name, (symbolCountAccum.get(s.name) ?? 0) + 1);
        }
      }

      if (d.visualize) {
        const seed = Math.floor(Math.random() * 1_000_000);
        const art = generateDreamArt({
          dominantEmotion: result.dominantEmotion,
          symbols: result.symbols.map((s) => s.name),
          seed,
        });
        const name = `${randomBytes(16).toString("hex")}.svg`;
        await writeFile(path.join(storageDir, name), art.svg);
        await db.visualization.create({
          data: {
            dreamId: created.id, imagePath: `visualizations/${name}`,
            prompt: art.prompt, provider: "procedural-art", seed, createdAt: daysAgo(d.ago, 8),
          },
        });
      }

      if (d.title === "Ocean of stars") sharedDreamId = created.id;
    }

    if (!d.draft && !d.archived) {
      historyAccum.push({
        title: d.title, description: d.description,
        dreamDate: dreamDay(d.ago).toISOString().slice(0, 10),
        symbols: detectSymbols(`${d.title}. ${d.description}`).map((s) => s.name),
      });
    }
  }
  console.log(`  ${DEMO_DREAMS.length} demo dreams (with analyses & art)`);

  // ── Weekly report ─────────────────────────────────────────────────────
  // Generated via the report service logic inline (avoids importing next-only code)
  // — simply reuse localProvider for observations.
  {
    const start = daysAgo(6, 0);
    const end = new Date();
    const emo = [...emotionCountAccum.entries()].sort((a, b) => b[1] - a[1]);
    const sym = [...symbolCountAccum.entries()].sort((a, b) => b[1] - a[1]);
    const ai = await localProvider.reportObservations({
      periodLabel: "dalam 7 hari terakhir",
      stats: {
        dreamCount: 4,
        topEmotions: emo.slice(0, 5).map(([name, count]) => ({ name, count, tone: "neutral" })),
        topSymbols: sym.slice(0, 5).map(([name, count]) => ({ name, count })),
        positiveRatio: 0.58, avgSleep: 6.9, streak: 3,
      },
    });
    await db.report.create({
      data: {
        userId: demo.id, period: "weekly", periodStart: start, periodEnd: end,
        title: "Laporan Kesejahteraan Mingguan",
        content: JSON.stringify({
          stats: { dreamCount: 4, analyzedCount: 4, avgSleep: 6.9, streak: 3, positiveRatio: 0.58 },
          emotions: emo.slice(0, 6).map(([name, count]) => ({ name, count, color: emotionByName.get(name)?.color ?? "#94a3b8", tone: emotionByName.get(name)?.tone ?? "neutral" })),
          symbols: sym.slice(0, 6).map(([name, count]) => ({ name, count })),
          highlights: [],
          observations: ai.observations,
          reflection: ai.reflection,
        }),
        provider: "local-demo",
        generatedAt: daysAgo(1, 9),
      },
    });
  }

  // ── Companion conversation ───────────────────────────────────────────
  const convo = await db.conversation.create({
    data: {
      userId: demo.id, title: "Mimpi air yang berulang",
      createdAt: daysAgo(2, 21), updatedAt: daysAgo(2, 21),
      messages: {
        create: [
          { role: "user", content: "Rasanya belakangan aku terus memimpikan air. Apakah itu sebuah pola?", createdAt: daysAgo(2, 21) },
          { role: "assistant", content: "Kamu tepat menyadarinya — air muncul di beberapa mimpi terbarumu: perpustakaan kaca yang melayang di atas laut tenang, samudra bintang tempat kamu berenang di antara cahaya, dan jatuhmu yang berakhir lembut di air.\n\nDi sepanjang jurnalmu, air cenderung muncul pada hari-hari yang kamu gambarkan tenang atau reflektif, dan biasanya berperilaku lembut — memangkumu, bukan mengancammu. Air sering mencerminkan arus emosi dalam hidup, jadi air tenang yang berulang bisa menandakan kamu sedang mengolah perasaan dengan cukup stabil saat ini.\n\nSaat kamu membayangkan air-air mimpi itu, apakah terasa seperti perairan yang sama yang kembali, atau yang berbeda-beda?", createdAt: daysAgo(2, 21) },
          { role: "user", content: "Jujur rasanya laut yang sama setiap kali. Apa yang harus kuperhatikan lain kali?", createdAt: daysAgo(2, 20) },
          { role: "assistant", content: "Itu detail yang indah — laut yang kembali sering menjadi penanda pribadi, tempat pikiranmu pergi untuk membereskan segala sesuatu.\n\nLain kali, kamu bisa memperhatikan tiga hal dengan lembut: keadaan airnya (tenang, berbadai, bercahaya), apa yang kamu lakukan di dalamnya (mengapung, berenang, tenggelam, menonton), dan apakah ada orang lain bersamamu. Ketiga detail itu cenderung membawa bobot reflektif paling besar, dan membandingkannya antar entri adalah cara pola menjadi terlihat.\n\nTak perlu memaksa lucid — cukup catat detail itu segera setelah bangun. Menurutmu, seperti apa laut itu harus terlihat agar kamu benar-benar merasa nyaman di dalamnya?", createdAt: daysAgo(2, 20) },
        ],
      },
    },
  });

  // ── Community ────────────────────────────────────────────────────────
  const demoPost = sharedDreamId
    ? await db.communityPost.create({
        data: {
          userId: demo.id, dreamId: sharedDreamId,
          title: "Samudra bintang",
          content: "Aku berenang di lautan gelap pada malam hari, tapi alih-alih menakutkan, airnya penuh bintang-bintang kecil yang bercahaya, seolah galaksi jatuh ke laut. Setiap kayuhan membuat bintang berputar di sekitar tanganku. Seekor paus lewat di bawahku sambil bernyanyi, dan suaranya seakan menata ulang sesuatu di dadaku. Aku mengapung telentang dan menatap bintang sungguhan mencerminkan yang ada di air. Jarang aku merasa setenang itu.\n\n— Kubagikan karena mimpi ini sungguh mengubah mingguku. Semoga semua mendapat perairan yang tenang malam ini.",
          meta: JSON.stringify({ emotions: [{ name: "Calm", color: "#38bdf8" }, { name: "Joy", color: "#f59e0b" }], symbols: ["Ocean", "Stars", "Water"], mood: "great" }),
          createdAt: daysAgo(8, 10),
        },
      })
    : null;

  const friendPosts: string[] = [];
  for (const f of FRIEND_DREAMS) {
    const uid = friends[f.email];
    const dream = await db.dream.create({
      data: {
        userId: uid, title: f.title, description: f.description, mood: f.mood,
        dreamDate: dreamDay(f.ago), createdAt: daysAgo(f.ago), updatedAt: daysAgo(f.ago),
      },
    });
    const post = await db.communityPost.create({
      data: {
        userId: uid, dreamId: dream.id, title: f.title,
        content: `${f.description}\n\n— ${f.postNote}`,
        meta: JSON.stringify({ emotions: [], symbols: detectSymbols(f.description).slice(0, 3).map((s) => s.name), mood: f.mood }),
        createdAt: daysAgo(f.ago, 11),
      },
    });
    friendPosts.push(post.id);
  }

  if (demoPost) {
    await db.comment.createMany({
      data: [
        { postId: demoPost.id, userId: friends["mira@example.com"], content: "Ini bikin merinding — apalagi pausnya yang bernyanyi. Terima kasih sudah berbagi sesuatu yang begitu lembut.", createdAt: daysAgo(7, 14) },
        { postId: demoPost.id, userId: friends["dimas@example.com"], content: "\"Seolah galaksi jatuh ke laut\" itu kalimat yang indah sekali. Semoga laut ini mengunjungimu lagi.", createdAt: daysAgo(7, 19) },
      ],
    });
    await db.reaction.createMany({
      data: [
        { postId: demoPost.id, userId: friends["mira@example.com"], type: "heart" },
        { postId: demoPost.id, userId: friends["dimas@example.com"], type: "sparkle" },
        { postId: demoPost.id, userId: friends["salsa@example.com"], type: "heart" },
        { postId: demoPost.id, userId: admin.id, type: "insight" },
      ],
    });
  }
  await db.comment.create({
    data: { postId: friendPosts[0], userId: demo.id, content: "Paus langit sepertinya mengunjungi mimpi-mimpi paling lembut. Milikku bernyanyi di bawah air — mungkin paus yang sama pada giliran berbeda.", createdAt: daysAgo(2, 9) },
  });
  await db.reaction.createMany({
    data: [
      { postId: friendPosts[0], userId: demo.id, type: "sparkle" },
      { postId: friendPosts[1], userId: demo.id, type: "insight" },
      { postId: friendPosts[2], userId: demo.id, type: "hug" },
      { postId: friendPosts[0], userId: friends["salsa@example.com"], type: "heart" },
      { postId: friendPosts[2], userId: friends["mira@example.com"], type: "heart" },
    ],
  });

  // One open moderation report so the admin queue has content
  await db.contentReport.create({
    data: {
      postId: friendPosts[1], reporterId: friends["salsa@example.com"],
      reason: "Laporan uji — mendemokan antrean moderasi (aman untuk diabaikan).",
    },
  });

  // ── Bookmarks & notifications ────────────────────────────────────────
  const waterSym = symbolByName.get("Water");
  const oceanSym = symbolByName.get("Ocean");
  if (waterSym) await db.symbolBookmark.create({ data: { userId: demo.id, symbolId: waterSym.id } });
  if (oceanSym) await db.symbolBookmark.create({ data: { userId: demo.id, symbolId: oceanSym.id } });

  await db.notification.createMany({
    data: [
      { userId: demo.id, type: "welcome", title: "Selamat datang di Somnia 🌙", message: "Jurnal mimpimu sudah siap. Catat mimpi pertamamu untuk memulai.", createdAt: daysAgo(45), readAt: daysAgo(44) },
      { userId: demo.id, type: "report", title: "Laporan mingguanmu sudah siap", message: "Aktivitas mimpimu dari 7 hari terakhir telah dirangkum.", link: "/reports", createdAt: daysAgo(1, 9) },
      { userId: demo.id, type: "comment", title: "Komentar baru di mimpimu", message: "Seseorang berkomentar di “Samudra bintang”.", link: "/community", createdAt: daysAgo(7, 14) },
    ],
  });

  await db.auditLog.create({ data: { userId: demo.id, event: "seed.completed", detail: "Data demo dibuat" } });

  console.log("Seed selesai ✓");
  console.log("  Login demo : demo@somnia.app / dream1234");
  console.log("  Login admin: admin@somnia.app / admin1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
