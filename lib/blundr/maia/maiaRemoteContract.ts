import type { MaiaSkillLevel } from "./maiaTypes";

export const BLUNDR_MAIA_MOVE_CONTRACT = "blundr-maia-move.v1";
export const BLUNDR_MAIA_HEALTH_CONTRACT = "blundr-maia-health.v1";
export const BLUNDR_MAIA_SERVICE_VERSION = "1.0.0";
export const BLUNDR_MAIA_PROVIDER_NAME = "csslab-maia-v1";
export const BLUNDR_MAIA_PROVIDER_COMMIT =
  "749204cf5979ce7f8b0412e804a4ee7c83c49ff8";
export const BLUNDR_MAIA_ENGINE_VERSION = "0.32.1";
export const BLUNDR_MAIA_ENGINE_COMMIT =
  "fd71a2d921b689c5f479d3227c3806c8e272d9c5";

export const BLUNDR_MAIA_MODEL_SHA256: Readonly<
  Record<MaiaSkillLevel, string>
> = Object.freeze({
  "maia-1100":
    "e1cf1cd0c96b8a4fa6a275f4b9fd54ed1ffebf9fe44641b9fceded310e9619c4",
  "maia-1200":
    "ead4ba953f233ae732999ebc1e2b675378148527ebcfad2f0acbc5e4c224d98e",
  "maia-1300":
    "36195f87bf4761834baa0bf87472b18509a7261a9d7d6f1a8443261369a733f2",
  "maia-1400":
    "d5353ea6766356dad2d28920c6692f37a5f30963767f1a3105d33b4d0af011e8",
  "maia-1500":
    "35ab6f20421d59e1df3b17c5a5016947af4c6761368ef84044a9a9c7619a9a00",
  "maia-1600":
    "d2c9e5948581acf4b9fc0b1e720c5dc0fe64ce80cfc4a239d3f8a42e1176c876",
  "maia-1700":
    "d277eacd792d340a30abb464dc65127254e65cac57abca17facc469889b96478",
  "maia-1800":
    "0031ad7c4256b1fd09fbebd28418d644d68b26cd2a45df4967ccf5c7ec9c4965",
  "maia-1900":
    "e2f565f42d7cd9f122557e6dc4eb84e5bbaedceda1d404dc485d3611c7c97a12",
});

export interface MaiaRemoteProvenance {
  contractVersion: string;
  service: { name: string; version: string };
  provider: { name: string; sourceCommit: string };
  model: { id: string; skillLevel: MaiaSkillLevel; sha256: string };
  engine: {
    name: string;
    version: string;
    commit: string;
    search: string;
    nodes: number;
    backend: string;
  };
}

export interface MaiaRemoteHealthEvidence {
  contractVersion: typeof BLUNDR_MAIA_HEALTH_CONTRACT;
  serviceVersion: string;
  providerName: string;
  providerCommit: string;
  engineVersion: string;
  engineCommit: string;
  search: string;
  nodes: number;
  verifiedModels: number;
  availableSkills: string[];
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

export function parseMaiaRemoteHealth(
  body: unknown,
): MaiaRemoteHealthEvidence | null {
  const value = record(body);
  const service = record(value?.service);
  const provider = record(value?.provider);
  const engine = record(value?.engine);
  const models = record(value?.models);
  const availableSkills = Array.isArray(models?.availableSkills)
    ? models.availableSkills.map(String).sort()
    : [];
  const expectedSkills = Object.keys(BLUNDR_MAIA_MODEL_SHA256).sort();
  if (
    !(
      value?.ready === true &&
      value?.contractVersion === BLUNDR_MAIA_HEALTH_CONTRACT &&
      service?.name === "blundr-maia-service" &&
      service?.version === BLUNDR_MAIA_SERVICE_VERSION &&
      provider?.name === BLUNDR_MAIA_PROVIDER_NAME &&
      provider?.sourceCommit === BLUNDR_MAIA_PROVIDER_COMMIT &&
      engine?.name === "lc0" &&
      engine?.version === BLUNDR_MAIA_ENGINE_VERSION &&
      engine?.commit === BLUNDR_MAIA_ENGINE_COMMIT &&
      engine?.search === "classic" &&
      Number(engine?.nodes) === 1 &&
      Number(models?.verified) === expectedSkills.length &&
      JSON.stringify(availableSkills) === JSON.stringify(expectedSkills)
    )
  )
    return null;
  return {
    contractVersion: BLUNDR_MAIA_HEALTH_CONTRACT,
    serviceVersion: String(service.version),
    providerName: String(provider.name),
    providerCommit: String(provider.sourceCommit),
    engineVersion: String(engine.version),
    engineCommit: String(engine.commit),
    search: String(engine.search),
    nodes: Number(engine.nodes),
    verifiedModels: Number(models.verified),
    availableSkills,
  };
}

export function validateMaiaRemoteHealth(body: unknown): boolean {
  return parseMaiaRemoteHealth(body) !== null;
}

export function parseMaiaRemoteProvenance(
  input: unknown,
  skillLevel: MaiaSkillLevel,
): MaiaRemoteProvenance | null {
  const value = record(input);
  const service = record(value?.service);
  const provider = record(value?.provider);
  const model = record(value?.model);
  const engine = record(value?.engine);
  if (
    value?.contractVersion !== BLUNDR_MAIA_MOVE_CONTRACT ||
    service?.name !== "blundr-maia-service" ||
    service?.version !== BLUNDR_MAIA_SERVICE_VERSION ||
    provider?.name !== BLUNDR_MAIA_PROVIDER_NAME ||
    provider?.sourceCommit !== BLUNDR_MAIA_PROVIDER_COMMIT ||
    model?.id !== `csslab-maia-v1-${skillLevel.slice(-4)}` ||
    model?.skillLevel !== skillLevel ||
    model?.sha256 !== BLUNDR_MAIA_MODEL_SHA256[skillLevel] ||
    engine?.name !== "lc0" ||
    engine?.version !== BLUNDR_MAIA_ENGINE_VERSION ||
    engine?.commit !== BLUNDR_MAIA_ENGINE_COMMIT ||
    engine?.search !== "classic" ||
    Number(engine?.nodes) !== 1 ||
    typeof engine?.backend !== "string" ||
    !engine.backend
  )
    return null;
  return input as MaiaRemoteProvenance;
}
