import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import type { tmntFullType } from "@/lib/types/types";
import { tmntFullDataForPrisma } from "../../tmntDataForPrisma";
import { standardCatchReturn } from "@/app/api/apiCatch";
import { sanitizeFullTmnt, validateFullTmnt } from "@/lib/validation/tmnts/full/validate";
import { Prisma } from "@prisma/client";
import { requireDirector } from "@/lib/auth/guards";

// routes /api/tmnts/full/:id

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "tmt")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    // perform prisma query here
    const tmntFullData = await prisma.tmnt.findUnique({
      where: { id: id },
      include: {
        bowl: true,   // hosting bowling center
        events: {
          include: {
            squads: {
              include: {
                lanes: {
                  orderBy: {
                    lane_number: "asc", // sort lanes ascending
                  },
                },
                players: {
                  orderBy: [
                    {
                      squad_id: 'asc',
                    },
                    {
                      lane: 'asc',
                    },
                    {
                      position: 'asc',
                    },
                  ],
                },
                moneys: {
                  orderBy: {
                    sort_order: "asc",
                  },
                },
                stage: true,
              },
              orderBy: {
                sort_order: "asc",
              },
            },
          },
        },
        divs: {
          include: {
            brkts: {
              include: {
                brkt_entries: {
                  include: {
                    brkt_refunds: true,
                  },
                },
                one_brkts: {
                  include: {
                    brkt_seeds: true,
                  },
                }
              },
              orderBy: {
                sort_order: "asc",
              },
            },
            div_entries: {
              select: {
                id: true,
                squad_id: true,
                div_id: true,
                player_id: true,
                fee: true,
                player: {
                  select: {
                    average: true,
                  },
                },
                div: {
                  select: {
                    hdcp_from: true,
                    int_hdcp: true,
                    hdcp_per: true,
                  },
                },
              },
            },
            elims: {
              include: {
                elim_entries: true
              },
              orderBy: {
                sort_order: "asc", // sort elims ascending
              },
            },
            pots: {
              include: {
                pot_entries: true
              },
              orderBy: {
                sort_order: "asc", // sort pots ascending
              },
            },
          },
          orderBy: {
            sort_order: "asc", // sort divs ascending
          },
        },
      },
    });

    if (!tmntFullData) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ tmntFullData }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting tmnt full data");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // only admin and super admins can put a tournament
  const authError = await requireDirector();
  if (authError) return authError;

  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "tmt")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const tmntFullData: tmntFullType = await request.json();

    const toPut = sanitizeFullTmnt(tmntFullData);
    // validate tmnt full data
    const validationResult = validateFullTmnt(toPut);
    if (validationResult.errorCode !== ErrorCode.NONE || id !== toPut.tmnt.id) {
      return NextResponse.json(
        { error: "validation failed", details: validationResult },
        { status: 422 }
      );
    };

    // 1 - prepare data before sending to prisma
    // 1a - convert tmntData to prisma data
    const converted = tmntFullDataForPrisma(toPut);
    if (!converted.ok) {
      // validation passed but conversion failed: the details say which row
      return NextResponse.json(
        { error: "invalid tmnt data", details: converted.error },
        { status: 422 }
      );
    }
    const prismaTmntFullData = converted.data;

    // brktEntries has 1-1 child data in brktRefunds.
    // cannot use createMany for brktEntries w/ refunds
    // so split brktEntries into 2 groups: w/o refunds and w/ refunds
    // 1b - filter brktEntries w/o refunds and with refunds
    // use the converted entries: their time_stamp is already a checked Date
    const beNoRefunds = prismaTmntFullData.brktEntriesData.filter(
      (brktEntry) => !brktEntry.num_refunds || brktEntry.num_refunds <= 0
    );
    const beYesRefunds = prismaTmntFullData.brktEntriesData.filter(
      (brktEntry) => brktEntry.num_refunds != null && brktEntry.num_refunds > 0
    );

    // 1c - preserve existing stage rows (stage is managed independently;
    //      this route only carries them through the delete/recreate)
    const squadIds = prismaTmntFullData.squadsData.map((s) => s.id);
    const existingStages = await prisma.stage.findMany({
      where: { squad_id: { in: squadIds } },
    });

    // Batch transaction: all writes are precomputed (stages are read
    // beforehand in 1c). Ensures atomic full replacement of the tmnt.
    const queries: Prisma.PrismaPromise<unknown>[] = [];
    queries.push(
      // 2 - delete parent tmnt, deletes all tmnt children, grandchildren...
      prisma.tmnt.deleteMany({ where: { id: id } }),

      // 3 - replace all tmnt data, child and grandchild tables in correct order
      // 3a - required parent table
      prisma.tmnt.create({ data: prismaTmntFullData.tmntData }),

      // 3b - required child tables
      prisma.event.createMany({ data: prismaTmntFullData.eventsData }),
      prisma.div.createMany({ data: prismaTmntFullData.divsData }),
      prisma.squad.createMany({ data: prismaTmntFullData.squadsData }),
      // restore stages unchanged (empty for a new tmnt)
      prisma.stage.createMany({ data: existingStages }),
      prisma.lane.createMany({ data: prismaTmntFullData.lanesData }),

      // 3c - optional child tables - user creates/edits a tmnt
      prisma.pot.createMany({ data: prismaTmntFullData.potsData }),
      prisma.brkt.createMany({ data: prismaTmntFullData.brktsData }),
      prisma.elim.createMany({ data: prismaTmntFullData.elimsData }),

      // 3d - optional child tables - from player entries
      prisma.player.createMany({ data: prismaTmntFullData.playersData }),
      prisma.div_Entry.createMany({ data: prismaTmntFullData.divEntriesData }),
      prisma.pot_Entry.createMany({ data: prismaTmntFullData.potEntriesData }),
      prisma.elim_Entry.createMany({ data: prismaTmntFullData.elimEntriesData }),
      prisma.money.createMany({ data: prismaTmntFullData.moneysData }),
    );
    // 3e1 - brktEntries w/o refunds
    if (beNoRefunds.length > 0) {
      queries.push(
        prisma.brkt_Entry.createMany({
          data: beNoRefunds.map((be) => ({
            id: be.id,
            brkt_id: be.brkt_id,
            player_id: be.player_id,
            num_brackets: be.num_brackets,
            time_stamp: be.time_stamp,
          })),
        })
      );
    };
    // 3e2 - brktEntries w/ refunds
    for (const be of beYesRefunds) {
      queries.push(
        prisma.brkt_Entry.create({
          data: {
            id: be.id,
            brkt_id: be.brkt_id,
            player_id: be.player_id,
            num_brackets: be.num_brackets,
            time_stamp: be.time_stamp,
            brkt_refunds: {
              create: {
                num_refunds: be.num_refunds!,
              },
            },
          },
          include: { brkt_refunds: true },
        })
      );
    };
    // 3f - brkts and seeds
    queries.push(
      prisma.one_Brkt.createMany({ data: prismaTmntFullData.oneBrktsData }),
      prisma.brkt_Seed.createMany({ data: prismaTmntFullData.brktSeedsData })
    );

    // 4 - run queries
    await prisma.$transaction(queries);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "Error replacing tmnt data");
  }
}

// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"; 
// import { isValidBtDbId } from "@/lib/validation/validation";
// import { ErrorCode } from "@/lib/enums/enums";
// import type { tmntFullType } from "@/lib/types/types";
// import { tmntFullDataForPrisma } from "../../tmntDataForPrisma";
// import { standardCatchReturn } from "@/app/api/apiCatch";
// import { sanitizeFullTmnt, validateFullTmnt } from "@/lib/validation/tmnts/full/validate";
// import { Prisma } from "@prisma/client";
// import { requireDirector } from "@/lib/auth/requireDirector";

// // routes /api/tmnts/full/:id

// export async function GET(
//   request: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) { 

//   try {
//     const { id } = await params;
//     if (!isValidBtDbId(id, "tmt")) {
//       return NextResponse.json({ error: "invalid request" }, { status: 404 });
//     }

//     // perform prisma query here
//     const tmntFullData = await prisma.tmnt.findUnique({
//       where: { id: id },
//       include: {
//         bowl: true,   // hosting bowling center
//         events: {
//           include: {
//             squads: {
//               include: {
//                 lanes: {
//                   orderBy: {
//                     lane_number: "asc", // sort lanes ascending
//                   },
//                 },
//                 players: {
//                   orderBy: [
//                     {
//                       squad_id: 'asc',
//                     },
//                     {
//                       lane: 'asc',
//                     },
//                     {
//                       position: 'asc',
//                     },
//                   ],
//                 },
//                 moneys: {
//                   orderBy: {
//                     sort_order: "asc",
//                   },
//                 },
//                 stage: true,                
//               },
//               orderBy: {
//                 sort_order: "asc",
//               },
//             },
//           },
//         },
//         divs: {
//           include: {
//             brkts: {
//               include: {
//                 brkt_entries: {
//                   include: {
//                     brkt_refunds: true,
//                   },
//                 },                  
//                 one_brkts: {
//                   include: {
//                     brkt_seeds: true,
//                   },
//                 }                
//               },
//               orderBy: {
//                 sort_order: "asc",
//               },
//             },
//             div_entries: {
//               select: {
//                 id: true,
//                 squad_id: true,
//                 div_id: true,
//                 player_id: true,
//                 fee: true,
//                 player: {
//                   select: {
//                     average: true,
//                   },
//                 },
//                 div: {
//                   select: {
//                     hdcp_from: true,
//                     int_hdcp: true,
//                     hdcp_per: true,                     
//                   },
//                 },        
//               },
//             },
//             elims: {
//               include: {
//                 elim_entries: true
//               },
//               orderBy: {
//                 sort_order: "asc", // sort elims ascending
//               },
//             },
//             pots: {
//               include: {
//                 pot_entries: true
//               },
//               orderBy: {
//                 sort_order: "asc", // sort pots ascending
//               },
//             },
//           },
//           orderBy: {
//             sort_order: "asc", // sort divs ascending
//           },
//         },
//       },
//     });

