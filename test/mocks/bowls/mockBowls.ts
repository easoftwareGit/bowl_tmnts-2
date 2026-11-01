// test/mocks/bowls/mockBowls.ts
import type { Bowl } from "@prisma/client";

// Fixed dates so test results are the same every run
const createdAt = new Date("2025-01-01T00:00:00.000Z");
const updatedAt = new Date("2025-01-01T00:00:00.000Z");

// Same 4 bowls as prisma/seed.ts, sorted by bowl_name
// (the order the database would return them for orderBy bowl_name asc)
export const mockBowls: Bowl[] = [
  {
    id: "bwl_ff4cd62b03f24017beea81c1d6e047e7",
    bowl_name: "Coconut Bowl",
    city: "Sparks",
    state: "NV",
    url: "https://wildisland.com/bowl",
    createdAt,
    updatedAt,
  },
  {
    id: "bwl_91c6f24db58349e8856fe1d919e54b9e",
    bowl_name: "Diablo Lanes",
    city: "Concord",
    state: "CA",
    url: "http://diablolanes.com",
    createdAt,
    updatedAt,
  },
  {
    id: "bwl_561540bd64974da9abdd97765fdb3659",
    bowl_name: "Earl Anthony's Dublin Bowl",
    city: "Dublin",
    state: "CA",
    url: "https://www.earlanthonysdublinbowl.com",
    createdAt,
    updatedAt,
  },
  {
    id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
    bowl_name: "Yosemite Lanes",
    city: "Modesto",
    state: "CA",
    url: "http://yosemitelanes.com",
    createdAt,
    updatedAt,
  },
];