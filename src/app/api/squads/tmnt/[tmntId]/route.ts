import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";

// routes /api/squads/tmnt/:tmntId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tmntId: string }> }
) {
  try {
    const { tmntId } = await params;
    // check if tmntId is a valid tmnt id
    if (!isValidBtDbId(tmntId, 'tmt')) {
      return NextResponse.json(
        { error: "not found" },
        { status: 404 }
      );        
    }
    const squads = await prisma.squad.findMany({
      where: {
        event_id: {
          in: await prisma.event.findMany({
            where: { tmnt_id: tmntId },
            select: { id: true },
          }).then(events => events.map(event => event.id)),
        },
      },
      orderBy: { sort_order: 'asc' }
    });    
    return NextResponse.json({squads}, {status: 200});
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting squads for tmnt" },
      { status: 500 }
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
    if (!isValidBtDbId(tmntId, 'tmt')) {
      return NextResponse.json(
        { error: "not found" },
        { status: 404 }
      );        
    }

    const result = await prisma.squad.deleteMany({
      where: {
        event_id: {
          in: await prisma.event.findMany({
            where: { tmnt_id: tmntId },
            select: { id: true },
          }).then(events => events.map(event => event.id)),
        },
      },      
    });    
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting squads for tmnt" },
      { status: 500 }
    );        
  }
}