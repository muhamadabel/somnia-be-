// Kamus bilingual (Inggris + Indonesia) yang menggerakkan mesin analisis
// demo lokal dan mengisi Pustaka Simbol Mimpi (docs/01 fitur 6).
//
// `name`/`slug` tetap Inggris (kunci internal & deteksi). `nameId` adalah
// nama tampilan Indonesia. `keywords` mencakup EN + ID untuk pencocokan.

export interface SymbolEntry {
  name: string;
  nameId: string;
  slug: string;
  category: string;
  keywords: string[]; // istilah pencocokan huruf kecil, EN + ID
  description: string;
  interpretation: string;
  relatedEmotions: string[];
}

export const SYMBOL_LEXICON: SymbolEntry[] = [
  {
    name: "Water", nameId: "Air", slug: "water", category: "Nature",
    keywords: ["water", "ocean", "sea", "river", "lake", "rain", "wave", "flood", "swim", "drown", "air", "laut", "sungai", "danau", "hujan", "ombak", "banjir", "berenang", "tenggelam"],
    description: "Lautan, sungai, hujan, banjir, atau berenang — air dalam segala bentuknya.",
    interpretation: "Air sering mencerminkan arus emosi dalam hidupmu. Air yang tenang bisa menandakan kedamaian dan kejernihan, sementara air yang bergolak atau meninggi mungkin menunjuk pada perasaan yang sulit ditahan atau diungkapkan.",
    relatedEmotions: ["Calm", "Fear", "Sadness"],
  },
  {
    name: "Flying", nameId: "Terbang", slug: "flying", category: "Action",
    keywords: ["fly", "flying", "flew", "float", "soar", "levitate", "wings", "terbang", "melayang", "sayap"],
    description: "Terbang, melayang, atau membumbung di atas tanah dengan kekuatan sendiri.",
    interpretation: "Terbang umumnya berkaitan dengan kebebasan, ambisi, dan sudut pandang. Mimpi ini bisa muncul saat kamu merasa terlepas dari sebuah batasan — atau saat kamu ingin bangkit dari situasi yang membebani.",
    relatedEmotions: ["Joy", "Excitement", "Curiosity"],
  },
  {
    name: "Falling", nameId: "Terjatuh", slug: "falling", category: "Action",
    keywords: ["fall", "falling", "fell", "plummet", "drop", "cliff", "jatuh", "terjatuh", "jurang"],
    description: "Sensasi terjatuh dari ketinggian, sering membangunkanmu tiba-tiba.",
    interpretation: "Terjatuh kerap menyertai rasa kehilangan kendali atau takut gagal. Ini bisa jadi ajakan untuk melihat di mana dalam hidupmu kamu merasa tak tertopang atau terlalu memaksakan diri.",
    relatedEmotions: ["Fear", "Anxiety"],
  },
  {
    name: "Being Chased", nameId: "Dikejar", slug: "being-chased", category: "Event",
    keywords: ["chase", "chased", "chasing", "pursue", "pursued", "run away", "running from", "escape", "dikejar", "mengejar", "kabur", "melarikan diri", "lari dari"],
    description: "Dikejar oleh seseorang, makhluk, atau sosok tak dikenal.",
    interpretation: "Dikejar sering melambangkan penghindaran — tugas, emosi, atau keputusan yang mungkin sedang kamu hindari. Coba renungkan apa yang mungkin diwakili si pengejar, bukan pengejarannya itu sendiri.",
    relatedEmotions: ["Fear", "Anxiety"],
  },
  {
    name: "Forest", nameId: "Hutan", slug: "forest", category: "Place",
    keywords: ["forest", "woods", "jungle", "trees", "hutan", "pepohonan", "rimba"],
    description: "Hutan, rimba, atau belantara lebat — tempat pertumbuhan dan misteri.",
    interpretation: "Hutan mewakili bagian diri yang belum terjelajahi. Berjalan melewatinya bisa menandakan masa penemuan diri; tersesat di dalamnya mungkin mencerminkan ketidakpastian akan arah hidupmu.",
    relatedEmotions: ["Curiosity", "Calm", "Confusion"],
  },
  {
    name: "Snake", nameId: "Ular", slug: "snake", category: "Creature",
    keywords: ["snake", "serpent", "python", "cobra", "ular"],
    description: "Ular yang muncul dalam konteks apa pun.",
    interpretation: "Ular adalah simbol kuno transformasi dan penyembuhan, tetapi juga bisa mewakili kekhawatiran tersembunyi atau orang yang kamu ragukan. Perilaku ular dalam mimpi sering mewarnai maknanya.",
    relatedEmotions: ["Fear", "Curiosity"],
  },
  {
    name: "Fire", nameId: "Api", slug: "fire", category: "Nature",
    keywords: ["fire", "flame", "burn", "burning", "smoke", "api", "terbakar", "kebakaran", "asap"],
    description: "Api, kobaran, atau sesuatu yang terbakar.",
    interpretation: "Api punya makna ganda: gairah, energi, dan pembaruan di satu sisi; amarah atau tekanan yang merusak di sisi lain. Perhatikan apakah api dalam mimpimu menghangatkan atau melahap.",
    relatedEmotions: ["Anger", "Excitement", "Fear"],
  },
  {
    name: "Teeth", nameId: "Gigi", slug: "teeth", category: "Object",
    keywords: ["teeth", "tooth", "gigi", "copot", "tanggal"],
    description: "Gigi yang copot, patah, atau rontok.",
    interpretation: "Mimpi tentang gigi sering muncul di masa penuh kesadaran-diri — kekhawatiran soal penampilan, komunikasi, atau kehilangan kendali atas cara orang memandangmu.",
    relatedEmotions: ["Anxiety", "Fear"],
  },
  {
    name: "House", nameId: "Rumah", slug: "house", category: "Place",
    keywords: ["house", "home", "room", "rooms", "apartment", "rumah", "kamar", "apartemen"],
    description: "Rumah, tempat tinggal, atau menemukan ruangan yang asing.",
    interpretation: "Rumah kerap mewakili diri sendiri — tiap ruangan adalah bagian berbeda dari batinmu. Menemukan ruangan baru bisa menandakan potensi tersembunyi atau kenangan yang muncul kembali.",
    relatedEmotions: ["Curiosity", "Calm", "Confusion"],
  },
  {
    name: "School", nameId: "Sekolah", slug: "school", category: "Place",
    keywords: ["school", "class", "classroom", "exam", "test", "teacher", "sekolah", "kelas", "ujian", "guru", "kampus", "kuliah"],
    description: "Sekolah, kelas, ujian, atau merasa tak siap menghadapi tes.",
    interpretation: "Mimpi sekolah sering muncul saat kamu merasa dinilai atau diuji dalam hidup nyata. Mimpi klasik 'tak siap ujian' cenderung menyertai perasaan tak layak atau tanggung jawab yang membayangi.",
    relatedEmotions: ["Anxiety", "Confusion"],
  },
  {
    name: "Death", nameId: "Kematian", slug: "death", category: "Event",
    keywords: ["death", "die", "died", "dead", "funeral", "kematian", "meninggal", "mati", "pemakaman"],
    description: "Kematian dirimu atau orang lain di dalam mimpi.",
    interpretation: "Dalam mimpi, kematian jarang berarti kehilangan harfiah — biasanya menandai sebuah akhir yang memberi ruang bagi awal baru: satu fase hidup yang menutup, identitas yang bergeser, kebiasaan yang dilepaskan.",
    relatedEmotions: ["Sadness", "Fear"],
  },
  {
    name: "Baby", nameId: "Bayi", slug: "baby", category: "People",
    keywords: ["baby", "infant", "newborn", "bayi"],
    description: "Bayi atau merawat seorang bayi.",
    interpretation: "Bayi umumnya melambangkan permulaan baru — proyek, hubungan, atau versi dirimu yang masih rapuh dan butuh dirawat.",
    relatedEmotions: ["Love", "Joy", "Anxiety"],
  },
  {
    name: "Ocean", nameId: "Samudra", slug: "ocean", category: "Nature",
    keywords: ["ocean", "sea", "deep sea", "underwater", "samudra", "lautan", "bawah laut"],
    description: "Laut lepas yang luas atau berada di bawah air.",
    interpretation: "Samudra mewakili alam bawah sadar — luas, dalam, dan sebagian tak terjangkau. Menyelam ke dalamnya bisa menandakan kesediaan menjelajahi perasaan yang biasanya tersembunyi di permukaan.",
    relatedEmotions: ["Calm", "Curiosity", "Fear"],
  },
  {
    name: "Mountain", nameId: "Gunung", slug: "mountain", category: "Nature",
    keywords: ["mountain", "climb", "climbing", "peak", "summit", "hill", "gunung", "mendaki", "puncak", "bukit"],
    description: "Gunung, mendaki, atau mencapai puncak.",
    interpretation: "Gunung melambangkan tujuan jangka panjang dan rintangan. Mendaki mencerminkan usaha dan kemajuan; mencapai puncak sering menyertai rasa pencapaian atau kejernihan.",
    relatedEmotions: ["Excitement", "Calm", "Joy"],
  },
  {
    name: "Flying Vehicle", nameId: "Pesawat", slug: "flying-vehicle", category: "Object",
    keywords: ["airplane", "plane", "helicopter", "rocket", "pesawat", "helikopter", "roket"],
    description: "Pesawat, helikopter, roket, atau kendaraan udara lainnya.",
    interpretation: "Kendaraan udara sering berkaitan dengan perjalanan dan transisi yang lebih besar dari keseharian — pindah karier, relokasi, atau ambisi yang lepas landas (atau gagal).",
    relatedEmotions: ["Excitement", "Anxiety"],
  },
  {
    name: "Lost", nameId: "Tersesat", slug: "lost", category: "Event",
    keywords: ["lost", "maze", "labyrinth", "can't find", "cannot find", "wrong way", "tersesat", "nyasar", "labirin", "hilang arah"],
    description: "Tersesat, mengarungi labirin, atau tak menemukan jalan.",
    interpretation: "Tersesat mencerminkan ketidakpastian akan arah — dalam keputusan, hubungan, atau hidup secara luas. Ia bertanya lembut: sebenarnya ke mana kamu ingin menuju?",
    relatedEmotions: ["Confusion", "Anxiety"],
  },
  {
    name: "Moon", nameId: "Bulan", slug: "moon", category: "Nature",
    keywords: ["moon", "moonlight", "lunar", "bulan", "purnama"],
    description: "Bulan, cahaya bulan, atau citra rembulan.",
    interpretation: "Bulan terhubung dengan intuisi, siklus, dan refleksi yang tenang. Bulan terang bisa menyertai kejernihan emosi; bulan tersembunyi mungkin mencerminkan perasaan yang dirahasiakan.",
    relatedEmotions: ["Calm", "Curiosity"],
  },
  {
    name: "Stars", nameId: "Bintang", slug: "stars", category: "Nature",
    keywords: ["star", "stars", "constellation", "galaxy", "bintang", "galaksi", "langit malam"],
    description: "Bintang, rasi, atau langit galaksi.",
    interpretation: "Bintang sering melambangkan harapan, tuntunan, dan cita-cita. Menatapnya bisa mencerminkan pencarian makna atau pengingat akan kemungkinan di luar keadaan saat ini.",
    relatedEmotions: ["Curiosity", "Calm", "Joy"],
  },
  {
    name: "Bridge", nameId: "Jembatan", slug: "bridge", category: "Place",
    keywords: ["bridge", "crossing", "jembatan", "menyeberang"],
    description: "Jembatan atau menyeberang dari satu sisi ke sisi lain.",
    interpretation: "Jembatan menandai transisi — berpindah antar fase hidup, keputusan, atau hubungan. Jembatan kokoh menandakan keyakinan menyeberang; yang rapuh, keraguan.",
    relatedEmotions: ["Curiosity", "Anxiety"],
  },
  {
    name: "Door", nameId: "Pintu", slug: "door", category: "Object",
    keywords: ["door", "doorway", "gate", "locked", "key", "pintu", "gerbang", "terkunci", "kunci"],
    description: "Pintu, gerbang, kunci, atau lorong yang terkunci.",
    interpretation: "Pintu mewakili peluang dan batas. Pintu terbuka mengundang perubahan; yang terkunci bisa mencerminkan tujuan yang terasa mustahil dijangkau — atau bagian dirimu yang belum siap dibuka.",
    relatedEmotions: ["Curiosity", "Confusion"],
  },
  {
    name: "Mirror", nameId: "Cermin", slug: "mirror", category: "Object",
    keywords: ["mirror", "reflection", "cermin", "bayangan", "pantulan"],
    description: "Cermin atau melihat pantulan dirimu sendiri.",
    interpretation: "Cermin mengajak berkaca pada diri. Pantulan yang jernih bisa menandakan penerimaan diri; yang terdistorsi mungkin mencerminkan jarak antara yang kamu rasakan dan yang kamu tampilkan.",
    relatedEmotions: ["Curiosity", "Confusion", "Fear"],
  },
  {
    name: "Storm", nameId: "Badai", slug: "storm", category: "Nature",
    keywords: ["storm", "thunder", "lightning", "hurricane", "tornado", "badai", "petir", "kilat", "angin kencang"],
    description: "Badai, guntur, petir, atau cuaca ganas.",
    interpretation: "Badai cenderung muncul saat emosi menumpuk lebih cepat dari kemampuan mengolahnya — konflik, stres, atau duka yang berkumpul bagai cuaca. Namun badai pun berlalu, seperti seharusnya.",
    relatedEmotions: ["Fear", "Anger", "Anxiety"],
  },
  {
    name: "Animals", nameId: "Hewan", slug: "animals", category: "Creature",
    keywords: ["dog", "cat", "bird", "wolf", "lion", "tiger", "fish", "horse", "anjing", "kucing", "burung", "serigala", "singa", "harimau", "ikan", "kuda"],
    description: "Anjing, kucing, burung, dan hewan lain sebagai teman atau ancaman dalam mimpi.",
    interpretation: "Hewan sering mewakili naluri dan hubungan. Hewan yang setia bisa mencerminkan kepercayaan dan persahabatan, sementara yang mengancam mungkin membawa kekhawatiran yang menyamar dalam wujud yang akrab.",
    relatedEmotions: ["Love", "Joy", "Fear"],
  },
  {
    name: "Family", nameId: "Keluarga", slug: "family", category: "People",
    keywords: ["mother", "father", "mom", "dad", "sister", "brother", "family", "grandma", "grandpa", "ibu", "ayah", "kakak", "adik", "keluarga", "nenek", "kakek"],
    description: "Anggota keluarga yang muncul dalam mimpi.",
    interpretation: "Sosok keluarga kerap mewakili rasa memiliki, kewajiban, atau percakapan yang belum tuntas. Peran mereka dalam mimpi mungkin lebih banyak berbicara tentang kebutuhanmu ketimbang tentang mereka.",
    relatedEmotions: ["Love", "Sadness", "Joy"],
  },
  {
    name: "Old Friend", nameId: "Teman Lama", slug: "old-friend", category: "People",
    keywords: ["friend", "old friend", "childhood friend", "teman", "sahabat", "teman lama", "teman masa kecil"],
    description: "Teman — terutama dari masa lalu — yang muncul tak terduga.",
    interpretation: "Teman lama bisa mewakili sifat yang kamu kaitkan dengan mereka, atau masa hidup yang kamu rindukan. Kehadirannya mungkin ajakan untuk terhubung kembali — dengan mereka, atau dengan dirimu yang dulu.",
    relatedEmotions: ["Joy", "Sadness", "Love"],
  },
  {
    name: "Vehicle", nameId: "Kendaraan", slug: "vehicle", category: "Object",
    keywords: ["car", "driving", "bus", "train", "motorcycle", "mobil", "menyetir", "nyetir", "kereta", "motor", "bis"],
    description: "Mobil, kereta, atau menyetir — terkendali atau lepas kendali.",
    interpretation: "Kendaraan mencerminkan rasa kendalimu atas arah hidup. Menyetir mulus menandakan kendali; rem blong atau kehilangan setir bisa mencerminkan situasi yang bergerak lebih cepat dari yang kamu inginkan.",
    relatedEmotions: ["Anxiety", "Excitement", "Fear"],
  },
  {
    name: "Light", nameId: "Cahaya", slug: "light", category: "Nature",
    keywords: ["light", "sunlight", "glow", "glowing", "bright", "cahaya", "sinar", "terang", "bercahaya"],
    description: "Sinar matahari, benda bercahaya, atau sumber terang.",
    interpretation: "Cahaya adalah salah satu simbol mimpi paling penuh harapan — kesadaran, wawasan, dan kelegaan. Bergerak menuju cahaya sering menyertai penyelesaian emosi.",
    relatedEmotions: ["Joy", "Calm", "Curiosity"],
  },
  {
    name: "Darkness", nameId: "Kegelapan", slug: "darkness", category: "Nature",
    keywords: ["dark", "darkness", "shadow", "black", "pitch", "gelap", "kegelapan", "bayangan hitam"],
    description: "Kegelapan pekat, bayangan, atau tempat tanpa cahaya.",
    interpretation: "Kegelapan mewakili hal yang tak diketahui, bukan yang buruk. Ia bisa menyertai ketidakpastian, tapi juga tempat istirahat dan imajinasi bersemayam. Yang penting adalah bagaimana kamu melewatinya.",
    relatedEmotions: ["Fear", "Confusion", "Calm"],
  },
  {
    name: "Money", nameId: "Uang", slug: "money", category: "Object",
    keywords: ["money", "cash", "coins", "rich", "gold", "treasure", "uang", "duit", "kaya", "emas", "harta"],
    description: "Uang, harta, kekayaan — menemukan atau kehilangannya.",
    interpretation: "Uang dalam mimpi biasanya melambangkan nilai dan harga diri, bukan keuangan. Menemukan uang bisa mencerminkan penemuan kemampuanmu; kehilangannya, ketakutan merasa tak cukup.",
    relatedEmotions: ["Excitement", "Anxiety", "Joy"],
  },
  {
    name: "Food", nameId: "Makanan", slug: "food", category: "Object",
    keywords: ["food", "eating", "feast", "meal", "hungry", "makanan", "makan", "lapar", "pesta makan"],
    description: "Hidangan, jamuan, atau rasa lapar dalam mimpi.",
    interpretation: "Makanan terhubung dengan pemeliharaan dalam arti luas — apa yang memberimu asupan secara emosi dan intelektual. Lapar bisa mencerminkan kebutuhan yang belum terpenuhi; makan bersama, kerinduan akan koneksi.",
    relatedEmotions: ["Joy", "Love", "Calm"],
  },
  {
    name: "Phone", nameId: "Telepon", slug: "phone", category: "Object",
    keywords: ["phone", "call", "calling", "text", "message", "telepon", "hp", "menelpon", "pesan", "chat"],
    description: "Telepon, panggilan tak terjawab, atau pesan yang gagal terkirim.",
    interpretation: "Telepon mewakili koneksi dan komunikasi. Panggilan yang tak tersambung sering mencerminkan percakapan yang perlu kamu lakukan — dengan orang lain atau dengan dirimu sendiri.",
    relatedEmotions: ["Anxiety", "Confusion"],
  },
  {
    name: "Naked in Public", nameId: "Telanjang di Umum", slug: "naked-in-public", category: "Event",
    keywords: ["naked", "nude", "no clothes", "undressed", "telanjang", "tanpa baju"],
    description: "Menyadari dirimu tak berpakaian di tempat umum.",
    interpretation: "Mimpi klasik ini cenderung menyertai kerentanan — takut terekspos, dihakimi, atau terlihat tanpa perlindungan biasamu. Sering muncul menjelang presentasi atau perubahan besar.",
    relatedEmotions: ["Anxiety", "Fear", "Confusion"],
  },
  {
    name: "Flying Insects", nameId: "Serangga Terbang", slug: "flying-insects", category: "Creature",
    keywords: ["butterfly", "bee", "insect", "dragonfly", "moth", "kupu-kupu", "lebah", "serangga", "capung", "ngengat"],
    description: "Kupu-kupu, lebah, ngengat, dan serangga bersayap lainnya.",
    interpretation: "Kupu-kupu dan ngengat adalah simbol transformasi yang kuat — perubahan kecil dan tenang yang menumpuk menjadi sesuatu yang terlihat. Lebah bisa mencerminkan kesibukan dan komunitas.",
    relatedEmotions: ["Curiosity", "Joy", "Calm"],
  },
  {
    name: "Ghost", nameId: "Hantu", slug: "ghost", category: "Creature",
    keywords: ["ghost", "spirit", "haunted", "phantom", "hantu", "roh", "berhantu", "setan"],
    description: "Hantu, roh, atau tempat angker.",
    interpretation: "Hantu biasanya mewakili masa lalu yang masih menempati ruang di masa kini — kenangan, penyesalan, atau orang yang belum sepenuhnya kamu lepaskan.",
    relatedEmotions: ["Fear", "Sadness", "Curiosity"],
  },
  {
    name: "Celebration", nameId: "Perayaan", slug: "celebration", category: "Event",
    keywords: ["party", "wedding", "celebration", "festival", "birthday", "pesta", "pernikahan", "perayaan", "ulang tahun"],
    description: "Pesta, pernikahan, festival, dan perayaan.",
    interpretation: "Perayaan mencerminkan tonggak dan rasa memiliki sosial. Ia bisa mengungkap kegembiraan sejati, atau — saat ada yang terasa janggal di pesta — kebimbangan tentang perubahan hidup yang justru dirayakan orang lain.",
    relatedEmotions: ["Joy", "Excitement", "Love"],
  },
  {
    name: "Running Late", nameId: "Terlambat", slug: "running-late", category: "Event",
    keywords: ["late", "miss the", "missed the", "deadline", "hurry", "rushing", "terlambat", "telat", "ketinggalan", "buru-buru", "terburu"],
    description: "Terlambat, ketinggalan kereta, atau berpacu dengan tenggat.",
    interpretation: "Mimpi keterlambatan muncul saat kamu merasa tertekan waktu atau takut melewatkan peluang. Ia bisa jadi dorongan untuk menata ulang komitmen, bukan berlari lebih cepat.",
    relatedEmotions: ["Anxiety", "Fear"],
  },
  {
    name: "Sky", nameId: "Langit", slug: "sky", category: "Nature",
    keywords: ["sky", "clouds", "sunset", "sunrise", "rainbow", "langit", "awan", "senja", "matahari terbit", "pelangi"],
    description: "Langit, awan, senja, dan pelangi.",
    interpretation: "Langit mencerminkan cakrawala emosimu — seberapa terbuka masa depan terasa. Langit cerah menyertai optimisme; awan tebal bisa mencerminkan kekhawatiran yang membayangi rencanamu.",
    relatedEmotions: ["Calm", "Joy", "Curiosity"],
  },
  {
    name: "Falling Teeth", nameId: "Gigi Copot", slug: "falling-teeth", category: "Event",
    keywords: ["teeth falling", "tooth fell", "gigi copot", "gigi tanggal"],
    description: "Mimpi spesifik dan jelas tentang gigi yang mengendur dan copot.",
    interpretation: "Salah satu mimpi paling umum di dunia, sering terkait kecemasan soal penampilan, penuaan, atau salah bicara. Cenderung berkumpul di minggu-minggu penuh tekanan.",
    relatedEmotions: ["Anxiety", "Fear"],
  },
  {
    name: "Music", nameId: "Musik", slug: "music", category: "Object",
    keywords: ["music", "song", "singing", "concert", "piano", "guitar", "musik", "lagu", "bernyanyi", "konser", "gitar"],
    description: "Musik, nyanyian, alat musik, atau konser.",
    interpretation: "Musik mengungkap emosi yang tak bisa dipegang kata-kata. Musik yang harmonis mencerminkan keselarasan batin; suara yang sumbang bisa mencerminkan konflik dalam diri yang minta didengar.",
    relatedEmotions: ["Joy", "Calm", "Love"],
  },
  {
    name: "Book", nameId: "Buku", slug: "book", category: "Object",
    keywords: ["book", "library", "reading", "letter", "buku", "perpustakaan", "membaca", "surat"],
    description: "Buku, perpustakaan, surat, atau pesan tertulis.",
    interpretation: "Buku mewakili pengetahuan dan cerita — termasuk kisah yang kamu ceritakan tentang dirimu. Buku yang tak terbaca bisa mencerminkan situasi yang masih kamu coba pecahkan.",
    relatedEmotions: ["Curiosity", "Calm"],
  },
  {
    name: "Stairs", nameId: "Tangga", slug: "stairs", category: "Place",
    keywords: ["stairs", "staircase", "elevator", "lift", "escalator", "tangga", "eskalator"],
    description: "Tangga, lift, atau berpindah antar lantai.",
    interpretation: "Gerakan naik-turun mencerminkan kemajuan dan kemunduran. Menaiki menandakan pertumbuhan yang penuh usaha; lift yang lepas kendali bisa mencerminkan perubahan yang terjadi lebih cepat dari yang bisa kamu olah.",
    relatedEmotions: ["Anxiety", "Curiosity", "Excitement"],
  },
];

