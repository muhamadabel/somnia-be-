import { readStoredFile } from "@/lib/services/storage";

// File serving for a separate cross-origin frontend. Browsers can't attach
// an Authorization header to <img src>, so these are served without auth and
// protected by unguessable random-hex filenames (capability-URL pattern).
// Only images (dream art, uploads) live here — never sensitive JSON.
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (path.length !== 2) return new Response("Not found", { status: 404 });

  const file = await readStoredFile(path[0], path[1]);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(file.data), {
    headers: {
      "content-type": file.contentType,
      "cache-control": "public, max-age=86400, immutable",
      "x-content-type-options": "nosniff",
      "access-control-allow-origin": "*",
    },
  });
}
