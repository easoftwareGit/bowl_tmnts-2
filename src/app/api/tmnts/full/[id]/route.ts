import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import type { tmntFullType } from "@/lib/types/types";
import { tmntFullDataForPrisma } from "../../dataForPrisma";
import { getErrorStatus } from "@/app/api/errCodes";
import { sanitizeFullTmnt, validateFullTmnt } from "@/lib/validation/tmnts/full/validate";
import { calcFSA } from "@/lib/currency/fsa";
import { Prisma } from "@prisma/client";


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
    const tmntFullDataPrisma = await prisma.tmnt.findUnique({
      where: { id: id },
      include: {
        bowls: true,   // hosting bowling center
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
                stage: true,
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
            },
            pots: {
              include: {
                pot_entries: true
              },
            },
          },          
        },
      },
    });

    if (!tmntFullDataPrisma) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }        

    // calculate the bracket fsa for each brakcet; bracket fee for each bracket entry
    const tmntFullData = {
      ...tmntFullDataPrisma,
      divs: tmntFullDataPrisma.divs.map((div) => {
        return {
          ...div,
          brkts: div.brkts.map((brkt) => {
            return {
              ...brkt,
              fsa: calcFSA(brkt.first, brkt.second, brkt.admin) + "",
              brkt_entries: brkt.brkt_entries.map((brktEntry) => {
                return {
                  ...brktEntry,
                  fee: (Number(brkt.fee || 0) && brktEntry.num_brackets)
                    ? Number(brkt.fee) * brktEntry.num_brackets
                    : 0,
                };
              }),
            };
          }),
        };
      }),
      events: tmntFullDataPrisma.events.map((event) => {
        return {
          ...event,
          lpox: event.entry_fee
        }
      })
    };

    return NextResponse.json({ tmntFullData }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error getting tmnt full data" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const prismaTmntFullData = tmntFullDataForPrisma(toPut);
    if (!prismaTmntFullData) {
      return NextResponse.json({ error: "invalid tmnt data" }, { status: 404 });
    }
    // brktEntries has 1-1 child data in brktRefunds.         
    // cannot use createMany for brktEntries w/ refunds
    // so split brktEntries into 2 groups: w/o refunds and w/ refunds
    // 1b - filter brktEntries w/o refunds and with refunds
    const beNoRefunds = toPut.brktEntries.filter(
      (brktEntry) => !brktEntry.num_refunds || brktEntry.num_refunds <= 0
    );
    const beYesRefunds = toPut.brktEntries.filter(
      (brktEntry) => brktEntry.num_refunds != null && brktEntry.num_refunds > 0
    );

    // 1c - set stage date 
    const stageDate = new Date();
    const stageDateStr = stageDate.toISOString(); // app sets stage date    
    prismaTmntFullData.stageData.stage_set_at = stageDateStr;

    // Use batch transaction style because all queries are precomputed.
    // No intermediate reads or dependent logic are required.
    // This ensures atomic full replacement of the tournament structure.    
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
      prisma.stage.create({ data: prismaTmntFullData.stageData }),
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
            time_stamp: new Date(be.time_stamp),
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
            time_stamp: new Date(be.time_stamp),
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
  } catch (err: any) { 
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error replacing tmnt data" },
      { status: errStatus }
    );
  }
}