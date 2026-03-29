import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

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
        brkt: {
          div: {
            tmnt: {
              id: tmntId,
            },
          },
        },

        // brkt_id: {
        //   in: await prisma.brkt.findMany({
        //     where: {
        //       div_id: {
        //         in: await prisma.div.findMany({
        //           where: { tmnt_id: tmntId },
        //           select: { id: true },
        //         }).then((divs) => divs.map((div) => div.id))
        //       }
        //     }
        //   }).then((brkts) => brkts.map((brkt) => brkt.id))
        // }
      },
    });
    return NextResponse.json({ oneBrkts }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting oneBrkts for tmnt");
  }
}