//     if (!tmntFullData) {
//       return NextResponse.json({ error: "not found" }, { status: 404 });
//     }        
//     return NextResponse.json({ tmntFullData }, { status: 200 });
//   } catch (error) {
//     return standardCatchReturn(error, "error getting tmnt full data");
//   }
// }

// export async function PUT(
//   request: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   // only admin and super admins can put a tournament
//   const authError = await requireDirector();
//   if (authError) return authError;  

//   try { 
//     const { id } = await params;
//     if (!isValidBtDbId(id, "tmt")) {
//       return NextResponse.json({ error: "invalid request" }, { status: 404 });
//     }
//     const tmntFullData: tmntFullType = await request.json();

//     const toPut = sanitizeFullTmnt(tmntFullData);        
//     // validate tmnt full data
//     const validationResult = validateFullTmnt(toPut);    
//     if (validationResult.errorCode !== ErrorCode.NONE || id !== toPut.tmnt.id) {
//       return NextResponse.json(
//         { error: "validation failed", details: validationResult },
//         { status: 422 }
//       );
//     };    

//     // 1 - prepare data before sending to prisma
//     // 1a - convert tmntData to prisma data
//     const prismaTmntFullData = tmntFullDataForPrisma(toPut);
//     if (!prismaTmntFullData) {
//       return NextResponse.json({ error: "invalid tmnt data" }, { status: 404 });
//     }
//     // brktEntries has 1-1 child data in brktRefunds.         
//     // cannot use createMany for brktEntries w/ refunds
//     // so split brktEntries into 2 groups: w/o refunds and w/ refunds
//     // 1b - filter brktEntries w/o refunds and with refunds
//     const beNoRefunds = toPut.brktEntries.filter(
//       (brktEntry) => !brktEntry.num_refunds || brktEntry.num_refunds <= 0
//     );
//     const beYesRefunds = toPut.brktEntries.filter(
//       (brktEntry) => brktEntry.num_refunds != null && brktEntry.num_refunds > 0
//     );

