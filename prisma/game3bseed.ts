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
    // Paul Jones - Game 3
    let randomScore = 204;
    let game = await prisma.game.upsert({
      where: {
        id: "gam_51d0e68af48345a38ea2363b3b097b75",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_51d0e68af48345a38ea2363b3b097b75",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Sam Smith - Game 3
    randomScore = 258;
    game = await prisma.game.upsert({
      where: {
        id: "gam_a13d976dfb694026884f95fa8e708a57",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_a13d976dfb694026884f95fa8e708a57",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Tom Johnson - Game 3
    randomScore = 186;
    game = await prisma.game.upsert({
      where: {
        id: "gam_630272a977a246348940a6ffda74f0f7",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_630272a977a246348940a6ffda74f0f7",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Uri Brown - Game 3
    randomScore = 233;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d2598222356f4f59bd5e63dc68c95754",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_d2598222356f4f59bd5e63dc68c95754",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Vic Williams - Game 3
    randomScore = 175;
    game = await prisma.game.upsert({
      where: {
        id: "gam_48f3688716c647098186b3a718019ed1",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_48f3688716c647098186b3a718019ed1",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Wes Jones - Game 3
    randomScore = 219;
    game = await prisma.game.upsert({
      where: {
        id: "gam_35b1598da8a24f86abe2be8c7e7c7fbb",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_35b1598da8a24f86abe2be8c7e7c7fbb",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Xavier Garcia - Game 3
    randomScore = 164;
    game = await prisma.game.upsert({
      where: {
        id: "gam_b19aab90131f4b168adf043d745cf2ab",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_b19aab90131f4b168adf043d745cf2ab",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Yates Martinez - Game 3
    randomScore = 267;
    game = await prisma.game.upsert({
      where: {
        id: "gam_91f1696f11e246ef9ee8682456437920",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_91f1696f11e246ef9ee8682456437920",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Zack Smith - Game 3
    randomScore = 193;
    game = await prisma.game.upsert({
      where: {
        id: "gam_ed24d47565a744b4b78ae683731b2688",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_ed24d47565a744b4b78ae683731b2688",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Abby Brown - Game 3
    randomScore = 247;
    game = await prisma.game.upsert({
      where: {
        id: "gam_26e16cd3ed13480190ec84113c63059d",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_26e16cd3ed13480190ec84113c63059d",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Beth Johnson - Game 3
    randomScore = 211;
    game = await prisma.game.upsert({
      where: {
        id: "gam_f078761894184422ab9e1af094537b40",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_f078761894184422ab9e1af094537b40",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Carol Williams - Game 3
    randomScore = 153;
    game = await prisma.game.upsert({
      where: {
        id: "gam_9b013a2d1a7d4f95a4281f791b5ad082",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_9b013a2d1a7d4f95a4281f791b5ad082",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Debra Davis - Game 3
    randomScore = 226;
    game = await prisma.game.upsert({
      where: {
        id: "gam_70a59bb0c54148bab395f24b66dc29cf",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_70a59bb0c54148bab395f24b66dc29cf",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Emily Garcia - Game 3
    randomScore = 270;
    game = await prisma.game.upsert({
      where: {
        id: "gam_2b42770615804badbfce652c8a9331a0",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_2b42770615804badbfce652c8a9331a0",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Faith Hopkins - Game 3
    randomScore = 182;
    game = await prisma.game.upsert({
      where: {
        id: "gam_131b7fd3fc2b46099e087ce990576098",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a32758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_131b7fd3fc2b46099e087ce990576098",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a32758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Gail Smith - Game 3
    randomScore = 239;
    game = await prisma.game.upsert({
      where: {
        id: "gam_83fe72c0ab98442f98b973198bb14f97",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a33758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_83fe72c0ab98442f98b973198bb14f97",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a33758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Helen Brown - Game 3
    randomScore = 168;
    game = await prisma.game.upsert({
      where: {
        id: "gam_bb46205b64864c7193ec0fe2d157a4a2",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a34758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_bb46205b64864c7193ec0fe2d157a4a2",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a34758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Jackie Johnson - Game 3
    randomScore = 252;
    game = await prisma.game.upsert({
      where: {
        id: "gam_6eb6ce9343e94431b27140f51dfcb452",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a35758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_6eb6ce9343e94431b27140f51dfcb452",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a35758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Jackie Johnson - Game 3
    randomScore = 195;
    game = await prisma.game.upsert({
      where: {
        id: "gam_c876297a0acf4e2391ca0580f8d0f9b1",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a36758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_c876297a0acf4e2391ca0580f8d0f9b1",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a36758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
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