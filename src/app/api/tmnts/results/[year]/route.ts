import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validYear } from "@/lib/validation";
import { endOfToday, endOfDay } from "date-fns";

// routes /api/tmnts/results/year

export async function GET(
  request: NextRequest, 
  { params }: {params: { year: string}}
) {
  const paramYear = params.year;

  if (!validYear(paramYear)) {
    return NextResponse.json({ error: 'Invalid parameter' }, { status: 400 });
  }
  
  const todayYear = endOfToday().getFullYear();
  let maxDate
  if (todayYear === parseInt(paramYear)) {
    maxDate = endOfToday();
  } else {    
    maxDate = endOfDay(new Date(`${paramYear}-12-31`))    
  }  
  
  const jan1st = new Date(`${paramYear}-01-01`)
  const skip = request.nextUrl.searchParams.get('skip')
  const take = request.nextUrl.searchParams.get('take')
  const tmnts = await prisma.tmnt.findMany({
    where: {
      start_date: {
        lte: maxDate,
        gte: jan1st
      }
    },
    orderBy: [
      {
        start_date: 'desc'
      }
    ],
    select: {
      id: true,
      tmnt_name: true,
      start_date: true,
      bowl_id: true,
      bowls: {
        select: {
          bowl_name: true,
          city: true,
          state: true,
          url: true,
        },
      },
    },
    skip: skip ? parseInt(skip, 10) : undefined,
    take: take ? parseInt(take, 10) : undefined,
  })
  
  return NextResponse.json({ tmnts }, { status: 200 });
}