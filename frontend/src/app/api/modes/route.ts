import { NextResponse } from "next/server";

const ML_SERVER = process.env.ML_SERVER_URL || "http://127.0.0.1:8100";

export const dynamic = "force-dynamic";

export async function GET() {
  let mlAvailable = false;

  try {
    const res = await fetch(`${ML_SERVER}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    mlAvailable = res.ok;
  } catch {
    // ML server not running
  }

  const modes = [
    {
      id: "ml",
      name: "ML Analysis",
      available: mlAvailable,
      description: mlAvailable
        ? "Sentence-BERT + trained models — 95%+ accuracy"
        : "ML server offline — start it with: cd ml-server && python -m app.main",
    },
  ];

  return NextResponse.json({
    modes,
    default: "ml",
  });
}
