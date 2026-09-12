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
    // Paul Jones - Game 4
    let randomScore = 229;
    let game = await prisma.game.upsert({
      where: {
        id: "gam_3b317ca40eb44287b2829a9ccfb1aad4",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_3b317ca40eb44287b2829a9ccfb1aad4",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Sam Smith - Game 4
    randomScore = 171;
    game = await prisma.game.upsert({
      where: {
        id: "gam_cded9371fedb4e31b0451d322db25b58",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_cded9371fedb4e31b0451d322db25b58",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Tom Johnson - Game 4
    randomScore = 177;
    game = await prisma.game.upsert({
      where: {
        id: "gam_a69f97213e7e462cad6f5ce78ecd2eb8",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_a69f97213e7e462cad6f5ce78ecd2eb8",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Uri Brown - Game 4
    randomScore = 227;
    game = await prisma.game.upsert({
      where: {
        id: "gam_f89fb52b1f2b404891ad0ad70c7c0a29",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_f89fb52b1f2b404891ad0ad70c7c0a29",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Vic Williams - Game 4
    randomScore = 155;
    game = await prisma.game.upsert({
      where: {
        id: "gam_30f39be91f5041e280a2beb0365928ca",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_30f39be91f5041e280a2beb0365928ca",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Wes Jones - Game 4
    randomScore = 189;
    game = await prisma.game.upsert({
      where: {
        id: "gam_0923f5ef6f1d4050b1592a086cb22e67",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_0923f5ef6f1d4050b1592a086cb22e67",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Xavier Garcia - Game 4
    randomScore = 218;
    game = await prisma.game.upsert({
      where: {
        id: "gam_51f38a58e10148ac832dd4612f9b6dee",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_51f38a58e10148ac832dd4612f9b6dee",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Yates Martinez - Game 4
    randomScore = 158;
    game = await prisma.game.upsert({
      where: {
        id: "gam_ee2ea04eb40e4d67a0de0346eadd8c32",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_ee2ea04eb40e4d67a0de0346eadd8c32",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Zack Smith - Game 4
    randomScore = 198;
    game = await prisma.game.upsert({
      where: {
        id: "gam_f8c8738a508240cc9675d3f07288304b",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_f8c8738a508240cc9675d3f07288304b",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Abby Brown - Game 4
    randomScore = 232;
    game = await prisma.game.upsert({
      where: {
        id: "gam_411facabf65047df900ddcda3c0b9939",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_411facabf65047df900ddcda3c0b9939",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Beth Johnson - Game 4
    randomScore = 260;
    game = await prisma.game.upsert({
      where: {
        id: "gam_e8bb426d95a74eb1bf422c40d50fe840",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_e8bb426d95a74eb1bf422c40d50fe840",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Carol Williams - Game 4
    randomScore = 225;
    game = await prisma.game.upsert({
      where: {
        id: "gam_bd319e618bed4ee7be2151924f43f932",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_bd319e618bed4ee7be2151924f43f932",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Debra Davis - Game 4
    randomScore = 156;
    game = await prisma.game.upsert({
      where: {
        id: "gam_85a2ee2d088a4ca6a6951fd93ffb0d6e",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_85a2ee2d088a4ca6a6951fd93ffb0d6e",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Emily Garcia - Game 4
    randomScore = 249;
    game = await prisma.game.upsert({
      where: {
        id: "gam_dfcebeafa02540b8b325c57dd95c7d44",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_dfcebeafa02540b8b325c57dd95c7d44",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Faith Hopkins - Game 4
    randomScore = 255;
    game = await prisma.game.upsert({
      where: {
        id: "gam_6843363f1db84756bb1d1e6c0c6485fd",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a32758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_6843363f1db84756bb1d1e6c0c6485fd",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a32758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Gail Smith - Game 4
    randomScore = 269;
    game = await prisma.game.upsert({
      where: {
        id: "gam_10500a30fd8e4f2f94a1716547bd4732",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a33758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_10500a30fd8e4f2f94a1716547bd4732",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a33758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Helen Brown - Game 4
    randomScore = 230;
    game = await prisma.game.upsert({
      where: {
        id: "gam_1f03796fafad40d0b4207452f0e933dc",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a34758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_1f03796fafad40d0b4207452f0e933dc",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a34758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Jackie Johnson - Game 4
    randomScore = 151;
    game = await prisma.game.upsert({
      where: {
        id: "gam_4d6b43b2da7642589ae871e6809758b2",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a35758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_4d6b43b2da7642589ae871e6809758b2",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a35758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Jackie Johnson - Game 4
    randomScore = 251;
    game = await prisma.game.upsert({
      where: {
        id: "gam_2b1ae4af9a1340979c026ce715442046",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a36758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_2b1ae4af9a1340979c026ce715442046",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a36758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
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