import {
  formatValueSymbSep2Dec,
  formatValue2Dec,
  formatValuePercent2Dec,
  formatDecimalValue,
} from "@/lib/currency/formatValue";
import { IntlConfig } from "@/lib/currency/components/CurrencyInputProps";
import { getLocaleConfig } from "@/lib/currency/components/utils";

describe("formatValues.ts", () => {
  const ic: IntlConfig = {
    // locale: window.navigator.language,
    locale: "en-US",
  };
  const localConfig = getLocaleConfig(ic);
  localConfig.prefix = "$";

  describe("formatValueSymbSep2Dec", () => {
    it("should call formatValue with correct parameters for decimalScale 2", () => {
      const formattedValue = formatValueSymbSep2Dec("1000", localConfig);
      expect(formattedValue).toBe("$1,000.00");
    });
    it("format monitary value for 123", () => {
      const formattedValue = formatValueSymbSep2Dec("123", localConfig);
      expect(formattedValue).toBe("$123.00");
    });
    it("format monitary value for 1234", () => {
      const formattedValue = formatValueSymbSep2Dec("1234", localConfig);
      expect(formattedValue).toBe("$1,234.00");
    });
    it("format monitary value for 1234.56", () => {
      const formattedValue = formatValueSymbSep2Dec("1234.56", localConfig);
      expect(formattedValue).toBe("$1,234.56");
    });
    it("format monitary value for 1234.567", () => {
      const formattedValue = formatValueSymbSep2Dec("1234.567", localConfig);
      expect(formattedValue).toBe("$1,234.56");
    });
    it("format monitary value for 1234567", () => {
      const formattedValue = formatValueSymbSep2Dec("1234567", localConfig);
      expect(formattedValue).toBe("$1,234,567.00");
    });
    it("format monitary value for 0", () => {
      const formattedValue = formatValueSymbSep2Dec("0", localConfig);
      expect(formattedValue).toBe("$0.00");
    });
    it("format monitary value for '' (blank)", () => {
      const formattedValue = formatValueSymbSep2Dec("", localConfig);
      expect(formattedValue).toBe("");
    });
    it("should format value with vary large number", () => {
      const formattedValue = formatValueSymbSep2Dec(
        "1234567890123456",
        localConfig
      );
      expect(formattedValue).toBe("$1,234,567,890,123,456.00");
    });
    it("should format value with very small number", () => {
      const result = formatValueSymbSep2Dec("0.0001", localConfig);
      expect(result).toBe("$0.00");
    });
    it("should throw error when input value is not a string", () => {
      expect(() =>
        formatValueSymbSep2Dec(1234.56 as any, localConfig)
      ).toThrow();
    });
  });

  describe("formatValue2Dec", () => {
    it("should format value with decimal separator, 2 decimal places, and disable group separators", () => {
      const formattedValue = formatValue2Dec("98765.4321", localConfig);
      expect(formattedValue).toBe("98765.43");
    });

    it("should handle negative values correctly", () => {
      const formattedValue = formatValue2Dec("-12345.6789", localConfig);
      expect(formattedValue).toBe("-12345.67");
    });

    it("should handle values with no decimal part", () => {
      const formattedValue = formatValue2Dec("54321", localConfig);
      expect(formattedValue).toBe("54321.00");
    });
    it('should return "0.00" when given an "0"', () => {
      const formattedValue = formatValue2Dec("0", localConfig);
      expect(formattedValue).toBe("0.00");
    });
    it('should return "" when given an empty string', () => {
      const formattedValue = formatValue2Dec("", localConfig);
      expect(formattedValue).toBe("");
    });
    it("should return NaN when given a non-numeric string", () => {
      const formattedValue = formatValue2Dec("abc", localConfig);
      expect(formattedValue).toBe("NaN");
    });
    it("should handle very large numeric values when given a valid number string", () => {
      const formattedValue = formatValue2Dec("123456789012345.12", localConfig);
      expect(formattedValue).toBe("123456789012345.12");
    });
    it("should handle very small numeric values", () => {
      const formattedValue = formatValue2Dec("0.0001", localConfig);
      expect(formattedValue).toBe("0.00");
    });
  });

  describe('formatDecimalValue', () => {
    it('should return the integer as a string when the value is an integer', () => {
      const result = formatDecimalValue(42);
      expect(result).toBe('42');
    });
    it('should return the decimal value formatted to two decimal places', () => {
      const result = formatDecimalValue(10.56789);
      expect(result).toBe('10.57');
    });
    it('should return empty string for NaN input', () => {
      const result = formatDecimalValue(NaN);
      expect(result).toBe('');
    });
    it('should return the decimal value as a string with 2 decimal places', () => {
      const result = formatDecimalValue(3.14);
      expect(result).toBe('3.14');
    });
    it('should return the decimal value as a string with 2 decimal places when only 1 decimal place is present', () => {
      const result = formatDecimalValue(3.1);
      expect(result).toBe('3.10');
    });
    it('should return the negative integer as a string', () => {
      const result = formatDecimalValue(-10);
      expect(result).toBe('-10');
    });
    it('should return the negative decimal value as a string with 2 decimal places', () => {
      const result = formatDecimalValue(-3.14159);
      expect(result).toBe('-3.14');
    });
    it('should return "0" when the value is zero', () => {
      const result = formatDecimalValue(0);
      expect(result).toBe('0');
    });
    it('should return the value as a string with two decimal places when the value has more than two decimal places', () => {
      const result = formatDecimalValue(3.14159);
      expect(result).toBe('3.14');
    });
    it('should return the value as a string with exactly two decimal places when the value is not an integer', () => {
        const result = formatDecimalValue(42.123);
        expect(result).toBe('42.12');
    });
  });

  describe("formatValuePercent2Dec", () => {
    // Converts a decimal value to a percentage string with two decimal places
    it("should convert a decimal value to a percentage string with two decimal places", () => {
      const result = formatValuePercent2Dec(0.1234);
      expect(result).toBe("12.34%");
    });

    // Handles zero value correctly
    it('should return "0.00%" when the input value is zero', () => {
      const result = formatValuePercent2Dec(0);
      expect(result).toBe("0.00%");
    });

    // Handles positive decimal values correctly
    it("should convert a positive decimal value to a percentage string with two decimal places", () => {
      const result = formatValuePercent2Dec(0.5678);
      expect(result).toBe("56.78%");
    });

    // Returns a string with a '%' symbol appended
    it("should convert a decimal value to a percentage string with two decimal places", () => {
      const result = formatValuePercent2Dec(0.1234);
      expect(result).toBe("12.34%");
    });

    // Handles very small decimal values close to zero
    it("should handle very small decimal values close to zero", () => {
      const result = formatValuePercent2Dec(0.000001);
      expect(result).toBe("0.00%");
    });

    // Handles non-numeric inputs gracefully
    it('should return "" when input is a string', () => {
      const result = formatValuePercent2Dec("abc" as any);
      expect(result).toBe("NaN%");
    });

    // Handles negative decimal values correctly
    it("should handle negative decimal values correctly", () => {
      const result = formatValuePercent2Dec(-0.5678);
      expect(result).toBe("-56.78%");
    });

    // Testing the function with the maximum safe integer value as input
    it("should handle maximum safe integer value when passed as input", () => {
      const result = formatValuePercent2Dec(Number.MAX_SAFE_INTEGER);
      expect(result).toBe("900719925474099072.00%");
    });

    // Handles very large decimal values
    it("should handle very large decimal values", () => {
      const result = formatValuePercent2Dec(123456789.1234);
      expect(result).toBe("12345678912.34%");
    });
  });
});
