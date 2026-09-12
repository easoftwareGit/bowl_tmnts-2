import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { standardCatchReturn } from "../apiCatch";

// routes /api/elimPfs

export async function GET(request: NextRequest) {
  try {
    const elimPfs = await prisma.elim_PF.findMany({      
      orderBy: [
        { elim_id: "asc" },
        { position: "asc" },
      ],
    });
    return NextResponse.json({ elimPfs }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting elimPfs");
  }
}

// no individual updates or deletes
// div prizes are group updates