//     // // 1c - set stage date 
//     // const stageDate = new Date();
//     // const stageDateStr = stageDate.toISOString(); // app sets stage date    
//     // prismaTmntFullData.stageData.stage_set_at = stageDateStr;
    
//     // 1c - preserve existing stage rows (stage is managed independently;
//     //      this route only carries them through the delete/recreate)
//     const squadIds = prismaTmntFullData.squadsData.map((s) => s.id);
//     const existingStages = await prisma.stage.findMany({
//       where: { squad_id: { in: squadIds } },
//     });    

//     // Batch transaction: all writes are precomputed (stages are read
//     // beforehand in 1c). Ensures atomic full replacement of the tmnt.  
//     const queries: Prisma.PrismaPromise<unknown>[] = [];
//     queries.push(
//       // 2 - delete parent tmnt, deletes all tmnt children, grandchildren...      
//       prisma.tmnt.deleteMany({ where: { id: id } }),

//       // 3 - replace all tmnt data, child and grandchild tables in correct order
//       // 3a - required parent table
//       prisma.tmnt.create({ data: prismaTmntFullData.tmntData }),

//       // 3b - required child tables
//       prisma.event.createMany({ data: prismaTmntFullData.eventsData }),
//       prisma.div.createMany({ data: prismaTmntFullData.divsData }),
//       prisma.squad.createMany({ data: prismaTmntFullData.squadsData }),
//       // restore stages unchanged (empty for a new tmnt)
//       prisma.stage.createMany({ data: existingStages }),
//       prisma.lane.createMany({ data: prismaTmntFullData.lanesData }),  

//       // 3c - optional child tables - user creates/edits a tmnt
//       prisma.pot.createMany({ data: prismaTmntFullData.potsData }),
//       prisma.brkt.createMany({ data: prismaTmntFullData.brktsData }),
//       prisma.elim.createMany({ data: prismaTmntFullData.elimsData }),

//       // 3d - optional child tables - from player entries
//       prisma.player.createMany({ data: prismaTmntFullData.playersData }),
//       prisma.div_Entry.createMany({ data: prismaTmntFullData.divEntriesData }),
//       prisma.pot_Entry.createMany({ data: prismaTmntFullData.potEntriesData }),      
//       prisma.elim_Entry.createMany({ data: prismaTmntFullData.elimEntriesData }),  
//       prisma.money.createMany({ data: prismaTmntFullData.moneysData }),
//     );
//     // 3e1 - brktEntries w/o refunds
//     if (beNoRefunds.length > 0) {
//       queries.push(
//         prisma.brkt_Entry.createMany({
//           data: beNoRefunds.map((be) => ({
//             id: be.id,
//             brkt_id: be.brkt_id,
//             player_id: be.player_id,
//             num_brackets: be.num_brackets,
//             time_stamp: new Date(be.time_stamp),
//           })),
//         })
//       );
//     };
//     // 3e2 - brktEntries w/ refunds
//     for (const be of beYesRefunds) {
//       queries.push(
//         prisma.brkt_Entry.create({
//           data: {
//             id: be.id,
//             brkt_id: be.brkt_id,
//             player_id: be.player_id,
//             num_brackets: be.num_brackets,
//             time_stamp: new Date(be.time_stamp),
//             brkt_refunds: {
//               create: {
//                 num_refunds: be.num_refunds!,
//               },
//             },
//           },
//           include: { brkt_refunds: true },
//         })        
//       );
//     };
//     // 3f - brkts and seeds
//     queries.push(
//       prisma.one_Brkt.createMany({ data: prismaTmntFullData.oneBrktsData }),
//       prisma.brkt_Seed.createMany({ data: prismaTmntFullData.brktSeedsData })
//     );

//     // 4 - run queries
//     await prisma.$transaction(queries);

//     return NextResponse.json({ success: true }, { status: 200 });    
//   } catch (error) { 
//     return standardCatchReturn(error, "Error replacing tmnt data");
//   }
// }