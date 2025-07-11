import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/players/tmnt/:tmntId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tmntId: string }> }
) {
  try {
    const { tmntId } = await params;
    // check if tmntId is a valid tmnt id
    if (!isValidBtDbId(tmntId, "tmt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const players = await prisma.player.findMany({
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
    });
    return NextResponse.json({ players }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting players for tmnt" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tmntId: string }> }
) {
  try {
    const { tmntId } = await params;
    // check if tmntId is a valid tmnt id
    if (!isValidBtDbId(tmntId, "tmt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const deleted = await prisma.player.deleteMany({
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
      { err: "error deleting players for tmnt" },
      { status: 500 }
    );
  }
}