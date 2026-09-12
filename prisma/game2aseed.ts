import "dotenv/config"; // make sure DATABASE_URL is loaded

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in the environment");
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

async function gamesUpsert_FullTmnt() {
  try {
    // Al Davis - Game 2
    let randomScore = 150;    
    let game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1f2",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1f2",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });
    
    // Bob Smith - Game 2
    randomScore = 214;
    game = await prisma.game.upsert({
      where: {
        id: "gam_3c7d8f6e4a024e6fb1b5e9f7d214c3b5",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_3c7d8f6e4a024e6fb1b5e9f7d214c3b5",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });
    
    // Curt Johnson - Game 2
    randomScore = 266;
    game = await prisma.game.upsert({
      where: {
        id: "gam_4e1a2b5d8c9f4e7b6a0c3d2e5f9b7d1d",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_4e1a2b5d8c9f4e7b6a0c3d2e5f9b7d1d",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });
    
    // Don Brown - Game 2
    randomScore = 219;
    game = await prisma.game.upsert({
      where: {
        id: "gam_a4f19c2e7b8d4a63b0e5f1c9d2748a37",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_a4f19c2e7b8d4a63b0e5f1c9d2748a37",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Ed Taylor - Game 2
    randomScore = 184;
    game = await prisma.game.upsert({
      where: {
        id: "gam_73e2b8a1c5f94d60a7b3e9c218f46d5b",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_73e2b8a1c5f94d60a7b3e9c218f46d5b",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Fred Anderson - Game 2
    randomScore = 154;
    game = await prisma.game.upsert({
      where: {
        id: "gam_c8a3f571d2e64b09a4c7e1f593b826d1",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_c8a3f571d2e64b09a4c7e1f593b826d1",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Greg Smith - Game 2
    randomScore = 237;
    game = await prisma.game.upsert({
      where: {
        id: "gam_19d7e4b2a6c843f5b0e8d31c7a925f65",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_19d7e4b2a6c843f5b0e8d31c7a925f65",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Hal Johnson - Game 2
    randomScore = 171;
    game = await prisma.game.upsert({
      where: {
        id: "gam_e5b27a9c4d163f80b6a1c8e734f92d5c",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_e5b27a9c4d163f80b6a1c8e734f92d5c",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Ian Brown - Game 2
    randomScore = 232;
    game = await prisma.game.upsert({
      where: {
        id: "gam_6f3a1d8b5c294e70a2f9b4d183c7e561",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_6f3a1d8b5c294e70a2f9b4d183c7e561",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Jim Williams - Game 2
    randomScore = 169;
    game = await prisma.game.upsert({
      where: {
        id: "gam_b2c84e1f7a593d60e6b0f2a9c4158d74",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_b2c84e1f7a593d60e6b0f2a9c4158d74",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Kyle Jones - Game 2
    randomScore = 219;
    game = await prisma.game.upsert({
      where: {
        id: "gam_4d9a7c2e1b653f80c8e4a6d219f375b1",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_4d9a7c2e1b653f80c8e4a6d219f375b1",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Lou Miller - Game 2
    randomScore = 187;
    game = await prisma.game.upsert({
      where: {
        id: "gam_f1e63b8a4c275d90b7a2e5c819d436a0",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_f1e63b8a4c275d90b7a2e5c819d436a0",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });    

    // Mike Davis - Game 2
    randomScore = 237;
    game = await prisma.game.upsert({
      where: {
        id: "gam_8c1f4a7d2e9b5360c4a8f1d7b3e6259b",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49af",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_8c1f4a7d2e9b5360c4a8f1d7b3e6259b",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49af",
        game_num: 2,
        score: randomScore,
      },
    });

    // Nate Smith - Game 2
    randomScore = 173;
    game = await prisma.game.upsert({
      where: {
        id: "gam_3e7b1c9a5d264f80b2a6e4c8f1739d5c",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_3e7b1c9a5d264f80b2a6e4c8f1739d5c",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Otto Johnson - Game 2
    randomScore = 220;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d5a2f8c1b6493e70a4d7c2e915f68b3b",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_d5a2f8c1b6493e70a4d7c2e915f68b3b",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Pat Brown - Game 2
    randomScore = 154;
    game = await prisma.game.upsert({
      where: {
        id: "gam_6b4e9a1d3c725f80e8a2d6c1b9473f5f",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_6b4e9a1d3c725f80e8a2d6c1b9473f5f",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Quincy Williams - Game 2
    randomScore = 160;
    game = await prisma.game.upsert({
      where: {
        id: "gam_f2c7a4e18b5d3960c3e9a6d172f84b5d",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_f2c7a4e18b5d3960c3e9a6d172f84b5d",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Ray Garcia - Game 2
    randomScore = 153;
    game = await prisma.game.upsert({
      where: {
        id: "gam_1a6d8f3c5b724e90d9c4a7e2f6153b8d",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_1a6d8f3c5b724e90d9c4a7e2f6153b8d",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    console.log("Upserted Games: ", 18);
    return 18;
  } catch (error) {
    console.log(error);
    return -1;
  }
}


async function main() {

  let count = await gamesUpsert_FullTmnt();
  if (count < 0) return;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });