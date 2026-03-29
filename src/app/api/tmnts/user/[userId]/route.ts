import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/tmnts/user/:userId

export async function GET(
  request: Request,  
  { params }: { params: Promise<{ userId: string }> }
) {

  try {
    const { userId } = await params;    
    if (!isValidBtDbId(userId, "usr")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const tmnts = await prisma.tmnt.findMany({
      where: {
        user_id: userId
      },
      select: {
        id: true,
        tmnt_name: true,
        start_date: true,
        end_date: true,
        bowl_id: true,
        user_id: true,
        bowl: {
          select: {
            bowl_name: true,
            city: true,
            state: true,
            url: true,
          },
        },
      },  
      orderBy: {
        start_date: 'desc'
      }
    })
    return NextResponse.json({ tmnts }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting tmnts for user");    
  }
}