import { BracketList } from "../../../../src/components/brackets/bracketListClass";

const mockBracketList = new BracketList("mock", 2, 3);
const playerData = [
  { player_id: 'Al', mock_name: 7, test_timeStamp: 100 },
  { player_id: 'Bob', mock_name: 7, test_timeStamp: 200 },
  { player_id: 'Chad', mock_name: 7, test_timeStamp: 300 },
  { player_id: 'Don', mock_name: 7, test_timeStamp: 400 },
  { player_id: 'Ed', mock_name: 7, test_timeStamp: 500 },
  { player_id: 'Fred', mock_name: 7, test_timeStamp: 600 },
  { player_id: 'Greg', mock_name: 7, test_timeStamp: 700 },
  { player_id: 'Hal', mock_name: 7, test_timeStamp: 800 },
];
mockBracketList.calcTotalBrkts(playerData);  

export type randomizeType = {
  player_id: string,
  num_brackets: number,
  maxRandom: number,
  maxFirstMatch: number,
}

const randomize1 = () => { 
  const randomOpps: randomizeType[] = [];
  let totalRemainingEntries = 0;

  const resetRandomOpps = () => { 
    let priorMaxRandom = 0;
    totalRemainingEntries = mockBracketList.brktEntries.reduce((total, entry) => total + entry[mockBracketList.numBrktsName], 0);    
    for (let o = 0; o < mockBracketList.brackets.length; o++) {
      randomOpps[o].maxRandom = (totalRemainingEntries / randomOpps[o].num_brackets) + priorMaxRandom;
      priorMaxRandom = randomOpps[o].maxRandom;
    }
  }

  // start i = 1, random opponent for Al
  for (let i = 1; i < mockBracketList.brackets.length; i++) {
    const randomOpp: randomizeType = {
      player_id: mockBracketList.brktEntries[i].player_id,
      num_brackets: mockBracketList.brktEntries[i][mockBracketList.numBrktsName],
      maxRandom: 0,
      maxFirstMatch: 0,
    }    
    if (randomOpp.num_brackets > 0) { 
      randomOpps.push(randomOpp);
    }    
  }

  const randomNum = Math.random();
  let r = 0;
  while (r < randomOpps.length && randomOpps[r].maxRandom < randomNum) {
    r++;
  }
  if (r >= randomOpps.length) {
    r = randomOpps.length - 1;
  }

  // populate bracket Match with plyer vs random player
  // const match = mockBracketList.getRandomMatch()
  // const playerPos = mockBracketList.getRandomPos();
  // mockBracketList.setVsPlayer(playerPos);

  // remove player used from random list
  randomOpps.splice(r, 1);

}

const randomize2 = () => { 
  // 1) create required # of brackets
  // 
}