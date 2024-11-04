import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/tmnts/user/:userId

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {

  try {
    const userId = params.userId;
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
        bowls: {
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
    return NextResponse.json({ error: "error getting tmnts for user" }, { status: 500 });
  }
}