import { isTouchDevice } from "@/lib/mobileDevices/mobileDevices";
import type { syncfusionColumnDef } from "@/lib/types/types";
import { maxMoney } from "@/lib/validation/constants";
import { createMoneyEdit } from "@/lib/syncfusionTools";
import { isMoneyValueValid } from "@/lib/validation/validation";

export const divPfEntryIdColName = "id";
export const divPfEntryPositionColName = "position";
export const divPfEntryAmountColName = "amount";
export const divPfEntryPercentColName = "percentage";

const moneyValidationRules = (label: string, min = 0, max = maxMoney) => ({
  moneyRange: [
    (args: { value: unknown }) => isMoneyValueValid(args.value, min, max),
    `${label} must be between ${min} and ${max}`,
  ],
});

export const createDivPfColumns = (
  onHandleMoneyCellChange?: () => void
): syncfusionColumnDef[] => {

  const isTouch = isTouchDevice();

  const posColWidth = isTouch ? "100" : "100";
  const amountWidth = isTouch ? "110" : "110";
  const percentColWidth = isTouch ? "80" : "80";

  const divPfColumns: syncfusionColumnDef[] = [
    {
      field: "id",
      headerText: "ID",      
      isPrimaryKey: true,
      visible: false,
    },
    {
      field: divPfEntryPositionColName,
      headerText: "Pos",
      width: posColWidth,
      textAlign: "Center",
      allowEditing: false,
    },
    {
      field: divPfEntryAmountColName,
      headerText: "Amount",
      width: amountWidth,
      textAlign: "Right",
      format: "C2",
      allowEditing: true,
      editType: "numericEdit",
      edit: createMoneyEdit({
        onCommit: onHandleMoneyCellChange,
        feeLabel: "Amount",
        min: 1,
        max: maxMoney
      }),
      validationRules: moneyValidationRules("Amount", 0, maxMoney),      
    },
    {
      field: divPfEntryPercentColName,
      headerText: "Percent",
      width: percentColWidth,
      textAlign: "Right",

      allowEditing: false,
      editType: "numericEdit",
      format: "p2",
      type: "number",
    },
  ]

  return divPfColumns;
}