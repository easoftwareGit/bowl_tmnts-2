import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation/validation";
import { brktRefundType } from "@/lib/types/types";
import { validateBrktRefunds } from "../../../../lib/validation/brktRefunds/validate";
import { getErrorStatus } from "../../errCodes";

// routes /api/brktRefunds/many

export async function POST(request: NextRequest) {
  try {
    const brktRefunds: brktRefundType[] = await request.json();
    if (Array.isArray(brktRefunds) && brktRefunds.length === 0) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    // sanitize and validate brktRefunds
    const validBrktRefunds = await validateBrktRefunds(brktRefunds) // need to use await! or else returns a promise
    if (validBrktRefunds.errorCode !== ErrorCode.NONE) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    const brktRefundsToPost = validBrktRefunds.brktRefunds;
    const result = await prisma.brkt_Refund.createMany({
      data: brktRefundsToPost,
      skipDuplicates: false, // or true if you want to silently skip existing rows
    });

    return NextResponse.json({ count: result.count }, { status: 201 });    
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating many brktRefunds" },
      { status: errStatus }
    );            
  }
}