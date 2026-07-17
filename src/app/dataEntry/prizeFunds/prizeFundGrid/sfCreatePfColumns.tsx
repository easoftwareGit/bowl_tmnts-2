import { isTouchDevice } from "@/lib/mobileDevices/mobileDevices";
import type { syncfusionColumnDef } from "@/lib/types/types";
import { maxMoney } from "@/lib/validation/constants";
import { createMoneyEdit } from "@/lib/syncfusionTools";
import { isMoneyValueValid } from "@/lib/validation/validation";

export const pfEntryIdColName = "id";
export const pfEntryPositionColName = "position";
export const pfEntryAmountColName = "amount";
export const pfEntryPercentColName = "percentage";

const moneyValidationRules = (label: string, min = 0, max = maxMoney) => ({
  moneyRange: [
    (args: { value: unknown }) => isMoneyValueValid(args.value, min, max),
    `${label} must be between ${min} and ${max}`,
  ],
});

export const createPfColumns = (
  onHandleMoneyCellChange?: () => void
): syncfusionColumnDef[] => {

  const isTouch = isTouchDevice();

  const posColWidth = isTouch ? "100" : "100";
  const amountWidth = isTouch ? "110" : "110";
  const percentColWidth = isTouch ? "80" : "80";

  const pfColumns: syncfusionColumnDef[] = [
    {
      field: "id",
      headerText: "ID",      
      isPrimaryKey: true,
      visible: false,
    },
    {
      field: pfEntryPositionColName,
      headerText: "Pos",
      width: posColWidth,
      textAlign: "Center",
      allowEditing: false,
    },
    {
      field: pfEntryAmountColName,
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
      field: pfEntryPercentColName,
      headerText: "Percent",
      width: percentColWidth,
      textAlign: "Right",

      allowEditing: false,
      editType: "numericEdit",
      format: "p2",
      type: "number",
    },
  ]

  return pfColumns;
}