import { getSquadEntriesSQL, exportedForTesting } from "@/app/api/squads/entries/getSql";
import { mockCurData } from "../../../mocks/tmnts/playerEntries/mockOneSquadEntries";
import { cloneDeep } from "lodash";
import { getSquadOneBrktsAndSeedsSQL } from "@/app/api/squads/oneBrkts/getSql";

const { getDivAndHdcpSQL, getPotsSQL, getBrktsSQL, getElimsSQL } = exportedForTesting;

describe('getSql', () => { 

  describe('getDivAndHdcpSQL', () => { 

    it('should return div and hdcp sql string', () => { 

      const divHdcpSql = getDivAndHdcpSQL(mockCurData);
      const expected =
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8' THEN public."Div_Entry".fee END) AS div_578834e04e5e4885bbae79229d8b96e8_fee, ` + 
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8' THEN ` +
        `FLOOR(GREATEST(0, public."Div".hdcp_from - public."Player".average) * public."Div".hdcp_per)::INTEGER END) AS div_578834e04e5e4885bbae79229d8b96e8_hdcp, ` +
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_fe72ab97edf8407186c8e6df7f7fb741' THEN public."Div_Entry".fee END) AS div_fe72ab97edf8407186c8e6df7f7fb741_fee, ` +
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_fe72ab97edf8407186c8e6df7f7fb741' THEN ` +
        `FLOOR(GREATEST(0, public."Div".hdcp_from - public."Player".average) * public."Div".hdcp_per)::INTEGER END) AS div_fe72ab97edf8407186c8e6df7f7fb741_hdcp, `;
      expect(divHdcpSql).toBe(expected);
    })
    it('should return empty string if no divs', () => { 
      const noDivs = cloneDeep(mockCurData);
      noDivs.divs = [];
      const divHdcpSql = getDivAndHdcpSQL(noDivs);
      expect(divHdcpSql).toBe('');      
    })
    it('should return empty string if divs is null', () => { 
      const noDivs = cloneDeep(mockCurData);
      noDivs.divs = null as any;
      const divHdcpSql = getDivAndHdcpSQL(noDivs);
      expect(divHdcpSql).toBe('');      
    })
    it('should return empty string if passed null', () => { 
      const divHdcpSql = getDivAndHdcpSQL(null as any);
      expect(divHdcpSql).toBe('');      
    })
  })

  describe('getPotsSQL', () => { 

    it('should return pots sql string', () => { 
      const potsSql = getPotsSQL(mockCurData);
      const expected =
        `MAX(CASE WHEN public."Pot".id = 'pot_791fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_791fb6d8a9a04cb4b3372e212da2a3b0_fee, ` +
        `MAX(CASE WHEN public."Pot".id = 'pot_781fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_781fb6d8a9a04cb4b3372e212da2a3b0_fee, ` +
        `MAX(CASE WHEN public."Pot".id = 'pot_771fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_771fb6d8a9a04cb4b3372e212da2a3b0_fee, ` +
        `MAX(CASE WHEN public."Pot".id = 'pot_761fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_761fb6d8a9a04cb4b3372e212da2a3b0_fee, `;
      expect(potsSql).toBe(expected);
    })
    it('should return empty string if no pots', () => { 
      const noPots = cloneDeep(mockCurData);
      noPots.pots = [];
      const potsSql = getPotsSQL(noPots);
      expect(potsSql).toBe('');      
    })
    it('should return empty string if pots is null', () => { 
      const noPots = cloneDeep(mockCurData);
      noPots.pots = null as any;
      const potsSql = getPotsSQL(noPots);
      expect(potsSql).toBe('');      
    })
    it('should return empty string if passed null', () => { 
      const potsSql = getPotsSQL(null as any);
      expect(potsSql).toBe('');      
    })
  })

  describe('getBrktsSQL', () => { 

    it('should return brackets sql string', () => { 
      const brktsSql = getBrktsSQL(mockCurData);
      const expected =
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d017ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d017ea07dbc6453a8a705f4bb7599ed4_num_brackets, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d017ea07dbc6453a8a705f4bb7599ed4' ` +
        `THEN public."Brkt".fee * public."Brkt_Entry".num_brackets END) AS brk_d017ea07dbc6453a8a705f4bb7599ed4_fee, ` +

        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d027ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d027ea07dbc6453a8a705f4bb7599ed4_num_brackets, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d027ea07dbc6453a8a705f4bb7599ed4' ` +
        `THEN public."Brkt".fee * public."Brkt_Entry".num_brackets END) AS brk_d027ea07dbc6453a8a705f4bb7599ed4_fee, ` +

        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d037ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d037ea07dbc6453a8a705f4bb7599ed4_num_brackets, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d037ea07dbc6453a8a705f4bb7599ed4' ` +
        `THEN public."Brkt".fee * public."Brkt_Entry".num_brackets END) AS brk_d037ea07dbc6453a8a705f4bb7599ed4_fee, ` +

        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d047ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d047ea07dbc6453a8a705f4bb7599ed4_num_brackets, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d047ea07dbc6453a8a705f4bb7599ed4' ` +
        `THEN public."Brkt".fee * public."Brkt_Entry".num_brackets END) AS brk_d047ea07dbc6453a8a705f4bb7599ed4_fee, `;
      expect(brktsSql).toBe(expected);
    })
    it('should return empty string if no brackets', () => { 
      const noBrkts = cloneDeep(mockCurData);
      noBrkts.brkts = [];
      const brktsSql = getBrktsSQL(noBrkts);
      expect(brktsSql).toBe('');      
    })
    it('should return empty string if brackets is null', () => { 
      const noBrkts = cloneDeep(mockCurData);
      noBrkts.brkts = null as any;
      const brktsSql = getBrktsSQL(noBrkts);
      expect(brktsSql).toBe('');      
    })
    it('should return empty string if passed null', () => { 
      const brktsSql = getBrktsSQL(null as any);
      expect(brktsSql).toBe('');      
    })
  })

  describe('getElimsSQL', () => { 

    it('should return elim sql string', () => { 
      const elimSql = getElimsSQL(mockCurData);
      const expected =
        `MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c01077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c01077494c2d4d9da166d697c08c28d2_fee, ` +
        `MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c02077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c02077494c2d4d9da166d697c08c28d2_fee, ` +
        `MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c03077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c03077494c2d4d9da166d697c08c28d2_fee, ` +
        `MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c04077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c04077494c2d4d9da166d697c08c28d2_fee, `;
      expect(elimSql).toBe(expected);
    })
    it('should return empty string if no elim', () => {
      const noElims = cloneDeep(mockCurData);
      noElims.elims = [];
      const elimSql = getElimsSQL(noElims);
      expect(elimSql).toBe('');
    })
    it('should return empty string if elim is null', () => {
      const noElims = cloneDeep(mockCurData);
      noElims.elims = null as any;
      const elimSql = getElimsSQL(noElims);
      expect(elimSql).toBe('');
    })
    it('should return empty string if passed null', () => {
      const elimSql = getElimsSQL(null as any);
      expect(elimSql).toBe('');
    })
  })
  
  describe('getSquadEntriesSQL', () => { 
    it('should return squad entries SQL string', () => { 
      const squadEntriesSql = getSquadEntriesSQL(mockCurData);
      const expected =
        `SELECT ` + 
        `public."Player".id AS player_id, ` +
        `public."Player".first_name, ` +
        `public."Player".last_name, ` +
        `public."Player".average, ` +
        `public."Player".lane, ` +
        `public."Player".position, ` +

        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8' THEN public."Div_Entry".fee END) AS div_578834e04e5e4885bbae79229d8b96e8_fee, ` + 
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8' THEN ` +
        `FLOOR(GREATEST(0, public."Div".hdcp_from - public."Player".average) * public."Div".hdcp_per)::INTEGER END) AS div_578834e04e5e4885bbae79229d8b96e8_hdcp, ` +
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_fe72ab97edf8407186c8e6df7f7fb741' THEN public."Div_Entry".fee END) AS div_fe72ab97edf8407186c8e6df7f7fb741_fee, ` +
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_fe72ab97edf8407186c8e6df7f7fb741' THEN ` +
        `FLOOR(GREATEST(0, public."Div".hdcp_from - public."Player".average) * public."Div".hdcp_per)::INTEGER END) AS div_fe72ab97edf8407186c8e6df7f7fb741_hdcp, ` +

        `MAX(CASE WHEN public."Pot".id = 'pot_791fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_791fb6d8a9a04cb4b3372e212da2a3b0_fee, ` +
        `MAX(CASE WHEN public."Pot".id = 'pot_781fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_781fb6d8a9a04cb4b3372e212da2a3b0_fee, ` +
        `MAX(CASE WHEN public."Pot".id = 'pot_771fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_771fb6d8a9a04cb4b3372e212da2a3b0_fee, ` +
        `MAX(CASE WHEN public."Pot".id = 'pot_761fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_761fb6d8a9a04cb4b3372e212da2a3b0_fee, ` +

        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d017ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d017ea07dbc6453a8a705f4bb7599ed4_num_brackets, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d017ea07dbc6453a8a705f4bb7599ed4' ` +
        `THEN public."Brkt".fee * public."Brkt_Entry".num_brackets END) AS brk_d017ea07dbc6453a8a705f4bb7599ed4_fee, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d027ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d027ea07dbc6453a8a705f4bb7599ed4_num_brackets, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d027ea07dbc6453a8a705f4bb7599ed4' ` +
        `THEN public."Brkt".fee * public."Brkt_Entry".num_brackets END) AS brk_d027ea07dbc6453a8a705f4bb7599ed4_fee, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d037ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d037ea07dbc6453a8a705f4bb7599ed4_num_brackets, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d037ea07dbc6453a8a705f4bb7599ed4' ` +
        `THEN public."Brkt".fee * public."Brkt_Entry".num_brackets END) AS brk_d037ea07dbc6453a8a705f4bb7599ed4_fee, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d047ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d047ea07dbc6453a8a705f4bb7599ed4_num_brackets, ` +  
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d047ea07dbc6453a8a705f4bb7599ed4' ` +
        `THEN public."Brkt".fee * public."Brkt_Entry".num_brackets END) AS brk_d047ea07dbc6453a8a705f4bb7599ed4_fee, ` +
      
        `MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c01077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c01077494c2d4d9da166d697c08c28d2_fee, ` +
        `MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c02077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c02077494c2d4d9da166d697c08c28d2_fee, ` +
        `MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c03077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c03077494c2d4d9da166d697c08c28d2_fee, ` +
        `MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c04077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c04077494c2d4d9da166d697c08c28d2_fee ` +
          
        `FROM public."Player" ` +
        `LEFT JOIN public."Div_Entry" ON public."Player".id = public."Div_Entry".player_id ` +
        `LEFT JOIN public."Div" ON public."Div_Entry".div_id = public."Div".id ` +
        `LEFT JOIN public."Pot_Entry" ON public."Player".id = public."Pot_Entry".player_id ` +
        `LEFT JOIN public."Pot" ON public."Pot_Entry".pot_id = public."Pot".id ` +
        `LEFT JOIN public."Brkt_Entry" ON public."Player".id = public."Brkt_Entry".player_id ` +
        `LEFT JOIN public."Brkt" ON public."Brkt_Entry".brkt_id = public."Brkt".id ` +
        `LEFT JOIN public."Elim_Entry" ON public."Player".id = public."Elim_Entry".player_id ` +
        `LEFT JOIN public."Elim" ON public."Elim_Entry".elim_id = public."Elim".id ` +        
        `JOIN public."Event" ON public."Div".tmnt_id = public."Event".tmnt_id ` +
        `JOIN public."Squad" ON public."Event".id = public."Squad".event_id ` + 
        
        `WHERE public."Squad".id = 'sqd_3397da1adc014cf58c44e07c19914f71' ` +        
        `GROUP BY public."Player".id, public."Player".first_name, public."Player".last_name, public."Player".average, public."Player".lane, public."Player".position ` +
        `ORDER BY public."Player".lane, public."Player".position;`;

      expect(squadEntriesSql).toBe(expected);
    });
    it('should return squad entries SQL string without pots', () => { 
      const noPots = cloneDeep(mockCurData);
      noPots.pots = [];
      const squadEntriesSql = getSquadEntriesSQL(noPots);      
      const expected =
        `SELECT ` + 
        `public."Player".id AS player_id, ` +
        `public."Player".first_name, ` +
        `public."Player".last_name, ` +
        `public."Player".average, ` +
        `public."Player".lane, ` +
        `public."Player".position, ` +

        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8' THEN public."Div_Entry".fee END) AS div_578834e04e5e4885bbae79229d8b96e8_fee, ` + 
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8' THEN ` +
        `FLOOR(GREATEST(0, public."Div".hdcp_from - public."Player".average) * public."Div".hdcp_per)::INTEGER END) AS div_578834e04e5e4885bbae79229d8b96e8_hdcp, ` +
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_fe72ab97edf8407186c8e6df7f7fb741' THEN public."Div_Entry".fee END) AS div_fe72ab97edf8407186c8e6df7f7fb741_fee, ` +
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_fe72ab97edf8407186c8e6df7f7fb741' THEN ` +
        `FLOOR(GREATEST(0, public."Div".hdcp_from - public."Player".average) * public."Div".hdcp_per)::INTEGER END) AS div_fe72ab97edf8407186c8e6df7f7fb741_hdcp, ` +

        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d017ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d017ea07dbc6453a8a705f4bb7599ed4_num_brackets, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d017ea07dbc6453a8a705f4bb7599ed4' ` +
        `THEN public."Brkt".fee * public."Brkt_Entry".num_brackets END) AS brk_d017ea07dbc6453a8a705f4bb7599ed4_fee, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d027ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d027ea07dbc6453a8a705f4bb7599ed4_num_brackets, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d027ea07dbc6453a8a705f4bb7599ed4' ` +
        `THEN public."Brkt".fee * public."Brkt_Entry".num_brackets END) AS brk_d027ea07dbc6453a8a705f4bb7599ed4_fee, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d037ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d037ea07dbc6453a8a705f4bb7599ed4_num_brackets, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d037ea07dbc6453a8a705f4bb7599ed4' ` +
        `THEN public."Brkt".fee * public."Brkt_Entry".num_brackets END) AS brk_d037ea07dbc6453a8a705f4bb7599ed4_fee, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d047ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d047ea07dbc6453a8a705f4bb7599ed4_num_brackets, ` +  
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d047ea07dbc6453a8a705f4bb7599ed4' ` +
        `THEN public."Brkt".fee * public."Brkt_Entry".num_brackets END) AS brk_d047ea07dbc6453a8a705f4bb7599ed4_fee, ` +
      
        `MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c01077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c01077494c2d4d9da166d697c08c28d2_fee, ` +
        `MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c02077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c02077494c2d4d9da166d697c08c28d2_fee, ` +
        `MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c03077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c03077494c2d4d9da166d697c08c28d2_fee, ` +
        `MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c04077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c04077494c2d4d9da166d697c08c28d2_fee ` +

        `FROM public."Player" ` +
        `LEFT JOIN public."Div_Entry" ON public."Player".id = public."Div_Entry".player_id ` +
        `LEFT JOIN public."Div" ON public."Div_Entry".div_id = public."Div".id ` +
        `LEFT JOIN public."Pot_Entry" ON public."Player".id = public."Pot_Entry".player_id ` +
        `LEFT JOIN public."Pot" ON public."Pot_Entry".pot_id = public."Pot".id ` +
        `LEFT JOIN public."Brkt_Entry" ON public."Player".id = public."Brkt_Entry".player_id ` +
        `LEFT JOIN public."Brkt" ON public."Brkt_Entry".brkt_id = public."Brkt".id ` +
        `LEFT JOIN public."Elim_Entry" ON public."Player".id = public."Elim_Entry".player_id ` +
        `LEFT JOIN public."Elim" ON public."Elim_Entry".elim_id = public."Elim".id ` +        
        `JOIN public."Event" ON public."Div".tmnt_id = public."Event".tmnt_id ` +
        `JOIN public."Squad" ON public."Event".id = public."Squad".event_id ` +        

        `WHERE public."Squad".id = 'sqd_3397da1adc014cf58c44e07c19914f71' ` +        
        `GROUP BY public."Player".id, public."Player".first_name, public."Player".last_name, public."Player".average, public."Player".lane, public."Player".position ` +
        `ORDER BY public."Player".lane, public."Player".position;`;

      expect(squadEntriesSql).toBe(expected);
    });
    it('should return squad entries SQL string without brackets', () => { 
      const noBrkts = cloneDeep(mockCurData);
      noBrkts.brkts = [];
      const squadEntriesSql = getSquadEntriesSQL(noBrkts);      
      const expected =
        `SELECT ` + 
        `public."Player".id AS player_id, ` +
        `public."Player".first_name, ` +
        `public."Player".last_name, ` +
        `public."Player".average, ` +
        `public."Player".lane, ` +
        `public."Player".position, ` +

        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8' THEN public."Div_Entry".fee END) AS div_578834e04e5e4885bbae79229d8b96e8_fee, ` + 
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8' THEN ` +
        `FLOOR(GREATEST(0, public."Div".hdcp_from - public."Player".average) * public."Div".hdcp_per)::INTEGER END) AS div_578834e04e5e4885bbae79229d8b96e8_hdcp, ` +
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_fe72ab97edf8407186c8e6df7f7fb741' THEN public."Div_Entry".fee END) AS div_fe72ab97edf8407186c8e6df7f7fb741_fee, ` +
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_fe72ab97edf8407186c8e6df7f7fb741' THEN ` +
        `FLOOR(GREATEST(0, public."Div".hdcp_from - public."Player".average) * public."Div".hdcp_per)::INTEGER END) AS div_fe72ab97edf8407186c8e6df7f7fb741_hdcp, ` +

        `MAX(CASE WHEN public."Pot".id = 'pot_791fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_791fb6d8a9a04cb4b3372e212da2a3b0_fee, ` +
        `MAX(CASE WHEN public."Pot".id = 'pot_781fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_781fb6d8a9a04cb4b3372e212da2a3b0_fee, ` +
        `MAX(CASE WHEN public."Pot".id = 'pot_771fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_771fb6d8a9a04cb4b3372e212da2a3b0_fee, ` +
        `MAX(CASE WHEN public."Pot".id = 'pot_761fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_761fb6d8a9a04cb4b3372e212da2a3b0_fee, ` +

        `MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c01077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c01077494c2d4d9da166d697c08c28d2_fee, ` +
        `MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c02077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c02077494c2d4d9da166d697c08c28d2_fee, ` +
        `MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c03077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c03077494c2d4d9da166d697c08c28d2_fee, ` +
        `MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c04077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c04077494c2d4d9da166d697c08c28d2_fee ` +

        `FROM public."Player" ` +
        `LEFT JOIN public."Div_Entry" ON public."Player".id = public."Div_Entry".player_id ` +
        `LEFT JOIN public."Div" ON public."Div_Entry".div_id = public."Div".id ` +
        `LEFT JOIN public."Pot_Entry" ON public."Player".id = public."Pot_Entry".player_id ` +
        `LEFT JOIN public."Pot" ON public."Pot_Entry".pot_id = public."Pot".id ` +
        `LEFT JOIN public."Brkt_Entry" ON public."Player".id = public."Brkt_Entry".player_id ` +
        `LEFT JOIN public."Brkt" ON public."Brkt_Entry".brkt_id = public."Brkt".id ` +
        `LEFT JOIN public."Elim_Entry" ON public."Player".id = public."Elim_Entry".player_id ` +
        `LEFT JOIN public."Elim" ON public."Elim_Entry".elim_id = public."Elim".id ` +        
        `JOIN public."Event" ON public."Div".tmnt_id = public."Event".tmnt_id ` +
        `JOIN public."Squad" ON public."Event".id = public."Squad".event_id ` +        

        `WHERE public."Squad".id = 'sqd_3397da1adc014cf58c44e07c19914f71' ` +        
        `GROUP BY public."Player".id, public."Player".first_name, public."Player".last_name, public."Player".average, public."Player".lane, public."Player".position ` +
        `ORDER BY public."Player".lane, public."Player".position;`;

      expect(squadEntriesSql).toBe(expected);
    });    
    it('should return squad entries SQL string without elims', () => { 
      const noElims = cloneDeep(mockCurData);
      noElims.elims = [];
      const squadEntriesSql = getSquadEntriesSQL(noElims);      
      const expected =
        `SELECT ` + 
        `public."Player".id AS player_id, ` +
        `public."Player".first_name, ` +
        `public."Player".last_name, ` +
        `public."Player".average, ` +
        `public."Player".lane, ` +
        `public."Player".position, ` +

        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8' THEN public."Div_Entry".fee END) AS div_578834e04e5e4885bbae79229d8b96e8_fee, ` + 
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8' THEN ` +
        `FLOOR(GREATEST(0, public."Div".hdcp_from - public."Player".average) * public."Div".hdcp_per)::INTEGER END) AS div_578834e04e5e4885bbae79229d8b96e8_hdcp, ` +
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_fe72ab97edf8407186c8e6df7f7fb741' THEN public."Div_Entry".fee END) AS div_fe72ab97edf8407186c8e6df7f7fb741_fee, ` +
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_fe72ab97edf8407186c8e6df7f7fb741' THEN ` +
        `FLOOR(GREATEST(0, public."Div".hdcp_from - public."Player".average) * public."Div".hdcp_per)::INTEGER END) AS div_fe72ab97edf8407186c8e6df7f7fb741_hdcp, ` +

        `MAX(CASE WHEN public."Pot".id = 'pot_791fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_791fb6d8a9a04cb4b3372e212da2a3b0_fee, ` +
        `MAX(CASE WHEN public."Pot".id = 'pot_781fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_781fb6d8a9a04cb4b3372e212da2a3b0_fee, ` +
        `MAX(CASE WHEN public."Pot".id = 'pot_771fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_771fb6d8a9a04cb4b3372e212da2a3b0_fee, ` +
        `MAX(CASE WHEN public."Pot".id = 'pot_761fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_761fb6d8a9a04cb4b3372e212da2a3b0_fee, ` +

        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d017ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d017ea07dbc6453a8a705f4bb7599ed4_num_brackets, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d017ea07dbc6453a8a705f4bb7599ed4' ` +
        `THEN public."Brkt".fee * public."Brkt_Entry".num_brackets END) AS brk_d017ea07dbc6453a8a705f4bb7599ed4_fee, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d027ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d027ea07dbc6453a8a705f4bb7599ed4_num_brackets, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d027ea07dbc6453a8a705f4bb7599ed4' ` +
        `THEN public."Brkt".fee * public."Brkt_Entry".num_brackets END) AS brk_d027ea07dbc6453a8a705f4bb7599ed4_fee, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d037ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d037ea07dbc6453a8a705f4bb7599ed4_num_brackets, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d037ea07dbc6453a8a705f4bb7599ed4' ` +
        `THEN public."Brkt".fee * public."Brkt_Entry".num_brackets END) AS brk_d037ea07dbc6453a8a705f4bb7599ed4_fee, ` +
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d047ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d047ea07dbc6453a8a705f4bb7599ed4_num_brackets, ` +  
        `MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d047ea07dbc6453a8a705f4bb7599ed4' ` +
        `THEN public."Brkt".fee * public."Brkt_Entry".num_brackets END) AS brk_d047ea07dbc6453a8a705f4bb7599ed4_fee ` +

        `FROM public."Player" ` +
        `LEFT JOIN public."Div_Entry" ON public."Player".id = public."Div_Entry".player_id ` +
        `LEFT JOIN public."Div" ON public."Div_Entry".div_id = public."Div".id ` +
        `LEFT JOIN public."Pot_Entry" ON public."Player".id = public."Pot_Entry".player_id ` +
        `LEFT JOIN public."Pot" ON public."Pot_Entry".pot_id = public."Pot".id ` +
        `LEFT JOIN public."Brkt_Entry" ON public."Player".id = public."Brkt_Entry".player_id ` +
        `LEFT JOIN public."Brkt" ON public."Brkt_Entry".brkt_id = public."Brkt".id ` +
        `LEFT JOIN public."Elim_Entry" ON public."Player".id = public."Elim_Entry".player_id ` +
        `LEFT JOIN public."Elim" ON public."Elim_Entry".elim_id = public."Elim".id ` +        
        `JOIN public."Event" ON public."Div".tmnt_id = public."Event".tmnt_id ` +
        `JOIN public."Squad" ON public."Event".id = public."Squad".event_id ` +        

        `WHERE public."Squad".id = 'sqd_3397da1adc014cf58c44e07c19914f71' ` +        
        `GROUP BY public."Player".id, public."Player".first_name, public."Player".last_name, public."Player".average, public."Player".lane, public."Player".position ` +
        `ORDER BY public."Player".lane, public."Player".position;`;

      expect(squadEntriesSql).toBe(expected);
    });
    it('should return squad entries SQL string with just div and hdcp', () => { 
      const justDiv = cloneDeep(mockCurData);
      justDiv.pots = [];
      justDiv.brkts = [];
      justDiv.elims = [];
      const squadEntriesSql = getSquadEntriesSQL(justDiv);      
      const expected =
        `SELECT ` + 
        `public."Player".id AS player_id, ` +
        `public."Player".first_name, ` +
        `public."Player".last_name, ` +
        `public."Player".average, ` +
        `public."Player".lane, ` +
        `public."Player".position, ` +
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8' THEN public."Div_Entry".fee END) AS div_578834e04e5e4885bbae79229d8b96e8_fee, ` + 
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8' THEN ` +
        `FLOOR(GREATEST(0, public."Div".hdcp_from - public."Player".average) * public."Div".hdcp_per)::INTEGER END) AS div_578834e04e5e4885bbae79229d8b96e8_hdcp, ` +
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_fe72ab97edf8407186c8e6df7f7fb741' THEN public."Div_Entry".fee END) AS div_fe72ab97edf8407186c8e6df7f7fb741_fee, ` +
        `MAX(CASE WHEN public."Div_Entry".div_id = 'div_fe72ab97edf8407186c8e6df7f7fb741' THEN ` +
        `FLOOR(GREATEST(0, public."Div".hdcp_from - public."Player".average) * public."Div".hdcp_per)::INTEGER END) AS div_fe72ab97edf8407186c8e6df7f7fb741_hdcp ` +
        `FROM public."Player" ` +
        `LEFT JOIN public."Div_Entry" ON public."Player".id = public."Div_Entry".player_id ` +
        `LEFT JOIN public."Div" ON public."Div_Entry".div_id = public."Div".id ` +
        `LEFT JOIN public."Pot_Entry" ON public."Player".id = public."Pot_Entry".player_id ` +
        `LEFT JOIN public."Pot" ON public."Pot_Entry".pot_id = public."Pot".id ` +
        `LEFT JOIN public."Brkt_Entry" ON public."Player".id = public."Brkt_Entry".player_id ` +
        `LEFT JOIN public."Brkt" ON public."Brkt_Entry".brkt_id = public."Brkt".id ` +
        `LEFT JOIN public."Elim_Entry" ON public."Player".id = public."Elim_Entry".player_id ` +
        `LEFT JOIN public."Elim" ON public."Elim_Entry".elim_id = public."Elim".id ` +        
        `JOIN public."Event" ON public."Div".tmnt_id = public."Event".tmnt_id ` +
        `JOIN public."Squad" ON public."Event".id = public."Squad".event_id ` +        
        `WHERE public."Squad".id = 'sqd_3397da1adc014cf58c44e07c19914f71' ` +        
        `GROUP BY public."Player".id, public."Player".first_name, public."Player".last_name, public."Player".average, public."Player".lane, public."Player".position ` +
        `ORDER BY public."Player".lane, public."Player".position;`;

      expect(squadEntriesSql).toBe(expected);
    });
    it('should return empty string if invalid squad id', () => {
      const invalidSquad = cloneDeep(mockCurData);
      invalidSquad.squads[0].id = 'test';
      const squadEntriesSql = getSquadEntriesSQL(invalidSquad);
      expect(squadEntriesSql).toBe('');
    });
    it('should return empty string if valid id, but not a squad id', () => {
      const invalidSquad = cloneDeep(mockCurData);
      invalidSquad.squads[0].id = invalidSquad.events[0].id;
      const squadEntriesSql = getSquadEntriesSQL(invalidSquad);
      expect(squadEntriesSql).toBe('');
    });
    it('should return empty string if no squads', () => {
      const invalidSquad = cloneDeep(mockCurData);
      invalidSquad.squads = [];
      const squadEntriesSql = getSquadEntriesSQL(invalidSquad);
      expect(squadEntriesSql).toBe('');
    });
    it('should return empty string if squads is null', () => {
      const invalidSquad = cloneDeep(mockCurData);
      invalidSquad.squads = null as any;
      const squadEntriesSql = getSquadEntriesSQL(invalidSquad);
      expect(squadEntriesSql).toBe('');
    });
    it('should return empty string if passed null', () => {      
      const squadEntriesSql = getSquadEntriesSQL(null as any);
      expect(squadEntriesSql).toBe('');
    });
  });

  describe('getSquadOneBrktsAndSeedsSQL', () => { 
    it("should return correct sql for a squads's one brkts and seeds", () => {
      const oneBrktsAndSeedsSql = getSquadOneBrktsAndSeedsSQL(mockCurData.squads[0].id);
      const expected = 
        `SELECT ` +
        `public."One_Brkt".id as one_brkt_id, ` + 
        `public."One_Brkt".brkt_id, ` +
        `public."One_Brkt".bindex, ` + 
        `public."Brkt_Seed".seed, ` +
        `public."Brkt_Seed".player_id ` +
        `FROM public."One_Brkt" ` +
        `INNER JOIN public."Brkt_Seed" ON "Brkt_Seed".one_brkt_id = "One_Brkt".id ` + 
        `INNER JOIN public."Brkt" ON "Brkt".id = "One_Brkt".brkt_id ` +
        `WHERE "squad_id" = '${mockCurData.squads[0].id}' ` +
        `ORDER BY brkt_id, bindex, one_brkt_id, seed`;
      expect(oneBrktsAndSeedsSql).toBe(expected);
    });
    it('should return empty string if invalid squad id', () => {
      const oneBrktsAndSeedsSql = getSquadOneBrktsAndSeedsSQL('test');
      expect(oneBrktsAndSeedsSql).toBe('');
    });
    it('should return empty string if a valid id, not not a squad id', () => {      
      const userId = "usr_01234567890123456789012345678901";
      const oneBrktsAndSeedsSql = getSquadOneBrktsAndSeedsSQL(userId);
      expect(oneBrktsAndSeedsSql).toBe('');
    })

  })
})