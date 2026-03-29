import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/players/squad/:squadId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ squadId: string }> }
) {
  try {
    const { squadId } = await params;
    // check if id is a valid squad id
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const players = await prisma.player.findMany({
      where: {
        squad_id: squadId,
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
  } catch (error) {
    return standardCatchReturn(error, "error getting players for squad");
  }
}  