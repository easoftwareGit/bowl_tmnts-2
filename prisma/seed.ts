import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import {
  endOfDayFromString,
  nowOnDayFromString,
  startOfDayFromString,
} from "../src/lib/dateTools";
import { addDays, addMilliseconds, endOfDay, startOfDay } from "date-fns";

const prisma = new PrismaClient();

async function userUpsert() {
  const testPasswordHash = await hash("Test123!", 10); // same as call to doHash()

  try {
    let user = await prisma.user.upsert({
      where: {
        id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
      },
      update: {
        email: "adam@email.com",
        password_hash: testPasswordHash,
        first_name: "Adam",
        last_name: "Smith",
        phone: "+18005551212",
        role: "ADMIN",
      },
      create: {
        id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        email: "adam@email.com",
        password_hash: testPasswordHash,
        first_name: "Adam",
        last_name: "Smith",
        phone: "+18005551212",
        role: "ADMIN",
      },
    });
    user = await prisma.user.upsert({
      where: {
        id: "usr_516a113083983234fc316e31fb695b85",
      },
      update: {
        email: "chad@email.com",
        password_hash: testPasswordHash,
        first_name: "Chad",
        last_name: "White",
        phone: "+18005557890",
      },
      create: {
        id: "usr_516a113083983234fc316e31fb695b85",
        email: "chad@email.com",
        password_hash: testPasswordHash,
        first_name: "Chad",
        last_name: "White",
        phone: "+18005557890",
      },
    });
    user = await prisma.user.upsert({
      where: {
        id: "usr_5735c309d480323662da31e13c35b91e",
      },
      update: {
        email: "doug@email.com",
        password_hash: testPasswordHash,
        first_name: "Doug",
        last_name: "Jones",
        phone: "+18005552211",
      },
      create: {
        id: "usr_5735c309d480323662da31e13c35b91e",
        email: "doug@email.com",
        password_hash: testPasswordHash,
        first_name: "Doug",
        last_name: "Jones",
        phone: "+18005552211",
      },
    });
    user = await prisma.user.upsert({
      where: {
        id: "usr_a24894ed10c5dd835d5cbbfea7ac6dca",
      },
      update: {
        email: "eric@email.com",
        password_hash: testPasswordHash,
        first_name: "Eric",
        last_name: "Johnson",
        phone: "+18005551234",
        role: "DIRECTOR",
      },
      create: {
        id: "usr_a24894ed10c5dd835d5cbbfea7ac6dca",
        email: "eric@email.com",
        password_hash: testPasswordHash,
        first_name: "Eric",
        last_name: "Johnson",
        phone: "+18005551234",
        role: "DIRECTOR",
      },
    });
    user = await prisma.user.upsert({
      where: {
        id: "usr_c8fcd7146f9a4c5fb4c42f386304e7a6",
      },
      update: {
        email: "easoftware@gmail.com",
        password_hash: null as any,
        first_name: "Eric",
        last_name: "Adolphson",
        phone: null as any,
        role: "DIRECTOR",
      },
      create: {
        id: "usr_c8fcd7146f9a4c5fb4c42f386304e7a6",
        email: "easoftware@gmail.com",
        password_hash: null as any,
        first_name: "Eric",
        last_name: "Adolphson",
        phone: null as any,
        role: "DIRECTOR",
      },
    });
    user = await prisma.user.upsert({
      where: {
        id: "usr_07de11929565179487c7a04759ff9866",
      },
      update: {
        email: "fred@email.com",
        password_hash: testPasswordHash,
        first_name: "Fred",
        last_name: "Green",
        phone: "+18005554321",
      },
      create: {
        id: "usr_07de11929565179487c7a04759ff9866",
        email: "fred@email.com",
        password_hash: testPasswordHash,
        first_name: "Fred",
        last_name: "Green",
        phone: "+18005554321",
      },
    });
    console.log("Upserted users:", 6);
    return 6;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function bowlUpsert() {
  try {
    let bowl = await prisma.bowl.upsert({
      where: {
        id: "bwl_561540bd64974da9abdd97765fdb3659",
      },
      update: {
        bowl_name: "Earl Anthony's Dublin Bowl",
        city: "Dublin",
        state: "CA",
        url: "https://www.earlanthonysdublinbowl.com",
      },
      create: {
        id: "bwl_561540bd64974da9abdd97765fdb3659",
        bowl_name: "Earl Anthony's Dublin Bowl",
        city: "Dublin",
        state: "CA",
        url: "https://www.earlanthonysdublinbowl.com",
      },
    });
    bowl = await prisma.bowl.upsert({
      where: {
        id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
      },
      update: {
        bowl_name: "Yosemite Lanes",
        city: "Modesto",
        state: "CA",
        url: "http://yosemitelanes.com",
      },
      create: {
        id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
        bowl_name: "Yosemite Lanes",
        city: "Modesto",
        state: "CA",
        url: "http://yosemitelanes.com",
      },
    });
    bowl = await prisma.bowl.upsert({
      where: {
        id: "bwl_ff4cd62b03f24017beea81c1d6e047e7",
      },
      update: {
        bowl_name: "Coconut Bowl",
        city: "Sparks",
        state: "NV",
        url: "https://wildisland.com/bowl",
      },
      create: {
        id: "bwl_ff4cd62b03f24017beea81c1d6e047e7",
        bowl_name: "Coconut Bowl",
        city: "Sparks",
        state: "NV",
        url: "https://wildisland.com/bowl",
      },
    });
    bowl = await prisma.bowl.upsert({
      where: {
        id: "bwl_91c6f24db58349e8856fe1d919e54b9e",
      },
      update: {
        bowl_name: "Diablo Lanes",
        city: "Concord",
        state: "CA",
        url: "http://diablolanes.com",
      },
      create: {
        id: "bwl_91c6f24db58349e8856fe1d919e54b9e",
        bowl_name: "Diablo Lanes",
        city: "Concord",
        state: "CA",
        url: "http://diablolanes.com",
      },
    });
    console.log("Upserted bowls:", 4);
    return 4;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function tmntUpsert() {
  try {
    let tmnt = await prisma.tmnt.upsert({
      where: {
        id: "tmt_fd99387c33d9c78aba290286576ddce5",
      },
      update: {
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "Gold Pin",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2022-10-23") as Date,
        end_date: startOfDayFromString("2022-10-23") as Date,
      },
      create: {
        id: "tmt_fd99387c33d9c78aba290286576ddce5",
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "Gold Pin",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2022-10-23") as Date,
        end_date: startOfDayFromString("2022-10-23") as Date,
      },
    });
    tmnt = await prisma.tmnt.upsert({
      where: {
        id: "tmt_56d916ece6b50e6293300248c6792316",
      },
      update: {
        user_id: "usr_516a113083983234fc316e31fb695b85",
        tmnt_name: "Yosemite 6 Gamer",
        bowl_id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
        start_date: startOfDayFromString("2022-01-02") as Date,
        end_date: startOfDayFromString("2022-01-02") as Date,
      },
      create: {
        id: "tmt_56d916ece6b50e6293300248c6792316",
        user_id: "usr_516a113083983234fc316e31fb695b85",
        tmnt_name: "Yosemite 6 Gamer",
        bowl_id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
        start_date: startOfDayFromString("2022-01-02") as Date,
        end_date: startOfDayFromString("2022-01-02") as Date,
      },
    });
    tmnt = await prisma.tmnt.upsert({
      where: {
        id: "tmt_d9b1af944d4941f65b2d2d4ac160cdea",
      },
      update: {
        user_id: "usr_a24894ed10c5dd835d5cbbfea7ac6dca",
        tmnt_name: "Coconut 5 Gamer",
        bowl_id: "bwl_ff4cd62b03f24017beea81c1d6e047e7",
        start_date: startOfDayFromString("2022-08-21") as Date,
        end_date: startOfDayFromString("2022-08-21") as Date,
      },
      create: {
        id: "tmt_d9b1af944d4941f65b2d2d4ac160cdea",
        user_id: "usr_a24894ed10c5dd835d5cbbfea7ac6dca",
        tmnt_name: "Coconut 5 Gamer",
        bowl_id: "bwl_ff4cd62b03f24017beea81c1d6e047e7",
        start_date: startOfDayFromString("2022-08-21") as Date,
        end_date: startOfDayFromString("2022-08-21") as Date,
      },
    });
    tmnt = await prisma.tmnt.upsert({
      where: {
        id: "tmt_467e51d71659d2e412cbc64a0d19ecb4",
      },
      update: {
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "Gold Pin",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2023-09-16") as Date,
        end_date: startOfDayFromString("2023-09-16") as Date,
      },
      create: {
        id: "tmt_467e51d71659d2e412cbc64a0d19ecb4",
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "Gold Pin",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2023-09-16") as Date,
        end_date: startOfDayFromString("2023-09-16") as Date,
      },
    });
    tmnt = await prisma.tmnt.upsert({
      where: {
        id: "tmt_02e9022687d13c2c922d43682e6b6a80",
      },
      update: {
        user_id: "usr_a24894ed10c5dd835d5cbbfea7ac6dca",
        tmnt_name: "Coconut Singles & Doubles",
        bowl_id: "bwl_ff4cd62b03f24017beea81c1d6e047e7",
        start_date: startOfDayFromString("2023-01-02") as Date,
        end_date: startOfDayFromString("2023-01-02") as Date,
      },
      create: {
        id: "tmt_02e9022687d13c2c922d43682e6b6a80",
        user_id: "usr_a24894ed10c5dd835d5cbbfea7ac6dca",
        tmnt_name: "Coconut Singles & Doubles",
        bowl_id: "bwl_ff4cd62b03f24017beea81c1d6e047e7",
        start_date: startOfDayFromString("2023-01-01") as Date,
        end_date: startOfDayFromString("2023-01-01") as Date,
      },
    });
    tmnt = await prisma.tmnt.upsert({
      where: {
        id: "tmt_a78f073789cc0f8a9a0de8c6e273eab1",
      },
      update: {
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "Gold Pin",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2023-01-02") as Date,
        end_date: startOfDayFromString("2023-01-02") as Date,
      },
      create: {
        id: "tmt_a78f073789cc0f8a9a0de8c6e273eab1",
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "Gold Pin",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2023-01-02") as Date,
        end_date: startOfDayFromString("2023-01-02") as Date,
      },
    });
    tmnt = await prisma.tmnt.upsert({
      where: {
        id: "tmt_9a34a65584f94f548f5ce3b3becbca19",
      },
      update: {
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "Masters",
        bowl_id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
        start_date: startOfDayFromString("2024-01-05") as Date,
        end_date: startOfDayFromString("2024-01-05") as Date,
      },
      create: {
        id: "tmt_9a34a65584f94f548f5ce3b3becbca19",
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "Masters",
        bowl_id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
        start_date: startOfDayFromString("2024-01-05") as Date,
        end_date: startOfDayFromString("2024-01-05") as Date,
      },
    });
    tmnt = await prisma.tmnt.upsert({
      where: {
        id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
      },
      update: {
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "New Year's Eve 6 Gamer",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2023-12-31") as Date,
        end_date: startOfDayFromString("2023-12-31") as Date,
      },
      create: {
        id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "New Year's Eve 6 Gamer",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2023-12-31") as Date,
        end_date: startOfDayFromString("2023-12-31") as Date,
      },
    });
    tmnt = await prisma.tmnt.upsert({
      where: {
        id: "tmt_718fe20f53dd4e539692c6c64f991bbe",
      },
      update: {
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "2-Day event",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2023-12-20") as Date,
        end_date: startOfDayFromString("2023-12-20") as Date,
      },
      create: {
        id: "tmt_718fe20f53dd4e539692c6c64f991bbe",
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "2-Day event",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2023-12-20") as Date,
        end_date: startOfDayFromString("2023-12-20") as Date,
      },
    });
    tmnt = await prisma.tmnt.upsert({
      where: {
        id: "tmt_2d494e9bb51f4b9abba428c3f37131c9",
      },
      update: {
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "Teams",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2024-12-20") as Date,
        end_date: startOfDayFromString("2024-12-20") as Date,
      },
      create: {
        id: "tmt_2d494e9bb51f4b9abba428c3f37131c9",
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "Teams",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2024-12-20") as Date,
        end_date: startOfDayFromString("2024-12-20") as Date,
      },
    });
    // whole tmnt
    tmnt = await prisma.tmnt.upsert({
      where: {
        id: "tmt_d237a388a8fc4641a2e37233f1d6bebd",
      },
      update: {
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "Full Tournament",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2024-07-01") as Date,
        end_date: startOfDayFromString("2024-07-01") as Date,
      },
      create: {
        id: "tmt_d237a388a8fc4641a2e37233f1d6bebd",
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "Full Tournament",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2024-07-01") as Date,
        end_date: startOfDayFromString("2024-07-01") as Date,
      },
    });
    // New tmnt
    tmnt = await prisma.tmnt.upsert({
      where: {
        id: "tmt_a237a388a8fc4641a2e37233f1d6bebd",
      },
      update: {
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "New Tournament",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2024-12-01") as Date,
        end_date: startOfDayFromString("2024-12-01") as Date,
      },
      create: {
        id: "tmt_a237a388a8fc4641a2e37233f1d6bebd",
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "New Tournament",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2024-12-01") as Date,
        end_date: startOfDayFromString("2024-12-01") as Date,
      },
    });
    // new years eve 2025
    tmnt = await prisma.tmnt.upsert({
      where: {
        id: "tmt_ce35f0c119aa49fd9b89aa86cb980a6a",
      },
      update: {
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "New Years Eve 2025",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2025-12-31") as Date,
        end_date: startOfDayFromString("2025-12-31") as Date,
      },
      create: {
        id: "tmt_ce35f0c119aa49fd9b89aa86cb980a6a",
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "New Years Eve 2025",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2025-12-31") as Date,
        end_date: startOfDayFromString("2025-12-31") as Date,
      },
    });
    // tmnt to delete
    tmnt = await prisma.tmnt.upsert({
      where: {
        id: "tmt_e134ac14c5234d708d26037ae812ac33",
      },
      update: {
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "Gold Pin",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2026-08-19") as Date,
        end_date: startOfDayFromString("2026-08-19") as Date,
      },
      create: {
        id: "tmt_e134ac14c5234d708d26037ae812ac33",
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "Gold Pin",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2026-08-19") as Date,
        end_date: startOfDayFromString("2026-08-19") as Date,
      },
    });
    console.log("Upserted tmnts:", 14);
    return 14;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function eventUpsert() {
  try {
    let event = await prisma.event.upsert({
      where: {
        id: "evt_cb97b73cb538418ab993fc867f860510",
      },
      update: {
        tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",
        event_name: "Singles",
        team_size: 1,
        games: 6,
        entry_fee: 80,
        lineage: 18,
        prize_fund: 55,
        other: 2,
        expenses: 5,
        added_money: 0,
        sort_order: 1,
      },
      create: {
        id: "evt_cb97b73cb538418ab993fc867f860510",
        tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",
        event_name: "Singles",
        team_size: 1,
        games: 6,
        entry_fee: 80,
        lineage: 18,
        prize_fund: 55,
        other: 2,
        expenses: 5,
        added_money: 0,
        sort_order: 1,
      },
    });
    event = await prisma.event.upsert({
      where: {
        id: "evt_dadfd0e9c11a4aacb87084f1609a0afd",
      },
      update: {
        tmnt_id: "tmt_56d916ece6b50e6293300248c6792316",
        event_name: "Singles",
        team_size: 1,
        games: 6,
        entry_fee: 60,
        lineage: 15,
        prize_fund: 45,
        other: 0,
        expenses: 0,
        added_money: 0,
        sort_order: 1,
      },
      create: {
        id: "evt_dadfd0e9c11a4aacb87084f1609a0afd",
        tmnt_id: "tmt_56d916ece6b50e6293300248c6792316",
        event_name: "Singles",
        team_size: 1,
        games: 6,
        entry_fee: 60,
        lineage: 15,
        prize_fund: 45,
        other: 0,
        expenses: 0,
        added_money: 0,
        sort_order: 1,
      },
    });
    event = await prisma.event.upsert({
      where: {
        id: "evt_06055deb80674bd592a357a4716d8ef2",
      },
      update: {
        tmnt_id: "tmt_d9b1af944d4941f65b2d2d4ac160cdea",
        event_name: "Singles",
        team_size: 1,
        games: 5,
        entry_fee: 70,
        lineage: 15,
        prize_fund: 50,
        other: 0,
        expenses: 5,
        added_money: 0,
        sort_order: 1,
      },
      create: {
        id: "evt_06055deb80674bd592a357a4716d8ef2",
        tmnt_id: "tmt_d9b1af944d4941f65b2d2d4ac160cdea",
        event_name: "Singles",
        team_size: 1,
        games: 5,
        entry_fee: 70,
        lineage: 15,
        prize_fund: 50,
        other: 0,
        expenses: 5,
        added_money: 0,
        sort_order: 1,
      },
    });
    event = await prisma.event.upsert({
      where: {
        id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
      },
      update: {
        tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        event_name: "Singles",
        team_size: 1,
        games: 6,
        entry_fee: 80,
        lineage: 18,
        prize_fund: 55,
        other: 2,
        expenses: 5,
        added_money: 0,
        sort_order: 1,
      },
      create: {
        id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
        tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        event_name: "Singles",
        team_size: 1,
        games: 6,
        entry_fee: 80,
        lineage: 18,
        prize_fund: 55,
        other: 2,
        expenses: 5,
        added_money: 0,
        sort_order: 1,
      },
    });
    event = await prisma.event.upsert({
      where: {
        id: "evt_cb55703a8a084acb86306e2944320e8d",
      },
      update: {
        tmnt_id: "tmt_2d494e9bb51f4b9abba428c3f37131c9",
        event_name: "Doubles",
        team_size: 2,
        games: 6,
        entry_fee: 160,
        lineage: 26,
        prize_fund: 110,
        other: 4,
        expenses: 10,
        added_money: 0,
        sort_order: 1,
      },
      create: {
        id: "evt_cb55703a8a084acb86306e2944320e8d",
        tmnt_id: "tmt_2d494e9bb51f4b9abba428c3f37131c9",
        event_name: "Doubles",
        team_size: 2,
        games: 6,
        entry_fee: 160,
        lineage: 36,
        prize_fund: 110,
        other: 4,
        expenses: 10,
        added_money: 0,
        sort_order: 1,
      },
    });
    event = await prisma.event.upsert({
      where: {
        id: "evt_adfcff4846474a25ad2936aca121bd37",
      },
      update: {
        tmnt_id: "tmt_2d494e9bb51f4b9abba428c3f37131c9",
        event_name: "Trios",
        team_size: 3,
        games: 3,
        entry_fee: 160,
        lineage: 36,
        prize_fund: 110,
        other: 4,
        expenses: 10,
        added_money: 0,
        sort_order: 2,
      },
      create: {
        id: "evt_adfcff4846474a25ad2936aca121bd37",
        tmnt_id: "tmt_2d494e9bb51f4b9abba428c3f37131c9",
        event_name: "Trios",
        team_size: 3,
        games: 3,
        entry_fee: 160,
        lineage: 36,
        prize_fund: 110,
        other: 4,
        expenses: 10,
        added_money: 0,
        sort_order: 2,
      },
    });
    event = await prisma.event.upsert({
      where: {
        id: "evt_c0b2bb31d647414a9bea003bd835f3a0",
      },
      update: {
        tmnt_id: "tmt_9a34a65584f94f548f5ce3b3becbca19",
        event_name: "Singles",
        team_size: 1,
        games: 6,
        entry_fee: 80,
        lineage: 18,
        prize_fund: 55,
        other: 2,
        expenses: 5,
        added_money: 0,
        sort_order: 1,
      },
      create: {
        id: "evt_c0b2bb31d647414a9bea003bd835f3a0",
        tmnt_id: "tmt_9a34a65584f94f548f5ce3b3becbca19",
        event_name: "Singles",
        team_size: 1,
        games: 6,
        entry_fee: 80,
        lineage: 18,
        prize_fund: 55,
        other: 2,
        expenses: 5,
        added_money: 0,
        sort_order: 1,
      },
    });
    // whole tmnt event
    event = await prisma.event.upsert({
      where: {
        id: "evt_4ff710c8493f4a218d2e2b045442974a",
      },
      update: {
        tmnt_id: "tmt_d237a388a8fc4641a2e37233f1d6bebd",
        event_name: "Singles",
        team_size: 1,
        games: 6,
        entry_fee: 90,
        lineage: 21,
        prize_fund: 62,
        other: 2,
        expenses: 5,
        added_money: 0,
        sort_order: 1,
      },
      create: {
        id: "evt_4ff710c8493f4a218d2e2b045442974a",
        tmnt_id: "tmt_d237a388a8fc4641a2e37233f1d6bebd",
        event_name: "Singles",
        team_size: 1,
        games: 6,
        entry_fee: 90,
        lineage: 21,
        prize_fund: 62,
        other: 2,
        expenses: 5,
        added_money: 0,
        sort_order: 1,
      },
    });
    // new tmnt event
    event = await prisma.event.upsert({
      where: {
        id: "evt_aff710c8493f4a218d2e2b045442974a",
      },
      update: {
        tmnt_id: "tmt_a237a388a8fc4641a2e37233f1d6bebd",
        event_name: "Singles",
        team_size: 1,
        games: 6,
        entry_fee: 85,
        lineage: 21,
        prize_fund: 57,
        other: 2,
        expenses: 5,
        added_money: 0,
        sort_order: 1,
      },
      create: {
        id: "evt_aff710c8493f4a218d2e2b045442974a",
        tmnt_id: "tmt_a237a388a8fc4641a2e37233f1d6bebd",
        event_name: "Singles",
        team_size: 1,
        games: 6,
        entry_fee: 85,
        lineage: 21,
        prize_fund: 57,
        other: 2,
        expenses: 5,
        added_money: 0,
        sort_order: 1,
      },
    });
    // event to delete
    event = await prisma.event.upsert({
      where: {
        id: "evt_bd63777a6aee43be8372e4d008c1d6d0",
      },
      update: {
        tmnt_id: "tmt_467e51d71659d2e412cbc64a0d19ecb4",
        event_name: "Singles",
        team_size: 1,
        games: 6,
        entry_fee: 80,
        lineage: 18,
        prize_fund: 55,
        other: 2,
        expenses: 5,
        added_money: 0,
        sort_order: 1,
      },
      create: {
        id: "evt_bd63777a6aee43be8372e4d008c1d6d0",
        tmnt_id: "tmt_467e51d71659d2e412cbc64a0d19ecb4",
        event_name: "Singles",
        team_size: 1,
        games: 6,
        entry_fee: 80,
        lineage: 18,
        prize_fund: 55,
        other: 2,
        expenses: 5,
        added_money: 0,
        sort_order: 1,
      },
    });

    console.log("Upserted events:", 10);
    return 10;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function divUpsert() {
  try {
    let div = await prisma.div.upsert({
      where: {
        id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      },
      update: {
        tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",
        div_name: "Scratch",
        hdcp_per: 0,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 1,
      },
      create: {
        id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",
        div_name: "Scratch",
        hdcp_per: 0,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 1,
      },
    });
    div = await prisma.div.upsert({
      where: {
        id: "div_1f42042f9ef24029a0a2d48cc276a087",
      },
      update: {
        tmnt_id: "tmt_56d916ece6b50e6293300248c6792316",
        div_name: "Scratch",
        hdcp_per: 0,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 1,
      },
      create: {
        id: "div_1f42042f9ef24029a0a2d48cc276a087",
        tmnt_id: "tmt_56d916ece6b50e6293300248c6792316",
        div_name: "Scratch",
        hdcp_per: 0,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 1,
      },
    });
    div = await prisma.div.upsert({
      where: {
        id: "div_29b9225d8dd44a4eae276f8bde855729",
      },
      update: {
        tmnt_id: "tmt_56d916ece6b50e6293300248c6792316",
        div_name: "50+ Scratch",
        hdcp_per: 0,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 2,
      },
      create: {
        id: "div_29b9225d8dd44a4eae276f8bde855729",
        tmnt_id: "tmt_56d916ece6b50e6293300248c6792316",
        div_name: "50+ Scratch",
        hdcp_per: 0,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 2,
      },
    });
    div = await prisma.div.upsert({
      where: {
        id: "div_621bfee84e774d5a9dc2e9b6bdc5d31c",
      },
      update: {
        tmnt_id: "tmt_2d494e9bb51f4b9abba428c3f37131c9",
        div_name: "Scratch",
        hdcp_per: 0,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 1,
      },
      create: {
        id: "div_621bfee84e774d5a9dc2e9b6bdc5d31c",
        tmnt_id: "tmt_2d494e9bb51f4b9abba428c3f37131c9",
        div_name: "Scratch",
        hdcp_per: 0,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 1,
      },
    });
    div = await prisma.div.upsert({
      where: {
        id: "div_18997d3fd7ef4eb7ad2b53a9e93f9ce5",
      },
      update: {
        tmnt_id: "tmt_d9b1af944d4941f65b2d2d4ac160cdea",
        div_name: "Scratch",
        hdcp_per: 0,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 1,
      },
      create: {
        id: "div_18997d3fd7ef4eb7ad2b53a9e93f9ce5",
        tmnt_id: "tmt_d9b1af944d4941f65b2d2d4ac160cdea",
        div_name: "Scratch",
        hdcp_per: 0,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 1,
      },
    });
    div = await prisma.div.upsert({
      where: {
        id: "div_367309aa1444446ea9ab23d2e4aae98f",
      },
      update: {
        tmnt_id: "tmt_d9b1af944d4941f65b2d2d4ac160cdea",
        div_name: "Hdcp",
        hdcp_per: 0.9,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 2,
      },
      create: {
        id: "div_367309aa1444446ea9ab23d2e4aae98f",
        tmnt_id: "tmt_d9b1af944d4941f65b2d2d4ac160cdea",
        div_name: "Hdcp",
        hdcp_per: 0.9,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 2,
      },
    });
    // new years
    div = await prisma.div.upsert({
      where: {
        id: "div_578834e04e5e4885bbae79229d8b96e8",
      },
      update: {
        tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        div_name: "Scratch",
        hdcp_per: 0,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 1,
      },
      create: {
        id: "div_578834e04e5e4885bbae79229d8b96e8",
        tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        div_name: "Scratch",
        hdcp_per: 0,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 1,
      },
    });
    div = await prisma.div.upsert({
      where: {
        id: "div_fe72ab97edf8407186c8e6df7f7fb741",
      },
      update: {
        tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        div_name: "Hdcp",
        hdcp_per: 0.9,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 2,
      },
      create: {
        id: "div_fe72ab97edf8407186c8e6df7f7fb741",
        tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        div_name: "Hdcp",
        hdcp_per: 0.9,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 2,
      },
    });
    div = await prisma.div.upsert({
      where: {
        id: "div_24b1cd5dee0542038a1244fc2978e862",
      },
      update: {
        tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        div_name: "Hdcp 50+",
        hdcp_per: 0.90,
        hdcp_from: 230,
        int_hdcp: true, 
        hdcp_for: 'Game',
        sort_order: 3,
      },
      create: {
        id: "div_24b1cd5dee0542038a1244fc2978e862",
        tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        div_name: "Hdcp 50+",
        hdcp_per: 0.90,
        hdcp_from: 230,
        int_hdcp: true, 
        hdcp_for: 'Game',
        sort_order: 3,
      },
    });
    // whole tmnt div
    div = await prisma.div.upsert({
      where: {
        id: "div_99a3cae28786485bb7a036935f0f6a0a",
      },
      update: {
        tmnt_id: "tmt_d237a388a8fc4641a2e37233f1d6bebd",
        div_name: "Scratch",
        hdcp_per: 0,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 1,
      },
      create: {
        id: "div_99a3cae28786485bb7a036935f0f6a0a",
        tmnt_id: "tmt_d237a388a8fc4641a2e37233f1d6bebd",
        div_name: "Scratch",
        hdcp_per: 0,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 1,
      },
    });
    // new tmnt div
    div = await prisma.div.upsert({
      where: {
        id: "div_a9a3cae28786485bb7a036935f0f6a0a",
      },
      update: {
        tmnt_id: "tmt_a237a388a8fc4641a2e37233f1d6bebd",
        div_name: "Scratch",
        hdcp_per: 0,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 1,
      },
      create: {
        id: "div_a9a3cae28786485bb7a036935f0f6a0a",
        tmnt_id: "tmt_a237a388a8fc4641a2e37233f1d6bebd",
        div_name: "Scratch",
        hdcp_per: 0,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 1,
      },
    });
    // div to delete
    div = await prisma.div.upsert({
      where: {
        id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
      },
      update: {
        tmnt_id: "tmt_9a34a65584f94f548f5ce3b3becbca19",
        div_name: "Women's",
        hdcp_per: 0.9,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 4,
      },
      create: {
        id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
        tmnt_id: "tmt_9a34a65584f94f548f5ce3b3becbca19",
        div_name: "Women's",
        hdcp_per: 0.9,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 4,
      },
    });
    console.log("Upserted divs:", 12);
    return 12;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function squadUpsert() {
  try {
    let squad = await prisma.squad.upsert({
      where: {
        id: "sqd_7116ce5f80164830830a7157eb093396",
      },
      update: {
        event_id: "evt_cb97b73cb538418ab993fc867f860510",
        squad_name: "Squad 1",
        squad_date: startOfDayFromString("2022-10-23") as Date,
        squad_time: null,
        games: 6,
        lane_count: 12,
        starting_lane: 29,
        sort_order: 1,
      },
      create: {
        id: "sqd_7116ce5f80164830830a7157eb093396",
        event_id: "evt_cb97b73cb538418ab993fc867f860510",
        squad_name: "Squad 1",
        squad_date: startOfDayFromString("2022-10-23") as Date,
        squad_time: null,
        games: 6,
        lane_count: 12,
        starting_lane: 29,
        sort_order: 1,
      },
    });
    squad = await prisma.squad.upsert({
      where: {
        id: "sqd_42be0f9d527e4081972ce8877190489d",
      },
      update: {
        event_id: "evt_06055deb80674bd592a357a4716d8ef2",
        squad_name: "A Squad",
        squad_date: startOfDayFromString("2022-08-21") as Date,
        squad_time: "10:00 AM",
        games: 6,
        lane_count: 10,
        starting_lane: 1,
        sort_order: 1,
      },
      create: {
        id: "sqd_42be0f9d527e4081972ce8877190489d",
        event_id: "evt_06055deb80674bd592a357a4716d8ef2",
        squad_name: "A Squad",
        squad_date: startOfDayFromString("2022-08-21") as Date,
        squad_time: "10:00 AM",
        games: 6,
        lane_count: 10,
        starting_lane: 1,
        sort_order: 1,
      },
    });
    squad = await prisma.squad.upsert({
      where: {
        id: "sqd_796c768572574019a6fa79b3b1c8fa57",
      },
      update: {
        event_id: "evt_06055deb80674bd592a357a4716d8ef2",
        squad_name: "B Squad",
        squad_date: startOfDayFromString("2022-08-21") as Date,
        squad_time: "02:00 PM",
        games: 6,
        lane_count: 10,
        starting_lane: 1,
        sort_order: 2,
      },
      create: {
        id: "sqd_796c768572574019a6fa79b3b1c8fa57",
        event_id: "evt_06055deb80674bd592a357a4716d8ef2",
        squad_name: "B Squad",
        squad_date: startOfDayFromString("2022-08-21") as Date,
        squad_time: "02:00 PM",
        games: 6,
        lane_count: 10,
        starting_lane: 1,
        sort_order: 2,
      },
    });
    squad = await prisma.squad.upsert({
      where: {
        id: "sqd_1234ec18b3d44c0189c83f6ac5fd4ad6",
      },
      update: {
        event_id: "evt_06055deb80674bd592a357a4716d8ef2",
        squad_name: "C Squad",
        squad_date: startOfDayFromString("2022-08-21") as Date,
        squad_time: "04:30 PM",
        games: 3,
        lane_count: 24,
        starting_lane: 1,
        sort_order: 3,
      },
      create: {
        id: "sqd_1234ec18b3d44c0189c83f6ac5fd4ad6",
        event_id: "evt_06055deb80674bd592a357a4716d8ef2",
        squad_name: "C Squad",
        squad_date: startOfDayFromString("2022-08-21") as Date,
        squad_time: "04:30 PM",
        games: 3,
        lane_count: 24,
        starting_lane: 1,
        sort_order: 3,
      },
    });
    squad = await prisma.squad.upsert({
      where: {
        id: "sqd_3397da1adc014cf58c44e07c19914f71",
      },
      update: {
        event_id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
        squad_name: "Squad 1",
        squad_date: startOfDayFromString("2023-03-01") as Date,
        squad_time: "08:00 AM",
        games: 6,
        lane_count: 6,
        starting_lane: 1,
        sort_order: 1,
      },
      create: {
        id: "sqd_3397da1adc014cf58c44e07c19914f71",
        event_id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
        squad_name: "Squad 1",
        squad_date: startOfDayFromString("2023-03-01") as Date,
        squad_time: "08:00 AM",
        games: 6,
        lane_count: 6,
        starting_lane: 1,
        sort_order: 1,
      },
    });
    squad = await prisma.squad.upsert({
      where: {
        id: "sqd_bb2de887bf274242af5d867476b029b8",
      },
      update: {
        event_id: "evt_c0b2bb31d647414a9bea003bd835f3a0",
        squad_name: "Squad 1",
        squad_date: startOfDayFromString("2023-09-18") as Date,
        squad_time: "01:00 PM",
        games: 6,
        lane_count: 24,
        starting_lane: 1,
        sort_order: 1,
      },
      create: {
        id: "sqd_bb2de887bf274242af5d867476b029b8",
        event_id: "evt_c0b2bb31d647414a9bea003bd835f3a0",
        squad_name: "Squad 1",
        squad_date: startOfDayFromString("2023-09-18") as Date,
        squad_time: "01:00 PM",
        games: 6,
        lane_count: 24,
        starting_lane: 1,
        sort_order: 1,
      },
    });
    squad = await prisma.squad.upsert({
      where: {
        id: "sqd_853edbcc963745b091829e3eadfcf064",
      },
      update: {
        event_id: "evt_cb55703a8a084acb86306e2944320e8d",
        squad_name: "Doubles Squad",
        squad_date: startOfDayFromString("2024-12-20") as Date,
        squad_time: "10:00 AM",
        games: 3,
        lane_count: 24,
        starting_lane: 1,
        sort_order: 1,
      },
      create: {
        id: "sqd_853edbcc963745b091829e3eadfcf064",
        event_id: "evt_cb55703a8a084acb86306e2944320e8d",
        squad_name: "Doubles Squad",
        squad_date: startOfDayFromString("2024-12-20") as Date,
        squad_time: "10:00 AM",
        games: 3,
        lane_count: 24,
        starting_lane: 1,
        sort_order: 1,
      },
    });
    squad = await prisma.squad.upsert({
      where: {
        id: "sqd_a8daec18b3d44c0189c83f6ac5fd4ad6",
      },
      update: {
        event_id: "evt_adfcff4846474a25ad2936aca121bd37",
        squad_name: "Trios Squad",
        squad_date: startOfDayFromString("2024-12-20") as Date,
        squad_time: "12:30 PM",
        games: 3,
        lane_count: 24,
        starting_lane: 1,
        sort_order: 2,
      },
      create: {
        id: "sqd_a8daec18b3d44c0189c83f6ac5fd4ad6",
        event_id: "evt_adfcff4846474a25ad2936aca121bd37",
        squad_name: "Trios Squad",
        squad_date: startOfDayFromString("2024-12-20") as Date,
        squad_time: "12:30 PM",
        games: 3,
        lane_count: 24,
        starting_lane: 1,
        sort_order: 2,
      },
    });
    // new years
    squad = await prisma.squad.upsert({
      where: {
        id: "sqd_1a6c885ee19a49489960389193e8f819",
      },
      update: {
        event_id: "evt_dadfd0e9c11a4aacb87084f1609a0afd",
        squad_name: "Squad 1",
        squad_date: startOfDayFromString("2023-12-31") as Date,
        squad_time: null,
        games: 6,
        lane_count: 24,
        starting_lane: 9,
        sort_order: 1,
      },
      create: {
        id: "sqd_1a6c885ee19a49489960389193e8f819",
        event_id: "evt_dadfd0e9c11a4aacb87084f1609a0afd",
        squad_name: "Squad 1",
        squad_date: startOfDayFromString("2023-12-31") as Date,
        squad_time: null,
        games: 6,
        lane_count: 24,
        starting_lane: 9,
        sort_order: 1,
      },
    });
    // whole tmnt squad
    squad = await prisma.squad.upsert({
      where: {
        id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
      },
      update: {
        event_id: "evt_4ff710c8493f4a218d2e2b045442974a",
        squad_name: "Squad 1",
        squad_date: startOfDayFromString("2024-07-01") as Date,
        squad_time: null,
        games: 6,
        lane_count: 12,
        starting_lane: 29,
        sort_order: 1,
      },
      create: {
        id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        event_id: "evt_4ff710c8493f4a218d2e2b045442974a",
        squad_name: "Squad 1",
        squad_date: startOfDayFromString("2024-07-01") as Date,
        squad_time: null,
        games: 6,
        lane_count: 12,
        starting_lane: 29,
        sort_order: 1,
      },
    });
    // new tmnt squad
    squad = await prisma.squad.upsert({
      where: {
        id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
      },
      update: {
        event_id: "evt_aff710c8493f4a218d2e2b045442974a",
        squad_name: "Squad 1",
        squad_date: startOfDayFromString("2024-12-01") as Date,
        squad_time: null,
        games: 6,
        lane_count: 12,
        starting_lane: 29,
        sort_order: 1,
      },
      create: {
        id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
        event_id: "evt_aff710c8493f4a218d2e2b045442974a",
        squad_name: "Squad 1",
        squad_date: startOfDayFromString("2024-12-01") as Date,
        squad_time: null,
        games: 6,
        lane_count: 12,
        starting_lane: 29,
        sort_order: 1,
      },
    });
    // squad to delete
    squad = await prisma.squad.upsert({
      where: {
        id: "sqd_3397da1adc014cf58c44e07c19914f72",
      },
      update: {
        event_id: "evt_c0b2bb31d647414a9bea003bd835f3a0",
        squad_name: "Squad X",
        squad_date: startOfDayFromString("2023-09-16") as Date,
        squad_time: "02:00 PM",
        games: 6,
        lane_count: 24,
        starting_lane: 1,
        sort_order: 3,
      },
      create: {
        id: "sqd_3397da1adc014cf58c44e07c19914f72",
        event_id: "evt_c0b2bb31d647414a9bea003bd835f3a0",
        squad_name: "Squad X",
        squad_date: startOfDayFromString("2023-09-16") as Date,
        squad_time: "02:00 PM",
        games: 6,
        lane_count: 24,
        starting_lane: 1,
        sort_order: 3,
      },
    });
    console.log("Upserted squads:", 12);
    return 12;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function laneUpsert() {
  async function laneUpsert_GoldPin() {
    try {
      let lane = await prisma.lane.upsert({
        where: {
          id: "lan_7b5b9d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 29,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
        create: {
          id: "lan_7b5b9d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 29,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_8590d9693f8e45558b789a6595b1675b",
        },
        update: {
          lane_number: 30,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
        create: {
          id: "lan_8590d9693f8e45558b789a6595b1675b",
          lane_number: 30,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 31,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
        create: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 31,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6123",
        },
        update: {
          lane_number: 32,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
        create: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6123",
          lane_number: 32,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6234",
        },
        update: {
          lane_number: 33,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
        create: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6234",
          lane_number: 33,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6345",
        },
        update: {
          lane_number: 34,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
        create: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6345",
          lane_number: 34,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6456",
        },
        update: {
          lane_number: 35,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
        create: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6456",
          lane_number: 35,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6567",
        },
        update: {
          lane_number: 36,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
        create: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6567",
          lane_number: 36,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6678",
        },
        update: {
          lane_number: 37,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
        create: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6678",
          lane_number: 37,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6789",
        },
        update: {
          lane_number: 38,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
        create: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6789",
          lane_number: 38,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6890",
        },
        update: {
          lane_number: 39,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
        create: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6890",
          lane_number: 39,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6abc",
        },
        update: {
          lane_number: 40,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
        create: {
          id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6abc",
          lane_number: 40,
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          in_use: true,
        },
      });
      return 12;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function laneUpsert_YosemiteLanes() {
    try {
      let lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a126a2",
        },
        update: {
          lane_number: 9,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a126a2",
          lane_number: 9,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11234",
        },
        update: {
          lane_number: 10,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11234",
          lane_number: 10,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11235",
        },
        update: {
          lane_number: 11,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11235",
          lane_number: 11,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11236",
        },
        update: {
          lane_number: 12,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11236",
          lane_number: 12,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11237",
        },
        update: {
          lane_number: 13,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11237",
          lane_number: 13,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11238",
        },
        update: {
          lane_number: 14,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11238",
          lane_number: 14,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11239",
        },
        update: {
          lane_number: 15,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11239",
          lane_number: 15,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11240",
        },
        update: {
          lane_number: 16,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11240",
          lane_number: 16,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11241",
        },
        update: {
          lane_number: 17,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11241",
          lane_number: 17,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11242",
        },
        update: {
          lane_number: 18,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11242",
          lane_number: 18,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11243",
        },
        update: {
          lane_number: 19,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11243",
          lane_number: 19,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11244",
        },
        update: {
          lane_number: 20,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11244",
          lane_number: 20,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11245",
        },
        update: {
          lane_number: 21,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11245",
          lane_number: 21,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11246",
        },
        update: {
          lane_number: 22,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11246",
          lane_number: 22,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11247",
        },
        update: {
          lane_number: 23,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11247",
          lane_number: 23,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11248",
        },
        update: {
          lane_number: 24,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11248",
          lane_number: 24,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11249",
        },
        update: {
          lane_number: 25,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11249",
          lane_number: 25,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11250",
        },
        update: {
          lane_number: 26,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11250",
          lane_number: 26,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11251",
        },
        update: {
          lane_number: 27,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11251",
          lane_number: 27,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11252",
        },
        update: {
          lane_number: 28,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11252",
          lane_number: 28,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11253",
        },
        update: {
          lane_number: 29,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11253",
          lane_number: 29,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11254",
        },
        update: {
          lane_number: 30,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11254",
          lane_number: 30,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11255",
        },
        update: {
          lane_number: 31,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11255",
          lane_number: 31,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11256",
        },
        update: {
          lane_number: 32,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
        create: {
          id: "lan_4e24c5cc04f6463d89f24e6e19a11256",
          lane_number: 32,
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          in_use: true,
        },
      });

      return 24;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function laneUpsert_AandB() {
    try {
      let lane = await prisma.lane.upsert({
        where: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12601",
        },
        update: {
          lane_number: 1,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
        create: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12601",
          lane_number: 1,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12602",
        },
        update: {
          lane_number: 2,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
        create: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12602",
          lane_number: 2,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12603",
        },
        update: {
          lane_number: 3,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
        create: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12603",
          lane_number: 3,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12604",
        },
        update: {
          lane_number: 4,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
        create: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12604",
          lane_number: 4,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12605",
        },
        update: {
          lane_number: 5,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
        create: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12605",
          lane_number: 5,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12606",
        },
        update: {
          lane_number: 6,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
        create: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12606",
          lane_number: 6,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12607",
        },
        update: {
          lane_number: 7,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
        create: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12607",
          lane_number: 7,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12608",
        },
        update: {
          lane_number: 8,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
        create: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12608",
          lane_number: 8,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12609",
        },
        update: {
          lane_number: 9,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
        create: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12609",
          lane_number: 9,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12610",
        },
        update: {
          lane_number: 10,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
        create: {
          id: "lan_ae24c5cc04f6463d89f24e6e19a12610",
          lane_number: 10,
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12601",
        },
        update: {
          lane_number: 1,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
        create: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12601",
          lane_number: 1,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12602",
        },
        update: {
          lane_number: 2,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
        create: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12602",
          lane_number: 2,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12603",
        },
        update: {
          lane_number: 3,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
        create: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12603",
          lane_number: 3,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12604",
        },
        update: {
          lane_number: 4,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
        create: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12604",
          lane_number: 4,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12605",
        },
        update: {
          lane_number: 5,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
        create: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12605",
          lane_number: 5,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12606",
        },
        update: {
          lane_number: 6,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
        create: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12606",
          lane_number: 6,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12607",
        },
        update: {
          lane_number: 7,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
        create: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12607",
          lane_number: 7,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12608",
        },
        update: {
          lane_number: 8,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
        create: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12608",
          lane_number: 8,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12609",
        },
        update: {
          lane_number: 9,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
        create: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12609",
          lane_number: 9,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12610",
        },
        update: {
          lane_number: 10,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
        create: {
          id: "lan_be24c5cc04f6463d89f24e6e19a12610",
          lane_number: 10,
          squad_id: "sqd_796c768572574019a6fa79b3b1c8fa57",
          in_use: true,
        },
      });

      return 20;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function laneUpsert_NewYears() {
    try {
      let lane = await prisma.lane.upsert({
        where: {
          id: "lan_01ad95cd82aa45fa8bad1bcfdd804e90",
        },
        update: {
          lane_number: 29,
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          in_use: true,
        },
        create: {
          id: "lan_01ad95cd82aa45fa8bad1bcfdd804e90",
          lane_number: 29,
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_02ad95cd82aa45fa8bad1bcfdd804e90",
        },
        update: {
          lane_number: 30,
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          in_use: true,
        },
        create: {
          id: "lan_02ad95cd82aa45fa8bad1bcfdd804e90",
          lane_number: 30,
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_03ad95cd82aa45fa8bad1bcfdd804e90",
        },
        update: {
          lane_number: 31,
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          in_use: true,
        },
        create: {
          id: "lan_03ad95cd82aa45fa8bad1bcfdd804e90",
          lane_number: 31,
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_04ad95cd82aa45fa8bad1bcfdd804e90",
        },
        update: {
          lane_number: 32,
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          in_use: true,
        },
        create: {
          id: "lan_04ad95cd82aa45fa8bad1bcfdd804e90",
          lane_number: 32,
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_05ad95cd82aa45fa8bad1bcfdd804e90",
        },
        update: {
          lane_number: 33,
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          in_use: true,
        },
        create: {
          id: "lan_05ad95cd82aa45fa8bad1bcfdd804e90",
          lane_number: 33,
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_06ad95cd82aa45fa8bad1bcfdd804e90",
        },
        update: {
          lane_number: 34,
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          in_use: true,
        },
        create: {
          id: "lan_06ad95cd82aa45fa8bad1bcfdd804e90",
          lane_number: 34,
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          in_use: true,
        },
      });
      return 6;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function laneUpsert_WholeTmnt() {
    try {
      let lane = await prisma.lane.upsert({
        where: {
          id: "lan_ab019d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 29,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_ab019d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 29,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ab029d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 30,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_ab029d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 30,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ab039d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 31,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_ab039d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 31,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ab049d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 32,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_ab049d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 32,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ab059d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 33,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_ab059d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 33,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ab069d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 34,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_ab069d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 34,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ab079d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 35,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_ab079d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 35,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ab089d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 36,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_ab089d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 36,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ab099d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 37,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_ab099d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 37,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ab109d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 38,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_ab109d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 38,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ab119d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 39,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_ab119d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 39,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_ab129d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 40,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_ab129d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 40,
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      return 12;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function laneUpsert_NewTmnt() {
    try {
      let lane = await prisma.lane.upsert({
        where: {
          id: "lan_aa019d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 29,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_aa019d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 29,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_aa029d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 30,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_aa029d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 30,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_aa039d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 31,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_aa039d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 31,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_aa049d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 32,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_aa049d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 32,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_aa059d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 33,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_aa059d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 33,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_aa069d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 34,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_aa069d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 34,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_aa079d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 35,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_aa079d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 35,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_aa089d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 36,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_aa089d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 36,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_aa099d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 37,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_aa099d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 37,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_aa109d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 38,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_aa109d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 38,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_aa119d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 39,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_aa119d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 39,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      lane = await prisma.lane.upsert({
        where: {
          id: "lan_aa129d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        },
        update: {
          lane_number: 40,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
        create: {
          id: "lan_aa129d9e6b6e4c5b9f6b7d9e7f9b6c5d",
          lane_number: 40,
          squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
          in_use: true,
        },
      });
      return 12;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function laneUpsert_ToDelete() {
    try {
      let lane = await prisma.lane.upsert({
        where: {
          id: "lan_255dd3b8755f4dea956445e7a3511d91",
        },
        update: {
          lane_number: 99,
          squad_id: "sqd_bb2de887bf274242af5d867476b029b8",
          in_use: true,
        },
        create: {
          id: "lan_255dd3b8755f4dea956445e7a3511d91",
          lane_number: 99,
          squad_id: "sqd_bb2de887bf274242af5d867476b029b8",
          in_use: true,
        },
      });
      return 1;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  try {
    const gpCount = await laneUpsert_GoldPin();
    const yCount = await laneUpsert_YosemiteLanes();
    const abCount = await laneUpsert_AandB();
    const nyCount = await laneUpsert_NewYears();
    const wtCount = await laneUpsert_WholeTmnt();
    const ntCount = await laneUpsert_NewTmnt();
    const delCount = await laneUpsert_ToDelete();
    console.log(
      "Upserted lanes: ",
      gpCount + yCount + abCount + nyCount + wtCount + +ntCount + delCount
    );
    // 12 + 24 + 20 + 6 + 12 + 12 + 1 = 87
    return gpCount + yCount + abCount + nyCount + wtCount + +ntCount + delCount;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function potsUpsert() {
  try {
    let pot = await prisma.pot.upsert({
      where: {
        id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
      },
      update: {
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        sort_order: 1,
        fee: 20,
        pot_type: "Game",
      },
      create: {
        id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        sort_order: 1,
        fee: 20,
        pot_type: "Game",
      },
    });
    pot = await prisma.pot.upsert({
      where: {
        id: "pot_98b3a008619b43e493abf17d9f462a65",
      },
      update: {
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 1,
        fee: 10,
        pot_type: "Game",
      },
      create: {
        id: "pot_98b3a008619b43e493abf17d9f462a65",
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 1,
        fee: 10,
        pot_type: "Game",
      },
    });
    pot = await prisma.pot.upsert({
      where: {
        id: "pot_ab80213899ea424b938f52a062deacfe",
      },
      update: {
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 2,
        fee: 10,
        pot_type: "Last Game",
      },
      create: {
        id: "pot_ab80213899ea424b938f52a062deacfe",
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 2,
        fee: 10,
        pot_type: "Last Game",
      },
    });
    // new years eve
    pot = await prisma.pot.upsert({
      where: {
        id: "pot_791fb6d8a9a04cb4b3372e212da2a3b0",
      },
      update: {
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_578834e04e5e4885bbae79229d8b96e8",
        sort_order: 1,
        fee: 20,
        pot_type: "Game",
      },
      create: {
        id: "pot_791fb6d8a9a04cb4b3372e212da2a3b0",
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_578834e04e5e4885bbae79229d8b96e8",
        sort_order: 1,
        fee: 20,
        pot_type: "Game",
      },
    });
    pot = await prisma.pot.upsert({
      where: {
        id: "pot_781fb6d8a9a04cb4b3372e212da2a3b0",
      },
      update: {
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_578834e04e5e4885bbae79229d8b96e8",
        sort_order: 2,
        fee: 10,
        pot_type: "Last Game",
      },
      create: {
        id: "pot_781fb6d8a9a04cb4b3372e212da2a3b0",
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_578834e04e5e4885bbae79229d8b96e8",
        sort_order: 2,
        fee: 10,
        pot_type: "Last Game",
      },
    });
    pot = await prisma.pot.upsert({
      where: {
        id: "pot_771fb6d8a9a04cb4b3372e212da2a3b0",
      },
      update: {
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
        sort_order: 3,
        fee: 20,
        pot_type: "Game",
      },
      create: {
        id: "pot_771fb6d8a9a04cb4b3372e212da2a3b0",
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
        sort_order: 3,
        fee: 20,
        pot_type: "Game",
      },
    });
    pot = await prisma.pot.upsert({
      where: {
        id: "pot_761fb6d8a9a04cb4b3372e212da2a3b0",
      },
      update: {
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
        sort_order: 4,
        fee: 10,
        pot_type: "Last Game",
      },
      create: {
        id: "pot_761fb6d8a9a04cb4b3372e212da2a3b0",
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
        sort_order: 4,
        fee: 10,
        pot_type: "Last Game",
      },
    });
    // whole tmnt pot
    pot = await prisma.pot.upsert({
      where: {
        id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
        sort_order: 1,
        fee: 20,
        pot_type: "Game",
      },
      create: {
        id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
        sort_order: 1,
        fee: 20,
        pot_type: "Game",
      },
    });
    // new tmnt pot
    pot = await prisma.pot.upsert({
      where: {
        id: "pot_a9fd8f787de942a1a92aaa2df3e7c185",
      },
      update: {
        squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
        div_id: "div_a9a3cae28786485bb7a036935f0f6a0a",
        sort_order: 1,
        fee: 20,
        pot_type: "Game",
      },
      create: {
        id: "pot_a9fd8f787de942a1a92aaa2df3e7c185",
        squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
        div_id: "div_a9a3cae28786485bb7a036935f0f6a0a",
        sort_order: 1,
        fee: 20,
        pot_type: "Game",
      },
    });
    // pot to delete
    pot = await prisma.pot.upsert({
      where: {
        id: "pot_e3758d99c5494efabb3b0d273cf22e7a",
      },
      update: {
        squad_id: "sqd_853edbcc963745b091829e3eadfcf064",
        div_id: "div_621bfee84e774d5a9dc2e9b6bdc5d31c",
        sort_order: 1,
        fee: 20,
        pot_type: "Game",
      },
      create: {
        id: "pot_e3758d99c5494efabb3b0d273cf22e7a",
        squad_id: "sqd_853edbcc963745b091829e3eadfcf064",
        div_id: "div_621bfee84e774d5a9dc2e9b6bdc5d31c",
        sort_order: 1,
        fee: 20,
        pot_type: "Game",
      },
    });

    console.log("Upserted pots:", 10);
    return 10;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function brktUpsert() {
  try {
    let brkt = await prisma.brkt.upsert({
      where: {
        id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
      },
      update: {
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        sort_order: 1,
        start: 1,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
      create: {
        id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        sort_order: 1,
        start: 1,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
    });
    brkt = await prisma.brkt.upsert({
      where: {
        id: "brk_6ede2512c7d4409ca7b055505990a499",
      },
      update: {
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        sort_order: 2,
        start: 4,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
      create: {
        id: "brk_6ede2512c7d4409ca7b055505990a499",
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        sort_order: 2,
        start: 4,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
    });
    brkt = await prisma.brkt.upsert({
      where: {
        id: "brk_aa3da3a411b346879307831b6fdadd5f",
      },
      update: {
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 1,
        start: 1,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
      create: {
        id: "brk_aa3da3a411b346879307831b6fdadd5f",
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 1,
        start: 1,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
    });
    brkt = await prisma.brkt.upsert({
      where: {
        id: "brk_37345eb6049946ad83feb9fdbb43a307",
      },
      update: {
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 2,
        start: 4,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
      create: {
        id: "brk_37345eb6049946ad83feb9fdbb43a307",
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 2,
        start: 4,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
    });
    brkt = await prisma.brkt.upsert({
      where: {
        id: "brk_e67f4698f47e4d64935547923e2bdbfb",
      },
      update: {
        squad_id: "sqd_a8daec18b3d44c0189c83f6ac5fd4ad6",
        div_id: "div_621bfee84e774d5a9dc2e9b6bdc5d31c",
        sort_order: 1,
        start: 1,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
      create: {
        id: "brk_e67f4698f47e4d64935547923e2bdbfb",
        squad_id: "sqd_a8daec18b3d44c0189c83f6ac5fd4ad6",
        div_id: "div_621bfee84e774d5a9dc2e9b6bdc5d31c",
        sort_order: 1,
        start: 1,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
    });
    brkt = await prisma.brkt.upsert({
      where: {
        id: "brk_12344698f47e4d64935547923e2bdbfb",
      },
      update: {
        squad_id: "sqd_1234ec18b3d44c0189c83f6ac5fd4ad6",
        div_id: "div_18997d3fd7ef4eb7ad2b53a9e93f9ce5",
        sort_order: 1,
        start: 1,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
      create: {
        id: "brk_12344698f47e4d64935547923e2bdbfb",
        squad_id: "sqd_1234ec18b3d44c0189c83f6ac5fd4ad6",
        div_id: "div_18997d3fd7ef4eb7ad2b53a9e93f9ce5",
        sort_order: 1,
        start: 1,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
    });
    // new years
    brkt = await prisma.brkt.upsert({
      where: {
        id: "brk_d017ea07dbc6453a8a705f4bb7599ed4",
      },
      update: {
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_578834e04e5e4885bbae79229d8b96e8",
        sort_order: 1,
        start: 1,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
      create: {
        id: "brk_d017ea07dbc6453a8a705f4bb7599ed4",
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_578834e04e5e4885bbae79229d8b96e8",
        sort_order: 1,
        start: 1,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
    });
    brkt = await prisma.brkt.upsert({
      where: {
        id: "brk_d027ea07dbc6453a8a705f4bb7599ed4",
      },
      update: {
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_578834e04e5e4885bbae79229d8b96e8",
        sort_order: 1,
        start: 4,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
      create: {
        id: "brk_d027ea07dbc6453a8a705f4bb7599ed4",
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_578834e04e5e4885bbae79229d8b96e8",
        sort_order: 1,
        start: 4,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
    });
    brkt = await prisma.brkt.upsert({
      where: {
        id: "brk_d037ea07dbc6453a8a705f4bb7599ed4",
      },
      update: {
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
        sort_order: 1,
        start: 1,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
      create: {
        id: "brk_d037ea07dbc6453a8a705f4bb7599ed4",
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
        sort_order: 1,
        start: 1,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
    });
    brkt = await prisma.brkt.upsert({
      where: {
        id: "brk_d047ea07dbc6453a8a705f4bb7599ed4",
      },
      update: {
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
        sort_order: 1,
        start: 4,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
      create: {
        id: "brk_d047ea07dbc6453a8a705f4bb7599ed4",
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
        sort_order: 1,
        start: 4,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
    });
    // whole tmnt brkts
    brkt = await prisma.brkt.upsert({
      where: {
        id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
        sort_order: 1,
        start: 1,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
      create: {
        id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
        sort_order: 1,
        start: 1,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
    });
    brkt = await prisma.brkt.upsert({
      where: {
        id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
        sort_order: 2,
        start: 4,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
      create: {
        id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
        sort_order: 2,
        start: 4,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
    });
    // new tmnt brkts
    brkt = await prisma.brkt.upsert({
      where: {
        id: "brk_ae6bf51cc1ca4748ad5e8abab88277e0",
      },
      update: {
        squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
        div_id: "div_a9a3cae28786485bb7a036935f0f6a0a",
        sort_order: 1,
        start: 1,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
      create: {
        id: "brk_ae6bf51cc1ca4748ad5e8abab88277e0",
        squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
        div_id: "div_a9a3cae28786485bb7a036935f0f6a0a",
        sort_order: 1,
        start: 1,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
    });
    brkt = await prisma.brkt.upsert({
      where: {
        id: "brk_ad88cd2f5a164e8c8f758daae18bfc83",
      },
      update: {
        squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
        div_id: "div_a9a3cae28786485bb7a036935f0f6a0a",
        sort_order: 2,
        start: 4,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
      create: {
        id: "brk_ad88cd2f5a164e8c8f758daae18bfc83",
        squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
        div_id: "div_a9a3cae28786485bb7a036935f0f6a0a",
        sort_order: 2,
        start: 4,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
    });
    // bracket to delete
    brkt = await prisma.brkt.upsert({
      where: {
        id: "brk_400737cab3584ab7a59b7a4411da4474",
      },
      update: {
        squad_id: "sqd_853edbcc963745b091829e3eadfcf064",
        div_id: "div_621bfee84e774d5a9dc2e9b6bdc5d31c",
        sort_order: 3,
        start: 2,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
      create: {
        id: "brk_400737cab3584ab7a59b7a4411da4474",
        squad_id: "sqd_853edbcc963745b091829e3eadfcf064",
        div_id: "div_621bfee84e774d5a9dc2e9b6bdc5d31c",
        sort_order: 3,
        start: 2,
        games: 3,
        players: 8,
        fee: 5,
        first: 25,
        second: 10,
        admin: 5,
      },
    });
    console.log("Upserted brackets:", 15);
    return 15;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function elimUpsert() {
  try {
    let elim = await prisma.elim.upsert({
      where: {
        id: "elm_45d884582e7042bb95b4818ccdd9974c",
      },
      update: {
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        sort_order: 1,
        start: 1,
        games: 3,
        fee: 5,
      },
      create: {
        id: "elm_45d884582e7042bb95b4818ccdd9974c",
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        sort_order: 1,
        start: 1,
        games: 3,
        fee: 5,
      },
    });
    elim = await prisma.elim.upsert({
      where: {
        id: "elm_9d01015272b54962a375cf3c91007a12",
      },
      update: {
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        sort_order: 2,
        start: 4,
        games: 3,
        fee: 5,
      },
      create: {
        id: "elm_9d01015272b54962a375cf3c91007a12",
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        sort_order: 2,
        start: 4,
        games: 3,
        fee: 5,
      },
    });
    elim = await prisma.elim.upsert({
      where: {
        id: "elm_b4c3939adca140898b1912b75b3725f8",
      },
      update: {
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 1,
        start: 1,
        games: 3,
        fee: 5,
      },
      create: {
        id: "elm_b4c3939adca140898b1912b75b3725f8",
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 1,
        start: 1,
        games: 3,
        fee: 5,
      },
    });
    elim = await prisma.elim.upsert({
      where: {
        id: "elm_4f176545e4294a0292732cccada91b9d",
      },
      update: {
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 2,
        start: 4,
        games: 3,
        fee: 5,
      },
      create: {
        id: "elm_4f176545e4294a0292732cccada91b9d",
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 2,
        start: 4,
        games: 3,
        fee: 5,
      },
    });
    // new years
    elim = await prisma.elim.upsert({
      where: {
        id: "elm_c01077494c2d4d9da166d697c08c28d2",
      },
      update: {
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_578834e04e5e4885bbae79229d8b96e8",
        sort_order: 1,
        start: 1,
        games: 3,
        fee: 5,
      },
      create: {
        id: "elm_c01077494c2d4d9da166d697c08c28d2",
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_578834e04e5e4885bbae79229d8b96e8",
        sort_order: 1,
        start: 1,
        games: 3,
        fee: 5,
      },
    });
    elim = await prisma.elim.upsert({
      where: {
        id: "elm_c02077494c2d4d9da166d697c08c28d2",
      },
      update: {
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_578834e04e5e4885bbae79229d8b96e8",
        sort_order: 2,
        start: 4,
        games: 3,
        fee: 5,
      },
      create: {
        id: "elm_c02077494c2d4d9da166d697c08c28d2",
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_578834e04e5e4885bbae79229d8b96e8",
        sort_order: 2,
        start: 4,
        games: 3,
        fee: 5,
      },
    });
    elim = await prisma.elim.upsert({
      where: {
        id: "elm_c03077494c2d4d9da166d697c08c28d2",
      },
      update: {
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
        sort_order: 2,
        start: 1,
        games: 3,
        fee: 5,
      },
      create: {
        id: "elm_c03077494c2d4d9da166d697c08c28d2",
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
        sort_order: 3,
        start: 1,
        games: 3,
        fee: 5,
      },
    });
    elim = await prisma.elim.upsert({
      where: {
        id: "elm_c04077494c2d4d9da166d697c08c28d2",
      },
      update: {
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
        sort_order: 4,
        start: 4,
        games: 3,
        fee: 5,
      },
      create: {
        id: "elm_c04077494c2d4d9da166d697c08c28d2",
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
        sort_order: 4,
        start: 4,
        games: 3,
        fee: 5,
      },
    });
    // whole tmnt elims
    elim = await prisma.elim.upsert({
      where: {
        id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
        sort_order: 1,
        start: 1,
        games: 3,
        fee: 5,
      },
      create: {
        id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
        sort_order: 1,
        start: 1,
        games: 3,
        fee: 5,
      },
    });
    elim = await prisma.elim.upsert({
      where: {
        id: "elm_461eece3c50241e9925e9a520730ac7e",
      },
      update: {
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
        sort_order: 2,
        start: 4,
        games: 3,
        fee: 5,
      },
      create: {
        id: "elm_461eece3c50241e9925e9a520730ac7e",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
        sort_order: 2,
        start: 4,
        games: 3,
        fee: 5,
      },
    });
    // new tmnt elims
    elim = await prisma.elim.upsert({
      where: {
        id: "elm_a47a4ec07f824b0e93169ae78e8b4b1e",
      },
      update: {
        squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
        div_id: "div_a9a3cae28786485bb7a036935f0f6a0a",
        sort_order: 1,
        start: 1,
        games: 3,
        fee: 5,
      },
      create: {
        id: "elm_a47a4ec07f824b0e93169ae78e8b4b1e",
        squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
        div_id: "div_a9a3cae28786485bb7a036935f0f6a0a",
        sort_order: 1,
        start: 1,
        games: 3,
        fee: 5,
      },
    });
    elim = await prisma.elim.upsert({
      where: {
        id: "elm_a61eece3c50241e9925e9a520730ac7e",
      },
      update: {
        squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
        div_id: "div_a9a3cae28786485bb7a036935f0f6a0a",
        sort_order: 2,
        start: 4,
        games: 3,
        fee: 5,
      },
      create: {
        id: "elm_a61eece3c50241e9925e9a520730ac7e",
        squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
        div_id: "div_a9a3cae28786485bb7a036935f0f6a0a",
        sort_order: 2,
        start: 4,
        games: 3,
        fee: 5,
      },
    });
    // elim to delete
    elim = await prisma.elim.upsert({
      where: {
        id: "elm_4c5aad9baa7246c19e07f215561e58c4",
      },
      update: {
        squad_id: "sqd_1234ec18b3d44c0189c83f6ac5fd4ad6",
        div_id: "div_18997d3fd7ef4eb7ad2b53a9e93f9ce5",
        sort_order: 1,
        start: 1,
        games: 3,
        fee: 10,
      },
      create: {
        id: "elm_4c5aad9baa7246c19e07f215561e58c4",
        squad_id: "sqd_1234ec18b3d44c0189c83f6ac5fd4ad6",
        div_id: "div_18997d3fd7ef4eb7ad2b53a9e93f9ce5",
        sort_order: 1,
        start: 1,
        games: 3,
        fee: 10,
      },
    });

    console.log("Upserted eliminators:", 13);
    return 13;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function playersUpsert() {
  async function playerUpsert_GoldPin() {
    try {
      let player = await prisma.player.upsert({
        where: {
          id: "ply_88be0472be3d476ea1caa99dd05953fa",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "John",
          last_name: "Doe",
          average: 220,
          lane: 1,
          position: "A",
        },
        create: {
          id: "ply_88be0472be3d476ea1caa99dd05953fa",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "John",
          last_name: "Doe",
          average: 220,
          lane: 1,
          position: "A",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_be57bef21fc64d199c2f6de4408bd136",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "James",
          last_name: "Bennett",
          average: 221,
          lane: 1,
          position: "B",
        },
        create: {
          id: "ply_be57bef21fc64d199c2f6de4408bd136",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "James",
          last_name: "Bennett",
          average: 221,
          lane: 1,
          position: "B",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "Olivia",
          last_name: "Morgan",
          average: 210,
          lane: 1,
          position: "C",
        },
        create: {
          id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "Olivia",
          last_name: "Morgan",
          average: 210,
          lane: 1,
          position: "C",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_89be0472be3d476ea1caa99dd05953fa",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "Joan",
          last_name: "Doe",
          average: 200,
          lane: 1,
          position: "D",
        },
        create: {
          id: "ply_89be0472be3d476ea1caa99dd05953fa",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "Joan",
          last_name: "Doe",
          average: 200,
          lane: 1,
          position: "D",
        },
      });      
      player = await prisma.player.upsert({
        where: {
          id: "ply_8b0fd8bbd9e34d34a7fa90b4111c6e40",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "William",
          last_name: "Harris",
          average: 211,
          lane: 2,
          position: "E",
        },
        create: {
          id: "ply_8b0fd8bbd9e34d34a7fa90b4111c6e40",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "William",
          last_name: "Harris",
          average: 211,
          lane: 2,
          position: "E",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "John",
          last_name: "Dope",
          average: 219,
          lane: 2,
          position: "F",
        },
        create: {
          id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "John",
          last_name: "Dope",
          average: 219,
          lane: 2,
          position: "F",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_bb1fd8bbd9e34d34a7fa90b4111c6e40",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "Jane",
          last_name: "Dope",
          average: 201,
          lane: 2,
          position: "G",
        },
        create: {
          id: "ply_bb1fd8bbd9e34d34a7fa90b4111c6e40",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "Jane",
          last_name: "Dope",
          average: 201,
          lane: 2,
          position: "G",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_bb2fd8bbd9e34d34a7fa90b4111c6e40",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "Bob",
          last_name: "Smith",
          average: 222,
          lane: 2,
          position: "H",
        },
        create: {
          id: "ply_bb2fd8bbd9e34d34a7fa90b4111c6e40",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "Bob",
          last_name: "Smith",
          average: 222,
          lane: 2,
          position: "H",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "bye_ad8539071682476db842c59a4ec62dc7",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "Bye",
          last_name: null as any,
          average: 0,
          lane: null as any,
          position: null as any,
        },
        create: {
          id: "bye_ad8539071682476db842c59a4ec62dc7",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "Bye",
          last_name: null as any,
          average: 0,
          lane: null as any,
          position: null as any,
        },
      });
      return 9;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function playersUpsert_WholeTmnt() {
    try {
      let player = await prisma.player.upsert({
        where: {
          id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Al",
          last_name: "Davis",
          average: 213,
          lane: 29,
          position: "A",
        },
        create: {
          id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Al",
          last_name: "Davis",
          average: 213,
          lane: 29,
          position: "A",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Bob",
          last_name: "Smith",
          average: 205,
          lane: 29,
          position: "B",
        },
        create: {
          id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Bob",
          last_name: "Smith",
          average: 205,
          lane: 29,
          position: "B",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Curt",
          last_name: "Johnson",
          average: 210,
          lane: 29,
          position: "C",
        },
        create: {
          id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Curt",
          last_name: "Johnson",
          average: 210,
          lane: 29,
          position: "C",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Don",
          last_name: "Brown",
          average: 200,
          lane: 30,
          position: "D",
        },
        create: {
          id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Don",
          last_name: "Brown",
          average: 200,
          lane: 30,
          position: "D",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Ed",
          last_name: "Taylor",
          average: 195,
          lane: 30,
          position: "E",
        },
        create: {
          id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Ed",
          last_name: "Taylor",
          average: 195,
          lane: 30,
          position: "E",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Fred",
          last_name: "Anderson",
          average: 215,
          lane: 30,
          position: "F",
        },
        create: {
          id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Fred",
          last_name: "Anderson",
          average: 215,
          lane: 30,
          position: "F",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Greg",
          last_name: "Smith",
          average: 214,
          lane: 31,
          position: "A",
        },
        create: {
          id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Greg",
          last_name: "Smith",
          average: 214,
          lane: 31,
          position: "A",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Hal",
          last_name: "Johnson",
          average: 218,
          lane: 31,
          position: "B",
        },
        create: {
          id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Hal",
          last_name: "Johnson",
          average: 218,
          lane: 31,
          position: "B",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Ian",
          last_name: "Brown",
          average: 200,
          lane: 31,
          position: "C",
        },
        create: {
          id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Ian",
          last_name: "Brown",
          average: 200,
          lane: 31,
          position: "C",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Jim",
          last_name: "Williams",
          average: 199,
          lane: 32,
          position: "D",
        },
        create: {
          id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Jim",
          last_name: "Williams",
          average: 199,
          lane: 32,
          position: "D",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Kyle",
          last_name: "Jones",
          average: 211,
          lane: 32,
          position: "E",
        },
        create: {
          id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Kyle",
          last_name: "Jones",
          average: 211,
          lane: 32,
          position: "E",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Lou",
          last_name: "Miller",
          average: 202,
          lane: 32,
          position: "F",
        },
        create: {
          id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Lou",
          last_name: "Miller",
          average: 202,
          lane: 32,
          position: "F",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Mike",
          last_name: "Davis",
          average: 209,
          lane: 33,
          position: "A",
        },
        create: {
          id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Mike",
          last_name: "Davis",
          average: 209,
          lane: 33,
          position: "A",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Nate",
          last_name: "Smith",
          average: 215,
          lane: 33,
          position: "A",
        },
        create: {
          id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Nate",
          last_name: "Smith",
          average: 215,
          lane: 33,
          position: "A",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Otto",
          last_name: "Johnson",
          average: 220,
          lane: 33,
          position: "B",
        },
        create: {
          id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Otto",
          last_name: "Johnson",
          average: 220,
          lane: 33,
          position: "B",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Pat",
          last_name: "Brown",
          average: 210,
          lane: 33,
          position: "C",
        },
        create: {
          id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Pat",
          last_name: "Brown",
          average: 210,
          lane: 33,
          position: "C",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Quincy",
          last_name: "Williams",
          average: 192,
          lane: 34,
          position: "D",
        },
        create: {
          id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Quincy",
          last_name: "Williams",
          average: 192,
          lane: 34,
          position: "D",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Paul",
          last_name: "Jones",
          average: 198,
          lane: 34,
          position: "E",
        },
        create: {
          id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Paul",
          last_name: "Jones",
          average: 198,
          lane: 34,
          position: "E",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Ray",
          last_name: "Garcia",
          average: 204,
          lane: 34,
          position: "F",
        },
        create: {
          id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Ray",
          last_name: "Garcia",
          average: 204,
          lane: 34,
          position: "F",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Sam",
          last_name: "Smith",
          average: 215,
          lane: 35,
          position: "A",
        },
        create: {
          id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Sam",
          last_name: "Smith",
          average: 215,
          lane: 35,
          position: "A",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Tom",
          last_name: "Johnson",
          average: 220,
          lane: 35,
          position: "B",
        },
        create: {
          id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Tom",
          last_name: "Johnson",
          average: 220,
          lane: 35,
          position: "B",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Uri",
          last_name: "Brown",
          average: 210,
          lane: 35,
          position: "C",
        },
        create: {
          id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Uri",
          last_name: "Brown",
          average: 210,
          lane: 35,
          position: "C",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Vic",
          last_name: "Williams",
          average: 192,
          lane: 36,
          position: "D",
        },
        create: {
          id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Vic",
          last_name: "Williams",
          average: 192,
          lane: 36,
          position: "D",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Wes",
          last_name: "Jones",
          average: 198,
          lane: 36,
          position: "E",
        },
        create: {
          id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Wes",
          last_name: "Jones",
          average: 198,
          lane: 36,
          position: "E",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Xavier",
          last_name: "Garcia",
          average: 204,
          lane: 36,
          position: "F",
        },
        create: {
          id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Xavier",
          last_name: "Garcia",
          average: 204,
          lane: 36,
          position: "F",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Yates",
          last_name: "Martinez",
          average: 210,
          lane: 37,
          position: "A",
        },
        create: {
          id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Yates",
          last_name: "Martinez",
          average: 210,
          lane: 37,
          position: "A",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Zack",
          last_name: "Smith",
          average: 216,
          lane: 37,
          position: "B",
        },
        create: {
          id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Zack",
          last_name: "Smith",
          average: 216,
          lane: 37,
          position: "B",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Abby",
          last_name: "Brown",
          average: 210,
          lane: 37,
          position: "C",
        },
        create: {
          id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Abby",
          last_name: "Brown",
          average: 210,
          lane: 37,
          position: "C",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Beth",
          last_name: "Johnson",
          average: 214,
          lane: 38,
          position: "D",
        },
        create: {
          id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Beth",
          last_name: "Johnson",
          average: 214,
          lane: 38,
          position: "D",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Carol",
          last_name: "Williams",
          average: 218,
          lane: 38,
          position: "E",
        },
        create: {
          id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Carol",
          last_name: "Williams",
          average: 218,
          lane: 38,
          position: "E",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Debra",
          last_name: "Davis",
          average: 217,
          lane: 38,
          position: "F",
        },
        create: {
          id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Debra",
          last_name: "Davis",
          average: 217,
          lane: 38,
          position: "F",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Emily",
          last_name: "Garcia",
          average: 219,
          lane: 39,
          position: "A",
        },
        create: {
          id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Emily",
          last_name: "Garcia",
          average: 219,
          lane: 39,
          position: "A",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a32758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Faith",
          last_name: "Hopkins",
          average: 213,
          lane: 39,
          position: "B",
        },
        create: {
          id: "ply_a32758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Faith",
          last_name: "Hopkins",
          average: 213,
          lane: 39,
          position: "B",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a33758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Gail",
          last_name: "Smith",
          average: 216,
          lane: 39,
          position: "C",
        },
        create: {
          id: "ply_a33758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Gail",
          last_name: "Smith",
          average: 216,
          lane: 39,
          position: "C",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a34758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Helen",
          last_name: "Brown",
          average: 210,
          lane: 40,
          position: "D",
        },
        create: {
          id: "ply_a34758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Helen",
          last_name: "Brown",
          average: 210,
          lane: 40,
          position: "D",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a35758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Jackie",
          last_name: "Johnson",
          average: 214,
          lane: 40,
          position: "E",
        },
        create: {
          id: "ply_a35758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Jackie",
          last_name: "Johnson",
          average: 214,
          lane: 40,
          position: "E",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a36758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Kay",
          last_name: "Williams",
          average: 218,
          lane: 40,
          position: "F",
        },
        create: {
          id: "ply_a36758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Kay",
          last_name: "Williams",
          average: 218,
          lane: 40,
          position: "F",
        },
      });
      return 36;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function playersUpsert_NewYearsEve() {
    try {
      let player = await prisma.player.upsert({
        where: {
          id: "ply_da674926088d4f739c69c2c72a465ccd",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          first_name: "Al",
          last_name: "Davis",
          average: 213,
          lane: 29,
          position: "A",
        },
        create: {
          id: "ply_da674926088d4f739c69c2c72a465ccd",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          first_name: "Al",
          last_name: "Davis",
          average: 213,
          lane: 29,
          position: "A",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_8ffe9406fcc046508aa4b214ef16f647",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          first_name: "Bob",
          last_name: "Smith",
          average: 205,
          lane: 29,
          position: "B",
        },
        create: {
          id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          first_name: "Bob",
          last_name: "Smith",
          average: 205,
          lane: 29,
          position: "B",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_b830099ed18a4e9da06e345ec2320848",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          first_name: "Curt",
          last_name: "Johnson",
          average: 210,
          lane: 29,
          position: "C",
        },
        create: {
          id: "ply_b830099ed18a4e9da06e345ec2320848",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          first_name: "Curt",
          last_name: "Johnson",
          average: 210,
          lane: 29,
          position: "C",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_92670d50aa7f44a487a172412bef8af5",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          first_name: "Don",
          last_name: "Brown",
          average: 200,
          lane: 30,
          position: "D",
        },
        create: {
          id: "ply_92670d50aa7f44a487a172412bef8af5",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          first_name: "Don",
          last_name: "Brown",
          average: 200,
          lane: 30,
          position: "D",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_f57669391b4c4405a4a4e0f40284712f",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          first_name: "Ed",
          last_name: "Taylor",
          average: 195,
          lane: 30,
          position: "E",
        },
        create: {
          id: "ply_f57669391b4c4405a4a4e0f40284712f",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          first_name: "Ed",
          last_name: "Taylor",
          average: 195,
          lane: 30,
          position: "E",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_9fff21de787b4637beb65a1936967071",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          first_name: "Fred",
          last_name: "Ames",
          average: 212,
          lane: 30,
          position: "F",
        },
        create: {
          id: "ply_9fff21de787b4637beb65a1936967071",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          first_name: "Fred",
          last_name: "Ames",
          average: 212,
          lane: 30,
          position: "F",
        },
      });
      return 6;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function playersUpsert_ToDelete() {
    try {
      let player = await prisma.player.upsert({
        where: {
          id: "ply_91c5aa1c14644e03b6735abd1480ee32",
        },
        update: {
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          first_name: "Mia",
          last_name: "Clark",
          average: 190,
          lane: 1,
          position: "Y",
        },
        create: {
          id: "ply_91c5aa1c14644e03b6735abd1480ee32",
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          first_name: "Mia",
          last_name: "Clark",
          average: 190,
          lane: 1,
          position: "Y",
        },
      });
      return 1;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  try {
    const gpCount = await playerUpsert_GoldPin();
    const wtCount = await playersUpsert_WholeTmnt();
    const nyCount = await playersUpsert_NewYearsEve();
    const delCount = await playersUpsert_ToDelete();
    console.log("Upserted players: ", gpCount + wtCount + nyCount + delCount);
    // 9 + 36 + 6 + 1 = 52
    return gpCount + wtCount + nyCount + delCount;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function divEntryUpsert() {
  async function divEntryUpsert_GoldPin() {
    try {
      let divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_652fc6c5556e407291c4b5666b2dccd7",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: 80,
        },
        create: {
          id: "den_652fc6c5556e407291c4b5666b2dccd7",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: 80,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_ef36111c721147f7a2bf2702056947ce",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          fee: 80,
        },
        create: {
          id: "den_ef36111c721147f7a2bf2702056947ce",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          fee: 80,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_856cce7a69644e26911e65cd02ee1b23",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
          fee: 80,
        },
        create: {
          id: "den_856cce7a69644e26911e65cd02ee1b23",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
          fee: 80,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_4da45cadb7b84cfba255fc0ce36e9add",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_8b0fd8bbd9e34d34a7fa90b4111c6e40",
          fee: 80,
        },
        create: {
          id: "den_4da45cadb7b84cfba255fc0ce36e9add",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_8b0fd8bbd9e34d34a7fa90b4111c6e40",
          fee: 80,
        },
      });
      return 4;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function divEntriesUpsert_WholeTmnt() {
    try {
      let divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a01631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a01631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a02631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a02631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a03631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a03631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a04631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a04631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a05631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a05631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a06631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a06631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a07631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a07631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a08631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a08631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a09631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a09631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a10631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a10631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a11631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a11631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a12631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a12631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a13631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a13631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a14631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a14631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a15631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a15631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a16631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a16631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a17631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a17631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a18631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a18631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a19631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a19631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a20631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a20631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a21631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a21631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a22631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a22631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a23631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a23631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a24631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a24631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a25631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a25631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a26631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a26631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a27631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a27631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a28631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a28631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a29631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a29631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a30631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a30631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a31631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a31631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a32631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a32758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a32631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a32758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a33631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a33758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a33631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a33758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a34631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a34758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a34631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a34758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a35631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a35758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a35631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a35758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a36631c1c94d4627bde16fad72e5e5d4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a36758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
        create: {
          id: "den_a36631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a36758cff1cc4bab9d9133e661bd49b0",
          fee: 90,
        },
      });
      return 36;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function divEntriesUpsert_NewYearEve() {
    try {
      let divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_183ae3dd33954da59b29fcd5e6ae40f0",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          div_id: "div_578834e04e5e4885bbae79229d8b96e8",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 80,
        },
        create: {
          id: "den_183ae3dd33954da59b29fcd5e6ae40f0",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          div_id: "div_578834e04e5e4885bbae79229d8b96e8",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 80,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_198269b3a7e84208b25532a160f2be6d",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 60,
        },
        create: {
          id: "den_198269b3a7e84208b25532a160f2be6d",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 60,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_d303c754069a4857959a45718f84526b",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          div_id: "div_578834e04e5e4885bbae79229d8b96e8",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          fee: 80,
        },
        create: {
          id: "den_d303c754069a4857959a45718f84526b",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          div_id: "div_578834e04e5e4885bbae79229d8b96e8",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          fee: 80,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_25f8398426ad4105ab752e1ec0a32d02",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          fee: 60,
        },
        create: {
          id: "den_25f8398426ad4105ab752e1ec0a32d02",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          fee: 60,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_2b98116d990046a2ac032102ba42e3a3",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          div_id: "div_578834e04e5e4885bbae79229d8b96e8",
          player_id: "ply_b830099ed18a4e9da06e345ec2320848",
          fee: 80,
        },
        create: {
          id: "den_2b98116d990046a2ac032102ba42e3a3",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          div_id: "div_578834e04e5e4885bbae79229d8b96e8",
          player_id: "ply_b830099ed18a4e9da06e345ec2320848",
          fee: 80,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_f06b8a73a9894e058c17cc0a4fd012be",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
          player_id: "ply_92670d50aa7f44a487a172412bef8af5",
          fee: 80,
        },
        create: {
          id: "den_f06b8a73a9894e058c17cc0a4fd012be",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
          player_id: "ply_92670d50aa7f44a487a172412bef8af5",
          fee: 80,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_f406329dfc44497f9769ae515cb2a0db",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
          player_id: "ply_f57669391b4c4405a4a4e0f40284712f",
          fee: 80,
        },
        create: {
          id: "den_f406329dfc44497f9769ae515cb2a0db",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
          player_id: "ply_f57669391b4c4405a4a4e0f40284712f",
          fee: 80,
        },
      });
      divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_84dd57459e2340ab8808417719ae994e",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          div_id: "div_578834e04e5e4885bbae79229d8b96e8",
          player_id: "ply_9fff21de787b4637beb65a1936967071",
          fee: 80,
        },
        create: {
          id: "den_84dd57459e2340ab8808417719ae994e",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          div_id: "div_578834e04e5e4885bbae79229d8b96e8",
          player_id: "ply_9fff21de787b4637beb65a1936967071",
          fee: 80,
        },
      });

      return 8;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function divEntriesUpsert_ToDelete() {
    try {
      let divEntry = await prisma.div_Entry.upsert({
        where: {
          id: "den_a55c6cd27d1b482aa0ff248d5fb496ed",
        },
        update: {
          squad_id: "sqd_bb2de887bf274242af5d867476b029b8",
          div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
          player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
          fee: 80,
        },
        create: {
          id: "den_a55c6cd27d1b482aa0ff248d5fb496ed",
          squad_id: "sqd_bb2de887bf274242af5d867476b029b8",
          div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
          player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
          fee: 80,
        },
      });
      return 1;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  try {
    const gpCount = await divEntryUpsert_GoldPin();
    const wtCount = await divEntriesUpsert_WholeTmnt();
    const nyCount = await divEntriesUpsert_NewYearEve();
    const delCount = await divEntriesUpsert_ToDelete();
    console.log(
      "Upserted DivEntries: ",
      gpCount + wtCount + nyCount + delCount
    );
    // 4 + 36 + 8 + 1 = 49
    return gpCount + wtCount + delCount;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function potEntriesUpsert() {
  async function potEntryUpsert_GoldPin() {
    try {
      let potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_648e5b64809d441c99815929cf7c66e0",
        },
        update: {
          pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: 20,
        },
        create: {
          id: "pen_648e5b64809d441c99815929cf7c66e0",
          pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_4aea7a841d464fb1b7b07c66a5b08cde",
        },
        update: {
          pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          fee: 20,
        },
        create: {
          id: "pen_4aea7a841d464fb1b7b07c66a5b08cde",
          pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_4d9729b59b844d448be85e4cb61ba47a",
        },
        update: {
          pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
          player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
          fee: 20,
        },
        create: {
          id: "pen_4d9729b59b844d448be85e4cb61ba47a",
          pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
          player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_6bbbeae1989b4bdaa6880c873cbe02ba",
        },
        update: {
          pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
          player_id: "ply_8b0fd8bbd9e34d34a7fa90b4111c6e40",
          fee: 20,
        },
        create: {
          id: "pen_6bbbeae1989b4bdaa6880c873cbe02ba",
          pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
          player_id: "ply_8b0fd8bbd9e34d34a7fa90b4111c6e40",
          fee: 20,
        },
      });
      return 4;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function potEntryUpsert_WholeTmnt() {
    try {
      let potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b0126ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b0126ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b0226ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b0226ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b0326ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b0326ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b0426ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b0426ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b0526ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b0526ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b0626ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b0626ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b0726ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b0726ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b0826ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b0826ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b0926ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b0926ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b1026ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b1026ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b1126ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b1126ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b1226ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b1226ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b1326ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b1326ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b1426ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b1426ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b1526ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b1526ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b1626ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b1626ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b1726ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b1726ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b1826ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b1826ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b1926ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b1926ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b2026ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b2026ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b2126ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b2126ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b2226ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b2226ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b2326ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b2326ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b2426ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b2426ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b2526ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b2526ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b2626ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b2626ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b2726ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b2726ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b2826ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b2826ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b2926ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b2926ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_b3026ba58d3f4a7d950101a5674ce595",
        },
        update: {
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
        create: {
          id: "pen_b3026ba58d3f4a7d950101a5674ce595",
          pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
          player_id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
          fee: 20,
        },
      });

      return 30;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function potEntryUpsert_NewYear() {
    try {
      let potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_f0122807d8e5414aa905aaa4d0d0552c",
        },
        update: {
          pot_id: "pot_791fb6d8a9a04cb4b3372e212da2a3b0",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 20,
        },
        create: {
          id: "pen_f0122807d8e5414aa905aaa4d0d0552c",
          pot_id: "pot_791fb6d8a9a04cb4b3372e212da2a3b0",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_f0222807d8e5414aa905aaa4d0d0552c",
        },
        update: {
          pot_id: "pot_781fb6d8a9a04cb4b3372e212da2a3b0",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 10,
        },
        create: {
          id: "pen_f0222807d8e5414aa905aaa4d0d0552c",
          pot_id: "pot_781fb6d8a9a04cb4b3372e212da2a3b0",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 10,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_f0322807d8e5414aa905aaa4d0d0552c",
        },
        update: {
          pot_id: "pot_771fb6d8a9a04cb4b3372e212da2a3b0",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 20,
        },
        create: {
          id: "pen_f0322807d8e5414aa905aaa4d0d0552c",
          pot_id: "pot_771fb6d8a9a04cb4b3372e212da2a3b0",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_f0422807d8e5414aa905aaa4d0d0552c",
        },
        update: {
          pot_id: "pot_761fb6d8a9a04cb4b3372e212da2a3b0",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 10,
        },
        create: {
          id: "pen_f0422807d8e5414aa905aaa4d0d0552c",
          pot_id: "pot_761fb6d8a9a04cb4b3372e212da2a3b0",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 10,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_f0522807d8e5414aa905aaa4d0d0552c",
        },
        update: {
          pot_id: "pot_791fb6d8a9a04cb4b3372e212da2a3b0",
          player_id: "ply_b830099ed18a4e9da06e345ec2320848",
          fee: 20,
        },
        create: {
          id: "pen_f0522807d8e5414aa905aaa4d0d0552c",
          pot_id: "pot_791fb6d8a9a04cb4b3372e212da2a3b0",
          player_id: "ply_b830099ed18a4e9da06e345ec2320848",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_f0622807d8e5414aa905aaa4d0d0552c",
        },
        update: {
          pot_id: "pot_781fb6d8a9a04cb4b3372e212da2a3b0",
          player_id: "ply_b830099ed18a4e9da06e345ec2320848",
          fee: 10,
        },
        create: {
          id: "pen_f0622807d8e5414aa905aaa4d0d0552c",
          pot_id: "pot_781fb6d8a9a04cb4b3372e212da2a3b0",
          player_id: "ply_b830099ed18a4e9da06e345ec2320848",
          fee: 10,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_f0722807d8e5414aa905aaa4d0d0552c",
        },
        update: {
          pot_id: "pot_771fb6d8a9a04cb4b3372e212da2a3b0",
          player_id: "ply_f57669391b4c4405a4a4e0f40284712f",
          fee: 20,
        },
        create: {
          id: "pen_f0722807d8e5414aa905aaa4d0d0552c",
          pot_id: "pot_771fb6d8a9a04cb4b3372e212da2a3b0",
          player_id: "ply_f57669391b4c4405a4a4e0f40284712f",
          fee: 20,
        },
      });
      potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_f0822807d8e5414aa905aaa4d0d0552c",
        },
        update: {
          pot_id: "pot_761fb6d8a9a04cb4b3372e212da2a3b0",
          player_id: "ply_f57669391b4c4405a4a4e0f40284712f",
          fee: 10,
        },
        create: {
          id: "pen_f0822807d8e5414aa905aaa4d0d0552c",
          pot_id: "pot_761fb6d8a9a04cb4b3372e212da2a3b0",
          player_id: "ply_f57669391b4c4405a4a4e0f40284712f",
          fee: 10,
        },
      });

      return 8;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function potEntryUpsert_ToDelete() {
    try {
      let potEntry = await prisma.pot_Entry.upsert({
        where: {
          id: "pen_8c8b607b7ebb4e84a0753307afce256e",
        },
        update: {
          pot_id: "pot_791fb6d8a9a04cb4b3372e212da2a3b0",
          player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
          fee: 20,
        },
        create: {
          id: "pen_8c8b607b7ebb4e84a0753307afce256e",
          pot_id: "pot_791fb6d8a9a04cb4b3372e212da2a3b0",
          player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
          fee: 20,
        },
      });
      return 1;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  try {
    const gpCount = await potEntryUpsert_GoldPin();
    const wtCount = await potEntryUpsert_WholeTmnt();
    const nyCount = await potEntryUpsert_NewYear();
    const delCount = await potEntryUpsert_ToDelete();
    console.log(
      "Upserted potEntries: ",
      gpCount + wtCount + nyCount + delCount
    );
    // 4 + 30 + 8 + 1 = 43
    return gpCount + wtCount + delCount;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function brktEntriesUpsert() {
  async function brktEntryUpsert_GoldPin() {
    try {
      let brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_bc4c581d7b1c4fc99dbdbd46f4f7210a",
        },
        update: {
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          num_brackets: 8,
        },
        create: {
          id: "ben_bc4c581d7b1c4fc99dbdbd46f4f7210a",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          num_brackets: 8,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_8f039ee00dfa445c9e3aee0ca9a6391b",
        },
        update: {
          brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          num_brackets: 8,
        },
        create: {
          id: "ben_8f039ee00dfa445c9e3aee0ca9a6391b",
          brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          num_brackets: 8,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
        },
        update: {
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          num_brackets: 8,
        },
        create: {
          id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          num_brackets: 8,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_0a6938d0a5b94dd789bd3b8663d1ee53",
        },
        update: {
          brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          num_brackets: 8,
        },
        create: {
          id: "ben_0a6938d0a5b94dd789bd3b8663d1ee53",
          brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          num_brackets: 8,
        },
      });

      return 4;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function brktEntryUpsert_WholeTmnt() {
    try {
      let brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c0126ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 10,
        },
        create: {
          id: "ben_c0126ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 10,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c0226ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 10,
        },
        create: {
          id: "ben_c0226ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 10,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c0326ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 8,
        },
        create: {
          id: "ben_c0326ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 8,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c0426ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 8,
        },
        create: {
          id: "ben_c0426ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 8,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c0526ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
        create: {
          id: "ben_c0526ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c0626ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
        create: {
          id: "ben_c0626ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c0726ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 7,
        },
        create: {
          id: "ben_c0726ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 7,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c0826ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 7,
        },
        create: {
          id: "ben_c0826ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 7,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c0926ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
        create: {
          id: "ben_c0926ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c1026ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
        create: {
          id: "ben_c1026ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c1126ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 4,
        },
        create: {
          id: "ben_c1126ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 4,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c1226ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 4,
        },
        create: {
          id: "ben_c1226ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 4,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c1326ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
        create: {
          id: "ben_c1326ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c1426ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
        create: {
          id: "ben_c1426ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c1526ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 9,
        },
        create: {
          id: "ben_c1526ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 9,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c1626ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 9,
        },
        create: {
          id: "ben_c1626ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 9,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c1726ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
        create: {
          id: "ben_c1726ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c1826ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
        create: {
          id: "ben_c1826ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c1926ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 3,
        },
        create: {
          id: "ben_c1926ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 3,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c2026ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 3,
        },
        create: {
          id: "ben_c2026ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 3,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c2126ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 21,
        },
        create: {
          id: "ben_c2126ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 21,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c2226ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 21,
        },
        create: {
          id: "ben_c2226ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 21,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c2326ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 2,
        },
        create: {
          id: "ben_c2326ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 2,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c2426ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 2,
        },
        create: {
          id: "ben_c2426ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 2,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c2526ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
        create: {
          id: "ben_c2526ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c2626ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
        create: {
          id: "ben_c2626ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c2726ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 9,
        },
        create: {
          id: "ben_c2726ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 9,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c2826ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 9,
        },
        create: {
          id: "ben_c2826ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 9,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c2926ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 3,
        },
        create: {
          id: "ben_c2926ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 3,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c3026ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 3,
        },
        create: {
          id: "ben_c3026ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 3,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c3126ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 7,
        },
        create: {
          id: "ben_c3126ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 7,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c3226ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 7,
        },
        create: {
          id: "ben_c3226ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 7,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c3326ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 4,
        },
        create: {
          id: "ben_c3326ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 4,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c3426ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 4,
        },
        create: {
          id: "ben_c3426ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 4,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c3526ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 9,
        },
        create: {
          id: "ben_c3526ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 9,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c3626ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 9,
        },
        create: {
          id: "ben_c3626ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 9,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c3726ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
        create: {
          id: "ben_c3726ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c3826ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
        create: {
          id: "ben_c3826ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c3926ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 2,
        },
        create: {
          id: "ben_c3926ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 2,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_c4026ba58d3f4a7d950101a5674ce595",
        },
        update: {
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 2,
        },
        create: {
          id: "ben_c4026ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 2,
        },
      });

      return 40;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function brktEntryUpsert_NewYearsEve() {
    try {
      let brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_3a1eb5eef01d449eb444bfdf6b7d9035",
        },
        update: {
          brkt_id: "brk_d017ea07dbc6453a8a705f4bb7599ed4",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          num_brackets: 10,
        },
        create: {
          id: "ben_3a1eb5eef01d449eb444bfdf6b7d9035",
          brkt_id: "brk_d017ea07dbc6453a8a705f4bb7599ed4",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          num_brackets: 10,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_3a2eb5eef01d449eb444bfdf6b7d9035",
        },
        update: {
          brkt_id: "brk_d027ea07dbc6453a8a705f4bb7599ed4",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          num_brackets: 10,
        },
        create: {
          id: "ben_3a2eb5eef01d449eb444bfdf6b7d9035",
          brkt_id: "brk_d027ea07dbc6453a8a705f4bb7599ed4",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          num_brackets: 10,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_3a3eb5eef01d449eb444bfdf6b7d9035",
        },
        update: {
          brkt_id: "brk_d037ea07dbc6453a8a705f4bb7599ed4",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          num_brackets: 10,
        },
        create: {
          id: "ben_3a3eb5eef01d449eb444bfdf6b7d9035",
          brkt_id: "brk_d037ea07dbc6453a8a705f4bb7599ed4",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          num_brackets: 10,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_3a4eb5eef01d449eb444bfdf6b7d9035",
        },
        update: {
          brkt_id: "brk_d047ea07dbc6453a8a705f4bb7599ed4",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          num_brackets: 10,
        },
        create: {
          id: "ben_3a4eb5eef01d449eb444bfdf6b7d9035",
          brkt_id: "brk_d047ea07dbc6453a8a705f4bb7599ed4",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          num_brackets: 10,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_3a5eb5eef01d449eb444bfdf6b7d9035",
        },
        update: {
          brkt_id: "brk_d017ea07dbc6453a8a705f4bb7599ed4",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          num_brackets: 8,
        },
        create: {
          id: "ben_3a5eb5eef01d449eb444bfdf6b7d9035",
          brkt_id: "brk_d017ea07dbc6453a8a705f4bb7599ed4",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          num_brackets: 8,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_3a6eb5eef01d449eb444bfdf6b7d9035",
        },
        update: {
          brkt_id: "brk_d027ea07dbc6453a8a705f4bb7599ed4",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          num_brackets: 8,
        },
        create: {
          id: "ben_3a6eb5eef01d449eb444bfdf6b7d9035",
          brkt_id: "brk_d027ea07dbc6453a8a705f4bb7599ed4",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          num_brackets: 8,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_3a7eb5eef01d449eb444bfdf6b7d9035",
        },
        update: {
          brkt_id: "brk_d037ea07dbc6453a8a705f4bb7599ed4",
          player_id: "ply_92670d50aa7f44a487a172412bef8af5",
          num_brackets: 4,
        },
        create: {
          id: "ben_3a7eb5eef01d449eb444bfdf6b7d9035",
          brkt_id: "brk_d037ea07dbc6453a8a705f4bb7599ed4",
          player_id: "ply_92670d50aa7f44a487a172412bef8af5",
          num_brackets: 4,
        },
      });
      brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_3a8eb5eef01d449eb444bfdf6b7d9035",
        },
        update: {
          brkt_id: "brk_d047ea07dbc6453a8a705f4bb7599ed4",
          player_id: "ply_92670d50aa7f44a487a172412bef8af5",
          num_brackets: 4,
        },
        create: {
          id: "ben_3a8eb5eef01d449eb444bfdf6b7d9035",
          brkt_id: "brk_d047ea07dbc6453a8a705f4bb7599ed4",
          player_id: "ply_92670d50aa7f44a487a172412bef8af5",
          num_brackets: 4,
        },
      });

      return 8;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function brktEntryUpsert_ToDelete() {
    try {
      let brktEntry = await prisma.brkt_Entry.upsert({
        where: {
          id: "ben_093a0902e01e46dbbe9f111acefc17da",
        },
        update: {
          brkt_id: "brk_12344698f47e4d64935547923e2bdbfb",
          player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
          num_brackets: 8,
        },
        create: {
          id: "ben_093a0902e01e46dbbe9f111acefc17da",
          brkt_id: "brk_12344698f47e4d64935547923e2bdbfb",
          player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
          num_brackets: 8,
        },
      });
      return 1;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  try {
    const gpCount = await brktEntryUpsert_GoldPin();
    const wtCount = await brktEntryUpsert_WholeTmnt();
    const nyCount = await brktEntryUpsert_NewYearsEve();
    const delCount = await brktEntryUpsert_ToDelete();

    console.log(
      "Upserted brktEntries: ",
      gpCount + wtCount + nyCount + delCount
    );
    // console.log("Upserted potEntries: ", delCount);
    // 4 + 40 + 8 + 1 = 53
    return gpCount + wtCount + nyCount + delCount;
    // return delCount;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function oneBrktsUpset() {
  async function oneBrktsUpset_GoldPin() {
    try {
      let oneBrkt = await prisma.one_Brkt.upsert({
        where: {
          id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
        },
        update: {
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          bindex: 0,
        },
        create: {
          id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          bindex: 0,
        },
      });
      oneBrkt = await prisma.one_Brkt.upsert({
        where: {
          id: "obk_5423c16d58a948748f32c7c72c632297",
        },
        update: {
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          bindex: 1,
        },
        create: {
          id: "obk_5423c16d58a948748f32c7c72c632297",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          bindex: 1,
        },
      });
      oneBrkt = await prisma.one_Brkt.upsert({
        where: {
          id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
        },
        update: {
          brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
          bindex: 0,
        },
        create: {
          id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
          brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
          bindex: 0,
        },
      });
      oneBrkt = await prisma.one_Brkt.upsert({
        where: {
          id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
        },
        update: {
          brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
          bindex: 1,
        },
        create: {
          id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
          brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
          bindex: 1,
        },
      });

      return 4;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function oneBrktsUpset_NewYearsEve() {
    try {
      let oneBrkt = await prisma.one_Brkt.upsert({
        where: {
          id: "obk_103f595981364b77af163624528bdfda",
        },
        update: {
          brkt_id: "brk_d017ea07dbc6453a8a705f4bb7599ed4",
          bindex: 0,
        },
        create: {
          id: "obk_103f595981364b77af163624528bdfda",
          brkt_id: "brk_d017ea07dbc6453a8a705f4bb7599ed4",
          bindex: 0,
        },
      });
      oneBrkt = await prisma.one_Brkt.upsert({
        where: {
          id: "obk_6d6b6dd2e83242ac96b5a9298e21ae66",
        },
        update: {
          brkt_id: "brk_d017ea07dbc6453a8a705f4bb7599ed4",
          bindex: 1,
        },
        create: {
          id: "obk_6d6b6dd2e83242ac96b5a9298e21ae66",
          brkt_id: "brk_d017ea07dbc6453a8a705f4bb7599ed4",
          bindex: 1,
        },
      });
      oneBrkt = await prisma.one_Brkt.upsert({
        where: {
          id: "obk_46083c6d758f4166ad0f7647da1689fb",
        },
        update: {
          brkt_id: "brk_d027ea07dbc6453a8a705f4bb7599ed4",
          bindex: 0,
        },
        create: {
          id: "obk_46083c6d758f4166ad0f7647da1689fb",
          brkt_id: "brk_d027ea07dbc6453a8a705f4bb7599ed4",
          bindex: 0,
        },
      });
      oneBrkt = await prisma.one_Brkt.upsert({
        where: {
          id: "obk_1c6f7ba8f16047e6b2f87a2351316f8f",
        },
        update: {
          brkt_id: "brk_d027ea07dbc6453a8a705f4bb7599ed4",
          bindex: 1,
        },
        create: {
          id: "obk_1c6f7ba8f16047e6b2f87a2351316f8f",
          brkt_id: "brk_d027ea07dbc6453a8a705f4bb7599ed4",
          bindex: 1,
        },
      });

      return 4;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function oneBrktsUpset_ToDelete() {
    try {
      let oneBrkt = await prisma.one_Brkt.upsert({
        where: {
          id: "obk_bbae841f36244b5ab5c0ec5793820d85",
        },
        update: {
          brkt_id: "brk_d047ea07dbc6453a8a705f4bb7599ed4",
          bindex: 0,
        },
        create: {
          id: "obk_bbae841f36244b5ab5c0ec5793820d85",
          brkt_id: "brk_d047ea07dbc6453a8a705f4bb7599ed4",
          bindex: 0,
        },
      });

      return 1;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  try {
    const gpCount = await oneBrktsUpset_GoldPin();    
    const nyCount = await oneBrktsUpset_NewYearsEve();
    const delCount = await oneBrktsUpset_ToDelete();

    console.log(
      "Upserted oneBrackets: ",
      gpCount + nyCount + delCount
    );    
    // 4 + 4 + 1 = 9
    return gpCount + nyCount + delCount;    
  } catch (error) {
    console.log(error);
    return -1;
  }

}

async function brktSeedsUpsert() { 

  async function brktSeedsUpset_GoldPin() {
    try {
      let brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
            seed: 0,
          },
        },
        update: {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        },
        create: {
          one_brkt_id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
          seed: 0,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
            seed: 1,
          },
        },
        update: {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        },
        create: {
          one_brkt_id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
          seed: 1,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
            seed: 2,
          },
        },
        update: {
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
        },
        create: {
          one_brkt_id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
          seed: 2,
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
            seed: 3,
          },
        },
        update: {
          player_id: 'ply_89be0472be3d476ea1caa99dd05953fa',
        },
        create: {
          one_brkt_id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
          seed: 3,
          player_id: 'ply_89be0472be3d476ea1caa99dd05953fa',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
            seed: 4,
          },
        },
        update: {
          player_id: 'ply_8b0fd8bbd9e34d34a7fa90b4111c6e40',
        },
        create: {
          one_brkt_id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
          seed: 4,
          player_id: 'ply_8b0fd8bbd9e34d34a7fa90b4111c6e40',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
            seed: 5,
          },
        },
        update: {
          player_id: 'ply_bb0fd8bbd9e34d34a7fa90b4111c6e40',
        },
        create: {
          one_brkt_id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
          seed: 5,
          player_id: 'ply_bb0fd8bbd9e34d34a7fa90b4111c6e40',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
            seed: 6,
          },
        },
        update: {
          player_id: 'ply_bb1fd8bbd9e34d34a7fa90b4111c6e40',
        },
        create: {
          one_brkt_id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
          seed: 6,
          player_id: 'ply_bb1fd8bbd9e34d34a7fa90b4111c6e40',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
            seed: 7,
          },
        },
        update: {
          player_id: 'ply_bb2fd8bbd9e34d34a7fa90b4111c6e40',
        },
        create: {
          one_brkt_id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
          seed: 7,
          player_id: 'ply_bb2fd8bbd9e34d34a7fa90b4111c6e40',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_5423c16d58a948748f32c7c72c632297",
            seed: 0,
          },
        },
        update: {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        },
        create: {
          one_brkt_id: "obk_5423c16d58a948748f32c7c72c632297",
          seed: 0,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_5423c16d58a948748f32c7c72c632297",
            seed: 1,
          },
        },
        update: {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        },
        create: {
          one_brkt_id: "obk_5423c16d58a948748f32c7c72c632297",
          seed: 1,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_5423c16d58a948748f32c7c72c632297",
            seed: 2,
          },
        },
        update: {
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
        },
        create: {
          one_brkt_id: "obk_5423c16d58a948748f32c7c72c632297",
          seed: 2,
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_5423c16d58a948748f32c7c72c632297",
            seed: 3,
          },
        },
        update: {
          player_id: 'ply_89be0472be3d476ea1caa99dd05953fa',
        },
        create: {
          one_brkt_id: "obk_5423c16d58a948748f32c7c72c632297",
          seed: 3,
          player_id: 'ply_89be0472be3d476ea1caa99dd05953fa',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_5423c16d58a948748f32c7c72c632297",
            seed: 4,
          },
        },
        update: {
          player_id: 'ply_8b0fd8bbd9e34d34a7fa90b4111c6e40',
        },
        create: {
          one_brkt_id: "obk_5423c16d58a948748f32c7c72c632297",
          seed: 4,
          player_id: 'ply_8b0fd8bbd9e34d34a7fa90b4111c6e40',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_5423c16d58a948748f32c7c72c632297",
            seed: 5,
          },
        },
        update: {
          player_id: 'ply_bb0fd8bbd9e34d34a7fa90b4111c6e40',
        },
        create: {
          one_brkt_id: "obk_5423c16d58a948748f32c7c72c632297",
          seed: 5,
          player_id: 'ply_bb0fd8bbd9e34d34a7fa90b4111c6e40',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_5423c16d58a948748f32c7c72c632297",
            seed: 6,
          },
        },
        update: {
          player_id: 'ply_bb1fd8bbd9e34d34a7fa90b4111c6e40',
        },
        create: {
          one_brkt_id: "obk_5423c16d58a948748f32c7c72c632297",
          seed: 6,
          player_id: 'ply_bb1fd8bbd9e34d34a7fa90b4111c6e40',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_5423c16d58a948748f32c7c72c632297",
            seed: 7,
          },
        },
        update: {
          player_id: 'ply_bb2fd8bbd9e34d34a7fa90b4111c6e40',
        },
        create: {
          one_brkt_id: "obk_5423c16d58a948748f32c7c72c632297",
          seed: 7,
          player_id: 'ply_bb2fd8bbd9e34d34a7fa90b4111c6e40',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
            seed: 0,
          },
        },
        update: {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        },
        create: {
          one_brkt_id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
          seed: 0,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
            seed: 1,
          },
        },
        update: {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        },
        create: {
          one_brkt_id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
          seed: 1,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
            seed: 2,
          },
        },
        update: {
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
        },
        create: {
          one_brkt_id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
          seed: 2,
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
            seed: 3,
          },
        },
        update: {
          player_id: 'ply_89be0472be3d476ea1caa99dd05953fa',
        },
        create: {
          one_brkt_id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
          seed: 3,
          player_id: 'ply_89be0472be3d476ea1caa99dd05953fa',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
            seed: 4,
          },
        },
        update: {
          player_id: 'ply_8b0fd8bbd9e34d34a7fa90b4111c6e40',
        },
        create: {
          one_brkt_id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
          seed: 4,
          player_id: 'ply_8b0fd8bbd9e34d34a7fa90b4111c6e40',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
            seed: 5,
          },
        },
        update: {
          player_id: 'ply_bb0fd8bbd9e34d34a7fa90b4111c6e40',
        },
        create: {
          one_brkt_id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
          seed: 5,
          player_id: 'ply_bb0fd8bbd9e34d34a7fa90b4111c6e40',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
            seed: 6,
          },
        },
        update: {
          player_id: 'ply_bb1fd8bbd9e34d34a7fa90b4111c6e40',
        },
        create: {
          one_brkt_id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
          seed: 6,
          player_id: 'ply_bb1fd8bbd9e34d34a7fa90b4111c6e40',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
            seed: 7,
          },
        },
        update: {
          player_id: 'ply_bb2fd8bbd9e34d34a7fa90b4111c6e40',
        },
        create: {
          one_brkt_id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
          seed: 7,
          player_id: 'ply_bb2fd8bbd9e34d34a7fa90b4111c6e40',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
            seed: 0,
          },
        },
        update: {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        },
        create: {
          one_brkt_id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
          seed: 0,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
            seed: 1,
          },
        },
        update: {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        },
        create: {
          one_brkt_id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
          seed: 1,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
            seed: 2,
          },
        },
        update: {
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
        },
        create: {
          one_brkt_id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
          seed: 2,
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
            seed: 3,
          },
        },
        update: {
          player_id: 'ply_89be0472be3d476ea1caa99dd05953fa',
        },
        create: {
          one_brkt_id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
          seed: 3,
          player_id: 'ply_89be0472be3d476ea1caa99dd05953fa',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
            seed: 4,
          },
        },
        update: {
          player_id: 'ply_8b0fd8bbd9e34d34a7fa90b4111c6e40',
        },
        create: {
          one_brkt_id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
          seed: 4,
          player_id: 'ply_8b0fd8bbd9e34d34a7fa90b4111c6e40',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
            seed: 5,
          },
        },
        update: {
          player_id: 'ply_bb0fd8bbd9e34d34a7fa90b4111c6e40',
        },
        create: {
          one_brkt_id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
          seed: 5,
          player_id: 'ply_bb0fd8bbd9e34d34a7fa90b4111c6e40',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
            seed: 6,
          },
        },
        update: {
          player_id: 'ply_bb1fd8bbd9e34d34a7fa90b4111c6e40',
        },
        create: {
          one_brkt_id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
          seed: 6,
          player_id: 'ply_bb1fd8bbd9e34d34a7fa90b4111c6e40',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
            seed: 7,
          },
        },
        update: {
          player_id: 'ply_bb2fd8bbd9e34d34a7fa90b4111c6e40',
        },
        create: {
          one_brkt_id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
          seed: 7,
          player_id: 'ply_bb2fd8bbd9e34d34a7fa90b4111c6e40',
        },
      });
      return 32;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function brktSeedsUpset_NewYearsEve() {
    try {
      let brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_103f595981364b77af163624528bdfda",
            seed: 0,
          },
        },
        update: {
          player_id: 'ply_da674926088d4f739c69c2c72a465ccd',
        },
        create: {
          one_brkt_id: "obk_103f595981364b77af163624528bdfda",
          seed: 0,
          player_id: 'ply_da674926088d4f739c69c2c72a465ccd',
        },
      });
      brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_103f595981364b77af163624528bdfda",
            seed: 1,
          },
        },
        update: {
          player_id: 'ply_8ffe9406fcc046508aa4b214ef16f647',
        },
        create: {
          one_brkt_id: "obk_103f595981364b77af163624528bdfda",
          seed: 1,
          player_id: 'ply_8ffe9406fcc046508aa4b214ef16f647',
        },
      });      
      return 2;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function brktSeedsUpset_ToDelete() {
    try {
      let brktSeed = await prisma.brkt_Seed.upsert({
        where: {          
          one_brkt_id_seed: {
            one_brkt_id: "obk_6d6b6dd2e83242ac96b5a9298e21ae66",
            seed: 0,
          },
        },
        update: {
          player_id: 'ply_b830099ed18a4e9da06e345ec2320848',
        },
        create: {
          one_brkt_id: "obk_6d6b6dd2e83242ac96b5a9298e21ae66",
          seed: 0,
          player_id: 'ply_b830099ed18a4e9da06e345ec2320848',
        },
      });
      return 1;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  try {
    const gpCount = await brktSeedsUpset_GoldPin();    
    const nyCount = await brktSeedsUpset_NewYearsEve();
    const delCount = await brktSeedsUpset_ToDelete();

    console.log(
      "Upserted brktSeeds: ",
      gpCount + nyCount + delCount
    );    
    // 32 + 2 + 1 = 35
    return gpCount + nyCount + delCount;    
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function elimEntriesUpsert() {
  async function elimEntryUpsert_GoldPin() {
    try {
      let elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_23d6f8f1de844604a8828d4bb8a5a910",
        },
        update: {
          elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: 5,
        },
        create: {
          id: "een_23d6f8f1de844604a8828d4bb8a5a910",
          elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_e50663d4292145e6895ece1c0105dd3a",
        },
        update: {
          elim_id: "elm_9d01015272b54962a375cf3c91007a12",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: 5,
        },
        create: {
          id: "een_e50663d4292145e6895ece1c0105dd3a",
          elim_id: "elm_9d01015272b54962a375cf3c91007a12",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_ffce2d50515541259f25b19257898074",
        },
        update: {
          elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          fee: 5,
        },
        create: {
          id: "een_ffce2d50515541259f25b19257898074",
          elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_1aa013df98094a03aa79995bc1c6dd9f",
        },
        update: {
          elim_id: "elm_9d01015272b54962a375cf3c91007a12",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          fee: 5,
        },
        create: {
          id: "een_1aa013df98094a03aa79995bc1c6dd9f",
          elim_id: "elm_9d01015272b54962a375cf3c91007a12",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          fee: 5,
        },
      });
      return 4;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function elimEntryUpsert_NewYearsEve() {
    try {
      let elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_e01bedf38daf4b378425bc9931fffd0f",
        },
        update: {
          elim_id: "elm_c01077494c2d4d9da166d697c08c28d2",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 5,
        },
        create: {
          id: "een_e01bedf38daf4b378425bc9931fffd0f",
          elim_id: "elm_c01077494c2d4d9da166d697c08c28d2",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_e02bedf38daf4b378425bc9931fffd0f",
        },
        update: {
          elim_id: "elm_c02077494c2d4d9da166d697c08c28d2",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 5,
        },
        create: {
          id: "een_e02bedf38daf4b378425bc9931fffd0f",
          elim_id: "elm_c02077494c2d4d9da166d697c08c28d2",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_e03bedf38daf4b378425bc9931fffd0f",
        },
        update: {
          elim_id: "elm_c03077494c2d4d9da166d697c08c28d2",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 5,
        },
        create: {
          id: "een_e03bedf38daf4b378425bc9931fffd0f",
          elim_id: "elm_c03077494c2d4d9da166d697c08c28d2",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_e04bedf38daf4b378425bc9931fffd0f",
        },
        update: {
          elim_id: "elm_c04077494c2d4d9da166d697c08c28d2",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 5,
        },
        create: {
          id: "een_e04bedf38daf4b378425bc9931fffd0f",
          elim_id: "elm_c04077494c2d4d9da166d697c08c28d2",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_e05bedf38daf4b378425bc9931fffd0f",
        },
        update: {
          elim_id: "elm_c01077494c2d4d9da166d697c08c28d2",
          player_id: "ply_9fff21de787b4637beb65a1936967071",
          fee: 5,
        },
        create: {
          id: "een_e05bedf38daf4b378425bc9931fffd0f",
          elim_id: "elm_c01077494c2d4d9da166d697c08c28d2",
          player_id: "ply_9fff21de787b4637beb65a1936967071",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_e06bedf38daf4b378425bc9931fffd0f",
        },
        update: {
          elim_id: "elm_c02077494c2d4d9da166d697c08c28d2",
          player_id: "ply_9fff21de787b4637beb65a1936967071",
          fee: 5,
        },
        create: {
          id: "een_e06bedf38daf4b378425bc9931fffd0f",
          elim_id: "elm_c02077494c2d4d9da166d697c08c28d2",
          player_id: "ply_9fff21de787b4637beb65a1936967071",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_e07bedf38daf4b378425bc9931fffd0f",
        },
        update: {
          elim_id: "elm_c03077494c2d4d9da166d697c08c28d2",
          player_id: "ply_f57669391b4c4405a4a4e0f40284712f",
          fee: 5,
        },
        create: {
          id: "een_e07bedf38daf4b378425bc9931fffd0f",
          elim_id: "elm_c03077494c2d4d9da166d697c08c28d2",
          player_id: "ply_f57669391b4c4405a4a4e0f40284712f",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_e08bedf38daf4b378425bc9931fffd0f",
        },
        update: {
          elim_id: "elm_c04077494c2d4d9da166d697c08c28d2",
          player_id: "ply_f57669391b4c4405a4a4e0f40284712f",
          fee: 5,
        },
        create: {
          id: "een_e08bedf38daf4b378425bc9931fffd0f",
          elim_id: "elm_c04077494c2d4d9da166d697c08c28d2",
          player_id: "ply_f57669391b4c4405a4a4e0f40284712f",
          fee: 5,
        },
      });
      return 8;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function brktEntryUpsert_WholeTmnt() {
    try {
      let elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d0126ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d0126ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d0226ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d0226ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d0326ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d0326ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d0426ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d0426ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d0526ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d0526ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d0626ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d0626ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d0726ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d0726ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d0826ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d0826ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d0926ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d0926ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d1026ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d1026ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d1126ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d1126ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d1226ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d1226ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d1326ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d1326ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d1426ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d1426ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d1526ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d1526ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d1626ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d1626ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d1726ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d1726ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d1826ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d1826ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d1926ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d1926ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d2026ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d2026ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d2126ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d2126ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d2226ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d2226ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d2326ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d2326ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d2426ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d2426ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d2526ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d2526ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d2626ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d2626ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d2726ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d2726ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d2826ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d2826ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d2926ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d2926ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d3026ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d3026ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d3126ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d3126ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });
      elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_d3226ba58d3f4a7d950101a5674ce595",
        },
        update: {
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
        create: {
          id: "een_d3226ba58d3f4a7d950101a5674ce595",
          elim_id: "elm_461eece3c50241e9925e9a520730ac7e",
          player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
          fee: 5,
        },
      });

      return 32;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function brktEntryUpsert_ToDelete() {
    try {
      let elimEntry = await prisma.elim_Entry.upsert({
        where: {
          id: "een_19f158c6cc0d4f619227fbc24a885bab",
        },
        update: {
          elim_id: "elm_a47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
          fee: 5,
        },
        create: {
          id: "een_19f158c6cc0d4f619227fbc24a885bab",
          elim_id: "elm_a47a4ec07f824b0e93169ae78e8b4b1e",
          player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
          fee: 5,
        },
      });

      return 1;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  try {
    const gpCount = await elimEntryUpsert_GoldPin();
    const nyCount = await elimEntryUpsert_NewYearsEve();
    const wtCount = await brktEntryUpsert_WholeTmnt();
    const delCount = await brktEntryUpsert_ToDelete();
    console.log(
      "Upserted elimEntries: ",
      gpCount + nyCount + wtCount + delCount
    );
    // 4 + 8 + 32 + 1 = 45
    return gpCount + wtCount + delCount;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function gamesUpsert() {
  async function gamesUpsert_GoldPin() {
    try {
      let game = await prisma.game.upsert({
        where: {
          id: "gam_99ea810b452843018f3f1db5139ffa72",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          game_num: 1,
          score: 201,
        },
        create: {
          id: "gam_99ea810b452843018f3f1db5139ffa72",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          game_num: 1,
          score: 201,
        },
      });
      game = await prisma.game.upsert({
        where: {
          id: "gam_5f2e2b1cb1e44e58b32d121d7ae2941f",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          game_num: 2,
          score: 202,
        },
        create: {
          id: "gam_5f2e2b1cb1e44e58b32d121d7ae2941f",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          game_num: 2,
          score: 202,
        },
      });
      game = await prisma.game.upsert({
        where: {
          id: "gam_58e0b0efb4a3459b8b2b5e3e48747707",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          game_num: 3,
          score: 203,
        },
        create: {
          id: "gam_58e0b0efb4a3459b8b2b5e3e48747707",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          game_num: 3,
          score: 203,
        },
      });
      game = await prisma.game.upsert({
        where: {
          id: "gam_928a3f6e4c6d4a19a9fc194d7c819ed8",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          game_num: 4,
          score: 204,
        },
        create: {
          id: "gam_928a3f6e4c6d4a19a9fc194d7c819ed8",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          game_num: 4,
          score: 204,
        },
      });
      game = await prisma.game.upsert({
        where: {
          id: "gam_5b94dc3a7a884b79ac4a0b0d4a13cf57",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          game_num: 5,
          score: 205,
        },
        create: {
          id: "gam_5b94dc3a7a884b79ac4a0b0d4a13cf57",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          game_num: 5,
          score: 205,
        },
      });
      game = await prisma.game.upsert({
        where: {
          id: "gam_46a8bf1a637c4df89da96e05a6d6d67f",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          game_num: 6,
          score: 206,
        },
        create: {
          id: "gam_46a8bf1a637c4df89da96e05a6d6d67f",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          game_num: 6,
          score: 206,
        },
      });
      game = await prisma.game.upsert({
        where: {
          id: "gam_3e2d1feab8f84d77b5c1baefca20a993",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          game_num: 1,
          score: 211,
        },
        create: {
          id: "gam_3e2d1feab8f84d77b5c1baefca20a993",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          game_num: 1,
          score: 211,
        },
      });
      game = await prisma.game.upsert({
        where: {
          id: "gam_1bf78c5c63864d238eef7b4500d87450",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          game_num: 2,
          score: 212,
        },
        create: {
          id: "gam_1bf78c5c63864d238eef7b4500d87450",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          game_num: 2,
          score: 212,
        },
      });
      game = await prisma.game.upsert({
        where: {
          id: "gam_6b89117c7d5e4e11a4b6cfad7e4f2042",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          game_num: 3,
          score: 213,
        },
        create: {
          id: "gam_6b89117c7d5e4e11a4b6cfad7e4f2042",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          game_num: 3,
          score: 213,
        },
      });
      game = await prisma.game.upsert({
        where: {
          id: "gam_21b4ae4df3c5447da25d4b61853c76cb",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          game_num: 4,
          score: 214,
        },
        create: {
          id: "gam_21b4ae4df3c5447da25d4b61853c76cb",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          game_num: 4,
          score: 214,
        },
      });
      game = await prisma.game.upsert({
        where: {
          id: "gam_7c13f49a1b204b49b3204a669a1d49b7",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          game_num: 5,
          score: 215,
        },
        create: {
          id: "gam_7c13f49a1b204b49b3204a669a1d49b7",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          game_num: 5,
          score: 215,
        },
      });
      game = await prisma.game.upsert({
        where: {
          id: "gam_dab4619d40f548788b2c12c57b964387",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          game_num: 6,
          score: 216,
        },
        create: {
          id: "gam_dab4619d40f548788b2c12c57b964387",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          game_num: 6,
          score: 216,
        },
      });
      let randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_51f99d2abbe94482b8ac23234778e2db",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
          game_num: 1,
          score: randomScore,
        },
        create: {
          id: "gam_51f99d2abbe94482b8ac23234778e2db",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
          game_num: 1,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_4c7e4cbf846348d1b88504146baf5b8d",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
          game_num: 2,
          score: randomScore,
        },
        create: {
          id: "gam_4c7e4cbf846348d1b88504146baf5b8d",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
          game_num: 2,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_f3b95d6debd24cf8a85f5e4c82b3c786",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
          game_num: 3,
          score: randomScore,
        },
        create: {
          id: "gam_f3b95d6debd24cf8a85f5e4c82b3c786",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
          game_num: 3,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_163df6bdfedf44a399b9110b2df3c3de",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
          game_num: 4,
          score: randomScore,
        },
        create: {
          id: "gam_163df6bdfedf44a399b9110b2df3c3de",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
          game_num: 4,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_c8f04da31ed54c2fb1dd3e0e5aa0b9d1",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
          game_num: 5,
          score: randomScore,
        },
        create: {
          id: "gam_c8f04da31ed54c2fb1dd3e0e5aa0b9d1",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
          game_num: 5,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_1ec686a77bd048c19a182b09d5d4e934 ",
        },
        update: {
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
          game_num: 6,
          score: randomScore,
        },
        create: {
          id: "gam_1ec686a77bd048c19a182b09d5d4e934 ",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
          game_num: 6,
          score: randomScore,
        },
      });
      return 18;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function gamesUpsert_NewYearsEve() {
    try {
      let randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      let game = await prisma.game.upsert({
        where: {
          id: "gam_f47ac10b58cc4372a5670e02b2c3d479",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          game_num: 1,
          score: randomScore,
        },
        create: {
          id: "gam_f47ac10b58cc4372a5670e02b2c3d479",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          game_num: 1,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_9bb58ff04e7a45d98ae4b5f2d7b1b45e",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          game_num: 2,
          score: randomScore,
        },
        create: {
          id: "gam_9bb58ff04e7a45d98ae4b5f2d7b1b45e",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          game_num: 2,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_3c9a9ea1d9bc44e899ad9e1d82b7cdb6",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          game_num: 3,
          score: randomScore,
        },
        create: {
          id: "gam_3c9a9ea1d9bc44e899ad9e1d82b7cdb6",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          game_num: 3,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_6a0be04152a3483a8d50c8ea037f4d99",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          game_num: 4,
          score: randomScore,
        },
        create: {
          id: "gam_6a0be04152a3483a8d50c8ea037f4d99",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          game_num: 4,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_ba7cf3081a1b46218ab8b7d8791b5c76",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          game_num: 5,
          score: randomScore,
        },
        create: {
          id: "gam_ba7cf3081a1b46218ab8b7d8791b5c76",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          game_num: 5,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_8113dd4a1dfc4d8b96e7f8694fb17738",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          game_num: 6,
          score: randomScore,
        },
        create: {
          id: "gam_8113dd4a1dfc4d8b96e7f8694fb17738",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_da674926088d4f739c69c2c72a465ccd",
          game_num: 6,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_4dc8f1b94b0045248decd4239c5b2c59",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          game_num: 1,
          score: randomScore,
        },
        create: {
          id: "gam_4dc8f1b94b0045248decd4239c5b2c59",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          game_num: 1,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_0bde6a2ab2fa4c6c9c10a2a6cd3f4730",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          game_num: 2,
          score: randomScore,
        },
        create: {
          id: "gam_0bde6a2ab2fa4c6c9c10a2a6cd3f4730",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          game_num: 2,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_214d572a9db34c4d80cbb84ed484fc39",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          game_num: 3,
          score: randomScore,
        },
        create: {
          id: "gam_214d572a9db34c4d80cbb84ed484fc39",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          game_num: 3,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_9fb63b72c4fc43dba7b8796dfaba5aef",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          game_num: 4,
          score: randomScore,
        },
        create: {
          id: "gam_9fb63b72c4fc43dba7b8796dfaba5aef",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          game_num: 4,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_94e431702e934a8c97b4d24169f5d3f4",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          game_num: 5,
          score: randomScore,
        },
        create: {
          id: "gam_94e431702e934a8c97b4d24169f5d3f4",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          game_num: 5,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_574a2a3c2eb6417b81e582bddbd1d79c",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          game_num: 6,
          score: randomScore,
        },
        create: {
          id: "gam_574a2a3c2eb6417b81e582bddbd1d79c",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
          game_num: 6,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_6422b6e984d04dd09f82d39976b7d554",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_b830099ed18a4e9da06e345ec2320848",
          game_num: 1,
          score: randomScore,
        },
        create: {
          id: "gam_6422b6e984d04dd09f82d39976b7d554",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_b830099ed18a4e9da06e345ec2320848",
          game_num: 1,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_7897b4c582644bbab1f4c5e4fbf6b13e",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_b830099ed18a4e9da06e345ec2320848",
          game_num: 2,
          score: randomScore,
        },
        create: {
          id: "gam_7897b4c582644bbab1f4c5e4fbf6b13e",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_b830099ed18a4e9da06e345ec2320848",
          game_num: 2,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_ad3f69e98e364f8288e32b8a68e87ffb",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_b830099ed18a4e9da06e345ec2320848",
          game_num: 3,
          score: randomScore,
        },
        create: {
          id: "gam_ad3f69e98e364f8288e32b8a68e87ffb",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_b830099ed18a4e9da06e345ec2320848",
          game_num: 3,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_b1d85f462ff04b5fa7db1a7fc6eab8e4",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_b830099ed18a4e9da06e345ec2320848",
          game_num: 4,
          score: randomScore,
        },
        create: {
          id: "gam_b1d85f462ff04b5fa7db1a7fc6eab8e4",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_b830099ed18a4e9da06e345ec2320848",
          game_num: 4,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_e92461ea6c704f208be119fb9ec8c037",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_b830099ed18a4e9da06e345ec2320848",
          game_num: 5,
          score: randomScore,
        },
        create: {
          id: "gam_e92461ea6c704f208be119fb9ec8c037",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_b830099ed18a4e9da06e345ec2320848",
          game_num: 5,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_07f7cca05a084087994aabfd8e4845d1",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_b830099ed18a4e9da06e345ec2320848",
          game_num: 6,
          score: randomScore,
        },
        create: {
          id: "gam_07f7cca05a084087994aabfd8e4845d1",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_b830099ed18a4e9da06e345ec2320848",
          game_num: 6,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_aca74838e61849c68af77d559745e03e",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_92670d50aa7f44a487a172412bef8af5",
          game_num: 1,
          score: randomScore,
        },
        create: {
          id: "gam_aca74838e61849c68af77d559745e03e",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_92670d50aa7f44a487a172412bef8af5",
          game_num: 1,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_837f8b8220154e91b23a3e69e513ffd8",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_92670d50aa7f44a487a172412bef8af5",
          game_num: 2,
          score: randomScore,
        },
        create: {
          id: "gam_837f8b8220154e91b23a3e69e513ffd8",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_92670d50aa7f44a487a172412bef8af5",
          game_num: 2,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_52b57500590e49cf9c0773fd0fa033f9",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_92670d50aa7f44a487a172412bef8af5",
          game_num: 3,
          score: randomScore,
        },
        create: {
          id: "gam_52b57500590e49cf9c0773fd0fa033f9",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_92670d50aa7f44a487a172412bef8af5",
          game_num: 3,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_db10de13bb9143e0ba85fbfc5f292c82",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_92670d50aa7f44a487a172412bef8af5",
          game_num: 4,
          score: randomScore,
        },
        create: {
          id: "gam_db10de13bb9143e0ba85fbfc5f292c82",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_92670d50aa7f44a487a172412bef8af5",
          game_num: 4,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_7242ba85e7aa41a99dc99eaf0e11b1c8",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_92670d50aa7f44a487a172412bef8af5",
          game_num: 5,
          score: randomScore,
        },
        create: {
          id: "gam_7242ba85e7aa41a99dc99eaf0e11b1c8",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_92670d50aa7f44a487a172412bef8af5",
          game_num: 5,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_e35bd6027ed043d8845312ab5a5a05a1",
        },
        update: {
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_92670d50aa7f44a487a172412bef8af5",
          game_num: 6,
          score: randomScore,
        },
        create: {
          id: "gam_e35bd6027ed043d8845312ab5a5a05a1",
          squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
          player_id: "ply_92670d50aa7f44a487a172412bef8af5",
          game_num: 6,
          score: randomScore,
        },
      });

      return 24;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function gamesUpsert_WholeTmnt() {
    try {
      let randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      let game = await prisma.game.upsert({
        where: {
          id: "gam_d9b0f7e8f1b84292a4e3ab711703d1f1",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          game_num: 1,
          score: randomScore,
        },
        create: {
          id: "gam_d9b0f7e8f1b84292a4e3ab711703d1f1",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          game_num: 1,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_b89d6c5a2e7a4b5ea5b89c8f2d716d5d",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          game_num: 2,
          score: randomScore,
        },
        create: {
          id: "gam_b89d6c5a2e7a4b5ea5b89c8f2d716d5d",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          game_num: 2,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_0a5e912e41ad4e0eb1a4e6d9c15fb4b6",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          game_num: 3,
          score: randomScore,
        },
        create: {
          id: "gam_0a5e912e41ad4e0eb1a4e6d9c15fb4b6",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          game_num: 3,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_5b0c7b13a3a94d09802e5b6f9dcf3c10",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          game_num: 4,
          score: randomScore,
        },
        create: {
          id: "gam_5b0c7b13a3a94d09802e5b6f9dcf3c10",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          game_num: 4,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_4c5d1b9844f64a8da2ab4e8b6d317a9e",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          game_num: 5,
          score: randomScore,
        },
        create: {
          id: "gam_4c5d1b9844f64a8da2ab4e8b6d317a9e",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          game_num: 5,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_b1c6e0f7153f413791f394e2f3ac4e8c",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          game_num: 6,
          score: randomScore,
        },
        create: {
          id: "gam_b1c6e0f7153f413791f394e2f3ac4e8c",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          game_num: 6,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_3c7d8f6e4a024e6fb1b5e9f7d214c3b4",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          game_num: 1,
          score: randomScore,
        },
        create: {
          id: "gam_3c7d8f6e4a024e6fb1b5e9f7d214c3b4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          game_num: 1,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_7b9e0d5c2f9a467b9a1e5c6d4f3b2a1e",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          game_num: 2,
          score: randomScore,
        },
        create: {
          id: "gam_7b9e0d5c2f9a467b9a1e5c6d4f3b2a1e",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          game_num: 2,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_9d1c7f8a3b924f8cb1e6a7c5e8b4d1f2",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          game_num: 3,
          score: randomScore,
        },
        create: {
          id: "gam_9d1c7f8a3b924f8cb1e6a7c5e8b4d1f2",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          game_num: 3,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_2e7b4d6a1f9e4c6f8a2b3c1d7e5f9b3a",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          game_num: 4,
          score: randomScore,
        },
        create: {
          id: "gam_2e7b4d6a1f9e4c6f8a2b3c1d7e5f9b3a",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          game_num: 4,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_8a6d5f4c2e1b4d9fb7a0c3e5d4f7a2b1",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          game_num: 5,
          score: randomScore,
        },
        create: {
          id: "gam_8a6d5f4c2e1b4d9fb7a0c3e5d4f7a2b1",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          game_num: 5,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_6c5d8e7a2b9f4c3d1a0b6f7e4a2e9b8f",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          game_num: 6,
          score: randomScore,
        },
        create: {
          id: "gam_6c5d8e7a2b9f4c3d1a0b6f7e4a2e9b8f",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          game_num: 6,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_4e1a2b5d8c9f4e7b6a0c3d2e5f9b7d1c",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          game_num: 1,
          score: randomScore,
        },
        create: {
          id: "gam_4e1a2b5d8c9f4e7b6a0c3d2e5f9b7d1c",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          game_num: 1,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_f7b4d1e2c5a8b9f6d3e0a4c6e8b5d1e3",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          game_num: 2,
          score: randomScore,
        },
        create: {
          id: "gam_f7b4d1e2c5a8b9f6d3e0a4c6e8b5d1e3",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          game_num: 2,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_3e8b4d2a1f9e7c5a6b4c0d3e5a9f7b2d",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          game_num: 3,
          score: randomScore,
        },
        create: {
          id: "gam_3e8b4d2a1f9e7c5a6b4c0d3e5a9f7b2d",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          game_num: 3,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_5d6a1f9e2c3b4e8a7b5c4d0e9f3a2b7f",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          game_num: 4,
          score: randomScore,
        },
        create: {
          id: "gam_5d6a1f9e2c3b4e8a7b5c4d0e9f3a2b7f",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          game_num: 4,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_1b4e3a2c5d9f8b7a0c6e4d1a7f3e5b2d",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          game_num: 5,
          score: randomScore,
        },
        create: {
          id: "gam_1b4e3a2c5d9f8b7a0c6e4d1a7f3e5b2d",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          game_num: 5,
          score: randomScore,
        },
      });
      randomScore = Math.floor(Math.random() * (230 - 190 + 1)) + 190;
      game = await prisma.game.upsert({
        where: {
          id: "gam_2c3b4e1a9f7d5e8b6a0c1d4e3f2b7a9f",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          game_num: 6,
          score: randomScore,
        },
        create: {
          id: "gam_2c3b4e1a9f7d5e8b6a0c1d4e3f2b7a9f",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          game_num: 6,
          score: randomScore,
        },
      });
      return 18;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function gamesUpsert_ToDelete() {
    try {
      let game = await prisma.game.upsert({
        where: {
          id: "gam_c1dfffcefd344ef0a9a2aaacda98635a",
        },
        update: {
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
          game_num: 1,
          score: 222,
        },
        create: {
          id: "gam_c1dfffcefd344ef0a9a2aaacda98635a",
          squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
          player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
          game_num: 1,
          score: 222,
        },
      });
      return 1;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  try {
    const gpCount = await gamesUpsert_GoldPin();
    const wtCount = await gamesUpsert_WholeTmnt();
    const nyCount = await gamesUpsert_NewYearsEve();
    const delCount = await gamesUpsert_ToDelete();
    console.log("Upserted Games: ", gpCount + wtCount + nyCount + delCount);
    // 18 + 18 + 24 + 1 = 61
    return gpCount + wtCount + nyCount + delCount;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function brktRefundsUpsert() {
  async function brktRefundUpsert_GoldPin() {
    try {
      let brktRefund = await prisma.brkt_Refund.upsert({
        where: {
          brkt_entry_id: "ben_bc4c581d7b1c4fc99dbdbd46f4f7210a",
        },
        update: {
          num_refunds: 2,
        },
        create: {
          brkt_entry_id: "ben_bc4c581d7b1c4fc99dbdbd46f4f7210a",
          num_refunds: 2,
        },
      });
      brktRefund = await prisma.brkt_Refund.upsert({
        where: {
          brkt_entry_id: "ben_8f039ee00dfa445c9e3aee0ca9a6391b",
        },
        update: {
          num_refunds: 2,
        },
        create: {
          brkt_entry_id: "ben_8f039ee00dfa445c9e3aee0ca9a6391b",
          num_refunds: 2,
        },
      });
      return 2;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function brktRefundUpsert_WholeTmnt() {
    try {
      let brktRefund = await prisma.brkt_Refund.upsert({
        where: {
          brkt_entry_id: "ben_c2126ba58d3f4a7d950101a5674ce595",
        },
        update: {
          num_refunds: 4,
        },
        create: {
          brkt_entry_id: "ben_c2126ba58d3f4a7d950101a5674ce595",
          num_refunds: 4,
        },
      });
      brktRefund = await prisma.brkt_Refund.upsert({
        where: {
          brkt_entry_id: "ben_c2226ba58d3f4a7d950101a5674ce595",
        },
        update: {
          num_refunds: 4,
        },
        create: {
          brkt_entry_id: "ben_c2226ba58d3f4a7d950101a5674ce595",
          num_refunds: 4,
        },
      });
      return 2;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function brktRefundUpsert_NewYearsEve() {
    try {
      let brktRefund = await prisma.brkt_Refund.upsert({
        where: {
          brkt_entry_id: "ben_3a1eb5eef01d449eb444bfdf6b7d9035",
        },
        update: {
          num_refunds: 2,
        },
        create: {
          brkt_entry_id: "ben_3a1eb5eef01d449eb444bfdf6b7d9035",
          num_refunds: 2,
        },
      });
      brktRefund = await prisma.brkt_Refund.upsert({
        where: {
          brkt_entry_id: "ben_3a2eb5eef01d449eb444bfdf6b7d9035",
        },
        update: {
          num_refunds: 2,
        },
        create: {
          brkt_entry_id: "ben_3a2eb5eef01d449eb444bfdf6b7d9035",
          num_refunds: 2,
        },
      });
      return 2;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  async function brktRefundUpsert_ToDelete() {
    try {
      let brktRefund = await prisma.brkt_Refund.upsert({
        where: {
          brkt_entry_id: "ben_093a0902e01e46dbbe9f111acefc17da",
        },
        update: {
          num_refunds: 2,
        },
        create: {
          brkt_entry_id: "ben_093a0902e01e46dbbe9f111acefc17da",
          num_refunds: 2,
        },
      });
      return 1;
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  try {
    const gpCount = await brktRefundUpsert_GoldPin();
    const wtCount = await brktRefundUpsert_WholeTmnt();
    const nyCount = await brktRefundUpsert_NewYearsEve();
    const delCount = await brktRefundUpsert_ToDelete();

    console.log(
      "Upserted brktRefunds: ",
      gpCount + wtCount + nyCount + delCount
    );
    // console.log("Upserted potEntries: ", delCount);
    // 2 + 2 + 2 + 1 = 7
    return gpCount + wtCount + nyCount + delCount;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function testDateUpsert() {
  try {
    const nowTime = new Date();
    const hrs = nowTime.getHours();
    const min = nowTime.getMinutes();
    const sec = nowTime.getSeconds();
    const gmt1 = new Date("2023-01-01");
    gmt1.setHours(1, 2, 3, 0);
    let testDate = await prisma.testDate.upsert({
      where: {
        id: 1,
      },
      update: {
        // id: 1,
        sod: new Date("2023-01-01"),
        eod: addMilliseconds(addDays(new Date("2023-01-01"), 1), -1),
        gmt: gmt1,
      },
      create: {
        id: 1,
        sod: new Date("2023-01-01"),
        eod: addMilliseconds(addDays(new Date("2023-01-01"), 1), -1),
        gmt: gmt1,
      },
    });
    const gmt2 = new Date("2023-12-31");
    gmt2.setHours(hrs, min, sec, 0);
    testDate = await prisma.testDate.upsert({
      where: {
        id: 2,
      },
      update: {
        // id: 2,
        sod: new Date("2023-12-31"),
        eod: addMilliseconds(addDays(new Date("2023-12-31"), 1), -1),
        gmt: gmt2,
      },
      create: {
        id: 2,
        sod: new Date("2023-12-31"),
        eod: addMilliseconds(addDays(new Date("2023-12-31"), 1), -1),
        gmt: gmt2,
      },
    });
    const gmt3 = new Date("2024-01-01");
    gmt3.setHours(hrs, min, sec, 0);
    testDate = await prisma.testDate.upsert({
      where: {
        id: 3,
      },
      update: {
        // id: 3,
        sod: new Date("2024-01-01"),
        eod: addMilliseconds(addDays(new Date("2024-01-01"), 1), -1),
        gmt: gmt1,
      },
      create: {
        id: 3,
        sod: new Date("2024-01-01"),
        eod: addMilliseconds(addDays(new Date("2024-01-01"), 1), -1),
        gmt: gmt1,
      },
    });

    testDate = await prisma.testDate.upsert({
      where: {
        id: 4,
      },
      update: {
        // id: 4,
        sod: startOfDay("2023-01-01"),
        eod: endOfDay("2023-01-01"),
        gmt: new Date("2023-01-01"),
      },
      create: {
        id: 4,
        sod: startOfDay("2023-01-01"),
        eod: endOfDay("2023-01-01"),
        gmt: new Date("2023-01-01"),
      },
    });
    testDate = await prisma.testDate.upsert({
      where: {
        id: 5,
      },
      update: {
        // id: 5,
        sod: startOfDay("2023-12-31"),
        eod: endOfDay("2023-12-31"),
        gmt: new Date("2023-12-31"),
      },
      create: {
        id: 5,
        sod: startOfDay("2023-12-31"),
        eod: endOfDay("2023-12-31"),
        gmt: new Date("2023-12-31"),
      },
    });
    testDate = await prisma.testDate.upsert({
      where: {
        id: 6,
      },
      update: {
        // id: 6,
        sod: startOfDay("2024-01-01"),
        eod: endOfDay("2024-01-01"),
        gmt: new Date("2024-01-01"),
      },
      create: {
        id: 6,
        sod: startOfDay("2024-01-01"),
        eod: endOfDay("2024-01-01"),
        gmt: new Date("2024-01-01"),
      },
    });

    testDate = await prisma.testDate.upsert({
      where: {
        id: 7,
      },
      update: {
        // id: 7,
        sod: startOfDayFromString("2023-01-01") as Date,
        eod: endOfDayFromString("2023-01-01") as Date,
        gmt: nowOnDayFromString("2023-01-01") as Date,
      },
      create: {
        id: 7,
        sod: startOfDayFromString("2023-01-01") as Date,
        eod: endOfDayFromString("2023-01-01") as Date,
        gmt: nowOnDayFromString("2023-01-01") as Date,
      },
    });
    testDate = await prisma.testDate.upsert({
      where: {
        id: 8,
      },
      update: {
        // id: 8,
        sod: startOfDayFromString("2023-12-31") as Date,
        eod: endOfDayFromString("2023-12-31") as Date,
        gmt: nowOnDayFromString("2023-12-31") as Date,
      },
      create: {
        id: 8,
        sod: startOfDayFromString("2023-12-31") as Date,
        eod: endOfDayFromString("2023-12-31") as Date,
        gmt: nowOnDayFromString("2023-12-31") as Date,
      },
    });
    testDate = await prisma.testDate.upsert({
      where: {
        id: 9,
      },
      update: {
        // id: 9,
        sod: startOfDayFromString("2024-01-01") as Date,
        eod: endOfDayFromString("2024-01-01") as Date,
        gmt: nowOnDayFromString("2024-01-01") as Date,
      },
      create: {
        id: 9,
        sod: startOfDayFromString("2024-01-01") as Date,
        eod: endOfDayFromString("2024-01-01") as Date,
        gmt: nowOnDayFromString("2024-01-01") as Date,
      },
    });

    testDate = await prisma.testDate.upsert({
      where: {
        id: 10,
      },
      update: {
        // id: 10,
        sod: new Date(Date.UTC(2023, 0, 1)),
        eod: new Date(Date.UTC(2023, 0, 1, 23, 59, 59, 999)),
        gmt: new Date(Date.UTC(2023, 0, 1, 1, 2, 3, 0)),
      },
      create: {
        id: 10,
        sod: new Date(Date.UTC(2023, 0, 1)),
        eod: new Date(Date.UTC(2023, 0, 1, 23, 59, 59, 999)),
        gmt: new Date(Date.UTC(2023, 0, 1, 1, 2, 3, 0)),
      },
    });
    testDate = await prisma.testDate.upsert({
      where: {
        id: 11,
      },
      update: {
        // id: 11,
        sod: new Date(Date.UTC(2023, 11, 31)),
        eod: new Date(Date.UTC(2023, 11, 31, 23, 59, 59, 999)),
        gmt: new Date(Date.UTC(2023, 11, 31, 1, 2, 3, 0)),
      },
      create: {
        id: 11,
        sod: new Date(Date.UTC(2023, 11, 31)),
        eod: new Date(Date.UTC(2023, 11, 31, 23, 59, 59, 999)),
        gmt: new Date(Date.UTC(2023, 11, 31, 1, 2, 3, 0)),
      },
    });
    testDate = await prisma.testDate.upsert({
      where: {
        id: 12,
      },
      update: {
        // id: 12,
        sod: new Date(Date.UTC(2024, 0, 1)),
        eod: new Date(Date.UTC(2024, 0, 1, 23, 59, 59, 999)),
        gmt: new Date(Date.UTC(2024, 0, 1, 1, 2, 3, 0)),
      },
      create: {
        id: 12,
        sod: new Date(Date.UTC(2024, 0, 1)),
        eod: new Date(Date.UTC(2024, 0, 1, 23, 59, 59, 999)),
        gmt: new Date(Date.UTC(2024, 0, 1, 1, 2, 3, 0)),
      },
    });
    console.log("Upserted testDate:", 9);
    return 9;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function main() {
  let count = await userUpsert();
  if (count < 0) return;

  count = await bowlUpsert();
  if (count < 0) return;

  count = await tmntUpsert();
  if (count < 0) return;

  count = await eventUpsert();
  if (count < 0) return;

  count = await divUpsert();
  if (count < 0) return;

  count = await squadUpsert();
  if (count < 0) return;

  count = await laneUpsert();
  if (count < 0) return;

  count = await potsUpsert();
  if (count < 0) return;

  count = await brktUpsert();
  if (count < 0) return;

  count = await elimUpsert();
  if (count < 0) return;

  count = await playersUpsert();
  if (count < 0) return;

  count = await divEntryUpsert();
  if (count < 0) return;

  count = await potEntriesUpsert();
  if (count < 0) return;

  count = await brktEntriesUpsert();
  if (count < 0) return;

  count = await oneBrktsUpset();
  if (count < 0) return;

  count = await brktSeedsUpsert()
  if (count < 0) return;

  count = await elimEntriesUpsert();
  if (count < 0) return;

  count = await gamesUpsert();
  if (count < 0) return;

  count = await brktRefundsUpsert();
  if (count < 0) return;

  count = await testDateUpsert();
  if (count < 0) return;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
