import { Bowl } from "@prisma/client";

export const mockStateBowls: Bowl[] = [  
  {
    id: "bwl_ff4cd62b03f24017beea81c1d6e047e7",
    bowl_name: "Coconut Bowl",
    city: "Sparks",
    state: "NV",
    url: "https://wildisland.com/bowl",
    createdAt: new Date(),
    updatedAt: new Date(),
  },    
  {
    id: "bwl_91c6f24db58349e8856fe1d919e54b9e",
    bowl_name: "Diablo Lanes",
    city: "Concord",
    state: "CA",
    url: "http://diablolanes.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "bwl_561540bd64974da9abdd97765fdb3659",
    bowl_name: "Earl Anthony's Dublin Bowl",
    city: "Dublin",
    state: "CA",
    url: "https://www.earlanthonysdublinbowl.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
    bowl_name: "Yosemite Lanes",
    city: "Modesto",
    state: "CA",
    url: "http://yosemitelanes.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]
