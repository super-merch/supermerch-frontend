import { copyFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const indexPath = join(distDir, "index.html");
const shellPath = join(distDir, "_shell.html");

if (!existsSync(indexPath)) {
  throw new Error(
    "dist/index.html not found after build -- cannot prepare the SSR shell copy",
  );
}

// Vercel serves an exact static-file match (dist/index.html at "/") before
// ever consulting vercel.json's rewrites -- so as long as this file exists
// at the deploy output root, the "/" -> api/seo-page rewrite can never
// fire, and the homepage stays the empty, un-server-rendered shell (the
// incident this fixes -- see getShell() in api/seo-page.js). Copy it to a
// name no real route will ever request, then remove the original so
// there's no static match left for Vercel to intercept "/" with. The
// three SSR functions (api/product-page.js, api/seo-page.js,
// api/app-shell.js) read this copy via their own getShell(), bundled in
// via vercel.json's includeFiles -- unaffected by this rename, since
// Vercel bundles function files from this same build output after this
// script has already run.
//
// This only runs as part of the Vercel-specific "vercel-build" npm script
// (see package.json + vercel.json's buildCommand) -- never as part of the
// plain "build" script, so local dev, `npm run build`, `vite preview`, and
// every test (which mocks node:fs and never touches a real file) are all
// completely unaffected.
copyFileSync(indexPath, shellPath);
rmSync(indexPath);
console.log(
  'Prepared dist/_shell.html for the SSR functions and removed dist/index.html so Vercel\'s "/" rewrite can actually fire.',
);
