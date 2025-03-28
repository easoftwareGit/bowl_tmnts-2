import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import allDataOneTmntReducer from './features/allDataOneTmnt/allDataOneTmntSlice';
import allEntriesOneSquadReducer from './features/allEntriesOneSquad/allEntriesOneSquadSlice';
import bowlsReducer from './features/bowls/bowlsSlice';
import oneDivGameResultsReducer from './features/oneDivGameResults/oneDivGameResultsSlice';
import oneTmntGameResultsReducer from './features/oneTmntGameResults/oneTmntGameResultsSlice';
import tmntsReducer from './features/tmnts/tmntsSlice';
import tmntYearsReducer from './features/tmnts/yearsSlice';
import userTmntsReducer from './features/userTmnts/userTmntsSlice';
import testdatesReducer from './features/testdates/testdatesSlice';

// create the store, include reduces in object
export const store = configureStore({
  reducer: {
    allDataOneTmnt: allDataOneTmntReducer,
    allEntriesOneSquad: allEntriesOneSquadReducer,
    bowls: bowlsReducer,
    oneDivGameResults: oneDivGameResultsReducer,
    oneTmntGameResults: oneTmntGameResultsReducer,
    tmnts: tmntsReducer,
    tmntYears: tmntYearsReducer,
    userTmnts: userTmntsReducer,
    testdates: testdatesReducer,
  }
});

// export types for TypeScript
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;

// export useAppSelector, so can use it instead of useSelector
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector