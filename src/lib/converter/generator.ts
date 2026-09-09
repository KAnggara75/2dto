import type { ClassMetadata, ConverterConfig } from './types';
import { toPascalCase } from './sanitizer';

export function generateJavaCode(classes: ClassMetadata[], config: ConverterConfig): string {
  if (classes.length === 0) {
    return '// Provide valid JSON to generate Java DTO';
  }

  const imports = new Set<string>();
  if (config.useJsonProperty) {
    imports.add('import com.fasterxml.jackson.annotation.JsonProperty;');
  }

  // Inspect what imports are needed
  let hasList = false;
  let hasInstant = false;
  let hasLocalDate = false;
  let hasBigInteger = false;
  let hasBigDecimal = false;

  for (const cls of classes) {
    for (const field of cls.fields) {
      if (field.isCollection || field.javaType.includes('List<')) hasList = true;
      if (field.javaType === 'Instant') hasInstant = true;
      if (field.javaType === 'LocalDate') hasLocalDate = true;
      if (field.javaType === 'BigInteger') hasBigInteger = true;
      if (field.javaType === 'BigDecimal') hasBigDecimal = true;
    }
  }

  if (hasList) imports.add('import java.util.List;');
  if (hasInstant) imports.add('import java.time.Instant;');
  if (hasLocalDate) imports.add('import java.time.LocalDate;');
  if (hasBigInteger) imports.add('import java.math.BigInteger;');
  if (hasBigDecimal) imports.add('import java.math.BigDecimal;');

  if (config.dtoType === 'CLASS' && config.useLombok) {
    imports.add('import lombok.Data;');
    if (config.useLombokBuilder) {
      imports.add('import lombok.Builder;');
    }
    imports.add('import lombok.NoArgsConstructor;');
    imports.add('import lombok.AllArgsConstructor;');
  }

  if (config.useJakartaValidation) {
    imports.add('import jakarta.validation.constraints.NotNull;');
    imports.add('import jakarta.validation.Valid;');
  }

  const sortedImports = Array.from(imports).sort();

  const packageDeclaration = config.packageName
    ? `package ${config.packageName};\n\n`
    : '';

  const importsDeclaration = sortedImports.join('\n') + '\n\n';

  const classDefinitions = classes.map((cls, index) => {
    const isPublic = index === classes.length - 1; // root is usually last in dependency order
    if (config.dtoType === 'RECORD') {
      return generateRecord(cls, isPublic, config);
    }
    return generateClass(cls, isPublic, config);
  });

  return `${packageDeclaration}${importsDeclaration}${classDefinitions.join('\n\n')}\n`;
}

function generateRecord(cls: ClassMetadata, isPublic: boolean, config: ConverterConfig): string {
  const access = isPublic ? 'public ' : 'public static ';
  if (cls.fields.length === 0) {
    return `${access}record ${cls.className}() {}`;
  }

  const params = cls.fields.map((field) => {
    const lines: string[] = [];
    if (config.useJakartaValidation) {
      lines.push('    @NotNull');
      if (field.isNestedObject) {
        lines.push('    @Valid');
      }
    }
    if (config.useJsonProperty) {
      lines.push(`    @JsonProperty("${field.originalKey}") ${field.javaType} ${field.sanitizedFieldName}`);
    } else {
      lines.push(`    ${field.javaType} ${field.sanitizedFieldName}`);
    }
    return lines.join('\n');
  });

  return `${access}record ${cls.className}(\n${params.join(',\n')}\n) {}`;
}

function generateClass(
  cls: ClassMetadata,
  isPublic: boolean,
  config: ConverterConfig
): string {
  const access = isPublic ? 'public ' : 'public static ';

  if (config.useLombok) {
    const annotations: string[] = ['@Data'];

    if (config.useLombokBuilder) {
      annotations.push('@Builder');
    }
    annotations.push('@NoArgsConstructor');
    annotations.push('@AllArgsConstructor');

    const fieldsDef = cls.fields.map((field) => {
      const lines: string[] = [];
      if (config.useJakartaValidation) {
        lines.push('    @NotNull');
        if (field.isNestedObject) {
          lines.push('    @Valid');
        }
      }
      if (config.useJsonProperty) {
        lines.push(`    @JsonProperty("${field.originalKey}")`);
      }
      lines.push(`    private ${field.javaType} ${field.sanitizedFieldName};`);
      return lines.join('\n');
    });

    const body = fieldsDef.length > 0 ? `\n${fieldsDef.join('\n\n')}\n` : '';
    return `${annotations.join('\n')}\n${access}class ${cls.className} {${body}}`;
  }

  // Standard POJO with Constructors, Getters & Setters
  const sections: string[] = [];

  // Fields
  const fieldsDef = cls.fields.map((field) => {
    const lines: string[] = [];
    if (config.useJakartaValidation) {
      lines.push('    @NotNull');
      if (field.isNestedObject) {
        lines.push('    @Valid');
      }
    }
    if (config.useJsonProperty) {
      lines.push(`    @JsonProperty("${field.originalKey}")`);
    }
    lines.push(`    private ${field.javaType} ${field.sanitizedFieldName};`);
    return lines.join('\n');
  });

  if (fieldsDef.length > 0) {
    sections.push(fieldsDef.join('\n\n'));
  }

  // Default No-Arg Constructor
  sections.push(`    public ${cls.className}() {\n    }`);

  // All-Args Constructor if fields exist
  if (cls.fields.length > 0) {
    const params = cls.fields.map((f) => `${f.javaType} ${f.sanitizedFieldName}`).join(', ');
    const assignments = cls.fields
      .map((f) => `        this.${f.sanitizedFieldName} = ${f.sanitizedFieldName};`)
      .join('\n');
    sections.push(`    public ${cls.className}(${params}) {\n${assignments}\n    }`);
  }

  // Getters and Setters
  const gettersSetters: string[] = [];
  for (const field of cls.fields) {
    const capitalized = toPascalCase(field.sanitizedFieldName);
    const getterPrefix = field.javaType === 'Boolean' || field.javaType === 'boolean' ? 'is' : 'get';

    // Getter
    gettersSetters.push(
      `    public ${field.javaType} ${getterPrefix}${capitalized}() {\n        return this.${field.sanitizedFieldName};\n    }`
    );
    // Setter
    gettersSetters.push(
      `    public void set${capitalized}(${field.javaType} ${field.sanitizedFieldName}) {\n        this.${field.sanitizedFieldName} = ${field.sanitizedFieldName};\n    }`
    );
  }

  if (gettersSetters.length > 0) {
    sections.push(gettersSetters.join('\n\n'));
  }

  const body = sections.length > 0 ? `\n${sections.join('\n\n')}\n` : '';
  return `${access}class ${cls.className} {${body}}`;
}
