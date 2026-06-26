import { NextResponse } from "next/server";

import { resolveStage2ApprovedContentPacketCollection } from "@/lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage";
import { validateApprovedContentPacketPayload } from "@/lib/blundr/stage2ApprovedContent/approvedContentPacketPayload";

export const dynamic = "force-dynamic";

function jsonNoStore(body: unknown, init?: ResponseInit): NextResponse {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
}


export async function POST(request: Request): Promise<Response> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonNoStore({ error: "invalid_json" }, { status: 400 });
  }

  const validated = validateApprovedContentPacketPayload(body);
  if (validated.ok === false) {
    return jsonNoStore({ error: validated.reason }, { status: 400 });
  }

  return jsonNoStore(resolveStage2ApprovedContentPacketCollection(validated.value));
}

export async function GET(): Promise<Response> {
  return jsonNoStore({ error: "method_not_allowed" }, { status: 405 });
}
