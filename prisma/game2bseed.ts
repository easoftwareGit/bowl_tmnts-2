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
    // Paul Jones - Game 2
    let randomScore = 161;
    // randomScore = 161;
    randomScore = 192;
    let game = await prisma.game.upsert({
      where: {
        id: "gam_d254ddd9a8f84d1aa9c484ba19940a0a",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_d254ddd9a8f84d1aa9c484ba19940a0a",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });
        
    // Sam Smith - Game 2
    // randomScore = 159;
    // randomScore = 207;
    randomScore = 206;
    game = await prisma.game.upsert({
      where: {
        id: "gam_1bae77a91a9d40b9a0f20ca418c6593e",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_1bae77a91a9d40b9a0f20ca418c6593e",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });
    
    // Tom Johnson - Game 2
    randomScore = 222;
    game = await prisma.game.upsert({
      where: {
        id: "gam_dd961fe875ad4065868ba3d6c8a9b3eb",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_dd961fe875ad4065868ba3d6c8a9b3eb",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Uri Brown - Game 2
    randomScore = 266;
    game = await prisma.game.upsert({
      where: {
        id: "gam_0f7e4db53a71479ea3464336460be86b",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_0f7e4db53a71479ea3464336460be86b",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Vic Williams - Game 2
    randomScore = 169;
    game = await prisma.game.upsert({
      where: {
        id: "gam_83037397a50c46bfae8aa4bd5d1a7d66",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_83037397a50c46bfae8aa4bd5d1a7d66",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Wes Jones - Game 2
    randomScore = 161;
    game = await prisma.game.upsert({
      where: {
        id: "gam_de174f7a0c8b440cb9f5efde0e118410",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_de174f7a0c8b440cb9f5efde0e118410",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Xavier Garcia - Game 2
    randomScore = 197;
    game = await prisma.game.upsert({
      where: {
        id: "gam_4eebbdb6887447f2bd56e339dfecf0a2",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_4eebbdb6887447f2bd56e339dfecf0a2",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Yates Martinez - Game 2
    randomScore = 228;
    game = await prisma.game.upsert({
      where: {
        id: "gam_a4f6920782a34ab192a491c966f98460",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_a4f6920782a34ab192a491c966f98460",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Zack Smith - Game 2
    randomScore = 158;
    game = await prisma.game.upsert({
      where: {
        id: "gam_eb4c76fc979745eca8baa5d4c8abc610",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_eb4c76fc979745eca8baa5d4c8abc610",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Abby Brown - Game 2
    randomScore = 187;
    game = await prisma.game.upsert({
      where: {
        id: "gam_3835b1e7c040498fb30d7fea9718bf83",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_3835b1e7c040498fb30d7fea9718bf83",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Beth Johnson - Game 2
    randomScore = 257;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d6ce5792e1744af99606ab8b21305160",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_d6ce5792e1744af99606ab8b21305160",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });    

    // Carol Williams - Game 2
    randomScore = 186;
    game = await prisma.game.upsert({
      where: {
        id: "gam_3cb006ae68814bbda5fcdc41ff54c589",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_3cb006ae68814bbda5fcdc41ff54c589",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Debra Davis - Game 2
    randomScore = 259;
    game = await prisma.game.upsert({
      where: {
        id: "gam_4bdcff8931834204bfc0db239242b07a",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_4bdcff8931834204bfc0db239242b07a",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Emily Garcia - Game 2
    randomScore = 251;
    game = await prisma.game.upsert({
      where: {
        id: "gam_eca0cffdf5d945e0aa3a656f9fac1264",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_eca0cffdf5d945e0aa3a656f9fac1264",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Faith Hopkins - Game 2
    randomScore = 255;
    game = await prisma.game.upsert({
      where: {
        id: "gam_a4d30466b5904c33a76a14923a06061b",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a32758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_a4d30466b5904c33a76a14923a06061b",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a32758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Gail Smith - Game 2
    randomScore = 262;
    game = await prisma.game.upsert({
      where: {
        id: "gam_411939eb348743d4892e8ef1cd034824",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a33758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_411939eb348743d4892e8ef1cd034824",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a33758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Helen Brown - Game 2
    randomScore = 155;
    game = await prisma.game.upsert({
      where: {
        id: "gam_96870c718be1446888e760f1f2f7240c",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a34758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_96870c718be1446888e760f1f2f7240c",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a34758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Jackie Johnson - Game 2
    randomScore = 223;
    game = await prisma.game.upsert({
      where: {
        id: "gam_86dbb41374bd433181bb6433aa1eab15",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a35758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_86dbb41374bd433181bb6433aa1eab15",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a35758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
    });

    // Jackie Johnson - Game 2
    randomScore = 202;
    game = await prisma.game.upsert({
      where: {
        id: "gam_5e9664c165844e899d906d034ea0b5a6",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a36758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
        score: randomScore,
      },
      create: {
        id: "gam_5e9664c165844e899d906d034ea0b5a6",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a36758cff1cc4bab9d9133e661bd49b0",
        game_num: 2,
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