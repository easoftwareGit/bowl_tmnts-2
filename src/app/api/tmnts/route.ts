import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { standardCatchReturn } from "../apiCatch";

// routes /api/tmnts

export async function GET(request: NextRequest) {
  try {
    const skip = request.nextUrl.searchParams.get('skip')
    const take = request.nextUrl.searchParams.get('take')
    const tmnts = await prisma.tmnt.findMany({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    })
    // return NextResponse.json(tmnts);
    return NextResponse.json({ tmnts }, { status: 200 });    
  } catch (error) {
    return standardCatchReturn(error, "error getting tmnts");
  }
}