const testBaseHost = process.env.TEST_BASE_HOST
const testBaseRoot = process.env.TEST_BASE_ROOT
const testBasePort = process.env.TEST_BASE_PORT;
const testbaseOrigin = `${testBaseRoot}${testBaseHost}:${testBasePort}`

export const testBaseApi = testbaseOrigin + process.env.TEST_BASE_API  

export const testBaseUsersApi = testBaseApi + '/users'
export const testBaseRegisterApi = testBaseApi + '/auth/register'
export const testBaseNextAuthApi = testBaseApi + '/auth/[...nextauth]'

export const testBaseBowlsApi = testBaseApi + '/bowls'

export const testBaseTmntsApi = testBaseApi + '/tmnts'
export const testBaseTmntsResultsApi = testBaseApi + '/tmnts/results/'
export const testBaseTmntsUpcomingApi = testBaseApi + '/tmnts/upcoming'
export const testBaseTmntsYearsApi = testBaseApi + '/tmnts/years/'

export const testBaseEventsApi = testBaseApi + '/events'

export const testBaseDivsApi = testBaseApi + '/divs'

export const testBaseSquadsApi = testBaseApi + '/squads'

export const testBaseLanesApi = testBaseApi + '/lanes'

export const testBasePotsApi = testBaseApi + '/pots'

export const testBaseBrktsApi = testBaseApi + '/brkts'

export const testBaseElimsApi = testBaseApi + '/elims'


export const testPostSecret = process.env.TEST_POST_SECRET!