import { cloneDeep } from "lodash"
import { mockOrigData, mockDataOneTmnt } from "../../../mocks/tmnts/playerEntries/mockPlayerEntries"
import { saveEntriesData, getTotalUpdated, gotUpdateErrors, exportedForTesting } from "@/lib/db/tmntEntries/dbTmntEntries"
import { allEntriesNoUpdates, initBrktEntry, initDivEntry, initElimEntry, initPlayer, initPotEntry, noUpdates } from "@/lib/db/initVals"
import { exportedForTesting as exportedForTestingEditPlayers } from "@/app/dataEntry/editPlayers/[tmntId]/page"
import { divEntryHdcpColName, entryFeeColName, entryNumBrktsColName, timeStampColName } from "@/app/dataEntry/playersForm/createColumns"
import { deleteTmnt, postTmnt } from "@/lib/db/tmnts/dbTmnts"
import { postManyEvents } from "@/lib/db/events/dbEvents"
import { postManyDivs } from "@/lib/db/divs/dbDivs"
import { postManyPots } from "@/lib/db/pots/dbPots"
import { postManyBrkts } from "@/lib/db/brkts/dbBrkts"
import { postManyElims } from "@/lib/db/elims/dbElims"
import { deleteAllTmntPlayers, getAllPlayersForSquad, postManyPlayers } from "@/lib/db/players/dbPlayers"
import { postManyDivEntries } from "@/lib/db/divEntries/dbDivEntries"
import { postManyPotEntries } from "@/lib/db/potEntries/dbPotEntries"
import { postManyBrktEntries } from "@/lib/db/brktEntries/dbBrktEntries"
import { postManyElimEntries } from "@/lib/db/elimEntries/dbElimEntries"
import { postManySquads } from "@/lib/db/squads/dbSquads"
import { allEntriesOneSquadType, putManyEntriesReturnType } from "@/lib/types/types"
import { isValidBtDbId } from "@/lib/validation"
import { isValid } from "date-fns"


const {
  getPlayersToSave,
  getDivEntriesToSave,
  getPotEntriesToSave,
  getBrktEntriesToSave,
  getElimEntriesToSave,
  updateCurrentPlayers,
  updateCurrentDivEntries,
  updateCurrentPotEntries,
  updateCurrentBrktEntries,
  updateCurrentElimEntries
} = exportedForTesting
const { populateRows } = exportedForTestingEditPlayers

const mockAllEntrisOneSquad: allEntriesOneSquadType = {
  origData: cloneDeep(mockOrigData),
  curData: cloneDeep(mockOrigData),
}

