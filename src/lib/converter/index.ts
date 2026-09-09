import { parseLosslessJson } from '../utils/parser';
import { TypeInferrer } from './inferrer';
import { generateJavaCode } from './generator';
import type { ConverterConfig, ConversionResult } from './types';

export function convertJsonToDto(
  jsonString: string,
  config: ConverterConfig
): ConversionResult {
  if (!jsonString.trim()) {
    return { code: '', classes: [] };
  }

  const parsed = parseLosslessJson(jsonString);
  const inferrer = new TypeInferrer(config);
  const classes = inferrer.infer(parsed);
  const code = generateJavaCode(classes, config);

  return { code, classes };
}
