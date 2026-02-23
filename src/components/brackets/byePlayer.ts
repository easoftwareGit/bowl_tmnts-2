import { initPlayer } from "@/lib/db/initVals"
import { playerType } from "@/lib/types/types"
import { btDbUuid } from "@/lib/uuid"

export const createByePlayer = (squadId: string): playerType => { 
  return {
    ...initPlayer,
    id: btDbUuid('bye'),
    squad_id: squadId,
    first_name: "Bye",
    last_name: null as any,
    average: 0,
    lane: null as any,
    position: null as any
  }
}