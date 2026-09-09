export type DtoTargetType = 'CLASS' | 'RECORD';

export interface ConverterConfig {
  rootClassName: string;
  packageName: string;
  dtoType: DtoTargetType;
  useLombok: boolean;
  useLombokBuilder: boolean;
  useJsonProperty: boolean;
  useJakartaValidation: boolean;
  detectIsoDates: boolean;
}

export interface FieldMetadata {
  originalKey: string;
  sanitizedFieldName: string;
  javaType: string;
  isNestedObject: boolean;
  nestedClassName?: string;
  isCollection: boolean;
  needsAnnotation: boolean;
}

export interface ClassMetadata {
  className: string;
  fields: FieldMetadata[];
}

export interface ConversionResult {
  code: string;
  classes: ClassMetadata[];
}
