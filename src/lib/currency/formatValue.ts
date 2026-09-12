import { formatValue } from "@/lib/currency";
import { LocaleConfig } from "@/lib/currency/components/utils";

/**
 * formats a string value into a local formatted money string 
 * 
 * @param {string} value - value to format
 * @param {LocaleConfig} localeConfig - locale config object 
 * @returns a formatted money string with decimal separator, group separator and prefix/suffix
 */
export const formatValueSymbSep2Dec = (value: string, localeConfig: LocaleConfig): string => {
  return formatValue({
    value,
    groupSeparator: localeConfig.groupSeparator,
    decimalSeparator: localeConfig.decimalSeparator,
    prefix: localeConfig.prefix,
    suffix: localeConfig.suffix,
    decimalScale: 2,
    disableGroupSeparators: false,
  });
}

/**
 * * formats a string value into a local formatted money string - NO prefix/suffix
 * 
 * @param {string} value - value to format
 * @param {LocaleConfig} localeConfig - locale config object 
 * @returns a formatted money string with decimal separator, group separator NO prefix/suffix
 */
export const formatValue2Dec = (value: string, localeConfig: LocaleConfig): string => {  
  return formatValue({
    value,
    decimalSeparator: localeConfig.decimalSeparator,
    decimalScale: 2,
    disableGroupSeparators: true,
  });
}

export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

/**
 * formats a number value into a string with two decimal places
 * 
 * @param value {number} - value to be formatted
 * @returns { string } - formatted value
 */
export const formatDecimalValue = (value: number): string => { 
  if (Number.isNaN(value)) return '';
  return (Number.isInteger(value)) ? value.toString() : value.toFixed(2);  
}

/**
 * formats a number value into a percentage 
 * 
 * @param {number} value - value to format
 * @returns the value formatted as a percentage with tailing "%"
 */
export const formatValuePercent2Dec = (value: number): string => { 
  if (Number.isNaN(value)) return '';
  return (value * 100).toFixed(2) + '%';
}