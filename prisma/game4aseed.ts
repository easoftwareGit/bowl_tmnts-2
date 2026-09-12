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
    // Al Davis - Game 4
    let randomScore = 238;
    let game = await prisma.game.upsert({
      where: {
        id: "gam_3d0f61e487c84f00a829173d952bc3af",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_3d0f61e487c84f00a829173d952bc3af",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Bob Smith - Game 4
    randomScore = 183;
    game = await prisma.game.upsert({
      where: {
        id: "gam_7ac63d07a5864d51bf3fbf30ccf5ad3e",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_7ac63d07a5864d51bf3fbf30ccf5ad3e",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Curt Johnson - Game 4
    randomScore = 259;
    game = await prisma.game.upsert({
      where: {
        id: "gam_1e25d8aacf2147edaf15a9d42c891ad7",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_1e25d8aacf2147edaf15a9d42c891ad7",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Don Brown - Game 4
    randomScore = 211;
    game = await prisma.game.upsert({
      where: {
        id: "gam_fcb4a0c583a64e11b54740e5a84e9950",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_fcb4a0c583a64e11b54740e5a84e9950",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Ed Taylor - Game 4
    randomScore = 176;
    game = await prisma.game.upsert({
      where: {
        id: "gam_ba5c28105b414f5e92db63359055ed80",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_ba5c28105b414f5e92db63359055ed80",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Fred Anderson - Game 4
    randomScore = 197;
    game = await prisma.game.upsert({
      where: {
        id: "gam_20e06c455ebc4d229c3461559670af26",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_20e06c455ebc4d229c3461559670af26",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Greg Smith - Game 4
    randomScore = 264;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d68c33c7340d4b9a858aec9ec95c34a6",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_d68c33c7340d4b9a858aec9ec95c34a6",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Hal Johnson - Game 4
    randomScore = 155;
    game = await prisma.game.upsert({
      where: {
        id: "gam_592e99a790f648a5bd55235bbfd89b74",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_592e99a790f648a5bd55235bbfd89b74",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Ian Brown - Game 4
    randomScore = 225;
    game = await prisma.game.upsert({
      where: {
        id: "gam_73b596d6a2f74eeb8746601e53ab0859",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_73b596d6a2f74eeb8746601e53ab0859",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Jim Williams - Game 4
    randomScore = 201;
    game = await prisma.game.upsert({
      where: {
        id: "gam_43a05ef5ac1746c9a6cf9994bc2184e8",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_43a05ef5ac1746c9a6cf9994bc2184e8",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Kyle Jones - Game 4
    randomScore = 244;
    game = await prisma.game.upsert({
      where: {
        id: "gam_4eb8e85525dc43db9492137dd58dfdc7",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_4eb8e85525dc43db9492137dd58dfdc7",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Lou Miller - Game 4
    randomScore = 169;
    game = await prisma.game.upsert({
      where: {
        id: "gam_98e63ed7ea514cb79b4449224d79aadd",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_98e63ed7ea514cb79b4449224d79aadd",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Mike Davis - Game 4
    randomScore = 231;
    game = await prisma.game.upsert({
      where: {
        id: "gam_e4e7dcf0902c45339e6932e7efbcdb90",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49af",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_e4e7dcf0902c45339e6932e7efbcdb90",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49af",
        game_num: 4,
        score: randomScore,
      },
    });

    // Nate Smith - Game 4
    randomScore = 216;
    game = await prisma.game.upsert({
      where: {
        id: "gam_656153da70ca4f158c26f994ae8a2bfa",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_656153da70ca4f158c26f994ae8a2bfa",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Otto Johnson - Game 4
    randomScore = 193;
    game = await prisma.game.upsert({
      where: {
        id: "gam_2ad97dc9af354e8996ac0d04047bb39f",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_2ad97dc9af354e8996ac0d04047bb39f",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Pat Brown - Game 4
    randomScore = 252;
    game = await prisma.game.upsert({
      where: {
        id: "gam_875c63e3c79b4d69bc8f498ba46b9a5e",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_875c63e3c79b4d69bc8f498ba46b9a5e",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Quincy Williams - Game 4
    randomScore = 186;
    game = await prisma.game.upsert({
      where: {
        id: "gam_d4ec780bd05e4628ad8bdce956f65f57",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_d4ec780bd05e4628ad8bdce956f65f57",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
    });

    // Ray Garcia - Game 4
    randomScore = 267;
    game = await prisma.game.upsert({
      where: {
        id: "gam_88d8324373df44eb8751d35c2ad52e4e",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
        score: randomScore,
      },
      create: {
        id: "gam_88d8324373df44eb8751d35c2ad52e4e",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
        game_num: 4,
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