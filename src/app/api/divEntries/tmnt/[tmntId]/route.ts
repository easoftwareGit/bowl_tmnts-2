import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/divEntries/tmnt/:tmntId

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
    const divEntries = await prisma.div_Entry.findMany({
      where: {
        div_id: {
          in: await prisma.div.findMany({
            where: { tmnt_id: tmntId},
            select: { id: true },
          }).then((divs) => divs.map((div) => div.id))
        }
      }
    })

    return NextResponse.json({divEntries}, {status: 200});
  } catch (err: any) {
    return NextResponse.json({ err: "error getting divEntries for tmnt" },
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
    const deleted = await prisma.div_Entry.deleteMany({
      where: {
        div_id: {
          in: await prisma.div.findMany({
            where: { tmnt_id: tmntId},
            select: { id: true },
          }).then((divs) => divs.map((div) => div.id))
        }
      }
    })
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { err: "error deleting divEntries for tmnt" },
      { status: 500 }
    );
  }
}    