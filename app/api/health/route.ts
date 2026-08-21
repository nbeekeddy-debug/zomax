import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "zomax-web",
      runtime: "nextjs",
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
      revision: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "local",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
