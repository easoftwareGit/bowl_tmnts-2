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
    // Paul Jones - Game 5
    let randomScore = 214;
    let game = await prisma.game.upsert({
      where: {
        id: "gam_7e4a40d3a5d64b47a816c51f6c905f8d",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_7e4a40d3a5d64b47a816c51f6c905f8d",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Sam Smith - Game 5
    randomScore = 168;
    game = await prisma.game.upsert({
      where: {
        id: "gam_2707655672b948e9a8492536cb761ece",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_2707655672b948e9a8492536cb761ece",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Tom Johnson - Game 5
    randomScore = 242;
    game = await prisma.game.upsert({
      where: {
        id: "gam_91a8b27888994c9ea5088f4fa8c3951b",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_91a8b27888994c9ea5088f4fa8c3951b",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Uri Brown - Game 5
    randomScore = 193;
    game = await prisma.game.upsert({
      where: {
        id: "gam_fbe84cd0193d46fdbe5ed5fe4d2a769a",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_fbe84cd0193d46fdbe5ed5fe4d2a769a",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Vic Williams - Game 5
    randomScore = 257;
    game = await prisma.game.upsert({
      where: {
        id: "gam_bfbe01cad595418b8b0f1ab9fa4096f1",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_bfbe01cad595418b8b0f1ab9fa4096f1",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Wes Jones - Game 5
    randomScore = 181;
    game = await prisma.game.upsert({
      where: {
        id: "gam_35d39bb0f5634c9096a8f7e53801cc30",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_35d39bb0f5634c9096a8f7e53801cc30",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Xavier Garcia - Game 5
    randomScore = 225;
    game = await prisma.game.upsert({
      where: {
        id: "gam_96e84575543c4da9a6df994d2e45fb2d",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_96e84575543c4da9a6df994d2e45fb2d",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Yates Martinez - Game 5
    randomScore = 156;
    game = await prisma.game.upsert({
      where: {
        id: "gam_490d2b6835fd43cfb695390ad02af260",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_490d2b6835fd43cfb695390ad02af260",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Zack Smith - Game 5
    randomScore = 236;
    game = await prisma.game.upsert({
      where: {
        id: "gam_374085d7cdbc4c8fb1d504d82ed7c8d6",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_374085d7cdbc4c8fb1d504d82ed7c8d6",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Abby Brown - Game 5
    randomScore = 203;
    game = await prisma.game.upsert({
      where: {
        id: "gam_cf99c3e36b944e27995ea625170d3314",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_cf99c3e36b944e27995ea625170d3314",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Beth Johnson - Game 5
    randomScore = 269;
    game = await prisma.game.upsert({
      where: {
        id: "gam_c388a5fa24234c9b90a7746e31cfd016",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_c388a5fa24234c9b90a7746e31cfd016",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Carol Williams - Game 5
    randomScore = 172;
    game = await prisma.game.upsert({
      where: {
        id: "gam_e50c545a60a743219c5e6096063de8ea",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_e50c545a60a743219c5e6096063de8ea",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Debra Davis - Game 5
    randomScore = 248;
    game = await prisma.game.upsert({
      where: {
        id: "gam_9653ad10e2f3412d82200c34cc3c74fd",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_9653ad10e2f3412d82200c34cc3c74fd",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Emily Garcia - Game 5
    randomScore = 197;
    game = await prisma.game.upsert({
      where: {
        id: "gam_6653f1e8266548f5a0864d51775b2187",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_6653f1e8266548f5a0864d51775b2187",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Faith Hopkins - Game 5
    randomScore = 217;
    game = await prisma.game.upsert({
      where: {
        id: "gam_c44d2024fef442479005323239df5e5f",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a32758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_c44d2024fef442479005323239df5e5f",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a32758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Gail Smith - Game 5
    randomScore = 184;
    game = await prisma.game.upsert({
      where: {
        id: "gam_3cd4378962704e3e80f57c6949a33677",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a33758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_3cd4378962704e3e80f57c6949a33677",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a33758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Helen Brown - Game 5
    randomScore = 262;
    game = await prisma.game.upsert({
      where: {
        id: "gam_52e5514f19354c718dffed422d59b773",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a34758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_52e5514f19354c718dffed422d59b773",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a34758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Jackie Johnson - Game 5
    randomScore = 151;
    game = await prisma.game.upsert({
      where: {
        id: "gam_0200bb42eef1491a879a75cd75b8f411",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a35758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_0200bb42eef1491a879a75cd75b8f411",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a35758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Jackie Johnson - Game 5
    randomScore = 231;
    game = await prisma.game.upsert({
      where: {
        id: "gam_f72d47448fe24e4ca9c52bafc66380e5",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a36758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_f72d47448fe24e4ca9c52bafc66380e5",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a36758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
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
  const count = await gamesUpsert_FullTmnt();
  if (count < 0) return;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });