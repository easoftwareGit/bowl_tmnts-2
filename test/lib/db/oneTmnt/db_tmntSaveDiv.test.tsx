import axios from "axios";
import { baseDivsApi } from "@/lib/db/apiPaths";
import { testBaseDivsApi } from "../../../testApi";
import { tmntSaveDivs, exportedForTesting } from "@/lib/db/oneTmnt/oneTmnt";
import { mockDivsToPost, mockDivsToEdit } from "../../../mocks/tmnts/twoDivs/mockDivs";
import { divType, HdcpForTypes } from "@/lib/types/types";
import { deleteAllTmntDivs, deleteDiv, postDiv, putDiv } from "@/lib/db/divs/divsAxios";
import { blankDiv } from "@/lib/db/initVals";
import 'core-js/actual/structured-clone';

const { tmntPostPutOrDelDivs } = exportedForTesting;

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

describe('saveTmntDivs test', () => {
  const url = testBaseDivsApi.startsWith("undefined")
    ? baseDivsApi
    : testBaseDivsApi;

  const deleteTestDivs = async () => {
    await deleteAllTmntDivs(mockDivsToPost[0].tmnt_id);
  };

  describe('tmntPostPutOrDelDivs(): edited div(s)', () => { 
    const clonedDiv = structuredClone(mockDivsToEdit[0]);
    const toAddDiv = {
      ...clonedDiv,
      id: 'div_24b1cd5dee0542038a1244fc2978e863', // added one to last diget
      div_name: "Test Div",
      hdcp_per: .95,
      hdcp_from: 225,
      int_hdcp: true, 
      hdcp_for: 'Game' as HdcpForTypes,
      sort_order: 14,
    }
    // 1 deleted - Hdcp 50+, sort order 3, index[2]
    // 1 edited - Hdcp. sort order 2, index[1]
    // 1 left along - Scratch, sort order 1 - index[0]
    // 1 created - Test Div, sort order 14

    const doResetDiv = async () => {
      await putDiv(mockDivsToEdit[1]);
    }
    const rePostDiv = async () => {
      const response = await axios.get(url);
      const divs = response.data.divs;
      const found = divs.find(
        (d: divType) => d.id === mockDivsToEdit[2].id
      );
      if (!found) {
        await postDiv(mockDivsToEdit[2]);
      }      
    }
    const removeDiv = async () => {
      await deleteDiv(toAddDiv.id);
    }

    let didPost = false;
    let didPut = false;
    let didDel = false;

    beforeEach(async () => {
      await doResetDiv();
      await rePostDiv();
      await removeDiv();
    });

    beforeEach(() => {
      didPost = false;
      didPut = false;
      didDel = false;
    });

    afterEach(async () => {
      if (didPost) {
        await removeDiv();
      }
      if (didPut) {
        await doResetDiv();
      }
      if (didDel) {
        await rePostDiv();
      }
    });

    it('should saved edited divs, one div edited', async () => {
      const divsToEdit = structuredClone(mockDivsToEdit);
      divsToEdit[1].div_name = "Edited Div";
      divsToEdit[1].hdcp_per = .87;
      divsToEdit[1].hdcp_from = 222;
      const savedDivs = await tmntPostPutOrDelDivs(mockDivsToEdit, divsToEdit);
      if (!savedDivs) {
        expect(savedDivs).not.toBeNull();
        return;
      }
      expect(savedDivs).toHaveLength(3);
      didPut = true;
      const found = savedDivs.find((e) => e.id === divsToEdit[1].id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toBe(divsToEdit[1].id);
      expect(found.div_name).toBe(divsToEdit[1].div_name);
      expect(found.hdcp_per).toBe(divsToEdit[1].hdcp_per);      
      expect(found.hdcp_from).toBe(divsToEdit[1].hdcp_from);
    })
    it('should save edited divs, one div added', async () => { 
      const divsToEdit = structuredClone(mockDivsToEdit);
      divsToEdit.push(toAddDiv);
      const savedDivs = await tmntPostPutOrDelDivs(mockDivsToEdit, divsToEdit);
      if (!savedDivs) {
        expect(savedDivs).not.toBeNull();
        return;
      }
      didPost = true;
      expect(savedDivs).toHaveLength(4);
      const found = savedDivs.find((e) => e.id === toAddDiv.id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toBe(toAddDiv.id);
      expect(found.div_name).toBe(toAddDiv.div_name);
      expect(found.hdcp_per).toBe(toAddDiv.hdcp_per);      
      expect(found.hdcp_from).toBe(toAddDiv.hdcp_from);
    })
    it('should save edited divs, one div deleted', async () => { 
      const divsToEdit = structuredClone(mockDivsToEdit);
      divsToEdit.pop();      
      const savedDivs = await tmntPostPutOrDelDivs(mockDivsToEdit, divsToEdit);
      if (!savedDivs) {
        expect(savedDivs).not.toBeNull();
        return;
      }
      didDel = true;
      expect(savedDivs).toHaveLength(2);
      const found = savedDivs.find((e) => e.id === mockDivsToEdit[2].id);
      if (found) {
        expect(found).toBeUndefined();
        return;
      }
      expect(found).toBeUndefined();
    })   
    it('should save edited divs, one div edited, one added, one deleted', async () => { 
      const divsToEdit = structuredClone(mockDivsToEdit);
      // delete Hdcp 50+
      divsToEdit.pop();
      // edit hdcp
      divsToEdit[1].div_name = "Edited Div";
      divsToEdit[1].hdcp_per = .99;
      divsToEdit[1].hdcp_from = 221;
      // add women
      divsToEdit.push(toAddDiv);
      const savedDivs = await tmntPostPutOrDelDivs(mockDivsToEdit, divsToEdit);
      if (!savedDivs) {
        expect(savedDivs).not.toBeNull();
        return;
      }
      expect(savedDivs).toHaveLength(3);
      didPut = true;
      didPost = true;
      didDel = true;
      const found = savedDivs.find((d) => d.id === divsToEdit[1].id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toBe(divsToEdit[1].id);
      expect(found.div_name).toBe(divsToEdit[1].div_name);
      expect(found.hdcp_per).toBe(divsToEdit[1].hdcp_per);      
      expect(found.hdcp_from).toBe(divsToEdit[1].hdcp_from);
    })
  })
  
  describe('tmntSaveDivs(): new div(s)', () => { 
    let createdDiv = false;

    beforeEach(async () => {
      await deleteTestDivs();
    });

    beforeEach(() => {
      createdDiv = false;
    });

    afterEach(async () => {
      if (createdDiv) {
        await deleteTestDivs();
      }
    });

    const origClone = structuredClone(blankDiv);
    const origDivs: divType[] = [
      {
        ...origClone,
      }
    ]

    it('should create one new div when only one div to save', async () => { 
      const newDivClone = structuredClone(mockDivsToPost[0]);
      const newDivs = [
        {
          ...newDivClone
        }        
      ]
      const result = await tmntSaveDivs(origDivs, newDivs);
      expect(result).not.toBeNull();
      createdDiv = true;
      if (!result) return;
      expect(result.length).toBe(1);
      const postedDiv = result[0];
      expect(postedDiv.id).toBe(newDivs[0].id);
      expect(postedDiv.tmnt_id).toBe(newDivs[0].tmnt_id);
      expect(postedDiv.div_name).toBe(newDivs[0].div_name);
      expect(postedDiv.hdcp_per).toBe(newDivs[0].hdcp_per);      
      expect(postedDiv.hdcp_from).toBe(newDivs[0].hdcp_from);
      expect(postedDiv.int_hdcp).toBe(newDivs[0].int_hdcp);
      expect(postedDiv.hdcp_for).toBe(newDivs[0].hdcp_for);
      expect(postedDiv.sort_order).toBe(newDivs[0].sort_order);
    })
    it('should create multiple new divs when multiple divs to save', async () => {
      const newDivs = structuredClone(mockDivsToPost);
      const result = await tmntSaveDivs(origDivs, newDivs);
      expect(result).not.toBeNull();
      createdDiv = true;
      if (!result) return;
      expect(result.length).toBe(2);
      const postedDivs = result as divType[];
      let postedDiv
      if (postedDivs[0].id === newDivs[0].id) {
        postedDiv = postedDivs[0]
      } else {
        postedDiv = postedDivs[1]
      }
      expect(postedDiv.id).toBe(newDivs[0].id);
      expect(postedDiv.tmnt_id).toBe(newDivs[0].tmnt_id);
      expect(postedDiv.div_name).toBe(newDivs[0].div_name);
      expect(postedDiv.hdcp_per).toBe(newDivs[0].hdcp_per);      
      expect(postedDiv.hdcp_from).toBe(newDivs[0].hdcp_from);
      expect(postedDiv.int_hdcp).toBe(newDivs[0].int_hdcp);
      expect(postedDiv.hdcp_for).toBe(newDivs[0].hdcp_for);
      expect(postedDiv.sort_order).toBe(newDivs[0].sort_order);

      if (postedDivs[1].id === newDivs[1].id) {
        postedDiv = postedDivs[1]
      } else {
        postedDiv = postedDivs[0]
      }
      expect(postedDiv.id).toBe(newDivs[1].id);
      expect(postedDiv.tmnt_id).toBe(newDivs[1].tmnt_id);
      expect(postedDiv.div_name).toBe(newDivs[1].div_name);
      expect(postedDiv.hdcp_per).toBe(newDivs[1].hdcp_per);      
      expect(postedDiv.hdcp_from).toBe(newDivs[1].hdcp_from);
      expect(postedDiv.int_hdcp).toBe(newDivs[1].int_hdcp);
      expect(postedDiv.hdcp_for).toBe(newDivs[1].hdcp_for);
      expect(postedDiv.sort_order).toBe(newDivs[1].sort_order);
    })

  })

  describe('tmntSaveDivs(): update div(s)', () => { 
    const clonedDiv = structuredClone(mockDivsToEdit[0]);
    const toAddDiv = {
      ...clonedDiv,
      id: 'div_24b1cd5dee0542038a1244fc2978e863', // added one to last diget
      div_name: "Test Div",
      hdcp_per: .95,
      hdcp_from: 225,
      int_hdcp: true, 
      hdcp_for: 'Game' as HdcpForTypes,
      sort_order: 14,
    }
    // 1 deleted - Hdcp 50+, sort order 3, index[2]
    // 1 edited - Hdcp. sort order 2, index[1]
    // 1 left along - Scratch, sort order 1 - index[0]
    // 1 created - Test Div, sort order 14

    const doResetDiv = async () => {
      await putDiv(mockDivsToEdit[1]);
    }
    const rePostDiv = async () => {
      const response = await axios.get(url);
      const divs = response.data.divs;
      const found = divs.find(
        (d: divType) => d.id === mockDivsToEdit[2].id
      );
      if (!found) {
        await postDiv(mockDivsToEdit[2]);
      }      
    }
    const removeEvent = async () => {
      await deleteDiv(toAddDiv.id);
    }

    let didPost = false;
    let didPut = false;
    let didDel = false;

    beforeEach(async () => {
      await doResetDiv();
      await rePostDiv();
      await removeEvent();
    });

    beforeEach(() => {
      didPost = false;
      didPut = false;
      didDel = false;
    });

    afterEach(async () => {
      if (didPost) {
        await removeEvent();
      }
      if (didPut) {
        await doResetDiv();
      }
      if (didDel) {
        await rePostDiv();
      }
    });

    it('should saved edited events, one event edited', async () => {
      const eventsToEdit = structuredClone(mockDivsToEdit);
      eventsToEdit[1].div_name = "Edited Div";
      eventsToEdit[1].hdcp_per = .87;
      eventsToEdit[1].hdcp_from = 222;
      const savedEvents = await tmntSaveDivs(mockDivsToEdit, eventsToEdit);
      if (!savedEvents) {
        expect(savedEvents).not.toBeNull();
        return;
      }
      expect(savedEvents).toHaveLength(3);
      didPut = true;
      const found = savedEvents.find((e) => e.id === eventsToEdit[1].id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toBe(eventsToEdit[1].id);
      expect(found.div_name).toBe(eventsToEdit[1].div_name);
      expect(found.hdcp_per).toBe(eventsToEdit[1].hdcp_per);      
      expect(found.hdcp_from).toBe(eventsToEdit[1].hdcp_from);
    })
    it('should save edited divs, one div added', async () => { 
      const divsToEdit = structuredClone(mockDivsToEdit);
      divsToEdit.push(toAddDiv);
      const savedDivs = await tmntSaveDivs(mockDivsToEdit, divsToEdit);
      if (!savedDivs) {
        expect(savedDivs).not.toBeNull();
        return;
      }
      didPost = true;
      expect(savedDivs).toHaveLength(4);
      const found = savedDivs.find((e) => e.id === toAddDiv.id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toBe(toAddDiv.id);
      expect(found.div_name).toBe(toAddDiv.div_name);
      expect(found.hdcp_per).toBe(toAddDiv.hdcp_per);      
      expect(found.hdcp_from).toBe(toAddDiv.hdcp_from);
    })
    it('should save edited divs, one div deleted', async () => { 
      const divsToEdit = structuredClone(mockDivsToEdit);
      divsToEdit.pop();      
      const savedDivs = await tmntSaveDivs(mockDivsToEdit, divsToEdit);
      if (!savedDivs) {
        expect(savedDivs).not.toBeNull();
        return;
      }
      didDel = true;
      expect(savedDivs).toHaveLength(2);
      const found = savedDivs.find((e) => e.id === mockDivsToEdit[2].id);
      if (found) {
        expect(found).toBeUndefined();
        return;
      }
      expect(found).toBeUndefined();
    })   
    it('should save edited divs, one div edited, one added, one deleted', async () => { 
      const divsToEdit = structuredClone(mockDivsToEdit);
      // delete Hdcp 50+
      divsToEdit.pop();
      // edit hdcp
      divsToEdit[1].div_name = "Edited Div";
      divsToEdit[1].hdcp_per = .99;
      divsToEdit[1].hdcp_from = 221;
      // add women
      divsToEdit.push(toAddDiv);
      const savedDivs = await tmntSaveDivs(mockDivsToEdit, divsToEdit);
      if (!savedDivs) {
        expect(savedDivs).not.toBeNull();
        return;
      }
      expect(savedDivs).toHaveLength(3);
      didPut = true;
      didPost = true;
      didDel = true;
      const found = savedDivs.find((e) => e.id === divsToEdit[1].id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toBe(divsToEdit[1].id);
      expect(found.div_name).toBe(divsToEdit[1].div_name);
      expect(found.hdcp_per).toBe(divsToEdit[1].hdcp_per);      
      expect(found.hdcp_from).toBe(divsToEdit[1].hdcp_from);
    })

  })

})