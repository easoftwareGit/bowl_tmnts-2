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
    // Al Davis - Game 5
    let randomScore = 224;
    let game = await prisma.game.upsert({
      where: {
        id: "gam_6df38b8c9f3e4ab0a73f2f570e1ef684",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_6df38b8c9f3e4ab0a73f2f570e1ef684",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Bob Smith - Game 5
    randomScore = 181;
    game = await prisma.game.upsert({
      where: {
        id: "gam_4b2e5f4b7b6a4d8c81a588f09f197349",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_4b2e5f4b7b6a4d8c81a588f09f197349",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Curt Johnson - Game 5
    randomScore = 263;
    game = await prisma.game.upsert({
      where: {
        id: "gam_2d2fef169b5d46e390cc31974f7549c7",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_2d2fef169b5d46e390cc31974f7549c7",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Don Brown - Game 5
    randomScore = 208;
    game = await prisma.game.upsert({
      where: {
        id: "gam_8c2d17a9f09343c8986e89ba9fdd5db1",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_8c2d17a9f09343c8986e89ba9fdd5db1",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Ed Taylor - Game 5
    randomScore = 172;
    game = await prisma.game.upsert({
      where: {
        id: "gam_eb59e4909d7a47abb7247cbf7cc4a087",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_eb59e4909d7a47abb7247cbf7cc4a087",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Fred Anderson - Game 5
    randomScore = 197;
    game = await prisma.game.upsert({
      where: {
        id: "gam_1811c0fa6b344b5882966eb6a919716e",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_1811c0fa6b344b5882966eb6a919716e",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Greg Smith - Game 5
    randomScore = 250;
    game = await prisma.game.upsert({
      where: {
        id: "gam_44f247fd535e4bbdb71e8d584c393db0",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_44f247fd535e4bbdb71e8d584c393db0",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Hal Johnson - Game 5
    randomScore = 166;
    game = await prisma.game.upsert({
      where: {
        id: "gam_523a5ec173964f02b899fe52ccf8deca",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_523a5ec173964f02b899fe52ccf8deca",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Ian Brown - Game 5
    randomScore = 229;
    game = await prisma.game.upsert({
      where: {
        id: "gam_f565ca7ef1fe447bb5662d9d97551251",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_f565ca7ef1fe447bb5662d9d97551251",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Jim Williams - Game 5
    randomScore = 189;
    game = await prisma.game.upsert({
      where: {
        id: "gam_4a3474312f3a451ea0f4ac4036d7dc8f",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_4a3474312f3a451ea0f4ac4036d7dc8f",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Kyle Jones - Game 5
    randomScore = 216;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d153343d5e1449989816511602ccd4f3",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_d153343d5e1449989816511602ccd4f3",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Lou Miller - Game 5
    randomScore = 154;
    game = await prisma.game.upsert({
      where: {
        id: "gam_f3cc1092dbfe451fa513320434f09220",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_f3cc1092dbfe451fa513320434f09220",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Mike Davis - Game 5
    randomScore = 242;
    game = await prisma.game.upsert({
      where: {
        id: "gam_bfb990aa76a74c4289fa489223826d90",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49af",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_bfb990aa76a74c4289fa489223826d90",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49af",
        game_num: 5,
        score: randomScore,
      },
    });

    // Nate Smith - Game 5
    randomScore = 205;
    game = await prisma.game.upsert({
      where: {
        id: "gam_66f05cd55d8c4f648ed92466adf87b80",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_66f05cd55d8c4f648ed92466adf87b80",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Otto Johnson - Game 5
    randomScore = 183;
    game = await prisma.game.upsert({
      where: {
        id: "gam_a81f7133e313408eb358169972fd8517",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_a81f7133e313408eb358169972fd8517",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Pat Brown - Game 5
    randomScore = 268;
    game = await prisma.game.upsert({
      where: {
        id: "gam_97bb4d9942ae4770b64e00b8cc1c0698",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_97bb4d9942ae4770b64e00b8cc1c0698",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Quincy Williams - Game 5
    randomScore = 159;
    game = await prisma.game.upsert({
      where: {
        id: "gam_1cc065f8f877408cb01ab002c6ad286a",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_1cc065f8f877408cb01ab002c6ad286a",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
    });

    // Ray Garcia - Game 5
    randomScore = 236;
    game = await prisma.game.upsert({
      where: {
        id: "gam_2a88abf73ec946f7b1853de10cf2c263",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
        score: randomScore,
      },
      create: {
        id: "gam_2a88abf73ec946f7b1853de10cf2c263",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
        game_num: 5,
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