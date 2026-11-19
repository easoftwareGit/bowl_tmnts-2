// PUBLIC route - no auth check on purpose.
// Returns ONLY the tournament director's public contact info for one tournament.
// Never returns ids, roles, hashes or any other user column.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!isValidBtDbId(id, "tmt")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const tmnt = await prisma.tmnt.findUnique({
      where: { id },
      select: {
        users: {
          // whitelist: only the fields shown on the public contact page
          select: {
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
 
    if (!tmnt?.users) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
 
    return NextResponse.json({ director: tmnt.users }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "Error getting tournament director");
  }
}