describe('dbTmntEntries', () => { 

  // describe('getPlayersToSave', () => {  

  //   it('should return players to delete when when orig player not in edited', () => {       
  //     const editedPlayers = cloneDeep(mockOrigData.players).slice(0, 4);
  //     const toSave = getPlayersToSave(editedPlayers, mockOrigData.players);
  //     expect(toSave.length).toBe(2);
  //     toSave.forEach((p) => {
  //       expect(p.eType).toBe('d')
  //     })
  //   })    
  //   it('should return players to update when when orig player !== player in edited', () => {       
  //     const editedPlayers = cloneDeep(mockOrigData.players)
  //     editedPlayers[0].lane = 1;
  //     editedPlayers[1].lane = 2;
  //     const toSave = getPlayersToSave(editedPlayers, mockOrigData.players);
  //     expect(toSave.length).toBe(2);
  //     toSave.forEach((p) => {
  //       expect(p.eType).toBe('u')
  //     })
  //   })    
  //   it('should return players to insert when when edited player not in orig', () => {       
  //     const editedPlayers = cloneDeep(mockOrigData.players)
  //     const addedPlayer1 = {
  //       ...initPlayer,
  //       id: 'ply_0183456789abcdef0123456789abcdef',
  //       first_name: 'Gina',
  //       last_name: 'Davis',
  //       average: 212,
  //       lane: 27,
  //       position: 'Y',
  //     }      
  //     editedPlayers.push(addedPlayer1)
  //     const addedPlayer2 = {
  //       ...initPlayer,
  //       id: 'ply_0193456789abcdef0123456789abcdef',
  //       first_name: 'Helena',
  //       last_name: 'White',
  //       average: 211,
  //       lane: 28,
  //       position: 'Z',
  //     }      
  //     editedPlayers.push(addedPlayer2)
  //     const toSave = getPlayersToSave(editedPlayers, mockOrigData.players);
  //     expect(toSave.length).toBe(2);
  //     toSave.forEach((p) => {
  //       expect(p.eType).toBe('i')
  //     })
  //   })
  //   it('should return players to delete, update and insert', () => {             
  //     const editedPlayers = cloneDeep(mockOrigData.players).slice(0, 4);      
  //     editedPlayers[0].lane = 1;
  //     editedPlayers[1].lane = 2;
  //     const addedPlayer1 = {
  //       ...initPlayer,
  //       id: 'ply_0183456789abcdef0123456789abcdef',
  //       squad_id: mockOrigData.squadId,
  //       first_name: 'Gina',
  //       last_name: 'Davis',
  //       average: 212,
  //       lane: 27,
  //       position: 'Y',
  //     }      
  //     editedPlayers.push(addedPlayer1)
  //     const addedPlayer2 = {
  //       ...initPlayer,
  //       id: 'ply_0193456789abcdef0123456789abcdef',
  //       squad_id: mockOrigData.squadId,
  //       first_name: 'Helena',
  //       last_name: 'White',
  //       average: 211,
  //       lane: 28,
  //       position: 'Z',
  //     }      
  //     editedPlayers.push(addedPlayer2)
  //     const toSave = getPlayersToSave(editedPlayers, mockOrigData.players);
  //     expect(toSave.length).toBe(6);
  //     toSave.forEach((p) => {
  //       switch (p.id) {
  //         case 'ply_0123456789abcdef0123456789abcdef':
  //           expect(p.eType).toBe('u')
  //           break;
  //         case 'ply_0133456789abcdef0123456789abcdef':
  //           expect(p.eType).toBe('u')
  //           break;
  //         case 'ply_0163456789abcdef0123456789abcdef':
  //           expect(p.eType).toBe('d')
  //           break;
  //         case 'ply_0173456789abcdef0123456789abcdef':
  //           expect(p.eType).toBe('d')
  //           break;
  //         case 'ply_0183456789abcdef0123456789abcdef':
  //           expect(p.eType).toBe('i')
  //           break;
  //         case 'ply_0193456789abcdef0123456789abcdef':
  //           expect(p.eType).toBe('i')
  //           break;
  //         default:
  //           expect(false).toBe(true)
  //       }        
  //     })
  //   })    
  // })

  // describe('getDivEntriesToSave', () => { 

  //   it('should return divEntries to delete when orig divEntry not in edited', () => { 
  //     const editedDivEntries = cloneDeep(mockOrigData.divEntries).slice(0, 3)
  //     const toSave = getDivEntriesToSave(editedDivEntries, mockOrigData.divEntries);
  //     expect(toSave.length).toBe(2);
  //     toSave.forEach((p) => {
  //       expect(p.eType).toBe('d')
  //     })
  //   })
  //   it('should return divEntries to update when when orig divEntry !== divEntry in edited', () => {       
  //     const editedDivEntries = cloneDeep(mockOrigData.divEntries)
  //     editedDivEntries[0].fee = '84';
  //     editedDivEntries[1].fee = '84';
  //     const toSave = getDivEntriesToSave(editedDivEntries, mockOrigData.divEntries);
  //     expect(toSave.length).toBe(2);
  //     toSave.forEach((p) => {
  //       expect(p.eType).toBe('u')
  //     })
  //   })    
  //   it('should return divEntries to insert when when edited divEntry not in orig', () => {       
  //     const editedDivEntries = cloneDeep(mockOrigData.divEntries)
  //     const addedDivEntry1 = {
  //       ...initDivEntry,
  //       // id: "den_0173456789abcdef0123456789abcdef",
  //       squad_id: 'sqd_0123456789abcdef0123456789abcdef',
  //       div_id: 'div_0123456789abcdef0123456789abcdef',
  //       player_id: 'ply_0183456789abcdef0123456789abcdef',
  //       fee: '85',
  //       hdcp: 0,
  //     }
  //     editedDivEntries.push(addedDivEntry1)
  //     const addedDivEntry2 = {
  //       ...initDivEntry,
  //       // id: "den_0183456789abcdef0123456789abcdef",
  //       squad_id: 'sqd_0123456789abcdef0123456789abcdef',
  //       div_id: 'div_0123456789abcdef0123456789abcdef',
  //       player_id: 'ply_0193456789abcdef0123456789abcdef',
  //       fee: '85',
  //       hdcp: 0,
  //     }
  //     editedDivEntries.push(addedDivEntry2)
  //     const toSave = getDivEntriesToSave(editedDivEntries, mockOrigData.divEntries);
  //     expect(toSave.length).toBe(2);
  //     toSave.forEach((p) => {
  //       expect(isValidBtDbId(p.id, 'den')).toBe(true)
  //       expect(p.eType).toBe('i')
  //     })
  //   })    
  //   it('should return divEntries to delete, update and insert', () => { 
  //     const editedDivEntries = cloneDeep(mockOrigData.divEntries).slice(0, 3)
  //     editedDivEntries[0].fee = '84';
  //     editedDivEntries[1].fee = '84';
  //     const addedDivEntry1 = {
  //       ...initDivEntry,
  //       id: "den_0173456789abcdef0123456789abcdef",
  //       squad_id: 'sqd_0123456789abcdef0123456789abcdef',
  //       div_id: 'div_0123456789abcdef0123456789abcdef',
  //       player_id: 'ply_0183456789abcdef0123456789abcdef',
  //       fee: '81',
  //       hdcp: 0,
  //     }
  //     editedDivEntries.push(addedDivEntry1)
  //     const addedDivEntry2 = {
  //       ...initDivEntry,
  //       id: "den_0183456789abcdef0123456789abcdef",
  //       squad_id: 'sqd_0123456789abcdef0123456789abcdef',
  //       div_id: 'div_0123456789abcdef0123456789abcdef',
  //       player_id: 'ply_0193456789abcdef0123456789abcdef',
  //       fee: '81',
  //       hdcp: 0,
  //     }
  //     editedDivEntries.push(addedDivEntry2)
  //     const toSave = getDivEntriesToSave(editedDivEntries, mockOrigData.divEntries);
  //     expect(toSave.length).toBe(6);
  //     toSave.forEach((d) => {
  //       switch (d.id) {
  //         case 'den_0123456789abcdef0123456789abcdef':
  //           expect(d.eType).toBe('u')
  //           break;
  //         case 'den_0133456789abcdef0123456789abcdef':
  //           expect(d.eType).toBe('u')
  //           break;
  //         case 'den_0153456789abcdef0123456789abcdef':
  //           expect(d.eType).toBe('d')
  //           break;
  //         case 'den_0163456789abcdef0123456789abcdef':
  //           expect(d.eType).toBe('d')
  //           break;          
  //         // case 'den_0173456789abcdef0123456789abcdef':
  //         //   expect(p.eType).toBe('i')
  //         //   break;
  //         // case 'den_0183456789abcdef0123456789abcdef':
  //         //   expect(p.eType).toBe('i')
  //         //   break;
  //         default: // don't know the new id 
  //           expect(d.eType).toBe('i')
  //           expect(d.fee).toBe('81')
  //           expect(isValidBtDbId(d.id, 'den')).toBe(true)
  //           break;
  //       }        
  //     })
  //   })
  // })

  // describe('getPotEntriesToSave', () => { 

  //   it('should return potEntries to delete when orig potEntry not in edited', () => { 
  //     const editedPotEntries = cloneDeep(mockOrigData.potEntries).slice(0, 1)
  //     const toSave = getPotEntriesToSave(editedPotEntries, mockOrigData.potEntries, mockOrigData.squadId);
  //     expect(toSave.length).toBe(2);
  //     toSave.forEach((p) => {
  //       expect(p.eType).toBe('d')
  //     })
  //   })
  //   it('should return potEntries to update when when orig potEntry !== potEntry in edited', () => {       
  //     const editedPotEntries = cloneDeep(mockOrigData.potEntries)
  //     editedPotEntries[0].fee = '19';
  //     editedPotEntries[1].fee = '19';
  //     const toSave = getPotEntriesToSave(editedPotEntries, mockOrigData.potEntries, mockOrigData.squadId);
  //     expect(toSave.length).toBe(2);
  //     toSave.forEach((p) => {
  //       expect(p.eType).toBe('u')
  //     })
  //   })    
  //   it('should return potEntries to insert when when edited potEntry not in orig', () => {       
  //     const editedPotEntries = cloneDeep(mockOrigData.potEntries)
  //     const addedPotEntry1 = {
  //       ...initPotEntry,
  //       id: "pen_0153456789abcdef0123456789abcdef",
  //       pot_id: 'pot_0123456789abcdef0123456789abcdef',
  //       player_id: 'ply_0163456789abcdef0123456789abcdef',
  //       fee: '20',
  //     }
  //     editedPotEntries.push(addedPotEntry1)
  //     const addedPotEntry2 = {
  //       ...initPotEntry,
  //       id: "pen_0163456789abcdef0123456789abcdef",
  //       pot_id: 'pot_0123456789abcdef0123456789abcdef',
  //       player_id: 'ply_0163456789abcdef0123456789abcdef',
  //       fee: '20',
  //     }
  //     editedPotEntries.push(addedPotEntry2)
  //     const toSave = getPotEntriesToSave(editedPotEntries, mockOrigData.potEntries, mockOrigData.squadId);
  //     expect(toSave.length).toBe(2);
  //     toSave.forEach((p) => {
  //       expect(p.eType).toBe('i')
  //     })
  //   })    
  //   it('should return potEntries to delete, update and insert', () => { 
  //     const editedPotEntries = cloneDeep(mockOrigData.potEntries).slice(0, 2)
  //     editedPotEntries[0].fee = '19';
  //     editedPotEntries[1].fee = '19';
  //     const addedPotEntry1 = {
  //       ...initPotEntry,
  //       // id: "pen_0153456789abcdef0123456789abcdef",
  //       pot_id: 'pot_0123456789abcdef0123456789abcdef',
  //       player_id: 'ply_0163456789abcdef0123456789abcdef',
  //       fee: '21',
  //     }
  //     editedPotEntries.push(addedPotEntry1)
  //     const addedPotEntry2 = {
  //       ...initPotEntry,
  //       // id: "pen_0163456789abcdef0123456789abcdef",
  //       pot_id: 'pot_0123456789abcdef0123456789abcdef',
  //       player_id: 'ply_0163456789abcdef0123456789abcdef',
  //       fee: '21',
  //     }
  //     editedPotEntries.push(addedPotEntry2)
  //     const toSave = getPotEntriesToSave(editedPotEntries, mockOrigData.potEntries, mockOrigData.squadId);
  //     expect(toSave.length).toBe(5);
  //     toSave.forEach((p) => {
  //       switch (p.id) {
  //         case 'pen_0123456789abcdef0123456789abcdef':
  //           expect(p.eType).toBe('u')
  //           break;
  //         case 'pen_0133456789abcdef0123456789abcdef':
  //           expect(p.eType).toBe('u')
  //           break;
  //         case 'pen_0143456789abcdef0123456789abcdef':
  //           expect(p.eType).toBe('d')
  //           break;
  //         // case 'pen_0153456789abcdef0123456789abcdef':
  //         //   expect(p.eType).toBe('i')
  //         //   break;
  //         // case 'pen_0163456789abcdef0123456789abcdef':
  //         //   expect(p.eType).toBe('i')
  //         //   break;
  //         default:
  //           expect(p.eType).toBe('i')
  //           expect(isValidBtDbId(p.id, 'pen')).toBe(true)
  //           expect(p.fee).toBe('21')            
  //           break;            
  //       }        
  //     })
  //   })
  // })

  // describe('getBrktEntriesToSave', () => {

  //   it('should return brktEntries to delete when orig brktEntry not in edited', () => { 
  //     const editedBrktEntries = cloneDeep(mockOrigData.brktEntries).slice(0, 2)
  //     const toSave = getBrktEntriesToSave(editedBrktEntries, mockOrigData.brktEntries);
  //     expect(toSave.length).toBe(2);
  //     toSave.forEach((p) => {
  //       expect(p.eType).toBe('d')
  //     })
  //   })
  //   it('should return brktEntries to update when when orig brktEntry !== brktEntry in edited', () => {       
  //     const editedBrktEntries = cloneDeep(mockOrigData.brktEntries)
  //     editedBrktEntries[0].num_brackets = 3;
  //     editedBrktEntries[0].fee = '15';
  //     editedBrktEntries[1].num_brackets = 3;
  //     editedBrktEntries[1].fee = '15';
  //     const toSave = getBrktEntriesToSave(editedBrktEntries, mockOrigData.brktEntries);
  //     expect(toSave.length).toBe(2);
  //     toSave.forEach((p) => {
  //       expect(p.eType).toBe('u')
  //     })
  //   })    
  //   it('should return brktEntries to insert when when edited brktEntry not in orig', () => {       
  //     const editedBrktEntries = cloneDeep(mockOrigData.brktEntries)
  //     const addedBrktEntry1 = {
  //       ...initBrktEntry,
  //       id: "ben_0163456789abcdef0123456789abcdef",
  //       brkt_id: 'brk_0123456789abcdef0123456789abcdef',
  //       player_id: 'ply_0143456789abcdef0123456789abcdef',
  //       num_brackets: 1,
  //       fee: '5',
  //     }
  //     editedBrktEntries.push(addedBrktEntry1)
  //     const addedDivEntry2 = {
  //       ...initBrktEntry,
  //       id: "ben_0173456789abcdef0123456789abcdef",
  //       brkt_id: 'brk_0133456789abcdef0123456789abcdef',
  //       player_id: 'ply_0143456789abcdef0123456789abcdef',
  //       num_brackets: 1,
  //       fee: '5',
  //     }
  //     editedBrktEntries.push(addedDivEntry2)
  //     const toSave = getBrktEntriesToSave(editedBrktEntries, mockOrigData.brktEntries);
  //     expect(toSave.length).toBe(2);
  //     toSave.forEach((p) => {
  //       expect(p.eType).toBe('i')
  //     })
  //   })    
  //   it('should return brktEntries to delete, update and insert', () => { 
  //     const editedBrktEntries = cloneDeep(mockOrigData.brktEntries).slice(0, 2)
  //     editedBrktEntries[0].num_brackets = 3;
  //     editedBrktEntries[0].fee = '15';
  //     editedBrktEntries[1].num_brackets = 3;
  //     editedBrktEntries[1].fee = '15';
  //     const addedBrktEntry1 = {
  //       ...initBrktEntry,
  //       // id: "ben_0163456789abcdef0123456789abcdef",
  //       brkt_id: 'brk_0123456789abcdef0123456789abcdef',
  //       player_id: 'ply_0143456789abcdef0123456789abcdef',
  //       num_brackets: 1,
  //       fee: '5',
  //     }
  //     editedBrktEntries.push(addedBrktEntry1)
  //     const addedDivEntry2 = {
  //       ...initBrktEntry,
  //       // id: "ben_0173456789abcdef0123456789abcdef",
  //       brkt_id: 'brk_0133456789abcdef0123456789abcdef',
  //       player_id: 'ply_0143456789abcdef0123456789abcdef',
  //       num_brackets: 1,
  //       fee: '5',
  //     }
  //     editedBrktEntries.push(addedDivEntry2)
  //     const toSave = getBrktEntriesToSave(editedBrktEntries, mockOrigData.brktEntries);
  //     expect(toSave.length).toBe(6);
  //     toSave.forEach((b) => {
  //       switch (b.id) {
  //         case 'ben_0123456789abcdef0123456789abcdef':
  //           expect(b.eType).toBe('u')
  //           break;
  //         case 'ben_0133456789abcdef0123456789abcdef':
  //           expect(b.eType).toBe('u')
  //           break;
  //         case 'ben_0143456789abcdef0123456789abcdef':
  //           expect(b.eType).toBe('d')
  //           break;
  //         case 'ben_0153456789abcdef0123456789abcdef':
  //           expect(b.eType).toBe('d')
  //           break;
  //         // case 'ben_0163456789abcdef0123456789abcdef':
  //         //   expect(p.eType).toBe('i')
  //         //   break;
  //         // case 'ben_0173456789abcdef0123456789abcdef':
  //         //   expect(p.eType).toBe('i')
  //         //   break;
  //         default:
  //           expect(b.eType).toBe('i')
  //           expect(isValidBtDbId(b.id, 'ben')).toBe(true);
  //           expect(b.num_brackets).toBe(1) 
  //           break;
  //       }        
  //     })
  //   })    
  // })

  // describe('getElimEntriesToSave', () => {

  //   it('should return elimEntries to delete when orig elimEntry not in edited', () => { 
  //     const editedElimEntries = cloneDeep(mockOrigData.elimEntries).slice(0, 2)
  //     const toSave = getElimEntriesToSave(editedElimEntries, mockOrigData.elimEntries);
  //     expect(toSave.length).toBe(2);
  //     toSave.forEach((p) => {
  //       expect(p.eType).toBe('d')
  //     })
  //   })
  //   it('should return elimEntries to update when when orig elimEntry !== elimEntry in edited', () => {       
  //     const editedElimEntries = cloneDeep(mockOrigData.elimEntries)      
  //     editedElimEntries[0].fee = '4';      
  //     editedElimEntries[1].fee = '4';
  //     const toSave = getElimEntriesToSave(editedElimEntries, mockOrigData.elimEntries);
  //     expect(toSave.length).toBe(2);
  //     toSave.forEach((p) => {
  //       expect(p.eType).toBe('u')
  //     })
  //   })    
  //   it('should return elimEntries to insert when when edited elimEntry not in orig', () => {       
  //     const editedElimEntries = cloneDeep(mockOrigData.elimEntries)
  //     const addedBrktEntry1 = {
  //       ...initElimEntry,
  //       // id: "een_0163456789abcdef0123456789abcdef",
  //       elim_id: 'elm_0123456789abcdef0123456789abcdef',
  //       player_id: 'ply_0143456789abcdef0123456789abcdef',
  //       fee: '5',
  //     }
  //     editedElimEntries.push(addedBrktEntry1)
  //     const addedDivEntry2 = {
  //       ...initElimEntry,
  //       // id: "een_0173456789abcdef0123456789abcdef",
  //       elim_id: 'elm_0133456789abcdef0123456789abcdef',
  //       player_id: 'ply_0143456789abcdef0123456789abcdef',
  //       fee: '5',
  //     }
  //     editedElimEntries.push(addedDivEntry2)
  //     const toSave = getElimEntriesToSave(editedElimEntries, mockOrigData.elimEntries);
  //     expect(toSave.length).toBe(2);
  //     toSave.forEach((p) => {
  //       expect(p.eType).toBe('i')
  //     })
  //   })    
  //   it('should return elimEntries to delete, update and insert', () => { 
  //     const editedElimEntries = cloneDeep(mockOrigData.elimEntries).slice(0, 2)
  //     editedElimEntries[0].fee = '4';      
  //     editedElimEntries[1].fee = '4';
  //     const addedBrktEntry1 = {
  //       ...initElimEntry,
  //       id: "een_0163456789abcdef0123456789abcdef",
  //       elim_id: 'elm_0123456789abcdef0123456789abcdef',
  //       player_id: 'ply_0143456789abcdef0123456789abcdef',
  //       fee: '6',
  //     }
  //     editedElimEntries.push(addedBrktEntry1)
  //     const addedDivEntry2 = {
  //       ...initElimEntry,
  //       id: "een_0173456789abcdef0123456789abcdef",
  //       elim_id: 'elm_0133456789abcdef0123456789abcdef',
  //       player_id: 'ply_0143456789abcdef0123456789abcdef',
  //       fee: '6',
  //     }
  //     editedElimEntries.push(addedDivEntry2)
  //     const toSave = getElimEntriesToSave(editedElimEntries, mockOrigData.elimEntries);
  //     expect(toSave.length).toBe(6);
  //     toSave.forEach((e) => {
  //       switch (e.id) {
  //         case 'een_0123456789abcdef0123456789abcdef':
  //           expect(e.eType).toBe('u')
  //           break;
  //         case 'een_0133456789abcdef0123456789abcdef':
  //           expect(e.eType).toBe('u')
  //           break;
  //         case 'een_0143456789abcdef0123456789abcdef':
  //           expect(e.eType).toBe('d')
  //           break;
  //         case 'een_0153456789abcdef0123456789abcdef':
  //           expect(e.eType).toBe('d')
  //           break;
  //         // case 'een_0163456789abcdef0123456789abcdef':
  //         //   expect(e.eType).toBe('i')
  //         //   break;
  //         // case 'een_0173456789abcdef0123456789abcdef':
  //         //   expect(e.eType).toBe('i')
  //         //   break;
  //         default:
  //           expect(e.eType).toBe('i')
  //           expect(isValidBtDbId(e.id, 'een')).toBe(true)
  //           expect(e.fee).toBe('6')            
  //       }        
  //     })
  //   })    
  // })

  describe('updateCurrentPlayers', () => {  

    it('should return updated players when players deleted', () => {       
      const editedPlayers = cloneDeep(mockOrigData.players).slice(0, 4);
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)      
      const toSave = getPlayersToSave(editedPlayers, mockOrigData.players);    
      expect(toSave.length).toBe(2);
      toSave.forEach((p) => {
        expect(p.eType).toBe('d')
      })

      const updatedPlayers = updateCurrentPlayers(toSave, mockAllEnts);
      expect(updatedPlayers).not.toBe(null)
      if (updatedPlayers === null) return;       
      expect(updatedPlayers).toHaveLength(4)
      let deletedPlayer = updatedPlayers.find((p) => p.id === 'ply_0163456789abcdef0123456789abcdef')
      expect(deletedPlayer).toBeUndefined()
      deletedPlayer = updatedPlayers.find((p) => p.id === 'ply_0173456789abcdef0123456789abcdef')
      expect(deletedPlayer).toBeUndefined()
    })    
    it('should return updated players when players updated', () => {       
      const editedPlayers = cloneDeep(mockOrigData.players)
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)
      editedPlayers[0].lane = 1;
      editedPlayers[1].lane = 2;
      const toSave = getPlayersToSave(editedPlayers, mockOrigData.players);
      expect(toSave.length).toBe(2);
      toSave.forEach((p) => {
        expect(p.eType).toBe('u')
      })

      const updatedPlayers = updateCurrentPlayers(toSave, mockAllEnts);  
      expect(updatedPlayers).not.toBe(null)
      if (updatedPlayers === null) return;       
      expect(updatedPlayers).toHaveLength(6)
      expect(updatedPlayers[0].lane).toBe(1)
      expect(updatedPlayers[1].lane).toBe(2)
    })    
    it('should return updated players when players inserted', () => {       
      const editedPlayers = cloneDeep(mockOrigData.players)
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)
      const addedPlayer1 = {
        ...initPlayer,
        id: 'ply_0183456789abcdef0123456789abcdef',
        first_name: 'Gina',
        last_name: 'Davis',
        average: 212,
        lane: 27,
        position: 'Y',
      }      
      editedPlayers.push(addedPlayer1)
      const addedPlayer2 = {
        ...initPlayer,
        id: 'ply_0193456789abcdef0123456789abcdef',
        first_name: 'Helena',
        last_name: 'White',
        average: 211,
        lane: 28,
        position: 'Z',
      }      
      editedPlayers.push(addedPlayer2)
      const toSave = getPlayersToSave(editedPlayers, mockOrigData.players);
      expect(toSave.length).toBe(2);
      toSave.forEach((p) => {
        expect(p.eType).toBe('i')
      })

      const updatedPlayers = updateCurrentPlayers(toSave, mockAllEnts);  
      expect(updatedPlayers).not.toBe(null)
      if (updatedPlayers === null) return;
      expect(updatedPlayers).toHaveLength(8)    
      
      expect(updatedPlayers[6].id).toBe('ply_0183456789abcdef0123456789abcdef')
      expect(updatedPlayers[7].id).toBe('ply_0193456789abcdef0123456789abcdef')
    })
    it('should return updated players when players deleted, updated and inserted', () => {             
      const editedPlayers = cloneDeep(mockOrigData.players).slice(0, 4);   
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)
      editedPlayers[0].lane = 1;
      editedPlayers[1].lane = 2;
      const addedPlayer1 = {
        ...initPlayer,
        id: 'ply_0183456789abcdef0123456789abcdef',
        squad_id: mockOrigData.squadId,
        first_name: 'Gina',
        last_name: 'Davis',
        average: 212,
        lane: 27,
        position: 'Y',
      }      
      editedPlayers.push(addedPlayer1)
      const addedPlayer2 = {
        ...initPlayer,
        id: 'ply_0193456789abcdef0123456789abcdef',
        squad_id: mockOrigData.squadId,
        first_name: 'Helena',
        last_name: 'White',
        average: 211,
        lane: 28,
        position: 'Z',
      }      
      editedPlayers.push(addedPlayer2)
      const toSave = getPlayersToSave(editedPlayers, mockOrigData.players);
      expect(toSave.length).toBe(6);
      toSave.forEach((p) => {
        switch (p.id) {
          case 'ply_0123456789abcdef0123456789abcdef':
            expect(p.eType).toBe('u')
            break;
          case 'ply_0133456789abcdef0123456789abcdef':
            expect(p.eType).toBe('u')
            break;
          case 'ply_0163456789abcdef0123456789abcdef':
            expect(p.eType).toBe('d')
            break;
          case 'ply_0173456789abcdef0123456789abcdef':
            expect(p.eType).toBe('d')
            break;
          case 'ply_0183456789abcdef0123456789abcdef':
            expect(p.eType).toBe('i')
            break;
          case 'ply_0193456789abcdef0123456789abcdef':
            expect(p.eType).toBe('i')
            break;
          default:
            expect(false).toBe(true)
        }        
      })

      const updatedPlayers = updateCurrentPlayers(toSave, mockAllEnts);  
      expect(updatedPlayers).not.toBe(null)
      if (updatedPlayers === null) return;
      // deleted 2, updated 2 and inserted 2
      expect(updatedPlayers).toHaveLength(6)
      // deleted rows
      let deletedPlayer = updatedPlayers.find((p) => p.id === 'ply_0163456789abcdef0123456789abcdef')
      expect(deletedPlayer).toBeUndefined()
      deletedPlayer = updatedPlayers.find((p) => p.id === 'ply_0173456789abcdef0123456789abcdef')
      expect(deletedPlayer).toBeUndefined()
      // updated rows
      expect(updatedPlayers[0].lane).toBe(1)
      expect(updatedPlayers[1].lane).toBe(2)
      // non edited rows
      expect(updatedPlayers[2]).toEqual(mockAllEnts.curData.players[2])
      expect(updatedPlayers[3]).toEqual(mockAllEnts.curData.players[3])
      // inserted rows
      expect(updatedPlayers[4].id).toBe('ply_0183456789abcdef0123456789abcdef')
      expect(updatedPlayers[5].id).toBe('ply_0193456789abcdef0123456789abcdef')      
    })    
  })

  describe('updateCurrentDivEntries', () => { 

    it('should return updated divEntries when divEntries deleted', () => { 
      const editedDivEntries = cloneDeep(mockOrigData.divEntries).slice(0, 3)
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)
      const toSave = getDivEntriesToSave(editedDivEntries, mockOrigData.divEntries);
      expect(toSave.length).toBe(2);
      toSave.forEach((p) => {
        expect(p.eType).toBe('d')
      })

      const updatedDivEntries = updateCurrentDivEntries(toSave, mockAllEnts);
      expect(updatedDivEntries).not.toBe(null)
      if (updatedDivEntries === null) return;
      expect(updatedDivEntries).toHaveLength(3);
      let deleted = updatedDivEntries.find((d) => d.id === 'den_0153456789abcdef0123456789abcdef')
      expect(deleted).toBeUndefined()
      deleted = updatedDivEntries.find((d) => d.id === 'den_0163456789abcdef0123456789abcdef')
      expect(deleted).toBeUndefined()
    })
    it('should return updates divEntries when divEntries updated', () => {       
      const editedDivEntries = cloneDeep(mockOrigData.divEntries)
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)
      editedDivEntries[0].fee = '84';
      editedDivEntries[1].fee = '84';
      const toSave = getDivEntriesToSave(editedDivEntries, mockOrigData.divEntries);
      expect(toSave.length).toBe(2);
      toSave.forEach((p) => {
        expect(p.eType).toBe('u')
      })

      const updatedDivEntries = updateCurrentDivEntries(toSave, mockAllEnts);
      expect(updatedDivEntries).not.toBe(null)
      if (updatedDivEntries === null) return;
      expect(updatedDivEntries).toHaveLength(5);
      expect(updatedDivEntries[0].fee).toBe('84');
      expect(updatedDivEntries[1].fee).toBe('84');
    })    
    it('should return updated divEntries when divEntries inserted', () => {       
      const editedDivEntries = cloneDeep(mockOrigData.divEntries)
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)
      const addedDivEntry1 = {
        ...initDivEntry,
        squad_id: 'sqd_0123456789abcdef0123456789abcdef',
        div_id: 'div_0123456789abcdef0123456789abcdef',
        player_id: 'ply_0183456789abcdef0123456789abcdef',
        fee: '81',
        hdcp: 0,
      }
      editedDivEntries.push(addedDivEntry1)
      const addedDivEntry2 = {
        ...initDivEntry,
        squad_id: 'sqd_0123456789abcdef0123456789abcdef',
        div_id: 'div_0123456789abcdef0123456789abcdef',
        player_id: 'ply_0193456789abcdef0123456789abcdef',
        fee: '81',
        hdcp: 0,
      }
      editedDivEntries.push(addedDivEntry2)
      const toSave = getDivEntriesToSave(editedDivEntries, mockOrigData.divEntries);
      expect(toSave.length).toBe(2);
      toSave.forEach((p) => {
        expect(p.eType).toBe('i')
      })
      
      const updatedDivEntries = updateCurrentDivEntries(toSave, mockAllEnts);
      expect(updatedDivEntries).not.toBe(null)
      if (updatedDivEntries === null) return;
      expect(updatedDivEntries).toHaveLength(7);      
      expect(updatedDivEntries[updatedDivEntries.length - 2].fee).toBe('81');
      expect(updatedDivEntries[updatedDivEntries.length - 1].fee).toBe('81');
    })    
    it('should return updated divEntries when divEntries deleted, updated and inserted', () => { 
      const editedDivEntries = cloneDeep(mockOrigData.divEntries).slice(0, 3)
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)
      editedDivEntries[0].fee = '84';
      editedDivEntries[1].fee = '84';
      const addedDivEntry1 = {
        ...initDivEntry,
        squad_id: 'sqd_0123456789abcdef0123456789abcdef',
        div_id: 'div_0123456789abcdef0123456789abcdef',
        player_id: 'ply_0183456789abcdef0123456789abcdef',
        fee: '81',
        hdcp: 0,
      }
      editedDivEntries.push(addedDivEntry1)
      const addedDivEntry2 = {
        ...initDivEntry,
        squad_id: 'sqd_0123456789abcdef0123456789abcdef',
        div_id: 'div_0123456789abcdef0123456789abcdef',
        player_id: 'ply_0193456789abcdef0123456789abcdef',
        fee: '81',
        hdcp: 0,
      }
      editedDivEntries.push(addedDivEntry2)
      const toSave = getDivEntriesToSave(editedDivEntries, mockOrigData.divEntries);
      expect(toSave.length).toBe(6);
      toSave.forEach((d) => {
        switch (d.id) {
          case 'den_0123456789abcdef0123456789abcdef':
            expect(d.eType).toBe('u')
            expect(d.fee).toBe('84');
            break;
          case 'den_0133456789abcdef0123456789abcdef':
            expect(d.eType).toBe('u')
            expect(d.fee).toBe('84');
            break;
          case 'den_0153456789abcdef0123456789abcdef':
            expect(d.eType).toBe('d')
            break;
          case 'den_0163456789abcdef0123456789abcdef':
            expect(d.eType).toBe('d')
            break;
          default:
            expect(d.eType).toBe('i')
            expect(isValidBtDbId(d.id, 'den')).toBe(true);
            expect(d.fee).toBe('81');
        }        
      })
      const updatedDivEntries = updateCurrentDivEntries(toSave, mockAllEnts);
      expect(updatedDivEntries).not.toBe(null)
      if (updatedDivEntries === null) return;
      expect(updatedDivEntries).toHaveLength(5);      

      // deleted 2, updated 2 and inserted 2      
      updatedDivEntries.forEach((d) => {
        // no case for deleted divEntries
        switch (d.id) {          
          case 'den_0123456789abcdef0123456789abcdef':
            expect(d.fee).toBe('84')
            break;
          case 'den_0133456789abcdef0123456789abcdef':
            expect(d.fee).toBe('84')
            break;
          case 'den_0143456789abcdef0123456789abcdef':
            expect(d.fee).toBe('85') // no edits
            break;
          default:            
            expect(isValidBtDbId(d.id, 'den')).toBe(true);
            expect(d.fee).toBe('81');
        }        
      })
    })    
  })

  describe('updateCurrentPotEntries', () => { 

    it('should return updated potEntries when potEntries deleted', () => { 
      const editedPotEntries = cloneDeep(mockOrigData.potEntries).slice(0, 1)
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)
      const toSave = getPotEntriesToSave(editedPotEntries, mockOrigData.potEntries, mockOrigData.squadId);
      expect(toSave.length).toBe(2);
      toSave.forEach((p) => {
        expect(p.eType).toBe('d')
      })

      const updatedPotsEntries = updateCurrentPotEntries(toSave, mockAllEnts);
      expect(updatedPotsEntries).not.toBe(null)
      if (updatedPotsEntries === null) return;
      expect(updatedPotsEntries).toHaveLength(1);
      let deleted = updatedPotsEntries.find((p) => p.id === 'pen_0133456789abcdef0123456789abcdef')
      expect(deleted).toBe(undefined)
      deleted = updatedPotsEntries.find((p) => p.id === 'pen_0143456789abcdef0123456789abcdef')
      expect(deleted).toBe(undefined)
    })
    it('should return updated potEntries when potEntries updated', () => {       
      const editedPotEntries = cloneDeep(mockOrigData.potEntries)
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)
      editedPotEntries[0].fee = '19';
      editedPotEntries[1].fee = '19';
      const toSave = getPotEntriesToSave(editedPotEntries, mockOrigData.potEntries, mockOrigData.squadId);
      expect(toSave.length).toBe(2);
      toSave.forEach((p) => {
        expect(p.eType).toBe('u')
      })

      const updatedPotsEntries = updateCurrentPotEntries(toSave, mockAllEnts);
      expect(updatedPotsEntries).not.toBe(null)
      if (updatedPotsEntries === null) return;
      expect(updatedPotsEntries).toHaveLength(3);      
      expect(updatedPotsEntries[0].fee).toBe('19')
      expect(updatedPotsEntries[1].fee).toBe('19')
    })    
    it('should return updated potEntries when potEntries inserted', () => {       
      const editedPotEntries = cloneDeep(mockOrigData.potEntries)
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)
      const addedPotEntry1 = {
        ...initPotEntry,
        pot_id: 'pot_0123456789abcdef0123456789abcdef',
        player_id: 'ply_0163456789abcdef0123456789abcdef',
        fee: '21',
      }
      editedPotEntries.push(addedPotEntry1)
      const addedPotEntry2 = {
        ...initPotEntry,        
        pot_id: 'pot_0123456789abcdef0123456789abcdef',
        player_id: 'ply_0163456789abcdef0123456789abcdef',
        fee: '21',
      }
      editedPotEntries.push(addedPotEntry2)
      const toSave = getPotEntriesToSave(editedPotEntries, mockOrigData.potEntries, mockOrigData.squadId);
      expect(toSave.length).toBe(2);
      toSave.forEach((p) => {
        expect(p.eType).toBe('i')
      })

      const updatedPotsEntries = updateCurrentPotEntries(toSave, mockAllEnts);
      expect(updatedPotsEntries).not.toBe(null)
      if (updatedPotsEntries === null) return;
      expect(updatedPotsEntries).toHaveLength(5);            
      expect(updatedPotsEntries[updatedPotsEntries.length - 2].fee).toBe('21')
      expect(updatedPotsEntries[updatedPotsEntries.length - 1].fee).toBe('21')
    })    
    it('should return updated potEntries when potEntries updated, inserted and deleted', () => { 
      const editedPotEntries = cloneDeep(mockOrigData.potEntries).slice(0, 2)
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)
      editedPotEntries[0].fee = '19';      
      const addedPotEntry1 = {
        ...initPotEntry,        
        pot_id: 'pot_0123456789abcdef0123456789abcdef',
        player_id: 'ply_0163456789abcdef0123456789abcdef',
        fee: '21',
      }
      editedPotEntries.push(addedPotEntry1)
      const addedPotEntry2 = {
        ...initPotEntry,        
        pot_id: 'pot_0123456789abcdef0123456789abcdef',
        player_id: 'ply_0163456789abcdef0123456789abcdef',
        fee: '21',
      }
      editedPotEntries.push(addedPotEntry2)
      const toSave = getPotEntriesToSave(editedPotEntries, mockOrigData.potEntries, mockOrigData.squadId);
      expect(toSave.length).toBe(4);
      toSave.forEach((p) => {
        switch (p.id) {
          case 'pen_0123456789abcdef0123456789abcdef':
            expect(p.eType).toBe('u')
            break;
          case 'pen_0143456789abcdef0123456789abcdef':
            expect(p.eType).toBe('d')
            break;
          default:
            expect(p.eType).toBe('i')
            expect(isValidBtDbId(p.id, "pen")).toBe(true)
            expect(p.fee).toBe('21')
        }        
      })

      const updatedPotsEntries = updateCurrentPotEntries(toSave, mockAllEnts);
      expect(updatedPotsEntries).not.toBe(null)
      if (updatedPotsEntries === null) return;
      expect(updatedPotsEntries).toHaveLength(4);

      // deleted 1, updated 1 and insrted 2
      updatedPotsEntries.forEach((p) => { 
        switch (p.id) { 
          // no case for deleted potEntries
          case 'pen_0123456789abcdef0123456789abcdef':
            expect(p.fee).toBe('19')
            break;
          case 'pen_0133456789abcdef0123456789abcdef':
            expect(p.fee).toBe('20') // not updated
            break;
          default:
            expect(isValidBtDbId(p.id, 'pen')).toBe(true);
            expect(p.fee).toBe('21');
        }
      })
    })
  })

  describe('updateCurrentBrktEntries', () => {

    it('should return updated brktEntries when brktEntries deleted', () => { 
      const editedBrktEntries = cloneDeep(mockOrigData.brktEntries).slice(0, 2)
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)
      const toSave = getBrktEntriesToSave(editedBrktEntries, mockOrigData.brktEntries);
      expect(toSave.length).toBe(2);
      toSave.forEach((p) => {
        expect(p.eType).toBe('d')
      })

      const updatedBrktEntries = updateCurrentBrktEntries(toSave, mockAllEnts);
      expect(updatedBrktEntries).not.toBe(null)
      if (updatedBrktEntries === null) return;
      expect(updatedBrktEntries).toHaveLength(2);
      let deleted = updatedBrktEntries.find((p) => p.id === 'ben_0143456789abcdef0123456789abcdef');
      expect(deleted).toBeUndefined();
      deleted = updatedBrktEntries.find((p) => p.id === 'ben_0153456789abcdef0123456789abcdef');
      expect(deleted).toBeUndefined();
    })
    it('should return updated brktEntries when brktEntries updated', () => {       
      const editedBrktEntries = cloneDeep(mockOrigData.brktEntries)
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)
      editedBrktEntries[0].num_brackets = 3;
      editedBrktEntries[0].fee = '15';
      editedBrktEntries[1].num_brackets = 3;
      editedBrktEntries[1].fee = '15';
      const toSave = getBrktEntriesToSave(editedBrktEntries, mockOrigData.brktEntries);
      expect(toSave.length).toBe(2);
      toSave.forEach((p) => {
        expect(p.eType).toBe('u')
      })

      const updatedBrktEntries = updateCurrentBrktEntries(toSave, mockAllEnts);
      expect(updatedBrktEntries).not.toBe(null)
      if (updatedBrktEntries === null) return;
      expect(updatedBrktEntries).toHaveLength(4);

      expect(updatedBrktEntries[0].num_brackets).toBe(3)
      expect(updatedBrktEntries[1].num_brackets).toBe(3)
    })    
    it('should return updated brktEntries when brktEntries inserted', () => {       
      const editedBrktEntries = cloneDeep(mockOrigData.brktEntries)
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)
      const addedBrktEntry1 = {
        ...initBrktEntry,        
        brkt_id: 'brk_0123456789abcdef0123456789abcdef',
        player_id: 'ply_0143456789abcdef0123456789abcdef',
        num_brackets: 1,
        fee: '5',
      }
      editedBrktEntries.push(addedBrktEntry1)
      const addedDivEntry2 = {
        ...initBrktEntry,        
        brkt_id: 'brk_0133456789abcdef0123456789abcdef',
        player_id: 'ply_0143456789abcdef0123456789abcdef',
        num_brackets: 1,
        fee: '5',
      }
      editedBrktEntries.push(addedDivEntry2)
      const toSave = getBrktEntriesToSave(editedBrktEntries, mockOrigData.brktEntries);
      expect(toSave.length).toBe(2);
      toSave.forEach((p) => {
        expect(p.eType).toBe('i')
      })

      const updatedBrktEntries = updateCurrentBrktEntries(toSave, mockAllEnts);
      expect(updatedBrktEntries).not.toBe(null)
      if (updatedBrktEntries === null) return;
      expect(updatedBrktEntries).toHaveLength(6);      
      expect(updatedBrktEntries[updatedBrktEntries.length - 2].num_brackets).toBe(1)
      expect(updatedBrktEntries[updatedBrktEntries.length - 1].num_brackets).toBe(1)
    })    
    it('should return updated brktEntries when brktEntries deleted, updated and inserted', () => { 
      const editedBrktEntries = cloneDeep(mockOrigData.brktEntries).slice(0, 2)
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)
      editedBrktEntries[0].num_brackets = 3;
      editedBrktEntries[0].fee = '15';
      const addedBrktEntry1 = {
        ...initBrktEntry,
        brkt_id: 'brk_0123456789abcdef0123456789abcdef',
        player_id: 'ply_0143456789abcdef0123456789abcdef',
        num_brackets: 1,
        fee: '5',
      }
      editedBrktEntries.push(addedBrktEntry1)
      const addedDivEntry2 = {
        ...initBrktEntry,
        brkt_id: 'brk_0133456789abcdef0123456789abcdef',
        player_id: 'ply_0143456789abcdef0123456789abcdef',
        num_brackets: 1,
        fee: '5',
      }
      editedBrktEntries.push(addedDivEntry2)
      const toSave = getBrktEntriesToSave(editedBrktEntries, mockOrigData.brktEntries);
      expect(toSave.length).toBe(5);
      toSave.forEach((b) => {
        switch (b.id) {
          case 'ben_0123456789abcdef0123456789abcdef':
            expect(b.eType).toBe('u')
            break;
          case 'ben_0143456789abcdef0123456789abcdef':
            expect(b.eType).toBe('d')
            break;
          case 'ben_0153456789abcdef0123456789abcdef':
            expect(b.eType).toBe('d')
            break;
          default:
            expect(b.eType).toBe('i')
            expect(isValidBtDbId(b.id, "ben")).toBe(true)
            expect(b.num_brackets).toBe(1)
        }        
      })
      const updatedBrktEntries = updateCurrentBrktEntries(toSave, mockAllEnts);
      expect(updatedBrktEntries).not.toBe(null)
      if (updatedBrktEntries === null) return;
      expect(updatedBrktEntries).toHaveLength(4);      

      // deleted 2, updated 1 and insrted 2
      updatedBrktEntries.forEach((b) => {
        // no case for deleted brktEntries
        switch (b.id) { 
          case 'ben_0123456789abcdef0123456789abcdef':
            expect(b.num_brackets).toBe(3)
            break;
          case 'ben_0133456789abcdef0123456789abcdef':
            expect(b.num_brackets).toBe(4) // not edited
            break;
          default:
            expect(isValidBtDbId(b.id, 'ben')).toBe(true);
            expect(b.num_brackets).toBe(1);
        }
      })
    })    
  })

  describe('updateCurrentElimEntries', () => {

    it('should update current elimEntries and original elimEntries when elimEntries deleted', () => { 
      const editedElimEntries = cloneDeep(mockOrigData.elimEntries).slice(0, 2)
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)
      const toSave = getElimEntriesToSave(editedElimEntries, mockOrigData.elimEntries);
      expect(toSave.length).toBe(2);
      toSave.forEach((p) => {
        expect(p.eType).toBe('d')
      })

      updateCurrentElimEntries(toSave, mockAllEnts);
      expect(mockAllEnts.curData.elimEntries).toHaveLength(mockAllEntrisOneSquad.curData.elimEntries.length - 2)
      for (let i = 0; i < mockAllEnts.curData.elimEntries.length; i++) {
        expect(mockAllEnts.curData.elimEntries[i]).toEqual(mockAllEnts.origData.elimEntries[i])
      }
    })
    it('should update current elimEntries and original elimEntries when elimEntries updated', () => {       
      const editedElimEntries = cloneDeep(mockOrigData.elimEntries)      
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)
      editedElimEntries[0].fee = '4';      
      editedElimEntries[1].fee = '4';
      const toSave = getElimEntriesToSave(editedElimEntries, mockOrigData.elimEntries);
      expect(toSave.length).toBe(2);
      toSave.forEach((p) => {
        expect(p.eType).toBe('u')
      })

      updateCurrentElimEntries(toSave, mockAllEnts);
      expect(mockAllEnts.curData.elimEntries[0].fee).toBe('4');
      expect(mockAllEnts.curData.elimEntries[1].fee).toBe('4');
    })    
    it('should update current elimEntries and original elimEntries when elimEntries inserted', () => {       
      const editedElimEntries = cloneDeep(mockOrigData.elimEntries)
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)
      const addedBrktEntry1 = {
        ...initElimEntry,        
        elim_id: 'elm_0123456789abcdef0123456789abcdef',
        player_id: 'ply_0143456789abcdef0123456789abcdef',
        fee: '6',
      }
      editedElimEntries.push(addedBrktEntry1)
      const addedDivEntry2 = {
        ...initElimEntry,        
        elim_id: 'elm_0133456789abcdef0123456789abcdef',
        player_id: 'ply_0143456789abcdef0123456789abcdef',
        fee: '6',
      }
      editedElimEntries.push(addedDivEntry2)
      const toSave = getElimEntriesToSave(editedElimEntries, mockOrigData.elimEntries);
      expect(toSave.length).toBe(2);
      toSave.forEach((p) => {
        expect(p.eType).toBe('i')
      })
      const addedStartIndex = mockAllEnts.curData.elimEntries.length;

      updateCurrentElimEntries(toSave, mockAllEnts);
      expect(mockAllEnts.curData.elimEntries).toHaveLength(mockAllEntrisOneSquad.curData.elimEntries.length + 2)
      expect(mockAllEnts.curData.elimEntries[addedStartIndex].fee).toBe('6');
      expect(mockAllEnts.curData.elimEntries[addedStartIndex + 1].fee).toBe('6');
    })    
    it('should update current elimEntries and original elimEntries when elimEntries deleted,updated, and inserted', () => { 
      const editedElimEntries = cloneDeep(mockOrigData.elimEntries).slice(0, 2)
      const mockAllEnts = cloneDeep(mockAllEntrisOneSquad)
      editedElimEntries[0].fee = '4';      
      editedElimEntries[1].fee = '4';
      const addedBrktEntry1 = {
        ...initElimEntry,        
        elim_id: 'elm_0123456789abcdef0123456789abcdef',
        player_id: 'ply_0143456789abcdef0123456789abcdef',
        fee: '6',
      }
      editedElimEntries.push(addedBrktEntry1)
      const addedDivEntry2 = {
        ...initElimEntry,        
        elim_id: 'elm_0133456789abcdef0123456789abcdef',
        player_id: 'ply_0143456789abcdef0123456789abcdef',
        fee: '6',
      }
      editedElimEntries.push(addedDivEntry2)
      const toSave = getElimEntriesToSave(editedElimEntries, mockOrigData.elimEntries);
      expect(toSave.length).toBe(6);
      toSave.forEach((e) => {
        switch (e.id) {
          case 'een_0123456789abcdef0123456789abcdef':
            expect(e.eType).toBe('u')
            break;
          case 'een_0133456789abcdef0123456789abcdef':
            expect(e.eType).toBe('u')
            break;
          case 'een_0143456789abcdef0123456789abcdef':
            expect(e.eType).toBe('d')
            break;
          case 'een_0153456789abcdef0123456789abcdef':
            expect(e.eType).toBe('d')
            break;
          default:
            expect(e.eType).toBe('i')
            expect(isValidBtDbId(e.id, "een")).toBe(true);
            expect(e.fee).toBe('6');
        }        
      })
      const addedStartIndex = mockAllEnts.curData.elimEntries.length;

      updateCurrentElimEntries(toSave, mockAllEnts);

      // deleted 2 and inserted 2
      expect(mockAllEnts.curData.elimEntries).toHaveLength(mockAllEntrisOneSquad.curData.elimEntries.length)
      mockAllEnts.curData.elimEntries.forEach((e) => {         
        switch (e.id) { 
          // no case for deleted elimEntries
          case 'een_0123456789abcdef0123456789abcdef':
            expect(e.fee).toBe('4')
            break;
          case 'een_0133456789abcdef0123456789abcdef':
            expect(e.fee).toBe('4')
            break;
          default:
            expect(isValidBtDbId(e.id, 'een')).toBe(true);
            expect(e.fee).toBe('6')
        }
      })
    })    
  })

  // describe('getUpdateErrors', () => { 
  //   const updateCounts = cloneDeep(allEntriesNoUpdates);
  
  //   it('should return false if no errors', () => { 
  //     expect(gotUpdateErrors(updateCounts)).toBe(false)
  //   })
  //   it('should return true if got players delete error', () => {
  //     const gotErrors = cloneDeep(updateCounts);
  //     gotErrors.players.deletes = -1;
  //     expect(gotUpdateErrors(gotErrors)).toBe(true)
  //   })
  //   it('should return true if got player update error', () => {
  //     const gotErrors = cloneDeep(updateCounts);      
  //     gotErrors.players.updates = -1;
  //     expect(gotUpdateErrors(gotErrors)).toBe(true)
  //   })
  //   it('should return true if got player insert error', () => {
  //     const gotErrors = cloneDeep(updateCounts);      
  //     gotErrors.players.inserts = -1;
  //     expect(gotUpdateErrors(gotErrors)).toBe(true)
  //   })
  //   it('should return true if got divEntries delete error', () => {
  //     const gotErrors = cloneDeep(updateCounts);            
  //     gotErrors.divEntries.deletes = -1;
  //     expect(gotUpdateErrors(gotErrors)).toBe(true)      
  //   })
  //   it('should return true if got divEntries update error', () => {
  //     const gotErrors = cloneDeep(updateCounts);            
  //     gotErrors.divEntries.updates = -1;
  //     expect(gotUpdateErrors(gotErrors)).toBe(true)      
  //   })
  //   it('should return true if got divEntries insert error', () => {
  //     const gotErrors = cloneDeep(updateCounts);            
  //     gotErrors.divEntries.inserts = -1;
  //     expect(gotUpdateErrors(gotErrors)).toBe(true)      
  //   })
  //   it('should return true if got potEntries delete error', () => {
  //     const gotErrors = cloneDeep(updateCounts);            
  //     gotErrors.potEntries.deletes = -1;
  //     expect(gotUpdateErrors(gotErrors)).toBe(true)      
  //   })
  //   it('should return true if got potEntries update error', () => {
  //     const gotErrors = cloneDeep(updateCounts);            
  //     gotErrors.potEntries.updates = -1;
  //     expect(gotUpdateErrors(gotErrors)).toBe(true)      
  //   })
  //   it('should return true if got potEntries insert error', () => {
  //     const gotErrors = cloneDeep(updateCounts);            
  //     gotErrors.potEntries.inserts = -1;
  //     expect(gotUpdateErrors(gotErrors)).toBe(true)      
  //   })
  //   it('should return true if got brktEntries delete error', () => {
  //     const gotErrors = cloneDeep(updateCounts);            
  //     gotErrors.brktEntries.deletes = -1;
  //     expect(gotUpdateErrors(gotErrors)).toBe(true)      
  //   })
  //   it('should return true if got brktEntries update error', () => {
  //     const gotErrors = cloneDeep(updateCounts);            
  //     gotErrors.brktEntries.updates = -1;
  //     expect(gotUpdateErrors(gotErrors)).toBe(true)      
  //   })
  //   it('should return true if got brktEntries insert error', () => {
  //     const gotErrors = cloneDeep(updateCounts);            
  //     gotErrors.brktEntries.inserts = -1;
  //     expect(gotUpdateErrors(gotErrors)).toBe(true)      
  //   })
  //   it('should return true if got elimEntries delete error', () => {
  //     const gotErrors = cloneDeep(updateCounts);            
  //     gotErrors.elimEntries.deletes = -1;
  //     expect(gotUpdateErrors(gotErrors)).toBe(true)      
  //   })
  //   it('should return true if got elimEntries update error', () => {
  //     const gotErrors = cloneDeep(updateCounts);            
  //     gotErrors.elimEntries.updates = -1;
  //     expect(gotUpdateErrors(gotErrors)).toBe(true)      
  //   })
  //   it('should return true if got elimEntries insert error', () => {
  //     const gotErrors = cloneDeep(updateCounts);            
  //     gotErrors.elimEntries.inserts = -1;
  //     expect(gotUpdateErrors(gotErrors)).toBe(true)      
  //   })
  // })

  // describe('getTotalUpdated', () => {
  //   const updateCounts = cloneDeep(allEntriesNoUpdates);
  //   it('should return total number of updates - 0', () => { 
  //     expect(getTotalUpdated(updateCounts)).toBe(0)
  //   })
  //   it('should return total number of updates - 30', () => { 
  //     const gotCounts = cloneDeep(updateCounts);
  //     gotCounts.players.deletes = 1;
  //     gotCounts.players.updates = 2;
  //     gotCounts.players.inserts = 3;
  //     gotCounts.divEntries.deletes = 1;
  //     gotCounts.divEntries.updates = 2;
  //     gotCounts.divEntries.inserts = 3;
  //     gotCounts.potEntries.deletes = 1;
  //     gotCounts.potEntries.updates = 2;
  //     gotCounts.potEntries.inserts = 3;
  //     gotCounts.brktEntries.deletes = 1;
  //     gotCounts.brktEntries.updates = 2;
  //     gotCounts.brktEntries.inserts = 3;
  //     gotCounts.elimEntries.deletes = 1;
  //     gotCounts.elimEntries.updates = 2;
  //     gotCounts.elimEntries.inserts = 3;
  //     expect(getTotalUpdated(gotCounts)).toBe(30)
  //   })
  //   it('should return total number of updates - -1', () => { 
  //     const gotErrors = cloneDeep(updateCounts);
  //     gotErrors.players.deletes = -1;
  //     expect(getTotalUpdated(gotErrors)).toBe(-1)
  //   })
  // })

  // describe('saveEntriesData', () => { 
  //   const divFeeColName = entryFeeColName(mockOrigData.divEntries[0].div_id);
  //   const divHdcpColName = divEntryHdcpColName(mockOrigData.divEntries[0].div_id);

  //   const potFeeColName = entryFeeColName(mockOrigData.potEntries[0].pot_id);

  //   const brkt1NumColName = entryNumBrktsColName(mockOrigData.brktEntries[0].brkt_id);
  //   const brkt1FeeColName = entryFeeColName(mockOrigData.brktEntries[0].brkt_id);    
  //   const brkt1TimeStampColName = timeStampColName(mockOrigData.brktEntries[0].brkt_id);
  //   const brkt2NumColName = entryNumBrktsColName(mockOrigData.brktEntries[1].brkt_id);
  //   const brkt2FeeColName = entryFeeColName(mockOrigData.brktEntries[1].brkt_id);
  //   const brkt2TimeStampColName = timeStampColName(mockOrigData.brktEntries[1].brkt_id);

  //   const elim1FeeColName = entryFeeColName(mockOrigData.elimEntries[0].elim_id);
  //   const elim2FeeColName = entryFeeColName(mockOrigData.elimEntries[1].elim_id);

  //   const saveMockTmnt = async () => { 
  //     const savedTmnt = await postTmnt(mockDataOneTmnt.tmnt);
  //     if (!savedTmnt) return null;
  //     const savedEvents = await postManyEvents(mockDataOneTmnt.events);
  //     if (!savedEvents) return null;
  //     const savedDivs = await postManyDivs(mockDataOneTmnt.divs);
  //     if (!savedDivs) return null;
  //     const savedSquads = await postManySquads(mockDataOneTmnt.squads);
  //     if (!savedSquads) return null;
  //     const savedPots = await postManyPots(mockDataOneTmnt.pots);
  //     if (!savedPots) return null;
  //     const savedBrkts = await postManyBrkts(mockDataOneTmnt.brkts);
  //     if (!savedBrkts) return null;
  //     const savedElims = await postManyElims(mockDataOneTmnt.elims);
  //     if (!savedElims) return null;
  //     return savedTmnt
  //   }
  //   const saveMockEntries = async () => {
  //     const savedPlayers = await postManyPlayers(mockOrigData.players);
  //     if (!savedPlayers) return null;
  //     const savedDivEntries = await postManyDivEntries(mockOrigData.divEntries);
  //     if (!savedDivEntries) return null;
  //     const savedPotEntries = await postManyPotEntries(mockOrigData.potEntries);
  //     if (!savedPotEntries) return null;
  //     const savedBrktEntries = await postManyBrktEntries(mockOrigData.brktEntries);
  //     if (!savedBrktEntries) return null;
  //     const savedElimEntries = await postManyElimEntries(mockOrigData.elimEntries);
  //     if (!savedElimEntries) return null;
  //     return savedPlayers;
  //   }

  //   beforeAll(async () => { 
  //     await deleteTmnt(mockDataOneTmnt.tmnt.id);
  //     await saveMockTmnt()      
  //   })

  //   beforeEach(async () => { 
  //     await saveMockEntries();
  //   })

  //   afterEach(async () => { 
  //     // deletes all tmnt players, divEntries, potEntries, brktEntries, elimEntries
  //     await deleteAllTmntPlayers(mockDataOneTmnt.tmnt.id);
  //   })

  //   afterAll(async () => { 
  //     // deletes tmnt, events, divs, pots, brkts, elims and player entries
  //     await deleteTmnt(mockDataOneTmnt.tmnt.id); // delete       
  //   })
    
  //   it('should update player entries with inserted player', async () => { 
  //     const curData = cloneDeep(mockOrigData);
  //     const origData = cloneDeep(mockOrigData);
  //     const testAllData: allEntriesOneSquadType = { origData, curData };
  //     const rows = populateRows(curData);
  //     expect(rows.length).toBe(6);

  //     const newRow = cloneDeep(rows[0]);
  //     newRow.id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.player_id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.first_name = 'Gina'
  //     newRow.last_name = 'Davis'
  //     newRow.average = 200
  //     newRow.lane = 35
  //     newRow.position = 'Y'
  //     newRow.lanePos = '35-Y'
  //     newRow[divFeeColName] = '85'
  //     newRow[divHdcpColName] = 0
  //     newRow[potFeeColName] = '20'
  //     newRow[brkt1NumColName] = 4
  //     newRow[brkt1FeeColName] = '20'
  //     newRow[brkt2NumColName] = 40
  //     newRow[brkt2FeeColName] = '20'
  //     newRow[elim1FeeColName] = '5'
  //     newRow[elim2FeeColName] = '5'
  //     rows.push(newRow) // insert player

  //     const updatedCounts = await saveEntriesData(rows, testAllData);
  //     expect(updatedCounts.players.updates).toBe(0);
  //     expect(updatedCounts.players.deletes).toBe(0);
  //     expect(updatedCounts.players.inserts).toBe(1);
  //     expect(testAllData.curData.players).toEqual(testAllData.origData.players);

  //     const savedPlayers = await getAllPlayersForSquad(mockDataOneTmnt.squads[0].id);
  //     expect(savedPlayers).not.toBeNull();
  //     if (!savedPlayers) return;
  //     expect(savedPlayers).toHaveLength(mockOrigData.players.length + 1);
  //     const foundPlayer = savedPlayers.find((p) => p.id === 'ply_0183456789abcdef0123456789abcdef');
  //     expect(foundPlayer).not.toBeNull();
  //   })
  //   it('should save player entries with deleted player', async () => {
  //     const editedData = cloneDeep(mockOrigData);
  //     const curData = cloneDeep(mockOrigData);
  //     const origData = cloneDeep(mockOrigData);
  //     const testAllData: allEntriesOneSquadType = { origData, curData };

  //     const rows = populateRows(editedData);
  //     expect(rows.length).toBe(6);
  //     rows.pop(); // delete player

  //     const updatedCounts = await saveEntriesData(rows, testAllData);
  //     expect(updatedCounts.players.updates).toBe(0);
  //     expect(updatedCounts.players.deletes).toBe(1);
  //     expect(updatedCounts.players.inserts).toBe(0);
  //   })
  //   it('should save player entries with updated player', async () => {
  //     const editedData = cloneDeep(mockOrigData);
  //     const curData = cloneDeep(mockOrigData);
  //     const origData = cloneDeep(mockOrigData);
  //     const testAllData: allEntriesOneSquadType = { origData, curData };

  //     const rows = populateRows(editedData);
  //     expect(rows.length).toBe(6);

  //     rows[0].first_name = 'Anna'; // update player

  //     const updatedCounts = await saveEntriesData(rows, testAllData);
  //     expect(updatedCounts.players.updates).toBe(1);
  //     expect(updatedCounts.players.deletes).toBe(0);
  //     expect(updatedCounts.players.inserts).toBe(0);
  //   })    
  //   it('should save player entries with inserted, deleted and updated player', async () => { 
  //     const editedData = cloneDeep(mockOrigData); 
  //     const curData = cloneDeep(mockOrigData);
  //     const origData = cloneDeep(mockOrigData);
  //     const testAllData: allEntriesOneSquadType = { origData, curData };

  //     const rows = populateRows(editedData);      
  //     expect(rows.length).toBe(6);

  //     rows.pop(); // delete player
  //     rows[0].first_name = 'Anna'; // update player

  //     const newRow = cloneDeep(rows[0]);    
  //     newRow.id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.player_id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.first_name = 'Gina'
  //     newRow.last_name = 'Davis'
  //     newRow.average = 200
  //     newRow.lane = 35
  //     newRow.position = 'Y'
  //     newRow.lanePos = '35-Y'
  //     newRow[divFeeColName] = '85'
  //     newRow[divHdcpColName] = 0
  //     newRow[potFeeColName] = '20'
  //     newRow[brkt1NumColName] = 4
  //     newRow[brkt1FeeColName] = '20'
  //     newRow[brkt2NumColName] = 40
  //     newRow[brkt2FeeColName] = '20'
  //     newRow[elim1FeeColName] = '5'
  //     newRow[elim2FeeColName] = '5'
  //     rows.push(newRow) // insert player

  //     const updatedCounts = await saveEntriesData(rows, testAllData);
  //     expect(updatedCounts.players.updates).toBe(1);
  //     expect(updatedCounts.players.deletes).toBe(1);
  //     expect(updatedCounts.players.inserts).toBe(1);  
  //   })
  //   it('should save div entries with inserted, deleted and updated div entry', async () => {
  //     const editedData = cloneDeep(mockOrigData);
  //     const curData = cloneDeep(mockOrigData);
  //     const origData = cloneDeep(mockOrigData);
  //     const testAllData: allEntriesOneSquadType = { origData, curData };

  //     const rows = populateRows(editedData);
  //     expect(rows.length).toBe(6);

  //     rows[2][divFeeColName] = ''; // delete div entry
  //     rows[0][divFeeColName] = '83'; // update div entry
  //     rows[1][divFeeColName] = '85'; // adds a new div entry (no fee yet for row in grid)

  //     const newRow = cloneDeep(rows[0]);
  //     newRow.id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.player_id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.first_name = 'Gina'
  //     newRow.last_name = 'Davis'
  //     newRow.average = 200
  //     newRow.lane = 35
  //     newRow.position = 'Y'
  //     newRow.lanePos = '35-Y'
  //     newRow[divFeeColName] = '85'
  //     newRow[divHdcpColName] = 0
  //     newRow[potFeeColName] = '20'
  //     newRow[brkt1NumColName] = 4
  //     newRow[brkt1FeeColName] = '20'
  //     newRow[brkt1TimeStampColName] = new Date().getTime()
  //     newRow[brkt2NumColName] = 40
  //     newRow[brkt2FeeColName] = '20'
  //     newRow[brkt2TimeStampColName] = new Date().getTime()
  //     newRow[elim1FeeColName] = '5'
  //     newRow[elim2FeeColName] = '5'
  //     rows.push(newRow) // insert player

  //     const updatedCounts = await saveEntriesData(rows, testAllData);
  //     expect(updatedCounts.divEntries.updates).toBe(1);
  //     expect(updatedCounts.divEntries.deletes).toBe(1);
  //     expect(updatedCounts.divEntries.inserts).toBe(2);        
  //   })
  //   it('should save pot entries with inserted, deleted and updated pot entry', async () => {
  //     const editedData = cloneDeep(mockOrigData);
  //     const curData = cloneDeep(mockOrigData);
  //     const origData = cloneDeep(mockOrigData);
  //     const testAllData: allEntriesOneSquadType = { origData, curData };

  //     const rows = populateRows(editedData);
  //     expect(rows.length).toBe(6);

  //     rows[2][potFeeColName] = ''; // delete pot entry      
  //     rows[0][potFeeColName] = '15'; // update pot entry
  //     rows[1][potFeeColName] = '20'; // adds a new pot entry (no fee yet for row in grid)

  //     const newRow = cloneDeep(rows[0]);
  //     newRow.id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.player_id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.first_name = 'Gina'
  //     newRow.last_name = 'Davis'
  //     newRow.average = 200
  //     newRow.lane = 35
  //     newRow.position = 'Y'
  //     newRow.lanePos = '35-Y'
  //     newRow[divFeeColName] = '85'
  //     newRow[divHdcpColName] = 0
  //     newRow[potFeeColName] = '20'
  //     newRow[brkt1NumColName] = 4
  //     newRow[brkt1FeeColName] = '20'
  //     newRow[brkt1TimeStampColName] = new Date().getTime()
  //     newRow[brkt2NumColName] = 40
  //     newRow[brkt2FeeColName] = '20'
  //     newRow[brkt2TimeStampColName] = new Date().getTime()
  //     newRow[elim1FeeColName] = '5'
  //     newRow[elim2FeeColName] = '5'
  //     rows.push(newRow) // insert player

  //     const updatedCounts = await saveEntriesData(rows, testAllData);
  //     expect(updatedCounts.potEntries.updates).toBe(1);
  //     expect(updatedCounts.potEntries.deletes).toBe(1);
  //     expect(updatedCounts.potEntries.inserts).toBe(2);  
  //   })
  //   it('should save brkt entries with inserted, deleted and updated brkt entry', async () => {
  //     const editedData = cloneDeep(mockOrigData);
  //     const curData = cloneDeep(mockOrigData);
  //     const origData = cloneDeep(mockOrigData);
  //     const testAllData: allEntriesOneSquadType = { origData, curData };

  //     const rows = populateRows(editedData);
  //     expect(rows.length).toBe(6);

  //     rows[4][brkt1NumColName] = 0;  // delete bracket entry
  //     rows[4][brkt1FeeColName] = ''; 
  //     rows[0][brkt2NumColName] = 0;  // delete bracket entry
  //     rows[0][brkt2FeeColName] = ''; 
  //     rows[0][brkt1NumColName] = 8;    // update bracket entry
  //     rows[0][brkt1FeeColName] = '40'; 
  //     rows[0][brkt1TimeStampColName] = new Date().getTime();
  //     rows[1][brkt1NumColName] = 6;    // adds a new bracket entry (no num yet for row in grid)
  //     rows[1][brkt1FeeColName] = '30'; 
  //     rows[1][brkt1TimeStampColName] = new Date().getTime();      
  //     rows[1][brkt2NumColName] = 6;    // adds a new bracket entry (no num yet for row in grid)
  //     rows[1][brkt2FeeColName] = '30'; 
  //     rows[1][brkt2TimeStampColName] = new Date().getTime();

  //     const newRow = cloneDeep(rows[0]);
  //     newRow.id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.player_id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.first_name = 'Gina'
  //     newRow.last_name = 'Davis'
  //     newRow.average = 200
  //     newRow.lane = 35
  //     newRow.position = 'Y'
  //     newRow.lanePos = '35-Y'
  //     newRow[divFeeColName] = '85'
  //     newRow[divHdcpColName] = 0
  //     newRow[potFeeColName] = '20'
  //     newRow[brkt1NumColName] = 4
  //     newRow[brkt1FeeColName] = '20'
  //     newRow[brkt1TimeStampColName] = new Date().getTime()
  //     newRow[brkt2NumColName] = 40
  //     newRow[brkt2FeeColName] = '20'
  //     newRow[brkt2TimeStampColName] = new Date().getTime()
  //     newRow[elim1FeeColName] = '5'
  //     newRow[elim2FeeColName] = '5'
  //     rows.push(newRow) // insert player

  //     const updatedCounts = await saveEntriesData(rows, testAllData);
  //     expect(updatedCounts.brktEntries.updates).toBe(1);
  //     expect(updatedCounts.brktEntries.deletes).toBe(2);
  //     expect(updatedCounts.brktEntries.inserts).toBe(4);  

  //   })
  //   it('should save elim entries with inserted, deleted and updated elim entry', async () => {
  //     const editedData = cloneDeep(mockOrigData);
  //     const curData = cloneDeep(mockOrigData);
  //     const origData = cloneDeep(mockOrigData);
  //     const testAllData: allEntriesOneSquadType = { origData, curData };

  //     const rows = populateRows(editedData);
  //     expect(rows.length).toBe(6);

  //     rows[5][elim1FeeColName] = '';   // delete elim entry
  //     rows[0][elim1FeeColName] = '15'; // update elim entry
  //     rows[0][elim2FeeColName] = '15'; // update elim entry
  //     rows[1][elim1FeeColName] = '5';  // adds a new elim entry (no fee yet for row in grid)

  //     const newRow = cloneDeep(rows[0]);
  //     newRow.id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.player_id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.first_name = 'Gina'
  //     newRow.last_name = 'Davis'
  //     newRow.average = 200
  //     newRow.lane = 35
  //     newRow.position = 'Y'
  //     newRow.lanePos = '35-Y'
  //     newRow[divFeeColName] = '85'
  //     newRow[divHdcpColName] = 0
  //     newRow[potFeeColName] = '20'
  //     newRow[brkt1NumColName] = 4
  //     newRow[brkt1FeeColName] = '20'
  //     newRow[brkt1TimeStampColName] = new Date().getTime()
  //     newRow[brkt2NumColName] = 40
  //     newRow[brkt2FeeColName] = '20'
  //     newRow[brkt2TimeStampColName] = new Date().getTime()
  //     newRow[elim1FeeColName] = '5'
  //     newRow[elim2FeeColName] = '5'
  //     rows.push(newRow) // insert player

  //     const updatedCounts = await saveEntriesData(rows, testAllData);
  //     expect(updatedCounts.elimEntries.updates).toBe(2);
  //     expect(updatedCounts.elimEntries.deletes).toBe(1);
  //     expect(updatedCounts.elimEntries.inserts).toBe(3);  
  //   })
  //   it('should save, insert and delete entries to players, divEntries, potEntries, brktEntries and elimEntries', async () => { 
  //     const editedData = cloneDeep(mockOrigData);
  //     const curData = cloneDeep(mockOrigData);
  //     const origData = cloneDeep(mockOrigData);
  //     const testAllData: allEntriesOneSquadType = { origData, curData };

  //     const rows = populateRows(editedData);
  //     expect(rows.length).toBe(6);

  //     rows.pop();                      // delete player, (div entry, elim entry also deleted casacased)
  //     rows[2][divFeeColName] = '';     // delete div entry
  //     rows[2][potFeeColName] = '';     // delete pot entry
  //     rows[4][brkt1NumColName] = '';   // delete brkt entry
  //     rows[4][brkt1FeeColName] = '';   // delete brkt entry      

  //     rows[0].first_name = 'Anna';     // update player
  //     rows[0][divFeeColName] = '83';   // update div entry
  //     rows[0][potFeeColName] = '15';   // update pot entry
  //     rows[0][brkt1NumColName] = 8;    // update bracket entry
  //     rows[0][brkt1FeeColName] = '40'; // update bracket entry
  //     rows[0][elim1FeeColName] = '15'; // update elim entry

  //     const newRow = cloneDeep(rows[0]);
  //     newRow.id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.player_id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.first_name = 'Gina'
  //     newRow.last_name = 'Davis'
  //     newRow.average = 200
  //     newRow.lane = 35
  //     newRow.position = 'Y'
  //     newRow.lanePos = '35-Y'
  //     newRow[divFeeColName] = '85'
  //     newRow[divHdcpColName] = 0
  //     newRow[potFeeColName] = '20'
  //     newRow[brkt1NumColName] = 4
  //     newRow[brkt1FeeColName] = '20'
  //     newRow[brkt1TimeStampColName] = new Date().getTime()
  //     newRow[brkt2NumColName] = 40
  //     newRow[brkt2FeeColName] = '20'
  //     newRow[brkt2TimeStampColName] = new Date().getTime()
  //     newRow[elim1FeeColName] = '5'
  //     newRow[elim2FeeColName] = '5'
  //     rows.push(newRow)  // insert player, div entry, pot entry, 2 brkt entry, 2 elim entry
      
  //     rows[1][divFeeColName] = '85';   // adds a new div entry (no fee yet for row in grid)
  //     rows[1][potFeeColName] = '20';   // adds a new pot entry (no fee yet for row in grid)      
  //     rows[1][brkt1NumColName] = 6;    // adds a new bracket entry (no num yet for row in grid)
  //     rows[1][brkt1FeeColName] = '30';       
  //     rows[1][brkt1TimeStampColName] = new Date().getTime();
  //     rows[1][elim1FeeColName] = '5';  // adds a new elim entry (no fee yet for row in grid)

  //     const updatedCounts = await saveEntriesData(rows, testAllData);
  //     expect(updatedCounts.players.updates).toBe(1);
  //     expect(updatedCounts.players.deletes).toBe(1);
  //     expect(updatedCounts.players.inserts).toBe(1);  
 
  //     expect(updatedCounts.divEntries.updates).toBe(1);
  //     expect(updatedCounts.divEntries.deletes).toBe(1);
  //     expect(updatedCounts.divEntries.inserts).toBe(2);  

  //     expect(updatedCounts.potEntries.updates).toBe(1);
  //     expect(updatedCounts.potEntries.deletes).toBe(1);
  //     expect(updatedCounts.potEntries.inserts).toBe(2);  

  //     expect(updatedCounts.brktEntries.updates).toBe(1);
  //     expect(updatedCounts.brktEntries.deletes).toBe(1);
  //     expect(updatedCounts.brktEntries.inserts).toBe(3);  
  
  //     expect(updatedCounts.elimEntries.updates).toBe(1);
  //     expect(updatedCounts.elimEntries.deletes).toBe(0);
  //     expect(updatedCounts.elimEntries.inserts).toBe(3);  
  //   })
  //   it('should return errors when rows is null', async () => {      
  //     const updatedCounts = await saveEntriesData(null as any, mockAllEntrisOneSquad);
  //     expect(updatedCounts.players.updates).toBe(-1);
  //     expect(updatedCounts.players.deletes).toBe(-1);
  //     expect(updatedCounts.players.inserts).toBe(-1);

  //     expect(updatedCounts.divEntries.updates).toBe(-1);
  //     expect(updatedCounts.divEntries.deletes).toBe(-1);
  //     expect(updatedCounts.divEntries.inserts).toBe(-1);

  //     expect(updatedCounts.potEntries.updates).toBe(-1);
  //     expect(updatedCounts.potEntries.deletes).toBe(-1);
  //     expect(updatedCounts.potEntries.inserts).toBe(-1);

  //     expect(updatedCounts.brktEntries.updates).toBe(-1);
  //     expect(updatedCounts.brktEntries.deletes).toBe(-1);
  //     expect(updatedCounts.brktEntries.inserts).toBe(-1);

  //     expect(updatedCounts.elimEntries.updates).toBe(-1);
  //     expect(updatedCounts.elimEntries.deletes).toBe(-1);
  //     expect(updatedCounts.elimEntries.inserts).toBe(-1);
  //   })
  //   it('should return errors when allEntries is null', async () => { 
  //     const editedData = cloneDeep(mockOrigData);
  //     const rows = populateRows(editedData);
  //     const updatedCounts = await saveEntriesData(rows, null as any);
  //     expect(updatedCounts.players.updates).toBe(-1);
  //     expect(updatedCounts.players.deletes).toBe(-1);
  //     expect(updatedCounts.players.inserts).toBe(-1);

  //     expect(updatedCounts.divEntries.updates).toBe(-1);
  //     expect(updatedCounts.divEntries.deletes).toBe(-1);
  //     expect(updatedCounts.divEntries.inserts).toBe(-1);

  //     expect(updatedCounts.potEntries.updates).toBe(-1);
  //     expect(updatedCounts.potEntries.deletes).toBe(-1);
  //     expect(updatedCounts.potEntries.inserts).toBe(-1);

  //     expect(updatedCounts.brktEntries.updates).toBe(-1);
  //     expect(updatedCounts.brktEntries.deletes).toBe(-1);
  //     expect(updatedCounts.brktEntries.inserts).toBe(-1);

  //     expect(updatedCounts.elimEntries.updates).toBe(-1);
  //     expect(updatedCounts.elimEntries.deletes).toBe(-1);
  //     expect(updatedCounts.elimEntries.inserts).toBe(-1);
  //   })
  //   it('should return errors when allEntries.curData is null', async () => { 
  //     const badData = cloneDeep(mockAllEntrisOneSquad);
  //     badData.curData = null as any;
  //     const editedData = cloneDeep(mockOrigData);
  //     const rows = populateRows(editedData);
  //     const updatedCounts = await saveEntriesData(rows, badData);
  //     expect(updatedCounts.players.updates).toBe(-1);
  //     expect(updatedCounts.players.deletes).toBe(-1);
  //     expect(updatedCounts.players.inserts).toBe(-1);

  //     expect(updatedCounts.divEntries.updates).toBe(-1);
  //     expect(updatedCounts.divEntries.deletes).toBe(-1);
  //     expect(updatedCounts.divEntries.inserts).toBe(-1);

  //     expect(updatedCounts.potEntries.updates).toBe(-1);
  //     expect(updatedCounts.potEntries.deletes).toBe(-1);
  //     expect(updatedCounts.potEntries.inserts).toBe(-1);

  //     expect(updatedCounts.brktEntries.updates).toBe(-1);
  //     expect(updatedCounts.brktEntries.deletes).toBe(-1);
  //     expect(updatedCounts.brktEntries.inserts).toBe(-1);

  //     expect(updatedCounts.elimEntries.updates).toBe(-1);
  //     expect(updatedCounts.elimEntries.deletes).toBe(-1);
  //     expect(updatedCounts.elimEntries.inserts).toBe(-1);
  //   })
  //   it('should return errors when allEntries.origData is null', async () => { 
  //     const badData = cloneDeep(mockAllEntrisOneSquad);
  //     badData.origData = null as any;
  //     const editedData = cloneDeep(mockOrigData);
  //     const rows = populateRows(editedData);
  //     const updatedCounts = await saveEntriesData(rows, badData);
  //     expect(updatedCounts.players.updates).toBe(-1);
  //     expect(updatedCounts.players.deletes).toBe(-1);
  //     expect(updatedCounts.players.inserts).toBe(-1);

  //     expect(updatedCounts.divEntries.updates).toBe(-1);
  //     expect(updatedCounts.divEntries.deletes).toBe(-1);
  //     expect(updatedCounts.divEntries.inserts).toBe(-1);

  //     expect(updatedCounts.potEntries.updates).toBe(-1);
  //     expect(updatedCounts.potEntries.deletes).toBe(-1);
  //     expect(updatedCounts.potEntries.inserts).toBe(-1);

  //     expect(updatedCounts.brktEntries.updates).toBe(-1);
  //     expect(updatedCounts.brktEntries.deletes).toBe(-1);
  //     expect(updatedCounts.brktEntries.inserts).toBe(-1);

  //     expect(updatedCounts.elimEntries.updates).toBe(-1);
  //     expect(updatedCounts.elimEntries.deletes).toBe(-1);
  //     expect(updatedCounts.elimEntries.inserts).toBe(-1);
  //   })
  //   it('should return errors when allEntries.curData.squadId is invalid', async () => { 
  //     const badData = cloneDeep(mockAllEntrisOneSquad);
  //     badData.origData.squadId = 'test';
  //     const editedData = cloneDeep(mockOrigData);
  //     const rows = populateRows(editedData);
  //     const updatedCounts = await saveEntriesData(rows, badData);
  //     expect(updatedCounts.players.updates).toBe(-1);
  //     expect(updatedCounts.players.deletes).toBe(-1);
  //     expect(updatedCounts.players.inserts).toBe(-1);

  //     expect(updatedCounts.divEntries.updates).toBe(-1);
  //     expect(updatedCounts.divEntries.deletes).toBe(-1);
  //     expect(updatedCounts.divEntries.inserts).toBe(-1);

  //     expect(updatedCounts.potEntries.updates).toBe(-1);
  //     expect(updatedCounts.potEntries.deletes).toBe(-1);
  //     expect(updatedCounts.potEntries.inserts).toBe(-1);

  //     expect(updatedCounts.brktEntries.updates).toBe(-1);
  //     expect(updatedCounts.brktEntries.deletes).toBe(-1);
  //     expect(updatedCounts.brktEntries.inserts).toBe(-1);

  //     expect(updatedCounts.elimEntries.updates).toBe(-1);
  //     expect(updatedCounts.elimEntries.deletes).toBe(-1);
  //     expect(updatedCounts.elimEntries.inserts).toBe(-1);
  //   })
  //   it('should return no saves when rows is empty', async () => {            
  //     const updatedCounts = await saveEntriesData([], mockAllEntrisOneSquad);
  //     expect(updatedCounts.players.updates).toBe(0);
  //     expect(updatedCounts.players.deletes).toBe(0);
  //     expect(updatedCounts.players.inserts).toBe(0);

  //     expect(updatedCounts.divEntries.updates).toBe(0);
  //     expect(updatedCounts.divEntries.deletes).toBe(0);
  //     expect(updatedCounts.divEntries.inserts).toBe(0);

  //     expect(updatedCounts.potEntries.updates).toBe(0);
  //     expect(updatedCounts.potEntries.deletes).toBe(0);
  //     expect(updatedCounts.potEntries.inserts).toBe(0);

  //     expect(updatedCounts.brktEntries.updates).toBe(0);
  //     expect(updatedCounts.brktEntries.deletes).toBe(0);
  //     expect(updatedCounts.brktEntries.inserts).toBe(0);

  //     expect(updatedCounts.elimEntries.updates).toBe(0);
  //     expect(updatedCounts.elimEntries.deletes).toBe(0);
  //     expect(updatedCounts.elimEntries.inserts).toBe(0);
  //   })
  // })

  // describe('update individual tables in curData', () => {
  //   const divFeeColName = entryFeeColName(mockOrigData.divEntries[0].div_id);
  //   const divHdcpColName = divEntryHdcpColName(mockOrigData.divEntries[0].div_id);

  //   const potFeeColName = entryFeeColName(mockOrigData.potEntries[0].pot_id);

  //   const brkt1NumColName = entryNumBrktsColName(mockOrigData.brktEntries[0].brkt_id);
  //   const brkt1FeeColName = entryFeeColName(mockOrigData.brktEntries[0].brkt_id);
  //   const brkt1TimeStampColName = timeStampColName(mockOrigData.brktEntries[0].brkt_id);
  //   const brkt2NumColName = entryNumBrktsColName(mockOrigData.brktEntries[1].brkt_id);
  //   const brkt2FeeColName = entryFeeColName(mockOrigData.brktEntries[1].brkt_id);
  //   const brkt2TimeStampColName = timeStampColName(mockOrigData.brktEntries[1].brkt_id);

  //   const elim1FeeColName = entryFeeColName(mockOrigData.elimEntries[0].elim_id);
  //   const elim2FeeColName = entryFeeColName(mockOrigData.elimEntries[1].elim_id);

  //   const saveMockTmnt = async () => {
  //     const savedTmnt = await postTmnt(mockDataOneTmnt.tmnt);
  //     if (!savedTmnt) return null;
  //     const savedEvents = await postManyEvents(mockDataOneTmnt.events);
  //     if (!savedEvents) return null;
  //     const savedDivs = await postManyDivs(mockDataOneTmnt.divs);
  //     if (!savedDivs) return null;
  //     const savedSquads = await postManySquads(mockDataOneTmnt.squads);
  //     if (!savedSquads) return null;
  //     const savedPots = await postManyPots(mockDataOneTmnt.pots);
  //     if (!savedPots) return null;
  //     const savedBrkts = await postManyBrkts(mockDataOneTmnt.brkts);
  //     if (!savedBrkts) return null;
  //     const savedElims = await postManyElims(mockDataOneTmnt.elims);
  //     if (!savedElims) return null;
  //     return savedTmnt
  //   }
  //   const saveMockEntries = async () => {
  //     const savedPlayers = await postManyPlayers(mockOrigData.players);
  //     if (!savedPlayers) return null;
  //     const savedDivEntries = await postManyDivEntries(mockOrigData.divEntries);
  //     if (!savedDivEntries) return null;
  //     const savedPotEntries = await postManyPotEntries(mockOrigData.potEntries);
  //     if (!savedPotEntries) return null;
  //     const savedBrktEntries = await postManyBrktEntries(mockOrigData.brktEntries);
  //     if (!savedBrktEntries) return null;
  //     const savedElimEntries = await postManyElimEntries(mockOrigData.elimEntries);
  //     if (!savedElimEntries) return null;
  //     return savedPlayers;
  //   }

  //   beforeAll(async () => {
  //     await deleteTmnt(mockDataOneTmnt.tmnt.id);
  //     await saveMockTmnt()
  //   })

  //   beforeEach(async () => {
  //     await saveMockEntries();
  //   })

  //   afterEach(async () => {
  //     // deletes all tmnt players, divEntries, potEntries, brktEntries, elimEntries
  //     await deleteAllTmntPlayers(mockDataOneTmnt.tmnt.id);
  //   })

  //   afterAll(async () => {
  //     // deletes tmnt, events, divs, pots, brkts, elims and player entries
  //     await deleteTmnt(mockDataOneTmnt.tmnt.id); // delete       
  //   })

  //   it('should update original players with inserted, deleted and updated player', async () => { 
  //     const editedData = cloneDeep(mockOrigData); 
  //     const curData = cloneDeep(mockOrigData);
  //     const origData = cloneDeep(mockOrigData);
  //     const testAllData: allEntriesOneSquadType = { origData, curData };

  //     const rows = populateRows(editedData);      
  //     expect(rows.length).toBe(6);

  //     rows.pop(); // delete player
  //     rows[0].first_name = 'Anna'; // update player

  //     const newRow = cloneDeep(rows[0]);    
  //     newRow.id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.player_id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.first_name = 'Gina'
  //     newRow.last_name = 'Davis'
  //     newRow.average = 200
  //     newRow.lane = 35
  //     newRow.position = 'Y'
  //     newRow.lanePos = '35-Y'
  //     newRow[divFeeColName] = '85'
  //     newRow[divHdcpColName] = 0
  //     newRow[potFeeColName] = '20'
  //     newRow[brkt1NumColName] = 4
  //     newRow[brkt1FeeColName] = '20'
  //     newRow[brkt2NumColName] = 40
  //     newRow[brkt2FeeColName] = '20'
  //     newRow[elim1FeeColName] = '5'
  //     newRow[elim2FeeColName] = '5'
  //     rows.push(newRow) // insert player

  //     const updatedInfo = await saveEntriesData(rows, testAllData);
  //     expect(updatedInfo.players.updates).toBe(1);
  //     expect(updatedInfo.players.deletes).toBe(1);
  //     expect(updatedInfo.players.inserts).toBe(1);     
      
  //     // count of total updates, deletes and inserts
  //     const updatedCount = updateCurrentPlayers(updatedInfo.playersToUpdate, testAllData);
  //     expect(updatedCount).toBe(3);
  //     expect(testAllData.curData.players.length).toBe(6);
  //     expect(testAllData.curData.players[0].id).toBe('ply_0123456789abcdef0123456789abcdef');
  //     expect(testAllData.curData.players[1].id).toBe('ply_0133456789abcdef0123456789abcdef');
  //     expect(testAllData.curData.players[2].id).toBe('ply_0143456789abcdef0123456789abcdef');
  //     expect(testAllData.curData.players[3].id).toBe('ply_0153456789abcdef0123456789abcdef');
  //     expect(testAllData.curData.players[4].id).toBe('ply_0163456789abcdef0123456789abcdef');
  //     expect(testAllData.curData.players[5].id).toBe('ply_0183456789abcdef0123456789abcdef');

  //     // updated row
  //     expect(testAllData.curData.players[0].first_name).toBe('Anna')

  //     // delete row
  //     const foundDeleted = testAllData.curData.players.find((p) => p.id === 'ply_0173456789abcdef0123456789abcdef')
  //     expect(foundDeleted).toBeUndefined();

  //     // inserted row
  //     const foundInserted = testAllData.curData.players.find((p) => p.id === 'ply_0183456789abcdef0123456789abcdef')
  //     expect(foundInserted).not.toBeUndefined();
  //   })
  //   it('should update original div entries with inserted, deleted and updated div entry', async () => {
  //     const editedData = cloneDeep(mockOrigData);
  //     const curData = cloneDeep(mockOrigData);
  //     const origData = cloneDeep(mockOrigData);
  //     const testAllData: allEntriesOneSquadType = { origData, curData };

  //     const rows = populateRows(editedData);
  //     expect(rows.length).toBe(6);

  //     rows[2][divFeeColName] = ''; // delete div entry
  //     rows[0][divFeeColName] = '83'; // update div entry
  //     rows[1][divFeeColName] = '86'; // adds a new div entry (no fee yet for row in grid)

  //     const newRow = cloneDeep(rows[0]);
  //     newRow.id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.player_id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.first_name = 'Gina'
  //     newRow.last_name = 'Davis'
  //     newRow.average = 200
  //     newRow.lane = 35
  //     newRow.position = 'Y'
  //     newRow.lanePos = '35-Y'
  //     newRow[divFeeColName] = '86'
  //     newRow[divHdcpColName] = 0
  //     newRow[potFeeColName] = '20'
  //     newRow[brkt1NumColName] = 4
  //     newRow[brkt1FeeColName] = '20'
  //     newRow[brkt1TimeStampColName] = new Date().getTime()
  //     newRow[brkt2NumColName] = 40
  //     newRow[brkt2FeeColName] = '20'
  //     newRow[brkt2TimeStampColName] = new Date().getTime()
  //     newRow[elim1FeeColName] = '5'
  //     newRow[elim2FeeColName] = '5'
  //     rows.push(newRow) // insert player

  //     const updatedCounts = await saveEntriesData(rows, testAllData);
  //     expect(updatedCounts.divEntries.updates).toBe(1);
  //     expect(updatedCounts.divEntries.deletes).toBe(1);
  //     expect(updatedCounts.divEntries.inserts).toBe(2);

  //     const updatedCount = updateCurrentDivEntries(updatedCounts.divEntriesToUpdate, testAllData);      
  //     expect(updatedCount).toBe(4);
  //     expect(testAllData.curData.divEntries.length).toBe(6);

  //     // updated rows
  //     expect(testAllData.curData.divEntries[0].fee).toBe('83')      

  //     // deleted row
  //     const foundDeleted = testAllData.curData.divEntries.find((d) => d.id === 'den_0133456789abcdef0123456789abcdef')  
  //     expect(foundDeleted).toBeUndefined();

  //     // inserted rows
  //     const foundInserted = testAllData.curData.divEntries.filter((d) => d.fee === '86')
  //     expect(foundInserted).toHaveLength(2);
  //   })
  //   it('should update original pot entries with inserted, deleted and updated pot entry', async () => {
  //     const editedData = cloneDeep(mockOrigData);
  //     const curData = cloneDeep(mockOrigData);
  //     const origData = cloneDeep(mockOrigData);
  //     const testAllData: allEntriesOneSquadType = { origData, curData };

  //     const rows = populateRows(editedData);
  //     expect(rows.length).toBe(6);

  //     rows[2][potFeeColName] = ''; // delete pot entry      
  //     rows[0][potFeeColName] = '15'; // update pot entry
  //     rows[1][potFeeColName] = '19'; // adds a new pot entry (no fee yet for row in grid)

  //     const newRow = cloneDeep(rows[0]);
  //     newRow.id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.player_id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.first_name = 'Gina'
  //     newRow.last_name = 'Davis'
  //     newRow.average = 200
  //     newRow.lane = 35
  //     newRow.position = 'Y'
  //     newRow.lanePos = '35-Y'
  //     newRow[divFeeColName] = '85'
  //     newRow[divHdcpColName] = 0
  //     newRow[potFeeColName] = '19'
  //     newRow[brkt1NumColName] = 4
  //     newRow[brkt1FeeColName] = '20'
  //     newRow[brkt1TimeStampColName] = new Date().getTime()
  //     newRow[brkt2NumColName] = 40
  //     newRow[brkt2FeeColName] = '20'
  //     newRow[brkt2TimeStampColName] = new Date().getTime()
  //     newRow[elim1FeeColName] = '5'
  //     newRow[elim2FeeColName] = '5'
  //     rows.push(newRow) // insert player

  //     const updatedInfo = await saveEntriesData(rows, testAllData);
  //     expect(updatedInfo.potEntries.updates).toBe(1);
  //     expect(updatedInfo.potEntries.deletes).toBe(1);
  //     expect(updatedInfo.potEntries.inserts).toBe(2);  

  //     const updatedCount = updateCurrentPotEntries(updatedInfo.potEntriesToUpdate, testAllData);      
  //     expect(updatedCount).toBe(4);
  //     expect(testAllData.curData.potEntries.length).toBe(4);

  //     // updated row
  //     expect(testAllData.curData.potEntries[0].fee).toBe('15')  
      
  //     // deleted row
  //     const foundDeleted = testAllData.curData.potEntries.find((p) => p.id === 'pen_0133456789abcdef0123456789abcdef')  
  //     expect(foundDeleted).toBeUndefined();

  //     // inserted rows
  //     const foundInserted = testAllData.curData.potEntries.filter((p) => p.fee === '19')
  //     expect(foundInserted).toHaveLength(2);
  //   })
  //   it('should update original brkt entries with inserted, deleted and updated brkt entry', async () => {
  //     const editedData = cloneDeep(mockOrigData);
  //     const curData = cloneDeep(mockOrigData);
  //     const origData = cloneDeep(mockOrigData);
  //     const testAllData: allEntriesOneSquadType = { origData, curData };

  //     const rows = populateRows(editedData);
  //     expect(rows.length).toBe(6);

  //     rows[4][brkt1NumColName] = 0;  // delete bracket entry
  //     rows[4][brkt1FeeColName] = '';       
  //     rows[0][brkt2NumColName] = 0;  // delete bracket entry
  //     rows[0][brkt2FeeColName] = ''; 
  //     rows[0][brkt1NumColName] = 8;    // update bracket entry
  //     rows[0][brkt1FeeColName] = '40'; 
  //     rows[0][brkt1TimeStampColName] = new Date().getTime();
  //     rows[1][brkt1NumColName] = 3;    // adds a new bracket entry (no num yet for row in grid)
  //     rows[1][brkt1FeeColName] = '15'; 
  //     rows[1][brkt1TimeStampColName] = new Date().getTime();      
  //     rows[1][brkt2NumColName] = 3;    // adds a new bracket entry (no num yet for row in grid)
  //     rows[1][brkt2FeeColName] = '15'; 
  //     rows[1][brkt2TimeStampColName] = new Date().getTime();

  //     const newRow = cloneDeep(rows[0]);
  //     newRow.id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.player_id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.first_name = 'Gina'
  //     newRow.last_name = 'Davis'
  //     newRow.average = 200
  //     newRow.lane = 35
  //     newRow.position = 'Y'
  //     newRow.lanePos = '35-Y'
  //     newRow[divFeeColName] = '85'
  //     newRow[divHdcpColName] = 0
  //     newRow[potFeeColName] = '20'
  //     newRow[brkt1NumColName] = 3
  //     newRow[brkt1FeeColName] = '15'
  //     newRow[brkt1TimeStampColName] = new Date().getTime()
  //     newRow[brkt2NumColName] = 3
  //     newRow[brkt2FeeColName] = '15'
  //     newRow[brkt2TimeStampColName] = new Date().getTime()
  //     newRow[elim1FeeColName] = '5'
  //     newRow[elim2FeeColName] = '5'
  //     rows.push(newRow) // insert player

  //     const updatedInfo = await saveEntriesData(rows, testAllData);
  //     expect(updatedInfo.brktEntries.updates).toBe(1);
  //     expect(updatedInfo.brktEntries.deletes).toBe(2);
  //     expect(updatedInfo.brktEntries.inserts).toBe(4);  

  //     const updatedCount = updateCurrentBrktEntries(updatedInfo.brktEntriesToUpdate, testAllData);
  //     expect(updatedCount).toBe(7);
  //     expect(testAllData.curData.brktEntries.length).toBe(6);

  //     // updated row
  //     expect(testAllData.curData.brktEntries[0].num_brackets).toBe(8)  
  //     expect(testAllData.curData.brktEntries[0].fee).toBe('40')  
  //     expect(testAllData.curData.brktEntries[0].time_stamp).not.toBeUndefined();
      
  //     // deleted rows
  //     const foundDeleted = testAllData.curData.brktEntries.find((b) => b.id === 'pen_0133456789abcdef0123456789abcdef')
  //     expect(foundDeleted).toBeUndefined();
  //     const foundDeleted2 = testAllData.curData.brktEntries.find((b) => b.id === 'pen_0143456789abcdef0123456789abcdef')
  //     expect(foundDeleted2).toBeUndefined();
      
  //     // inserted rows
  //     const foundInserted = testAllData.curData.brktEntries.filter((b) => b.num_brackets === 3)
  //     expect(foundInserted).toHaveLength(4);
  //   })
  //   it('should update original elim entries with inserted, deleted and updated elim entry', async () => {
  //     const editedData = cloneDeep(mockOrigData);
  //     const curData = cloneDeep(mockOrigData);
  //     const origData = cloneDeep(mockOrigData);
  //     const testAllData: allEntriesOneSquadType = { origData, curData };

  //     const rows = populateRows(editedData);
  //     expect(rows.length).toBe(6);

  //     rows[5][elim1FeeColName] = '';   // delete elim entry
  //     rows[0][elim1FeeColName] = '15'; // update elim entry
  //     rows[0][elim2FeeColName] = '15'; // update elim entry
  //     rows[1][elim1FeeColName] = '4';  // adds a new elim entry (no fee yet for row in grid)

  //     const newRow = cloneDeep(rows[0]);
  //     newRow.id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.player_id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.first_name = 'Gina'
  //     newRow.last_name = 'Davis'
  //     newRow.average = 200
  //     newRow.lane = 35
  //     newRow.position = 'Y'
  //     newRow.lanePos = '35-Y'
  //     newRow[divFeeColName] = '85'
  //     newRow[divHdcpColName] = 0
  //     newRow[potFeeColName] = '20'
  //     newRow[brkt1NumColName] = 4
  //     newRow[brkt1FeeColName] = '20'
  //     newRow[brkt1TimeStampColName] = new Date().getTime()
  //     newRow[brkt2NumColName] = 40
  //     newRow[brkt2FeeColName] = '20'
  //     newRow[brkt2TimeStampColName] = new Date().getTime()
  //     newRow[elim1FeeColName] = '4'
  //     newRow[elim2FeeColName] = '4'
  //     rows.push(newRow) // insert player

  //     const updatedInfo = await saveEntriesData(rows, testAllData);
  //     expect(updatedInfo.elimEntries.updates).toBe(2);
  //     expect(updatedInfo.elimEntries.deletes).toBe(1);
  //     expect(updatedInfo.elimEntries.inserts).toBe(3); 
      
  //     const updatedCount = updateCurrentElimEntries(updatedInfo.elimEntriesToUpdate, testAllData);
  //     expect(updatedCount).toBe(6);
  //     expect(testAllData.curData.elimEntries.length).toBe(6);

  //     // updated rows
  //     expect(testAllData.curData.elimEntries[0].fee).toBe('15')
  //     expect(testAllData.curData.elimEntries[1].fee).toBe('15')

  //     // deleted rows
  //     const foundDeleted = testAllData.curData.elimEntries.find((e) => e.id === 'een_0143456789abcdef0123456789abcdef')
  //     expect(foundDeleted).toBeUndefined();
      
  //     // inserted rows
  //     const foundInserted = testAllData.curData.elimEntries.filter((e) => e.fee === '4')
  //     expect(foundInserted).toHaveLength(3);
  //   })
  //   // it('should update original players, divEntries, potEntries, brktEntries and elimEntries', async () => { 

  //   //   const editedData = cloneDeep(mockOrigData);
  //   //   const curData = cloneDeep(mockOrigData);
  //   //   const origData = cloneDeep(mockOrigData);
  //   //   const testAllData: allEntriesOneSquadType = { origData, curData };

  //   //   const rows = populateRows(editedData);
  //   //   expect(rows.length).toBe(6);

  //   //   rows.pop();                      // delete player, (div entry, elim entry also deleted casacased)
  //   //   rows[2][divFeeColName] = '';     // delete div entry
  //   //   rows[2][potFeeColName] = '';     // delete pot entry
  //   //   rows[4][brkt1NumColName] = '';   // delete brkt entry
  //   //   rows[4][brkt1FeeColName] = '';   // delete brkt entry      

  //   //   rows[0].first_name = 'Anna';     // update player
  //   //   rows[0][divFeeColName] = '83';   // update div entry
  //   //   rows[0][potFeeColName] = '15';   // update pot entry
  //   //   rows[0][brkt1NumColName] = 8;    // update bracket entry
  //   //   rows[0][brkt1FeeColName] = '40'; 
  //   //   rows[0][brkt1TimeStampColName] = new Date().getTime()
  //   //   rows[0][elim1FeeColName] = '15'; // update elim entry

  //   //   const newRow = cloneDeep(rows[0]);
  //   //   newRow.id = 'ply_0183456789abcdef0123456789abcdef'
  //   //   newRow.player_id = 'ply_0183456789abcdef0123456789abcdef'
  //   //   newRow.first_name = 'Gina'
  //   //   newRow.last_name = 'Davis'
  //   //   newRow.average = 200
  //   //   newRow.lane = 35
  //   //   newRow.position = 'Y'
  //   //   newRow.lanePos = '35-Y'
  //   //   newRow[divFeeColName] = '85'
  //   //   newRow[divHdcpColName] = 0
  //   //   newRow[potFeeColName] = '20'
  //   //   newRow[brkt1NumColName] = 4
  //   //   newRow[brkt1FeeColName] = '20'
  //   //   newRow[brkt1TimeStampColName] = new Date().getTime()
  //   //   newRow[brkt2NumColName] = 40
  //   //   newRow[brkt2FeeColName] = '20'
  //   //   newRow[brkt2TimeStampColName] = new Date().getTime()
  //   //   newRow[elim1FeeColName] = '5'
  //   //   newRow[elim2FeeColName] = '5'
  //   //   rows.push(newRow)  // insert player, div entry, pot entry, 2 brkt entry, 2 elim entry
      
  //   //   rows[1][divFeeColName] = '85';   // adds a new div entry (no fee yet for row in grid)
  //   //   rows[1][potFeeColName] = '20';   // adds a new pot entry (no fee yet for row in grid)      
  //   //   rows[1][brkt1NumColName] = 6;    // adds a new bracket entry (no num yet for row in grid)
  //   //   rows[1][brkt1FeeColName] = '30';       
  //   //   rows[1][brkt1TimeStampColName] = new Date().getTime();
  //   //   rows[1][elim1FeeColName] = '5';  // adds a new elim entry (no fee yet for row in grid)

  //   //   const updatedInfo = await saveEntriesData(rows, testAllData);
  //   //   expect(updatedInfo.players.updates).toBe(1);
  //   //   expect(updatedInfo.players.deletes).toBe(1);
  //   //   expect(updatedInfo.players.inserts).toBe(1);  
 
  //   //   expect(updatedInfo.divEntries.updates).toBe(1);
  //   //   expect(updatedInfo.divEntries.deletes).toBe(1); // when players deleted, deleted 1 divEntry, so 1 here not 2
  //   //   expect(updatedInfo.divEntries.inserts).toBe(2);  

  //   //   expect(updatedInfo.potEntries.updates).toBe(1);
  //   //   expect(updatedInfo.potEntries.deletes).toBe(1);
  //   //   expect(updatedInfo.potEntries.inserts).toBe(2);  

  //   //   expect(updatedInfo.brktEntries.updates).toBe(1);
  //   //   expect(updatedInfo.brktEntries.deletes).toBe(1);
  //   //   expect(updatedInfo.brktEntries.inserts).toBe(3);  
  
  //   //   expect(updatedInfo.elimEntries.updates).toBe(1);
  //   //   expect(updatedInfo.elimEntries.deletes).toBe(0); // when players deleted, deleted 2 elimEntry, so 0 here not 2
  //   //   expect(updatedInfo.elimEntries.inserts).toBe(3); 
      
  //   //   const updatedCounts = updateOneSquadEntries(updatedInfo, testAllData);
  //   //   expect(updatedCounts.players).toBe(3)
  //   //   expect(updatedCounts.divEntries).toBe(5) // + 1 for cascade delete
  //   //   expect(updatedCounts.potEntries).toBe(4) 
  //   //   expect(updatedCounts.brktEntries).toBe(5)
  //   //   expect(updatedCounts.elimEntries).toBe(6); // + 2 for cascade delete

  //   //   // updated rows
  //   //   expect(testAllData.curData.players[0].first_name).toBe('Anna');
  //   //   expect(testAllData.curData.divEntries[0].fee).toBe('83');
  //   //   expect(testAllData.curData.potEntries[0].fee).toBe('15');
  //   //   expect(testAllData.curData.brktEntries[0].num_brackets).toBe(8);
  //   //   expect(testAllData.curData.brktEntries[0].fee).toBe('40');
  //   //   expect(testAllData.curData.elimEntries[0].fee).toBe('15');

  //   //   // deleted rows
  //   //   const foundPlayer = testAllData.curData.players.find((p) => p.id === 'ply_0173456789abcdef0123456789abcdef');
  //   //   expect(foundPlayer).toBeUndefined();

  //   //   let foundDivEntry = testAllData.curData.divEntries.find((d) => d.id === 'den_0133456789abcdef0123456789abcdef');
  //   //   expect(foundDivEntry).toBeUndefined();
  //   //   foundDivEntry = testAllData.curData.divEntries.find((d) => d.id === 'den_0163456789abcdef0123456789abcdef');
  //   //   expect(foundDivEntry).toBeUndefined();

  //   //   const foundPotEntry = testAllData.curData.potEntries.find((p) => p.id === 'pen_0133456789abcdef0123456789abcdef');
  //   //   expect(foundPotEntry).toBeUndefined();

  //   //   const foundBrktEntry = testAllData.curData.brktEntries.find((b) => b.id === 'ben_0143456789abcdef0123456789abcdef');
  //   //   expect(foundBrktEntry).toBeUndefined();

  //   //   let foundElimEntry = testAllData.curData.elimEntries.find((e) => e.id === 'een_0143456789abcdef0123456789abcdef')
  //   //   expect(foundElimEntry).toBeUndefined();
  //   //   foundElimEntry = testAllData.curData.elimEntries.find((e) => e.id === 'een_0153456789abcdef0123456789abcdef')
  //   //   expect(foundElimEntry).toBeUndefined();
  //   // })
  // })

  // describe('update all tables at once in curData', () => {
  //   const divFeeColName = entryFeeColName(mockOrigData.divEntries[0].div_id);
  //   const divHdcpColName = divEntryHdcpColName(mockOrigData.divEntries[0].div_id);

  //   const potFeeColName = entryFeeColName(mockOrigData.potEntries[0].pot_id);

  //   const brkt1NumColName = entryNumBrktsColName(mockOrigData.brktEntries[0].brkt_id);
  //   const brkt1FeeColName = entryFeeColName(mockOrigData.brktEntries[0].brkt_id);
  //   const brkt1TimeStampColName = timeStampColName(mockOrigData.brktEntries[0].brkt_id);
  //   const brkt2NumColName = entryNumBrktsColName(mockOrigData.brktEntries[1].brkt_id);
  //   const brkt2FeeColName = entryFeeColName(mockOrigData.brktEntries[1].brkt_id);
  //   const brkt2TimeStampColName = timeStampColName(mockOrigData.brktEntries[1].brkt_id);

  //   const elim1FeeColName = entryFeeColName(mockOrigData.elimEntries[0].elim_id);
  //   const elim2FeeColName = entryFeeColName(mockOrigData.elimEntries[1].elim_id);

  //   const saveMockTmnt = async () => {
  //     const savedTmnt = await postTmnt(mockDataOneTmnt.tmnt);
  //     if (!savedTmnt) return null;
  //     const savedEvents = await postManyEvents(mockDataOneTmnt.events);
  //     if (!savedEvents) return null;
  //     const savedDivs = await postManyDivs(mockDataOneTmnt.divs);
  //     if (!savedDivs) return null;
  //     const savedSquads = await postManySquads(mockDataOneTmnt.squads);
  //     if (!savedSquads) return null;
  //     const savedPots = await postManyPots(mockDataOneTmnt.pots);
  //     if (!savedPots) return null;
  //     const savedBrkts = await postManyBrkts(mockDataOneTmnt.brkts);
  //     if (!savedBrkts) return null;
  //     const savedElims = await postManyElims(mockDataOneTmnt.elims);
  //     if (!savedElims) return null;
  //     return savedTmnt
  //   }
  //   const saveMockEntries = async () => {
  //     const savedPlayers = await postManyPlayers(mockOrigData.players);
  //     if (!savedPlayers) return null;
  //     const savedDivEntries = await postManyDivEntries(mockOrigData.divEntries);
  //     if (!savedDivEntries) return null;
  //     const savedPotEntries = await postManyPotEntries(mockOrigData.potEntries);
  //     if (!savedPotEntries) return null;
  //     const savedBrktEntries = await postManyBrktEntries(mockOrigData.brktEntries);
  //     if (!savedBrktEntries) return null;
  //     const savedElimEntries = await postManyElimEntries(mockOrigData.elimEntries);
  //     if (!savedElimEntries) return null;
  //     return savedPlayers;
  //   }

  //   beforeAll(async () => {
  //     await deleteTmnt(mockDataOneTmnt.tmnt.id);
  //     await saveMockTmnt()
  //   })

  //   beforeEach(async () => {
  //     await saveMockEntries();
  //   })

  //   afterEach(async () => {
  //     // deletes all tmnt players, divEntries, potEntries, brktEntries, elimEntries
  //     await deleteAllTmntPlayers(mockDataOneTmnt.tmnt.id);
  //   })

  //   afterAll(async () => {
  //     // deletes tmnt, events, divs, pots, brkts, elims and player entries
  //     await deleteTmnt(mockDataOneTmnt.tmnt.id); // delete       
  //   })

  //   it('should update original players, divEntries, potEntries, brktEntries and elimEntries', async () => { 

  //     const editedData = cloneDeep(mockOrigData);
  //     const curData = cloneDeep(mockOrigData);
  //     const origData = cloneDeep(mockOrigData);
  //     const testAllData: allEntriesOneSquadType = { origData, curData };

  //     const rows = populateRows(editedData);
  //     expect(rows.length).toBe(6);

  //     rows.pop();                      // delete player, (div entry, elim entry also deleted casacased)
  //     rows[2][divFeeColName] = '';     // delete div entry
  //     rows[2][potFeeColName] = '';     // delete pot entry
  //     rows[4][brkt1NumColName] = '';   // delete brkt entry
  //     rows[4][brkt1FeeColName] = '';   // delete brkt entry      

  //     rows[0].first_name = 'Anna';     // update player
  //     rows[0][divFeeColName] = '83';   // update div entry
  //     rows[0][potFeeColName] = '15';   // update pot entry
  //     rows[0][brkt1NumColName] = 8;    // update bracket entry
  //     rows[0][brkt1FeeColName] = '40'; 
  //     rows[0][brkt1TimeStampColName] = new Date().getTime()
  //     rows[0][elim1FeeColName] = '15'; // update elim entry

  //     const newRow = cloneDeep(rows[0]);
  //     newRow.id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.player_id = 'ply_0183456789abcdef0123456789abcdef'
  //     newRow.first_name = 'Gina'
  //     newRow.last_name = 'Davis'
  //     newRow.average = 200
  //     newRow.lane = 35
  //     newRow.position = 'Y'
  //     newRow.lanePos = '35-Y'
  //     newRow[divFeeColName] = '81'
  //     newRow[divHdcpColName] = 0
  //     newRow[potFeeColName] = '21'
  //     newRow[brkt1NumColName] = 11
  //     newRow[brkt1FeeColName] = '55'
  //     newRow[brkt1TimeStampColName] = new Date().getTime()
  //     newRow[brkt2NumColName] = 11
  //     newRow[brkt2FeeColName] = '55'
  //     newRow[brkt2TimeStampColName] = new Date().getTime()
  //     newRow[elim1FeeColName] = '3'
  //     newRow[elim2FeeColName] = '3'
  //     rows.push(newRow)  // insert player, div entry, pot entry, 2 brkt entry, 2 elim entry
      
  //     rows[1][divFeeColName] = '81';   // adds a new div entry (no fee yet for row in grid)
  //     rows[1][potFeeColName] = '21';   // adds a new pot entry (no fee yet for row in grid)      
  //     rows[1][brkt1NumColName] = 11;    // adds a new bracket entry (no num yet for row in grid)
  //     rows[1][brkt1FeeColName] = '55';       
  //     rows[1][brkt1TimeStampColName] = new Date().getTime();
  //     rows[1][elim1FeeColName] = '3';  // adds a new elim entry (no fee yet for row in grid)

  //     const updatedInfo = await saveEntriesData(rows, testAllData);
  //     expect(updatedInfo.players.updates).toBe(1);
  //     expect(updatedInfo.players.deletes).toBe(1);
  //     expect(updatedInfo.players.inserts).toBe(1);  
 
  //     expect(updatedInfo.divEntries.updates).toBe(1);
  //     expect(updatedInfo.divEntries.deletes).toBe(1); // when players deleted, deleted 1 divEntry, so 1 here not 2
  //     expect(updatedInfo.divEntries.inserts).toBe(2);  

  //     expect(updatedInfo.potEntries.updates).toBe(1);
  //     expect(updatedInfo.potEntries.deletes).toBe(1);
  //     expect(updatedInfo.potEntries.inserts).toBe(2);  

  //     expect(updatedInfo.brktEntries.updates).toBe(1);
  //     expect(updatedInfo.brktEntries.deletes).toBe(1);
  //     expect(updatedInfo.brktEntries.inserts).toBe(3);  
  
  //     expect(updatedInfo.elimEntries.updates).toBe(1);
  //     expect(updatedInfo.elimEntries.deletes).toBe(0); // when players deleted, deleted 2 elimEntry, so 0 here not 2
  //     expect(updatedInfo.elimEntries.inserts).toBe(3); 
      
  //     const updatedCounts = updateOneSquadEntries(updatedInfo, testAllData);
  //     expect(updatedCounts.players).toBe(3)
  //     expect(updatedCounts.divEntries).toBe(5) // + 1 for cascade delete
  //     expect(updatedCounts.potEntries).toBe(4) 
  //     expect(updatedCounts.brktEntries).toBe(5)
  //     expect(updatedCounts.elimEntries).toBe(6); // + 2 for cascade delete

  //     // updated rows
  //     expect(testAllData.curData.players[0].first_name).toBe('Anna');
  //     expect(testAllData.curData.divEntries[0].fee).toBe('83');
  //     expect(testAllData.curData.potEntries[0].fee).toBe('15');
  //     expect(testAllData.curData.brktEntries[0].num_brackets).toBe(8);
  //     expect(testAllData.curData.brktEntries[0].fee).toBe('40');
  //     expect(testAllData.curData.elimEntries[0].fee).toBe('15');

  //     // deleted rows
  //     const foundPlayer = testAllData.curData.players.find((p) => p.id === 'ply_0173456789abcdef0123456789abcdef');
  //     expect(foundPlayer).toBeUndefined();

  //     let foundDivEntry = testAllData.curData.divEntries.find((d) => d.id === 'den_0133456789abcdef0123456789abcdef');
  //     expect(foundDivEntry).toBeUndefined();
  //     foundDivEntry = testAllData.curData.divEntries.find((d) => d.id === 'den_0163456789abcdef0123456789abcdef');
  //     expect(foundDivEntry).toBeUndefined();

  //     const foundPotEntry = testAllData.curData.potEntries.find((p) => p.id === 'pen_0133456789abcdef0123456789abcdef');
  //     expect(foundPotEntry).toBeUndefined();

  //     const foundBrktEntry = testAllData.curData.brktEntries.find((b) => b.id === 'ben_0143456789abcdef0123456789abcdef');
  //     expect(foundBrktEntry).toBeUndefined();

  //     let foundElimEntry = testAllData.curData.elimEntries.find((e) => e.id === 'een_0143456789abcdef0123456789abcdef')
  //     expect(foundElimEntry).toBeUndefined();
  //     foundElimEntry = testAllData.curData.elimEntries.find((e) => e.id === 'een_0153456789abcdef0123456789abcdef')
  //     expect(foundElimEntry).toBeUndefined();

  //     // inserted rows
  //     const foundInserted = testAllData.curData.players.filter((p) => p.id === 'ply_0183456789abcdef0123456789abcdef')
  //     expect(foundInserted).toHaveLength(1);
  //     const foundInserted2 = testAllData.curData.divEntries.filter((d) => d.fee === '81')
  //     expect(foundInserted2).toHaveLength(2);
  //     const foundInserted3 = testAllData.curData.potEntries.filter((p) => p.fee === '21')
  //     expect(foundInserted3).toHaveLength(2);
  //     const foundInserted4 = testAllData.curData.brktEntries.filter((b) => b.num_brackets === 11)
  //     expect(foundInserted4).toHaveLength(3);
  //     const foundInserted5 = testAllData.curData.elimEntries.filter((e) => e.fee === '3')
  //     expect(foundInserted5).toHaveLength(3);
  //   })

  // })
  
})