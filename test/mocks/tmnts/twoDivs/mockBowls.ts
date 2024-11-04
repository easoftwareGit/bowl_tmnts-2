// import { bowlType } from "@/lib/types/types";
import { Bowl } from "@prisma/client"
import { initPrismaBowl } from "@/lib/db/initVals"

export const mockBowls: Bowl[] = [
  {
    ...initPrismaBowl,
    id: "bwl_561540bd64974da9abdd97765fdb3659",
    bowl_name: "Earl Anthony's Dublin Bowl",
    city: "Dublin",
    state: "CA",
    url: "https://www.earlanthonysdublinbowl.com/",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    ...initPrismaBowl,
    id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
    bowl_name: "Yosemite Lanes",
    city: "Modesto",
    state: "CA",
    url: "http://yosemitelanes.com/",
    createdAt: new Date(),
    updatedAt: new Date(),
},
]