import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validYear } from "@/lib/validation";
import { endOfToday, endOfDay } from "date-fns";

// routes /api/tmnts/results/year

export async function GET(
  request: NextRequest,   
  { params }: { params: Promise<{ year: string }> }
) {
  const { year } = await params;  

  if (!validYear(year)) {
    return NextResponse.json({ error: 'Invalid parameter' }, { status: 400 });
  }
  
  const paramYear = parseInt(year, 10);
  const todayYear = endOfToday().getFullYear();
  let maxDate
  if (todayYear === paramYear) {
    maxDate = endOfToday();
  } else {    
    // maxDate = endOfDay(new Date(`${paramYear}-12-31`))    
    // maxDate = endOfDay(new Date(Date.UTC(paramYear, 11, 31))); 
    maxDate = new Date(Date.UTC(paramYear, 11, 31, 23, 59, 59, 999)); // December 31st, 23:59:59.999 UTC
  }  
  
  // const jan1st = new Date(`${paramYear}-01-01`)
  // const jan1st = new Date(Date.UTC(paramYear, 0, 1));
  const jan1st = new Date(Date.UTC(paramYear, 0, 1, 0, 0, 0, 0)); // january 1st, 00:00:00.000 UTC
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
      user_id: true,
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