import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";
import { brktEntriesFromPrisa } from "@/lib/types/types";
import { brktEntriesWithFee } from "../../feeCalc";

// routes /api/brktEntries/brkt/:brktId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ brktId: string }> }
) { 
  try {
    const { brktId } = await params;    
    // check if brktId is a valid brkt id
    if (!isValidBtDbId(brktId, "brk")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const brktEntriesNoFeePrisa = await prisma.brkt_Entry.findMany({
      select: {
        id: true,
        brkt_id: true,
        player_id: true,
        num_brackets: true,
        brkt_refunds: true,
        time_stamp: true,
        brkt: {
          select: {
            fee: true,
          },
        },
      },      
      where: {
        brkt_id: brktId
      },
    })

    // get # of refunds and convert brkt.fee from decimal to number
    const brktEntriesNoFee: brktEntriesFromPrisa[] = brktEntriesNoFeePrisa.map((brktEntry) => {
      return {
        id: brktEntry.id,
        brkt_id: brktEntry.brkt_id,
        player_id: brktEntry.player_id,
        num_brackets: brktEntry.num_brackets,
        num_refunds: brktEntry.brkt_refunds ? brktEntry.brkt_refunds.num_refunds : null as any,
        time_stamp: brktEntry.time_stamp,
        brkt: {
          ...brktEntry.brkt,
          fee: Number(brktEntry.brkt.fee),
        },
      }
    })
    // calc player fee
    const brktEntries = brktEntriesWithFee(brktEntriesNoFee);

    return NextResponse.json({brktEntries}, {status: 200});
  } catch (err: any) {
    return NextResponse.json({ err: "error getting brktEntries for brkt" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ brktId: string }> }
) { 
  try {
    const { brktId } = await params;    
    // check if id is a valid brkt id
    if (!isValidBtDbId(brktId, "brk")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const deleted = await prisma.brkt_Entry.deleteMany({
      where: {
        brkt_id: brktId,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting brktEntries for brkt" },
      { status: 500 }
    );
  }
}

