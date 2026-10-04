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
    let deletedGames = await prisma.game.deleteMany({
      where: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        game_num: {
          gt: 0,
        },
      },
    })
    // Al Davis - Game 1
    let randomScore = 214;    
    let game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1f1",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1f1",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });
    
    // Bob Smith - Game 1
    randomScore = 228;
    game = await prisma.game.upsert({
      where: {
        id: "gam_3c7d8f6e4a024e6fb1b5e9f7d214c3b4",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_3c7d8f6e4a024e6fb1b5e9f7d214c3b4",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });
    
    // Curt Johnson - Game 1
    // randomScore = 209;
    randomScore = 203;
    game = await prisma.game.upsert({
      where: {
        id: "gam_4e1a2b5d8c9f4e7b6a0c3d2e5f9b7d1c",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_4e1a2b5d8c9f4e7b6a0c3d2e5f9b7d1c",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });
    
    // Don Brown - Game 1
    randomScore = 196;
    game = await prisma.game.upsert({
      where: {
        id: "gam_a4f19c2e7b8d4a63b0e5f1c9d2748a36",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_a4f19c2e7b8d4a63b0e5f1c9d2748a36",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Ed Taylor - Game 1
    randomScore = 217;
    game = await prisma.game.upsert({
      where: {
        id: "gam_73e2b8a1c5f94d60a7b3e9c218f46d5a",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_73e2b8a1c5f94d60a7b3e9c218f46d5a",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Fred Anderson - Game 1
    randomScore = 244;
    game = await prisma.game.upsert({
      where: {
        id: "gam_c8a3f571d2e64b09a4c7e1f593b826d0",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_c8a3f571d2e64b09a4c7e1f593b826d0",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Greg Smith - Game 1
    // randomScore = 183;
    randomScore = 188;
    game = await prisma.game.upsert({
      where: {
        id: "gam_19d7e4b2a6c843f5b0e8d31c7a925f64",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_19d7e4b2a6c843f5b0e8d31c7a925f64",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Hal Johnson - Game 1
    randomScore = 258;
    game = await prisma.game.upsert({
      where: {
        id: "gam_e5b27a9c4d163f80b6a1c8e734f92d5b",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_e5b27a9c4d163f80b6a1c8e734f92d5b",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Ian Brown - Game 1
    randomScore = 171;
    game = await prisma.game.upsert({
      where: {
        id: "gam_6f3a1d8b5c294e70a2f9b4d183c7e560",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_6f3a1d8b5c294e70a2f9b4d183c7e560",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Jim Williams - Game 1
    // randomScore = 225;
    randomScore = 194;
    game = await prisma.game.upsert({
      where: {
        id: "gam_b2c84e1f7a593d60e6b0f2a9c4158d73",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_b2c84e1f7a593d60e6b0f2a9c4158d73",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Kyle Jones - Game 1
    // randomScore = 202;
    randomScore = 204;
    game = await prisma.game.upsert({
      where: {
        id: "gam_4d9a7c2e1b653f80c8e4a6d219f375b0",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_4d9a7c2e1b653f80c8e4a6d219f375b0",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Lou Miller - Game 1
    randomScore = 269;
    game = await prisma.game.upsert({
      where: {
        id: "gam_f1e63b8a4c275d90b7a2e5c819d436af",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_f1e63b8a4c275d90b7a2e5c819d436af",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });    

    // Mike Davis - Game 1
    randomScore = 231;
    game = await prisma.game.upsert({
      where: {
        id: "gam_8c1f4a7d2e9b5360c4a8f1d7b3e6259a",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49af",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_8c1f4a7d2e9b5360c4a8f1d7b3e6259a",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49af",
        game_num: 1,
        score: randomScore,
      },
    });

    // Nate Smith - Game 1
    randomScore = 188;
    game = await prisma.game.upsert({
      where: {
        id: "gam_3e7b1c9a5d264f80b2a6e4c8f1739d5b",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_3e7b1c9a5d264f80b2a6e4c8f1739d5b",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Otto Johnson - Game 1
    // randomScore = 264;
    randomScore = 212;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d5a2f8c1b6493e70a4d7c2e915f68b3a",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d5a2f8c1b6493e70a4d7c2e915f68b3a",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Pat Brown - Game 1
    // randomScore = 176;
    randomScore = 203;
    game = await prisma.game.upsert({
      where: {
        id: "gam_6b4e9a1d3c725f80e8a2d6c1b9473f5e",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_6b4e9a1d3c725f80e8a2d6c1b9473f5e",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Quincy Williams - Game 1
    randomScore = 219;
    game = await prisma.game.upsert({
      where: {
        id: "gam_f2c7a4e18b5d3960c3e9a6d172f84b5c",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_f2c7a4e18b5d3960c3e9a6d172f84b5c",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Ray Garcia - Game 1
    randomScore = 247;
    game = await prisma.game.upsert({
      where: {
        id: "gam_1a6d8f3c5b724e90d9c4a7e2f6153b8c",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_1a6d8f3c5b724e90d9c4a7e2f6153b8c",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
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