import { isLosslessNumber } from '../utils/parser';
import { sanitizeFieldName, toPascalCase } from './sanitizer';
import type { ClassMetadata, ConverterConfig, FieldMetadata } from './types';

// ISO-8601 date / datetime regex
const ISO_DATE_TIME_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Integer limits for 32-bit signed
const INT_MIN = -2147483648n;
const INT_MAX = 2147483647n;
// Integer limits for 64-bit signed
const LONG_MIN = -9223372036854775808n;
const LONG_MAX = 9223372036854775807n;

export class TypeInferrer {
  private classes: Map<string, ClassMetadata> = new Map();
  private classOrder: string[] = [];

  constructor(private config: ConverterConfig) {}

  public infer(parsedData: unknown): ClassMetadata[] {
    this.classes.clear();
    this.classOrder = [];

    const rootName = toPascalCase(this.config.rootClassName) || 'RootDto';

    if (Array.isArray(parsedData)) {
      if (parsedData.length > 0 && typeof parsedData[0] === 'object' && parsedData[0] !== null) {
        const itemName = `${rootName}Item`;
        this.inferObject(parsedData[0] as Record<string, unknown>, itemName);
        // Create root wrapper or main item as requested by PRD:
        // "Bungkus class turunan menjadi ItemResponse, dan hasilkan root identifier List<ItemResponse>"
        // Here we also provide a root container or let the item class be the primary entry
        this.createRootListWrapper(rootName, itemName);
      } else {
        this.createEmptyOrPrimitiveListWrapper(rootName, parsedData);
      }
    } else if (typeof parsedData === 'object' && parsedData !== null) {
      this.inferObject(parsedData as Record<string, unknown>, rootName);
    } else {
      // Primitive root
      this.createPrimitiveWrapper(rootName, parsedData);
    }

    // Return in order (dependencies first or root first)
    return this.classOrder.map((name) => this.classes.get(name)!);
  }

  private inferObject(obj: Record<string, unknown>, className: string): string {
    // If class name already registered, disambiguate if fields differ
    let uniqueClassName = className;
    let counter = 1;
    while (this.classes.has(uniqueClassName)) {
      const existing = this.classes.get(uniqueClassName)!;
      // Check if signature matches
      const existingKeys = existing.fields.map((f) => f.originalKey).sort().join(',');
      const currentKeys = Object.keys(obj).sort().join(',');
      if (existingKeys === currentKeys) {
        return uniqueClassName;
      }
      uniqueClassName = `${className}${counter++}`;
    }

    const fields: FieldMetadata[] = [];
    // Reserve class name to prevent infinite recursion
    this.classes.set(uniqueClassName, { className: uniqueClassName, fields: [] });
    this.classOrder.push(uniqueClassName);

    for (const [key, value] of Object.entries(obj)) {
      const { name: sanitizedFieldName, needsAnnotation } = sanitizeFieldName(key);
      const fieldInfo = this.inferField(sanitizedFieldName, value, uniqueClassName);
      fields.push({
        originalKey: key,
        sanitizedFieldName,
        ...fieldInfo,
        needsAnnotation: needsAnnotation || fieldInfo.needsAnnotation,
      });
    }

    this.classes.set(uniqueClassName, { className: uniqueClassName, fields });
    return uniqueClassName;
  }

  private inferField(
    sanitizedFieldName: string,
    value: unknown,
    parentClassName: string
  ): Omit<FieldMetadata, 'originalKey' | 'sanitizedFieldName'> {
    if (value === null || value === undefined) {
      return {
        javaType: 'Object',
        isNestedObject: false,
        isCollection: false,
        needsAnnotation: false,
      };
    }

    if (isLosslessNumber(value)) {
      const numStr = value.value;
      return {
        javaType: this.inferNumberType(numStr),
        isNestedObject: false,
        isCollection: false,
        needsAnnotation: false,
      };
    }

    if (typeof value === 'number') {
      return {
        javaType: Number.isInteger(value) ? 'Integer' : 'Double',
        isNestedObject: false,
        isCollection: false,
        needsAnnotation: false,
      };
    }

    if (typeof value === 'boolean') {
      return {
        javaType: 'Boolean',
        isNestedObject: false,
        isCollection: false,
        needsAnnotation: false,
      };
    }

    if (typeof value === 'string') {
      if (this.config.detectIsoDates) {
        if (ISO_DATE_TIME_REGEX.test(value)) {
          return {
            javaType: 'Instant',
            isNestedObject: false,
            isCollection: false,
            needsAnnotation: false,
          };
        }
        if (ISO_DATE_REGEX.test(value)) {
          return {
            javaType: 'LocalDate',
            isNestedObject: false,
            isCollection: false,
            needsAnnotation: false,
          };
        }
      }
      return {
        javaType: 'String',
        isNestedObject: false,
        isCollection: false,
        needsAnnotation: false,
      };
    }

    if (Array.isArray(value)) {
      return this.inferArrayField(value, sanitizedFieldName, parentClassName);
    }

    if (typeof value === 'object') {
      const nestedClassName = toPascalCase(sanitizedFieldName) || `${parentClassName}Child`;
      const resolvedClassName = this.inferObject(value as Record<string, unknown>, nestedClassName);
      return {
        javaType: resolvedClassName,
        isNestedObject: true,
        nestedClassName: resolvedClassName,
        isCollection: false,
        needsAnnotation: false,
      };
    }

    return {
      javaType: 'Object',
      isNestedObject: false,
      isCollection: false,
      needsAnnotation: false,
    };
  }

  private inferArrayField(
    arr: unknown[],
    sanitizedFieldName: string,
    parentClassName: string
  ): Omit<FieldMetadata, 'originalKey' | 'sanitizedFieldName'> {
    if (arr.length === 0) {
      return {
        javaType: 'List<Object>',
        isNestedObject: false,
        isCollection: true,
        needsAnnotation: false,
      };
    }

    // Check first element
    const first = arr[0];

    // If array of objects, merge or use the first object structure
    if (typeof first === 'object' && first !== null && !isLosslessNumber(first)) {
      // Singularize name if possible
      let itemClassName = toPascalCase(sanitizedFieldName);
      if (itemClassName.endsWith('ies')) {
        itemClassName = itemClassName.slice(0, -3) + 'y';
      } else if (itemClassName.endsWith('s')) {
        itemClassName = itemClassName.slice(0, -1);
      }
      if (!itemClassName || itemClassName === parentClassName) {
        itemClassName = `${itemClassName}Item`;
      }

      // Merge all objects in array to ensure all fields are captured
      const mergedObj: Record<string, unknown> = {};
      for (const item of arr) {
        if (typeof item === 'object' && item !== null) {
          Object.assign(mergedObj, item);
        }
      }

      const resolvedClassName = this.inferObject(mergedObj, itemClassName);
      return {
        javaType: `List<${resolvedClassName}>`,
        isNestedObject: true,
        nestedClassName: resolvedClassName,
        isCollection: true,
        needsAnnotation: false,
      };
    }

    // Array of primitives
    const types = new Set<string>();
    for (const item of arr) {
      if (item === null || item === undefined) continue;
      if (isLosslessNumber(item)) {
        types.add(this.inferNumberType(item.value));
      } else if (typeof item === 'number') {
        types.add(Number.isInteger(item) ? 'Integer' : 'Double');
      } else if (typeof item === 'string') {
        types.add('String');
      } else if (typeof item === 'boolean') {
        types.add('Boolean');
      } else {
        types.add('Object');
      }
    }

    if (types.size === 1) {
      const singleType = Array.from(types)[0];
      return {
        javaType: `List<${singleType}>`,
        isNestedObject: false,
        isCollection: true,
        needsAnnotation: false,
      };
    }

    // Heterogeneous array
    return {
      javaType: 'List<Object>',
      isNestedObject: false,
      isCollection: true,
      needsAnnotation: false,
    };
  }

  private inferNumberType(numStr: string): string {
    if (numStr.includes('.') || numStr.includes('e') || numStr.includes('E')) {
      return 'Double';
    }

    try {
      const big = BigInt(numStr);
      if (big >= INT_MIN && big <= INT_MAX) {
        return 'Integer';
      }
      if (big >= LONG_MIN && big <= LONG_MAX) {
        return 'Long';
      }
      return 'BigInteger';
    } catch {
      return 'Double';
    }
  }

  private createRootListWrapper(rootName: string, itemName: string) {
    this.classes.set(rootName, {
      className: rootName,
      fields: [
        {
          originalKey: 'items',
          sanitizedFieldName: 'items',
          javaType: `List<${itemName}>`,
          isNestedObject: true,
          nestedClassName: itemName,
          isCollection: true,
          needsAnnotation: false,
        },
      ],
    });
    this.classOrder.push(rootName);
  }

  private createEmptyOrPrimitiveListWrapper(rootName: string, data: unknown[]) {
    let elemType = 'Object';
    if (data.length > 0) {
      const first = data[0];
      if (typeof first === 'string') elemType = 'String';
      else if (typeof first === 'boolean') elemType = 'Boolean';
      else if (isLosslessNumber(first)) elemType = this.inferNumberType(first.value);
    }

    this.classes.set(rootName, {
      className: rootName,
      fields: [
        {
          originalKey: 'items',
          sanitizedFieldName: 'items',
          javaType: `List<${elemType}>`,
          isNestedObject: false,
          isCollection: true,
          needsAnnotation: false,
        },
      ],
    });
    this.classOrder.push(rootName);
  }

  private createPrimitiveWrapper(rootName: string, data: unknown) {
    let type = 'Object';
    if (typeof data === 'string') type = 'String';
    else if (typeof data === 'boolean') type = 'Boolean';
    else if (isLosslessNumber(data)) type = this.inferNumberType(data.value);

    this.classes.set(rootName, {
      className: rootName,
      fields: [
        {
          originalKey: 'value',
          sanitizedFieldName: 'value',
          javaType: type,
          isNestedObject: false,
          isCollection: false,
          needsAnnotation: false,
        },
      ],
    });
    this.classOrder.push(rootName);
  }
}
