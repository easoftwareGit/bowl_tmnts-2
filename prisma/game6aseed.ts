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
    // Al Davis - Game 6
    let randomScore = 215;
    let game = await prisma.game.upsert({
      where: {
        id: "gam_0f263c599ab940f08c53ec8b7672ce26",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_0f263c599ab940f08c53ec8b7672ce26",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Bob Smith - Game 6
    randomScore = 155;
    game = await prisma.game.upsert({
      where: {
        id: "gam_8c3906bf69a64dcfa66736340204b67f",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_8c3906bf69a64dcfa66736340204b67f",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Curt Johnson - Game 6
    randomScore = 206;
    game = await prisma.game.upsert({
      where: {
        id: "gam_2dc31c19fb554434a42c7c5059813b2f",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_2dc31c19fb554434a42c7c5059813b2f",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Don Brown - Game 6
    randomScore = 167;
    game = await prisma.game.upsert({
      where: {
        id: "gam_4bb4c1ae4a4d442780a28080cbe3df37",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_4bb4c1ae4a4d442780a28080cbe3df37",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Ed Taylor - Game 6
    randomScore = 212;
    game = await prisma.game.upsert({
      where: {
        id: "gam_568411059d06412685ee858bfea72290",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_568411059d06412685ee858bfea72290",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Fred Anderson - Game 6
    randomScore = 203;
    game = await prisma.game.upsert({
      where: {
        id: "gam_3b9568f6af064fa79ebcdb87eb2521b6",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_3b9568f6af064fa79ebcdb87eb2521b6",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Greg Smith - Game 6
    randomScore = 153;
    game = await prisma.game.upsert({
      where: {
        id: "gam_265b18009a84426b9e4086449c20a299",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_265b18009a84426b9e4086449c20a299",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Hal Johnson - Game 6
    randomScore = 156;
    game = await prisma.game.upsert({
      where: {
        id: "gam_8691ef49fedc412ba5d595787dac6f3d",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_8691ef49fedc412ba5d595787dac6f3d",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Ian Brown - Game 6
    randomScore = 268;
    game = await prisma.game.upsert({
      where: {
        id: "gam_1a1aa9feffdb40659f8f2da3b4862506",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_1a1aa9feffdb40659f8f2da3b4862506",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Jim Williams - Game 6
    randomScore = 234;
    game = await prisma.game.upsert({
      where: {
        id: "gam_2537392d83694c32a789e1f76cbb646a",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_2537392d83694c32a789e1f76cbb646a",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Kyle Jones - Game 6
    randomScore = 254;
    game = await prisma.game.upsert({
      where: {
        id: "gam_fd3aadd1b62a47899507dee287e6085a",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_fd3aadd1b62a47899507dee287e6085a",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Lou Miller - Game 6
    randomScore = 258;
    game = await prisma.game.upsert({
      where: {
        id: "gam_8a154f3030fb48b4b6a5dc3fbdcfdcc9",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_8a154f3030fb48b4b6a5dc3fbdcfdcc9",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Mike Davis - Game 6
    randomScore = 153;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d3864bd8a5a648eea664da42ddf0b439",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49af",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_d3864bd8a5a648eea664da42ddf0b439",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49af",
        game_num: 6,
        score: randomScore,
      },
    });

    // Nate Smith - Game 6
    randomScore = 189;
    game = await prisma.game.upsert({
      where: {
        id: "gam_25470d47089e4faba222beb1701e8449",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_25470d47089e4faba222beb1701e8449",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Otto Johnson - Game 6
    randomScore = 196;
    game = await prisma.game.upsert({
      where: {
        id: "gam_f2130d5695c54ad18c2c755dddfb55fb",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_f2130d5695c54ad18c2c755dddfb55fb",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Pat Brown - Game 6
    randomScore = 185;
    game = await prisma.game.upsert({
      where: {
        id: "gam_9b464375129b4079b004379bfecd7a94",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_9b464375129b4079b004379bfecd7a94",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Quincy Williams - Game 6
    randomScore = 209;
    game = await prisma.game.upsert({
      where: {
        id: "gam_dfc77953c9554f898a856e21fe5dd500",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_dfc77953c9554f898a856e21fe5dd500",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
    });

    // Ray Garcia - Game 6
    randomScore = 253;
    game = await prisma.game.upsert({
      where: {
        id: "gam_869dc4d0907a4bf09059076c4165903d",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
        score: randomScore,
      },
      create: {
        id: "gam_869dc4d0907a4bf09059076c4165903d",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
        game_num: 6,
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