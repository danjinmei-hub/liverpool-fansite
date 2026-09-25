import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".txt": "text/plain", ".svg": "image/svg+xml", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".ico": "image/x-icon" };

// Plain files only: directory indexes like OSS, no SSR, API or SPA fallback.
export function staticServer(directory) {
  const root = resolve(directory);
  return createServer(async (request, response) => {
    try {
      if (!["GET", "HEAD"].includes(request.method)) {
        response.writeHead(405).end();
        return;
      }
      const pathname = decodeURIComponent(new URL(request.url, "http://static.local").pathname);
      let file = resolve(root, `.${pathname}`);
      if (file !== root && !file.startsWith(root + sep)) throw new Error("Invalid path");
      if ((await stat(file)).isDirectory()) {
        if (!pathname.endsWith("/")) {
          response.writeHead(308, { Location: `${pathname}/` }).end();
          return;
        }
        file = resolve(file, "index.html");
      }
      const bytes = await readFile(file);
      response.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream", "Cache-Control": "no-cache" });
      response.end(request.method === "HEAD" ? undefined : bytes);
    } catch {
      response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      response.end(await readFile(resolve(root, "404.html")).catch(() => "Not found"));
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const directory = process.argv[2] ?? "out";
  const port = Number(process.env.PORT ?? 4173);
  staticServer(directory).listen(port, "0.0.0.0", () => console.log(`Serving static ${directory} on port ${port}`));
}
