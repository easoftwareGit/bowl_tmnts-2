import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { getErrorStatus, standardCatchReturn } from "@/app/api/apiCatch";

// route /api/oneBrkts/squad/:squadId
export async function GET(
  request: Request,
  { params }: { params: Promise<{ squadId: string }> }
) {
  try {
    const { squadId } = await params;
    // check if squadId is a valid squad id
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const oneBrkts = await prisma.one_Brkt.findMany({
      where: {
        brkt: {
          squad: {
            id: squadId,
          },
        },

        // brkt_id: {
        //   in: await prisma.brkt.findMany({
        //     where: { squad_id: squadId },
        //     select: { id: true },
        //   }).then((brkts) => brkts.map((brkt) => brkt.id)),
        // }
      },
    })
    return NextResponse.json({ oneBrkts }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting oneBrkts for squad");
  }
}
 