import { describe, expect, it } from 'bun:test';
import { convertJsonToDto } from './index';
import type { ConverterConfig } from './types';

describe('convertJsonToDto', () => {
  const defaultConfig: ConverterConfig = {
    rootClassName: 'CustomerProfile',
    packageName: 'com.example.dto',
    dtoType: 'RECORD',
    useJakartaValidation: false,
    useLombokBuilder: true,
    detectIsoDates: true,
  };

  it('should correctly infer 64-bit integer as Long without precision loss', () => {
    const json = JSON.stringify({
      customer_id: 982347109283741234n.toString(), // or lossless number raw string
    }).replace('"982347109283741234"', '982347109283741234');

    const result = convertJsonToDto(json, defaultConfig);
    expect(result.code).toContain('Long customerId');
    expect(result.code).toContain('@JsonProperty("customer_id")');
  });

  it('should infer ISO dates as Instant and LocalDate', () => {
    const json = JSON.stringify({
      registered_at: '2026-09-09T14:48:00Z',
      birth_date: '1994-05-20',
    });

    const result = convertJsonToDto(json, defaultConfig);
    expect(result.code).toContain('import java.time.Instant;');
    expect(result.code).toContain('import java.time.LocalDate;');
    expect(result.code).toContain('Instant registeredAt');
    expect(result.code).toContain('LocalDate birthDate');
  });

  it('should sanitize Java reserved keywords', () => {
    const json = JSON.stringify({
      class: 'PREMIUM',
      default: true,
      import: 'none',
    });

    const result = convertJsonToDto(json, defaultConfig);
    expect(result.code).toContain('@JsonProperty("class") String classVal');
    expect(result.code).toContain('@JsonProperty("default") Boolean defaultVal');
    expect(result.code).toContain('@JsonProperty("import") String importVal');
  });

  it('should generate Lombok class when selected', () => {
    const json = JSON.stringify({
      name: 'John',
      age: 30,
    });

    const lombokConfig: ConverterConfig = {
      ...defaultConfig,
      dtoType: 'LOMBOK',
      useLombokBuilder: true,
    };

    const result = convertJsonToDto(json, lombokConfig);
    expect(result.code).toContain('@Data');
    expect(result.code).toContain('@Builder');
    expect(result.code).toContain('public class CustomerProfile');
    expect(result.code).toContain('private String name;');
    expect(result.code).toContain('private Integer age;');
  });

  it('should extract nested objects cleanly', () => {
    const json = JSON.stringify({
      name: 'John',
      address: {
        street: 'Main St',
        city: 'Metropolis',
      },
    });

    const result = convertJsonToDto(json, defaultConfig);
    expect(result.code).toContain('record Address(');
    expect(result.code).toContain('Address address');
  });
});
