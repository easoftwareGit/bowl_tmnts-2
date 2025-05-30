import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/brktRefunds/tmnt/:tmntId

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
    const brktRefunds = await prisma.brkt_Refund.findMany({
      select: {
        id: true,
        brkt_id: true,
        player_id: true,
        num_refunds: true,        
        brkt: {
          select: {
            fee: true,
          },
        },
      },      
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

    return NextResponse.json({brktRefunds}, {status: 200});
  } catch (err: any) {
    return NextResponse.json({ err: "error getting brktRefunds for tmnt" },
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
    const deleted = await prisma.brkt_Refund.deleteMany({
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
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { err: "error deleting brktRefunds for tmnt" },
      { status: 500 }
    );
  }
}    