import { NextResponse } from "next/server";

const ML_SERVER = process.env.ML_SERVER_URL || "http://127.0.0.1:8100";

export const dynamic = "force-dynamic";

export async function GET() {
  let mlStatus = { status: "offline", models_loaded: {} };

  try {
    const res = await fetch(`${ML_SERVER}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      mlStatus = await res.json();
    }
  } catch {
    // ML server not running
  }

  const mlAvailable = mlStatus.status === "ok";

  return NextResponse.json({
    status: "ok",
    version: "3.0.0",
    ai_available: mlAvailable,
    nlp_available: true,
    ml_server: mlAvailable ? "online" : "offline",
    ml_models: mlStatus.models_loaded || {},
  });
}
