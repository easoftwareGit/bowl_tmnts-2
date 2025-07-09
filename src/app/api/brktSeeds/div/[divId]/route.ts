import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/brktSeeds/div/:divId

export async function GET(
  request: Request,
  { params }: { params: { divId: string } }
) {
  try {
    const divId = params.divId;
    // check if divId is a valid div id
    if (!isValidBtDbId(divId, "div")) {
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
                      where: { div_id: divId },
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
        { error: "error getting brktSeeds for div" },
        { status: 404 }
      );
    }

    return NextResponse.json({ brktSeeds }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { err: "error getting brktSeeds for div" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { divId: string } }
) {
  try {
    const divId = params.divId;
    // check if divId is a valid div id
    if (!isValidBtDbId(divId, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const deleted = await prisma.brkt_Seed.deleteMany({
      where: {
        one_brkt_id: {
          in: await prisma.one_Brkt
            .findMany({
              where: {
                brkt_id: {
                  in: await prisma.brkt
                    .findMany({
                      where: { div_id: divId },
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

    if (!deleted) {
      return NextResponse.json(
        { error: "error deleting brktSeeds for div" },
        { status: 404 }
      );
    }

    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { err: "error deleting brktSeeds for div" },
      { status: 500 }
    );
  }
}
