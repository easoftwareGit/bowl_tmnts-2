import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";
import { requireDirector } from "@/lib/auth/guards";

// routes /api/tmnts/tmnt/:id

export async function DELETE(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  // only admin and super admins can delete a tournament
  const authError = await requireDirector();
  if (authError) return authError;  

  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "tmt")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const result = await prisma.tmnt.deleteMany({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting tmnt");
  }

}