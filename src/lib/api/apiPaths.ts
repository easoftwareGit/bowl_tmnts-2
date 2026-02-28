import { baseApi } from "@/lib/api/baseApi";

export const baseUsersApi = baseApi + '/users'

export const baseRegisterApi = baseApi + '/auth/register'
export const baseNextAuthApi = baseApi + '/auth/[...nextauth]'

export const baseBowlsApi = baseApi + '/bowls'

export const baseTmntsApi = baseApi + '/tmnts'

export const baseEventsApi = baseApi + '/events'

export const baseDivsApi = baseApi + '/divs'
export const baseDivEntriesApi = baseApi + '/divEntries'

export const baseSquadsApi = baseApi + '/squads'

export const baseStagesApi = baseApi + '/stages'

export const baseLanesApi = baseApi + '/lanes'

export const basePotsApi = baseApi + '/pots'
export const basePotEntriesApi = baseApi + '/potEntries'

export const baseBrktsApi = baseApi + '/brkts'
export const baseBrktEntriesApi = baseApi + '/brktEntries'
export const baseBrktRefundsApi = baseApi + '/brktRefunds'
export const brktSeedsApi = baseApi + '/brktSeeds'
export const baseOneBrktsApi = baseApi + '/oneBrkts'

export const baseElimsApi = baseApi + '/elims'
export const baseElimEntriesApi = baseApi + '/elimEntries'

export const basePlayersApi = baseApi + '/players'

export const baseGamesApi = baseApi + '/games'

export const baseResultsApi = baseApi + '/results'

export const baseBcryptApi = baseApi + '/bcrypt'