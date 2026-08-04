import { NextResponse } from "next/server";

import {
  authorizeReleaseEvidenceRequest,
  readBlundrBuildIdentity,
} from "@/lib/blundr/release/buildIdentity.server";

export const dynamic = "force-dynamic";

function noStore(body: unknown, status = 200): NextResponse {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: Request): Promise<Response> {
  const authorization = authorizeReleaseEvidenceRequest(request);
  if (authorization.authorized === false)
    return noStore({ error: authorization.error }, authorization.status);
  const identity = readBlundrBuildIdentity();
  return noStore(identity, identity.ready ? 200 : 503);
}
