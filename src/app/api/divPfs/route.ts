import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { standardCatchReturn } from "../apiCatch";

// routes /api/divPfs

export async function GET(request: NextRequest) {
  try {
    const divPfs = await prisma.div_PF.findMany({      
      orderBy: [
        { div_id: "asc" },
        { position: "asc" },
      ],
    });
    return NextResponse.json({ divPfs }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting divPfs");
  }
}

// no individual updates or deletes
// div prizes are group updates
