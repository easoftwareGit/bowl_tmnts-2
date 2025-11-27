import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/elimEntries/tmnt/:tmntId

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
    const elimEntries = await prisma.elim_Entry.findMany({
      where: {
        elim_id: {
          in: await prisma.elim.findMany({
            where: {
              div_id: {
                in: await prisma.div.findMany({
                  where: { tmnt_id: tmntId },
                  select: { id: true },
                }).then((divs) => divs.map((div) => div.id))
              }
            }
          }).then((elims) => elims.map((elim) => elim.id))
        }
      }
    })

    return NextResponse.json({elimEntries}, {status: 200});
  } catch (err: any) {
    return NextResponse.json({ err: "error getting elimEntries for tmnt" },
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
    const result = await prisma.elim_Entry.deleteMany({
      where: {
        elim_id: {
          in: await prisma.elim.findMany({
            where: {
              div_id: {
                in: await prisma.div.findMany({
                  where: { tmnt_id: tmntId },
                  select: { id: true },
                }).then((divs) => divs.map((div) => div.id))
              }
            }
          }).then((elims) => elims.map((elim) => elim.id))
        }
      }
    })
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { err: "error deleting elimEntries for tmnt" },
      { status: 500 }
    );
  }
}    