import { IntlConfig } from "@/lib/currency/components/CurrencyInputProps";
import { getLocaleConfig } from "@/lib/currency/components/utils";
import { mockBrkts, mockDivs, mockElims, mockEvents, mockLanes, mockPots, mockSquads, mockTmnt } from "../../../mocks/tmnts/newTmnt/mockNewTmnt";
import { deleteAllTmntElims, getAllElimsForTmnt } from "@/lib/db/elims/elimsAxios";
import { deleteAllTmntBrkts, getAllBrktsForTmnt } from "@/lib/db/brkts/brktsAxios";
import { deleteAllTmntPots, getAllPotsForTmnt } from "@/lib/db/pots/potsAxios";
import { deleteAllTmntLanes, getAllLanesForTmnt } from "@/lib/db/lanes/lanesAxios";
import { deleteAllTmntSquads, getAllSquadsForTmnt } from "@/lib/db/squads/squadsAxios";
import { deleteAllTmntDivs, getAllDivsForTmnt } from "@/lib/db/divs/divsAxios";
import { deleteAllTmntEvents, getAllEventsForTmnt } from "@/lib/db/events/eventsAxios";
import { deleteTmnt, getTmnt } from "@/lib/db/tmnts/tmntsAxios";
import { blankDataOneTmnt } from "@/lib/db/initVals";
import { dataOneTmntType, ioDataErrorsType, allDataOneTmntType } from "@/lib/types/types";
import { saveAllDataOneTmnt } from "@/lib/db/oneTmnt/oneTmnt";
import { compareAsc } from "date-fns";
import 'core-js/actual/structured-clone';

// before running this test, run the following commands in the terminal:
// 1) clear and re-seed the database
//    a) clear the database
//       npx prisma db push --force-reset
//    b) re-seed
//       npx prisma db seed
//    if just need to re-seed, then only need step 1b
// 2) make sure the server is running
//    in the VS activity bar,
//      a) click on "Run and Debug" (Ctrl+Shift+D)
//      b) at the top of the window, click on the drop-down arrow
//      c) select "Node.js: debug server-side"
//      d) directly to the left of the drop down select, click the green play button
//         This will start the server in debug mode.

