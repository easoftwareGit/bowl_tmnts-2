import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/squads/oneBrkts/:squadId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ squadId: string }> }
) { 
  try {
    const { squadId } = await params;
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const rawResult = await prisma.one_Brkt.findMany({
      where: {
        brkt: {
          squad_id: squadId,
        },
        brkt_seeds: {
          some: {},
        }
      },
      include: {
        brkt: {
          select: {
            id: true,
            squad_id: true,
          },
        },
        brkt_seeds: {
          orderBy: {
            seed: "asc",
          },
          select: {
            seed: true,
            player_id: true,
          },
        }
      },
      orderBy: [
        { brkt_id: 'asc' },
        { bindex: 'asc' },        
        { id: 'asc' },
      ],
    });
        
    const oneBrktsAndSeeds = rawResult.flatMap(raw => 
      raw.brkt_seeds.map(seed => ({
        one_brkt_id: raw.id,
        brkt_id: raw.brkt.id,
        bindex: raw.bindex,
        seed: seed.seed,
        player_id: seed.player_id,
      }))
    );
    if (oneBrktsAndSeeds == null) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ oneBrktsAndSeeds }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "error getting oneBrktsAndSeeds" }, { status: 500 });
  }  
}