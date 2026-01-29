import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { calcFSA } from "@/lib/currency/fsa";

// routes /api/brkts/tmnt/:tmntId

export async function GET(
  request: Request,  
  { params }: { params: Promise<{ tmntId: string }> }
) {
  try {
    const {tmntId} = await params;
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
    const brkts = prismaBrkts.map((brkt) => ({
      ...brkt,
      fsa: calcFSA(brkt.first, brkt.second, brkt.admin),
    }))
    return NextResponse.json({brkts}, {status: 200});
  } catch (err: any) {
    return NextResponse.json({ err: "error getting brkts for tmnt" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tmntId: string }> }
) {
  try {
    const {tmntId} = await params;
    // check if tmntId is a valid tmnt id
    if (!isValidBtDbId(tmntId, "tmt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.brkt.deleteMany({
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
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { err: "error deleting brkts for tmnt" },
      { status: 500 }
    );
  }
}