import "dotenv/config"; // make sure DATABASE_URL is loaded

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in the environment");
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

async function byePlayerUpsert_FullTmnt() {
  try {
    await prisma.player.upsert({
      where: {
        id: "bye_d0b0d7e570744d208ee0837ca601939b",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        first_name: "Bye",
        last_name: "",
        average: 0,
        lane: null,
        position: null,
      },
      create: {
        id: "bye_d0b0d7e570744d208ee0837ca601939b",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        first_name: "Bye",
        last_name: "",
        average: 0,
        lane: null,
        position: null,
      },
    });
    console.log("Upserted bye_player: ", 1); 
    return 1;
  } catch (error) {
    console.log(error);
    return -1;
  }  
}

async function oneBrktsUpset_FullTmnt() {
  const oneBrkts = [
    {
      id: "obk_4fca64c1cb144a78a8c9f778b03672f0",
      brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      bindex: 0,
    },
    {
      id: "obk_d763f13ac40742cd90a9e144da7900b1",
      brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      bindex: 1,
    },
    {
      id: "obk_86c7298c10cf42e8bd6a931b7f72c13b",
      brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      bindex: 2,
    },
    {
      id: "obk_6246afe30c3f49178c1d1a5d405c708f",
      brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      bindex: 3,
    },
    {
      id: "obk_a452a78ab0ff4f9da6fd441898a8a5a0",
      brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      bindex: 4,
    },
    {
      id: "obk_0f461fbf2098478eb77fe4a6d4d46ce7",
      brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      bindex: 5,
    },
    {
      id: "obk_d11572bd731f466296da76b87e588935",
      brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      bindex: 6,
    },
    {
      id: "obk_2b8b1507904f451f8e4d8af375ed9d88",
      brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      bindex: 7,
    },
    {
      id: "obk_ef581e545e6444828329480fce403be3",
      brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      bindex: 8,
    },
    {
      id: "obk_eb562288124144b8a1a6a4a7315963f4",
      brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      bindex: 9,
    },
    {
      id: "obk_730b29ac8bc342878e38d63911fc1989",
      brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      bindex: 10,
    },
    {
      id: "obk_d51d3a95baa54dec94a46a5aef8bc81a",
      brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      bindex: 11,
    },
    {
      id: "obk_f7f9b5da464c47a09c285de1213abf74",
      brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      bindex: 12,
    },
    {
      id: "obk_39f07490b29c4d62949ef177830e7af1",
      brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      bindex: 13,
    },
    {
      id: "obk_11346db367e84a50b4ab85ed8cda3924",
      brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      bindex: 14,
    },
    {
      id: "obk_2634a05fb34747829ea7d5d947d4164a",
      brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      bindex: 15,
    },
    {
      id: "obk_820d52c57f82412fa9511cdf70f979c1",
      brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      bindex: 16,
    },
    {
      id: "obk_c5e5c28d4b4a4654965d0fba3e82a28f",
      brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      bindex: 0,
    },
    {
      id: "obk_b0ac013603604c8fa6b22e5b2e8cdbf6",
      brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      bindex: 1,
    },
    {
      id: "obk_0b1599f9e4af4970b9e7a99192fc5199",
      brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      bindex: 2,
    },
    {
      id: "obk_d39fa4725d3d45b5aacf4436f60374b5",
      brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      bindex: 3,
    },
    {
      id: "obk_96b963b6320b41e997a0617224aafdbd",
      brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      bindex: 4,
    },
    {
      id: "obk_a699501b31ca45499143ce192668e96b",
      brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      bindex: 5,
    },
    {
      id: "obk_fe660432481646d5bafa4335964295d7",
      brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      bindex: 6,
    },
    {
      id: "obk_fcc665e866ea470aaa279981f1ea18cb",
      brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      bindex: 7,
    },
    {
      id: "obk_c6e17101244740139675fd8b575b5fa6",
      brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      bindex: 8,
    },
    {
      id: "obk_c9790cb0df304d0ba79b8d1fe4e33d65",
      brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      bindex: 9,
    },
    {
      id: "obk_def297782adf4614a93ea4005dcef840",
      brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      bindex: 10,
    },
    {
      id: "obk_8c9410f8bdb746778e0da3c459b17809",
      brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      bindex: 11,
    },
    {
      id: "obk_b4bf5eb22756416b87ce5770e074853e",
      brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      bindex: 12,
    },
    {
      id: "obk_be8ff7b077b34fa49cf05bc90b4bd112",
      brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      bindex: 13,
    },
    {
      id: "obk_ebcbca78c2d34538bdf7bbe69fab3ed4",
      brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      bindex: 14,
    },
    {
      id: "obk_98b75b1acdac4b49aaf68f473d5b3a5a",
      brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      bindex: 15,
    },
    {
      id: "obk_334092709e974ccaa9e7680fe816c84f",
      brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      bindex: 16,
    },
  ];

  try {
    for (const oneBrktData of oneBrkts) {
      const { id, brkt_id, bindex } = oneBrktData;

      await prisma.one_Brkt.upsert({
        where: { id },
        update: { brkt_id, bindex },
        create: { id, brkt_id, bindex },
      });
    }

    console.log("Upserted one_Brkt: ", oneBrkts.length); 
    return oneBrkts.length; // 34 oneBrkts

  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function brktSeedUpset_FullTmnt() {
  const brktSeeds = [
    {
      one_brkt_id: "obk_4fca64c1cb144a78a8c9f778b03672f0",
      seed: 0,
      player_id: "bye_d0b0d7e570744d208ee0837ca601939b",
    },
    {
      one_brkt_id: "obk_4fca64c1cb144a78a8c9f778b03672f0",
      seed: 1,
      player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_4fca64c1cb144a78a8c9f778b03672f0",
      seed: 2,
      player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_4fca64c1cb144a78a8c9f778b03672f0",
      seed: 3,
      player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_4fca64c1cb144a78a8c9f778b03672f0",
      seed: 4,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_4fca64c1cb144a78a8c9f778b03672f0",
      seed: 5,
      player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_4fca64c1cb144a78a8c9f778b03672f0",
      seed: 6,
      player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_4fca64c1cb144a78a8c9f778b03672f0",
      seed: 7,
      player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d763f13ac40742cd90a9e144da7900b1",
      seed: 0,
      player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d763f13ac40742cd90a9e144da7900b1",
      seed: 1,
      player_id: "bye_d0b0d7e570744d208ee0837ca601939b",
    },
    {
      one_brkt_id: "obk_d763f13ac40742cd90a9e144da7900b1",
      seed: 2,
      player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d763f13ac40742cd90a9e144da7900b1",
      seed: 3,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d763f13ac40742cd90a9e144da7900b1",
      seed: 4,
      player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d763f13ac40742cd90a9e144da7900b1",
      seed: 5,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d763f13ac40742cd90a9e144da7900b1",
      seed: 6,
      player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d763f13ac40742cd90a9e144da7900b1",
      seed: 7,
      player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_86c7298c10cf42e8bd6a931b7f72c13b",
      seed: 0,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_86c7298c10cf42e8bd6a931b7f72c13b",
      seed: 1,
      player_id: "bye_d0b0d7e570744d208ee0837ca601939b",
    },
    {
      one_brkt_id: "obk_86c7298c10cf42e8bd6a931b7f72c13b",
      seed: 2,
      player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_86c7298c10cf42e8bd6a931b7f72c13b",
      seed: 3,
      player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_86c7298c10cf42e8bd6a931b7f72c13b",
      seed: 4,
      player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_86c7298c10cf42e8bd6a931b7f72c13b",
      seed: 5,
      player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_86c7298c10cf42e8bd6a931b7f72c13b",
      seed: 6,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_86c7298c10cf42e8bd6a931b7f72c13b",
      seed: 7,
      player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_6246afe30c3f49178c1d1a5d405c708f",
      seed: 0,
      player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_6246afe30c3f49178c1d1a5d405c708f",
      seed: 1,
      player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_6246afe30c3f49178c1d1a5d405c708f",
      seed: 2,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_6246afe30c3f49178c1d1a5d405c708f",
      seed: 3,
      player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_6246afe30c3f49178c1d1a5d405c708f",
      seed: 4,
      player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_6246afe30c3f49178c1d1a5d405c708f",
      seed: 5,
      player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_6246afe30c3f49178c1d1a5d405c708f",
      seed: 6,
      player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_6246afe30c3f49178c1d1a5d405c708f",
      seed: 7,
      player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_a452a78ab0ff4f9da6fd441898a8a5a0",
      seed: 0,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_a452a78ab0ff4f9da6fd441898a8a5a0",
      seed: 1,
      player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_a452a78ab0ff4f9da6fd441898a8a5a0",
      seed: 2,
      player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_a452a78ab0ff4f9da6fd441898a8a5a0",
      seed: 3,
      player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_a452a78ab0ff4f9da6fd441898a8a5a0",
      seed: 4,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_a452a78ab0ff4f9da6fd441898a8a5a0",
      seed: 5,
      player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_a452a78ab0ff4f9da6fd441898a8a5a0",
      seed: 6,
      player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_a452a78ab0ff4f9da6fd441898a8a5a0",
      seed: 7,
      player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_0f461fbf2098478eb77fe4a6d4d46ce7",
      seed: 0,
      player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_0f461fbf2098478eb77fe4a6d4d46ce7",
      seed: 1,
      player_id: "bye_d0b0d7e570744d208ee0837ca601939b",
    },
    {
      one_brkt_id: "obk_0f461fbf2098478eb77fe4a6d4d46ce7",
      seed: 2,
      player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_0f461fbf2098478eb77fe4a6d4d46ce7",
      seed: 3,
      player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_0f461fbf2098478eb77fe4a6d4d46ce7",
      seed: 4,
      player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_0f461fbf2098478eb77fe4a6d4d46ce7",
      seed: 5,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_0f461fbf2098478eb77fe4a6d4d46ce7",
      seed: 6,
      player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_0f461fbf2098478eb77fe4a6d4d46ce7",
      seed: 7,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d11572bd731f466296da76b87e588935",
      seed: 0,
      player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d11572bd731f466296da76b87e588935",
      seed: 1,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d11572bd731f466296da76b87e588935",
      seed: 2,
      player_id: "bye_d0b0d7e570744d208ee0837ca601939b",
    },
    {
      one_brkt_id: "obk_d11572bd731f466296da76b87e588935",
      seed: 3,
      player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d11572bd731f466296da76b87e588935",
      seed: 4,
      player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d11572bd731f466296da76b87e588935",
      seed: 5,
      player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d11572bd731f466296da76b87e588935",
      seed: 6,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d11572bd731f466296da76b87e588935",
      seed: 7,
      player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_2b8b1507904f451f8e4d8af375ed9d88",
      seed: 0,
      player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_2b8b1507904f451f8e4d8af375ed9d88",
      seed: 1,
      player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_2b8b1507904f451f8e4d8af375ed9d88",
      seed: 2,
      player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_2b8b1507904f451f8e4d8af375ed9d88",
      seed: 3,
      player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_2b8b1507904f451f8e4d8af375ed9d88",
      seed: 4,
      player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_2b8b1507904f451f8e4d8af375ed9d88",
      seed: 5,
      player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_2b8b1507904f451f8e4d8af375ed9d88",
      seed: 6,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_2b8b1507904f451f8e4d8af375ed9d88",
      seed: 7,
      player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_ef581e545e6444828329480fce403be3",
      seed: 0,
      player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_ef581e545e6444828329480fce403be3",
      seed: 1,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_ef581e545e6444828329480fce403be3",
      seed: 2,
      player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_ef581e545e6444828329480fce403be3",
      seed: 3,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_ef581e545e6444828329480fce403be3",
      seed: 4,
      player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_ef581e545e6444828329480fce403be3",
      seed: 5,
      player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_ef581e545e6444828329480fce403be3",
      seed: 6,
      player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_ef581e545e6444828329480fce403be3",
      seed: 7,
      player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_eb562288124144b8a1a6a4a7315963f4",
      seed: 0,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_eb562288124144b8a1a6a4a7315963f4",
      seed: 1,
      player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_eb562288124144b8a1a6a4a7315963f4",
      seed: 2,
      player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_eb562288124144b8a1a6a4a7315963f4",
      seed: 3,
      player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_eb562288124144b8a1a6a4a7315963f4",
      seed: 4,
      player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_eb562288124144b8a1a6a4a7315963f4",
      seed: 5,
      player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_eb562288124144b8a1a6a4a7315963f4",
      seed: 6,
      player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_eb562288124144b8a1a6a4a7315963f4",
      seed: 7,
      player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_730b29ac8bc342878e38d63911fc1989",
      seed: 0,
      player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_730b29ac8bc342878e38d63911fc1989",
      seed: 1,
      player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_730b29ac8bc342878e38d63911fc1989",
      seed: 2,
      player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_730b29ac8bc342878e38d63911fc1989",
      seed: 3,
      player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_730b29ac8bc342878e38d63911fc1989",
      seed: 4,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_730b29ac8bc342878e38d63911fc1989",
      seed: 5,
      player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_730b29ac8bc342878e38d63911fc1989",
      seed: 6,
      player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_730b29ac8bc342878e38d63911fc1989",
      seed: 7,
      player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d51d3a95baa54dec94a46a5aef8bc81a",
      seed: 0,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d51d3a95baa54dec94a46a5aef8bc81a",
      seed: 1,
      player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d51d3a95baa54dec94a46a5aef8bc81a",
      seed: 2,
      player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d51d3a95baa54dec94a46a5aef8bc81a",
      seed: 3,
      player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d51d3a95baa54dec94a46a5aef8bc81a",
      seed: 4,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d51d3a95baa54dec94a46a5aef8bc81a",
      seed: 5,
      player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d51d3a95baa54dec94a46a5aef8bc81a",
      seed: 6,
      player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d51d3a95baa54dec94a46a5aef8bc81a",
      seed: 7,
      player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_f7f9b5da464c47a09c285de1213abf74",
      seed: 0,
      player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_f7f9b5da464c47a09c285de1213abf74",
      seed: 1,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_f7f9b5da464c47a09c285de1213abf74",
      seed: 2,
      player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_f7f9b5da464c47a09c285de1213abf74",
      seed: 3,
      player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_f7f9b5da464c47a09c285de1213abf74",
      seed: 4,
      player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_f7f9b5da464c47a09c285de1213abf74",
      seed: 5,
      player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_f7f9b5da464c47a09c285de1213abf74",
      seed: 6,
      player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_f7f9b5da464c47a09c285de1213abf74",
      seed: 7,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_39f07490b29c4d62949ef177830e7af1",
      seed: 0,
      player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_39f07490b29c4d62949ef177830e7af1",
      seed: 1,
      player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_39f07490b29c4d62949ef177830e7af1",
      seed: 2,
      player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_39f07490b29c4d62949ef177830e7af1",
      seed: 3,
      player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_39f07490b29c4d62949ef177830e7af1",
      seed: 4,
      player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_39f07490b29c4d62949ef177830e7af1",
      seed: 5,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_39f07490b29c4d62949ef177830e7af1",
      seed: 6,
      player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_39f07490b29c4d62949ef177830e7af1",
      seed: 7,
      player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_11346db367e84a50b4ab85ed8cda3924",
      seed: 0,
      player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_11346db367e84a50b4ab85ed8cda3924",
      seed: 1,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_11346db367e84a50b4ab85ed8cda3924",
      seed: 2,
      player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_11346db367e84a50b4ab85ed8cda3924",
      seed: 3,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_11346db367e84a50b4ab85ed8cda3924",
      seed: 4,
      player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_11346db367e84a50b4ab85ed8cda3924",
      seed: 5,
      player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_11346db367e84a50b4ab85ed8cda3924",
      seed: 6,
      player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_11346db367e84a50b4ab85ed8cda3924",
      seed: 7,
      player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_2634a05fb34747829ea7d5d947d4164a",
      seed: 0,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_2634a05fb34747829ea7d5d947d4164a",
      seed: 1,
      player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_2634a05fb34747829ea7d5d947d4164a",
      seed: 2,
      player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_2634a05fb34747829ea7d5d947d4164a",
      seed: 3,
      player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_2634a05fb34747829ea7d5d947d4164a",
      seed: 4,
      player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_2634a05fb34747829ea7d5d947d4164a",
      seed: 5,
      player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_2634a05fb34747829ea7d5d947d4164a",
      seed: 6,
      player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_2634a05fb34747829ea7d5d947d4164a",
      seed: 7,
      player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_820d52c57f82412fa9511cdf70f979c1",
      seed: 0,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_820d52c57f82412fa9511cdf70f979c1",
      seed: 1,
      player_id: "bye_d0b0d7e570744d208ee0837ca601939b",
    },
    {
      one_brkt_id: "obk_820d52c57f82412fa9511cdf70f979c1",
      seed: 2,
      player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_820d52c57f82412fa9511cdf70f979c1",
      seed: 3,
      player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_820d52c57f82412fa9511cdf70f979c1",
      seed: 4,
      player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_820d52c57f82412fa9511cdf70f979c1",
      seed: 5,
      player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_820d52c57f82412fa9511cdf70f979c1",
      seed: 6,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_820d52c57f82412fa9511cdf70f979c1",
      seed: 7,
      player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c5e5c28d4b4a4654965d0fba3e82a28f",
      seed: 0,
      player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c5e5c28d4b4a4654965d0fba3e82a28f",
      seed: 1,
      player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c5e5c28d4b4a4654965d0fba3e82a28f",
      seed: 2,
      player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c5e5c28d4b4a4654965d0fba3e82a28f",
      seed: 3,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c5e5c28d4b4a4654965d0fba3e82a28f",
      seed: 4,
      player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c5e5c28d4b4a4654965d0fba3e82a28f",
      seed: 5,
      player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c5e5c28d4b4a4654965d0fba3e82a28f",
      seed: 6,
      player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c5e5c28d4b4a4654965d0fba3e82a28f",
      seed: 7,
      player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_b0ac013603604c8fa6b22e5b2e8cdbf6",
      seed: 0,
      player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_b0ac013603604c8fa6b22e5b2e8cdbf6",
      seed: 1,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_b0ac013603604c8fa6b22e5b2e8cdbf6",
      seed: 2,
      player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_b0ac013603604c8fa6b22e5b2e8cdbf6",
      seed: 3,
      player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_b0ac013603604c8fa6b22e5b2e8cdbf6",
      seed: 4,
      player_id: "bye_d0b0d7e570744d208ee0837ca601939b",
    },
    {
      one_brkt_id: "obk_b0ac013603604c8fa6b22e5b2e8cdbf6",
      seed: 5,
      player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_b0ac013603604c8fa6b22e5b2e8cdbf6",
      seed: 6,
      player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_b0ac013603604c8fa6b22e5b2e8cdbf6",
      seed: 7,
      player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_0b1599f9e4af4970b9e7a99192fc5199",
      seed: 0,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_0b1599f9e4af4970b9e7a99192fc5199",
      seed: 1,
      player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_0b1599f9e4af4970b9e7a99192fc5199",
      seed: 2,
      player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_0b1599f9e4af4970b9e7a99192fc5199",
      seed: 3,
      player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_0b1599f9e4af4970b9e7a99192fc5199",
      seed: 4,
      player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_0b1599f9e4af4970b9e7a99192fc5199",
      seed: 5,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_0b1599f9e4af4970b9e7a99192fc5199",
      seed: 6,
      player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_0b1599f9e4af4970b9e7a99192fc5199",
      seed: 7,
      player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d39fa4725d3d45b5aacf4436f60374b5",
      seed: 0,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d39fa4725d3d45b5aacf4436f60374b5",
      seed: 1,
      player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d39fa4725d3d45b5aacf4436f60374b5",
      seed: 2,
      player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d39fa4725d3d45b5aacf4436f60374b5",
      seed: 3,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d39fa4725d3d45b5aacf4436f60374b5",
      seed: 4,
      player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d39fa4725d3d45b5aacf4436f60374b5",
      seed: 5,
      player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d39fa4725d3d45b5aacf4436f60374b5",
      seed: 6,
      player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_d39fa4725d3d45b5aacf4436f60374b5",
      seed: 7,
      player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_96b963b6320b41e997a0617224aafdbd",
      seed: 0,
      player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_96b963b6320b41e997a0617224aafdbd",
      seed: 1,
      player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_96b963b6320b41e997a0617224aafdbd",
      seed: 2,
      player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_96b963b6320b41e997a0617224aafdbd",
      seed: 3,
      player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_96b963b6320b41e997a0617224aafdbd",
      seed: 4,
      player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_96b963b6320b41e997a0617224aafdbd",
      seed: 5,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_96b963b6320b41e997a0617224aafdbd",
      seed: 6,
      player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_96b963b6320b41e997a0617224aafdbd",
      seed: 7,
      player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_a699501b31ca45499143ce192668e96b",
      seed: 0,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_a699501b31ca45499143ce192668e96b",
      seed: 1,
      player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_a699501b31ca45499143ce192668e96b",
      seed: 2,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_a699501b31ca45499143ce192668e96b",
      seed: 3,
      player_id: "bye_d0b0d7e570744d208ee0837ca601939b",
    },
    {
      one_brkt_id: "obk_a699501b31ca45499143ce192668e96b",
      seed: 4,
      player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_a699501b31ca45499143ce192668e96b",
      seed: 5,
      player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_a699501b31ca45499143ce192668e96b",
      seed: 6,
      player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_a699501b31ca45499143ce192668e96b",
      seed: 7,
      player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_fe660432481646d5bafa4335964295d7",
      seed: 0,
      player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_fe660432481646d5bafa4335964295d7",
      seed: 1,
      player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_fe660432481646d5bafa4335964295d7",
      seed: 2,
      player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_fe660432481646d5bafa4335964295d7",
      seed: 3,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_fe660432481646d5bafa4335964295d7",
      seed: 4,
      player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_fe660432481646d5bafa4335964295d7",
      seed: 5,
      player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_fe660432481646d5bafa4335964295d7",
      seed: 6,
      player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_fe660432481646d5bafa4335964295d7",
      seed: 7,
      player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_fcc665e866ea470aaa279981f1ea18cb",
      seed: 0,
      player_id: "bye_d0b0d7e570744d208ee0837ca601939b",
    },
    {
      one_brkt_id: "obk_fcc665e866ea470aaa279981f1ea18cb",
      seed: 1,
      player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_fcc665e866ea470aaa279981f1ea18cb",
      seed: 2,
      player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_fcc665e866ea470aaa279981f1ea18cb",
      seed: 3,
      player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_fcc665e866ea470aaa279981f1ea18cb",
      seed: 4,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_fcc665e866ea470aaa279981f1ea18cb",
      seed: 5,
      player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_fcc665e866ea470aaa279981f1ea18cb",
      seed: 6,
      player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_fcc665e866ea470aaa279981f1ea18cb",
      seed: 7,
      player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c6e17101244740139675fd8b575b5fa6",
      seed: 0,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c6e17101244740139675fd8b575b5fa6",
      seed: 1,
      player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c6e17101244740139675fd8b575b5fa6",
      seed: 2,
      player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c6e17101244740139675fd8b575b5fa6",
      seed: 3,
      player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c6e17101244740139675fd8b575b5fa6",
      seed: 4,
      player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c6e17101244740139675fd8b575b5fa6",
      seed: 5,
      player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c6e17101244740139675fd8b575b5fa6",
      seed: 6,
      player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c6e17101244740139675fd8b575b5fa6",
      seed: 7,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c9790cb0df304d0ba79b8d1fe4e33d65",
      seed: 0,
      player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c9790cb0df304d0ba79b8d1fe4e33d65",
      seed: 1,
      player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c9790cb0df304d0ba79b8d1fe4e33d65",
      seed: 2,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c9790cb0df304d0ba79b8d1fe4e33d65",
      seed: 3,
      player_id: "bye_d0b0d7e570744d208ee0837ca601939b",
    },
    {
      one_brkt_id: "obk_c9790cb0df304d0ba79b8d1fe4e33d65",
      seed: 4,
      player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c9790cb0df304d0ba79b8d1fe4e33d65",
      seed: 5,
      player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c9790cb0df304d0ba79b8d1fe4e33d65",
      seed: 6,
      player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_c9790cb0df304d0ba79b8d1fe4e33d65",
      seed: 7,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_def297782adf4614a93ea4005dcef840",
      seed: 0,
      player_id: "bye_d0b0d7e570744d208ee0837ca601939b",
    },
    {
      one_brkt_id: "obk_def297782adf4614a93ea4005dcef840",
      seed: 1,
      player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_def297782adf4614a93ea4005dcef840",
      seed: 2,
      player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_def297782adf4614a93ea4005dcef840",
      seed: 3,
      player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_def297782adf4614a93ea4005dcef840",
      seed: 4,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_def297782adf4614a93ea4005dcef840",
      seed: 5,
      player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_def297782adf4614a93ea4005dcef840",
      seed: 6,
      player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_def297782adf4614a93ea4005dcef840",
      seed: 7,
      player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_8c9410f8bdb746778e0da3c459b17809",
      seed: 0,
      player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_8c9410f8bdb746778e0da3c459b17809",
      seed: 1,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_8c9410f8bdb746778e0da3c459b17809",
      seed: 2,
      player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_8c9410f8bdb746778e0da3c459b17809",
      seed: 3,
      player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_8c9410f8bdb746778e0da3c459b17809",
      seed: 4,
      player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_8c9410f8bdb746778e0da3c459b17809",
      seed: 5,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_8c9410f8bdb746778e0da3c459b17809",
      seed: 6,
      player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_8c9410f8bdb746778e0da3c459b17809",
      seed: 7,
      player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_b4bf5eb22756416b87ce5770e074853e",
      seed: 0,
      player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_b4bf5eb22756416b87ce5770e074853e",
      seed: 1,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_b4bf5eb22756416b87ce5770e074853e",
      seed: 2,
      player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_b4bf5eb22756416b87ce5770e074853e",
      seed: 3,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_b4bf5eb22756416b87ce5770e074853e",
      seed: 4,
      player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_b4bf5eb22756416b87ce5770e074853e",
      seed: 5,
      player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_b4bf5eb22756416b87ce5770e074853e",
      seed: 6,
      player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_b4bf5eb22756416b87ce5770e074853e",
      seed: 7,
      player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_be8ff7b077b34fa49cf05bc90b4bd112",
      seed: 0,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_be8ff7b077b34fa49cf05bc90b4bd112",
      seed: 1,
      player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_be8ff7b077b34fa49cf05bc90b4bd112",
      seed: 2,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_be8ff7b077b34fa49cf05bc90b4bd112",
      seed: 3,
      player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_be8ff7b077b34fa49cf05bc90b4bd112",
      seed: 4,
      player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_be8ff7b077b34fa49cf05bc90b4bd112",
      seed: 5,
      player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_be8ff7b077b34fa49cf05bc90b4bd112",
      seed: 6,
      player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_be8ff7b077b34fa49cf05bc90b4bd112",
      seed: 7,
      player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_ebcbca78c2d34538bdf7bbe69fab3ed4",
      seed: 0,
      player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_ebcbca78c2d34538bdf7bbe69fab3ed4",
      seed: 1,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_ebcbca78c2d34538bdf7bbe69fab3ed4",
      seed: 2,
      player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_ebcbca78c2d34538bdf7bbe69fab3ed4",
      seed: 3,
      player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_ebcbca78c2d34538bdf7bbe69fab3ed4",
      seed: 4,
      player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_ebcbca78c2d34538bdf7bbe69fab3ed4",
      seed: 5,
      player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_ebcbca78c2d34538bdf7bbe69fab3ed4",
      seed: 6,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_ebcbca78c2d34538bdf7bbe69fab3ed4",
      seed: 7,
      player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_98b75b1acdac4b49aaf68f473d5b3a5a",
      seed: 0,
      player_id: "bye_d0b0d7e570744d208ee0837ca601939b",
    },
    {
      one_brkt_id: "obk_98b75b1acdac4b49aaf68f473d5b3a5a",
      seed: 1,
      player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_98b75b1acdac4b49aaf68f473d5b3a5a",
      seed: 2,
      player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_98b75b1acdac4b49aaf68f473d5b3a5a",
      seed: 3,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_98b75b1acdac4b49aaf68f473d5b3a5a",
      seed: 4,
      player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_98b75b1acdac4b49aaf68f473d5b3a5a",
      seed: 5,
      player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_98b75b1acdac4b49aaf68f473d5b3a5a",
      seed: 6,
      player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_98b75b1acdac4b49aaf68f473d5b3a5a",
      seed: 7,
      player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_334092709e974ccaa9e7680fe816c84f",
      seed: 0,
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_334092709e974ccaa9e7680fe816c84f",
      seed: 1,
      player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_334092709e974ccaa9e7680fe816c84f",
      seed: 2,
      player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_334092709e974ccaa9e7680fe816c84f",
      seed: 3,
      player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_334092709e974ccaa9e7680fe816c84f",
      seed: 4,
      player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_334092709e974ccaa9e7680fe816c84f",
      seed: 5,
      player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_334092709e974ccaa9e7680fe816c84f",
      seed: 6,
      player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
    },
    {
      one_brkt_id: "obk_334092709e974ccaa9e7680fe816c84f",
      seed: 7,
      player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
    },
  ];

  try {
    for (const brktSeedData of brktSeeds) {
      const {
        one_brkt_id,
        seed,
        player_id,
      } = brktSeedData;

      await prisma.brkt_Seed.upsert({
        where: {
          one_brkt_id_seed: {
            one_brkt_id,
            seed,
          },
        },
        update: {
          player_id,
        },
        create: {
          one_brkt_id,
          seed,
          player_id,
        },
      });
    }

    console.log("Upserted brkt_Seed: ", brktSeeds.length * 8); 
    return brktSeeds.length; // 34 * 8 = 272
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function main() {

  let count = await byePlayerUpsert_FullTmnt();
  if (count < 0) return;

  count = await oneBrktsUpset_FullTmnt();
  if (count < 0) return;

  count = await brktSeedUpset_FullTmnt();
  if (count < 0) return;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });