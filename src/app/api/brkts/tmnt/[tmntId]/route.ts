import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";
import { brktType } from "@/lib/types/types";
import { initBrkt } from "@/lib/db/initVals";

// routes /api/brkts/tmnt/:tmntId

export async function GET(
  request: Request,
  { params }: { params: { tmntId: string } }
) {
  try {
    const tmntId = params.tmntId;
    // check if tmntId is a valid tmnt id
    if (!isValidBtDbId(tmntId, "tmt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const prismaBrkts = await prisma.brkt.findMany({
      where: {
        squad_id: {
          in: await prisma.squad.findMany({
            where: {
              event_id: {
                in: await prisma.event.findMany({
                  where: { tmnt_id: tmntId },
                  select: { id: true },
                }).then(events => events.map(event => event.id)),
              }
            },
            select: { id: true },
          }).then(squads => squads.map(squad => squad.id)),
        },
      },
      orderBy:{
        sort_order: 'asc',
      },
    });
    const brkts: brktType[] = prismaBrkts.map(brkt => { 
      return {
        ...initBrkt,
        id: brkt.id,
        div_id: brkt.div_id,
        squad_id: brkt.squad_id,
        start: brkt.start,
        games: brkt.games,
        players: brkt.players,
        fee: brkt.fee + '',
        first: brkt.first + '',
        second: brkt.second + '',
        admin: brkt.admin + '',     
        fsa: Number(brkt.first) + Number(brkt.second) + Number(brkt.admin) + '',
        sort_order: brkt.sort_order
      }
    })
          
    return NextResponse.json({brkts}, {status: 200});
  } catch (err: any) {
    return NextResponse.json({ err: "error getting brkts for tmnt" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { tmntId: string } }
) {
  try {
    const tmntId = params.tmntId;
    // check if tmntId is a valid tmnt id
    if (!isValidBtDbId(tmntId, "tmt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const deleted = await prisma.brkt.deleteMany({
      where: {
        squad_id: {
          in: await prisma.squad.findMany({
            where: {
              event_id: {
                in: await prisma.event.findMany({
                  where: { tmnt_id: tmntId },
                  select: { id: true },
                }).then(events => events.map(event => event.id)),
              } 
            },
            select: { id: true },
          }).then(squads => squads.map(squad => squad.id)),
        },
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { err: "error deleting brkts for tmnt" },
      { status: 500 }
    );
  }
}