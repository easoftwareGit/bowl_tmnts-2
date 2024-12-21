import axios, { AxiosError } from "axios";
import { baseDivsApi } from "@/lib/db/apiPaths";
import { testBaseDivsApi } from "../../../testApi";
import { divType, HdcpForTypes } from "@/lib/types/types";
import { initDiv } from "@/lib/db/initVals";
import { deleteAllTmntDivs, deleteDiv, getAllDivsForTmnt, postDiv, postManyDivs, putDiv } from "@/lib/db/divs/dbDivs";
import { mockDivsToPost } from "../../../mocks/tmnts/twoDivs/mockDivs";

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

// const url = testBaseDivsApi.startsWith("undefined")
//   ? baseDivsApi
//   : testBaseDivsApi;
// const oneDivUrl = url + "/div/";

const tmntId = 'tmt_fe8ac53dad0f400abe6354210a8f4cd1';

describe('dbDivs2 test', () => { 

  describe('create object with fields for each div in tmnt', () => { 

    it('create object with fields for each div in tmnt', async () => {
      const tmntDivs = await getAllDivsForTmnt(tmntId);
      console.log("tmntDivs", tmntDivs);
      expect(tmntDivs).not.toBeNull();
      if (!tmntDivs) return;
      const tmntDivsObj: any = {
        tmnt_id: tmntId,
      }
      let divNumName = ''
      for (let i = 0; i < tmntDivs.length; i++) {
        divNumName = 'div_' + i;
        tmntDivsObj[divNumName] = tmntDivs[i].div_name;        
      }
      console.log("tmntDivsObj", tmntDivsObj);
      expect(tmntDivsObj).not.toBeNull();
      expect(tmntDivsObj.tmnt_id).toBe(tmntId);
      expect(Object.keys(tmntDivsObj).length).toBe(tmntDivs.length + 1);
    })
  })
})