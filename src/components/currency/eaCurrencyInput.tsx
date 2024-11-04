import React from 'react';
import CurrencyInput, { CurrencyInputProps } from '@/lib/currency';
import { IntlConfig } from "@/lib/currency/components/CurrencyInputProps";
import { getLocaleConfig } from "@/lib/currency/components/utils";
import { formatValueSymbSep2Dec } from '@/lib/currency/formatValue';
import {
  zeroAmount,
  maxMoney,
  minFee,
} from "@/lib/validation";

interface EaCurrencyInputProps extends CurrencyInputProps {
  placeholder?: string;
  allowDecimals?: boolean;
  allowNegativeValue?: boolean;
  decimalsLimit?: number;
  decimalScale?: number;
  disableAbbreviations?: boolean;
  max?: number,
  min?: number,
  maxLength?: number,
}

interface EaPercentInputProps extends CurrencyInputProps {
  placeholder?: string;
  allowDecimals?: boolean;
  allowNegativeValue?: boolean;
  decimalsLimit?: number;
  decimalScale?: number;
  disableAbbreviations?: boolean;
  max?: number,
  min?: number,
  maxLength?: number,
}

const ic: IntlConfig = {
  // locale: window.navigator.language,
  locale: 'en-US'
};
const localConfig = getLocaleConfig(ic);
localConfig.prefix = "$";
const percentConfig = getLocaleConfig(ic);
percentConfig.prefix = "";
percentConfig.suffix = "%";

export const minMoneyText = formatValueSymbSep2Dec(zeroAmount.toString(), localConfig);
export const minFeeText = formatValueSymbSep2Dec(minFee.toString(), localConfig);
export const maxMoneyText = formatValueSymbSep2Dec(maxMoney.toString(), localConfig);

const EaCurrencyInput: React.FC<EaCurrencyInputProps> = (props) => {
  //  const ic: IntlConfig = {
  //   // locale: window.navigator.language,
  //   locale: 'en-US'
  // };
  // const localConfig = getLocaleConfig(ic);
  // localConfig.prefix = "$";
  const amountPlaceHolder = formatValueSymbSep2Dec('0', localConfig);  
  const decimals = 2
  const maxNumLength = 9
  // Define default values for the additional props
  const {
    allowDecimals = true,
    allowNegativeValue = false,
    decimalsLimit = decimals,
    decimalScale = decimals,
    disableAbbreviations = true,
    max = maxMoney,
    maxLength = maxNumLength,
    min = zeroAmount,
    placeholder = amountPlaceHolder,
    prefix = localConfig.prefix,    
    suffix = localConfig.suffix,
    ...otherProps
  } = props;

  // Merge the default values with the user-supplied props
  const mergedProps: CurrencyInputProps = {
    allowDecimals,
    allowNegativeValue,
    decimalsLimit,
    decimalScale,
    disableAbbreviations,
    max,
    maxLength,
    min,
    placeholder,
    prefix,
    suffix,
    ...otherProps,
  };

  return <CurrencyInput {...mergedProps} />;
};

const EaPercentInput: React.FC<EaPercentInputProps> = (props) => {
  //  const ic: IntlConfig = {
  //   // locale: window.navigator.language,
  //   locale: 'en-US'
  // };
  // const localConfig = getLocaleConfig(ic);
  // localConfig.prefix = "$";  
  const amountPlaceHolder = formatValueSymbSep2Dec('0', percentConfig);  
  const decimals = 2
  const maxNumLength = 9
  // Define default values for the additional props
  const {
    allowDecimals = true,
    allowNegativeValue = false,
    decimalsLimit = decimals,
    decimalScale = decimals,
    disableAbbreviations = true,
    max = maxMoney,
    maxLength = maxNumLength,
    min = zeroAmount,
    placeholder = amountPlaceHolder,
    prefix = percentConfig.prefix,    
    suffix = percentConfig.suffix,
    ...otherProps
  } = props;

  // Merge the default values with the user-supplied props
  const mergedProps: CurrencyInputProps = {
    allowDecimals,
    allowNegativeValue,
    decimalsLimit,
    decimalScale,
    disableAbbreviations,
    max,
    maxLength,
    min,
    placeholder,
    prefix,
    suffix,
    ...otherProps,
  };

  return <CurrencyInput {...mergedProps} />;
};

export default EaCurrencyInput;
export { EaPercentInput };
