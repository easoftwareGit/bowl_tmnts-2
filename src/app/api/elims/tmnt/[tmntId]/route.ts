import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/elims/tmnt/:tmntId

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
    const elims = await prisma.elim.findMany({
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
    return NextResponse.json({elims}, {status: 200});
  } catch (err: any) {
    return NextResponse.json({ err: "error getting elims for tmnt" },
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
    const deleted = await prisma.elim.deleteMany({
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
      { err: "error deleting elims for tmnt" },
      { status: 500 }
    );
  }
}