/** Slug simbol → nama tampilan Indonesia (untuk chip & kartu). */
export const SYMBOL_LABEL: Record<string, string> = Object.fromEntries(
  SYMBOL_LEXICON.map((s) => [s.slug, s.nameId])
);
export const SYMBOL_LABEL_BY_NAME: Record<string, string> = Object.fromEntries(
  SYMBOL_LEXICON.map((s) => [s.name, s.nameId])
);
export function symbolLabel(nameOrSlug: string) {
  return SYMBOL_LABEL[nameOrSlug] ?? SYMBOL_LABEL_BY_NAME[nameOrSlug] ?? nameOrSlug;
}

// ── Kamus kata kunci emosi (EN + ID) ───────────────────────────────────

export const EMOTION_KEYWORDS: Record<string, string[]> = {
  Joy: ["happy", "joy", "joyful", "laugh", "laughing", "smile", "smiling", "wonderful", "beautiful", "amazing", "delight", "fun", "senang", "bahagia", "gembira", "tertawa", "tersenyum", "indah", "menyenangkan", "seru"],
  Calm: ["calm", "peaceful", "peace", "serene", "gentle", "quiet", "still", "relaxed", "safe", "warm", "tenang", "damai", "nyaman", "hening", "hangat", "aman", "sejuk"],
  Excitement: ["excited", "exciting", "thrill", "thrilling", "adventure", "adrenaline", "race", "racing", "fast", "semangat", "seru sekali", "petualangan", "menegangkan", "kencang", "deg-degan senang"],
  Curiosity: ["curious", "wonder", "wondering", "strange", "mysterious", "mystery", "explore", "exploring", "discover", "unknown", "penasaran", "aneh", "misterius", "menjelajah", "menemukan", "asing"],
  Love: ["love", "loved", "hug", "hugging", "embrace", "kiss", "together", "warmth", "miss", "missed", "cinta", "sayang", "peluk", "memeluk", "rindu", "kangen", "bersama"],
  Fear: ["afraid", "scared", "scary", "terrified", "terror", "horror", "fear", "dark", "monster", "scream", "screaming", "hide", "hiding", "danger", "takut", "seram", "ngeri", "menakutkan", "teriak", "sembunyi", "bahaya", "horor"],
  Anxiety: ["anxious", "anxiety", "worried", "worry", "nervous", "stress", "stressed", "panic", "late", "unprepared", "exam", "deadline", "trapped", "stuck", "cemas", "khawatir", "gugup", "panik", "terjebak", "terlambat", "telat", "ujian", "tertekan"],
  Sadness: ["sad", "sadness", "cry", "crying", "tears", "grief", "lonely", "alone", "loss", "lost someone", "goodbye", "miss", "sedih", "menangis", "air mata", "kesepian", "sendirian", "kehilangan", "perpisahan", "duka"],
  Anger: ["angry", "anger", "furious", "rage", "fight", "fighting", "shout", "shouting", "yell", "argument", "marah", "kesal", "emosi", "berkelahi", "bertengkar", "membentak", "geram"],
  Confusion: ["confused", "confusing", "confusion", "weird", "strange", "shifting", "changing", "didn't make sense", "no sense", "blur", "blurry", "maze", "bingung", "membingungkan", "aneh sekali", "berubah-ubah", "kabur", "tidak jelas", "tidak masuk akal"],
};

