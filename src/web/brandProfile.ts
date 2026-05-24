/**
 * BrandProfile keeps reusable design identity outside per-page Kethic source.
 */
export interface BrandProfile {
  readonly name: string;
  readonly palette: "nocturne" | "lumen" | "forge" | string;
  readonly type: "editorial" | "modern" | "technical" | string;
  readonly surface: "glass" | "paper" | "metal" | string;
  readonly radius: "sharp" | "soft" | "round" | string;
  readonly motion: "still" | "calm" | "kinetic" | string;
  readonly density: "airy" | "balanced" | "dense" | string;
}

/**
 * ResolvedBrandProfile fills missing fields so every compile is deterministic.
 */
export interface ResolvedBrandProfile extends BrandProfile {
  readonly seed: number;
}

/**
 * normalizeBrandProfile accepts user-authored JSON and applies conservative defaults.
 */
export function normalizeBrandProfile(value: unknown): ResolvedBrandProfile {
  const input: Partial<Record<keyof BrandProfile, unknown>> = isRecord(value) ? value : {};
  const name: string = readString(input.name, "Kethic");
  const profile: BrandProfile = {
    name,
    palette: readString(input.palette, "nocturne"),
    type: readString(input.type, "modern"),
    surface: readString(input.surface, "glass"),
    radius: readString(input.radius, "soft"),
    motion: readString(input.motion, "calm"),
    density: readString(input.density, "balanced"),
  };

  return {
    ...profile,
    seed: hashProfile(profile),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function hashProfile(profile: BrandProfile): number {
  const source: string = [
    profile.name,
    profile.palette,
    profile.type,
    profile.surface,
    profile.radius,
    profile.motion,
    profile.density,
  ].join("|");
  let hash: number = 2166136261;

  for (let index: number = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
