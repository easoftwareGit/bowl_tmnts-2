import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";

// routes /api/brktSeeds/squad/:squadId

export async function GET(
  request: Request,  
  { params }: { params: Promise<{ squadId: string }> }
) {
  try {
    const { squadId } = await params;    
    // check if squadId is a valid squad id
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const brktSeeds = await prisma.brkt_Seed.findMany({
      select: {
        one_brkt_id: true,
        seed: true,
        player_id: true,
      },
      where: {
        one_brkt_id: {
          in: await prisma.one_Brkt
            .findMany({
              where: {
                brkt_id: {
                  in: await prisma.brkt
                    .findMany({
                      where: { squad_id: squadId },
                      select: { id: true },
                    })
                    .then((brkts) => brkts.map((brkt) => brkt.id)),
                },
              },
            })
            .then((brkts) => brkts.map((brkt) => brkt.id)),
        },
      },
      orderBy: [
        {
          one_brkt_id: "asc",
        },
        {
          seed: "asc",
        },
      ],
    });

    if (!brktSeeds) {
      return NextResponse.json(
        { error: "error getting brktSeeds for squad" },
        { status: 404 }
      );
    }

    return NextResponse.json({ brktSeeds }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { err: "error getting brktSeeds for squad" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ squadId: string }> }
) {
  try {
    const { squadId } = await params;    
    // check if squadId is a valid squad id
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.brkt_Seed.deleteMany({
      where: {
        one_brkt_id: {
          in: await prisma.one_Brkt
            .findMany({
              where: {
                brkt_id: {
                  in: await prisma.brkt
                    .findMany({
                      where: { squad_id: squadId },
                      select: { id: true },
                    })
                    .then((brkts) => brkts.map((brkt) => brkt.id)),
                },
              },
            })
            .then((brkts) => brkts.map((brkt) => brkt.id)),
        },
      },
    });

    if (!result) {
      return NextResponse.json(
        { error: "error deleting brktSeeds for squad" },
        { status: 404 }
      );
    }

    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { err: "error deleting brktSeeds for squad" },
      { status: 500 }
    );
  }
}
