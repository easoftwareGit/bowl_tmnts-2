import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/potEntries/tmnt/:tmntId

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
    const potEntries = await prisma.pot_Entry.findMany({
      where: {
        pot_id: {
          in: await prisma.pot.findMany({
            where: {
              div_id: {
                in: await prisma.div.findMany({
                  where: { tmnt_id: tmntId },
                  select: { id: true },
                }).then((divs) => divs.map((div) => div.id))
              }
            },
            select: { id: true },
          }).then((pots) => pots.map((pot) => pot.id))
        }
      }
    })

    return NextResponse.json({ potEntries}, {status: 200});
  } catch (err: any) {
    return NextResponse.json({ err: "error getting potEntries for tmnt" },
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
    if (!isValidBtDbId(tmntId, "tmt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.pot_Entry.deleteMany({
      where: {
        pot_id: {
          in: await prisma.pot.findMany({
            where: {
              div_id: {
                in: await prisma.div.findMany({
                  where: { tmnt_id: tmntId },
                  select: { id: true },
                }).then((divs) => divs.map((div) => div.id))
              }
            },
            select: { id: true },
          }).then((pots) => pots.map((pot) => pot.id))
        }
      }
    })
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { err: "error deleting potEntries for tmnt" },
      { status: 500 }
    );
  }
}    