export const INTENSIFIERS = ["very", "so", "extremely", "really", "completely", "totally", "deeply", "sangat", "sekali", "banget", "amat", "benar-benar", "sungguh"];

// Deteksi tema: kombinasi sinyal → nama tema (bahasa Indonesia).
export const THEME_RULES: Array<{ theme: string; requires: string[]; description: string }> = [
  { theme: "Pelarian & Penghindaran", requires: ["Being Chased"], description: "berlari dari sesuatu yang mungkin justru butuh perhatian" },
  { theme: "Transformasi", requires: ["Snake"], description: "perubahan yang sedang berlangsung atau pelepasan identitas lama" },
  { theme: "Transformasi", requires: ["Flying Insects"], description: "perubahan diri yang tenang dan bertahap" },
  { theme: "Kebebasan & Perspektif", requires: ["Flying"], description: "keinginan akan kebebasan atau pandangan hidup yang lebih luas" },
  { theme: "Kehilangan Kendali", requires: ["Falling"], description: "merasa tak tertopang atau terlalu memaksakan diri" },
  { theme: "Kehilangan Kendali", requires: ["Vehicle"], description: "hidup bergerak lebih cepat dari yang terkelola" },
  { theme: "Penemuan Diri", requires: ["House"], description: "menjelajahi bagian dirimu yang asing" },
  { theme: "Penemuan Diri", requires: ["Mirror"], description: "mengamati cara kamu memandang dirimu" },
  { theme: "Ketidakpastian", requires: ["Lost"], description: "mencari arah" },
  { theme: "Ketidakpastian", requires: ["Darkness"], description: "melewati hal yang tak diketahui" },
  { theme: "Tekanan Performa", requires: ["School"], description: "merasa diuji atau dinilai" },
  { theme: "Tekanan Performa", requires: ["Running Late"], description: "tekanan waktu dan takut ketinggalan" },
  { theme: "Kedalaman Emosi", requires: ["Water"], description: "perasaan kuat di bawah permukaan" },
  { theme: "Kedalaman Emosi", requires: ["Ocean"], description: "menjelajahi alam bawah sadar" },
  { theme: "Akhir & Awal", requires: ["Death"], description: "satu babak menutup untuk memberi ruang bagi yang baru" },
  { theme: "Koneksi", requires: ["Family"], description: "rasa memiliki dan hubungan" },
  { theme: "Koneksi", requires: ["Old Friend"], description: "terhubung kembali dengan orang atau diri masa lalu" },
  { theme: "Koneksi", requires: ["Celebration"], description: "rasa memiliki sosial dan tonggak bersama" },
  { theme: "Kerentanan", requires: ["Naked in Public"], description: "takut terekspos atau dihakimi" },
  { theme: "Aspirasi", requires: ["Mountain"], description: "tujuan jangka panjang dan usaha yang dituntutnya" },
  { theme: "Aspirasi", requires: ["Stars"], description: "harapan dan cita-cita yang menuntun" },
];
