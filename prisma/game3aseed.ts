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
    // Al Davis - Game 3
    let randomScore = 179;
    let game = await prisma.game.upsert({
      where: {
        id: "gam_c3cde28964b544f29e3ff1c1ce7a6135",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_c3cde28964b544f29e3ff1c1ce7a6135",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Bob Smith - Game 3
    randomScore = 229;
    game = await prisma.game.upsert({
      where: {
        id: "gam_cb66979778ae468ca9b4be8258004e71",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_cb66979778ae468ca9b4be8258004e71",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Curt Johnson - Game 3
    randomScore = 218;
    game = await prisma.game.upsert({
      where: {
        id: "gam_7c548076575f4973805c4cc06847a545",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_7c548076575f4973805c4cc06847a545",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Don Brown - Game 3
    randomScore = 164;
    game = await prisma.game.upsert({
      where: {
        id: "gam_90c717a52eb74d2885e164603b59227c",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_90c717a52eb74d2885e164603b59227c",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Ed Taylor - Game 3
    randomScore = 181;
    game = await prisma.game.upsert({
      where: {
        id: "gam_35c35559ea4146f0bce56642211df76a",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_35c35559ea4146f0bce56642211df76a",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Fred Anderson - Game 3
    randomScore = 158;
    game = await prisma.game.upsert({
      where: {
        id: "gam_137967cf65d443adbdc0c505b89a63fe",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_137967cf65d443adbdc0c505b89a63fe",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Greg Smith - Game 3
    randomScore = 155;
    game = await prisma.game.upsert({
      where: {
        id: "gam_697f9798a58548be8dd075055b8d5b60",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_697f9798a58548be8dd075055b8d5b60",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Hal Johnson - Game 3
    randomScore = 174;    
    game = await prisma.game.upsert({
      where: {
        id: "gam_c6ed63d8e17b45edbf9f973edc889bb6",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_c6ed63d8e17b45edbf9f973edc889bb6",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Ian Brown - Game 3
    randomScore = 182;
    game = await prisma.game.upsert({
      where: {
        id: "gam_1ddd2bcb99aa4302a993e5594b76d2d3",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_1ddd2bcb99aa4302a993e5594b76d2d3",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Jim Williams - Game 3
    randomScore = 192;
    game = await prisma.game.upsert({
      where: {
        id: "gam_e9e60e96ff6a41918802a13ee575619d",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_e9e60e96ff6a41918802a13ee575619d",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Kyle Jones - Game 3
    randomScore = 188;
    game = await prisma.game.upsert({
      where: {
        id: "gam_33554e484afb42a595b0995b60a0d2d1",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_33554e484afb42a595b0995b60a0d2d1",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Lou Miller - Game 3
    randomScore = 225;
    game = await prisma.game.upsert({
      where: {
        id: "gam_7b8596a3db32457a97add1019e7cab7f",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_7b8596a3db32457a97add1019e7cab7f",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Mike Davis - Game 3
    randomScore = 226;
    game = await prisma.game.upsert({
      where: {
        id: "gam_62a379043b5f42f8a131fbb9f62227b6",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49af",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_62a379043b5f42f8a131fbb9f62227b6",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49af",
        game_num: 3,
        score: randomScore,
      },
    });

    // Nate Smith - Game 3
    randomScore = 214;
    game = await prisma.game.upsert({
      where: {
        id: "gam_93bfd9dcb617478ab5cf3369a40ef778",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_93bfd9dcb617478ab5cf3369a40ef778",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Otto Johnson - Game 3
    randomScore = 163;
    game = await prisma.game.upsert({
      where: {
        id: "gam_c8e8b95c59a74473b22a33132790e67f",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_c8e8b95c59a74473b22a33132790e67f",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Pat Brown - Game 3
    randomScore = 191;
    game = await prisma.game.upsert({
      where: {
        id: "gam_75a6a8235d1244188e747c87c0fd413b",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_75a6a8235d1244188e747c87c0fd413b",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Quincy Williams - Game 3
    randomScore = 220;
    game = await prisma.game.upsert({
      where: {
        id: "gam_2c2c127c32ae475abb251569c1399a76",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_2c2c127c32ae475abb251569c1399a76",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
    });

    // Ray Garcia - Game 3
    randomScore = 266;
    game = await prisma.game.upsert({
      where: {
        id: "gam_e8d76dcf668f454aa25ce8bc8c3de5be",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
        score: randomScore,
      },
      create: {
        id: "gam_e8d76dcf668f454aa25ce8bc8c3de5be",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
        game_num: 3,
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