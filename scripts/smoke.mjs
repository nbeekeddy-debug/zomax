import { spawn } from "node:child_process";

const port = Number(process.env.ZOMAX_SMOKE_PORT || 3100);
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1" },
});

let stderr = "";
child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
child.stdout.on("data", (chunk) => process.stdout.write(chunk));

async function waitForServer() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/health`, { cache: "no-store" });
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Zomax server did not become healthy in time. ${stderr}`);
}

async function expectOk(path) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "follow" });
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return response;
}

async function run() {
  await waitForServer();

  const publicRoutes = [
    "/",
    "/shop",
    "/deals",
    "/categories",
    "/sellers",
    "/help",
    "/login",
    "/signup",
    "/product/101",
  ];

  for (const route of publicRoutes) await expectOk(route);

  const health = await expectOk("/api/health");
  const healthBody = await health.json();
  if (healthBody?.ok !== true || healthBody?.service !== "zomax-web") {
    throw new Error("Health endpoint returned an unexpected payload");
  }
  if (!String(health.headers.get("cache-control") || "").includes("no-store")) {
    throw new Error("Health endpoint must be non-cacheable");
  }

  const account = await expectOk("/account");
  const robots = account.headers.get("x-robots-tag") || "";
  if (!robots.includes("noindex")) throw new Error("Private account route is missing X-Robots-Tag noindex");

  const legacy = await fetch(`${baseUrl}/shop.html`, { redirect: "manual" });
  if (![307, 308].includes(legacy.status)) throw new Error(`/shop.html returned ${legacy.status} instead of a redirect`);
  if (!String(legacy.headers.get("location") || "").endsWith("/shop")) {
    throw new Error("Legacy /shop.html redirect target is incorrect");
  }

  console.log(`\nZomax smoke checks passed for ${publicRoutes.length + 3} critical checks.`);
}

try {
  await run();
} finally {
  child.kill("SIGTERM");
}
