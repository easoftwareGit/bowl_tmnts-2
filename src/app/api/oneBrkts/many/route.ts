import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { oneBrktType } from "@/lib/types/types";
import { validateOneBrkts } from "../valildate";
import { getErrorStatus } from "../../errCodes";

// routes /api/oneBrkts/many

export async function POST(request: NextRequest) {
  try {
    const oneBrkts: oneBrktType[] = await request.json();
    // sanitize and validate oneBrkts
    const validOneBrkts = await validateOneBrkts(oneBrkts) // need to use await! or else returns a promise
    if (validOneBrkts.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    const oneBrktsToPost = validOneBrkts.oneBrkts
    const createdOneBrkts = await prisma.$transaction(
      oneBrktsToPost.map((oneBrkt) => {
        return prisma.one_Brkt.create({
          data: {
            id: oneBrkt.id,
            brkt_id: oneBrkt.brkt_id,
            bindex: oneBrkt.bindex,
          },
        });
      })
    )
      
    return NextResponse.json({oneBrkts: createdOneBrkts}, {status: 201});
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating many oneBrkts" },
      { status: errStatus }
    );            
  }
}