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
    // Paul Jones - Game 6
    let randomScore = 209;
    let game = await prisma.game.upsert({
      where: {
        id: "gam_9b557d0d1ceb43af85fcdbed0c9e25a5",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_9b557d0d1ceb43af85fcdbed0c9e25a5",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Sam Smith - Game 6
    randomScore = 244;
    game = await prisma.game.upsert({
      where: {
        id: "gam_14c07210033346e7894123874daecaef",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_14c07210033346e7894123874daecaef",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Tom Johnson - Game 6
    randomScore = 254;
    game = await prisma.game.upsert({
      where: {
        id: "gam_280e8b8c1de44ede95656b84c13ed0ae",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_280e8b8c1de44ede95656b84c13ed0ae",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Uri Brown - Game 6
    randomScore = 233;
    game = await prisma.game.upsert({
      where: {
        id: "gam_ebba9ee9fe38423cb8757ee353feddd5",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_ebba9ee9fe38423cb8757ee353feddd5",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Vic Williams - Game 6
    randomScore = 258;
    game = await prisma.game.upsert({
      where: {
        id: "gam_9b67d592a81045e6a6711afe97b09cd4",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_9b67d592a81045e6a6711afe97b09cd4",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Wes Jones - Game 6
    randomScore = 241;
    game = await prisma.game.upsert({
      where: {
        id: "gam_683da3cf3b5b4f4e9e571661377e8db8",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_683da3cf3b5b4f4e9e571661377e8db8",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Xavier Garcia - Game 6
    randomScore = 267;
    game = await prisma.game.upsert({
      where: {
        id: "gam_8ec2af0130dc4a838a7106bd1bd940ba",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_8ec2af0130dc4a838a7106bd1bd940ba",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Yates Martinez - Game 6
    randomScore = 237;
    game = await prisma.game.upsert({
      where: {
        id: "gam_1222038a49aa48c1a6c21e1f10140ca7",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_1222038a49aa48c1a6c21e1f10140ca7",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Zack Smith - Game 6
    randomScore = 159;
    game = await prisma.game.upsert({
      where: {
        id: "gam_4be426a407f743e89bed297b61007a7a",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_4be426a407f743e89bed297b61007a7a",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Abby Brown - Game 6
    randomScore = 231;
    game = await prisma.game.upsert({
      where: {
        id: "gam_ab08e1084b95455a9acee987713e3e66",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_ab08e1084b95455a9acee987713e3e66",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Beth Johnson - Game 6
    randomScore = 240;
    game = await prisma.game.upsert({
      where: {
        id: "gam_914fe8c9f5714040b9159faab582b322",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_914fe8c9f5714040b9159faab582b322",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Carol Williams - Game 6
    randomScore = 202;
    game = await prisma.game.upsert({
      where: {
        id: "gam_a08c8d30b3bf4f4db2a984cdb55e21c1",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_a08c8d30b3bf4f4db2a984cdb55e21c1",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Debra Davis - Game 6
    randomScore = 160;
    game = await prisma.game.upsert({
      where: {
        id: "gam_7579d4c7fdb648b7a83b30d0be34a614",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_7579d4c7fdb648b7a83b30d0be34a614",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Emily Garcia - Game 6
    randomScore = 158;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d9448fd2e1674d348e0bd3bab3f40d05",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_d9448fd2e1674d348e0bd3bab3f40d05",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Faith Hopkins - Game 6
    randomScore = 167;
    game = await prisma.game.upsert({
      where: {
        id: "gam_e624235401054af783905d07290c371c",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a32758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_e624235401054af783905d07290c371c",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a32758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Gail Smith - Game 6
    randomScore = 153;
    game = await prisma.game.upsert({
      where: {
        id: "gam_6ffb558eb2f04e5985c285fed98e826a",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a33758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_6ffb558eb2f04e5985c285fed98e826a",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a33758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Helen Brown - Game 6
    randomScore = 171;
    game = await prisma.game.upsert({
      where: {
        id: "gam_cf3286b1bfc14ab7961d905980500fea",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a34758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_cf3286b1bfc14ab7961d905980500fea",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a34758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Jackie Johnson - Game 6
    randomScore = 212;
    game = await prisma.game.upsert({
      where: {
        id: "gam_e3d4a7dbf2004eb7b11ff0e4e4e93bd5",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a35758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_e3d4a7dbf2004eb7b11ff0e4e4e93bd5",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a35758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Jackie Johnson - Game 6
    randomScore = 212;
    game = await prisma.game.upsert({
      where: {
        id: "gam_b149a80445a04fa5bff60c81fdd8c7ce",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a36758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_b149a80445a04fa5bff60c81fdd8c7ce",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a36758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
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