describe('Save New Tmnt', () => {

  const ic: IntlConfig = {
    // locale: window.navigator.language,
    locale: 'en-US'
  };  
  const localConfig = getLocaleConfig(ic);
  localConfig.prefix = "$";  
  
  describe('save new tmnt', () => { 

    beforeAll(async () => {
      // cleanup any existing tmnts
      await deleteAllTmntElims(mockTmnt.id);
      await deleteAllTmntBrkts(mockTmnt.id);
      await deleteAllTmntPots(mockTmnt.id);
      await deleteAllTmntLanes(mockTmnt.id);
      await deleteAllTmntSquads(mockTmnt.id);
      await deleteAllTmntDivs(mockTmnt.id);
      await deleteAllTmntEvents(mockTmnt.id);
      await deleteTmnt(mockTmnt.id);
    })

    afterEach(async () => {
      await deleteAllTmntElims(mockTmnt.id);
      await deleteAllTmntBrkts(mockTmnt.id);
      await deleteAllTmntPots(mockTmnt.id);
      await deleteAllTmntLanes(mockTmnt.id);
      await deleteAllTmntSquads(mockTmnt.id);
      await deleteAllTmntDivs(mockTmnt.id);
      await deleteAllTmntEvents(mockTmnt.id);
      await deleteTmnt(mockTmnt.id);
    })

    const origData = blankDataOneTmnt();
    // const origData = structuredClone(initDataOneTmnt);
    const curData: dataOneTmntType = {
      tmnt: mockTmnt,
      events: mockEvents,
      divs: mockDivs,
      squads: mockSquads,
      lanes: mockLanes,
      pots: mockPots,
      brkts: mockBrkts,
      elims: mockElims,
    } 
    const allTmntData: allDataOneTmntType = {
      origData,
      curData,
    }

    it('saves new tmnt', async () => {       

      const savedError = await saveAllDataOneTmnt(allTmntData);
      expect(savedError).toBe(ioDataErrorsType.None);

      const gotTmntData = await getTmnt(mockTmnt.id);
      expect(gotTmntData).not.toBeNull();
      if (!gotTmntData) return;
      expect(gotTmntData.id).toBe(mockTmnt.id);
      expect(gotTmntData.tmnt_name).toBe(mockTmnt.tmnt_name);
      expect(compareAsc(gotTmntData.start_date, mockTmnt.start_date)).toBe(0);
      expect(compareAsc(gotTmntData.end_date, mockTmnt.end_date)).toBe(0);

      const gotEvents = await getAllEventsForTmnt(mockTmnt.id);
      expect(gotEvents).not.toBeNull();
      if (!gotEvents) return;
      expect(gotEvents.length).toBe(mockEvents.length);
      expect(gotEvents[0].id).toBe(mockEvents[0].id);
      expect(gotEvents[0].tmnt_id).toBe(mockEvents[0].tmnt_id);
      expect(gotEvents[0].event_name).toBe(mockEvents[0].event_name);
      expect(gotEvents[0].team_size).toBe(mockEvents[0].team_size);
      expect(gotEvents[0].games).toBe(mockEvents[0].games);
      expect(gotEvents[0].entry_fee).toBe(mockEvents[0].entry_fee);
      expect(gotEvents[0].lineage).toBe(mockEvents[0].lineage);
      expect(gotEvents[0].prize_fund).toBe(mockEvents[0].prize_fund);
      expect(gotEvents[0].other).toBe(mockEvents[0].other);
      expect(gotEvents[0].expenses).toBe(mockEvents[0].expenses);
      expect(gotEvents[0].added_money).toBe(mockEvents[0].added_money);
      expect(gotEvents[0].lpox).toBe(mockEvents[0].lpox);
      expect(gotEvents[0].sort_order).toBe(mockEvents[0].sort_order);
      
      const gotDivs = await getAllDivsForTmnt(mockTmnt.id);
      expect(gotDivs).not.toBeNull();
      if (!gotDivs) return;
      expect(gotDivs.length).toBe(mockDivs.length);
      for (let i = 0; i < gotDivs.length; i++) {
        expect(gotDivs[i].id).toBe(mockDivs[i].id);
        expect(gotDivs[i].tmnt_id).toBe(mockDivs[i].tmnt_id);
        expect(gotDivs[i].div_name).toBe(mockDivs[i].div_name);
        expect(gotDivs[i].hdcp_per).toBe(mockDivs[i].hdcp_per);
        expect(gotDivs[i].hdcp_from).toBe(mockDivs[i].hdcp_from);
        expect(gotDivs[i].int_hdcp).toBe(mockDivs[i].int_hdcp);
        expect(gotDivs[i].hdcp_for).toBe(mockDivs[i].hdcp_for);
        expect(gotDivs[i].sort_order).toBe(mockDivs[i].sort_order);
      }

      const gotSquads = await getAllSquadsForTmnt(mockTmnt.id);
      expect(gotSquads).not.toBeNull();
      if (!gotSquads) return;
      expect(gotSquads.length).toBe(mockSquads.length);
      for (let i = 0; i < gotSquads.length; i++) {
        expect(gotSquads[i].id).toBe(mockSquads[i].id);
        expect(gotSquads[i].event_id).toBe(mockSquads[i].event_id);
        expect(gotSquads[i].squad_name).toBe(mockSquads[i].squad_name);
        expect(gotSquads[i].games).toBe(mockSquads[i].games);
        expect(gotSquads[i].starting_lane).toBe(mockSquads[i].starting_lane);
        expect(gotSquads[i].lane_count).toBe(mockSquads[i].lane_count);
        expect(compareAsc(gotSquads[i].squad_date, mockSquads[i].squad_date)).toBe(0);
        expect(gotSquads[i].squad_time).toBe(mockSquads[i].squad_time);        
        expect(gotSquads[i].sort_order).toBe(mockSquads[i].sort_order);
      }

      const gotLanes = await getAllLanesForTmnt(mockTmnt.id);
      expect(gotLanes).not.toBeNull();
      if (!gotLanes) return;
      expect(gotLanes.length).toBe(mockLanes.length);
      for (let i = 0; i < gotLanes.length; i++) {
        expect(gotLanes[i].id).toBe(mockLanes[i].id);
        expect(gotLanes[i].squad_id).toBe(mockLanes[i].squad_id);
        expect(gotLanes[i].lane_number).toBe(mockLanes[i].lane_number);
        expect(gotLanes[i].in_use).toBe(mockLanes[i].in_use);
      }

      const gotPots = await getAllPotsForTmnt(mockTmnt.id);
      expect(gotPots).not.toBeNull();
      if (!gotPots) return;
      expect(gotPots.length).toBe(mockPots.length);
      for (let i = 0; i < gotPots.length; i++) {
        expect(gotPots[i].id).toBe(mockPots[i].id);
        expect(gotPots[i].squad_id).toBe(mockPots[i].squad_id);
        expect(gotPots[i].div_id).toBe(mockPots[i].div_id);
        expect(gotPots[i].pot_type).toBe(mockPots[i].pot_type);
        expect(gotPots[i].fee).toBe(mockPots[i].fee);
        expect(gotPots[i].sort_order).toBe(mockPots[i].sort_order);
      }

      const gotBrkts = await getAllBrktsForTmnt(mockTmnt.id);
      expect(gotBrkts).not.toBeNull();
      if (!gotBrkts) return;
      expect(gotBrkts.length).toBe(mockBrkts.length);
      for (let i = 0; i < gotBrkts.length; i++) {
        expect(gotBrkts[i].id).toBe(mockBrkts[i].id);
        expect(gotBrkts[i].squad_id).toBe(mockBrkts[i].squad_id);
        expect(gotBrkts[i].div_id).toBe(mockBrkts[i].div_id);  
        expect(gotBrkts[i].start).toBe(mockBrkts[i].start);
        expect(gotBrkts[i].games).toBe(mockBrkts[i].games);
        expect(gotBrkts[i].players).toBe(mockBrkts[i].players);
        expect(gotBrkts[i].fee).toBe(mockBrkts[i].fee);
        expect(gotBrkts[i].first).toBe(mockBrkts[i].first);
        expect(gotBrkts[i].second).toBe(mockBrkts[i].second);
        expect(gotBrkts[i].admin).toBe(mockBrkts[i].admin);
        expect(gotBrkts[i].fsa).toBe(mockBrkts[i].fsa);
        expect(gotBrkts[i].sort_order).toBe(mockBrkts[i].sort_order);
      }

      const gotElims = await getAllElimsForTmnt(mockTmnt.id);
      expect(gotElims).not.toBeNull();
      if (!gotElims) return;
      expect(gotElims.length).toBe(mockElims.length);
      for (let i = 0; i < gotElims.length; i++) {
        expect(gotElims[i].id).toBe(mockElims[i].id);
        expect(gotElims[i].squad_id).toBe(mockElims[i].squad_id);
        expect(gotElims[i].div_id).toBe(mockElims[i].div_id);  
        expect(gotElims[i].start).toBe(mockElims[i].start);
        expect(gotElims[i].games).toBe(mockElims[i].games);        
        expect(gotElims[i].fee).toBe(mockElims[i].fee);
        expect(gotElims[i].sort_order).toBe(mockElims[i].sort_order);
      }
    })
    it('should save when tmnt has no pots', async () => {
      const noPotsTmnt = structuredClone(allTmntData);
      noPotsTmnt.curData.pots = [];
      const savedError = await saveAllDataOneTmnt(noPotsTmnt);
      expect(savedError).toBe(ioDataErrorsType.None);
    })
    it('should save when tmnt has no brkts', async () => {
      const noBrktsTmnt = structuredClone(allTmntData);
      noBrktsTmnt.curData.brkts = [];
      const savedError = await saveAllDataOneTmnt(noBrktsTmnt);
      expect(savedError).toBe(ioDataErrorsType.None);
    })
    it('should save when tmnt has no elims', async () => {
      const noElimsTmnt = structuredClone(allTmntData);
      noElimsTmnt.curData.elims = [];
      const savedError = await saveAllDataOneTmnt(noElimsTmnt);
      expect(savedError).toBe(ioDataErrorsType.None);
    })
    it('should save when tmnt has no pots, brkts or elims', async () => {
      const noExtrasTmnt = structuredClone(allTmntData);
      noExtrasTmnt.curData.pots = [];
      noExtrasTmnt.curData.brkts = [];
      noExtrasTmnt.curData.elims = [];
      const savedError = await saveAllDataOneTmnt(noExtrasTmnt);
      expect(savedError).toBe(ioDataErrorsType.None);
    })
    it('should not save when tmnt have invalid tmnt data', async () => {
      const invalidTmnt = structuredClone(allTmntData);
      invalidTmnt.curData.tmnt.tmnt_name = '';

      const savedError = await saveAllDataOneTmnt(invalidTmnt);
      expect(savedError).toBe(ioDataErrorsType.Tmnt);
      
      const gotTmntData = await getTmnt(mockTmnt.id);
      expect(gotTmntData).toBeNull();
      const gotEvents = await getAllEventsForTmnt(mockTmnt.id);
      expect(gotEvents).toHaveLength(0);
      const gotDivs = await getAllDivsForTmnt(mockTmnt.id);
      expect(gotDivs).toHaveLength(0);
      const gotSquads = await getAllSquadsForTmnt(mockTmnt.id);
      expect(gotSquads).toHaveLength(0);
      const gotLanes = await getAllLanesForTmnt(mockTmnt.id);
      expect(gotLanes).toHaveLength(0);
      const gotPots = await getAllPotsForTmnt(mockTmnt.id);
      expect(gotPots).toHaveLength(0);
      const gotBrkts = await getAllBrktsForTmnt(mockTmnt.id);
      expect(gotBrkts).toHaveLength(0);
      const gotElims = await getAllElimsForTmnt(mockTmnt.id);
      expect(gotElims).toHaveLength(0);
    })
    it('should not save when tmnt have invalid event data', async () => {
      const invalidTmnt = structuredClone(allTmntData);
      invalidTmnt.curData.events[0].event_name = '';

      const savedError = await saveAllDataOneTmnt(invalidTmnt);
      expect(savedError).toBe(ioDataErrorsType.Events);
      
      const gotTmntData = await getTmnt(mockTmnt.id);
      expect(gotTmntData).toBeNull();
      const gotEvents = await getAllEventsForTmnt(mockTmnt.id);
      expect(gotEvents).toHaveLength(0);
      const gotDivs = await getAllDivsForTmnt(mockTmnt.id);
      expect(gotDivs).toHaveLength(0);
      const gotSquads = await getAllSquadsForTmnt(mockTmnt.id);
      expect(gotSquads).toHaveLength(0);
      const gotLanes = await getAllLanesForTmnt(mockTmnt.id);
      expect(gotLanes).toHaveLength(0);
      const gotPots = await getAllPotsForTmnt(mockTmnt.id);
      expect(gotPots).toHaveLength(0);
      const gotBrkts = await getAllBrktsForTmnt(mockTmnt.id);
      expect(gotBrkts).toHaveLength(0);
      const gotElims = await getAllElimsForTmnt(mockTmnt.id);
      expect(gotElims).toHaveLength(0);
    })
    it('should not save when tmnt have invalid div data', async () => {
      const invalidTmnt = structuredClone(allTmntData);
      invalidTmnt.curData.divs[0].div_name = '';

      const savedError = await saveAllDataOneTmnt(invalidTmnt);
      expect(savedError).toBe(ioDataErrorsType.Divs);
      
      const gotTmntData = await getTmnt(mockTmnt.id);
      expect(gotTmntData).toBeNull();
      const gotEvents = await getAllEventsForTmnt(mockTmnt.id);
      expect(gotEvents).toHaveLength(0);
      const gotDivs = await getAllDivsForTmnt(mockTmnt.id);
      expect(gotDivs).toHaveLength(0);
      const gotSquads = await getAllSquadsForTmnt(mockTmnt.id);
      expect(gotSquads).toHaveLength(0);
      const gotLanes = await getAllLanesForTmnt(mockTmnt.id);
      expect(gotLanes).toHaveLength(0);
      const gotPots = await getAllPotsForTmnt(mockTmnt.id);
      expect(gotPots).toHaveLength(0);
      const gotBrkts = await getAllBrktsForTmnt(mockTmnt.id);
      expect(gotBrkts).toHaveLength(0);
      const gotElims = await getAllElimsForTmnt(mockTmnt.id);
      expect(gotElims).toHaveLength(0);
    })
    it('should not save when tmnt have invalid squad data', async () => {
      const invalidTmnt = structuredClone(allTmntData);
      invalidTmnt.curData.squads[0].squad_name = '';

      const savedError = await saveAllDataOneTmnt(invalidTmnt);
      expect(savedError).toBe(ioDataErrorsType.Squads);
      
      const gotTmntData = await getTmnt(mockTmnt.id);
      expect(gotTmntData).toBeNull();
      const gotEvents = await getAllEventsForTmnt(mockTmnt.id);
      expect(gotEvents).toHaveLength(0);
      const gotDivs = await getAllDivsForTmnt(mockTmnt.id);
      expect(gotDivs).toHaveLength(0);
      const gotSquads = await getAllSquadsForTmnt(mockTmnt.id);
      expect(gotSquads).toHaveLength(0);
      const gotLanes = await getAllLanesForTmnt(mockTmnt.id);
      expect(gotLanes).toHaveLength(0);
      const gotPots = await getAllPotsForTmnt(mockTmnt.id);
      expect(gotPots).toHaveLength(0);
      const gotBrkts = await getAllBrktsForTmnt(mockTmnt.id);
      expect(gotBrkts).toHaveLength(0);
      const gotElims = await getAllElimsForTmnt(mockTmnt.id);
      expect(gotElims).toHaveLength(0);
    })
    it('should not save when tmnt have invalid lanes data', async () => {
      const invalidTmnt = structuredClone(allTmntData);
      invalidTmnt.curData.lanes[0].lane_number = 1234;

      const savedError = await saveAllDataOneTmnt(invalidTmnt);
      expect(savedError).toBe(ioDataErrorsType.Lanes);
      
      const gotTmntData = await getTmnt(mockTmnt.id);
      expect(gotTmntData).toBeNull();
      const gotEvents = await getAllEventsForTmnt(mockTmnt.id);
      expect(gotEvents).toHaveLength(0);
      const gotDivs = await getAllDivsForTmnt(mockTmnt.id);
      expect(gotDivs).toHaveLength(0);
      const gotSquads = await getAllSquadsForTmnt(mockTmnt.id);
      expect(gotSquads).toHaveLength(0);
      const gotLanes = await getAllLanesForTmnt(mockTmnt.id);
      expect(gotLanes).toHaveLength(0);
      const gotPots = await getAllPotsForTmnt(mockTmnt.id);
      expect(gotPots).toHaveLength(0);
      const gotBrkts = await getAllBrktsForTmnt(mockTmnt.id);
      expect(gotBrkts).toHaveLength(0);
      const gotElims = await getAllElimsForTmnt(mockTmnt.id);
      expect(gotElims).toHaveLength(0);
    })
    it('should not save when tmnt have invalid pots data', async () => {
      const invalidTmnt = structuredClone(allTmntData);
      invalidTmnt.curData.pots[0].fee = '0';

      const savedError = await saveAllDataOneTmnt(invalidTmnt);
      expect(savedError).toBe(ioDataErrorsType.Pots);
      
      const gotTmntData = await getTmnt(mockTmnt.id);
      expect(gotTmntData).toBeNull();
      const gotEvents = await getAllEventsForTmnt(mockTmnt.id);
      expect(gotEvents).toHaveLength(0);
      const gotDivs = await getAllDivsForTmnt(mockTmnt.id);
      expect(gotDivs).toHaveLength(0);
      const gotSquads = await getAllSquadsForTmnt(mockTmnt.id);
      expect(gotSquads).toHaveLength(0);
      const gotLanes = await getAllLanesForTmnt(mockTmnt.id);
      expect(gotLanes).toHaveLength(0);
      const gotPots = await getAllPotsForTmnt(mockTmnt.id);
      expect(gotPots).toHaveLength(0);
      const gotBrkts = await getAllBrktsForTmnt(mockTmnt.id);
      expect(gotBrkts).toHaveLength(0);
      const gotElims = await getAllElimsForTmnt(mockTmnt.id);
      expect(gotElims).toHaveLength(0);
    })
    it('should not save when tmnt have invalid brackets data', async () => {
      const invalidTmnt = structuredClone(allTmntData);
      invalidTmnt.curData.brkts[0].fee = '0';

      const savedError = await saveAllDataOneTmnt(invalidTmnt);
      expect(savedError).toBe(ioDataErrorsType.Brkts);
      
      const gotTmntData = await getTmnt(mockTmnt.id);
      expect(gotTmntData).toBeNull();
      const gotEvents = await getAllEventsForTmnt(mockTmnt.id);
      expect(gotEvents).toHaveLength(0);
      const gotDivs = await getAllDivsForTmnt(mockTmnt.id);
      expect(gotDivs).toHaveLength(0);
      const gotSquads = await getAllSquadsForTmnt(mockTmnt.id);
      expect(gotSquads).toHaveLength(0);
      const gotLanes = await getAllLanesForTmnt(mockTmnt.id);
      expect(gotLanes).toHaveLength(0);
      const gotPots = await getAllPotsForTmnt(mockTmnt.id);
      expect(gotPots).toHaveLength(0);
      const gotBrkts = await getAllBrktsForTmnt(mockTmnt.id);
      expect(gotBrkts).toHaveLength(0);
      const gotElims = await getAllElimsForTmnt(mockTmnt.id);
      expect(gotElims).toHaveLength(0);
    })
    it('should not save when tmnt have invalid elims data', async () => {
      const invalidTmnt = structuredClone(allTmntData);
      invalidTmnt.curData.elims[0].fee = '0';

      const savedError = await saveAllDataOneTmnt(invalidTmnt);
      expect(savedError).toBe(ioDataErrorsType.Elims);
      
      const gotTmntData = await getTmnt(mockTmnt.id);
      expect(gotTmntData).toBeNull();
      const gotEvents = await getAllEventsForTmnt(mockTmnt.id);
      expect(gotEvents).toHaveLength(0);
      const gotDivs = await getAllDivsForTmnt(mockTmnt.id);
      expect(gotDivs).toHaveLength(0);
      const gotSquads = await getAllSquadsForTmnt(mockTmnt.id);
      expect(gotSquads).toHaveLength(0);
      const gotLanes = await getAllLanesForTmnt(mockTmnt.id);
      expect(gotLanes).toHaveLength(0);
      const gotPots = await getAllPotsForTmnt(mockTmnt.id);
      expect(gotPots).toHaveLength(0);
      const gotBrkts = await getAllBrktsForTmnt(mockTmnt.id);
      expect(gotBrkts).toHaveLength(0);
      const gotElims = await getAllElimsForTmnt(mockTmnt.id);
      expect(gotElims).toHaveLength(0);
    })

  })

})