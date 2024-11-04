import { IntlConfig } from "@/lib/currency/components/CurrencyInputProps";
import { getLocaleConfig } from "@/lib/currency/components/utils";

const ic: IntlConfig = {
  // locale: window.navigator.language,
  locale: 'en-US'
};
const initLocalConfig = getLocaleConfig(ic);
initLocalConfig.prefix = "$";

export const localConfig = initLocalConfig;
const charsToRenove = localConfig.currencySymbol + localConfig.prefix + localConfig.suffix + localConfig.groupSeparator
export const currRexEx = new RegExp('[' + charsToRenove + ']', 'g');
