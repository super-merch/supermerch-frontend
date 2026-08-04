import { copyFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const indexPath = join(distDir, "index.html");
const shellDir = join(process.cwd(), "server-assets");
const shellPath = join(shellDir, "app-shell.html");

if (!existsSync(indexPath)) {
  throw new Error(
    "dist/index.html not found after build -- cannot prepare the SSR shell copy",
  );
}

// Vercel serves an exact static-file match (dist/index.html at "/") before
// ever consulting vercel.json's rewrites -- so as long as this file exists
// at the deploy output root, the "/" -> api/seo-page rewrite can never
// fire, and the homepage stays the empty, un-server-rendered shell (the
// incident this fixes -- see getShell() in api/seo-page.js). So copy the
// shell somewhere the three SSR functions can still read it, then remove
// the original so there's no static match left to intercept "/" with.
//
// The copy deliberately lands OUTSIDE dist: anything inside the public
// output directory is reachable as a URL, so an earlier version of this
// script that wrote dist/_shell.html left an empty, indexable page served
// at /_shell.html that declared itself "index, follow" and claimed the
// homepage as its canonical -- the exact thin-content problem the SSR work
// exists to remove. Files outside the public output are never served to
// visitors, while vercel.json's includeFiles still packages this one into
// each function bundle, so the functions keep working and the URL simply
// doesn't exist. Note that noindex-ing /_shell.html instead would be
// weaker: robots.txt cannot be used to suppress it (a URL must be
// crawlable for a noindex to be seen at all), so removing the URL is the
// only complete fix.
//
// This only runs as part of the Vercel-specific "vercel-build" npm script
// (see package.json + vercel.json's buildCommand) -- never as part of the
// plain "build" script, so local dev, `npm run build`, `vite preview`, and
// every test (which mocks node:fs and never touches a real file) are all
// completely unaffected.
mkdirSync(shellDir, { recursive: true });
copyFileSync(indexPath, shellPath);
rmSync(indexPath);
console.log(
  'Prepared server-assets/app-shell.html for the SSR functions and removed dist/index.html so Vercel\'s "/" rewrite can actually fire.',
);
