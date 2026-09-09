export type DtoTargetType = 'RECORD' | 'LOMBOK';

export interface ConverterConfig {
  rootClassName: string;
  packageName: string;
  dtoType: DtoTargetType;
  useJakartaValidation: boolean;
  useLombokBuilder: boolean;
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
