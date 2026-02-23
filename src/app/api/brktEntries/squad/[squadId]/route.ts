import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import type { brktEntriesFromPrisa } from "@/lib/types/types";
import { brktEntriesWithFee } from "../../feeCalc";
import { getErrorStatus } from "@/app/api/errCodes";

// routes /api/brktEntries/squad/:squadId

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
        brkt_id: {
          in: await prisma.brkt.findMany({
            where: { squad_id: squadId },
            select: { id: true },
          }).then((brkts) => brkts.map((brkt) => brkt.id)),
        }
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

    return NextResponse.json({ brktEntries }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting brktEntries for squad" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ squadId: string }> }
) {
  try {
    const { squadId } = await params;    
    // check if squadId is a valid squad id
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.brkt_Entry.deleteMany({
      where: {
        brkt_id: {
          in: await prisma.brkt.findMany({
            where: { squad_id: squadId },
            select: { id: true },
          }).then((brkts) => brkts.map((brkt) => brkt.id)),
        }
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error deleting brktEntries for squad" },
      { status: errStatus }
    );
  }
}    