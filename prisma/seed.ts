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
    // tmnt to delete
    tmnt = await prisma.tmnt.upsert({
      where: {
        id: "tmt_e134ac14c5234d708d26037ae812ac33",
      },
      update: {
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "Gold Pin",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2025-08-19") as Date,
        end_date: startOfDayFromString("2025-08-19") as Date,
      },
      create: {
        id: "tmt_e134ac14c5234d708d26037ae812ac33",
        user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        tmnt_name: "Gold Pin",
        bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
        start_date: startOfDayFromString("2025-08-19") as Date,
        end_date: startOfDayFromString("2025-08-19") as Date,
      },
    });
    console.log("Upserted tmnts:", 12);
    return 12;
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
        tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        event_name: "Doubles",
        team_size: 2,
        games: 6,
        entry_fee: 160,
        lineage: 26,
        prize_fund: 110,
        other: 4,
        expenses: 10,
        added_money: 0,
        sort_order: 2,
      },
      create: {
        id: "evt_cb55703a8a084acb86306e2944320e8d",
        tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        event_name: "Doubles",
        team_size: 2,
        games: 6,
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
        id: "evt_adfcff4846474a25ad2936aca121bd37",
      },
      update: {
        tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        event_name: "Trios",
        team_size: 3,
        games: 3,
        entry_fee: 160,
        lineage: 36,
        prize_fund: 110,
        other: 4,
        expenses: 10,
        added_money: 0,
        sort_order: 3,
      },
      create: {
        id: "evt_adfcff4846474a25ad2936aca121bd37",
        tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        event_name: "Trios",
        team_size: 3,
        games: 3,
        entry_fee: 160,
        lineage: 36,
        prize_fund: 110,
        other: 4,
        expenses: 10,
        added_money: 0,
        sort_order: 3,
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
        id: "div_24b1cd5dee0542038a1244fc2978e862",
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
        id: "div_24b1cd5dee0542038a1244fc2978e862",
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
        id: "div_fe72ab97edf8407186c8e6df7f7fb741",
      },
      update: {
        tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        div_name: "Hdcp 50+",
        hdcp_per: 0.9,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 3,
      },
      create: {
        id: "div_fe72ab97edf8407186c8e6df7f7fb741",
        tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        div_name: "Hdcp 50+",
        hdcp_per: 0.9,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
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
        tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        div_name: "Women's",
        hdcp_per: 0.9,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 4,
      },
      create: {
        id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
        tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        div_name: "Women's",
        hdcp_per: 0.9,
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 4,
      },
    });
    console.log("Upserted divs:", 9);
    return 9;
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
        id: "sqd_1a6c885ee19a49489960389193e8f819",
      },
      update: {
        event_id: "evt_dadfd0e9c11a4aacb87084f1609a0afd",
        squad_name: "Squad 1",
        squad_date: startOfDayFromString("2022-01-02") as Date,
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
        squad_date: startOfDayFromString("2022-01-02") as Date,
        squad_time: null,
        games: 6,
        lane_count: 24,
        starting_lane: 9,
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
        id: "sqd_3397da1adc014cf58c44e07c19914f71",
      },
      update: {
        event_id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
        squad_name: "Squad 1",
        squad_date: startOfDayFromString("2023-03-01") as Date,
        squad_time: "08:00 AM",
        games: 6,
        lane_count: 24,
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
        lane_count: 24,
        starting_lane: 1,
        sort_order: 1,
      },
    });
    squad = await prisma.squad.upsert({
      where: {
        id: "sqd_20c24199328447f8bbe95c05e1b84644",
      },
      update: {
        event_id: "evt_cb55703a8a084acb86306e2944320e8d",
        squad_name: "Squad 2",
        squad_date: startOfDayFromString("2023-03-01") as Date,
        squad_time: "01:00 PM",
        games: 6,
        lane_count: 24,
        starting_lane: 1,
        sort_order: 1,
      },
      create: {
        id: "sqd_20c24199328447f8bbe95c05e1b84644",
        event_id: "evt_cb55703a8a084acb86306e2944320e8d",
        squad_name: "Squad 2",
        squad_date: startOfDayFromString("2023-03-01") as Date,
        squad_time: "01:00 PM",
        games: 6,
        lane_count: 24,
        starting_lane: 1,
        sort_order: 2,
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
        event_id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
        squad_name: "Squad 3",
        squad_date: startOfDayFromString("2023-09-16") as Date,
        squad_time: "02:00 PM",
        games: 6,
        lane_count: 24,
        starting_lane: 1,
        sort_order: 3,
      },
      create: {
        id: "sqd_3397da1adc014cf58c44e07c19914f72",
        event_id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
        squad_name: "Squad 3",
        squad_date: startOfDayFromString("2023-09-16") as Date,
        squad_time: "02:00 PM",
        games: 6,
        lane_count: 24,
        starting_lane: 1,
        sort_order: 3,
      },
    });
    console.log("Upserted squads:", 10);
    return 10;
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
          squad_id: "sqd_20c24199328447f8bbe95c05e1b84644",
          in_use: true,
        },
        create: {
          id: "lan_255dd3b8755f4dea956445e7a3511d91",
          lane_number: 99,
          squad_id: "sqd_20c24199328447f8bbe95c05e1b84644",
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
    const wtCount = await laneUpsert_WholeTmnt();
    const ntCount = await laneUpsert_NewTmnt();
    const delCount = await laneUpsert_ToDelete();
    console.log(
      "Upserted lanes: ",
      gpCount + yCount + abCount + wtCount + +ntCount + delCount
    );
    // 12 + 24 + 20 + 12 + 12 + 1 = 81
    return gpCount + yCount + abCount + wtCount + +ntCount + delCount;
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
        squad_id: "sqd_20c24199328447f8bbe95c05e1b84644",
        div_id: "div_29b9225d8dd44a4eae276f8bde855729",
        sort_order: 1,
        fee: 20,
        pot_type: "Game",
      },
      create: {
        id: "pot_e3758d99c5494efabb3b0d273cf22e7a",
        squad_id: "sqd_20c24199328447f8bbe95c05e1b84644",
        div_id: "div_29b9225d8dd44a4eae276f8bde855729",
        sort_order: 1,
        fee: 20,
        pot_type: "Game",
      },
    });

    console.log("Upserted pots:", 7);
    return 7;
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
        id: "brk_d537ea07dbc6453a8a705f4bb7599ed4",
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
        id: "brk_d537ea07dbc6453a8a705f4bb7599ed4",
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
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
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
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
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
    console.log("Upserted brackets:", 10);
    return 10;
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
    elim = await prisma.elim.upsert({
      where: {
        id: "elm_c75077494c2d4d9da166d697c08c28d2",
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
        id: "elm_c75077494c2d4d9da166d697c08c28d2",
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
        div_id: "div_578834e04e5e4885bbae79229d8b96e8",
        sort_order: 1,
        start: 1,
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
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 3,
        start: 3,
        games: 4,
        fee: 10,
      },
      create: {
        id: "elm_4c5aad9baa7246c19e07f215561e58c4",
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 3,
        start: 3,
        games: 4,
        fee: 10,
      },
    });

    console.log("Upserted eliminators:", 10);
    return 10;
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
          lane: 2,
          position: "C",
        },
        create: {
          id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "Olivia",
          last_name: "Morgan",
          average: 210,
          lane: 2,
          position: "C",
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
          position: "D",
        },
        create: {
          id: "ply_8b0fd8bbd9e34d34a7fa90b4111c6e40",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "William",
          last_name: "Harris",
          average: 211,
          lane: 2,
          position: "D",
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
          average: 211,
          lane: 2,
          position: "E",
        },
        create: {
          id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          first_name: "John",
          last_name: "Dope",
          average: 219,
          lane: 2,
          position: "E",
        },
      });
      return 5;
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
          first_name: "Liam",
          last_name: "Miller",
          average: 202,
          lane: 32,
          position: "F",
        },
        create: {
          id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Liam",
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
          first_name: "Isabella",
          last_name: "Davis",
          average: 209,
          lane: 33,
          position: "A",
        },
        create: {
          id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Isabella",
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
          first_name: "Oliver",
          last_name: "Smith",
          average: 215,
          lane: 33,
          position: "A",
        },
        create: {
          id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Oliver",
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
          first_name: "Emma",
          last_name: "Johnson",
          average: 220,
          lane: 33,
          position: "B",
        },
        create: {
          id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Emma",
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
          first_name: "Liam",
          last_name: "Brown",
          average: 210,
          lane: 33,
          position: "C",
        },
        create: {
          id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Liam",
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
          first_name: "Ava",
          last_name: "Williams",
          average: 192,
          lane: 34,
          position: "D",
        },
        create: {
          id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Ava",
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
          first_name: "Sophia",
          last_name: "Jones",
          average: 198,
          lane: 34,
          position: "E",
        },
        create: {
          id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Sophia",
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
          first_name: "Mason",
          last_name: "Garcia",
          average: 204,
          lane: 34,
          position: "F",
        },
        create: {
          id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Mason",
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
          first_name: "Oliver",
          last_name: "Smith",
          average: 215,
          lane: 35,
          position: "A",
        },
        create: {
          id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Oliver",
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
          first_name: "Emma",
          last_name: "Johnson",
          average: 220,
          lane: 35,
          position: "B",
        },
        create: {
          id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Emma",
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
          first_name: "Liam",
          last_name: "Brown",
          average: 210,
          lane: 35,
          position: "C",
        },
        create: {
          id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Liam",
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
          first_name: "Ava",
          last_name: "Williams",
          average: 192,
          lane: 36,
          position: "D",
        },
        create: {
          id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Ava",
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
          first_name: "Sophia",
          last_name: "Jones",
          average: 198,
          lane: 36,
          position: "E",
        },
        create: {
          id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Sophia",
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
          first_name: "Mason",
          last_name: "Garcia",
          average: 204,
          lane: 36,
          position: "F",
        },
        create: {
          id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Mason",
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
          first_name: "Mia",
          last_name: "Martinez",
          average: 210,
          lane: 37,
          position: "A",
        },
        create: {
          id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Mia",
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
          first_name: "Emily",
          last_name: "Smith",
          average: 216,
          lane: 37,
          position: "B",
        },
        create: {
          id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Emily",
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
          first_name: "James",
          last_name: "Brown",
          average: 210,
          lane: 37,
          position: "C",
        },
        create: {
          id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "James",
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
          first_name: "Sophia",
          last_name: "Johnson",
          average: 214,
          lane: 38,
          position: "D",
        },
        create: {
          id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Sophia",
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
          first_name: "Liam",
          last_name: "Williams",
          average: 218,
          lane: 38,
          position: "E",
        },
        create: {
          id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Liam",
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
          first_name: "Ava",
          last_name: "Davis",
          average: 217,
          lane: 38,
          position: "F",
        },
        create: {
          id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Ava",
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
          first_name: "Mason",
          last_name: "Garcia",
          average: 219,
          lane: 39,
          position: "A",
        },
        create: {
          id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Mason",
          last_name: "Garcia",
          average: 219,
          lane: 39,
          position: "A",
        },
      });
      player = await prisma.player.upsert({
        where: {
          id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
        },
        update: {
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Mason",
          last_name: "Garcia",
          average: 213,
          lane: 39,
          position: "A",
        },
        create: {
          id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Mason",
          last_name: "Garcia",
          average: 213,
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
          first_name: "Emily",
          last_name: "Smith",
          average: 216,
          lane: 39,
          position: "B",
        },
        create: {
          id: "ply_a32758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Emily",
          last_name: "Smith",
          average: 216,
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
          first_name: "James",
          last_name: "Brown",
          average: 210,
          lane: 39,
          position: "C",
        },
        create: {
          id: "ply_a33758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "James",
          last_name: "Brown",
          average: 210,
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
          first_name: "Sophia",
          last_name: "Johnson",
          average: 214,
          lane: 40,
          position: "D",
        },
        create: {
          id: "ply_a34758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Sophia",
          last_name: "Johnson",
          average: 214,
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
          first_name: "Liam",
          last_name: "Williams",
          average: 218,
          lane: 40,
          position: "E",
        },
        create: {
          id: "ply_a35758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Liam",
          last_name: "Williams",
          average: 218,
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
          first_name: "Ava",
          last_name: "Davis",
          average: 217,
          lane: 40,
          position: "F",
        },
        create: {
          id: "ply_a36758cff1cc4bab9d9133e661bd49b0",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          first_name: "Ava",
          last_name: "Davis",
          average: 217,
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
    const delCount = await playersUpsert_ToDelete();
    console.log("Upserted players: ", gpCount + wtCount + delCount);
    // 5 + 36 + 1 = 42
    return gpCount + wtCount + delCount;
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
          fee: 80,
        },
        create: {
          id: "den_a01631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a02631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a03631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a04631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a05631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a06631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a07631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a08631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a09631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a10631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a11631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a12631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a13631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a14631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a15631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a16631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a17631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a18631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a19631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a20631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a21631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a21758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a22631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a22758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a23631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a23758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a24631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a24758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a25631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a25758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a26631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a26758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a27631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a27758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a28631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a28758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a29631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a29758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a30631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a30758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a31631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a31758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a32631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a32758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a33631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a33758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a34631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a34758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a35631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a35758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
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
          fee: 80,
        },
        create: {
          id: "den_a36631c1c94d4627bde16fad72e5e5d4",
          squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
          div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
          player_id: "ply_a36758cff1cc4bab9d9133e661bd49b0",
          fee: 80,
        },
      });
      return 36;
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
          squad_id: "sqd_20c24199328447f8bbe95c05e1b84644",
          div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
          player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
          fee: 80,
        },
        create: {
          id: "den_a55c6cd27d1b482aa0ff248d5fb496ed",
          squad_id: "sqd_20c24199328447f8bbe95c05e1b84644",
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
    const delCount = await divEntriesUpsert_ToDelete();
    console.log("Upserted DivEntries: ", gpCount + wtCount + delCount);
    // 4 + 36 + 1 = 41
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
    const delCount = await potEntryUpsert_ToDelete();
    console.log("Upserted potEntries: ", gpCount + wtCount + delCount);
    // 4 + 30 + 1 = 35
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
          fee: 40,
        },
        create: {
          id: "ben_bc4c581d7b1c4fc99dbdbd46f4f7210a",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          num_brackets: 8,
          fee: 40,
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
          fee: 40,
        },
        create: {
          id: "ben_8f039ee00dfa445c9e3aee0ca9a6391b",
          brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          num_brackets: 8,
          fee: 40,
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
          fee: 40,
        },
        create: {
          id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          num_brackets: 8,
          fee: 40,
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
          fee: 40,
        },
        create: {
          id: "ben_0a6938d0a5b94dd789bd3b8663d1ee53",
          brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          num_brackets: 8,
          fee: 40,
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
          fee: 50,
        },
        create: {
          id: "ben_c0126ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 10,
          fee: 50,
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
          fee: 50,
        },
        create: {
          id: "ben_c0226ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 10,
          fee: 50,
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
          fee: 40,
        },
        create: {
          id: "ben_c0326ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 8,
          fee: 40,
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
          fee: 40,
        },
        create: {
          id: "ben_c0426ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a02758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 8,
          fee: 40,
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
          fee: 30,
        },
        create: {
          id: "ben_c0526ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
          fee: 30,
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
          fee: 30,
        },
        create: {
          id: "ben_c0626ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a03758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
          fee: 30,
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
          fee: 35,
        },
        create: {
          id: "ben_c0726ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 7,
          fee: 35,
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
          fee: 35,
        },
        create: {
          id: "ben_c0826ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a04758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 7,
          fee: 35,
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
          fee: 30,
        },
        create: {
          id: "ben_c0926ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
          fee: 30,
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
          fee: 30,
        },
        create: {
          id: "ben_c1026ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a05758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
          fee: 30,
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
          fee: 20,
        },
        create: {
          id: "ben_c1126ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 4,
          fee: 20,
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
          fee: 20,
        },
        create: {
          id: "ben_c1226ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a06758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 4,
          fee: 20,
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
          fee: 30,
        },
        create: {
          id: "ben_c1326ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
          player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
          fee: 30,
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
          fee: 30,
        },
        create: {
          id: "ben_c1426ba58d3f4a7d950101a5674ce595",
          brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
          player_id: "ply_a07758cff1cc4bab9d9133e661bd49b0",
          num_brackets: 6,
          fee: 30,
        },
      });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c1526ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 9,
      //     fee: 45,
      //   },
      //   create: {
      //     id: "ben_c1526ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 9,
      //     fee: 45,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c1626ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 9,
      //     fee: 45,
      //   },
      //   create: {
      //     id: "ben_c1626ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a08758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 9,
      //     fee: 45,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c1726ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 6,
      //     fee: 30,
      //   },
      //   create: {
      //     id: "ben_c1726ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 6,
      //     fee: 30,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c1826ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 6,
      //     fee: 30,
      //   },
      //   create: {
      //     id: "ben_c1826ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a09758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 6,
      //     fee: 30,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c1926ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 3,
      //     fee: 15,
      //   },
      //   create: {
      //     id: "ben_c1926ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 3,
      //     fee: 15,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c2026ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 3,
      //     fee: 15,
      //   },
      //   create: {
      //     id: "ben_c2026ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a10758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 3,
      //     fee: 15,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c2126ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 10,
      //     fee: 50,
      //   },
      //   create: {
      //     id: "ben_c2126ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 10,
      //     fee: 50,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c2226ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 10,
      //     fee: 50,
      //   },
      //   create: {
      //     id: "ben_c2226ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a11758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 10,
      //     fee: 50,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c2326ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 2,
      //     fee: 10,
      //   },
      //   create: {
      //     id: "ben_c2326ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 2,
      //     fee: 10,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c2426ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 2,
      //     fee: 10,
      //   },
      //   create: {
      //     id: "ben_c2426ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a12758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 2,
      //     fee: 10,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c2526ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 6,
      //     fee: 30,
      //   },
      //   create: {
      //     id: "ben_c2526ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 6,
      //     fee: 30,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c2626ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 6,
      //     fee: 30,
      //   },
      //   create: {
      //     id: "ben_c2626ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a13758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 6,
      //     fee: 30,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c2726ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 9,
      //     fee: 45,
      //   },
      //   create: {
      //     id: "ben_c2726ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 9,
      //     fee: 45,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c2826ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 9,
      //     fee: 45,
      //   },
      //   create: {
      //     id: "ben_c2826ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a14758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 9,
      //     fee: 45,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c2926ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 3,
      //     fee: 15,
      //   },
      //   create: {
      //     id: "ben_c2926ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 3,
      //     fee: 15,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c3026ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 3,
      //     fee: 15,
      //   },
      //   create: {
      //     id: "ben_c3026ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a15758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 3,
      //     fee: 15,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c3126ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 7,
      //     fee: 35,
      //   },
      //   create: {
      //     id: "ben_c3126ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 7,
      //     fee: 35,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c3226ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 7,
      //     fee: 35,
      //   },
      //   create: {
      //     id: "ben_c3226ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a16758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 7,
      //     fee: 35,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c3326ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 4,
      //     fee: 20,
      //   },
      //   create: {
      //     id: "ben_c3326ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 4,
      //     fee: 20,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c3426ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 4,
      //     fee: 20,
      //   },
      //   create: {
      //     id: "ben_c3426ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a17758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 4,
      //     fee: 20,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c3526ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 9,
      //     fee: 45,
      //   },
      //   create: {
      //     id: "ben_c3526ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 9,
      //     fee: 45,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c3626ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 9,
      //     fee: 45,
      //   },
      //   create: {
      //     id: "ben_c3626ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a18758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 9,
      //     fee: 45,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c3726ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 6,
      //     fee: 30,
      //   },
      //   create: {
      //     id: "ben_c3726ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 6,
      //     fee: 30,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c3826ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 6,
      //     fee: 30,
      //   },
      //   create: {
      //     id: "ben_c3826ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a19758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 6,
      //     fee: 30,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c3926ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 2,
      //     fee: 10,
      //   },
      //   create: {
      //     id: "ben_c3926ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      //     player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 2,
      //     fee: 10,
      //   },
      // });
      // brktEntry = await prisma.brkt_Entry.upsert({
      //   where: {
      //     id: "ben_c4026ba58d3f4a7d950101a5674ce595",
      //   },
      //   update: {
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 2,
      //     fee: 10,
      //   },
      //   create: {
      //     id: "ben_c4026ba58d3f4a7d950101a5674ce595",
      //     brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      //     player_id: "ply_a20758cff1cc4bab9d9133e661bd49b0",
      //     num_brackets: 2,
      //     fee: 10,
      //   },
      // });

      return 40;
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
          brkt_id: "brk_d537ea07dbc6453a8a705f4bb7599ed4",
          player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
          num_brackets: 8,
          fee: 40,
        },
        create: {
          id: "ben_093a0902e01e46dbbe9f111acefc17da",
          brkt_id: "brk_d537ea07dbc6453a8a705f4bb7599ed4",
          player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
          num_brackets: 8,
          fee: 40,
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
    const delCount = await brktEntryUpsert_ToDelete();
    console.log("Upserted potEntries: ", gpCount + wtCount + delCount);
    // 4 + 40 + 1 = 45
    return gpCount + wtCount + delCount;
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
          elim_id: "elm_c75077494c2d4d9da166d697c08c28d2",
          player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
          fee: 5,
        },
        create: {
          id: "een_19f158c6cc0d4f619227fbc24a885bab",
          elim_id: "elm_c75077494c2d4d9da166d697c08c28d2",
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
    const wtCount = await brktEntryUpsert_WholeTmnt();
    const delCount = await brktEntryUpsert_ToDelete();
    console.log("Upserted potEntries: ", gpCount + wtCount + delCount);
    // 4 + 32 + 1 = 37
    return gpCount + wtCount + delCount;
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

  count = await elimEntriesUpsert();
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
