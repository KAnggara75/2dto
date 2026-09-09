import { parse, LosslessNumber } from 'lossless-json';

/**
 * Parses JSON using lossless-json to preserve arbitrarily large integers without precision loss.
 */
export function parseLosslessJson(jsonString: string): unknown {
  return parse(jsonString);
}

export function isLosslessNumber(value: unknown): value is LosslessNumber {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { isLosslessNumber?: boolean }).isLosslessNumber === true
  );
}
