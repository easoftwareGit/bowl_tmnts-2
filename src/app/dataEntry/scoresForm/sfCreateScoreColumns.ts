import { isTouchDevice } from "@/lib/mobileDevices/mobileDevices";
import { createOptionalIntegerEdit, isOptionalIntegerValid } from "@/lib/syncfusionTools";
import type { syncfusionColumnDef, SyncfusionValidationArgs, tmntFullType } from "@/lib/types/types";
import { maxScore } from "@/lib/validation/constants";

export const scoreEntryIdColName = "id";
export const scoreEntryPlayerIdColName = "player_id";
export const scoreEntryFirstNameColName = "first_name";
export const scoreEntryLastNameColName = "last_name";
export const scoreEntryLanePosColName = "lanePos";
export const scoreEntryTotalColName = "total";
export const scoreEntryPlusMinusColName = "plus_minus";
export const scoreEntryGameNumColName = "game_num";

export const gameScoreColName = (gameNum: number) => `game_${gameNum}`;
export const gameScoreColHeaderName = (gameNum: number) => `Gm ${gameNum}`;

export const createScoreColumns = (
  fullTmntData: tmntFullType,
  onAutoCommit?: () => void,
): syncfusionColumnDef[] => { 

  if (!fullTmntData ||
    !fullTmntData.divs || !Array.isArray(fullTmntData.divs) || !fullTmntData.divs[0] ||
    !fullTmntData.squads || !Array.isArray(fullTmntData.squads) || !fullTmntData.squads[0])
  { 
    return [];
  }

  const isTouch = isTouchDevice();

  const lanePosColWidth = isTouch ? "100" : "100";
  const nameWidth = isTouch ? "110" : "110";

  const gameColWidth = isTouch ? "80" : "80";
  const totalColWidth = isTouch ? "90" : "90";

  // let gotHdcpDivs = false;
  // for (let i = 0; i < fullTmntData.divs.length; i++) {
  //   if (fullTmntData.divs[i].hdcp_per > 0) {
  //     gotHdcpDivs = true;
  //     break;
  //   }
  // }

  const playersColumns: syncfusionColumnDef[] = [
    {
      field: "id",
      headerText: "ID",      
      isPrimaryKey: true,
      visible: false,      
    },
    {
      field: "first_name",
      headerText: "First Name",
      width: nameWidth,
      allowEditing: false,
      customAttributes: { class: "readonly-col" },
    },
    {
      field: "last_name",
      headerText: "Last Name",
      width: nameWidth,
      allowEditing: false,
      customAttributes: { class: "readonly-col" },
    },
    // {
    //   field: "average",
    //   headerText: "Avg",
    //   width: gameColWidth,
    //   allowEditing: false,
    //   customAttributes: { class: "readonly-col" },
    //   visible: gotHdcpDivs,
    // },
    // {
    //   field: "hdcp",
    //   headerText: "HDCP",
    //   width: gameColWidth,
    //   allowEditing: false,
    //   customAttributes: { class: "readonly-col" },
    //   visible: gotHdcpDivs,
    // },
    {
      field: "lanePos",
      headerText: "Lane-Pos",
      width: lanePosColWidth,
      textAlign: "Center",
      allowEditing: false,
      customAttributes: { class: "readonly-col" },
    },
  ];

  const gameColumns: syncfusionColumnDef[] = [];
  const numGames = fullTmntData?.squads?.[0]?.games ?? 0;
  for (let g = 1; g <= numGames; g++) { 
    gameColumns.push({
      field: gameScoreColName(g),
      headerText: `Gm ${g}`,
      width: gameColWidth,
      allowEditing: true,
      textAlign: "Right",
      type: "number",
      editType: "numericedit",
      edit: createOptionalIntegerEdit({
        placeholder: `Gm ${g}`,
        min: 0,
        max: maxScore,
        onAutoCommit,
      }),      
      validationRules: {
        scoreRangeRule: [
          (args: SyncfusionValidationArgs) => {
            const input = args.element as HTMLInputElement | undefined;
            const validateNow = input?.dataset.validateNow === "true";

            if (!validateNow) return true;                    

            return (isOptionalIntegerValid(args.value, 0, maxScore));
            
          },
          `Score must be an integer from 0 to ${maxScore}`,
        ],
      },          
    });
  }

  const totalColumns: syncfusionColumnDef[] = [
    // {
    //   field: TotalHdcpName,
    //   headerText: "Total HDCP",
    //   width: gameColWidth,
    //   allowEditing: false,
    //   visible: gotHdcpDivs,
    //   customAttributes: { class: "readonly-col" },      
    // },
    {
      field: scoreEntryTotalColName,
      headerText: "Total",
      width: totalColWidth,
      textAlign: "Right",
      type: "number",      
      allowEditing: false,      
      customAttributes: { class: "readonly-col" },
    },
    {
      field: scoreEntryPlusMinusColName,
      headerText: "   +/-",      
      width: gameColWidth,      
      allowEditing: false,   
      textAlign: "Right",      
      customAttributes: { class: "readonly-col" },
    }
    // {
    //   field: TotalPlusTotalHdcpName,
    //   headerText: "Total w/ HDCP",
    //   width: gameColWidth,
    //   allowEditing: false,
    //   visible: gotHdcpDivs,
    //   customAttributes: { class: "readonly-col" },
    // },
  ];

  return [...playersColumns, ...gameColumns, ...totalColumns];

}