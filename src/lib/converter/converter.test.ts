import { describe, expect, it } from 'bun:test';
import { convertJsonToDto } from './index';
import type { ConverterConfig } from './types';

describe('convertJsonToDto', () => {
  const defaultConfig: ConverterConfig = {
    rootClassName: 'CustomerProfile',
    packageName: 'com.example.dto',
    dtoType: 'RECORD',
    useLombok: false,
    useLombokBuilder: false,
    useJsonProperty: true,
    useJakartaValidation: false,
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

  it('should generate Lombok class when useLombok is checked under CLASS mode', () => {
    const json = JSON.stringify({
      name: 'John',
      age: 30,
    });

    const lombokConfig: ConverterConfig = {
      ...defaultConfig,
      dtoType: 'CLASS',
      useLombok: true,
      useLombokBuilder: true,
    };

    const result = convertJsonToDto(json, lombokConfig);
    expect(result.code).toContain('@Data');
    expect(result.code).toContain('@Builder');
    expect(result.code).toContain('public class CustomerProfile');
    expect(result.code).toContain('private String name;');
    expect(result.code).toContain('private Integer age;');
  });

  it('should generate standard Java POJO class with getters and setters by default', () => {
    const json = JSON.stringify({
      name: 'John',
      age: 30,
      is_active: true,
    });

    const classConfig: ConverterConfig = {
      ...defaultConfig,
      dtoType: 'CLASS',
    };

    const result = convertJsonToDto(json, classConfig);
    expect(result.code).toContain('public class CustomerProfile');
    expect(result.code).toContain('private String name;');
    expect(result.code).toContain('private Integer age;');
    expect(result.code).toContain('private Boolean isActive;');
    expect(result.code).toContain('public String getName()');
    expect(result.code).toContain('public void setName(String name)');
    expect(result.code).toContain('public Boolean isIsActive()');
    expect(result.code).toContain('public CustomerProfile()');
    expect(result.code).toContain('public CustomerProfile(String name, Integer age, Boolean isActive)');
  });

  it('should omit JsonProperty and its import when useJsonProperty is false', () => {
    const json = JSON.stringify({
      user_name: 'alice',
      score: 95,
    });

    const noJsonPropertyConfig: ConverterConfig = {
      ...defaultConfig,
      dtoType: 'CLASS',
      useJsonProperty: false,
    };

    const result = convertJsonToDto(json, noJsonPropertyConfig);
    expect(result.code).not.toContain('import com.fasterxml.jackson.annotation.JsonProperty;');
    expect(result.code).not.toContain('@JsonProperty');
    expect(result.code).toContain('private String userName;');
    expect(result.code).toContain('private Integer score;');
  });

  it('should generate multiple separate files for nested objects (1 class per file)', () => {
    const json = JSON.stringify({
      order_id: 101,
      customer: {
        id: 1,
        name: 'Bob',
      },
      shipping_address: {
        city: 'Bandung',
        zip_code: '40115',
      },
    });

    const result = convertJsonToDto(json, {
      ...defaultConfig,
      rootClassName: 'OrderDto',
    });

    // 1 root (OrderDto) + 2 nested (Customer, ShippingAddress) = 3 separate files
    expect(result.files.length).toBe(3);
    const filenames = result.files.map((f) => f.filename);
    expect(filenames).toContain('Customer.java');
    expect(filenames).toContain('ShippingAddress.java');
    expect(filenames).toContain('OrderDto.java');

    // Verify each file has only its own public top-level class/record
    const customerFile = result.files.find((f) => f.filename === 'Customer.java')!;
    expect(customerFile.code).toContain('public record Customer(');
    expect(customerFile.code).not.toContain('OrderDto');

    const orderFile = result.files.find((f) => f.filename === 'OrderDto.java')!;
    expect(orderFile.code).toContain('public record OrderDto(');
    expect(orderFile.code).toContain('Customer customer');
    expect(orderFile.code).toContain('ShippingAddress shippingAddress');
  });
});
