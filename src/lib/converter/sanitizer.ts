const JAVA_RESERVED = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
  'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
  'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
  'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package',
  'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
  'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient',
  'try', 'void', 'volatile', 'while', 'record', 'var', 'yield', 'sealed', 'permits', 'non-sealed'
]);

export function toPascalCase(str: string): string {
  if (!str) return 'Root';
  const cleaned = str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  if (!cleaned) return 'Root';
  // If starts with a digit, prefix with Dto
  if (/^[0-9]/.test(cleaned)) {
    return `Dto${cleaned}`;
  }
  return cleaned;
}

export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  if (!pascal) return 'field';
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function isReservedKeyword(word: string): boolean {
  return JAVA_RESERVED.has(word);
}

export function sanitizeFieldName(key: string): { name: string; needsAnnotation: boolean; isReserved: boolean } {
  let camel = toCamelCase(key);
  let isReserved = JAVA_RESERVED.has(camel);
  let needsAnnotation = camel !== key;

  if (isReserved) {
    camel = `${camel}Val`;
    needsAnnotation = true;
  }

  // If starts with digit or empty
  if (/^[0-9]/.test(camel)) {
    camel = `field${camel}`;
    needsAnnotation = true;
  }

  return { name: camel, needsAnnotation, isReserved };
}
