import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { tmntFullType } from "@/lib/types/types";
import { tmntFullDataForPrisma } from "../../dataForPrisma";
import { getErrorStatus } from "@/app/api/errCodes";
import { validateFullTmnt } from "../validate";

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
                }
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

    // calculate the bracket fee for each bracket entry
    const tmntFullData = {
      ...tmntFullDataPrisma,
      divs: tmntFullDataPrisma.divs.map((div) => {
        return {
          ...div,
          brkts: div.brkts.map((brkt) => {
            return {
              ...brkt,
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
    // validate tmnt full data
    const validationResult = validateFullTmnt(tmntFullData);
    if (validationResult.errorCode !== ErrorCode.None || id !== tmntFullData.tmnt.id) {
      return NextResponse.json(
        { error: "validation failed", details: validationResult },
        { status: 422 }
      );
    };    

    // run replace - delete/create many in one transaction
    const result = await prisma.$transaction(async (tx) => { 
      // 1 - delete parent tmnt, deletes all tmnt children, grandchildren...
      await tx.tmnt.deleteMany({
        where: {
          id: id,
        },
      });          

      // 2 - convert tmntData to prisma data
      const prismaTmntFullData = tmntFullDataForPrisma(tmntFullData);
      if (!prismaTmntFullData) {
        return NextResponse.json({ error: "invalid tmnt data" }, { status: 404 });
      }
      
      // 3 - replace all tmnt data, child and grandchild tables in correct order
      // 3a - required parent table
      await tx.tmnt.create({ data: prismaTmntFullData.tmntData }); // parent
      // 3b - required child tables
      await tx.event.createMany({ data: prismaTmntFullData.eventsData });
      await tx.div.createMany({ data: prismaTmntFullData.divsData });
      await tx.squad.createMany({ data: prismaTmntFullData.squadsData });
      await tx.lane.createMany({ data: prismaTmntFullData.lanesData });      

      // 3c - optional child tables - user creates/edits a tmnt
      await tx.pot.createMany({ data: prismaTmntFullData.potsData });
      await tx.brkt.createMany({ data: prismaTmntFullData.brktsData });
      await tx.elim.createMany({ data: prismaTmntFullData.elimsData });

      // 3d - optional grandchild tables - user adds players to tmnt
      await tx.player.createMany({ data: prismaTmntFullData.playersData });
      await tx.div_Entry.createMany({ data: prismaTmntFullData.divEntriesData });
      await tx.pot_Entry.createMany({ data: prismaTmntFullData.potEntriesData });
      await tx.elim_Entry.createMany({ data: prismaTmntFullData.elimEntriesData });
      // brktEntries has 1-1 child data in brktRefunds.         
      // cannot use createMany for brktEntries w/ refunds
      // so split brktEntries into 2 groups: w/o refunds and w/ refunds
      // 3d1 - filter brktEntries w/o refunds and with refunds
      const beNoRefunds = tmntFullData.brktEntries.filter(
        (brktEntry) => !brktEntry.num_refunds || brktEntry.num_refunds <= 0
      );
      const beYesRefunds = tmntFullData.brktEntries.filter(
        (brktEntry) => brktEntry.num_refunds != null && brktEntry.num_refunds > 0
      );
      // 3d2 - create brktEntries w/o refunds
      await tx.brkt_Entry.createMany({  
        data: beNoRefunds.map((be) => ({
          id: be.id,
          brkt_id: be.brkt_id,
          player_id: be.player_id,
          num_brackets: be.num_brackets,
          time_stamp: new Date(be.time_stamp), // Convert to Date object
        })),
      });
      // 3d3 - create brktEntries w/ refunds
      for (const be of beYesRefunds) {
        await tx.brkt_Entry.create({
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
        });
      };      
      await tx.one_Brkt.createMany({ data: prismaTmntFullData.oneBrktsData });        
      await tx.brkt_Seed.createMany({ data: prismaTmntFullData.brktSeedsData });
      
      return {success: true}; 
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) { 
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error replacing tmnt data" },
      { status: errStatus }
    );
  }
}