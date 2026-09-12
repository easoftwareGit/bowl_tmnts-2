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
    // Paul Jones - Game 1
    let randomScore = 174;    
    let game = await prisma.game.upsert({
      where: {
        id: "gam_4af39a6fd2834024acb496c21bbe9761",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_4af39a6fd2834024acb496c21bbe9761",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });
        
    // Sam Smith - Game 1
    randomScore = 208;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1f4",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1f4",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });
    
    // Tom Johnson - Game 1
    randomScore = 159;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1f5",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1f5",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Uri Brown - Game 1
    randomScore = 220;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1f6",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1f6",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Vic Williams - Game 1
    randomScore = 215;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1f7",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1f7",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Wes Jones - Game 1
    randomScore = 260;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1f8",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1f8",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Xavier Garcia - Game 1
    randomScore = 160;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1f9",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1f9",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Yates Martinez - Game 1
    randomScore = 174;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1fa",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1fa",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Zack Smith - Game 1
    randomScore = 265;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1fb",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1fb",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Abby Brown - Game 1
    randomScore = 204;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1fc",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1fc",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Beth Johnson - Game 1
    randomScore = 163;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1fd",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1fd",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });    

    // Carol Williams - Game 1
    randomScore = 188;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1fe",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1fe",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Debra Davis - Game 1
    randomScore = 266;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1ff",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d1ff",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Emily Garcia - Game 1
    randomScore = 230;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d200",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d200",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Faith Hopkins - Game 1
    randomScore = 221;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d201",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a32758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d201",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a32758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Gail Smith - Game 1
    randomScore = 151;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d202",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a33758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d202",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a33758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Helen Brown - Game 1
    randomScore = 252;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d203",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a34758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d203",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a34758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Jackie Johnson - Game 1
    randomScore = 263;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d204",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a35758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d204",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a35758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    // Jackie Johnson - Game 1
    randomScore = 217;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d205",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a36758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
      create: {
        id: "gam_d9b0f7e8f1b84292a4e3ab711703d205",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a36758cff1cc4bab9d9133e661bd49b0",
        game_num: 1,
        score: randomScore,
      },
    });

    console.log("Upserted Games: ", 19);
    return 19;
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