import axios, { AxiosError } from "axios";
import { baseResultsApi  } from "@/lib/db/apiPaths";
import { testBaseResultsApi } from "../../../../../testApi";

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

const url = testBaseResultsApi.startsWith("undefined")
  ? baseResultsApi
  : testBaseResultsApi;  
const tmntUrl = url + "/games/tmnt/";

const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

describe('Results - API: /api/results/games/divs/:divId', () => { 

  describe('GET /api/results/games/divs/:divId', () => { 

    const tmntIdMultiDivs = 'tmt_fe8ac53dad0f400abe6354210a8f4cd1';
    const tmntIdOneDiv = 'tmt_fd99387c33d9c78aba290286576ddce5';

    it('should get game results for tmnt - multiple divs', async () => {
      const response = await axios.get(tmntUrl + tmntIdMultiDivs);
      const games = response.data.games;
      expect(games.length).toBe(6); // 3 players, 2 divs
      expect(games[0]).toHaveProperty('player_id');
      expect(games[0]).toHaveProperty('div_id');
      expect(games[0]).toHaveProperty('div_name');
      expect(games[0]).toHaveProperty('sort_order');
      expect(games[0]).toHaveProperty('full_name');
      expect(games[0]).toHaveProperty('average');
      expect(games[0]).toHaveProperty('hdcp');
      expect(games[0]).toHaveProperty('Game 1');
      expect(games[0]).toHaveProperty('Game 1 + Hdcp');
      expect(games[0]).toHaveProperty('Game 2');
      expect(games[0]).toHaveProperty('Game 2 + Hdcp');
      expect(games[0]).toHaveProperty('Game 3');
      expect(games[0]).toHaveProperty('Game 3 + Hdcp');
      expect(games[0]).toHaveProperty('Game 4');
      expect(games[0]).toHaveProperty('Game 4 + Hdcp');
      expect(games[0]).toHaveProperty('Game 5');
      expect(games[0]).toHaveProperty('Game 5 + Hdcp');
      expect(games[0]).toHaveProperty('Game 6');
      expect(games[0]).toHaveProperty('Game 6 + Hdcp');
      expect(games[0]).toHaveProperty('total');
      expect(games[0]).toHaveProperty('total + Hdcp');
      
      expect(Number.isInteger(games[0].hdcp)).toBe(true);
      expect(games[0]['Game 1 + Hdcp']).toBe(games[0]['Game 1'] + games[0].hdcp); 
      expect(games[0]['total + Hdcp']).toBe(games[0].total + (games[0].hdcp * 6));
    })
    it('should get all games for tmnt - one div', async () => { 
      const response = await axios.get(tmntUrl + tmntIdOneDiv);
      const games = response.data.games;
      expect(games.length).toBe(3); // 3 players 1 div
      expect(games[0]).toHaveProperty('player_id');
      expect(games[0]).toHaveProperty('div_id');
      expect(games[0]).toHaveProperty('div_name');
      expect(games[0]).toHaveProperty('sort_order');
      expect(games[0]).toHaveProperty('full_name');      
      expect(games[0]).toHaveProperty('average');
      expect(games[0]).toHaveProperty('hdcp');
      expect(games[0]).toHaveProperty('Game 1');
      expect(games[0]).toHaveProperty('Game 1 + Hdcp');
      expect(games[0]).toHaveProperty('Game 2');
      expect(games[0]).toHaveProperty('Game 2 + Hdcp');
      expect(games[0]).toHaveProperty('Game 3');
      expect(games[0]).toHaveProperty('Game 3 + Hdcp');
      expect(games[0]).toHaveProperty('Game 4');
      expect(games[0]).toHaveProperty('Game 4 + Hdcp');
      expect(games[0]).toHaveProperty('Game 5');
      expect(games[0]).toHaveProperty('Game 5 + Hdcp');
      expect(games[0]).toHaveProperty('Game 6');
      expect(games[0]).toHaveProperty('Game 6 + Hdcp');
      expect(games[0]).toHaveProperty('total');
      expect(games[0]).toHaveProperty('total + Hdcp');

      expect(games[0].hdcp).toBe(0);
      expect(Number.isInteger(games[0].hdcp)).toBe(true);
      expect(games[0]['Game 1 + Hdcp']).toBe(games[0]['Game 1'] + games[0].hdcp); 
      expect(games[0]['total + Hdcp']).toBe(games[0].total + (games[0].hdcp * 6));
    })
    it('should NOT get all games for a div when ID is invalid', async () => { 
      try {
        const response = await axios.get(tmntUrl + 'invalid');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get all games for a div when ID is valid, but not a div id', async () => { 
      try {
        const response = await axios.get(tmntUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return empty array when div is not found', async () => { 
      const response = await axios.get(tmntUrl + notFoundTmntId);
      const games = response.data.games;
      expect(games.length).toBe(0); 
    })

  })
})