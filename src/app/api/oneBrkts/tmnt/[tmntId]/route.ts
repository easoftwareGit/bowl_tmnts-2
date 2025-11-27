import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/oneBrkts/tmnt/:tmntId

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
    const oneBrkts = await prisma.one_Brkt.findMany({
      where: {
        brkt_id: {
          in: await prisma.brkt.findMany({
            where: {
              div_id: {
                in: await prisma.div.findMany({
                  where: { tmnt_id: tmntId },
                  select: { id: true },
                }).then((divs) => divs.map((div) => div.id))
              }
            }
          }).then((brkts) => brkts.map((brkt) => brkt.id))
        }
      },
    });
    return NextResponse.json({ oneBrkts }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ err: "error getting oneBrkts for tmnt" },
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
    const result = await prisma.one_Brkt.deleteMany({
      where: {
        brkt_id: {
          in: await prisma.brkt.findMany({
            where: {
              div_id: {
                in: await prisma.div.findMany({
                  where: { tmnt_id: tmntId },
                  select: { id: true },
                }).then((divs) => divs.map((div) => div.id))
              }
            }
          }).then((brkts) => brkts.map((brkt) => brkt.id))
        }
      }
    })
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { err: "error deleting brktEntries for tmnt" },
      { status: 500 }
    );
  }
}    