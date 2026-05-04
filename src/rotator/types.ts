import { SourceMapEntry } from "../codegen/types";

/**
 * RotationSnapshot is the public in-memory bundle state served to clients.
 * The rotation key is intentionally absent from this shape.
 */
export interface RotationSnapshot {
  readonly version: number;
  readonly code: string;
  readonly sourceMap: SourceMapEntry[];
  readonly createdAt: Date;
}

/**
 * RotationLogEvent is sent only to server-side logging callbacks.
 */
export interface RotationLogEvent {
  readonly version: number;
  readonly key: string;
  readonly preview: string;
}

/**
 * RotationEngineOptions configures the timer and optional server-side logging.
 */
export interface RotationEngineOptions {
  readonly intervalMs?: number;
  readonly onRotate?: (event: RotationLogEvent) => void;
}
